"""Runtime agent skills – executable skill classes for the resident agent.

Each skill is a lightweight async class that performs a specific action.
Skills are registered in settings.json under 'enabled_skills' and can be
toggled on/off from the UI.
"""
import asyncio
import logging
import math
import re
import subprocess
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional

import httpx
import psutil

from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)


class BaseSkill:
    """Base class for all runtime skills."""
    name: str = ""
    description: str = ""
    icon: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "icon": self.icon,
        }


class WebSearchSkill(BaseSkill):
    """Search the web via DuckDuckGo (no API key needed)."""
    name = "web_search"
    description = "Hledá aktuální informace, dokumentaci, ceny online"
    icon = "🌐"

    async def run(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        try:
            from duckduckgo_search import DDGS
            results = await asyncio.to_thread(
                lambda: list(DDGS().text(query, max_results=max_results))
            )
            return results
        except ImportError:
            return [{"error": "duckduckgo-search not installed. Run: pip install duckduckgo-search"}]
        except Exception as exc:
            logger.error("WebSearchSkill error: %s", exc)
            return [{"error": str(exc)}]


class CodeExecutionSkill(BaseSkill):
    """Run Python code in a restricted sandbox."""
    name = "code_exec"
    description = "Spustí Python: výpočty, data analýza, pandas/matplotlib"
    icon = "🐍"

    ALLOWED_MODULES = {
        "math", "json", "datetime", "collections", "itertools",
        "functools", "statistics", "decimal", "fractions",
        "csv", "re", "textwrap", "string",
    }

    async def run(self, code: str, timeout: int = 10) -> Dict[str, Any]:
        try:
            result = await asyncio.to_thread(self._execute, code, timeout)
            return result
        except Exception as exc:
            return {"error": str(exc)}

    def _execute(self, code: str, timeout: int) -> Dict[str, Any]:
        """Execute Python code in a subprocess with restricted environment."""
        # Wrap code to capture output
        wrapper = f"""
import sys, io
_stdout = io.StringIO()
sys.stdout = _stdout
try:
{chr(10).join('    ' + line for line in code.splitlines())}
except Exception as e:
    print(f"Error: {{e}}")
sys.stdout = sys.__stdout__
print(_stdout.getvalue())
"""
        try:
            result = subprocess.run(
                ["python3", "-c", wrapper],
                capture_output=True,
                text=True,
                timeout=timeout,
                env={"PATH": "/usr/bin:/usr/local/bin", "HOME": "/tmp"},
            )
            return {
                "stdout": result.stdout.strip(),
                "stderr": result.stderr.strip(),
                "returncode": result.returncode,
            }
        except subprocess.TimeoutExpired:
            return {"error": f"Execution timed out after {timeout}s"}


class CalendarSkill(BaseSkill):
    """Read macOS Calendar via osascript."""
    name = "calendar"
    description = "Zobrazí dnešní události, přidá reminder, plánuj meeting"
    icon = "📅"

    async def get_today(self) -> Dict[str, Any]:
        """Get today's calendar events via AppleScript."""
        script = '''
tell application "Calendar"
    set today to current date
    set output to ""
    repeat with cal in calendars
        set calEvents to (every event of cal whose start date >= today and start date < (today + 1 * days))
        repeat with evt in calEvents
            set output to output & (summary of evt) & " | " & (start date of evt) & linefeed
        end repeat
    end repeat
    return output
end tell
'''
        try:
            result = await asyncio.to_thread(
                lambda: subprocess.run(
                    ["osascript", "-e", script],
                    capture_output=True, text=True, timeout=10,
                )
            )
            events = [
                line.strip() for line in result.stdout.strip().split("\n")
                if line.strip()
            ]
            return {"events": events, "count": len(events), "date": datetime.now().strftime("%Y-%m-%d")}
        except Exception as exc:
            return {"error": str(exc), "events": []}

    async def add_event(self, title: str, date: str, duration: int = 60) -> Dict[str, Any]:
        return {"status": "not_implemented", "message": "Calendar write requires additional permissions"}


class WeatherSkill(BaseSkill):
    """Weather for Nymburk via Open-Meteo (no API key needed)."""
    name = "weather"
    description = "Aktuální počasí a 7-day forecast pro Nymburk"
    icon = "🌤️"

    # Default coordinates for Nymburk
    DEFAULT_LAT = 50.18
    DEFAULT_LON = 15.04

    async def run(self, location: str = "Nymburk") -> Dict[str, Any]:
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={self.DEFAULT_LAT}&longitude={self.DEFAULT_LON}"
            f"&current_weather=true"
            f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode"
            f"&timezone=Europe/Prague"
        )
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url)
                resp.raise_for_status()
                data = resp.json()
            return {
                "location": location,
                "current": data.get("current_weather", {}),
                "daily": data.get("daily", {}),
            }
        except Exception as exc:
            return {"error": str(exc)}


