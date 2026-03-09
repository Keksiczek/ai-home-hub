"""Agent Skills router – filesystem-based skill discovery (SKILL.md)."""
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.agent_skills_service import get_agent_skills_service

router = APIRouter()


@router.get("/agent-skills", tags=["agent-skills"])
async def list_agent_skills() -> Dict[str, Any]:
    """Return the current catalog of discovered agent skills."""
    svc = get_agent_skills_service()
    catalog = svc.build_catalog()
    return {"skills": catalog, "count": len(catalog)}


@router.post("/agent-skills/refresh", tags=["agent-skills"])
async def refresh_agent_skills() -> Dict[str, Any]:
    """Re-scan skills directories and return updated catalog."""
    svc = get_agent_skills_service()
    catalog = svc.refresh()
    return {"skills": catalog, "count": len(catalog), "refreshed": True}


@router.get("/agent-skills/{name}", tags=["agent-skills"])
async def get_agent_skill_detail(name: str) -> Dict[str, Any]:
    """Return the SKILL.md content (without frontmatter) for a specific skill."""
    svc = get_agent_skills_service()
    skill = svc.get_skill_by_name(name)
    if not skill:
        raise HTTPException(status_code=404, detail=f"Agent skill '{name}' not found")
    instructions = svc.load_skill_instructions(skill.path)
    return {
        "name": skill.name,
        "description": skill.description,
        "path": skill.path,
        "instructions": instructions,
    }
