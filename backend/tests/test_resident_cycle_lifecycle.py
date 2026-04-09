"""Tests for resident agent cycle lifecycle hardening.

Covers:
- Scheduler does not start a new cycle while one is already in progress
- Retry logic stays within the same cycle_id
- After llm_timeout_final, the cycle lock is released and cooldown is set
- _set_phase keeps legacy `status` and `in_progress` consistent
"""

import asyncio
import sys
import time
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ── ChromaDB shim ─────────────────────────────────────────────────────────────
_chroma_mock = MagicMock()
for _mod_name in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod_name, _chroma_mock)

from app.services.resident_agent.core import (  # noqa: E402
    DEGRADED_SAFE_ACTIONS,
    RESIDENT_CYCLE_LOCK_ENABLED,
    RESIDENT_LLM_MAX_RETRIES,
    RESIDENT_LLM_TIMEOUT_SECONDS,
    RESIDENT_MAX_CONSECUTIVE_FAILURES_BEFORE_DEGRADED,
    RESIDENT_TIMEOUT_COOLDOWN_SECONDS,
    ResidentAgent,
    ResidentAgentState,
)

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────


def _make_agent() -> ResidentAgent:
    """Return a ResidentAgent with broadcast wired to a no-op."""
    agent = ResidentAgent()
    agent.set_broadcast(AsyncMock())
    return agent


# ─────────────────────────────────────────────────────────────────────────────
# Phase / status consistency
# ─────────────────────────────────────────────────────────────────────────────


class TestSetPhase:
    """_set_phase keeps legacy fields consistent with the new phase field."""

    def test_idle_clears_in_progress(self):
        agent = _make_agent()
        agent._set_phase("idle")
        assert agent._state.phase == "idle"
        assert agent._state.in_progress is False
        assert agent._state.status == "idle"

    def test_waiting_llm_sets_in_progress(self):
        agent = _make_agent()
        agent._set_phase("waiting_llm")
        assert agent._state.phase == "waiting_llm"
        assert agent._state.in_progress is True
        # Legacy status should map to "thinking"
        assert agent._state.status == "thinking"

    def test_retrying_llm_sets_in_progress(self):
        agent = _make_agent()
        agent._set_phase("retrying_llm")
        assert agent._state.phase == "retrying_llm"
        assert agent._state.in_progress is True

    def test_executing_sets_in_progress(self):
        agent = _make_agent()
        agent._set_phase("executing")
        assert agent._state.phase == "executing"
        assert agent._state.in_progress is True
        assert agent._state.status == "executing"

    def test_cooldown_clears_in_progress(self):
        agent = _make_agent()
        agent._set_phase("cooldown")
        assert agent._state.phase == "cooldown"
        assert agent._state.in_progress is False

    def test_error_clears_in_progress(self):
        agent = _make_agent()
        agent._set_phase("error")
        assert agent._state.phase == "error"
        assert agent._state.in_progress is False
        assert agent._state.status == "error"

    def test_idle_clears_active_cycle(self):
        agent = _make_agent()
        agent._state.active_cycle_id = "cycle-0001"
        agent._state.cycle_started_at = "2024-01-01T00:00:00Z"
        agent._set_phase("idle")
        assert agent._state.active_cycle_id is None
        assert agent._state.cycle_started_at is None

    def test_phase_change_emits_log(self):
        agent = _make_agent()
        before = len(agent._log_entries)
        agent._set_phase("waiting_llm", cycle_id="cycle-0042")
        assert len(agent._log_entries) == before + 1
        last_log = list(agent._log_entries)[-1]
        assert last_log.event == "cycle_phase_change"
        assert last_log.cycle_id == "cycle-0042"
        assert last_log.data["phase"] == "waiting_llm"


# ─────────────────────────────────────────────────────────────────────────────
# Cycle lock – skip when active
# ─────────────────────────────────────────────────────────────────────────────


