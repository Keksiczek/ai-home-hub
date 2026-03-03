"""Status router – aggregated system health dashboard endpoint."""
import asyncio
import asyncio.subprocess
import logging
import os
import shutil
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict

import httpx
from fastapi import APIRouter

from app.services.settings_service import get_settings_service
from app.services.vector_store_service import get_vector_store_service, CHROMA_DIR
from app.services.ws_manager import get_ws_manager
from app.services.agent_orchestrator import (
    get_agent_orchestrator,
    AGENT_STATUS_PENDING,
    AGENT_STATUS_RUNNING,
)
from app.services.task_manager import get_task_manager, STATUS_PENDING, STATUS_RUNNING

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/status", tags=["status"])

HEALTH_CHECK_TIMEOUT = 2.0  # seconds per component check


async def _check_ollama(settings: Dict[str, Any]) -> Dict[str, Any]:
    """Check Ollama LLM connectivity and response time."""
    llm_cfg = settings.get("llm", {})
    ollama_url = llm_cfg.get("ollama_url", "http://localhost:11434")
    model = llm_cfg.get("model", "llama3.2")

    try:
        start = time.monotonic()
        async with httpx.AsyncClient(timeout=HEALTH_CHECK_TIMEOUT) as client:
            resp = await client.get(ollama_url)
            elapsed_ms = round((time.monotonic() - start) * 1000)
            reachable = resp.status_code == 200
        return {
            "status": "healthy" if reachable else "unhealthy",
            "details": {
                "url": ollama_url,
                "model": model,
                "reachable": reachable,
                "response_time_ms": elapsed_ms,
            },
        }
    except Exception as exc:
        logger.warning("Ollama health check failed: %s", exc)
        return {
            "status": "unhealthy",
            "details": {
                "url": ollama_url,
                "model": model,
                "reachable": False,
                "response_time_ms": None,
                "error": str(exc),
            },
        }


async def _check_knowledge_base() -> Dict[str, Any]:
    """Check ChromaDB knowledge base status."""
    try:
        vs = get_vector_store_service()
        stats = vs.get_stats()

        # Calculate storage size
        storage_mb = 0.0
        if CHROMA_DIR.exists():
            total_size = sum(
                f.stat().st_size for f in CHROMA_DIR.rglob("*") if f.is_file()
            )
            storage_mb = round(total_size / (1024 * 1024), 1)

        return {
            "status": "healthy",
            "details": {
                "total_chunks": stats.get("total_chunks", 0),
                "collection_name": stats.get("collection_name", ""),
                "storage_size_mb": storage_mb,
                "chroma_db_path": str(CHROMA_DIR),
            },
        }
    except Exception as exc:
        logger.warning("Knowledge base health check failed: %s", exc)
        return {
            "status": "unhealthy",
            "details": {
                "error": str(exc),
                "chroma_db_path": str(CHROMA_DIR),
            },
        }


async def _check_filesystem(settings: Dict[str, Any]) -> Dict[str, Any]:
    """Check filesystem access and disk space."""
    fs_cfg = settings.get("filesystem", {})
    allowed_dirs = fs_cfg.get("allowed_directories", [])

    writable = True
    for d in allowed_dirs:
        if not os.access(d, os.R_OK | os.W_OK):
            writable = False
            break

    # Disk space for the project root
    try:
        usage = shutil.disk_usage(Path(__file__).parent.parent.parent)
        available_gb = round(usage.free / (1024 ** 3), 1)
    except Exception:
        available_gb = None

    status = "healthy"
    if not allowed_dirs:
        status = "warning"
    elif not writable:
        status = "warning"

    return {
        "status": status,
        "details": {
            "allowed_directories": allowed_dirs,
            "writable": writable,
            "disk_space_available_gb": available_gb,
        },
    }


async def _check_integrations(settings: Dict[str, Any]) -> Dict[str, Any]:
    """Check integration statuses."""
    integrations = settings.get("integrations", {})
    result = {}

    # VS Code
    vscode_cfg = integrations.get("vscode", {})
    binary_path = vscode_cfg.get("binary_path", "/usr/local/bin/code")
    vscode_found = shutil.which(binary_path) is not None
    projects = vscode_cfg.get("projects", {})
    result["vscode"] = {
        "status": "healthy" if vscode_found else ("unconfigured" if not vscode_cfg.get("enabled") else "unhealthy"),
        "details": {
            "binary_path": binary_path,
            "found": vscode_found,
            "configured_projects": len(projects),
        },
    }

    # Git
    try:
        proc = await asyncio.wait_for(
            asyncio.create_subprocess_exec(
                "git", "--version",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            ),
            timeout=HEALTH_CHECK_TIMEOUT,
        )
        stdout, _ = await proc.communicate()
        git_version = stdout.decode().strip() if proc.returncode == 0 else None
        git_exec = shutil.which("git")
        result["git"] = {
            "status": "healthy" if git_version else "unhealthy",
            "details": {
                "git_executable": git_exec or "not found",
                "version": git_version,
            },
        }
    except Exception as exc:
        logger.warning("Git health check failed: %s", exc)
        result["git"] = {
            "status": "unhealthy",
            "details": {"error": str(exc)},
        }

    # macOS
    osascript_available = shutil.which("osascript") is not None
    cliclick_available = shutil.which("cliclick") is not None
    result["macos"] = {
        "status": "healthy" if osascript_available else "unconfigured",
        "details": {
            "osascript_available": osascript_available,
            "cliclick_available": cliclick_available,
        },
    }

    # Claude MCP
    mcp_cfg = integrations.get("claude_mcp", {})
    mcp_enabled = mcp_cfg.get("enabled", False)
    mcp_path = mcp_cfg.get("stdio_path", "")
    result["claude_mcp"] = {
        "status": "configured" if mcp_enabled else "unconfigured",
        "details": {
            "enabled": mcp_enabled,
            "server_path": mcp_path,
        },
    }

    # Antigravity
    ag_cfg = integrations.get("antigravity", {})
    ag_enabled = ag_cfg.get("enabled", False)
    ag_key = ag_cfg.get("api_key", "")
    result["antigravity"] = {
        "status": "configured" if ag_enabled else "unconfigured",
        "details": {
            "enabled": ag_enabled,
            "api_key_set": bool(ag_key),
        },
    }

    return result


