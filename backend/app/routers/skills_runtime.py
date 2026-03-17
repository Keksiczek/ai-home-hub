"""Skills Runtime router – execute and manage runtime agent skills."""
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.skills_runtime_service import (
    get_all_skills,
    get_enabled_skills,
    get_skill,
    get_skills_catalog,
)
from app.services.settings_service import get_settings_service

router = APIRouter(prefix="/skills-runtime", tags=["skills-runtime"])


class SkillExecRequest(BaseModel):
    skill_name: str
    method: str = "run"
    params: Dict[str, Any] = {}


class SkillToggleRequest(BaseModel):
    enabled_skills: List[str]


@router.get("/catalog")
async def list_runtime_skills() -> Dict[str, Any]:
    """Return catalog of all runtime skills with enabled status."""
    catalog = get_skills_catalog()
    return {"skills": catalog, "count": len(catalog)}


@router.post("/execute")
async def execute_skill(req: SkillExecRequest) -> Dict[str, Any]:
    """Execute a specific skill method with given parameters."""
    enabled = get_enabled_skills()
    skill = enabled.get(req.skill_name)
    if not skill:
        all_skills = get_all_skills()
        if req.skill_name in all_skills:
            raise HTTPException(400, f"Skill '{req.skill_name}' is disabled")
        raise HTTPException(404, f"Skill '{req.skill_name}' not found")

    method = getattr(skill, req.method, None)
    if method is None or not callable(method):
        raise HTTPException(400, f"Skill '{req.skill_name}' has no method '{req.method}'")

    try:
        result = await method(**req.params)
        return {"skill": req.skill_name, "method": req.method, "result": result}
    except TypeError as exc:
        raise HTTPException(400, f"Invalid parameters: {exc}")
    except Exception as exc:
        raise HTTPException(500, f"Skill execution failed: {exc}")


@router.post("/toggle")
async def toggle_skills(req: SkillToggleRequest) -> Dict[str, Any]:
    """Update the list of enabled skills in settings."""
    svc = get_settings_service()
    svc.update({"enabled_skills": req.enabled_skills})
    return {"enabled_skills": req.enabled_skills, "count": len(req.enabled_skills)}


@router.get("/enabled")
async def list_enabled_skills() -> Dict[str, Any]:
    """Return only currently enabled skills."""
    enabled = get_enabled_skills()
    return {
        "skills": [s.to_dict() for s in enabled.values()],
        "count": len(enabled),
    }
