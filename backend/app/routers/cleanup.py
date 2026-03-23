"""Cleanup settings router.

Provides:
- GET  /api/settings/cleanup      – return current cleanup config
- PATCH /api/settings/cleanup     – update cleanup config (with validation)
- POST /api/control/cleanup/run-now – trigger an immediate cleanup cycle
"""
import asyncio
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

logger = logging.getLogger(__name__)

router = APIRouter(tags=["cleanup"])


class CleanupConfig(BaseModel):
    enabled: Optional[bool] = None
    interval_hours: Optional[int] = Field(default=None, ge=1, le=168)
    session_retention_days: Optional[int] = Field(default=None, ge=1, le=365)
    artifact_retention_days: Optional[int] = Field(default=None, ge=1, le=365)
    vacuum_enabled: Optional[bool] = None


# ── GET current cleanup config ──────────────────────────────────────────────

@router.get("/settings/cleanup")
async def get_cleanup_config() -> dict:
    """Return the current cleanup configuration."""
    from app.services.settings_service import get_settings_service
    settings = get_settings_service().load()
    cfg = settings.get("cleanup", {})
    defaults = {
        "enabled": True,
        "interval_hours": 6,
        "session_retention_days": 7,
        "artifact_retention_days": 30,
        "vacuum_enabled": True,
    }
    defaults.update(cfg)
    return defaults


# ── PATCH cleanup config ────────────────────────────────────────────────────

@router.patch("/settings/cleanup")
async def update_cleanup_config(body: CleanupConfig) -> dict:
    """Update cleanup configuration. Only provided fields are changed."""
    from app.services.settings_service import get_settings_service
    svc = get_settings_service()
    settings = svc.load()
    current = settings.get("cleanup", {})

    patch = body.model_dump(exclude_none=True)
    current.update(patch)
    settings["cleanup"] = current
    svc.save(settings)

    logger.info("Cleanup config updated: %s", patch)
    return {"status": "saved", "config": current}


# ── POST run-now ─────────────────────────────────────────────────────────────

@router.post("/control/cleanup/run-now")
async def cleanup_run_now() -> dict:
    """Trigger an immediate cleanup cycle (on-demand, does not reset the scheduler)."""
    from app.services.cleanup_service import get_cleanup_service
    svc = get_cleanup_service()
    try:
        result = await asyncio.to_thread(svc.run_now)
        return result
    except Exception as exc:
        logger.error("On-demand cleanup error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
