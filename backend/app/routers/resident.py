"""Resident agent API endpoints – includes brain orchestrator features."""

import asyncio
import json
import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
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


class AgentSettingsPatch(BaseModel):
    interval_seconds: Optional[int] = Field(None, ge=5, le=3600)
    model: Optional[str] = None
    max_cycles_per_day: Optional[int] = Field(None, ge=1, le=10000)
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None
    quiet_hours_enabled: Optional[bool] = None
    proposal_interval_minutes: Optional[int] = Field(None, ge=15, le=1440)
    max_proposals: Optional[int] = Field(None, ge=1, le=5)
    interest_topics: Optional[str] = None


# ── Core endpoints (unchanged) ───────────────────────────────

@router.get("/status")
async def resident_status() -> dict:
    """Get resident agent state."""
    agent = get_resident_agent()
    return agent.get_state()


@router.get("/heartbeat")
async def resident_heartbeat() -> dict:
    """Get resident agent heartbeat status – lightweight health check."""
    agent = get_resident_agent()
    state = agent.get_state()
    return {
        "is_running": state.get("is_running", False),
        "heartbeat_status": state.get("heartbeat_status", "unknown"),
        "last_heartbeat": state.get("last_heartbeat"),
        "tick_count": state.get("tick_count", 0),
        "consecutive_errors": state.get("consecutive_errors", 0),
        "status": state.get("status", "idle"),
    }


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


@router.post("/mode/pause")
async def pause_resident_mode() -> dict:
    """Panic / pause: immediately switch Resident to 'advisor' mode.

    Disables autonomous action execution without stopping the agent daemon.
    Always safe to call – never raises even if already in advisor/observer mode.
    """
    get_settings_service().update({"resident_mode": "advisor"})
    logger.warning("Resident PANIC/PAUSE – mode forced to advisor")
    return {"status": "ok", "mode": "advisor", "message": "Autonomie pozastavena – přepnuto na advisor"}


@router.post("/mode/autonomous")
async def enable_resident_autonomous() -> dict:
    """Enable autonomous mode (safe actions may run without confirmation).

    Note: destructive actions (delete, overwrite) always require confirmation
    regardless of this setting – that logic lives in the job worker, not here.
    """
    get_settings_service().update({"resident_mode": "autonomous"})
    logger.info("Resident autonomous mode enabled")
    return {"status": "ok", "mode": "autonomous", "message": "Autonomous mód zapnut"}


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


# ── History & Logs ────────────────────────────────────────────

@router.get("/history")
async def get_agent_history(limit: int = Query(default=20, ge=1, le=200)) -> dict:
    """Get recent cycle history."""
    agent = get_resident_agent()
    history = agent.get_cycle_history(limit=limit)
    return {"history": history, "count": len(history)}


@router.get("/logs")
async def get_agent_logs(
    level: Optional[str] = Query(default=None, pattern=r"^(INFO|WARN|ERROR)$"),
    cycle: Optional[str] = Query(default=None),
    limit: int = Query(default=100, ge=1, le=1000),
) -> dict:
    """Get filterable structured log entries."""
    agent = get_resident_agent()
    logs = agent.get_logs(level=level, cycle=cycle, limit=limit)
    return {"logs": logs, "count": len(logs)}


@router.delete("/logs")
async def clear_agent_logs() -> dict:
    """Clear all agent log entries."""
    agent = get_resident_agent()
    count = agent.clear_logs()
    return {"status": "ok", "cleared": count}


# ── Pause / Resume / Run Now / Reset ─────────────────────────

@router.post("/pause")
async def agent_pause() -> dict:
    """Pause the resident agent (stays running, skips ticks)."""
    agent = get_resident_agent()
    return await agent.pause()


@router.post("/resume")
async def agent_resume() -> dict:
    """Resume a paused resident agent."""
    agent = get_resident_agent()
    return await agent.resume()


@router.post("/run-now")
async def agent_run_now() -> dict:
    """Trigger an immediate cycle."""
    agent = get_resident_agent()
    try:
        return await agent.run_now()
    except Exception as exc:
        logger.error("Run-now failed: %s", exc)
        raise HTTPException(500, f"Run-now failed: {exc}")


@router.post("/reset")
async def agent_reset() -> dict:
    """Reset agent counters, history, and memory."""
    agent = get_resident_agent()
    return await agent.reset()


# ── Agent Settings ────────────────────────────────────────────

@router.get("/agent-settings")
async def get_agent_settings() -> dict:
    """Get current agent runtime settings."""
    agent = get_resident_agent()
    return agent.get_agent_settings()


