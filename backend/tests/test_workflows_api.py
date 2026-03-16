import pytest
from unittest.mock import AsyncMock, patch
from datetime import datetime, timezone
from httpx import ASGITransport, AsyncClient

from src.main import app
from src.db.database import get_db


@pytest.mark.asyncio
async def test_create_workflow():
    fake_result = {
        "id": "wf123456",
        "name": "my-workflow",
        "graph": {"nodes": [], "edges": []},
        "created_at": datetime(2025, 1, 1, tzinfo=timezone.utc),
        "updated_at": datetime(2025, 1, 1, tzinfo=timezone.utc),
    }

    with patch("src.services.workflow_service.WorkflowService.create", new_callable=AsyncMock, return_value=fake_result):
        mock_db = AsyncMock()
        app.dependency_overrides[get_db] = lambda: mock_db

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.post(
                "/api/workflows",
                json={"name": "my-workflow", "graph": {"nodes": [], "edges": []}},
            )

        app.dependency_overrides.clear()

    assert resp.status_code == 201
    data = resp.json()
    assert data["id"] == "wf123456"
    assert data["name"] == "my-workflow"
