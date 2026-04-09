"""Tests for refined curiosity backlog: dedup, WIP limit, resolution, safety, API."""

import asyncio
import json
import shutil
import tempfile
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

import time

from app.models.resident_models import CuriosityItem


def _init_agent_budget(core: "ResidentAgent") -> None:  # type: ignore[name-defined]
    """Initialise budget/rate-limit attrs that __new__ skips."""
    core._llm_calls_this_hour = 0
    core._llm_calls_reset_at = time.monotonic() + 3600
    core._llm_last_fail_at = 0.0
    core._missions_today = 0
    core._missions_reset_date = ""
    core._analysis_jobs_this_hour = 0
    core._analysis_jobs_reset_at = time.monotonic() + 3600
    core._daily_action_counts = {}
    core._daily_action_reset_date = ""


# ── Helper: isolated CuriosityService with temp dir ──────────────────


@pytest.fixture
def curiosity_svc(tmp_path):
    """CuriosityService that writes to a temp directory."""
    with patch("app.services.resident_curiosity.CURIOSITY_DIR", tmp_path):
        from app.services.resident_curiosity import CuriosityService

        svc = CuriosityService()
        yield svc


# ═══════════════════════════════════════════════════════════════
# KROK 1 – Dedup & Priority
# ═══════════════════════════════════════════════════════════════


class TestDedupAndPriority:
    """Dedup key prevents duplicate items; priority escalates on repeated events."""

    def test_five_failures_produce_one_item(self, curiosity_svc):
        """Simulating 5 failures of the same job type yields 1 curiosity item."""
        for i in range(5):
            curiosity_svc.hook_job_failure(
                job_id=f"job-{i}", job_type="resident_task", error="timeout"
            )

        items = curiosity_svc.list_items(limit=200)
        # Should have exactly 1 item (deduped)
        assert len(items) == 1
        item = items[0]
        assert item.priority == "high"
        assert item.source == "job_failure"
        assert item.kind == "anomaly"
        # All job IDs tracked
        assert len(item.related_job_ids) == 5

    def test_dedup_key_blocks_duplicate_creation(self, curiosity_svc):
        """Same dedup_key with open status should not create a new item."""
        key = "test:anomaly:foo"
        item1 = curiosity_svc.create_item(
            title="First", kind="anomaly", source="test", dedup_key=key
        )
        item2 = curiosity_svc.create_item(
            title="Second", kind="anomaly", source="test", dedup_key=key
        )
        # Should return the same item (updated, not new)
        assert item1.id == item2.id
        assert len(curiosity_svc.list_items(limit=200)) == 1

    def test_dedup_escalates_priority(self, curiosity_svc):
        """If existing item is medium and new event is high, escalate."""
        key = "test:hypothesis:bar"
        item = curiosity_svc.create_item(
            title="Check it",
            kind="hypothesis",
            source="test",
            dedup_key=key,
            priority="medium",
        )
        assert item.priority == "medium"

        updated = curiosity_svc.create_item(
            title="Check it again",
            kind="hypothesis",
            source="test",
            dedup_key=key,
            priority="high",
        )
        assert updated.priority == "high"
        assert updated.id == item.id

    def test_low_priority_clamped_to_medium(self, curiosity_svc):
        """Priority 'low' should be clamped to 'medium'."""
        item = curiosity_svc.create_item(
            title="Low prio test",
            priority="low",
        )
        assert item.priority == "medium"

    def test_different_dedup_keys_create_separate_items(self, curiosity_svc):
        """Different dedup keys should create distinct items."""
        curiosity_svc.create_item(
            title="A",
            dedup_key="src:kind:a",
        )
        curiosity_svc.create_item(
            title="B",
            dedup_key="src:kind:b",
        )
        assert len(curiosity_svc.list_items(limit=200)) == 2


# ═══════════════════════════════════════════════════════════════
# KROK 2 – WIP Limit
# ═══════════════════════════════════════════════════════════════


