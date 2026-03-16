import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timezone
from httpx import ASGITransport, AsyncClient

from src.main import app
from src.db.database import get_db


@pytest.mark.asyncio
async def test_create_tool():
    fake_result = {
        "id": "tool1234",
        "name": "my-tool",
        "tool_type": "custom",
        "config": {"name": "my-tool", "description": "A test tool", "tool_type": "custom", "parameters": {}},
        "source_code": "def run(): pass",
        "created_at": datetime(2025, 1, 1, tzinfo=timezone.utc),
        "updated_at": datetime(2025, 1, 1, tzinfo=timezone.utc),
    }

    with patch("src.services.tool_registry.ToolRegistry.create", new_callable=AsyncMock, return_value=fake_result):
        mock_db = AsyncMock()
        app.dependency_overrides[get_db] = lambda: mock_db

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.post(
                "/api/tools",
                json={
                    "name": "my-tool",
                    "description": "A test tool",
                    "tool_type": "custom",
                    "parameters": {},
                    "source_code": "def run(): pass",
                },
            )

        app.dependency_overrides.clear()

    assert resp.status_code == 201
    data = resp.json()
    assert data["id"] == "tool1234"
    assert data["name"] == "my-tool"
