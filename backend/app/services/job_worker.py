"""Job worker – background async loop that picks queued jobs and runs them."""
import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, Callable, Coroutine, Dict, List, Optional, Set

from app.services.background_service import BackgroundService
from app.services.job_service import Job, JobService

logger = logging.getLogger(__name__)

# Poll interval in seconds
_POLL_INTERVAL = 10

# Night scheduler check interval in seconds (every 5 minutes)
_NIGHT_CHECK_INTERVAL = 300

# Priority ordering for queue sorting
_PRIORITY_ORDER = {"high": 0, "normal": 1, "low": 2}

# Scheduled night jobs – created automatically during the night window
NIGHT_SCHEDULED_JOBS: List[Dict[str, str]] = [
    {
        "type": "kb_reindex",
        "title": "Noční KB reindexování",
        "priority": "low",
    },
    {
        "type": "git_sweep",
        "title": "Noční Git sweep projektů",
        "priority": "low",
    },
    {
        "type": "nightly_summary",
        "title": "Noční summary do paměti",
        "priority": "low",
    },
]


def is_now_in_night_window(job_settings: Dict[str, Any]) -> bool:
    """Check if the current local time falls within the night batch window."""
    window = job_settings.get("night_batch_window", {})
    start_str = window.get("start", "22:00")
    end_str = window.get("end", "06:00")

    try:
        now = datetime.now()
        start_h, start_m = map(int, start_str.split(":"))
        end_h, end_m = map(int, end_str.split(":"))
    except (ValueError, AttributeError):
        logger.warning("Invalid night_batch_window format, defaulting to False")
        return False

    now_minutes = now.hour * 60 + now.minute
    start_minutes = start_h * 60 + start_m
    end_minutes = end_h * 60 + end_m

    if start_minutes <= end_minutes:
        # Window doesn't cross midnight (e.g. 01:00 – 05:00)
        return start_minutes <= now_minutes < end_minutes
    else:
        # Window crosses midnight (e.g. 22:00 – 06:00)
        return now_minutes >= start_minutes or now_minutes < end_minutes


class NightScheduler(BackgroundService):
    """NightScheduler – rozhoduje zda jsme v nočním okně a spouští scheduled joby.

    Noční okno je definováno v settings: job_settings.night_batch_window.start/end
    Každý scheduled job se spustí MAX 1x za noc – tracked přes jednoduchý set s datem.
    """

    def __init__(
        self,
        job_service: JobService,
        settings_fn: Callable[[], Dict[str, Any]],
        broadcast_fn: Optional[Callable[[Dict[str, Any]], Coroutine]] = None,
    ) -> None:
        super().__init__("night_scheduler")
        self._job_service = job_service
        self._settings_fn = settings_fn
        self._broadcast_fn = broadcast_fn
        self._ran_today: Dict[str, str] = {}  # job_type → date string
        self._last_day: Optional[str] = None

    def is_night_window(self) -> bool:
        """Check if current local time falls within the night batch window."""
        job_settings = self._settings_fn()
        return is_now_in_night_window(job_settings)

    def get_today_key(self) -> str:
        """Return 'YYYY-MM-DD' as deduplication key for the current day."""
        return datetime.now().strftime("%Y-%m-%d")

    def was_run_today(self, job_type: str) -> bool:
        """Check if a job type was already run today."""
        today = self.get_today_key()
        return self._ran_today.get(job_type) == today

    def mark_ran(self, job_type: str) -> None:
        """Mark a job type as having been run today."""
        self._ran_today[job_type] = self.get_today_key()

    def reset_if_new_day(self) -> None:
        """If the day has changed, reset the ran_today tracker."""
        today = self.get_today_key()
        if self._last_day is not None and self._last_day != today:
            logger.info("NightScheduler: new day detected (%s → %s), resetting ran_today", self._last_day, today)
            self._ran_today.clear()
        self._last_day = today

    async def schedule_night_jobs(self) -> None:
        """Main scheduling method – called from worker loop every 5 minutes.

        1. reset_if_new_day()
        2. If not in night window → return
        3. For each scheduled job type, check was_run_today() → if not, create job
        """
        self.reset_if_new_day()

        if not self.is_night_window():
            return

        job_settings = self._settings_fn()
        if not job_settings.get("night_batch_enabled", False):
            return

        night_jobs_config = job_settings.get("night_jobs", {})

        for job_def in NIGHT_SCHEDULED_JOBS:
            job_type = job_def["type"]

            # Check per-type enabled flag
            type_config = night_jobs_config.get(job_type, {})
            if not type_config.get("enabled", True):
                continue

            if self.was_run_today(job_type):
                continue

            # Create the job
            job = self._job_service.create_job(
                type=job_type,
                title=job_def["title"],
                priority=job_def["priority"],
            )
            self.mark_ran(job_type)
            logger.info("NightScheduler: scheduled %s → job %s", job_type, job.id)

            # Broadcast night_job_started event
            if self._broadcast_fn:
                try:
                    await self._broadcast_fn({
                        "type": "night_job_started",
                        "job_id": job.id,
                        "job_type": job_type,
                        "title": job_def["title"],
                    })
                except Exception as exc:
                    logger.debug("NightScheduler broadcast failed: %s", exc)

    async def _tick(self) -> None:
        """Run one scheduling check then sleep until the next check interval."""
        try:
            await self.schedule_night_jobs()
        except Exception as exc:
            logger.error("NightScheduler error: %s", exc, exc_info=True)
        await asyncio.sleep(_NIGHT_CHECK_INTERVAL)


