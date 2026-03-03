import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from fastapi import APIRouter, Depends

from app.models.schemas import OpenClawActionRequest, OpenClawActionResponse
from app.services.openclaw_service import OpenClawService, get_openclaw_service

logger = logging.getLogger(__name__)
router = APIRouter()

HISTORY_FILE = Path(__file__).parent.parent.parent / "data" / "actions_history.json"


@router.post("/actions/openclaw", response_model=OpenClawActionResponse)
async def openclaw_action(
    request: OpenClawActionRequest,
    openclaw_service: OpenClawService = Depends(get_openclaw_service),
) -> OpenClawActionResponse:
    """Trigger a predefined OpenClaw action (stub)."""
    return openclaw_service.run_action(
        action=request.action,
        params=request.params,
    )


@router.get("/actions/history")
async def get_action_history(limit: int = 20) -> Dict[str, Any]:
    """Return the last N quick action run records."""
    history = _load_history()
    return {"history": history[-limit:]}


@router.post("/actions/history")
async def log_action_run(record: Dict[str, Any]) -> Dict[str, Any]:
    """Log a quick action run result."""
    history = _load_history()
    record.setdefault("started_at", datetime.now(timezone.utc).isoformat())
    history.append(record)
    # Keep last 100 entries
    if len(history) > 100:
        history = history[-100:]
    _save_history(history)
    return {"success": True}


def _load_history() -> List[Dict[str, Any]]:
    """Load action history from disk."""
    if not HISTORY_FILE.exists():
        return []
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:
        logger.warning("Failed to load action history: %s", exc)
        return []


def _save_history(history: List[Dict[str, Any]]) -> None:
    """Persist action history to disk."""
    HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2, ensure_ascii=False)
    except Exception as exc:
        logger.warning("Failed to save action history: %s", exc)