class TestCycleLock:
    """Scheduler must not start a new cycle while one is in progress."""

    @pytest.mark.asyncio
    async def test_tick_skipped_when_cycle_in_progress(self):
        """If _cycle_in_progress is True, _tick() should return early and log a skip."""
        agent = _make_agent()
        agent._state.is_running = True
        agent._cycle_in_progress = True
        agent._state.active_cycle_id = "cycle-0001"
        agent._state.phase = "waiting_llm"

        # Patch asyncio.sleep so the test doesn't wait
        with patch("asyncio.sleep", new_callable=AsyncMock):
            with patch.object(
                agent, "_process_task_queue", new_callable=AsyncMock
            ) as mock_ptq:
                await agent._tick()

        # _process_task_queue must NOT have been called (cycle was skipped)
        mock_ptq.assert_not_called()

        # A skip log entry must have been emitted
        skip_logs = [
            e for e in agent._log_entries if e.event == "cycle_skip_active_in_progress"
        ]
        assert len(skip_logs) >= 1

    @pytest.mark.asyncio
    async def test_tick_skipped_during_cooldown(self):
        """If within cooldown window, _tick() should skip and emit cycle_skip_cooldown."""
        agent = _make_agent()
        agent._state.is_running = True
        agent._cycle_cooldown_until = time.monotonic() + 9999  # far future

        with patch("asyncio.sleep", new_callable=AsyncMock):
            with patch.object(
                agent, "_process_task_queue", new_callable=AsyncMock
            ) as mock_ptq:
                await agent._tick()

        mock_ptq.assert_not_called()
        skip_logs = [e for e in agent._log_entries if e.event == "cycle_skip_cooldown"]
        assert len(skip_logs) >= 1

    @pytest.mark.asyncio
    async def test_lock_released_after_normal_cycle(self):
        """After a successful _tick(), _cycle_in_progress must be False."""
        agent = _make_agent()
        agent._state.is_running = True

        # Stub out all sub-tick methods so the cycle completes quickly
        noop = AsyncMock()
        with patch("asyncio.sleep", new_callable=AsyncMock):
            with patch.object(agent, "_process_task_queue", noop), patch.object(
                agent, "_process_missions", noop
            ), patch.object(agent, "_thought_tick", noop), patch.object(
                agent, "_proactive_action_tick", noop
            ), patch.object(
                agent, "_curiosity_tick", noop
            ), patch.object(
                agent, "_periodic_check", noop
            ), patch.object(
                agent, "_proactive_alerts", noop
            ), patch.object(
                agent, "_digest_tick", noop
            ), patch.object(
                agent, "_summarize_old_memories", noop
            ):
                await agent._tick()

        assert agent._cycle_in_progress is False

    @pytest.mark.asyncio
    async def test_lock_released_even_on_exception(self):
        """Even if a sub-tick raises, _cycle_in_progress must be released."""
        agent = _make_agent()
        agent._state.is_running = True

        async def boom():
            raise RuntimeError("simulated failure")

        with patch("asyncio.sleep", new_callable=AsyncMock):
            with patch.object(
                agent, "_process_task_queue", side_effect=RuntimeError("boom")
            ), patch.object(agent, "_process_missions", AsyncMock()), patch.object(
                agent, "_periodic_check", AsyncMock()
            ), patch.object(
                agent, "_proactive_alerts", AsyncMock()
            ):
                await agent._tick()

        assert agent._cycle_in_progress is False


# ─────────────────────────────────────────────────────────────────────────────
# Retry stays within same cycle_id
# ─────────────────────────────────────────────────────────────────────────────


