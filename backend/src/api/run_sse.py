import json
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from src.db.database import get_db
from src.services.agent_service import AgentService

router = APIRouter(prefix="/api", tags=["run"])


class RunSSERequest(BaseModel):
    app_name: str
    user_id: str
    session_id: str
    new_message: str


def _build_agent(config: dict) -> LlmAgent:
    return LlmAgent(
        name=config.get("name", "agent"),
        model=config.get("model", "gemini-2.0-flash"),
        description=config.get("description", ""),
        instruction=config.get("instruction", ""),
    )


async def _event_stream(
    runner: Runner, user_id: str, session_id: str, message: str
) -> AsyncGenerator[dict, None]:
    content = types.Content(
        role="user", parts=[types.Part.from_text(message)]
    )
    async for event in runner.run_async(
        user_id=user_id, session_id=session_id, new_message=content
    ):
        yield {
            "event": "message",
            "data": json.dumps(
                {
                    "author": getattr(event, "author", ""),
                    "content": event.model_dump()
                    if hasattr(event, "model_dump")
                    else str(event),
                }
            ),
        }
    yield {"event": "done", "data": "{}"}


@router.post("/run_sse")
async def run_sse(req: RunSSERequest, db: AsyncSession = Depends(get_db)):
    svc = AgentService(db)
    agents = await svc.list_all()
    agent_row = next((a for a in agents if a["name"] == req.app_name), None)
    if not agent_row:
        raise HTTPException(404, f"Agent '{req.app_name}' not found")

    config = agent_row["config"]
    agent = _build_agent(config)

    session_service = InMemorySessionService()
    await session_service.create_session(
        app_name=req.app_name,
        user_id=req.user_id,
        session_id=req.session_id,
    )
    runner = Runner(
        agent=agent,
        app_name=req.app_name,
        session_service=session_service,
    )

    return EventSourceResponse(_event_stream(runner, req.user_id, req.session_id, req.new_message))
