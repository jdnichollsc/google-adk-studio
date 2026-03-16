import time

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from temporalio.client import Client

from src.config import settings
from src.db.database import get_db
from src.models.workflow import WorkflowConfig, WorkflowListResponse, WorkflowResponse, WorkflowRunResponse
from src.services.workflow_service import WorkflowService

router = APIRouter(prefix="/api/workflows", tags=["workflows"])

_temporal_client: Client | None = None


async def get_temporal_client() -> Client:
    global _temporal_client
    if _temporal_client is None:
        _temporal_client = await Client.connect(settings.temporal_address)
    return _temporal_client


def get_service(db: AsyncSession = Depends(get_db)) -> WorkflowService:
    return WorkflowService(db)


@router.get("", response_model=WorkflowListResponse)
async def list_workflows(svc: WorkflowService = Depends(get_service)):
    workflows = await svc.list_all()
    return {"workflows": workflows}


@router.post("", response_model=WorkflowResponse, status_code=201)
async def create_workflow(config: WorkflowConfig, svc: WorkflowService = Depends(get_service)):
    return await svc.create(config)


@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(workflow_id: str, svc: WorkflowService = Depends(get_service)):
    workflow = await svc.get(workflow_id)
    if not workflow:
        raise HTTPException(404, "Workflow not found")
    return workflow


@router.put("/{workflow_id}", response_model=WorkflowResponse)
async def update_workflow(workflow_id: str, config: WorkflowConfig, svc: WorkflowService = Depends(get_service)):
    workflow = await svc.update(workflow_id, config)
    if not workflow:
        raise HTTPException(404, "Workflow not found")
    return workflow


@router.delete("/{workflow_id}", status_code=204)
async def delete_workflow(workflow_id: str, svc: WorkflowService = Depends(get_service)):
    if not await svc.delete(workflow_id):
        raise HTTPException(404, "Workflow not found")


@router.post("/{workflow_id}/run", response_model=WorkflowRunResponse)
async def run_workflow(workflow_id: str, svc: WorkflowService = Depends(get_service)):
    workflow = await svc.get(workflow_id)
    if not workflow:
        raise HTTPException(404, "Workflow not found")
    client = await get_temporal_client()
    run_id = f"run-{workflow_id}-{int(time.time())}"
    await client.start_workflow(
        "GraphWorkflow",
        args=[workflow["graph"]],
        id=run_id,
        task_queue="adk-studio-workflows",
    )
    return WorkflowRunResponse(run_id=run_id, workflow_id=workflow_id, status="running")


@router.get("/{workflow_id}/runs/{run_id}", response_model=WorkflowRunResponse)
async def get_workflow_run(workflow_id: str, run_id: str):
    client = await get_temporal_client()
    handle = client.get_workflow_handle(run_id)
    try:
        result = await handle.query("get_status")
        status = "running"
    except Exception:
        result = None
        status = "unknown"
    try:
        await handle.result(timeout=0)
        status = "completed"
    except TimeoutError:
        pass
    except Exception as exc:
        if "completed" in str(exc).lower() or "closed" in str(exc).lower():
            status = "completed"
        elif status == "unknown":
            status = "failed"
    return WorkflowRunResponse(run_id=run_id, workflow_id=workflow_id, status=status)
