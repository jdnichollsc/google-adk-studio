from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.database import get_db
from src.models.tool import ToolConfig, ToolListResponse, ToolResponse
from src.services.tool_registry import ToolRegistry

router = APIRouter(prefix="/api/tools", tags=["tools"])


def get_service(db: AsyncSession = Depends(get_db)) -> ToolRegistry:
    return ToolRegistry(db)


@router.get("", response_model=ToolListResponse)
async def list_tools(svc: ToolRegistry = Depends(get_service)):
    tools = await svc.list_all()
    return {"tools": tools}


@router.post("", response_model=ToolResponse, status_code=201)
async def create_tool(config: ToolConfig, svc: ToolRegistry = Depends(get_service)):
    return await svc.create(config)


@router.get("/{tool_id}", response_model=ToolResponse)
async def get_tool(tool_id: str, svc: ToolRegistry = Depends(get_service)):
    tool = await svc.get(tool_id)
    if not tool:
        raise HTTPException(404, "Tool not found")
    return tool


@router.put("/{tool_id}", response_model=ToolResponse)
async def update_tool(tool_id: str, config: ToolConfig, svc: ToolRegistry = Depends(get_service)):
    tool = await svc.update(tool_id, config)
    if not tool:
        raise HTTPException(404, "Tool not found")
    return tool


@router.delete("/{tool_id}", status_code=204)
async def delete_tool(tool_id: str, svc: ToolRegistry = Depends(get_service)):
    if not await svc.delete(tool_id):
        raise HTTPException(404, "Tool not found")
