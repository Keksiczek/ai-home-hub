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

from app.services.background_service import BackgroundService
from app.services.metrics_service import agent_cycles_total

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
]

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

    def to_dict(self) -> dict:
        d = asdict(self)
        d["cycle_count"] = d["tick_count"]
        return d


THOUGHT_TICK_INTERVAL = 20  # run reasoner every 20th tick (~10 min at 30s interval)
MISSION_TICK_INTERVAL = 4   # check missions every 4th tick (~2 min)
MAX_SUGGESTIONS_HISTORY = 20
MAX_REFLECTIONS_HISTORY = 50
MAX_CYCLE_HISTORY = 200
MAX_LOG_ENTRIES = 1000

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
    interval_seconds: int = 30
    model: str = ""  # empty = use default from settings
    max_cycles_per_day: int = 100
    quiet_hours_start: str = "22:00"  # HH:MM
    quiet_hours_end: str = "07:00"    # HH:MM
    quiet_hours_enabled: bool = False
    # Mission proposal settings
    proposal_interval_minutes: int = 60  # how often to propose missions
    max_proposals: int = 3  # max proposals per round
    interest_topics: str = ""  # comma-separated topics of interest

    def to_dict(self) -> dict:
        return asdict(self)


class ResidentAgent(BackgroundService):
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
        log_fn = log.info if level == "INFO" else (log.warning if level == "WARN" else log.error)
        log_fn(event, cycle_id=cycle_id, **data)

    def _add_cycle_record(self, record: CycleRecord) -> None:
        """Add a cycle record to history."""
        self._cycle_history.append(record)

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
        await self._broadcast({"type": "agent_status", "status": "paused", "is_running": True})
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
        return {"status": "ok", "message": "Immediate cycle completed.", "cycle": self._state.tick_count}

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

    def _is_quiet_hours(self) -> bool:
        """Check if current time is within quiet hours."""
        if not self._agent_settings.quiet_hours_enabled:
            return False
        now = datetime.now()
        current_minutes = now.hour * 60 + now.minute
        try:
            start_h, start_m = map(int, self._agent_settings.quiet_hours_start.split(":"))
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

    def get_state(self) -> dict:
        d = self._state.to_dict()
        d["paused"] = self._paused
        d["quiet_hours_active"] = self._is_quiet_hours()
        d["agent_settings"] = self._agent_settings.to_dict()
        return d

    def get_uptime_seconds(self) -> float:
        if self._start_time is None:
            return 0.0
        return time.monotonic() - self._start_time

    async def _on_start(self) -> None:
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

    async def start(self) -> dict:
        """Spustí async loop jako asyncio.Task, uloží do memory_service záznam o startu."""
        if self._state.is_running:
            return {"status": "already_running", "message": "Resident agent is already running."}

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
        super().start()  # creates the asyncio.Task (sync, non-awaited)
        return {"status": "started", "message": "Resident agent started successfully."}

    async def stop(self) -> dict:
        """Graceful shutdown, uloží stav do memory."""
        if not self._state.is_running:
            return {"status": "not_running", "message": "Resident agent is not running."}

        self._state.is_running = False
        self._state.status = "idle"
        tick_count = self._state.tick_count
        self._start_time = None
        await super().stop()  # sets stop_event, cancels task, awaits _on_stop
        logger.info("Resident agent stopped after %d ticks", tick_count)
        return {"status": "stopped", "message": f"Stopped after {tick_count} ticks."}

    async def _tick(self) -> None:
        """Single iteration of the resident agent loop."""
        tick_start = time.monotonic()
        self._state.tick_count += 1
        self._state.last_tick = _now()
        cycle_id = f"cycle-{self._state.tick_count:04d}"

        # Skip tick if paused
        if self._paused:
            await self._heartbeat_broadcast()
            interval = self._agent_settings.interval_seconds
            await asyncio.sleep(interval)
            return

        # Skip tick during quiet hours
        if self._is_quiet_hours():
            self._state.status = "quiet"
            self._add_log("INFO", "quiet_hours_skip", cycle_id=cycle_id)
            await self._heartbeat_broadcast()
            await asyncio.sleep(self._agent_settings.interval_seconds)
            return

        # Skip if daily limit reached
        if not self._check_daily_limit():
            self._state.status = "limit_reached"
            self._add_log("WARN", "daily_limit_reached", cycle_id=cycle_id,
                          count=self._daily_cycle_count,
                          max=self._agent_settings.max_cycles_per_day)
            await self._heartbeat_broadcast()
            await asyncio.sleep(self._agent_settings.interval_seconds)
            return

        self._daily_cycle_count += 1

        # Heartbeat update
        self._state.last_heartbeat = _now()
        self._update_heartbeat_status()

        self._add_log("INFO", "cycle_start", cycle_id=cycle_id,
                       status="thinking",
                       last_action=self._state.last_action or "",
                       memory_items=len(self._state.recent_steps))

        cycle_record = CycleRecord(
            cycle_id=cycle_id,
            cycle_number=self._state.tick_count,
            timestamp=_now(),
            status="success",
        )

        try:
            await self._process_task_queue()
            await self._process_missions()
            await self._thought_tick()
            await self._periodic_check()
            await self._proactive_alerts()
            await self._summarize_old_memories()
            # Successful tick resets consecutive error counter
            self._state.consecutive_errors = 0

            duration_ms = (time.monotonic() - tick_start) * 1000
            cycle_record.duration_ms = round(duration_ms, 1)
            cycle_record.action_type = self._state.last_action or "periodic"
            self._add_log("INFO", "cycle_end", cycle_id=cycle_id,
                           duration_ms=cycle_record.duration_ms,
                           next_run_in=self._agent_settings.interval_seconds)
        except Exception as exc:
            self._state.errors_since_start += 1
            self._state.consecutive_errors += 1
            self._state.status = "error"
            duration_ms = (time.monotonic() - tick_start) * 1000
            cycle_record.status = "error"
            cycle_record.error = str(exc)
            cycle_record.duration_ms = round(duration_ms, 1)

            self._add_log("ERROR", "cycle_failed", cycle_id=cycle_id,
                           error=str(exc), traceback=traceback.format_exc())

            # Self-healing: too many consecutive errors → request restart
            if self._state.consecutive_errors >= CONSECUTIVE_ERROR_THRESHOLD:
                await self._request_self_healing_restart()

        self._add_cycle_record(cycle_record)
        agent_cycles_total.labels(status=cycle_record.status).inc()
        await self._heartbeat_broadcast()

        # Count down next_run_in for the UI
        interval = self._agent_settings.interval_seconds
        self._state.next_run_in = interval
        await asyncio.sleep(interval)

    async def _heartbeat_broadcast(self) -> None:
        """Push status via WebSocket for the live widget."""
        await self._broadcast({
            "type": WS_EVENT_RESIDENT_TICK,
            "tick": self._state.tick_count,
            "status": self._state.status,
            "last_tick": self._state.last_tick,
            "heartbeat_status": self._state.heartbeat_status,
        })
        await self._broadcast({
            "type": "agent_status",
            "status": self._state.status,
            "current_thought": self._state.current_thought,
            "last_action": self._state.last_action,
            "cycle_count": self._state.tick_count,
            "next_run_in": self._agent_settings.interval_seconds,
            "last_heartbeat": self._state.last_heartbeat,
            "is_running": self._state.is_running,
            "paused": self._paused,
            "quiet_hours_active": self._is_quiet_hours(),
            "error_count": self._state.errors_since_start,
            "uptime_seconds": round(self.get_uptime_seconds(), 1),
            "memory_items": len(self._state.recent_steps),
            "enabled_skills": list(ALLOWED_ACTIONS),
            "active_skills": self._get_active_skill_names(),
        })

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
        """Read current resident_mode from settings."""
        try:
            from app.services.settings_service import get_settings_service
            return get_settings_service().load().get("resident_mode", "advisor")
        except Exception:
            return "advisor"

    async def _thought_tick(self) -> None:
        """Periodically call the reasoner to generate suggestions."""
        if self._state.tick_count % THOUGHT_TICK_INTERVAL != 0:
            return

        mode = self._get_resident_mode()
        if mode == "observer":
            return

        try:
            from app.services.resident_reasoner import get_resident_reasoner
            reasoner = get_resident_reasoner()
            suggestion = await reasoner.generate_suggestions(mode)
            if suggestion is None:
                return

            self._suggestions.append(suggestion)
            if len(self._suggestions) > MAX_SUGGESTIONS_HISTORY:
                self._suggestions = self._suggestions[-MAX_SUGGESTIONS_HISTORY:]

            # In autonomous mode, auto-execute safe actions
            if mode == "autonomous":
                await self._auto_execute_safe_actions(suggestion)

            await self._broadcast({
                "type": WS_EVENT_RESIDENT_SUGGESTION,
                "suggestion_id": suggestion.id,
                "action_count": len(suggestion.actions),
                "mode": mode,
            })

            logger.info(
                "Resident reasoner generated %d suggestions (mode=%s)",
                len(suggestion.actions), mode,
            )
        except Exception as exc:
            logger.error("Thought tick failed: %s", exc)

    async def _auto_execute_safe_actions(self, suggestion) -> None:
        """In autonomous mode, execute actions that don't require confirmation."""
        from app.services.job_service import get_job_service
        job_svc = get_job_service()

        for action in suggestion.actions:
            if action.requires_confirmation:
                continue

            job = job_svc.create_job(
                type="resident_task",
                title=f"[Auto] {action.title}",
                input_summary=action.description,
                payload={"action_type": action.action_type, "auto_executed": True},
                priority="normal",
            )
            suggestion.executed_action_ids.append(action.id)
            logger.info("Auto-executed suggestion action: %s (job=%s)", action.title, job.id)

    async def _process_missions(self) -> None:
        """Process active resident_mission jobs – advance current step."""
        if self._state.tick_count % MISSION_TICK_INTERVAL != 0:
            return

        try:
            from app.services.job_service import get_job_service
            job_svc = get_job_service()

            # Find planned or in_progress missions
            for status_filter in ("queued", "running"):
                missions = job_svc.list_jobs(status=status_filter, type="resident_mission", limit=5)
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

    async def accept_suggestion_action(self, suggestion_id: str, action_id: str) -> Optional[str]:
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
            recent_tasks.append({
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
            })

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
            missions.append({
                "id": mj.id,
                "goal": plan.get("goal", mj.title),
                "status": plan.get("status", mj.status),
                "current_step": plan.get("current_step", 0),
                "total_steps": len(plan.get("steps", [])),
                "progress": mj.progress,
                "created_at": mj.created_at,
            })

        # KB chunk count for UI warning
        kb_chunks = 0
        try:
            from app.services.vector_store_service import get_vector_store_service
            vs = get_vector_store_service()
            kb_chunks = vs.get_stats().get("total_chunks", 0)
        except Exception:
            pass

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
            "suggestions_count": len(latest_suggestion.actions) if latest_suggestion else 0,
            "missions": missions,
            "reflections_count": len(self._reflections),
            "proposals": [p.to_dict() for p in self._proposals if p.status == "pending"],
            "kb_chunks": kb_chunks,
        }

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
        self._add_log("INFO", "proposal_approved", proposal_id=proposal_id, name=proposal.name)

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
        self._add_log("INFO", "proposal_rejected", proposal_id=proposal_id, name=proposal.name)
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
                {"title": j.title, "status": j.status, "type": j.type}
                for j in recent
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
                context["kb_note"] = "KB je prázdná – basuj rozhodnutí na systémovém stavu a paměti."
        except Exception:
            context["kb_chunks"] = 0
            context["kb_note"] = "KB nedostupná."

        # Interest topics
        if self._agent_settings.interest_topics:
            context["interest_topics"] = self._agent_settings.interest_topics

        max_proposals = self._agent_settings.max_proposals

        from app.services.llm_service import get_date_context
        prompt = (
            get_date_context()
            + "Jsi Resident Agent. Na základě kontextu navrhni 1-"
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
            json_match = re.search(r'\[.*\]', raw, re.DOTALL)
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
            await self.emit_thought("tool_result", tool="propose_missions",
                                     result_preview=f"Navrhl {len(new_proposals)} misí")

            # Keep max 20 proposals total
            if len(self._proposals) > 20:
                self._proposals = self._proposals[-20:]

            return [p.to_dict() for p in new_proposals]

        except Exception as exc:
            self._add_log("ERROR", "proposal_generation_failed", error=str(exc))
            await self.emit_thought("error", content=f"Chyba při navrhování misí: {exc}")
            return []

    async def _process_task_queue(self) -> None:
        """Načte pending tasky z job_service kde job_type == 'resident_task'."""
        try:
            from app.services.job_service import get_job_service
            job_svc = get_job_service()
            pending_jobs = job_svc.list_jobs(status="queued", type="resident_task")

            for job in pending_jobs:
                self._state.current_task = job.title
                self._state.status = "thinking"
                self._state.current_thought = f"Analyzuji úkol: {job.title}"
                await self.emit_thought("thinking", content=f"Analyzuji úkol: {job.title}")

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
                    await self.emit_thought("thinking", content=f"Spouštím úkol: {job.title}")
                    result = await self._execute_with_llm(task)
                    job.status = "succeeded"
                    job.progress = 100.0
                    job.finished_at = _now()
                    job.meta["result"] = str(result)[:500]
                    await self.emit_thought("tool_result", tool="task",
                                             result_preview=f"Úkol dokončen: {job.title}")
                except Exception as exc:
                    job.status = "failed"
                    job.last_error = str(exc)
                    job.finished_at = _now()
                    self._state.errors_since_start += 1
                    logger.error("Resident task %s failed: %s", job.id, exc)
                    await self.emit_thought("error", content=f"Úkol selhal: {exc}")
                finally:
                    job_svc.update_job(job)
                    # Generate reflection for completed task
                    await self._generate_reflection_for_job(job)

                self._state.current_task = None
                self._state.status = "idle"
                self._state.current_thought = ""

        except Exception as exc:
            logger.error("Resident task queue processing error: %s", exc)

    async def _periodic_check(self) -> None:
        """Každých 5 minut (tick_count % 10 == 0) provede system check."""
        if self._state.tick_count % 10 != 0:
            return

        try:
            from app.services.resource_monitor import get_resource_monitor
            monitor = get_resource_monitor()
            snapshot = monitor.to_dict()

            # Check git status pro nakonfigurované projekty
            git_statuses = {}
            try:
                from app.services.settings_service import get_settings_service
                settings = get_settings_service().load()
                projects = settings.get("integrations", {}).get("vscode", {}).get("projects", {})

                if projects:
                    from app.services.git_service import GitService
                    git_svc = GitService()
                    for name, project in projects.items():
                        path = project if isinstance(project, str) else project.get("path", "")
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

            logger.info("Resident periodic check completed (tick %d)", self._state.tick_count)

        except Exception as exc:
            logger.error("Resident periodic check error: %s", exc)

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
            summary, _ = await llm.generate(message=prompt, mode="resident", profile="general")

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

            logger.info("Memory summarized: %d records -> 1 summary", len(low_importance[:20]))
        except Exception as exc:
            logger.debug("Memory summarization failed: %s", exc)

    async def _execute_with_llm(self, task: dict) -> dict:
        """
        Jádro resident agenta – sestaví kontext, zavolá LLM, parsuje JSON, exekuuje akci.
        """
        cycle_id = f"cycle-{self._state.tick_count:04d}"
        self._state.status = "thinking"
        self._state.current_thought = f"Přemýšlím nad úkolem: {task.get('goal', 'unknown')}"

        self._add_log("INFO", "thought_generated", cycle_id=cycle_id,
                       thought=self._state.current_thought[:100],
                       tools_available=list(ALLOWED_ACTIONS))

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
                kb_context = "\nKB je prázdná – basuj rozhodnutí na systémovém stavu a paměti."
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
                        skills_lines.append(f"  Instrukce: {skill['system_prompt_addition'][:200]}")
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
            get_date_context()
            + f"{system_summary}"
            f"{kb_context}\n\n"
            f"{allowed_actions_text}"
            f"{skills_context}\n\n"
            f"Úkol: {task.get('goal', 'unknown')}\n"
            f"Popis: {task.get('description', 'žádný')}"
        )

        step_timeout = get_settings_service().get_agent_config("general").get("step_timeout_s", 30)
        try:
            async with asyncio.timeout(step_timeout):
                reply, meta = await llm_svc.generate(
                    message=user_message,
                    mode="resident",
                    profile="general",
                )
        except asyncio.TimeoutError:
            logger.warning(
                "Resident agent LLM call timed out (tick=%d, timeout=%ds)",
                self._state.tick_count, step_timeout,
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
            logger.warning("Resident agent blocked high-risk action: %s", payload.get("action"))
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
            return {"blocked": True, "reason": "high_risk", "action": payload.get("action")}

        # 6. Exekuuj akci deterministicky
        self._state.status = "executing"
        self._state.current_thought = f"Provádím: {payload.get('action', 'unknown')}"

        self._add_log("INFO", "action_planned", cycle_id=cycle_id,
                       action_type=payload.get("action", "unknown"),
                       action_target=str(payload.get("params", {})).get("query", payload.get("action", ""))[:80] if isinstance(payload.get("params"), dict) else "",
                       confidence=payload.get("priority", "low"))

        result = await self._dispatch_action(payload)

        self._add_log("INFO", "action_executed", cycle_id=cycle_id,
                       success=True,
                       output_preview=str(result)[:80],
                       action=payload.get("action", "unknown"))

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
        await self._broadcast({
            "type": WS_EVENT_RESIDENT_ACTION,
            "action": payload.get("action"),
            "reasoning": payload.get("reasoning_summary", ""),
            "result_preview": str(result)[:200],
        })

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

    def _parse_json_response(self, reply: str) -> dict:
        """Try to parse JSON from LLM response, handling common formats."""
        reply = reply.strip()

        # Try direct parse
        try:
            return json.loads(reply)
        except json.JSONDecodeError:
            pass

        # Try to find JSON block in markdown code fence
        if "```json" in reply:
            start = reply.index("```json") + 7
            end = reply.index("```", start)
            return json.loads(reply[start:end].strip())

        if "```" in reply:
            start = reply.index("```") + 3
            end = reply.index("```", start)
            return json.loads(reply[start:end].strip())

        # Try to find JSON object in the text
        brace_start = reply.find("{")
        brace_end = reply.rfind("}")
        if brace_start != -1 and brace_end != -1:
            return json.loads(reply[brace_start:brace_end + 1])

        raise ValueError("No valid JSON found in response")

    async def _dispatch_action(self, payload: dict) -> dict:
        """
        Deterministický dispatcher – exekuuje akce na základě LLM payloadu.

        payload struktura:
        {
            "reasoning_summary": "...",
            "action": "action_name",
            "params": {...},
            "priority": "low|medium|high",
            "risk_level": "safe|medium|high"
        }
        """
        action = payload.get("action", "")
        params = payload.get("params", {})

        if action == "read_file":
            from app.services.filesystem_service import get_filesystem_service
            fs = get_filesystem_service()
            content = await fs.read_file(params.get("path", ""))
            return {"action": "read_file", "content": content[:2000]}

        elif action == "list_directory":
            from app.services.filesystem_service import get_filesystem_service
            fs = get_filesystem_service()
            entries = await fs.list_directory(params.get("path", ""))
            return {"action": "list_directory", "entries": entries}

        elif action == "git_status":
            from app.services.git_service import GitService
            git_svc = GitService()
            status = await git_svc.status(params.get("repo_path", ""))
            return {"action": "git_status", "status": status}

        elif action == "git_log":
            from app.services.git_service import GitService
            git_svc = GitService()
            log = await git_svc.log(params.get("repo_path", ""), limit=params.get("limit", 5))
            return {"action": "git_log", "log": log}

        elif action == "kb_search":
            from app.services.vector_store_service import get_vector_store_service
            from app.services.embeddings_service import get_embeddings_service
            vs = get_vector_store_service()
            emb_svc = get_embeddings_service()
            query = params.get("query", "")
            embedding = await emb_svc.generate_embedding(query)
            if not embedding:
                return {"action": "kb_search", "results": [], "error": "embedding_failed"}
            results = vs.search(query_embedding=embedding, top_k=params.get("top_k", 5))
            # Format results
            formatted = []
            for doc, meta in zip(results.get("documents", []), results.get("metadatas", [])):
                formatted.append({
                    "text": doc[:300],
                    "file_name": meta.get("file_name", ""),
                })
            return {"action": "kb_search", "results": formatted}

        elif action == "memory_store":
            from app.services.memory_service import get_memory_service
            mem = get_memory_service()
            memory_id = await mem.add_memory(
                text=params.get("content", ""),
                tags=["resident", params.get("category", "general")],
                source="resident_agent",
                importance=params.get("importance", 5),
            )
            return {"action": "memory_store", "memory_id": memory_id}

        elif action == "memory_search":
            from app.services.memory_service import get_memory_service
            mem = get_memory_service()
            records = await mem.search_memory(params.get("query", ""), top_k=params.get("top_k", 5))
            return {
                "action": "memory_search",
                "results": [r.to_dict() for r in records],
            }

        elif action == "send_notification":
            from app.services.notification_service import get_notification_service
            notif = get_notification_service()
            success = await notif.send(
                title="Resident Agent",
                message=params.get("message", ""),
            )
            return {"action": "send_notification", "sent": success}

        elif action == "system_status":
            from app.services.resource_monitor import get_resource_monitor
            monitor = get_resource_monitor()
            return {"action": "system_status", **monitor.to_dict()}

        elif action == "spawn_specialist":
            return await self._dispatch_spawn_specialist(params)

        elif action == "no_op":
            logger.info("Resident agent no_op: %s", payload.get("reasoning_summary", ""))
            return {"action": "no_op", "reasoning": payload.get("reasoning_summary", "")}

        elif action == "web_search":
            try:
                from app.services.skills_runtime_service import WebSearchSkill
                skill = WebSearchSkill()
                query = params.get("query", task.get("goal", ""))
                max_results = params.get("max_results", 5)
                results = await skill.run(query=query, max_results=max_results)
                return {"action": "web_search", "query": query, "results": results}
            except Exception as exc:
                logger.error("web_search skill failed: %s", exc)
                return {"action": "web_search", "error": str(exc), "results": []}

        else:
            # Dynamic skill dispatch fallback
            try:
                from app.services.skills_runtime_service import SKILL_REGISTRY
                if action in SKILL_REGISTRY:
                    skill_cls = SKILL_REGISTRY[action]
                    skill_instance = skill_cls()
                    result = await skill_instance.run(**params)
                    return {"action": action, "result": result}
            except Exception as exc:
                logger.debug("Dynamic skill dispatch failed for %s: %s", action, exc)

            logger.warning("Resident agent action_not_allowed: %s", action)
            return {"error": "action_not_allowed", "action": action}

    async def _dispatch_spawn_specialist(self, params: dict) -> dict:
        """
        Spawne specializovaný agent přes agent_orchestrator.

        params:
        {
            "agent_type": "code|research",
            "goal": "...",
            "context_memory_query": "..."  # optional
        }
        """
        agent_type = params.get("agent_type", "")

        # Ověř že agent_type je "code" nebo "research"
        if agent_type not in ("code", "research"):
            return {"error": "agent_type_not_allowed", "agent_type": agent_type,
                    "allowed": ["code", "research"]}

        goal = params.get("goal", "unknown")
        task: Dict[str, Any] = {"goal": goal}

        # Load relevant skill context for the agent type
        try:
            from app.services.skills_service import get_skills_service
            skills_svc = get_skills_service()
            all_skills = skills_svc.list()
            # Map agent_type to relevant skill tags
            tag_map = {"code": ["code", "quality"], "research": ["analytics", "lean", "process"]}
            relevant_tags = set(tag_map.get(agent_type, []))
            for skill in all_skills:
                skill_tags = set(skill.get("tags", []))
                if skill_tags & relevant_tags and skill.get("system_prompt_addition"):
                    task.setdefault("skill_context", "")
                    task["skill_context"] += f"\n{skill['name']}: {skill['system_prompt_addition'][:300]}"
        except Exception as exc:
            logger.debug("Failed to load skill for specialist: %s", exc)

        # Pokud context_memory_query existuje → přidej memory kontext
        context_query = params.get("context_memory_query")
        if context_query:
            try:
                from app.services.memory_service import get_memory_service
                mem = get_memory_service()
                history = await mem.search_memory(context_query, top_k=5)
                if history:
                    task["memory_context"] = [r.to_dict() for r in history]
            except Exception as exc:
                logger.debug("Memory context search failed: %s", exc)

        # Spawne agent přes orchestrator
        from app.services.agent_orchestrator import get_agent_orchestrator
        orchestrator = get_agent_orchestrator()
        agent_id = await orchestrator.spawn_agent(
            agent_type=agent_type,
            task=task,
            depth=1,
            parent_agent_id="resident",
        )

        # Ulož do memory
        try:
            from app.services.memory_service import get_memory_service
            mem = get_memory_service()
            await mem.add_memory(
                text=f"Resident spawned {agent_type} agent: {goal}",
                tags=["resident", "agent_handoff"],
                source="resident_agent",
                importance=5,
            )
        except Exception as exc:
            logger.debug("Failed to store agent handoff in memory: %s", exc)

        return {"spawned_agent_id": agent_id, "agent_type": agent_type, "goal": goal}


    async def get_agent_memory(self, limit: int = 50) -> List[dict]:
        """Retrieve agent memory entries from memory_service."""
        try:
            from app.services.memory_service import get_memory_service
            mem = get_memory_service()
            records = await mem.search_memory("resident agent", top_k=limit)
            return [r.to_dict() for r in records]
        except Exception as exc:
            logger.debug("Failed to get agent memory: %s", exc)
            return []

    async def clear_agent_memory(self) -> dict:
        """Clear all resident agent memory entries."""
        try:
            from app.services.memory_service import get_memory_service
            mem = get_memory_service()
            # Search for resident-tagged memories and delete them
            records = await mem.search_memory("resident", top_k=200)
            deleted = 0
            for r in records:
                if "resident" in r.tags:
                    try:
                        await mem.delete_memory(r.id)
                        deleted += 1
                    except Exception:
                        pass
            self._add_log("INFO", "memory_cleared", deleted=deleted)
            return {"status": "ok", "deleted": deleted}
        except Exception as exc:
            logger.debug("Failed to clear agent memory: %s", exc)
            return {"status": "error", "error": str(exc)}

    async def delete_agent_memory_by_id(self, memory_id: str) -> dict:
        """Delete a single agent memory entry by ID."""
        try:
            from app.services.memory_service import get_memory_service
            mem = get_memory_service()
            deleted = await mem.delete_memory(memory_id)
            if not deleted:
                return {"status": "not_found", "memory_id": memory_id}
            self._add_log("INFO", "memory_item_deleted", memory_id=memory_id)
            return {"status": "ok", "memory_id": memory_id}
        except Exception as exc:
            logger.debug("Failed to delete agent memory %s: %s", memory_id, exc)
            return {"status": "error", "error": str(exc)}

    async def add_agent_memory_manual(self, content: str, tags: list[str] | None = None) -> dict:
        """Manually add an entry to agent memory."""
        try:
            from app.services.memory_service import get_memory_service
            mem = get_memory_service()
            all_tags = list({"resident", "manual", *(tags or [])})
            memory_id = await mem.add_memory(
                text=content,
                tags=all_tags,
                source="manual",
                importance=5,
            )
            self._add_log("INFO", "memory_item_added_manual", memory_id=memory_id)
            return {"status": "ok", "memory_id": memory_id}
        except Exception as exc:
            logger.debug("Failed to add agent memory: %s", exc)
            return {"status": "error", "error": str(exc)}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# Singleton
_resident_agent = ResidentAgent()


def get_resident_agent() -> ResidentAgent:
    return _resident_agent
