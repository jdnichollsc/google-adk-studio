import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timezone

from src.models.agent import AgentConfig
from src.services.agent_service import AgentService


def _make_row(id="abc12345", name="test-agent", agent_type="llm", config=None):
    row = MagicMock()
    row.id = id
    row.name = name
    row.agent_type = agent_type
    row.config = config or {"name": name, "agent_type": agent_type}
    row.created_at = datetime(2025, 1, 1, tzinfo=timezone.utc)
    row.updated_at = datetime(2025, 1, 1, tzinfo=timezone.utc)
    return row


@pytest.mark.asyncio
async def test_create_agent():
    db = AsyncMock()
    db.refresh = AsyncMock(side_effect=lambda row: None)
    svc = AgentService(db)

    config = AgentConfig(name="my-agent", agent_type="llm")

    with patch("src.services.agent_service.uuid") as mock_uuid:
        mock_uuid.uuid4.return_value = MagicMock(hex="abc12345deadbeef1234567890abcdef")
        with patch("src.services.agent_service.AgentTable") as MockTable:
            fake_row = _make_row()
            MockTable.return_value = fake_row
            result = await svc.create(config)

    assert result["id"] == "abc12345"
    assert result["name"] == "test-agent"
    db.add.assert_called_once()
    db.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_list_all():
    db = AsyncMock()
    rows = [_make_row(id="a"), _make_row(id="b")]
    scalars_mock = MagicMock()
    scalars_mock.all.return_value = rows
    result_mock = MagicMock()
    result_mock.scalars.return_value = scalars_mock
    db.execute.return_value = result_mock

    svc = AgentService(db)
    result = await svc.list_all()

    assert len(result) == 2
    assert result[0]["id"] == "a"
    assert result[1]["id"] == "b"
