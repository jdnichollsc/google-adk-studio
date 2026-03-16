import json
from collections.abc import Sequence

import asyncpg
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part
from temporalio import activity
from temporalio.common import RawValue
from temporalio.converter import DataConverter

from src.config import settings


def _raw_dsn() -> str:
    return settings.database_url.replace("+asyncpg", "")


async def _load_agent_config(agent_id: str) -> dict:
    conn = await asyncpg.connect(_raw_dsn())
    try:
        row = await conn.fetchrow("SELECT config FROM agents WHERE id = $1", agent_id)
        if not row:
            raise ValueError(f"Agent {agent_id} not found")
        return json.loads(row["config"]) if isinstance(row["config"], str) else row["config"]
    finally:
        await conn.close()


async def _run_agent(agent_id: str, inputs: dict) -> str:
    config = await _load_agent_config(agent_id)
    agent = Agent(
        name=config.get("name", agent_id),
        model=config.get("model", "gemini-2.0-flash"),
        description=config.get("description", ""),
        instruction=config.get("instruction", ""),
    )
    session_service = InMemorySessionService()
    runner = Runner(agent=agent, app_name="adk-studio", session_service=session_service)
    session = await session_service.create_session(app_name="adk-studio", user_id="workflow")
    prompt = json.dumps(inputs) if isinstance(inputs, dict) else str(inputs)
    content = Content(parts=[Part(text=prompt)])
    output_parts = []
    async for event in runner.run_async(
        user_id="workflow", session_id=session.id, new_message=content
    ):
        if event.content and event.content.parts:
            for part in event.content.parts:
                if part.text:
                    output_parts.append(part.text)
    return "".join(output_parts)


@activity.defn(dynamic=True)
async def execute_node(args: Sequence[RawValue]) -> dict:
    activity_type = activity.info().activity_type
    if args:
        converter = DataConverter.default.payload_converter
        decoded = converter.from_payloads([args[0].payload], [dict])
        inputs = decoded[0]
    else:
        inputs = {}

    if activity_type.startswith("agent:"):
        agent_id = activity_type.split(":", 1)[1]
        result = await _run_agent(agent_id, inputs)
        return {"output": result}

    if activity_type.startswith("tool:"):
        tool_id = activity_type.split(":", 1)[1]
        return {"tool_id": tool_id, "inputs": inputs}

    raise ValueError(f"Unknown activity type: {activity_type}")
