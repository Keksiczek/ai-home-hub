"""Tests for sandbox executor – safe_exec security hardening."""

import pytest

from app.services.sandbox_executor import safe_exec, SAFE_MODULES, BLOCKED_MODULES


class TestSafeExecAllowed:
    """Verify allowed code executes correctly."""

    def test_simple_math(self):
        result = safe_exec("result = 2 + 3")
        assert result["status"] == "ok"
        assert result["result"] == 5

    def test_allowed_import_math(self):
        result = safe_exec("import math\nresult = math.sqrt(16)")
        assert result["status"] == "ok"
        assert result["result"] == 4.0

    def test_allowed_import_json(self):
        result = safe_exec('import json\nresult = json.dumps({"a": 1})')
        assert result["status"] == "ok"
        assert result["result"] == '{"a": 1}'

    def test_allowed_import_datetime(self):
        result = safe_exec(
            "from datetime import datetime\nresult = type(datetime.now()).__name__"
        )
        assert result["status"] == "ok"
        assert result["result"] == "datetime"

    def test_allowed_import_re(self):
        result = safe_exec('import re\nresult = bool(re.match(r"\\d+", "123"))')
        assert result["status"] == "ok"
        assert result["result"] is True

    def test_allowed_import_collections(self):
        result = safe_exec(
            "from collections import Counter\nresult = dict(Counter('aab'))"
        )
        assert result["status"] == "ok"
        assert result["result"] == {"a": 2, "b": 1}

    def test_stdout_captured(self):
        result = safe_exec('print("hello")')
        assert result["status"] == "ok"
        assert "hello" in result["stdout"]

    def test_no_result_var(self):
        result = safe_exec("x = 42")
        assert result["status"] == "ok"
        assert result["result"] is None


class TestSafeExecBlocked:
    """Verify blocked imports and operations are rejected."""

    def test_block_import_os(self):
        result = safe_exec("import os")
        assert result["error"] == "SecurityError"
        assert "os" in result["detail"]

    def test_block_import_subprocess(self):
        result = safe_exec("import subprocess")
        assert result["error"] == "SecurityError"
        assert "subprocess" in result["detail"]

    def test_block_import_socket(self):
        result = safe_exec("import socket")
        assert result["error"] == "SecurityError"
        assert "socket" in result["detail"]

    def test_block_import_sys(self):
        result = safe_exec("import sys")
        assert result["error"] == "SecurityError"
        assert "sys" in result["detail"]

    def test_block_from_os_import(self):
        result = safe_exec("from os import getcwd")
        assert result["error"] == "SecurityError"
        assert "os" in result["detail"]

    def test_block_from_subprocess_import(self):
        result = safe_exec("from subprocess import run")
        assert result["error"] == "SecurityError"
        assert "subprocess" in result["detail"]

    def test_block_shutil(self):
        result = safe_exec("import shutil")
        assert result["error"] == "SecurityError"

    def test_block_ctypes(self):
        result = safe_exec("import ctypes")
        assert result["error"] == "SecurityError"

    def test_block_unknown_module(self):
        result = safe_exec("import requests")
        assert result["error"] == "SecurityError"
        assert "not in the allowed whitelist" in result["detail"]

    def test_block_open_builtin(self):
        result = safe_exec('open("/etc/passwd")')
        assert result["error"] in ("SecurityError", "ExecutionError")

    def test_syntax_error(self):
        result = safe_exec("def foo(")
        assert result["error"] == "SecurityError"
        assert "SyntaxError" in result["detail"]


class TestSafeExecTimeout:
    """Verify execution timeout enforcement."""

    def test_infinite_loop_times_out(self):
        result = safe_exec("while True: pass", timeout_s=1)
        assert result["error"] == "TimeoutError"
        assert "1" in result["detail"]

    def test_short_code_within_timeout(self):
        result = safe_exec("result = sum(range(1000))", timeout_s=5)
        assert result["status"] == "ok"
        assert result["result"] == 499500


class TestModuleWhitelists:
    """Verify whitelist/blocklist consistency."""

    def test_no_overlap(self):
        overlap = SAFE_MODULES & BLOCKED_MODULES
        assert not overlap, f"Modules in both lists: {overlap}"

    def test_critical_modules_blocked(self):
        for mod in ("os", "subprocess", "socket", "sys", "shutil"):
            assert mod in BLOCKED_MODULES, f"{mod} should be blocked"

    def test_safe_modules_present(self):
        for mod in ("math", "json", "datetime", "re", "collections"):
            assert mod in SAFE_MODULES, f"{mod} should be allowed"
