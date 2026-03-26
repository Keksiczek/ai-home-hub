"""Integrations router – endpoints for all external service integrations."""

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException

from app.utils.auth import verify_api_key

from app.models.schemas import (
    GitOperationRequest,
    MacOSActionRequest,
    MCPCallRequest,
    NotificationRequest,
)
from app.services.claude_mcp_service import get_claude_mcp_service
from app.services.git_service import get_git_service
from app.services.macos_service import get_macos_service
from app.services.notification_service import get_notification_service
from app.services.openclaw_service import get_openclaw_service

router = APIRouter()


# ── Claude MCP ──────────────────────────────────────────────


@router.post("/integrations/mcp/call-tool", tags=["integrations", "mcp"])
async def mcp_call_tool(body: MCPCallRequest) -> Dict[str, Any]:
    """Call a Claude MCP tool directly."""
    svc = get_claude_mcp_service()
    return await svc.call_tool(body.tool_name, body.arguments)


@router.get("/integrations/mcp/available-tools", tags=["integrations", "mcp"])
async def mcp_available_tools() -> Dict[str, Any]:
    """List available MCP tools and connection status."""
    svc = get_claude_mcp_service()
    return svc.get_status()


# ── Mac OS ──────────────────────────────────────────────────


@router.post(
    "/integrations/macos/screenshot",
    tags=["integrations", "macos"],
    dependencies=[Depends(verify_api_key)],
)
async def macos_screenshot(mode: str = "clipboard") -> dict:
    """Capture a macOS screenshot (requires Screen Recording permission).

    ``mode=clipboard`` returns base64-encoded PNG in the response.
    ``mode=file`` saves to a temp file and returns the path.
    """
    svc = get_macos_service()
    return await svc.run_action("screenshot", {"mode": mode})


@router.post("/integrations/macos/action", tags=["integrations", "macos"])
async def macos_action(body: MacOSActionRequest) -> Dict[str, Any]:
    """Execute a macOS action via AppleScript."""
    svc = get_macos_service()
    return await svc.run_action(body.action, body.params)


@router.post("/integrations/macos/safari-open", tags=["integrations", "macos"])
async def macos_safari_open(url: str) -> Dict[str, Any]:
    """Open a URL in Safari."""
    svc = get_macos_service()
    return await svc.run_action("safari_open", {"url": url})


@router.post("/integrations/macos/volume-set", tags=["integrations", "macos"])
async def macos_volume_set(level: int) -> Dict[str, Any]:
    """Set system volume (0-100)."""
    svc = get_macos_service()
    return await svc.run_action("volume_set", {"level": level})


@router.get("/integrations/macos/running-apps", tags=["integrations", "macos"])
async def macos_running_apps() -> Dict[str, Any]:
    """List currently running Mac applications."""
    svc = get_macos_service()
    return await svc.run_action("list_apps", {})


# ── Git ─────────────────────────────────────────────────────


@router.get("/integrations/git/status", tags=["integrations", "git"])
async def git_status(repo_path: str) -> Dict[str, Any]:
    """Get git status for a repository."""
    svc = get_git_service()
    return await svc.run_action("status", {"repo_path": repo_path})


@router.post("/integrations/git/commit", tags=["integrations", "git"])
async def git_commit(body: GitOperationRequest) -> Dict[str, Any]:
    """Stage all changes and commit."""
    svc = get_git_service()
    if not body.message:
        raise HTTPException(status_code=400, detail="Commit message is required")
    return await svc.run_action(
        "commit", {"repo_path": body.repo_path, "message": body.message}
    )


@router.post("/integrations/git/push", tags=["integrations", "git"])
async def git_push(body: GitOperationRequest) -> Dict[str, Any]:
    """Push to remote origin."""
    svc = get_git_service()
    return await svc.run_action(
        "push", {"repo_path": body.repo_path, "branch": body.branch}
    )


@router.post("/integrations/git/pull", tags=["integrations", "git"])
async def git_pull(body: GitOperationRequest) -> Dict[str, Any]:
    """Pull from remote origin."""
    svc = get_git_service()
    return await svc.run_action(
        "pull", {"repo_path": body.repo_path, "branch": body.branch}
    )


@router.get("/integrations/git/log", tags=["integrations", "git"])
async def git_log(repo_path: str, count: int = 10) -> Dict[str, Any]:
    """Return recent commit log."""
    svc = get_git_service()
    return await svc.run_action("log", {"repo_path": repo_path, "count": count})


# ── OpenClaw ────────────────────────────────────────────────


@router.post("/integrations/openclaw", tags=["integrations", "openclaw"])
async def openclaw_action(action: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
    """Execute an OpenClaw action (screenshot, click, type, etc.)."""
    svc = get_openclaw_service()
    return await svc.run_action_async(action, params or {})


# ── Notifications ────────────────────────────────────────────


@router.post("/integrations/notify", tags=["integrations", "notifications"])
async def send_notification(body: NotificationRequest) -> Dict[str, Any]:
    """Send a push notification via ntfy.sh."""
    svc = get_notification_service()
    success = await svc.send(body.title, body.message, body.priority)
    return {"sent": success}
