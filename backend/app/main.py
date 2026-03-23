"""AI Home Hub – FastAPI application entry point."""

import asyncio
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse, Response
from fastapi.staticfiles import StaticFiles
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

from app.routers import (
    actions,
    agent_skills,
    chat,
    chat_multimodal,
    files,
    knowledge,
    memory,
    status,
)
from app.routers import agents, filesystem, integrations, jobs, settings, skills, tasks
from app.routers import skills_runtime
from app.routers import profiles as profiles_router
from app.routers import resident as resident_router
from app.routers import admin as admin_router
from app.routers import media as media_router
from app.routers import document_analysis as document_analysis_router
from app.routers import setup as setup_router
from app.routers import prompts as prompts_router
from app.routers import models as models_router
from app.routers.websocket_router import router as ws_router
from app.routers import system as system_router
from app.routers import capabilities as capabilities_router
from app.routers import cleanup as cleanup_router
from app.routers import alerting as alerting_router
from app.routers import control as control_router

# Wire up broadcast callback so agents/tasks can push WS updates
from app.services.ws_manager import get_ws_manager
from app.services.agent_orchestrator import get_agent_orchestrator
from app.services.task_manager import get_task_manager
from app.services.settings_service import get_settings_service
from app.services.task_supervisor import TaskSupervisor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supervised background task registry
_supervisor = TaskSupervisor()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: connect WebSocket broadcast to task manager and orchestrator."""
    ws_manager = get_ws_manager()
    get_agent_orchestrator().set_broadcast(ws_manager.broadcast)
    get_task_manager().set_broadcast(ws_manager.broadcast)

    # Ensure data directories exist
    from pathlib import Path

    base = Path(__file__).parent.parent / "data"
    for subdir in ("sessions", "artifacts", "uploads", "uploads/media", "jobs"):
        (base / subdir).mkdir(parents=True, exist_ok=True)

    # Log actionable first-time-setup warnings
    get_settings_service().warn_if_unconfigured()

    # Initialize Prometheus app info metric
    from app.services.metrics_service import init_app_info

    init_app_info(version="0.5.0")

    # ── Startup validation ──────────────────────────────────────
    from app.services.startup_checks import run_startup_checks

    settings = get_settings_service().load()
    ollama_url = (
        settings.get("llm", {}).get("ollama_url", "http://localhost:11434").rstrip("/")
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
    from pathlib import Path as _Path

    (_Path(base) / ".." / "sandbox_data").resolve().mkdir(parents=True, exist_ok=True)

    logger.info("AI Home Hub started – Mac Control Center ready")
    yield

    # Cancel all supervised tasks on shutdown
    await _supervisor.stop_all()

    logger.info("AI Home Hub shutting down")


app = FastAPI(
    title="AI Home Hub – Mac Control Center",
    description=(
        "Unified Mac control hub integrating Ollama LLM, Claude MCP, "
        "VS Code, Antigravity IDE, filesystem, git, and macOS automation."
    ),
    version="0.5.0",
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
)

# Request ID + structured logging middleware (4B)
from app.middleware.logging_middleware import RequestIDMiddleware

app.add_middleware(RequestIDMiddleware)

# Global error handler – catches unhandled exceptions → structured 500 JSON
from app.middleware.error_handler import ErrorHandlerMiddleware

app.add_middleware(ErrorHandlerMiddleware)


# CORS – load allowed origins from settings (safe default: localhost only)
def _get_cors_origins() -> list:
    try:
        from app.services.settings_service import get_settings_service

        svc = get_settings_service()
        origins = svc.load().get("cors", {}).get("allowed_origins", [])
        # Auto-include Tailscale URL if configured
        ts = svc.load().get("tailscale", {})
        if ts.get("enable_funnel") and ts.get("funnel_url"):
            funnel = ts["funnel_url"].rstrip("/")
            if funnel not in origins:
                origins = list(origins) + [funnel]
        return origins or ["http://localhost:8000", "http://127.0.0.1:8000"]
    except Exception:  # noqa: BLE001
        return ["http://localhost:8000", "http://127.0.0.1:8000"]


_cors_origins = _get_cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=len(_cors_origins) > 0,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Routes ──────────────────────────────────────────────
# Registered first so /api/* always takes priority over static files.

# Core
app.include_router(files.router, prefix="/api", tags=["files"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(chat_multimodal.router, prefix="/api", tags=["chat"])
app.include_router(actions.router, prefix="/api", tags=["actions"])

# New
app.include_router(agents.router, prefix="/api", tags=["agents"])
app.include_router(tasks.router, prefix="/api", tags=["tasks"])
app.include_router(settings.router, prefix="/api", tags=["settings"])
app.include_router(filesystem.router, prefix="/api", tags=["filesystem"])
app.include_router(integrations.router, prefix="/api", tags=["integrations"])
app.include_router(skills.router, prefix="/api", tags=["skills"])
app.include_router(agent_skills.router, prefix="/api", tags=["agent-skills"])
app.include_router(skills_runtime.router, prefix="/api", tags=["skills-runtime"])
app.include_router(knowledge.router, prefix="/api", tags=["knowledge"])
app.include_router(memory.router, prefix="/api", tags=["memory"])
app.include_router(jobs.router, prefix="/api", tags=["jobs"])
app.include_router(resident_router.router, prefix="/api", tags=["resident"])
app.include_router(admin_router.router, prefix="/api", tags=["admin"])
app.include_router(media_router.router, prefix="/api", tags=["media"])
app.include_router(
    document_analysis_router.router,
    prefix="/api/document-analysis",
    tags=["document-analysis"],
)
app.include_router(setup_router.router, prefix="/api", tags=["setup"])
app.include_router(prompts_router.router, prefix="/api", tags=["prompts"])
app.include_router(profiles_router.router, prefix="/api", tags=["profiles"])
app.include_router(models_router.router, prefix="/api", tags=["models", "llm"])
app.include_router(system_router.router, prefix="/api", tags=["system"])
app.include_router(capabilities_router.router, prefix="/api", tags=["capabilities"])
app.include_router(cleanup_router.router, prefix="/api", tags=["cleanup"])
app.include_router(alerting_router.router, prefix="/api", tags=["alerting"])
app.include_router(control_router.router, prefix="/api", tags=["control"])

# Status (has its own /api/status prefix)
app.include_router(status.router)

# WebSocket (no /api prefix – connects at /ws)
app.include_router(ws_router)

# Rate limiting (4F) – must be set up after routes are registered
from app.middleware.rate_limit import setup_rate_limiting

setup_rate_limiting(app)


@app.get("/api/agent/status", tags=["agent"])
async def agent_status() -> dict:
    """Top-level agent status endpoint combining resident agent and job worker health."""
    from app.services.resident_agent import get_resident_agent

    agent = get_resident_agent()
    state = agent.get_state()
    bg_tasks = _supervisor.status()

    return {
        "resident_agent": {
            "is_running": state.get("is_running", False),
            "status": state.get("status", "idle"),
            "heartbeat_status": state.get("heartbeat_status", "unknown"),
            "last_heartbeat": state.get("last_heartbeat"),
            "tick_count": state.get("tick_count", 0),
            "errors": state.get("errors_since_start", 0),
            "paused": state.get("paused", False),
            "quiet_hours_active": state.get("quiet_hours_active", False),
        },
        "background_tasks": bg_tasks,
    }


@app.get("/api/agent/history", tags=["agent"])
async def agent_history(limit: int = 20) -> dict:
    """Convenience alias for GET /api/resident/history."""
    from app.services.resident_agent import get_resident_agent

    agent = get_resident_agent()
    history = agent.get_cycle_history(limit=limit)
    return {"history": history, "count": len(history)}


@app.get("/api/agent/history/persistent", tags=["agent"])
async def agent_history_persistent(limit: int = 50, status: str = None) -> dict:
    """Return persistent cycle history from SQLite (survives restarts)."""
    from app.db.resident_state import get_resident_state_db

    db = get_resident_state_db()
    history = db.get_history(limit=limit, status=status)
    stats = db.get_stats()
    return {"history": history, "stats": stats, "count": len(history)}


@app.get("/api/agent/metrics/cached", tags=["agent"])
async def agent_metrics_cached() -> dict:
    """Return cached agent metrics (1-min TTL)."""
    from app.services.resident_agent import get_resident_agent

    return get_resident_agent().get_cached_metrics()


@app.get("/api/agent/logs", tags=["agent"])
async def agent_logs(level: str = None, cycle: str = None, limit: int = 100) -> dict:
    """Convenience alias for GET /api/resident/logs."""
    from app.services.resident_agent import get_resident_agent

    agent = get_resident_agent()
    logs = agent.get_logs(level=level, cycle=cycle, limit=limit)
    return {"logs": logs, "count": len(logs)}


@app.post("/api/agent/pause", tags=["agent"])
async def agent_pause() -> dict:
    """Pause the resident agent."""
    from app.services.resident_agent import get_resident_agent

    return await get_resident_agent().pause()


@app.post("/api/agent/run-now", tags=["agent"])
async def agent_run_now() -> dict:
    """Trigger an immediate agent cycle."""
    from app.services.resident_agent import get_resident_agent

    return await get_resident_agent().run_now()


@app.post("/api/agent/reset", tags=["agent"])
async def agent_reset() -> dict:
    """Reset agent counters and memory."""
    from app.services.resident_agent import get_resident_agent

    return await get_resident_agent().reset()


@app.patch("/api/agent/settings", tags=["agent"])
async def agent_settings_patch(updates: dict) -> dict:
    """Update agent runtime settings."""
    from app.services.resident_agent import get_resident_agent

    return get_resident_agent().update_agent_settings(updates)


@app.get("/api/agent/memory", tags=["agent"])
async def agent_memory_list(limit: int = 50) -> dict:
    """Get agent memory entries."""
    from app.services.resident_agent import get_resident_agent

    items = await get_resident_agent().get_agent_memory(limit=limit)
    return {"memory": items, "count": len(items)}


@app.delete("/api/agent/memory", tags=["agent"])
async def agent_memory_clear() -> dict:
    """Clear agent memory."""
    from app.services.resident_agent import get_resident_agent

    return await get_resident_agent().clear_agent_memory()


@app.delete("/api/agent/memory/{memory_id}", tags=["agent"])
async def agent_memory_delete_by_id(memory_id: str) -> dict:
    """Delete a single agent memory entry by ID."""
    from app.services.resident_agent import get_resident_agent

    result = await get_resident_agent().delete_agent_memory_by_id(memory_id)
    if result.get("status") == "not_found":
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail=f"Memory {memory_id} not found")
    return result


@app.post("/api/agent/memory", tags=["agent"])
async def agent_memory_add(body: dict) -> dict:
    """Manually add an entry to agent memory.

    Body::

        {"content": "User prefers dark mode", "tags": ["#preference"]}
    """
    from fastapi import HTTPException
    from app.services.resident_agent import get_resident_agent

    content = body.get("content", "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="'content' is required")
    tags = body.get("tags", [])
    return await get_resident_agent().add_agent_memory_manual(
        content=content, tags=tags
    )


@app.get("/api/health/setup", tags=["health"])
async def setup_check() -> dict:
    """Return a checklist of first-time configuration items."""
    s = get_settings_service().load()
    items = []

    allowed = s.get("filesystem", {}).get("allowed_directories", [])
    items.append(
        {
            "key": "filesystem_dirs",
            "label": "Filesystem allowed directories",
            "ok": bool(allowed),
            "hint": "Add directories in Settings → Filesystem Security",
        }
    )

    projects = s.get("integrations", {}).get("vscode", {}).get("projects", {})
    items.append(
        {
            "key": "vscode_projects",
            "label": "VS Code projects",
            "ok": bool(projects),
            "hint": "Add projects in Settings → VS Code Projects",
        }
    )

    llm_provider = s.get("llm", {}).get("provider", "ollama")
    items.append(
        {
            "key": "llm_provider",
            "label": "LLM provider",
            "ok": True,
            "hint": f"Current: {llm_provider}. Run 'ollama serve' for Ollama.",
        }
    )

    # Knowledge Base indexed check
    try:
        from app.services.vector_store_service import get_vector_store_service

        vs = get_vector_store_service()
        stats = vs.get_stats()
        kb_chunks = stats.get("total_chunks", 0)
    except Exception:
        kb_chunks = 0
    items.append(
        {
            "key": "kb_indexed",
            "label": "Knowledge Base indexována",
            "ok": kb_chunks > 0,
            "hint": f"Chunks: {kb_chunks}. Indexujte dokumenty v Nastavení → Knowledge Base.",
        }
    )

    all_ok = all(i["ok"] for i in items)
    return {"setup_complete": all_ok, "items": items}


@app.get("/api/health", tags=["health"])
async def health() -> dict:
    """Health-check endpoint."""
    from datetime import datetime, timezone

    from app.services.embeddings_service import get_embeddings_service

    ws_manager = get_ws_manager()
    embeddings_svc = get_embeddings_service()

    # Build component statuses
    components: dict = {}

    # Ollama
    components["ollama"] = {"status": "ok"}

    # ChromaDB
    try:
        from app.services.vector_store_service import get_vector_store_service

        vs = get_vector_store_service()
        vs.get_stats()
        components["chromadb"] = {"status": "ok"}
    except Exception:
        components["chromadb"] = {"status": "error"}

    # Filesystem
    components["filesystem"] = {"status": "ok"}

    bg_tasks = _supervisor.status()

    # Tailscale Funnel health
    from app.services.tailscale_service import get_tailscale_service

    tailscale_health = get_tailscale_service().get_health()

    overall = "ok"
    if any(c.get("status") != "ok" for c in components.values()):
        overall = "degraded"
    if any(
        (s.get("status") if isinstance(s, dict) else s) == "error"
        for s in bg_tasks.values()
    ):
        overall = "degraded"

    return {
        "status": overall,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "message": "AI Home Hub Mac Control Center is running",
        "version": "0.5.0",
        "ws_connections": ws_manager.connection_count,
        "embeddings_cache": embeddings_svc.get_cache_stats(),
        "components": components,
        "background_tasks": bg_tasks,
        "tailscale_funnel": tailscale_health,
    }


@app.get("/api/health/errors", tags=["health"])
async def health_errors(limit: int = 20) -> dict:
    """Return recent unhandled error records for debugging."""
    from app.middleware.error_handler import get_error_history

    errors = get_error_history(limit=limit)
    return {"errors": errors, "count": len(errors)}


@app.get("/api/health/cleanup", tags=["health"])
async def health_cleanup() -> dict:
    """Return cleanup service status."""
    from app.services.cleanup_service import get_cleanup_service

    return get_cleanup_service().get_status()


@app.get("/api/health/live", tags=["health"])
async def health_live() -> dict:
    """Liveness probe – always returns 200."""
    return {"status": "ok"}


@app.get("/api/health/ready", tags=["health"])
async def health_ready():
    """Readiness probe – checks ChromaDB availability."""
    from fastapi.responses import JSONResponse

    try:
        from app.services.vector_store_service import get_vector_store_service

        vs = get_vector_store_service()
        async with asyncio.timeout(2.0):
            await asyncio.to_thread(vs.get_stats)
        return {"status": "ok"}
    except (asyncio.TimeoutError, Exception):
        return JSONResponse(status_code=503, content={"status": "unavailable"})


@app.get("/api/system/health", tags=["health"])
async def system_health() -> dict:
    """Return startup component health state.

    Reflects the health dict computed at startup (and updated on each restart).
    Possible values per component: ``"ok"``, ``"degraded"``, ``"unavailable"``,
    ``"error"``.  ``overall`` is one of ``"healthy"``, ``"degraded"``,
    ``"critical"``.
    """
    return get_settings_service().global_health


@app.get("/metrics", tags=["monitoring"])
async def prometheus_metrics():
    """Expose Prometheus metrics."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.delete("/api/embeddings/cache", tags=["health"])
async def clear_embeddings_cache() -> dict:
    """Clear the embeddings cache."""
    from app.services.embeddings_service import get_embeddings_service

    svc = get_embeddings_service()
    prev_stats = svc.clear_cache()
    return {"cleared": True, "previous_stats": prev_stats}


@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui():
    """Serve Swagger UI with local assets (works behind Tailscale without CDN)."""
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="AI Home Hub API Docs",
        swagger_js_url="/static/swagger/swagger-ui-bundle.js",
        swagger_css_url="/static/swagger/swagger-ui.css",
    )


# ── SPA Static Files ────────────────────────────────────────
# Mounted last so every /api/* route above has priority.
_static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
app.mount("/", StaticFiles(directory=_static_dir, html=True), name="static")
