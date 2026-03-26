"""Resident Reasoner – the brain of the Resident Agent.

Collects system context (KB stats, job stats, Prometheus metrics),
builds a system prompt, calls LLM, and returns structured SuggestedActions.

Phase 2 addition: tool-augmented reasoning via ``reason_with_tools()``.
"""

import json
import logging
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

# Whitelist of action types the reasoner may suggest
ALLOWED_ACTION_TYPES = frozenset(
    {"kb_maintenance", "job_cleanup", "health_check", "analysis", "other"}
)

# Action types that are always destructive → requires_confirmation must be True
DESTRUCTIVE_ACTION_TYPES = frozenset({"kb_maintenance", "job_cleanup"})

# Actions the reasoner can suggest for direct dispatch
REASONER_ALLOWED_ACTIONS = frozenset({
    "system_health", "git_status", "lean_metrics", "kb_search",
    "write_memory", "memory_store", "memory_search", "create_mission",
    "system_status", "no_op", "web_search", "send_notification",
})

# Safe actions that never require confirmation
REASONER_SAFE_ACTIONS = frozenset({
    "system_health", "git_status", "lean_metrics", "kb_search",
    "memory_search", "system_status", "no_op", "write_memory",
})

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
            "{curiosity_summary}", curiosity_summary,
        )

        user_message = (
            f"STAV:\n{context_summary[:500]}\n\n"
            "Navrhni 1–3 akce. Odpověz POUZE JSON polem."
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

            actions = self._parse_suggestions(reply)
            if not actions:
                logger.warning("Reasoner: no valid actions parsed, using fallback")
                return self._fallback_suggestion(mode, context_summary)

            return ResidentSuggestion(
                mode=mode,
                actions=actions,
                context_summary=context_summary[:500],
            )
        except Exception as exc:
            logger.error("Reasoner suggestion generation failed: %s, using fallback", exc)
            return self._fallback_suggestion(mode, context_summary[:500])

    def _fallback_suggestion(self, mode: str, context_summary: str = "") -> ResidentSuggestion:
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
                        "params": s.get("params", {}) if isinstance(s.get("params"), dict) else {},
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
        lines.append(
            f"KB: {kb.get('total_chunks', 0)} chunků"
        )

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

        kind_icon = {"question": "🔍", "idea": "💡", "anomaly": "⚡", "hypothesis": "🤔"}
        parts = []
        for ci in curiosity_items[:3]:
            icon = kind_icon.get(ci.get("kind", ""), "🔍")
            parts.append(
                f"- {icon} [{ci.get('priority', 'medium')}] {ci.get('title', '?')}"
            )
        return "\n".join(parts)

    # ── Parsing ─────────────────────────────────────────────────

    def _parse_suggestions(self, reply: str) -> List[SuggestedAction]:
        """Parse LLM reply into a list of SuggestedAction, with safety filtering.

        Supports both old format (action_type) and new format (action + params + thought).
        """
        try:
            data = self._extract_json(reply)
        except (ValueError, json.JSONDecodeError):
            logger.warning("Reasoner: failed to parse JSON from reply")
            return []

        # Expect a list
        items = (
            data
            if isinstance(data, list)
            else data.get("actions", []) if isinstance(data, dict) else []
        )

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
                    action_type = "kb_maintenance" if "maintenance" in direct_action else "analysis"
                elif direct_action in ("git_status",):
                    action_type = "analysis"
                elif direct_action in ("write_memory", "memory_store"):
                    action_type = "other"
                elif direct_action == "create_mission":
                    action_type = "other"

            if action_type not in ALLOWED_ACTION_TYPES:
                action_type = "other"

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
                        params=item.get("params", {}) if isinstance(item.get("params"), dict) else {},
                    )
                )
            except Exception as exc:
                logger.debug("Reasoner: skipped malformed suggestion: %s", exc)

        return actions

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

        suggestions = self._parse_suggestions(final_reply) if final_reply else []

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


# Singleton
_reasoner = ResidentReasoner()


def get_resident_reasoner() -> ResidentReasoner:
    return _reasoner
