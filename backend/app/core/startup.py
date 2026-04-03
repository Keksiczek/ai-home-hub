"""Application lifespan context manager and background task supervisor.

Extracted from main.py – manages startup/shutdown of all background services.
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI

from app.services.settings_service import get_settings_service
from app.services.task_supervisor import TaskSupervisor
from app.services.ws_manager import get_ws_manager

logger = logging.getLogger(__name__)

# Supervised background task registry – accessible via get_supervisor()
_supervisor = TaskSupervisor()


def get_supervisor() -> TaskSupervisor:
    """Return the global TaskSupervisor instance."""
    return _supervisor


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: connect WebSocket broadcast to task manager and orchestrator."""
    from app.services.agent_orchestrator import get_agent_orchestrator
    from app.services.task_manager import get_task_manager

    ws_manager = get_ws_manager()
    get_agent_orchestrator().set_broadcast(ws_manager.broadcast)
    get_task_manager().set_broadcast(ws_manager.broadcast)

    # Ensure data directories exist
    # __file__ = backend/app/core/startup.py → .parent³ = backend/
    base = Path(__file__).parent.parent.parent / "data"
    for subdir in (
        "sessions",
        "artifacts",
        "uploads",
        "uploads/media",
        "jobs",
        "resident_plans",
    ):
        (base / subdir).mkdir(parents=True, exist_ok=True)

    # Log actionable first-time-setup warnings
    get_settings_service().warn_if_unconfigured()

    # Initialize Prometheus app info metric
    from app.services.metrics_service import init_app_info

    init_app_info(version="0.5.0")

    # ── Startup validation ──────────────────────────────────────
    from app.services.startup_checks import run_startup_checks
    from app.utils.config_validation import validate_llm_config

    settings = get_settings_service().load()

    # Validate and normalize LLM URLs at startup
    llm_cfg = settings.get("llm", {})
    llm_cfg, url_errors = validate_llm_config(llm_cfg)
    for err in url_errors:
        if err.level == "error":
            logger.error("Startup config error: %s", err.message)
        else:
            logger.warning("Startup config: %s", err.message)
    # Save normalized URLs back
    if url_errors:
        settings["llm"] = llm_cfg
        get_settings_service().save(settings)

    ollama_url = (
        llm_cfg.get("ollama_url", "http://localhost:11434").rstrip("/")
    )

    health = await run_startup_checks(ollama_url)
    settings_service = get_settings_service()
    settings_service.global_health = health
    logger.info("Startup health: %s", health)

    # Start KB stats cache background task (4D)
    from app.services.kb_stats_cache import start_kb_stats_refresh_loop

    kb_task = asyncio.create_task(start_kb_stats_refresh_loop())
    _supervisor.register(
        "kb_stats_cache",
        kb_task,
        lambda: asyncio.create_task(start_kb_stats_refresh_loop()),
    )

    # Start session auto-cleanup background task (4G)
    from app.services.session_service import start_session_auto_cleanup

    cleanup_task = asyncio.create_task(start_session_auto_cleanup())
    _supervisor.register(
        "session_cleanup",
        cleanup_task,
        lambda: asyncio.create_task(start_session_auto_cleanup()),
    )

    # Start job worker background task (6D)
    from app.services.job_service import get_job_service
    from app.services.job_worker import start_job_worker

    job_worker_task = await start_job_worker(
        job_service=get_job_service(),
        get_settings=get_settings_service().get_job_settings,
        broadcast_fn=ws_manager.broadcast,
    )
    _supervisor.register("job_worker", job_worker_task)

    # Start resource monitor (Phase 2)
    from app.services.resource_monitor import get_resource_monitor

    resource_mon = get_resource_monitor()
    resource_mon.set_broadcast(ws_manager.broadcast)
    resource_task = resource_mon.start()
    _supervisor.register("resource_monitor", resource_task, resource_mon.start)

    # Start AdaptiveKeepAliveManager – adjusts Ollama keep_alive based on RAM pressure
    from app.services.adaptive_keep_alive import get_adaptive_keep_alive_manager

    aka_manager = get_adaptive_keep_alive_manager()
    aka_task = aka_manager.start()
    _supervisor.register("adaptive_keep_alive", aka_task, aka_manager.start)

    # Notification service – initialize singleton with WS broadcast
    from app.services.notification_service import get_notification_service

    get_notification_service().set_broadcast(ws_manager.broadcast)

    # Resident agent – initialize singleton, does NOT auto-start (waits for API call)
    from app.services.resident_agent import get_resident_agent

    get_resident_agent().set_broadcast(ws_manager.broadcast)

    # Activity service – aggregates live status for the activity bar
    from app.services.activity_service import get_activity_service

    activity_svc = get_activity_service()
    activity_svc.set_broadcast(ws_manager.broadcast)
    activity_task = activity_svc.start()
    _supervisor.register("activity_service", activity_task, activity_svc.start)

    # Tailscale Funnel service – exposes the app via Tailscale Funnel (opt-in via settings)
    from app.services.tailscale_service import get_tailscale_service

    tailscale_svc = get_tailscale_service()
    tailscale_task = tailscale_svc.start()
    _supervisor.register("tailscale_funnel", tailscale_task, tailscale_svc.start)

    # KB filesystem watchdog – watches external_paths and enqueues incremental reindex
    from app.services.kb_watchdog import KBWatchdog

    async def _on_kb_change() -> None:
        """Enqueue a kb_reindex job on first file change; skip if one is already queued."""
        from app.services.job_service import get_job_service as _get_job_svc

        job_svc = _get_job_svc()
        already_queued = job_svc.list_jobs(status="queued", type="kb_reindex")
        if not already_queued:
            job_svc.create_job(
                type="kb_reindex",
                title="KB Incremental Reindex (file change detected)",
                payload={"incremental": True},
            )
            logger.info("KBWatchdog: kb_reindex job enqueued")
        else:
            logger.debug("KBWatchdog: kb_reindex already in queue, skipping duplicate")

    kb_watchdog = KBWatchdog(get_settings_service, _on_kb_change)
    kb_watchdog_task = kb_watchdog.start()
    _supervisor.register("kb_watchdog", kb_watchdog_task)

    # Start cleanup service (runs every 6h – removes old sessions, archives, vacuums DBs)
    from app.services.cleanup_service import get_cleanup_service

    cleanup_svc = get_cleanup_service()
    cleanup_svc_task = cleanup_svc.start()
    _supervisor.register("cleanup_service", cleanup_svc_task, cleanup_svc.start)

    # Initialize SQLite jobs database
    from app.db.jobs_db import get_jobs_db

    get_jobs_db()
    logger.info("JobsDB (SQLite) initialized")

    # Initialize SQLite resident state database
    from app.db.resident_state import get_resident_state_db

    get_resident_state_db()
    logger.info("ResidentStateDB (SQLite) initialized")

    # Initialize audit log database (Full System Access)
    from app.db.audit_log import get_audit_log_db

    get_audit_log_db()
    logger.info("AuditLogDB (SQLite) initialized")

    # Ensure sandbox data directory exists
    (Path(base) / ".." / "sandbox_data").resolve().mkdir(parents=True, exist_ok=True)

    logger.info("AI Home Hub started – Mac Control Center ready")
    yield

    # Cancel all supervised tasks on shutdown
    await _supervisor.stop_all()

    logger.info("AI Home Hub shutting down")
