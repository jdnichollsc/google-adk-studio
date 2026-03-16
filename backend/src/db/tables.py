from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


def _utcnow():
    return datetime.now(timezone.utc)


class AgentTable(Base):
    __tablename__ = "agents"

    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    agent_type = Column(String, nullable=False)
    config = Column(JSONB, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), default=_utcnow)
    updated_at = Column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class ToolTable(Base):
    __tablename__ = "tools"

    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    tool_type = Column(String, nullable=False)
    config = Column(JSONB, nullable=False, default=dict)
    source_code = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utcnow)
    updated_at = Column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class WorkflowTable(Base):
    __tablename__ = "workflows"

    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    graph = Column(JSONB, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), default=_utcnow)
    updated_at = Column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)
