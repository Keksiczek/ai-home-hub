"""Tests: KB Manager UI calls correct API endpoints for collections and search."""

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


def _mock_vector_store(collections=None, search_results=None):
    """Return a patched vector store service."""
    mock_vs = MagicMock()
    mock_vs.list_collections = AsyncMock(
        return_value=collections
        or [
            {"name": "main", "chunk_count": 847, "tags": ["#lean", "#ci", "#workflow"]},
            {"name": "powerbi", "chunk_count": 312, "tags": ["#dax"]},
        ]
    )
    mock_vs.create_collection = AsyncMock(
        return_value={"name": "new_col", "created": True}
    )
    mock_vs.delete_collection = AsyncMock(return_value=True)
    mock_vs.search = AsyncMock(return_value=search_results or [])
    return mock_vs


class TestKBCollectionsEndpoint:
    """UI calls GET /api/kb/collections for collections list."""

    def test_list_collections_returns_200(self, client):
        mock_vs = _mock_vector_store()
        with patch(
            "app.routers.knowledge.get_vector_store_service", return_value=mock_vs
        ):
            resp = client.get("/api/kb/collections")
        assert resp.status_code == 200

    def test_list_collections_json_structure(self, client):
        mock_vs = _mock_vector_store()
        with patch(
            "app.routers.knowledge.get_vector_store_service", return_value=mock_vs
        ):
            data = client.get("/api/kb/collections").json()
        assert "collections" in data
        assert "count" in data
        assert isinstance(data["collections"], list)

    def test_list_collections_returns_expected_names(self, client):
        mock_vs = _mock_vector_store()
        with patch(
            "app.routers.knowledge.get_vector_store_service", return_value=mock_vs
        ):
            data = client.get("/api/kb/collections").json()
        names = [c["name"] for c in data["collections"]]
        assert "main" in names
        assert "powerbi" in names

    def test_list_collections_count_matches(self, client):
        mock_vs = _mock_vector_store()
        with patch(
            "app.routers.knowledge.get_vector_store_service", return_value=mock_vs
        ):
            data = client.get("/api/kb/collections").json()
        assert data["count"] == len(data["collections"])


class TestKBCreateCollection:
    """UI calls POST /api/kb/collections to create a new collection."""

    def test_create_collection_succeeds(self, client):
        mock_vs = _mock_vector_store()
        with patch(
            "app.routers.knowledge.get_vector_store_service", return_value=mock_vs
        ):
            resp = client.post(
                "/api/kb/collections",
                json={
                    "name": "testcol",
                    "description": "Test collection",
                    "tags": ["#test"],
                },
            )
        assert resp.status_code == 200

    def test_create_collection_missing_name_returns_400(self, client):
        mock_vs = _mock_vector_store()
        with patch(
            "app.routers.knowledge.get_vector_store_service", return_value=mock_vs
        ):
            resp = client.post("/api/kb/collections", json={"description": "no name"})
        assert resp.status_code == 400

    def test_create_collection_empty_name_returns_400(self, client):
        mock_vs = _mock_vector_store()
        with patch(
            "app.routers.knowledge.get_vector_store_service", return_value=mock_vs
        ):
            resp = client.post("/api/kb/collections", json={"name": "   "})
        assert resp.status_code == 400


class TestKBDeleteCollection:
    """UI calls DELETE /api/kb/collections/{name} to remove a collection."""

    def test_delete_collection_succeeds(self, client):
        mock_vs = _mock_vector_store()
        with patch(
            "app.routers.knowledge.get_vector_store_service", return_value=mock_vs
        ):
            resp = client.delete("/api/kb/collections/main")
        assert resp.status_code == 200
        assert resp.json().get("deleted") is True

    def test_delete_collection_returns_name(self, client):
        mock_vs = _mock_vector_store()
        with patch(
            "app.routers.knowledge.get_vector_store_service", return_value=mock_vs
        ):
            resp = client.delete("/api/kb/collections/main")
        assert resp.json().get("name") == "main"


def _mock_search_deps(mock_vs):
    """Patch vector store + embeddings service for search endpoint tests."""
    mock_emb = MagicMock()
    mock_emb.generate_embedding = AsyncMock(return_value=[0.1] * 384)
    col_mock = MagicMock()
    col_mock.count.return_value = 5
    col_mock.query.return_value = {
        "documents": [[]],
        "metadatas": [[]],
        "distances": [[]],
        "ids": [[]],
    }
    mock_vs.collection = col_mock
    mock_vs.client.get_collection.return_value = col_mock
    mock_vs.get_or_create_collection = AsyncMock(return_value=col_mock)
    mock_vs.COLLECTION_NAME = "knowledge_base"
    return mock_emb


class TestKBSearchEndpoint:
    """UI calls GET /api/kb/search with q, collection, tag params."""

    def test_search_accepts_query_param(self, client):
        mock_vs = _mock_vector_store()
        mock_emb = _mock_search_deps(mock_vs)
        with patch(
            "app.routers.knowledge.get_vector_store_service", return_value=mock_vs
        ), patch("app.routers.knowledge.get_embeddings_service", return_value=mock_emb):
            resp = client.get("/api/kb/search?q=lean+ci")
        assert resp.status_code == 200

    def test_search_accepts_collection_filter(self, client):
        mock_vs = _mock_vector_store()
        mock_emb = _mock_search_deps(mock_vs)
        with patch(
            "app.routers.knowledge.get_vector_store_service", return_value=mock_vs
        ), patch("app.routers.knowledge.get_embeddings_service", return_value=mock_emb):
            resp = client.get("/api/kb/search?q=test&collection=main")
        assert resp.status_code == 200

    def test_search_accepts_tag_filter(self, client):
        mock_vs = _mock_vector_store()
        mock_vs.search_by_tag = AsyncMock(
            return_value={"documents": [], "metadatas": []}
        )
        mock_vs.COLLECTION_NAME = "knowledge_base"
        with patch(
            "app.routers.knowledge.get_vector_store_service", return_value=mock_vs
        ):
            resp = client.get("/api/kb/search?tag=lean")
        assert resp.status_code == 200

    def test_search_returns_results_key(self, client):
        mock_vs = _mock_vector_store()
        mock_emb = _mock_search_deps(mock_vs)
        with patch(
            "app.routers.knowledge.get_vector_store_service", return_value=mock_vs
        ), patch("app.routers.knowledge.get_embeddings_service", return_value=mock_emb):
            data = client.get("/api/kb/search?q=anything").json()
        assert "results" in data
