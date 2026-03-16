"""Integration tests – Knowledge Base upload flow.

Covers:
- index mode: upload saves files and creates a job_id
- analyze mode: upload returns preview + char_count
- unsupported file extension returns per-file error without crashing request
- multiple files in one batch
- KB overview endpoint structure
"""
import io
import sys
from typing import Any, Dict
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ── ChromaDB shim ─────────────────────────────────────────────────────────────
_chroma_mock = MagicMock()
for _mod_name in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod_name, _chroma_mock)

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

# Mock KB stats that are returned by the overview endpoint
_MOCK_KB_STATS: Dict[str, Any] = {
    "total_documents": 0,
    "total_chunks": 0,
    "storage_size_mb": 0.0,
    "last_indexed": None,
    "computed_at": "2025-01-01T00:00:00+00:00",
    "cache_age_seconds": 0,
}


@pytest.fixture
def client() -> TestClient:
    with patch(
        "app.services.startup_checks.run_startup_checks",
        new_callable=AsyncMock,
        return_value={"ollama": "ok (mocked)"},
    ):
        with TestClient(app) as c:
            yield c


SAMPLE_TEXT = b"This is a sample document for testing the knowledge base upload flow."
SAMPLE_CODE = b"def hello():\n    return 'Hello, World!'\n"


