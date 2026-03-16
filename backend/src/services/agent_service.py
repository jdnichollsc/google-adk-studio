import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.tables import AgentTable
from src.models.agent import AgentConfig


class AgentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, config: AgentConfig) -> dict:
        row = AgentTable(
            id=uuid.uuid4().hex[:8],
            name=config.name,
            agent_type=config.agent_type,
            config=config.model_dump(),
        )
        self.db.add(row)
        await self.db.commit()
        await self.db.refresh(row)
        return self._to_dict(row)

    async def list_all(self) -> list[dict]:
        result = await self.db.execute(select(AgentTable).order_by(AgentTable.created_at.desc()))
        return [self._to_dict(row) for row in result.scalars().all()]

    async def get(self, id: str) -> dict | None:
        row = await self.db.get(AgentTable, id)
        return self._to_dict(row) if row else None

    async def update(self, id: str, config: AgentConfig) -> dict | None:
        row = await self.db.get(AgentTable, id)
        if not row:
            return None
        row.name = config.name
        row.agent_type = config.agent_type
        row.config = config.model_dump()
        await self.db.commit()
        await self.db.refresh(row)
        return self._to_dict(row)

    async def delete(self, id: str) -> bool:
        row = await self.db.get(AgentTable, id)
        if not row:
            return False
        await self.db.delete(row)
        await self.db.commit()
        return True

    def _to_dict(self, row: AgentTable) -> dict:
        return {
            "id": row.id,
            "name": row.name,
            "agent_type": row.agent_type,
            "config": row.config,
            "created_at": row.created_at,
            "updated_at": row.updated_at,
        }
