"""Resident Reasoner – the brain of the Resident Agent.

Collects system context (KB stats, job stats, Prometheus metrics),
builds a system prompt, calls LLM, and returns structured SuggestedActions.

Phase 2 addition: tool-augmented reasoning via ``reason_with_tools()``.
"""

import json
import logging
import os
import time
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from app.models.resident_models import (
    MissionStep,
    ResidentReasoningCycle,
    ResidentReflection,
    ResidentSuggestion,
    SuggestedAction,
    ToolCallRecord,
)
from app.services.llm_service import get_llm_service

logger = logging.getLogger(__name__)

# ── Prompt truncation constants ───────────────────────────────
MAX_REASONER_PROMPT_TOKENS: int = int(
    os.environ.get("MAX_REASONER_PROMPT_TOKENS", "700")
)

# Whitelist of action types the reasoner may suggest
ALLOWED_ACTION_TYPES = frozenset(
    {"kb_maintenance", "job_cleanup", "health_check", "analysis", "other"}
)

# Action types that are always destructive → requires_confirmation must be True
DESTRUCTIVE_ACTION_TYPES = frozenset({"kb_maintenance", "job_cleanup"})

# Actions the reasoner can suggest for direct dispatch
REASONER_ALLOWED_ACTIONS = frozenset(
    {
        "system_health",
        "git_status",
        "lean_metrics",
        "kb_search",
        "write_memory",
        "memory_store",
        "memory_search",
        "create_mission",
        "system_status",
        "no_op",
        "web_search",
        "send_notification",
    }
)

# Safe actions that never require confirmation
REASONER_SAFE_ACTIONS = frozenset(
    {
        "system_health",
        "git_status",
        "lean_metrics",
        "kb_search",
        "memory_search",
        "system_status",
        "no_op",
        "write_memory",
    }
)

# ── Autonomous reasoner system prompt ──────────────────────────
REASONER_SYSTEM_PROMPT = """Jsi autonomní Resident Agent – zvědavý, proaktivní a systematický správce domácího AI hubu.

TVOJE ROLE:
- Pravidelně kontroluješ stav systému, git repozitářů a job queue.
- Píšeš krátké "thought" záznamy o tom, co sis všiml a co chceš prozkoumat.
- Sám si zadáváš jednoduché úkoly, pokud vidíš problém nebo příležitost.
- Když vidíš více failů jobů, navrhni analýzu nebo create_mission.

ANTI-REPETICE:
- Nekopíruj přesně to, co jsi dělal v minulém tiku.
- Pokud jsi právě dělal system_health, příště udělej něco jiného.
- Pokud je curiosity backlog neprázdný, vždy navrhni aspoň jednu akci, která se k některému itemu vztahuje.
- Pokud je vše OK a backlog je prázdný, zapiš thought nebo navrhni novou otázku (write_memory s kind="question").

CURIOSITY BACKLOG (tvůj seznam věcí k prozkoumání):
{curiosity_summary}

Pravidla pro práci s curiosity:
- Pokud vidíš open item s priority=high → navrhni action k němu jako první.
- Pokud jsou jen medium items a nic nehoří → vyber jeden a navrhni analysis.
- Pokud je backlog prázdný → vygeneruj nový curiosity item přes write_memory s category="question".

THOUGHT:
- Ke každé akci přidej thought: 1-2 věty, proč to děláš, co tě na tom zajímá.
- Thought musí být konkrétní: ne "Chci zkontrolovat systém." ale "RAM byla včera nad 80%, chci vidět trend."
- Thought nesmí být stejný jako v minulém tiku (viz last_action v kontextu).

POVOLENÉ AKCE (action):
system_health, git_status, lean_metrics, kb_search, write_memory, memory_store,
memory_search, create_mission, system_status, no_op, web_search, send_notification

- web_search   → vyhledej na webu (params: {"query": "...", "max_results": 3})
                 Použij pokud: KB nemá odpověď, curiosity item vyžaduje vnější informace,
                 nebo chceš zjistit aktuální informace mimo KB.
                 NIKDY nepoužívej pro osobní data nebo interní systémy.

- send_notification → pošli mi přímou zprávu
                 params: {"title": "...", "body": "...", "level": "info|warning|insight"}
                 Použij POUZE pokud jsi zjistil něco konkrétního a důležitého (importance >= 7).
                 NIKDY po routine checku, nikdy jen proto, že jsi dokončil tick.
                 Max 3x za hodinu.

PRAVIDLA:
- Max 3 akce najednou.
- Každá akce musí mít: action, title, requires_confirmation.
- Volitelně: params (dict), thought (1-2 věty proč), priority (low/medium/high).
- Safe akce (system_health, git_status, lean_metrics, kb_search, memory_search, system_status, no_op, write_memory) → requires_confirmation: false.
- Destruktivní akce (kb_maintenance, job_cleanup) → requires_confirmation: true VŽDY.

VÝSTUP:
- POUZE JSON pole. Žádný markdown. Žádný text před nebo po JSON.
- Pokud vrátíš nevalidní JSON, použij fallback: [{{"action":"system_health","params":{{}},"requires_confirmation":false,"title":"Fallback check","thought":"Vracím fallback akci.","priority":"low"}}]
"""


