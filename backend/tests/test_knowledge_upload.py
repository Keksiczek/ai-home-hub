"""Tests for Knowledge Base batch upload and overview endpoints."""
import io
import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ChromaDB shim (same as conftest.py)
_chroma_mock = MagicMock()
for _mod_name in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod_name, _chroma_mock)

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402
from app.services.file_handler_service import (  # noqa: E402
    ALL_SUPPORTED,
    get_accept_string,
    get_category,
    is_supported,
)


@pytest.fixture
def client() -> TestClient:
    with patch(
        "app.services.startup_checks.run_startup_checks",
        new_callable=AsyncMock,
        return_value={"ollama": "ok (mocked)"},
    ):
        with TestClient(app) as c:
            yield c


class TestFileHandlerService:
    """Test the file_handler_service utility functions."""

    def test_is_supported_txt(self):
        assert is_supported("readme.txt") is True

    def test_is_supported_pdf(self):
        assert is_supported("doc.pdf") is True

    def test_is_supported_py(self):
        assert is_supported("main.py") is True

    def test_is_supported_exe_rejected(self):
        assert is_supported("malware.exe") is False

    def test_is_supported_case_insensitive(self):
        assert is_supported("README.MD") is True

    def test_get_category_text(self):
        assert get_category("script.py") == "text"
        assert get_category("data.json") == "text"
        assert get_category("style.css") == "text"

    def test_get_category_document(self):
        assert get_category("report.pdf") == "document"
        assert get_category("doc.docx") == "document"

    def test_get_category_image(self):
        assert get_category("photo.png") == "image"

    def test_get_category_unsupported(self):
        assert get_category("file.zip") == "unsupported"

    def test_get_accept_string_has_common_types(self):
        accept = get_accept_string()
        assert ".pdf" in accept
        assert ".txt" in accept
        assert ".py" in accept

    def test_all_supported_count(self):
        # Ensure we have a good range of types
        assert len(ALL_SUPPORTED) >= 20


class TestBatchUploadEndpoint:
    """Test POST /api/knowledge/upload/batch."""

    def test_upload_single_txt_index_mode(self, client: TestClient):
        content = b"Hello world, this is a test document."
        resp = client.post(
            "/api/knowledge/upload/batch",
            files=[("files", ("test.txt", io.BytesIO(content), "text/plain"))],
            data={"mode": "index", "collection": "default"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["uploaded"] == 1
        assert len(data["results"]) == 1
        assert "job_id" in data["results"][0]
        assert data["results"][0]["file"] == "test.txt"

    def test_upload_single_txt_analyze_mode(self, client: TestClient):
        content = b"This is some text content for analysis."
        resp = client.post(
            "/api/knowledge/upload/batch",
            files=[("files", ("analyze.txt", io.BytesIO(content), "text/plain"))],
            data={"mode": "analyze", "collection": "default"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["uploaded"] == 1
        result = data["results"][0]
        assert "preview" in result
        assert "This is some text" in result["preview"]

    def test_upload_unsupported_type(self, client: TestClient):
        resp = client.post(
            "/api/knowledge/upload/batch",
            files=[("files", ("bad.exe", io.BytesIO(b"data"), "application/octet-stream"))],
            data={"mode": "index"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["uploaded"] == 0
        assert "error" in data["results"][0]

    def test_upload_multiple_files_mixed(self, client: TestClient):
        files = [
            ("files", ("a.txt", io.BytesIO(b"file a content"), "text/plain")),
            ("files", ("b.exe", io.BytesIO(b"bad"), "application/octet-stream")),
        ]
        resp = client.post(
            "/api/knowledge/upload/batch",
            files=files,
            data={"mode": "analyze"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["uploaded"] == 1
        assert len(data["results"]) == 2
        # First should succeed, second should have error
        assert "preview" in data["results"][0]
        assert "error" in data["results"][1]


class TestKBOverviewEndpoint:
    """Test GET /api/knowledge/overview."""

    def test_overview_returns_200(self, client: TestClient):
        mock_stats = {
            "total_chunks": 42,
            "collection_name": "default",
            "total_documents": 3,
            "file_types": {".txt": 2, ".pdf": 1},
            "top_sources": [
                {"path": "/tmp/a.txt", "chunks": 20},
                {"path": "/tmp/b.pdf", "chunks": 22},
            ],
            "detailed": True,
        }
        with patch(
            "app.routers.knowledge.get_vector_store_service"
        ) as mock_vs:
            mock_vs.return_value.get_stats.return_value = mock_stats
            resp = client.get("/api/knowledge/overview")

        assert resp.status_code == 200
        data = resp.json()
        assert data["total_documents"] == 3
        assert data["total_chunks"] == 42
        assert "collections" in data
        assert len(data["collections"]) == 1
        assert data["collections"][0]["name"] == "default"
