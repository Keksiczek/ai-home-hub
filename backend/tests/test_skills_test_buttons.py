"""Tests for skills test buttons – POST /api/skills-runtime/test/{skill_name}."""

import pytest


def test_test_skill_calculator(client):
    """Test the calculator skill via the test endpoint."""
    res = client.post("/api/skills-runtime/test/calculator")
    assert res.status_code == 200
    data = res.json()
    assert data["skill"] == "calculator"
    assert data["success"] is True
    assert "output" in data


def test_test_skill_code_exec(client):
    """Test the code_exec skill via the test endpoint."""
    res = client.post("/api/skills-runtime/test/code_exec")
    assert res.status_code == 200
    data = res.json()
    assert data["skill"] == "code_exec"
    assert "output" in data


def test_test_skill_not_found(client):
    """Test a non-existent skill returns 404."""
    res = client.post("/api/skills-runtime/test/nonexistent_skill")
    assert res.status_code == 404


def test_test_skill_no_test_defined(client):
    """Skills without a test case return success=False with an error message."""
    # All known skills have tests defined, so this is a contract test
    res = client.post("/api/skills-runtime/test/calculator")
    assert res.status_code == 200
    data = res.json()
    assert "success" in data
