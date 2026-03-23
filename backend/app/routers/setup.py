"""Setup router – first-run wizard status and completion."""

from fastapi import APIRouter

from app.models.schemas import SetupStatusResponse
from app.services.setup_service import get_setup_service

router = APIRouter()


@router.get("/setup/status", response_model=SetupStatusResponse, tags=["setup"])
async def get_setup_status() -> dict:
    """Return first-run environment check results."""
    svc = get_setup_service()
    return await svc.get_status()


@router.post("/setup/complete", tags=["setup"])
async def complete_setup() -> dict:
    """Mark the first-run wizard as completed."""
    svc = get_setup_service()
    await svc.complete_setup()
    return {"ok": True, "message": "Setup dokončen."}