class TestKbIndexMode:
    """index mode – files are saved to disk and a background job is created."""

    def test_single_txt_index_returns_job_id(self, client):
        resp = client.post(
            "/api/knowledge/upload/batch",
            files=[("files", ("sample.txt", io.BytesIO(SAMPLE_TEXT), "text/plain"))],
            data={"mode": "index", "collection": "test_collection"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "results" in data
        assert len(data["results"]) >= 1
        result = data["results"][0]
        assert result["file"] == "sample.txt"
        assert "job_id" in result

    def test_single_txt_index_has_top_level_job_id(self, client):
        resp = client.post(
            "/api/knowledge/upload/batch",
            files=[("files", ("doc.txt", io.BytesIO(SAMPLE_TEXT), "text/plain"))],
            data={"mode": "index", "collection": "default"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "job_id" in data
        assert data["job_id"] is not None

    def test_python_file_index_returns_job_id(self, client):
        resp = client.post(
            "/api/knowledge/upload/batch",
            files=[("files", ("script.py", io.BytesIO(SAMPLE_CODE), "text/plain"))],
            data={"mode": "index", "collection": "default"},
        )
        assert resp.status_code == 200
        result = resp.json()["results"][0]
        assert "job_id" in result

    def test_index_job_is_pollable(self, client):
        """Batch upload job can be polled at /api/knowledge/ingest-jobs/{job_id}."""
        resp = client.post(
            "/api/knowledge/upload/batch",
            files=[("files", ("doc.txt", io.BytesIO(SAMPLE_TEXT), "text/plain"))],
            data={"mode": "index", "collection": "default"},
        )
        job_id = resp.json()["job_id"]

        # The knowledge batch upload uses its own in-memory job tracking,
        # distinct from the persistent /api/jobs store.
        poll_resp = client.get(f"/api/knowledge/ingest-jobs/{job_id}")
        assert poll_resp.status_code == 200
        job_data = poll_resp.json()
        assert "status" in job_data
        assert "job_id" in job_data

    def test_multiple_files_index(self, client):
        files = [
            ("files", ("a.txt", io.BytesIO(b"File A content"), "text/plain")),
            ("files", ("b.txt", io.BytesIO(b"File B content"), "text/plain")),
        ]
        resp = client.post(
            "/api/knowledge/upload/batch",
            files=files,
            data={"mode": "index", "collection": "default"},
        )
        assert resp.status_code == 200
        data = resp.json()
        # Both files should appear in results
        assert len(data["results"]) == 2
        # Both get the same batch job_id
        for r in data["results"]:
            assert "job_id" in r
            assert r["job_id"] == data["job_id"]


class TestKbAnalyzeMode:
    """analyze mode – files are processed synchronously, results returned immediately."""

    def test_single_txt_analyze_returns_preview(self, client):
        resp = client.post(
            "/api/knowledge/upload/batch",
            files=[("files", ("analyze.txt", io.BytesIO(SAMPLE_TEXT), "text/plain"))],
            data={"mode": "analyze"},
        )
        assert resp.status_code == 200
        data = resp.json()
        result = data["results"][0]
        assert "preview" in result
        assert len(result["preview"]) > 0

    def test_analyze_returns_char_count(self, client):
        resp = client.post(
            "/api/knowledge/upload/batch",
            files=[("files", ("chars.txt", io.BytesIO(SAMPLE_TEXT), "text/plain"))],
            data={"mode": "analyze"},
        )
        result = resp.json()["results"][0]
        assert "char_count" in result
        assert result["char_count"] == len(SAMPLE_TEXT)

    def test_analyze_mode_has_no_job_id(self, client):
        """Analyze mode is synchronous – no job_id at top level."""
        resp = client.post(
            "/api/knowledge/upload/batch",
            files=[("files", ("sync.txt", io.BytesIO(SAMPLE_TEXT), "text/plain"))],
            data={"mode": "analyze"},
        )
        data = resp.json()
        # No background job for analyze mode
        assert data.get("job_id") is None

    def test_analyze_multiple_files_all_returned(self, client):
        files = [
            ("files", ("x.txt", io.BytesIO(b"Content X"), "text/plain")),
            ("files", ("y.py", io.BytesIO(SAMPLE_CODE), "text/plain")),
        ]
        resp = client.post(
            "/api/knowledge/upload/batch",
            files=files,
            data={"mode": "analyze"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["results"]) == 2
        filenames = {r["file"] for r in data["results"]}
        assert "x.txt" in filenames
        assert "y.py" in filenames


class TestKbUnsupportedFiles:
    """Unsupported extensions produce per-file errors without crashing the batch."""

    def test_exe_file_returns_per_file_error(self, client):
        resp = client.post(
            "/api/knowledge/upload/batch",
            files=[("files", ("bad.exe", io.BytesIO(b"\x4d\x5a"), "application/octet-stream"))],
            data={"mode": "analyze"},
        )
        # Whole request must succeed (200), error is in the result
        assert resp.status_code == 200
        result = resp.json()["results"][0]
        assert "error" in result

    def test_mixed_batch_supported_and_unsupported(self, client):
        """Supported file returns result; unsupported returns per-file error."""
        files = [
            ("files", ("good.txt", io.BytesIO(b"Good content"), "text/plain")),
            ("files", ("bad.exe", io.BytesIO(b"\x4d\x5a"), "application/octet-stream")),
        ]
        resp = client.post(
            "/api/knowledge/upload/batch",
            files=files,
            data={"mode": "analyze"},
        )
        assert resp.status_code == 200
        results = resp.json()["results"]
        assert len(results) == 2

        by_file = {r["file"]: r for r in results}
        # good.txt has no error
        assert "error" not in by_file.get("good.txt", {})
        # bad.exe has an error
        assert "error" in by_file.get("bad.exe", {})

    def test_zip_file_returns_per_file_error_in_index_mode(self, client):
        resp = client.post(
            "/api/knowledge/upload/batch",
            files=[("files", ("archive.zip", io.BytesIO(b"PK\x03\x04"), "application/zip"))],
            data={"mode": "index", "collection": "default"},
        )
        assert resp.status_code == 200
        result = resp.json()["results"][0]
        assert "error" in result

    def test_all_unsupported_index_mode_returns_null_job_id(self, client):
        """When all files are rejected, no job is created."""
        resp = client.post(
            "/api/knowledge/upload/batch",
            files=[("files", ("bad.exe", io.BytesIO(b"\x4d\x5a"), "application/octet-stream"))],
            data={"mode": "index", "collection": "default"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("job_id") is None


class TestKbOverview:
    """GET /api/knowledge/overview returns a valid structure (mocked KB stats)."""

    def test_overview_returns_200_with_mocked_stats(self, client):
        with patch("app.services.kb_stats_cache.get_cached_stats", return_value=_MOCK_KB_STATS):
            resp = client.get("/api/knowledge/overview")
        assert resp.status_code == 200

    def test_overview_has_required_fields(self, client):
        with patch("app.services.kb_stats_cache.get_cached_stats", return_value=_MOCK_KB_STATS):
            data = client.get("/api/knowledge/overview").json()
        for field in ("total_documents", "total_chunks", "storage_size_mb", "collections"):
            assert field in data, f"Missing field: {field}"

    def test_overview_collections_is_list(self, client):
        with patch("app.services.kb_stats_cache.get_cached_stats", return_value=_MOCK_KB_STATS):
            data = client.get("/api/knowledge/overview").json()
        assert isinstance(data["collections"], list)
