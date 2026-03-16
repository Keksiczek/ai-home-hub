"""Jobs router – CRUD for persistent job queue."""
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.job_service import get_job_service

router = APIRouter()


class CreateJobRequest(BaseModel):
    type: str
    title: str
    input_summary: str = ""
    payload: Dict[str, Any] = {}
    priority: str = "normal"


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
