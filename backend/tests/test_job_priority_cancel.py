"""Tests for job priority update and cancel endpoints."""
import pytest


def test_set_job_priority_high(client):
    """POST /api/jobs/{id}/priority sets priority to high."""
    res = client.post("/api/jobs", json={
        "type": "test_job",
        "title": "Priority test job",
    })
    assert res.status_code == 200
    job_id = res.json()["id"]

    res = client.post(f"/api/jobs/{job_id}/priority", json={"priority": "high"})
    assert res.status_code == 200
    assert res.json()["priority"] == "high"

    # Verify persisted
    res = client.get(f"/api/jobs/{job_id}")
    assert res.json()["priority"] == "high"


def test_set_job_priority_low(client):
    """POST /api/jobs/{id}/priority sets priority to low."""
    res = client.post("/api/jobs", json={
        "type": "test_job",
        "title": "Low priority job",
    })
    job_id = res.json()["id"]

    res = client.post(f"/api/jobs/{job_id}/priority", json={"priority": "low"})
    assert res.status_code == 200
    assert res.json()["priority"] == "low"


def test_set_invalid_priority(client):
    """POST /api/jobs/{id}/priority with invalid value returns 400."""
    res = client.post("/api/jobs", json={
        "type": "test_job",
        "title": "Invalid priority job",
    })
    job_id = res.json()["id"]

    res = client.post(f"/api/jobs/{job_id}/priority", json={"priority": "ultra"})
    assert res.status_code == 400


def test_set_priority_nonexistent_job(client):
    """POST /api/jobs/{id}/priority for missing job returns 404."""
    res = client.post("/api/jobs/nonexistent-id/priority", json={"priority": "high"})
    assert res.status_code == 404


def test_cancel_queued_job(client):
    """POST /api/jobs/{id}/cancel cancels a queued job."""
    res = client.post("/api/jobs", json={
        "type": "test_job",
        "title": "Cancel test job",
    })
    job_id = res.json()["id"]

    res = client.post(f"/api/jobs/{job_id}/cancel")
    assert res.status_code == 200
    assert res.json()["status"] == "cancelled"


def test_delete_job(client):
    """DELETE /api/jobs/{id} removes the job."""
    res = client.post("/api/jobs", json={
        "type": "test_job",
        "title": "Delete test job",
    })
    job_id = res.json()["id"]

    res = client.delete(f"/api/jobs/{job_id}")
    assert res.status_code == 200
    assert res.json()["status"] == "deleted"

    # Verify gone
    res = client.get(f"/api/jobs/{job_id}")
    assert res.status_code == 404
