"""Models & LLM Settings router – model lifecycle, search, and LLM configuration."""

import asyncio
import json
import logging
from typing import Any, Dict

import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse

from app.models.schemas import LLMSettingsUpdate, ModelPullRequest
from app.services.model_manager_service import get_model_manager_service
from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Model Management ────────────────────────────────────────────


@router.get("/models/installed", tags=["models"])
async def list_installed_models() -> Dict[str, Any]:
    """List all locally installed Ollama models."""
    svc = get_model_manager_service()
    try:
        models = await svc.list_installed()
        return {"models": models, "count": len(models)}
    except Exception as exc:
        logger.error("Failed to list installed models: %s", exc)
        raise HTTPException(status_code=502, detail=f"Ollama nedostupná: {exc}")


@router.get("/models/recommended", tags=["models"])
async def get_recommended_models() -> Dict[str, Any]:
    """Return curated recommended models for 8 GB Mac."""
    svc = get_model_manager_service()
    models = await svc.get_recommended()
    return {"models": models}


@router.get("/models/search/ollama", tags=["models"])
async def search_ollama_models(q: str = Query(..., min_length=1)) -> Dict[str, Any]:
    """Search Ollama library models."""
    svc = get_model_manager_service()
    results = await svc.search_ollama_library(q)
    return {"results": results, "query": q}


@router.get("/models/search/huggingface", tags=["models"])
async def search_huggingface_models(
    q: str = Query(..., min_length=1)
) -> Dict[str, Any]:
    """Search HuggingFace for GGUF models."""
    svc = get_model_manager_service()
    try:
        results = await svc.search_huggingface(q)
        return {"results": results, "query": q}
    except Exception as exc:
        logger.error("HuggingFace search failed: %s", exc)
        raise HTTPException(status_code=502, detail=f"HuggingFace API error: {exc}")


@router.post("/models/pull", tags=["models"])
async def pull_model(body: ModelPullRequest):
    """Pull/download a model with real-time SSE progress streaming."""
    svc = get_model_manager_service()

    async def event_stream():
        try:
            async for progress in svc.pull_model_stream(body.name):
                yield f"data: {json.dumps(progress)}\n\n"
            yield f"data: {json.dumps({'status': 'success', 'percent': 100})}\n\n"
        except Exception as exc:
            logger.error("Model pull failed for %s: %s", body.name, exc)
            yield f"data: {json.dumps({'status': 'error', 'message': str(exc)})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.delete("/models/{name:path}", tags=["models"])
async def delete_model(name: str) -> Dict[str, Any]:
    """Delete a model from Ollama."""
    svc = get_model_manager_service()
    success = await svc.delete_model(name)
    if not success:
        raise HTTPException(
            status_code=404, detail=f"Model '{name}' not found or delete failed"
        )
    return {"status": "ok", "deleted": name}


@router.get("/models/disk", tags=["models"])
async def get_disk_space() -> Dict[str, Any]:
    """Return disk usage info."""
    svc = get_model_manager_service()
    return await svc.get_disk_space()


# ── LLM Settings ────────────────────────────────────────────────


@router.get("/llm/settings", tags=["llm"])
async def get_llm_settings() -> Dict[str, Any]:
    """Return current LLM settings: active models, parameters, and status."""
    settings_svc = get_settings_service()
    settings = settings_svc.load()
    llm_cfg = settings.get("llm", {})

    # Resolve active model assignments
    from app.services.llm_service import MODEL_ROUTING

    active_models = {
        "chat": MODEL_ROUTING.get("general", "llama3.2"),
        "vision": MODEL_ROUTING.get("vision", "llava:7b"),
        "code": MODEL_ROUTING.get("code", "qwen2.5-coder:3b"),
        "agent": MODEL_ROUTING.get("research", "llama3.2"),
    }

    params = llm_cfg.get("default_params", {})

    return {
        "active_models": active_models,
        "parameters": {
            "temperature": params.get("temperature", llm_cfg.get("temperature", 0.3)),
            "max_tokens": params.get("max_tokens", 2048),
            "context_length": params.get("context_length", 4096),
            "top_p": params.get("top_p", 0.9),
        },
        "ollama_url": llm_cfg.get("ollama_url", "http://localhost:11434"),
    }


@router.patch("/llm/settings", tags=["llm"])
async def update_llm_settings(body: LLMSettingsUpdate) -> Dict[str, Any]:
    """Update LLM settings with hot-reload (no restart needed)."""
    settings_svc = get_settings_service()
    updates: Dict[str, Any] = {}

    if body.active_models is not None:
        # Update MODEL_ROUTING in-memory for hot-reload
        from app.services.llm_service import MODEL_ROUTING

        mapping = {
            "chat": "general",
            "vision": "vision",
            "code": "code",
            "agent": "research",
        }
        for role, profile in mapping.items():
            if role in body.active_models:
                MODEL_ROUTING[profile] = body.active_models[role]

    if body.parameters is not None:
        updates.setdefault("llm", {})["default_params"] = body.parameters

    if body.ollama_url is not None:
        updates.setdefault("llm", {})["ollama_url"] = body.ollama_url

    if updates:
        settings_svc.update(updates)

    return {"status": "ok", "reloaded": True}


@router.post("/llm/test", tags=["llm"])
async def test_llm_connection() -> Dict[str, Any]:
    """Test Ollama connection and return status."""
    settings_svc = get_settings_service()
    settings = settings_svc.load()
    ollama_url = (
        settings.get("llm", {}).get("ollama_url", "http://localhost:11434").rstrip("/")
    )

    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(f"{ollama_url}/api/tags")
            resp.raise_for_status()
            version = resp.headers.get("ollama-version", "unknown")
            model_count = len(resp.json().get("models", []))
            return {
                "status": "ok",
                "version": version,
                "model_count": model_count,
                "url": ollama_url,
            }
    except Exception as exc:
        return {
            "status": "error",
            "message": f"Ollama nedostupná: {exc}",
            "url": ollama_url,
        }


@router.post("/llm/restart-ollama", tags=["llm"])
async def restart_ollama() -> Dict[str, Any]:
    """Restart Ollama server (pkill + ollama serve)."""
    import subprocess

    try:
        subprocess.Popen(["pkill", "-f", "ollama"])
        await asyncio.sleep(2)
        subprocess.Popen(["ollama", "serve"])
        return {"status": "restarting"}
    except Exception as exc:
        logger.error("Failed to restart Ollama: %s", exc)
        raise HTTPException(status_code=500, detail=f"Restart failed: {exc}")
