"""Resident agent API endpoints."""

import logging
from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.resident_agent import get_resident_agent
from app.services.job_service import get_job_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/resident", tags=["resident"])


class ResidentTaskRequest(BaseModel):
    title: str
    description: str = ""
    payload: Dict[str, Any] = {}


@router.get("/status")
async def resident_status() -> dict:
    """Get resident agent state."""
    agent = get_resident_agent()
    return agent.get_state()


@router.get("/dashboard")
async def resident_dashboard() -> dict:
    """Get resident agent dashboard data: status, uptime, heartbeat, tasks, alerts, stats."""
    agent = get_resident_agent()
    return agent.get_dashboard_data()


@router.post("/start")
async def resident_start() -> dict:
    """Start the resident agent daemon."""
    agent = get_resident_agent()
    try:
        result = await agent.start()
        return {"status": result["status"], "message": result["message"]}
    except Exception as exc:
        logger.error("Failed to start resident agent: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/stop")
async def resident_stop() -> dict:
    """Stop the resident agent daemon."""
    agent = get_resident_agent()
    try:
        result = await agent.stop()
        return {"status": result["status"], "message": result["message"]}
    except Exception as exc:
        logger.error("Failed to stop resident agent: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/task")
async def resident_add_task(req: ResidentTaskRequest) -> dict:
    """Add a task to the resident agent queue via job_service."""
    job_svc = get_job_service()
    job = job_svc.create_job(
        type="resident_task",
        title=req.title,
        input_summary=req.description,
        payload=req.payload,
        priority="normal",
    )
    return {"job_id": job.id, "status": "queued", "title": req.title}


@router.get("/steps")
async def resident_steps() -> dict:
    """Get the last 5 steps from the resident agent."""
    agent = get_resident_agent()
    state = agent.get_state()
    return {"steps": state.get("recent_steps", [])}
