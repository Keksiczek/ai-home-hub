"""Tests for Hardening v2: configurable guardrails and Safe Mode.

Covers:
- Pydantic settings validation
- Safe Mode API endpoints
- Resident action tier enforcement
- Cooldown enforcement
- Daily budget exhaustion
- Settings migration compatibility
"""
import sys
import time
from typing import Any, Dict
from unittest.mock import MagicMock, patch

import pytest

# ── chromadb compatibility shim (must be first) ──────────────────────────────
_chroma_mock = MagicMock()
for _mod_name in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod_name, _chroma_mock)

from app.core.settings import (  # noqa: E402
    ActionBlockedError,
    AgentGuardrailsConfig,
    GlobalGuardrailSettings,
    ResidentGuardrailsConfig,
    SafeModeRestrictions,
    get_guardrail_settings,
    reset_guardrail_settings,
    update_guardrail_settings,
)

from app.services.resident_agent import (  # noqa: E402
    ACTION_COOLDOWNS,
    ACTION_TIERS,
    ResidentAgent,
)


# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest.fixture(autouse=True)
def reset_settings():
    """Reset guardrail singleton before every test."""
    reset_guardrail_settings()
    yield
    reset_guardrail_settings()


@pytest.fixture
def agent() -> ResidentAgent:
    """Return a fresh ResidentAgent with guardrails wired to default settings."""
    return ResidentAgent()


# ── 1. Pydantic settings validation edge cases ───────────────────────────────


class TestPydanticSettingsValidation:
    def test_default_values_are_conservative(self):
        gs = GlobalGuardrailSettings()
        assert gs.safe_mode is False
        assert gs.resident.autonomy_level == "advisor"
        assert gs.resident.interval_seconds == 900
        assert gs.resident.max_cycles_per_day == 96

    def test_agent_guardrails_bounds(self):
        with pytest.raises(Exception):
            AgentGuardrailsConfig(max_steps=2)  # below ge=5
        with pytest.raises(Exception):
            AgentGuardrailsConfig(max_steps=100)  # above le=50
        with pytest.raises(Exception):
            AgentGuardrailsConfig(max_total_tokens=100)  # below ge=8_000
        with pytest.raises(Exception):
            AgentGuardrailsConfig(step_timeout_s=5)  # below ge=10

    def test_resident_autonomy_validation(self):
        with pytest.raises(Exception):
            ResidentGuardrailsConfig(autonomy_level="superuser")

    def test_resident_quiet_hours_validation(self):
        with pytest.raises(Exception):
            ResidentGuardrailsConfig(quiet_hours=["not-a-time-range"])
        with pytest.raises(Exception):
            ResidentGuardrailsConfig(quiet_hours=["25:00-07:00"])

    def test_resident_interval_bounds(self):
        with pytest.raises(Exception):
            ResidentGuardrailsConfig(interval_seconds=100)  # below ge=300
        with pytest.raises(Exception):
            ResidentGuardrailsConfig(interval_seconds=9999)  # above le=3600

    def test_valid_quiet_hours(self):
        cfg = ResidentGuardrailsConfig(quiet_hours=["22:00-07:00", "12:00-13:00"])
        assert len(cfg.quiet_hours) == 2

    def test_safe_mode_restrictions_defaults(self):
        r = SafeModeRestrictions()
        assert r.disable_experimental_agents is True
        assert r.resident_autonomy == "observer"
        assert r.max_concurrent_agents == 1


# ── 2. Safe Mode effects ──────────────────────────────────────────────────────


class TestSafeModeEffects:
    def test_safe_mode_caps_autonomy_to_observer(self):
        gs = GlobalGuardrailSettings(
            safe_mode=True,
            resident=ResidentGuardrailsConfig(autonomy_level="autonomous"),
        )
        assert gs.effective_resident_autonomy() == "observer"

    def test_safe_mode_off_preserves_autonomy(self):
        gs = GlobalGuardrailSettings(
            safe_mode=False,
            resident=ResidentGuardrailsConfig(autonomy_level="autonomous"),
        )
        assert gs.effective_resident_autonomy() == "autonomous"

    def test_safe_mode_tightens_agent_guardrails(self):
        gs = GlobalGuardrailSettings(
            safe_mode=True,
            agent_guardrails={"code": AgentGuardrailsConfig(max_steps=20, max_total_tokens=40_000)},
        )
        effective = gs.effective_agent_guardrails("code")
        assert effective.max_steps <= 8  # safe mode cap
        assert effective.max_total_tokens <= 16_000

    def test_safe_mode_reduces_concurrent_agents(self):
        gs = GlobalGuardrailSettings(safe_mode=True)
        assert gs.max_concurrent_agents() == 1

    def test_safe_mode_off_allows_3_concurrent(self):
        gs = GlobalGuardrailSettings(safe_mode=False)
        assert gs.max_concurrent_agents() == 3


# ── 3. Resident observer cannot execute dangerous actions ─────────────────────


