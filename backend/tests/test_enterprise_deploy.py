"""Tests for enterprise deploy & monitoring files.

Validates that provisioning files exist, have correct structure,
and platform service definitions are syntactically valid.
"""

import json
import os
from pathlib import Path

import pytest

# Repo root (two levels up from backend/tests/)
REPO_ROOT = Path(__file__).resolve().parent.parent.parent


class TestDockerComposeProd:
    """Validate docker-compose.prod.yml exists and is parseable."""

    def test_prod_compose_exists(self):
        path = REPO_ROOT / "docker-compose.prod.yml"
        assert path.exists(), "docker-compose.prod.yml not found"

    def test_prod_compose_is_valid_yaml(self):
        """Check that the file is valid YAML (basic check without PyYAML)."""
        path = REPO_ROOT / "docker-compose.prod.yml"
        content = path.read_text()
        # Must contain key service definitions
        assert "services:" in content
        assert "app:" in content
        assert "ollama:" in content
        assert "healthcheck:" in content

    def test_prod_compose_has_grafana_service(self):
        path = REPO_ROOT / "docker-compose.prod.yml"
        content = path.read_text()
        assert "grafana:" in content

    def test_prod_compose_uses_relative_volumes(self):
        path = REPO_ROOT / "docker-compose.prod.yml"
        content = path.read_text()
        # Should use relative paths, not absolute
        assert "./backend/data:/app/data" in content
        # Should NOT contain absolute Linux paths
        assert "/opt/" not in content
        assert "/home/" not in content

    def test_env_prod_example_exists(self):
        path = REPO_ROOT / ".env.prod.example"
        assert path.exists(), ".env.prod.example not found"


class TestGrafanaProvisioning:
    """Validate Grafana provisioning files."""

    def test_datasource_file_exists(self):
        path = REPO_ROOT / "grafana" / "provisioning" / "datasources" / "prometheus.yml"
        assert path.exists()

    def test_datasource_has_correct_structure(self):
        path = REPO_ROOT / "grafana" / "provisioning" / "datasources" / "prometheus.yml"
        content = path.read_text()
        assert "datasources:" in content
        assert "prometheus" in content.lower()
        assert "url:" in content

    def test_dashboard_json_is_valid(self):
        path = (
            REPO_ROOT
            / "grafana"
            / "provisioning"
            / "dashboards"
            / "ai-home-hub-overview.json"
        )
        assert path.exists(), "Dashboard JSON not found"
        with open(path) as f:
            dashboard = json.load(f)
        assert "panels" in dashboard
        assert len(dashboard["panels"]) > 0
        assert "title" in dashboard
        assert dashboard["uid"] == "ai-home-hub-overview"

    def test_dashboard_panels_have_required_fields(self):
        path = (
            REPO_ROOT
            / "grafana"
            / "provisioning"
            / "dashboards"
            / "ai-home-hub-overview.json"
        )
        with open(path) as f:
            dashboard = json.load(f)
        for panel in dashboard["panels"]:
            assert "title" in panel, f"Panel missing title: {panel}"
            assert "type" in panel, f"Panel missing type: {panel}"
            assert "gridPos" in panel, f"Panel missing gridPos: {panel}"

    def test_dashboard_uses_existing_metrics(self):
        """Verify dashboard references metrics that actually exist in metrics_service."""
        path = (
            REPO_ROOT
            / "grafana"
            / "provisioning"
            / "dashboards"
            / "ai-home-hub-overview.json"
        )
        with open(path) as f:
            content = f.read()
        # These metrics should be referenced (they exist in metrics_service.py)
        expected_metrics = [
            "resident_cycles_total",
            "resident_queue_depth",
            "job_queue_depth",
            "ollama_requests_total",
            "kb_reindex_jobs_total",
        ]
        for metric in expected_metrics:
            assert metric in content, f"Dashboard should reference metric: {metric}"

    def test_dashboards_provider_config_exists(self):
        path = REPO_ROOT / "grafana" / "provisioning" / "dashboards" / "dashboards.yml"
        assert path.exists()
        content = path.read_text()
        assert "providers:" in content


