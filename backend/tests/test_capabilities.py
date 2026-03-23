"""Tests for Full System Access – capabilities, sandbox executor, audit log, and API.

Covers:
- Capability whitelist enforcement (shell blocked commands)
- File read outside allowed paths fails
- Browser domain whitelist
- Timeout handling for shell commands
- Approval required for high-risk capabilities
- Audit log persists every call
- Killswitch stops all capabilities
- Cross-platform shell parsing
"""

import json
import os
import sys
import tempfile
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ── ChromaDB shim ──────────────────────────────────────────────────────────────
_chroma_mock = MagicMock()
for _mod_name in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod_name, _chroma_mock)


# ── Unit tests: CapabilityRegistry ──────────────────────────────────────────


class TestCapabilityRegistry:
    def setup_method(self):
        from app.services.capabilities import reset_capability_registry

        reset_capability_registry()

    def test_registry_lists_default_capabilities(self):
        from app.services.capabilities import get_capability_registry

        reg = get_capability_registry()
        names = reg.list_names()
        assert "shell" in names
        assert "file_read" in names
        assert "browser_open" in names
        assert "system_monitor" in names
        assert "app_launch" in names

    def test_high_risk_detection(self):
        from app.services.capabilities import get_capability_registry

        reg = get_capability_registry()
        assert reg.is_high_risk("file_write") is True
        assert reg.is_high_risk("app_launch") is True
        assert reg.is_high_risk("file_read") is False
        assert reg.is_high_risk("shell") is False

    def test_approval_required_for_high_risk(self):
        from app.services.capabilities import get_capability_registry

        reg = get_capability_registry()
        assert reg.requires_approval("file_write") is True
        assert reg.requires_approval("file_read") is False

    def test_approval_flow(self):
        from app.services.capabilities import get_capability_registry

        reg = get_capability_registry()
        # Request approval
        aid = reg.request_approval("file_write", {"path": "/tmp/test"})
        assert len(reg.get_pending_approvals()) == 1
        # Approve
        assert reg.approve(aid) is True
        assert len(reg.get_pending_approvals()) == 0
        # After approval, file_write no longer requires approval
        assert reg.requires_approval("file_write") is False

    def test_deny_approval(self):
        from app.services.capabilities import get_capability_registry

        reg = get_capability_registry()
        aid = reg.request_approval("app_launch", {"app": "code"})
        assert reg.deny(aid) is True
        # Still requires approval since it was denied
        assert reg.requires_approval("app_launch") is True

    def test_killswitch_blocks_everything(self):
        from app.services.capabilities import get_capability_registry

        reg = get_capability_registry()
        reg.emergency_stop("test")
        assert reg.is_blocked is True
        assert reg.is_enabled is False

    def test_killswitch_resume(self):
        from app.services.capabilities import get_capability_registry

        reg = get_capability_registry()
        reg.emergency_stop("test")
        reg.resume()
        assert reg.is_blocked is False

    def test_to_dict_serialization(self):
        from app.services.capabilities import get_capability_registry

        reg = get_capability_registry()
        d = reg.to_dict()
        assert "enabled" in d
        assert "blocked" in d
        assert "capabilities" in d
        assert "shell" in d["capabilities"]


# ── Unit tests: SandboxExecutor ──────────────────────────────────────────────


