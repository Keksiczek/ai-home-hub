"""Tests for structured logging middleware (4B)."""

import pytest


def test_request_id_header_present(client):
    """Every response must contain X-Request-ID header."""
    resp = client.get("/api/health/live")
    assert resp.status_code == 200
    assert "X-Request-ID" in resp.headers
    rid = resp.headers["X-Request-ID"]
    assert len(rid) == 8


def test_request_id_unique_per_request(client):
    """Each request gets a different request_id."""
    r1 = client.get("/api/health/live")
    r2 = client.get("/api/health/live")
    assert r1.headers["X-Request-ID"] != r2.headers["X-Request-ID"]


def test_request_id_on_post(client, mock_ollama):
    """POST endpoints also get X-Request-ID."""
    resp = client.post("/api/chat", json={"message": "test"})
    assert "X-Request-ID" in resp.headers
