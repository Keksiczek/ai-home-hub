"""Tests for agent pause/resume functionality."""

import pytest
from app.services.resident_agent import get_resident_agent


@pytest.fixture(autouse=True)
def reset_agent_pause():
    """Ensure agent is not paused before each test."""
    agent = get_resident_agent()
    agent._paused = False
    yield
    agent._paused = False


@pytest.mark.asyncio
async def test_pause_agent():
    """Pausing sets agent to paused state."""
    agent = get_resident_agent()
    result = await agent.pause()
    assert result["status"] == "paused"
    assert agent.paused is True
    assert agent._state.status == "paused"


@pytest.mark.asyncio
async def test_pause_already_paused():
    """Pausing an already paused agent returns already_paused."""
    agent = get_resident_agent()
    await agent.pause()
    result = await agent.pause()
    assert result["status"] == "already_paused"


@pytest.mark.asyncio
async def test_resume_agent():
    """Resuming a paused agent sets it back to idle."""
    agent = get_resident_agent()
    await agent.pause()
    result = await agent.resume()
    assert result["status"] == "resumed"
    assert agent.paused is False


@pytest.mark.asyncio
async def test_resume_not_paused():
    """Resuming when not paused returns not_paused."""
    agent = get_resident_agent()
    result = await agent.resume()
    assert result["status"] == "not_paused"


def test_pause_endpoint(client):
    """POST /api/resident/pause returns pause status."""
    res = client.post("/api/resident/pause")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ("paused", "already_paused")


def test_resume_endpoint(client):
    """POST /api/resident/resume returns resume status."""
    res = client.post("/api/resident/resume")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ("resumed", "not_paused")


def test_agent_pause_alias_endpoint(client):
    """POST /api/agent/pause works."""
    res = client.post("/api/agent/pause")
    assert res.status_code == 200
