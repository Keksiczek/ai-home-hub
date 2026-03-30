"""Agent API endpoints – /api/agent/* convenience aliases.

Extracted from main.py to keep the app factory lean.
"""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agent", tags=["agent"])


@router.get("/status")
async def agent_status() -> dict:
    """Top-level agent status endpoint combining resident agent and job worker health."""
    from app.services.resident_agent import get_resident_agent
    from app.core.startup import get_supervisor

    agent = get_resident_agent()
    state = agent.get_state()
    bg_tasks = get_supervisor().status()

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


@router.get("/history")
async def agent_history(limit: int = 20) -> dict:
    """Convenience alias for GET /api/resident/history."""
    from app.services.resident_agent import get_resident_agent

    history = get_resident_agent().get_cycle_history(limit=limit)
    return {"history": history, "count": len(history)}


@router.get("/history/persistent")
async def agent_history_persistent(limit: int = 50, status: str = None) -> dict:
    """Return persistent cycle history from SQLite (survives restarts)."""
    from app.db.resident_state import get_resident_state_db

    db = get_resident_state_db()
    history = db.get_history(limit=limit, status=status)
    stats = db.get_stats()
    return {"history": history, "stats": stats, "count": len(history)}


@router.get("/metrics/cached")
async def agent_metrics_cached() -> dict:
    """Return cached agent metrics (1-min TTL)."""
    from app.services.resident_agent import get_resident_agent

    return get_resident_agent().get_cached_metrics()


@router.get("/logs")
async def agent_logs(level: str = None, cycle: str = None, limit: int = 100) -> dict:
    """Convenience alias for GET /api/resident/logs."""
    from app.services.resident_agent import get_resident_agent

    logs = get_resident_agent().get_logs(level=level, cycle=cycle, limit=limit)
    return {"logs": logs, "count": len(logs)}


@router.post("/pause")
async def agent_pause() -> dict:
    """Pause the resident agent."""
    from app.services.resident_agent import get_resident_agent

    return await get_resident_agent().pause()


@router.post("/run-now")
async def agent_run_now() -> dict:
    """Trigger an immediate agent cycle."""
    from app.services.resident_agent import get_resident_agent

    return await get_resident_agent().run_now()


@router.post("/reset")
async def agent_reset() -> dict:
    """Reset agent counters and memory."""
    from app.services.resident_agent import get_resident_agent

    return await get_resident_agent().reset()


@router.patch("/settings")
async def agent_settings_patch(updates: dict) -> dict:
    """Update agent runtime settings."""
    from app.services.resident_agent import get_resident_agent

    return get_resident_agent().update_agent_settings(updates)


@router.get("/memory")
async def agent_memory_list(limit: int = 50) -> dict:
    """Get agent memory entries."""
    from app.services.resident_agent import get_resident_agent

    items = await get_resident_agent().get_agent_memory(limit=limit)
    return {"memory": items, "count": len(items)}


@router.delete("/memory")
async def agent_memory_clear() -> dict:
    """Clear agent memory."""
    from app.services.resident_agent import get_resident_agent

    return await get_resident_agent().clear_agent_memory()


@router.delete("/memory/{memory_id}")
async def agent_memory_delete_by_id(memory_id: str) -> dict:
    """Delete a single agent memory entry by ID."""
    from app.services.resident_agent import get_resident_agent

    result = await get_resident_agent().delete_agent_memory_by_id(memory_id)
    if result.get("status") == "not_found":
        raise HTTPException(status_code=404, detail=f"Memory {memory_id} not found")
    return result


@router.post("/memory")
async def agent_memory_add(body: dict) -> dict:
    """Manually add an entry to agent memory.

    Body::

        {"content": "User prefers dark mode", "tags": ["#preference"]}
    """
    from app.services.resident_agent import get_resident_agent

    content = body.get("content", "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="'content' is required")
    tags = body.get("tags", [])
    return await get_resident_agent().add_agent_memory_manual(
        content=content, tags=tags
    )
