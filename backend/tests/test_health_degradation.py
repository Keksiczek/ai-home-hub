"""Tests for health endpoint degradation reasons."""

import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ── Compatibility: mock chromadb before importing app ──────────────────────
_chroma_mock = MagicMock()
for _mod_name in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod_name, _chroma_mock)

from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    with patch(
        "app.services.startup_checks.run_startup_checks",
        new_callable=AsyncMock,
        return_value={"ollama": "ok (mocked)"},
    ):
        with TestClient(app) as c:
            yield c


def test_health_returns_status(client):
    """Health endpoint should return a status field."""
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert "status" in data
    assert data["status"] in ("healthy", "degraded", "limited", "unavailable")


def test_health_has_components(client):
    """Health endpoint should include component details."""
    resp = client.get("/api/health")
    data = resp.json()
    assert "components" in data
    components = data["components"]
    # Should have at least ollama and embeddings
    assert "ollama" in components
    assert "embeddings" in components


def test_health_has_degradation_reasons(client):
    """Health endpoint should include degradation_reasons list."""
    resp = client.get("/api/health")
    data = resp.json()
    assert "degradation_reasons" in data
    assert isinstance(data["degradation_reasons"], list)


def test_health_has_resource_policy(client):
    """Health endpoint should include resource_policy component."""
    resp = client.get("/api/health")
    data = resp.json()
    components = data.get("components", {})
    assert "resource_policy" in components
    rp = components["resource_policy"]
    assert "tier" in rp
    assert rp["tier"] in ("normal", "elevated", "high", "critical")


def test_health_live(client):
    """Liveness probe should always return ok."""
    resp = client.get("/api/health/live")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
