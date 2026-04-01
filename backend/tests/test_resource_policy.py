"""Tests for resource policy – tier transitions, hysteresis, and priority decisions."""

import pytest
from app.services.resource_policy import (
    ResourcePolicy,
    ResourceTier,
    TaskPriority,
    HYSTERESIS_UP_COUNT,
    HYSTERESIS_DOWN_COUNT,
    HYSTERESIS_DOWN_MARGIN,
)


@pytest.fixture
def policy():
    return ResourcePolicy()


class TestResourceTierTransitions:
    """Test tier determination from RAM/CPU metrics."""

    def test_normal_at_low_ram(self, policy):
        tier = policy.update(ram_percent=50, cpu_percent=20)
        # Needs multiple samples to move up, but we start at NORMAL
        assert policy.tier == ResourceTier.NORMAL

    def test_escalate_to_elevated_requires_consecutive(self, policy):
        """Tier escalation requires HYSTERESIS_UP_COUNT consecutive samples."""
        # First sample above 70% — not yet escalated
        policy.update(ram_percent=72)
        assert policy.tier == ResourceTier.NORMAL

        # Second consecutive sample — now escalated
        tier = policy.update(ram_percent=73)
        assert tier == ResourceTier.ELEVATED

    def test_escalate_to_high(self, policy):
        # First get to ELEVATED
        for _ in range(HYSTERESIS_UP_COUNT):
            policy.update(ram_percent=72)
        assert policy.tier == ResourceTier.ELEVATED

        # Now escalate to HIGH
        for _ in range(HYSTERESIS_UP_COUNT):
            policy.update(ram_percent=82)
        assert policy.tier == ResourceTier.HIGH

    def test_escalate_to_critical(self, policy):
        # Quick escalation
        for _ in range(HYSTERESIS_UP_COUNT):
            policy.update(ram_percent=72)
        for _ in range(HYSTERESIS_UP_COUNT):
            policy.update(ram_percent=82)
        for _ in range(HYSTERESIS_UP_COUNT):
            policy.update(ram_percent=90)
        assert policy.tier == ResourceTier.CRITICAL

    def test_de_escalation_requires_margin_and_count(self, policy):
        """De-escalation needs RAM to drop below threshold - margin."""
        # Escalate to ELEVATED
        for _ in range(HYSTERESIS_UP_COUNT):
            policy.update(ram_percent=72)
        assert policy.tier == ResourceTier.ELEVATED

        # RAM drops to 68% — still above (70 - 5 = 65) margin
        policy.update(ram_percent=68)
        assert policy.tier == ResourceTier.ELEVATED

        # RAM drops to 64% — below margin, but needs consecutive samples
        policy.update(ram_percent=64)
        assert policy.tier == ResourceTier.ELEVATED  # need more samples

        # Continue below margin
        for _ in range(HYSTERESIS_DOWN_COUNT):
            policy.update(ram_percent=64)
        assert policy.tier == ResourceTier.NORMAL

    def test_no_flip_flop(self, policy):
        """Tier should not oscillate rapidly around threshold."""
        # Escalate to ELEVATED
        for _ in range(HYSTERESIS_UP_COUNT):
            policy.update(ram_percent=72)
        assert policy.tier == ResourceTier.ELEVATED

        # Oscillate around threshold — should stay ELEVATED
        for _ in range(5):
            policy.update(ram_percent=69)  # just below
            policy.update(ram_percent=72)  # just above
        assert policy.tier == ResourceTier.ELEVATED

    def test_step_down_one_tier_at_a_time(self, policy):
        """De-escalation goes one tier at a time, not jumping."""
        # Go to HIGH
        for _ in range(HYSTERESIS_UP_COUNT):
            policy.update(ram_percent=72)
        for _ in range(HYSTERESIS_UP_COUNT):
            policy.update(ram_percent=82)
        assert policy.tier == ResourceTier.HIGH

        # Drop well below all thresholds
        for _ in range(HYSTERESIS_DOWN_COUNT + 1):
            policy.update(ram_percent=50)

        # Should step down to ELEVATED, not directly to NORMAL
        assert policy.tier == ResourceTier.ELEVATED


class TestPriorityDecisions:
    """Test that priority decisions match tier rules."""

    def test_chat_always_allowed(self, policy):
        """Chat should never be blocked, regardless of tier."""
        for tier_ram in [50, 72, 82, 92]:
            for _ in range(3):
                policy.update(ram_percent=tier_ram)
            assert policy.can_proceed(TaskPriority.CHAT) == "allow"

    def test_resident_throttled_at_high(self, policy):
        for _ in range(HYSTERESIS_UP_COUNT):
            policy.update(ram_percent=72)
        for _ in range(HYSTERESIS_UP_COUNT):
            policy.update(ram_percent=82)
        assert policy.tier == ResourceTier.HIGH
        assert policy.can_proceed(TaskPriority.RESIDENT) == "throttle"

    def test_resident_blocked_at_critical(self, policy):
        for _ in range(HYSTERESIS_UP_COUNT):
            policy.update(ram_percent=72)
        for _ in range(HYSTERESIS_UP_COUNT):
            policy.update(ram_percent=82)
        for _ in range(HYSTERESIS_UP_COUNT):
            policy.update(ram_percent=90)
        assert policy.tier == ResourceTier.CRITICAL
        assert policy.can_proceed(TaskPriority.RESIDENT) == "block"

    def test_background_throttled_at_elevated(self, policy):
        for _ in range(HYSTERESIS_UP_COUNT):
            policy.update(ram_percent=72)
        assert policy.tier == ResourceTier.ELEVATED
        assert policy.can_proceed(TaskPriority.BACKGROUND) == "throttle"

    def test_background_blocked_at_high(self, policy):
        for _ in range(HYSTERESIS_UP_COUNT):
            policy.update(ram_percent=72)
        for _ in range(HYSTERESIS_UP_COUNT):
            policy.update(ram_percent=82)
        assert policy.tier == ResourceTier.HIGH
        assert policy.can_proceed(TaskPriority.BACKGROUND) == "block"

    def test_should_allow_convenience(self, policy):
        assert policy.should_allow(TaskPriority.CHAT) is True
        assert policy.should_allow(TaskPriority.BACKGROUND) is True

    def test_skip_reason_none_when_allowed(self, policy):
        assert policy.get_skip_reason(TaskPriority.CHAT) is None

    def test_skip_reason_present_when_blocked(self, policy):
        for _ in range(HYSTERESIS_UP_COUNT):
            policy.update(ram_percent=72)
        for _ in range(HYSTERESIS_UP_COUNT):
            policy.update(ram_percent=82)
        reason = policy.get_skip_reason(TaskPriority.BACKGROUND)
        assert reason is not None
        assert "blocked" in reason


class TestUserActivityCooldown:
    """Test user activity tracking for resident cooldown."""

    def test_initial_seconds_since_activity(self, policy):
        assert policy.seconds_since_user_activity() == float("inf")

    def test_record_and_check(self, policy):
        policy.record_user_activity()
        assert policy.seconds_since_user_activity() < 1.0

    def test_interval_multiplier(self, policy):
        assert policy.get_resident_interval_multiplier() == 1.0

        for _ in range(HYSTERESIS_UP_COUNT):
            policy.update(ram_percent=72)
        assert policy.get_resident_interval_multiplier() == 1.5

        for _ in range(HYSTERESIS_UP_COUNT):
            policy.update(ram_percent=82)
        assert policy.get_resident_interval_multiplier() == 3.0
