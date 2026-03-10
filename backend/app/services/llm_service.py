"""LLM service – Ollama integration with graceful stub fallback."""
import json
import logging
import time
from typing import Any, AsyncGenerator, Dict, List, Optional, Tuple

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
        profile: Optional[str] = None,
        context_file_ids: Optional[List[str]] = None,
        history: Optional[List[Dict[str, str]]] = None,
        model_override: Optional[str] = None,
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Generate a response using Ollama or fall back to stub.

        *profile* selects the LLM profile (chat | powerbi | lean | vision) whose
        model and sampling params override the global defaults.
        *model_override* overrides the model from profile/settings for this request.

        Returns (reply_text, meta_dict).
        """
        cfg = self._settings.get_llm_config(profile=profile)
        if model_override:
            cfg["model"] = model_override
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
        system_prompt = self._settings.get_system_prompt(mode)

        messages: List[Dict[str, str]] = [{"role": "system", "content": system_prompt}]
        messages.extend(history)
        messages.append({"role": "user", "content": message})

        # Token management – trim if approaching context limit
        from app.utils.token_utils import (
            estimate_messages_tokens,
            get_model_context_limit,
            trim_messages_to_fit,
        )

        context_limit = get_model_context_limit(model)
        tokens_estimated = estimate_messages_tokens(messages)
        history_trimmed = False

        if tokens_estimated > int(context_limit * 0.8):
            logger.warning(
                "Token estimate %d exceeds 80%% of context limit %d for model %s, trimming",
                tokens_estimated, context_limit, model,
            )
            messages, history_trimmed = trim_messages_to_fit(
                messages, int(context_limit * 0.8)
            )
            tokens_estimated = estimate_messages_tokens(messages)

        # Build sampling options – include only non-None values
        options: Dict[str, Any] = {}
        if cfg.get("temperature") is not None:
            options["temperature"] = float(cfg["temperature"])
        if cfg.get("top_p") is not None:
            options["top_p"] = float(cfg["top_p"])
        if cfg.get("top_k") is not None:
            options["top_k"] = int(cfg["top_k"])
        if cfg.get("max_tokens") is not None:
            options["num_predict"] = int(cfg["max_tokens"])

        payload = {
            "model": model,
            "messages": messages,
            "options": options,
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
                    "temperature": options.get("temperature"),
                    "tokens_estimated": tokens_estimated,
                    "context_limit": context_limit,
                    "context_usage_percent": round(tokens_estimated / context_limit * 100, 1),
                    "history_trimmed": history_trimmed,
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

    async def generate_stream(
        self,
        message: str,
        mode: str = "general",
        profile: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None,
        model_override: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """Stream tokens from Ollama as an async generator.

        Yields individual token strings as they arrive from the NDJSON stream.
        Falls back to a single stub yield if Ollama is unavailable.
        """
        cfg = self._settings.get_llm_config(profile=profile)
        ollama_url = cfg.get("ollama_url", "http://localhost:11434").rstrip("/")
        model = model_override or cfg.get("model", "llama3.2")
        system_prompt = self._settings.get_system_prompt(mode)

        messages: List[Dict[str, str]] = [{"role": "system", "content": system_prompt}]
        messages.extend(history or [])
        messages.append({"role": "user", "content": message})

        options: Dict[str, Any] = {}
        if cfg.get("temperature") is not None:
            options["temperature"] = float(cfg["temperature"])
        if cfg.get("top_p") is not None:
            options["top_p"] = float(cfg["top_p"])
        if cfg.get("top_k") is not None:
            options["top_k"] = int(cfg["top_k"])
        if cfg.get("max_tokens") is not None:
            options["num_predict"] = int(cfg["max_tokens"])

        payload = {
            "model": model,
            "messages": messages,
            "options": options,
            "stream": True,
        }

        timeout_val = cfg.get("timeout_seconds", 180)
        try:
            timeout_val = max(10, min(3600, float(timeout_val)))
        except (ValueError, TypeError):
            timeout_val = 180.0

        try:
            async with httpx.AsyncClient(timeout=timeout_val) as client:
                async with client.stream(
                    "POST", f"{ollama_url}/api/chat", json=payload
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
        except httpx.ConnectError:
            logger.warning("Ollama not available for streaming, yielding stub")
            yield "[Stub] Ollama is not reachable. Please start Ollama."
        except Exception as exc:
            logger.error("Ollama stream error: %s", exc, exc_info=True)
            yield f"[Chyba LLM: {exc}]"

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
