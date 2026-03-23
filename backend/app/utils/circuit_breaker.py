"""Circuit breaker for Ollama endpoint (4A).

States:
  CLOSED  – normal operation, requests flow through.
  OPEN    – after 5 consecutive failures, all requests are blocked.
  HALF_OPEN – after 30s cooldown, one test request is allowed through.
"""

import asyncio
import logging
import time
from enum import Enum
from typing import Optional

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
