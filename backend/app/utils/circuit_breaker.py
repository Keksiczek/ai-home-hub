"""Circuit breaker for Ollama endpoint (4A).

States:
  CLOSED  – normal operation, requests flow through.
  OPEN    – after 5 consecutive failures, all requests are blocked.
  HALF_OPEN – after 30s cooldown, one test request is allowed through.

Also provides:
- Per-model circuit breaker registry with configurable TTL.
- get_timeout_for_request() helper for request-type-aware timeouts.
"""

import asyncio
import logging
import time
from enum import Enum
from typing import Dict, Optional, Tuple

logger = logging.getLogger(__name__)


class CircuitState(str, Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"


class CircuitBreaker:
    """Simple circuit breaker for a single endpoint."""

    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: float = 30.0,
        name: str = "ollama",
    ) -> None:
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.name = name

        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._last_failure_time: float = 0.0
        self._lock = asyncio.Lock()

    @property
    def state(self) -> CircuitState:
        if self._state == CircuitState.OPEN:
            elapsed = time.monotonic() - self._last_failure_time
            if elapsed >= self.recovery_timeout:
                return CircuitState.HALF_OPEN
        return self._state

    async def can_execute(self) -> bool:
        """Check if a request is allowed through the circuit breaker."""
        current = self.state
        if current == CircuitState.CLOSED:
            return True
        if current == CircuitState.HALF_OPEN:
            return True
        return False

    async def record_success(self) -> None:
        """Record a successful request, resetting the circuit breaker."""
        async with self._lock:
            self._failure_count = 0
            if self._state != CircuitState.CLOSED:
                logger.info("Circuit breaker '%s' closed (recovered)", self.name)
            self._state = CircuitState.CLOSED

    async def record_failure(self) -> None:
        """Record a failed request. Opens the circuit after threshold is reached."""
        async with self._lock:
            self._failure_count += 1
            self._last_failure_time = time.monotonic()
            if self._failure_count >= self.failure_threshold:
                if self._state != CircuitState.OPEN:
                    logger.warning(
                        "Circuit breaker '%s' opened after %d consecutive failures",
                        self.name,
                        self._failure_count,
                    )
                self._state = CircuitState.OPEN

    def reset(self) -> None:
        """Manually reset the circuit breaker to closed state."""
        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._last_failure_time = 0.0


class CircuitBreakerOpen(Exception):
    """Raised when a request is blocked by an open circuit breaker."""

    def __init__(self, name: str) -> None:
        self.name = name
        super().__init__(f"Circuit breaker '{name}' is open – requests blocked")


# Singleton instance for the Ollama endpoint
_ollama_breaker: Optional[CircuitBreaker] = None


def get_ollama_circuit_breaker() -> CircuitBreaker:
    global _ollama_breaker
    if _ollama_breaker is None:
        _ollama_breaker = CircuitBreaker(name="ollama")
    return _ollama_breaker


# ── Per-model circuit breaker ─────────────────────────────────────────────────


class ModelCircuitBreakerRegistry:
    """Per-model failure tracking with configurable TTL.

    After ``failure_threshold`` consecutive failures the model is marked
    disabled for ``disable_ttl`` seconds.  A configurable ``fallback_model``
    is returned so callers can retry with a lighter model.
    """

    def __init__(
        self,
        failure_threshold: int = 3,
        disable_ttl: float = 300.0,
        fallback_model: str = "llama3.2:3b",
    ) -> None:
        self._failure_threshold = failure_threshold
        self._disable_ttl = disable_ttl
        self._fallback_model = fallback_model
        # {model: (consecutive_failures, last_failure_ts)}
        self._state: Dict[str, Tuple[int, float]] = {}
        self._lock = asyncio.Lock()

    async def record_failure(self, model: str) -> None:
        async with self._lock:
            failures, _ = self._state.get(model, (0, 0.0))
            failures += 1
            self._state[model] = (failures, time.monotonic())
            if failures >= self._failure_threshold:
                logger.warning(
                    "Model '%s' dočasně disabled kvůli %d po sobě jdoucím timeoutům "
                    "(bude znovu dostupný za %.0f s)",
                    model,
                    failures,
                    self._disable_ttl,
                )

    async def record_success(self, model: str) -> None:
        async with self._lock:
            self._state.pop(model, None)

    def is_disabled(self, model: str) -> bool:
        """Return True if *model* should be bypassed right now."""
        if model not in self._state:
            return False
        failures, last_ts = self._state[model]
        if failures < self._failure_threshold:
            return False
        elapsed = time.monotonic() - last_ts
        if elapsed >= self._disable_ttl:
            # TTL expired – auto-recover (reset on next success)
            return False
        return True

    def get_fallback(self, model: str) -> str:
        """Return the fallback model when *model* is disabled."""
        return self._fallback_model

    def status(self) -> Dict[str, dict]:
        now = time.monotonic()
        result = {}
        for m, (failures, last_ts) in self._state.items():
            elapsed = now - last_ts
            result[m] = {
                "failures": failures,
                "disabled": failures >= self._failure_threshold
                and elapsed < self._disable_ttl,
                "seconds_until_recovery": max(
                    0.0, self._disable_ttl - elapsed
                )
                if failures >= self._failure_threshold
                else 0.0,
            }
        return result


_model_registry: Optional[ModelCircuitBreakerRegistry] = None


def get_model_circuit_breaker_registry() -> ModelCircuitBreakerRegistry:
    global _model_registry
    if _model_registry is None:
        from app.utils.constants import (
            LLM_FALLBACK_MODEL,
            MODEL_CB_DISABLE_TTL,
            MODEL_CB_FAILURE_THRESHOLD,
        )

        _model_registry = ModelCircuitBreakerRegistry(
            failure_threshold=MODEL_CB_FAILURE_THRESHOLD,
            disable_ttl=MODEL_CB_DISABLE_TTL,
            fallback_model=LLM_FALLBACK_MODEL,
        )
    return _model_registry


# ── Request-type timeout helper ───────────────────────────────────────────────


def get_timeout_for_request(request_type: str, model: str = "") -> float:
    """Return the appropriate Ollama timeout (seconds) for *request_type*.

    request_type values:
        ``"chat_stream"``     – 25 s  (streaming chat, fast first token)
        ``"agent_step"``      – 40 s  (agent orchestration step)
        ``"background_job"``  – 120 s (summarisation, KB indexing, overnight)
        anything else         – falls back to ``"agent_step"`` timeout

    The returned value is always bounded to [10, 600] seconds.
    """
    from app.utils.constants import (
        LLM_TIMEOUT_AGENT_STEP,
        LLM_TIMEOUT_BACKGROUND_JOB,
        LLM_TIMEOUT_CHAT_STREAM,
    )

    mapping = {
        "chat_stream": LLM_TIMEOUT_CHAT_STREAM,
        "agent_step": LLM_TIMEOUT_AGENT_STEP,
        "background_job": LLM_TIMEOUT_BACKGROUND_JOB,
    }
    raw = mapping.get(request_type, LLM_TIMEOUT_AGENT_STEP)
    return float(max(10.0, min(600.0, raw)))
