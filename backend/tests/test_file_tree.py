"""Tests for file tree navigation and file manager endpoints."""

import json
import os
import tempfile
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest


def test_file_tree_no_path(client):
    """GET /api/files/tree without path returns 422."""
    res = client.get("/api/files/tree")
    assert res.status_code == 422


def test_file_tree_forbidden_path(client):
    """GET /api/files/tree with disallowed path returns 403."""
    res = client.get("/api/files/tree?path=/etc/shadow")
    assert res.status_code == 403


def test_file_preview_no_path(client):
    """GET /api/files/preview without path returns 422."""
    res = client.get("/api/files/preview")
    assert res.status_code == 422


def test_file_preview_forbidden_path(client):
    """GET /api/files/preview with disallowed path returns 403."""
    res = client.get("/api/files/preview?path=/etc/passwd")
    assert res.status_code == 403


def test_upload_to_kb_forbidden(client):
    """POST /api/files/upload-to-kb with disallowed path returns 403."""
    res = client.post("/api/files/upload-to-kb?path=/etc/hosts")
    assert res.status_code == 403


def test_file_action_delete_forbidden(client):
    """POST /api/files/action with disallowed path returns 403."""
    res = client.post("/api/files/action?type=delete&path=/etc/hosts")
    assert res.status_code == 403


def test_file_action_unknown_type(client):
    """POST /api/files/action with unknown type returns 400."""
    mock_svc = MagicMock()
    mock_svc._assert_allowed.return_value = Path("/tmp/testfile")

    with patch(
        "app.services.filesystem_service.get_filesystem_service", return_value=mock_svc
    ):
        res = client.post("/api/files/action?type=unknown_action&path=/tmp/testfile")
        assert res.status_code == 400
        assert "Unknown action" in res.json()["detail"]


def test_file_tree_with_allowed_dir(client):
    """GET /api/files/tree with allowed path returns tree structure."""
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create some test files
        Path(tmpdir, "test.txt").write_text("hello")
        Path(tmpdir, "subdir").mkdir()
        Path(tmpdir, "subdir", "nested.py").write_text("# python")

        mock_svc = MagicMock()
        mock_svc._assert_allowed.return_value = Path(tmpdir)

        with patch(
            "app.services.filesystem_service.get_filesystem_service",
            return_value=mock_svc,
        ):
            res = client.get(f"/api/files/tree?path={tmpdir}")
            assert res.status_code == 200
            data = res.json()
            assert "entries" in data
            assert data["count"] > 0
            names = [e["name"] for e in data["entries"]]
            assert "test.txt" in names
            assert "subdir" in names


def test_file_preview_text(client):
    """GET /api/files/preview returns text content for text files."""
    with tempfile.NamedTemporaryFile(suffix=".txt", mode="w", delete=False) as f:
        f.write("Hello World content")
        f.flush()
        fpath = f.name

    try:
        mock_svc = MagicMock()
        mock_svc._assert_allowed.return_value = Path(fpath)

        with patch(
            "app.services.filesystem_service.get_filesystem_service",
            return_value=mock_svc,
        ):
            res = client.get(f"/api/files/preview?path={fpath}")
            assert res.status_code == 200
            data = res.json()
            assert data["type"] == "text"
            assert "Hello World" in data["content"]
    finally:
        os.unlink(fpath)
