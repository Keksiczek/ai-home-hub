#!/usr/bin/env python3
"""Migration script: settings v1 → v2 (Hardening Kolo 2).

Adds the new ``guardrails`` top-level key to an existing settings.json, using
conservative defaults.  Idempotent – safe to run multiple times.

Usage::

    python scripts/migrate-settings-v1-to-v2.py [--settings PATH] [--dry-run]
"""

import argparse
import copy
import json
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Default guardrails block added by v2
# ---------------------------------------------------------------------------

GUARDRAILS_DEFAULT = {
    "safe_mode": False,
    "safe_mode_restrictions": {
        "disable_experimental_agents": True,
        "resident_autonomy": "observer",
        "max_concurrent_agents": 1,
    },
    "agent_guardrails": {
        "general":  {"max_steps": 8,  "max_total_tokens": 8_000,  "step_timeout_s": 30,  "max_sub_agent_depth": 2},
        "code":     {"max_steps": 15, "max_total_tokens": 32_000, "step_timeout_s": 300, "max_sub_agent_depth": 3},
        "research": {"max_steps": 12, "max_total_tokens": 64_000, "step_timeout_s": 300, "max_sub_agent_depth": 2},
        "testing":  {"max_steps": 8,  "max_total_tokens": 16_000, "step_timeout_s": 120, "max_sub_agent_depth": 2},
        "devops":   {"max_steps": 6,  "max_total_tokens": 8_000,  "step_timeout_s": 120, "max_sub_agent_depth": 1},
    },
    "resident": {
        "interval_seconds": 900,
        "quiet_hours": ["22:00-07:00"],
        "max_cycles_per_day": 96,
        "autonomy_level": "advisor",
        "max_daily_actions": {
            "git_operations": 5,
            "system_commands": 3,
            "spawn_devops_agent": 1,
            "spawn_specialist": 10,
        },
    },
}


def _deep_merge(base: dict, override: dict) -> dict:
    result = copy.deepcopy(base)
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = _deep_merge(result[key], value)
        else:
            result[key] = copy.deepcopy(value)
    return result


def migrate(settings: dict) -> tuple[dict, list[str]]:
    """Return (migrated_settings, changes_log)."""
    changes: list[str] = []
    result = copy.deepcopy(settings)

    # 1. Add guardrails block if missing
    if "guardrails" not in result:
        new_guardrails = copy.deepcopy(GUARDRAILS_DEFAULT)

        # Carry over resident_mode from old key
        old_mode = result.get("resident_mode", "advisor")
        new_guardrails["resident"]["autonomy_level"] = old_mode
        result["guardrails"] = new_guardrails
        changes.append(f"Added 'guardrails' block (autonomy_level={old_mode!r})")
    else:
        # Merge missing sub-keys into existing guardrails
        existing = result["guardrails"]
        merged = _deep_merge(GUARDRAILS_DEFAULT, existing)
        if merged != existing:
            result["guardrails"] = merged
            changes.append("Filled missing guardrail sub-keys with defaults")

    # 2. Ensure agents.configs has per-type guardrails (backward compat)
    agents = result.setdefault("agents", {})
    agents_configs = agents.setdefault("configs", {})
    for agent_type, gcfg in GUARDRAILS_DEFAULT["agent_guardrails"].items():
        if agent_type not in agents_configs:
            agents_configs[agent_type] = {
                "max_steps": gcfg["max_steps"],
                "step_timeout_s": gcfg["step_timeout_s"],
                "max_total_tokens": gcfg["max_total_tokens"],
            }
            changes.append(f"Added agents.configs.{agent_type}")

    return result, changes


def main() -> None:
    parser = argparse.ArgumentParser(description="Migrate ai-home-hub settings v1 → v2")
    parser.add_argument(
        "--settings",
        default=str(Path(__file__).parent.parent / "backend" / "data" / "settings.json"),
        help="Path to settings.json (default: backend/data/settings.json)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would change without writing the file",
    )
    args = parser.parse_args()

    settings_path = Path(args.settings)
    if not settings_path.exists():
        print(f"[WARN] Settings file not found: {settings_path}")
        print("       Creating fresh v2 settings file...")
        migrated, changes = migrate({})
    else:
        with open(settings_path, "r", encoding="utf-8") as f:
            current = json.load(f)
        migrated, changes = migrate(current)

    if not changes:
        print("[OK] Settings already at v2 – no changes needed.")
        return

    print(f"[INFO] Migration changes ({len(changes)}):")
    for change in changes:
        print(f"  • {change}")

    if args.dry_run:
        print("\n[DRY RUN] No files written.")
        print("\nMigrated settings preview:")
        print(json.dumps(migrated.get("guardrails", {}), indent=2))
        return

    # Write backup
    if settings_path.exists():
        backup_path = settings_path.with_suffix(".v1.json")
        with open(backup_path, "w", encoding="utf-8") as f:
            json.dump(current, f, indent=2, ensure_ascii=False)  # type: ignore[possibly-undefined]
        print(f"[INFO] Backup saved to: {backup_path}")

    settings_path.parent.mkdir(parents=True, exist_ok=True)
    with open(settings_path, "w", encoding="utf-8") as f:
        json.dump(migrated, f, indent=2, ensure_ascii=False)
    print(f"[OK] Settings migrated: {settings_path}")


if __name__ == "__main__":
    sys.exit(main())
