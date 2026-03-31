"""Groq cloud provider – OpenAI-compatible REST API."""

from __future__ import annotations

import json
import logging
import os
from typing import Any, AsyncIterator, Dict, List

import httpx

from app.services.llm_providers.base import LLMProvider, ModelInfo

logger = logging.getLogger(__name__)

GROQ_API_BASE = "https://api.groq.com/openai/v1"

# Models available on the free tier
GROQ_MODELS = [
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
    "llama-3.3-70b-versatile",
]


class GroqProvider(LLMProvider):
    """Groq cloud LLM backend (free tier, rate-limited).

    Uses the OpenAI-compatible ``/v1/chat/completions`` endpoint.
    API key is read from settings or ``GROQ_API_KEY`` env var.
    """

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key or os.environ.get("GROQ_API_KEY", "")

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    # ── generate (non-streaming) ───────────────────────────────

    async def generate(
        self,
        messages: List[Dict[str, str]],
        model: str,
        options: Dict[str, Any],
        *,
        keep_alive: int | str | None = None,
        timeout: float = 30.0,
    ) -> tuple[str, Dict[str, Any]]:
        payload: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "stream": False,
        }
        if "temperature" in options:
            payload["temperature"] = options["temperature"]
        if "num_predict" in options:
            payload["max_tokens"] = options["num_predict"]

        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(
                f"{GROQ_API_BASE}/chat/completions",
                json=payload,
                headers=self._headers(),
            )
            resp.raise_for_status()
            data = resp.json()

        choice = data.get("choices", [{}])[0]
        text = choice.get("message", {}).get("content", "")
        usage = data.get("usage", {})
        meta: Dict[str, Any] = {
            "provider": "groq",
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
        timeout: float = 30.0,
    ) -> AsyncIterator[str]:
        payload: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "stream": True,
        }
        if "temperature" in options:
            payload["temperature"] = options["temperature"]
        if "num_predict" in options:
            payload["max_tokens"] = options["num_predict"]

        stream_timeout = httpx.Timeout(
            connect=10.0, read=timeout, write=10.0, pool=5.0
        )
        async with httpx.AsyncClient(timeout=stream_timeout) as client:
            async with client.stream(
                "POST",
                f"{GROQ_API_BASE}/chat/completions",
                json=payload,
                headers=self._headers(),
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
        if not self.api_key:
            return [ModelInfo(name=m) for m in GROQ_MODELS]
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{GROQ_API_BASE}/models", headers=self._headers()
                )
                resp.raise_for_status()
                data = resp.json()
            return [
                ModelInfo(name=m.get("id", "unknown"))
                for m in data.get("data", [])
            ]
        except Exception:
            return [ModelInfo(name=m) for m in GROQ_MODELS]

    # ── embeddings ─────────────────────────────────────────────

    async def get_embeddings(
        self,
        text: str,
        model: str,
        *,
        num_ctx: int = 512,
    ) -> List[float]:
        # Groq does not offer embeddings; return empty
        return []

    # ── health ─────────────────────────────────────────────────

    async def health_check(self) -> bool:
        if not self.api_key:
            return False
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(
                    f"{GROQ_API_BASE}/models", headers=self._headers()
                )
                return resp.status_code == 200
        except Exception:
            return False
