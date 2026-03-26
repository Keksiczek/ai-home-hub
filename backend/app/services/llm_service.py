"""LLM service – Ollama integration with circuit breaker, retry, and structured errors."""

import asyncio
import json
import logging
import os
import time
from dataclasses import dataclass
from datetime import datetime
from typing import Any, AsyncGenerator, Dict, List, Optional, Tuple

import httpx
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.services.llm_profiles import get_llm_profile_registry
from app.services.metrics_service import ollama_latency_seconds, ollama_requests_total
from app.services.settings_service import get_settings_service
from app.utils.circuit_breaker import (
    CircuitBreakerOpen,
    get_model_circuit_breaker_registry,
    get_ollama_circuit_breaker,
    get_timeout_for_request,
)
from app.utils.constants import (
    LLM_CPU_BACKEND,
    LLM_MAX_CONCURRENT_REQUESTS,
    LLM_NUM_PREDICT,
    LLM_NUM_THREADS,
    LLM_SEMAPHORE_TIMEOUT,
)

logger = logging.getLogger(__name__)

# ── Global backpressure semaphore ────────────────────────────────────────────
# Limits concurrent Ollama requests across the entire application.  Shared by
# all callers (chat, agent orchestrator, resident reasoner, …).  Default is 1
# because a single-GPU Ollama instance typically cannot serve parallel requests
# without OOM or heavy swap.  Configurable via LLM_MAX_CONCURRENT_REQUESTS env.
_llm_semaphore = asyncio.Semaphore(LLM_MAX_CONCURRENT_REQUESTS)


class LLMOverloadedError(Exception):
    """Raised when the LLM semaphore cannot be acquired within the timeout.

    Callers (orchestrators, job workers) can catch this specifically to decide
    whether to retry later or abort gracefully.
    """

    def __init__(self, timeout: float) -> None:
        self.timeout = timeout
        super().__init__(
            f"LLM overloaded: semaphore not acquired within {timeout:.0f}s "
            f"(max_concurrent={LLM_MAX_CONCURRENT_REQUESTS})"
        )

_DAYS_CS = ["pondělí", "úterý", "středa", "čtvrtek", "pátek", "sobota", "neděle"]
_MONTHS_CS = [
    "ledna",
    "února",
    "března",
    "dubna",
    "května",
    "června",
    "července",
    "srpna",
    "září",
    "října",
    "listopadu",
    "prosince",
]


@dataclass
class LLMResponse:
    """Structured response from the LLM with rich-text variants.

    *text* and *markdown* contain the same raw LLM output (which already uses
    Markdown syntax). *html* is reserved for a future markdown→HTML render pass
    and is ``None`` until that is wired up.
    """

    text: str       # full response text (Markdown syntax, Unicode emoji)
    markdown: str   # same content, explicitly tagged as Markdown
    html: str | None = None  # rendered HTML – populated when a renderer is wired in

    def as_dict(self) -> Dict[str, Any]:
        return {"plain_text": self.text, "markdown": self.markdown, "html": self.html}


# System-prompt hint appended to every LLM request to encourage consistent
# Markdown + emoji formatting.  Kept short so it doesn't eat token budget.
_MARKDOWN_SYSTEM_HINT = (
    "\n\nFormátování výstupů: Odpovídej v čistém textu s Markdown formátováním "
    "(nadpisy, odrážky, kódové bloky). Emoji používej střídmě jako obyčejné "
    "Unicode znaky (např. 👋, ✅). Nezalamuj kódové bloky do HTML tagů."
)


def get_date_context() -> str:
    """Return current date/time as a Czech-language string for injection into system prompts."""
    now = datetime.now()
    day_name = _DAYS_CS[now.weekday()]
    return (
        f"Aktuální datum a čas: {now.day}. {_MONTHS_CS[now.month - 1]} {now.year}, "
        f"{day_name}, {now.strftime('%H:%M')}\n"
    )