class TestLLMRetry:
    """All LLM retries must remain associated with the original cycle_id."""

    @pytest.mark.asyncio
    async def test_retry_same_cycle_id(self):
        """llm_timeout_retry log events must share the cycle_id derived from tick_count."""
        agent = _make_agent()
        agent._state.tick_count = 5
        expected_cycle_id = "cycle-0005"

        task = {"goal": "test", "description": "test task"}

        mock_settings = MagicMock()
        mock_settings.get_agent_config.return_value = {"step_timeout_s": 1}
        mock_settings.get_system_prompt.return_value = "prompt"
        mock_settings.get_llm_config.return_value = {"model": "test-model"}

        # Make resource monitor not block the call
        mock_monitor = MagicMock()
        mock_monitor.is_throttled.return_value = False
        mock_monitor.is_blocked.return_value = False

        with patch(
            "app.services.settings_service.get_settings_service",
            return_value=mock_settings,
        ), patch(
            "app.services.resource_monitor.get_resource_monitor",
            return_value=mock_monitor,
        ), patch(
            "asyncio.sleep", new_callable=AsyncMock
        ), patch(
            "asyncio.timeout", side_effect=asyncio.TimeoutError
        ):
            result = await agent._execute_with_llm(task)

        # Result should indicate timeout
        assert result.get("error") == "llm_timeout"

        # All retry logs must share the same cycle_id
        retry_logs = [e for e in agent._log_entries if e.event == "llm_timeout_retry"]
        assert len(retry_logs) == RESIDENT_LLM_MAX_RETRIES
        for log_entry in retry_logs:
            assert log_entry.cycle_id == expected_cycle_id

        # Final timeout log must also share cycle_id
        final_logs = [e for e in agent._log_entries if e.event == "llm_timeout_final"]
        assert len(final_logs) == 1
        assert final_logs[0].cycle_id == expected_cycle_id

    @pytest.mark.asyncio
    async def test_timeout_final_sets_cooldown(self):
        """After llm_timeout_final, cooldown window must be set."""
        agent = _make_agent()
        agent._state.tick_count = 7

        task = {"goal": "test", "description": "test"}

        mock_settings = MagicMock()
        mock_settings.get_agent_config.return_value = {"step_timeout_s": 1}
        mock_settings.get_system_prompt.return_value = "prompt"
        mock_settings.get_llm_config.return_value = {"model": "test-model"}

        mock_monitor = MagicMock()
        mock_monitor.is_throttled.return_value = False
        mock_monitor.is_blocked.return_value = False

        before = time.monotonic()

        with patch(
            "app.services.settings_service.get_settings_service",
            return_value=mock_settings,
        ), patch(
            "app.services.resource_monitor.get_resource_monitor",
            return_value=mock_monitor,
        ), patch(
            "asyncio.sleep", new_callable=AsyncMock
        ), patch(
            "asyncio.timeout", side_effect=asyncio.TimeoutError
        ):
            await agent._execute_with_llm(task)

        # Cooldown window must be set to the future
        assert agent._cycle_cooldown_until > before
        # Phase must be cooldown
        assert agent._state.phase == "cooldown"
        # last_error must be set
        assert agent._state.last_error is not None

    @pytest.mark.asyncio
    async def test_timeout_final_cycle_lock_released_by_tick(self):
        """After a full _tick() that ends in LLM timeout, lock is released and cooldown active."""
        agent = _make_agent()
        agent._state.is_running = True

        async def fake_thought_tick():
            # Simulate what _thought_tick does when LLM keeps timing out:
            # sets cooldown and phase but does NOT raise (returns error dict)
            agent._cycle_cooldown_until = (
                time.monotonic() + RESIDENT_TIMEOUT_COOLDOWN_SECONDS
            )
            agent._set_phase("cooldown", f"cycle-{agent._state.tick_count:04d}")
            agent._state.last_error = "LLM timeout after 3 attempt(s)"

        noop = AsyncMock()
        with patch("asyncio.sleep", new_callable=AsyncMock):
            with patch.object(agent, "_process_task_queue", noop), patch.object(
                agent, "_process_missions", noop
            ), patch.object(agent, "_thought_tick", fake_thought_tick), patch.object(
                agent, "_proactive_action_tick", noop
            ), patch.object(
                agent, "_curiosity_tick", noop
            ), patch.object(
                agent, "_periodic_check", noop
            ), patch.object(
                agent, "_proactive_alerts", noop
            ), patch.object(
                agent, "_digest_tick", noop
            ), patch.object(
                agent, "_summarize_old_memories", noop
            ):
                await agent._tick()

        # Lock must be released (finally block)
        assert agent._cycle_in_progress is False
        # Cooldown must still be active
        assert agent._cycle_cooldown_until > time.monotonic()


# ─────────────────────────────────────────────────────────────────────────────
# Config constants
# ─────────────────────────────────────────────────────────────────────────────


class TestConfigConstants:
    """Verify default values of the new lifecycle config constants."""

    def test_lock_enabled_by_default(self):
        assert RESIDENT_CYCLE_LOCK_ENABLED is True

    def test_timeout_seconds_gte_90(self):
        # We keep at least 90s for local models
        assert RESIDENT_LLM_TIMEOUT_SECONDS >= 90

    def test_max_retries_positive(self):
        assert RESIDENT_LLM_MAX_RETRIES >= 1

    def test_cooldown_positive(self):
        assert RESIDENT_TIMEOUT_COOLDOWN_SECONDS > 0


# ─────────────────────────────────────────────────────────────────────────────
# State dataclass
# ─────────────────────────────────────────────────────────────────────────────


class TestResidentAgentStateDefaults:
    """New fields on ResidentAgentState have correct defaults."""

    def test_phase_defaults_to_idle(self):
        state = ResidentAgentState()
        assert state.phase == "idle"

    def test_in_progress_defaults_false(self):
        state = ResidentAgentState()
        assert state.in_progress is False

    def test_to_dict_includes_phase(self):
        state = ResidentAgentState()
        d = state.to_dict()
        assert "phase" in d
        assert "in_progress" in d
        assert "active_cycle_id" in d
        assert "last_success_at" in d
        assert "last_error" in d
        assert "retry_count" in d
        assert "next_run_at" in d

    def test_to_dict_includes_degraded_fields(self):
        state = ResidentAgentState()
        d = state.to_dict()
        assert "degraded_mode" in d
        assert "degraded_reason" in d
        assert "consecutive_failures" in d
        assert "current_model" in d
        assert "last_llm_duration_ms" in d
        assert "last_error_at" in d