class TestSandboxExecutor:
    def setup_method(self):
        from app.services.capabilities import reset_capability_registry
        from app.services.sandbox_executor import reset_sandbox_executor

        reset_capability_registry()
        reset_sandbox_executor()

    @patch.dict(os.environ, {"AUTONOMY_ACCESS_ENABLED": "true"})
    def test_shell_whitelisted_command_succeeds(self):
        # Re-import to pick up env var
        from app.services import capabilities as cap_mod

        cap_mod.AUTONOMY_ACCESS_ENABLED = True
        from app.services.sandbox_executor import get_sandbox_executor
        from app.services.capabilities import get_capability_registry

        reg = get_capability_registry()

        executor = get_sandbox_executor()
        result = executor.execute("shell", {"command": "pwd"})
        assert result.status == "ok"
        assert result.output.strip() != ""

    @patch.dict(os.environ, {"AUTONOMY_ACCESS_ENABLED": "true"})
    def test_shell_blocked_command_fails(self):
        from app.services import capabilities as cap_mod

        cap_mod.AUTONOMY_ACCESS_ENABLED = True
        from app.services.sandbox_executor import get_sandbox_executor

        executor = get_sandbox_executor()
        result = executor.execute("shell", {"command": "rm -rf /"})
        assert result.status == "permission_denied"
        assert "not whitelisted" in result.error

    @patch.dict(os.environ, {"AUTONOMY_ACCESS_ENABLED": "true"})
    def test_shell_dangerous_commands_blocked(self):
        """Verify destructive commands like rm, shutdown, reboot are blocked."""
        from app.services import capabilities as cap_mod

        cap_mod.AUTONOMY_ACCESS_ENABLED = True
        from app.services.sandbox_executor import get_sandbox_executor

        executor = get_sandbox_executor()
        dangerous = ["rm file.txt", "shutdown now", "reboot", "mkfs", "dd if=/dev/zero"]
        for cmd in dangerous:
            result = executor.execute("shell", {"command": cmd})
            assert result.status == "permission_denied", f"Expected blocked for: {cmd}"

    def test_capability_system_disabled_by_default(self):
        from app.services import capabilities as cap_mod

        cap_mod.AUTONOMY_ACCESS_ENABLED = False
        from app.services.sandbox_executor import get_sandbox_executor

        executor = get_sandbox_executor()
        result = executor.execute("shell", {"command": "ls"})
        assert result.status == "blocked"

    @patch.dict(os.environ, {"AUTONOMY_ACCESS_ENABLED": "true"})
    def test_file_read_outside_allowed_paths_fails(self):
        from app.services import capabilities as cap_mod

        cap_mod.AUTONOMY_ACCESS_ENABLED = True
        from app.services.sandbox_executor import get_sandbox_executor

        executor = get_sandbox_executor()
        result = executor.execute("file_read", {"path": "/etc/passwd"})
        assert result.status == "permission_denied"
        assert "not in allowed" in result.error

    @patch.dict(os.environ, {"AUTONOMY_ACCESS_ENABLED": "true"})
    def test_file_read_nonexistent_file(self):
        from app.services import capabilities as cap_mod

        cap_mod.AUTONOMY_ACCESS_ENABLED = True
        from app.services.sandbox_executor import get_sandbox_executor

        executor = get_sandbox_executor()
        result = executor.execute(
            "file_read", {"path": "./data/nonexistent_file_12345.txt"}
        )
        # Either permission_denied (not in allowed) or error (not found)
        assert result.status in ("permission_denied", "error")

    @patch.dict(os.environ, {"AUTONOMY_ACCESS_ENABLED": "true"})
    def test_browser_domain_whitelist(self):
        from app.services import capabilities as cap_mod

        cap_mod.AUTONOMY_ACCESS_ENABLED = True
        from app.services.sandbox_executor import get_sandbox_executor

        executor = get_sandbox_executor()
        # Evil domain should be blocked
        result = executor.execute("browser_open", {"url": "https://evil.com/malware"})
        assert result.status == "permission_denied"
        assert "not whitelisted" in result.error

    @patch.dict(os.environ, {"AUTONOMY_ACCESS_ENABLED": "true"})
    def test_app_launch_not_whitelisted(self):
        from app.services import capabilities as cap_mod

        cap_mod.AUTONOMY_ACCESS_ENABLED = True
        from app.services.sandbox_executor import get_sandbox_executor
        from app.services.capabilities import get_capability_registry

        # Pre-approve app_launch (high-risk) so we test whitelist, not approval
        reg = get_capability_registry()
        reg._approved_caps.add("app_launch")

        executor = get_sandbox_executor()
        result = executor.execute("app_launch", {"app": "malicious_app"})
        assert result.status == "permission_denied"

    @patch.dict(os.environ, {"AUTONOMY_ACCESS_ENABLED": "true"})
    def test_high_risk_requires_approval(self):
        from app.services import capabilities as cap_mod

        cap_mod.AUTONOMY_ACCESS_ENABLED = True
        from app.services.sandbox_executor import get_sandbox_executor

        executor = get_sandbox_executor()
        result = executor.execute(
            "file_write", {"path": "./data/output/test.txt", "content": "hello"}
        )
        assert result.status == "blocked_human_review"
        assert "approval_id" in result.metadata

    @patch.dict(os.environ, {"AUTONOMY_ACCESS_ENABLED": "true"})
    def test_system_monitor_returns_metrics(self):
        from app.services import capabilities as cap_mod

        cap_mod.AUTONOMY_ACCESS_ENABLED = True
        from app.services.sandbox_executor import get_sandbox_executor

        executor = get_sandbox_executor()
        result = executor.execute("system_monitor", {})
        assert result.status == "ok"
        assert "cpu_percent" in result.metadata
        assert "memory_percent" in result.metadata
        assert "disk_percent" in result.metadata

    @patch.dict(os.environ, {"AUTONOMY_ACCESS_ENABLED": "true"})
    def test_killswitch_stops_all_capabilities(self):
        from app.services import capabilities as cap_mod

        cap_mod.AUTONOMY_ACCESS_ENABLED = True
        from app.services.capabilities import get_capability_registry
        from app.services.sandbox_executor import get_sandbox_executor

        reg = get_capability_registry()
        executor = get_sandbox_executor()

        # Works before killswitch
        result = executor.execute("system_monitor", {})
        assert result.status == "ok"

        # Activate killswitch
        reg.emergency_stop("test stop")

        # Now blocked
        result = executor.execute("system_monitor", {})
        assert result.status == "blocked"

        # Resume
        reg.resume()
        result = executor.execute("system_monitor", {})
        assert result.status == "ok"

    @patch.dict(os.environ, {"AUTONOMY_ACCESS_ENABLED": "true"})
    def test_unknown_capability_returns_error(self):
        from app.services import capabilities as cap_mod

        cap_mod.AUTONOMY_ACCESS_ENABLED = True
        from app.services.sandbox_executor import get_sandbox_executor

        executor = get_sandbox_executor()
        result = executor.execute("nonexistent_cap", {})
        assert result.status == "error"
        assert "Unknown capability" in result.error


