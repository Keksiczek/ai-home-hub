"""Settings router – CRUD for application settings and quick actions."""
import asyncio
import logging
import subprocess
import uuid
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException

from app.models.schemas import OllamaPerformanceUpdate, SettingsResponse, UpdateSettingsRequest
from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)

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

    # Known embedding model prefixes to filter from chat model list
    embedding_prefixes = ("nomic-embed", "all-minilm", "mxbai-embed", "snowflake-arctic-embed")

    chat_models = []
    embedding_models = []
    for m in data.get("models", []):
        name = m.get("name", "")
        size_bytes = m.get("size", 0)
        size_gb = round(size_bytes / (1024 ** 3), 1)
        modified = m.get("modified_at", "")

        name_lower = name.lower()
        is_embedding = any(name_lower.startswith(p) for p in embedding_prefixes)

        # Auto-assign profile based on model name
        if "coder" in name_lower or "code" in name_lower:
            profile = "tech"
        elif "vision" in name_lower or "vl" in name_lower or "llava" in name_lower:
            profile = "vision"
        elif "dolphin" in name_lower:
            profile = "dolphin"
        else:
            profile = "chat"

        entry = {
            "name": name,
            "size_gb": size_gb,
            "profile": profile,
            "modified": modified,
            "is_embedding": is_embedding,
        }

        if is_embedding:
            embedding_models.append(entry)
        else:
            chat_models.append(entry)

    return {"models": chat_models, "embedding_models": embedding_models}


## ── Quick Actions CRUD ──────────────────────────────────────


@router.get("/settings/quick-actions", tags=["quick-actions"])
async def list_quick_actions() -> Dict[str, Any]:
    """Return all quick actions from settings."""
    svc = get_settings_service()
    settings = svc.load()
    return {"actions": settings.get("quick_actions", [])}


@router.post("/settings/quick-actions", tags=["quick-actions"])
async def create_quick_action(action: Dict[str, Any]) -> Dict[str, Any]:
    """Add a new quick action."""
    svc = get_settings_service()
    settings = svc.load()
    actions: List[Dict[str, Any]] = settings.get("quick_actions", [])

    name = action.get("name", "").strip()
    if not name:
        raise HTTPException(400, "Action name is required")

    if any(a["name"] == name for a in actions):
        raise HTTPException(400, "Action with this name already exists")

    # Ensure action has an id
    if "id" not in action:
        action["id"] = str(uuid.uuid4())[:8]

    actions.append(action)
    settings["quick_actions"] = actions
    svc.save(settings)
    return {"success": True, "action": action}


@router.put("/settings/quick-actions/{action_id}", tags=["quick-actions"])
async def update_quick_action(action_id: str, action: Dict[str, Any]) -> Dict[str, Any]:
    """Update an existing quick action by id."""
    svc = get_settings_service()
    settings = svc.load()
    actions: List[Dict[str, Any]] = settings.get("quick_actions", [])

    for i, a in enumerate(actions):
        if a.get("id") == action_id:
            action["id"] = action_id
            actions[i] = action
            settings["quick_actions"] = actions
            svc.save(settings)
            return {"success": True, "action": action}

    raise HTTPException(404, f"Action '{action_id}' not found")


@router.delete("/settings/quick-actions/{action_id}", tags=["quick-actions"])
async def delete_quick_action(action_id: str) -> Dict[str, Any]:
    """Delete a quick action by id."""
    svc = get_settings_service()
    settings = svc.load()
    actions: List[Dict[str, Any]] = settings.get("quick_actions", [])
    original_len = len(actions)
    actions = [a for a in actions if a.get("id") != action_id]

    if len(actions) == original_len:
        raise HTTPException(404, f"Action '{action_id}' not found")

    settings["quick_actions"] = actions
    svc.save(settings)
    return {"success": True}


## ── Ollama Performance Settings ────────────────────────────────────

_PERF_DEFAULTS: Dict[str, Any] = {
    "context_length": 4096,
    "kv_cache_type": "q8_0",
    "flash_attention": True,
    "num_parallel": 1,
    "keep_alive": "5m",
}


