"""Model Manager service – Ollama model lifecycle + HuggingFace GGUF search."""
import json
import logging
import shutil
import time
from typing import Any, AsyncGenerator, Dict, List, Optional

import httpx

from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)

# Curated recommendations for 8 GB Mac
RECOMMENDED_MODELS_8GB: List[Dict[str, Any]] = [
    {"name": "llama3.2:3b", "size_gb": 2.0, "type": "chat", "label": "Nejlepší chat"},
    {"name": "llava:7b", "size_gb": 4.7, "type": "vision", "label": "Nejlepší vision"},
    {"name": "qwen2.5-coder:3b", "size_gb": 1.9, "type": "code", "label": "Nejlepší kód"},
    {"name": "phi3:mini", "size_gb": 2.3, "type": "chat", "label": "Doporučujeme"},
    {"name": "tinyllama:1b", "size_gb": 0.6, "type": "chat", "label": "Rychlý"},
    {"name": "qwen2.5:3b", "size_gb": 1.9, "type": "chat", "label": "Multilingual"},
    {"name": "mistral:7b", "size_gb": 4.1, "type": "chat", "label": "Velký (pomalý)"},
]


def _detect_type(name: str) -> str:
    """Detect model type from its name."""
    lower = name.lower()
    if any(x in lower for x in ("llava", "vision", "moondream")):
        return "vision"
    if any(x in lower for x in ("coder", "code", "starcoder")):
        return "code"
    return "chat"


class ModelManagerService:
    """Manages Ollama models: list, pull (streaming), delete, search."""

    def __init__(self) -> None:
        self._settings = get_settings_service()

    def _ollama_url(self) -> str:
        cfg = self._settings.get_llm_config()
        return cfg.get("ollama_url", "http://localhost:11434").rstrip("/")

    # ── Installed models ────────────────────────────────────────

    async def list_installed(self) -> List[Dict[str, Any]]:
        """Return list of locally installed Ollama models."""
        url = self._ollama_url()
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{url}/api/tags")
            resp.raise_for_status()
        models = resp.json().get("models", [])
        return [
            {
                "name": m["name"],
                "size": m.get("size", 0),
                "modified": m.get("modified_at", ""),
                "type": _detect_type(m["name"]),
                "digest": m.get("digest", ""),
            }
            for m in models
        ]

    # ── Pull (stream) ───────────────────────────────────────────

    async def pull_model_stream(self, name: str) -> AsyncGenerator[Dict[str, Any], None]:
        """Pull a model from Ollama registry, yielding progress dicts via SSE."""
        url = self._ollama_url()
        last_time = time.monotonic()
        last_completed = 0

        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream(
                "POST",
                f"{url}/api/pull",
                json={"name": name},
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    data = json.loads(line)
                    completed = data.get("completed", 0)
                    total = data.get("total", 1)

                    # Calculate speed
                    now = time.monotonic()
                    delta_t = now - last_time
                    delta_bytes = completed - last_completed
                    speed_mbps = (delta_bytes / max(delta_t, 0.001)) / (1024 * 1024) if delta_t > 0 else 0
                    last_time = now
                    last_completed = completed

                    yield {
                        "status": data.get("status", ""),
                        "completed": completed,
                        "total": total,
                        "percent": round(completed / max(total, 1) * 100, 1),
                        "speed_mbps": round(speed_mbps, 1),
                        "digest": data.get("digest", ""),
                    }

    # ── Delete ──────────────────────────────────────────────────

    async def delete_model(self, name: str) -> bool:
        """Delete a model from Ollama."""
        url = self._ollama_url()
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.delete(f"{url}/api/delete", json={"name": name})
        return resp.status_code == 200

    # ── Search: Ollama library ──────────────────────────────────

    async def search_ollama_library(self, query: str) -> List[Dict[str, Any]]:
        """Search Ollama library via the registry API.

        Note: Ollama doesn't have an official search API, so we return
        curated results filtered by query.
        """
        curated = [
            {"name": "llama3.2:3b", "size_gb": 2.0, "pulls": "5M", "type": "chat"},
            {"name": "llama3.2:1b", "size_gb": 1.3, "pulls": "2M", "type": "chat"},
            {"name": "mistral:7b", "size_gb": 4.1, "pulls": "2M", "type": "chat"},
            {"name": "gemma2:9b", "size_gb": 5.5, "pulls": "800k", "type": "chat"},
            {"name": "phi3:mini", "size_gb": 2.3, "pulls": "500k", "type": "chat"},
            {"name": "qwen2.5-coder:3b", "size_gb": 1.9, "pulls": "1M", "type": "code"},
            {"name": "qwen2.5:3b", "size_gb": 1.9, "pulls": "800k", "type": "chat"},
            {"name": "llava:7b", "size_gb": 4.7, "pulls": "1.5M", "type": "vision"},
            {"name": "codellama:7b", "size_gb": 3.8, "pulls": "600k", "type": "code"},
            {"name": "tinyllama:1b", "size_gb": 0.6, "pulls": "400k", "type": "chat"},
            {"name": "dolphin-llama3:8b", "size_gb": 4.7, "pulls": "300k", "type": "chat"},
            {"name": "nomic-embed-text", "size_gb": 0.3, "pulls": "2M", "type": "embedding"},
            {"name": "starcoder2:3b", "size_gb": 1.7, "pulls": "200k", "type": "code"},
        ]
        q = query.lower()
        return [m for m in curated if q in m["name"].lower() or q in m["type"]]

    # ── Search: HuggingFace GGUF ────────────────────────────────

    async def search_huggingface(self, query: str) -> List[Dict[str, Any]]:
        """Search HuggingFace for GGUF models."""
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://huggingface.co/api/models",
                params={
                    "search": query,
                    "filter": "gguf",
                    "sort": "downloads",
                    "limit": 20,
                },
            )
            resp.raise_for_status()
        return [
            {
                "id": m["id"],
                "name": m["id"].split("/")[-1],
                "downloads": m.get("downloads", 0),
                "likes": m.get("likes", 0),
                "ollama_name": f"hf.co/{m['id']}",
            }
            for m in resp.json()
        ]

    # ── Disk space ──────────────────────────────────────────────

    async def get_disk_space(self) -> Dict[str, Any]:
        """Return disk usage info including models total size."""
        total, used, free = shutil.disk_usage("/")
        try:
            installed = await self.list_installed()
            models_size = sum(m["size"] for m in installed)
        except Exception:
            models_size = 0
        return {
            "total": total,
            "used": used,
            "free": free,
            "models_size": models_size,
        }

    # ── Recommended models ──────────────────────────────────────

    async def get_recommended(self) -> List[Dict[str, Any]]:
        """Return curated recommended models with install status."""
        try:
            installed = await self.list_installed()
            installed_names = {m["name"] for m in installed}
        except Exception:
            installed_names = set()

        results = []
        for m in RECOMMENDED_MODELS_8GB:
            results.append({
                **m,
                "installed": m["name"] in installed_names,
            })
        return results


_model_manager: Optional[ModelManagerService] = None


def get_model_manager_service() -> ModelManagerService:
    global _model_manager
    if _model_manager is None:
        _model_manager = ModelManagerService()
    return _model_manager
