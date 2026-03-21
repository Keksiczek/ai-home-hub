"""Control router – Power UX endpoints for the Control Room.

Provides:
- POST /api/control/resident/force-cycle  – trigger a resident cycle immediately
- GET  /api/control/resident/history/csv  – export cycle history as CSV stream
- POST /api/control/shutdown-graceful     – graceful SIGTERM shutdown
- POST /api/control/kb/purge-cache        – purge KB stats cache
"""
import asyncio
import csv
import io
import logging
import os
import signal
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/control", tags=["control"])

# Module-level imports used in endpoints (declared here so tests can patch them)
from app.services.resident_agent import get_resident_agent  # noqa: E402
from app.db.resident_state import get_resident_state_db  # noqa: E402
from app.services import kb_stats_cache as _kb_stats_cache_mod  # noqa: E402

GRACEFUL_SHUTDOWN_ENABLED = os.environ.get("ENABLE_GRACEFUL_SHUTDOWN", "true").lower() != "false"


# ── Force Resident Cycle ─────────────────────────────────────

@router.post("/resident/force-cycle")
async def force_resident_cycle() -> dict:
    """Force the resident agent to run a cycle immediately, bypassing the interval.

    The cycle is triggered asynchronously; the endpoint returns immediately.
    """
    agent = get_resident_agent()
    state = agent.get_state()

    if not state.get("is_running", False):
        raise HTTPException(
            status_code=409,
            detail="Resident agent is not running. Start it first via POST /api/resident/start",
        )

    if state.get("paused", False):
        raise HTTPException(
            status_code=409,
            detail="Resident agent is paused. Resume it first.",
        )

    try:
        # Trigger immediate cycle via the agent's public interface
        if hasattr(agent, "trigger_immediate_cycle"):
            await agent.trigger_immediate_cycle()
            return {"status": "triggered", "message": "Force cycle enqueued"}

        # Fallback: reset the sleep interval so the next tick fires soon
        if hasattr(agent, "_force_cycle_event"):
            agent._force_cycle_event.set()
            return {"status": "triggered", "message": "Force cycle event set"}

        return {"status": "noop", "message": "Agent does not support force-cycle signal"}
    except Exception as exc:
        logger.error("Force cycle error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


# ── History CSV Export ────────────────────────────────────────

_CSV_COLUMNS = [
    "id", "timestamp", "cycle_id", "cycle_number", "status",
    "action_type", "action_target", "output_preview", "duration_ms", "error",
]


def _generate_csv(rows: list) -> io.StringIO:
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=_CSV_COLUMNS, extrasaction="ignore")
    writer.writeheader()
    for row in rows:
        writer.writerow({col: row.get(col, "") for col in _CSV_COLUMNS})
    buf.seek(0)
    return buf


@router.get("/resident/history/csv")
async def download_history_csv(
    limit: int = Query(default=1000, ge=1, le=10000),
    status: Optional[str] = Query(default=None),
) -> StreamingResponse:
    """Export resident cycle history as a CSV file.

    Query params:
    - limit: max rows to export (1–10000, default 1000)
    - status: filter by status (success|fail|error|aborted)
    """
    db = get_resident_state_db()

    rows = await asyncio.to_thread(db.get_history, limit=limit, status=status)

    buf = await asyncio.to_thread(_generate_csv, rows)

    def _iter():
        while True:
            chunk = buf.read(8192)
            if not chunk:
                break
            yield chunk

    filename = f"resident_history_{limit}rows.csv"
    return StreamingResponse(
        _iter(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ── Graceful Shutdown ─────────────────────────────────────────

class ShutdownRequest(BaseModel):
    reason: str = "User-initiated graceful shutdown"
    delay_seconds: int = 2


@router.post("/shutdown-graceful")
async def graceful_shutdown(req: ShutdownRequest) -> dict:
    """Initiate a graceful shutdown of the application.

    Sends SIGTERM to the current process after a brief delay,
    allowing in-flight requests to finish (uvicorn handles graceful drain).

    Feature-flagged via ENABLE_GRACEFUL_SHUTDOWN env var (default: true).
    """
    if not GRACEFUL_SHUTDOWN_ENABLED:
        raise HTTPException(
            status_code=403,
            detail="Graceful shutdown is disabled (ENABLE_GRACEFUL_SHUTDOWN=false)",
        )

    delay = max(1, min(req.delay_seconds, 30))
    logger.warning("Graceful shutdown requested: reason='%s' delay=%ds", req.reason, delay)

    async def _send_sigterm():
        await asyncio.sleep(delay)
        logger.warning("Sending SIGTERM to PID %d", os.getpid())
        os.kill(os.getpid(), signal.SIGTERM)

    asyncio.create_task(_send_sigterm())
    return {
        "status": "shutdown_scheduled",
        "delay_seconds": delay,
        "reason": req.reason,
        "pid": os.getpid(),
    }


# ── KB Cache Purge ────────────────────────────────────────────

@router.post("/kb/purge-cache")
async def purge_kb_cache() -> dict:
    """Purge the KB stats cache, forcing a full refresh on next access."""
    try:
        cache_file = _kb_stats_cache_mod.CACHE_FILE
        if cache_file.exists():
            cache_file.unlink()
            logger.info("KB stats cache file purged: %s", cache_file)
        return {"status": "purged", "message": "KB stats cache cleared"}
    except Exception as exc:
        logger.error("KB cache purge error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
