from datetime import datetime

from pydantic import BaseModel, Field


class GenerateContentConfig(BaseModel):
    temperature: float | None = None
    top_p: float | None = None
    top_k: int | None = None
    max_output_tokens: int | None = None


class AgentConfig(BaseModel):
    name: str
    agent_type: str = Field(pattern=r"^(llm|sequential|parallel|loop)$")
    model: str | None = None
    description: str = ""
    instruction: str | None = None
    tools: list[str] = []
    sub_agents: list[str] = []
    output_key: str | None = None
    max_iterations: int | None = None
    generate_content_config: GenerateContentConfig | None = None


class AgentResponse(BaseModel):
    id: str
    name: str
    agent_type: str
    config: dict
    created_at: datetime
    updated_at: datetime


class AgentListResponse(BaseModel):
    agents: list[AgentResponse]