class TestWIPLimit:
    """_curiosity_tick respects MAX_CURIOSITY_IN_PROGRESS."""

    @pytest.mark.asyncio
    async def test_wip_limit_blocks_new_jobs(self, curiosity_svc):
        """When in_progress count >= limit, no new job is created."""
        # Create 3 in_progress items (at limit)
        for i in range(3):
            item = curiosity_svc.create_item(title=f"WIP-{i}")
            curiosity_svc.update_item_status(item.id, "in_progress")

        # Also create an open item that WOULD be picked
        curiosity_svc.create_item(title="Should not be picked")

        assert curiosity_svc.count_by_status("in_progress") == 3

        # Mock the core's _curiosity_tick
        mock_mem = AsyncMock()
        mock_mem.add_memory = AsyncMock()

        with patch(
            "app.services.resident_curiosity.get_curiosity_service",
            return_value=curiosity_svc,
        ), patch(
            "app.services.memory_service.get_memory_service", return_value=mock_mem
        ), patch(
            "app.services.resident_agent.core.CURIOSITY_TICK_INTERVAL", 1
        ), patch(
            "app.services.resident_agent.core.MAX_CURIOSITY_IN_PROGRESS", 3
        ):

            import time
            from app.services.resident_agent.core import ResidentAgent

            core = ResidentAgent.__new__(ResidentAgent)
            core._state = MagicMock()
            core._state.tick_count = 1  # divisible by 1
            _init_agent_budget(core)

            await core._curiosity_tick()

        # The thought about being at WIP limit should have been recorded
        mock_mem.add_memory.assert_called_once()
        call_text = mock_mem.add_memory.call_args.kwargs.get(
            "text", mock_mem.add_memory.call_args[1].get("text", "")
        )
        assert "rozpracovanych" in call_text or "nebudu" in call_text

    def test_count_by_status(self, curiosity_svc):
        """count_by_status returns correct counts."""
        for i in range(3):
            curiosity_svc.create_item(title=f"Open-{i}")
        item = curiosity_svc.create_item(title="InProgress")
        curiosity_svc.update_item_status(item.id, "in_progress")

        assert curiosity_svc.count_by_status("open") == 3
        assert curiosity_svc.count_by_status("in_progress") == 1
        assert curiosity_svc.count_by_status("done") == 0


# ═══════════════════════════════════════════════════════════════
# KROK 3 – Curiosity Item Resolution
# ═══════════════════════════════════════════════════════════════


class TestCuriosityResolution:
    """Items are resolved (done/reopened) based on analysis job outcome."""

    def test_resolve_item_sets_done_and_summary(self, curiosity_svc):
        """resolve_item sets status=done and stores resolution_summary."""
        item = curiosity_svc.create_item(title="Test resolve")
        curiosity_svc.update_item_status(item.id, "in_progress")

        resolved = curiosity_svc.resolve_item(
            item.id, "done", resolution_summary="All good, no issues found."
        )
        assert resolved is not None
        assert resolved.status == "done"
        assert resolved.resolution_summary == "All good, no issues found."

    def test_failed_job_reopens_item(self, curiosity_svc):
        """When analysis job fails, the curiosity item goes back to open + high priority."""
        item = curiosity_svc.create_item(title="Will fail", priority="medium")
        curiosity_svc.update_item_status(item.id, "in_progress")

        # Simulate what _resolve_curiosity_from_job does on failure
        curiosity_svc.update_item_status(item.id, "open")
        reopened = curiosity_svc.get_item(item.id)
        reopened.priority = "high"
        curiosity_svc._save(reopened)

        final = curiosity_svc.get_item(item.id)
        assert final.status == "open"
        assert final.priority == "high"


# ═══════════════════════════════════════════════════════════════
# KROK 4 – Safety: only analysis action_type
# ═══════════════════════════════════════════════════════════════


