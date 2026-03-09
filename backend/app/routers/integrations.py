"""Integrations router – endpoints for all external service integrations."""
from typing import Any, Dict

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    AntigravityAgentRequest,
    GitOperationRequest,
    MacOSActionRequest,
    MCPCallRequest,
    NotificationRequest,
    VSCodeOpenProjectRequest,
    VSCodeRunTaskRequest,
    VSCodeOpenFileRequest,
)
from app.services.antigravity_service import get_antigravity_service
from app.services.claude_mcp_service import get_claude_mcp_service
from app.services.git_service import get_git_service
from app.services.macos_service import get_macos_service
from app.services.notification_service import get_notification_service
from app.services.openclaw_service import get_openclaw_service
from app.services.vscode_service import get_vscode_service

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


# ── VS Code ─────────────────────────────────────────────────

@router.post("/integrations/vscode/open-project", tags=["integrations", "vscode"])
async def vscode_open_project(body: VSCodeOpenProjectRequest) -> Dict[str, Any]:
    """Open a configured project in VS Code."""
    svc = get_vscode_service()
    result = await svc.run_action("open_project", {"project_key": body.project_key})
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result["detail"])
    return result


@router.post("/integrations/vscode/open-file", tags=["integrations", "vscode"])
async def vscode_open_file(body: VSCodeOpenFileRequest) -> Dict[str, Any]:
    """Open a specific file (optionally at a line number) in VS Code."""
    svc = get_vscode_service()
    result = await svc.run_action("open_file", {"file_path": body.file_path, "line": body.line})
    return result


@router.post("/integrations/vscode/run-task", tags=["integrations", "vscode"])
async def vscode_run_task(body: VSCodeRunTaskRequest) -> Dict[str, Any]:
    """Execute a VS Code task in a configured project."""
    svc = get_vscode_service()
    result = await svc.run_action(
        "run_task", {"project_key": body.project_key, "task_name": body.task_name}
    )
    return result


@router.get("/integrations/vscode/diagnostics", tags=["integrations", "vscode"])
async def vscode_diagnostics(project_key: str) -> Dict[str, Any]:
    """Get diagnostic information for a project."""
    svc = get_vscode_service()
    return await svc.get_diagnostics(project_key)


@router.get("/integrations/vscode/projects", tags=["integrations", "vscode"])
async def vscode_projects() -> Dict[str, Any]:
    """List all configured VS Code projects."""
    svc = get_vscode_service()
    return {"projects": svc.list_projects()}


@router.get("/integrations/vscode/version", tags=["integrations", "vscode"])
async def vscode_version() -> Dict[str, Any]:
    """Return VS Code version."""
    svc = get_vscode_service()
    version = await svc.get_version()
    return {"version": version}


# ── Antigravity ─────────────────────────────────────────────

@router.post("/integrations/antigravity/start-agent", tags=["integrations", "antigravity"])
async def antigravity_start_agent(body: AntigravityAgentRequest) -> Dict[str, Any]:
    """Start an Antigravity agent task."""
    svc = get_antigravity_service()
    return await svc.start_agent_task(body.prompt, body.workspace)


@router.get("/integrations/antigravity/agent-status", tags=["integrations", "antigravity"])
async def antigravity_agent_status(task_id: str) -> Dict[str, Any]:
    """Check Antigravity agent progress."""
    svc = get_antigravity_service()
    return await svc.get_agent_status(task_id)


@router.get("/integrations/antigravity/artifacts", tags=["integrations", "antigravity"])
async def antigravity_artifacts(task_id: str) -> Dict[str, Any]:
    """Retrieve artifacts from an Antigravity task."""
    svc = get_antigravity_service()
    return await svc.retrieve_artifacts(task_id)


@router.get("/integrations/antigravity/health", tags=["integrations", "antigravity"])
async def antigravity_health() -> Dict[str, Any]:
    """Check if Antigravity IDE API is reachable."""
    svc = get_antigravity_service()
    return await svc.check_health()


# ── Mac OS ──────────────────────────────────────────────────

@router.post("/integrations/macos/screenshot", tags=["integrations", "macos"])
async def macos_screenshot(mode: str = "clipboard") -> Dict[str, Any]:
    """
    Take a screenshot on macOS using screencapture.

    Args:
        mode: "clipboard" captures to clipboard, "file" saves to temp file.

    Returns:
        {success, image (base64), path}

    Note: Requires Screen Recording permission on macOS.
    """
    import asyncio as _asyncio
    import base64
    import tempfile
    import time as _time

    try:
        if mode == "file":
            timestamp = int(_time.time())
            path = f"/tmp/screenshot-{timestamp}.png"
            proc = await _asyncio.create_subprocess_exec(
                "screencapture", path,
                stdout=_asyncio.subprocess.PIPE,
                stderr=_asyncio.subprocess.PIPE,
            )
            await proc.wait()

            if proc.returncode != 0:
                return {"success": False, "error": "screencapture failed", "image": None, "path": None}

            with open(path, "rb") as f:
                image_b64 = base64.b64encode(f.read()).decode("utf-8")

            return {"success": True, "image": image_b64, "path": path}

        else:  # clipboard mode
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
                tmp_path = tmp.name

            proc = await _asyncio.create_subprocess_exec(
                "screencapture", tmp_path,
                stdout=_asyncio.subprocess.PIPE,
                stderr=_asyncio.subprocess.PIPE,
            )
            await proc.wait()

            if proc.returncode != 0:
                return {"success": False, "error": "screencapture failed", "image": None, "path": None}

            try:
                with open(tmp_path, "rb") as f:
                    image_b64 = base64.b64encode(f.read()).decode("utf-8")
                import os
                os.unlink(tmp_path)
            except Exception:
                image_b64 = ""

            return {"success": True, "image": image_b64, "path": None}

    except FileNotFoundError:
        return {
            "success": False,
            "error": "screencapture not found (macOS only)",
            "image": None,
            "path": None,
        }
    except Exception as exc:
        return {"success": False, "error": str(exc), "image": None, "path": None}


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