@router.get("/settings/llm", tags=["settings"])
async def get_llm_performance() -> Dict[str, Any]:
    """Return current Ollama performance settings."""
    svc = get_settings_service()
    settings = svc.load()
    perf = settings.get("llm", {}).get("ollama_performance", _PERF_DEFAULTS)
    return {"performance": {**_PERF_DEFAULTS, **perf}}


@router.patch("/settings/llm", tags=["settings"])
async def update_llm_performance(body: OllamaPerformanceUpdate) -> Dict[str, Any]:
    """Save Ollama performance settings and optionally restart Ollama."""
    svc = get_settings_service()
    settings = svc.load()

    perf: Dict[str, Any] = settings.get("llm", {}).get("ollama_performance", dict(_PERF_DEFAULTS))

    if body.context_length is not None:
        perf["context_length"] = body.context_length
    if body.kv_cache_type is not None:
        if body.kv_cache_type not in ("f16", "q8_0", "q4_0"):
            raise HTTPException(400, "kv_cache_type must be one of: f16, q8_0, q4_0")
        perf["kv_cache_type"] = body.kv_cache_type
    if body.flash_attention is not None:
        perf["flash_attention"] = body.flash_attention
    if body.num_parallel is not None:
        if not (1 <= body.num_parallel <= 4):
            raise HTTPException(400, "num_parallel must be between 1 and 4")
        perf["num_parallel"] = body.num_parallel
    if body.keep_alive is not None:
        if body.keep_alive not in ("0", "5m", "30m", "-1"):
            raise HTTPException(400, "keep_alive must be one of: 0, 5m, 30m, -1")
        perf["keep_alive"] = body.keep_alive

    svc.update({"llm": {"ollama_performance": perf}})
    logger.info("Ollama performance settings updated: %s", perf)

    restarted = False
    if body.restart_ollama:
        try:
            subprocess.Popen(["pkill", "-f", "ollama serve"])
            await asyncio.sleep(2)
            env_vars = {
                "OLLAMA_FLASH_ATTENTION": "1" if perf.get("flash_attention", True) else "0",
                "OLLAMA_KV_CACHE_TYPE": perf.get("kv_cache_type", "q8_0"),
                "OLLAMA_NUM_PARALLEL": str(perf.get("num_parallel", 1)),
                "OLLAMA_CONTEXT_LENGTH": str(perf.get("context_length", 4096)),
                "OLLAMA_KEEP_ALIVE": perf.get("keep_alive", "5m"),
            }
            import os
            env = {**os.environ, **env_vars}
            subprocess.Popen(["ollama", "serve"], env=env)
            restarted = True
            logger.info("Ollama restarted with new performance env vars")
        except Exception as exc:
            logger.error("Failed to restart Ollama: %s", exc)
            raise HTTPException(500, f"Settings saved but Ollama restart failed: {exc}")

    return {"status": "ok", "performance": perf, "restarted": restarted}


## ── Safe Mode ───────────────────────────────────────────────────────────────


@router.post("/settings/safe-mode", tags=["guardrails"])
async def set_safe_mode(body: Dict[str, Any]) -> Dict[str, Any]:
    """Enable or disable Safe Mode globally.

    When Safe Mode is active:
    - Experimental agents are disabled
    - Resident autonomy is capped to "observer"
    - Concurrent agent limit is reduced to 1
    - Agent guardrails use stricter limits

    Request body::

        {
          "enabled": true,
          "restrictions": {          # optional
            "disable_experimental_agents": true,
            "resident_autonomy": "observer",
            "max_concurrent_agents": 1
          }
        }
    """
    from app.core.settings import get_guardrail_settings, GlobalGuardrailSettings

    enabled: bool = body.get("enabled", False)
    restrictions: Dict[str, Any] = body.get("restrictions", {})

    svc = get_settings_service()
    settings = svc.load()

    guardrails = settings.get("guardrails", {})
    guardrails["safe_mode"] = enabled
    if restrictions:
        guardrails.setdefault("safe_mode_restrictions", {}).update(restrictions)
    settings["guardrails"] = guardrails
    svc.save(settings)

    gs = get_guardrail_settings()

    # Update safe_mode metric
    try:
        from app.services.metrics_service import safe_mode_enabled
        safe_mode_enabled.set(1 if enabled else 0)
    except Exception:
        pass

    logger.info("Safe Mode %s", "ENABLED" if enabled else "DISABLED")

    return {
        "safe_mode": gs.safe_mode,
        "restrictions": gs.safe_mode_restrictions.model_dump(),
        "effective_autonomy": gs.effective_resident_autonomy(),
    }


