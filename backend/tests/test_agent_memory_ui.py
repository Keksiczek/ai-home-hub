"""Tests: Agent Memory UI – add, list, delete memory via /api/memory/* endpoints."""

import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

for _mod in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod, MagicMock())

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture
def client():
    with patch(
        "app.services.startup_checks.run_startup_checks",
        new_callable=AsyncMock,
        return_value={"ollama": "ok (mocked)"},
    ):
        with TestClient(app) as c:
            yield c


def _make_memory_record(mem_id="mem-001", text="Test memory", tags=None):
    """Helper: build a minimal memory dict/object."""
    rec = MagicMock()
    rec.id = mem_id
    rec.text = text
    rec.tags = tags or ["#test"]
    rec.created_at = "2025-01-01T10:00:00"
    rec.importance = 7
    rec.to_dict.return_value = {
        "id": mem_id,
        "text": text,
        "tags": tags or ["#test"],
        "created_at": "2025-01-01T10:00:00",
        "importance": 7,
    }
    return rec


class TestMemoryAdd:
    """UI calls POST /api/memory/add to persist a new memory item."""

    def test_add_memory_returns_200(self, client):
        mock_svc = MagicMock()
        mock_svc.add_memory = AsyncMock(return_value="mem-123")
        with patch("app.routers.memory.get_memory_service", return_value=mock_svc):
            resp = client.post(
                "/api/memory/add",
                json={
                    "text": "Remember: prefer short answers",
                    "tags": ["#lean"],
                    "importance": 7,
                },
            )
        assert resp.status_code == 200

    def test_add_memory_returns_memory_id(self, client):
        mock_svc = MagicMock()
        mock_svc.add_memory = AsyncMock(return_value="mem-abc")
        with patch("app.routers.memory.get_memory_service", return_value=mock_svc):
            data = client.post(
                "/api/memory/add",
                json={"text": "Some fact", "tags": [], "importance": 5},
            ).json()
        assert data.get("memory_id") == "mem-abc"

    def test_add_memory_with_tags(self, client):
        mock_svc = MagicMock()
        mock_svc.add_memory = AsyncMock(return_value="mem-xyz")
        with patch("app.routers.memory.get_memory_service", return_value=mock_svc):
            resp = client.post(
                "/api/memory/add",
                json={"text": "DAX memo", "tags": ["#dax", "#lean"], "importance": 8},
            )
        assert resp.status_code == 200
        mock_svc.add_memory.assert_awaited_once()
        call_kwargs = mock_svc.add_memory.call_args
        assert "#dax" in call_kwargs.kwargs.get("tags", [])


class TestMemoryList:
    """UI calls GET /api/memory/all to load all memories into the table."""

    def test_get_all_memories_returns_200(self, client):
        mock_svc = MagicMock()
        mock_svc.get_all_memories.return_value = [_make_memory_record()]
        with patch("app.routers.memory.get_memory_service", return_value=mock_svc):
            resp = client.get("/api/memory/all")
        assert resp.status_code == 200

    def test_get_all_memories_returns_list(self, client):
        mock_svc = MagicMock()
        mock_svc.get_all_memories.return_value = [
            _make_memory_record("m1"),
            _make_memory_record("m2"),
        ]
        with patch("app.routers.memory.get_memory_service", return_value=mock_svc):
            data = client.get("/api/memory/all").json()
        assert "memories" in data
        assert isinstance(data["memories"], list)
        assert data["count"] == 2

    def test_get_all_memories_empty(self, client):
        mock_svc = MagicMock()
        mock_svc.get_all_memories.return_value = []
        with patch("app.routers.memory.get_memory_service", return_value=mock_svc):
            data = client.get("/api/memory/all").json()
        assert data["count"] == 0
        assert data["memories"] == []

    def test_get_all_memories_limit_param(self, client):
        mock_svc = MagicMock()
        mock_svc.get_all_memories.return_value = []
        with patch("app.routers.memory.get_memory_service", return_value=mock_svc):
            resp = client.get("/api/memory/all?limit=200")
        assert resp.status_code == 200
        mock_svc.get_all_memories.assert_called_once_with(limit=200)


class TestMemoryDelete:
    """UI calls DELETE /api/memory/{id} to remove a single memory item."""

    def test_delete_existing_memory_returns_200(self, client):
        mock_svc = MagicMock()
        mock_svc.delete_memory = AsyncMock(return_value=True)
        with patch("app.routers.memory.get_memory_service", return_value=mock_svc):
            resp = client.delete("/api/memory/mem-001")
        assert resp.status_code == 200

    def test_delete_returns_deleted_true(self, client):
        mock_svc = MagicMock()
        mock_svc.delete_memory = AsyncMock(return_value=True)
        with patch("app.routers.memory.get_memory_service", return_value=mock_svc):
            data = client.delete("/api/memory/mem-001").json()
        assert data.get("deleted") is True

    def test_delete_nonexistent_memory_returns_404(self, client):
        mock_svc = MagicMock()
        mock_svc.delete_memory = AsyncMock(return_value=False)
        with patch("app.routers.memory.get_memory_service", return_value=mock_svc):
            resp = client.delete("/api/memory/does-not-exist")
        assert resp.status_code == 404