class ResidentReasoner:
    """Generates structured action suggestions by calling LLM with system context."""

    async def generate_suggestions(self, mode: str) -> Optional[ResidentSuggestion]:
        """Collect context, call LLM, return a ResidentSuggestion or None.

        Uses a concise JSON-only prompt with action examples. Falls back to
        a deterministic safe action if LLM returns invalid JSON.
        """
        if mode == "observer":
            return None

        context = await self._collect_context()
        context_summary = self._build_context_summary(context)
        curiosity_summary = self._build_curiosity_summary(context)

        # Build system prompt with curiosity backlog injected
        system_prompt = REASONER_SYSTEM_PROMPT.replace(
            "{curiosity_summary}",
            curiosity_summary,
        )

        user_message = (
            f"STAV:\n{context_summary[:500]}\n\n"
            "Navrhni 1–3 akce. Odpověz POUZE JSON polem."
        )

        # ── Prompt truncation (KROK 2.1) ──────────────────────────
        full_prompt = system_prompt + "\n" + user_message
        estimated_tokens = len(full_prompt) // 4
        if estimated_tokens > MAX_REASONER_PROMPT_TOKENS:
            original_tokens = estimated_tokens
            # Truncate curiosity to top 2
            curiosity_items = context.get("curiosity_items", [])
            truncated_curiosity = self._build_curiosity_summary(
                {"curiosity_items": curiosity_items[:2]}
            )
            # Truncate context summary (job stats 1 line only)
            context_summary = context_summary[:250]
            system_prompt = REASONER_SYSTEM_PROMPT.replace(
                "{curiosity_summary}",
                truncated_curiosity,
            )
            user_message = (
                f"STAV:\n{context_summary}\n\n"
                "Navrhni 1–3 akce. Odpověz POUZE JSON polem."
            )
            new_tokens = len((system_prompt + "\n" + user_message)) // 4
            logger.debug(
                "prompt truncated from %d to %d tokens",
                original_tokens,
                new_tokens,
            )

        try:
            llm = get_llm_service()
            reply, meta = await llm.generate(
                message=user_message,
                mode="resident_reasoner",
                profile="general",
                history=[{"role": "system", "content": system_prompt}],
            )

            if meta.get("status") == "llm_unavailable":
                logger.warning("Reasoner: LLM unavailable, using fallback")
                return self._fallback_suggestion(mode, context_summary)

            actions, had_candidates = self._parse_suggestions(reply)
            if not actions:
                if had_candidates:
                    # LLM returned items but all were filtered for safety — return empty
                    logger.warning("Reasoner: all suggested actions were filtered out")
                    return ResidentSuggestion(
                        mode=mode,
                        actions=[],
                        context_summary=context_summary[:500],
                    )
                logger.warning("Reasoner: no valid actions parsed, using fallback")
                return self._fallback_suggestion(mode, context_summary)

            return ResidentSuggestion(
                mode=mode,
                actions=actions,
                context_summary=context_summary[:500],
            )
        except Exception as exc:
            logger.error(
                "Reasoner suggestion generation failed: %s, using fallback", exc
            )
            return self._fallback_suggestion(mode, context_summary[:500])

    def _fallback_suggestion(
        self, mode: str, context_summary: str = ""
    ) -> ResidentSuggestion:
        """Return a deterministic safe fallback suggestion when LLM fails."""
        fallback_action = SuggestedAction(
            title="System check (fallback)",
            description="Automatický system health check – LLM nedostupné.",
            action_type="health_check",
            action="system_health",
            priority="medium",
            requires_confirmation=False,
            steps=["system_health"],
            thought="LLM nedostupné nebo vrátilo nevalidní odpověď, provádím bezpečný fallback.",
        )
        return ResidentSuggestion(
            mode=mode,
            actions=[fallback_action],
            context_summary=context_summary,
        )

    async def plan_mission(
        self, goal: str, context: str = ""
    ) -> Optional[List[MissionStep]]:
        """Call LLM to break a goal into mission steps."""
        user_message = f"CÍL MISE: {goal}"
        if context:
            user_message += f"\nKONTEXT: {context}"
        user_message += (
            "\n\nRozlož cíl na konkrétní kroky. Odpověz POUZE JSON objektem."
        )

        try:
            llm = get_llm_service()
            reply, meta = await llm.generate(
                message=user_message,
                mode="resident_mission_planner",
                profile="general",
            )

            if meta.get("status") == "llm_unavailable":
                return None

            return self._parse_mission_plan(reply)
        except Exception as exc:
            logger.error("Mission planning failed: %s", exc)
            return None

    async def generate_plan(
        self, goal: str, context: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """Generate a structured plan with steps – NO execution, draft only.

        Returns a dict with keys: steps (list), raw_markdown (str), model (str).
        Each step: {title, description, tool, params, depends_on}.
        """
        context_text = ""
        if context:
            context_text = f"\nKONTEXT: {json.dumps(context, ensure_ascii=False)}"

        user_message = (
            f"CÍL PLÁNU: {goal}{context_text}\n\n"
            "Vytvoř strukturovaný plán kroků pro dosažení cíle.\n"
            "DŮLEŽITÉ: Neprováděj ŽÁDNÉ akce. Pouze navrhni kroky.\n\n"
            "Odpověz POUZE JSON objektem v tomto formátu:\n"
            "{\n"
            '  "steps": [\n'
            "    {\n"
            '      "title": "Název kroku",\n'
            '      "description": "Detailní popis co se má udělat",\n'
            '      "tool": "agent" | "script" | "kb" | "none",\n'
            '      "params": {},\n'
            '      "depends_on": []\n'
            "    }\n"
            "  ],\n"
            '  "summary_markdown": "## Plán\\n- krok 1...\\n..."\n'
            "}\n\n"
            "Pravidla:\n"
            "- tool=agent: krok vyžaduje AI agenta (params: {agent_type, workspace})\n"
            "- tool=script: krok volá existující nástroj (params: {tool_name, arguments})\n"
            "- tool=kb: krok pracuje s knowledge base (params: {action: search|store, query|content})\n"
            "- tool=none: informační/manuální krok bez automatizace\n"
            "- depends_on: seznam ID předchozích kroků, na kterých závisí\n"
            "- Max 10 kroků.\n"
        )

        try:
            llm = get_llm_service()
            reply, meta = await llm.generate(
                message=user_message,
                mode="resident_plan_generator",
                profile="general",
            )

            if meta.get("status") == "llm_unavailable":
                logger.warning("Plan generation: LLM unavailable")
                return None

            data = self._extract_json(reply)
            if not isinstance(data, dict):
                logger.error("Plan generation: LLM did not return a dict")
                return None

            raw_steps = data.get("steps", [])
            if not raw_steps:
                return None

            steps = []
            for i, s in enumerate(raw_steps[:10]):
                if not isinstance(s, dict):
                    continue
                tool = s.get("tool", "none")
                if tool not in ("agent", "script", "kb", "none"):
                    tool = "none"
                steps.append(
                    {
                        "title": str(s.get("title", f"Krok {i+1}"))[:200],
                        "description": str(s.get("description", ""))[:500],
                        "tool": tool,
                        "params": (
                            s.get("params", {})
                            if isinstance(s.get("params"), dict)
                            else {}
                        ),
                        "depends_on": (
                            [str(d) for d in s.get("depends_on", [])]
                            if isinstance(s.get("depends_on"), list)
                            else []
                        ),
                    }
                )

            plan_dict = {
                "steps": steps,
                "raw_markdown": str(data.get("summary_markdown", ""))[:2000],
                "model": meta.get("model", ""),
            }

            # Persist plan as pending_approval – no side-effects until user approves
            try:
                from app.models.resident_models import PlanStep, ResidentPlan
                from app.services.resident_plan_service import get_resident_plan_service

                plan_steps = [PlanStep(**s) for s in steps]
                plan = ResidentPlan(
                    goal=goal,
                    steps=plan_steps,
                    raw_markdown=plan_dict["raw_markdown"],
                    status="pending_approval",
                    meta={"model": plan_dict["model"]},
                )
                get_resident_plan_service().save_plan(plan)
                plan_dict["plan_id"] = plan.plan_id
                logger.info(
                    "Plan %s saved as pending_approval (goal=%s)",
                    plan.plan_id,
                    goal[:60],
                )
            except Exception as exc:
                logger.error("Failed to persist plan: %s", exc)

            return plan_dict
        except Exception as exc:
            logger.error("Plan generation failed: %s", exc, exc_info=True)
            return None

    async def generate_reflection(
        self, job_id: str, job_type: str, goal: str, status: str, error: str = ""
    ) -> Optional[ResidentReflection]:
        """Generate a reflection after a resident job completes."""
        user_message = (
            f"DOKONČENÝ ÚKOL:\n"
            f"- Typ: {job_type}\n"
            f"- Cíl: {goal}\n"
            f"- Výsledek: {status}\n"
        )
        if error:
            user_message += f"- Chyba: {error[:300]}\n"
        user_message += "\nVytvoř stručnou reflexi. Odpověz POUZE JSON objektem."

        try:
            llm = get_llm_service()
            reply, meta = await llm.generate(
                message=user_message,
                mode="resident_reflection",
                profile="general",
            )

            if meta.get("status") == "llm_unavailable":
                return None

            return self._parse_reflection(reply, job_id, job_type)
        except Exception as exc:
            logger.error("Reflection generation failed: %s", exc)
            return None

    # ── Context collection ──────────────────────────────────────

    async def _collect_context(self) -> Dict[str, Any]:
        """Gather KB stats, job stats, and resource metrics."""
        ctx: Dict[str, Any] = {}

        # Job stats
        try:
            from app.services.job_service import get_job_service

            job_svc = get_job_service()
            since_24h = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
            ctx["job_stats_24h"] = job_svc.get_stats_since(since_24h)
            ctx["queued_jobs"] = len(job_svc.list_jobs(status="queued", limit=100))
            ctx["failed_jobs_24h"] = job_svc.count_jobs(
                status="failed", since=since_24h
            )
        except Exception as exc:
            logger.debug("Context: job stats failed: %s", exc)

        # KB stats
        try:
            from app.services.vector_store_service import get_vector_store_service

            vs = get_vector_store_service()
            ctx["kb_stats"] = vs.get_stats()
        except Exception as exc:
            logger.debug("Context: KB stats failed: %s", exc)

        # Curiosity backlog (top open items)
        try:
            from app.services.resident_curiosity import get_curiosity_service

            curiosity_svc = get_curiosity_service()
            open_items = curiosity_svc.list_items(status="open", limit=3)
            ctx["curiosity_items"] = [
                {"title": i.title, "priority": i.priority, "kind": i.kind}
                for i in open_items
            ]
        except Exception as exc:
            logger.debug("Context: curiosity items failed: %s", exc)

        # Resource monitor
        try:
            from app.services.resource_monitor import get_resource_monitor

            monitor = get_resource_monitor()
            snapshot = monitor.to_dict()
            ctx["resources"] = {
                "ram_percent": snapshot.get("ram_used_percent", "?"),
                "cpu_percent": snapshot.get("cpu_percent", "?"),
                "throttled": snapshot.get("throttle", False),
                "blocked": snapshot.get("block", False),
            }
        except Exception as exc:
            logger.debug("Context: resource monitor failed: %s", exc)

        # Last action from agent state
        try:
            from app.services.resident_agent import get_resident_agent

            agent = get_resident_agent()
            state = agent.get_state()
            ctx["last_action"] = state.get("last_action", "")
            ctx["tick_count"] = state.get("tick_count", 0)
            ctx["budget"] = agent.get_budget_status()
        except Exception as exc:
            logger.debug("Context: agent state failed: %s", exc)

        return ctx

    def _build_context_summary(self, ctx: Dict[str, Any]) -> str:
        """Build a human-readable context summary for the LLM prompt.

        Keeps total length under ~700 tokens: job stats 1 line, KB 1 line,
        system 1 line, last action, budget, curiosity top 3.
        """
        lines = []

        # Job stats (1 line)
        job_stats = ctx.get("job_stats_24h", {})
        lines.append(
            f"Joby(24h): {job_stats.get('tasks_total', 0)} celkem, "
            f"{job_stats.get('success_rate', 0):.0%} úsp., "
            f"{ctx.get('failed_jobs_24h', 0)} selhalo, "
            f"{ctx.get('queued_jobs', 0)} ve frontě"
        )

        # KB (1 line)
        kb = ctx.get("kb_stats", {})
        lines.append(f"KB: {kb.get('total_chunks', 0)} chunků")

        # System resources (1 line)
        res = ctx.get("resources", {})
        lines.append(
            f"Systém: RAM {res.get('ram_percent', '?')}%, "
            f"CPU {res.get('cpu_percent', '?')}%"
        )

        # Last action + tick count
        last_action = ctx.get("last_action", "")
        tick_count = ctx.get("tick_count", 0)
        if last_action:
            lines.append(f"Poslední akce: {last_action} (tick #{tick_count})")
        elif tick_count:
            lines.append(f"Tick #{tick_count}, žádná předchozí akce")

        # Budget status
        budget = ctx.get("budget", {})
        if budget:
            lines.append(
                f"Budget: LLM {budget.get('llm_calls_this_hour', 0)}/{budget.get('llm_calls_limit', 20)}/h, "
                f"mise {budget.get('missions_today', 0)}/{budget.get('missions_limit', 5)}/den, "
                f"analysis {budget.get('analysis_jobs_this_hour', 0)}/{budget.get('analysis_jobs_limit', 10)}/h"
            )

        return "\n".join(lines)

    def _build_curiosity_summary(self, ctx: Dict[str, Any]) -> str:
        """Build curiosity backlog summary for the prompt template."""
        curiosity_items = ctx.get("curiosity_items", [])
        if not curiosity_items:
            return "(prázdný – vygeneruj novou otázku přes write_memory)"

        kind_icon = {
            "question": "🔍",
            "idea": "💡",
            "anomaly": "⚡",
            "hypothesis": "🤔",
        }
        parts = []
        for ci in curiosity_items[:3]:
            icon = kind_icon.get(ci.get("kind", ""), "🔍")
            parts.append(
                f"- {icon} [{ci.get('priority', 'medium')}] {ci.get('title', '?')}"
            )
        return "\n".join(parts)

    # ── Parsing ─────────────────────────────────────────────────

    def _parse_suggestions(
        self, reply: str
    ) -> tuple[List[SuggestedAction], bool]:
        """Parse LLM reply into a list of SuggestedAction, with safety filtering.

        Returns (actions, had_candidates) where had_candidates is True when the
        LLM returned at least one item (even if all were filtered for safety).
        Supports both old format (action_type) and new format (action + params + thought).
        """
        try:
            data = self._extract_json(reply)
        except (ValueError, json.JSONDecodeError):
            logger.warning("Reasoner: failed to parse JSON from reply")
            return [], False

        # Expect a list
        items = (
            data
            if isinstance(data, list)
            else data.get("actions", []) if isinstance(data, dict) else []
        )
        had_candidates = bool(items)

        actions = []
        for item in items[:5]:  # max 5
            if not isinstance(item, dict):
                continue

            # Support new format: "action" field for direct dispatch
            direct_action = item.get("action", "")
            action_type = item.get("action_type", "other")

            # Map direct_action to action_type if not provided
            if direct_action and action_type == "other":
                if direct_action in ("system_health", "lean_metrics"):
                    action_type = "health_check"
                elif direct_action in ("kb_search", "kb_maintenance"):
                    action_type = (
                        "kb_maintenance"
                        if "maintenance" in direct_action
                        else "analysis"
                    )
                elif direct_action in ("git_status",):
                    action_type = "analysis"
                elif direct_action in ("write_memory", "memory_store"):
                    action_type = "other"
                elif direct_action == "create_mission":
                    action_type = "other"

            if action_type not in ALLOWED_ACTION_TYPES:
                continue  # Filter out disallowed action types

            # Enforce requires_confirmation for destructive types
            requires_conf = bool(item.get("requires_confirmation", True))
            if action_type in DESTRUCTIVE_ACTION_TYPES:
                requires_conf = True
            # Safe actions override
            if direct_action in REASONER_SAFE_ACTIONS:
                requires_conf = False

            try:
                actions.append(
                    SuggestedAction(
                        **({"id": str(item["id"])[:8]} if item.get("id") else {}),
                        title=str(item.get("title", "Bez názvu"))[:100],
                        description=str(item.get("description", ""))[:300],
                        action_type=action_type,
                        action=str(direct_action)[:50],
                        priority=(
                            item.get("priority", "medium")
                            if item.get("priority") in ("low", "medium", "high")
                            else "medium"
                        ),
                        requires_confirmation=requires_conf,
                        estimated_cost=str(item.get("estimated_cost", ""))[:200],
                        steps=[str(s)[:200] for s in item.get("steps", [])[:10]],
                        thought=str(item.get("thought", ""))[:300],
                        params=(
                            item.get("params", {})
                            if isinstance(item.get("params"), dict)
                            else {}
                        ),
                    )
                )
            except Exception as exc:
                logger.debug("Reasoner: skipped malformed suggestion: %s", exc)

        return actions, had_candidates

    def _parse_mission_plan(self, reply: str) -> Optional[List[MissionStep]]:
        """Parse LLM reply into a list of MissionSteps."""
        data = self._extract_json(reply)
        if not isinstance(data, dict):
            return None

        raw_steps = data.get("steps", [])
        if not raw_steps:
            return None

        steps = []
        for s in raw_steps[:10]:
            if not isinstance(s, dict):
                continue
            steps.append(
                MissionStep(
                    title=str(s.get("title", "Krok"))[:100],
                    description=str(s.get("description", ""))[:300],
                )
            )

        return steps if steps else None

    def _parse_reflection(
        self, reply: str, job_id: str, job_type: str
    ) -> Optional[ResidentReflection]:
        """Parse LLM reply into a ResidentReflection."""
        data = self._extract_json(reply)
        if not isinstance(data, dict):
            return None

        points = [str(p)[:200] for p in data.get("points", [])[:3]]
        if not points:
            return None

        return ResidentReflection(
            job_id=job_id,
            job_type=job_type,
            points=points,
            useful=data.get("useful"),
            recommendation=str(data.get("recommendation", ""))[:300],
        )

    def _extract_json(self, reply: str) -> Any:
        """Extract JSON from LLM reply, handling code fences."""
        reply = reply.strip()
        try:
            return json.loads(reply)
        except json.JSONDecodeError:
            pass

        if "```json" in reply:
            start = reply.index("```json") + 7
            end = reply.index("```", start)
            return json.loads(reply[start:end].strip())

        if "```" in reply:
            start = reply.index("```") + 3
            end = reply.index("```", start)
            return json.loads(reply[start:end].strip())

        # Find first [ or { and match
        for start_char, end_char in [("[", "]"), ("{", "}")]:
            s = reply.find(start_char)
            e = reply.rfind(end_char)
            if s != -1 and e != -1 and e > s:
                return json.loads(reply[s : e + 1])

        raise ValueError("No valid JSON found in response")

    # ── Tool-augmented reasoning ──────────────────────────────

    async def reason_with_tools(
        self, context_override: Optional[Dict[str, Any]] = None
    ) -> ResidentReasoningCycle:
        """Run a single tool-augmented reasoning cycle.

        1. Collect system context.
        2. Ask LLM which tools to call (max 3).
        3. Execute the tool calls.
        4. Feed tool results back to LLM for final suggestions.
        """
        from app.services.resident_tools import (
            execute_tool_call,
            render_tools_for_prompt,
        )

        t0 = time.monotonic()

        # Collect context
        if context_override is not None:
            context = context_override
            context_summary = json.dumps(context, ensure_ascii=False)[:500]
        else:
            context = await self._collect_context()
            context_summary = self._build_context_summary(context)

        tools_list = render_tools_for_prompt()

        # Phase 1: Ask LLM which tools to call
        tools_prompt = TOOLS_SYSTEM_PROMPT.replace("{tools_list}", tools_list)
        user_message = f"AKTUÁLNÍ KONTEXT SYSTÉMU:\n{context_summary}"

        llm = get_llm_service()
        try:
            reply, meta = await llm.generate(
                message=user_message,
                mode="resident_tool_calling",
                profile="general",
                history=[{"role": "system", "content": tools_prompt}],
            )
        except Exception as exc:
            logger.error("Tool reasoning phase 1 failed: %s", exc)
            return ResidentReasoningCycle(
                context_summary=context_summary,
                total_duration_ms=int((time.monotonic() - t0) * 1000),
            )

        if meta.get("status") == "llm_unavailable":
            logger.warning("Tool reasoning: LLM unavailable")
            return ResidentReasoningCycle(
                context_summary=context_summary,
                total_duration_ms=int((time.monotonic() - t0) * 1000),
            )

        # Phase 2: Parse and execute tool calls (max 3)
        tool_calls = self._parse_tool_calls(reply)
        tool_records: List[ToolCallRecord] = []

        for tc in tool_calls[:3]:
            result = await execute_tool_call(tc, context)
            fn = tc.get("function", {})
            raw_args = fn.get("arguments", {})
            if isinstance(raw_args, str):
                try:
                    raw_args = json.loads(raw_args)
                except json.JSONDecodeError:
                    raw_args = {}
            tool_records.append(
                ToolCallRecord(
                    tool_name=fn.get("name", "unknown"),
                    arguments=raw_args,
                    result=result.get("data") or {"error": result.get("error")},
                    ok=result.get("ok", False),
                    duration_ms=result.get("duration_ms", 0),
                )
            )

        tools_used = [tr.tool_name for tr in tool_records]

        # Phase 3: Final reasoning with tool results
        tool_results_json = json.dumps(
            [
                {"tool": tr.tool_name, "ok": tr.ok, "data": tr.result}
                for tr in tool_records
            ],
            ensure_ascii=False,
            default=str,
        )[:4000]

        schema_hint = (
            '{"title": str, "description": str, "action_type": "kb_maintenance"|"job_cleanup"|"health_check"|"analysis"|"other", '
            '"priority": "low"|"medium"|"high", "requires_confirmation": bool, "steps": [str]}'
        )
        final_prompt = FINAL_REASONING_PROMPT.replace("{schema}", schema_hint)
        final_message = (
            f"VÝSLEDKY NÁSTROJŮ:\n{tool_results_json}\n\n"
            f"KONTEXT SYSTÉMU:\n{context_summary}"
        )

        try:
            final_reply, final_meta = await llm.generate(
                message=final_message,
                mode="resident_final_reasoning",
                profile="general",
                history=[{"role": "system", "content": final_prompt}],
            )
        except Exception as exc:
            logger.error("Tool reasoning phase 3 failed: %s", exc)
            final_reply = "[]"

        suggestions, _ = self._parse_suggestions(final_reply) if final_reply else ([], False)

        total_ms = int((time.monotonic() - t0) * 1000)

        return ResidentReasoningCycle(
            context_summary=context_summary,
            tools_used=tools_used,
            tool_calls=tool_records,
            final_suggestions=suggestions,
            model=meta.get("model", ""),
            total_duration_ms=total_ms,
        )

    def _parse_tool_calls(self, reply: str) -> List[Dict[str, Any]]:
        """Parse tool-call JSON from the LLM response.

        Expected format (from TOOLS_SYSTEM_PROMPT):
        [{"type": "function", "function": {"name": "...", "arguments": {...}}}]

        Falls back gracefully: returns [] if nothing parseable.
        """
        try:
            data = self._extract_json(reply)
        except (ValueError, json.JSONDecodeError):
            logger.debug("No tool calls found in LLM reply")
            return []

        # Accept both list and single-dict forms
        if isinstance(data, dict):
            data = [data]
        if not isinstance(data, list):
            return []

        calls: List[Dict[str, Any]] = []
        for item in data:
            if not isinstance(item, dict):
                continue
            fn = item.get("function", {})
            if not fn.get("name"):
                # Flat format: {"name": ..., "arguments": ...}
                if item.get("name"):
                    fn = {"name": item["name"], "arguments": item.get("arguments", {})}
                else:
                    continue
            calls.append({"type": "function", "function": fn})

        return calls


# ── LLM prompts for tool calling ────────────────────────────

TOOLS_SYSTEM_PROMPT = """Jsi Resident Agent s přístupem k nástrojům.

1. Nejdřív zvaž, jestli potřebuješ nějaký tool.
2. Vol max 3 tools, každý tool max 1×.
3. Vrať POUZE tool calls v tomto formátu:
[
  {"type": "function", "function": {"name": "tool_name", "arguments": {"param": "value"}}}
]

Dostupné tools:
{tools_list}
"""

FINAL_REASONING_PROMPT = """Máš tool results a systémový kontext. Navrhni max 3 akce:

1. Každá akce musí být bezpečná a užitečná.
2. Vrať POUZE JSON: List[SuggestedAction]
3. Žádné shell příkazy, jen definované action_types.

{schema}
"""


# ── Chat prompt helpers (extracted from router) ─────────────


def build_task_chat_context(job) -> str:
    """Build system prompt for task-level chat.

    *job* is a job_service job object with .title, .input_summary, .status,
    .meta, .last_error attributes.
    """
    from app.services.llm_service import get_date_context

    task_output = ""
    if job.meta and job.meta.get("result"):
        task_output = str(job.meta["result"])[:2000]

    return (
        f"{get_date_context()}\n"
        f'Jsi AI agent který provedl úkol: "{job.title}"\n\n'
        f"Kontext úkolu:\n"
        f"- Popis: {job.input_summary or 'žádný'}\n"
        f"- Status: {job.status}\n"
        f"{'- Výstup: ' + task_output if task_output else '- Úkol nemá textový výstup.'}\n"
        f"{'- Chyba: ' + job.last_error if job.last_error else ''}\n\n"
        f"Odpovídej na otázky uživatele o tomto konkrétním úkolu. "
        f"Buď konkrétní. Odpovídej česky."
    )


def build_mission_chat_context(job) -> str:
    """Build system prompt for mission-level chat.

    *job* is a job_service job object for a resident_mission.
    """
    from app.services.llm_service import get_date_context

    plan = job.payload.get("plan", {})
    steps = plan.get("steps", [])
    mission_output = plan.get("output", "")

    steps_summary = "\n".join(
        f"  Krok {i+1}: {s.get('title', '')} — {s.get('status', 'pending')}"
        + (f" → {s.get('result_summary', '')}" if s.get("result_summary") else "")
        for i, s in enumerate(steps)
    )

    reflection_ctx = ""
    if job.meta and job.meta.get("reflection"):
        r = job.meta["reflection"]
        points = r.get("points", [])
        if points:
            reflection_ctx = "\nReflexe:\n" + "\n".join(f"- {p}" for p in points)
            if r.get("recommendation"):
                reflection_ctx += f"\nDoporučení: {r['recommendation']}"

    return (
        f"{get_date_context()}\n"
        f"Jsi AI agent který právě dokončil misi: \"{plan.get('goal', job.title)}\"\n\n"
        f"Kontext mise:\n"
        f"- Status: {plan.get('status', job.status)}\n"
        f"- Počet kroků: {len(steps)}\n"
        f"- Kroky které jsi provedl:\n{steps_summary}\n"
        f"{reflection_ctx}\n"
        f"{'- Výstup mise: ' + mission_output if mission_output else '- Mise nemá textový výstup.'}\n\n"
        f"Odpovídej na otázky uživatele o této konkrétní misi. "
        f"Vysvětluj své rozhodnutí, metodologii a výsledky. "
        f"Buď konkrétní a odkazuj se na skutečné kroky které jsi provedl. "
        f"Odpovídej česky."
    )


# ── Reasoning cycle store (extracted from router) ───────────

_reasoning_cycles: list = []
_MAX_REASONING_HISTORY = 20


def get_reasoning_cycles(limit: int = 10) -> list:
    """Return recent reasoning cycles."""
    return _reasoning_cycles[-limit:]


def store_reasoning_cycle(cycle) -> None:
    """Append a cycle and prune old entries."""
    _reasoning_cycles.append(cycle)
    if len(_reasoning_cycles) > _MAX_REASONING_HISTORY:
        del _reasoning_cycles[: len(_reasoning_cycles) - _MAX_REASONING_HISTORY]


# ── Dashboard enrichment (extracted from router) ────────────


def enrich_dashboard_data(data: dict, health: dict) -> dict:
    """Add metrics_24h and health-based alerts to dashboard data dict."""
    data["health"] = health

    stats = data.get("stats_24h", {})
    total = stats.get("total", 0)
    succeeded = stats.get("succeeded", 0)
    avg_duration = stats.get("avg_duration_s", None)
    success_rate = round(succeeded / total, 4) if total else 0.0
    data["metrics_24h"] = {
        "cycles_total": total,
        "success_rate": success_rate,
        "avg_cycle_duration_s": avg_duration,
    }

    alerts: list = list(data.get("alerts", []))
    if health.get("ollama") == "unavailable":
        alerts.append("Ollama degraded – LLM features unavailable")
    if health.get("kb") == "degraded":
        alerts.append("Knowledge Base degraded")
    if health.get("jobs_db") == "error":
        alerts.append("Jobs DB error – task queue unavailable")
    data["alerts"] = alerts

    return data


# ── Mode status builder (extracted from router) ─────────────


def build_mode_status(agent, mode: str) -> dict:
    """Build comprehensive mode status response."""
    from app.services.resident_agent import (
        MODE_ALLOWED_ACTIONS,
        ACTION_TIERS,
        ALLOWED_ACTIONS,
    )
    from app.services.mode_audit_service import get_mode_audit_service

    allowed = set(MODE_ALLOWED_ACTIONS.get(mode, set()))
    all_known = set(ALLOWED_ACTIONS)
    for tier_actions in ACTION_TIERS.values():
        all_known.update(tier_actions)
    blocked = sorted(all_known - allowed)

    suggestions_pending = 0
    try:
        raw = agent.get_suggestions(limit=50)
        for s in raw:
            executed_ids = set(s.get("executed_action_ids", []))
            for a in s.get("actions", []):
                if a.get("id") not in executed_ids:
                    suggestions_pending += 1
    except Exception:
        pass

    mode_descriptions = {
        "observer": "Agent pouze sleduje systém, nevolá LLM, nezpracovává tasky",
        "advisor": "Agent zpracovává tasky a generuje návrhy, ale neprovádí nic automaticky",
        "autonomous": "Agent jedná samostatně v rámci nastavených limitů a cooldownů",
    }

    audit_svc = get_mode_audit_service()

    return {
        "current_mode": mode,
        "allowed_actions": sorted(allowed),
        "blocked_actions": blocked,
        "action_tiers": {tier: list(acts) for tier, acts in ACTION_TIERS.items()},
        "mode_descriptions": mode_descriptions,
        "guardrail_status": agent.get_guardrail_status(),
        "mode_history": audit_svc.get_history(limit=10),
        "stats": {
            "blocked_actions_since_start": agent._blocked_actions_since_start,
            "suggestions_pending_approval": suggestions_pending,
        },
    }


# ── Task/Mission detail builders (extracted from router) ────


def build_task_detail(job, job_svc) -> dict:
    """Build task detail response dict from a resident_task job."""
    output = ""
    if job.meta and job.meta.get("result"):
        output = str(job.meta["result"])
    elif job.meta and job.meta.get("reflection"):
        r = job.meta["reflection"]
        points = r.get("points", [])
        if points:
            output = "\n".join(f"- {p}" for p in points)
            if r.get("recommendation"):
                output += f"\n\nDoporučení: {r['recommendation']}"

    chat_history = job.payload.get("chat_history", [])

    return {
        "id": job.id,
        "title": job.title,
        "description": job.input_summary,
        "status": job.status,
        "progress": job.progress,
        "output": output,
        "created_at": job.created_at,
        "started_at": job.started_at,
        "finished_at": job.finished_at,
        "last_error": job.last_error,
        "chat_history": chat_history,
        "mission_id": job.payload.get("mission_id"),
        "step_index": job.payload.get("step_index"),
    }


def build_mission_detail(job, job_svc) -> dict:
    """Build mission detail response dict from a resident_mission job."""
    plan = job.payload.get("plan", {})
    steps = plan.get("steps", [])

    enriched_steps = []
    for i, step in enumerate(steps):
        enriched = {
            "number": i + 1,
            "title": step.get("title", ""),
            "description": step.get("description", ""),
            "status": step.get("status", "pending"),
            "result_summary": step.get("result_summary", ""),
            "job_id": step.get("job_id"),
        }
        sub_job_id = step.get("job_id")
        if sub_job_id:
            sub_job = job_svc.get_job(sub_job_id)
            if sub_job:
                enriched["status"] = sub_job.status
                if sub_job.meta and sub_job.meta.get("result"):
                    enriched["result_summary"] = str(sub_job.meta["result"])[:500]
                elif sub_job.last_error:
                    enriched["result_summary"] = f"Chyba: {sub_job.last_error}"
        enriched_steps.append(enriched)

    output = plan.get("output", "")
    if not output and job.meta and job.meta.get("reflection"):
        reflection = job.meta["reflection"]
        points = reflection.get("points", [])
        if points:
            output = "## Reflexe mise\n\n" + "\n".join(f"- {p}" for p in points)
            if reflection.get("recommendation"):
                output += f"\n\n**Doporučení:** {reflection['recommendation']}"

    chat_history = job.payload.get("chat_history", [])

    return {
        "id": job.id,
        "goal": plan.get("goal", job.title),
        "status": plan.get("status", job.status),
        "steps": enriched_steps,
        "current_step": plan.get("current_step", 0),
        "total_steps": len(steps),
        "progress": job.progress,
        "output": output,
        "created_at": job.created_at,
        "started_at": job.started_at,
        "finished_at": job.finished_at,
        "chat_history": chat_history,
    }


# ── Thought log builder (extracted from router) ─────────────


async def build_thought_log(limit: int = 50) -> dict:
    """Return recent thought/decision memory entries for debugging."""
    from app.services.memory_service import get_memory_service

    mem = get_memory_service()
    entries = []
    for category in ("thought", "decision"):
        try:
            results = await mem.search_memories(
                query=category,
                tags=["resident", category],
                limit=limit,
            )
            entries.extend(results)
        except Exception:
            pass

    seen_ids: set = set()
    unique: list = []
    for entry in entries:
        eid = entry.get("id", id(entry))
        if eid not in seen_ids:
            seen_ids.add(eid)
            unique.append(entry)

    unique.sort(key=lambda e: e.get("timestamp", e.get("created_at", "")), reverse=True)
    unique = unique[:limit]

    return {
        "thoughts": [
            {
                "id": e.get("id", ""),
                "timestamp": e.get("timestamp", e.get("created_at", "")),
                "category": next(
                    (
                        t
                        for t in e.get("tags", [])
                        if t in ("thought", "decision", "observation")
                    ),
                    "thought",
                ),
                "content": str(e.get("text", e.get("content", "")))[:300],
                "importance": e.get("importance", 0),
            }
            for e in unique
        ],
        "count": len(unique),
    }


# ── Debug export builder (extracted from router) ────────────


def build_debug_snapshot(agent, job_svc, settings: dict) -> dict:
    """Build a debug export snapshot."""
    from datetime import datetime

    try:
        dashboard = agent.get_dashboard_data()
    except Exception:
        dashboard = {}

    try:
        jobs = job_svc.list_jobs(limit=10)
        recent_jobs = [
            {
                "id": j.id,
                "title": j.title,
                "status": j.status,
                "type": j.type,
                "created_at": j.created_at,
            }
            for j in jobs
        ]
    except Exception:
        recent_jobs = []

    try:
        logs_data = agent.get_logs(limit=50)
    except Exception:
        logs_data = []

    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "resident_state": dashboard,
        "recent_jobs": recent_jobs,
        "logs": logs_data,
        "config_summary": {
            "resident_interval": settings.get("resident_interval", 900),
            "resident_mode": settings.get("resident_mode", "advisor"),
            "llm_provider": settings.get("llm", {}).get("provider", "unknown"),
        },
    }


# ── Mission templates ────────────────────────────────────────

MISSION_TEMPLATES = [
    {
        "id": "daily_recap",
        "title": "📋 Denní rekapitulace",
        "desc": "Analyzuj dnešní KB/git/jobs a vytvoř shrnutí + todo na zítřek",
        "icon": "📋",
    },
    {
        "id": "stack_health",
        "title": "🖥️ Stack monitor",
        "desc": "Zkontroluj Ollama/disk/jobs/Tailscale a připrav report + doporučení",
        "icon": "🖥️",
    },
    {
        "id": "lean_assist",
        "title": "⚙️ Lean experiment",
        "desc": "Z metrik navrhni Lean experiment (hypothesis + test + success metric)",
        "icon": "⚙️",
    },
]

TEMPLATE_PROMPTS: Dict[str, str] = {
    "daily_recap": "Analyzuj dnešní KB/git/jobs → shrnutí + todo zítra",
    "stack_health": "Check Ollama/disk/jobs/Tailscale → report + akce",
    "lean_assist": "Z metrik navrhni Lean experiment (hypothesis+test)",
}


# Singleton
_reasoner = ResidentReasoner()


def get_resident_reasoner() -> ResidentReasoner:
    return _reasoner