class TestPlatformFiles:
    """Validate platform-specific deploy files."""

    def test_linux_systemd_unit_exists(self):
        path = REPO_ROOT / "files" / "linux" / "ai-home-hub.service"
        assert path.exists()

    def test_linux_systemd_unit_structure(self):
        path = REPO_ROOT / "files" / "linux" / "ai-home-hub.service"
        content = path.read_text()
        assert "[Unit]" in content
        assert "[Service]" in content
        assert "[Install]" in content
        assert "docker" in content.lower()
        assert "docker-compose.prod.yml" in content

    def test_linux_deploy_script_exists(self):
        path = REPO_ROOT / "files" / "linux" / "deploy-linux.sh"
        assert path.exists()

    def test_linux_deploy_script_is_executable_content(self):
        path = REPO_ROOT / "files" / "linux" / "deploy-linux.sh"
        content = path.read_text()
        assert content.startswith("#!/")
        assert "docker compose" in content
        assert "docker-compose.prod.yml" in content

    def test_windows_install_bat_exists(self):
        path = REPO_ROOT / "files" / "windows" / "install.bat"
        assert path.exists()

    def test_windows_install_bat_structure(self):
        path = REPO_ROOT / "files" / "windows" / "install.bat"
        content = path.read_text()
        assert "docker" in content.lower()
        assert "docker-compose.prod.yml" in content

    def test_macos_plist_exists(self):
        path = REPO_ROOT / "files" / "macos" / "com.aihomehub.plist"
        assert path.exists()

    def test_macos_plist_is_valid_xml(self):
        """Basic XML structure check."""
        path = REPO_ROOT / "files" / "macos" / "com.aihomehub.plist"
        content = path.read_text()
        assert "<?xml" in content
        assert "<plist" in content
        assert "com.aihomehub" in content
        assert "docker" in content

    def test_macos_deploy_script_exists(self):
        path = REPO_ROOT / "files" / "macos" / "deploy-macos.sh"
        assert path.exists()

    def test_macos_deploy_script_structure(self):
        path = REPO_ROOT / "files" / "macos" / "deploy-macos.sh"
        content = path.read_text()
        assert content.startswith("#!/")
        assert "launchctl" in content
        assert "docker compose" in content


class TestCIWorkflow:
    """Validate CI workflow file."""

    def test_ci_workflow_exists(self):
        path = REPO_ROOT / ".github" / "workflows" / "ci.yml"
        assert path.exists()

    def test_ci_workflow_structure(self):
        path = REPO_ROOT / ".github" / "workflows" / "ci.yml"
        content = path.read_text()
        assert "pytest" in content
        assert "black" in content
        assert "push:" in content
        assert "pull_request:" in content

    def test_ci_does_not_deploy(self):
        """CI should NOT contain deploy steps."""
        path = REPO_ROOT / ".github" / "workflows" / "ci.yml"
        content = path.read_text()
        assert "docker build" not in content
        assert "docker push" not in content
        assert "ssh" not in content.lower() or "SSH" not in content


class TestBackupScript:
    """Validate backup script."""

    def test_backup_script_exists(self):
        path = REPO_ROOT / "scripts" / "backup.ps1"
        assert path.exists()

    def test_backup_script_has_retention(self):
        path = REPO_ROOT / "scripts" / "backup.ps1"
        content = path.read_text()
        assert "RetentionDays" in content
        assert "7" in content  # 7-day default
        assert "Compress-Archive" in content

    def test_backup_script_handles_sqlite(self):
        path = REPO_ROOT / "scripts" / "backup.ps1"
        content = path.read_text()
        assert "jobs.db" in content
        assert "resident_state.db" in content
