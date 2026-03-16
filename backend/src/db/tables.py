from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


def _utcnow():
    return datetime.now(timezone.utc)


class WorkflowTable(Base):
    __tablename__ = "workflows"

    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    graph = Column(JSONB, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), default=_utcnow)
    updated_at = Column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)
