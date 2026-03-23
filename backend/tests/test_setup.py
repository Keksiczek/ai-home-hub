"""Tests for GET /api/setup/status and POST /api/setup/complete."""

import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# Ensure chromadb is mocked before app import (mirrors conftest shim)
_chroma_mock = MagicMock()
for _mod in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod, _chroma_mock)

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture
def client():
    """TestClient with startup checks bypassed (no Ollama required)."""
    with patch(
        "app.services.startup_checks.run_startup_checks",
        new=AsyncMock(return_value={"status": "ok"}),
    ):
        with TestClient(app) as c:
            yield c


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_status_payload(
    completed=False, ollama_ok=True, models_ok=True, chroma_ok=True, fs_ok=True
):
    return {
        "completed": completed,
        "first_run": not completed,
        "checks": {
            "ollama_running": {"ok": ollama_ok, "message": "Ollama odpovídá"},
            "required_models": {
                "ok": models_ok,
                "message": "Všechny modely jsou dostupné",
                "missing": [],
            },
            "chromadb_writable": {"ok": chroma_ok, "message": "ChromaDB je dostupná"},
            "filesystem_dirs": {"ok": fs_ok, "message": "Nakonfigurováno 1 adresářů"},
        },
    }


def _svc_mock(payload):
    return MagicMock(get_status=AsyncMock(return_value=payload))


# ---------------------------------------------------------------------------
# GET /api/setup/status
# ---------------------------------------------------------------------------


def test_setup_status_shape(client):
    """GET /api/setup/status returns required top-level keys."""
    with patch(
        "app.routers.setup.get_setup_service",
        return_value=_svc_mock(_make_status_payload()),
    ):
        resp = client.get("/api/setup/status")

    assert resp.status_code == 200
    data = resp.json()
    assert "completed" in data
    assert "first_run" in data
    assert "checks" in data


def test_setup_status_first_run_true_when_not_completed(client):
    """first_run is True when setup has not been completed."""
    with patch(
        "app.routers.setup.get_setup_service",
        return_value=_svc_mock(_make_status_payload(completed=False)),
    ):
        resp = client.get("/api/setup/status")

    data = resp.json()
    assert data["first_run"] is True
    assert data["completed"] is False


def test_setup_status_first_run_false_when_completed(client):
    """first_run is False once setup has been completed."""
    with patch(
        "app.routers.setup.get_setup_service",
        return_value=_svc_mock(_make_status_payload(completed=True)),
    ):
        resp = client.get("/api/setup/status")

    data = resp.json()
    assert data["first_run"] is False
    assert data["completed"] is True


def test_setup_status_checks_contain_all_keys(client):
    """checks object must contain the four expected keys."""
    with patch(
        "app.routers.setup.get_setup_service",
        return_value=_svc_mock(_make_status_payload()),
    ):
        resp = client.get("/api/setup/status")

    checks = resp.json()["checks"]
    for key in (
        "ollama_running",
        "required_models",
        "chromadb_writable",
        "filesystem_dirs",
    ):
        assert key in checks, f"Missing check key: {key}"
        assert "ok" in checks[key]
        assert "message" in checks[key]


def test_setup_status_degraded_environment(client):
    """Ollama down → ollama_running.ok is False."""
    payload = _make_status_payload(ollama_ok=False, models_ok=False)
    with patch("app.routers.setup.get_setup_service", return_value=_svc_mock(payload)):
        resp = client.get("/api/setup/status")

    data = resp.json()
    assert data["checks"]["ollama_running"]["ok"] is False
    assert data["checks"]["required_models"]["ok"] is False


# ---------------------------------------------------------------------------
# POST /api/setup/complete
# ---------------------------------------------------------------------------


def test_setup_complete_returns_200(client):
    """POST /api/setup/complete returns 200 with ok status."""
    mock_svc = MagicMock(complete_setup=AsyncMock(return_value=None))
    with patch("app.routers.setup.get_setup_service", return_value=mock_svc):
        resp = client.post("/api/setup/complete")

    assert resp.status_code == 200
    data = resp.json()
    assert data.get("ok") is True


def test_setup_complete_calls_service(client):
    """POST /api/setup/complete invokes complete_setup on the service."""
    mock_svc = MagicMock(complete_setup=AsyncMock(return_value=None))
    with patch("app.routers.setup.get_setup_service", return_value=mock_svc):
        client.post("/api/setup/complete")

    mock_svc.complete_setup.assert_awaited_once()
