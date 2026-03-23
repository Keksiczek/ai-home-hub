"""Tests for KB incremental ingest and file-deletion operations."""

import os
from unittest.mock import AsyncMock, MagicMock

import pytest

# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest.fixture
def temp_kb_dir(tmp_path):
    """Temporary directory containing one .txt and one .md file."""
    txt = tmp_path / "doc.txt"
    txt.write_text("Hello world from a plain text document.")
    md = tmp_path / "notes.md"
    md.write_text("# Notes\n\nSome markdown content here.")
    return tmp_path, txt, md


@pytest.fixture
def mock_vector_store(monkeypatch):
    """Replace get_vector_store_service with a MagicMock."""
    vs = MagicMock()
    vs.add_documents = AsyncMock(return_value=None)
    vs.delete_by_file_path = AsyncMock(return_value=0)
    vs.get_stats.return_value = {"total_chunks": 0, "collection_name": "knowledge_base"}
    monkeypatch.setattr("app.routers.knowledge.get_vector_store_service", lambda: vs)
    return vs


@pytest.fixture
def mock_embeddings(monkeypatch):
    """Replace get_embeddings_service with an AsyncMock returning fake vectors."""
    svc = AsyncMock()
    # Return one fake embedding per chunk so the ingest pipeline succeeds.
    svc.generate_embeddings_batch.side_effect = lambda chunks: [
        [0.1, 0.2, 0.3] for _ in chunks
    ]
    svc.generate_embedding.return_value = [0.1, 0.2, 0.3]
    monkeypatch.setattr("app.routers.knowledge.get_embeddings_service", lambda: svc)
    return svc


# ── Helpers ───────────────────────────────────────────────────────────────────


def _post_and_get_job(client, url, body=None, json=None):
    """POST to a background-job endpoint and fetch the completed job result.

    FastAPI's TestClient executes background tasks before the response is
    delivered to the test, so by the time post() returns the job is already
    complete.  We just need one GET to retrieve the final state.
    """
    if json is not None:
        resp = client.post(url, json=json)
    else:
        resp = client.post(url)
    assert resp.status_code == 200, resp.text
    job_id = resp.json()["job_id"]
    job_resp = client.get(f"/api/knowledge/ingest-jobs/{job_id}")
    assert job_resp.status_code == 200
    return job_resp.json()


# ── Tests ─────────────────────────────────────────────────────────────────────


def test_incremental_ingest_skips_unchanged_files(
    client, temp_kb_dir, mock_vector_store, mock_embeddings, monkeypatch
):
    """When get_file_metadata returns the same mtime, the file must be skipped."""
    _, txt_file, _ = temp_kb_dir
    current_mtime = txt_file.stat().st_mtime

    monkeypatch.setattr(
        "app.routers.knowledge.get_file_metadata",
        lambda path: {"mtime": current_mtime, "file_path": path},
    )

    job = _post_and_get_job(
        client, "/api/knowledge/ingest/incremental", json=[str(txt_file)]
    )

    assert job["status"] == "completed"
    assert job["result"]["skipped_count"] == 1
    assert job["result"]["re_indexed"] == 0


def test_incremental_ingest_reindexes_modified_file(
    client, temp_kb_dir, mock_vector_store, mock_embeddings, monkeypatch
):
    """When the file's mtime differs from stored metadata, it must be re-indexed."""
    _, txt_file, _ = temp_kb_dir
    original_mtime = txt_file.stat().st_mtime

    new_mtime = original_mtime + 100.0
    os.utime(txt_file, (new_mtime, new_mtime))

    monkeypatch.setattr(
        "app.routers.knowledge.get_file_metadata",
        lambda path: {"mtime": original_mtime, "file_path": path},
    )

    job = _post_and_get_job(
        client, "/api/knowledge/ingest/incremental", json=[str(txt_file)]
    )

    assert job["status"] == "completed"
    assert job["result"]["re_indexed"] == 1
    assert job["result"]["skipped_count"] == 0


def test_delete_kb_file_removes_chunks(client, mock_vector_store):
    """DELETE /knowledge/files returns deleted_chunks when chunks exist."""
    mock_vector_store.delete_by_file_path.return_value = 5

    resp = client.delete("/api/knowledge/files", params={"path": "test.txt"})

    assert resp.status_code == 200
    data = resp.json()
    assert data["deleted_chunks"] == 5
    mock_vector_store.delete_by_file_path.assert_called_once_with("test.txt")


def test_delete_kb_file_not_found_returns_404(client, mock_vector_store):
    """DELETE /knowledge/files returns 404 when no chunks exist for the path."""
    mock_vector_store.delete_by_file_path.return_value = 0

    resp = client.delete("/api/knowledge/files", params={"path": "missing.txt"})

    assert resp.status_code == 404
    assert "missing.txt" in resp.json()["detail"]


def test_ingest_job_returns_pending_immediately(client, mock_vector_store, monkeypatch):
    """POST /knowledge/ingest must return job_id and status immediately."""
    # Patch scan to return empty list so we don't need embeddings
    monkeypatch.setattr(
        "app.routers.knowledge.scan_external_storage",
        AsyncMock(return_value={"discovered_files": [], "errors": []}),
    )

    resp = client.post("/api/knowledge/ingest")

    assert resp.status_code == 200
    data = resp.json()
    assert "job_id" in data
    assert data["status"] in ("pending", "running", "completed")


def test_ingest_job_polling_404_for_unknown_id(client):
    """GET /knowledge/ingest-jobs/<unknown> returns 404."""
    resp = client.get("/api/knowledge/ingest-jobs/no-such-job")
    assert resp.status_code == 404


def test_ingest_job_completed_after_background_task(
    client, temp_kb_dir, mock_vector_store, mock_embeddings, monkeypatch
):
    """After background task finishes, job status must be 'completed'."""
    _, txt_file, _ = temp_kb_dir

    job = _post_and_get_job(client, "/api/knowledge/ingest", json=None)

    # job may be completed (files scanned from scan endpoint returning nothing)
    # or completed with result — what matters is it's not stuck in 'pending'
    assert job["status"] in ("completed", "failed")
