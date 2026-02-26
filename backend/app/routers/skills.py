"""Skills router – CRUD for agent skills."""
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.skills_service import get_skills_service

router = APIRouter()


@router.get("/skills", tags=["skills"])
async def list_skills(
    tag: Optional[str] = Query(None, description="Filter by tag"),
    search: Optional[str] = Query(None, description="Search in name/description"),
) -> Dict[str, Any]:
    """List all skills with optional tag/search filtering."""
    svc = get_skills_service()
    skills = svc.list(tag=tag, search=search)
    return {"skills": skills, "count": len(skills)}


@router.post("/skills", tags=["skills"])
async def create_skill(body: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new skill."""
    svc = get_skills_service()
    required = ["name", "description"]
    for field in required:
        if field not in body:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    skill = svc.create(body)
    return skill


@router.put("/skills/{skill_id}", tags=["skills"])
async def update_skill(skill_id: str, body: Dict[str, Any]) -> Dict[str, Any]:
    """Update an existing skill."""
    svc = get_skills_service()
    updated = svc.update(skill_id, body)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Skill {skill_id} not found")
    return updated


@router.delete("/skills/{skill_id}", tags=["skills"])
async def delete_skill(skill_id: str) -> Dict[str, Any]:
    """Delete a skill."""
    svc = get_skills_service()
    success = svc.delete(skill_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Skill {skill_id} not found")
    return {"deleted": True, "skill_id": skill_id}


@router.get("/skills/tags", tags=["skills"])
async def list_tags() -> Dict[str, Any]:
    """List all unique skill tags."""
    svc = get_skills_service()
    tags = svc.get_tags()
    return {"tags": tags}