@router.patch("/agent-settings")
async def patch_agent_settings(req: AgentSettingsPatch) -> dict:
    """Update agent runtime settings (interval, model, quiet hours, etc.)."""
    agent = get_resident_agent()
    updates = req.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(400, "No settings to update")
    return agent.update_agent_settings(updates)


# ── Agent Memory ──────────────────────────────────────────────

@router.get("/agent-memory")
async def get_agent_memory(limit: int = Query(default=50, ge=1, le=200)) -> dict:
    """Get agent memory entries."""
    agent = get_resident_agent()
    items = await agent.get_agent_memory(limit=limit)
    return {"memory": items, "count": len(items)}


@router.delete("/agent-memory")
async def clear_agent_memory() -> dict:
    """Clear all resident agent memory entries."""
    agent = get_resident_agent()
    return await agent.clear_agent_memory()


# ── Reflections ──────────────────────────────────────────────

@router.get("/reflections")
async def get_reflections(limit: int = Query(default=20, ge=1, le=100)) -> dict:
    """Get recent reflections from completed resident jobs."""
    agent = get_resident_agent()
    reflections = agent.get_reflections(limit=limit)
    return {"reflections": reflections, "count": len(reflections)}


# ── Tool-augmented reasoning ────────────────────────────────

# In-memory store for reasoning cycles (matching pattern of _suggestions)
_reasoning_cycles: list = []
_MAX_REASONING_HISTORY = 20


@router.get("/reasoning")
async def get_reasoning_cycles(limit: int = Query(default=10, ge=1, le=50)) -> dict:
    """Get recent tool-augmented reasoning cycles."""
    cycles = _reasoning_cycles[-limit:]
    return {"cycles": [c.model_dump() for c in cycles], "count": len(cycles)}


@router.post("/reasoning")
async def trigger_reasoning_cycle() -> dict:
    """Trigger a new tool-augmented reasoning cycle."""
    from app.services.resident_reasoner import get_resident_reasoner

    reasoner = get_resident_reasoner()

    try:
        cycle = await reasoner.reason_with_tools()
    except Exception as exc:
        logger.error("Reasoning cycle failed: %s", exc)
        raise HTTPException(500, f"Reasoning cycle selhal: {exc}")

    _reasoning_cycles.append(cycle)
    if len(_reasoning_cycles) > _MAX_REASONING_HISTORY:
        del _reasoning_cycles[: len(_reasoning_cycles) - _MAX_REASONING_HISTORY]

    return cycle.model_dump()


# ── Mission proposals ────────────────────────────────────────

@router.get("/proposals")
async def get_proposals(status: Optional[str] = Query(default=None)) -> dict:
    """Get mission proposals (optionally filtered by status)."""
    agent = get_resident_agent()
    proposals = agent.get_proposals(status=status)
    return {"proposals": proposals, "count": len(proposals)}


@router.post("/proposals/generate")
async def generate_proposals() -> dict:
    """Trigger the agent to generate new mission proposals."""
    agent = get_resident_agent()
    try:
        proposals = await agent.propose_missions()
        return {"proposals": proposals, "count": len(proposals)}
    except Exception as exc:
        logger.error("Proposal generation failed: %s", exc)
        raise HTTPException(500, f"Generování návrhů selhalo: {exc}")


@router.post("/proposals/{proposal_id}/approve")
async def approve_proposal(proposal_id: str) -> dict:
    """Approve a proposed mission and queue it for execution."""
    agent = get_resident_agent()
    job_id = await agent.approve_proposal(proposal_id)
    if job_id is None:
        raise HTTPException(404, "Návrh nenalezen nebo již zpracován")
    return {"status": "approved", "job_id": job_id, "message": "Mise schválena a zařazena do fronty"}


@router.post("/proposals/{proposal_id}/reject")
async def reject_proposal(proposal_id: str) -> dict:
    """Reject a proposed mission."""
    agent = get_resident_agent()
    ok = agent.reject_proposal(proposal_id)
    if not ok:
        raise HTTPException(404, "Návrh nenalezen nebo již zpracován")
    return {"status": "rejected", "message": "Návrh zamítnut"}


# ── SSE stream for live agent thoughts ───────────────────────

@router.get("/stream")
async def resident_stream(request: Request):
    """SSE stream – sends live thoughts and actions of the Resident agent."""
    agent = get_resident_agent()

    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
            try:
                thought = await asyncio.wait_for(agent.thought_queue.get(), timeout=30.0)
                event_type = thought.get("type", "thinking")
                data = json.dumps(thought, ensure_ascii=False)
                yield f"event: {event_type}\ndata: {data}\n\n"
            except asyncio.TimeoutError:
                # Send keepalive comment
                yield ": keepalive\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
