from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.database import get_db
from src.models.agent import AgentConfig, AgentListResponse, AgentResponse
from src.services.agent_service import AgentService

router = APIRouter(prefix="/api/agents", tags=["agents"])


def get_service(db: AsyncSession = Depends(get_db)) -> AgentService:
    return AgentService(db)


@router.get("", response_model=AgentListResponse)
async def list_agents(svc: AgentService = Depends(get_service)):
    agents = await svc.list_all()
    return {"agents": agents}


@router.post("", response_model=AgentResponse, status_code=201)
async def create_agent(config: AgentConfig, svc: AgentService = Depends(get_service)):
    return await svc.create(config)


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str, svc: AgentService = Depends(get_service)):
    agent = await svc.get(agent_id)
    if not agent:
        raise HTTPException(404, "Agent not found")
    return agent


@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(agent_id: str, config: AgentConfig, svc: AgentService = Depends(get_service)):
    agent = await svc.update(agent_id, config)
    if not agent:
        raise HTTPException(404, "Agent not found")
    return agent


@router.delete("/{agent_id}", status_code=204)
async def delete_agent(agent_id: str, svc: AgentService = Depends(get_service)):
    if not await svc.delete(agent_id):
        raise HTTPException(404, "Agent not found")