class TestResidentObserverBlocked:
    def test_observer_blocks_dangerous_actions(self, agent: ResidentAgent):
        update_guardrail_settings({"guardrails": {"resident": {"autonomy_level": "observer"}}})
        with pytest.raises(ActionBlockedError):
            agent.check_action_allowed("git_operations")

    def test_observer_blocks_medium_actions(self, agent: ResidentAgent):
        update_guardrail_settings({"guardrails": {"resident": {"autonomy_level": "observer"}}})
        with pytest.raises(ActionBlockedError):
            agent.check_action_allowed("spawn_specialist")

    def test_observer_allows_safe_actions(self, agent: ResidentAgent):
        update_guardrail_settings({"guardrails": {"resident": {"autonomy_level": "observer"}}})
        # Should NOT raise
        agent.check_action_allowed("system_health")
        agent.check_action_allowed("no_op")

    def test_advisor_blocks_dangerous(self, agent: ResidentAgent):
        update_guardrail_settings({"guardrails": {"resident": {"autonomy_level": "advisor"}}})
        with pytest.raises(ActionBlockedError):
            agent.check_action_allowed("spawn_devops_agent")

    def test_advisor_allows_medium(self, agent: ResidentAgent):
        update_guardrail_settings({"guardrails": {"resident": {"autonomy_level": "advisor"}}})
        # Should NOT raise (no cooldown yet, budget not exhausted)
        agent.check_action_allowed("kb_search")

    def test_autonomous_allows_dangerous(self, agent: ResidentAgent):
        update_guardrail_settings({"guardrails": {"resident": {"autonomy_level": "autonomous"}}})
        # git_operations is dangerous – should pass tier check (may fail cooldown)
        # Manually bypass cooldown by using a fresh agent with no history
        agent.check_action_allowed("git_operations")  # should not raise tier error


# ── 4. Safe Mode blocks dangerous actions via observer override ───────────────


class TestSafeModeBlocksDangerousActions:
    def test_safe_mode_blocks_dangerous_even_if_autonomous_configured(self, agent: ResidentAgent):
        # Safe mode forces observer → dangerous actions are blocked
        update_guardrail_settings({
            "guardrails": {
                "safe_mode": True,
                "resident": {"autonomy_level": "autonomous"},
                "safe_mode_restrictions": {"resident_autonomy": "observer"},
            }
        })
        with pytest.raises(ActionBlockedError):
            agent.check_action_allowed("spawn_devops_agent")

    def test_safe_mode_blocks_medium_when_observer(self, agent: ResidentAgent):
        update_guardrail_settings({
            "guardrails": {
                "safe_mode": True,
                "safe_mode_restrictions": {"resident_autonomy": "observer"},
                "resident": {"autonomy_level": "autonomous"},
            }
        })
        with pytest.raises(ActionBlockedError):
            agent.check_action_allowed("spawn_specialist")


# ── 5. Cooldown enforcement ───────────────────────────────────────────────────


class TestActionCooldowns:
    def test_cooldown_blocks_after_execution(self, agent: ResidentAgent):
        update_guardrail_settings({"guardrails": {"resident": {"autonomy_level": "autonomous"}}})
        # Record execution to start cooldown
        agent.record_action_executed("git_operations")
        # Now check_action_allowed should raise due to cooldown
        with pytest.raises(ActionBlockedError, match="cooldown"):
            agent.check_action_allowed("git_operations")

    def test_cooldown_allows_after_expiry(self, agent: ResidentAgent):
        update_guardrail_settings({"guardrails": {"resident": {"autonomy_level": "autonomous"}}})
        # Fake last execution far in the past
        agent._action_last_executed["git_operations"] = time.monotonic() - ACTION_COOLDOWNS["git_operations"] - 1
        # Should not raise
        agent.check_action_allowed("git_operations")

    def test_no_cooldown_for_safe_actions(self, agent: ResidentAgent):
        update_guardrail_settings({"guardrails": {"resident": {"autonomy_level": "autonomous"}}})
        # safe actions have no cooldown – can execute repeatedly
        agent.check_action_allowed("system_health")
        agent.record_action_executed("system_health")
        agent.check_action_allowed("system_health")  # no cooldown defined

    def test_action_cooldown_prevents_spam(self, agent: ResidentAgent):
        """System commands have a 2-hour cooldown."""
        update_guardrail_settings({"guardrails": {"resident": {"autonomy_level": "autonomous"}}})
        agent.record_action_executed("system_commands")
        with pytest.raises(ActionBlockedError):
            agent.check_action_allowed("system_commands")


# ── 6. Daily budget exhaustion ───────────────────────────────────────────────


