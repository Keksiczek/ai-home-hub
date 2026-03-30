"""Resident agent API endpoints – thin router delegating to service modules."""

import asyncio
import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import JSONResponse, StreamingResponse

from app.models.resident_models import (
    AgentSettingsPatch,
    MissionChatRequest,
    MissionTemplateRequest,
    PlanApproveRequest,
    PlanCreateRequest,
    PlanRejectRequest,
    ResidentActionRequest,
    ResidentModeRequest,
    ResidentTaskRequest,
)
from app.services.resident_agent import get_resident_agent
from app.services.job_service import get_job_service
from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/resident", tags=["resident"])


# ── Core endpoints ───────────────────────────────────────────


@router.get("/status")
async def resident_status() -> dict:
    """Get resident agent state."""
    return get_resident_agent().get_state()


@router.get("/heartbeat")
async def resident_heartbeat() -> dict:
    """Get resident agent heartbeat status – lightweight health check."""
    state = get_resident_agent().get_state()
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
    """Get resident agent dashboard data for the control-room UX."""
    from app.services.resident_reasoner import enrich_dashboard_data

    agent = get_resident_agent()
    data = agent.get_dashboard_data()
    health = get_settings_service().global_health
    return enrich_dashboard_data(data, health)


@router.post("/start")
async def resident_start() -> dict:
    """Start the resident agent daemon."""
    try:
        result = await get_resident_agent().start()
        return {"status": result["status"], "message": result["message"]}
    except Exception as exc:
        logger.error("Failed to start resident agent: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/stop")
async def resident_stop() -> dict:
    """Stop the resident agent daemon."""
    try:
        result = await get_resident_agent().stop()
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


@router.post("/action")
async def resident_action(req: ResidentActionRequest) -> dict:
    """Manually trigger a resident action via the job engine."""
    from app.services.resident_agent.core import ALLOWED_ACTIONS

    if req.action not in ALLOWED_ACTIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Action '{req.action}' not allowed. "
            f"Allowed: {', '.join(sorted(ALLOWED_ACTIONS))}",
        )

    job_svc = get_job_service()
    job = job_svc.create_job(
        type="resident_task",
        title=f"Manual resident action: {req.action}",
        input_summary=f"Manual trigger for resident action {req.action}",
        payload={
            "action_type": req.action,
            "params": req.params,
            "manual_trigger": True,
        },
        priority="normal",
    )
    logger.info("Manual resident action created: %s (job=%s)", req.action, job.id)
    return {"job_id": job.id, "action": req.action, "status": "queued"}


@router.get("/steps")
async def resident_steps() -> dict:
    """Get the last 5 steps from the resident agent."""
    state = get_resident_agent().get_state()
    return {"steps": state.get("recent_steps", [])}


# ── Task detail & chat ──────────────────────────────────────


@router.get("/tasks/{task_id}")
async def get_task_detail(task_id: str) -> dict:
    """Get detailed task info."""
    from app.services.resident_reasoner import build_task_detail

    job_svc = get_job_service()
    job = job_svc.get_job(task_id)
    if not job or job.type != "resident_task":
        raise HTTPException(404, "Úkol nenalezen")
    return build_task_detail(job, job_svc)


@router.post("/tasks/{task_id}/chat")
async def task_chat(task_id: str, req: MissionChatRequest) -> dict:
    """Chat about a specific task with full task context."""
    from app.services.llm_service import get_llm_service
    from app.services.resident_reasoner import build_task_chat_context

    job_svc = get_job_service()
    job = job_svc.get_job(task_id)
    if not job or job.type != "resident_task":
        raise HTTPException(404, "Úkol nenalezen")

    system_prompt = build_task_chat_context(job)
    chat_history = job.payload.get("chat_history", [])
    history_messages = [
        {"role": m["role"], "content": m["content"]} for m in chat_history[-20:]
    ]

    llm_svc = get_llm_service()
    reply, meta = await llm_svc.generate(
        message=req.message,
        mode="general",
        profile="general",
        history=[{"role": "system", "content": system_prompt}] + history_messages,
    )

    now = datetime.now().isoformat()
    chat_history.append({"role": "user", "content": req.message, "timestamp": now})
    chat_history.append({"role": "assistant", "content": reply, "timestamp": now})
    job.payload["chat_history"] = chat_history
    job_svc.update_job(job)

    return {"reply": reply, "meta": meta, "chat_history": chat_history}


