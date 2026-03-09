"""Agent Skills service – discovers SKILL.md-based skills from the filesystem.

Follows the agentskills.io convention: each skill is a directory containing
a SKILL.md file with optional YAML frontmatter (name, description, etc.).
"""
import logging
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)

# Regex for YAML frontmatter delimited by ---
_FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n?", re.DOTALL)

# Default directories to scan for agent skills
DEFAULT_SKILL_DIRS: List[str] = [
    "~/.agents/skills",
    "~/.ai-home-hub/skills",
]


class AgentSkillRecord:
    """Lightweight representation of a discovered agent skill."""

    def __init__(self, name: str, description: str, path: str) -> None:
        self.name = name
        self.description = description
        self.path = path  # absolute path to SKILL.md

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "path": self.path,
        }


class AgentSkillsService:
    """Discovers and caches agent skills from configured directories."""

    def __init__(self) -> None:
        self._cache: List[AgentSkillRecord] = []
        self._settings = get_settings_service()

    def _get_skill_directories(self) -> List[Path]:
        """Return resolved list of directories to scan for skills."""
        settings = self._settings.load()
        agent_skills_cfg = settings.get("agent_skills", {})

        use_defaults = agent_skills_cfg.get("use_default_skill_paths", True)
        custom_dirs = agent_skills_cfg.get("skills_directories", [])

        dirs: List[str] = []
        if use_defaults:
            dirs.extend(DEFAULT_SKILL_DIRS)
        dirs.extend(custom_dirs)

        resolved: List[Path] = []
        for d in dirs:
            p = Path(d).expanduser().resolve()
            if p.is_dir():
                resolved.append(p)
        return resolved

    def discover_skills(self) -> List[AgentSkillRecord]:
        """Scan configured directories for folders containing SKILL.md."""
        dirs = self._get_skill_directories()
        records: List[AgentSkillRecord] = []
        seen_names: set = set()

        for base_dir in dirs:
            if not base_dir.exists():
                continue
            for child in sorted(base_dir.iterdir()):
                if not child.is_dir():
                    continue
                skill_md = child / "SKILL.md"
                if not skill_md.is_file():
                    continue
                meta = self.load_skill_metadata(skill_md)
                if meta and meta["name"] not in seen_names:
                    records.append(AgentSkillRecord(
                        name=meta["name"],
                        description=meta["description"],
                        path=str(skill_md),
                    ))
                    seen_names.add(meta["name"])

        logger.info("Discovered %d agent skills from %d directories", len(records), len(dirs))
        self._cache = records
        return records

    def load_skill_metadata(self, skill_md_path: Path) -> Optional[Dict[str, str]]:
        """Parse SKILL.md and extract name/description from YAML frontmatter.

        Falls back to the parent directory name if frontmatter is missing.
        """
        if isinstance(skill_md_path, str):
            skill_md_path = Path(skill_md_path)

        try:
            content = skill_md_path.read_text(encoding="utf-8")
        except Exception as exc:
            logger.warning("Cannot read %s: %s", skill_md_path, exc)
            return None

        meta = self._parse_frontmatter(content)

        # Ensure required fields
        if "name" not in meta:
            meta["name"] = skill_md_path.parent.name
        if "description" not in meta:
            meta["description"] = f"Agent skill: {meta['name']}"

        return meta

    def _parse_frontmatter(self, content: str) -> Dict[str, str]:
        """Extract key-value pairs from YAML frontmatter (simple parser)."""
        match = _FRONTMATTER_RE.match(content)
        if not match:
            return {}

        result: Dict[str, str] = {}
        for line in match.group(1).splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if ":" in line:
                key, _, value = line.partition(":")
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and value:
                    result[key] = value
        return result

    def build_catalog(self) -> List[Dict[str, Any]]:
        """Return the cached catalog or discover if empty."""
        if not self._cache:
            self.discover_skills()
        return [r.to_dict() for r in self._cache]

    def refresh(self) -> List[Dict[str, Any]]:
        """Force re-scan and return updated catalog."""
        self._cache = []
        return self.build_catalog()

    def get_skill_by_name(self, name: str) -> Optional[AgentSkillRecord]:
        """Lookup a single skill by name."""
        if not self._cache:
            self.discover_skills()
        for r in self._cache:
            if r.name == name:
                return r
        return None

    def get_skills_by_names(self, names: List[str]) -> List[AgentSkillRecord]:
        """Return skills matching a list of names."""
        if not self._cache:
            self.discover_skills()
        name_set = set(names)
        return [r for r in self._cache if r.name in name_set]

    def load_skill_instructions(self, skill_path: str) -> str:
        """Load the SKILL.md content without YAML frontmatter."""
        try:
            content = Path(skill_path).read_text(encoding="utf-8")
        except Exception as exc:
            logger.warning("Cannot read skill instructions from %s: %s", skill_path, exc)
            return ""

        # Strip frontmatter
        match = _FRONTMATTER_RE.match(content)
        if match:
            return content[match.end():].strip()
        return content.strip()

    def build_system_prompt_section(
        self,
        skill_names: List[str],
        include_instructions: bool = True,
    ) -> str:
        """Build a system prompt section for selected agent skills.

        Returns a formatted string with the skills catalog and optionally
        the full instructions from each SKILL.md.
        """
        skills = self.get_skills_by_names(skill_names)
        if not skills:
            return ""

        parts: List[str] = ["<available_skills>"]
        for skill in skills:
            parts.append(f"  <skill>")
            parts.append(f"    <name>{skill.name}</name>")
            parts.append(f"    <description>{skill.description}</description>")
            parts.append(f"    <location>{skill.path}</location>")
            parts.append(f"  </skill>")
        parts.append("</available_skills>")

        if include_instructions:
            parts.append("")
            parts.append("## Agent Skills Instructions")
            parts.append("")
            for skill in skills:
                instructions = self.load_skill_instructions(skill.path)
                if instructions:
                    parts.append(f"### {skill.name}")
                    parts.append("")
                    parts.append(instructions)
                    parts.append("")

        return "\n".join(parts)


# Shared singleton
_agent_skills_service = AgentSkillsService()


def get_agent_skills_service() -> AgentSkillsService:
    return _agent_skills_service
