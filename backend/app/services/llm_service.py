"""LLM service – Ollama integration with graceful stub fallback."""
import asyncio
import json
import logging
import time
from typing import Any, AsyncGenerator, Dict, List, Optional, Tuple

import httpx

from app.services.settings_service import get_settings_service
from app.utils.circuit_breaker import (
    CircuitBreakerOpen,
    get_ollama_circuit_breaker,
)
from app.utils.retry import async_retry

logger = logging.getLogger(__name__)

# Model routing table – maps task profile to Ollama model name
MODEL_ROUTING: dict[str, str] = {
    "code":       "qwen2.5-coder:3b",   # coding tasks, git, vscode
    "research":   "llama3.2",            # research, document analysis
    "general":    "llama3.2",            # general chat
    "powerbi":    "qwen2.5-coder:3b",   # DAX, Power BI
    "lean":       "llama3.2",            # Lean/CI
    "summarize":  "llama3.2",            # KB summarization, context compression
    "vision":     "llava:7b",            # image analysis
    "embed":      "nomic-embed-text",    # embeddings (nezměn stávající logiku)
}


def resolve_model(profile: str, settings_override: str | None = None) -> str:
    """
    Resolve which Ollama model to use for a given profile.
    Priority: settings_override > MODEL_ROUTING[profile] > default llama3.2
    """
    if settings_override:
        return settings_override
    return MODEL_ROUTING.get(profile, "llama3.2")


