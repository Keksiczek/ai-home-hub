"""Claude MCP service – interface with Claude Desktop MCP servers."""
import asyncio
import json
import logging
from typing import Any, Dict, List, Optional

import httpx

from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)


class ClaudeMCPService:
    """
    Connect to Claude Desktop's MCP servers via stdio or HTTP.

    Available tools (when configured):
    - github: Issues, PRs, repositories
    - filesystem: Read/write/search files
    - brave-search: Web search
    - puppeteer: Browser automation
    - sequential-thinking: Complex reasoning chains
    """

    def __init__(self) -> None:
        self._settings = get_settings_service()
        self._stdio_proc: Optional[asyncio.subprocess.Process] = None

    def _cfg(self) -> Dict[str, Any]:
        return self._settings.get_integration_config("claude_mcp")

    def _is_enabled(self) -> bool:
        return self._cfg().get("enabled", False)

    def get_available_tools(self) -> List[str]:
        return self._cfg().get("available_tools", [])

    # ── HTTP mode ──────────────────────────────────────────────

    async def call_tool_http(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Call an MCP tool via HTTP endpoint."""
        endpoint = self._cfg().get("http_endpoint", "http://localhost:3000")
        url = f"{endpoint}/tools/{tool_name}"
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(url, json={"arguments": arguments})
                resp.raise_for_status()
                return resp.json()
        except httpx.ConnectError:
            raise RuntimeError(f"MCP server not reachable at {endpoint}")
        except httpx.HTTPStatusError as exc:
            raise RuntimeError(f"MCP HTTP error: {exc.response.status_code}")

    # ── Unified tool caller ────────────────────────────────────

    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Call any MCP tool, routing to the configured connection type."""
        if not self._is_enabled():
            return {
                "status": "disabled",
                "detail": "Claude MCP integration is not enabled. Enable it in Settings → Integrations.",
            }

        cfg = self._cfg()
        connection_type = cfg.get("connection_type", "stdio")

        if connection_type == "http":
            return await self.call_tool_http(tool_name, arguments)
        else:
            # stdio: placeholder – full stdio MCP implementation requires
            # starting the MCP server process and communicating over stdin/stdout
            # using the MCP JSON-RPC protocol.
            return {
                "status": "not_implemented",
                "detail": (
                    "stdio MCP connection requires Claude Desktop to be running "
                    "with MCP servers configured. HTTP connection type is recommended "
                    "for direct API access."
                ),
                "tool": tool_name,
                "arguments": arguments,
            }

    # ── Convenience wrappers ───────────────────────────────────

    async def github_create_issue(self, repo: str, title: str, body: str) -> Dict[str, Any]:
        return await self.call_tool("github_create_issue", {
            "repository": repo, "title": title, "body": body
        })

    async def github_list_issues(self, repo: str) -> Dict[str, Any]:
        return await self.call_tool("github_list_issues", {"repository": repo})

    async def filesystem_read(self, path: str) -> Dict[str, Any]:
        return await self.call_tool("filesystem_read", {"path": path})

    async def filesystem_search(self, path: str, pattern: str) -> Dict[str, Any]:
        return await self.call_tool("filesystem_search", {"path": path, "pattern": pattern})

    async def browser_navigate(self, url: str) -> Dict[str, Any]:
        return await self.call_tool("puppeteer_navigate", {"url": url})

    async def brave_search(self, query: str) -> Dict[str, Any]:
        return await self.call_tool("brave_search", {"query": query})

    def get_status(self) -> Dict[str, Any]:
        """Return MCP connection status."""
        cfg = self._cfg()
        return {
            "enabled": cfg.get("enabled", False),
            "connection_type": cfg.get("connection_type", "stdio"),
            "available_tools": self.get_available_tools(),
        }


_mcp_service: Optional[ClaudeMCPService] = None


def get_claude_mcp_service() -> ClaudeMCPService:
    global _mcp_service
    if _mcp_service is None:
        _mcp_service = ClaudeMCPService()
    return _mcp_service