async def _check_agents() -> Dict[str, Any]:
    """Check agent orchestrator status."""
    try:
        orch = get_agent_orchestrator()
        agents = orch._agents
        active = sum(
            1 for a in agents.values()
            if a.status in (AGENT_STATUS_PENDING, AGENT_STATUS_RUNNING)
        )
        settings = get_settings_service().load()
        max_concurrent = settings.get("agents", {}).get("max_concurrent", 5)

        tm = get_task_manager()
        queued = sum(
            1 for t in tm._tasks.values()
            if t.status in (STATUS_PENDING, STATUS_RUNNING)
        )

        return {
            "status": "healthy",
            "details": {
                "active_agents": active,
                "max_concurrent": max_concurrent,
                "queued_tasks": queued,
            },
        }
    except Exception as exc:
        logger.warning("Agents health check failed: %s", exc)
        return {
            "status": "unhealthy",
            "details": {"error": str(exc)},
        }


async def _check_websocket() -> Dict[str, Any]:
    """Check WebSocket manager status."""
    try:
        ws = get_ws_manager()
        return {
            "status": "healthy",
            "details": {
                "active_connections": ws.connection_count,
            },
        }
    except Exception as exc:
        return {
            "status": "unhealthy",
            "details": {"error": str(exc)},
        }


def _determine_overall_status(components: Dict[str, Any]) -> str:
    """Determine overall system status from component statuses.

    Returns:
        'healthy' if all components are healthy/configured.
        'degraded' if non-essential components have issues.
        'unhealthy' if essential components (ollama, knowledge_base) are down.
    """
    # Essential components
    essential = ["ollama", "knowledge_base"]
    for key in essential:
        comp = components.get(key, {})
        if comp.get("status") == "unhealthy":
            return "unhealthy"

    # Check all component statuses (including nested integrations)
    all_statuses = []
    for key, comp in components.items():
        if key == "integrations":
            for _, sub in comp.items():
                all_statuses.append(sub.get("status", "unknown"))
        else:
            all_statuses.append(comp.get("status", "unknown"))

    if any(s in ("unhealthy", "warning") for s in all_statuses):
        return "degraded"

    return "healthy"


@router.get("")
async def get_system_status() -> Dict[str, Any]:
    """Return aggregated system status for all components.

    Each component check has a 2-second timeout to keep the endpoint responsive.
    """
    settings = get_settings_service().load()

    # Run all checks concurrently with individual timeouts
    ollama_task = asyncio.ensure_future(_check_ollama(settings))
    kb_task = asyncio.ensure_future(_check_knowledge_base())
    fs_task = asyncio.ensure_future(_check_filesystem(settings))
    integ_task = asyncio.ensure_future(_check_integrations(settings))
    agents_task = asyncio.ensure_future(_check_agents())
    ws_task = asyncio.ensure_future(_check_websocket())

    results = await asyncio.gather(
        ollama_task, kb_task, fs_task, integ_task, agents_task, ws_task,
        return_exceptions=True,
    )

    # Map results, replacing exceptions with unhealthy
    def _safe(result, name: str) -> Dict[str, Any]:
        if isinstance(result, Exception):
            logger.warning("Health check %s raised: %s", name, result)
            return {"status": "unhealthy", "details": {"error": str(result)}}
        return result

    components: Dict[str, Any] = {
        "ollama": _safe(results[0], "ollama"),
        "knowledge_base": _safe(results[1], "knowledge_base"),
        "filesystem": _safe(results[2], "filesystem"),
        "integrations": _safe(results[3], "integrations"),
        "agents": _safe(results[4], "agents"),
        "websocket": _safe(results[5], "websocket"),
    }

    overall_status = _determine_overall_status(components)

    # Broadcast alerts for unhealthy essential components
    for comp_name in ("ollama", "knowledge_base"):
        comp = components.get(comp_name, {})
        if comp.get("status") == "unhealthy":
            await _broadcast_status_alert(
                comp_name, f"{comp_name} is unreachable", "error"
            )

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "overall_status": overall_status,
        "components": components,
    }


async def _broadcast_status_alert(
    component: str, message: str, severity: str = "warning"
) -> None:
    """Broadcast a status alert to all WebSocket clients."""
    try:
        ws = get_ws_manager()
        await ws.broadcast({
            "type": "status_alert",
            "component": component,
            "message": message,
            "severity": severity,
        })
    except Exception as exc:
        logger.debug("Status alert broadcast failed: %s", exc)
