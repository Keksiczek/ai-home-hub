"""Tests for AgentSkillsService – discovery, metadata parsing, and catalog."""
import sys
import textwrap
from pathlib import Path
from typing import Any, Dict
from unittest.mock import MagicMock, patch

import pytest

# ── Compatibility shim (same as conftest.py) ─────────────────────────────────
_chroma_mock = MagicMock()
for _mod_name in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod_name, _chroma_mock)

from app.services.agent_skills_service import AgentSkillsService  # noqa: E402


@pytest.fixture
def skill_dir(tmp_path: Path) -> Path:
    """Create a temporary skill directory with a sample SKILL.md."""
    skill_folder = tmp_path / "my-skill"
    skill_folder.mkdir()
    skill_md = skill_folder / "SKILL.md"
    skill_md.write_text(textwrap.dedent("""\
        ---
        name: my-skill
        description: A sample skill for testing.
        author: tester
        ---

        ## Instructions

        Use this skill to do sample things.
    """))
    return tmp_path


@pytest.fixture
def skill_no_frontmatter(tmp_path: Path) -> Path:
    """Create a skill without YAML frontmatter."""
    skill_folder = tmp_path / "bare-skill"
    skill_folder.mkdir()
    skill_md = skill_folder / "SKILL.md"
    skill_md.write_text("# Bare Skill\n\nJust instructions, no frontmatter.\n")
    return tmp_path


@pytest.fixture
def service() -> AgentSkillsService:
    return AgentSkillsService()


class TestLoadSkillMetadata:
    def test_with_frontmatter(self, service: AgentSkillsService, skill_dir: Path) -> None:
        skill_md = skill_dir / "my-skill" / "SKILL.md"
        meta = service.load_skill_metadata(skill_md)
        assert meta is not None
        assert meta["name"] == "my-skill"
        assert meta["description"] == "A sample skill for testing."
        assert meta.get("author") == "tester"

    def test_without_frontmatter(self, service: AgentSkillsService, skill_no_frontmatter: Path) -> None:
        skill_md = skill_no_frontmatter / "bare-skill" / "SKILL.md"
        meta = service.load_skill_metadata(skill_md)
        assert meta is not None
        # Falls back to directory name
        assert meta["name"] == "bare-skill"
        assert "bare-skill" in meta["description"]

    def test_missing_file(self, service: AgentSkillsService, tmp_path: Path) -> None:
        meta = service.load_skill_metadata(tmp_path / "nonexistent" / "SKILL.md")
        assert meta is None


class TestDiscoverSkills:
    def test_discovers_skills_in_directory(self, service: AgentSkillsService, skill_dir: Path) -> None:
        with patch.object(service, "_get_skill_directories", return_value=[skill_dir]):
            records = service.discover_skills()
        assert len(records) == 1
        assert records[0].name == "my-skill"
        assert records[0].description == "A sample skill for testing."
        assert records[0].path.endswith("SKILL.md")

    def test_skips_dirs_without_skill_md(self, service: AgentSkillsService, tmp_path: Path) -> None:
        # Create a dir without SKILL.md
        (tmp_path / "no-skill").mkdir()
        with patch.object(service, "_get_skill_directories", return_value=[tmp_path]):
            records = service.discover_skills()
        assert len(records) == 0

    def test_deduplicates_by_name(self, service: AgentSkillsService, tmp_path: Path) -> None:
        # Two directories with the same skill name
        dir1 = tmp_path / "dir1"
        dir2 = tmp_path / "dir2"
        for d in (dir1, dir2):
            skill_folder = d / "same-skill"
            skill_folder.mkdir(parents=True)
            (skill_folder / "SKILL.md").write_text("---\nname: same-skill\ndescription: dup\n---\n")

        with patch.object(service, "_get_skill_directories", return_value=[dir1, dir2]):
            records = service.discover_skills()
        assert len(records) == 1


class TestBuildCatalog:
    def test_returns_dicts(self, service: AgentSkillsService, skill_dir: Path) -> None:
        with patch.object(service, "_get_skill_directories", return_value=[skill_dir]):
            catalog = service.build_catalog()
        assert len(catalog) == 1
        assert isinstance(catalog[0], dict)
        assert catalog[0]["name"] == "my-skill"
        assert "path" in catalog[0]


class TestLoadSkillInstructions:
    def test_strips_frontmatter(self, service: AgentSkillsService, skill_dir: Path) -> None:
        skill_md = str(skill_dir / "my-skill" / "SKILL.md")
        instructions = service.load_skill_instructions(skill_md)
        assert "---" not in instructions
        assert "name:" not in instructions
        assert "## Instructions" in instructions
        assert "Use this skill" in instructions

    def test_without_frontmatter(self, service: AgentSkillsService, skill_no_frontmatter: Path) -> None:
        skill_md = str(skill_no_frontmatter / "bare-skill" / "SKILL.md")
        instructions = service.load_skill_instructions(skill_md)
        assert "# Bare Skill" in instructions


class TestBuildSystemPromptSection:
    def test_builds_xml_section(self, service: AgentSkillsService, skill_dir: Path) -> None:
        with patch.object(service, "_get_skill_directories", return_value=[skill_dir]):
            service.discover_skills()
            section = service.build_system_prompt_section(["my-skill"])

        assert "<available_skills>" in section
        assert "<name>my-skill</name>" in section
        assert "<description>A sample skill for testing.</description>" in section
        assert "## Agent Skills Instructions" in section
        assert "Use this skill" in section

    def test_empty_for_unknown_skills(self, service: AgentSkillsService, skill_dir: Path) -> None:
        with patch.object(service, "_get_skill_directories", return_value=[skill_dir]):
            service.discover_skills()
            section = service.build_system_prompt_section(["nonexistent-skill"])
        assert section == ""

    def test_catalog_only_mode(self, service: AgentSkillsService, skill_dir: Path) -> None:
        with patch.object(service, "_get_skill_directories", return_value=[skill_dir]):
            service.discover_skills()
            section = service.build_system_prompt_section(
                ["my-skill"], include_instructions=False,
            )
        assert "<available_skills>" in section
        assert "## Agent Skills Instructions" not in section
