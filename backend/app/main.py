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
    """Extended health-check endpoint with component status (4C)."""
    import shutil
    import time
    from datetime import datetime, timezone
    from pathlib import Path

    import httpx

    settings_svc = get_settings_service()
    s = settings_svc.load()
    ws_manager = get_ws_manager()

    components: dict = {}

    # ── Ollama check ──
    llm_cfg = s.get("llm", {})
    ollama_url = llm_cfg.get("ollama_url", "http://localhost:11434")
    try:
        start_t = time.monotonic()
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{ollama_url}/api/tags")
            latency = round((time.monotonic() - start_t) * 1000)
            resp.raise_for_status()
            models = [m["name"] for m in resp.json().get("models", [])]
        components["ollama"] = {
            "status": "ok",
            "latency_ms": latency,
            "models_available": models,
            "url": ollama_url,
        }
    except Exception:
        components["ollama"] = {"status": "error", "url": ollama_url}

    # ── ChromaDB check ──
    try:
        from app.services.vector_store_service import get_vector_store_service, CHROMA_DIR
        vs = get_vector_store_service()
        kb_count = vs.collection.count()
        # Check memory collection count
        try:
            from app.services.memory_service import get_memory_service
            mem_count = get_memory_service().collection.count()
        except Exception:
            mem_count = 0
        components["chromadb"] = {
            "status": "ok",
            "collections": {"knowledge_base": kb_count, "shared_memory": mem_count},
            "data_path": str(CHROMA_DIR),
        }
    except Exception:
        components["chromadb"] = {"status": "error"}

    # ── Filesystem check ──
    fs_cfg = s.get("filesystem", {})
    allowed_dirs = fs_cfg.get("allowed_directories", [])
    try:
        usage = shutil.disk_usage(Path(__file__).parent.parent)
        disk_free_gb = round(usage.free / (1024 ** 3), 1)
    except Exception:
        disk_free_gb = 0.0
    fs_status = "ok" if allowed_dirs else "warning"
    components["filesystem"] = {
        "status": fs_status,
        "allowed_dirs_count": len(allowed_dirs),
        "disk_free_gb": disk_free_gb,
    }

    # ── Tesseract check ──
    try:
        proc = await asyncio.create_subprocess_exec(
            "tesseract", "--version",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=2.0)
        output = (stdout or stderr or b"").decode().strip()
        version = output.split("\n")[0] if output else "unknown"
        components["tesseract"] = {"status": "ok", "version": version}
    except Exception:
        components["tesseract"] = {"status": "unavailable"}

    # ── Determine overall status ──
    chromadb_ok = components.get("chromadb", {}).get("status") == "ok"
    fs_ok = components.get("filesystem", {}).get("status") != "error"
    ollama_ok = components.get("ollama", {}).get("status") == "ok"

    if not chromadb_ok or not fs_ok:
        overall = "error"
    elif not ollama_ok or components.get("tesseract", {}).get("status") != "ok":
        overall = "degraded"
    else:
        overall = "ok"

    return {
        "status": overall,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "0.3.0",
        "ws_connections": ws_manager.connection_count,
        "components": components,
    }


@app.get("/api/health/live", tags=["health"])
async def health_live() -> dict:
    """Liveness probe – always returns 200."""
    return {"status": "ok"}


@app.get("/api/health/ready", tags=["health"])
async def health_ready() -> dict:
    """Readiness probe – ok only if ChromaDB is accessible."""
    try:
        from app.services.vector_store_service import get_vector_store_service
        vs = get_vector_store_service()
        vs.collection.count()
        return {"status": "ok"}
    except Exception as exc:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "error": str(exc)},
        )


# ── SPA Static Files ────────────────────────────────────────
# Mounted last so every /api/* route above has priority.
_static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
app.mount("/", StaticFiles(directory=_static_dir, html=True), name="static")
