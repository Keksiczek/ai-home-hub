"""Health, metrics, and system health endpoints.

Extracted from main.py to keep the app factory lean.
"""

import asyncio
import logging
from datetime import datetime, timezone

from fastapi import APIRouter
from fastapi.responses import JSONResponse, Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

from app.services.settings_service import get_settings_service
from app.services.ws_manager import get_ws_manager

logger = logging.getLogger(__name__)

router = APIRouter(tags=["health"])


@router.get("/api/health/setup")
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


@router.get("/api/health")
async def health() -> dict:
    """Health-check endpoint with extended component info."""
    from app.services.embeddings_service import get_embeddings_service
    from app.core.startup import get_supervisor

    ws_manager = get_ws_manager()
    embeddings_svc = get_embeddings_service()

    components: dict = {}

    # ── Ollama (extended) ────────────────────────────────────
    ollama_info: dict = {"status": "ok"}
    try:
        from app.services.llm_service import get_llm_service

        llm_svc = get_llm_service()
        ollama_health = await llm_svc.check_ollama_health()
        if ollama_health.get("status") == "ok":
            ollama_info["status"] = "ok"
            models = ollama_health.get("models", [])
            ollama_info["model_loaded"] = models[0] if models else None
        else:
            ollama_info["status"] = "unavailable"

        startup_health = get_settings_service().global_health
        perf_hints = startup_health.get("ollama_perf_hints", [])
        if perf_hints:
            ollama_info["perf_hints"] = perf_hints
    except Exception:
        ollama_info["status"] = "unavailable"
    components["ollama"] = ollama_info

    # ── Embeddings (extended) ────────────────────────────────
    embeddings_info: dict = {"status": "ok" if embeddings_svc.enabled else "disabled"}
    try:
        embeddings_info["model"] = getattr(
            embeddings_svc, "model_name", "nomic-embed-text"
        )
        embeddings_info["dimension"] = getattr(embeddings_svc, "detected_dim", 768)
    except Exception:
        pass
    components["embeddings"] = embeddings_info

    # ── ChromaDB ─────────────────────────────────────────────
    try:
        from app.services.vector_store_service import get_vector_store_service

        vs = get_vector_store_service()
        vs.get_stats()
        components["chromadb"] = {"status": "ok"}
    except Exception:
        components["chromadb"] = {"status": "error"}

    # Filesystem
    components["filesystem"] = {"status": "ok"}

    # ── Resident Agent (extended) ────────────────────────────
    resident_info: dict = {"status": "stopped"}
    try:
        from app.services.resident_agent import get_resident_agent

        agent = get_resident_agent()
        state = agent.get_state()
        is_running = state.get("is_running", False)

        if is_running:
            resident_info["status"] = "running"
        elif state.get("paused"):
            resident_info["status"] = "idle"
        resident_info["last_tick_at"] = state.get("last_heartbeat")
        resident_info["tick_count"] = state.get("tick_count", 0)

        try:
            from app.services.resident_curiosity import get_curiosity_service

            open_items = get_curiosity_service().list_items(status="open", limit=100)
            resident_info["open_curiosity_items"] = len(open_items)
        except Exception:
            resident_info["open_curiosity_items"] = 0
    except Exception:
        pass
    components["resident_agent"] = resident_info

    bg_tasks = get_supervisor().status()

    # Tailscale Funnel health
    from app.services.tailscale_service import get_tailscale_service

    tailscale_health = get_tailscale_service().get_health()

    overall = "ok"
    if any(
        c.get("status") not in ("ok", "running", "disabled")
        for c in components.values()
        if isinstance(c, dict)
    ):
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


@router.get("/api/health/errors")
async def health_errors(limit: int = 20) -> dict:
    """Return recent unhandled error records for debugging."""
    from app.middleware.error_handler import get_error_history

    return {"errors": get_error_history(limit=limit), "count": limit}


@router.get("/api/health/cleanup")
async def health_cleanup() -> dict:
    """Return cleanup service status."""
    from app.services.cleanup_service import get_cleanup_service

    return get_cleanup_service().get_status()


@router.get("/api/health/live")
async def health_live() -> dict:
    """Liveness probe – always returns 200."""
    return {"status": "ok"}


@router.get("/api/health/ready")
async def health_ready():
    """Readiness probe – checks ChromaDB availability."""
    try:
        from app.services.vector_store_service import get_vector_store_service

        vs = get_vector_store_service()
        async with asyncio.timeout(2.0):
            await asyncio.to_thread(vs.get_stats)
        return {"status": "ok"}
    except (asyncio.TimeoutError, Exception):
        return JSONResponse(status_code=503, content={"status": "unavailable"})


@router.get("/api/system/health")
async def system_health() -> dict:
    """Return startup component health state."""
    return get_settings_service().global_health


@router.get("/metrics", tags=["monitoring"])
async def prometheus_metrics():
    """Expose Prometheus metrics."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@router.delete("/api/embeddings/cache")
async def clear_embeddings_cache() -> dict:
    """Clear the embeddings cache."""
    from app.services.embeddings_service import get_embeddings_service

    prev_stats = get_embeddings_service().clear_cache()
    return {"cleared": True, "previous_stats": prev_stats}
