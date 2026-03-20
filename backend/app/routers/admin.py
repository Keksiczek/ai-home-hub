"""Admin endpoints – restart and git-update operations.

These endpoints are intended for LOCAL / TRUSTED-NETWORK use only
(localhost or Tailscale). They shell out to scripts/dev.sh which
manages the backend process and Tailscale funnel.

Security note:
- No shell=True: we use create_subprocess_exec with an explicit argument list.
- Optional API-key protection via verify_api_key dependency (same as other
  sensitive endpoints). If no key is configured the app is open-mode (local).
- The restart / update commands are fire-and-forget: the HTTP response is
  returned immediately before the process actually restarts so the caller
  does not hang waiting for a dead connection.
"""

import asyncio
import logging
import os
from pathlib import Path

from fastapi import APIRouter, Depends

from app.utils.auth import verify_api_key

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])

# ── Path resolution ────────────────────────────────────────────────────────────
# Resolve scripts/dev.sh relative to this file's location so the path is
# correct regardless of the working directory uvicorn is launched from.
_DEV_SH = str((Path(__file__).parents[3] / "scripts" / "dev.sh").resolve())


# ── Internal helper ────────────────────────────────────────────────────────────

async def _run_dev_command(cmd: str) -> None:
    """Fire-and-forget: spawn  bash scripts/dev.sh <cmd>  in the background.

    stdout/stderr are captured and logged at INFO/WARNING level.
    Any exception is caught so it cannot crash the event loop.
    """
    if not os.path.isfile(_DEV_SH):
        logger.warning("admin: dev.sh not found at %s – skipping %s", _DEV_SH, cmd)
        return
    try:
        proc = await asyncio.create_subprocess_exec(
            "bash", _DEV_SH, cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()
        if stdout:
            logger.info("dev.sh %s stdout: %s", cmd, stdout.decode(errors="replace")[:500])
        if stderr:
            logger.warning("dev.sh %s stderr: %s", cmd, stderr.decode(errors="replace")[:500])
        logger.info("dev.sh %s finished with return code %s", cmd, proc.returncode)
    except Exception as exc:  # noqa: BLE001
        logger.error("dev.sh %s raised an exception: %s", cmd, exc)


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/restart")
async def admin_restart(_auth: bool = Depends(verify_api_key)) -> dict:
    """Restart backend + Tailscale funnel via  dev.sh restart  (fire-and-forget).

    The HTTP response is returned **before** the backend actually restarts,
    so the caller should expect the connection to drop momentarily.
    """
    logger.info("Admin: restart requested")
    asyncio.create_task(_run_dev_command("restart"))
    return {
        "status": "ok",
        "message": "Restart zahájen – backend se za chvíli vrátí (obvykle 10–30 s)",
    }


@router.post("/update")
async def admin_update(_auth: bool = Depends(verify_api_key)) -> dict:
    """git pull origin main + restart backend via  dev.sh update  (fire-and-forget)."""
    logger.info("Admin: update requested")
    asyncio.create_task(_run_dev_command("update"))
    return {
        "status": "ok",
        "message": "Update zahájen (git pull + restart) – backend se za chvíli vrátí",
    }


@router.post("/shutdown")
async def admin_shutdown(_auth: bool = Depends(verify_api_key)) -> dict:
    """Graceful shutdown of the FastAPI server.

    Saves pending state, stops background services, then sends SIGTERM
    to the current process.  The HTTP response is returned before the
    actual process exit so the caller receives a clean JSON reply.
    """
    import signal

    logger.warning("Admin: shutdown requested – saving state and stopping services")

    # 1. Stop resident agent gracefully (saves memory)
    try:
        from app.services.resident_agent import get_resident_agent
        agent = get_resident_agent()
        if agent.get_state().get("is_running"):
            await agent.stop()
    except Exception as exc:
        logger.error("Shutdown: failed to stop resident agent: %s", exc)

    # 2. Persist settings (flush any in-memory changes)
    try:
        from app.services.settings_service import get_settings_service
        get_settings_service().load()  # ensure file is up to date
    except Exception as exc:
        logger.error("Shutdown: settings save failed: %s", exc)

    # 3. Schedule SIGTERM after a short delay so this response can be sent
    async def _delayed_kill():
        await asyncio.sleep(1)
        logger.info("Sending SIGTERM to self (pid=%d)", os.getpid())
        os.kill(os.getpid(), signal.SIGTERM)

    asyncio.create_task(_delayed_kill())

    return {
        "status": "shutting_down",
        "message": "AI Home Hub se vypíná…",
    }
