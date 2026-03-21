"""Tests for Control Room independent endpoints (Prompt 3)."""


def test_templates_endpoint_returns_3_templates(client):
    """GET /api/resident/templates returns exactly 3 templates."""
    res = client.get("/api/resident/templates")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 3
    ids = {t["id"] for t in data}
    assert ids == {"daily_recap", "stack_health", "lean_assist"}
    for t in data:
        assert "title" in t
        assert "desc" in t


def test_run_template_queues_valid_resident_task(client):
    """POST /api/resident/run-template/<id> queues a resident task."""
    for template_id in ("daily_recap", "stack_health", "lean_assist"):
        res = client.post(f"/api/resident/run-template/{template_id}", json={})
        assert res.status_code == 200, f"Template {template_id} failed: {res.text}"
        data = res.json()
        assert data["status"] == "queued"
        assert data["template_id"] == template_id
        assert "job_id" in data


def test_run_template_unknown_id_returns_404(client):
    """POST /api/resident/run-template/unknown returns 404."""
    res = client.post("/api/resident/run-template/nonexistent", json={})
    assert res.status_code == 404


def test_export_debug_has_all_sections(client):
    """POST /api/resident/export-debug returns snapshot with all required keys."""
    res = client.post("/api/resident/export-debug")
    assert res.status_code == 200
    data = res.json()
    assert "timestamp" in data
    assert "resident_state" in data
    assert "recent_jobs" in data
    assert "logs" in data
    assert "config_summary" in data
    cfg = data["config_summary"]
    assert "resident_interval" in cfg
    assert "resident_mode" in cfg


def test_disk_usage_endpoint(client):
    """GET /api/system/disk returns disk usage dict."""
    res = client.get("/api/system/disk")
    assert res.status_code == 200
    data = res.json()
    assert "kb_dir_mb" in data
    assert "jobs_dir_mb" in data
    # Values are floats or -1 (dir not found)
    assert isinstance(data["kb_dir_mb"], (int, float))
    assert isinstance(data["jobs_dir_mb"], (int, float))


def test_metrics_summary_stub(client):
    """GET /api/metrics/summary returns stub metrics with expected keys."""
    res = client.get("/api/metrics/summary")
    assert res.status_code == 200
    data = res.json()
    assert "cycles_24h" in data
    assert "jobs_success_rate" in data
    assert "ollama_status" in data
    # ollama_status is a stub – always "unknown"
    assert data["ollama_status"] == "unknown"
    assert 0.0 <= data["jobs_success_rate"] <= 1.0
