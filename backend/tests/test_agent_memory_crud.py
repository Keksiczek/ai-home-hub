"""Tests for Agent Memory CRUD endpoints (PR #44)."""

import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ChromaDB shim
_chroma_mock = MagicMock()
for _mod_name in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod_name, _chroma_mock)

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

# The endpoints in main.py use local imports: `from app.services.resident_agent import get_resident_agent`
# so we must patch the source module.
_PATCH_PATH = "app.services.resident_agent.get_resident_agent"


@pytest.fixture
def client() -> TestClient:
    with patch(
        "app.services.startup_checks.run_startup_checks",
        new_callable=AsyncMock,
        return_value={"ollama": "ok (mocked)"},
    ):
        with TestClient(app) as c:
            yield c


def _make_agent(
    memory_items=None,
    clear_result=None,
    delete_result=None,
    add_result=None,
):
    """Return a mock ResidentAgent with memory method stubs."""
    agent = MagicMock()
    agent.get_agent_memory = AsyncMock(
        return_value=memory_items
        or [
            {
                "id": "mem-1",
                "text": "KB search: lean waste → 3 chunks",
                "tags": ["resident", "#lean"],
                "timestamp": "2025-01-01T10:00:00Z",
            },
            {
                "id": "mem-2",
                "text": "Web search: ollama 0.3.12 release notes",
                "tags": ["resident", "#web"],
                "timestamp": "2025-01-01T10:05:00Z",
            },
        ]
    )
    agent.clear_agent_memory = AsyncMock(
        return_value=clear_result or {"status": "ok", "deleted": 2}
    )
    agent.delete_agent_memory_by_id = AsyncMock(
        return_value=delete_result or {"status": "ok", "memory_id": "mem-1"}
    )
    agent.add_agent_memory_manual = AsyncMock(
        return_value=add_result or {"status": "ok", "memory_id": "mem-new-123"}
    )
    return agent


class TestGetAgentMemory:
    def test_list_memory_returns_200(self, client: TestClient):
        agent = _make_agent()
        with patch(_PATCH_PATH, return_value=agent):
            resp = client.get("/api/agent/memory")
        assert resp.status_code == 200

    def test_list_memory_returns_items(self, client: TestClient):
        agent = _make_agent()
        with patch(_PATCH_PATH, return_value=agent):
            resp = client.get("/api/agent/memory")
        data = resp.json()
        assert "memory" in data
        assert data["count"] == 2

    def test_list_memory_uses_limit_param(self, client: TestClient):
        agent = _make_agent()
        with patch(_PATCH_PATH, return_value=agent):
            resp = client.get("/api/agent/memory?limit=10")
        assert resp.status_code == 200
        agent.get_agent_memory.assert_called_once_with(limit=10)


class TestClearAgentMemory:
    def test_clear_memory_returns_200(self, client: TestClient):
        agent = _make_agent()
        with patch(_PATCH_PATH, return_value=agent):
            resp = client.delete("/api/agent/memory")
        assert resp.status_code == 200

    def test_clear_memory_returns_deleted_count(self, client: TestClient):
        agent = _make_agent()
        with patch(_PATCH_PATH, return_value=agent):
            resp = client.delete("/api/agent/memory")
        data = resp.json()
        assert data.get("deleted") == 2
        assert data.get("status") == "ok"


class TestDeleteAgentMemoryById:
    def test_delete_by_id_returns_200(self, client: TestClient):
        agent = _make_agent()
        with patch(_PATCH_PATH, return_value=agent):
            resp = client.delete("/api/agent/memory/mem-1")
        assert resp.status_code == 200

    def test_delete_by_id_returns_memory_id(self, client: TestClient):
        agent = _make_agent()
        with patch(_PATCH_PATH, return_value=agent):
            resp = client.delete("/api/agent/memory/mem-1")
        data = resp.json()
        assert data.get("memory_id") == "mem-1"
        assert data.get("status") == "ok"

    def test_delete_by_id_not_found_returns_404(self, client: TestClient):
        agent = _make_agent(
            delete_result={"status": "not_found", "memory_id": "missing-id"}
        )
        with patch(_PATCH_PATH, return_value=agent):
            resp = client.delete("/api/agent/memory/missing-id")
        assert resp.status_code == 404


class TestAddAgentMemory:
    def test_add_memory_returns_200(self, client: TestClient):
        agent = _make_agent()
        with patch(_PATCH_PATH, return_value=agent):
            resp = client.post(
                "/api/agent/memory",
                json={"content": "User prefers dark mode", "tags": ["#preference"]},
            )
        assert resp.status_code == 200

    def test_add_memory_returns_memory_id(self, client: TestClient):
        agent = _make_agent()
        with patch(_PATCH_PATH, return_value=agent):
            resp = client.post(
                "/api/agent/memory",
                json={"content": "User prefers dark mode"},
            )
        data = resp.json()
        assert "memory_id" in data
        assert data.get("status") == "ok"

    def test_add_memory_without_content_returns_400(self, client: TestClient):
        agent = _make_agent()
        with patch(_PATCH_PATH, return_value=agent):
            resp = client.post(
                "/api/agent/memory",
                json={"tags": ["#preference"]},
            )
        assert resp.status_code == 400

    def test_add_memory_empty_content_returns_400(self, client: TestClient):
        agent = _make_agent()
        with patch(_PATCH_PATH, return_value=agent):
            resp = client.post(
                "/api/agent/memory",
                json={"content": "   "},
            )
        assert resp.status_code == 400

    def test_add_memory_calls_service_with_content(self, client: TestClient):
        agent = _make_agent()
        with patch(_PATCH_PATH, return_value=agent):
            client.post(
                "/api/agent/memory",
                json={"content": "Test memory item", "tags": ["#test"]},
            )
        agent.add_agent_memory_manual.assert_called_once_with(
            content="Test memory item",
            tags=["#test"],
        )
