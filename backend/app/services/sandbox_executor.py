"""Sandbox Executor – safely executes system capabilities with constraints.

All capability execution goes through this module.  It enforces:
- Master switch (AUTONOMY_ACCESS_ENABLED)
- Killswitch state
- Whitelist validation (commands, paths, domains, apps)
- Timeout enforcement
- Risk-tier approval gates
- Full audit logging

Cross-platform: adapts shell parsing and path resolution per OS.
"""

from __future__ import annotations

import logging
import os
import platform
import shlex
import subprocess
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

import psutil

from app.db.audit_log import get_audit_log_db
from app.services.capabilities import (
    RISK_HIGH,
    SANDBOX_ROOT,
    CapabilityDef,
    get_capability_registry,
)

logger = logging.getLogger(__name__)


@dataclass
class ExecutionResult:
    """Result of a capability execution."""

    status: str  # ok | error | blocked | timeout | permission_denied | blocked_human_review
    capability: str = ""
    output: str = ""
    error: str = ""
    duration_ms: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "status": self.status,
            "capability": self.capability,
            "output": self.output,
            "error": self.error,
            "duration_ms": self.duration_ms,
            "metadata": self.metadata,
        }


class SandboxExecutor:
    """Executes capabilities inside safety constraints."""

    def __init__(self) -> None:
        self._sandbox_root = Path(SANDBOX_ROOT)
        self._sandbox_root.mkdir(parents=True, exist_ok=True)
        self._running_processes: List[subprocess.Popen] = []

    # ── Public API ───────────────────────────────────────────────

    def execute(self, cap_name: str, params: Dict[str, Any]) -> ExecutionResult:
        """Execute a capability with full safety checks and audit logging."""
        registry = get_capability_registry()
        audit = get_audit_log_db()
        start = time.monotonic()

        # Master switch
        if not registry.is_enabled:
            audit.log(
                capability=cap_name,
                params=params,
                result_status="blocked",
                result_summary="Capability system disabled or killswitch active",
            )
            return ExecutionResult(
                status="blocked",
                capability=cap_name,
                error="Capability system is disabled (AUTONOMY_ACCESS_ENABLED=false or killswitch active)",
            )

        # Capability exists?
        cap = registry.get(cap_name)
        if cap is None:
            audit.log(capability=cap_name, params=params, result_status="error", error="Unknown capability")
            return ExecutionResult(status="error", capability=cap_name, error=f"Unknown capability: {cap_name}")

        # High-risk approval gate
        if registry.requires_approval(cap_name):
            approval_id = registry.request_approval(cap_name, params)
            audit.log(
                capability=cap_name,
                params=params,
                result_status="blocked_human_review",
                result_summary=f"Awaiting approval: {approval_id}",
                risk_tier=cap.risk,
            )
            return ExecutionResult(
                status="blocked_human_review",
                capability=cap_name,
                error=f"High-risk capability requires approval (id={approval_id})",
                metadata={"approval_id": approval_id},
            )

        # Dispatch to handler
        try:
            result = self._dispatch(cap_name, cap, params)
        except TimeoutError:
            elapsed = (time.monotonic() - start) * 1000
            audit.log(
                capability=cap_name, params=params,
                result_status="timeout", error="Execution timed out",
                duration_ms=elapsed, risk_tier=cap.risk,
            )
            return ExecutionResult(status="timeout", capability=cap_name, error="Execution timed out", duration_ms=elapsed)
        except PermissionError as e:
            elapsed = (time.monotonic() - start) * 1000
            audit.log(
                capability=cap_name, params=params,
                result_status="permission_denied", error=str(e),
                duration_ms=elapsed, risk_tier=cap.risk,
            )
            return ExecutionResult(status="permission_denied", capability=cap_name, error=str(e), duration_ms=elapsed)
        except Exception as e:
            elapsed = (time.monotonic() - start) * 1000
            audit.log(
                capability=cap_name, params=params,
                result_status="error", error=str(e),
                duration_ms=elapsed, risk_tier=cap.risk,
            )
            return ExecutionResult(status="error", capability=cap_name, error=str(e), duration_ms=elapsed)

        elapsed = (time.monotonic() - start) * 1000
        result.duration_ms = elapsed

        # Audit success
        audit.log(
            capability=cap_name,
            action=params.get("command", params.get("path", params.get("url", ""))),
            params=params,
            result_status=result.status,
            result_summary=result.output[:200] if result.output else "",
            duration_ms=elapsed,
            risk_tier=cap.risk,
            approved_by="auto" if cap.risk != RISK_HIGH else "user",
        )
        return result

    def kill_all(self) -> int:
        """Kill all running subprocesses. Returns count killed."""
        killed = 0
        for proc in self._running_processes:
            try:
                proc.kill()
                killed += 1
            except Exception:
                pass
        self._running_processes.clear()
        return killed

    # ── Dispatch ─────────────────────────────────────────────────

    def _dispatch(self, cap_name: str, cap: CapabilityDef, params: Dict[str, Any]) -> ExecutionResult:
        handlers = {
            "shell": self._exec_shell,
            "file_read": self._exec_file_read,
            "file_write": self._exec_file_write,
            "file_list": self._exec_file_list,
            "file_delete": self._exec_file_delete,
            "browser_open": self._exec_browser_open,
            "app_launch": self._exec_app_launch,
            "screenshot": self._exec_screenshot,
            "system_monitor": self._exec_system_monitor,
        }
        handler = handlers.get(cap_name)
        if handler is None:
            return ExecutionResult(status="error", capability=cap_name, error=f"No handler for capability: {cap_name}")
        return handler(cap, params)

    # ── Shell ────────────────────────────────────────────────────

    def _exec_shell(self, cap: CapabilityDef, params: Dict[str, Any]) -> ExecutionResult:
        command = params.get("command", "")
        if not command:
            return ExecutionResult(status="error", capability="shell", error="No command provided")

        # Validate against whitelist
        if not self._is_command_whitelisted(command, cap.whitelist):
            return ExecutionResult(
                status="permission_denied",
                capability="shell",
                error=f"Command not whitelisted: {command}",
            )

        # Sanitize environment – remove sensitive vars
        safe_env = {
            k: v for k, v in os.environ.items()
            if k not in ("HOME", "SSH_AUTH_SOCK", "AWS_SECRET_ACCESS_KEY", "GITHUB_TOKEN")
        }

        try:
            proc = subprocess.run(
                command,
                shell=True,
                timeout=cap.timeout_s,
                capture_output=True,
                text=True,
                cwd=str(self._sandbox_root),
                env=safe_env,
            )
            self._running_processes = [p for p in self._running_processes if p.poll() is None]

            output = proc.stdout[:4096] if proc.stdout else ""
            error = proc.stderr[:2048] if proc.stderr else ""
            status = "ok" if proc.returncode == 0 else "error"

            return ExecutionResult(
                status=status,
                capability="shell",
                output=output,
                error=error,
                metadata={"returncode": proc.returncode},
            )
        except subprocess.TimeoutExpired:
            raise TimeoutError(f"Shell command timed out after {cap.timeout_s}s")

    def _is_command_whitelisted(self, command: str, whitelist: List[str]) -> bool:
        """Check if command starts with a whitelisted command prefix."""
        cmd_lower = command.strip().lower()
        for allowed in whitelist:
            allowed_lower = allowed.lower()
            if cmd_lower == allowed_lower or cmd_lower.startswith(allowed_lower + " "):
                return True
        return False

    # ── File Read ────────────────────────────────────────────────

    def _exec_file_read(self, cap: CapabilityDef, params: Dict[str, Any]) -> ExecutionResult:
        path_str = params.get("path", "")
        if not path_str:
            return ExecutionResult(status="error", capability="file_read", error="No path provided")

        resolved = Path(path_str).expanduser().resolve()
        if not self._is_path_allowed(resolved, cap.allowed_paths):
            return ExecutionResult(
                status="permission_denied", capability="file_read",
                error=f"Path not in allowed directories: {path_str}",
            )

        if not resolved.exists():
            return ExecutionResult(status="error", capability="file_read", error=f"File not found: {path_str}")

        try:
            content = resolved.read_text(encoding="utf-8", errors="replace")[:cap.max_size_kb * 1024]
            return ExecutionResult(
                status="ok", capability="file_read", output=content,
                metadata={"path": str(resolved), "size_bytes": resolved.stat().st_size},
            )
        except Exception as e:
            return ExecutionResult(status="error", capability="file_read", error=str(e))

    # ── File Write ───────────────────────────────────────────────

    def _exec_file_write(self, cap: CapabilityDef, params: Dict[str, Any]) -> ExecutionResult:
        path_str = params.get("path", "")
        content = params.get("content", "")
        if not path_str:
            return ExecutionResult(status="error", capability="file_write", error="No path provided")

        resolved = Path(path_str).expanduser().resolve()
        if not self._is_path_allowed(resolved, cap.allowed_paths):
            return ExecutionResult(
                status="permission_denied", capability="file_write",
                error=f"Path not in allowed directories: {path_str}",
            )

        # Size check
        content_size_kb = len(content.encode("utf-8")) / 1024
        if content_size_kb > cap.max_size_kb:
            return ExecutionResult(
                status="error", capability="file_write",
                error=f"Content size {content_size_kb:.1f}KB exceeds limit {cap.max_size_kb}KB",
            )

        try:
            resolved.parent.mkdir(parents=True, exist_ok=True)
            resolved.write_text(content, encoding="utf-8")
            return ExecutionResult(
                status="ok", capability="file_write",
                output=f"Written {len(content)} bytes to {resolved}",
                metadata={"path": str(resolved), "size_bytes": len(content.encode("utf-8"))},
            )
        except Exception as e:
            return ExecutionResult(status="error", capability="file_write", error=str(e))

    # ── File List ────────────────────────────────────────────────

    def _exec_file_list(self, cap: CapabilityDef, params: Dict[str, Any]) -> ExecutionResult:
        path_str = params.get("path", ".")
        resolved = Path(path_str).expanduser().resolve()

        if not self._is_path_allowed(resolved, cap.allowed_paths):
            return ExecutionResult(
                status="permission_denied", capability="file_list",
                error=f"Path not in allowed directories: {path_str}",
            )

        if not resolved.is_dir():
            return ExecutionResult(status="error", capability="file_list", error=f"Not a directory: {path_str}")

        try:
            entries = []
            for entry in sorted(resolved.iterdir()):
                entries.append({
                    "name": entry.name,
                    "is_dir": entry.is_dir(),
                    "size": entry.stat().st_size if entry.is_file() else 0,
                })
            return ExecutionResult(
                status="ok", capability="file_list",
                output="\n".join(e["name"] for e in entries[:100]),
                metadata={"path": str(resolved), "entries": entries[:100]},
            )
        except Exception as e:
            return ExecutionResult(status="error", capability="file_list", error=str(e))

    # ── File Delete ──────────────────────────────────────────────

    def _exec_file_delete(self, cap: CapabilityDef, params: Dict[str, Any]) -> ExecutionResult:
        path_str = params.get("path", "")
        if not path_str:
            return ExecutionResult(status="error", capability="file_delete", error="No path provided")

        resolved = Path(path_str).expanduser().resolve()
        if not self._is_path_allowed(resolved, cap.allowed_paths):
            return ExecutionResult(
                status="permission_denied", capability="file_delete",
                error=f"Path not in allowed directories: {path_str}",
            )

        if not resolved.exists():
            return ExecutionResult(status="error", capability="file_delete", error=f"File not found: {path_str}")

        if resolved.is_dir():
            return ExecutionResult(status="error", capability="file_delete", error="Cannot delete directories (safety)")

        try:
            size = resolved.stat().st_size
            resolved.unlink()
            return ExecutionResult(
                status="ok", capability="file_delete",
                output=f"Deleted {resolved} ({size} bytes)",
                metadata={"path": str(resolved), "size_bytes": size},
            )
        except Exception as e:
            return ExecutionResult(status="error", capability="file_delete", error=str(e))

    # ── Browser ──────────────────────────────────────────────────

    def _exec_browser_open(self, cap: CapabilityDef, params: Dict[str, Any]) -> ExecutionResult:
        url = params.get("url", "")
        if not url:
            return ExecutionResult(status="error", capability="browser_open", error="No URL provided")

        # Domain whitelist check
        parsed = urlparse(url)
        domain = parsed.hostname or ""
        if not any(domain == d or domain.endswith("." + d) for d in cap.allowed_domains):
            return ExecutionResult(
                status="permission_denied", capability="browser_open",
                error=f"Domain not whitelisted: {domain}",
            )

        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            return ExecutionResult(
                status="error", capability="browser_open",
                error="Playwright not installed. Run: pip install playwright && playwright install chromium",
            )

        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.goto(url, timeout=cap.timeout_s * 1000)
                title = page.title()
                content = page.content()[:8192]
                browser.close()

            return ExecutionResult(
                status="ok", capability="browser_open",
                output=content,
                metadata={"url": url, "title": title},
            )
        except Exception as e:
            return ExecutionResult(status="error", capability="browser_open", error=str(e))

    # ── App Launch ───────────────────────────────────────────────

    def _exec_app_launch(self, cap: CapabilityDef, params: Dict[str, Any]) -> ExecutionResult:
        app_name = params.get("app", "")
        if not app_name:
            return ExecutionResult(status="error", capability="app_launch", error="No app name provided")

        if app_name.lower() not in [w.lower() for w in cap.whitelist]:
            return ExecutionResult(
                status="permission_denied", capability="app_launch",
                error=f"App not whitelisted: {app_name}",
            )

        try:
            sys_name = platform.system()
            if sys_name == "Darwin":
                proc = subprocess.Popen(["open", "-a", app_name], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            elif sys_name == "Windows":
                proc = subprocess.Popen(["start", app_name], shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            else:
                proc = subprocess.Popen([app_name], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

            self._running_processes.append(proc)
            return ExecutionResult(
                status="ok", capability="app_launch",
                output=f"Launched {app_name} (pid={proc.pid})",
                metadata={"app": app_name, "pid": proc.pid},
            )
        except Exception as e:
            return ExecutionResult(status="error", capability="app_launch", error=str(e))

    # ── Screenshot ───────────────────────────────────────────────

    def _exec_screenshot(self, cap: CapabilityDef, params: Dict[str, Any]) -> ExecutionResult:
        output_path = self._sandbox_root / "screenshot.png"
        try:
            from PIL import ImageGrab
            img = ImageGrab.grab()
            img.save(str(output_path))
            return ExecutionResult(
                status="ok", capability="screenshot",
                output=f"Screenshot saved to {output_path}",
                metadata={"path": str(output_path), "size": output_path.stat().st_size},
            )
        except ImportError:
            return ExecutionResult(status="error", capability="screenshot", error="Pillow ImageGrab not available")
        except Exception as e:
            return ExecutionResult(status="error", capability="screenshot", error=str(e))

    # ── System Monitor ───────────────────────────────────────────

    def _exec_system_monitor(self, cap: CapabilityDef, params: Dict[str, Any]) -> ExecutionResult:
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            mem = psutil.virtual_memory()
            disk = psutil.disk_usage("/")
            procs = len(psutil.pids())

            info = {
                "cpu_percent": cpu_percent,
                "memory_total_gb": round(mem.total / (1024**3), 2),
                "memory_used_gb": round(mem.used / (1024**3), 2),
                "memory_percent": mem.percent,
                "disk_total_gb": round(disk.total / (1024**3), 2),
                "disk_used_gb": round(disk.used / (1024**3), 2),
                "disk_percent": disk.percent,
                "process_count": procs,
                "platform": platform.system(),
                "platform_version": platform.version(),
            }

            summary = (
                f"CPU: {cpu_percent}% | "
                f"RAM: {mem.percent}% ({info['memory_used_gb']}/{info['memory_total_gb']}GB) | "
                f"Disk: {disk.percent}% | "
                f"Processes: {procs}"
            )

            return ExecutionResult(
                status="ok", capability="system_monitor",
                output=summary,
                metadata=info,
            )
        except Exception as e:
            return ExecutionResult(status="error", capability="system_monitor", error=str(e))

    # ── Path validation helper ───────────────────────────────────

    def _is_path_allowed(self, resolved_path: Path, allowed_paths: List[str]) -> bool:
        """Check if resolved_path is inside any of the allowed paths."""
        for allowed in allowed_paths:
            allowed_resolved = Path(allowed).expanduser().resolve()
            try:
                resolved_path.relative_to(allowed_resolved)
                return True
            except ValueError:
                continue
        return False


# ── Singleton ────────────────────────────────────────────────────────────────

_instance: Optional[SandboxExecutor] = None


def get_sandbox_executor() -> SandboxExecutor:
    global _instance
    if _instance is None:
        _instance = SandboxExecutor()
    return _instance


def reset_sandbox_executor() -> None:
    """Reset singleton (for testing)."""
    global _instance
    _instance = None
