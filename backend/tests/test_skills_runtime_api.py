"""Tests for the skills runtime API endpoints."""

import pytest


def test_skills_catalog(client):
    """GET /api/skills-runtime/catalog returns all skills."""
    resp = client.get("/api/skills-runtime/catalog")
    assert resp.status_code == 200
    data = resp.json()
    assert "skills" in data
    assert data["count"] >= 11
    skill_names = [s["name"] for s in data["skills"]]
    assert "web_search" in skill_names
    assert "code_exec" in skill_names
    assert "weather" in skill_names
    assert "shell" in skill_names
    assert "calculator" in skill_names


def test_skills_enabled(client):
    """GET /api/skills-runtime/enabled returns enabled skills."""
    resp = client.get("/api/skills-runtime/enabled")
    assert resp.status_code == 200
    data = resp.json()
    assert "skills" in data
    assert data["count"] > 0


def test_execute_calculator(client):
    """POST /api/skills-runtime/execute calculator skill."""
    resp = client.post(
        "/api/skills-runtime/execute",
        json={
            "skill_name": "calculator",
            "method": "run",
            "params": {"expression": "2 + 2"},
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["skill"] == "calculator"
    assert data["result"]["result"] == 4


def test_execute_nonexistent_skill(client):
    """POST /api/skills-runtime/execute with bad skill returns 404."""
    resp = client.post(
        "/api/skills-runtime/execute",
        json={
            "skill_name": "nonexistent",
            "method": "run",
            "params": {},
        },
    )
    assert resp.status_code == 404


def test_execute_bad_method(client):
    """POST /api/skills-runtime/execute with bad method returns 400."""
    resp = client.post(
        "/api/skills-runtime/execute",
        json={
            "skill_name": "calculator",
            "method": "nonexistent_method",
            "params": {},
        },
    )
    assert resp.status_code == 400


def test_toggle_skills(client):
    """POST /api/skills-runtime/toggle updates enabled skills."""
    resp = client.post(
        "/api/skills-runtime/toggle",
        json={
            "enabled_skills": ["web_search", "calculator", "weather"],
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] == 3
    assert "web_search" in data["enabled_skills"]
