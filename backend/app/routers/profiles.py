"""Profiles router – CRUD for custom chat profiles."""
from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.settings_service import get_settings_service

router = APIRouter()


class CustomProfileRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    icon: str = Field(default="🤖", max_length=4)
    prompt: str = Field(..., min_length=1, max_length=5000)
    tools: list[str] = []
    temperature: float = Field(default=0.3, ge=0.0, le=2.0)


@router.get("/profiles", tags=["profiles"])
async def list_profiles() -> Dict[str, Any]:
    """List all custom profiles."""
    svc = get_settings_service()
    profiles = svc.get_custom_profiles()
    return {"profiles": profiles, "count": len(profiles)}


@router.get("/profiles/{profile_id}", tags=["profiles"])
async def get_profile(profile_id: str) -> Dict[str, Any]:
    """Get a single custom profile by ID."""
    svc = get_settings_service()
    profiles = svc.get_custom_profiles()
    if profile_id not in profiles:
        raise HTTPException(status_code=404, detail=f"Profile '{profile_id}' not found")
    return {"id": profile_id, **profiles[profile_id]}


@router.post("/profiles/{profile_id}", tags=["profiles"])
async def create_or_update_profile(profile_id: str, body: CustomProfileRequest) -> Dict[str, Any]:
    """Create or update a custom profile."""
    svc = get_settings_service()
    profile_data = {
        "name": body.name,
        "icon": body.icon,
        "prompt": body.prompt,
        "tools": body.tools,
        "temperature": body.temperature,
    }
    svc.save_custom_profile(profile_id, profile_data)
    return {"id": profile_id, "status": "saved", **profile_data}


@router.delete("/profiles/{profile_id}", tags=["profiles"])
async def delete_profile(profile_id: str) -> Dict[str, Any]:
    """Delete a custom profile."""
    svc = get_settings_service()
    if not svc.delete_custom_profile(profile_id):
        raise HTTPException(status_code=404, detail=f"Profile '{profile_id}' not found")
    return {"id": profile_id, "deleted": True}


@router.post("/profiles/{profile_id}/chat", tags=["profiles"])
async def chat_with_profile(profile_id: str, message: str = "") -> Dict[str, Any]:
    """Send a chat message using a custom profile's system prompt and temperature.

    Resolves the custom profile's system prompt mode and delegates to the LLM service.
    The profile_id is mapped to a system_prompts key if it exists; otherwise uses 'general'.
    """
    if not message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    svc = get_settings_service()
    profiles = svc.get_custom_profiles()
    if profile_id not in profiles:
        raise HTTPException(status_code=404, detail=f"Profile '{profile_id}' not found")

    profile = profiles[profile_id]

    from app.services.llm_service import get_llm_service
    from app.utils.context_helpers import enrich_message

    llm_svc = get_llm_service()
    llm_message, context_meta = await enrich_message(message)

    # Use the profile_id as mode if a matching system prompt exists, otherwise 'general'
    settings = svc.load()
    available_prompts = settings.get("system_prompts", {})
    mode = profile_id if profile_id in available_prompts else "general"

    reply, meta = await llm_svc.generate(
        message=llm_message,
        mode=mode,
    )

    meta.update(context_meta)
    meta["profile_id"] = profile_id
    meta["profile_name"] = profile.get("name", profile_id)

    return {"reply": reply, "meta": meta}
