"""Pydantic settings models for agent guardrails and Safe Mode.

Provides typed, validated configuration for:
- Per-agent-type guardrails (steps, tokens, timeout)
- Resident agent settings (interval, quiet hours, autonomy level)
- Global safe mode toggle
- Per-action daily budgets

Usage::

    from app.core.settings import get_guardrail_settings
    gs = get_guardrail_settings()
    if gs.safe_mode:
        ...
"""

from __future__ import annotations

import os
from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field, field_validator


# ── Per-agent-type guardrails ─────────────────────────────────────────────────


class AgentGuardrailsConfig(BaseModel):
    """Guardrail limits for a single agent type."""

    max_steps: int = Field(15, ge=5, le=50, description="Maximum LLM steps per run")
    max_total_tokens: int = Field(
        32_000, ge=8_000, le=128_000, description="Token budget per run"
    )
    step_timeout_s: int = Field(
        300, ge=10, le=600, description="Per-step timeout in seconds"
    )
    max_sub_agent_depth: int = Field(
        3, ge=1, le=5, description="Maximum sub-agent nesting depth"
    )


# Safe-mode applies tighter defaults
SAFE_MODE_GUARDRAILS = AgentGuardrailsConfig(
    max_steps=8,
    max_total_tokens=16_000,
    step_timeout_s=60,
    max_sub_agent_depth=1,
)

DEFAULT_AGENT_GUARDRAILS: Dict[str, AgentGuardrailsConfig] = {
    "general":  AgentGuardrailsConfig(max_steps=8,  max_total_tokens=8_000,  step_timeout_s=30,  max_sub_agent_depth=2),
    "code":     AgentGuardrailsConfig(max_steps=15, max_total_tokens=32_000, step_timeout_s=300, max_sub_agent_depth=3),
    "research": AgentGuardrailsConfig(max_steps=12, max_total_tokens=64_000, step_timeout_s=300, max_sub_agent_depth=2),
    "testing":  AgentGuardrailsConfig(max_steps=8,  max_total_tokens=16_000, step_timeout_s=120, max_sub_agent_depth=2),
    "devops":   AgentGuardrailsConfig(max_steps=6,  max_total_tokens=8_000,  step_timeout_s=120, max_sub_agent_depth=1),
}


# ── Resident settings ─────────────────────────────────────────────────────────

AutonomyLevel = Literal["observer", "advisor", "autonomous"]


class ResidentGuardrailsConfig(BaseModel):
    """Runtime configuration for the resident daemon."""

    interval_seconds: int = Field(
        900, ge=300, le=3600, description="Cycle interval in seconds (default 15 min)"
    )
    quiet_hours: List[str] = Field(
        default=["22:00-07:00"],
        description='Quiet windows in "HH:MM-HH:MM" format',
    )
    max_cycles_per_day: int = Field(
        96, ge=24, le=288, description="Daily cycle cap (default 96 = 4/hour)"
    )
    autonomy_level: AutonomyLevel = Field(
        "advisor", description="Observer/advisor/autonomous action tier"
    )
    # Per-action daily budgets: how many times each dangerous action may run per day
    max_daily_actions: Dict[str, int] = Field(
        default_factory=lambda: {
            "git_operations": 5,
            "system_commands": 3,
            "spawn_devops_agent": 1,
            "spawn_specialist": 10,
        },
        description="Maximum executions per action per day",
    )

    @field_validator("quiet_hours", mode="before")
    @classmethod
    def validate_quiet_hours(cls, v: List[str]) -> List[str]:
        for item in v:
            parts = item.split("-")
            if len(parts) != 2:
                raise ValueError(f"quiet_hours entry must be 'HH:MM-HH:MM', got: {item!r}")
            for part in parts:
                h_str, sep, m_str = part.partition(":")
                if not sep:
                    raise ValueError(f"Invalid time (missing ':') in quiet_hours: {part!r}")
                if not (h_str.isdigit() and m_str.isdigit()):
                    raise ValueError(f"Invalid time component in quiet_hours: {part!r}")
                h, m = int(h_str), int(m_str)
                if not (0 <= h <= 23 and 0 <= m <= 59):
                    raise ValueError(f"Time out of range in quiet_hours: {part!r}")
        return v

    @field_validator("autonomy_level", mode="before")
    @classmethod
    def validate_autonomy(cls, v: str) -> str:
        allowed = {"observer", "advisor", "autonomous"}
        if v not in allowed:
            raise ValueError(f"autonomy_level must be one of {allowed}, got: {v!r}")
        return v


# ── Safe Mode restrictions ────────────────────────────────────────────────────


class SafeModeRestrictions(BaseModel):
    """Which features to suppress when Safe Mode is active."""

    disable_experimental_agents: bool = True
    resident_autonomy: AutonomyLevel = "observer"
    max_concurrent_agents: int = Field(1, ge=1, le=5)
    disable_system_capabilities: bool = True


# ── Capability settings ──────────────────────────────────────────────────────

