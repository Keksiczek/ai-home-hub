"""Tests for Run Now vs Schedule job endpoints."""
import pytest


def test_run_now_creates_high_priority_job(client):
    """POST /api/jobs/run-now creates a high-priority job."""
    resp = client.post("/api/jobs/run-now", json={
        "type": "long_llm_task",
        "title": "Test run now",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["priority"] == "high"
    assert data["status"] == "queued"
    assert "id" in data


def test_schedule_requires_cron_or_run_at(client):
    """POST /api/jobs/schedule without cron or run_at returns 400."""
    resp = client.post("/api/jobs/schedule", json={
        "type": "kb_reindex",
        "title": "Test schedule",
    })
    assert resp.status_code == 400


def test_schedule_with_run_at(client):
    """POST /api/jobs/schedule with run_at creates a scheduled job."""
    resp = client.post("/api/jobs/schedule", json={
        "type": "kb_reindex",
        "title": "Scheduled reindex",
        "run_at": "2026-03-17T22:00:00Z",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "queued"
    assert data["schedule"]["scheduled_type"] == "one_shot"


def test_schedule_with_cron(client):
    """POST /api/jobs/schedule with cron creates a cron-scheduled job."""
    resp = client.post("/api/jobs/schedule", json={
        "type": "nightly_summary",
        "title": "Nightly cron",
        "cron": "0 22 * * *",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["schedule"]["cron"] == "0 22 * * *"


def test_job_queue_returns_active_jobs(client):
    """GET /api/jobs/queue returns running + queued + paused jobs."""
    # Create a job first
    client.post("/api/jobs/run-now", json={"type": "test", "title": "Queue test"})

    resp = client.get("/api/jobs/queue")
    assert resp.status_code == 200
    data = resp.json()
    assert "queue" in data
    assert "running_count" in data
    assert "queued_count" in data
    assert data["total"] >= 0


def test_delete_job(client):
    """DELETE /api/jobs/{id} removes a job."""
    # Create a job
    create_resp = client.post("/api/jobs/run-now", json={"type": "test", "title": "To delete"})
    job_id = create_resp.json()["id"]

    # Delete it
    del_resp = client.delete(f"/api/jobs/{job_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["status"] == "deleted"

    # Verify it's gone
    get_resp = client.get(f"/api/jobs/{job_id}")
    assert get_resp.status_code == 404


def test_delete_nonexistent_job(client):
    """DELETE /api/jobs/{id} for non-existent job returns 404."""
    resp = client.delete("/api/jobs/nonexistent-id")
    assert resp.status_code == 404