class TestCuriositySafety:
    """All jobs from _curiosity_tick must have action_type='analysis'."""

    @pytest.mark.asyncio
    async def test_curiosity_tick_creates_analysis_job(self, curiosity_svc):
        """The job created by _curiosity_tick has action_type='analysis'."""
        curiosity_svc.create_item(title="Investigate something")

        mock_mem = AsyncMock()
        mock_mem.add_memory = AsyncMock()

        created_jobs = []
        mock_job_svc = MagicMock()

        def fake_create_job(**kwargs):
            job = MagicMock()
            job.id = "test-job-1"
            job.payload = kwargs.get("payload", {})
            created_jobs.append(kwargs)
            return job

        mock_job_svc.create_job = fake_create_job

        with patch(
            "app.services.resident_curiosity.get_curiosity_service",
            return_value=curiosity_svc,
        ), patch(
            "app.services.memory_service.get_memory_service", return_value=mock_mem
        ), patch(
            "app.services.job_service.get_job_service", return_value=mock_job_svc
        ), patch(
            "app.services.resident_agent.core.CURIOSITY_TICK_INTERVAL", 1
        ), patch(
            "app.services.resident_agent.core.MAX_CURIOSITY_IN_PROGRESS", 3
        ):

            from app.services.resident_agent.core import ResidentAgent

            core = ResidentAgent.__new__(ResidentAgent)
            core._state = MagicMock()
            core._state.tick_count = 1
            _init_agent_budget(core)

            await core._curiosity_tick()

        assert len(created_jobs) == 1
        payload = created_jobs[0]["payload"]
        assert payload["action_type"] == "analysis"
        assert payload["auto_from_curiosity"] is True
        assert "curiosity_id" in payload


# ═══════════════════════════════════════════════════════════════
# KROK 5 – Thought length limits
# ═══════════════════════════════════════════════════════════════


class TestThoughtLimits:
    """Thought entries are capped at ~200 chars."""

    @pytest.mark.asyncio
    async def test_curiosity_thought_max_200_chars(self, curiosity_svc):
        """Memory text from curiosity tick is <= 200 characters."""
        long_title = "A" * 200
        curiosity_svc.create_item(title=long_title[:120])

        mock_mem = AsyncMock()
        stored_texts = []

        async def capture_memory(**kwargs):
            stored_texts.append(kwargs.get("text", ""))

        mock_mem.add_memory = capture_memory

        mock_job_svc = MagicMock()
        mock_job_svc.create_job = MagicMock(return_value=MagicMock(id="j1"))

        with patch(
            "app.services.resident_curiosity.get_curiosity_service",
            return_value=curiosity_svc,
        ), patch(
            "app.services.memory_service.get_memory_service", return_value=mock_mem
        ), patch(
            "app.services.job_service.get_job_service", return_value=mock_job_svc
        ), patch(
            "app.services.resident_agent.core.CURIOSITY_TICK_INTERVAL", 1
        ), patch(
            "app.services.resident_agent.core.MAX_CURIOSITY_IN_PROGRESS", 3
        ):

            from app.services.resident_agent.core import ResidentAgent

            core = ResidentAgent.__new__(ResidentAgent)
            core._state = MagicMock()
            core._state.tick_count = 1

            await core._curiosity_tick()

        # All stored thoughts should be <= 200 chars
        for text in stored_texts:
            assert (
                len(text) <= 200
            ), f"Thought too long ({len(text)} chars): {text[:50]}..."


# ═══════════════════════════════════════════════════════════════
# KROK 6 – API Endpoints
# ═══════════════════════════════════════════════════════════════


class TestCuriosityAPI:
    """GET /api/resident/curiosity and /api/resident/thoughts endpoints."""

    def test_curiosity_endpoint_returns_items(self, client, curiosity_svc):
        """GET /api/resident/curiosity returns curiosity items."""
        with patch(
            "app.services.resident_curiosity.get_curiosity_service",
            return_value=curiosity_svc,
        ):
            curiosity_svc.create_item(title="Test item", source="test", kind="question")

            resp = client.get("/api/resident/curiosity")
            assert resp.status_code == 200
            data = resp.json()
            assert "items" in data
            assert "count" in data

    def test_curiosity_endpoint_status_filter(self, client, curiosity_svc):
        """GET /api/resident/curiosity?status=open filters correctly."""
        with patch(
            "app.services.resident_curiosity.get_curiosity_service",
            return_value=curiosity_svc,
        ):
            item = curiosity_svc.create_item(title="Open item")
            done = curiosity_svc.create_item(title="Done item")
            curiosity_svc.resolve_item(done.id, "done")

            resp = client.get("/api/resident/curiosity?status=open")
            assert resp.status_code == 200
            data = resp.json()
            assert all(i["status"] == "open" for i in data["items"])

    def test_thoughts_endpoint(self, client):
        """GET /api/resident/thoughts returns thought entries."""
        resp = client.get("/api/resident/thoughts")
        assert resp.status_code == 200
        data = resp.json()
        assert "thoughts" in data
        assert "count" in data
