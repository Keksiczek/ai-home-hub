"""Skills router – CRUD for agent skills + Marketplace API."""
import logging
import os
import time
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, HTTPException, Query

from app.services.skills_service import get_skills_service
from app.services.skills_runtime_service import (
    get_all_skill_manifests,
    get_skill_manifest,
    get_skills_by_category,
    enable_skill,
    disable_skill,
    update_skill_config,
    test_skill,
)
from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)
router = APIRouter()

# ── GitHub Discovery cache ─────────────────────────────────────
_discovery_cache: Dict[str, Any] = {}
_CACHE_TTL = 600  # 10 minutes


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


# ── Marketplace endpoints ──────────────────────────────────────

@router.get("/skills/marketplace", tags=["skills-marketplace"])
async def marketplace_list() -> Dict[str, Any]:
    """List all skill manifests for the marketplace."""
    manifests = get_all_skill_manifests()
    return {"skills": [m.model_dump() for m in manifests], "count": len(manifests)}


@router.get("/skills/marketplace/categories", tags=["skills-marketplace"])
async def marketplace_categories() -> Dict[str, Any]:
    """Dict category → [skill_ids]."""
    by_cat = get_skills_by_category()
    return {cat: [m.id for m in manifests] for cat, manifests in by_cat.items()}


@router.get("/skills/marketplace/discover", tags=["skills-marketplace"])
async def marketplace_discover(
    query: Optional[str] = Query(None, description="Search query"),
    sort: str = Query("stars", description="Sort by: stars, updated"),
) -> Dict[str, Any]:
    """Discover community skills on GitHub."""
    cache_key = f"{query or ''}:{sort}"
    now = time.time()

    if cache_key in _discovery_cache:
        cached = _discovery_cache[cache_key]
        if now - cached["timestamp"] < _CACHE_TTL:
            return {"results": cached["results"], "cached": True}

    # Get GitHub token from config or env
    github_token = os.environ.get("GITHUB_TOKEN", "")
    if not github_token:
        try:
            settings = get_settings_service().load()
            github_token = settings.get("skills_config", {}).get("github_ci_status", {}).get("github_token", "")
        except Exception:
            pass

    headers = {"Accept": "application/vnd.github.v3+json"}
    if github_token:
        headers["Authorization"] = f"token {github_token}"

    all_results: Dict[str, dict] = {}

    # Primary queries
    search_queries = []
    if query:
        search_queries.append(f"{query}+topic:ai-home-hub-skill")
    else:
        search_queries.append("ai-home-hub skill ollama fastapi")

    # Fallback queries
    search_queries.extend([
        "topic:ollama-skill",
        "topic:openai-skill",
        "ai agent skill python fastapi",
    ])

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            for sq in search_queries:
                try:
                    resp = await client.get(
                        "https://api.github.com/search/repositories",
                        params={"q": sq, "sort": sort, "per_page": 10},
                        headers=headers,
                    )
                    if resp.status_code != 200:
                        continue
                    data = resp.json()
                    for item in data.get("items", []):
                        repo_id = f"{item['owner']['login']}/{item['name']}"
                        if repo_id in all_results:
                            continue
                        topics = item.get("topics", [])
                        language = (item.get("language") or "").lower()
                        compatible = (
                            language == "python"
                            or "python" in topics
                            or "fastapi" in topics
                        )
                        all_results[repo_id] = {
                            "id": repo_id,
                            "name": item["name"],
                            "description": item.get("description") or "",
                            "stars": item.get("stargazers_count", 0),
                            "url": item.get("html_url", ""),
                            "topics": topics,
                            "language": item.get("language") or "",
                            "updated_at": item.get("updated_at", ""),
                            "install_hint": "Zkopíruj handler do backend/app/services/skills_runtime_service.py",
                            "compatible": compatible,
                        }
                except Exception:
                    continue

        results = sorted(all_results.values(), key=lambda x: x["stars"], reverse=True)[:30]

        _discovery_cache[cache_key] = {"results": results, "timestamp": now}
        return {"results": results, "cached": False}

    except Exception as exc:
        logger.error("GitHub discovery error: %s", exc)
        return {"error": str(exc), "results": []}


@router.get("/skills/marketplace/{skill_id}", tags=["skills-marketplace"])
async def marketplace_detail(skill_id: str) -> Dict[str, Any]:
    """Get detail of a single skill manifest."""
    manifest = get_skill_manifest(skill_id)
    if not manifest:
        raise HTTPException(status_code=404, detail=f"Skill '{skill_id}' not found")
    return manifest.model_dump()


@router.post("/skills/marketplace/{skill_id}/enable", tags=["skills-marketplace"])
async def marketplace_enable(skill_id: str) -> Dict[str, Any]:
    """Enable a skill."""
    success = enable_skill(skill_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Skill '{skill_id}' not found")
    manifest = get_skill_manifest(skill_id)
    return manifest.model_dump()


@router.post("/skills/marketplace/{skill_id}/disable", tags=["skills-marketplace"])
async def marketplace_disable(skill_id: str) -> Dict[str, Any]:
    """Disable a skill."""
    success = disable_skill(skill_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Skill '{skill_id}' not found")
    manifest = get_skill_manifest(skill_id)
    return manifest.model_dump()


@router.patch("/skills/marketplace/{skill_id}/config", tags=["skills-marketplace"])
async def marketplace_config(skill_id: str, body: Dict[str, Any]) -> Dict[str, Any]:
    """Update skill config."""
    manifest = update_skill_config(skill_id, body)
    if not manifest:
        raise HTTPException(status_code=404, detail=f"Skill '{skill_id}' not found")
    return manifest.model_dump()


@router.post("/skills/marketplace/{skill_id}/test", tags=["skills-marketplace"])
async def marketplace_test(skill_id: str) -> Dict[str, Any]:
    """Test run a skill."""
    manifest = get_skill_manifest(skill_id)
    if not manifest:
        raise HTTPException(status_code=404, detail=f"Skill '{skill_id}' not found")
    result = await test_skill(skill_id)
    return result
