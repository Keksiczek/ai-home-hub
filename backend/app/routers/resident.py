"""Resident agent API endpoints – includes brain orchestrator features."""

import asyncio
import json
import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import JSONResponse, StreamingResponse
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


class MissionChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


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
    """Get resident agent dashboard data for the control-room UX.

    Extends the base agent data with:
    - ``health``: startup component health from ``/api/system/health``
    - ``metrics_24h``: cycle success rate, count, and avg duration
    - enriched ``alerts`` (includes component health warnings)
    """
    agent = get_resident_agent()
    data = agent.get_dashboard_data()

    # Attach startup component health
    settings_svc = get_settings_service()
    health = settings_svc.global_health
    data["health"] = health

    # Build metrics_24h from stats_24h if available
    stats = data.get("stats_24h", {})
    total = stats.get("total", 0)
    succeeded = stats.get("succeeded", 0)
    avg_duration = stats.get("avg_duration_s", None)
    success_rate = round(succeeded / total, 4) if total else 0.0
    data["metrics_24h"] = {
        "cycles_total": total,
        "success_rate": success_rate,
        "avg_cycle_duration_s": avg_duration,
    }

    # Enrich alerts with health-based warnings
    alerts: list = list(data.get("alerts", []))
    if health.get("ollama") == "unavailable":
        alerts.append("Ollama degraded – LLM features unavailable")
    if health.get("kb") == "degraded":
        alerts.append("Knowledge Base degraded")
    if health.get("jobs_db") == "error":
        alerts.append("Jobs DB error – task queue unavailable")
    data["alerts"] = alerts

    return data


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


# ── Task detail & chat ──────────────────────────────────────


@router.get("/tasks/{task_id}")
async def get_task_detail(task_id: str) -> dict:
    """Get detailed task info."""
    job_svc = get_job_service()
    job = job_svc.get_job(task_id)
    if not job or job.type != "resident_task":
        raise HTTPException(404, "Úkol nenalezen")

    output = ""
    if job.meta and job.meta.get("result"):
        output = str(job.meta["result"])
    elif job.meta and job.meta.get("reflection"):
        r = job.meta["reflection"]
        points = r.get("points", [])
        if points:
            output = "\n".join(f"- {p}" for p in points)
            if r.get("recommendation"):
                output += f"\n\nDoporučení: {r['recommendation']}"

    chat_history = job.payload.get("chat_history", [])

    return {
        "id": job.id,
        "title": job.title,
        "description": job.input_summary,
        "status": job.status,
        "progress": job.progress,
        "output": output,
        "created_at": job.created_at,
        "started_at": job.started_at,
        "finished_at": job.finished_at,
        "last_error": job.last_error,
        "chat_history": chat_history,
        "mission_id": job.payload.get("mission_id"),
        "step_index": job.payload.get("step_index"),
    }


@router.post("/tasks/{task_id}/chat")
async def task_chat(task_id: str, req: MissionChatRequest) -> dict:
    """Chat about a specific task with full task context."""
    from datetime import datetime
    from app.services.llm_service import get_llm_service, get_date_context

    job_svc = get_job_service()
    job = job_svc.get_job(task_id)
    if not job or job.type != "resident_task":
        raise HTTPException(404, "Úkol nenalezen")

    task_output = ""
    if job.meta and job.meta.get("result"):
        task_output = str(job.meta["result"])[:2000]

    system_prompt = (
        f"{get_date_context()}\n"
        f'Jsi AI agent který provedl úkol: "{job.title}"\n\n'
        f"Kontext úkolu:\n"
        f"- Popis: {job.input_summary or 'žádný'}\n"
        f"- Status: {job.status}\n"
        f"{'- Výstup: ' + task_output if task_output else '- Úkol nemá textový výstup.'}\n"
        f"{'- Chyba: ' + job.last_error if job.last_error else ''}\n\n"
        f"Odpovídej na otázky uživatele o tomto konkrétním úkolu. "
        f"Buď konkrétní. Odpovídej česky."
    )

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

    return {
        "reply": reply,
        "meta": meta,
        "chat_history": chat_history,
    }


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
    from app.services.resident_agent import (
        MODE_ALLOWED_ACTIONS,
        ACTION_TIERS,
        ALLOWED_ACTIONS,
    )
    from app.services.mode_audit_service import get_mode_audit_service

    settings = get_settings_service().load()
    mode = settings.get("resident_mode", "advisor")
    agent = get_resident_agent()

    allowed = set(MODE_ALLOWED_ACTIONS.get(mode, set()))
    all_known = set(ALLOWED_ACTIONS)
    for tier_actions in ACTION_TIERS.values():
        all_known.update(tier_actions)
    blocked = sorted(all_known - allowed)

    # Pending suggestions count (only relevant in advisor mode)
    suggestions_pending = 0
    try:
        raw = agent.get_suggestions(limit=50)
        for s in raw:
            executed_ids = set(s.get("executed_action_ids", []))
            for a in s.get("actions", []):
                if a.get("id") not in executed_ids:
                    suggestions_pending += 1
    except Exception:
        pass

    mode_descriptions = {
        "observer": "Agent pouze sleduje systém, nevolá LLM, nezpracovává tasky",
        "advisor": "Agent zpracovává tasky a generuje návrhy, ale neprovádí nic automaticky",
        "autonomous": "Agent jedná samostatně v rámci nastavených limitů a cooldownů",
    }

    audit_svc = get_mode_audit_service()

    return {
        "current_mode": mode,
        "allowed_actions": sorted(allowed),
        "blocked_actions": blocked,
        "action_tiers": {tier: list(acts) for tier, acts in ACTION_TIERS.items()},
        "mode_descriptions": mode_descriptions,
        "guardrail_status": agent.get_guardrail_status(),
        "mode_history": audit_svc.get_history(limit=10),
        "stats": {
            "blocked_actions_since_start": agent._blocked_actions_since_start,
            "suggestions_pending_approval": suggestions_pending,
        },
    }


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
    """Enable autonomous mode (safe actions may run without confirmation).

    Note: destructive actions (delete, overwrite) always require confirmation
    regardless of this setting – that logic lives in the job worker, not here.
    """
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

    return {
        "job_id": job_id,
        "status": "queued",
        "message": "Akce přijata a zařazena do fronty",
    }


