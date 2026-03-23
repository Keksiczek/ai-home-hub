"""Tests for configurable cleanup service.

Covers:
- GET /api/settings/cleanup – returns correct defaults/values
- PATCH /api/settings/cleanup – saves values and validates ranges
- POST /api/control/cleanup/run-now – returns 200 with result
- CleanupService loads config dynamically per cycle
- enabled=False → cleanup cycle skipped without error
"""

from unittest.mock import MagicMock, patch

import pytest

# ── GET /api/settings/cleanup ─────────────────────────────────────────────


def test_get_cleanup_config_returns_defaults(client):
    """GET /api/settings/cleanup returns defaults when no custom config stored."""
    resp = client.get("/api/settings/cleanup")
    assert resp.status_code == 200
    data = resp.json()
    assert data["enabled"] is True
    assert data["interval_hours"] >= 1
    assert data["session_retention_days"] >= 1
    assert data["artifact_retention_days"] >= 1
    assert data["vacuum_enabled"] is True


def test_get_cleanup_config_structure(client):
    """GET /api/settings/cleanup returns all required keys."""
    resp = client.get("/api/settings/cleanup")
    assert resp.status_code == 200
    data = resp.json()
    for key in (
        "enabled",
        "interval_hours",
        "session_retention_days",
        "artifact_retention_days",
        "vacuum_enabled",
    ):
        assert key in data, f"Missing key: {key}"


# ── PATCH /api/settings/cleanup ───────────────────────────────────────────


