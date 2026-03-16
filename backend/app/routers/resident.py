"""Resident agent API endpoints – includes brain orchestrator features."""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.services.resident_agent import get_resident_agent
from app.services.job_service import get_job_service
from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/resident", tags=["resident"])


# ── Request / Response models ────────────────────────────────

class ResidentTaskRequest(BaseModel):
    title: str
    description: str = ""
    payload: Dict[str, Any] = {}


class ResidentModeRequest(BaseModel):
    mode: str = Field(..., pattern=r"^(observer|advisor|autonomous)$")


class MissionCreateRequest(BaseModel):
    goal: str = Field(..., min_length=1, max_length=500)
    context: str = ""


# ── Core endpoints (unchanged) ───────────────────────────────

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


# ── Autonomy mode ────────────────────────────────────────────

@router.get("/mode")
async def get_resident_mode() -> dict:
    """Get current resident autonomy mode."""
    settings = get_settings_service().load()
    return {"mode": settings.get("resident_mode", "advisor")}


@router.patch("/mode")
async def set_resident_mode(req: ResidentModeRequest) -> dict:
    """Set resident autonomy mode (observer/advisor/autonomous)."""
    get_settings_service().update({"resident_mode": req.mode})
    logger.info("Resident mode changed to: %s", req.mode)
    return {"mode": req.mode, "message": f"Režim změněn na {req.mode}"}


# ── Suggestions ──────────────────────────────────────────────

@router.get("/suggestions")
async def get_suggestions(limit: int = Query(default=10, ge=1, le=50)) -> dict:
    """Get recent suggestions from the resident reasoner."""
    agent = get_resident_agent()
    suggestions = agent.get_suggestions(limit=limit)
    return {"suggestions": suggestions, "count": len(suggestions)}


@router.post("/suggestions/{suggestion_id}/accept")
async def accept_suggestion(suggestion_id: str, action_id: str = Query(...)) -> dict:
    """Accept a suggested action and create a job for it."""
    mode = get_settings_service().load().get("resident_mode", "advisor")
    if mode == "observer":
        raise HTTPException(400, "V režimu observer nelze přijímat návrhy")

    agent = get_resident_agent()
    job_id = await agent.accept_suggestion_action(suggestion_id, action_id)
    if job_id is None:
        raise HTTPException(404, "Návrh nebo akce nenalezena")

    return {"job_id": job_id, "status": "queued", "message": "Akce přijata a zařazena do fronty"}


# ── Missions ─────────────────────────────────────────────────

@router.post("/missions")
async def create_mission(req: MissionCreateRequest) -> dict:
    """Create a new mission – the resident will plan and execute steps."""
    from app.services.resident_reasoner import get_resident_reasoner

    reasoner = get_resident_reasoner()
    steps = await reasoner.plan_mission(req.goal, req.context)
    if not steps:
        raise HTTPException(
            500, "Nepodařilo se naplánovat misi (LLM nedostupné nebo nevrátilo platný plán)"
        )

    # Store as a resident_mission job
    job_svc = get_job_service()
    plan = {
        "goal": req.goal,
        "steps": [s.model_dump() for s in steps],
        "current_step": 0,
        "status": "planned",
    }
    job = job_svc.create_job(
        type="resident_mission",
        title=req.goal,
        input_summary=req.context,
        payload={"plan": plan},
        priority="normal",
    )
    return {
        "mission_id": job.id,
        "goal": req.goal,
        "steps_count": len(steps),
        "status": "planned",
    }


@router.get("/missions")
async def list_missions(limit: int = Query(default=10, ge=1, le=50)) -> dict:
    """List recent missions."""
    job_svc = get_job_service()
    mission_jobs = job_svc.list_jobs(type="resident_mission", limit=limit)
    missions = []
    for mj in mission_jobs:
        plan = mj.payload.get("plan", {})
        missions.append({
            "id": mj.id,
            "goal": plan.get("goal", mj.title),
            "status": plan.get("status", mj.status),
            "current_step": plan.get("current_step", 0),
            "total_steps": len(plan.get("steps", [])),
            "progress": mj.progress,
            "created_at": mj.created_at,
        })
    return {"missions": missions, "count": len(missions)}


@router.get("/missions/{mission_id}")
async def get_mission_detail(mission_id: str) -> dict:
    """Get detailed mission info including step statuses."""
    job_svc = get_job_service()
    job = job_svc.get_job(mission_id)
    if not job or job.type != "resident_mission":
        raise HTTPException(404, "Mise nenalezena")

    plan = job.payload.get("plan", {})
    return {
        "id": job.id,
        "goal": plan.get("goal", job.title),
        "status": plan.get("status", job.status),
        "steps": plan.get("steps", []),
        "current_step": plan.get("current_step", 0),
        "progress": job.progress,
        "created_at": job.created_at,
        "started_at": job.started_at,
        "finished_at": job.finished_at,
    }


# ── Reflections ──────────────────────────────────────────────

@router.get("/reflections")
async def get_reflections(limit: int = Query(default=20, ge=1, le=100)) -> dict:
    """Get recent reflections from completed resident jobs."""
    agent = get_resident_agent()
    reflections = agent.get_reflections(limit=limit)
    return {"reflections": reflections, "count": len(reflections)}