# ── Autonomy mode ────────────────────────────────────────────


@router.get("/mode")
async def get_resident_mode() -> dict:
    """Get current resident autonomy mode with allowed actions."""
    from app.services.resident_agent import MODE_ALLOWED_ACTIONS

    settings = get_settings_service().load()
    mode = settings.get("resident_mode", "advisor")
    return {
        "mode": mode,
        "allowed_actions": sorted(MODE_ALLOWED_ACTIONS.get(mode, [])),
    }


@router.get("/mode-status")
async def get_mode_status() -> dict:
    """Comprehensive mode status: allowed/blocked actions, tiers, history, stats."""
    from app.services.resident_reasoner import build_mode_status

    settings = get_settings_service().load()
    mode = settings.get("resident_mode", "advisor")
    return build_mode_status(get_resident_agent(), mode)


@router.patch("/mode")
async def set_resident_mode(req: ResidentModeRequest) -> dict:
    """Set resident autonomy mode (observer/advisor/autonomous)."""
    from app.services.mode_audit_service import get_mode_audit_service

    svc = get_settings_service()
    prev_mode = svc.load().get("resident_mode", "advisor")
    svc.update({"resident_mode": req.mode})
    if prev_mode != req.mode:
        get_mode_audit_service().record_change(
            from_mode=prev_mode,
            to_mode=req.mode,
            changed_by="user",
            reason="API PATCH /resident/mode",
        )
    logger.info("Resident mode changed to: %s", req.mode)
    return {"mode": req.mode, "message": f"Režim změněn na {req.mode}"}


@router.post("/mode/pause")
async def pause_resident_mode() -> dict:
    """Panic / pause: immediately switch Resident to 'advisor' mode.

    Disables autonomous action execution without stopping the agent daemon.
    Always safe to call – never raises even if already in advisor/observer mode.
    """
    from app.services.mode_audit_service import get_mode_audit_service

    svc = get_settings_service()
    prev_mode = svc.load().get("resident_mode", "advisor")
    svc.update({"resident_mode": "advisor"})
    if prev_mode != "advisor":
        get_mode_audit_service().record_change(
            from_mode=prev_mode,
            to_mode="advisor",
            changed_by="user",
            reason="Panic/Pause button",
        )
    logger.warning("Resident PANIC/PAUSE – mode forced to advisor")
    return {
        "status": "ok",
        "mode": "advisor",
        "message": "Autonomie pozastavena – přepnuto na advisor",
    }


@router.post("/mode/autonomous")
async def enable_resident_autonomous() -> dict:
    """Enable autonomous mode (safe actions may run without confirmation)."""
    from app.services.mode_audit_service import get_mode_audit_service

    svc = get_settings_service()
    prev_mode = svc.load().get("resident_mode", "advisor")
    svc.update({"resident_mode": "autonomous"})
    if prev_mode != "autonomous":
        get_mode_audit_service().record_change(
            from_mode=prev_mode,
            to_mode="autonomous",
            changed_by="user",
            reason="Enable autonomous button",
        )
    logger.info("Resident autonomous mode enabled")
    return {"status": "ok", "mode": "autonomous", "message": "Autonomous mód zapnut"}


# ── Suggestions ──────────────────────────────────────────────


@router.get("/suggestions")
async def get_suggestions(limit: int = Query(default=10, ge=1, le=50)) -> dict:
    """Get recent suggestions from the resident reasoner."""
    suggestions = get_resident_agent().get_suggestions(limit=limit)
    return {"suggestions": suggestions, "count": len(suggestions)}


