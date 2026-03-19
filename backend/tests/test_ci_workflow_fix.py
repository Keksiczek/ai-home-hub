"""Tests verifying that CI/CD workflow setup is correctly configured."""
import subprocess
import sys
from pathlib import Path

import pytest


WORKFLOW_PATH = Path(__file__).parent.parent.parent / ".github" / "workflows" / "backend-ci.yml"
REQUIREMENTS_PATH = Path(__file__).parent.parent / "requirements.txt"


def test_workflow_file_exists():
    """The CI workflow file must exist."""
    assert WORKFLOW_PATH.exists(), f"Workflow file not found: {WORKFLOW_PATH}"


def test_workflow_installs_pytest():
    """The workflow must install pytest before running tests."""
    content = WORKFLOW_PATH.read_text(encoding="utf-8")
    assert "pip install pytest" in content, "Workflow must install pytest explicitly"


def test_workflow_runs_tests_in_backend_dir():
    """The workflow 'Run tests' step must use the backend working directory."""
    content = WORKFLOW_PATH.read_text(encoding="utf-8")
    assert "working-directory: backend" in content
    assert "pytest tests/" in content


def test_workflow_has_timeout():
    """The 'Run tests' step must set a timeout to avoid hanging CI."""
    content = WORKFLOW_PATH.read_text(encoding="utf-8")
    assert "--timeout=30" in content, "pytest should have a --timeout flag"


def test_requirements_contains_prometheus_client():
    """requirements.txt must include prometheus-client so the app can export metrics."""
    content = REQUIREMENTS_PATH.read_text(encoding="utf-8")
    assert "prometheus-client" in content, "prometheus-client is missing from requirements.txt"


def test_requirements_contains_structlog():
    """requirements.txt must include structlog."""
    content = REQUIREMENTS_PATH.read_text(encoding="utf-8")
    assert "structlog" in content


def test_requirements_contains_duckduckgo_search():
    """requirements.txt must include duckduckgo-search."""
    content = REQUIREMENTS_PATH.read_text(encoding="utf-8")
    assert "duckduckgo-search" in content


def test_pytest_importable():
    """pytest must be importable in the current environment."""
    import pytest as _pytest  # noqa: F401


def test_pytest_asyncio_importable():
    """pytest-asyncio must be importable."""
    import pytest_asyncio  # noqa: F401


def test_httpx_importable():
    """httpx must be importable (used by tests that mock HTTP calls)."""
    import httpx  # noqa: F401
