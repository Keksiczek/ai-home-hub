"""Tests for agent run-now functionality."""
import pytest
from app.services.resident_agent import get_resident_agent


@pytest.mark.asyncio
async def test_run_now_not_running():
    """run_now when agent is not running returns error."""
    agent = get_resident_agent()
    agent._state.is_running = False
    result = await agent.run_now()
    assert result["status"] == "not_running"


def test_run_now_endpoint_not_running(client):
    """POST /api/resident/run-now when agent not running."""
    res = client.post("/api/resident/run-now")
    assert res.status_code == 200
    data = res.json()
    # Agent is not running in test env, so it should return not_running
    assert data["status"] == "not_running"


def test_agent_run_now_alias_endpoint(client):
    """POST /api/agent/run-now alias works."""
    res = client.post("/api/agent/run-now")
    assert res.status_code == 200
