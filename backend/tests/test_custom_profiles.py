"""Tests for custom profiles CRUD and profile switching."""

from unittest.mock import patch

import pytest


def test_list_profiles(client):
    """GET /api/profiles returns the default custom profiles."""
    res = client.get("/api/profiles")
    assert res.status_code == 200
    data = res.json()
    assert "profiles" in data
    assert "lean_ci" in data["profiles"]
    assert "pbi_dax" in data["profiles"]
    assert "mac_admin" in data["profiles"]
    assert "ai_dev" in data["profiles"]
    assert data["count"] >= 4


def test_get_single_profile(client):
    """GET /api/profiles/{id} returns profile details."""
    res = client.get("/api/profiles/lean_ci")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == "lean_ci"
    assert data["name"] == "Lean/CI Expert"
    assert data["temperature"] == 0.3


def test_get_nonexistent_profile(client):
    """GET /api/profiles/{id} returns 404 for unknown profile."""
    res = client.get("/api/profiles/nonexistent_xyz")
    assert res.status_code == 404


def test_create_custom_profile(client):
    """POST /api/profiles/{id} creates a new custom profile."""
    res = client.post(
        "/api/profiles/test_profile",
        json={
            "name": "Test Profile",
            "icon": "T",
            "prompt": "Test system prompt for testing purposes.",
            "tools": ["kb_search"],
            "temperature": 0.5,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == "test_profile"
    assert data["name"] == "Test Profile"
    assert data["temperature"] == 0.5

    # Verify it appears in list
    res2 = client.get("/api/profiles")
    assert "test_profile" in res2.json()["profiles"]


def test_delete_custom_profile(client):
    """DELETE /api/profiles/{id} removes a profile."""
    # Create first
    client.post(
        "/api/profiles/to_delete",
        json={
            "name": "To Delete",
            "prompt": "Will be deleted.",
        },
    )
    # Delete
    res = client.delete("/api/profiles/to_delete")
    assert res.status_code == 200
    assert res.json()["deleted"] is True

    # Verify gone
    res2 = client.get("/api/profiles/to_delete")
    assert res2.status_code == 404


def test_delete_nonexistent_profile(client):
    """DELETE /api/profiles/{id} returns 404 for unknown profile."""
    res = client.delete("/api/profiles/nonexistent_xyz")
    assert res.status_code == 404


def test_profile_switching_persists_settings(client):
    """Custom profiles are stored in settings and persist across loads."""
    from app.services.settings_service import get_settings_service

    svc = get_settings_service()
    profiles = svc.get_custom_profiles()
    assert "lean_ci" in profiles
    assert profiles["lean_ci"]["name"] == "Lean/CI Expert"

    # Verify system prompts exist for custom profiles
    settings = svc.load()
    prompts = settings.get("system_prompts", {})
    assert "lean_ci" in prompts
    assert "pbi_dax" in prompts
    assert "mac_admin" in prompts
    assert "ai_dev" in prompts
