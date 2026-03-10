"""JSON formatter for structured logging (4B).

Usage:
    from app.utils.logger import setup_json_logging
    setup_json_logging()

All log records are emitted as single JSON lines with fields:
  timestamp, level, logger, message, request_id, extra
"""

import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict


class JSONFormatter(logging.Formatter):
    """Formats log records as single-line JSON objects."""

    def format(self, record: logging.LogRecord) -> str:
        from app.middleware.logging_middleware import get_request_id

        entry: Dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(
                record.created, tz=timezone.utc
            ).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": get_request_id(),
        }

        # Include exception info if present
        if record.exc_info and record.exc_info[1]:
            entry["exception"] = self.formatException(record.exc_info)

        # Include any extra fields
        for key in ("extra",):
            if hasattr(record, key):
                entry[key] = getattr(record, key)

        return json.dumps(entry, ensure_ascii=False, default=str)


def setup_json_logging(level: int = logging.INFO) -> None:
    """Configure root logger to use JSON formatter."""
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())

    root = logging.getLogger()
    root.setLevel(level)
    # Replace existing handlers
    root.handlers.clear()
    root.addHandler(handler)
