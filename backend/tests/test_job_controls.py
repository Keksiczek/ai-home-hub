"""Tests for job controls: pause, resume, cancel, retry."""
import pytest


def test_pause_running_job(client):
    """POST /api/jobs/{id}/pause pauses a running job."""
    # Create a job
    res = client.post("/api/jobs", json={
        "type": "test_job",
        "title": "Test pause job",
        "priority": "normal",
    })
    assert res.status_code == 200
    job_id = res.json()["id"]

    # Manually set it to running (via direct service manipulation)
    from app.services.job_service import get_job_service
    svc = get_job_service()
    job = svc.get_job(job_id)
    job.status = "running"
    svc.update_job(job)

    # Pause it
    res = client.post(f"/api/jobs/{job_id}/pause")
    assert res.status_code == 200
    assert res.json()["status"] == "paused"

    # Verify it's paused
    res = client.get(f"/api/jobs/{job_id}")
    assert res.json()["status"] == "paused"


def test_pause_non_running_job_fails(client):
    """POST /api/jobs/{id}/pause on queued job returns 400."""
    res = client.post("/api/jobs", json={
        "type": "test_job",
        "title": "Test queued job",
    })
    job_id = res.json()["id"]

    res = client.post(f"/api/jobs/{job_id}/pause")
    assert res.status_code == 400


def test_resume_paused_job(client):
    """POST /api/jobs/{id}/resume resumes a paused job."""
    # Create and pause a job
    res = client.post("/api/jobs", json={
        "type": "test_job",
        "title": "Test resume job",
    })
    job_id = res.json()["id"]

    from app.services.job_service import get_job_service
    svc = get_job_service()
    job = svc.get_job(job_id)
    job.status = "paused"
    svc.update_job(job)

    # Resume it
    res = client.post(f"/api/jobs/{job_id}/resume")
    assert res.status_code == 200
    assert res.json()["status"] == "queued"


def test_resume_non_paused_job_fails(client):
    """POST /api/jobs/{id}/resume on running job returns 400."""
    res = client.post("/api/jobs", json={
        "type": "test_job",
        "title": "Test running job",
    })
    job_id = res.json()["id"]

    from app.services.job_service import get_job_service
    svc = get_job_service()
    job = svc.get_job(job_id)
    job.status = "running"
    svc.update_job(job)

    res = client.post(f"/api/jobs/{job_id}/resume")
    assert res.status_code == 400


def test_cancel_paused_job(client):
    """POST /api/jobs/{id}/cancel on paused job works."""
    res = client.post("/api/jobs", json={
        "type": "test_job",
        "title": "Test cancel paused",
    })
    job_id = res.json()["id"]

    from app.services.job_service import get_job_service
    svc = get_job_service()
    job = svc.get_job(job_id)
    job.status = "paused"
    svc.update_job(job)

    res = client.post(f"/api/jobs/{job_id}/cancel")
    assert res.status_code == 200
    assert res.json()["status"] == "cancelled"


def test_pause_nonexistent_job(client):
    """POST /api/jobs/{id}/pause on nonexistent job returns 404."""
    res = client.post("/api/jobs/nonexistent-id/pause")
    assert res.status_code == 404


def test_resume_nonexistent_job(client):
    """POST /api/jobs/{id}/resume on nonexistent job returns 404."""
    res = client.post("/api/jobs/nonexistent-id/resume")
    assert res.status_code == 404
