"""Settings router – CRUD for application settings."""
from typing import Any, Dict

from fastapi import APIRouter, HTTPException

from app.models.schemas import SettingsResponse, UpdateSettingsRequest
from app.services.settings_service import get_settings_service

router = APIRouter()


@router.get("/settings", response_model=SettingsResponse, tags=["settings"])
async def get_settings() -> Dict[str, Any]:
    """Return all current settings."""
    svc = get_settings_service()
    settings = svc.load()
    # Mask API keys in the response
    _mask_secrets(settings)
    return {"settings": settings}


@router.post("/settings", response_model=SettingsResponse, tags=["settings"])
async def update_settings(body: UpdateSettingsRequest) -> Dict[str, Any]:
    """Deep-merge provided settings with current and persist."""
    svc = get_settings_service()
    updated = svc.update(body.settings)
    _mask_secrets(updated)
    return {"settings": updated}


@router.get("/settings/schema", tags=["settings"])
async def get_settings_schema() -> Dict[str, Any]:
    """Return the settings JSON schema for form generation."""
    return {
        "type": "object",
        "properties": {
            "llm": {
                "type": "object",
                "title": "LLM Configuration",
                "properties": {
                    "provider": {"type": "string", "enum": ["ollama", "stub"], "default": "ollama"},
                    "model": {"type": "string", "default": "llama3.2"},
                    "temperature": {"type": "number", "minimum": 0, "maximum": 2, "default": 0.7},
                    "ollama_url": {"type": "string", "default": "http://localhost:11434"},
                },
            },
            "integrations": {
                "type": "object",
                "title": "Integrations",
                "properties": {
                    "vscode": {
                        "type": "object",
                        "properties": {
                            "enabled": {"type": "boolean"},
                            "binary_path": {"type": "string"},
                        },
                    },
                    "macos": {
                        "type": "object",
                        "properties": {"enabled": {"type": "boolean"}},
                    },
                    "openclaw": {
                        "type": "object",
                        "properties": {
                            "enabled": {"type": "boolean"},
                            "binary_path": {"type": "string"},
                        },
                    },
                    "claude_mcp": {
                        "type": "object",
                        "properties": {
                            "enabled": {"type": "boolean"},
                            "connection_type": {"type": "string", "enum": ["stdio", "http"]},
                            "stdio_path": {"type": "string"},
                        },
                    },
                    "antigravity": {
                        "type": "object",
                        "properties": {
                            "enabled": {"type": "boolean"},
                            "api_endpoint": {"type": "string"},
                            "api_key": {"type": "string", "secret": True},
                        },
                    },
                },
            },
            "filesystem": {
                "type": "object",
                "title": "Filesystem Security",
                "properties": {
                    "allowed_directories": {
                        "type": "array",
                        "items": {"type": "string"},
                    },
                    "require_confirmation": {
                        "type": "array",
                        "items": {"type": "string", "enum": ["read", "write", "delete"]},
                    },
                },
            },
            "notifications": {
                "type": "object",
                "title": "Notifications",
                "properties": {
                    "enabled": {"type": "boolean"},
                    "ntfy_url": {"type": "string"},
                    "topic": {"type": "string"},
                },
            },
            "agents": {
                "type": "object",
                "title": "Agent Limits",
                "properties": {
                    "max_concurrent": {"type": "integer", "minimum": 1, "maximum": 10},
                    "timeout_minutes": {"type": "integer", "minimum": 5, "maximum": 120},
                },
            },
            "system_prompts": {
                "type": "object",
                "title": "System Prompts",
                "properties": {
                    "general": {"type": "string"},
                    "powerbi": {"type": "string"},
                    "lean": {"type": "string"},
                },
            },
        },
    }


@router.post("/settings/ollama/health", tags=["settings"])
async def check_ollama_health() -> Dict[str, Any]:
    """Check if Ollama is running and list available models."""
    from app.services.llm_service import get_llm_service
    svc = get_llm_service()
    return await svc.check_ollama_health()


@router.get("/ollama/models", tags=["settings"])
async def list_ollama_models() -> Dict[str, Any]:
    """Fetch downloaded models from Ollama and return with auto-assigned profiles."""
    import httpx

    settings_svc = get_settings_service()
    ollama_url = settings_svc.get_llm_config().get("ollama_url", "http://localhost:11434")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{ollama_url}/api/tags")
            resp.raise_for_status()
            data = resp.json()
    except Exception as exc:
        return {"models": [], "error": str(exc)}

    models = []
    for m in data.get("models", []):
        name = m.get("name", "")
        size_bytes = m.get("size", 0)
        size_gb = round(size_bytes / (1024 ** 3), 1)

        # Auto-assign profile based on model name
        name_lower = name.lower()
        if "coder" in name_lower or "code" in name_lower:
            profile = "tech"
        elif "vision" in name_lower or "vl" in name_lower:
            profile = "vision"
        elif "dolphin" in name_lower:
            profile = "dolphin"
        else:
            profile = "chat"

        models.append({
            "name": name,
            "size_gb": size_gb,
            "profile": profile,
        })

    return {"models": models}


def _mask_secrets(settings: Dict[str, Any]) -> None:
    """Replace API key values with masked placeholder in-place."""
    try:
        if "integrations" in settings:
            ag = settings["integrations"].get("antigravity", {})
            if ag.get("api_key"):
                ag["api_key"] = "••••••••"
    except Exception:
        pass
