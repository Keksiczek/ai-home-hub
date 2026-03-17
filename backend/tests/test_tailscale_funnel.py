"""Tests for TailscaleFunnelService (tailscale_service.py).

All subprocess interactions are mocked so tests run without tailscale installed.
"""
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch, PropertyMock

import pytest

from app.services.tailscale_service import TailscaleFunnelService


# ── Helpers ──────────────────────────────────────────────────────────────────

def _make_settings(enable_funnel: bool = False, port: int = 8000, timeout: int = 300):
    """Return a SettingsService mock with given tailscale config."""
    svc = MagicMock()
    svc.load.return_value = {
        "tailscale": {
            "enable_funnel": enable_funnel,
            "port": port,
            "timeout": timeout,
        }
    }
    return svc


def _make_process(returncode=None, pid=12345):
    """Return a mock asyncio subprocess.Process."""
    proc = MagicMock()
    proc.pid = pid
    proc.returncode = returncode
    proc.terminate = MagicMock()
    proc.kill = MagicMock()
    proc.wait = AsyncMock(return_value=returncode)
    return proc


# ── Tests: disabled state ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_health_disabled_when_not_enabled():
    """Service reports 'disabled' when enable_funnel=False."""
    svc = TailscaleFunnelService(_make_settings(enable_funnel=False))
    health = svc.get_health()
    assert health["status"] == "disabled"


@pytest.mark.asyncio
async def test_on_start_does_not_launch_when_disabled():
    """_on_start() must not spawn a subprocess when enable_funnel=False."""
    svc = TailscaleFunnelService(_make_settings(enable_funnel=False))
    with patch("app.services.tailscale_service.shutil.which", return_value="/usr/bin/tailscale"):
        with patch("asyncio.create_subprocess_exec") as mock_exec:
            await svc._on_start()
    mock_exec.assert_not_called()
    assert svc._process is None


# ── Tests: tailscale CLI not found ────────────────────────────────────────────

@pytest.mark.asyncio
async def test_start_funnel_graceful_when_tailscale_missing():
    """_start_funnel() records an error and does not raise when tailscale is absent."""
    svc = TailscaleFunnelService(_make_settings(enable_funnel=True))
    svc._enabled = True  # simulate that the service was configured to be enabled
    with patch("app.services.tailscale_service.shutil.which", return_value=None):
        await svc._start_funnel({"port": 8000})

    assert svc._process is None
    assert svc._last_error == "tailscale: command not found"
    assert svc.get_health()["status"] == "error"


@pytest.mark.asyncio
async def test_health_error_shows_message():
    """get_health() includes the error message when _last_error is set."""
    svc = TailscaleFunnelService(_make_settings(enable_funnel=True))
    svc._enabled = True
    svc._last_error = "tailscale: command not found"
    health = svc.get_health()
    assert health["status"] == "error"
    assert "command not found" in health["error"]


# ── Tests: successful start / stop ────────────────────────────────────────────

@pytest.mark.asyncio
async def test_funnel_start_sets_process():
    """_start_funnel() assigns self._process when subprocess starts successfully."""
    proc = _make_process(returncode=None)
    status_proc = _make_process(returncode=0)
    status_proc.communicate = AsyncMock(
        return_value=(b"https://myhost.ts.net/\n", b"")
    )

    with patch("app.services.tailscale_service.shutil.which", return_value="/usr/bin/tailscale"), \
         patch("asyncio.create_subprocess_exec", side_effect=[proc, status_proc]), \
         patch("asyncio.sleep", new_callable=AsyncMock):
        svc = TailscaleFunnelService(_make_settings(enable_funnel=True))
        await svc._start_funnel({"port": 8000})

    assert svc._process is proc
    assert svc._last_error is None


@pytest.mark.asyncio
async def test_funnel_url_parsed_from_status():
    """_refresh_url() parses the HTTPS URL from ``tailscale funnel status`` output."""
    status_output = (
        b"# Funnel on:\n"
        b"#     - https://mymachine.tailnet-xyz.ts.net\n"
        b"https://mymachine.tailnet-xyz.ts.net (Funnel on)\n"
        b"        |-- / proxy 127.0.0.1:8000\n"
    )
    status_proc = _make_process(returncode=0)
    status_proc.communicate = AsyncMock(return_value=(status_output, b""))

    with patch("app.services.tailscale_service.shutil.which", return_value="/usr/bin/tailscale"), \
         patch("asyncio.create_subprocess_exec", return_value=status_proc):
        svc = TailscaleFunnelService(_make_settings(enable_funnel=True))
        svc._enabled = True
        svc._process = _make_process(returncode=None)
        await svc._refresh_url()

    assert svc._funnel_url == "https://mymachine.tailnet-xyz.ts.net"
    assert svc._last_error is None
    health = svc.get_health()
    assert health["status"] == "running"
    assert health["url"] == "https://mymachine.tailnet-xyz.ts.net"


