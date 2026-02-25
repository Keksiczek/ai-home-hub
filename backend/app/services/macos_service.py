"""Mac OS service – AppleScript automation and system control."""
import asyncio
import logging
import shlex
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class MacOSService:
    """Native Mac control via AppleScript and shell commands."""

    # ── AppleScript helper ─────────────────────────────────────

    async def _run_applescript(self, script: str) -> str:
        """Execute an AppleScript and return stdout."""
        proc = await asyncio.create_subprocess_exec(
            "osascript", "-e", script,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=30.0)
        if proc.returncode != 0:
            raise RuntimeError(stderr.decode().strip() or "AppleScript error")
        return stdout.decode().strip()

    async def _run_shell(self, *args: str) -> str:
        """Execute a shell command and return stdout."""
        proc = await asyncio.create_subprocess_exec(
            *args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=30.0)
        if proc.returncode != 0:
            raise RuntimeError(stderr.decode().strip() or f"Command failed: {args[0]}")
        return stdout.decode().strip()

    # ── Applications ───────────────────────────────────────────

    async def safari_open(self, url: str) -> str:
        """Open a URL in Safari."""
        script = f'tell application "Safari" to open location "{url}"'
        await self._run_applescript(script)
        return f"Opened {url} in Safari"

    async def finder_open_folder(self, path: str) -> str:
        """Open a folder in Finder."""
        script = f'tell application "Finder" to open POSIX file "{path}"'
        await self._run_applescript(script)
        return f"Opened {path} in Finder"

    async def mail_send(self, to: str, subject: str, body: str) -> str:
        """Send an email via Mail.app."""
        script = f'''
            tell application "Mail"
                set newMessage to make new outgoing message with properties {{
                    subject: "{subject}",
                    content: "{body}",
                    visible: true
                }}
                tell newMessage
                    make new to recipient with properties {{address: "{to}"}}
                end tell
                send newMessage
            end tell
        '''
        await self._run_applescript(script)
        return f"Email sent to {to}"

    async def calendar_create_event(self, title: str, start_iso: str, duration_minutes: int = 60) -> str:
        """Create a Calendar event."""
        script = f'''
            tell application "Calendar"
                tell calendar 1
                    make new event with properties {{
                        summary: "{title}",
                        start date: date "{start_iso}"
                    }}
                end tell
            end tell
        '''
        await self._run_applescript(script)
        return f"Calendar event '{title}' created"

    async def quit_app(self, app_name: str) -> str:
        """Quit a running application."""
        script = f'tell application "{app_name}" to quit'
        await self._run_applescript(script)
        return f"Quit {app_name}"

    async def open_application(self, app_name: str) -> str:
        """Launch a Mac application."""
        await self._run_shell("open", "-a", app_name)
        return f"Opened {app_name}"

    # ── System control ─────────────────────────────────────────

    async def set_volume(self, level: int) -> str:
        """Set system volume (0–100)."""
        level = max(0, min(100, level))
        script = f"set volume output volume {level}"
        await self._run_applescript(script)
        return f"Volume set to {level}%"

    async def sleep_display(self) -> str:
        """Put the display to sleep."""
        await self._run_shell("pmset", "displaysleepnow")
        return "Display sleeping"

    async def get_battery_status(self) -> Dict[str, Any]:
        """Return battery level and charging status."""
        output = await self._run_shell("pmset", "-g", "batt")
        return {"raw": output}

    async def get_volume(self) -> int:
        """Return current output volume."""
        script = "output volume of (get volume settings)"
        result = await self._run_applescript(script)
        return int(result)

    # ── Processes ──────────────────────────────────────────────

    async def list_running_apps(self) -> List[str]:
        """List currently running Mac applications."""
        script = 'tell application "System Events" to get name of (processes where background only is false)'
        result = await self._run_applescript(script)
        return [a.strip() for a in result.split(",") if a.strip()]

    # ── Notifications ──────────────────────────────────────────

    async def show_notification(self, title: str, message: str, subtitle: str = "") -> str:
        """Show a macOS notification banner."""
        subtitle_part = f', subtitle:"{subtitle}"' if subtitle else ""
        script = f'display notification "{message}"{subtitle_part} with title "{title}"'
        await self._run_applescript(script)
        return "Notification shown"

    # ── Generic action dispatcher ──────────────────────────────

    async def run_action(self, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Dispatch a named action with params."""
        try:
            if action == "safari_open":
                result = await self.safari_open(params["url"])
            elif action == "finder_open":
                result = await self.finder_open_folder(params["path"])
            elif action == "volume_set":
                result = await self.set_volume(int(params.get("level", 50)))
            elif action == "sleep_display":
                result = await self.sleep_display()
            elif action == "open_app":
                result = await self.open_application(params["app_name"])
            elif action == "quit_app":
                result = await self.quit_app(params["app_name"])
            elif action == "list_apps":
                apps = await self.list_running_apps()
                return {"status": "ok", "data": {"apps": apps}}
            elif action == "battery":
                batt = await self.get_battery_status()
                return {"status": "ok", "data": batt}
            elif action == "notification":
                result = await self.show_notification(
                    params.get("title", "AI Hub"),
                    params.get("message", ""),
                    params.get("subtitle", ""),
                )
            elif action == "mail_send":
                result = await self.mail_send(
                    params["to"], params["subject"], params.get("body", "")
                )
            else:
                return {"status": "error", "detail": f"Unknown action: {action}"}

            return {"status": "ok", "detail": result}
        except asyncio.TimeoutError:
            return {"status": "error", "detail": "AppleScript timed out"}
        except RuntimeError as exc:
            return {"status": "error", "detail": str(exc)}
        except KeyError as exc:
            return {"status": "error", "detail": f"Missing required param: {exc}"}


_macos_service: Optional[MacOSService] = None


def get_macos_service() -> MacOSService:
    global _macos_service
    if _macos_service is None:
        _macos_service = MacOSService()
    return _macos_service