# ─────────────────────────────────────────────────────────────────────────────
# Degraded mode
# ─────────────────────────────────────────────────────────────────────────────


class TestDegradedMode:
    """Degraded mode logic."""

    def test_enter_degraded_mode_sets_flag(self):
        agent = _make_agent()
        agent._enter_degraded_mode(reason="too many failures", cycle_id="cycle-0001")
        assert agent._state.degraded_mode is True
        assert agent._state.degraded_reason == "too many failures"
        assert agent._degraded_since_at > 0

    def test_enter_degraded_mode_is_idempotent(self):
        """Calling _enter_degraded_mode twice should not add duplicate log entries."""
        agent = _make_agent()
        agent._enter_degraded_mode(reason="first", cycle_id="cycle-0001")
        before_logs = len(
            [e for e in agent._log_entries if e.event == "degraded_mode_entered"]
        )
        agent._enter_degraded_mode(reason="second", cycle_id="cycle-0001")
        after_logs = len(
            [e for e in agent._log_entries if e.event == "degraded_mode_entered"]
        )
        assert after_logs == before_logs  # second call is a no-op

    def test_exit_degraded_mode_clears_flag(self):
        agent = _make_agent()
        agent._enter_degraded_mode(reason="failures", cycle_id="cycle-0001")
        agent._exit_degraded_mode(cycle_id="cycle-0002")
        assert agent._state.degraded_mode is False
        assert agent._state.degraded_reason is None
        assert agent._degraded_since_at == 0.0

    def test_exit_degraded_mode_logs_duration(self):
        agent = _make_agent()
        agent._enter_degraded_mode(reason="failures", cycle_id="cycle-0001")
        agent._exit_degraded_mode(cycle_id="cycle-0002")
        exit_logs = [e for e in agent._log_entries if e.event == "degraded_mode_exited"]
        assert len(exit_logs) == 1
        assert exit_logs[0].data.get("degraded_for_s", -1) >= 0

    def test_exit_degraded_mode_is_idempotent(self):
        """Exiting when not degraded should not raise or log."""
        agent = _make_agent()
        before = len(agent._log_entries)
        agent._exit_degraded_mode(cycle_id="cycle-0001")
        assert len(agent._log_entries) == before

    def test_degraded_mode_entered_after_threshold_failures(self):
        """After RESIDENT_MAX_CONSECUTIVE_FAILURES_BEFORE_DEGRADED failures, enter degraded."""
        agent = _make_agent()
        agent._state.is_running = True
        agent._state.consecutive_failures = (
            RESIDENT_MAX_CONSECUTIVE_FAILURES_BEFORE_DEGRADED - 1
        )

        # Simulate a cycle that raises an exception
        async def run():
            noop = AsyncMock()
            with patch("asyncio.sleep", new_callable=AsyncMock):
                with patch.object(
                    agent, "_process_task_queue", side_effect=RuntimeError("boom")
                ), patch.object(agent, "_process_missions", noop), patch.object(
                    agent, "_periodic_check", noop
                ), patch.object(
                    agent, "_proactive_alerts", noop
                ):
                    await agent._tick()

        asyncio.get_event_loop().run_until_complete(run())

        assert agent._state.degraded_mode is True
        assert (
            agent._state.consecutive_failures
            >= RESIDENT_MAX_CONSECUTIVE_FAILURES_BEFORE_DEGRADED
        )

    @pytest.mark.asyncio
    async def test_llm_ticks_skipped_in_degraded_mode(self):
        """In degraded mode, _thought_tick and _curiosity_tick must not be called."""
        agent = _make_agent()
        agent._state.is_running = True
        agent._state.degraded_mode = True
        agent._state.degraded_reason = "test degraded"

        noop = AsyncMock()
        thought_tick = AsyncMock()
        curiosity_tick = AsyncMock()

        with patch("asyncio.sleep", new_callable=AsyncMock):
            with patch.object(agent, "_process_task_queue", noop), patch.object(
                agent, "_process_missions", noop
            ), patch.object(agent, "_thought_tick", thought_tick), patch.object(
                agent, "_proactive_action_tick", noop
            ), patch.object(
                agent, "_curiosity_tick", curiosity_tick
            ), patch.object(
                agent, "_periodic_check", noop
            ), patch.object(
                agent, "_proactive_alerts", noop
            ), patch.object(
                agent, "_digest_tick", noop
            ), patch.object(
                agent, "_summarize_old_memories", noop
            ):
                await agent._tick()

        thought_tick.assert_not_called()
        curiosity_tick.assert_not_called()

    @pytest.mark.asyncio
    async def test_degraded_mode_exits_after_successful_cycle(self):
        """A successful cycle should exit degraded mode."""
        agent = _make_agent()
        agent._state.is_running = True
        agent._state.degraded_mode = True
        agent._state.degraded_reason = "prior failures"

        noop = AsyncMock()
        with patch("asyncio.sleep", new_callable=AsyncMock):
            with patch.object(agent, "_process_task_queue", noop), patch.object(
                agent, "_process_missions", noop
            ), patch.object(agent, "_thought_tick", noop), patch.object(
                agent, "_proactive_action_tick", noop
            ), patch.object(
                agent, "_curiosity_tick", noop
            ), patch.object(
                agent, "_periodic_check", noop
            ), patch.object(
                agent, "_proactive_alerts", noop
            ), patch.object(
                agent, "_digest_tick", noop
            ), patch.object(
                agent, "_summarize_old_memories", noop
            ):
                await agent._tick()

        assert agent._state.degraded_mode is False
        assert agent._state.consecutive_failures == 0

    @pytest.mark.asyncio
    async def test_degraded_phase_set_after_successful_cycle_in_degraded(self):
        """After a successful cycle that started in degraded mode, phase should be idle (not degraded)."""
        agent = _make_agent()
        agent._state.is_running = True
        agent._state.degraded_mode = True

        noop = AsyncMock()
        with patch("asyncio.sleep", new_callable=AsyncMock):
            with patch.object(agent, "_process_task_queue", noop), patch.object(
                agent, "_process_missions", noop
            ), patch.object(agent, "_thought_tick", noop), patch.object(
                agent, "_proactive_action_tick", noop
            ), patch.object(
                agent, "_curiosity_tick", noop
            ), patch.object(
                agent, "_periodic_check", noop
            ), patch.object(
                agent, "_proactive_alerts", noop
            ), patch.object(
                agent, "_digest_tick", noop
            ), patch.object(
                agent, "_summarize_old_memories", noop
            ):
                await agent._tick()

        # Degraded mode cleared → phase should be idle
        assert agent._state.phase == "idle"


