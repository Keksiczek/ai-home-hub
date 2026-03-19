"""Tests for KB tag-based filtering and the /api/kb/search endpoint."""
import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ChromaDB shim
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
    mock = MagicMock()
    mock.COLLECTION_NAME = "knowledge_base"
    mock.collection = MagicMock()
    mock.client = MagicMock()
    mock.search_by_tag = AsyncMock(return_value={
        "ids": ["chunk-1", "chunk-2"],
        "documents": ["Lean waste: the 7 wastes", "CI pipeline best practices"],
        "metadatas": [
            {"tags": '["#lean"]', "file_path": "/docs/lean.md"},
            {"tags": '["#lean", "#ci"]', "file_path": "/docs/ci.md"},
        ],
    })
    mock.add_tags_to_document = AsyncMock(return_value=None)
    mock.search = MagicMock(return_value={
        "ids": [],
        "documents": [],
        "metadatas": [],
        "distances": [],
    })
    return mock


class TestKBSearch:
    def test_search_by_tag_only_returns_200(self, client: TestClient):
        vs = _make_vs_mock()
        with patch("app.routers.knowledge.get_vector_store_service", return_value=vs):
            resp = client.get("/api/kb/search?tag=%23lean")
        assert resp.status_code == 200

    def test_search_by_tag_returns_documents(self, client: TestClient):
        vs = _make_vs_mock()
        with patch("app.routers.knowledge.get_vector_store_service", return_value=vs):
            resp = client.get("/api/kb/search?tag=%23lean")
        data = resp.json()
        assert "results" in data
        assert len(data["results"]) == 2

    def test_search_by_tag_echoes_tag_param(self, client: TestClient):
        vs = _make_vs_mock()
        with patch("app.routers.knowledge.get_vector_store_service", return_value=vs):
            resp = client.get("/api/kb/search?tag=%23lean")
        data = resp.json()
        assert data.get("tag") == "#lean"

    def test_search_empty_params_returns_400(self, client: TestClient):
        vs = _make_vs_mock()
        with patch("app.routers.knowledge.get_vector_store_service", return_value=vs):
            resp = client.get("/api/kb/search")
        assert resp.status_code == 400

    def test_add_tags_to_document_returns_200(self, client: TestClient):
        vs = _make_vs_mock()
        with patch("app.routers.knowledge.get_vector_store_service", return_value=vs):
            resp = client.post(
                "/api/kb/collections/knowledge_base/tags",
                json={"doc_id": "file:/docs/lean.md:chunk_0", "tags": ["#lean", "#ci"]},
            )
        assert resp.status_code == 200

    def test_add_tags_without_doc_id_returns_400(self, client: TestClient):
        vs = _make_vs_mock()
        with patch("app.routers.knowledge.get_vector_store_service", return_value=vs):
            resp = client.post(
                "/api/kb/collections/knowledge_base/tags",
                json={"tags": ["#lean"]},
            )
        assert resp.status_code == 400

    def test_add_tags_returns_tag_list(self, client: TestClient):
        vs = _make_vs_mock()
        with patch("app.routers.knowledge.get_vector_store_service", return_value=vs):
            resp = client.post(
                "/api/kb/collections/knowledge_base/tags",
                json={"doc_id": "file:/docs/lean.md:chunk_0", "tags": ["#lean"]},
            )
        data = resp.json()
        assert "tags" in data
        assert "#lean" in data["tags"]

    def test_search_uses_tag_filter_on_empty_q(self, client: TestClient):
        vs = _make_vs_mock()
        with patch("app.routers.knowledge.get_vector_store_service", return_value=vs):
            resp = client.get("/api/kb/search?q=&tag=%23ci")
        assert resp.status_code == 200
        vs.search_by_tag.assert_called_once()
