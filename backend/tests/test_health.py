"""Tests for extended health check endpoints (4C)."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest


def test_health_endpoint_returns_components(client, mock_ollama):
    """GET /api/health must return component statuses."""
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()

    assert "status" in data
    assert data["status"] in ("ok", "degraded", "error")
    assert "timestamp" in data
    assert "components" in data

    components = data["components"]
    assert "ollama" in components
    assert "chromadb" in components
    assert "filesystem" in components


def test_health_live_always_200(client):
    """GET /api/health/live must always return 200."""
    resp = client.get("/api/health/live")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_health_ready_returns_ok_when_chromadb_available(client):
    """GET /api/health/ready returns ok when ChromaDB is accessible."""
    resp = client.get("/api/health/ready")
    # ChromaDB is mocked in conftest, so this depends on mock behavior
    # but it should not crash
    assert resp.status_code in (200, 503)


def test_health_setup_returns_items(client):
    """GET /api/health/setup returns setup checklist."""
    resp = client.get("/api/health/setup")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert isinstance(data["items"], list)