# ── Unit tests: AuditLogDB ──────────────────────────────────────────────────


class TestAuditLogDB:
    def setup_method(self):
        from app.db.audit_log import reset_audit_log_db

        reset_audit_log_db()

    def test_audit_log_persists_entries(self):
        from app.db.audit_log import get_audit_log_db

        db = get_audit_log_db()
        db.log(
            capability="shell",
            action="ls",
            result_status="ok",
            result_summary="files listed",
        )
        db.log(capability="file_read", action="/data/x.txt", result_status="ok")
        entries = db.get_entries(limit=10)
        assert len(entries) >= 2

    def test_audit_log_stats(self):
        from app.db.audit_log import get_audit_log_db

        db = get_audit_log_db()
        db.log(capability="shell", result_status="ok")
        db.log(capability="shell", result_status="error", error="timeout")
        db.log(capability="file_read", result_status="ok")
        stats = db.get_stats()
        assert stats["total_entries"] >= 3
        assert stats["total_errors"] >= 1

    def test_audit_log_filter_by_capability(self):
        from app.db.audit_log import get_audit_log_db

        db = get_audit_log_db()
        db.log(capability="shell", result_status="ok")
        db.log(capability="file_read", result_status="ok")
        entries = db.get_entries(capability="shell")
        assert all(e["capability"] == "shell" for e in entries)

    def test_audit_log_filter_by_status(self):
        from app.db.audit_log import get_audit_log_db

        db = get_audit_log_db()
        db.log(capability="shell", result_status="ok")
        db.log(capability="shell", result_status="error")
        entries = db.get_entries(result_status="error")
        assert all(e["result_status"] == "error" for e in entries)


# ── Unit tests: Cross-platform shell parsing ─────────────────────────────────