@pytest.mark.asyncio
async def test_funnel_stop_terminates_process():
    """_stop_funnel() terminates the process and runs ``tailscale funnel reset``."""
    proc = _make_process(returncode=None)
    reset_proc = _make_process(returncode=0)
    reset_proc.wait = AsyncMock(return_value=0)

    with patch("app.services.tailscale_service.shutil.which", return_value="/usr/bin/tailscale"), \
         patch("asyncio.create_subprocess_exec", return_value=reset_proc):
        svc = TailscaleFunnelService(_make_settings(enable_funnel=True))
        svc._enabled = True
        svc._process = proc
        svc._funnel_url = "https://mymachine.ts.net"
        await svc._stop_funnel()

    proc.terminate.assert_called_once()
    assert svc._process is None
    assert svc._funnel_url is None


@pytest.mark.asyncio
async def test_health_stopped_when_no_process():
    """get_health() returns 'stopped' when enabled but process is None."""
    svc = TailscaleFunnelService(_make_settings(enable_funnel=True))
    svc._enabled = True
    svc._process = None
    assert svc.get_health()["status"] == "stopped"


# ── Tests: not logged in ──────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_refresh_url_handles_not_logged_in():
    """_refresh_url() sets 'tailscale: not logged in' error when stderr contains hint."""
    err_output = b"Error: not logged in\n"
    status_proc = _make_process(returncode=1)
    status_proc.communicate = AsyncMock(return_value=(b"", err_output))

    with patch("app.services.tailscale_service.shutil.which", return_value="/usr/bin/tailscale"), \
         patch("asyncio.create_subprocess_exec", return_value=status_proc):
        svc = TailscaleFunnelService(_make_settings(enable_funnel=True))
        svc._enabled = True
        svc._process = _make_process(returncode=None)
        await svc._refresh_url()

    assert svc._last_error == "tailscale: not logged in"
    assert svc.get_health()["status"] == "error"


# ── Tests: tick-based settings reload ────────────────────────────────────────

@pytest.mark.asyncio
async def test_tick_starts_funnel_when_newly_enabled():
    """_tick() starts the funnel when settings change from disabled to enabled."""
    settings = _make_settings(enable_funnel=True)  # now enabled
    svc = TailscaleFunnelService(settings)
    svc._enabled = False  # was disabled

    with patch.object(svc, "_start_funnel", new_callable=AsyncMock) as mock_start, \
         patch("asyncio.sleep", new_callable=AsyncMock):
        await svc._tick()

    mock_start.assert_called_once()
    assert svc._enabled is True


@pytest.mark.asyncio
async def test_tick_stops_funnel_when_newly_disabled():
    """_tick() stops the funnel when settings change from enabled to disabled."""
    settings = _make_settings(enable_funnel=False)  # now disabled
    svc = TailscaleFunnelService(settings)
    svc._enabled = True  # was enabled
    svc._process = _make_process(returncode=None)

    with patch.object(svc, "_stop_funnel", new_callable=AsyncMock) as mock_stop, \
         patch("asyncio.sleep", new_callable=AsyncMock):
        await svc._tick()

    mock_stop.assert_called_once()
    assert svc._enabled is False


# ── Tests: health endpoint integration ───────────────────────────────────────

def test_health_endpoint_includes_tailscale_funnel():
    """GET /api/health must include 'tailscale_funnel' key with a valid status."""
    from unittest.mock import patch, AsyncMock
    from fastapi.testclient import TestClient
    from app.main import app

    # Patch startup checks so the TestClient doesn't need a real Ollama instance
    with patch("app.services.startup_checks.check_ollama", new_callable=AsyncMock, return_value=["llama3.2"]) as mock_checks:
        with TestClient(app) as tc:
            resp = tc.get("/api/health")

    assert resp.status_code == 200
    data = resp.json()
    assert "tailscale_funnel" in data
    ts = data["tailscale_funnel"]
    assert "status" in ts
    assert ts["status"] in ("disabled", "stopped", "running", "error")