# ─────────────────────────────────────────────────────────────────────────────
# Degraded safe-actions allowlist
# ─────────────────────────────────────────────────────────────────────────────


class TestDegradedSafeActions:
    """DEGRADED_SAFE_ACTIONS constant sanity checks."""

    def test_safe_actions_non_empty(self):
        assert len(DEGRADED_SAFE_ACTIONS) > 0

    def test_no_op_in_safe_actions(self):
        assert "no_op" in DEGRADED_SAFE_ACTIONS

    def test_system_health_in_safe_actions(self):
        assert "system_health" in DEGRADED_SAFE_ACTIONS

    def test_safe_actions_subset_of_allowed_actions(self):
        from app.services.resident_agent.core import ALLOWED_ACTIONS

        # All degraded safe actions must be in the main ALLOWED_ACTIONS list
        assert DEGRADED_SAFE_ACTIONS.issubset(set(ALLOWED_ACTIONS))

    def test_max_failures_threshold_positive(self):
        assert RESIDENT_MAX_CONSECUTIVE_FAILURES_BEFORE_DEGRADED >= 2


# ─────────────────────────────────────────────────────────────────────────────
# Additional state defaults (degraded fields)
# ─────────────────────────────────────────────────────────────────────────────


class TestDegradedStateDefaults:
    """ResidentAgentState degraded fields have correct defaults."""

    def test_degraded_mode_defaults_false(self):
        state = ResidentAgentState()
        assert state.degraded_mode is False

    def test_degraded_reason_defaults_none(self):
        state = ResidentAgentState()
        assert state.degraded_reason is None

    def test_consecutive_failures_defaults_zero(self):
        state = ResidentAgentState()
        assert state.consecutive_failures == 0

    def test_current_model_defaults_none(self):
        state = ResidentAgentState()
        assert state.current_model is None

    def test_last_llm_duration_defaults_none(self):
        state = ResidentAgentState()
        assert state.last_llm_duration_ms is None

    def test_last_error_at_defaults_none(self):
        state = ResidentAgentState()
        assert state.last_error_at is None
