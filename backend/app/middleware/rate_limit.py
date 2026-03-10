"""Rate limiting middleware (4F).

Uses an in-memory token-bucket approach per IP + path prefix.

Limits:
  - POST /api/chat/multimodal → 20 req/min per IP
  - POST /api/chat            → 30 req/min per IP
  - POST /api/agents/*/run    → 10 req/min per IP
  - POST /api/knowledge/ingest → 2 req/min per IP
  - Default                   → 100 req/min per IP

Controlled by ``rate_limit_enabled`` in settings.json (default: true).
"""

import logging
import time
from collections import defaultdict
from typing import Any, Dict, Optional, Tuple

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

# Rate limit configurations: (path_prefix, method) -> max_per_minute
# Order matters: more specific prefixes first
RATE_LIMITS = [
    ("/api/chat/multimodal", "POST", 20),
    ("/api/chat", "POST", 30),
    ("/api/knowledge/ingest", "POST", 2),
    ("/api/knowledge/incremental-ingest", "POST", 2),
    ("/api/agents/", "POST", 10),
]
DEFAULT_LIMIT_PER_MINUTE = 100


class _TokenBucket:
    """Simple per-key token bucket rate limiter."""

    def __init__(self) -> None:
        # key -> (tokens, last_refill_time)
        self._buckets: Dict[str, Tuple[float, float]] = {}

    def is_allowed(self, key: str, max_per_minute: int) -> bool:
        """Check if a request is allowed and consume a token."""
        now = time.monotonic()
        tokens, last_refill = self._buckets.get(key, (float(max_per_minute), now))

        # Refill tokens based on elapsed time
        elapsed = now - last_refill
        tokens = min(float(max_per_minute), tokens + elapsed * (max_per_minute / 60.0))

        if tokens >= 1.0:
            self._buckets[key] = (tokens - 1.0, now)
            return True

        self._buckets[key] = (tokens, now)
        return False

    def cleanup(self, max_age: float = 300.0) -> None:
        """Remove stale entries older than max_age seconds."""
        now = time.monotonic()
        stale_keys = [
            k for k, (_, t) in self._buckets.items() if now - t > max_age
        ]
        for k in stale_keys:
            del self._buckets[k]


_bucket = _TokenBucket()
_last_cleanup = time.monotonic()


def _get_limit_for_path(path: str, method: str) -> int:
    """Return the rate limit (per minute) for a given path and method."""
    for prefix, m, limit in RATE_LIMITS:
        if method == m and path.startswith(prefix):
            return limit
    return DEFAULT_LIMIT_PER_MINUTE


def setup_rate_limiting(app: FastAPI) -> None:
    """Install rate limiting middleware on the FastAPI app."""

    @app.middleware("http")
    async def rate_limit_middleware(request: Request, call_next):
        global _last_cleanup

        # Check if rate limiting is enabled in settings
        try:
            from app.services.settings_service import get_settings_service
            settings = get_settings_service().load()
            if not settings.get("rate_limit_enabled", True):
                return await call_next(request)
        except Exception:
            pass

        # Periodic cleanup of stale buckets
        now = time.monotonic()
        if now - _last_cleanup > 60:
            _bucket.cleanup()
            _last_cleanup = now

        # Determine client IP
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path
        method = request.method

        limit = _get_limit_for_path(path, method)
        bucket_key = f"{client_ip}:{path}:{method}"

        if not _bucket.is_allowed(bucket_key, limit):
            retry_after = 60
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Too Many Requests",
                    "retry_after": retry_after,
                },
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Reset": str(retry_after),
                },
            )

        return await call_next(request)
