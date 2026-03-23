"""Async retry decorator with exponential backoff for Ollama calls (4A)."""

import asyncio
import functools
import logging
from typing import Any, Callable, Tuple, Type

import httpx

logger = logging.getLogger(__name__)

# Default retryable exceptions for Ollama HTTP calls
RETRYABLE_EXCEPTIONS: Tuple[Type[BaseException], ...] = (
    httpx.ConnectError,
    httpx.TimeoutException,
    httpx.HTTPStatusError,
)


def async_retry(
    max_attempts: int = 3,
    backoff_base: float = 1.5,
    retryable_exceptions: Tuple[Type[BaseException], ...] = RETRYABLE_EXCEPTIONS,
) -> Callable:
    """Decorator that retries an async function with exponential backoff.

    Args:
        max_attempts: Maximum number of attempts (including the first).
        backoff_base: Base multiplier for exponential backoff (seconds).
        retryable_exceptions: Tuple of exception types that trigger a retry.

    Backoff schedule: 1s, 1.5s, 2.25s, ...
    """

    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            last_exception: BaseException | None = None
            for attempt in range(1, max_attempts + 1):
                try:
                    return await func(*args, **kwargs)
                except retryable_exceptions as exc:
                    last_exception = exc
                    if attempt < max_attempts:
                        delay = backoff_base ** (attempt - 1)
                        logger.warning(
                            "Retry %d/%d for %s after %s (delay %.2fs)",
                            attempt,
                            max_attempts,
                            func.__name__,
                            exc,
                            delay,
                        )
                        await asyncio.sleep(delay)
                    else:
                        logger.error(
                            "All %d attempts failed for %s: %s",
                            max_attempts,
                            func.__name__,
                            exc,
                        )
            raise last_exception  # type: ignore[misc]

        return wrapper

    return decorator