def get_keep_alive_for_model(model: str, *, for_overnight: bool = False) -> int | str:
    """Return the Ollama keep_alive value appropriate for *model*.

    Aggressive unloading keeps peak RAM low on an 8 GB machine:
    - overnight / batch jobs → 0  (unload immediately after response)
    - llava:7b (vision)       → 0  (large model, always unload)
    - qwen2.5-coder variants  → "120s"
    - llama3.2 / summarize    → "60s"
    """
    if for_overnight:
        return 0
    name = model.lower()
    if "llava" in name:
        return 0
    if "qwen2.5-coder" in name or "coder" in name:
        return "120s"
    # default: small llama / summarizer
    return "60s"


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
        for_overnight: bool = False,
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Generate a response using Ollama or fall back to stub.

        *profile* selects the LLM profile (chat | powerbi | lean | vision) whose
        model and sampling params override the global defaults.
        *model_override* overrides the model from profile/settings for this request.
        *for_overnight* signals batch/overnight context → keep_alive=0 so the
        model is unloaded from RAM immediately after the call.

        Returns (reply_text, meta_dict).
        """
        cfg = self._settings.get_llm_config(profile=profile)
        cfg["model"] = resolve_model(profile or "general", model_override or cfg.get("model"))
        provider = cfg.get("provider", "ollama")
        start = time.monotonic()

        keep_alive = get_keep_alive_for_model(cfg["model"], for_overnight=for_overnight)

        if provider == "ollama":
            reply, meta = await self._generate_ollama(
                message, mode, history or [], cfg, keep_alive=keep_alive
            )
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
        keep_alive: int | str | None = None,
    ) -> Tuple[str, Dict[str, Any]]:
        ollama_url = cfg.get("ollama_url", "http://localhost:11434").rstrip("/")
        model = cfg.get("model", "llama3.2")
        system_prompt = self._settings.get_system_prompt(mode)

        # 5H-3: Add structured output hints based on message content
        system_prompt = self._add_structured_hints(system_prompt, message)

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

        payload: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "options": options,
            "stream": False,
        }
        if keep_alive is not None:
            payload["keep_alive"] = keep_alive

        timeout = cfg.get("timeout_seconds", 180)
        try:
            timeout = max(10, min(3600, float(timeout)))
        except (ValueError, TypeError):
            logger.warning("Invalid timeout value: %s, using default 180s", timeout)
            timeout = 180.0
        meta_base = {
            "provider": "ollama",
            "model": model,
            "temperature": options.get("temperature"),
            "tokens_estimated": tokens_estimated,
            "context_limit": context_limit,
            "context_usage_percent": round(tokens_estimated / context_limit * 100, 1),
            "history_trimmed": history_trimmed,
            "keep_alive": keep_alive,
        }

        try:
            async with asyncio.timeout(timeout):
                reply = await self._call_ollama(ollama_url, payload, timeout)

                # 5H-1: Retry on empty response (max 2 retries)
                retries = 0
                while not reply.strip() and retries < 2:
                    retries += 1
                    logger.warning("Empty response from Ollama (retry %d/2)", retries)
                    retry_payload = dict(payload)
                    retry_msgs = list(messages) + [
                        {"role": "system", "content": "Předchozí pokus vrátil prázdnou odpověď. Odpověz prosím na otázku uživatele."}
                    ]
                    retry_payload["messages"] = retry_msgs
                    reply = await self._call_ollama(ollama_url, retry_payload, timeout)

                if not reply.strip():
                    reply = "[Model nevrátil odpověď. Zkus jiný model nebo restartuj Ollamu.]"
                    meta_base["empty_response_fallback"] = True

                # 5H-2: Language detection and auto-translation
                meta_base["language_detected"] = "cs"
                meta_base["auto_translated"] = False
                settings = self._settings.load()
                auto_translate = settings.get("auto_translate_to_czech", True)

                if auto_translate and self._looks_english(reply):
                    meta_base["language_detected"] = "en"
                    logger.info("Response detected as English, auto-translating to Czech")
                    translate_payload: Dict[str, Any] = {
                        "model": model,
                        "messages": [
                            {"role": "system", "content": "Přelož následující text do češtiny. Zachovej formátování a odborné termíny."},
                            {"role": "user", "content": f"Přelož do češtiny: {reply}"},
                        ],
                        "options": options,
                        "stream": False,
                    }
                    if keep_alive is not None:
                        translate_payload["keep_alive"] = keep_alive
                    try:
                        translated = await self._call_ollama(ollama_url, translate_payload, timeout)
                        if translated.strip():
                            reply = translated
                            meta_base["auto_translated"] = True
                    except Exception as exc:
                        logger.warning("Auto-translation failed: %s", exc)

            return reply, meta_base

        except asyncio.TimeoutError:
            logger.warning(
                "Ollama call timed out for model %s after %.0fs (mode=%s)",
                model, timeout, mode,
            )
            return (
                f"[Timeout: model {model} neodpověděl do {timeout:.0f}s. "
                "Zkus kratší zprávu nebo restartuj Ollamu.]",
                {
                    "provider": "timeout",
                    "model": model,
                    "error": f"asyncio timeout after {timeout}s",
                },
            )
        except httpx.ConnectError:
            await cb.record_failure()
            logger.warning("Ollama not available at %s, falling back to stub", ollama_url)
            return self._generate_stub(message, mode, [])[0], {
                "provider": "stub",
                "model": "stub",
                "fallback_reason": "Ollama not reachable",
            }
        except (httpx.TimeoutException, httpx.HTTPStatusError) as exc:
            await cb.record_failure()
            logger.error("Ollama error after retries: %s", exc, exc_info=True)
            return f"[Chyba LLM: {exc}]", {
                "provider": "error",
                "model": model,
                "error": str(exc),
            }
        except Exception as exc:
            logger.error("Ollama error: %s", exc, exc_info=True)
            return f"[Chyba LLM: {exc}]", {
                "provider": "error",
                "model": model,
                "error": str(exc),
            }

    @staticmethod
    async def _call_ollama(ollama_url: str, payload: dict, timeout: float) -> str:
        """Make a single non-streaming call to Ollama and return the reply text."""
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(f"{ollama_url}/api/chat", json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data.get("message", {}).get("content", "")

    @staticmethod
    def _add_structured_hints(system_prompt: str, message: str) -> str:
        """Add formatting hints to system prompt based on message keywords."""
        msg_lower = message.lower()
        hints = []

        comparison_keywords = ["porovnej", "rozdíl mezi", "rozdil mezi", "pros and cons",
                               "výhody nevýhody", "vyhody nevyhody", "compare", "vs"]
        if any(kw in msg_lower for kw in comparison_keywords):
            hints.append("Uživatel požádal o porovnání. Použij markdown tabulku nebo strukturovaný seznam.")

        step_keywords = ["jak", "postup", "návod", "navod", "steps", "how to", "kroky", "tutorial"]
        if any(kw in msg_lower for kw in step_keywords):
            hints.append("Odpověz jako číslovaný seznam kroků.")

        if hints:
            return system_prompt + "\n\n" + "\n".join(hints)
        return system_prompt

    @staticmethod
    def _looks_english(text: str) -> bool:
        """Heuristic: if text is >50 words and lacks Czech diacritics, it's likely English."""
        words = text.split()
        if len(words) < 50:
            return False
        czech_chars = set("áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ")
        czech_count = sum(1 for c in text if c in czech_chars)
        # If less than 0.5% of characters are Czech diacritics, likely English
        return (czech_count / max(len(text), 1)) < 0.005

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
        for_overnight: bool = False,
    ) -> AsyncGenerator[str, None]:
        """Stream tokens from Ollama as an async generator.

        Yields individual token strings as they arrive from the NDJSON stream.
        Falls back to a single stub yield if Ollama is unavailable.
        *for_overnight* triggers keep_alive=0 so the model is unloaded after the call.
        """
        cfg = self._settings.get_llm_config(profile=profile)
        ollama_url = cfg.get("ollama_url", "http://localhost:11434").rstrip("/")
        model = resolve_model(profile or "general", model_override or cfg.get("model"))
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

        keep_alive = get_keep_alive_for_model(model, for_overnight=for_overnight)

        payload: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "options": options,
            "stream": True,
        }
        if keep_alive is not None:
            payload["keep_alive"] = keep_alive

        timeout_val = cfg.get("timeout_seconds", 180)
        try:
            timeout_val = max(10, min(3600, float(timeout_val)))
        except (ValueError, TypeError):
            timeout_val = 180.0

        try:
            async with asyncio.timeout(timeout_val):
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
        except asyncio.TimeoutError:
            logger.warning(
                "Ollama stream timed out for model %s after %.0fs", model, timeout_val
            )
            yield (
                f"[Timeout: model {model} neodpověděl do {timeout_val:.0f}s. "
                "Zkus kratší zprávu nebo restartuj Ollamu.]"
            )
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
