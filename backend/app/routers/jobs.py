"""Jobs router – CRUD for persistent job queue."""
import asyncio
import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.job_service import get_job_service
from app.services.ws_manager import get_ws_manager, WS_EVENT_JOB_UPDATE

logger = logging.getLogger(__name__)
router = APIRouter()


class CreateJobRequest(BaseModel):
    type: str
    title: str
    input_summary: str = ""
    payload: Dict[str, Any] = {}
    priority: str = "normal"


class RunNowRequest(BaseModel):
    type: str
    title: str
    input_summary: str = ""
    payload: Dict[str, Any] = {}


class ScheduleJobRequest(BaseModel):
    type: str
    title: str
    cron: str = ""  # e.g. "0 22 * * *"
    run_at: str = ""  # ISO datetime for one-shot scheduling
    input_summary: str = ""
    payload: Dict[str, Any] = {}


def _sync_to_db_and_broadcast(job) -> None:
    """Persist job to SQLite DB and broadcast update via WebSocket (fire-and-forget)."""
    try:
        from app.db.jobs_db import get_jobs_db
        db = get_jobs_db()
        db.insert_job({
            "id": job.id,
            "type": job.type,
            "title": job.title,
            "status": job.status,
            "input_summary": job.input_summary,
            "created_at": job.created_at,
        })
    except Exception as exc:
        logger.debug("JobsDB sync failed: %s", exc)

    try:
        ws = get_ws_manager()
        asyncio.create_task(ws.broadcast({
            "type": WS_EVENT_JOB_UPDATE,
            "job_id": job.id,
            "status": job.status,
            "title": job.title,
        }))
    except Exception:
        pass


@router.post("/jobs", tags=["jobs"])
async def create_job(req: CreateJobRequest) -> Dict[str, Any]:
    """Create a new job and add it to the queue."""
    svc = get_job_service()
    job = svc.create_job(
        type=req.type,
        title=req.title,
        input_summary=req.input_summary,
        payload=req.payload,
        priority=req.priority,
    )
    # Persist to SQLite + broadcast via WebSocket
    _sync_to_db_and_broadcast(job)
    return job.model_dump()


