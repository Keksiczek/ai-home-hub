"""Skills service – CRUD operations for agent skills stored in backend/data/skills.json."""
import json
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent.parent / "data"
SKILLS_FILE = DATA_DIR / "skills.json"

DEFAULT_SKILLS: List[Dict[str, Any]] = [
    {
        "id": str(uuid.uuid4()),
        "name": "DAX Expert",
        "description": "Specialista na Power BI DAX formulas a datove modelovani",
        "icon": "\U0001f4ca",
        "system_prompt_addition": (
            "Jsi expert na DAX v Power BI. Znáš všechny DAX funkce, optimalizuješ measures, "
            "navrhuješ datové modely a pomáháš s Power Query M.\n"
            "Pravidla:\n"
            "* Vždy uváděj kompletní DAX kód s komentáři\n"
            "* Vysvětluj rozdíl mezi row context a filter context\n"
            "* Navrhuj alternativní řešení pokud existují\n"
            "* Upozorňuj na výkonnostní problémy (SUMX vs SUM, atd.)\n"
            "* Formátuj kód přehledně s odsazením\n"
            "* Pokud dostaneš screenshot nebo popis modelu, analyzuj vztahy tabulek"
        ),
        "tools": ["filesystem", "vscode"],
        "tags": ["powerbi", "analytics"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Git Operations",
        "description": "Sprava Git repozitaru, branching strategie, CI/CD",
        "icon": "\U0001f527",
        "system_prompt_addition": (
            "Jsi expert na Git, GitHub a CI/CD workflows. Pomáháš se správou repozitářů, "
            "branchingem, mergováním, řešením konfliktů a automatizací.\n"
            "Pravidla:\n"
            "* Vždy uváděj přesné git příkazy které lze zkopírovat a spustit\n"
            "* Vysvětluj co každý příkaz dělá a proč\n"
            "* Varuj před destruktivními operacemi (force push, rebase na shared branch)\n"
            "* Navrhuj gitflow nebo trunk-based development best practices\n"
            "* Pokud popisuješ workflow, uváděj ho jako numbered steps\n"
            "* Pro GitHub Actions uváděj kompletní YAML"
        ),
        "tools": ["git", "filesystem"],
        "tags": ["git", "devops"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Lean Analyst",
        "description": "Analyza procesu, Kaizen, Value Stream Mapping",
        "icon": "\U0001f3ed",
        "system_prompt_addition": (
            "Jsi expert na Lean metodologie, Continuous Improvement, Value Stream Mapping "
            "a výrobní procesy. Pomáháš identifikovat waste a optimalizovat toky.\n"
            "Pravidla:\n"
            "* Používej správnou Lean terminologii (Muda, Mura, Muri, Kaizen, Kanban, atd.)\n"
            "* Vždy navrhuj konkrétní měřitelná zlepšení (KPI, cycle time, lead time)\n"
            "* Při analýze procesu ptej se na: současný stav → plýtvání → budoucí stav\n"
            "* Vytvářej VSM (Value Stream Map) textově pokud nemáš diagram tool\n"
            "* Navrhuj quick wins (< 1 týden) i strategické změny\n"
            "* Propojuj Lean s digitální transformací a automatizací"
        ),
        "tools": ["filesystem"],
        "tags": ["lean", "process"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Code Reviewer",
        "description": "Kontrola kvality kodu, best practices, refactoring",
        "icon": "\U0001f50d",
        "system_prompt_addition": (
            "Jsi senior software engineer specializovaný na code review. Analyzuješ kód "
            "z hlediska kvality, bezpečnosti, výkonu a maintainability.\n"
            "Pravidla:\n"
            "* Strukturuj review jako: Kritické issues → Střední → Doporučení → Pochvaly\n"
            "* Pro každý problém uváděj: co je špatně, proč je to problém, jak to opravit (s kódem)\n"
            "* Kontroluj: security vulnerabilities, edge cases, error handling, naming conventions\n"
            "* Navrhuj refactoring pokud je kód příliš komplexní\n"
            "* Buď konstruktivní — uváděj vždy co funguje dobře\n"
            "* Pokud vidíš Python kód, kontroluj PEP8; JS kód kontroluj ESLint pravidla"
        ),
        "tools": ["filesystem", "git", "vscode"],
        "tags": ["code", "quality"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    },
]


class SkillsService:
    def __init__(self) -> None:
        DATA_DIR.mkdir(parents=True, exist_ok=True)

    def _ensure_file(self) -> None:
        """Create skills.json with default skills if it does not exist."""
        if not SKILLS_FILE.exists():
            self._write(DEFAULT_SKILLS)
            logger.info("Created skills.json with %d default skills", len(DEFAULT_SKILLS))

    def _read(self) -> List[Dict[str, Any]]:
        self._ensure_file()
        with open(SKILLS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    def _write(self, skills: List[Dict[str, Any]]) -> None:
        with open(SKILLS_FILE, "w", encoding="utf-8") as f:
            json.dump(skills, f, indent=2, ensure_ascii=False)

    def list(
        self,
        tag: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Return all skills, optionally filtered by tag and/or search query."""
        skills = self._read()
        if tag:
            skills = [s for s in skills if tag in s.get("tags", [])]
        if search:
            q = search.lower()
            skills = [
                s for s in skills
                if q in s.get("name", "").lower()
                or q in s.get("description", "").lower()
            ]
        return skills

    def get(self, skill_id: str) -> Optional[Dict[str, Any]]:
        """Return a single skill by ID."""
        for s in self._read():
            if s["id"] == skill_id:
                return s
        return None

    def create(self, skill: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new skill and return it."""
        skills = self._read()
        skill["id"] = str(uuid.uuid4())
        skill["created_at"] = datetime.now(timezone.utc).isoformat()
        skills.append(skill)
        self._write(skills)
        logger.info("Created skill %s: %s", skill["id"], skill.get("name"))
        return skill

    def update(self, skill_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a skill by ID. Returns updated skill or None if not found."""
        skills = self._read()
        for i, s in enumerate(skills):
            if s["id"] == skill_id:
                updates.pop("id", None)
                updates.pop("created_at", None)
                skills[i] = {**s, **updates}
                self._write(skills)
                logger.info("Updated skill %s", skill_id)
                return skills[i]
        return None

    def delete(self, skill_id: str) -> bool:
        """Delete a skill by ID. Returns True if found and deleted."""
        skills = self._read()
        original_len = len(skills)
        skills = [s for s in skills if s["id"] != skill_id]
        if len(skills) < original_len:
            self._write(skills)
            logger.info("Deleted skill %s", skill_id)
            return True
        return False

    def get_tags(self) -> List[str]:
        """Return a sorted list of unique tags across all skills."""
        skills = self._read()
        tags = set()
        for s in skills:
            for t in s.get("tags", []):
                tags.add(t)
        return sorted(tags)

    def get_by_ids(self, skill_ids: List[str]) -> List[Dict[str, Any]]:
        """Return skills matching a list of IDs."""
        skills = self._read()
        id_set = set(skill_ids)
        return [s for s in skills if s["id"] in id_set]


# Shared singleton
_skills_service = SkillsService()


def get_skills_service() -> SkillsService:
    return _skills_service
