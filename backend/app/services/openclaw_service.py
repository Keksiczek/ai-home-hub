from typing import Any, Dict, Set

from app.models.schemas import OpenClawActionResponse

# Actions that are recognised but not yet implemented.
KNOWN_ACTIONS: Set[str] = {
    "start_whatsapp_agent",
    "restart_telegram_agent",
    "run_workflow",
}


class OpenClawService:
    def __init__(self) -> None:
        pass

    def run_action(
        self,
        action: str,
        params: Dict[str, Any],
    ) -> OpenClawActionResponse:
        """Execute an OpenClaw action. Currently a stub – no real CLI/API call."""
        if action not in KNOWN_ACTIONS:
            return OpenClawActionResponse(
                status="error",
                detail="Unknown action",
                data={},
            )

        # Known action – placeholder until real integration is added.
        return OpenClawActionResponse(
            status="not_implemented",
            detail="Action defined but not yet implemented",
            data={},
        )


def get_openclaw_service() -> OpenClawService:
    """FastAPI dependency that returns a shared OpenClawService instance."""
    return OpenClawService()
