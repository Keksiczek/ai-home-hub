"""Builtin skill registry – manifest definitions for all built-in runtime skills."""
from typing import Dict, List, Optional

from app.models.skill_manifest import SkillInputField, SkillManifest

BUILTIN_SKILL_MANIFESTS: Dict[str, SkillManifest] = {
    "web_search": SkillManifest(
        id="web_search",
        name="Web Search",
        description="Hledá aktuální informace, dokumentaci, ceny online",
        long_description="Prohledává web pomocí DuckDuckGo bez API klíče. Agent ji použije, když potřebuje aktuální informace, dokumentaci nebo odpovědi na faktické otázky.",
        category="web",
        icon="🌐",
        permissions=["network"],
        inputs=[],
    ),
    "code_exec": SkillManifest(
        id="code_exec",
        name="Code Execution",
        description="Spustí Python: výpočty, data analýza, pandas/matplotlib",
        long_description="Spouští Python kód v izolovaném sandboxu s omezenými moduly. Použije se pro výpočty, datovou analýzu a generování výstupů.",
        category="system",
        icon="🐍",
        permissions=["shell"],
        inputs=[],
    ),
    "calendar": SkillManifest(
        id="calendar",
        name="Calendar",
        description="Zobrazí dnešní události, přidá reminder, plánuj meeting",
        long_description="Čte události z macOS Calendar přes AppleScript. Agent ji použije pro zobrazení dnešního rozvrhu a plánování.",
        category="system",
        icon="📅",
        permissions=["filesystem"],
        inputs=[],
    ),
    "weather": SkillManifest(
        id="weather",
        name="Weather",
        description="Aktuální počasí a 7-day forecast pro Nymburk",
        long_description="Získává aktuální počasí a 7denní předpověď z Open-Meteo API bez potřeby API klíče. Agent ji použije při dotazech na počasí.",
        category="web",
        icon="🌤️",
        permissions=["network"],
        inputs=[
            SkillInputField(
                id="location",
                label="Default location",
                type="text",
                default="Nymburk",
                description="Výchozí lokalita pro předpověď počasí",
            ),
        ],
    ),
    "clipboard": SkillManifest(
        id="clipboard",
        name="Clipboard",
        description="Přečti co je v clipboardu, zkopíruj výsledek analýzy",
        long_description="Čte a zapisuje do macOS clipboardu přes pbpaste/pbcopy. Agent ji použije pro práci s obsahem schránky.",
        category="system",
        icon="📋",
        permissions=["filesystem"],
        inputs=[],
    ),
    "notify": SkillManifest(
        id="notify",
        name="Notifications",
        description="Upozorní na dokončení jobu, error, reminder",
        long_description="Odesílá systémové notifikace na macOS přes osascript. Agent ji použije pro upozornění uživatele na důležité události.",
        category="system",
        icon="🔔",
        permissions=["shell"],
        inputs=[],
    ),
    "http_fetch": SkillManifest(
        id="http_fetch",
        name="HTTP Fetch",
        description="GET/POST na URL, scrape stránky, volej API",
        long_description="Provádí HTTP GET/POST požadavky na libovolné URL. Agent ji použije pro volání REST API nebo stahování obsahu webových stránek.",
        category="web",
        icon="🔗",
        permissions=["network"],
        inputs=[],
    ),
    "shell": SkillManifest(
        id="shell",
        name="Shell",
        description="Spustí Mac příkazy: df, ps, git status, brew update",
        long_description="Spouští whitelisted shell příkazy (df, ps, git, brew, ollama, ping atd.). Agent ji použije pro systémové operace a diagnostiku.",
        category="system",
        icon="🖥️",
        permissions=["shell"],
        inputs=[
            SkillInputField(
                id="extra_commands",
                label="Extra allowed commands (comma-separated)",
                type="text",
                description="Další příkazy povolené nad rámec výchozího whitelistu",
            ),
        ],
    ),
    "vision": SkillManifest(
        id="vision",
        name="Vision (LLaVA)",
        description="Popis obrázku, OCR textu, analýza grafu/screenshotu",
        long_description="Analyzuje obrázky pomocí lokálního modelu LLaVA přes Ollama. Agent ji použije pro popis obrázků, OCR a analýzu vizuálního obsahu.",
        category="ai",
        icon="🖼️",
        permissions=["network"],
        inputs=[
            SkillInputField(
                id="model",
                label="Vision model",
                type="text",
                default="llava:7b",
                description="Název Ollama modelu pro analýzu obrázků",
            ),
        ],
    ),
    "timer": SkillManifest(
        id="timer",
        name="Timer",
        description="Pomodoro 25min, custom countdown, opakující se reminder",
        long_description="Spravuje odpočítávací časovače s notifikací po dokončení. Agent ji použije pro Pomodoro techniku a připomínky.",
        category="system",
        icon="⏱️",
        permissions=[],
        inputs=[],
    ),
    "calculator": SkillManifest(
        id="calculator",
        name="Calculator",
        description="Matematika, procenta, konverze, OEE/takt time výpočet",
        long_description="Provádí bezpečné matematické výpočty včetně trigonometrie a statistiky. Agent ji použije pro rychlé kalkulace a konverze.",
        category="system",
        icon="📊",
        permissions=[],
        inputs=[],
    ),
    "system_health": SkillManifest(
        id="system_health",
        name="System Health",
        description="CPU, RAM, disk usage, top processes – systémový health check",
        long_description="Sbírá systémové metriky (CPU, RAM, disk, top procesy) pomocí psutil. Agent ji použije pro monitoring a diagnostiku systému.",
        category="system",
        icon="💻",
        permissions=[],
        inputs=[],
    ),
    "github_ci_status": SkillManifest(
        id="github_ci_status",
        name="GitHub CI Status",
        description="Zkontroluje GitHub Actions CI/CD status pro repozitář",
        long_description="Kontroluje stav GitHub Actions workflow runů pro zadaný repozitář. Agent ji použije pro monitoring CI/CD pipeline.",
        category="git",
        icon="🔄",
        permissions=["network"],
        inputs=[
            SkillInputField(
                id="github_token",
                label="GitHub Token",
                type="password",
                secret=True,
                required=False,
                description="Personal Access Token pro vyšší rate limit a přístup k privátním repozitářům",
            ),
            SkillInputField(
                id="default_repo",
                label="Default repo (owner/name)",
                type="text",
                default="keksiczek/ai-home-hub",
                description="Výchozí repozitář pro kontrolu CI statusu",
            ),
        ],
    ),
    "lean_metrics": SkillManifest(
        id="lean_metrics",
        name="Lean Metrics",
        description="Jobs total, fail rate, avg time, timeout rate, RAM – lean metriky",
        long_description="Počítá operační metriky z job queue: celkový počet, fail rate, průměrný čas, timeout rate. Agent ji použije pro lean analýzu výkonu systému.",
        category="ai",
        icon="📈",
        permissions=["memory"],
        inputs=[],
    ),
}


def get_builtin_manifest(skill_id: str) -> Optional[SkillManifest]:
    """Return a single builtin skill manifest by ID, or None if not found."""
    return BUILTIN_SKILL_MANIFESTS.get(skill_id)


def get_all_builtin_manifests() -> List[SkillManifest]:
    """Return all builtin skill manifests."""
    return list(BUILTIN_SKILL_MANIFESTS.values())
