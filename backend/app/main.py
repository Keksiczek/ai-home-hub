"""AI Home Hub – FastAPI application entry point."""

import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.staticfiles import StaticFiles

from app.core.startup import lifespan
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
from app.routers import notifications as notifications_router
from app.routers import agent as agent_router
from app.routers import health as health_router
from app.routers import creative as creative_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


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
app.include_router(notifications_router.router, prefix="/api", tags=["notifications"])
app.include_router(creative_router.router, prefix="/api", tags=["creative"])

# Agent endpoints (extracted from main.py)
app.include_router(agent_router.router, prefix="/api", tags=["agent"])

# Health, metrics, system health (extracted from main.py)
app.include_router(health_router.router)

# Status (has its own /api/status prefix)
app.include_router(status.router)

# WebSocket (no /api prefix – connects at /ws)
app.include_router(ws_router)

# Rate limiting (4F) – must be set up after routes are registered
from app.middleware.rate_limit import setup_rate_limiting

setup_rate_limiting(app)


# ── Resident badge (kept here – registered on app directly) ──


@app.get("/api/resident/badge", tags=["resident"])
async def resident_badge() -> dict:
    """Compact resident agent status badge for the navigation bar."""
    from datetime import datetime, timezone
    from app.services.resident_agent import get_resident_agent

    agent = get_resident_agent()
    state = agent.get_state()

    is_running = state.get("is_running", False)
    last_heartbeat = state.get("last_heartbeat")

    badge = "stopped"
    if is_running and last_heartbeat:
        try:
            if isinstance(last_heartbeat, str):
                last_dt = datetime.fromisoformat(last_heartbeat.replace("Z", "+00:00"))
            else:
                last_dt = last_heartbeat
            age_s = (datetime.now(timezone.utc) - last_dt).total_seconds()
            if age_s < 60:
                badge = "active"
            elif age_s < 120:
                badge = "slow"
            else:
                badge = "stopped"
        except Exception:
            badge = "active" if is_running else "stopped"
    elif is_running:
        badge = "active"

    open_curiosity = 0
    try:
        from app.services.resident_curiosity import get_curiosity_service

        open_items = get_curiosity_service().list_items(status="open", limit=100)
        open_curiosity = len(open_items)
    except Exception:
        pass

    last_thought = ""
    try:
        history = agent.get_cycle_history(limit=1)
        if history:
            last_cycle = history[0]
            last_thought = (
                last_cycle.get("thought", "")
                or last_cycle.get("reasoning_summary", "")
                or ""
            )[:120]
    except Exception:
        pass

    return {
        "badge": badge,
        "open_curiosity": open_curiosity,
        "last_thought": last_thought,
    }


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

# Swagger UI assets (served from backend/static/swagger/)
_static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
app.mount("/static", StaticFiles(directory=_static_dir), name="legacy-static")

# React SPA build – must be the LAST mount
_dist_dir = os.path.join(os.path.dirname(__file__), "..", "static", "dist")
os.makedirs(_dist_dir, exist_ok=True)
app.mount("/", StaticFiles(directory=_dist_dir, html=True), name="spa")
