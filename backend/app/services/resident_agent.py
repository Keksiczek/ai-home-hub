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
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional

from app.services.background_service import BackgroundService

logger = logging.getLogger(__name__)

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

    def to_dict(self) -> dict:
        return asdict(self)


THOUGHT_TICK_INTERVAL = 20  # run reasoner every 20th tick (~10 min at 30s interval)
MISSION_TICK_INTERVAL = 4   # check missions every 4th tick (~2 min)
MAX_SUGGESTIONS_HISTORY = 20
MAX_REFLECTIONS_HISTORY = 50

WS_EVENT_RESIDENT_SUGGESTION = "resident_suggestion"


class ResidentAgent(BackgroundService):
    def __init__(self) -> None:
        super().__init__("resident_agent")
        self._state = ResidentAgentState()
        self._broadcast_fn: Optional[Callable] = None
        self._start_time: Optional[float] = None
        self._restart_requested: bool = False
        # Brain orchestrator state
        self._suggestions: List[Any] = []  # List[ResidentSuggestion]
        self._reflections: List[Any] = []  # List[ResidentReflection]

    def set_broadcast(self, fn: Callable) -> None:
        """Register a coroutine for broadcasting WebSocket messages."""
        self._broadcast_fn = fn

    async def _broadcast(self, message: dict) -> None:
        if self._broadcast_fn:
            try:
                await self._broadcast_fn(message)
            except Exception as exc:
                logger.debug("Resident agent broadcast failed: %s", exc)

    def get_state(self) -> dict:
        return self._state.to_dict()

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
        self._state.tick_count += 1
        self._state.last_tick = _now()

        # Heartbeat update
        self._state.last_heartbeat = _now()
        self._update_heartbeat_status()

        try:
            await self._process_task_queue()
            await self._process_missions()
            await self._thought_tick()
            await self._periodic_check()
            await self._proactive_alerts()
            # Successful tick resets consecutive error counter
            self._state.consecutive_errors = 0
        except Exception as exc:
            self._state.errors_since_start += 1
            self._state.consecutive_errors += 1
            self._state.status = "error"
            logger.error("Resident agent tick error: %s", exc)

            # Self-healing: too many consecutive errors → request restart
            if self._state.consecutive_errors >= CONSECUTIVE_ERROR_THRESHOLD:
                await self._request_self_healing_restart()

        await self._broadcast({
            "type": WS_EVENT_RESIDENT_TICK,
            "tick": self._state.tick_count,
            "status": self._state.status,
            "last_tick": self._state.last_tick,
            "heartbeat_status": self._state.heartbeat_status,
        })

        await asyncio.sleep(HEARTBEAT_INTERVAL_S)

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
            # Mission complete
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
        }

    async def _process_task_queue(self) -> None:
        """Načte pending tasky z job_service kde job_type == 'resident_task'."""
        try:
            from app.services.job_service import get_job_service
            job_svc = get_job_service()
            pending_jobs = job_svc.list_jobs(status="queued", type="resident_task")

            for job in pending_jobs:
                self._state.current_task = job.title
                self._state.status = "thinking"

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
                    result = await self._execute_with_llm(task)
                    job.status = "succeeded"
                    job.progress = 100.0
                    job.finished_at = _now()
                    job.meta["result"] = str(result)[:500]
                except Exception as exc:
                    job.status = "failed"
                    job.last_error = str(exc)
                    job.finished_at = _now()
                    self._state.errors_since_start += 1
                    logger.error("Resident task %s failed: %s", job.id, exc)
                finally:
                    job_svc.update_job(job)
                    # Generate reflection for completed task
                    await self._generate_reflection_for_job(job)

                self._state.current_task = None
                self._state.status = "idle"

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

            # Ulož výsledek do memory jako entry typu "system_check"
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
                    importance=2,
                )
            except Exception as exc:
                logger.debug("Failed to store system check: %s", exc)

            logger.info("Resident periodic check completed (tick %d)", self._state.tick_count)

        except Exception as exc:
            logger.error("Resident periodic check error: %s", exc)

    async def _execute_with_llm(self, task: dict) -> dict:
        """
        Jádro resident agenta – sestaví kontext, zavolá LLM, parsuje JSON, exekuuje akci.
        """
        self._state.status = "thinking"

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

        # 3. Zavolej LLM
        from app.services.llm_service import get_llm_service
        from app.services.settings_service import get_settings_service

        llm_svc = get_llm_service()
        system_prompt = get_settings_service().get_system_prompt("resident")

        user_message = (
            f"{system_summary}\n\n"
            f"{allowed_actions_text}\n\n"
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
        result = await self._dispatch_action(payload)

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

        else:
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


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# Singleton
_resident_agent = ResidentAgent()


def get_resident_agent() -> ResidentAgent:
    return _resident_agent
