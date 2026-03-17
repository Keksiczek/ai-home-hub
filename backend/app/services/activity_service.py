"""Activity service – aggregates live system status for the activity bar.

Pushes updates via WebSocket every 3 seconds, combining data from:
- resident_agent (status, current thought)
- job_service (active jobs count)
- resource_monitor (RAM, CPU)
- kb_stats_cache (chunk count)
- Ollama health
"""
import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, Callable, Dict, Optional

logger = logging.getLogger(__name__)

WS_EVENT_ACTIVITY = "activity_update"


class ActivityService:
    """Aggregates system-wide activity data and pushes via WS."""

    def __init__(self) -> None:
        self._task: Optional[asyncio.Task] = None
        self._broadcast_fn: Optional[Callable] = None
        self._interval_seconds: float = 3.0

    def set_broadcast(self, fn: Callable) -> None:
        self._broadcast_fn = fn

    def start(self) -> asyncio.Task:
        """Start the activity push loop."""
        if self._task is None or self._task.done():
            self._task = asyncio.create_task(self._loop())
            logger.info("ActivityService started (interval: %.1fs)", self._interval_seconds)
        return self._task

    def stop(self) -> None:
        if self._task:
            self._task.cancel()

    async def _loop(self) -> None:
        while True:
            try:
                snapshot = self.get_snapshot()
                if self._broadcast_fn:
                    await self._broadcast_fn({
                        "type": WS_EVENT_ACTIVITY,
                        **snapshot,
                    })
            except Exception as exc:
                logger.debug("ActivityService push error: %s", exc)
            await asyncio.sleep(self._interval_seconds)

    def get_snapshot(self) -> Dict[str, Any]:
        """Build a snapshot of current system activity."""
        result: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        # Resident agent status
        try:
            from app.services.resident_agent import get_resident_agent
            agent = get_resident_agent()
            state = agent.get_state()
            result["resident"] = {
                "status": state.get("status", "idle"),
                "is_running": state.get("is_running", False),
                "current_task": state.get("current_task"),
                "last_action": state.get("last_action"),
                "tick_count": state.get("tick_count", 0),
            }
        except Exception:
            result["resident"] = {"status": "unknown"}

        # Active jobs count
        try:
            from app.services.job_service import get_job_service
            job_svc = get_job_service()
            running = job_svc.count_jobs(status="running")
            queued = job_svc.count_jobs(status="queued")
            result["jobs"] = {
                "running": running,
                "queued": queued,
                "total_active": running + queued,
            }
        except Exception:
            result["jobs"] = {"running": 0, "queued": 0, "total_active": 0}

        # KB stats
        try:
            from app.services.kb_stats_cache import get_cached_stats
            kb = get_cached_stats()
            result["kb"] = {
                "total_chunks": kb.get("total_chunks", 0),
            }
        except Exception:
            result["kb"] = {"total_chunks": 0}

        # Resource monitor
        try:
            from app.services.resource_monitor import get_resource_monitor
            monitor = get_resource_monitor()
            snap = monitor.get_snapshot()
            if snap:
                result["resources"] = {
                    "ram_used_mb": round(snap.ram_used_mb, 1),
                    "ram_total_mb": round(snap.ram_total_mb, 1),
                    "ram_percent": snap.ram_used_percent,
                    "cpu_percent": snap.cpu_percent,
                    "ollama_rss_mb": round(snap.ollama_rss_mb, 1),
                    "throttle": snap.throttle,
                    "block": snap.block,
                }
            else:
                result["resources"] = {"status": "no_data"}
        except Exception:
            result["resources"] = {"status": "error"}

        # Ollama status (lightweight check – uses cached resource monitor data)
        try:
            from app.services.resource_monitor import get_resource_monitor
            monitor = get_resource_monitor()
            snap = monitor.get_snapshot()
            result["ollama"] = {
                "status": "running" if snap and snap.ollama_rss_mb > 0 else "stopped",
            }
        except Exception:
            result["ollama"] = {"status": "unknown"}

        return result


# Singleton
_activity_service = ActivityService()


def get_activity_service() -> ActivityService:
    return _activity_service
