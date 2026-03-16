"""Integration tests – Jobs API (CRUD, filters, cancel, retry).

Covers:
- POST /api/jobs creates job with correct structure
- GET /api/jobs returns list with count
- GET /api/jobs?status=… and ?type=… filters work
- GET /api/jobs/{id} returns job detail
- POST /api/jobs/{id}/cancel transitions status to cancelled
- POST /api/jobs/{id}/cancel is idempotent (returns 400 for finished jobs)
- POST /api/jobs/{id}/retry creates a new queued job from failed/cancelled
- POST /api/jobs/{id}/retry rejects succeeded jobs
"""
import sys
from typing import Dict, Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ── ChromaDB shim ─────────────────────────────────────────────────────────────
_chroma_mock = MagicMock()
for _mod_name in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod_name, _chroma_mock)

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402
from app.services.job_service import get_job_service  # noqa: E402


@pytest.fixture
def client() -> TestClient:
    with patch(
        "app.services.startup_checks.run_startup_checks",
        new_callable=AsyncMock,
        return_value={"ollama": "ok (mocked)"},
    ):
        with TestClient(app) as c:
            yield c


# ── Helpers ───────────────────────────────────────────────────────────────────

def _create_job(client, type_: str = "dummy_long_task", title: str = "Test job",
                priority: str = "normal") -> Dict[str, Any]:
    """Create a job via the API and return the response JSON."""
    resp = client.post("/api/jobs", json={
        "type": type_,
        "title": title,
        "input_summary": "Created by test",
        "priority": priority,
    })
    assert resp.status_code == 200, resp.text
    return resp.json()


def _force_status(job_id: str, status: str) -> None:
    """Directly update a job's status through the service layer (no HTTP)."""
    svc = get_job_service()
    job = svc.get_job(job_id)
    assert job is not None, f"Job {job_id} not found"
    job.status = status
    svc.update_job(job)


# ── Create ────────────────────────────────────────────────────────────────────

class TestCreateJob:
    def test_create_returns_200(self, client):
        job = _create_job(client)
        assert "id" in job

    def test_create_sets_queued_status(self, client):
        job = _create_job(client)
        assert job["status"] == "queued"

    def test_create_preserves_type_and_title(self, client):
        job = _create_job(client, type_="kb_reindex", title="Nightly KB reindex")
        assert job["type"] == "kb_reindex"
        assert job["title"] == "Nightly KB reindex"

    def test_create_sets_priority(self, client):
        job = _create_job(client, priority="high")
        assert job["priority"] == "high"

    def test_create_has_timestamps(self, client):
        job = _create_job(client)
        assert job["created_at"] is not None
        assert job["started_at"] is None
        assert job["finished_at"] is None


# ── List + filters ────────────────────────────────────────────────────────────

class TestListJobs:
    def test_list_returns_jobs_key_and_count(self, client):
        _create_job(client)
        resp = client.get("/api/jobs")
        assert resp.status_code == 200
        data = resp.json()
        assert "jobs" in data
        assert "count" in data
        assert data["count"] == len(data["jobs"])

    def test_filter_by_status(self, client):
        job = _create_job(client, type_="filter_status_test")
        job_id = job["id"]
        _force_status(job_id, "failed")

        resp = client.get("/api/jobs?status=failed")
        ids = [j["id"] for j in resp.json()["jobs"]]
        assert job_id in ids

        resp_q = client.get("/api/jobs?status=queued")
        ids_q = [j["id"] for j in resp_q.json()["jobs"]]
        assert job_id not in ids_q

    def test_filter_by_type(self, client):
        unique_type = "unique_filter_type_xyz"
        job = _create_job(client, type_=unique_type)
        job_id = job["id"]

        resp = client.get(f"/api/jobs?type={unique_type}")
        ids = [j["id"] for j in resp.json()["jobs"]]
        assert job_id in ids

    def test_filter_combined_status_and_type(self, client):
        unique_type = "combo_filter_type_abc"
        job = _create_job(client, type_=unique_type)
        _force_status(job["id"], "cancelled")

        resp = client.get(f"/api/jobs?status=cancelled&type={unique_type}")
        ids = [j["id"] for j in resp.json()["jobs"]]
        assert job["id"] in ids

    def test_limit_parameter(self, client):
        for _ in range(3):
            _create_job(client, type_="limit_test")

        resp = client.get("/api/jobs?limit=2")
        assert len(resp.json()["jobs"]) <= 2