# ── Missions ─────────────────────────────────────────────────


@router.post("/missions")
async def create_mission(req: MissionCreateRequest) -> dict:
    """Create a new mission – the resident will plan and execute steps."""
    from app.services.resident_reasoner import get_resident_reasoner

    reasoner = get_resident_reasoner()
    steps = await reasoner.plan_mission(req.goal, req.context)
    if not steps:
        raise HTTPException(
            500,
            "Nepodařilo se naplánovat misi (LLM nedostupné nebo nevrátilo platný plán)",
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
    """Get detailed mission info including step statuses, output, and enriched step results."""
    job_svc = get_job_service()
    job = job_svc.get_job(mission_id)
    if not job or job.type != "resident_mission":
        raise HTTPException(404, "Mise nenalezena")

    plan = job.payload.get("plan", {})
    steps = plan.get("steps", [])

    # Enrich steps with sub-job results if available
    enriched_steps = []
    for i, step in enumerate(steps):
        enriched = {
            "number": i + 1,
            "title": step.get("title", ""),
            "description": step.get("description", ""),
            "status": step.get("status", "pending"),
            "result_summary": step.get("result_summary", ""),
            "job_id": step.get("job_id"),
        }
        # Try to get richer result from the sub-job
        sub_job_id = step.get("job_id")
        if sub_job_id:
            sub_job = job_svc.get_job(sub_job_id)
            if sub_job:
                enriched["status"] = sub_job.status
                if sub_job.meta and sub_job.meta.get("result"):
                    enriched["result_summary"] = str(sub_job.meta["result"])[:500]
                elif sub_job.last_error:
                    enriched["result_summary"] = f"Chyba: {sub_job.last_error}"
        enriched_steps.append(enriched)

    # Build mission output from reflection or aggregated step results
    output = plan.get("output", "")
    if not output and job.meta and job.meta.get("reflection"):
        reflection = job.meta["reflection"]
        points = reflection.get("points", [])
        if points:
            output = "## Reflexe mise\n\n" + "\n".join(f"- {p}" for p in points)
            if reflection.get("recommendation"):
                output += f"\n\n**Doporučení:** {reflection['recommendation']}"

    # Get chat history for this mission
    chat_history = job.payload.get("chat_history", [])

    return {
        "id": job.id,
        "goal": plan.get("goal", job.title),
        "status": plan.get("status", job.status),
        "steps": enriched_steps,
        "current_step": plan.get("current_step", 0),
        "total_steps": len(steps),
        "progress": job.progress,
        "output": output,
        "created_at": job.created_at,
        "started_at": job.started_at,
        "finished_at": job.finished_at,
        "chat_history": chat_history,
    }


@router.post("/missions/{mission_id}/chat")
async def mission_chat(mission_id: str, req: MissionChatRequest) -> dict:
    """Chat about a specific mission with full mission context."""
    from datetime import datetime
    from app.services.llm_service import get_llm_service, get_date_context

    job_svc = get_job_service()
    job = job_svc.get_job(mission_id)
    if not job or job.type != "resident_mission":
        raise HTTPException(404, "Mise nenalezena")

    plan = job.payload.get("plan", {})
    steps = plan.get("steps", [])
    mission_output = plan.get("output", "")

    # Build steps summary
    steps_summary = "\n".join(
        f"  Krok {i+1}: {s.get('title', '')} — {s.get('status', 'pending')}"
        + (f" → {s.get('result_summary', '')}" if s.get("result_summary") else "")
        for i, s in enumerate(steps)
    )

    # Build reflection context if available
    reflection_ctx = ""
    if job.meta and job.meta.get("reflection"):
        r = job.meta["reflection"]
        points = r.get("points", [])
        if points:
            reflection_ctx = "\nReflexe:\n" + "\n".join(f"- {p}" for p in points)
            if r.get("recommendation"):
                reflection_ctx += f"\nDoporučení: {r['recommendation']}"

    system_prompt = (
        f"{get_date_context()}\n"
        f"Jsi AI agent který právě dokončil misi: \"{plan.get('goal', job.title)}\"\n\n"
        f"Kontext mise:\n"
        f"- Status: {plan.get('status', job.status)}\n"
        f"- Počet kroků: {len(steps)}\n"
        f"- Kroky které jsi provedl:\n{steps_summary}\n"
        f"{reflection_ctx}\n"
        f"{'- Výstup mise: ' + mission_output if mission_output else '- Mise nemá textový výstup.'}\n\n"
        f"Odpovídej na otázky uživatele o této konkrétní misi. "
        f"Vysvětluj své rozhodnutí, metodologii a výsledky. "
        f"Buď konkrétní a odkazuj se na skutečné kroky které jsi provedl. "
        f"Odpovídej česky."
    )

    # Load existing chat history for this mission
    chat_history = job.payload.get("chat_history", [])
    history_messages = [
        {"role": m["role"], "content": m["content"]}
        for m in chat_history[-20:]  # Last 20 messages
    ]

    llm_svc = get_llm_service()
    reply, meta = await llm_svc.generate(
        message=req.message,
        mode="general",
        profile="general",
        history=[{"role": "system", "content": system_prompt}] + history_messages,
    )

    # Persist chat messages to job payload
    now = datetime.now().isoformat()
    chat_history.append({"role": "user", "content": req.message, "timestamp": now})
    chat_history.append({"role": "assistant", "content": reply, "timestamp": now})
    job.payload["chat_history"] = chat_history
    job_svc.update_job(job)

    return {
        "reply": reply,
        "meta": meta,
        "chat_history": chat_history,
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


@router.post("/restart")
async def agent_restart() -> dict:
    """Restart the resident agent: stop → reload config → start."""
    agent = get_resident_agent()
    try:
        if agent.get_state().get("is_running"):
            await agent.stop()
            await asyncio.sleep(1)
        result = await agent.start()
        logger.info("Resident agent restarted")
        return {
            "status": "restarted",
            "message": "Agent restartován s novým nastavením.",
        }
    except Exception as exc:
        logger.error("Resident agent restart failed: %s", exc)
        raise HTTPException(500, f"Restart selhal: {exc}")


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


@router.get("/agent-memory/search")
async def search_agent_memory(
    q: str = Query(..., description="Search query (min 3 chars)"),
    limit: int = Query(default=10, ge=1, le=50),
) -> dict:
    """Full-text search over agent memory entries."""
    if len(q) < 3:
        raise HTTPException(
            status_code=400, detail="Query must be at least 3 characters"
        )
    try:
        from app.services.memory_service import get_memory_service

        mem = get_memory_service()
        records = await mem.search_memory(q, top_k=limit)
        results = []
        for i, r in enumerate(records):
            results.append(
                {
                    "id": r.id,
                    "content": getattr(r, "text", getattr(r, "content", str(r))),
                    "tags": list(getattr(r, "tags", [])),
                    "created_at": getattr(r, "created_at", None),
                    "relevance_score": round(max(0.0, 1.0 - i * 0.05), 2),
                }
            )
        return {"results": results, "count": len(results), "query": q}
    except Exception as exc:
        logger.error("Memory search failed: %s", exc)
        return {"results": [], "count": 0, "query": q}


# ── Pending Actions (advisor mode) ───────────────────────────


@router.get("/pending-actions")
async def get_pending_actions() -> dict:
    """Get list of pending actions awaiting user approval (advisor mode)."""
    agent = get_resident_agent()
    actions = agent.get_pending_actions()
    # Only return pending ones to the UI
    pending = [a for a in actions if a.get("status") == "pending"]
    return {"actions": pending, "count": len(pending)}


@router.post("/pending-actions/{action_id}/approve")
async def approve_pending_action(action_id: str) -> dict:
    """Approve a pending action."""
    agent = get_resident_agent()
    action = agent.approve_action(action_id)
    if action is None:
        raise HTTPException(404, "Akce nenalezena nebo již zpracována")
    return {"status": "approved", "action_id": action_id, "action": action}


@router.post("/pending-actions/{action_id}/reject")
async def reject_pending_action(action_id: str) -> dict:
    """Reject a pending action."""
    agent = get_resident_agent()
    action = agent.reject_action(action_id)
    if action is None:
        raise HTTPException(404, "Akce nenalezena nebo již zpracována")
    return {"status": "rejected", "action_id": action_id}


# ── Mode History ──────────────────────────────────────────────


@router.get("/mode-history")
async def get_mode_history(limit: int = Query(default=20, ge=1, le=50)) -> dict:
    """Get recent mode change history."""
    from app.services.mode_audit_service import get_mode_audit_service

    audit_svc = get_mode_audit_service()
    history = audit_svc.get_history(limit=limit)
    return {"history": history, "count": len(history)}


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
    return {
        "status": "approved",
        "job_id": job_id,
        "message": "Mise schválena a zařazena do fronty",
    }


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
                thought = await asyncio.wait_for(
                    agent.thought_queue.get(), timeout=30.0
                )
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


# ── Control Room: Mission Templates ───────────────────────────


class MissionRequest(BaseModel):
    """Optional metadata for template runs."""

    context: str = ""


_TEMPLATES = [
    {
        "id": "daily_recap",
        "title": "📋 Denní rekapitulace",
        "desc": "Analyzuj dnešní KB/git/jobs a vytvoř shrnutí + todo na zítřek",
        "icon": "📋",
    },
    {
        "id": "stack_health",
        "title": "🖥️ Stack monitor",
        "desc": "Zkontroluj Ollama/disk/jobs/Tailscale a připrav report + doporučení",
        "icon": "🖥️",
    },
    {
        "id": "lean_assist",
        "title": "⚙️ Lean experiment",
        "desc": "Z metrik navrhni Lean experiment (hypothesis + test + success metric)",
        "icon": "⚙️",
    },
]

_TEMPLATE_PROMPTS: Dict[str, str] = {
    "daily_recap": "Analyzuj dnešní KB/git/jobs → shrnutí + todo zítra",
    "stack_health": "Check Ollama/disk/jobs/Tailscale → report + akce",
    "lean_assist": "Z metrik navrhni Lean experiment (hypothesis+test)",
}


@router.get("/templates")
async def get_templates() -> List[Dict[str, Any]]:
    """List available Control Room mission templates."""
    return _TEMPLATES


@router.post("/run-template/{template_id}")
async def run_template(
    template_id: str, req: MissionRequest = MissionRequest()
) -> dict:
    """Queue a resident task from a predefined mission template."""
    if template_id not in _TEMPLATE_PROMPTS:
        raise HTTPException(
            status_code=404, detail=f"Template '{template_id}' nenalezen"
        )

    prompt = _TEMPLATE_PROMPTS[template_id]
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
    return {
        "job_id": job.id,
        "status": "queued",
        "template_id": template_id,
        "title": template_id,
    }


# ── Control Room: Debug Export ─────────────────────────────────


@router.post("/export-debug")
async def export_debug() -> JSONResponse:
    """Export a debug snapshot: resident state + recent jobs + logs + config summary."""
    agent = get_resident_agent()
    job_svc = get_job_service()
    settings = get_settings_service().load()

    try:
        dashboard = agent.get_dashboard_data()
    except Exception:
        dashboard = {}

    try:
        jobs = job_svc.list_jobs(limit=10)
        recent_jobs = [
            {
                "id": j.id,
                "title": j.title,
                "status": j.status,
                "type": j.type,
                "created_at": j.created_at,
            }
            for j in jobs
        ]
    except Exception:
        recent_jobs = []

    try:
        logs_data = agent.get_logs(limit=50)
    except Exception:
        logs_data = []

    snapshot = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "resident_state": dashboard,
        "recent_jobs": recent_jobs,
        "logs": logs_data,
        "config_summary": {
            "resident_interval": settings.get("resident_interval", 900),
            "resident_mode": settings.get("resident_mode", "advisor"),
            "llm_provider": settings.get("llm", {}).get("provider", "unknown"),
        },
    }

    content = json.dumps(snapshot, ensure_ascii=False, indent=2, default=str)
    return JSONResponse(
        content=snapshot,
        headers={"Content-Disposition": "attachment; filename=debug.json"},
    )
