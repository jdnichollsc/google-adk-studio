import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.tables import WorkflowTable
from src.models.workflow import WorkflowConfig


class WorkflowService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, config: WorkflowConfig) -> dict:
        row = WorkflowTable(
            id=uuid.uuid4().hex[:8],
            name=config.name,
            graph=config.graph.model_dump(),
        )
        self.db.add(row)
        await self.db.commit()
        await self.db.refresh(row)
        return self._to_dict(row)

    async def list_all(self) -> list[dict]:
        result = await self.db.execute(select(WorkflowTable).order_by(WorkflowTable.created_at.desc()))
        return [self._to_dict(row) for row in result.scalars().all()]

    async def get(self, id: str) -> dict | None:
        row = await self.db.get(WorkflowTable, id)
        return self._to_dict(row) if row else None

    async def update(self, id: str, config: WorkflowConfig) -> dict | None:
        row = await self.db.get(WorkflowTable, id)
        if not row:
            return None
        row.name = config.name
        row.graph = config.graph.model_dump()
        await self.db.commit()
        await self.db.refresh(row)
        return self._to_dict(row)

    async def delete(self, id: str) -> bool:
        row = await self.db.get(WorkflowTable, id)
        if not row:
            return False
        await self.db.delete(row)
        await self.db.commit()
        return True

    def _to_dict(self, row: WorkflowTable) -> dict:
        return {
            "id": row.id,
            "name": row.name,
            "graph": row.graph,
            "created_at": row.created_at,
            "updated_at": row.updated_at,
        }
