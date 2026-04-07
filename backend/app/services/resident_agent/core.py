"""
Resident Agent – dlouho běžící daemon agent který žije v Macu.

Má vlastní async loop, čte úkoly z fronty, provádí periodické checks.
LLM dostane vždy jen: system_summary + allowed_actions + posledních 5 kroků.
LLM vrací POUZE JSON payload – exekuci dělá vždy deterministický Python kód.
"""

import asyncio
import json
import logging
import time
import traceback
from collections import deque
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional

import structlog

from app.core.settings import (
    ActionBlockedError,
)  # noqa: F401 – re-exported for convenience
from app.services.background_service import BackgroundService
from app.services.resource_monitor import get_resource_monitor
from app.services.resource_policy import (
    ResourceTier,
    TaskPriority,
    get_resource_policy,
)
from app.services.metrics_service import (
    agent_cycles_total,
    resident_cycles_total,
    resident_queue_depth,
)
from .memory import MemoryMixin
from .pending_actions import PendingActionsMixin
from .tools import ToolsMixin

logger = logging.getLogger(__name__)
log = structlog.get_logger("resident_agent")

# WS event types (imported locally to avoid circular imports)
WS_EVENT_RESIDENT_TICK = "resident_tick"
WS_EVENT_RESIDENT_ACTION = "resident_action"

ALLOWED_ACTIONS = [
    "read_file",
    "list_directory",
    "git_status",
    "git_log",
    "kb_search",
    "memory_store",
    "memory_search",
    "send_notification",
    "system_status",
    "spawn_specialist",
    "web_search",
    "no_op",
    "system_health",
    "github_ci_status",
    "lean_metrics",
    "write_memory",
    "create_mission",
]

# ── Action tiers (Hardening v2) ───────────────────────────────────────────────

ACTION_TIERS: dict[str, list[str]] = {
    "safe": [
        "observe_status",
        "check_logs",
        "read_kb",
        "propose_mission",
        "system_health",
        "github_ci_status",
        "system_status",
        "no_op",
    ],
    "medium": [
        "read_file",
        "list_directory",
        "git_status",
        "git_log",
        "kb_search",
        "memory_search",
        "memory_store",
        "web_search",
        "send_notification",
        "lean_metrics",
        "spawn_general_agent",
        "queue_job",
        "update_settings",
        "spawn_specialist",
        "write_memory",
        "create_mission",
    ],
    "dangerous": [
        "spawn_devops_agent",
        "git_operations",
        "system_commands",
        "delete_files",
        "write_file",
    ],
}

# Cooldown per action in seconds – prevents rapid repeated execution
ACTION_COOLDOWNS: dict[str, int] = {
    "git_operations": 3_600,  # 1 hour
    "system_commands": 7_200,  # 2 hours
    "spawn_devops_agent": 86_400,  # 24 hours
    "write_file": 300,  # 5 minutes
    "delete_files": 3_600,  # 1 hour
}

# Mode-based guardrails: which actions each mode can execute
MODE_ALLOWED_ACTIONS = {
    "observer": {"system_health", "github_ci_status", "system_status", "no_op"},
    "advisor": {
        "system_health",
        "github_ci_status",
        "system_status",
        "no_op",
        "read_file",
        "list_directory",
        "git_status",
        "git_log",
        "kb_search",
        "memory_search",
        "lean_metrics",
        "write_memory",
        "memory_store",
    },
    "autonomous": set(ALLOWED_ACTIONS),  # all actions
}


# Heartbeat / self-healing constants
HEARTBEAT_INTERVAL_S = 30
HEARTBEAT_MISS_THRESHOLD_S = 90  # 3 missed heartbeats → degraded
CONSECUTIVE_ERROR_THRESHOLD = 5  # trigger self-healing restart

# Proactive alert thresholds
QUEUE_DEPTH_ALERT_THRESHOLD = 10
KB_DOCS_ALERT_THRESHOLD = 5000


@dataclass
class ResidentAgentState:
    is_running: bool = False
    current_task: Optional[str] = None
    last_tick: Optional[str] = None
    last_action: Optional[str] = None
    tick_count: int = 0
    errors_since_start: int = 0
    consecutive_errors: int = 0
    recent_steps: list[dict] = field(default_factory=list)  # max 5 položek
    status: str = "idle"  # idle | thinking | executing | error
    started_at: Optional[str] = None
    last_heartbeat: Optional[str] = None
    heartbeat_status: str = "healthy"  # healthy | degraded | error
    alerts: list[str] = field(default_factory=list)
    # Live activity fields
    current_thought: str = ""
    next_run_in: int = 0  # seconds until next tick
    cycle_count: int = 0  # alias for tick_count for UI
    # ── Explicit lifecycle phase (hardening) ─────────────────────────────
    # idle | thinking | waiting_llm | retrying_llm | executing |
    # cooldown | error | degraded | paused
    phase: str = "idle"
    active_cycle_id: Optional[str] = None
    cycle_started_at: Optional[str] = None
    last_success_at: Optional[str] = None
    last_error: Optional[str] = None
    last_error_at: Optional[str] = None
    retry_count: int = 0
    next_run_at: Optional[str] = None
    in_progress: bool = False
    # ── Degraded mode ────────────────────────────────────────────────────
    degraded_mode: bool = False
    degraded_reason: Optional[str] = None
    consecutive_failures: int = 0  # alias for consecutive_errors for UI
    # ── LLM observability ───────────────────────────────────────────────
    current_model: Optional[str] = None
    last_llm_duration_ms: Optional[float] = None

    def to_dict(self) -> dict:
        d = asdict(self)
        d["cycle_count"] = d["tick_count"]
        return d


THOUGHT_TICK_INTERVAL = 6  # run reasoner every 6th tick (~12 min at 120s interval)
MISSION_TICK_INTERVAL = 6  # check missions every 6th tick (~12 min)
PROACTIVE_TICK_INTERVAL = 3  # deterministic proactive action every 3rd tick (~6 min)
CURIOSITY_TICK_INTERVAL = 10  # curiosity backlog every 10th tick (~5 min)
MAX_CURIOSITY_IN_PROGRESS = 3  # WIP limit for concurrent curiosity items

# Actions that can be dispatched directly without LLM
DIRECT_DISPATCH_ACTIONS = frozenset(
    {
        "system_health",
        "git_status",
        "lean_metrics",
        "kb_search",
        "memory_store",
        "memory_search",
        "write_memory",
        "create_mission",
        "system_status",
        "no_op",
    }
)
MAX_SUGGESTIONS_HISTORY = 20
MAX_REFLECTIONS_HISTORY = 50
MAX_CYCLE_HISTORY = 200
MAX_LOG_ENTRIES = 1000

# Performance: metrics cache TTL
METRICS_CACHE_TTL_S = 60  # 1 minute
# Performance: KB reindex cooldown
KB_REINDEX_COOLDOWN_S = 300  # 5 minutes

# ── Budget / rate limits ──────────────────────────────────────────────
import os as _os

RESIDENT_MAX_LLM_CALLS_PER_HOUR = int(
    _os.environ.get("RESIDENT_MAX_LLM_CALLS_PER_HOUR", "20")
)
RESIDENT_MAX_MISSIONS_PER_DAY = int(
    _os.environ.get("RESIDENT_MAX_MISSIONS_PER_DAY", "5")
)
RESIDENT_MAX_ANALYSIS_JOBS_PER_HOUR = int(
    _os.environ.get("RESIDENT_MAX_ANALYSIS_JOBS_PER_HOUR", "10")
)
RESIDENT_LLM_COOLDOWN_AFTER_FAIL_S = int(
    _os.environ.get("RESIDENT_LLM_COOLDOWN_AFTER_FAIL_S", "120")
)

# ── Cycle lifecycle / timeout policy ────────────────────────────────────────
# Configurable via env – defaults are conservative but not excessively tight.
RESIDENT_LLM_TIMEOUT_SECONDS = int(
    _os.environ.get("RESIDENT_LLM_TIMEOUT_SECONDS", "90")
)
RESIDENT_LLM_MAX_RETRIES = int(
    _os.environ.get("RESIDENT_LLM_MAX_RETRIES", "2")
)
# When True (default), a second cycle cannot start while the first is active.
RESIDENT_CYCLE_LOCK_ENABLED = (
    _os.environ.get("RESIDENT_CYCLE_LOCK_ENABLED", "true").lower() == "true"
)
# How long to wait in cooldown after a timeout-final before allowing a new cycle.
RESIDENT_TIMEOUT_COOLDOWN_SECONDS = int(
    _os.environ.get("RESIDENT_TIMEOUT_COOLDOWN_SECONDS", "120")
)
# How many consecutive failures before entering degraded mode.
# In degraded mode only safe deterministic actions are permitted.
RESIDENT_MAX_CONSECUTIVE_FAILURES_BEFORE_DEGRADED = int(
    _os.environ.get("RESIDENT_MAX_CONSECUTIVE_FAILURES_BEFORE_DEGRADED", "3")
)

# ── Degraded mode: safe-only action allowlist ────────────────────────────────
# When the agent is in degraded mode it may only run these deterministic,
# low-risk actions that do not require an LLM call.
DEGRADED_SAFE_ACTIONS: frozenset[str] = frozenset(
    {
        "system_health",
        "github_ci_status",
        "lean_metrics",
        "git_status",
        "system_status",
        "no_op",
    }
)

WS_EVENT_RESIDENT_SUGGESTION = "resident_suggestion"


@dataclass
class CycleRecord:
    """A single cycle history entry."""

    cycle_id: str
    cycle_number: int
    timestamp: str
    status: str  # success | error
    action_type: str = ""
    action_target: str = ""
    output_preview: str = ""
    duration_ms: float = 0.0
    error: str = ""

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class LogEntry:
    """A single structured log entry."""

    timestamp: str
    level: str  # INFO | WARN | ERROR
    event: str
    cycle_id: str = ""
    data: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class MissionProposal:
    """A proposed mission awaiting user approval."""

    id: str
    name: str
    description: str
    type: str  # research / code / analysis
    estimated_minutes: int
    relevance: str  # why now
    status: str = "pending"  # pending / approved / rejected
    created_at: str = ""

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class AgentSettings:
    """Runtime-configurable agent settings."""

    interval_seconds: int = 120
    model: str = ""  # empty = use default from settings
    max_cycles_per_day: int = 100
    quiet_hours_start: str = "22:00"  # HH:MM
    quiet_hours_end: str = "07:00"  # HH:MM
    quiet_hours_enabled: bool = False
    # Mission proposal settings
    proposal_interval_minutes: int = 60  # how often to propose missions
    max_proposals: int = 3  # max proposals per round
    interest_topics: str = ""  # comma-separated topics of interest

    def to_dict(self) -> dict:
        return asdict(self)


