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
