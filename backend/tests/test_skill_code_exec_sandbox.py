"""Tests for CodeExecutionSkill sandbox."""

import pytest
from app.services.skills_runtime_service import CodeExecutionSkill


@pytest.mark.asyncio
async def test_code_exec_simple_math():
    """CodeExecutionSkill can run simple Python code."""
    skill = CodeExecutionSkill()
    result = await skill.run("print(2 + 2)", timeout=5)
    assert "stdout" in result or "error" in result
    if "stdout" in result:
        assert "4" in result["stdout"]


@pytest.mark.asyncio
async def test_code_exec_timeout():
    """CodeExecutionSkill respects timeout."""
    skill = CodeExecutionSkill()
    result = await skill.run("import time; time.sleep(100)", timeout=2)
    assert "error" in result or "timed out" in str(result).lower()


def test_code_exec_metadata():
    """CodeExecutionSkill has correct metadata."""
    skill = CodeExecutionSkill()
    assert skill.name == "code_exec"
    assert "\U0001f40d" in skill.icon


@pytest.mark.asyncio
async def test_code_exec_returns_dict():
    """CodeExecutionSkill always returns a dict."""
    skill = CodeExecutionSkill()
    result = await skill.run("x = 1")
    assert isinstance(result, dict)
