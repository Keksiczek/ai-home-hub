"""Antigravity IDE service – HTTP client for Google Antigravity agent API."""
import logging
from typing import Any, Dict, List, Optional

import httpx

from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)


class AntigravityService:
    """
    Interface with Google Antigravity IDE:
    - Trigger agentic code generation
    - Monitor agent tasks
    - Retrieve generated artifacts
    - Execute browser automation
    """

    def __init__(self) -> None:
        self._settings = get_settings_service()

    def _cfg(self) -> Dict[str, Any]:
        return self._settings.get_integration_config("antigravity")

    def _is_enabled(self) -> bool:
        return self._cfg().get("enabled", False)

    def _base_url(self) -> str:
        return self._cfg().get("api_endpoint", "http://localhost:8080").rstrip("/")

    def _headers(self) -> Dict[str, str]:
        api_key = self._cfg().get("api_key", "")
        headers: Dict[str, str] = {"Content-Type": "application/json"}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
        return headers

    def _client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(
            base_url=self._base_url(),
            headers=self._headers(),
            timeout=60.0,
        )

    def _check_enabled(self) -> Optional[Dict[str, Any]]:
        if not self._is_enabled():
            return {
                "status": "disabled",
                "detail": (
                    "Antigravity IDE integration is not enabled. "
                    "Configure it in Settings → Integrations."
                ),
            }
        return None

    # ── Agent operations ───────────────────────────────────────

    async def start_agent_task(self, prompt: str, workspace: Optional[str] = None) -> Dict[str, Any]:
        """Start an Antigravity agent on a specific task."""
        if err := self._check_enabled():
            return err

        cfg = self._cfg()
        ws = workspace or cfg.get("workspace_root", "")
        payload = {"prompt": prompt, "workspace": ws}

        try:
            async with self._client() as client:
                resp = await client.post("/api/agents/start", json=payload)
                resp.raise_for_status()
                return {"status": "ok", "data": resp.json()}
        except httpx.ConnectError:
            return {"status": "error", "detail": f"Cannot reach Antigravity at {self._base_url()}"}
        except httpx.HTTPStatusError as exc:
            return {"status": "error", "detail": f"HTTP {exc.response.status_code}"}
        except Exception as exc:
            return {"status": "error", "detail": str(exc)}

    async def get_agent_status(self, task_id: str) -> Dict[str, Any]:
        """Check progress of an Antigravity agent task."""
        if err := self._check_enabled():
            return err

        try:
            async with self._client() as client:
                resp = await client.get(f"/api/agents/{task_id}/status")
                resp.raise_for_status()
                return {"status": "ok", "data": resp.json()}
        except httpx.ConnectError:
            return {"status": "error", "detail": f"Cannot reach Antigravity at {self._base_url()}"}
        except Exception as exc:
            return {"status": "error", "detail": str(exc)}

    async def retrieve_artifacts(self, task_id: str) -> Dict[str, Any]:
        """Get generated code, plans, and screenshots from a task."""
        if err := self._check_enabled():
            return err

        try:
            async with self._client() as client:
                resp = await client.get(f"/api/agents/{task_id}/artifacts")
                resp.raise_for_status()
                return {"status": "ok", "data": resp.json()}
        except httpx.ConnectError:
            return {"status": "error", "detail": f"Cannot reach Antigravity at {self._base_url()}"}
        except Exception as exc:
            return {"status": "error", "detail": str(exc)}

    async def list_agents(self) -> Dict[str, Any]:
        """List all active Antigravity agents."""
        if err := self._check_enabled():
            return err

        try:
            async with self._client() as client:
                resp = await client.get("/api/agents")
                resp.raise_for_status()
                return {"status": "ok", "data": resp.json()}
        except httpx.ConnectError:
            return {"status": "error", "detail": f"Cannot reach Antigravity at {self._base_url()}"}
        except Exception as exc:
            return {"status": "error", "detail": str(exc)}

    async def browser_action(self, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Control browser via Antigravity's Chrome extension."""
        if err := self._check_enabled():
            return err

        payload = {"action": action, **params}
        try:
            async with self._client() as client:
                resp = await client.post("/api/browser", json=payload)
                resp.raise_for_status()
                return {"status": "ok", "data": resp.json()}
        except httpx.ConnectError:
            return {"status": "error", "detail": f"Cannot reach Antigravity at {self._base_url()}"}
        except Exception as exc:
            return {"status": "error", "detail": str(exc)}

    async def check_health(self) -> Dict[str, Any]:
        """Check if Antigravity IDE API is reachable."""
        if not self._is_enabled():
            return {"status": "disabled"}

        try:
            async with self._client() as client:
                resp = await client.get("/api/health")
                resp.raise_for_status()
                return {"status": "ok", "endpoint": self._base_url()}
        except httpx.ConnectError:
            return {"status": "unreachable", "endpoint": self._base_url()}
        except Exception as exc:
            return {"status": "error", "detail": str(exc)}


_antigravity_service: Optional[AntigravityService] = None


def get_antigravity_service() -> AntigravityService:
    global _antigravity_service
    if _antigravity_service is None:
        _antigravity_service = AntigravityService()
    return _antigravity_service
