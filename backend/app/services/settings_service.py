"""Settings service – reads/writes backend/data/settings.json."""
import json
import logging
from pathlib import Path
from typing import Any, Dict

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent.parent / "data"
SETTINGS_FILE = DATA_DIR / "settings.json"

DEFAULT_SETTINGS: Dict[str, Any] = {
    "llm": {
        "provider": "ollama",
        "model": "llama3.2",
        "temperature": 0.7,
        "ollama_url": "http://localhost:11434",
    },
    "integrations": {
        "claude_mcp": {
            "enabled": False,
            "connection_type": "stdio",
            "stdio_path": "/Applications/Claude.app/Contents/Resources/mcp-server",
            "available_tools": ["github", "filesystem", "brave-search", "puppeteer"],
        },
        "vscode": {
            "enabled": True,
            "binary_path": "/usr/local/bin/code",
            "projects": {},
        },
        "antigravity": {
            "enabled": False,
            "api_endpoint": "http://localhost:8080",
            "api_key": "",
            "workspace_root": "",
            "auto_sync_artifacts": True,
        },
        "openclaw": {
            "enabled": True,
            "binary_path": "/usr/local/bin/openclaw",
        },
        "macos": {
            "enabled": True,
        },
    },
    "filesystem": {
        "allowed_directories": [],
        "require_confirmation": ["delete"],
        "blacklist_patterns": ["*.env", "*.key", "**/node_modules", "**/.git"],
    },
    "notifications": {
        "enabled": False,
        "ntfy_url": "https://ntfy.sh",
        "topic": "ai-home-hub",
    },
    "agents": {
        "max_concurrent": 5,
        "timeout_minutes": 30,
    },
    "system_prompts": {
        "general": (
            "Jsi můj osobní Mac Control Center AI asistent. "
            "Ovládáš VS Code, Claude MCP, filesystem, git, Mac aplikace. "
            "Odpovídáš česky, stručně. Preferuješ akce před vysvětlením."
        ),
        "powerbi": (
            "Jsi Power BI a DAX expert s přístupem k filesystemu. "
            "Čteš .pbix metadata, analyzuješ DAX measures, navrhuješ optimalizace. "
            "Ovládáš VS Code pro editaci Power Query M skriptů."
        ),
        "lean": (
            "Jsi Lean/CI specialista s přístupem k projektům a dokumentaci. "
            "Analyzuješ procesy, navrhuješ Kaizen akce, generuješ VSM diagramy. "
            "Ovládáš git pro verzování process dokumentace."
        ),
    },
    "quick_actions": [],
}


class SettingsService:
    def __init__(self) -> None:
        DATA_DIR.mkdir(parents=True, exist_ok=True)

    def load(self) -> Dict[str, Any]:
        """Load settings, returning defaults merged with stored values."""
        if not SETTINGS_FILE.exists():
            self.save(DEFAULT_SETTINGS)
            return _deep_copy(DEFAULT_SETTINGS)

        with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
            stored = json.load(f)

        return _deep_merge(DEFAULT_SETTINGS, stored)

    def save(self, settings: Dict[str, Any]) -> None:
        """Persist settings to disk."""
        with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
            json.dump(settings, f, indent=2, ensure_ascii=False)

    def update(self, partial: Dict[str, Any]) -> Dict[str, Any]:
        """Deep-merge partial settings into current, persist, and return result."""
        current = self.load()
        updated = _deep_merge(current, partial)
        self.save(updated)
        return updated

    def get_system_prompt(self, mode: str) -> str:
        settings = self.load()
        prompts = settings.get("system_prompts", {})
        return prompts.get(mode, prompts.get("general", "You are a helpful assistant."))

    def get_llm_config(self) -> Dict[str, Any]:
        return self.load().get("llm", DEFAULT_SETTINGS["llm"])

    def get_integration_config(self, name: str) -> Dict[str, Any]:
        integrations = self.load().get("integrations", {})
        return integrations.get(name, {})

    def get_filesystem_config(self) -> Dict[str, Any]:
        return self.load().get("filesystem", DEFAULT_SETTINGS["filesystem"])

    def get_notification_config(self) -> Dict[str, Any]:
        return self.load().get("notifications", DEFAULT_SETTINGS["notifications"])

    def get_quick_actions(self) -> list:
        return self.load().get("quick_actions", [])

    def warn_if_unconfigured(self) -> None:
        """Log actionable warnings for settings that need first-time configuration."""
        s = self.load()

        allowed = s.get("filesystem", {}).get("allowed_directories", [])
        if not allowed:
            logger.warning(
                "⚠️  Filesystem: allowed_directories is empty – all /api/filesystem/* calls "
                "will be blocked. Add directories in Settings → Filesystem Security or set "
                "'filesystem.allowed_directories' in data/settings.json."
            )

        projects = s.get("integrations", {}).get("vscode", {}).get("projects", {})
        if not projects:
            logger.info(
                "ℹ️  VS Code: no projects configured. Add them in Settings → VS Code Projects "
                "to use 'open_project' actions."
            )

        ollama_url = s.get("llm", {}).get("ollama_url", "http://localhost:11434")
        provider = s.get("llm", {}).get("provider", "ollama")
        if provider == "ollama":
            logger.info("ℹ️  LLM: using Ollama at %s (model: %s). Run 'ollama serve' if not started.",
                        ollama_url, s.get("llm", {}).get("model", "llama3.2"))


def _deep_copy(obj: Any) -> Any:
    return json.loads(json.dumps(obj))


def _deep_merge(base: Dict, override: Dict) -> Dict:
    result = _deep_copy(base)
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = _deep_merge(result[key], value)
        else:
            result[key] = value
    return result


# Shared singleton
_settings_service = SettingsService()


def get_settings_service() -> SettingsService:
    return _settings_service