@router.get("/jobs", tags=["jobs"])
async def list_jobs(
    status: Optional[str] = None,
    type: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> Dict[str, Any]:
    """List jobs, newest first. Optional filtering by status and type."""
    svc = get_job_service()
    jobs = svc.list_jobs(status=status, type=type, limit=limit, offset=offset)
    return {"jobs": [j.model_dump() for j in jobs], "count": len(jobs)}


@router.post("/jobs/run-now", tags=["jobs"])
async def run_job_now(req: RunNowRequest) -> Dict[str, Any]:
    """Create a high-priority job for immediate execution."""
    svc = get_job_service()
    job = svc.create_job(
        type=req.type,
        title=req.title,
        input_summary=req.input_summary,
        payload=req.payload,
        priority="high",
    )
    return {"id": job.id, "status": "queued", "priority": "high", "message": "Job queued for immediate execution"}


@router.post("/jobs/schedule", tags=["jobs"])
async def schedule_job(req: ScheduleJobRequest) -> Dict[str, Any]:
    """Schedule a job for later execution via cron expression or datetime."""
    svc = get_job_service()
    meta: Dict[str, Any] = {}
    if req.cron:
        meta["cron"] = req.cron
        meta["scheduled_type"] = "cron"
    elif req.run_at:
        meta["run_at"] = req.run_at
        meta["scheduled_type"] = "one_shot"
    else:
        raise HTTPException(400, "Either 'cron' or 'run_at' must be provided")

    job = svc.create_job(
        type=req.type,
        title=req.title,
        input_summary=req.input_summary,
        payload=req.payload,
        priority="normal",
        meta=meta,
    )
    return {
        "id": job.id,
        "status": "queued",
        "schedule": meta,
        "message": f"Job scheduled: {req.cron or req.run_at}",
    }


@router.get("/jobs/queue", tags=["jobs"])
async def get_job_queue() -> Dict[str, Any]:
    """Return all active jobs (queued + running) as a real-time queue view."""
    svc = get_job_service()
    queued = svc.list_jobs(status="queued", limit=100)
    running = svc.list_jobs(status="running", limit=20)
    paused = svc.list_jobs(status="paused", limit=20)
    all_active = running + queued + paused
    return {
        "queue": [j.model_dump() for j in all_active],
        "running_count": len(running),
        "queued_count": len(queued),
        "paused_count": len(paused),
        "total": len(all_active),
    }


@router.get("/jobs/{job_id}", tags=["jobs"])
async def get_job(job_id: str) -> Dict[str, Any]:
    """Get detail of a single job."""
    svc = get_job_service()
    job = svc.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    return job.model_dump()


@router.post("/jobs/{job_id}/cancel", tags=["jobs"])
async def cancel_job(job_id: str) -> Dict[str, Any]:
    """Cancel a queued or running job (sets status to cancelled)."""
    svc = get_job_service()
    job = svc.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    if job.status in ("succeeded", "failed", "cancelled"):
        raise HTTPException(
            status_code=400,
            detail=f"Job {job_id} is already {job.status}, cannot cancel",
        )
    job.status = "cancelled"
    from datetime import datetime, timezone
    job.finished_at = datetime.now(timezone.utc).isoformat()
    svc.update_job(job)
    return {"id": job.id, "status": job.status}


@router.post("/jobs/{job_id}/pause", tags=["jobs"])
async def pause_job(job_id: str) -> Dict[str, Any]:
    """Pause a running job (sets status to 'paused')."""
    svc = get_job_service()
    job = svc.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    if job.status != "running":
        raise HTTPException(
            status_code=400,
            detail=f"Job {job_id} is '{job.status}', only running jobs can be paused",
        )
    job.status = "paused"
    svc.update_job(job)
    return {"id": job.id, "status": job.status}


@router.post("/jobs/{job_id}/resume", tags=["jobs"])
async def resume_job(job_id: str) -> Dict[str, Any]:
    """Resume a paused job (sets status back to 'queued' for the worker to pick up)."""
    svc = get_job_service()
    job = svc.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    if job.status != "paused":
        raise HTTPException(
            status_code=400,
            detail=f"Job {job_id} is '{job.status}', only paused jobs can be resumed",
        )
    job.status = "queued"
    svc.update_job(job)
    return {"id": job.id, "status": job.status}


@router.post("/jobs/{job_id}/retry", tags=["jobs"])
async def retry_job(job_id: str) -> Dict[str, Any]:
    """Re-queue a failed or cancelled job by creating a fresh copy with status 'queued'.

    Only jobs in 'failed' or 'cancelled' state can be retried. A new job is
    created (preserving type, title, payload and priority) so the original error
    record is kept for audit purposes.
    """
    svc = get_job_service()
    original = svc.get_job(job_id)
    if not original:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    if original.status not in ("failed", "cancelled"):
        raise HTTPException(
            status_code=400,
            detail=f"Job {job_id} has status '{original.status}'; only failed/cancelled jobs can be retried",
        )
    new_job = svc.create_job(
        type=original.type,
        title=original.title,
        input_summary=original.input_summary,
        payload=original.payload,
        priority=original.priority,
        meta={**original.meta, "retry_of": original.id},
    )
    return {"id": new_job.id, "status": new_job.status, "retry_of": original.id}


class PriorityRequest(BaseModel):
    priority: str  # "high" | "normal" | "low"


@router.post("/jobs/{job_id}/priority", tags=["jobs"])
async def set_job_priority(job_id: str, req: PriorityRequest) -> Dict[str, Any]:
    """Update job priority (high/normal/low)."""
    if req.priority not in ("high", "normal", "low"):
        raise HTTPException(status_code=400, detail=f"Invalid priority: {req.priority}")
    svc = get_job_service()
    job = svc.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    job.priority = req.priority
    svc.update_job(job)
    return {"id": job.id, "priority": job.priority}


@router.get("/jobs/nightly-report", tags=["jobs"])
async def get_nightly_report() -> Dict[str, Any]:
    """Return the most recent nightly summary report.

    Checks completed nightly_summary jobs and memory system events.
    """
    from app.services.memory_service import get_memory_service

    # 1. Check completed nightly_summary jobs first
    job_svc = get_job_service()
    completed_jobs = job_svc.list_jobs(type="nightly_summary", status="succeeded", limit=1)
    if completed_jobs:
        j = completed_jobs[0]
        result = j.meta.get("result", {}) if j.meta else {}
        if isinstance(result, dict) and result.get("summary"):
            date_str = (j.finished_at or j.created_at or "")[:10]
            return {
                "available": True,
                "date": date_str,
                "content": result["summary"],
                "events_processed": result.get("events_processed", 0),
                "generated_at": j.finished_at or j.created_at,
                "preview": result.get("preview", result["summary"][:200]),
            }

    # 2. Fallback: check memory system events
    memory_svc = get_memory_service()
    try:
        recent = memory_svc.get_recent_events(limit=50)
        summaries = [e for e in recent if e.get("event_type") == "nightly_summary"]
        if summaries:
            latest = summaries[0]
            return {
                "available": True,
                "date": latest.get("timestamp", "")[:10],
                "content": latest.get("text", ""),
                "events_processed": None,
                "generated_at": latest.get("timestamp"),
                "preview": latest.get("text", "")[:200],
            }
    except Exception:
        pass

    return {"available": False, "message": "Žádný report zatím nevytvořen. Spusť nightly_summary job."}


@router.delete("/jobs/{job_id}", tags=["jobs"])
async def delete_job(job_id: str) -> Dict[str, Any]:
    """Permanently delete a job from the queue."""
    svc = get_job_service()
    job = svc.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    svc.delete_job(job_id)
    return {"id": job_id, "status": "deleted"}


@router.get("/overnight/status", tags=["jobs"])
async def overnight_status() -> Dict[str, Any]:
    """Return overnight scheduler status: night window, last runs, next scheduled."""
    from datetime import datetime
    from app.services.settings_service import get_settings_service
    from app.services.job_worker import is_now_in_night_window
    from app.services.memory_service import get_memory_service

    settings_svc = get_settings_service()
    job_settings = settings_svc.get_job_settings()

    night_window = job_settings.get("night_batch_window", {"start": "22:00", "end": "06:00"})
    in_night = is_now_in_night_window(job_settings)

    # Get last run info from memory (system events tagged by type)
    memory_svc = get_memory_service()
    recent_events = memory_svc.get_recent_events(limit=100)

    night_job_types = ["kb_reindex", "git_sweep", "nightly_summary"]
    last_run: Dict[str, Any] = {}

    for job_type in night_job_types:
        matching = [
            e for e in recent_events
            if e.get("event_type") == job_type
        ]
        if matching:
            latest = matching[0]  # already sorted DESC
            entry: Dict[str, Any] = {
                "date": latest.get("timestamp", "")[:10],
                "timestamp": latest.get("timestamp", ""),
            }
            if job_type == "nightly_summary":
                entry["preview"] = latest.get("text", "")[:200]
            else:
                entry["result"] = latest.get("text", "")[:500]
            last_run[job_type] = entry
        else:
            last_run[job_type] = None

    # Also check completed jobs for last run info
    job_svc = get_job_service()
    for job_type in night_job_types:
        if last_run.get(job_type) is not None:
            continue
        completed_jobs = job_svc.list_jobs(type=job_type, limit=1)
        if completed_jobs and completed_jobs[0].status == "succeeded":
            j = completed_jobs[0]
            entry = {
                "date": (j.finished_at or j.created_at)[:10],
                "timestamp": j.finished_at or j.created_at,
            }
            if job_type == "nightly_summary":
                result = j.meta.get("result", {})
                entry["preview"] = result.get("preview", "") if isinstance(result, dict) else ""
            else:
                entry["result"] = j.meta.get("result", {})
            last_run[job_type] = entry

    # Determine next_scheduled
    now = datetime.now()
    start_str = night_window.get("start", "22:00")

    if in_night:
        next_scheduled = "dnes probíhá"
    else:
        try:
            start_h, start_m = map(int, start_str.split(":"))
            start_today = now.replace(hour=start_h, minute=start_m, second=0)
            if now < start_today:
                next_scheduled = f"dnes v {start_str}"
            else:
                next_scheduled = f"zítra v {start_str}"
        except (ValueError, AttributeError):
            next_scheduled = f"v {start_str}"

    return {
        "is_night_window": in_night,
        "night_window": night_window,
        "last_run": last_run,
        "next_scheduled": next_scheduled,
    }


@router.post("/overnight/run/{job_name}", tags=["jobs"])
async def run_overnight_job_now(job_name: str) -> Dict[str, Any]:
    """Manually trigger an overnight job regardless of the night window.

    *job_name* must be one of: kb_reindex, git_sweep, nightly_summary.
    Creates a queued job that the worker will pick up immediately.
    """
    allowed = {"kb_reindex", "git_sweep", "nightly_summary"}
    if job_name not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown job: {job_name}. Allowed: {', '.join(sorted(allowed))}",
        )

    svc = get_job_service()
    job = svc.create_job(
        type=job_name,
        title=f"Manual run: {job_name}",
        payload={"manual": True},
        priority="high",
    )
    return {"job_id": job.id, "status": "queued"}


@router.post("/db/init", tags=["jobs"])
async def init_jobs_db() -> Dict[str, Any]:
    """Initialize the SQLite jobs database schema."""
    from app.db.jobs_db import get_jobs_db
    db = get_jobs_db()
    stats = db.count_by_status()
    return {"status": "ok", "db": "jobs.db", "counts": stats}


@router.get("/jobs/mobile-summary", tags=["jobs"])
async def mobile_jobs_summary(limit: int = 20) -> Dict[str, Any]:
    """Compact job summary optimized for mobile UI."""
    from app.db.jobs_db import get_jobs_db
    db = get_jobs_db()
    jobs = db.list_jobs(limit=limit)
    counts = db.count_by_status()
    total = sum(counts.values())
    failed = counts.get("failed", 0)

    compact = []
    for j in jobs:
        compact.append({
            "id": j["id"][:8],
            "full_id": j["id"],
            "time": (j.get("created_at") or "")[-8:-3],  # HH:MM
            "status": j["status"],
            "title": j["title"][:60],
            "summary": (j.get("output_summary") or j.get("input_summary") or "")[:80],
            "duration_ms": j.get("execution_time", 0),
        })

    return {
        "total": total,
        "failed": failed,
        "jobs": compact,
    }
