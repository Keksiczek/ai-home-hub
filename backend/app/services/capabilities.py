"""Capability registry – defines what system actions the resident agent may perform.

Each capability has:
- A whitelist of allowed values (commands, paths, domains, apps)
- A risk tier (low / medium / high)
- Execution constraints (timeout, max params, max file size)

The registry is the single source of truth for all system-access permissions.
Master switch: ``AUTONOMY_ACCESS_ENABLED`` must be ``True`` for any capability
to execute.
"""

from __future__ import annotations

import os
import platform
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

# ── Master switch ────────────────────────────────────────────────────────────

AUTONOMY_ACCESS_ENABLED: bool = (
    os.getenv("AUTONOMY_ACCESS_ENABLED", "false").lower() == "true"
)

# ── Risk tiers ───────────────────────────────────────────────────────────────

RISK_LOW = "low"
RISK_MEDIUM = "medium"
RISK_HIGH = "high"

RISK_TIERS = (RISK_LOW, RISK_MEDIUM, RISK_HIGH)


@dataclass
class CapabilityDef:
    """Definition of a single system capability."""

    name: str
    risk: str  # low | medium | high
    description: str = ""
    # Whitelists / constraints – populated per capability type
    whitelist: List[str] = field(default_factory=list)
    allowed_paths: List[str] = field(default_factory=list)
    allowed_domains: List[str] = field(default_factory=list)
    timeout_s: int = 30
    max_params: int = 4
    max_size_kb: int = 1024

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "risk": self.risk,
            "description": self.description,
            "whitelist": self.whitelist,
            "allowed_paths": self.allowed_paths,
            "allowed_domains": self.allowed_domains,
            "timeout_s": self.timeout_s,
            "max_params": self.max_params,
            "max_size_kb": self.max_size_kb,
        }


# ── Cross-platform shell whitelists ─────────────────────────────────────────

_SHELL_WHITELIST_UNIX = [
    "ls",
    "pwd",
    "ps",
    "ps aux",
    "top -l 1",
    "df",
    "df -h",
    "git status",
    "git log --oneline -10",
    "uptime",
    "whoami",
    "date",
    "cat",
    "head",
    "tail",
    "wc",
    "du -sh",
    "echo",
]

_SHELL_WHITELIST_WINDOWS = [
    "dir",
    "cd",
    "tasklist",
    "type",
    "systeminfo",
    "git status",
    "git log --oneline -10",
    "whoami",
    "date /t",
]


def _default_shell_whitelist() -> List[str]:
    if platform.system() == "Windows":
        return list(_SHELL_WHITELIST_WINDOWS)
    return list(_SHELL_WHITELIST_UNIX)


# ── Default app whitelist (cross-platform) ───────────────────────────────────

_APP_WHITELIST_MACOS = ["code", "firefox", "safari", "terminal", "iterm2"]
_APP_WHITELIST_LINUX = ["code", "firefox", "xterm", "gnome-terminal"]
_APP_WHITELIST_WINDOWS = ["code", "firefox", "notepad", "cmd"]


def _default_app_whitelist() -> List[str]:
    sys_name = platform.system()
    if sys_name == "Darwin":
        return list(_APP_WHITELIST_MACOS)
    if sys_name == "Windows":
        return list(_APP_WHITELIST_WINDOWS)
    return list(_APP_WHITELIST_LINUX)


# ── Sandbox root ─────────────────────────────────────────────────────────────

SANDBOX_ROOT = os.getenv("SANDBOX_ROOT", "./sandbox_data")

# ── Default capability definitions ───────────────────────────────────────────

DEFAULT_CAPABILITIES: Dict[str, CapabilityDef] = {
    "shell": CapabilityDef(
        name="shell",
        risk=RISK_MEDIUM,
        description="Execute whitelisted shell commands in a sandbox CWD",
        whitelist=_default_shell_whitelist(),
        timeout_s=30,
        max_params=2,
    ),
    "file_read": CapabilityDef(
        name="file_read",
        risk=RISK_LOW,
        description="Read files from allowed paths",
        allowed_paths=["./data", "~/Documents"],
        timeout_s=10,
    ),
    "file_write": CapabilityDef(
        name="file_write",
        risk=RISK_HIGH,
        description="Write files to allowed output paths",
        allowed_paths=["./data/output"],
        max_size_kb=1024,
        timeout_s=15,
    ),
    "file_list": CapabilityDef(
        name="file_list",
        risk=RISK_LOW,
        description="List directory contents from allowed paths",
        allowed_paths=["./data"],
        timeout_s=10,
    ),
    "file_delete": CapabilityDef(
        name="file_delete",
        risk=RISK_HIGH,
        description="Delete files from allowed output paths",
        allowed_paths=["./data/output"],
        timeout_s=10,
    ),
    "browser_open": CapabilityDef(
        name="browser_open",
        risk=RISK_MEDIUM,
        description="Open URLs in an automated browser (Playwright)",
        allowed_domains=["github.com", "localhost", "127.0.0.1"],
        timeout_s=60,
    ),
    "app_launch": CapabilityDef(
        name="app_launch",
        risk=RISK_HIGH,
        description="Launch whitelisted desktop applications",
        whitelist=_default_app_whitelist(),
        timeout_s=15,
    ),
    "screenshot": CapabilityDef(
        name="screenshot",
        risk=RISK_LOW,
        description="Capture a desktop screenshot",
        timeout_s=10,
    ),
    "system_monitor": CapabilityDef(
        name="system_monitor",
        risk=RISK_LOW,
        description="Read system metrics (CPU, memory, disk) via psutil",
        timeout_s=10,
    ),
}


