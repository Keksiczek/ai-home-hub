"""Ollama LLM provider – wraps the existing Ollama HTTP API."""

from __future__ import annotations

import json
import logging
from typing import Any, AsyncIterator, Dict, List, Optional

import httpx

from app.services.llm_providers.base import LLMProvider, ModelInfo

logger = logging.getLogger(__name__)


class OllamaProvider(LLMProvider):
    """Ollama backend via its REST API (``/api/chat``, ``/api/embed``)."""

    def __init__(self, base_url: str | None = None) -> None:
        if base_url is None:
            from app.services.settings_service import LOCAL_LLM_BASE_URL

            base_url = LOCAL_LLM_BASE_URL
        self.base_url = base_url.rstrip("/")

    # ── generate (non-streaming) ───────────────────────────────

    async def generate(
        self,
        messages: List[Dict[str, str]],
        model: str,
        options: Dict[str, Any],
        *,
        keep_alive: int | str | None = None,
        timeout: float = 180.0,
    ) -> tuple[str, Dict[str, Any]]:
        payload: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "options": options,
            "stream": False,
        }
        if keep_alive is not None:
            payload["keep_alive"] = keep_alive

        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(f"{self.base_url}/api/chat", json=payload)
            resp.raise_for_status()
            data = resp.json()

        text = data.get("message", {}).get("content", "")
        meta: Dict[str, Any] = {
            "provider": "ollama",
            "model": model,
        }
        if data.get("prompt_eval_count") is not None:
            meta["prompt_tokens"] = data["prompt_eval_count"]
        if data.get("eval_count") is not None:
            meta["completion_tokens"] = data["eval_count"]
        return text, meta

    # ── generate_stream ────────────────────────────────────────

    async def generate_stream(
        self,
        messages: List[Dict[str, str]],
        model: str,
        options: Dict[str, Any],
        *,
        keep_alive: int | str | None = None,
        timeout: float = 90.0,
    ) -> AsyncIterator[str]:
        payload: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "options": options,
            "stream": True,
        }
        if keep_alive is not None:
            payload["keep_alive"] = keep_alive

        stream_http_timeout = httpx.Timeout(
            connect=10.0, read=timeout, write=10.0, pool=5.0
        )
        async with httpx.AsyncClient(timeout=stream_http_timeout) as client:
            async with client.stream(
                "POST", f"{self.base_url}/api/chat", json=payload
            ) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line.strip():
                        continue
                    try:
                        chunk = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                    if chunk.get("done"):
                        break
                    token = chunk.get("message", {}).get("content", "")
                    if token:
                        yield token

    # ── models ─────────────────────────────────────────────────

    async def get_models(self) -> List[ModelInfo]:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                resp.raise_for_status()
                data = resp.json()
        except Exception:
            return []

        embedding_prefixes = (
            "nomic-embed",
            "all-minilm",
            "mxbai-embed",
            "snowflake-arctic-embed",
        )
        result: List[ModelInfo] = []
        for m in data.get("models", []):
            name = m.get("name", "")
            size_gb = round(m.get("size", 0) / (1024**3), 1)
            is_emb = any(name.lower().startswith(p) for p in embedding_prefixes)
            result.append(ModelInfo(name=name, size_gb=size_gb, is_embedding=is_emb))
        return result

    # ── embeddings ─────────────────────────────────────────────

    async def get_embeddings(
        self,
        text: str,
        model: str,
        *,
        num_ctx: int = 2048,
    ) -> List[float]:
        # Safety clamp: nomic-embed-text trained on 2048, never exceed that
        effective_ctx = min(num_ctx, 2048)
        payload: Dict[str, Any] = {
            "model": model,
            "input": text,
            "options": {"num_ctx": effective_ctx},
        }
        for endpoint in ("/api/embed", "/api/embeddings"):
            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    resp = await client.post(f"{self.base_url}{endpoint}", json=payload)
                    if resp.status_code == 404:
                        continue
                    resp.raise_for_status()
                    data = resp.json()
                    emb = data.get("embeddings", [None])[0] or data.get("embedding")
                    if emb:
                        return emb
            except httpx.HTTPStatusError:
                continue
        return []

    # ── health ─────────────────────────────────────────────────

    async def health_check(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                return resp.status_code == 200
        except Exception:
            return False
