"""VS Code service – programmatic control via the `code` CLI."""
import asyncio
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)


class VSCodeService:
    def __init__(self) -> None:
        self._settings = get_settings_service()

    def _cfg(self) -> Dict[str, Any]:
        return self._settings.get_integration_config("vscode")

    def _binary(self) -> str:
        return self._cfg().get("binary_path", "code")

    def _project(self, key: str) -> Optional[Dict[str, Any]]:
        return self._cfg().get("projects", {}).get(key)

    async def _run(self, *args: str, cwd: Optional[str] = None) -> str:
        """Run the VS Code CLI and return stdout."""
        proc = await asyncio.create_subprocess_exec(
            self._binary(), *args,
            cwd=cwd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=30.0)
        if proc.returncode not in (0, None):
            logger.debug("VS Code CLI stderr: %s", stderr.decode())
        return stdout.decode().strip()

    # ── Project / file operations ──────────────────────────────

    async def open_project(self, project_key: str) -> str:
        """Open a configured project by its key."""
        project = self._project(project_key)
        if not project:
            raise ValueError(f"Unknown project: {project_key}")

        workspace = project.get("workspace")
        path = project.get("path", "")
        target = workspace if workspace else path
        await self._run(target)
        return f"Opened project '{project_key}' in VS Code"

    async def open_file_at_line(self, file_path: str, line: Optional[int] = None) -> str:
        """Open a file, optionally jumping to a specific line."""
        target = f"{file_path}:{line}" if line else file_path
        await self._run("--goto", target)
        return f"Opened {file_path}" + (f" at line {line}" if line else "")

    async def open_folder(self, folder_path: str) -> str:
        """Open a folder in VS Code."""
        await self._run(folder_path)
        return f"Opened folder: {folder_path}"

    # ── Task execution ─────────────────────────────────────────

    async def run_task(self, project_key: str, task_name: str) -> str:
        """Execute a VS Code task (runs the task runner in the project workspace)."""
        project = self._project(project_key)
        if not project:
            raise ValueError(f"Unknown project: {project_key}")
        path = project.get("path", ".")
        # VS Code --run-task only works when a workspace is already open, so we
        # open the workspace and schedule the task via the command palette
        await self._run("--folder-uri", f"file://{path}", "--run-task", task_name)
        return f"Task '{task_name}' triggered in project '{project_key}'"

    # ── Extensions ────────────────────────────────────────────

    async def install_extension(self, extension_id: str) -> str:
        """Install a VS Code extension by ID."""
        await self._run("--install-extension", extension_id)
        return f"Extension '{extension_id}' installed"

    async def list_extensions(self) -> List[str]:
        """Return list of installed extension IDs."""
        result = await self._run("--list-extensions")
        return [e.strip() for e in result.splitlines() if e.strip()]

    # ── Diagnostics ────────────────────────────────────────────

    async def get_diagnostics(self, project_key: str) -> Dict[str, Any]:
        """
        Try to read VSCode diagnostics from a workspace.

        Note: VS Code does not expose diagnostics directly via CLI. This
        implementation looks for common lint output files as a best-effort
        approach.
        """
        project = self._project(project_key)
        if not project:
            return {"status": "error", "detail": f"Unknown project: {project_key}"}

        path = Path(project.get("path", "."))
        # Look for common output files
        candidates = [
            path / "lint-results.json",
            path / ".eslintcache",
            path / "test-results.xml",
        ]
        found = [str(c) for c in candidates if c.exists()]
        return {
            "status": "ok",
            "project": project_key,
            "path": str(path),
            "diagnostic_files": found,
        }

    # ── Status ────────────────────────────────────────────────

    async def get_version(self) -> str:
        """Return VS Code version string."""
        try:
            return await self._run("--version")
        except Exception as exc:
            return f"VS Code not found: {exc}"

    def list_projects(self) -> Dict[str, Any]:
        """Return all configured projects."""
        return self._cfg().get("projects", {})

    # ── Generic action dispatcher ──────────────────────────────

    async def run_action(self, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
        try:
            if action == "open_project":
                result = await self.open_project(params["project_key"])
            elif action == "open_file":
                result = await self.open_file_at_line(
                    params["file_path"], params.get("line")
                )
            elif action == "open_folder":
                result = await self.open_folder(params["path"])
            elif action == "run_task":
                result = await self.run_task(params["project_key"], params["task_name"])
            elif action == "install_extension":
                result = await self.install_extension(params["extension_id"])
            elif action == "list_extensions":
                exts = await self.list_extensions()
                return {"status": "ok", "data": {"extensions": exts}}
            elif action == "version":
                version = await self.get_version()
                return {"status": "ok", "data": {"version": version}}
            elif action == "diagnostics":
                return await self.get_diagnostics(params.get("project_key", ""))
            else:
                return {"status": "error", "detail": f"Unknown action: {action}"}

            return {"status": "ok", "detail": result}
        except ValueError as exc:
            return {"status": "error", "detail": str(exc)}
        except asyncio.TimeoutError:
            return {"status": "error", "detail": "VS Code CLI timed out"}
        except FileNotFoundError:
            return {"status": "error", "detail": "VS Code CLI not found. Check binary_path in settings."}
        except Exception as exc:
            logger.error("VS Code action error: %s", exc)
            return {"status": "error", "detail": str(exc)}


_vscode_service: Optional[VSCodeService] = None


def get_vscode_service() -> VSCodeService:
    global _vscode_service
    if _vscode_service is None:
        _vscode_service = VSCodeService()
    return _vscode_service
