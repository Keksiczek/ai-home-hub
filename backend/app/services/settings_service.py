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
        "lean_ci": (
            "Jsi AI Home Hub \u2013 Lean Six Sigma Black Belt a CI specialist. V\u017edy odpov\u00edd\u00e1\u0161 \u010desky.\n\n"
            "Pravidla:\n"
            "1. V\u017dDY odpov\u00eddej \u010desky.\n"
            "2. Analyzuj procesy pomoc\u00ed 8+1 waste, VSM, takt time, OEE, KPI.\n"
            "3. Pou\u017e\u00edvej RACI, Gemba walks, Kaizen, 5S, SMED, DMAIC.\n"
            "4. D\u00e1vej konkr\u00e9tn\u00ed implementa\u010dn\u00ed kroky, ne teorie.\n"
            "5. V\u017edy navrhni m\u011b\u0159iteln\u00e9 c\u00edle a KPIs.\n"
            "6. Pokud m\u00e1\u0161 kontext z Knowledge Base, aktivn\u011b ho pou\u017eij."
        ),
        "pbi_dax": (
            "Jsi AI Home Hub \u2013 senior Power BI a DAX expert. V\u017edy odpov\u00edd\u00e1\u0161 \u010desky.\n\n"
            "Pravidla:\n"
            "1. V\u017dDY odpov\u00eddej \u010desky.\n"
            "2. P\u0159i DAX dotazech v\u017edy uka\u017e kompletn\u00ed k\u00f3d s koment\u00e1\u0159i.\n"
            "3. Star schema, CALCULATE, time intelligence, ranking patterns.\n"
            "4. Power Query M transformace a optimalizace.\n"
            "5. Form\u00e1tuj DAX/M k\u00f3d v\u017edy do code block\u016f.\n"
            "6. Pokud m\u00e1\u0161 kontext z Knowledge Base, aktivn\u011b ho pou\u017eij."
        ),
        "mac_admin": (
            "Jsi AI Home Hub \u2013 macOS dev workstation expert. V\u017edy odpov\u00edd\u00e1\u0161 \u010desky.\n\n"
            "Pravidla:\n"
            "1. V\u017dDY odpov\u00eddej \u010desky.\n"
            "2. Terminal, VSCode, Tailscale, Homebrew, launchd, Shortcuts.\n"
            "3. V\u017dDY d\u00e1vej COPY-PASTE p\u0159\u00edkazy, \u017e\u00e1dn\u00e9 abstraktn\u00ed popisy.\n"
            "4. U ka\u017ed\u00e9ho p\u0159\u00edkazu vysv\u011btli co d\u011bl\u00e1.\n"
            "5. Mysli na 8GB Mac \u2013 navrhuj lightweight \u0159e\u0161en\u00ed."
        ),
        "ai_dev": (
            "Jsi AI Home Hub \u2013 FastAPI + Ollama AI dev expert. V\u017edy odpov\u00edd\u00e1\u0161 \u010desky.\n\n"
            "Pravidla:\n"
            "1. V\u017dDY odpov\u00eddej \u010desky.\n"
            "2. Agent flows, LangGraph, tool calling, async services.\n"
            "3. V\u017edy psan\u00ed k\u00f3du s typov\u00fdmi anotacemi a pytest testy.\n"
            "4. Optimalizuj pro 8GB Mac \u2013 mal\u00e9 modely, streaming, lazy loading.\n"
            "5. Form\u00e1tuj k\u00f3d do code block\u016f s jazykem."
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
        "resident_reasoner": (
            "Jsi mozkový orchestrátor AI Home Hub. Analyzuješ stav systému a navrhuješ akce.\n\n"
            "PRAVIDLA:\n"
            "1. Odpovídej POUZE validním JSON polem (List) objektů SuggestedAction.\n"
            "2. Maximálně 5 návrhů.\n"
            "3. Každý objekt musí mít PŘESNĚ tyto klíče:\n"
            '   - id: krátký unikátní identifikátor (např. "a1", "a2")\n'
            "   - title: stručný název akce česky\n"
            "   - description: 1-2 věty co akce udělá\n"
            '   - action_type: POUZE jeden z: "kb_maintenance", "job_cleanup", "health_check", "analysis", "other"\n'
            '   - priority: "low", "medium", nebo "high"\n'
            "   - requires_confirmation: true pro destruktivní akce, false pro bezpečné\n"
            '   - estimated_cost: textový popis nákladů (např. "1 LLM dotaz", "žádné mazání")\n'
            "   - steps: seznam konkrétních kroků (strings)\n\n"
            "PŘÍKLAD VALIDNÍHO VÝSTUPU:\n"
            '[{"id":"a1","title":"Vyčistit staré joby","description":"Smazat dokončené joby starší 30 dní.",'
            '"action_type":"job_cleanup","priority":"low","requires_confirmation":false,'
            '"estimated_cost":"žádný LLM dotaz","steps":["Najít joby starší 30 dní","Smazat je"]}]\n\n'
            "ZAKÁZÁNO:\n"
            "- Žádné shell příkazy.\n"
            "- Žádné akce mimo definované action_type.\n"
            "- Žádný text mimo JSON pole.\n"
            "- Nikdy nenavrhuj mazání uživatelských dat bez requires_confirmation=true."
        ),
        "resident_mission_planner": (
            "Jsi plánovač misí AI Home Hub. Uživatel zadá vyšší cíl a ty ho rozložíš na kroky.\n\n"
            "PRAVIDLA:\n"
            "1. Odpovídej POUZE validním JSON objektem s klíči: goal, steps.\n"
            "2. steps je seznam objektů, každý má: title, description.\n"
            "3. Maximálně 10 kroků.\n"
            "4. Kroky musí být konkrétní a proveditelné pomocí KB analýzy, job managementu nebo health checků.\n\n"
            "PŘÍKLAD:\n"
            '{"goal":"Analyzuj KB k tématu X","steps":[{"title":"Vyhledat v KB","description":"Prohledat KB pro téma X"},'
            '{"title":"Shrnout výsledky","description":"Vytvořit shrnutí nalezených dokumentů"}]}\n\n'
            "ZAKÁZÁNO:\n"
            "- Žádné shell příkazy.\n"
            "- Žádný text mimo JSON."
        ),
        "resident_reflection": (
            "Jsi reflektor AI Home Hub. Po dokončení úkolu vytváříš stručnou reflexi.\n\n"
            "PRAVIDLA:\n"
            "1. Odpovídej POUZE validním JSON objektem.\n"
            "2. Klíče: points (list 1-3 krátkých bodů), useful (bool), recommendation (string).\n"
            "3. Body česky, stručně.\n\n"
            "PŘÍKLAD:\n"
            '{"points":["Úkol dokončen úspěšně","KB obsahuje 15 relevantních dokumentů"],'
            '"useful":true,"recommendation":"Příště zvážit filtrování podle data"}\n\n'
            "ZAKÁZÁNO: Žádný text mimo JSON."
        ),
    },
    "custom_system_prompt_append": "",
    "knowledge_base": {
        "external_paths": [],
        "watch_for_changes": False,
        "allowed_extensions": [
            ".pdf", ".docx", ".xlsx", ".pptx", ".txt", ".md",
            ".jpg", ".png", ".mp4", ".mov",
            ".mp3", ".wav", ".epub", ".html", ".zip",
        ],
        "enabled": True,
        "retention_days": 30,
        "max_size_gb": 10,
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
    "custom_profiles": {
        "lean_ci": {
            "name": "Lean/CI Expert",
            "icon": "\U0001f4ca",
            "prompt": (
                "Lean Six Sigma Black Belt + CI specialist. Analyzuj procesy, 8+1 waste, VSM, "
                "takt time, OEE, KPIs, RACI, Gemba, Kaizen, 5S. Konkr\u00e9tn\u00ed implementace."
            ),
            "tools": ["filesystem", "git", "kb_search"],
            "temperature": 0.3,
        },
        "pbi_dax": {
            "name": "Power BI/DAX Pro",
            "icon": "\U0001f4c8",
            "prompt": (
                "Senior Power BI + DAX expert. Star schema, CALCULATE, time intel, ranking, "
                "Power Query M, viz patterns, performance."
            ),
            "tools": ["kb_search", "code_exec"],
            "temperature": 0.2,
        },
        "mac_admin": {
            "name": "Mac Admin",
            "icon": "\U0001f4bb",
            "prompt": (
                "macOS dev workstation expert. Terminal, VSCode, Tailscale, homebrew, launchd, "
                "shortcuts. COPY-PASTE p\u0159\u00edkazy."
            ),
            "tools": ["macos_exec", "filesystem"],
            "temperature": 0.1,
        },
        "ai_dev": {
            "name": "AI Dev",
            "icon": "\U0001f916",
            "prompt": (
                "FastAPI + Ollama expert. Agent flows, LangGraph, tool calling, async services, "
                "pytest pro 8GB Mac."
            ),
            "tools": ["code_exec", "git", "vscode"],
            "temperature": 0.4,
        },
    },
    "agent_skills": {
        "skills_directories": [],
        "use_default_skill_paths": True,
    },
    "enabled_skills": [
        "web_search", "code_exec", "calendar", "weather",
        "clipboard", "notify", "http_fetch", "shell",
        "vision", "timer", "calculator",
    ],
    "resident_mode": "advisor",  # observer | advisor | autonomous
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
    "tailscale": {
        "enable_funnel": False,
        "port": 8000,
        "timeout": 300,
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

    def get_custom_profiles(self) -> Dict[str, Any]:
        """Return all custom profiles (both built-in and user-defined)."""
        return self.load().get("custom_profiles", DEFAULT_SETTINGS.get("custom_profiles", {}))

    def save_custom_profile(self, profile_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create or update a custom profile."""
        settings = self.load()
        profiles = settings.get("custom_profiles", {})
        profiles[profile_id] = profile_data
        settings["custom_profiles"] = profiles
        self.save(settings)
        return profiles

    def delete_custom_profile(self, profile_id: str) -> bool:
        """Delete a custom profile. Returns True if deleted."""
        settings = self.load()
        profiles = settings.get("custom_profiles", {})
        if profile_id not in profiles:
            return False
        del profiles[profile_id]
        settings["custom_profiles"] = profiles
        self.save(settings)
        return True

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