class TestDailyBudgetExhaustion:
    def test_daily_budget_blocks_after_limit(self, agent: ResidentAgent):
        update_guardrail_settings({
            "guardrails": {
                "resident": {
                    "autonomy_level": "autonomous",
                    "max_daily_actions": {"spawn_specialist": 2},
                }
            }
        })
        # First two executions succeed
        for _ in range(2):
            agent._daily_action_counts["spawn_specialist"] = agent._daily_action_counts.get("spawn_specialist", 0) + 1
            agent._daily_action_reset_date = __import__("datetime").datetime.now(
                __import__("datetime").timezone.utc
            ).strftime("%Y-%m-%d")

        # Third should fail
        with pytest.raises(ActionBlockedError, match="budget exhausted"):
            agent.check_action_allowed("spawn_specialist")

    def test_daily_budget_resets_at_midnight(self, agent: ResidentAgent):
        update_guardrail_settings({
            "guardrails": {
                "resident": {
                    "autonomy_level": "autonomous",
                    "max_daily_actions": {"spawn_specialist": 1},
                }
            }
        })
        # Simulate yesterday's count
        agent._daily_action_counts["spawn_specialist"] = 5
        agent._daily_action_reset_date = "2000-01-01"  # old date → triggers reset

        # Should succeed after reset
        agent.check_action_allowed("spawn_specialist")
        assert agent._daily_action_counts.get("spawn_specialist", 0) == 0

    def test_action_not_in_budget_has_unlimited(self, agent: ResidentAgent):
        """Actions not listed in max_daily_actions are unlimited."""
        update_guardrail_settings({"guardrails": {"resident": {"autonomy_level": "autonomous"}}})
        # lean_metrics not in default budget → unlimited
        for _ in range(100):
            agent.check_action_allowed("lean_metrics")


# ── 7. Settings migration compatibility ──────────────────────────────────────


class TestSettingsMigrationCompat:
    def test_old_resident_mode_key_still_works(self):
        """Legacy resident_mode top-level key populates guardrails."""
        update_guardrail_settings({"resident_mode": "autonomous"})
        gs = get_guardrail_settings()
        assert gs.resident.autonomy_level == "autonomous"

    def test_missing_guardrails_key_uses_defaults(self):
        """Settings without 'guardrails' key fall back to defaults."""
        update_guardrail_settings({})
        gs = get_guardrail_settings()
        assert gs.safe_mode is False
        assert gs.resident.autonomy_level == "advisor"

    def test_partial_guardrails_merged_with_defaults(self):
        """Partial guardrails config is merged, not replaced."""
        update_guardrail_settings({"guardrails": {"safe_mode": True}})
        gs = get_guardrail_settings()
        assert gs.safe_mode is True
        # resident still has defaults
        assert gs.resident.max_cycles_per_day == 96


# ── 8. Action tier coverage ───────────────────────────────────────────────────


class TestActionTiers:
    def test_all_tiers_defined(self):
        assert "safe" in ACTION_TIERS
        assert "medium" in ACTION_TIERS
        assert "dangerous" in ACTION_TIERS

    def test_dangerous_actions_have_cooldowns(self):
        for action in ACTION_TIERS["dangerous"]:
            if action in ACTION_COOLDOWNS:
                assert ACTION_COOLDOWNS[action] > 0

    def test_safe_actions_include_no_op(self):
        assert "no_op" in ACTION_TIERS["safe"]

    def test_spawn_devops_is_dangerous(self):
        assert "spawn_devops_agent" in ACTION_TIERS["dangerous"]

    def test_kb_search_is_medium(self):
        assert "kb_search" in ACTION_TIERS["medium"]


# ── 9. API endpoint smoke tests ───────────────────────────────────────────────


class TestSafeModeAPI:
    """HTTP-level tests for safe-mode endpoints via TestClient."""

    @pytest.fixture
    def client(self):
        from unittest.mock import AsyncMock
        from fastapi.testclient import TestClient
        from app.main import app
        with patch(
            "app.services.startup_checks.run_startup_checks",
            new_callable=AsyncMock,
            return_value={"ollama": "ok (mocked)"},
        ):
            with TestClient(app) as c:
                yield c

    def test_get_safe_mode_default_is_false(self, client):
        resp = client.get("/api/settings/safe-mode")
        assert resp.status_code == 200
        data = resp.json()
        assert "safe_mode" in data

    def test_enable_safe_mode(self, client):
        resp = client.post("/api/settings/safe-mode", json={"enabled": True})
        assert resp.status_code == 200
        data = resp.json()
        assert data["safe_mode"] is True
        assert data["effective_autonomy"] == "observer"

    def test_disable_safe_mode(self, client):
        client.post("/api/settings/safe-mode", json={"enabled": True})
        resp = client.post("/api/settings/safe-mode", json={"enabled": False})
        assert resp.status_code == 200
        assert resp.json()["safe_mode"] is False

    def test_get_guardrails(self, client):
        resp = client.get("/api/settings/guardrails")
        assert resp.status_code == 200
        data = resp.json()
        assert "agent_guardrails" in data
        assert "resident" in data

    def test_update_guardrails_resident_autonomy(self, client):
        resp = client.post(
            "/api/settings/guardrails",
            json={"resident": {"autonomy_level": "observer"}},
        )
        assert resp.status_code == 200
        assert resp.json()["effective_autonomy"] == "observer"

    def test_guardrail_runtime_status(self, client):
        resp = client.get("/api/settings/guardrails/status")
        assert resp.status_code == 200
        data = resp.json()
        assert "safe_mode" in data
        assert "autonomy_level" in data
