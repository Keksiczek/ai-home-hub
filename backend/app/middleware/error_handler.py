"""Global error handler middleware – catches unhandled exceptions and returns
structured JSON error responses with request correlation.

Persists the last error to a ring buffer for debugging via /api/health/errors.
"""

import logging
import traceback
import time
from collections import deque
from dataclasses import dataclass, asdict
from datetime import datetime, timezone

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.middleware.logging_middleware import get_request_id

logger = logging.getLogger("app.errors")

# Ring buffer of recent errors for debug endpoint
MAX_ERROR_HISTORY = 50
_error_history: deque = deque(maxlen=MAX_ERROR_HISTORY)


@dataclass
class ErrorRecord:
    timestamp: str
    request_id: str
    method: str
    path: str
    error_type: str
    message: str
    traceback_short: str

    def to_dict(self) -> dict:
        return asdict(self)


def get_error_history(limit: int = 20) -> list[dict]:
    """Return recent error records."""
    items = list(_error_history)[-limit:]
    return [e.to_dict() for e in items]


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Catch unhandled exceptions and return a structured 500 JSON response."""

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        try:
            response = await call_next(request)
            return response
        except Exception as exc:
            rid = get_request_id()
            tb = traceback.format_exc()
            tb_short = tb[-500:] if len(tb) > 500 else tb

            logger.error(
                "Unhandled exception on %s %s [%s]: %s",
                request.method, request.url.path, rid, exc,
            )

            record = ErrorRecord(
                timestamp=datetime.now(timezone.utc).isoformat(),
                request_id=rid,
                method=request.method,
                path=str(request.url.path),
                error_type=type(exc).__name__,
                message=str(exc)[:500],
                traceback_short=tb_short,
            )
            _error_history.append(record)

            return JSONResponse(
                status_code=500,
                content={
                    "error": "internal",
                    "message": "Server error, check logs",
                    "request_id": rid,
                    "error_type": type(exc).__name__,
                },
            )
