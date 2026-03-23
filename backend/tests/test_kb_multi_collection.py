"""Tests for Multi-KB collection management endpoints."""

import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ChromaDB shim (same as conftest.py)
_chroma_mock = MagicMock()
for _mod_name in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod_name, _chroma_mock)

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture
def client() -> TestClient:
    with patch(
        "app.services.startup_checks.run_startup_checks",
        new_callable=AsyncMock,
        return_value={"ollama": "ok (mocked)"},
    ):
        with TestClient(app) as c:
            yield c


def _make_vs_mock():
    """Build a VectorStoreService mock with Multi-KB methods."""
    mock = MagicMock()
    mock.list_collections = AsyncMock(
        return_value=[
            {"name": "knowledge_base", "count": 847, "metadata": {}},
            {"name": "powerbi", "count": 234, "metadata": {"description": "DAX docs"}},
        ]
    )
    mock.create_collection = AsyncMock(
        return_value={
            "name": "dev-notes",
            "metadata": {"description": "Dev notes", "tags": '["#python"]'},
        }
    )
    mock.delete_collection = AsyncMock(return_value=None)
    mock.add_tags_to_document = AsyncMock(return_value=None)
    mock.search_by_tag = AsyncMock(
        return_value={
            "ids": ["doc-1"],
            "documents": ["Lean waste reduction"],
            "metadatas": [{"tags": '["#lean"]', "file_path": "/docs/lean.md"}],
        }
    )
    # search() used by existing endpoints
    mock.search = MagicMock(
        return_value={
            "ids": [],
            "documents": [],
            "metadatas": [],
            "distances": [],
        }
    )
    mock.COLLECTION_NAME = "knowledge_base"
    mock.collection = MagicMock()
    mock.collection.count.return_value = 847
    mock.client = MagicMock()
    return mock


class TestListCollections:
    def test_list_collections_returns_200(self, client: TestClient):
        vs = _make_vs_mock()
        with patch("app.routers.knowledge.get_vector_store_service", return_value=vs):
            resp = client.get("/api/kb/collections")
        assert resp.status_code == 200

    def test_list_collections_shape(self, client: TestClient):
        vs = _make_vs_mock()
        with patch("app.routers.knowledge.get_vector_store_service", return_value=vs):
            resp = client.get("/api/kb/collections")
        data = resp.json()
        assert "collections" in data
        assert "count" in data
        assert data["count"] == 2
        assert data["collections"][0]["name"] == "knowledge_base"

    def test_list_collections_includes_chunk_count(self, client: TestClient):
        vs = _make_vs_mock()
        with patch("app.routers.knowledge.get_vector_store_service", return_value=vs):
            resp = client.get("/api/kb/collections")
        data = resp.json()
        for col in data["collections"]:
            assert "count" in col


class TestCreateCollection:
    def test_create_collection_returns_200(self, client: TestClient):
        vs = _make_vs_mock()
        with patch("app.routers.knowledge.get_vector_store_service", return_value=vs):
            resp = client.post(
                "/api/kb/collections",
                json={
                    "name": "dev-notes",
                    "description": "Dev notes",
                    "tags": ["#python"],
                },
            )
        assert resp.status_code == 200

    def test_create_collection_without_name_returns_400(self, client: TestClient):
        vs = _make_vs_mock()
        with patch("app.routers.knowledge.get_vector_store_service", return_value=vs):
            resp = client.post("/api/kb/collections", json={"description": "no name"})
        assert resp.status_code == 400

    def test_create_collection_returns_name(self, client: TestClient):
        vs = _make_vs_mock()
        with patch("app.routers.knowledge.get_vector_store_service", return_value=vs):
            resp = client.post("/api/kb/collections", json={"name": "dev-notes"})
        data = resp.json()
        assert "name" in data
        assert data["name"] == "dev-notes"


class TestDeleteCollection:
    def test_delete_collection_returns_200(self, client: TestClient):
        vs = _make_vs_mock()
        with patch("app.routers.knowledge.get_vector_store_service", return_value=vs):
            resp = client.delete(
                "/api/kb/collections/powerbi",
                headers={"X-API-Key": ""},
            )
        assert resp.status_code == 200

    def test_delete_collection_returns_deleted_flag(self, client: TestClient):
        vs = _make_vs_mock()
        with patch("app.routers.knowledge.get_vector_store_service", return_value=vs):
            resp = client.delete(
                "/api/kb/collections/powerbi",
                headers={"X-API-Key": ""},
            )
        data = resp.json()
        assert data.get("deleted") is True
        assert data.get("name") == "powerbi"

    def test_delete_default_collection_returns_400(self, client: TestClient):
        vs = _make_vs_mock()
        vs.delete_collection = AsyncMock(
            side_effect=ValueError("Cannot delete the default")
        )
        with patch("app.routers.knowledge.get_vector_store_service", return_value=vs):
            resp = client.delete(
                "/api/kb/collections/knowledge_base",
                headers={"X-API-Key": ""},
            )
        assert resp.status_code == 400