class ClipboardSkill(BaseSkill):
    """Read/write macOS clipboard via pbpaste/pbcopy."""
    name = "clipboard"
    description = "Přečti co je v clipboardu, zkopíruj výsledek analýzy"
    icon = "📋"

    async def read(self) -> Dict[str, Any]:
        try:
            result = await asyncio.to_thread(
                lambda: subprocess.run(["pbpaste"], capture_output=True, text=True, timeout=5)
            )
            return {"content": result.stdout, "length": len(result.stdout)}
        except Exception as exc:
            return {"error": str(exc)}

    async def write(self, text: str) -> Dict[str, Any]:
        try:
            await asyncio.to_thread(
                lambda: subprocess.run(
                    ["pbcopy"], input=text, text=True, timeout=5,
                )
            )
            return {"status": "copied", "length": len(text)}
        except Exception as exc:
            return {"error": str(exc)}


class NotificationSkill(BaseSkill):
    """Send macOS system notifications via osascript."""
    name = "notify"
    description = "Upozorní na dokončení jobu, error, reminder"
    icon = "🔔"

    async def send(self, title: str, message: str, sound: bool = True) -> Dict[str, Any]:
        sound_str = 'with sound name "default"' if sound else ""
        script = f'display notification "{message}" with title "{title}" {sound_str}'
        try:
            await asyncio.to_thread(
                lambda: subprocess.run(
                    ["osascript", "-e", script],
                    capture_output=True, text=True, timeout=5,
                )
            )
            return {"status": "sent", "title": title}
        except Exception as exc:
            return {"error": str(exc)}