# ── Get single job ────────────────────────────────────────────────────────────

class TestGetJob:
    def test_get_job_returns_correct_id(self, client):
        job = _create_job(client)
        resp = client.get(f"/api/jobs/{job['id']}")
        assert resp.status_code == 200
        assert resp.json()["id"] == job["id"]

    def test_get_nonexistent_job_returns_404(self, client):
        resp = client.get("/api/jobs/nonexistent-id-does-not-exist")
        assert resp.status_code == 404

    def test_get_job_has_all_fields(self, client):
        job = _create_job(client)
        data = client.get(f"/api/jobs/{job['id']}").json()
        for field in ("id", "type", "title", "status", "progress", "created_at",
                      "priority", "payload", "meta"):
            assert field in data, f"Missing field: {field}"


# ── Cancel ────────────────────────────────────────────────────────────────────

class TestCancelJob:
    def test_cancel_queued_job(self, client):
        job = _create_job(client)
        resp = client.post(f"/api/jobs/{job['id']}/cancel")
        assert resp.status_code == 200
        assert resp.json()["status"] == "cancelled"

    def test_cancel_running_job(self, client):
        job = _create_job(client)
        _force_status(job["id"], "running")
        resp = client.post(f"/api/jobs/{job['id']}/cancel")
        assert resp.status_code == 200
        assert resp.json()["status"] == "cancelled"

    def test_cancel_succeeded_job_returns_400(self, client):
        job = _create_job(client)
        _force_status(job["id"], "succeeded")
        resp = client.post(f"/api/jobs/{job['id']}/cancel")
        assert resp.status_code == 400

    def test_cancel_already_cancelled_returns_400(self, client):
        job = _create_job(client)
        _force_status(job["id"], "cancelled")
        resp = client.post(f"/api/jobs/{job['id']}/cancel")
        assert resp.status_code == 400

    def test_cancel_nonexistent_returns_404(self, client):
        resp = client.post("/api/jobs/does-not-exist/cancel")
        assert resp.status_code == 404

    def test_cancelled_job_visible_in_list(self, client):
        job = _create_job(client)
        client.post(f"/api/jobs/{job['id']}/cancel")

        resp = client.get("/api/jobs?status=cancelled")
        ids = [j["id"] for j in resp.json()["jobs"]]
        assert job["id"] in ids


# ── Retry ─────────────────────────────────────────────────────────────────────

class TestRetryJob:
    def test_retry_failed_job_creates_new_queued_job(self, client):
        job = _create_job(client, type_="retry_test_type")
        _force_status(job["id"], "failed")

        resp = client.post(f"/api/jobs/{job['id']}/retry")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "queued"
        assert data["id"] != job["id"]
        assert data["retry_of"] == job["id"]

    def test_retry_cancelled_job(self, client):
        job = _create_job(client)
        _force_status(job["id"], "cancelled")

        resp = client.post(f"/api/jobs/{job['id']}/retry")
        assert resp.status_code == 200
        assert resp.json()["status"] == "queued"

    def test_retry_succeeded_job_returns_400(self, client):
        job = _create_job(client)
        _force_status(job["id"], "succeeded")

        resp = client.post(f"/api/jobs/{job['id']}/retry")
        assert resp.status_code == 400

    def test_retry_queued_job_returns_400(self, client):
        job = _create_job(client)  # already queued
        resp = client.post(f"/api/jobs/{job['id']}/retry")
        assert resp.status_code == 400

    def test_retry_nonexistent_returns_404(self, client):
        resp = client.post("/api/jobs/no-such-job/retry")
        assert resp.status_code == 404

    def test_retry_preserves_type_and_title(self, client):
        job = _create_job(client, type_="preserve_test", title="Original title")
        _force_status(job["id"], "failed")

        new_job_data = client.post(f"/api/jobs/{job['id']}/retry").json()
        detail = client.get(f"/api/jobs/{new_job_data['id']}").json()
        assert detail["type"] == "preserve_test"
        assert detail["title"] == "Original title"

    def test_retried_job_appears_in_list(self, client):
        job = _create_job(client)
        _force_status(job["id"], "failed")
        new_data = client.post(f"/api/jobs/{job['id']}/retry").json()

        ids = [j["id"] for j in client.get("/api/jobs").json()["jobs"]]
        assert new_data["id"] in ids
