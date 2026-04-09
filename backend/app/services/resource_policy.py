"""Resource Policy – centralized resource-aware scheduling with tiered states and hysteresis.

Provides a single source of truth for whether a given priority level of work
should proceed, be deferred, or be blocked.  Consumed by:

- Chat router (priority 1 — always allowed)
- Resident agent (priority 2 — deferred under HIGH, blocked under CRITICAL)
- KB watchdog, embeddings, background jobs (priority 3 — deferred under ELEVATED+)

Resource tiers:
    NORMAL   — everything runs
    ELEVATED — priority 3 work is throttled (longer intervals, batching)
    HIGH     — priority 3 is paused, priority 2 interval doubled
    CRITICAL — only priority 1 (chat) runs; everything else paused

Hysteresis: transition UP requires the threshold to be exceeded for
``HYSTERESIS_UP_COUNT`` consecutive samples.  Transition DOWN requires the
metric to stay below ``threshold - HYSTERESIS_DOWN_MARGIN`` for
``HYSTERESIS_DOWN_COUNT`` samples.  This prevents flip-flop.
"""

import enum
import logging
import time
from dataclasses import dataclass, field
from typing import Optional

logger = logging.getLogger(__name__)


# ── Tier definitions ────────────────────────────────────────────────────────


class ResourceTier(str, enum.Enum):
    NORMAL = "normal"
    ELEVATED = "elevated"
    HIGH = "high"
    CRITICAL = "critical"


class TaskPriority(int, enum.Enum):
    """Lower number = higher priority."""

    CHAT = 1  # user-facing chat, explicit user actions
    RESIDENT = 2  # resident agent reasoning cycles
    BACKGROUND = 3  # KB maintenance, embeddings, curiosity, watchdog, discovery


# ── Tier thresholds (RAM %) ─────────────────────────────────────────────────

TIER_THRESHOLDS = {
    ResourceTier.ELEVATED: 70,
    ResourceTier.HIGH: 80,
    ResourceTier.CRITICAL: 88,
}

# Hysteresis parameters
HYSTERESIS_UP_COUNT = 2  # consecutive samples above threshold to escalate
HYSTERESIS_DOWN_COUNT = 3  # consecutive samples below threshold to de-escalate
HYSTERESIS_DOWN_MARGIN = 5  # must drop this many % below threshold to de-escalate

# ── Tier action rules ───────────────────────────────────────────────────────

# For each tier, which priorities are allowed / throttled / blocked
TIER_RULES: dict[ResourceTier, dict[TaskPriority, str]] = {
    ResourceTier.NORMAL: {
        TaskPriority.CHAT: "allow",
        TaskPriority.RESIDENT: "allow",
        TaskPriority.BACKGROUND: "allow",
    },
    ResourceTier.ELEVATED: {
        TaskPriority.CHAT: "allow",
        TaskPriority.RESIDENT: "allow",
        TaskPriority.BACKGROUND: "throttle",
    },
    ResourceTier.HIGH: {
        TaskPriority.CHAT: "allow",
        TaskPriority.RESIDENT: "throttle",
        TaskPriority.BACKGROUND: "block",
    },
    ResourceTier.CRITICAL: {
        TaskPriority.CHAT: "allow",
        TaskPriority.RESIDENT: "block",
        TaskPriority.BACKGROUND: "block",
    },
}


@dataclass
class TierTransition:
    """Tracks consecutive samples for hysteresis."""

    up_consecutive: int = 0
    down_consecutive: int = 0


@dataclass
class ResourcePolicyState:
    """Current policy state exposed to consumers."""

    tier: ResourceTier = ResourceTier.NORMAL
    ram_percent: float = 0.0
    cpu_percent: float = 0.0
    active_llm_ops: int = 0
    pending_bg_tasks: int = 0
    tier_since: float = field(default_factory=time.monotonic)
    tier_reason: str = ""
    last_update: float = field(default_factory=time.monotonic)

    def to_dict(self) -> dict:
        return {
            "tier": self.tier.value,
            "ram_percent": round(self.ram_percent, 1),
            "cpu_percent": round(self.cpu_percent, 1),
            "active_llm_ops": self.active_llm_ops,
            "pending_bg_tasks": self.pending_bg_tasks,
            "tier_since_seconds_ago": round(time.monotonic() - self.tier_since, 1),
            "tier_reason": self.tier_reason,
        }


