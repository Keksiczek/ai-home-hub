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
        "default_model": "llama3.2",
        "temperature": 0.3,
        "timeout_seconds": 180,
        "ollama_url": "http://localhost:11434",
        "base_url": "http://localhost:11434",
        "embeddings_model": "nomic-embed-text",
        "default_params": {
            "temperature": 0.3,
            "top_p": 0.9,
            "top_k": 40,
            "max_tokens": 2048,
        },
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
            "experimental": True,
            "api_endpoint": "http://localhost:8080",
            "api_key": "",
            "workspace_root": "",
            "auto_sync_artifacts": True,
        },
        "openclaw": {
            "enabled": False,
            "experimental": True,
            "binary_path": "/usr/local/bin/openclaw",
        },
        "macos": {
            "enabled": True,
        },
        "experimental_features": {
            "openclaw": {"enabled": False, "experimental": True, "reason": "cliclick mouse simulation – fragile, breaks on UI changes"},
            "antigravity": {"enabled": False, "experimental": True, "reason": "external unstable IDE integration"},
            "devops_agent": {"enabled": False, "experimental": True, "reason": "high-risk OS ops, not production-ready"},
            "testing_agent": {"enabled": False, "experimental": True, "reason": "limited value without real test runner integration"},
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
        "max_concurrent": 3,
        "timeout_minutes": 15,
        "configs": {
            "general":  {"max_steps": 8,  "step_timeout_s": 30, "max_total_tokens": 8000},
            "code":     {"max_steps": 8,  "step_timeout_s": 45, "max_total_tokens": 10000},
            "research": {"max_steps": 12, "step_timeout_s": 30, "max_total_tokens": 12000},
            "testing":  {"max_steps": 6,  "step_timeout_s": 30, "max_total_tokens": 6000},
            "devops":   {"max_steps": 6,  "step_timeout_s": 30, "max_total_tokens": 6000},
        },
    },
    "system_prompts": {
        "general": (
            "Jsi AI Home Hub – osobní AI asistent pro macOS. Vždy odpovídáš česky, stručně a konkrétně.\n\n"
            "Pravidla:\n"
            "1. VŽDY odpovídej česky, i když se uživatel ptá anglicky (pokud výslovně nepožádá o angličtinu).\n"
            "2. Nikdy neodmítej odpovědět frázemi jako \"jako AI nemohu\", \"to přesahuje mé schopnosti\" "
            "nebo \"doporučuji konzultovat odborníka\". Místo toho vždy poskytni nejlepší dostupnou odpověď.\n"
            "3. Buď konkrétní a akční. Místo \"to záleží na situaci\" řekni co záleží a dej konkrétní doporučení.\n"
            "4. Pokud máš kontext z Knowledge Base nebo Shared Memory (označený tagy <kb_context> nebo "
            "<user_memory>), VŽDY ho aktivně použij v odpovědi.\n"
            "5. Odpovídej ve stylu zkušeného kolegy, ne formálního asistenta. Žádné úvodní fráze jako "
            "\"Samozřejmě!\", \"Skvělá otázka!\" nebo \"Rád vám pomohu!\".\n"
            "6. Pokud nevíš odpověď, přiznej to jednou větou a nabídni alternativu.\n"
            "7. Strukturuj odpovědi: krátká přímá odpověď → detaily → konkrétní kroky (pokud relevantní)."
        ),
        "powerbi": (
            "Jsi AI Home Hub – expert na Power BI, DAX a Power Platform. Vždy odpovídáš česky.\n\n"
            "Pravidla:\n"
            "1. VŽDY odpovídej česky.\n"
            "2. Při DAX dotazech vždy ukaž kompletní kód s komentáři.\n"
            "3. Pokud je více přístupů (DAX vs M, calculated column vs measure), vždy vysvětli kdy použít který.\n"
            "4. Ukazuj konkrétní příklady, ne abstraktní popisy.\n"
            "5. Nikdy neodmítej odpovědět – Power BI má specifické chování, vždy popsat co víš "
            "a co je nejpravděpodobnější řešení.\n"
            "6. Pokud máš kontext z Knowledge Base (DAX dokumentace, firemní datový model), aktivně ho použij.\n"
            "7. Formátuj DAX kód vždy do code blocků."
        ),
        "lean": (
            "Jsi AI Home Hub – expert na Lean, Continuous Improvement a výrobní procesy. Vždy odpovídáš česky.\n\n"
            "Pravidla:\n"
            "1. VŽDY odpovídej česky.\n"
            "2. U Lean/CI problémů vždy navrhni konkrétní nástroj (VSM, 5S, Kaizen, SMED, OEE...) "
            "a kdy ho použít.\n"
            "3. Dávej SOP-style odpovědi: co udělat, v jakém pořadí, na co si dát pozor.\n"
            "4. Vždy zmíň typické failure módy a jak se jim vyhnout.\n"
            "5. Pokud máš kontext z Knowledge Base (interní dokumentace, SOP, výsledky auditů), "
            "aktivně ho použij.\n"
            "6. Buď přímý a praktický – odpovídáš zkušenému CI specialistovi, ne začátečníkovi."
        ),
        "resident": (
            "Jsi rezidentní agent běžící na macOS v AI Home Hub. "
            "Tvůj úkol je analyzovat situaci a navrhnout JEDNU konkrétní akci.\n\n"
            "PRAVIDLA:\n"
            "1. Vždy odpovídej POUZE validním JSON objektem, žádný jiný text.\n"
            "2. JSON musí mít klíče: reasoning_summary, action, params, priority, risk_level.\n"
            "3. reasoning_summary: max 2 věty, česky, proč tuto akci.\n"
            "4. action: musí být přesně jeden z allowed_actions.\n"
            "5. Pokud si nejsi jistý nebo nemáš dost informací → použij action: 'no_op'.\n"
            "6. Nikdy nevymýšlej parametry které nemáš – raději no_op.\n"
            "7. risk_level: 'safe' pro čtení, 'medium' pro zápis, 'high' pro destruktivní operace.\n"
            "8. Nikdy nenavrhuj high risk akce – budou automaticky blokovány."
        ),
    },
    "custom_system_prompt_append": "",
    "knowledge_base": {
        "external_paths": [],
        "watch_for_changes": False,
        "allowed_extensions": [
            ".pdf", ".docx", ".xlsx", ".txt", ".md",
            ".jpg", ".png", ".mp4", ".mov",
        ],
        "enabled": True,
    },
    "profiles": {
        "chat": {
            "model": "llama3.2",
            "params": {"temperature": 0.3, "top_p": 0.9, "top_k": 40, "max_tokens": 2048},
        },
        "powerbi": {
            "model": "qwen2.5-coder:3b",
            "params": {"temperature": 0.1, "top_p": 0.95, "top_k": 20, "max_tokens": 4096},
        },
        "lean": {
            "model": "llama3.2",
            "params": {"temperature": 0.3, "top_p": 0.9, "top_k": 40, "max_tokens": 2048},
        },
        "vision": {
            "model": "llava:7b",
            "params": {"temperature": 0.5, "top_p": 0.9, "top_k": 40, "max_tokens": 2048},
        },
        # Legacy profiles kept for backward compatibility
        "tech": {"model": "qwen2.5-coder:3b", "params": {"temperature": 0.3}},
        "dolphin": {"model": "dolphin-llama3:8b", "params": {"temperature": 0.8}},
    },
    "agent_skills": {
        "skills_directories": [],
        "use_default_skill_paths": True,
    },
    "quick_actions": [],
    "job_settings": {
        "max_concurrent_jobs": 1,
        "night_batch_enabled": True,
        "night_batch_window": {
            "start": "22:00",
            "end": "06:00",
        },
        "night_jobs": {
            "kb_reindex": {"enabled": True},
            "git_sweep": {"enabled": True},
            "nightly_summary": {"enabled": True},
        },
        "day_allowed_job_types": ["long_llm_task", "report_generation", "resident_task"],
        "night_only_job_types": ["kb_reindex", "git_sweep", "nightly_summary", "media_ingest"],
    },
    "whisper_settings": {
        "model": "base",
        "device": "cpu",
        "compute_type": "int8",
    },
    "media_settings": {
        "max_upload_mb": 500,
    },
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
        """Return the system prompt for the given mode, with optional custom append."""
        settings = self.load()
        prompts = settings.get("system_prompts", {})
        prompt = prompts.get(mode, prompts.get("general", "You are a helpful assistant."))

        # Append user's custom instructions if configured
        custom_append = settings.get("custom_system_prompt_append", "")
        if custom_append and custom_append.strip():
            prompt = f"{prompt}\n\n{custom_append.strip()}"

        return prompt

    def get_llm_config(self, profile: str = None) -> Dict[str, Any]:
        """Return LLM config, optionally merged with per-profile overrides.

        If *profile* is given, the profile's model and params are merged on top
        of llm.default_params so that only the keys the profile specifies are
        overridden.
        """
        settings = self.load()
        llm_cfg = settings.get("llm", DEFAULT_SETTINGS["llm"])

        # Resolve ollama URL (support both field names)
        ollama_url = llm_cfg.get("ollama_url") or llm_cfg.get(
            "base_url", "http://localhost:11434"
        )

        # Build base sampling params – prefer explicit default_params block, else
        # fall back to flat fields for backward compatibility with old settings.json
        default_params_block = llm_cfg.get("default_params", {})
        base_params = {
            "temperature": default_params_block.get(
                "temperature", llm_cfg.get("temperature", 0.3)
            ),
            "top_p": default_params_block.get("top_p", 0.9),
            "top_k": default_params_block.get("top_k", 40),
            "max_tokens": default_params_block.get("max_tokens", 2048),
        }

        result: Dict[str, Any] = {
            "provider": llm_cfg.get("provider", "ollama"),
            "ollama_url": ollama_url,
            "model": llm_cfg.get("default_model") or llm_cfg.get("model", "llama3.2"),
            "timeout_seconds": llm_cfg.get("timeout_seconds", 180),
            "embeddings_model": llm_cfg.get("embeddings_model", "nomic-embed-text"),
            **base_params,
        }

        if profile:
            profiles = settings.get("profiles", {})
            profile_cfg = profiles.get(profile, {})

            if "model" in profile_cfg:
                result["model"] = profile_cfg["model"]

            # Merge profile-level params over base params
            profile_params = profile_cfg.get("params", {})
            result.update(profile_params)

            # Legacy: temperature stored directly on profile (no nested params)
            if "temperature" in profile_cfg and not profile_params:
                result["temperature"] = profile_cfg["temperature"]

            logger.debug(
                "LLM config for profile '%s': model=%s temperature=%.2f",
                profile, result["model"], result.get("temperature", 0.0),
            )

        return result

    def is_feature_enabled(self, feature_name: str) -> bool:
        """Check if a feature/integration is enabled. Experimental features default to False."""
        s = self.load()
        # Check experimental_features first
        exp = s.get("integrations", {}).get("experimental_features", {})
        if feature_name in exp:
            return exp[feature_name].get("enabled", False)
        # Fall back to integrations
        integrations = s.get("integrations", {})
        if feature_name in integrations:
            return integrations[feature_name].get("enabled", False)
        return False

    def get_agent_config(self, agent_type: str) -> dict:
        """Return guardrail config for a given agent type."""
        agents_cfg = self.load().get("agents", {})
        configs = agents_cfg.get("configs", {})
        default = {"max_steps": 8, "step_timeout_s": 30, "max_total_tokens": 8000}
        return configs.get(agent_type, default)

    def get_integration_config(self, name: str) -> Dict[str, Any]:
        integrations = self.load().get("integrations", {})
        return integrations.get(name, {})

    def get_filesystem_config(self) -> Dict[str, Any]:
        return self.load().get("filesystem", DEFAULT_SETTINGS["filesystem"])

    def get_notification_config(self) -> Dict[str, Any]:
        return self.load().get("notifications", DEFAULT_SETTINGS["notifications"])

    def get_quick_actions(self) -> list:
        return self.load().get("quick_actions", [])

    def get_job_settings(self) -> Dict[str, Any]:
        return self.load().get("job_settings", DEFAULT_SETTINGS["job_settings"])

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

        llm_s = s.get("llm", {})
        ollama_url = llm_s.get("ollama_url") or llm_s.get("base_url", "http://localhost:11434")
        provider = llm_s.get("provider", "ollama")
        if provider == "ollama":
            model = llm_s.get("default_model") or llm_s.get("model", "llama3.2")
            logger.info(
                "ℹ️  LLM: using Ollama at %s (model: %s). Run 'ollama serve' if not started.",
                ollama_url, model,
            )


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
