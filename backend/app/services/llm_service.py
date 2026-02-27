"""LLM service – Ollama integration with graceful stub fallback."""
import logging
import time
from typing import Any, Dict, List, Optional, Tuple

import httpx

from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(self) -> None:
        self._settings = get_settings_service()

    async def generate(
        self,
        message: str,
        mode: str = "general",
        context_file_ids: Optional[List[str]] = None,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Generate a response using Ollama or fall back to stub.

        Returns (reply_text, meta_dict).
        """
        cfg = self._settings.get_llm_config()
        provider = cfg.get("provider", "ollama")
        start = time.monotonic()

        if provider == "ollama":
            reply, meta = await self._generate_ollama(message, mode, history or [], cfg)
        else:
            reply, meta = self._generate_stub(message, mode, context_file_ids or [])

        elapsed_ms = int((time.monotonic() - start) * 1000)
        meta["latency_ms"] = elapsed_ms
        meta["mode"] = mode
        return reply, meta

    async def _generate_ollama(
        self,
        message: str,
        mode: str,
        history: List[Dict[str, str]],
        cfg: Dict[str, Any],
    ) -> Tuple[str, Dict[str, Any]]:
        ollama_url = cfg.get("ollama_url", "http://localhost:11434").rstrip("/")
        model = cfg.get("model", "llama3.2")
        temperature = cfg.get("temperature", 0.7)
        system_prompt = self._settings.get_system_prompt(mode)

        messages: List[Dict[str, str]] = [{"role": "system", "content": system_prompt}]
        messages.extend(history)
        messages.append({"role": "user", "content": message})

        payload = {
            "model": model,
            "messages": messages,
            "options": {"temperature": temperature},
            "stream": False,
        }

        timeout = cfg.get("timeout_seconds", 180)
        try:
            timeout = max(10, min(3600, float(timeout)))
        except (ValueError, TypeError):
            logger.warning("Invalid timeout value: %s, using default 180s", timeout)
            timeout = 180.0
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                resp = await client.post(f"{ollama_url}/api/chat", json=payload)
                resp.raise_for_status()
                data = resp.json()
                reply = data.get("message", {}).get("content", "")
                return reply, {
                    "provider": "ollama",
                    "model": model,
                }
        except httpx.ConnectError:
            logger.warning("Ollama not available at %s, falling back to stub", ollama_url)
            return self._generate_stub(message, mode, [])[0], {
                "provider": "stub",
                "model": "stub",
                "fallback_reason": "Ollama not reachable",
            }
        except Exception as exc:
            logger.error("Ollama error: %s", exc)
            return f"[Chyba LLM: {exc}]", {
                "provider": "error",
                "model": model,
                "error": str(exc),
            }

    def _generate_stub(
        self, message: str, mode: str, context_file_ids: List[str]
    ) -> Tuple[str, Dict[str, Any]]:
        reply = (
            f"[Stub] MODE={mode}, "
            f"CONTEXT_FILES={len(context_file_ids)}, "
            f"MESSAGE={message}"
        )
        return reply, {"provider": "stub", "model": "stub"}

    async def check_ollama_health(self) -> Dict[str, Any]:
        """Check if Ollama is running and return available models."""
        cfg = self._settings.get_llm_config()
        ollama_url = cfg.get("ollama_url", "http://localhost:11434").rstrip("/")
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{ollama_url}/api/tags")
                resp.raise_for_status()
                data = resp.json()
                models = [m["name"] for m in data.get("models", [])]
                return {"status": "ok", "models": models, "url": ollama_url}
        except Exception as exc:
            return {"status": "unavailable", "error": str(exc), "url": ollama_url}


_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
