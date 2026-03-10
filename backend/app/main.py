"""AI Home Hub – FastAPI application entry point."""
import asyncio
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import actions, agent_skills, chat, chat_multimodal, files, knowledge, memory, status
from app.routers import agents, filesystem, integrations, settings, skills, tasks
from app.routers.websocket_router import router as ws_router

# Wire up broadcast callback so agents/tasks can push WS updates
from app.services.ws_manager import get_ws_manager
from app.services.agent_orchestrator import get_agent_orchestrator
from app.services.task_manager import get_task_manager
from app.services.settings_service import get_settings_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Background task handles (cancelled on shutdown)
_background_tasks: list[asyncio.Task] = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: connect WebSocket broadcast to task manager and orchestrator."""
    ws_manager = get_ws_manager()
    get_agent_orchestrator().set_broadcast(ws_manager.broadcast)
    get_task_manager().set_broadcast(ws_manager.broadcast)

    # Ensure data directories exist
    from pathlib import Path
    base = Path(__file__).parent.parent / "data"
    for subdir in ("sessions", "artifacts", "uploads"):
        (base / subdir).mkdir(parents=True, exist_ok=True)

    # Log actionable first-time-setup warnings
    get_settings_service().warn_if_unconfigured()

    # Start KB stats cache background task (4D)
    from app.services.kb_stats_cache import start_kb_stats_refresh_loop
    kb_task = asyncio.create_task(start_kb_stats_refresh_loop())
    _background_tasks.append(kb_task)

    # Start session auto-cleanup background task (4G)
    from app.services.session_service import start_session_auto_cleanup
    cleanup_task = asyncio.create_task(start_session_auto_cleanup())
    _background_tasks.append(cleanup_task)

    logger.info("AI Home Hub started – Mac Control Center ready")
    yield

    # Cancel background tasks on shutdown
    for task in _background_tasks:
        task.cancel()
    _background_tasks.clear()

    logger.info("AI Home Hub shutting down")


app = FastAPI(
    title="AI Home Hub – Mac Control Center",
    description=(
        "Unified Mac control hub integrating Ollama LLM, Claude MCP, "
        "VS Code, Antigravity IDE, filesystem, git, and macOS automation."
    ),
    version="0.3.0",
    lifespan=lifespan,
)

# Request ID + structured logging middleware (4B)
from app.middleware.logging_middleware import RequestIDMiddleware
app.add_middleware(RequestIDMiddleware)

# CORS – allow the SPA to call the API (useful when running on different ports)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
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
app.include_router(knowledge.router, prefix="/api", tags=["knowledge"])
app.include_router(memory.router, prefix="/api", tags=["memory"])

# Status (has its own /api/status prefix)
app.include_router(status.router)

# WebSocket (no /api prefix – connects at /ws)
app.include_router(ws_router)

# Rate limiting (4F) – must be set up after routes are registered
from app.middleware.rate_limit import setup_rate_limiting
setup_rate_limiting(app)


@app.get("/api/health/setup", tags=["health"])
async def setup_check() -> dict:
    """Return a checklist of first-time configuration items."""
    s = get_settings_service().load()
    items = []

    allowed = s.get("filesystem", {}).get("allowed_directories", [])
    items.append({
        "key": "filesystem_dirs",
        "label": "Filesystem allowed directories",
        "ok": bool(allowed),
        "hint": "Add directories in Settings → Filesystem Security",
    })

    projects = s.get("integrations", {}).get("vscode", {}).get("projects", {})
    items.append({
        "key": "vscode_projects",
        "label": "VS Code projects",
        "ok": bool(projects),
        "hint": "Add projects in Settings → VS Code Projects",
    })

    llm_provider = s.get("llm", {}).get("provider", "ollama")
    items.append({
        "key": "llm_provider",
        "label": "LLM provider",
        "ok": True,
        "hint": f"Current: {llm_provider}. Run 'ollama serve' for Ollama.",
    })

    all_ok = all(i["ok"] for i in items)
    return {"setup_complete": all_ok, "items": items}


@app.get("/api/health", tags=["health"])
async def health() -> dict:
    """Health-check endpoint."""
    from app.services.embeddings_service import get_embeddings_service

    ws_manager = get_ws_manager()
    embeddings_svc = get_embeddings_service()
    return {
        "status": "ok",
        "message": "AI Home Hub Mac Control Center is running",
        "version": "0.5.0",
        "ws_connections": ws_manager.connection_count,
        "embeddings_cache": embeddings_svc.get_cache_stats(),
    }


@app.delete("/api/embeddings/cache", tags=["health"])
async def clear_embeddings_cache() -> dict:
    """Clear the embeddings cache."""
    from app.services.embeddings_service import get_embeddings_service

    svc = get_embeddings_service()
    prev_stats = svc.clear_cache()
    return {"cleared": True, "previous_stats": prev_stats}


# ── SPA Static Files ────────────────────────────────────────
# Mounted last so every /api/* route above has priority.
_static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
app.mount("/", StaticFiles(directory=_static_dir, html=True), name="static")