class ResidentAgent(MemoryMixin, PendingActionsMixin, ToolsMixin, BackgroundService):
    def __init__(self) -> None:
        super().__init__("resident_agent")
        self._state = ResidentAgentState()
        self._broadcast_fn: Optional[Callable] = None
        self._start_time: Optional[float] = None
        self._restart_requested: bool = False
        self._paused: bool = False
        # Brain orchestrator state
        self._suggestions: List[Any] = []  # List[ResidentSuggestion]
        self._reflections: List[Any] = []  # List[ResidentReflection]
        # History & logging
        self._cycle_history: deque = deque(maxlen=MAX_CYCLE_HISTORY)
        self._log_entries: deque = deque(maxlen=MAX_LOG_ENTRIES)
        self._agent_settings = AgentSettings()
        self._daily_cycle_count: int = 0
        self._daily_reset_date: str = ""
        # Mission proposals
        self._proposals: List[MissionProposal] = []
        self._last_proposal_time: Optional[float] = None
        # Live thought stream (SSE consumers read from here)
        self._thought_queue: asyncio.Queue = asyncio.Queue(maxsize=500)
        # Performance: metrics cache with TTL
        self._metrics_cache: Dict[str, Any] = {}
        self._metrics_cache_ts: float = 0.0
        # Performance: KB reindex cooldown
        self._last_reindex_ts: float = 0.0
        # Guardrail runtime state (must be initialised here – used by check_action_allowed)
        self._action_last_executed: Dict[str, float] = {}
        self._daily_action_counts: Dict[str, int] = {}
        self._daily_action_reset_date: str = ""
        # Metrics: how many actions were blocked since start
        self._blocked_actions_since_start: int = 0
        # Mode change tracking for audit trail
        self._last_known_mode: str = ""
        # Pending actions for advisor mode
        self._pending_actions: List[dict] = []
        # Proactive action round-robin index
        self._proactive_action_index: int = 0
        # Budget / rate limit counters
        self._llm_calls_this_hour: int = 0
        self._llm_calls_reset_at: float = time.monotonic() + 3600
        self._missions_today: int = 0
        self._missions_reset_date: str = ""
        self._analysis_jobs_this_hour: int = 0
        self._analysis_jobs_reset_at: float = time.monotonic() + 3600
        self._llm_last_fail_at: float = 0.0
        # ── Cycle lifecycle lock (hardening) ─────────────────────────────
        # Ensures at most one cycle is active at any moment.
        self._cycle_in_progress: bool = False
        # monotonic timestamp: block new cycles until this time after timeout
        self._cycle_cooldown_until: float = 0.0
        # monotonic timestamp when degraded mode was entered (0 = not degraded)
        self._degraded_since_at: float = 0.0

    def _set_phase(self, phase: str, cycle_id: str = "") -> None:
        """Update the explicit lifecycle phase and sync dependent state fields."""
        self._state.phase = phase
        # Keep legacy `status` in sync so old consumers still work
        _phase_to_status = {
            "idle": "idle",
            "thinking": "thinking",
            "waiting_llm": "thinking",
            "retrying_llm": "thinking",
            "executing": "executing",
            "cooldown": "idle",
            "error": "error",
            "degraded": "degraded",
            "paused": "idle",
        }
        self._state.status = _phase_to_status.get(phase, phase)
        self._state.in_progress = phase not in (
            "idle", "cooldown", "error", "degraded", "paused"
        )
        if phase == "idle":
            self._state.active_cycle_id = None
            self._state.cycle_started_at = None
        if cycle_id:
            self._add_log(
                "INFO",
                "cycle_phase_change",
                cycle_id=cycle_id,
                phase=phase,
            )

    def _enter_degraded_mode(self, reason: str, cycle_id: str = "") -> None:
        """Switch resident to degraded mode (LLM ticks disabled, safe actions only)."""
        if self._state.degraded_mode:
            return  # already degraded, no duplicate entry
        self._state.degraded_mode = True
        self._state.degraded_reason = reason
        self._degraded_since_at = time.monotonic()
        self._add_log(
            "WARN",
            "degraded_mode_entered",
            cycle_id=cycle_id,
            reason=reason,
            consecutive_failures=self._state.consecutive_failures,
        )

    def _exit_degraded_mode(self, cycle_id: str = "") -> None:
        """Clear degraded mode after a successful cycle."""
        if not self._state.degraded_mode:
            return
        duration_s = round(time.monotonic() - self._degraded_since_at, 1)
        self._state.degraded_mode = False
        self._state.degraded_reason = None
        self._degraded_since_at = 0.0
        self._add_log(
            "INFO",
            "degraded_mode_exited",
            cycle_id=cycle_id,
            degraded_for_s=duration_s,
        )

    def set_broadcast(self, fn: Callable) -> None:
        """Register a coroutine for broadcasting WebSocket messages."""
        self._broadcast_fn = fn

    async def _broadcast(self, message: dict) -> None:
        if self._broadcast_fn:
            try:
                await self._broadcast_fn(message)
            except Exception as exc:
                logger.debug("Resident agent broadcast failed: %s", exc)

    def _add_log(self, level: str, event: str, cycle_id: str = "", **data) -> None:
        """Add a structured log entry to the in-memory ring buffer."""
        entry = LogEntry(
            timestamp=_now(),
            level=level,
            event=event,
            cycle_id=cycle_id,
            data=data,
        )
        self._log_entries.append(entry)
        # Also emit via structlog
        log_fn = (
            log.info
            if level == "INFO"
            else (log.warning if level == "WARN" else log.error)
        )
        log_fn(event, cycle_id=cycle_id, **data)

    def _add_cycle_record(self, record: CycleRecord) -> None:
        """Add a cycle record to in-memory history and persist to SQLite."""
        self._cycle_history.append(record)
        # Persist to SQLite in background (fire-and-forget)
        try:
            from app.db.resident_state import get_resident_state_db

            db = get_resident_state_db()
            db.save_cycle(
                cycle_id=record.cycle_id,
                cycle_number=record.cycle_number,
                timestamp=record.timestamp,
                status=record.status,
                action_type=record.action_type,
                action_target=record.action_target,
                output_preview=record.output_preview,
                duration_ms=record.duration_ms,
                error=record.error,
            )
        except Exception as exc:
            logger.debug("Failed to persist cycle record: %s", exc)

    def get_cycle_history(self, limit: int = 20) -> List[dict]:
        """Return recent cycle history as dicts."""
        items = list(self._cycle_history)[-limit:]
        return [r.to_dict() for r in items]

    def get_logs(
        self, level: Optional[str] = None, cycle: Optional[str] = None, limit: int = 100
    ) -> List[dict]:
        """Return filtered log entries."""
        entries = list(self._log_entries)
        if level:
            entries = [e for e in entries if e.level == level.upper()]
        if cycle:
            entries = [e for e in entries if e.cycle_id == cycle]
        return [e.to_dict() for e in entries[-limit:]]

    def clear_logs(self) -> int:
        """Clear all log entries. Returns count cleared."""
        count = len(self._log_entries)
        self._log_entries.clear()
        return count

    @property
    def paused(self) -> bool:
        return self._paused

    async def pause(self) -> dict:
        """Pause the agent (stays running but skips ticks)."""
        if self._paused:
            return {"status": "already_paused"}
        self._paused = True
        self._state.status = "paused"
        self._add_log("INFO", "agent_paused")
        await self._broadcast(
            {"type": "agent_status", "status": "paused", "is_running": True}
        )
        return {"status": "paused", "message": "Agent paused."}

    async def resume(self) -> dict:
        """Resume a paused agent."""
        if not self._paused:
            return {"status": "not_paused"}
        self._paused = False
        self._state.status = "idle"
        self._add_log("INFO", "agent_resumed")
        return {"status": "resumed", "message": "Agent resumed."}

    async def run_now(self) -> dict:
        """Trigger an immediate cycle, bypassing the interval wait."""
        if not self._state.is_running:
            return {"status": "not_running", "message": "Agent is not running."}
        was_paused = self._paused
        self._paused = False  # temporarily unpause
        self._add_log("INFO", "run_now_triggered")
        try:
            await self._tick()
        finally:
            if was_paused:
                self._paused = True
        return {
            "status": "ok",
            "message": "Immediate cycle completed.",
            "cycle": self._state.tick_count,
        }

    async def reset(self) -> dict:
        """Reset counters, history, and agent memory."""
        self._state.tick_count = 0
        self._state.errors_since_start = 0
        self._state.consecutive_errors = 0
        self._state.recent_steps = []
        self._state.alerts = []
        self._state.current_thought = ""
        self._state.last_action = None
        self._cycle_history.clear()
        self._log_entries.clear()
        self._daily_cycle_count = 0
        self._suggestions.clear()
        self._reflections.clear()
        self._add_log("INFO", "agent_reset")
        return {"status": "ok", "message": "Agent reset complete."}

    def get_agent_settings(self) -> dict:
        return self._agent_settings.to_dict()

    def update_agent_settings(self, updates: dict) -> dict:
        """Update runtime agent settings."""
        for key, value in updates.items():
            if hasattr(self._agent_settings, key):
                setattr(self._agent_settings, key, value)
        self._add_log("INFO", "settings_updated", **updates)
        return self._agent_settings.to_dict()

    def get_cached_metrics(self) -> Dict[str, Any]:
        """Return metrics with a 1-minute TTL cache to avoid expensive recalculation."""
        now = time.monotonic()
        if now - self._metrics_cache_ts < METRICS_CACHE_TTL_S and self._metrics_cache:
            return self._metrics_cache
        metrics = {
            "tick_count": self._state.tick_count,
            "errors_since_start": self._state.errors_since_start,
            "consecutive_errors": self._state.consecutive_errors,
            "uptime_seconds": round(self.get_uptime_seconds(), 1),
            "cycle_history_len": len(self._cycle_history),
            "log_entries_len": len(self._log_entries),
            "heartbeat_status": self._state.heartbeat_status,
            "daily_cycle_count": self._daily_cycle_count,
        }
        self._metrics_cache = metrics
        self._metrics_cache_ts = now
        return metrics

    def should_reindex_kb(self) -> bool:
        """Check KB reindex cooldown – prevents reindex more often than every 5 min."""
        now = time.time()
        if now - self._last_reindex_ts < KB_REINDEX_COOLDOWN_S:
            return False
        self._last_reindex_ts = now
        return True

    def _is_quiet_hours(self) -> bool:
        """Check if current time is within quiet hours."""
        if not self._agent_settings.quiet_hours_enabled:
            return False
        now = datetime.now()
        current_minutes = now.hour * 60 + now.minute
        try:
            start_h, start_m = map(
                int, self._agent_settings.quiet_hours_start.split(":")
            )
            end_h, end_m = map(int, self._agent_settings.quiet_hours_end.split(":"))
        except (ValueError, AttributeError):
            return False
        start_minutes = start_h * 60 + start_m
        end_minutes = end_h * 60 + end_m
        if start_minutes <= end_minutes:
            return start_minutes <= current_minutes < end_minutes
        else:
            # Overnight: e.g. 22:00 - 07:00
            return current_minutes >= start_minutes or current_minutes < end_minutes

    def _check_daily_limit(self) -> bool:
        """Check if daily cycle limit is reached. Resets counter at midnight."""
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        if self._daily_reset_date != today:
            self._daily_reset_date = today
            self._daily_cycle_count = 0
        return self._daily_cycle_count < self._agent_settings.max_cycles_per_day

    # ── Guardrail helpers (Hardening v2) ────────────────────────────────────────

    def _get_action_tier(self, action: str) -> str:
        """Return the tier ('safe'|'medium'|'dangerous') for an action."""
        for tier, actions in ACTION_TIERS.items():
            if action in actions:
                return tier
        return "medium"  # unknown actions default to medium

    def check_action_allowed(self, action: str) -> None:
        """Raise ActionBlockedError if action is blocked by current guardrails.

        Checks (in order):
        1. Autonomy level (mode tier gate)
        2. Cooldown
        3. Daily budget
        """
        from app.core.settings import get_guardrail_settings

        gs = get_guardrail_settings()
        autonomy = gs.effective_resident_autonomy()
        tier = self._get_action_tier(action)

        # Mode gate
        if autonomy == "observer" and tier in ("medium", "dangerous"):
            raise ActionBlockedError(
                f"Action '{action}' (tier={tier}) blocked – observer mode only allows safe actions"
            )
        if autonomy == "advisor" and tier == "dangerous":
            raise ActionBlockedError(
                f"Action '{action}' (tier=dangerous) blocked – requires autonomous mode"
            )

        # Cooldown gate
        cooldown = ACTION_COOLDOWNS.get(action)
        if cooldown:
            last: Optional[float] = self._action_last_executed.get(action)
            if last is not None:
                elapsed = time.monotonic() - last
            else:
                elapsed = cooldown + 1  # never executed → no cooldown
            if elapsed < cooldown:
                remaining = int(cooldown - elapsed)
                raise ActionBlockedError(
                    f"Action '{action}' is on cooldown for {remaining}s more"
                )

        # Daily budget gate
        self._refresh_daily_action_counts()
        budget = gs.resident.max_daily_actions.get(action)
        if budget is not None:
            used = self._daily_action_counts.get(action, 0)
            if used >= budget:
                raise ActionBlockedError(
                    f"Action '{action}' daily budget exhausted ({used}/{budget})"
                )

    def record_action_executed(self, action: str) -> None:
        """Update cooldown timestamp and daily counter after successful execution."""
        self._action_last_executed[action] = time.monotonic()  # type: ignore[assignment]
        self._refresh_daily_action_counts()
        self._daily_action_counts[action] = self._daily_action_counts.get(action, 0) + 1

        # Emit metric
        try:
            from app.services.metrics_service import (
                resident_action_budget_daily,
                resident_action_budget_remaining,
            )
            from app.core.settings import get_guardrail_settings

            gs = get_guardrail_settings()
            budget = gs.resident.max_daily_actions.get(action, 0)
            used = self._daily_action_counts.get(action, 1)
            resident_action_budget_daily.labels(action=action).set(used)
            if budget:
                resident_action_budget_remaining.labels(action=action).set(
                    max(0, budget - used)
                )
        except Exception:
            pass

        # Log dangerous actions
        tier = self._get_action_tier(action)
        if tier == "dangerous":
            self._add_log("WARN", "dangerous_action_executed", action=action)

    def _refresh_daily_action_counts(self) -> None:
        """Reset daily counters at midnight UTC."""
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        if self._daily_action_reset_date != today:
            self._daily_action_reset_date = today
            self._daily_action_counts.clear()

    def get_guardrail_status(self) -> dict:
        """Return current guardrail state for API/UI."""
        from app.core.settings import get_guardrail_settings

        gs = get_guardrail_settings()
        self._refresh_daily_action_counts()
        now = time.monotonic()
        cooldown_status = {}
        for action, cooldown in ACTION_COOLDOWNS.items():
            last = self._action_last_executed.get(action)
            remaining = max(0, int(cooldown - (now - last))) if last is not None else 0
            cooldown_status[action] = {"cooldown_s": cooldown, "remaining_s": remaining}
        return {
            "safe_mode": gs.safe_mode,
            "autonomy_level": gs.effective_resident_autonomy(),
            "daily_action_counts": dict(self._daily_action_counts),
            "daily_action_budgets": gs.resident.max_daily_actions,
            "cooldowns": cooldown_status,
        }

    # ── Budget / rate limit helpers ──────────────────────────────────────

    def _refresh_budget_counters(self) -> None:
        """Reset hourly/daily budget counters when their window expires."""
        now = time.monotonic()
        if now >= self._llm_calls_reset_at:
            self._llm_calls_this_hour = 0
            self._llm_calls_reset_at = now + 3600
        if now >= self._analysis_jobs_reset_at:
            self._analysis_jobs_this_hour = 0
            self._analysis_jobs_reset_at = now + 3600
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        if self._missions_reset_date != today:
            self._missions_today = 0
            self._missions_reset_date = today

    def _can_llm_call(self) -> bool:
        """Check if an LLM call is within budget and cooldown."""
        self._refresh_budget_counters()
        # Cooldown after LLM failure
        if self._llm_last_fail_at > 0:
            elapsed = time.monotonic() - self._llm_last_fail_at
            if elapsed < RESIDENT_LLM_COOLDOWN_AFTER_FAIL_S:
                return False
        return self._llm_calls_this_hour < RESIDENT_MAX_LLM_CALLS_PER_HOUR

    def _record_llm_call(self) -> None:
        self._refresh_budget_counters()
        self._llm_calls_this_hour += 1
        try:
            from app.services.metrics_service import resident_llm_calls_total

            resident_llm_calls_total.inc()
        except Exception:
            pass

    def _record_llm_fail(self) -> None:
        self._llm_last_fail_at = time.monotonic()

    def _can_create_mission(self) -> bool:
        self._refresh_budget_counters()
        return self._missions_today < RESIDENT_MAX_MISSIONS_PER_DAY

    def _record_mission_created(self) -> None:
        self._refresh_budget_counters()
        self._missions_today += 1
        try:
            from app.services.metrics_service import resident_missions_created_total

            resident_missions_created_total.inc()
        except Exception:
            pass

    def _can_analysis_job(self) -> bool:
        self._refresh_budget_counters()
        return self._analysis_jobs_this_hour < RESIDENT_MAX_ANALYSIS_JOBS_PER_HOUR

    def _record_analysis_job(self) -> None:
        self._refresh_budget_counters()
        self._analysis_jobs_this_hour += 1

    def get_budget_status(self) -> dict:
        """Return current budget counters for the API."""
        self._refresh_budget_counters()
        return {
            "llm_calls_this_hour": self._llm_calls_this_hour,
            "llm_calls_limit": RESIDENT_MAX_LLM_CALLS_PER_HOUR,
            "missions_today": self._missions_today,
            "missions_limit": RESIDENT_MAX_MISSIONS_PER_DAY,
            "analysis_jobs_this_hour": self._analysis_jobs_this_hour,
            "analysis_jobs_limit": RESIDENT_MAX_ANALYSIS_JOBS_PER_HOUR,
        }

    def get_state(self) -> dict:
        d = self._state.to_dict()
        d["paused"] = self._paused
        d["quiet_hours_active"] = self._is_quiet_hours()
        d["agent_settings"] = self._agent_settings.to_dict()
        d["budget"] = self.get_budget_status()
        return d

    def get_uptime_seconds(self) -> float:
        if self._start_time is None:
            return 0.0
        return time.monotonic() - self._start_time

    async def _seed_initial_jobs(self) -> None:
        """Create seed jobs if the resident_task queue is empty on startup."""
        try:
            from app.services.job_service import get_job_service

            job_svc = get_job_service()
            # Reset any stale running jobs from previous crash
            job_svc.reset_stale_running_jobs()

            queued = job_svc.list_jobs(status="queued", type="resident_task", limit=5)
            if queued:
                logger.info("Seed skipped – %d jobs already queued", len(queued))
                return

            job_svc.create_job(
                type="resident_task",
                title="Inicializační system check",
                input_summary="Zkontroluj stav systému, git projekty a zapiš do paměti.",
                payload={"action_type": "system_health", "auto_seed": True},
                priority="normal",
            )
            job_svc.create_job(
                type="resident_task",
                title="Načti lean metriky",
                input_summary="Přečti job queue stats a ulož do paměti.",
                payload={"action_type": "lean_metrics", "auto_seed": True},
                priority="normal",
            )
            logger.info("Seeded 2 initial resident_task jobs")
            self._add_log("INFO", "seed_jobs_created", count=2)
        except Exception as exc:
            logger.warning("Failed to seed initial jobs: %s", exc)

    async def _on_start(self) -> None:
        # Log once at startup if git proactive check is disabled
        try:
            from app.services.settings_service import get_settings_service

            settings = get_settings_service().load()
            git_projects = settings.get("git_projects", [])
            has_enabled = any(p.get("enabled", True) for p in git_projects)
            if not has_enabled:
                logger.info("Git proactive check disabled – no projects configured")
        except Exception:
            pass

        try:
            from app.services.memory_service import get_memory_service

            mem = get_memory_service()
            await mem.add_memory(
                text="Resident agent started",
                tags=["resident", "lifecycle"],
                source="resident_agent",
                importance=3,
            )
        except Exception as exc:
            logger.debug("Failed to store resident agent start in memory: %s", exc)

    async def _on_stop(self) -> None:
        try:
            from app.services.memory_service import get_memory_service

            mem = get_memory_service()
            await mem.add_memory(
                text=f"Resident agent stopped after {self._state.tick_count} ticks, "
                f"{self._state.errors_since_start} errors",
                tags=["resident", "lifecycle"],
                source="resident_agent",
                importance=3,
            )
        except Exception as exc:
            logger.debug("Failed to store resident agent stop in memory: %s", exc)

    async def _warmup_llm(self) -> None:
        """Warm-up ping: load the model into Ollama RAM before the first cycle.

        Uses a longer timeout (120s) because cold-loading a model from disk
        can take 30-60s on an 8 GB Mac.
        """
        try:
            from app.services.llm_service import get_llm_service
            from app.services.settings_service import get_settings_service

            llm_svc = get_llm_service()
            model_name = self._agent_settings.model or None
            if not model_name:
                llm_cfg = get_settings_service().get_llm_config(profile="general")
                model_name = llm_cfg.get("model") or "llama3.2:latest"

            log.info("Warming up LLM model", model=model_name)
            self._state.status = "warming_up"
            self._state.current_thought = f"Načítám model {model_name}..."

            async with asyncio.timeout(120):
                await llm_svc.generate(
                    message="Odpověz jedním slovem: OK",
                    mode="resident",
                    profile="general",
                    model_override=model_name,
                )

            log.info("LLM warm-up completed", model=model_name)
            self._add_log("INFO", "llm_warmup_ok", model=model_name)
        except asyncio.TimeoutError:
            log.warning("LLM warm-up timed out (120s)", model=model_name)
            self._add_log("WARN", "llm_warmup_timeout", model=model_name)
        except Exception as exc:
            log.warning("LLM warm-up failed", error=str(exc))
            self._add_log("WARN", "llm_warmup_failed", error=str(exc))
        finally:
            self._state.status = "idle"
            self._state.current_thought = ""

    async def start(self) -> dict:
        """Spustí async loop jako asyncio.Task, uloží do memory_service záznam o startu."""
        if self._state.is_running:
            return {
                "status": "already_running",
                "message": "Resident agent is already running.",
            }

        self._state.is_running = True
        self._state.status = "idle"
        self._state.tick_count = 0
        self._state.errors_since_start = 0
        self._state.consecutive_errors = 0
        self._state.recent_steps = []
        self._state.started_at = _now()
        self._state.last_heartbeat = None
        self._state.heartbeat_status = "healthy"
        self._state.alerts = []
        self._start_time = time.monotonic()
        self._restart_requested = False

        # Log model being used
        model_name = self._agent_settings.model or "(výchozí z LLM konfigurace)"
        log.info("Resident agent using model", model=model_name)
        self._add_log("INFO", "agent_start", model=model_name)

        # Warm-up LLM in background (don't block start)
        asyncio.create_task(self._warmup_llm())

        # Seed initial jobs if queue is empty
        await self._seed_initial_jobs()

        super().start()  # creates the asyncio.Task (sync, non-awaited)
        return {"status": "started", "message": "Resident agent started successfully."}

    async def stop(self) -> dict:
        """Graceful shutdown, uloží stav do memory."""
        if not self._state.is_running:
            return {
                "status": "not_running",
                "message": "Resident agent is not running.",
            }

        self._state.is_running = False
        self._state.status = "idle"
        tick_count = self._state.tick_count
        self._start_time = None
        await super().stop()  # sets stop_event, cancels task, awaits _on_stop
        logger.info("Resident agent stopped after %d ticks", tick_count)
        return {"status": "stopped", "message": f"Stopped after {tick_count} ticks."}

    # User activity cooldown: after user chat, resident backs off for this many seconds
    USER_ACTIVITY_COOLDOWN_S = 30

    async def _tick(self) -> None:
        """Single iteration of the resident agent loop.

        Resource-aware: uses the centralized ResourcePolicy to decide whether
        to run, throttle, or skip this cycle.
        """
        tick_start = time.monotonic()
        self._state.tick_count += 1
        self._state.last_tick = _now()
        cycle_id = f"cycle-{self._state.tick_count:04d}"

        policy = get_resource_policy()
        base_interval = self._agent_settings.interval_seconds

        # ── Cycle lock guard ────────────────────────────────────────────
        # Only one cycle may be active at a time (RESIDENT_CYCLE_LOCK_ENABLED).
        if RESIDENT_CYCLE_LOCK_ENABLED and self._cycle_in_progress:
            skip_phase = self._state.phase
            self._add_log(
                "WARN",
                "cycle_skip_active_in_progress",
                cycle_id=cycle_id,
                active_cycle_id=self._state.active_cycle_id or "",
                phase=skip_phase,
            )
            await self._heartbeat_broadcast()
            await asyncio.sleep(base_interval)
            return

        # ── Timeout cooldown guard ───────────────────────────────────────
        # After a final LLM timeout the agent enters a cooldown period before
        # new cycles are permitted.
        if RESIDENT_CYCLE_LOCK_ENABLED and time.monotonic() < self._cycle_cooldown_until:
            remaining = round(self._cycle_cooldown_until - time.monotonic(), 1)
            self._add_log(
                "INFO",
                "cycle_skip_cooldown",
                cycle_id=cycle_id,
                cooldown_remaining_s=remaining,
            )
            self._set_phase("cooldown")
            await self._heartbeat_broadcast()
            await asyncio.sleep(min(remaining, base_interval))
            return

        # Skip tick if paused
        if self._paused:
            await self._heartbeat_broadcast()
            await asyncio.sleep(base_interval)
            return

        # Skip tick during quiet hours
        if self._is_quiet_hours():
            self._state.status = "quiet"
            self._add_log("INFO", "quiet_hours_skip", cycle_id=cycle_id)
            await self._heartbeat_broadcast()
            await asyncio.sleep(base_interval)
            return

        # Skip if daily limit reached
        if not self._check_daily_limit():
            self._state.status = "limit_reached"
            self._add_log(
                "WARN",
                "daily_limit_reached",
                cycle_id=cycle_id,
                count=self._daily_cycle_count,
                max=self._agent_settings.max_cycles_per_day,
            )
            await self._heartbeat_broadcast()
            await asyncio.sleep(base_interval)
            return

        # ── Resource-aware skip/throttle ────────────────────────────────────
        decision = policy.can_proceed(TaskPriority.RESIDENT)
        tier = policy.tier

        if decision == "block":
            skip_reason = policy.get_skip_reason(TaskPriority.RESIDENT) or "resource_block"
            self._state.status = "resource_blocked"
            self._state.current_thought = f"Pozastaven: {tier.value} resource tier"
            self._add_log(
                "WARN",
                "cycle_skipped",
                cycle_id=cycle_id,
                reason=skip_reason,
                resource_tier=tier.value,
                ram_percent=policy.state.ram_percent,
            )
            await self._heartbeat_broadcast()
            # Sleep longer when blocked
            blocked_interval = base_interval * policy.get_resident_interval_multiplier()
            self._state.next_run_in = int(blocked_interval)
            await asyncio.sleep(blocked_interval)
            return

        # Cooldown after user activity: back off briefly so chat feels snappy
        since_user = policy.seconds_since_user_activity()
        if since_user < self.USER_ACTIVITY_COOLDOWN_S:
            wait_for = self.USER_ACTIVITY_COOLDOWN_S - since_user
            self._state.status = "user_cooldown"
            self._add_log(
                "INFO",
                "cycle_deferred_user_activity",
                cycle_id=cycle_id,
                seconds_since_user=round(since_user, 1),
                waiting=round(wait_for, 1),
            )
            await self._heartbeat_broadcast()
            await asyncio.sleep(wait_for)
            # Don't skip entirely — just delayed. Fall through to run the cycle.

        self._daily_cycle_count += 1

        # Heartbeat update
        self._state.last_heartbeat = _now()
        self._update_heartbeat_status()

        # ── Acquire cycle lock ───────────────────────────────────────────
        self._cycle_in_progress = True
        self._state.active_cycle_id = cycle_id
        self._state.cycle_started_at = _now()
        self._state.retry_count = 0
        self._set_phase("thinking", cycle_id)

        self._add_log(
            "INFO",
            "cycle_start",
            cycle_id=cycle_id,
            phase="thinking",
            last_action=self._state.last_action or "",
            memory_items=len(self._state.recent_steps),
            resource_tier=tier.value,
        )

        cycle_record = CycleRecord(
            cycle_id=cycle_id,
            cycle_number=self._state.tick_count,
            timestamp=_now(),
            status="success",
        )

        try:
            await self._process_task_queue()
            await self._process_missions()

            if self._state.degraded_mode:
                # ── Degraded mode: LLM ticks are skipped, safe deterministic
                # work only.  proactive_action_tick honours the allow-list
                # internally via check_action_allowed; here we just skip the
                # LLM-heavy thought / curiosity loops entirely.
                self._add_log(
                    "INFO",
                    "degraded_mode_tick",
                    cycle_id=cycle_id,
                    reason=self._state.degraded_reason or "",
                    consecutive_failures=self._state.consecutive_failures,
                )
            elif decision == "allow":
                # Normal mode – full LLM workflow
                await self._thought_tick()
                await self._proactive_action_tick()
                await self._curiosity_tick()
            else:
                self._add_log(
                    "INFO",
                    "llm_ticks_throttled",
                    cycle_id=cycle_id,
                    resource_tier=tier.value,
                    decision=decision,
                )
            self._set_phase("executing", cycle_id)
            await self._periodic_check()
            await self._proactive_alerts()
            # Digest and memory summarize only when resources allow and not degraded
            if decision == "allow" and not self._state.degraded_mode:
                await self._digest_tick()
                await self._summarize_old_memories()

            # Successful tick resets counters
            self._state.consecutive_errors = 0
            self._state.consecutive_failures = 0
            self._state.last_success_at = _now()
            self._state.last_error = None
            # Exit degraded mode after a clean cycle
            self._exit_degraded_mode(cycle_id=cycle_id)

            duration_ms = (time.monotonic() - tick_start) * 1000
            cycle_record.duration_ms = round(duration_ms, 1)
            cycle_record.action_type = self._state.last_action or "periodic"
            self._add_log(
                "INFO",
                "cycle_end",
                cycle_id=cycle_id,
                phase="done",
                duration_ms=cycle_record.duration_ms,
                next_run_in=self._agent_settings.interval_seconds,
                resource_tier=tier.value,
                degraded_mode=self._state.degraded_mode,
            )
        except Exception as exc:
            self._state.errors_since_start += 1
            self._state.consecutive_errors += 1
            self._state.consecutive_failures += 1
            self._state.last_error = str(exc)
            self._state.last_error_at = _now()
            duration_ms = (time.monotonic() - tick_start) * 1000
            cycle_record.status = "error"
            cycle_record.error = str(exc)
            cycle_record.duration_ms = round(duration_ms, 1)

            self._add_log(
                "ERROR",
                "cycle_abort",
                cycle_id=cycle_id,
                phase=self._state.phase,
                error=str(exc),
                duration_ms=round(duration_ms, 1),
                consecutive_failures=self._state.consecutive_failures,
                traceback=traceback.format_exc(),
            )
            self._set_phase("error", cycle_id)

            # ── Enter degraded mode if failure budget exceeded ───────────
            if (
                not self._state.degraded_mode
                and self._state.consecutive_failures
                >= RESIDENT_MAX_CONSECUTIVE_FAILURES_BEFORE_DEGRADED
            ):
                self._enter_degraded_mode(
                    reason=f"{self._state.consecutive_failures} consecutive failures",
                    cycle_id=cycle_id,
                )

            # Self-healing: too many consecutive errors → request restart
            if self._state.consecutive_errors >= CONSECUTIVE_ERROR_THRESHOLD:
                await self._request_self_healing_restart()
        finally:
            # ── Release cycle lock ───────────────────────────────────────
            self._cycle_in_progress = False
            if self._state.phase not in ("error", "cooldown"):
                if self._state.degraded_mode:
                    self._set_phase("degraded")
                else:
                    self._set_phase("idle")

        self._add_cycle_record(cycle_record)
        agent_cycles_total.labels(status=cycle_record.status).inc()

        # Map cycle status to resident_cycles_total labels
        _status_map = {"success": "success", "error": "fail", "aborted": "aborted"}
        _final_status = _status_map.get(cycle_record.status, "fail")
        resident_cycles_total.labels(status=_final_status).inc()

        await self._heartbeat_broadcast()

        # Adaptive interval: longer when system is under pressure
        interval_multiplier = policy.get_resident_interval_multiplier()
        effective_interval = base_interval * interval_multiplier
        self._state.next_run_in = int(effective_interval)
        from datetime import timedelta
        self._state.next_run_at = (
            datetime.now(timezone.utc) + timedelta(seconds=effective_interval)
        ).isoformat()
        await asyncio.sleep(effective_interval)

    async def _heartbeat_broadcast(self) -> None:
        """Push status via WebSocket for the live widget."""
        policy = get_resource_policy()
        resource_tier = policy.tier.value
        resident_decision = policy.can_proceed(TaskPriority.RESIDENT)

        _shared_state = {
            "status": self._state.status,
            "phase": self._state.phase,
            "active_cycle_id": self._state.active_cycle_id,
            "cycle_started_at": self._state.cycle_started_at,
            "last_success_at": self._state.last_success_at,
            "last_error": self._state.last_error,
            "last_error_at": self._state.last_error_at,
            "retry_count": self._state.retry_count,
            "in_progress": self._state.in_progress,
            "cycle_lock_active": self._cycle_in_progress,
            # Degraded mode
            "degraded_mode": self._state.degraded_mode,
            "degraded_reason": self._state.degraded_reason,
            "consecutive_failures": self._state.consecutive_failures,
            # LLM observability
            "current_model": self._state.current_model,
            "last_llm_duration_ms": self._state.last_llm_duration_ms,
        }
        await self._broadcast(
            {
                "type": WS_EVENT_RESIDENT_TICK,
                "tick": self._state.tick_count,
                "last_tick": self._state.last_tick,
                "heartbeat_status": self._state.heartbeat_status,
                "mode_restricted_actions_count": self._blocked_actions_since_start,
                "resource_tier": resource_tier,
                "resource_decision": resident_decision,
                **_shared_state,
            }
        )
        await self._broadcast(
            {
                "type": "agent_status",
                "next_run_at": self._state.next_run_at,
                "current_thought": self._state.current_thought,
                "last_action": self._state.last_action,
                "cycle_count": self._state.tick_count,
                "next_run_in": self._state.next_run_in,
                "last_heartbeat": self._state.last_heartbeat,
                "is_running": self._state.is_running,
                "paused": self._paused,
                "quiet_hours_active": self._is_quiet_hours(),
                "error_count": self._state.errors_since_start,
                "consecutive_errors": self._state.consecutive_errors,
                "uptime_seconds": round(self.get_uptime_seconds(), 1),
                "memory_items": len(self._state.recent_steps),
                "enabled_skills": list(ALLOWED_ACTIONS),
                "active_skills": self._get_active_skill_names(),
                "mode_restricted_actions_count": self._blocked_actions_since_start,
                "resource_tier": resource_tier,
                "resource_decision": resident_decision,
                **_shared_state,
            }
        )

    def _get_active_skill_names(self) -> List[str]:
        """Return list of active skill names for UI display."""
        try:
            from app.services.skills_service import get_skills_service

            skills = get_skills_service().list()
            return [s.get("name", "") for s in skills if s.get("name")]
        except Exception:
            return []

    def _update_heartbeat_status(self) -> None:
        """Determine heartbeat health based on error rate."""
        if self._state.consecutive_errors >= CONSECUTIVE_ERROR_THRESHOLD:
            self._state.heartbeat_status = "error"
        elif self._state.consecutive_errors >= 2:
            self._state.heartbeat_status = "degraded"
        else:
            self._state.heartbeat_status = "healthy"

    async def _request_self_healing_restart(self) -> None:
        """Request a graceful restart via TaskSupervisor pattern."""
        if self._restart_requested:
            return
        self._restart_requested = True
        logger.warning(
            "Resident agent requesting self-healing restart after %d consecutive errors",
            self._state.consecutive_errors,
        )
        try:
            from app.services.memory_service import get_memory_service

            mem = get_memory_service()
            await mem.add_memory(
                text=f"Resident agent self-healing restart triggered after "
                f"{self._state.consecutive_errors} consecutive errors",
                tags=["resident", "self_healing"],
                source="resident_agent",
                importance=8,
            )
        except Exception:
            pass
        # Schedule restart: stop then start in a new task
        asyncio.create_task(self._do_restart())

    async def _do_restart(self) -> None:
        """Perform a graceful stop + start cycle."""
        try:
            await self.stop()
            await asyncio.sleep(2)
            await self.start()
            logger.info("Resident agent self-healing restart completed")
        except Exception as exc:
            logger.error("Self-healing restart failed: %s", exc)

    # ── Brain orchestrator methods ──────────────────────────────

    def _get_resident_mode(self) -> str:
        """Read current resident_mode from settings.

        If the mode changed since the last call, records it via ModeAuditService.
        """
        try:
            from app.services.settings_service import get_settings_service

            mode = get_settings_service().load().get("resident_mode", "advisor")
        except Exception:
            mode = "advisor"

        if self._last_known_mode and self._last_known_mode != mode:
            try:
                from app.services.mode_audit_service import get_mode_audit_service

                get_mode_audit_service().record_change(
                    from_mode=self._last_known_mode,
                    to_mode=mode,
                    changed_by="system",
                    reason="detected on tick",
                )
                self._add_log(
                    "INFO",
                    "mode_changed",
                    from_mode=self._last_known_mode,
                    to_mode=mode,
                    source="tick_detection",
                )
            except Exception:
                pass
        self._last_known_mode = mode
        return mode

    async def _thought_tick(self) -> None:
        """Periodically call the reasoner to generate suggestions.

        Observer mode: this method is skipped entirely – no LLM call is made.
        Advisor mode:  suggestions are generated but NEVER auto-executed;
                       each suggestion gets ``requires_user_approval=True``.
        Autonomous mode: safe actions (requires_confirmation=False) are
                         auto-executed after suggestion generation.
        """
        if self._state.tick_count % THOUGHT_TICK_INTERVAL != 0:
            return

        # Resource-aware skip: don't call LLM when system is under pressure
        monitor = get_resource_monitor()
        if monitor.is_blocked() or monitor.is_background_paused():
            logger.info(
                "Skipping LLM thought cycle – RAM pressure (blocked=%s, bg_paused=%s)",
                monitor.is_blocked(),
                monitor.is_background_paused(),
            )
            return

        # Throttled skip: proactive LLM calls are non-critical, skip entirely
        if monitor.is_throttled():
            logger.info(
                "Skipping LLM thought cycle – system throttled (RAM/CPU high), "
                "will retry next tick"
            )
            return

        mode = self._get_resident_mode()
        # Observer: no LLM reasoning at all
        if mode == "observer":
            return

        # Budget check: LLM calls per hour
        if not self._can_llm_call():
            self._add_log(
                "WARN",
                "throttled_llm_hourly_limit",
                llm_calls=self._llm_calls_this_hour,
                limit=RESIDENT_MAX_LLM_CALLS_PER_HOUR,
            )
            return

        try:
            from app.services.resident_reasoner import get_resident_reasoner

            reasoner = get_resident_reasoner()
            self._record_llm_call()
            suggestion = await reasoner.generate_suggestions(mode)
            if suggestion is None:
                return

            self._suggestions.append(suggestion)
            if len(self._suggestions) > MAX_SUGGESTIONS_HISTORY:
                self._suggestions = self._suggestions[-MAX_SUGGESTIONS_HISTORY:]

            # Create resident_task jobs from suggestions that don't require confirmation
            await self._create_jobs_from_suggestions(suggestion, mode)

            # Store agent thoughts from suggestions into memory
            await self._store_suggestion_thoughts(suggestion)

            await self._broadcast(
                {
                    "type": WS_EVENT_RESIDENT_SUGGESTION,
                    "suggestion_id": suggestion.id,
                    "action_count": len(suggestion.actions),
                    "mode": mode,
                }
            )

            logger.info(
                "Resident reasoner generated %d suggestions (mode=%s)",
                len(suggestion.actions),
                mode,
            )
        except Exception as exc:
            self._record_llm_fail()
            logger.error("Thought tick failed: %s", exc)

    async def _create_jobs_from_suggestions(self, suggestion, mode: str) -> None:
        """Create resident_task jobs from suggestion actions.

        In both advisor and autonomous modes, actions with requires_confirmation=False
        are turned into jobs automatically. In advisor mode, jobs are tagged with
        auto_from_suggestion=True for visibility.

        Dedup: skips jobs if a job with the same action_type + title was created
        in the last 30 minutes.
        """
        from app.services.job_service import get_job_service

        job_svc = get_job_service()

        # Build dedup set: recent jobs (last 30 min) by action_type + title
        recent_dedup_keys: set = set()
        try:
            from datetime import timedelta

            since_30m = (datetime.now(timezone.utc) - timedelta(minutes=30)).isoformat()
            recent_jobs = job_svc.list_jobs(
                type="resident_task",
                limit=50,
            )
            for rj in recent_jobs:
                if rj.created_at and rj.created_at >= since_30m:
                    rj_action = rj.payload.get("action_type", "")
                    rj_title = rj.title
                    recent_dedup_keys.add(f"{rj_action}:{rj_title}")
        except Exception:
            pass

        for action in suggestion.actions:
            if action.requires_confirmation:
                continue

            # Map action fields – support both 'action' and 'action_type' from reasoner
            action_type = getattr(action, "action", None) or action.action_type
            job_title = f"[Auto] {action.title}"

            # Dedup check
            dedup_key = f"{action_type}:{job_title}"
            if dedup_key in recent_dedup_keys:
                logger.info(
                    "Skipped duplicate suggestion job: %s",
                    action.title,
                )
                continue

            job = job_svc.create_job(
                type="resident_task",
                title=job_title,
                input_summary=action.description[:300],
                payload={
                    "action_type": action_type,
                    "steps": action.steps,
                    "suggestion_id": suggestion.id,
                    "auto_from_suggestion": True,
                    "params": getattr(action, "params", {}),
                },
                priority="normal",
            )
            recent_dedup_keys.add(dedup_key)
            suggestion.executed_action_ids.append(action.id)
            logger.info(
                "Created job from suggestion (mode=%s): %s (job=%s)",
                mode,
                action.title,
                job.id,
            )

    async def _store_suggestion_thoughts(self, suggestion) -> None:
        """Store agent 'thought' fields from suggestions into memory."""
        try:
            from app.services.memory_service import get_memory_service

            mem = get_memory_service()
            for action in suggestion.actions:
                thought = getattr(action, "thought", None)
                if thought:
                    importance = getattr(action, "importance", 3)
                    if isinstance(importance, str):
                        importance = 3
                    await mem.add_memory(
                        text=f"[Thought] {thought}",
                        tags=["resident", "thought", "decision", "auto"],
                        source="resident_agent",
                        importance=importance,
                    )
                    # Notify on important thoughts (importance >= 8)
                    if importance >= 8:
                        try:
                            import os

                            if os.environ.get("NOTIFICATIONS_ENABLED", "true").lower() != "false":
                                from app.services.notification_service import get_notification_service

                                notif_svc = get_notification_service()
                                await notif_svc.send(
                                    title=f"Agent: {thought[:60]}",
                                    body=thought[:250],
                                    level="insight",
                                    source="resident_agent",
                                    action_url="/resident/thoughts",
                                    importance=8,
                                )
                        except Exception as exc:
                            logger.debug("Important thought notification failed: %s", exc)
        except Exception as exc:
            logger.debug("Failed to store suggestion thoughts: %s", exc)

    # ── Proactive deterministic actions ──────────────────────────

    _PROACTIVE_ACTIONS = ["system_health", "git_status", "lean_metrics"]

    async def _proactive_action_tick(self) -> None:
        """Every PROACTIVE_TICK_INTERVAL ticks, run one deterministic action (no LLM).

        Round-robins through system_health → git_status → lean_metrics.
        Results are stored in memory and recorded in the cycle history.
        """
        if self._state.tick_count % PROACTIVE_TICK_INTERVAL != 0:
            return

        # Resource-aware skip: don't run proactive actions when system is under pressure
        monitor = get_resource_monitor()
        if monitor.is_blocked() or monitor.is_background_paused():
            logger.info(
                "Skipping proactive cycle – RAM pressure (blocked=%s, bg_paused=%s)",
                monitor.is_blocked(),
                monitor.is_background_paused(),
            )
            return

        # Throttled skip: proactive checks are non-critical, can wait
        if monitor.is_throttled():
            logger.info(
                "Skipping proactive cycle – system throttled, will retry next tick"
            )
            return

        action_name = self._PROACTIVE_ACTIONS[
            self._proactive_action_index % len(self._PROACTIVE_ACTIONS)
        ]
        self._proactive_action_index += 1

        # Skip git_status if no enabled git projects are configured
        if action_name == "git_status":
            try:
                from app.services.settings_service import get_settings_service

                settings = get_settings_service().load()
                git_projects = settings.get("git_projects", [])
                has_enabled = any(p.get("enabled", True) for p in git_projects)
                if not has_enabled:
                    return  # silently skip
            except Exception:
                return

        cycle_id = f"cycle-{self._state.tick_count:04d}"
        self._add_log(
            "INFO",
            "proactive_check_start",
            cycle_id=cycle_id,
            action=action_name,
        )

        result_text = ""
        try:
            if action_name == "system_health":
                result_text = await self._proactive_system_health()
            elif action_name == "git_status":
                result_text = await self._proactive_git_status()
            elif action_name == "lean_metrics":
                result_text = await self._proactive_lean_metrics()
        except Exception as exc:
            result_text = f"Proactive {action_name} failed: {exc}"
            logger.warning(result_text)

        # Store result in memory
        try:
            from app.services.memory_service import get_memory_service

            mem = get_memory_service()
            await mem.add_memory(
                text=result_text[:500],
                tags=["resident", "observation", "proactive_check", action_name],
                source="resident_agent",
                importance=2,
            )
        except Exception as exc:
            logger.debug("Failed to store proactive check in memory: %s", exc)

        # Record in cycle history
        record = CycleRecord(
            cycle_id=cycle_id,
            cycle_number=self._state.tick_count,
            timestamp=_now(),
            status="success",
            action_type="proactive_check",
            action_target=action_name,
            output_preview=result_text[:200],
        )
        self._add_cycle_record(record)

        self._add_log(
            "INFO",
            "proactive_check_done",
            cycle_id=cycle_id,
            action=action_name,
            result=result_text[:200],
        )

    async def _proactive_system_health(self) -> str:
        """Deterministic system health check – no LLM."""
        try:
            from app.services.resource_monitor import get_resource_monitor

            monitor = get_resource_monitor()
            snap = monitor.to_dict()
            ram = snap.get("ram_used_percent", "?")
            cpu = snap.get("cpu_percent", "?")
            throttled = snap.get("throttle", False)
            blocked = snap.get("block", False)
            return (
                f"System health check – RAM {ram}%, CPU {cpu}%, "
                f"throttled={throttled}, blocked={blocked}"
            )
        except Exception as exc:
            return f"System health check failed: {exc}"

    async def _proactive_git_status(self) -> str:
        """Check git status for configured projects – no LLM."""
        parts = []
        try:
            from app.services.settings_service import get_settings_service

            settings = get_settings_service().load()
            git_projects = settings.get("git_projects", [])
            enabled_projects = [p for p in git_projects if p.get("enabled", True)]
            if not enabled_projects:
                return "Git status – no projects configured"

            from app.services.git_service import GitService

            git_svc = GitService()
            for project in enabled_projects:
                name = project.get("name", "unknown")
                path = project.get("path", "")
                if not path:
                    continue
                try:
                    status = await git_svc.status(path)
                    # Check for uncommitted changes
                    if isinstance(status, dict):
                        modified = status.get("modified", [])
                        untracked = status.get("untracked", [])
                        staged = status.get("staged", [])
                        changes = modified + untracked + staged
                        if changes:
                            files_str = ", ".join(str(f) for f in changes[:5])
                            if len(changes) > 5:
                                files_str += f" (+{len(changes) - 5} more)"
                            parts.append(
                                f"Repo {name} má necommitnuté změny: {files_str}"
                            )
                        else:
                            parts.append(f"Repo {name} – čistý stav")
                    elif isinstance(status, str) and status.strip():
                        parts.append(f"Repo {name}: {status[:200]}")
                    else:
                        parts.append(f"Repo {name} – čistý stav")
                except Exception as exc:
                    parts.append(f"Repo {name} – chyba: {exc}")
        except Exception as exc:
            return f"Git status check failed: {exc}"

        return "; ".join(parts) if parts else "Git status – no projects found"

    async def _proactive_lean_metrics(self) -> str:
        """Read job queue stats – no LLM."""
        try:
            from app.services.job_service import get_job_service
            from datetime import timedelta

            job_svc = get_job_service()
            since_24h = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
            stats = job_svc.get_stats_since(since_24h)
            total = stats.get("tasks_total", 0)
            success_rate = stats.get("success_rate", 0)
            avg_dur = stats.get("avg_task_duration_s", 0)
            failed = job_svc.count_jobs(status="failed", since=since_24h)
            queued = len(job_svc.list_jobs(status="queued", limit=100))
            # Curiosity hook: low success rate
            try:
                if total > 0 and success_rate < 0.80:
                    from app.services.resident_curiosity import get_curiosity_service

                    get_curiosity_service().hook_low_success_rate(success_rate, failed)
            except Exception:
                pass

            return (
                f"Job queue metriky (24h): {total} jobů, "
                f"{success_rate:.0%} úspěšnost, "
                f"prům. doba {avg_dur:.1f}s, "
                f"{failed} selhalo, {queued} ve frontě"
            )
        except Exception as exc:
            return f"Lean metrics check failed: {exc}"

    # ── Curiosity tick ──────────────────────────────────────────────

    async def _curiosity_tick(self) -> None:
        """Every CURIOSITY_TICK_INTERVAL ticks, pick the top open curiosity item
        and create a safe analysis job from it.  Writes a thought to memory.

        Enforces WIP limit (MAX_CURIOSITY_IN_PROGRESS) and only creates
        analysis-type jobs (no destructive actions).
        """
        if self._state.tick_count % CURIOSITY_TICK_INTERVAL != 0:
            return

        try:
            from app.services.resident_curiosity import get_curiosity_service

            curiosity_svc = get_curiosity_service()

            # Update open items gauge for Prometheus
            try:
                from app.services.metrics_service import resident_curiosity_items_open

                resident_curiosity_items_open.set(curiosity_svc.count_by_status("open"))
            except Exception:
                pass

            # Budget check: analysis jobs per hour
            if not self._can_analysis_job():
                self._add_log(
                    "WARN",
                    "throttled_analysis_hourly_limit",
                    analysis_jobs=self._analysis_jobs_this_hour,
                    limit=RESIDENT_MAX_ANALYSIS_JOBS_PER_HOUR,
                )
                return

            # WIP limit check
            in_progress_count = curiosity_svc.count_by_status("in_progress")
            if in_progress_count >= MAX_CURIOSITY_IN_PROGRESS:
                try:
                    from app.services.memory_service import get_memory_service

                    mem = get_memory_service()
                    await mem.add_memory(
                        text=(
                            f"[Thought] Mam rozpracovanych {in_progress_count} "
                            "veci z curiosity backlogu, nebudu otvirat dalsi."
                        )[:200],
                        tags=["resident", "thought", "curiosity"],
                        source="resident_agent",
                        importance=2,
                    )
                except Exception:
                    pass
                return

            item = curiosity_svc.pick_next_open()

            if item is None:
                try:
                    from app.services.memory_service import get_memory_service

                    mem = get_memory_service()
                    await mem.add_memory(
                        text="[Thought] Nemam aktualne zadne otazky k prozkoumani."[
                            :200
                        ],
                        tags=["resident", "thought", "curiosity"],
                        source="resident_agent",
                        importance=2,
                    )
                except Exception:
                    pass
                return

            # Write concise thought to memory (max 200 chars)
            try:
                from app.services.memory_service import get_memory_service

                mem = get_memory_service()
                await mem.add_memory(
                    text=f"[Thought] Chci prozkoumat: {item.title}."[:200],
                    tags=["resident", "thought", "curiosity"],
                    source="resident_agent",
                    importance=6,
                )
            except Exception as exc:
                logger.debug("Failed to store curiosity thought: %s", exc)

            # Create safe analysis job – ONLY action_type="analysis" allowed
            from app.services.job_service import get_job_service

            job_svc = get_job_service()
            job = job_svc.create_job(
                type="resident_task",
                title=f"Curiosity: {item.title}"[:200],
                input_summary=item.detail[:200],
                payload={
                    "action_type": "analysis",
                    "curiosity_id": item.id,
                    "auto_from_curiosity": True,
                },
                priority="low",
            )

            self._record_analysis_job()

            # Mark curiosity item as in_progress
            curiosity_svc.update_item_status(item.id, "in_progress")

            # Track related job
            item.related_job_ids.append(job.id)
            curiosity_svc._save(item)

            logger.info(
                "Curiosity tick: picked %s -> job %s (%s)",
                item.id,
                job.id,
                item.title[:40],
            )

        except Exception as exc:
            logger.error("Curiosity tick failed: %s", exc)

    async def _resolve_curiosity_from_job(self, job) -> None:
        """Close the originating curiosity item after its analysis job finishes.

        On success: mark done, write decision memory, optionally create follow-up.
        On failure: reset to open with high priority, write thought memory.
        """
        curiosity_id = job.payload.get("curiosity_id")
        if not curiosity_id or job.type != "resident_task":
            return

        try:
            from app.services.resident_curiosity import get_curiosity_service
            from app.services.memory_service import get_memory_service

            curiosity_svc = get_curiosity_service()
            mem = get_memory_service()
            item = curiosity_svc.get_item(curiosity_id)
            if not item:
                return

            if job.status == "succeeded":
                summary = str(job.meta.get("result", ""))[:200]
                curiosity_svc.resolve_item(
                    curiosity_id,
                    "done",
                    resolution_summary=summary,
                )
                await mem.add_memory(
                    text=(
                        f"[Decision] Uzavrel jsem curiosity: {item.title}. "
                        f"Vysledek: {summary[:100]}"
                    )[:200],
                    tags=["resident", "decision", "curiosity"],
                    source="resident_agent",
                    importance=6,
                )
                self._add_log(
                    "INFO",
                    "curiosity_resolved",
                    curiosity_id=curiosity_id,
                    title=item.title[:60],
                    status="done",
                )
                try:
                    from app.services.metrics_service import (
                        resident_curiosity_items_done_total,
                    )

                    resident_curiosity_items_done_total.inc()
                except Exception:
                    pass

                # Follow-up: if output is rich, create a new curiosity item
                self._maybe_create_followup_curiosity(
                    curiosity_svc,
                    item,
                    summary,
                )

            elif job.status == "failed":
                curiosity_svc.update_item_status(curiosity_id, "open")
                item_reloaded = curiosity_svc.get_item(curiosity_id)
                if item_reloaded and item_reloaded.priority != "high":
                    item_reloaded.priority = "high"
                    curiosity_svc._save(item_reloaded)
                await mem.add_memory(
                    text=(
                        f"[Thought] Analyza curiosity '{item.title}' selhala. "
                        "Bude potreba zkusit jinak nebo rucne."
                    )[:200],
                    tags=["resident", "thought", "curiosity"],
                    source="resident_agent",
                    importance=7,
                )
                self._add_log(
                    "WARN",
                    "curiosity_analysis_failed",
                    curiosity_id=curiosity_id,
                    title=item.title[:60],
                )
        except Exception as exc:
            logger.debug("Failed to resolve curiosity from job: %s", exc)

    @staticmethod
    def _maybe_create_followup_curiosity(curiosity_svc, item, summary: str) -> None:
        """Create a follow-up curiosity item if the analysis produced rich results."""
        followup_keywords = (
            "problém",
            "zjistil",
            "doporučení",
            "anomálie",
            "chyba",
            "problem",
            "found",
            "recommend",
            "error",
            "warning",
        )
        if len(summary) > 100 and any(
            kw in summary.lower() for kw in followup_keywords
        ):
            try:
                curiosity_svc.create_item(
                    kind="idea",
                    source="self_reflection",
                    title=f"Navazující akce: {item.title}"[:120],
                    detail=f"Na základě analýzy: {summary}"[:500],
                    priority="medium",
                    dedup_key=curiosity_svc.make_dedup_key(
                        "self_reflection",
                        "idea",
                        item.id[:30],
                    ),
                )
                logger.info(
                    "Created follow-up curiosity from resolved item %s",
                    item.id,
                )
            except Exception as exc:
                logger.debug("Follow-up curiosity creation failed: %s", exc)

    async def _cleanup_stale_curiosity(self) -> None:
        """Reset curiosity items stuck in_progress for too long (>2h) back to open."""
        try:
            from app.services.resident_curiosity import get_curiosity_service
            from app.services.job_service import get_job_service
            from datetime import timedelta

            curiosity_svc = get_curiosity_service()
            job_svc = get_job_service()
            stale_cutoff = (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()

            in_progress_items = curiosity_svc.list_items(
                status="in_progress",
                limit=20,
            )
            for item in in_progress_items:
                if item.updated_at > stale_cutoff:
                    continue  # Not stale yet

                # Check if related jobs are still running
                has_running_job = False
                for jid in item.related_job_ids:
                    related_job = job_svc.get_job(jid)
                    if related_job and related_job.status in ("queued", "running"):
                        has_running_job = True
                        break

                if not has_running_job:
                    curiosity_svc.update_item_status(item.id, "open")
                    self._add_log(
                        "WARN",
                        "curiosity_stale_reset",
                        curiosity_id=item.id,
                        title=item.title[:60],
                    )
                    logger.warning(
                        "Curiosity item %s was stale in_progress, reset to open",
                        item.id,
                    )
        except Exception as exc:
            logger.debug("Stale curiosity cleanup failed: %s", exc)

    async def _process_missions(self) -> None:
        """Process active resident_mission jobs – advance current step."""
        if self._state.tick_count % MISSION_TICK_INTERVAL != 0:
            return

        try:
            from app.services.job_service import get_job_service

            job_svc = get_job_service()

            # Find planned or in_progress missions
            for status_filter in ("queued", "running"):
                missions = job_svc.list_jobs(
                    status=status_filter, type="resident_mission", limit=5
                )
                for mission_job in missions:
                    await self._advance_mission(mission_job, job_svc)
        except Exception as exc:
            logger.error("Mission processing error: %s", exc)

    async def _advance_mission(self, mission_job, job_svc) -> None:
        """Advance a mission by one step."""
        plan = mission_job.payload.get("plan", {})
        steps = plan.get("steps", [])
        current_step = plan.get("current_step", 0)

        if current_step >= len(steps):
            # Mission complete – aggregate step results into output
            output_parts = []
            for i, s in enumerate(steps):
                result = s.get("result_summary", "")
                sub_job_id = s.get("job_id")
                if sub_job_id:
                    sub_job = job_svc.get_job(sub_job_id)
                    if sub_job and sub_job.meta and sub_job.meta.get("result"):
                        result = str(sub_job.meta["result"])[:1000]
                if result:
                    output_parts.append(f"Krok {i+1} ({s.get('title', '')}): {result}")
            plan["output"] = "\n\n".join(output_parts) if output_parts else ""

            mission_job.status = "succeeded"
            mission_job.progress = 100.0
            mission_job.finished_at = _now()
            plan["status"] = "done"
            mission_job.payload["plan"] = plan
            job_svc.update_job(mission_job)
            await self._generate_reflection_for_job(mission_job)
            return

        # Mark as running if not already
        if mission_job.status == "queued":
            mission_job.status = "running"
            mission_job.started_at = _now()
            plan["status"] = "in_progress"

        step = steps[current_step]
        step["status"] = "running"

        try:
            # Create a sub-job for this step
            sub_job = job_svc.create_job(
                type="resident_task",
                title=f"[Mise krok {current_step + 1}] {step.get('title', '')}",
                input_summary=step.get("description", ""),
                payload={"mission_id": mission_job.id, "step_index": current_step},
                priority="normal",
            )
            step["job_id"] = sub_job.id
            step["status"] = "succeeded"  # Queued = success for step tracking
            step["result_summary"] = f"Job {sub_job.id} vytvořen"

            plan["current_step"] = current_step + 1
            mission_job.progress = round((current_step + 1) / len(steps) * 100, 1)
        except Exception as exc:
            step["status"] = "failed"
            step["result_summary"] = str(exc)[:200]
            plan["status"] = "error"
            mission_job.status = "failed"
            mission_job.last_error = str(exc)
            mission_job.finished_at = _now()

        mission_job.payload["plan"] = plan
        job_svc.update_job(mission_job)

    async def _generate_reflection_for_job(self, job) -> None:
        """Generate a reflection after a resident job completes."""
        try:
            from app.services.resident_reasoner import get_resident_reasoner

            reasoner = get_resident_reasoner()
            reflection = await reasoner.generate_reflection(
                job_id=job.id,
                job_type=job.type,
                goal=job.title,
                status=job.status,
                error=job.last_error or "",
            )
            if reflection:
                self._reflections.append(reflection)
                if len(self._reflections) > MAX_REFLECTIONS_HISTORY:
                    self._reflections = self._reflections[-MAX_REFLECTIONS_HISTORY:]

                # Store in job meta
                job.meta["reflection"] = reflection.model_dump()
                from app.services.job_service import get_job_service

                get_job_service().update_job(job)
        except Exception as exc:
            logger.debug("Reflection generation failed: %s", exc)

    def get_suggestions(self, limit: int = 10) -> List[dict]:
        """Return recent suggestions as dicts."""
        return [s.model_dump() for s in self._suggestions[-limit:]]

    def get_suggestion_by_id(self, suggestion_id: str):
        """Find a specific suggestion by ID."""
        for s in self._suggestions:
            if s.id == suggestion_id:
                return s
        return None

    def get_reflections(self, limit: int = 20) -> List[dict]:
        """Return recent reflections as dicts."""
        return [r.model_dump() for r in self._reflections[-limit:]]

    async def accept_suggestion_action(
        self, suggestion_id: str, action_id: str
    ) -> Optional[str]:
        """Accept a suggested action → create a job. Returns job_id or None."""
        suggestion = self.get_suggestion_by_id(suggestion_id)
        if not suggestion:
            return None

        target_action = None
        for a in suggestion.actions:
            if a.id == action_id:
                target_action = a
                break

        if not target_action:
            return None

        from app.services.job_service import get_job_service

        job_svc = get_job_service()
        job = job_svc.create_job(
            type="resident_task",
            title=target_action.title,
            input_summary=target_action.description,
            payload={
                "action_type": target_action.action_type,
                "steps": target_action.steps,
                "from_suggestion": suggestion_id,
            },
            priority="normal",
        )
        suggestion.executed_action_ids.append(action_id)
        return job.id

    async def _proactive_alerts(self) -> None:
        """Generate simple rule-based alerts (every 5th tick = ~2.5 min)."""
        if self._state.tick_count % 5 != 0:
            return

        alerts: list[str] = []

        try:
            # Check job queue depth
            from app.services.job_service import get_job_service

            job_svc = get_job_service()
            queued = job_svc.list_jobs(status="queued", limit=100)
            if len(queued) >= QUEUE_DEPTH_ALERT_THRESHOLD:
                alerts.append(f"Queue depth high ({len(queued)} queued jobs)")
        except Exception as exc:
            logger.debug("Alert check (queue) failed: %s", exc)

        try:
            # Check KB size
            from app.services.vector_store_service import get_vector_store_service

            vs = get_vector_store_service()
            stats = vs.get_stats()
            total_chunks = stats.get("total_chunks", 0)
            if total_chunks >= KB_DOCS_ALERT_THRESHOLD:
                alerts.append(f"KB size large ({total_chunks} chunks)")
            # Curiosity hook: KB gaps (very few chunks)
            if total_chunks < 50:
                try:
                    from app.services.resident_curiosity import get_curiosity_service

                    get_curiosity_service().hook_kb_gap(
                        f"Pouze {total_chunks} chunků v KB – zvážit doplnění dokumentace"
                    )
                except Exception:
                    pass
        except Exception as exc:
            logger.debug("Alert check (KB) failed: %s", exc)

        try:
            # Check resource pressure
            from app.services.resource_monitor import get_resource_monitor

            monitor = get_resource_monitor()
            if monitor.is_blocked():
                alerts.append("System resources critical (RAM blocked)")
            elif monitor.is_throttled():
                alerts.append("System under load (throttled)")
        except Exception as exc:
            logger.debug("Alert check (resources) failed: %s", exc)

        self._state.alerts = alerts

    def get_dashboard_data(self) -> dict:
        """Compile dashboard payload for GET /api/resident/dashboard."""
        from app.services.job_service import get_job_service

        job_svc = get_job_service()

        # Determine overall status
        if self._state.is_running:
            status = "error" if self._state.heartbeat_status == "error" else "running"
        else:
            status = "stopped"

        # Current task info
        current_task = None
        if self._state.current_task:
            current_task = {
                "title": self._state.current_task,
                "status": self._state.status,
                "started_at": self._state.last_tick,
            }

        # Recent tasks (last 10 resident_task + resident_daily jobs)
        recent_jobs = job_svc.list_jobs(type="resident_task", limit=10)
        recent_tasks = []
        for j in recent_jobs:
            duration_s = None
            if j.started_at and j.finished_at:
                try:
                    s = datetime.fromisoformat(j.started_at)
                    f = datetime.fromisoformat(j.finished_at)
                    duration_s = round((f - s).total_seconds(), 1)
                except (ValueError, TypeError):
                    pass
            recent_tasks.append(
                {
                    "id": j.id,
                    "type": j.type,
                    "title": j.title,
                    "status": j.status,
                    "created_at": j.created_at,
                    "started_at": j.started_at,
                    "finished_at": j.finished_at,
                    "duration_s": duration_s,
                    "meta": {
                        "auto_executed": j.payload.get("auto_executed", False),
                        "action_type": j.payload.get("action_type", ""),
                    },
                }
            )

        # Stats for last 24h
        from datetime import timedelta

        since_24h = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
        stats_24h = job_svc.get_stats_since(since_24h, type="resident_task")

        # Current mode
        mode = self._get_resident_mode()

        # Latest suggestion count
        latest_suggestion = self._suggestions[-1] if self._suggestions else None

        # Active missions
        mission_jobs = job_svc.list_jobs(type="resident_mission", limit=5)
        missions = []
        for mj in mission_jobs:
            plan = mj.payload.get("plan", {})
            missions.append(
                {
                    "id": mj.id,
                    "goal": plan.get("goal", mj.title),
                    "status": plan.get("status", mj.status),
                    "current_step": plan.get("current_step", 0),
                    "total_steps": len(plan.get("steps", [])),
                    "progress": mj.progress,
                    "created_at": mj.created_at,
                }
            )

        # KB chunk count for UI warning
        kb_chunks = 0
        try:
            from app.services.vector_store_service import get_vector_store_service

            vs = get_vector_store_service()
            kb_chunks = vs.get_stats().get("total_chunks", 0)
        except Exception:
            pass

        # Human-readable status text for the agent status widget
        interval = self._agent_settings.interval_seconds
        next_run_in = self._state.next_run_in
        status_text = self._build_status_text(status, next_run_in, interval)

        return {
            "status": status,
            "uptime_seconds": round(self.get_uptime_seconds(), 1),
            "heartbeat_status": self._state.heartbeat_status,
            "last_heartbeat": self._state.last_heartbeat,
            "current_task": current_task,
            "recent_tasks": recent_tasks,
            "alerts": self._state.alerts,
            "stats_24h": stats_24h,
            "resident_mode": mode,
            "suggestions_count": (
                len(latest_suggestion.actions) if latest_suggestion else 0
            ),
            "missions": missions,
            "reflections_count": len(self._reflections),
            "proposals": [
                p.to_dict() for p in self._proposals if p.status == "pending"
            ],
            "kb_chunks": kb_chunks,
            # Activity & status widget fields
            "status_text": status_text,
            "cycle_interval": interval,
            "cycle_remaining": max(0, next_run_in),
            "current_thought": self._state.current_thought,
            "paused": self._paused,
            "quiet_hours_active": self._is_quiet_hours(),
        }

    def _build_status_text(self, status: str, next_run_in: int, interval: int) -> str:
        """Return human-readable agent status for the dashboard widget."""
        if status == "stopped":
            return "\U0001f6d1 Zastaven"
        if self._paused:
            return "\u23f8\ufe0f Pozastaven"
        if self._is_quiet_hours():
            return "\U0001f319 Tichý režim"
        if self._state.status == "thinking":
            return "\U0001f9e0 Přemýšlí..."
        if self._state.status == "executing":
            action = self._state.last_action or "task"
            return f"\u26a1 Provádí: {action}"
        if status == "error":
            return f"\u26a0\ufe0f Chyba (po sobě: {self._state.consecutive_errors})"
        # Check resource throttling
        try:
            from app.services.resource_monitor import get_resource_monitor
            monitor = get_resource_monitor()
            if monitor.is_throttled():
                usage = monitor.get_current_usage()
                ram_pct = usage.get("ram_percent", 0)
                return f"\u26a0\ufe0f Throttlováno — RAM {ram_pct:.0f}%"
        except Exception:
            pass
        # Resting / waiting for next cycle
        return f"\U0001f4a4 Odpočívá — příští cyklus za {next_run_in}s"

    # ── Thought stream (SSE) ────────────────────────────────────────────────

    async def emit_thought(self, thought_type: str, **kwargs) -> None:
        """Emit a thought event for live SSE streaming."""
        event = {
            "type": thought_type,
            "timestamp": _now(),
            **kwargs,
        }
        try:
            self._thought_queue.put_nowait(event)
        except asyncio.QueueFull:
            # Drop oldest to make room
            try:
                self._thought_queue.get_nowait()
            except asyncio.QueueEmpty:
                pass
            self._thought_queue.put_nowait(event)

    @property
    def thought_queue(self) -> asyncio.Queue:
        return self._thought_queue

    # ── Mission proposals ─────────────────────────────────────────────────

    def get_proposals(self, status: Optional[str] = None) -> List[dict]:
        """Return proposals, optionally filtered by status."""
        proposals = self._proposals
        if status:
            proposals = [p for p in proposals if p.status == status]
        return [p.to_dict() for p in proposals]

    def get_proposal(self, proposal_id: str) -> Optional[MissionProposal]:
        for p in self._proposals:
            if p.id == proposal_id:
                return p
        return None

    async def approve_proposal(self, proposal_id: str) -> Optional[str]:
        """Approve a proposal and create a mission job. Returns job_id."""
        proposal = self.get_proposal(proposal_id)
        if not proposal or proposal.status != "pending":
            return None
        proposal.status = "approved"
        self._add_log(
            "INFO", "proposal_approved", proposal_id=proposal_id, name=proposal.name
        )

        # Create a mission job
        from app.services.job_service import get_job_service

        job_svc = get_job_service()
        plan = {
            "goal": proposal.name,
            "steps": [{"description": proposal.description, "status": "pending"}],
            "current_step": 0,
            "status": "planned",
            "source": "proposal",
        }
        job = job_svc.create_job(
            type="resident_mission",
            title=proposal.name,
            input_summary=proposal.description,
            payload={"plan": plan},
            priority="normal",
        )
        await self.emit_thought("thinking", content=f"Mise schválena: {proposal.name}")
        return job.id

    def reject_proposal(self, proposal_id: str) -> bool:
        proposal = self.get_proposal(proposal_id)
        if not proposal or proposal.status != "pending":
            return False
        proposal.status = "rejected"
        self._add_log(
            "INFO", "proposal_rejected", proposal_id=proposal_id, name=proposal.name
        )
        return True

    async def propose_missions(self) -> List[dict]:
        """Agent autonomously proposes missions based on context.

        Calls LLM with current context (time, recent jobs, memory, KB).
        Returns list of proposed missions awaiting user approval.
        """
        import uuid

        await self.emit_thought("thinking", content="Přemýšlím nad novými misemi...")

        # Build context
        context: Dict[str, Any] = {
            "datetime": _now(),
            "weekday": datetime.now().strftime("%A"),
        }

        # Recent jobs
        try:
            from app.services.job_service import get_job_service

            job_svc = get_job_service()
            recent = job_svc.list_jobs(limit=5)
            context["recent_jobs"] = [
                {"title": j.title, "status": j.status, "type": j.type} for j in recent
            ]
        except Exception:
            context["recent_jobs"] = []

        # Memory snippets
        try:
            from app.services.memory_service import get_memory_service

            mem = get_memory_service()
            snippets = await mem.search_memory("recent activity", limit=3)
            context["memory_snippets"] = [s.get("text", "")[:200] for s in snippets]
        except Exception:
            context["memory_snippets"] = []

        # KB status
        try:
            from app.services.vector_store_service import get_vector_store_service

            vs = get_vector_store_service()
            kb_stats = vs.get_stats()
            context["kb_chunks"] = kb_stats.get("total_chunks", 0)
            if context["kb_chunks"] == 0:
                context["kb_note"] = (
                    "KB je prázdná – basuj rozhodnutí na systémovém stavu a paměti."
                )
        except Exception:
            context["kb_chunks"] = 0
            context["kb_note"] = "KB nedostupná."

        # Interest topics
        if self._agent_settings.interest_topics:
            context["interest_topics"] = self._agent_settings.interest_topics

        max_proposals = self._agent_settings.max_proposals

        from app.services.llm_service import get_date_context

        prompt = (
            get_date_context() + "Jsi Resident Agent. Na základě kontextu navrhni 1-"
            f"{max_proposals} užitečné mise.\n"
            "Každá mise musí mít: name, description, type (research/code/analysis), "
            "estimated_minutes, relevance (proč je teď relevantní).\n"
            "Odpověz POUZE jako JSON pole objektů. Žádný markdown, žádný komentář.\n\n"
            f"Kontext: {json.dumps(context, ensure_ascii=False)}"
        )

        try:
            from app.services.llm_service import get_llm_service

            llm = get_llm_service()
            raw, _meta = await llm.generate(prompt, mode="resident", profile="general")

            # Parse JSON from response
            import re

            json_match = re.search(r"\[.*\]", raw, re.DOTALL)
            if not json_match:
                self._add_log("WARN", "proposal_parse_failed", raw=raw[:200])
                return []

            proposals_data = json.loads(json_match.group())
            new_proposals = []
            for item in proposals_data[:max_proposals]:
                proposal = MissionProposal(
                    id=str(uuid.uuid4())[:8],
                    name=item.get("name", "Bez názvu"),
                    description=item.get("description", ""),
                    type=item.get("type", "research"),
                    estimated_minutes=int(item.get("estimated_minutes", 15)),
                    relevance=item.get("relevance", ""),
                    created_at=_now(),
                )
                new_proposals.append(proposal)
                self._proposals.append(proposal)

            self._last_proposal_time = time.monotonic()
            self._add_log("INFO", "proposals_generated", count=len(new_proposals))
            await self.emit_thought(
                "tool_result",
                tool="propose_missions",
                result_preview=f"Navrhl {len(new_proposals)} misí",
            )

            # Keep max 20 proposals total
            if len(self._proposals) > 20:
                self._proposals = self._proposals[-20:]

            return [p.to_dict() for p in new_proposals]

        except Exception as exc:
            self._add_log("ERROR", "proposal_generation_failed", error=str(exc))
            await self.emit_thought(
                "error", content=f"Chyba při navrhování misí: {exc}"
            )
            return []

    async def _process_task_queue(self) -> None:
        """Načte pending tasky z job_service kde job_type == 'resident_task'.

        In observer mode all queued tasks are skipped (no LLM call is made).
        """
        mode = self._get_resident_mode()
        try:
            from app.services.job_service import get_job_service

            job_svc = get_job_service()
            pending_jobs = job_svc.list_jobs(status="queued", type="resident_task")
            resident_queue_depth.set(len(pending_jobs))
            logger.debug("resident_queue_depth updated: %d", len(pending_jobs))

            # Observer mode: leave tasks in the queue untouched (no LLM)
            if mode == "observer":
                if pending_jobs:
                    self._add_log(
                        "INFO",
                        "observer_tasks_skipped",
                        count=len(pending_jobs),
                        reason="observer mode – LLM disabled",
                    )
                return

            for job in pending_jobs:
                self._state.current_task = job.title
                self._state.status = "thinking"
                self._state.current_thought = f"Analyzuji úkol: {job.title}"
                await self.emit_thought(
                    "thinking", content=f"Analyzuji úkol: {job.title}"
                )

                task = {
                    "job_id": job.id,
                    "goal": job.title,
                    "description": job.input_summary,
                    **job.payload,
                }

                # Mark job as running
                job.status = "running"
                job.started_at = _now()
                job_svc.update_job(job)

                try:
                    await self.emit_thought(
                        "thinking", content=f"Spouštím úkol: {job.title}"
                    )
                    # Direct dispatch for known action types (no LLM needed)
                    action_type = job.payload.get("action_type")
                    if action_type and action_type in DIRECT_DISPATCH_ACTIONS:
                        result = await self._dispatch_action(
                            {
                                "action": action_type,
                                "params": job.payload.get("params", {}),
                            }
                        )
                    else:
                        result = await self._execute_with_llm(task)
                    job.status = "succeeded"
                    job.progress = 100.0
                    job.finished_at = _now()
                    output_summary = str(result)[:500]
                    job.meta["result"] = output_summary
                    await self.emit_thought(
                        "tool_result",
                        tool="task",
                        result_preview=f"Úkol dokončen: {job.title}",
                    )
                    # Insight notification for analysis jobs with substantial output
                    if (
                        job.payload.get("action_type") == "analysis"
                        and len(output_summary) > 150
                    ):
                        try:
                            import os

                            if os.environ.get("NOTIFICATIONS_ENABLED", "true").lower() != "false":
                                from app.services.notification_service import get_notification_service

                                notif_svc = get_notification_service()
                                await notif_svc.send(
                                    title=f"Agent zjistil: {job.title[:50]}",
                                    body=output_summary[:250],
                                    level="insight",
                                    source="resident_agent",
                                    action_url="/resident/thoughts",
                                    importance=7,
                                )
                        except Exception as exc:
                            logger.debug("Analysis insight notification failed: %s", exc)
                except Exception as exc:
                    job.status = "failed"
                    job.last_error = str(exc)
                    job.finished_at = _now()
                    self._state.errors_since_start += 1
                    logger.error("Resident task %s failed: %s", job.id, exc)
                    await self.emit_thought("error", content=f"Ukol selhal: {exc}")
                    # Curiosity hook: track job failure
                    try:
                        from app.services.resident_curiosity import (
                            get_curiosity_service,
                        )

                        get_curiosity_service().hook_job_failure(
                            job_id=job.id, job_type=job.type, error=str(exc)
                        )
                    except Exception:
                        pass
                finally:
                    job_svc.update_job(job)
                    # Generate reflection for completed task
                    await self._generate_reflection_for_job(job)
                    # Close curiosity item based on job result
                    await self._resolve_curiosity_from_job(job)

                self._state.current_task = None
                self._state.status = "idle"
                self._state.current_thought = ""

        except Exception as exc:
            logger.error("Resident task queue processing error: %s", exc)

    async def _periodic_check(self) -> None:
        """Každých 5 minut (tick_count % 10 == 0) provede system check."""
        if self._state.tick_count % 10 != 0:
            return

        # Cleanup stale curiosity items (in_progress > 2h without running job)
        await self._cleanup_stale_curiosity()

        try:
            from app.services.resource_monitor import get_resource_monitor

            monitor = get_resource_monitor()
            snapshot = monitor.to_dict()

            # Check git status pro nakonfigurované projekty
            git_statuses = {}
            try:
                from app.services.settings_service import get_settings_service

                settings = get_settings_service().load()
                git_projects = settings.get("git_projects", [])
                enabled_projects = [p for p in git_projects if p.get("enabled", True)]

                if enabled_projects:
                    from app.services.git_service import GitService

                    git_svc = GitService()
                    for project in enabled_projects:
                        name = project.get("name", "unknown")
                        path = project.get("path", "")
                        if path:
                            try:
                                status = await git_svc.status(path)
                                git_statuses[name] = status
                            except Exception:
                                git_statuses[name] = {"error": "failed to get status"}
            except Exception as exc:
                logger.debug("Resident periodic git check failed: %s", exc)

            # Pokud resource_monitor.is_throttled() → uloží warning do memory
            if monitor.is_throttled():
                try:
                    from app.services.memory_service import get_memory_service

                    mem = get_memory_service()
                    await mem.add_memory(
                        text=f"System resource warning: RAM {snapshot.get('ram_used_percent', '?')}%, "
                        f"CPU {snapshot.get('cpu_percent', '?')}%",
                        tags=["resident", "resource_warning"],
                        source="resident_agent",
                        importance=7,
                    )
                except Exception as exc:
                    logger.debug("Failed to store resource warning: %s", exc)

            # Ulož výsledek do memory jen pokud je throttled nebo jsou git změny
            # Importance guide:
            # importance=1-2: system checks, routine logs (auto-summarized after 50 ticks)
            # importance=3-4: completed actions, task results (keep 7 days)
            # importance=5-6: errors, anomalies, decisions (keep 30 days)
            # importance=7-8: self-healing events, high-risk blocks (keep permanently)
            # importance=9-10: critical failures, security events (keep permanently)
            if monitor.is_throttled() or git_statuses:
                try:
                    from app.services.memory_service import get_memory_service

                    mem = get_memory_service()
                    check_summary = (
                        f"System check: RAM {snapshot.get('ram_used_percent', '?')}%, "
                        f"CPU {snapshot.get('cpu_percent', '?')}%, "
                        f"projects checked: {len(git_statuses)}"
                    )
                    await mem.add_memory(
                        text=check_summary,
                        tags=["resident", "system_check"],
                        source="resident_agent",
                        importance=4 if monitor.is_throttled() else 2,
                    )
                except Exception as exc:
                    logger.debug("Failed to store system check: %s", exc)

            # ── Notification triggers ────────────────────────────────
            await self._check_notification_triggers(snapshot)

            logger.info(
                "Resident periodic check completed (tick %d)", self._state.tick_count
            )

        except Exception as exc:
            logger.error("Resident periodic check error: %s", exc)

    # ── Notification triggers ────────────────────────────────────────────────

    async def _check_notification_triggers(self, snapshot: dict) -> None:
        """Check various conditions and send proactive notifications."""
        import os

        if os.environ.get("NOTIFICATIONS_ENABLED", "true").lower() == "false":
            return

        try:
            from app.services.notification_service import get_notification_service

            notif_svc = get_notification_service()

            # 1) High RAM – two consecutive ticks above 88%
            ram_pct = snapshot.get("ram_used_percent", 0)
            if ram_pct > 88:
                prev = getattr(self, "_prev_high_ram", False)
                if prev:
                    await notif_svc.send(
                        title="Vysoká RAM",
                        body=f"RAM {ram_pct:.0f}% – systém je pod zátěží.",
                        level="warning",
                        source="resident_agent",
                        importance=7,
                        priority="high",
                        tags=["warning"],
                    )
                    self._prev_high_ram = False  # don't spam every tick
                else:
                    self._prev_high_ram = True
            else:
                self._prev_high_ram = False

            # 1b) Ollama offline detection
            try:
                import httpx
                from app.services.settings_service import LOCAL_LLM_BASE_URL, get_settings_service

                ollama_url = get_settings_service().get_llm_config().get(
                    "ollama_url", LOCAL_LLM_BASE_URL
                )
                async with httpx.AsyncClient(timeout=5.0) as client:
                    resp = await client.get(f"{ollama_url}/api/tags")
                    resp.raise_for_status()
                    self._ollama_offline_notified = False
            except Exception:
                if not getattr(self, "_ollama_offline_notified", False):
                    await notif_svc.send(
                        title="Ollama offline",
                        body="Ollama neodpovídá. LLM funkce nejsou dostupné.",
                        level="alert",
                        source="resident_agent",
                        importance=9,
                        priority="high",
                        tags=["rotating_light"],
                    )
                    self._ollama_offline_notified = True

            # 2) Series of failed jobs – 3+ in last hour
            try:
                from app.services.job_service import get_job_service
                from datetime import timedelta

                job_svc = get_job_service()
                since_1h = (
                    datetime.now(timezone.utc) - timedelta(hours=1)
                ).isoformat()
                failed_count = job_svc.count_jobs(status="failed", since=since_1h)
                if failed_count >= 3:
                    # Only notify once per hour
                    last_fail_notif = getattr(self, "_last_failed_jobs_notif_hour", -1)
                    current_hour = datetime.now(timezone.utc).hour
                    if last_fail_notif != current_hour:
                        await notif_svc.send(
                            title="Opakované chyby jobů",
                            body=f"{failed_count} jobů selhalo v poslední hodině.",
                            level="warning",
                            source="resident_agent",
                            importance=8,
                        )
                        self._last_failed_jobs_notif_hour = current_hour
            except Exception as exc:
                logger.debug("Failed jobs notification check error: %s", exc)

        except Exception as exc:
            logger.debug("Notification trigger check error: %s", exc)

    async def _digest_tick(self) -> None:
        """Send a daily digest notification once per day at the configured hour."""
        import os

        if os.environ.get("NOTIFICATIONS_ENABLED", "true").lower() == "false":
            return
        if os.environ.get("RESIDENT_DAILY_DIGEST_ENABLED", "true").lower() != "true":
            return

        digest_hour = int(os.environ.get("RESIDENT_DAILY_DIGEST_HOUR", "18"))
        now = datetime.now(timezone.utc)
        current_hour = now.hour

        if current_hour != digest_hour:
            return

        # Ensure max once per 23 hours
        last_digest = getattr(self, "_last_digest_at", None)
        if last_digest:
            elapsed = (now - last_digest).total_seconds()
            if elapsed < 23 * 3600:
                return

        try:
            from app.services.job_service import get_job_service
            from app.services.notification_service import get_notification_service
            from datetime import timedelta

            job_svc = get_job_service()
            notif_svc = get_notification_service()
            since_24h = (now - timedelta(hours=24)).isoformat()
            stats = job_svc.get_stats_since(since_24h)

            succeeded = int(stats.get("tasks_total", 0) * stats.get("success_rate", 0))
            failed = job_svc.count_jobs(status="failed", since=since_24h)

            # Closed curiosity items
            closed_curiosity = 0
            try:
                from app.services.resident_curiosity import get_curiosity_service

                curiosity_svc = get_curiosity_service()
                closed_items = curiosity_svc.list_items(status="closed", limit=100)
                # Filter to last 24h
                closed_curiosity = sum(
                    1 for item in closed_items
                    if getattr(item, "closed_at", "") >= since_24h
                )
            except Exception:
                pass

            date_str = now.strftime("%d.%m.%Y")
            body_parts = [
                f"Ticků: {self._state.tick_count}",
                f"Joby: {succeeded} úspěšných, {failed} selhalo",
                f"Curiosity uzavřeno: {closed_curiosity}",
            ]

            # Top 2 thoughts by importance
            try:
                from app.services.memory_service import get_memory_service

                mem = get_memory_service()
                recent_mems = await mem.search_memory("resident thought", top_k=5)
                top_thoughts = sorted(
                    recent_mems,
                    key=lambda m: getattr(m, "importance", 0),
                    reverse=True,
                )[:2]
                for t in top_thoughts:
                    text = getattr(t, "text", "")[:80]
                    if text:
                        body_parts.append(f"• {text}")
            except Exception:
                pass

            body = "\n".join(body_parts)

            await notif_svc.send(
                title=f"Denní přehled – {date_str}",
                body=body,
                level="info",
                source="resident_agent",
                action_url="/resident",
                importance=5,
            )

            # Store digest in memory
            try:
                from app.services.memory_service import get_memory_service

                mem = get_memory_service()
                await mem.add_memory(
                    text=f"Daily digest {date_str}: {body}",
                    tags=["resident", "decision"],
                    source="resident_agent",
                    importance=5,
                )
            except Exception:
                pass

            self._last_digest_at = now
            logger.info("Daily digest sent for %s", date_str)

        except Exception as exc:
            logger.error("Daily digest failed: %s", exc)

    async def _summarize_old_memories(self) -> None:
        """Every 50 ticks, summarize old low-importance records into one summary."""
        if self._state.tick_count % 50 != 0:
            return
        try:
            from app.services.memory_service import get_memory_service
            from app.services.llm_service import get_llm_service

            mem = get_memory_service()
            llm = get_llm_service()

            # Find low-importance records
            old_records = await mem.search_memory("system check", top_k=30)
            low_importance = [r for r in old_records if r.importance < 4]

            if len(low_importance) < 10:
                return  # Not worth summarizing

            texts = "\n".join([f"- {r.text[:200]}" for r in low_importance[:20]])
            prompt = (
                f"Shrň tyto záznamy z paměti agenta do 2-3 vět. "
                f"Zachovej jen důležité vzory a anomálie:\n\n{texts}"
            )
            summary, _ = await llm.generate(
                message=prompt, mode="resident", profile="general"
            )

            # Store summary
            await mem.add_memory(
                text=f"[SUMMARY] {summary[:500]}",
                tags=["resident", "summary", "auto_generated"],
                source="resident_agent",
                importance=6,
            )

            # Delete original records
            for r in low_importance[:20]:
                try:
                    await mem.delete_memory(r.id)
                except Exception:
                    pass

            logger.info(
                "Memory summarized: %d records -> 1 summary", len(low_importance[:20])
            )
        except Exception as exc:
            logger.debug("Memory summarization failed: %s", exc)

    async def _execute_with_llm(self, task: dict) -> dict:
        """
        Jádro resident agenta – sestaví kontext, zavolá LLM, parsuje JSON, exekuuje akci.
        """
        cycle_id = f"cycle-{self._state.tick_count:04d}"

        # Throttle detection: skip LLM call if system is under load
        try:
            from app.services.resource_monitor import get_resource_monitor

            monitor = get_resource_monitor()
            if monitor.is_throttled():
                self._add_log(
                    "WARN",
                    "throttled_skip",
                    cycle_id=cycle_id,
                    reason="System under load – skipping LLM call",
                )
                log.warning(
                    "Resident agent throttled_skip – system under load",
                    cycle_id=cycle_id,
                )
                return {"action": "no_op", "reason": "throttled_skip"}
        except Exception:
            pass

        self._state.status = "thinking"
        self._state.current_thought = (
            f"Přemýšlím nad úkolem: {task.get('goal', 'unknown')}"
        )

        self._add_log(
            "INFO",
            "thought_generated",
            cycle_id=cycle_id,
            thought=self._state.current_thought[:100],
            tools_available=list(ALLOWED_ACTIONS),
        )

        # 1. Sestav system_summary (max 300 tokenů)
        from app.services.resource_monitor import get_resource_monitor

        monitor = get_resource_monitor()
        resource_snapshot = monitor.to_dict()

        system_summary = (
            f"System: RAM {resource_snapshot.get('ram_used_percent', '?')}%, "
            f"CPU {resource_snapshot.get('cpu_percent', '?')}%, "
            f"throttled: {resource_snapshot.get('throttle', False)}, "
            f"blocked: {resource_snapshot.get('block', False)}. "
            f"Tick #{self._state.tick_count}."
        )

        if self._state.recent_steps:
            steps_text = "\n".join(
                f"- [{s.get('action', '?')}] {s.get('reasoning', '')[:80]}"
                for s in self._state.recent_steps[-5:]
            )
            system_summary += f"\n\nPoslední kroky:\n{steps_text}"

        # 2. Sestav allowed_actions list
        allowed_actions_text = "Povolené akce: " + ", ".join(ALLOWED_ACTIONS)

        # 2a. KB empty fallback
        kb_context = ""
        try:
            from app.services.vector_store_service import get_vector_store_service

            vs = get_vector_store_service()
            kb_stats = vs.get_stats()
            total_chunks = kb_stats.get("total_chunks", 0)
            if total_chunks == 0:
                kb_context = (
                    "\nKB je prázdná – basuj rozhodnutí na systémovém stavu a paměti."
                )
            else:
                kb_context = f"\nKB: {total_chunks} chunků k dispozici."
        except Exception:
            kb_context = "\nKB nedostupná."

        # 2b. Load active skills and add to context
        skills_context = ""
        try:
            from app.services.skills_service import get_skills_service

            skills_svc = get_skills_service()
            active_skills = skills_svc.list()
            if active_skills:
                skills_lines = []
                for skill in active_skills:
                    skills_lines.append(
                        f"- {skill.get('name', '?')}: {skill.get('description', '')}"
                    )
                    if skill.get("system_prompt_addition"):
                        skills_lines.append(
                            f"  Instrukce: {skill['system_prompt_addition'][:200]}"
                        )
                skills_context = "\n\nDostupné dovednosti:\n" + "\n".join(skills_lines)
        except Exception as exc:
            logger.debug("Failed to load skills for context: %s", exc)

        # 3. Zavolej LLM
        from app.services.llm_service import get_llm_service
        from app.services.settings_service import get_settings_service

        llm_svc = get_llm_service()
        system_prompt = get_settings_service().get_system_prompt("resident")

        from app.services.llm_service import get_date_context

        user_message = (
            get_date_context() + f"{system_summary}"
            f"{kb_context}\n\n"
            f"{allowed_actions_text}"
            f"{skills_context}\n\n"
            f"Úkol: {task.get('goal', 'unknown')}\n"
            f"Popis: {task.get('description', 'žádný')}"
        )

        # Use longer timeout for LLM calls – configurable, min 90s for local models
        step_timeout = max(
            get_settings_service()
            .get_agent_config("general")
            .get("step_timeout_s", 30),
            RESIDENT_LLM_TIMEOUT_SECONDS,
        )
        max_attempts = RESIDENT_LLM_MAX_RETRIES + 1  # retries + initial attempt

        # Resolve model: agent_settings.model → default from LLM config
        model_override = self._agent_settings.model or None
        if not model_override:
            # Fallback to default model from LLM config
            llm_cfg = get_settings_service().get_llm_config(profile="general")
            model_override = llm_cfg.get("model") or None

        # Record current model so UI can show which model is being used
        self._state.current_model = model_override or "default"

        self._add_log(
            "INFO",
            "llm_request_start",
            cycle_id=cycle_id,
            model=self._state.current_model,
            timeout_s=step_timeout,
            max_attempts=max_attempts,
        )
        self._set_phase("waiting_llm", cycle_id)

        # Retry loop: up to RESIDENT_LLM_MAX_RETRIES retries on timeout
        last_error = None
        llm_call_start = time.monotonic()
        for attempt in range(max_attempts):
            if attempt > 0:
                self._state.retry_count = attempt
                self._set_phase("retrying_llm", cycle_id)
            try:
                async with asyncio.timeout(step_timeout):
                    reply, meta = await llm_svc.generate(
                        message=user_message,
                        mode="resident",
                        profile="general",
                        model_override=model_override,
                    )
                # Check if LLM returned an unavailable response
                if meta.get("status") == "llm_unavailable":
                    error_msg = meta.get("message", "LLM nedostupné")
                    logger.error(
                        "Resident agent LLM unavailable (tick=%d, model=%s): %s",
                        self._state.tick_count,
                        model_override or "default",
                        error_msg,
                    )
                    self._add_log(
                        "ERROR",
                        "llm_unavailable",
                        cycle_id=cycle_id,
                        model=model_override or "default",
                        message=error_msg,
                    )
                    return {
                        "error": "llm_unavailable",
                        "action": "no_op",
                        "message": error_msg,
                    }
                # Record how long the successful LLM call took
                self._state.last_llm_duration_ms = round(
                    (time.monotonic() - llm_call_start) * 1000, 1
                )
                self._add_log(
                    "INFO",
                    "llm_request_success",
                    cycle_id=cycle_id,
                    attempt=attempt + 1,
                    duration_ms=self._state.last_llm_duration_ms,
                )
                last_error = None
                break  # success
            except asyncio.TimeoutError:
                last_error = "timeout"
                logger.warning(
                    "Resident agent LLM call timed out (tick=%d, timeout=%ds, attempt=%d/%d)",
                    self._state.tick_count,
                    step_timeout,
                    attempt + 1,
                    max_attempts,
                )
                if attempt < max_attempts - 1:
                    self._add_log(
                        "WARN",
                        "llm_timeout_retry",
                        cycle_id=cycle_id,
                        attempt=attempt + 1,
                        timeout_s=step_timeout,
                    )
                    await asyncio.sleep(2)  # brief pause before retry

        if last_error == "timeout":
            self._add_log(
                "ERROR",
                "llm_timeout_final",
                cycle_id=cycle_id,
                attempt=max_attempts,
                timeout_s=step_timeout,
                model=model_override or "default",
                consecutive_failures=self._state.consecutive_failures,
            )
            # Enter cooldown: block new cycles for RESIDENT_TIMEOUT_COOLDOWN_SECONDS
            self._cycle_cooldown_until = time.monotonic() + RESIDENT_TIMEOUT_COOLDOWN_SECONDS
            self._set_phase("cooldown", cycle_id)
            self._state.last_error = f"LLM timeout after {max_attempts} attempt(s)"
            self._state.last_error_at = _now()
            # Increment failure counter; degraded mode entry is handled by _tick()
            self._state.consecutive_failures += 1
            if (
                not self._state.degraded_mode
                and self._state.consecutive_failures
                >= RESIDENT_MAX_CONSECUTIVE_FAILURES_BEFORE_DEGRADED
            ):
                self._enter_degraded_mode(
                    reason=f"LLM timeout – {self._state.consecutive_failures} consecutive failures",
                    cycle_id=cycle_id,
                )
            return {"error": "llm_timeout", "action": "no_op"}

        # 4. Parsuj JSON response
        try:
            # Try to extract JSON from response
            payload = self._parse_json_response(reply)
        except (json.JSONDecodeError, ValueError) as exc:
            logger.error("Resident agent LLM returned invalid JSON: %s", exc)
            # Ulož do memory jako failed
            try:
                from app.services.memory_service import get_memory_service

                mem = get_memory_service()
                await mem.add_memory(
                    text=f"Resident agent LLM invalid JSON response for task: {task.get('goal', '?')}",
                    tags=["resident", "error", "invalid_json"],
                    source="resident_agent",
                    importance=5,
                )
            except Exception:
                pass
            return {"error": "invalid_json", "raw_reply": reply[:200]}

        # 5. Check risk_level
        if payload.get("risk_level") == "high":
            logger.warning(
                "Resident agent blocked high-risk action: %s", payload.get("action")
            )
            try:
                from app.services.memory_service import get_memory_service

                mem = get_memory_service()
                await mem.add_memory(
                    text=f"Blocked high-risk action: {payload.get('action')} - {payload.get('reasoning_summary', '')}",
                    tags=["resident", "blocked_high_risk"],
                    source="resident_agent",
                    importance=8,
                )
            except Exception:
                pass
            return {
                "blocked": True,
                "reason": "high_risk",
                "action": payload.get("action"),
            }

        # 6. Exekuuj akci deterministicky
        self._state.status = "executing"
        self._state.current_thought = f"Provádím: {payload.get('action', 'unknown')}"

        self._add_log(
            "INFO",
            "action_planned",
            cycle_id=cycle_id,
            action_type=payload.get("action", "unknown"),
            action_target=(
                str(payload.get("params", {})).get("query", payload.get("action", ""))[
                    :80
                ]
                if isinstance(payload.get("params"), dict)
                else ""
            ),
            confidence=payload.get("priority", "low"),
        )

        result = await self._dispatch_action(payload)

        self._add_log(
            "INFO",
            "action_executed",
            cycle_id=cycle_id,
            success=True,
            output_preview=str(result)[:80],
            action=payload.get("action", "unknown"),
        )

        # 7. Výsledek přidej do recent_steps (max 5)
        step_record = {
            "tick": self._state.tick_count,
            "timestamp": _now(),
            "action": payload.get("action", "unknown"),
            "reasoning": payload.get("reasoning_summary", ""),
            "result_summary": str(result)[:200],
            "priority": payload.get("priority", "low"),
        }
        self._state.recent_steps.append(step_record)
        if len(self._state.recent_steps) > 5:
            self._state.recent_steps = self._state.recent_steps[-5:]

        self._state.last_action = payload.get("action")

        # Broadcast action
        await self._broadcast(
            {
                "type": WS_EVENT_RESIDENT_ACTION,
                "action": payload.get("action"),
                "reasoning": payload.get("reasoning_summary", ""),
                "result_preview": str(result)[:200],
            }
        )

        # 8. Ulož do memory_service jako entry
        try:
            from app.services.memory_service import get_memory_service

            mem = get_memory_service()
            await mem.add_memory(
                text=f"Resident action: {payload.get('action')} - {payload.get('reasoning_summary', '')} | Result: {str(result)[:300]}",
                tags=["resident", "action", payload.get("action", "unknown")],
                source="resident_agent",
                importance=3,
            )
        except Exception as exc:
            logger.debug("Failed to store resident action in memory: %s", exc)

        return result

    # Tool dispatch: _parse_json_response, _dispatch_action,
    # _dispatch_spawn_specialist → tools.py (ToolsMixin)

    # Memory operations: get_agent_memory, clear_agent_memory,
    # delete_agent_memory_by_id, add_agent_memory_manual → memory.py (MemoryMixin)

    # Pending actions: get_pending_actions, add_pending_action,
    # approve_action, reject_action → pending_actions.py (PendingActionsMixin)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# Singleton
_resident_agent = ResidentAgent()


def get_resident_agent() -> ResidentAgent:
    return _resident_agent
