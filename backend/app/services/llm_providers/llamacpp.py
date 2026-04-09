"""llama-cpp-python server provider – OpenAI-compatible API."""

from __future__ import annotations

import json
import logging
from typing import Any, AsyncIterator, Dict, List

import httpx

from app.services.llm_providers.base import LLMProvider, ModelInfo

logger = logging.getLogger(__name__)


class LlamaCppProvider(LLMProvider):
    """llama-cpp-python server using OpenAI-compatible endpoints.

    Default address: ``http://localhost:8080``.
    """

    def __init__(self, base_url: str = "http://localhost:8080") -> None:
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
            "stream": False,
        }
        # Map Ollama-style options to OpenAI-compatible params
        if "temperature" in options:
            payload["temperature"] = options["temperature"]
        if "top_p" in options:
            payload["top_p"] = options["top_p"]
        if "num_predict" in options:
            payload["max_tokens"] = options["num_predict"]

        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(
                f"{self.base_url}/v1/chat/completions", json=payload
            )
            resp.raise_for_status()
            data = resp.json()

        choice = data.get("choices", [{}])[0]
        text = choice.get("message", {}).get("content", "")
        usage = data.get("usage", {})
        meta: Dict[str, Any] = {
            "provider": "llamacpp",
            "model": model,
            "prompt_tokens": usage.get("prompt_tokens"),
            "completion_tokens": usage.get("completion_tokens"),
        }
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
            "stream": True,
        }
        if "temperature" in options:
            payload["temperature"] = options["temperature"]
        if "top_p" in options:
            payload["top_p"] = options["top_p"]
        if "num_predict" in options:
            payload["max_tokens"] = options["num_predict"]

        stream_timeout = httpx.Timeout(connect=10.0, read=timeout, write=10.0, pool=5.0)
        async with httpx.AsyncClient(timeout=stream_timeout) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/v1/chat/completions",
                json=payload,
                headers={"Accept": "text/event-stream"},
            ) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    payload_str = line[6:]
                    if payload_str.strip() == "[DONE]":
                        break
                    try:
                        chunk = json.loads(payload_str)
                    except json.JSONDecodeError:
                        continue
                    delta = (
                        chunk.get("choices", [{}])[0]
                        .get("delta", {})
                        .get("content", "")
                    )
                    if delta:
                        yield delta

    # ── models ─────────────────────────────────────────────────

    async def get_models(self) -> List[ModelInfo]:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f"{self.base_url}/v1/models")
                resp.raise_for_status()
                data = resp.json()
        except Exception:
            return []

        return [ModelInfo(name=m.get("id", "unknown")) for m in data.get("data", [])]

    # ── embeddings ─────────────────────────────────────────────

    async def get_embeddings(
        self,
        text: str,
        model: str,
        *,
        num_ctx: int = 512,
    ) -> List[float]:
        payload = {"model": model, "input": text}
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(f"{self.base_url}/v1/embeddings", json=payload)
                resp.raise_for_status()
                data = resp.json()
                return data.get("data", [{}])[0].get("embedding", [])
        except Exception as exc:
            logger.warning("llama.cpp embeddings failed: %s", exc)
            return []

    # ── health ─────────────────────────────────────────────────

    async def health_check(self) -> bool:
        for path in ("/health", "/v1/models"):
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    resp = await client.get(f"{self.base_url}{path}")
                    if resp.status_code == 200:
                        return True
            except Exception:
                continue
        return False
