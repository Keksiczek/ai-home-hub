"""Skill manifest model for the Skills Marketplace."""
from pydantic import BaseModel
from typing import Any, List


class SkillInputField(BaseModel):
    id: str
    label: str
    type: str  # "text" | "password" | "number" | "boolean" | "select"
    required: bool = False
    default: Any = None
    description: str = ""
    options: List[str] = []  # pro type="select"
    secret: bool = False  # True → maskuj jako "***" v response


class SkillManifest(BaseModel):
    id: str  # = skill.name z runtime (web_search, weather…)
    name: str  # display name
    version: str = "1.0.0"
    description: str
    long_description: str = ""
    category: str  # "web"|"system"|"git"|"ai"|"communication"|"custom"
    icon: str = ""
    author: str = "builtin"
    tags: List[str] = []
    permissions: List[str] = []  # "network"|"filesystem"|"shell"|"memory"
    inputs: List[SkillInputField] = []
    enabled: bool = True
    config: dict = {}  # runtime config (secrets maskované)
    builtin: bool = True
    source_url: str = ""  # pro externí skills: URL GitHub repozitáře
    install_command: str = ""  # pro externí skills: jak nainstalovat