class JobWorker(BackgroundService):
    def __init__(
        self,
        job_service: JobService,
        get_settings: Callable[[], Dict[str, Any]],
        broadcast_fn: Optional[Callable[[Dict[str, Any]], Coroutine]] = None,
    ) -> None:
        self._job_service = job_service
        self._get_settings = get_settings
        self._broadcast_fn = broadcast_fn
        self._running_job_ids: Set[str] = set()
        self._cancel_requested: Set[str] = set()
        self._night_scheduler = NightScheduler(job_service, get_settings, broadcast_fn)

    def set_broadcast(self, fn: Callable[[Dict[str, Any]], Coroutine]) -> None:
        self._broadcast_fn = fn

    async def _broadcast_job_update(self, job: Job) -> None:
        """Send a job_update WebSocket event."""
        if not self._broadcast_fn:
            return
        try:
            await self._broadcast_fn({
                "type": "job_update",
                "job": {
                    "id": job.id,
                    "type": job.type,
                    "title": job.title,
                    "status": job.status,
                    "progress": job.progress,
                },
            })
        except Exception as exc:
            logger.debug("Job broadcast failed: %s", exc)

    def _can_run_job(self, job: Job, job_settings: Dict[str, Any]) -> bool:
        """Check if a job type is allowed to run at the current time."""
        night = is_now_in_night_window(job_settings)
        night_only = job_settings.get("night_only_job_types", [])
        day_allowed = job_settings.get("day_allowed_job_types", [])

        if job.type in night_only:
            # Night-only jobs can only run during the night window
            return night and job_settings.get("night_batch_enabled", False)

        if night:
            # At night, all job types are allowed
            return True

        # During the day, only day_allowed_job_types can run
        return job.type in day_allowed

    async def _make_progress_callback(self, job: Job):
        """Create a progress callback for a running job."""
        async def progress_callback(progress: float, meta: Optional[Dict[str, Any]] = None):
            job.progress = min(max(progress, 0.0), 100.0)
            if meta:
                job.meta.update(meta)
            self._job_service.update_job(job)
            await self._broadcast_job_update(job)

        return progress_callback

    async def _run_single_job(self, job: Job) -> None:
        """Execute a single job using the engine dispatcher."""
        from app.services.job_engines import execute_job
        from app.services.resource_monitor import get_resource_monitor

        if get_resource_monitor().is_blocked():
            logger.warning("Job execution blocked – system resources critical")
            # requeue or skip, don't raise – job worker musí přežít
            self._running_job_ids.discard(job.id)
            return

        job.status = "running"
        job.started_at = datetime.now(timezone.utc).isoformat()
        self._job_service.update_job(job)
        await self._broadcast_job_update(job)

        progress_callback = await self._make_progress_callback(job)

        night_job_types = {"kb_reindex", "git_sweep", "nightly_summary"}

        try:
            result = await execute_job(job, progress_callback)
            job.status = "succeeded"
            job.progress = 100.0
            if result:
                job.meta["result"] = result
        except asyncio.CancelledError:
            job.status = "cancelled"
        except Exception as exc:
            job.status = "failed"
            job.last_error = str(exc)
            logger.error("Job %s failed: %s", job.id, exc, exc_info=True)
        finally:
            job.finished_at = datetime.now(timezone.utc).isoformat()
            self._job_service.update_job(job)
            self._running_job_ids.discard(job.id)
            await self._broadcast_job_update(job)
            logger.info(
                "Job %s (%s) finished with status=%s",
                job.id, job.type, job.status,
            )

            # Broadcast night-job-specific WS events
            if self._broadcast_fn and job.type in night_job_types:
                try:
                    await self._broadcast_fn({
                        "type": "night_job_done",
                        "job_id": job.id,
                        "job_type": job.type,
                        "status": job.status,
                    })
                    # Special event for nightly summary
                    if job.type == "nightly_summary" and job.status == "succeeded":
                        result_data = job.meta.get("result", {})
                        await self._broadcast_fn({
                            "type": "nightly_summary_ready",
                            "date": result_data.get("date", ""),
                            "preview": result_data.get("preview", "")[:200],
                        })
                except Exception as exc:
                    logger.debug("Night job broadcast failed: %s", exc)

    async def _on_start(self) -> None:
        """Start the night scheduler as a companion daemon."""
        self._night_scheduler.start()

    async def _on_stop(self) -> None:
        """Stop the night scheduler when the worker shuts down."""
        await self._night_scheduler.stop()

    async def _tick(self) -> None:
        """Poll for queued jobs and dispatch them, then sleep until the next poll."""
        try:
            await self._poll_and_dispatch()
        except Exception as exc:
            logger.error("JobWorker poll error: %s", exc, exc_info=True)
        await asyncio.sleep(_POLL_INTERVAL)

    async def _poll_and_dispatch(self) -> None:
        job_settings = self._get_settings()
        max_concurrent = job_settings.get("max_concurrent_jobs", 1)

        # Check how many slots are available
        running_count = len(self._running_job_ids)
        available_slots = max_concurrent - running_count
        if available_slots <= 0:
            return

        # Get queued jobs
        queued = self._job_service.list_jobs(status="queued", limit=50)
        if not queued:
            return

        # Sort by priority
        queued.sort(key=lambda j: _PRIORITY_ORDER.get(j.priority, 1))

        dispatched = 0
        for job in queued:
            if dispatched >= available_slots:
                break

            # Check if cancelled while queued
            if job.status == "cancelled":
                continue

            if not self._can_run_job(job, job_settings):
                continue

            # Dispatch
            self._running_job_ids.add(job.id)
            asyncio.create_task(self._run_single_job(job))
            dispatched += 1
            logger.info("Dispatched job %s (%s): %s", job.id, job.type, job.title)


# Module-level singleton
_job_worker: Optional[JobWorker] = None


def get_job_worker() -> Optional[JobWorker]:
    return _job_worker


async def start_job_worker(
    job_service: JobService,
    get_settings: Callable[[], Dict[str, Any]],
    broadcast_fn: Optional[Callable] = None,
) -> asyncio.Task:
    """Initialize and start the job worker as a background asyncio task."""
    global _job_worker

    # Reset stale running jobs from previous server run
    job_service.reset_stale_running_jobs()

    _job_worker = JobWorker(job_service, get_settings, broadcast_fn)
    return _job_worker.start()