@router.post("/suggestions/{suggestion_id}/accept")
async def accept_suggestion(suggestion_id: str, action_id: str = Query(...)) -> dict:
    """Accept a suggested action and create a job for it."""
    mode = get_settings_service().load().get("resident_mode", "advisor")
    if mode == "observer":
        raise HTTPException(400, "V režimu observer nelze přijímat návrhy")

    job_id = await get_resident_agent().accept_suggestion_action(suggestion_id, action_id)
    if job_id is None:
        raise HTTPException(404, "Návrh nebo akce nenalezena")
    return {"job_id": job_id, "status": "queued", "message": "Akce přijata a zařazena do fronty"}


# ── Missions ─────────────────────────────────────────────────


@router.post("/missions")
async def create_mission(body: Dict[str, Any]) -> dict:
    """Create a new mission – the resident will plan and execute steps."""
    from app.services.resident_reasoner import get_resident_reasoner

    goal = body.get("goal", "")
    context = body.get("context", "")
    if not goal:
        raise HTTPException(400, "Field 'goal' is required")

    reasoner = get_resident_reasoner()
    steps = await reasoner.plan_mission(goal, context)
    if not steps:
        raise HTTPException(
            500,
            "Nepodařilo se naplánovat misi (LLM nedostupné nebo nevrátilo platný plán)",
        )

    job_svc = get_job_service()
    plan = {
        "goal": goal,
        "steps": [s.model_dump() for s in steps],
        "current_step": 0,
        "status": "planned",
    }
    job = job_svc.create_job(
        type="resident_mission",
        title=goal,
        input_summary=context,
        payload={"plan": plan},
        priority="normal",
    )
    return {
        "mission_id": job.id,
        "goal": goal,
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
        missions.append(
            {
                "id": mj.id,
                "goal": plan.get("goal", mj.title),
                "status": plan.get("status", mj.status),
                "current_step": plan.get("current_step", 0),
                "total_steps": len(plan.get("steps", [])),
                "progress": mj.progress,
                "created_at": mj.created_at,
            }
        )
    return {"missions": missions, "count": len(missions)}


@router.get("/missions/{mission_id}")
async def get_mission_detail(mission_id: str) -> dict:
    """Get detailed mission info including step statuses and enriched step results."""
    from app.services.resident_reasoner import build_mission_detail

    job_svc = get_job_service()
    job = job_svc.get_job(mission_id)
    if not job or job.type != "resident_mission":
        raise HTTPException(404, "Mise nenalezena")
    return build_mission_detail(job, job_svc)


@router.post("/missions/{mission_id}/chat")
async def mission_chat(mission_id: str, req: MissionChatRequest) -> dict:
    """Chat about a specific mission with full mission context."""
    from app.services.llm_service import get_llm_service
    from app.services.resident_reasoner import build_mission_chat_context

    job_svc = get_job_service()
    job = job_svc.get_job(mission_id)
    if not job or job.type != "resident_mission":
        raise HTTPException(404, "Mise nenalezena")

    system_prompt = build_mission_chat_context(job)
    chat_history = job.payload.get("chat_history", [])
    history_messages = [
        {"role": m["role"], "content": m["content"]} for m in chat_history[-20:]
    ]

    llm_svc = get_llm_service()
    reply, meta = await llm_svc.generate(
        message=req.message,
        mode="general",
        profile="general",
        history=[{"role": "system", "content": system_prompt}] + history_messages,
    )

    now = datetime.now().isoformat()
    chat_history.append({"role": "user", "content": req.message, "timestamp": now})
    chat_history.append({"role": "assistant", "content": reply, "timestamp": now})
    job.payload["chat_history"] = chat_history
    job_svc.update_job(job)

    return {"reply": reply, "meta": meta, "chat_history": chat_history}


# ── Resident Plan → Confirm → Execute ────────────────────────


@router.post("/plan")
async def create_plan(req: PlanCreateRequest) -> dict:
    """Generate a structured plan via LLM – NO execution, draft only."""
    from app.models.resident_models import PlanStep, ResidentPlan
    from app.services.resident_reasoner import get_resident_reasoner
    from app.services.resident_plan_service import get_resident_plan_service

    reasoner = get_resident_reasoner()
    plan_svc = get_resident_plan_service()

    result = await reasoner.generate_plan(
        req.goal, req.context if req.context else None
    )
    if result is None:
        raise HTTPException(
            500,
            "Nepodařilo se vygenerovat plán (LLM nedostupné nebo nevrátilo platný plán)",
        )

    steps = [PlanStep(**s) for s in result["steps"]]
    plan = ResidentPlan(
        goal=req.goal,
        steps=steps,
        raw_markdown=result.get("raw_markdown", ""),
        meta={
            "source": "resident_reasoner",
            "model": result.get("model", ""),
            "cost_estimate": None,
            "context": req.context,
        },
    )
    plan_svc.save_plan(plan)

    logger.info("Plan created: %s (%d steps)", plan.plan_id, len(steps))
    return plan.model_dump()


@router.get("/plan/{plan_id}")
async def get_plan(plan_id: str) -> dict:
    """Retrieve a stored plan by ID."""
    from app.services.resident_plan_service import get_resident_plan_service

    plan = get_resident_plan_service().get_plan(plan_id)
    if plan is None:
        raise HTTPException(404, "Plán nenalezen")
    return plan.model_dump()


@router.get("/plans")
async def list_plans(limit: int = Query(default=20, ge=1, le=100)) -> dict:
    """List recent resident plans."""
    from app.services.resident_plan_service import get_resident_plan_service

    plans = get_resident_plan_service().list_plans(limit=limit)
    return {"plans": [p.model_dump() for p in plans], "count": len(plans)}


@router.get("/plans/pending")
async def list_pending_plans() -> dict:
    """List plans awaiting user approval (status = pending_approval)."""
    from app.services.resident_plan_service import get_resident_plan_service

    plans = get_resident_plan_service().list_plans(status="pending_approval", limit=50)
    return {"plans": [p.model_dump() for p in plans], "count": len(plans)}


@router.post("/plan/{plan_id}/approve")
async def approve_plan(plan_id: str, req: Optional[PlanApproveRequest] = None) -> dict:
    """Approve a plan and start execution as a background job."""
    from app.services.resident_plan_service import get_resident_plan_service

    plan_svc = get_resident_plan_service()
    job_svc = get_job_service()

    plan = plan_svc.get_plan(plan_id)
    if plan is None:
        raise HTTPException(404, "Plán nenalezen")

    if plan.status not in ("draft", "pending_approval", "failed"):
        raise HTTPException(400, f"Plán nelze schválit – aktuální stav: {plan.status}")

    approved_steps = None
    mode = "sequential"
    if req is not None:
        approved_steps = req.approved_steps
        mode = req.mode

    plan.status = "approved"
    plan.approved_steps = approved_steps
    plan.execution_mode = mode
    plan_svc.save_plan(plan)

    job = job_svc.create_job(
        type="resident_plan_execute",
        title=f"Plán: {plan.goal[:80]}",
        input_summary=plan.goal,
        payload={"plan_id": plan_id, "approved_steps": approved_steps, "mode": mode},
        priority="normal",
    )

    plan.job_id = job.id
    plan_svc.save_plan(plan)

    logger.info("Plan %s approved → job %s", plan_id, job.id)
    return JSONResponse(
        status_code=202,
        content={"status": "accepted", "job_id": job.id, "plan_id": plan_id},
    )


@router.post("/plan/{plan_id}/reject")
async def reject_plan(plan_id: str, req: Optional[PlanRejectRequest] = None) -> dict:
    """Reject a pending_approval plan."""
    from app.services.resident_plan_service import get_resident_plan_service

    reason = req.reason if req else ""
    plan = get_resident_plan_service().reject_plan(plan_id, reason=reason)
    if plan is None:
        raise HTTPException(404, "Plán nenalezen nebo není ve stavu pending_approval")
    logger.info("Plan %s rejected (reason=%s)", plan_id, reason[:100])
    return {"status": "rejected", "plan_id": plan_id, "reason": reason}


# ── History & Logs ────────────────────────────────────────────


@router.get("/history")
async def get_agent_history(limit: int = Query(default=20, ge=1, le=200)) -> dict:
    """Get recent cycle history."""
    history = get_resident_agent().get_cycle_history(limit=limit)
    return {"history": history, "count": len(history)}


@router.get("/logs")
async def get_agent_logs(
    level: Optional[str] = Query(default=None, pattern=r"^(INFO|WARN|ERROR)$"),
    cycle: Optional[str] = Query(default=None),
    limit: int = Query(default=100, ge=1, le=1000),
) -> dict:
    """Get filterable structured log entries."""
    logs = get_resident_agent().get_logs(level=level, cycle=cycle, limit=limit)
    return {"logs": logs, "count": len(logs)}


@router.delete("/logs")
async def clear_agent_logs() -> dict:
    """Clear all agent log entries."""
    count = get_resident_agent().clear_logs()
    return {"status": "ok", "cleared": count}


# ── Pause / Resume / Run Now / Reset ─────────────────────────


@router.post("/pause")
async def agent_pause() -> dict:
    """Pause the resident agent (stays running, skips ticks)."""
    return await get_resident_agent().pause()


@router.post("/resume")
async def agent_resume() -> dict:
    """Resume a paused resident agent."""
    return await get_resident_agent().resume()


@router.post("/run-now")
async def agent_run_now() -> dict:
    """Trigger an immediate cycle."""
    try:
        return await get_resident_agent().run_now()
    except Exception as exc:
        logger.error("Run-now failed: %s", exc)
        raise HTTPException(500, f"Run-now failed: {exc}")


@router.post("/reset")
async def agent_reset() -> dict:
    """Reset agent counters, history, and memory."""
    return await get_resident_agent().reset()


@router.post("/restart")
async def agent_restart() -> dict:
    """Restart the resident agent: stop → reload config → start."""
    agent = get_resident_agent()
    try:
        if agent.get_state().get("is_running"):
            await agent.stop()
            await asyncio.sleep(1)
        await agent.start()
        logger.info("Resident agent restarted")
        return {"status": "restarted", "message": "Agent restartován s novým nastavením."}
    except Exception as exc:
        logger.error("Resident agent restart failed: %s", exc)
        raise HTTPException(500, f"Restart selhal: {exc}")


# ── Agent Settings ────────────────────────────────────────────


@router.get("/agent-settings")
async def get_agent_settings() -> dict:
    """Get current agent runtime settings."""
    return get_resident_agent().get_agent_settings()


@router.patch("/agent-settings")
async def patch_agent_settings(req: AgentSettingsPatch) -> dict:
    """Update agent runtime settings (interval, model, quiet hours, etc.)."""
    updates = req.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(400, "No settings to update")
    return get_resident_agent().update_agent_settings(updates)


# ── Agent Memory ──────────────────────────────────────────────


@router.get("/agent-memory")
async def get_agent_memory(limit: int = Query(default=50, ge=1, le=200)) -> dict:
    """Get agent memory entries."""
    items = await get_resident_agent().get_agent_memory(limit=limit)
    return {"memory": items, "count": len(items)}


@router.delete("/agent-memory")
async def clear_agent_memory() -> dict:
    """Clear all resident agent memory entries."""
    return await get_resident_agent().clear_agent_memory()


@router.get("/agent-memory/search")
async def search_agent_memory(
    q: str = Query(..., description="Search query (min 3 chars)"),
    limit: int = Query(default=10, ge=1, le=50),
) -> dict:
    """Full-text search over agent memory entries."""
    if len(q) < 3:
        raise HTTPException(status_code=400, detail="Query must be at least 3 characters")
    try:
        from app.services.memory_service import get_memory_service

        mem = get_memory_service()
        records = await mem.search_memory(q, top_k=limit)
        results = [
            {
                "id": r.id,
                "content": getattr(r, "text", getattr(r, "content", str(r))),
                "tags": list(getattr(r, "tags", [])),
                "created_at": getattr(r, "created_at", None),
                "relevance_score": round(max(0.0, 1.0 - i * 0.05), 2),
            }
            for i, r in enumerate(records)
        ]
        return {"results": results, "count": len(results), "query": q}
    except Exception as exc:
        logger.error("Memory search failed: %s", exc)
        return {"results": [], "count": 0, "query": q}


# ── Pending Actions (advisor mode) ───────────────────────────


@router.get("/pending-actions")
async def get_pending_actions() -> dict:
    """Get list of pending actions awaiting user approval (advisor mode)."""
    actions = get_resident_agent().get_pending_actions()
    pending = [a for a in actions if a.get("status") == "pending"]
    return {"actions": pending, "count": len(pending)}


@router.post("/pending-actions/{action_id}/approve")
async def approve_pending_action(action_id: str) -> dict:
    """Approve a pending action."""
    action = get_resident_agent().approve_action(action_id)
    if action is None:
        raise HTTPException(404, "Akce nenalezena nebo již zpracována")
    return {"status": "approved", "action_id": action_id, "action": action}


@router.post("/pending-actions/{action_id}/reject")
async def reject_pending_action(action_id: str) -> dict:
    """Reject a pending action."""
    action = get_resident_agent().reject_action(action_id)
    if action is None:
        raise HTTPException(404, "Akce nenalezena nebo již zpracována")
    return {"status": "rejected", "action_id": action_id}


# ── Mode History ──────────────────────────────────────────────


@router.get("/mode-history")
async def get_mode_history(limit: int = Query(default=20, ge=1, le=50)) -> dict:
    """Get recent mode change history."""
    from app.services.mode_audit_service import get_mode_audit_service

    history = get_mode_audit_service().get_history(limit=limit)
    return {"history": history, "count": len(history)}


# ── Curiosity backlog ────────────────────────────────────────


@router.get("/curiosity")
async def get_curiosity_items(
    status: Optional[str] = Query(
        default=None, description="Filter by status: open, in_progress, done, dropped"
    ),
    limit: int = Query(default=50, ge=1, le=200),
) -> dict:
    """List curiosity backlog items for debugging."""
    from app.services.resident_curiosity import get_curiosity_service

    items = get_curiosity_service().list_items(status=status, limit=limit)
    return {
        "items": [
            {
                "id": i.id,
                "kind": i.kind,
                "source": i.source,
                "title": i.title,
                "priority": i.priority,
                "status": i.status,
                "dedup_key": i.dedup_key,
                "updated_at": i.updated_at,
            }
            for i in items
        ],
        "count": len(items),
    }


@router.get("/thoughts")
async def get_thought_log(limit: int = Query(default=50, ge=1, le=200)) -> dict:
    """Return recent thought/decision memory entries for debugging."""
    from app.services.resident_reasoner import build_thought_log

    return await build_thought_log(limit=limit)


# ── Reflections ──────────────────────────────────────────────


@router.get("/reflections")
async def get_reflections(limit: int = Query(default=20, ge=1, le=100)) -> dict:
    """Get recent reflections from completed resident jobs."""
    reflections = get_resident_agent().get_reflections(limit=limit)
    return {"reflections": reflections, "count": len(reflections)}


# ── Tool-augmented reasoning ────────────────────────────────


@router.get("/reasoning")
async def get_reasoning_cycles(limit: int = Query(default=10, ge=1, le=50)) -> dict:
    """Get recent tool-augmented reasoning cycles."""
    from app.services.resident_reasoner import get_reasoning_cycles

    cycles = get_reasoning_cycles(limit=limit)
    return {"cycles": [c.model_dump() for c in cycles], "count": len(cycles)}


@router.post("/reasoning")
async def trigger_reasoning_cycle() -> dict:
    """Trigger a new tool-augmented reasoning cycle."""
    from app.services.resident_reasoner import (
        get_resident_reasoner,
        store_reasoning_cycle,
    )

    try:
        cycle = await get_resident_reasoner().reason_with_tools()
    except Exception as exc:
        logger.error("Reasoning cycle failed: %s", exc)
        raise HTTPException(500, f"Reasoning cycle selhal: {exc}")

    store_reasoning_cycle(cycle)
    return cycle.model_dump()


# ── Mission proposals ────────────────────────────────────────


@router.get("/proposals")
async def get_proposals(status: Optional[str] = Query(default=None)) -> dict:
    """Get mission proposals (optionally filtered by status)."""
    proposals = get_resident_agent().get_proposals(status=status)
    return {"proposals": proposals, "count": len(proposals)}


@router.post("/proposals/generate")
async def generate_proposals() -> dict:
    """Trigger the agent to generate new mission proposals."""
    try:
        proposals = await get_resident_agent().propose_missions()
        return {"proposals": proposals, "count": len(proposals)}
    except Exception as exc:
        logger.error("Proposal generation failed: %s", exc)
        raise HTTPException(500, f"Generování návrhů selhalo: {exc}")


@router.post("/proposals/{proposal_id}/approve")
async def approve_proposal(proposal_id: str) -> dict:
    """Approve a proposed mission and queue it for execution."""
    job_id = await get_resident_agent().approve_proposal(proposal_id)
    if job_id is None:
        raise HTTPException(404, "Návrh nenalezen nebo již zpracován")
    return {"status": "approved", "job_id": job_id, "message": "Mise schválena a zařazena do fronty"}


@router.post("/proposals/{proposal_id}/reject")
async def reject_proposal(proposal_id: str) -> dict:
    """Reject a proposed mission."""
    ok = get_resident_agent().reject_proposal(proposal_id)
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
                thought = await asyncio.wait_for(
                    agent.thought_queue.get(), timeout=30.0
                )
                event_type = thought.get("type", "thinking")
                data = json.dumps(thought, ensure_ascii=False)
                yield f"event: {event_type}\ndata: {data}\n\n"
            except asyncio.TimeoutError:
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


# ── Control Room: Mission Templates ───────────────────────────


@router.get("/templates")
async def get_templates() -> List[Dict[str, Any]]:
    """List available Control Room mission templates."""
    from app.services.resident_reasoner import MISSION_TEMPLATES

    return MISSION_TEMPLATES


@router.post("/run-template/{template_id}")
async def run_template(
    template_id: str, req: MissionTemplateRequest = MissionTemplateRequest()
) -> dict:
    """Queue a resident task from a predefined mission template."""
    from app.services.resident_reasoner import TEMPLATE_PROMPTS

    if template_id not in TEMPLATE_PROMPTS:
        raise HTTPException(status_code=404, detail=f"Template '{template_id}' nenalezen")

    prompt = TEMPLATE_PROMPTS[template_id]
    if req.context:
        prompt = f"{prompt}\n\nKontext: {req.context}"

    job_svc = get_job_service()
    job = job_svc.create_job(
        type="resident_task",
        title=template_id,
        input_summary=prompt,
        payload={},
        priority="normal",
    )
    return {"job_id": job.id, "status": "queued", "template_id": template_id, "title": template_id}


# ── Control Room: Debug Export ─────────────────────────────────


@router.post("/export-debug")
async def export_debug() -> JSONResponse:
    """Export a debug snapshot: resident state + recent jobs + logs + config summary."""
    from app.services.resident_reasoner import build_debug_snapshot

    agent = get_resident_agent()
    job_svc = get_job_service()
    settings = get_settings_service().load()

    snapshot = build_debug_snapshot(agent, job_svc, settings)
    return JSONResponse(
        content=snapshot,
        headers={"Content-Disposition": "attachment; filename=debug.json"},
    )