# Model routing table – maps task profile to Ollama model name
MODEL_ROUTING: dict[str, str] = {
    "code": "qwen2.5-coder:3b",  # coding tasks, git, vscode
    "research": "llama3.2:latest",  # research, document analysis
    "general": "llama3.2:latest",  # general chat
    "powerbi": "qwen2.5-coder:3b",  # DAX, Power BI
    "pbi": "llama3.2:latest",  # Power BI chat (non-code)
    "lean": "llama3.2:latest",  # Lean/CI
    "mac": "llama3.2:latest",  # macOS admin
    "agent": "llama3.2:latest",  # agent orchestration
    "summarize": "llama3.2:latest",  # KB summarization, context compression
    "vision": "llava:7b",  # image analysis
    "embed": "nomic-embed-text",  # embeddings (nezměn stávající logiku)
}


def resolve_model(profile: str, settings_override: str | None = None) -> str:
    """
    Resolve which Ollama model to use for a given profile.
    Priority: settings_override > MODEL_ROUTING[profile] > default llama3.2
    """
    if settings_override:
        return settings_override
    return MODEL_ROUTING.get(profile, "llama3.2")


def get_keep_alive_for_model(
    model: str,
    *,
    for_overnight: bool = False,
    config_default: str | int | None = None,
) -> int | str:
    """Return the Ollama keep_alive value appropriate for *model*.

    Priority:
    - overnight / batch jobs → 0  (unload immediately after response)
    - llava:7b (vision)       → 0  (large model, always unload)
    - qwen2.5-coder variants  → "120s"
    - general models          → config_default (from settings) or "5m"

    *config_default* is read from ``llm.ollama_performance.keep_alive`` in
    settings.json so operators can tune it without code changes.
    """
    if for_overnight:
        return 0
    name = model.lower()
    if "llava" in name:
        return 0
    if "qwen2.5-coder" in name or "coder" in name:
        return "120s"
    # Use operator-configured default; fall back to 5 minutes
    return config_default if config_default is not None else "5m"


def _llm_unavailable_response(
    model: str, reason: str, retry_after_s: int = 60
) -> Tuple[str, Dict[str, Any]]:
    """Build a structured 'llm_unavailable' response for the frontend."""
    return (
        f"[LLM nedostupné: {reason}]",
        {
            "status": "llm_unavailable",
            "provider": "ollama",
            "model": model,
            "message": reason,
            "retry_after_s": retry_after_s,
        },
    )


