"""Tests for file picker API – file tree, preview, and action endpoints."""

import pytest


def test_file_tree_requires_path(client):
    """GET /api/files/tree without path returns 422."""
    resp = client.get("/api/files/tree")
    assert resp.status_code == 422


def test_file_tree_forbidden_path(client):
    """GET /api/files/tree with path outside allowed dirs returns 403."""
    resp = client.get("/api/files/tree", params={"path": "/etc/passwd"})
    assert resp.status_code == 403


def test_file_preview_requires_path(client):
    """GET /api/files/preview without path returns 422."""
    resp = client.get("/api/files/preview")
    assert resp.status_code == 422


def test_file_action_unknown_type(client):
    """POST /api/files/action with unknown type returns 400."""
    resp = client.post(
        "/api/files/action", params={"type": "unknown", "path": "/tmp/test"}
    )
    assert resp.status_code in (400, 403)


def test_upload_file_endpoint_exists(client):
    """POST /api/upload endpoint exists and accepts multipart."""
    # Without a file, it should return 422
    resp = client.post("/api/upload")
    assert resp.status_code == 422