CapabilityRisk = Literal["low", "medium", "high"]


class CapabilityConfig(BaseModel):
    """Configuration for the system-access capability layer."""

    enabled: bool = Field(False, description="Master switch for system capabilities (default OFF)")
    shell_whitelist: List[str] = Field(
        default_factory=list,
        description="Additional whitelisted shell commands (beyond safe defaults)",
    )
    file_read_paths: List[str] = Field(
        default_factory=lambda: ["./data", "~/Documents"],
        description="Directories allowed for file reads",
    )
    file_write_paths: List[str] = Field(
        default_factory=lambda: ["./data/output"],
        description="Directories allowed for file writes",
    )
    browser_domains: List[str] = Field(
        default_factory=lambda: ["github.com", "localhost"],
        description="Domain whitelist for browser automation",
    )
    app_whitelist: List[str] = Field(
        default_factory=lambda: ["code", "firefox"],
        description="Applications allowed to launch",
    )
    approval_timeout_minutes: int = Field(
        30, ge=5, le=1440,
        description="How long to wait for human approval of high-risk caps",
    )
    sandbox_root: str = Field(
        "./sandbox_data",
        description="Root directory for sandboxed execution",
    )
    audit_log_retention_days: int = Field(
        30, ge=1, le=365,
        description="How many days to keep audit log entries",
    )


# ── Global settings ───────────────────────────────────────────────────────────


class GlobalGuardrailSettings(BaseModel):
    """Top-level guardrail configuration."""

    safe_mode: bool = Field(False, description="Enable Safe Mode (conservative limits)")
    safe_mode_restrictions: SafeModeRestrictions = Field(
        default_factory=SafeModeRestrictions
    )
    agent_guardrails: Dict[str, AgentGuardrailsConfig] = Field(
        default_factory=lambda: dict(DEFAULT_AGENT_GUARDRAILS),
        description="Per-agent-type guardrail configs",
    )
    resident: ResidentGuardrailsConfig = Field(
        default_factory=ResidentGuardrailsConfig
    )
    capabilities: CapabilityConfig = Field(
        default_factory=CapabilityConfig,
        description="System-access capability configuration (Full Autonomy)",
    )

    def effective_resident_autonomy(self) -> AutonomyLevel:
        """Return the effective autonomy level, considering Safe Mode."""
        if self.safe_mode:
            return self.safe_mode_restrictions.resident_autonomy
        return self.resident.autonomy_level

    def effective_agent_guardrails(self, agent_type: str) -> AgentGuardrailsConfig:
        """Return guardrails for *agent_type*, applying Safe Mode overrides."""
        base = self.agent_guardrails.get(agent_type) or self.agent_guardrails.get("general")
        if base is None:
            base = AgentGuardrailsConfig()
        if self.safe_mode:
            # Take the more restrictive of base and safe-mode defaults
            return AgentGuardrailsConfig(
                max_steps=min(base.max_steps, SAFE_MODE_GUARDRAILS.max_steps),
                max_total_tokens=min(base.max_total_tokens, SAFE_MODE_GUARDRAILS.max_total_tokens),
                step_timeout_s=min(base.step_timeout_s, SAFE_MODE_GUARDRAILS.step_timeout_s),
                max_sub_agent_depth=min(base.max_sub_agent_depth, SAFE_MODE_GUARDRAILS.max_sub_agent_depth),
            )
        return base

    def max_concurrent_agents(self) -> int:
        if self.safe_mode:
            return self.safe_mode_restrictions.max_concurrent_agents
        return 3  # default; overridden by settings_service when loaded


# ── Singleton / factory ───────────────────────────────────────────────────────

_guardrail_settings: Optional[GlobalGuardrailSettings] = None


def get_guardrail_settings() -> GlobalGuardrailSettings:
    """Return the cached guardrail settings instance.

    The instance is populated (and refreshed) by the settings_service
    whenever settings are saved.  Falls back to conservative defaults.
    """
    global _guardrail_settings
    if _guardrail_settings is None:
        _guardrail_settings = GlobalGuardrailSettings()
    return _guardrail_settings


def update_guardrail_settings(data: dict) -> GlobalGuardrailSettings:
    """Create/update guardrail settings from a raw dict (from settings.json)."""
    global _guardrail_settings
    guardrails_data = data.get("guardrails", {})
    _guardrail_settings = GlobalGuardrailSettings(**guardrails_data) if guardrails_data else GlobalGuardrailSettings()
    # Also honour top-level resident_mode key for backwards compat
    if "resident_mode" in data and not guardrails_data.get("resident"):
        _guardrail_settings.resident.autonomy_level = data["resident_mode"]
    return _guardrail_settings


class ActionBlockedError(Exception):
    """Raised when an action is blocked by guardrails (mode, cooldown, or budget)."""


def reset_guardrail_settings() -> None:
    """Reset singleton (for testing)."""
    global _guardrail_settings
    _guardrail_settings = None
