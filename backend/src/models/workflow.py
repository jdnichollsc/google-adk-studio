from datetime import datetime

from pydantic import BaseModel, Field


class WorkflowNodeConfig(BaseModel):
    agent_id: str | None = None
    tool_id: str | None = None
    condition: str | None = None
    timeout_seconds: int | None = None


class WorkflowNode(BaseModel):
    id: str
    type: str = Field(pattern=r"^(input|output|agent|tool|condition|parallel|loop|human_approval|delay)$")
    data: dict = {}
    position: dict = Field(default_factory=lambda: {"x": 0, "y": 0})
    config: WorkflowNodeConfig = WorkflowNodeConfig()


class WorkflowEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str | None = None


class WorkflowGraph(BaseModel):
    nodes: list[WorkflowNode] = []
    edges: list[WorkflowEdge] = []


class WorkflowConfig(BaseModel):
    name: str
    graph: WorkflowGraph = WorkflowGraph()


class WorkflowResponse(BaseModel):
    id: str
    name: str
    graph: dict
    created_at: datetime
    updated_at: datetime


class WorkflowListResponse(BaseModel):
    workflows: list[WorkflowResponse]


class WorkflowRunResponse(BaseModel):
    run_id: str
    workflow_id: str
    status: str
