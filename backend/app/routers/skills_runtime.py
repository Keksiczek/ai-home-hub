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
        raise HTTPException(
            400, f"Skill '{req.skill_name}' has no method '{req.method}'"
        )

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


# Predefined test cases for each skill
_SKILL_TESTS: Dict[str, Dict[str, Any]] = {
    "code_exec": {"method": "run", "params": {"code": "print(1+1)"}},
    "web_search": {"method": "run", "params": {"query": "ollama", "max_results": 3}},
    "calendar": {"method": "get_today", "params": {}},
    "weather": {"method": "run", "params": {"location": "Nymburk"}},
    "shell": {"method": "run", "params": {"command": "whoami"}},
    "vision": {
        "method": "analyze",
        "params": {"image_path": "/tmp/test.png", "prompt": "test"},
    },
    "timer": {"method": "list_timers", "params": {}},
    "calculator": {"method": "run", "params": {"expression": "85 * 0.95 * 0.99"}},
    "clipboard": {"method": "read", "params": {}},
    "notify": {
        "method": "send",
        "params": {"title": "Test", "message": "Skill test OK"},
    },
    "http_fetch": {"method": "get", "params": {"url": "https://httpbin.org/get"}},
}


@router.post("/test/{skill_name}")
async def test_skill(skill_name: str) -> Dict[str, Any]:
    """Run a predefined test for a specific skill and return the result."""
    all_skills = get_all_skills()
    skill = all_skills.get(skill_name)
    if not skill:
        raise HTTPException(404, f"Skill '{skill_name}' not found")

    test_case = _SKILL_TESTS.get(skill_name)
    if not test_case:
        return {"success": False, "error": f"No test defined for '{skill_name}'"}

    method_name = test_case["method"]
    params = test_case["params"]

    method = getattr(skill, method_name, None)
    if method is None or not callable(method):
        return {"success": False, "error": f"Method '{method_name}' not found on skill"}

    try:
        result = await method(**params)
        has_error = isinstance(result, dict) and "error" in result
        return {
            "success": not has_error,
            "skill": skill_name,
            "output": result,
        }
    except Exception as exc:
        return {"success": False, "skill": skill_name, "error": str(exc)}