# Retry decorator for raw Ollama HTTP calls.
# Retries on transient errors (connect, timeout) but NOT on 4xx client errors.
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((httpx.ConnectError, httpx.TimeoutException)),
    reraise=True,
)
async def _call_ollama_with_retry(
    ollama_url: str, payload: dict, timeout: float, *, api_path: str = "/api/chat"
) -> tuple[str, dict]:
    """Make a single non-streaming call to Ollama with tenacity retry.

    Returns (response_text, full_response_data) so callers can extract
    token usage metadata (prompt_eval_count, eval_count, etc.).
    """
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(f"{ollama_url}{api_path}", json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data.get("message", {}).get("content", ""), data


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
        cfg["model"] = resolve_model(
            profile or "general", model_override or cfg.get("model")
        )
        provider = cfg.get("provider", "ollama")
        start = time.monotonic()

        keep_alive_default = cfg.get("keep_alive_default", "5m")
        keep_alive = get_keep_alive_for_model(
            cfg["model"], for_overnight=for_overnight, config_default=keep_alive_default
        )

        if provider == "ollama":
            try:
                async with asyncio.timeout(LLM_SEMAPHORE_TIMEOUT):
                    await _llm_semaphore.acquire()
            except asyncio.TimeoutError:
                raise LLMOverloadedError(LLM_SEMAPHORE_TIMEOUT)
            try:
                reply, meta = await self._generate_ollama(
                    message, mode, history or [], cfg, keep_alive=keep_alive, profile=profile
                )
            finally:
                _llm_semaphore.release()
        else:
            reply, meta = self._generate_stub(message, mode, context_file_ids or [])

        elapsed_ms = int((time.monotonic() - start) * 1000)
        meta["latency_ms"] = elapsed_ms
        meta["mode"] = mode

        status = (
            "error"
            if meta.get("status") == "llm_unavailable"
            or meta.get("provider") == "error"
            else "success"
        )
        ollama_requests_total.labels(model=cfg["model"], status=status).inc()
        ollama_latency_seconds.labels(model=cfg["model"]).observe(elapsed_ms / 1000)

        return reply, meta

    async def generate_rich(
        self,
        message: str,
        mode: str = "general",
        profile: Optional[str] = None,
        context_file_ids: Optional[List[str]] = None,
        history: Optional[List[Dict[str, str]]] = None,
        model_override: Optional[str] = None,
        for_overnight: bool = False,
    ) -> Tuple["LLMResponse", Dict[str, Any]]:
        """Like :meth:`generate` but returns an :class:`LLMResponse` instead of a plain string.

        The response object carries ``text``, ``markdown`` (same content), and a
        reserved ``html`` field (currently ``None``).  Use this from new code paths
        (job worker, WS push) where the caller needs the structured representation.
        For backward-compatible callers that expect a plain string, :meth:`generate`
        continues to work unchanged.
        """
        text, meta = await self.generate(
            message=message,
            mode=mode,
            profile=profile,
            context_file_ids=context_file_ids,
            history=history,
            model_override=model_override,
            for_overnight=for_overnight,
        )
        return LLMResponse(text=text, markdown=text, html=None), meta

    async def _generate_ollama(
        self,
        message: str,
        mode: str,
        history: List[Dict[str, str]],
        cfg: Dict[str, Any],
        keep_alive: int | str | None = None,
        profile: Optional[str] = None,
        request_type: str = "agent_step",
    ) -> Tuple[str, Dict[str, Any]]:
        ollama_url = cfg.get("ollama_url", "http://localhost:11434").rstrip("/")
        model = cfg.get("model", "llama3.2")
        cb = get_ollama_circuit_breaker()
        model_cb = get_model_circuit_breaker_registry()

        # Per-model circuit breaker: redirect to fallback if model is disabled
        if model_cb.is_disabled(model):
            fallback = model_cb.get_fallback(model)
            logger.warning(
                "Model '%s' je dočasně disabled – přepínám na fallback '%s'",
                model,
                fallback,
            )
            cfg = dict(cfg)
            cfg["model"] = fallback
            model = fallback

        # Circuit breaker: fast-fail if Ollama has been failing repeatedly
        if not await cb.can_execute():
            logger.warning(
                "Circuit breaker OPEN for Ollama – skipping request (model=%s)", model
            )
            return _llm_unavailable_response(
                model,
                "Ollama je dočasně nedostupná (circuit breaker otevřen). Zkus to za chvíli.",
                retry_after_s=int(cb.recovery_timeout),
            )

        prompt_key = profile or mode or "general"
        system_prompt = (
            get_date_context()
            + "\n"
            + self._settings.get_system_prompt(prompt_key)
            + _MARKDOWN_SYSTEM_HINT
        )

        # 5H-3: Add structured output hints based on message content
        system_prompt = self._add_structured_hints(system_prompt, message, mode=mode)

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
                tokens_estimated,
                context_limit,
                model,
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

        # CPU-backend optimisations: inject thread count and token cap
        if LLM_CPU_BACKEND:
            options.setdefault("num_thread", LLM_NUM_THREADS)
            options.setdefault("num_predict", LLM_NUM_PREDICT)
            # Conservative temperature for stable output on CPU
            options.setdefault("temperature", 0.1)
            logger.debug(
                "CPU backend opts applied: num_thread=%d, num_predict=%d",
                options["num_thread"],
                options["num_predict"],
            )

        payload: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "options": options,
            "stream": False,
        }
        if keep_alive is not None:
            payload["keep_alive"] = keep_alive

        # Use request-type-aware timeout; fall back to settings value if larger
        rt_timeout = get_timeout_for_request(request_type, model)
        settings_timeout = cfg.get("timeout_seconds", 180)
        try:
            settings_timeout = max(10, min(3600, float(settings_timeout)))
        except (ValueError, TypeError):
            settings_timeout = 180.0
        # For non-streaming requests prefer the request-type timeout unless
        # the operator configured a longer one explicitly.
        timeout = rt_timeout if rt_timeout <= settings_timeout else settings_timeout
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

        # Resolve profile-specific settings
        profile_reg = get_llm_profile_registry()
        llm_profile = profile_reg.get(profile or "general")

        # Apply profile num_ctx to options if not already set
        if llm_profile.num_ctx and "num_ctx" not in options:
            options["num_ctx"] = llm_profile.num_ctx
            payload["options"] = options

        # Determine API path based on backend type
        backend = os.environ.get("LLM_BACKEND", "ollama").lower()
        api_path = "/v1/chat/completions" if backend == "openai_compatible" else "/api/chat"

        try:
            async with asyncio.timeout(timeout):
                reply, resp_data = await _call_ollama_with_retry(
                    ollama_url, payload, timeout, api_path=api_path
                )

                # Log token usage if available (KROK 2.2)
                prompt_tokens = resp_data.get("prompt_eval_count")
                completion_tokens = resp_data.get("eval_count")
                total_duration = resp_data.get("total_duration")
                if prompt_tokens is not None or completion_tokens is not None:
                    duration_ms = int(total_duration / 1_000_000) if total_duration else 0
                    logger.debug(
                        "LLM %s: %sp + %sc tokens, %dms",
                        model,
                        prompt_tokens or "?",
                        completion_tokens or "?",
                        duration_ms,
                    )
                    meta_base["prompt_tokens"] = prompt_tokens
                    meta_base["completion_tokens"] = completion_tokens

                # 5H-1: Retry on empty response (max 2 retries)
                retries = 0
                while not reply.strip() and retries < 2:
                    retries += 1
                    logger.warning("Empty response from Ollama (retry %d/2)", retries)
                    retry_payload = dict(payload)
                    retry_msgs = list(messages) + [
                        {
                            "role": "system",
                            "content": "Předchozí pokus vrátil prázdnou odpověď. Odpověz prosím na otázku uživatele.",
                        }
                    ]
                    retry_payload["messages"] = retry_msgs
                    reply, _ = await _call_ollama_with_retry(
                        ollama_url, retry_payload, timeout, api_path=api_path
                    )

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
                    logger.info(
                        "Response detected as English, auto-translating to Czech"
                    )
                    translate_payload: Dict[str, Any] = {
                        "model": model,
                        "messages": [
                            {
                                "role": "system",
                                "content": "Přelož následující text do češtiny. Zachovej formátování a odborné termíny.",
                            },
                            {"role": "user", "content": f"Přelož do češtiny: {reply}"},
                        ],
                        "options": options,
                        "stream": False,
                    }
                    if keep_alive is not None:
                        translate_payload["keep_alive"] = keep_alive
                    try:
                        translated, _ = await _call_ollama_with_retry(
                            ollama_url, translate_payload, timeout, api_path=api_path
                        )
                        if translated.strip():
                            reply = translated
                            meta_base["auto_translated"] = True
                    except Exception as exc:
                        logger.warning("Auto-translation failed: %s", exc)

            # Success – reset circuit breakers
            await cb.record_success()
            await model_cb.record_success(model)
            return reply, meta_base

        except asyncio.TimeoutError:
            await cb.record_failure()
            await model_cb.record_failure(model)
            logger.warning(
                "Ollama call timed out for model %s after %.0fs (mode=%s)",
                model,
                timeout,
                mode,
            )
            return _llm_unavailable_response(
                model,
                f"⏱ Model odpovídá pomalu (timeout {timeout:.0f}s). "
                "Zkus kratší dotaz nebo přepni na menší model v nastavení.",
                retry_after_s=30,
            )
        except httpx.ConnectError:
            await cb.record_failure()
            await model_cb.record_failure(model)
            logger.warning(
                "Ollama not available at %s, falling back to stub", ollama_url
            )
            return _llm_unavailable_response(
                model,
                f"🔴 Ollama není dostupná. Zkontroluj, jestli běží na {ollama_url}.",
                retry_after_s=int(cb.recovery_timeout),
            )
        except httpx.HTTPStatusError as exc:
            # 4xx errors are not retried by tenacity; don't trip circuit breaker
            if exc.response.status_code < 500:
                logger.error(
                    "Ollama client error %d: %s", exc.response.status_code, exc
                )
                return f"[Chyba LLM: {exc}]", {
                    "provider": "error",
                    "model": model,
                    "error": str(exc),
                }
            await cb.record_failure()
            await model_cb.record_failure(model)
            logger.error("Ollama server error after retries: %s", exc, exc_info=True)
            return _llm_unavailable_response(
                model,
                f"Ollama vrátila chybu {exc.response.status_code}.",
                retry_after_s=30,
            )
        except httpx.TimeoutException:
            await cb.record_failure()
            await model_cb.record_failure(model)
            logger.error("Ollama HTTP timeout for model %s", model)
            return _llm_unavailable_response(
                model,
                f"⏱ Model odpovídá pomalu (timeout {timeout:.0f}s). "
                "Zkus kratší dotaz nebo přepni na menší model v nastavení.",
                retry_after_s=30,
            )
        except Exception as exc:
            logger.error("Ollama error: %s", exc, exc_info=True)
            return f"[Chyba LLM: {exc}]", {
                "provider": "error",
                "model": model,
                "error": str(exc),
            }

    @staticmethod
    def _add_structured_hints(system_prompt: str, message: str, mode: str = "general") -> str:
        """Add formatting hints to system prompt based on message keywords."""
        if mode not in ("code", "research", "powerbi"):
            return system_prompt
        msg_lower = message.lower()
        hints = []

        comparison_keywords = [
            "porovnej",
            "rozdíl mezi",
            "rozdil mezi",
            "pros and cons",
            "výhody nevýhody",
            "vyhody nevyhody",
            "compare",
            "vs",
        ]
        if any(kw in msg_lower for kw in comparison_keywords):
            hints.append(
                "Uživatel požádal o porovnání. Použij markdown tabulku nebo strukturovaný seznam."
            )

        step_keywords = [
            "jak",
            "postup",
            "návod",
            "navod",
            "steps",
            "how to",
            "kroky",
            "tutorial",
        ]
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
        prompt_key = profile or mode or "general"
        system_prompt = (
            get_date_context()
            + "\n"
            + self._settings.get_system_prompt(prompt_key)
            + _MARKDOWN_SYSTEM_HINT
        )
        system_prompt = self._add_structured_hints(system_prompt, message, mode=mode)
        cb = get_ollama_circuit_breaker()
        model_cb = get_model_circuit_breaker_registry()

        # Per-model circuit breaker: redirect to fallback if model is disabled
        if model_cb.is_disabled(model):
            fallback = model_cb.get_fallback(model)
            logger.warning(
                "Stream: model '%s' je dočasně disabled – přepínám na fallback '%s'",
                model,
                fallback,
            )
            model = fallback

        # Global circuit breaker: fast-fail if Ollama has been failing repeatedly
        if not await cb.can_execute():
            logger.warning(
                "Circuit breaker OPEN – skipping stream request (model=%s)", model
            )
            yield json.dumps(
                {
                    "status": "llm_unavailable",
                    "message": "Ollama je dočasně nedostupná (circuit breaker otevřen).",
                    "retry_after_s": int(cb.recovery_timeout),
                }
            )
            return

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

        # CPU-backend optimisations for streaming
        if LLM_CPU_BACKEND:
            options.setdefault("num_thread", LLM_NUM_THREADS)
            options.setdefault("num_predict", LLM_NUM_PREDICT)
            options.setdefault("temperature", 0.1)

        keep_alive_default = cfg.get("keep_alive_default", "5m")
        keep_alive = get_keep_alive_for_model(
            model, for_overnight=for_overnight, config_default=keep_alive_default
        )

        payload: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "options": options,
            "stream": True,
        }
        if keep_alive is not None:
            payload["keep_alive"] = keep_alive

        # chat_stream timeout governs time-to-first-token; per-chunk read timeout
        # is set shorter so stalled connections are detected quickly.
        chat_stream_timeout = get_timeout_for_request("chat_stream", model)
        stream_http_timeout = httpx.Timeout(
            connect=10.0, read=chat_stream_timeout, write=10.0, pool=5.0
        )
        # Hard outer cap: background jobs may stream for longer
        outer_timeout = get_timeout_for_request(
            "background_job" if for_overnight else "chat_stream", model
        ) * 4  # 4× the per-request timeout as a generous wall-clock cap

        # Acquire the global LLM semaphore before streaming
        try:
            async with asyncio.timeout(LLM_SEMAPHORE_TIMEOUT):
                await _llm_semaphore.acquire()
        except asyncio.TimeoutError:
            yield f"[LLM přetížené – semafor nebyl získán do {LLM_SEMAPHORE_TIMEOUT:.0f}s]"
            return

        try:
            async with asyncio.timeout(outer_timeout):
                async with httpx.AsyncClient(timeout=stream_http_timeout) as client:
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
            # Success – reset circuit breakers
            await cb.record_success()
            await model_cb.record_success(model)
        except asyncio.TimeoutError:
            await cb.record_failure()
            await model_cb.record_failure(model)
            logger.warning(
                "Ollama stream hard-timeout for model %s (%.0fs cap)", model, outer_timeout
            )
            yield "⏱ Model odpovídá pomalu. Zkus kratší dotaz nebo přepni na menší model v nastavení."
        except httpx.TimeoutException as exc:
            # Covers ReadTimeout (stalled chunk) and ConnectTimeout
            await cb.record_failure()
            await model_cb.record_failure(model)
            logger.warning("Ollama HTTP timeout during streaming for model %s: %s", model, exc)
            yield "⏱ Model odpovídá pomalu. Zkus kratší dotaz nebo přepni na menší model v nastavení."
        except httpx.ConnectError:
            await cb.record_failure()
            logger.warning("Ollama not available for streaming, yielding stub")
            yield "[Stub] Ollama is not reachable. Please start Ollama."
        except Exception as exc:
            await cb.record_failure()
            logger.error("Ollama stream error: %s", exc, exc_info=True)
            yield f"[Chyba LLM: {exc}]"
        finally:
            _llm_semaphore.release()

    async def stream_chat(
        self,
        message: str,
        mode: str = "general",
        profile: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None,
        model_override: Optional[str] = None,
        for_overnight: bool = False,
    ) -> AsyncGenerator[str, None]:
        """Public streaming API – yields token strings from Ollama.

        Delegates to :meth:`generate_stream`.  Use this from WebSocket handlers
        and the job worker when you need incremental output.  For a single
        collected response, use :meth:`generate` instead.
        """
        async for token in self.generate_stream(
            message=message,
            mode=mode,
            profile=profile,
            history=history,
            model_override=model_override,
            for_overnight=for_overnight,
        ):
            yield token

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


async def unload_model(model_name: str) -> None:
    """Explicitně uvolní model z Ollama RAM (keep_alive=0)."""
    try:
        cfg = get_settings_service().get_llm_config()
        ollama_url = cfg.get("ollama_url", "http://localhost:11434").rstrip("/")
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(
                f"{ollama_url}/api/generate",
                json={"model": model_name, "keep_alive": 0, "prompt": ""},
            )
        logger.info("Unloaded model %s from Ollama RAM", model_name)
    except Exception:
        pass  # ignoruj chyby při unload


_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