@router.get("/settings/safe-mode", tags=["guardrails"])
async def get_safe_mode() -> Dict[str, Any]:
    """Return current Safe Mode status."""
    from app.core.settings import get_guardrail_settings
    gs = get_guardrail_settings()
    return {
        "safe_mode": gs.safe_mode,
        "restrictions": gs.safe_mode_restrictions.model_dump(),
        "effective_autonomy": gs.effective_resident_autonomy(),
    }


## ── Guardrails ───────────────────────────────────────────────────────────────


@router.get("/settings/guardrails", tags=["guardrails"])
async def get_guardrails() -> Dict[str, Any]:
    """Return current guardrail configuration."""
    from app.core.settings import get_guardrail_settings
    gs = get_guardrail_settings()
    return {
        "safe_mode": gs.safe_mode,
        "agent_guardrails": {
            k: v.model_dump() for k, v in gs.agent_guardrails.items()
        },
        "resident": gs.resident.model_dump(),
        "effective_autonomy": gs.effective_resident_autonomy(),
    }


@router.post("/settings/guardrails", tags=["guardrails"])
async def update_guardrails(body: Dict[str, Any]) -> Dict[str, Any]:
    """Update guardrail configuration.

    Accepts a partial guardrails dict; merges with current config.
    Example::

        {
          "agent_guardrails": {
            "code": {"max_steps": 20, "max_total_tokens": 40000}
          },
          "resident": {
            "autonomy_level": "autonomous",
            "interval_seconds": 600
          }
        }
    """
    svc = get_settings_service()
    settings = svc.load()

    existing_guardrails = settings.get("guardrails", {})
    # Deep merge new values
    from app.services.settings_service import _deep_merge  # type: ignore[attr-defined]
    merged = _deep_merge(existing_guardrails, body)
    settings["guardrails"] = merged

    # If autonomy_level is set, sync resident_mode for backward compat
    resident_update = body.get("resident", {})
    if "autonomy_level" in resident_update:
        settings["resident_mode"] = resident_update["autonomy_level"]

    svc.save(settings)

    from app.core.settings import get_guardrail_settings
    gs = get_guardrail_settings()
    return {
        "safe_mode": gs.safe_mode,
        "agent_guardrails": {k: v.model_dump() for k, v in gs.agent_guardrails.items()},
        "resident": gs.resident.model_dump(),
        "effective_autonomy": gs.effective_resident_autonomy(),
    }


@router.get("/settings/guardrails/status", tags=["guardrails"])
async def get_guardrail_runtime_status() -> Dict[str, Any]:
    """Return runtime guardrail state from the resident agent (cooldowns, budgets)."""
    try:
        from app.services.resident_agent import get_resident_agent
        agent = get_resident_agent()
        return agent.get_guardrail_status()
    except Exception as exc:
        logger.debug("Could not fetch resident guardrail status: %s", exc)
        from app.core.settings import get_guardrail_settings
        gs = get_guardrail_settings()
        return {
            "safe_mode": gs.safe_mode,
            "autonomy_level": gs.effective_resident_autonomy(),
            "daily_action_counts": {},
            "daily_action_budgets": gs.resident.max_daily_actions,
            "cooldowns": {},
        }


def _mask_secrets(settings: Dict[str, Any]) -> None:
    """Replace API key values with masked placeholder in-place."""
    try:
        if "integrations" in settings:
            ag = settings["integrations"].get("antigravity", {})
            if ag.get("api_key"):
                ag["api_key"] = "••••••••"
    except Exception:
        pass