class ResourcePolicy:
    """Singleton resource policy engine.

    Call ``update(ram_percent, cpu_percent, ...)`` periodically (e.g. from
    ResourceMonitor).  Consumers call ``can_proceed(priority)`` to check
    whether their work should run.
    """

    def __init__(self) -> None:
        self._state = ResourcePolicyState()
        self._transition = TierTransition()
        self._last_user_activity: float = 0.0  # monotonic timestamp

    # ── Public API ──────────────────────────────────────────────────────────

    def update(
        self,
        ram_percent: float,
        cpu_percent: float = 0.0,
        active_llm_ops: int = 0,
        pending_bg_tasks: int = 0,
    ) -> ResourceTier:
        """Recompute tier from current metrics.  Returns the new tier."""
        self._state.ram_percent = ram_percent
        self._state.cpu_percent = cpu_percent
        self._state.active_llm_ops = active_llm_ops
        self._state.pending_bg_tasks = pending_bg_tasks
        self._state.last_update = time.monotonic()

        # Determine target tier from RAM
        target = ResourceTier.NORMAL
        for tier in (ResourceTier.CRITICAL, ResourceTier.HIGH, ResourceTier.ELEVATED):
            if ram_percent >= TIER_THRESHOLDS[tier]:
                target = tier
                break

        # Also escalate if CPU is very high and many LLM ops queued
        if cpu_percent >= 90 and active_llm_ops >= 2:
            if target.value < ResourceTier.HIGH.value:
                target = ResourceTier.HIGH

        old_tier = self._state.tier
        new_tier = self._apply_hysteresis(old_tier, target, ram_percent)

        if new_tier != old_tier:
            reason = (
                f"RAM {ram_percent:.1f}% CPU {cpu_percent:.1f}% "
                f"LLM_ops={active_llm_ops} bg_tasks={pending_bg_tasks}"
            )
            self._state.tier = new_tier
            self._state.tier_since = time.monotonic()
            self._state.tier_reason = reason
            logger.info(
                "Resource tier changed: %s -> %s (%s)",
                old_tier.value,
                new_tier.value,
                reason,
                extra={
                    "event": "resource_tier_change",
                    "old_tier": old_tier.value,
                    "new_tier": new_tier.value,
                    "ram_percent": ram_percent,
                    "cpu_percent": cpu_percent,
                },
            )

        return new_tier

    def can_proceed(self, priority: TaskPriority) -> str:
        """Check if work at the given priority should proceed.

        Returns one of: "allow", "throttle", "block"
        """
        rules = TIER_RULES.get(self._state.tier, TIER_RULES[ResourceTier.NORMAL])
        return rules.get(priority, "allow")

    def should_allow(self, priority: TaskPriority) -> bool:
        """Convenience: True if work should proceed (allow or throttle)."""
        return self.can_proceed(priority) != "block"

    def is_chat_blocked(self) -> bool:
        """Chat is never blocked, but this is here for completeness."""
        return False

    def record_user_activity(self) -> None:
        """Record that the user just performed an action (chat, UI click).

        Used by resident agent to implement cooldown after user activity.
        """
        self._last_user_activity = time.monotonic()

    def seconds_since_user_activity(self) -> float:
        """Seconds since last recorded user activity."""
        if self._last_user_activity == 0:
            return float("inf")
        return time.monotonic() - self._last_user_activity

    def get_resident_interval_multiplier(self) -> float:
        """Return a multiplier for the resident agent's sleep interval.

        NORMAL → 1.0x, ELEVATED → 1.5x, HIGH → 3.0x, CRITICAL → skip
        """
        multipliers = {
            ResourceTier.NORMAL: 1.0,
            ResourceTier.ELEVATED: 1.5,
            ResourceTier.HIGH: 3.0,
            ResourceTier.CRITICAL: 10.0,  # effectively skip
        }
        return multipliers.get(self._state.tier, 1.0)

    @property
    def tier(self) -> ResourceTier:
        return self._state.tier

    @property
    def state(self) -> ResourcePolicyState:
        return self._state

    def get_state_dict(self) -> dict:
        return self._state.to_dict()

    def get_skip_reason(self, priority: TaskPriority) -> Optional[str]:
        """Return a human-readable skip reason, or None if work should proceed."""
        decision = self.can_proceed(priority)
        if decision == "allow":
            return None
        tier = self._state.tier
        ram = self._state.ram_percent
        if decision == "block":
            return f"blocked_resource_tier_{tier.value}_ram_{ram:.0f}pct"
        return f"throttled_resource_tier_{tier.value}_ram_{ram:.0f}pct"

    # ── Internal ────────────────────────────────────────────────────────────

    def _apply_hysteresis(
        self, current: ResourceTier, target: ResourceTier, ram_percent: float
    ) -> ResourceTier:
        """Apply hysteresis to prevent rapid tier oscillation."""
        tier_order = [
            ResourceTier.NORMAL,
            ResourceTier.ELEVATED,
            ResourceTier.HIGH,
            ResourceTier.CRITICAL,
        ]
        current_idx = tier_order.index(current)
        target_idx = tier_order.index(target)

        if target_idx > current_idx:
            # Escalating — require consecutive samples above threshold
            self._transition.up_consecutive += 1
            self._transition.down_consecutive = 0
            if self._transition.up_consecutive >= HYSTERESIS_UP_COUNT:
                self._transition.up_consecutive = 0
                return target
            return current

        elif target_idx < current_idx:
            # De-escalating — check margin below current tier's threshold
            current_threshold = TIER_THRESHOLDS.get(current, 0)
            if ram_percent < current_threshold - HYSTERESIS_DOWN_MARGIN:
                self._transition.down_consecutive += 1
                self._transition.up_consecutive = 0
                if self._transition.down_consecutive >= HYSTERESIS_DOWN_COUNT:
                    self._transition.down_consecutive = 0
                    # Step down one tier at a time
                    return tier_order[current_idx - 1]
            else:
                self._transition.down_consecutive = 0
            return current

        else:
            # Same tier — reset counters
            self._transition.up_consecutive = 0
            self._transition.down_consecutive = 0
            return current


# ── Singleton ───────────────────────────────────────────────────────────────

_policy = ResourcePolicy()


def get_resource_policy() -> ResourcePolicy:
    return _policy
