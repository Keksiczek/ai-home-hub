"""OpenClaw service – Mac computer control automation."""
import asyncio
import base64
import logging
from pathlib import Path
from typing import Any, Dict, Optional, Set

from app.models.schemas import OpenClawActionResponse
from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)

KNOWN_ACTIONS: Set[str] = {
    "start_whatsapp_agent",
    "restart_telegram_agent",
    "run_workflow",
    "screenshot",
    "click_at",
    "type_text",
    "open_application",
    "find_element",
}


class OpenClawService:
    """Mac computer control via OpenClaw CLI and system utilities."""

    def __init__(self) -> None:
        self._settings = get_settings_service()

    def _binary(self) -> str:
        cfg = self._settings.get_integration_config("openclaw")
        return cfg.get("binary_path", "openclaw")

    async def _run_binary(self, *args: str) -> str:
        """Run the OpenClaw binary with arguments."""
        proc = await asyncio.create_subprocess_exec(
            self._binary(), *args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=30.0)
        if proc.returncode != 0:
            raise RuntimeError(stderr.decode().strip() or "OpenClaw error")
        return stdout.decode().strip()

    # ── Screenshot ─────────────────────────────────────────────

    async def screenshot(
        self, output_path: Optional[str] = None, region: Optional[Dict[str, int]] = None
    ) -> Dict[str, Any]:
        """
        Take a screenshot.
        Falls back to screencapture (built-in macOS) if OpenClaw is unavailable.
        """
        if output_path is None:
            output_path = "/tmp/ai-hub-screenshot.png"

        args = ["screencapture", "-x"]
        if region:
            x = region.get("x", 0)
            y = region.get("y", 0)
            w = region.get("width", 1920)
            h = region.get("height", 1080)
            args += ["-R", f"{x},{y},{w},{h}"]
        args.append(output_path)

        proc = await asyncio.create_subprocess_exec(
            *args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        await asyncio.wait_for(proc.communicate(), timeout=10.0)

        # Encode as base64 for API response
        p = Path(output_path)
        if p.exists():
            data = base64.b64encode(p.read_bytes()).decode()
            return {"status": "ok", "path": output_path, "base64": data}
        return {"status": "error", "detail": "Screenshot failed"}

    # ── Mouse / keyboard ───────────────────────────────────────

    async def click_at(self, x: int, y: int) -> str:
        """Simulate a mouse click at (x, y). Uses cliclick if available."""
        try:
            proc = await asyncio.create_subprocess_exec(
                "cliclick", f"c:{x},{y}",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            await asyncio.wait_for(proc.communicate(), timeout=5.0)
            return f"Clicked at ({x}, {y})"
        except FileNotFoundError:
            # cliclick not installed – use AppleScript
            script = (
                f'tell application "System Events" to click at {{{x}, {y}}}'
            )
            proc = await asyncio.create_subprocess_exec(
                "osascript", "-e", script,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            await asyncio.wait_for(proc.communicate(), timeout=5.0)
            return f"Clicked at ({x}, {y}) via AppleScript"

    async def type_text(self, text: str) -> str:
        """Simulate keyboard typing via AppleScript."""
        script = f'tell application "System Events" to keystroke "{text}"'
        proc = await asyncio.create_subprocess_exec(
            "osascript", "-e", script,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        await asyncio.wait_for(proc.communicate(), timeout=10.0)
        return f"Typed {len(text)} characters"

    # ── Application control ────────────────────────────────────

    async def open_application(self, app_name: str) -> str:
        """Launch a Mac application."""
        proc = await asyncio.create_subprocess_exec(
            "open", "-a", app_name,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        _, stderr = await asyncio.wait_for(proc.communicate(), timeout=10.0)
        if proc.returncode != 0:
            raise RuntimeError(stderr.decode().strip())
        return f"Opened {app_name}"

    # ── Legacy action runner ───────────────────────────────────

    def run_action(self, action: str, params: Dict[str, Any]) -> OpenClawActionResponse:
        """Synchronous dispatcher for legacy API endpoint compatibility."""
        if action not in KNOWN_ACTIONS:
            return OpenClawActionResponse(
                status="error",
                detail="Unknown action",
                data={},
            )
        # Legacy actions not yet wired to real implementations
        if action in ("start_whatsapp_agent", "restart_telegram_agent", "run_workflow"):
            return OpenClawActionResponse(
                status="not_implemented",
                detail="Action defined but not yet implemented. Use /api/integrations/openclaw instead.",
                data={},
            )
        return OpenClawActionResponse(
            status="ok",
            detail=f"Use POST /api/integrations/openclaw for action: {action}",
            data={},
        )

    # ── Async action dispatcher ────────────────────────────────

    async def run_action_async(self, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Async dispatcher for all OpenClaw actions."""
        try:
            if action == "screenshot":
                return await self.screenshot(
                    params.get("output_path"),
                    params.get("region"),
                )
            elif action == "click_at":
                result = await self.click_at(int(params["x"]), int(params["y"]))
                return {"status": "ok", "detail": result}
            elif action == "type_text":
                result = await self.type_text(params["text"])
                return {"status": "ok", "detail": result}
            elif action == "open_application":
                result = await self.open_application(params["app_name"])
                return {"status": "ok", "detail": result}
            elif action in ("start_whatsapp_agent", "restart_telegram_agent", "run_workflow"):
                return {
                    "status": "not_implemented",
                    "detail": "Action defined but not yet implemented",
                }
            else:
                return {"status": "error", "detail": f"Unknown action: {action}"}
        except asyncio.TimeoutError:
            return {"status": "error", "detail": "Action timed out"}
        except FileNotFoundError:
            return {"status": "error", "detail": "Required tool not found"}
        except KeyError as exc:
            return {"status": "error", "detail": f"Missing required param: {exc}"}
        except RuntimeError as exc:
            return {"status": "error", "detail": str(exc)}


_openclaw_service: Optional[OpenClawService] = None


def get_openclaw_service() -> OpenClawService:
    global _openclaw_service
    if _openclaw_service is None:
        _openclaw_service = OpenClawService()
    return _openclaw_service