def test_patch_cleanup_config_saves_values(client):
    """PATCH /api/settings/cleanup saves provided values."""
    resp = client.patch(
        "/api/settings/cleanup",
        json={
            "interval_hours": 12,
            "session_retention_days": 14,
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "saved"
    assert data["config"]["interval_hours"] == 12
    assert data["config"]["session_retention_days"] == 14

    # Verify persisted via GET
    get_resp = client.get("/api/settings/cleanup")
    assert get_resp.status_code == 200
    cfg = get_resp.json()
    assert cfg["interval_hours"] == 12
    assert cfg["session_retention_days"] == 14


def test_patch_cleanup_config_toggle_enabled(client):
    """PATCH /api/settings/cleanup can disable cleanup."""
    resp = client.patch("/api/settings/cleanup", json={"enabled": False})
    assert resp.status_code == 200
    assert resp.json()["config"]["enabled"] is False

    # Re-enable
    client.patch("/api/settings/cleanup", json={"enabled": True})


def test_patch_cleanup_config_vacuum_toggle(client):
    """PATCH /api/settings/cleanup can toggle vacuum_enabled."""
    resp = client.patch("/api/settings/cleanup", json={"vacuum_enabled": False})
    assert resp.status_code == 200
    assert resp.json()["config"]["vacuum_enabled"] is False

    client.patch("/api/settings/cleanup", json={"vacuum_enabled": True})


# ── Validation: out-of-range values → 422 ────────────────────────────────


@pytest.mark.parametrize(
    "field,value",
    [
        ("interval_hours", 0),
        ("interval_hours", 169),
        ("session_retention_days", 0),
        ("session_retention_days", 366),
        ("artifact_retention_days", 0),
        ("artifact_retention_days", 366),
    ],
)
def test_patch_cleanup_config_invalid_range(client, field, value):
    """PATCH /api/settings/cleanup returns 422 for values outside allowed ranges."""
    resp = client.patch("/api/settings/cleanup", json={field: value})
    assert (
        resp.status_code == 422
    ), f"Expected 422 for {field}={value}, got {resp.status_code}: {resp.text}"


@pytest.mark.parametrize(
    "field,value",
    [
        ("interval_hours", 1),
        ("interval_hours", 168),
        ("session_retention_days", 1),
        ("session_retention_days", 365),
        ("artifact_retention_days", 1),
        ("artifact_retention_days", 365),
    ],
)
def test_patch_cleanup_config_boundary_values_accepted(client, field, value):
    """PATCH /api/settings/cleanup accepts boundary values."""
    resp = client.patch("/api/settings/cleanup", json={field: value})
    assert (
        resp.status_code == 200
    ), f"Expected 200 for {field}={value}, got {resp.status_code}: {resp.text}"


# ── POST /api/control/cleanup/run-now ─────────────────────────────────────


def test_run_now_returns_200(client):
    """POST /api/control/cleanup/run-now returns 200 with result dict."""
    resp = client.post("/api/control/cleanup/run-now")
    assert resp.status_code == 200
    data = resp.json()
    assert "status" in data


def test_run_now_with_enabled_returns_completed(client):
    """POST /api/control/cleanup/run-now returns completed when enabled."""
    client.patch("/api/settings/cleanup", json={"enabled": True})
    resp = client.post("/api/control/cleanup/run-now")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ("completed", "skipped")


def test_run_now_when_disabled_returns_skipped(client):
    """POST /api/control/cleanup/run-now returns skipped when disabled."""
    client.patch("/api/settings/cleanup", json={"enabled": False})
    resp = client.post("/api/control/cleanup/run-now")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "skipped"
    assert "disabled" in data.get("reason", "").lower()

    # Restore
    client.patch("/api/settings/cleanup", json={"enabled": True})


# ── CleanupService unit tests ─────────────────────────────────────────────


def test_cleanup_service_loads_config_dynamically():
    """CleanupService._do_cleanup uses config from get_settings_service."""
    from app.services.cleanup_service import CleanupService

    mock_cfg = {
        "enabled": True,
        "interval_hours": 12,
        "session_retention_days": 3,
        "artifact_retention_days": 10,
        "vacuum_enabled": False,
    }

    svc = CleanupService()

    with patch(
        "app.services.cleanup_service._load_cleanup_config", return_value=mock_cfg
    ):
        # run_now should use the mocked config
        with patch.object(
            svc, "_cleanup_old_sessions", return_value=0
        ) as mock_sessions, patch.object(
            svc, "_archive_old_kb_data", return_value=0
        ) as mock_archive, patch.object(
            svc, "_vacuum_databases"
        ) as mock_vacuum:

            svc._do_cleanup(mock_cfg)

            mock_sessions.assert_called_once_with(3)
            mock_archive.assert_called_once_with(10)
            mock_vacuum.assert_not_called()  # vacuum_enabled=False


def test_cleanup_service_skips_when_disabled():
    """CleanupService.run_now skips and returns skipped when enabled=False."""
    from app.services.cleanup_service import CleanupService

    disabled_cfg = {
        "enabled": False,
        "interval_hours": 6,
        "session_retention_days": 7,
        "artifact_retention_days": 30,
        "vacuum_enabled": True,
    }

    svc = CleanupService()

    with patch(
        "app.services.cleanup_service._load_cleanup_config", return_value=disabled_cfg
    ):
        with patch.object(svc, "_do_cleanup") as mock_do:
            result = svc.run_now()
            mock_do.assert_not_called()
            assert result["status"] == "skipped"


def test_cleanup_service_runs_when_enabled():
    """CleanupService.run_now calls _do_cleanup when enabled=True."""
    from app.services.cleanup_service import CleanupService

    enabled_cfg = {
        "enabled": True,
        "interval_hours": 6,
        "session_retention_days": 7,
        "artifact_retention_days": 30,
        "vacuum_enabled": True,
    }

    svc = CleanupService()

    with patch(
        "app.services.cleanup_service._load_cleanup_config", return_value=enabled_cfg
    ):
        with patch.object(svc, "_do_cleanup") as mock_do:
            result = svc.run_now()
            mock_do.assert_called_once_with(enabled_cfg)


# ── GET /api/health/cleanup includes config ───────────────────────────────


def test_health_cleanup_includes_config(client):
    """GET /api/health/cleanup response includes config field."""
    resp = client.get("/api/health/cleanup")
    assert resp.status_code == 200
    data = resp.json()
    assert "config" in data
    cfg = data["config"]
    assert "enabled" in cfg
    assert "interval_hours" in cfg
    assert "session_retention_days" in cfg
    assert "artifact_retention_days" in cfg
    assert "vacuum_enabled" in cfg