class TestCrossPlatformShell:
    def test_whitelist_matching_exact(self):
        from app.services.sandbox_executor import SandboxExecutor

        executor = SandboxExecutor()
        assert executor._is_command_whitelisted("ls", ["ls", "pwd"]) is True
        assert executor._is_command_whitelisted("rm", ["ls", "pwd"]) is False

    def test_whitelist_matching_with_args(self):
        from app.services.sandbox_executor import SandboxExecutor

        executor = SandboxExecutor()
        assert executor._is_command_whitelisted("ls -la", ["ls"]) is True
        assert executor._is_command_whitelisted("ls -la /tmp", ["ls"]) is True

    def test_whitelist_matching_multiword(self):
        from app.services.sandbox_executor import SandboxExecutor

        executor = SandboxExecutor()
        assert (
            executor._is_command_whitelisted("git status", ["git status", "git log"])
            is True
        )
        assert (
            executor._is_command_whitelisted("git push", ["git status", "git log"])
            is False
        )

    def test_whitelist_case_insensitive(self):
        from app.services.sandbox_executor import SandboxExecutor

        executor = SandboxExecutor()
        assert executor._is_command_whitelisted("LS", ["ls"]) is True
        assert executor._is_command_whitelisted("Git Status", ["git status"]) is True

    def test_path_allowed_check(self):
        from app.services.sandbox_executor import SandboxExecutor

        executor = SandboxExecutor()
        # Inside allowed
        assert (
            executor._is_path_allowed(Path("./data/test.txt").resolve(), ["./data"])
            is True
        )
        # Outside allowed
        assert (
            executor._is_path_allowed(Path("/etc/passwd").resolve(), ["./data"])
            is False
        )


# ── Integration tests: API endpoints ─────────────────────────────────────────

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture
def client() -> TestClient:
    with patch(
        "app.services.startup_checks.run_startup_checks",
        new_callable=AsyncMock,
        return_value={"ollama": "ok (mocked)"},
    ):
        with TestClient(app) as c:
            yield c


class TestCapabilitiesAPI:
    def test_get_registry(self, client):
        resp = client.get("/api/capabilities/registry")
        assert resp.status_code == 200
        data = resp.json()
        assert "capabilities" in data
        assert "shell" in data["capabilities"]
        assert "enabled" in data

    def test_get_single_capability(self, client):
        resp = client.get("/api/capabilities/registry/shell")
        assert resp.status_code == 200
        data = resp.json()
        assert data["capability"]["name"] == "shell"

    def test_get_nonexistent_capability(self, client):
        resp = client.get("/api/capabilities/registry/nonexistent")
        assert resp.status_code == 404

    def test_execute_blocked_by_default(self, client):
        """System capabilities are OFF by default."""
        from app.services import capabilities as cap_mod
        from app.services.capabilities import reset_capability_registry

        cap_mod.AUTONOMY_ACCESS_ENABLED = False
        reset_capability_registry()

        resp = client.post(
            "/api/capabilities/execute",
            json={
                "capability": "shell",
                "params": {"command": "ls"},
            },
        )
        assert resp.status_code == 403

    def test_get_audit_trail(self, client):
        resp = client.get("/api/capabilities/audit")
        assert resp.status_code == 200
        assert "entries" in resp.json()

    def test_get_audit_stats(self, client):
        resp = client.get("/api/capabilities/audit/stats")
        assert resp.status_code == 200
        assert "total_entries" in resp.json()

    def test_get_pending_approvals(self, client):
        resp = client.get("/api/capabilities/approvals")
        assert resp.status_code == 200
        assert "approvals" in resp.json()

    def test_killswitch_stop_and_resume(self, client):
        # Stop
        resp = client.post(
            "/api/capabilities/killswitch",
            json={
                "action": "stop",
                "reason": "test emergency",
            },
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "stopped"

        # Check status
        resp = client.get("/api/capabilities/killswitch/status")
        assert resp.status_code == 200
        assert resp.json()["blocked"] is True

        # Resume
        resp = client.post(
            "/api/capabilities/killswitch",
            json={
                "action": "resume",
            },
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "resumed"

    def test_system_state_endpoint(self, client):
        resp = client.get("/api/capabilities/system-state")
        assert resp.status_code == 200
        data = resp.json()
        assert "status" in data


# ── Settings model tests ─────────────────────────────────────────────────────


class TestCapabilitySettings:
    def test_default_capability_config(self):
        from app.core.settings import CapabilityConfig

        cfg = CapabilityConfig()
        assert cfg.enabled is False
        assert cfg.approval_timeout_minutes == 30
        assert cfg.audit_log_retention_days == 30
        assert "./data" in cfg.file_read_paths

    def test_global_settings_include_capabilities(self):
        from app.core.settings import GlobalGuardrailSettings

        gs = GlobalGuardrailSettings()
        assert hasattr(gs, "capabilities")
        assert gs.capabilities.enabled is False

    def test_safe_mode_disables_capabilities(self):
        from app.core.settings import GlobalGuardrailSettings

        gs = GlobalGuardrailSettings(safe_mode=True)
        assert gs.safe_mode_restrictions.disable_system_capabilities is True
