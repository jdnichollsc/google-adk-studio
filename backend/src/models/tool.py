from datetime import datetime

from pydantic import BaseModel, Field


class ToolConfig(BaseModel):
    name: str
    description: str = ""
    tool_type: str = Field(pattern=r"^(builtin|custom)$")
    parameters: dict = {}
    source_code: str | None = None


class ToolResponse(BaseModel):
    id: str
    name: str
    tool_type: str
    config: dict
    source_code: str | None = None
    created_at: datetime
    updated_at: datetime


class ToolListResponse(BaseModel):
    tools: list[ToolResponse]
