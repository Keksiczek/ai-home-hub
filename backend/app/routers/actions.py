from fastapi import APIRouter, Depends

from app.models.schemas import OpenClawActionRequest, OpenClawActionResponse
from app.services.openclaw_service import OpenClawService, get_openclaw_service

router = APIRouter()


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