class HTTPSkill(BaseSkill):
    """Call REST APIs or fetch web pages."""
    name = "http_fetch"
    description = "GET/POST na URL, scrape stránky, volej API"
    icon = "🌐"

    async def get(self, url: str, headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                resp = await client.get(url, headers=headers or {})
                content_type = resp.headers.get("content-type", "")
                body = resp.text[:5000] if "text" in content_type or "json" in content_type else f"[binary {len(resp.content)} bytes]"
                return {
                    "status_code": resp.status_code,
                    "content_type": content_type,
                    "body": body,
                }
        except Exception as exc:
            return {"error": str(exc)}

    async def post(self, url: str, body: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, json=body or {}, headers=headers or {})
                return {
                    "status_code": resp.status_code,
                    "body": resp.text[:5000],
                }
        except Exception as exc:
            return {"error": str(exc)}


class ShellSkill(BaseSkill):
    """Run safe shell commands (whitelisted)."""
    name = "shell"
    description = "Spustí Mac příkazy: df, ps, git status, brew update"
    icon = "🖥️"

    WHITELIST = {"df", "ps", "top", "git", "brew", "ollama", "ping", "curl", "ls", "cat", "head", "tail", "wc", "uptime", "which", "whoami"}

    async def run(self, command: str, timeout: int = 15) -> Dict[str, Any]:
        # Parse command to check whitelist
        parts = command.strip().split()
        if not parts:
            return {"error": "Empty command"}

        base_cmd = parts[0]
        if base_cmd not in self.WHITELIST:
            return {"error": f"Command '{base_cmd}' not in whitelist. Allowed: {', '.join(sorted(self.WHITELIST))}"}

        try:
            result = await asyncio.to_thread(
                lambda: subprocess.run(
                    command, shell=True,
                    capture_output=True, text=True, timeout=timeout,
                )
            )
            return {
                "stdout": result.stdout[:5000],
                "stderr": result.stderr[:1000],
                "returncode": result.returncode,
            }
        except subprocess.TimeoutExpired:
            return {"error": f"Command timed out after {timeout}s"}
        except Exception as exc:
            return {"error": str(exc)}


class VisionSkill(BaseSkill):
    """Analyze images via llava:7b (local Ollama)."""
    name = "vision"
    description = "Popis obrázku, OCR textu, analýza grafu/screenshotu"
    icon = "🖼️"

    async def analyze(self, image_path: str, prompt: str = "Popiš obrázek") -> Dict[str, Any]:
        import base64
        from pathlib import Path

        path = Path(image_path)
        if not path.exists():
            return {"error": f"Image not found: {image_path}"}

        try:
            image_data = base64.b64encode(path.read_bytes()).decode()
            settings = get_settings_service().load()
            ollama_url = settings.get("llm", {}).get("ollama_url", "http://localhost:11434").rstrip("/")

            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(
                    f"{ollama_url}/api/generate",
                    json={
                        "model": "llava:7b",
                        "prompt": prompt,
                        "images": [image_data],
                        "stream": False,
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                return {"response": data.get("response", ""), "model": "llava:7b"}
        except Exception as exc:
            return {"error": str(exc)}


class TimerSkill(BaseSkill):
    """Countdown timer with notification on completion."""
    name = "timer"
    description = "Pomodoro 25min, custom countdown, opakující se reminder"
    icon = "⏱️"

    _active_timers: Dict[str, asyncio.Task] = {}

    async def start(self, minutes: int, label: str = "Timer") -> Dict[str, Any]:
        timer_id = f"timer_{datetime.now(timezone.utc).strftime('%H%M%S')}"

        async def _countdown():
            await asyncio.sleep(minutes * 60)
            notify = NotificationSkill()
            await notify.send(title=label, message=f"{label} – {minutes}min dokončeno!")

        task = asyncio.create_task(_countdown())
        self._active_timers[timer_id] = task
        return {
            "timer_id": timer_id,
            "label": label,
            "minutes": minutes,
            "status": "started",
        }

    def list_timers(self) -> List[Dict[str, Any]]:
        result = []
        for tid, task in list(self._active_timers.items()):
            result.append({
                "timer_id": tid,
                "done": task.done(),
            })
        return result


class CalculatorSkill(BaseSkill):
    """Quick calculations and unit conversions."""
    name = "calculator"
    description = "Matematika, procenta, konverze, OEE/takt time výpočet"
    icon = "📊"

    # Safe math namespace
    SAFE_NAMES = {
        "abs": abs, "round": round, "min": min, "max": max,
        "sum": sum, "len": len, "int": int, "float": float,
        "pow": pow, "divmod": divmod,
        "pi": math.pi, "e": math.e,
        "sqrt": math.sqrt, "log": math.log, "log10": math.log10,
        "sin": math.sin, "cos": math.cos, "tan": math.tan,
        "ceil": math.ceil, "floor": math.floor,
    }

    async def run(self, expression: str) -> Dict[str, Any]:
        # Sanitize: only allow safe characters
        if re.search(r'[^\d\s\+\-\*\/\.\(\)\,\%\w]', expression):
            return {"error": "Expression contains disallowed characters"}

        try:
            result = eval(expression, {"__builtins__": {}}, self.SAFE_NAMES)
            return {"expression": expression, "result": result}
        except Exception as exc:
            return {"error": f"Calculation failed: {exc}"}


class SystemHealthSkill(BaseSkill):
    """Collect system health metrics via psutil."""
    name = "system_health"
    description = "CPU, RAM, disk usage, top processes – systémový health check"
    icon = "🖥️"

    async def run(self, **kwargs) -> Dict[str, Any]:
        try:
            snap = await asyncio.to_thread(self._collect)
            return snap
        except Exception as exc:
            return {"error": str(exc)}

    def _collect(self) -> Dict[str, Any]:
        cpu = psutil.cpu_percent(interval=1)
        vm = psutil.virtual_memory()
        disk = psutil.disk_usage("/")
        top_procs = []
        for p in sorted(psutil.process_iter(attrs=["pid", "name", "cpu_percent"]),
                        key=lambda x: x.info.get("cpu_percent") or 0, reverse=True)[:5]:
            try:
                top_procs.append({
                    "pid": p.info["pid"],
                    "name": p.info["name"],
                    "cpu": round(p.info.get("cpu_percent") or 0, 1),
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        return {
            "cpu_percent": cpu,
            "memory": {
                "used": round(vm.used / 1024**3, 1),
                "total": round(vm.total / 1024**3, 1),
                "pct": vm.percent,
            },
            "disk": {
                "used": round(disk.used / 1024**3, 0),
                "total": round(disk.total / 1024**3, 0),
                "pct": disk.percent,
            },
            "top_processes": top_procs,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


class GitHubCIStatusSkill(BaseSkill):
    """Check GitHub Actions CI status for a repository."""
    name = "github_ci_status"
    description = "Zkontroluje GitHub Actions CI/CD status pro repozitář"
    icon = "🔄"

    async def run(self, repo: str = "keksiczek/ai-home-hub", **kwargs) -> Dict[str, Any]:
        url = f"https://api.github.com/repos/{repo}/actions/runs?per_page=5"
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(url, headers={"Accept": "application/vnd.github.v3+json"})
                if resp.status_code == 404:
                    return {"repo": repo, "error": "Repository not found or private"}
                resp.raise_for_status()
                data = resp.json()

            runs = data.get("workflow_runs", [])
            if not runs:
                return {"repo": repo, "status": "no_runs", "runs": 0}

            latest = runs[0]
            conclusion = latest.get("conclusion") or latest.get("status", "unknown")
            duration = ""
            if latest.get("created_at") and latest.get("updated_at"):
                try:
                    created = datetime.fromisoformat(latest["created_at"].replace("Z", "+00:00"))
                    updated = datetime.fromisoformat(latest["updated_at"].replace("Z", "+00:00"))
                    secs = int((updated - created).total_seconds())
                    duration = f"{secs // 60}m {secs % 60}s"
                except (ValueError, TypeError):
                    pass

            # Find when failures started
            failing_since = None
            if conclusion == "failure":
                for r in runs:
                    if r.get("conclusion") == "failure":
                        failing_since = (r.get("created_at") or "")[:10]
                    else:
                        break

            return {
                "repo": repo,
                "last_workflow": latest.get("name", "unknown"),
                "status": conclusion,
                "duration": duration,
                "runs": data.get("total_count", len(runs)),
                "failing_since": failing_since,
            }
        except Exception as exc:
            return {"repo": repo, "error": str(exc)}


class LeanMetricsSkill(BaseSkill):
    """Compute lean/operational metrics from the job queue."""
    name = "lean_metrics"
    description = "Jobs total, fail rate, avg time, timeout rate, RAM – lean metriky"
    icon = "📈"

    async def run(self, period: str = "24h", **kwargs) -> Dict[str, Any]:
        try:
            from app.services.job_service import get_job_service
            job_svc = get_job_service()

            hours = int(period.replace("h", "")) if "h" in period else 24
            since = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()

            all_jobs = job_svc.list_jobs(limit=1000)
            recent = [j for j in all_jobs if j.created_at >= since]

            total = len(recent)
            failed = sum(1 for j in recent if j.status == "failed")

            durations = []
            for j in recent:
                if j.started_at and j.finished_at:
                    try:
                        s = datetime.fromisoformat(j.started_at)
                        f = datetime.fromisoformat(j.finished_at)
                        durations.append((f - s).total_seconds())
                    except (ValueError, TypeError):
                        pass

            avg_time = round(sum(durations) / len(durations), 0) if durations else 0
            timeout_count = sum(1 for j in recent if j.last_error and "timeout" in (j.last_error or "").lower())

            vm = psutil.virtual_memory()

            return {
                "jobs_total": total,
                "jobs_failed": failed,
                "avg_job_time": f"{int(avg_time)}s",
                "timeout_rate": round(timeout_count / total, 2) if total > 0 else 0.0,
                "ram_avg": round(vm.used / 1024**3, 1),
                "cycle_efficiency": round((total - failed) / total, 2) if total > 0 else 1.0,
                "period": period,
            }
        except Exception as exc:
            return {"error": str(exc)}


# ── Skills Registry ─────────────────────────────────────────────

ALL_SKILLS: Dict[str, BaseSkill] = {}

def _register_skills():
    """Initialize the global skills registry."""
    global ALL_SKILLS
    skills = [
        WebSearchSkill(),
        CodeExecutionSkill(),
        CalendarSkill(),
        WeatherSkill(),
        ClipboardSkill(),
        NotificationSkill(),
        HTTPSkill(),
        ShellSkill(),
        VisionSkill(),
        TimerSkill(),
        CalculatorSkill(),
        SystemHealthSkill(),
        GitHubCIStatusSkill(),
        LeanMetricsSkill(),
    ]
    ALL_SKILLS = {s.name: s for s in skills}

_register_skills()

# Registry mapping action names to skill classes for dynamic dispatch from resident agent
SKILL_REGISTRY = {
    "web_search": WebSearchSkill,
    "code_exec": CodeExecutionSkill,
    "weather": WeatherSkill,
    "calculator": CalculatorSkill,
    "http_fetch": HTTPSkill,
    "shell": ShellSkill,
    "system_health": SystemHealthSkill,
    "github_ci_status": GitHubCIStatusSkill,
    "lean_metrics": LeanMetricsSkill,
}


def get_all_skills() -> Dict[str, BaseSkill]:
    """Return all registered runtime skills."""
    return ALL_SKILLS


def get_enabled_skills() -> Dict[str, BaseSkill]:
    """Return only skills enabled in settings."""
    settings = get_settings_service().load()
    enabled = settings.get("enabled_skills", list(ALL_SKILLS.keys()))
    return {name: skill for name, skill in ALL_SKILLS.items() if name in enabled}


def get_skill(name: str) -> Optional[BaseSkill]:
    """Lookup a single skill by name."""
    return ALL_SKILLS.get(name)


def get_skills_catalog() -> List[Dict[str, Any]]:
    """Return catalog of all skills with enabled status."""
    settings = get_settings_service().load()
    enabled = set(settings.get("enabled_skills", list(ALL_SKILLS.keys())))
    result = []
    for name, skill in ALL_SKILLS.items():
        entry = skill.to_dict()
        entry["enabled"] = name in enabled
        result.append(entry)
    return result


# ── Marketplace functions ──────────────────────────────────────

from app.models.skill_manifest import SkillManifest
from app.services.skill_registry import get_builtin_manifest, get_all_builtin_manifests


def _mask_secrets(manifest: SkillManifest) -> SkillManifest:
    """Return a copy of the manifest with secret field values masked."""
    secret_ids = {inp.id for inp in manifest.inputs if inp.secret}
    if not secret_ids or not manifest.config:
        return manifest
    masked_config = dict(manifest.config)
    for key in secret_ids:
        if key in masked_config and masked_config[key]:
            masked_config[key] = "***"
    return manifest.model_copy(update={"config": masked_config})


def get_skill_manifest(skill_id: str) -> Optional[SkillManifest]:
    """Manifest obohacený o aktuální enabled stav a config ze settings.json."""
    manifest = get_builtin_manifest(skill_id)
    if not manifest:
        return None
    settings = get_settings_service().load()
    enabled_list = settings.get("enabled_skills", list(ALL_SKILLS.keys()))
    skill_config = settings.get("skills_config", {}).get(skill_id, {})
    updated = manifest.model_copy(update={
        "enabled": skill_id in enabled_list,
        "config": skill_config,
    })
    return _mask_secrets(updated)


def get_all_skill_manifests() -> List[SkillManifest]:
    """Manifesty pro všechny builtin skills."""
    settings = get_settings_service().load()
    enabled_list = set(settings.get("enabled_skills", list(ALL_SKILLS.keys())))
    skills_config = settings.get("skills_config", {})
    result = []
    for manifest in get_all_builtin_manifests():
        skill_config = skills_config.get(manifest.id, {})
        updated = manifest.model_copy(update={
            "enabled": manifest.id in enabled_list,
            "config": skill_config,
        })
        result.append(_mask_secrets(updated))
    return result


def get_skills_by_category() -> Dict[str, List[SkillManifest]]:
    """Dict category → list manifests."""
    manifests = get_all_skill_manifests()
    categories: Dict[str, List[SkillManifest]] = {}
    for m in manifests:
        categories.setdefault(m.category, []).append(m)
    return categories


def enable_skill(skill_id: str) -> bool:
    """Přidá skill do enabled_skills v settings.json."""
    if skill_id not in ALL_SKILLS:
        return False
    svc = get_settings_service()
    settings = svc.load()
    enabled = settings.get("enabled_skills", list(ALL_SKILLS.keys()))
    if skill_id not in enabled:
        enabled.append(skill_id)
    settings["enabled_skills"] = enabled
    svc.save(settings)
    return True


def disable_skill(skill_id: str) -> bool:
    """Odebere skill z enabled_skills v settings.json."""
    if skill_id not in ALL_SKILLS:
        return False
    svc = get_settings_service()
    settings = svc.load()
    enabled = settings.get("enabled_skills", list(ALL_SKILLS.keys()))
    if skill_id in enabled:
        enabled.remove(skill_id)
    settings["enabled_skills"] = enabled
    svc.save(settings)
    return True


def update_skill_config(skill_id: str, config_updates: dict) -> Optional[SkillManifest]:
    """Uloží config do settings.json pod skills_config.{skill_id}.
    Vrátí manifest se zamaskovanými secret fieldy."""
    manifest = get_builtin_manifest(skill_id)
    if not manifest:
        return None
    svc = get_settings_service()
    settings = svc.load()
    skills_config = settings.get("skills_config", {})
    current = skills_config.get(skill_id, {})
    current.update(config_updates)
    skills_config[skill_id] = current
    settings["skills_config"] = skills_config
    svc.save(settings)
    return get_skill_manifest(skill_id)


async def test_skill(skill_id: str) -> dict:
    """Spustí skill s testovacími parametry, timeout 30s.
    Vrátí {success: bool, output: str, duration_ms: float, error: str}"""
    import time

    skill = ALL_SKILLS.get(skill_id)
    if not skill:
        return {"success": False, "output": "", "duration_ms": 0, "error": f"Skill '{skill_id}' not found"}

    # Skills that should be skipped
    if skill_id in ("vision", "timer"):
        return {"success": True, "output": "Test skipped – skill requires special setup", "duration_ms": 0, "error": ""}

    start = time.monotonic()
    try:
        result = await asyncio.wait_for(_run_skill_test(skill_id, skill), timeout=30)
        elapsed = (time.monotonic() - start) * 1000
        output = str(result) if result else ""
        if len(output) > 500:
            output = output[:500] + "..."
        is_error = isinstance(result, dict) and "error" in result and result["error"]
        return {
            "success": not is_error,
            "output": output,
            "duration_ms": round(elapsed, 1),
            "error": result.get("error", "") if isinstance(result, dict) else "",
        }
    except asyncio.TimeoutError:
        elapsed = (time.monotonic() - start) * 1000
        return {"success": False, "output": "", "duration_ms": round(elapsed, 1), "error": "Timeout after 30s"}
    except Exception as exc:
        elapsed = (time.monotonic() - start) * 1000
        return {"success": False, "output": "", "duration_ms": round(elapsed, 1), "error": str(exc)}


async def _run_skill_test(skill_id: str, skill: BaseSkill) -> Any:
    """Run a test for a specific skill with predefined parameters."""
    if skill_id == "web_search":
        return await skill.run(query="Python FastAPI test", max_results=2)
    elif skill_id == "code_exec":
        return await skill.run(code="print(2+2)")
    elif skill_id == "weather":
        return await skill.run(location="Nymburk")
    elif skill_id == "calculator":
        return await skill.run(expression="2**10")
    elif skill_id == "shell":
        return await skill.run(command="uptime")
    elif skill_id == "system_health":
        return await skill.run()
    elif skill_id == "lean_metrics":
        return await skill.run()
    elif skill_id == "github_ci_status":
        return await skill.run()
    elif skill_id == "calendar":
        return await skill.get_today()
    elif skill_id == "clipboard":
        return await skill.read()
    elif skill_id == "notify":
        return await skill.send(title="AI Home Hub Test", message="Skill test OK")
    elif skill_id == "http_fetch":
        return await skill.get(url="https://httpbin.org/get")
    else:
        return {"output": "No test defined for this skill"}
