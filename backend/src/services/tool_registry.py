import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.tables import ToolTable
from src.models.tool import ToolConfig


class ToolRegistry:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, config: ToolConfig) -> dict:
        row = ToolTable(
            id=uuid.uuid4().hex[:8],
            name=config.name,
            tool_type=config.tool_type,
            config=config.model_dump(exclude={"source_code"}),
            source_code=config.source_code,
        )
        self.db.add(row)
        await self.db.commit()
        await self.db.refresh(row)
        return self._to_dict(row)

    async def list_all(self) -> list[dict]:
        result = await self.db.execute(select(ToolTable).order_by(ToolTable.created_at.desc()))
        return [self._to_dict(row) for row in result.scalars().all()]

    async def get(self, id: str) -> dict | None:
        row = await self.db.get(ToolTable, id)
        return self._to_dict(row) if row else None

    async def update(self, id: str, config: ToolConfig) -> dict | None:
        row = await self.db.get(ToolTable, id)
        if not row:
            return None
        row.name = config.name
        row.tool_type = config.tool_type
        row.config = config.model_dump(exclude={"source_code"})
        row.source_code = config.source_code
        await self.db.commit()
        await self.db.refresh(row)
        return self._to_dict(row)

    async def delete(self, id: str) -> bool:
        row = await self.db.get(ToolTable, id)
        if not row:
            return False
        await self.db.delete(row)
        await self.db.commit()
        return True

    def _to_dict(self, row: ToolTable) -> dict:
        return {
            "id": row.id,
            "name": row.name,
            "tool_type": row.tool_type,
            "config": row.config,
            "source_code": row.source_code,
            "created_at": row.created_at,
            "updated_at": row.updated_at,
        }
