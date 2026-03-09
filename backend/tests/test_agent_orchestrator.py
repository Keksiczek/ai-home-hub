"""Tests for AgentOrchestrator sub-agent depth, KB search filtering, and artifact preview."""
import json
from unittest.mock import MagicMock, patch

import pytest

from app.services.agent_orchestrator import AgentOrchestrator, ARTIFACTS_DIR
from app.utils.constants import MAX_SUB_AGENT_DEPTH, MIN_KB_SEARCH_SCORE


# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest.fixture
def orchestrator(tmp_path, monkeypatch):
    """Fresh AgentOrchestrator with mocked settings and a temp artifacts dir."""
    monkeypatch.setattr(
        "app.services.agent_orchestrator.ARTIFACTS_DIR", tmp_path
    )
    # Minimal settings: allow up to 10 concurrent agents, 1-minute timeout.
    settings_mock = MagicMock()
    settings_mock.load.return_value = {
        "agents": {"max_concurrent": 10, "timeout_minutes": 1}
    }
    with patch("app.services.agent_orchestrator.get_settings_service", return_value=settings_mock):
        orch = AgentOrchestrator()
        # Point artifacts directory at tmp_path
        orch_artifacts_dir = tmp_path
        orch_artifacts_dir.mkdir(parents=True, exist_ok=True)
        yield orch


# ── Tests ─────────────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_spawn_sub_agent_increments_depth(orchestrator):
    """Sub-agent must have depth=1 and parent_agent_id set to the parent's id."""
    parent_id = await orchestrator.spawn_agent("general", {"goal": "parent task"})
    parent = orchestrator._agents[parent_id]
    assert parent.depth == 0

    child_id = await orchestrator.spawn_sub_agent(parent_id, {"goal": "child task"})

    assert child_id is not None
    child = orchestrator._agents[child_id]
    assert child.depth == 1
    assert child.parent_agent_id == parent_id


@pytest.mark.asyncio
async def test_spawn_sub_agent_respects_max_depth(orchestrator):
    """spawn_sub_agent returns None when the parent is already at MAX_SUB_AGENT_DEPTH."""
    # Manually create an agent at the maximum depth.
    parent_id = await orchestrator.spawn_agent("general", {"goal": "deep agent"})
    parent = orchestrator._agents[parent_id]
    parent.depth = MAX_SUB_AGENT_DEPTH  # simulate already being at the limit

    result = await orchestrator.spawn_sub_agent(parent_id, {"goal": "too deep"})

    assert result is None


def test_search_knowledge_base_filters_low_scores(orchestrator, monkeypatch):
    """Results with score < MIN_KB_SEARCH_SCORE must be excluded from the output."""
    # Build a mock vector store whose search returns three hits:
    # distances are converted to scores as (1 - distance).
    high_score_distance = 1 - (MIN_KB_SEARCH_SCORE + 0.1)   # score above threshold
    low_score_distance = 1 - (MIN_KB_SEARCH_SCORE - 0.05)   # score below threshold
    exact_distance = 1 - MIN_KB_SEARCH_SCORE                 # score exactly at threshold (included)

    mock_vs = MagicMock()
    mock_vs.search.return_value = {
        "documents": ["good chunk", "bad chunk", "exact chunk"],
        "metadatas": [
            {"file_name": "good.txt", "file_path": "/good.txt"},
            {"file_name": "bad.txt", "file_path": "/bad.txt"},
            {"file_name": "exact.txt", "file_path": "/exact.txt"},
        ],
        "distances": [high_score_distance, low_score_distance, exact_distance],
    }

    monkeypatch.setattr(
        "app.services.vector_store_service.get_vector_store_service", lambda: mock_vs
    )

    results = orchestrator.search_knowledge_base([0.1, 0.2, 0.3], top_k=3)

    file_names = [r["file_name"] for r in results]
    assert "good.txt" in file_names
    assert "exact.txt" in file_names
    assert "bad.txt" not in file_names


@pytest.mark.asyncio
async def test_get_agent_artifacts_with_preview_returns_preview_data(orchestrator, tmp_path):
    """get_agent_artifacts_with_preview enriches each artifact with a preview field."""
    # Create an agent and manually register a "report" artifact on disk.
    agent_id = await orchestrator.spawn_agent("research", {"goal": "write report"})
    record = orchestrator._agents[agent_id]

    long_content = "X" * 800  # longer than the 500-char preview limit
    artifact_id = await orchestrator.generate_artifact(agent_id, "report", long_content)
    record.artifacts.append(artifact_id)

    # Write the artifact JSON to tmp_path (where ARTIFACTS_DIR is monkeypatched).
    artifact_data = {
        "artifact_id": artifact_id,
        "agent_id": agent_id,
        "artifact_type": "report",
        "content": long_content,
        "created_at": "2024-01-01T00:00:00+00:00",
    }
    artifact_path = tmp_path / f"{artifact_id}.json"
    artifact_path.write_text(json.dumps(artifact_data))

    arts = orchestrator.get_agent_artifacts_with_preview(agent_id)

    assert len(arts) >= 1
    report_art = next(a for a in arts if a["artifact_type"] == "report")
    assert "preview" in report_art
    assert len(report_art["preview"]) == 500
    assert report_art["preview"] == long_content[:500]
