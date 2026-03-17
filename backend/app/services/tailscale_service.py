"""Tailscale Funnel service – exposes the app via Tailscale Funnel.

The service manages a ``tailscale funnel <port>`` subprocess and reports
health/URL to the /api/health endpoint.  It reacts to settings changes
(enable_funnel toggle) on every tick without requiring a restart.

Failure modes handled:
- ``tailscale`` not in PATH       → status "error", message "tailscale: command not found"
- Tailscale not logged in         → status "error", message from stderr
- Port already in use (funnel up) → OK, `tailscale funnel status` returns URL
- enable_funnel=False             → status "disabled", no subprocess started
"""
import asyncio
import contextlib
import logging
import re
import shutil
from asyncio.subprocess import PIPE
from typing import Dict, Optional

from app.services.background_service import BackgroundService
from app.services.settings_service import SettingsService

logger = logging.getLogger(__name__)

# Seconds between health polls in the tick loop
_TICK_INTERVAL: int = 30

# Regex to extract Tailscale Funnel HTTPS URL from status output
# Handles multi-part hostnames like mymachine.tailnet-xyz.ts.net
_URL_RE = re.compile(r"https://[a-zA-Z0-9\-\.]+\.ts\.net[^\s]*")


class TailscaleFunnelService(BackgroundService):
    """Background service that manages a ``tailscale funnel`` subprocess."""

    def __init__(self, settings_svc: SettingsService) -> None:
        super().__init__("tailscale_funnel")
        self._settings_svc = settings_svc
        self._process: Optional[asyncio.subprocess.Process] = None
        self._funnel_url: Optional[str] = None
        self._last_error: Optional[str] = None
        self._enabled: bool = False

    # ── BackgroundService hooks ──────────────────────────────────────────────

    async def _on_start(self) -> None:
        cfg = self._get_cfg()
        self._enabled = cfg.get("enable_funnel", False)
        if self._enabled:
            await self._start_funnel(cfg)

    async def _tick(self) -> None:
        await asyncio.sleep(_TICK_INTERVAL)
        cfg = self._get_cfg()
        now_enabled = cfg.get("enable_funnel", False)

        if now_enabled != self._enabled:
            # Settings toggled
            self._enabled = now_enabled
            if now_enabled:
                await self._start_funnel(cfg)
            else:
                await self._stop_funnel()
        elif self._enabled and self._process:
            # Still enabled – monitor process and refresh URL
            if self._process.returncode is not None:
                logger.warning(
                    "tailscale funnel exited unexpectedly (rc=%s); restarting",
                    self._process.returncode,
                )
                await self._start_funnel(cfg)
            else:
                await self._refresh_url()

    async def _on_stop(self) -> None:
        await self._stop_funnel()

    # ── Public API ───────────────────────────────────────────────────────────

    def get_health(self) -> Dict:
        """Return a health dict suitable for inclusion in /api/health."""
        if not self._enabled:
            return {"status": "disabled"}
        if self._last_error:
            return {"status": "error", "error": self._last_error}
        if self._process is None or self._process.returncode is not None:
            return {"status": "stopped"}
        return {"status": "running", "url": self._funnel_url}

    # ── Internals ────────────────────────────────────────────────────────────

    def _get_cfg(self) -> dict:
        return self._settings_svc.load().get("tailscale", {})

    async def _start_funnel(self, cfg: dict) -> None:
        """Launch ``tailscale funnel <port>`` subprocess."""
        if not shutil.which("tailscale"):
            self._last_error = "tailscale: command not found"
            logger.error("TailscaleFunnelService: %s", self._last_error)
            return

        port = str(cfg.get("port", 8000))
        try:
            self._process = await asyncio.create_subprocess_exec(
                "tailscale", "funnel", port,
                stdout=PIPE,
                stderr=PIPE,
            )
            self._last_error = None
            logger.info(
                "tailscale funnel started (port=%s, pid=%s)", port, self._process.pid
            )
            # Brief pause to let the funnel initialize before querying status
            await asyncio.sleep(2.0)
            await self._refresh_url()
        except OSError as exc:
            self._last_error = str(exc)
            logger.error("TailscaleFunnelService: failed to start: %s", exc)

    async def _stop_funnel(self) -> None:
        """Terminate the subprocess and run ``tailscale funnel reset``."""
        if self._process and self._process.returncode is None:
            with contextlib.suppress(OSError):
                self._process.terminate()
            with contextlib.suppress(asyncio.TimeoutError, OSError):
                await asyncio.wait_for(self._process.wait(), timeout=5.0)
            with contextlib.suppress(OSError):
                self._process.kill()

        self._process = None
        self._funnel_url = None

        # Clean up Tailscale funnel rules regardless of whether our process was running
        if shutil.which("tailscale"):
            try:
                reset = await asyncio.create_subprocess_exec(
                    "tailscale", "funnel", "reset",
                    stdout=PIPE,
                    stderr=PIPE,
                )
                await asyncio.wait_for(reset.wait(), timeout=10.0)
                logger.info("tailscale funnel reset (rc=%s)", reset.returncode)
            except Exception as exc:  # noqa: BLE001
                logger.warning("tailscale funnel reset failed: %s", exc)

    async def _refresh_url(self) -> None:
        """Run ``tailscale funnel status`` and parse the public HTTPS URL."""
        if not shutil.which("tailscale"):
            return
        try:
            proc = await asyncio.create_subprocess_exec(
                "tailscale", "funnel", "status",
                stdout=PIPE,
                stderr=PIPE,
            )
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=10.0)
            out = stdout.decode(errors="replace")
            err = stderr.decode(errors="replace")

            if proc.returncode != 0:
                combined = (out + err).lower()
                if "not logged in" in combined or "needs to be authenticated" in combined:
                    self._last_error = "tailscale: not logged in"
                else:
                    self._last_error = (err.strip() or out.strip())[:200] or "tailscale funnel status failed"
                return

            match = _URL_RE.search(out)
            if match:
                self._funnel_url = match.group(0).rstrip("/")
                self._last_error = None
                logger.info("tailscale funnel URL: %s", self._funnel_url)
        except asyncio.TimeoutError:
            logger.warning("tailscale funnel status timed out")
        except Exception as exc:  # noqa: BLE001
            logger.warning("tailscale funnel status error: %s", exc)


# ── Singleton ────────────────────────────────────────────────────────────────

_instance: Optional[TailscaleFunnelService] = None


def get_tailscale_service() -> TailscaleFunnelService:
    global _instance
    if _instance is None:
        from app.services.settings_service import get_settings_service
        _instance = TailscaleFunnelService(get_settings_service())
    return _instance
