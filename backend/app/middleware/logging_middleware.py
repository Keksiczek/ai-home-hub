"""Request ID and structured logging middleware (4B).

Generates a unique request_id (UUID4, 8-char) per request, adds it to
response headers as ``X-Request-ID``, and logs each request as a JSON line.
"""

import contextvars
import json
import logging
import time
import uuid
from typing import Optional

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("app.request")

# ContextVar so any service/router can access the current request_id
request_id_var: contextvars.ContextVar[str] = contextvars.ContextVar(
    "request_id", default=""
)


def get_request_id() -> str:
    """Return the current request_id from context, or empty string."""
    return request_id_var.get()


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Assign a unique request_id to each request and log structured JSON."""

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # Generate short request ID
        rid = uuid.uuid4().hex[:8]
        token = request_id_var.set(rid)

        start = time.monotonic()
        try:
            response = await call_next(request)
        except Exception:
            # Let the exception propagate; log below
            elapsed_ms = int((time.monotonic() - start) * 1000)
            _log_request(rid, request.method, request.url.path, 500, elapsed_ms)
            raise
        finally:
            request_id_var.reset(token)

        elapsed_ms = int((time.monotonic() - start) * 1000)
        response.headers["X-Request-ID"] = rid

        _log_request(
            rid, request.method, request.url.path, response.status_code, elapsed_ms
        )

        return response


def _log_request(
    request_id: str,
    method: str,
    path: str,
    status_code: int,
    latency_ms: int,
) -> None:
    """Emit a single JSON log line for each request."""
    entry = {
        "request_id": request_id,
        "method": method,
        "path": path,
        "status_code": status_code,
        "latency_ms": latency_ms,
    }
    logger.info(json.dumps(entry, ensure_ascii=False))