# ── Capability Registry (runtime singleton) ─────────────────────────────────


class CapabilityRegistry:
    """Runtime registry that manages capability definitions and approval state."""

    def __init__(self) -> None:
        self._capabilities: Dict[str, CapabilityDef] = dict(DEFAULT_CAPABILITIES)
        self._blocked: bool = False  # killswitch flag
        self._pending_approvals: Dict[str, Dict[str, Any]] = {}
        self._approved_caps: set[str] = set()  # caps manually approved by user

    # ── Query ────────────────────────────────────────────────────

    @property
    def is_enabled(self) -> bool:
        return AUTONOMY_ACCESS_ENABLED and not self._blocked

    @property
    def is_blocked(self) -> bool:
        return self._blocked

    def get(self, name: str) -> Optional[CapabilityDef]:
        return self._capabilities.get(name)

    def all(self) -> Dict[str, CapabilityDef]:
        return dict(self._capabilities)

    def list_names(self) -> List[str]:
        return list(self._capabilities.keys())

    # ── Risk classification ──────────────────────────────────────

    def is_high_risk(self, cap_name: str) -> bool:
        cap = self._capabilities.get(cap_name)
        return cap is not None and cap.risk == RISK_HIGH

    def requires_approval(self, cap_name: str) -> bool:
        """High-risk capabilities need explicit user approval before execution."""
        return self.is_high_risk(cap_name) and cap_name not in self._approved_caps

    # ── Approval management ──────────────────────────────────────

    def request_approval(self, cap_name: str, params: Dict[str, Any]) -> str:
        """Queue a capability for human approval. Returns an approval ID."""
        import uuid

        approval_id = str(uuid.uuid4())[:8]
        self._pending_approvals[approval_id] = {
            "cap_name": cap_name,
            "params": params,
            "status": "pending",
        }
        return approval_id

    def approve(self, approval_id: str) -> bool:
        """Approve a pending capability request."""
        entry = self._pending_approvals.get(approval_id)
        if entry and entry["status"] == "pending":
            entry["status"] = "approved"
            self._approved_caps.add(entry["cap_name"])
            return True
        return False

    def deny(self, approval_id: str) -> bool:
        """Deny a pending capability request."""
        entry = self._pending_approvals.get(approval_id)
        if entry and entry["status"] == "pending":
            entry["status"] = "denied"
            return True
        return False

    def get_pending_approvals(self) -> List[Dict[str, Any]]:
        return [
            {"id": k, **v}
            for k, v in self._pending_approvals.items()
            if v["status"] == "pending"
        ]

    # ── Killswitch ───────────────────────────────────────────────

    def emergency_stop(self, reason: str = "") -> None:
        """Block ALL capability execution immediately."""
        self._blocked = True
        self._pending_approvals.clear()

    def resume(self) -> None:
        """Re-enable capabilities after emergency stop."""
        self._blocked = False

    # ── Serialization ────────────────────────────────────────────

    def to_dict(self) -> Dict[str, Any]:
        return {
            "enabled": self.is_enabled,
            "blocked": self._blocked,
            "capabilities": {k: v.to_dict() for k, v in self._capabilities.items()},
            "pending_approvals": self.get_pending_approvals(),
        }


# ── Singleton ────────────────────────────────────────────────────────────────

_instance: Optional[CapabilityRegistry] = None


def get_capability_registry() -> CapabilityRegistry:
    global _instance
    if _instance is None:
        _instance = CapabilityRegistry()
    return _instance


def reset_capability_registry() -> None:
    """Reset singleton (for testing)."""
    global _instance
    _instance = None
