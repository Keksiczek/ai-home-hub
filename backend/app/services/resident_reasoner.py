"""Resident Reasoner – the brain of the Resident Agent.

Collects system context (KB stats, job stats, Prometheus metrics),
builds a system prompt, calls LLM, and returns structured SuggestedActions.
"""
import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from app.models.resident_models import (
    MissionStep,
    ResidentReflection,
    ResidentSuggestion,
    SuggestedAction,
)
from app.services.llm_service import get_llm_service

logger = logging.getLogger(__name__)

# Whitelist of action types the reasoner may suggest
ALLOWED_ACTION_TYPES = frozenset(
    {"kb_maintenance", "job_cleanup", "health_check", "analysis", "other"}
)

# Action types that are always destructive → requires_confirmation must be True
DESTRUCTIVE_ACTION_TYPES = frozenset({"kb_maintenance", "job_cleanup"})


class ResidentReasoner:
    """Generates structured action suggestions by calling LLM with system context."""

    async def generate_suggestions(self, mode: str) -> Optional[ResidentSuggestion]:
        """Collect context, call LLM, return a ResidentSuggestion or None."""
        if mode == "observer":
            return None

        context = await self._collect_context()
        context_summary = self._build_context_summary(context)

        user_message = (
            f"AKTUÁLNÍ STAV SYSTÉMU:\n{context_summary}\n\n"
            "Na základě stavu navrhni 1–5 užitečných akcí. Odpověz POUZE JSON polem."
        )

        try:
            llm = get_llm_service()
            reply, meta = await llm.generate(
                message=user_message,
                mode="resident_reasoner",
                profile="general",
            )

            if meta.get("status") == "llm_unavailable":
                logger.warning("Reasoner: LLM unavailable, skipping suggestions")
                return None

            actions = self._parse_suggestions(reply)
            if not actions:
                return None

            return ResidentSuggestion(
                mode=mode,
                actions=actions,
                context_summary=context_summary[:500],
            )
        except Exception as exc:
            logger.error("Reasoner suggestion generation failed: %s", exc)
            return None

    async def plan_mission(self, goal: str, context: str = "") -> Optional[List[MissionStep]]:
        """Call LLM to break a goal into mission steps."""
        user_message = f"CÍL MISE: {goal}"
        if context:
            user_message += f"\nKONTEXT: {context}"
        user_message += "\n\nRozlož cíl na konkrétní kroky. Odpověz POUZE JSON objektem."

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
            ctx["failed_jobs_24h"] = job_svc.count_jobs(status="failed", since=since_24h)
        except Exception as exc:
            logger.debug("Context: job stats failed: %s", exc)

        # KB stats
        try:
            from app.services.vector_store_service import get_vector_store_service
            vs = get_vector_store_service()
            ctx["kb_stats"] = vs.get_stats()
        except Exception as exc:
            logger.debug("Context: KB stats failed: %s", exc)

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

        return ctx

    def _build_context_summary(self, ctx: Dict[str, Any]) -> str:
        """Build a human-readable context summary for the LLM prompt."""
        lines = []

        job_stats = ctx.get("job_stats_24h", {})
        lines.append(
            f"Joby (24h): celkem={job_stats.get('tasks_total', 0)}, "
            f"úspěšnost={job_stats.get('success_rate', 0):.0%}, "
            f"prům. doba={job_stats.get('avg_task_duration_s', 0):.1f}s"
        )
        lines.append(f"Ve frontě: {ctx.get('queued_jobs', 0)} jobů")
        lines.append(f"Selhalo (24h): {ctx.get('failed_jobs_24h', 0)} jobů")

        kb = ctx.get("kb_stats", {})
        lines.append(f"KB: {kb.get('total_chunks', 0)} chunků, {kb.get('total_collections', 0)} kolekcí")

        res = ctx.get("resources", {})
        lines.append(
            f"Systém: RAM {res.get('ram_percent', '?')}%, "
            f"CPU {res.get('cpu_percent', '?')}%, "
            f"throttled={res.get('throttled', False)}, blocked={res.get('blocked', False)}"
        )

        return "\n".join(lines)

    # ── Parsing ─────────────────────────────────────────────────

    def _parse_suggestions(self, reply: str) -> List[SuggestedAction]:
        """Parse LLM reply into a list of SuggestedAction, with safety filtering."""
        data = self._extract_json(reply)

        # Expect a list
        items = data if isinstance(data, list) else data.get("actions", []) if isinstance(data, dict) else []

        actions = []
        for item in items[:5]:  # max 5
            if not isinstance(item, dict):
                continue

            action_type = item.get("action_type", "other")
            if action_type not in ALLOWED_ACTION_TYPES:
                logger.warning("Reasoner: filtered out disallowed action_type=%s", action_type)
                continue

            # Enforce requires_confirmation for destructive types
            if action_type in DESTRUCTIVE_ACTION_TYPES:
                item["requires_confirmation"] = True

            try:
                actions.append(SuggestedAction(
                    id=str(item.get("id", ""))[:8] or None,
                    title=str(item.get("title", "Bez názvu"))[:100],
                    description=str(item.get("description", ""))[:300],
                    action_type=action_type,
                    priority=item.get("priority", "low") if item.get("priority") in ("low", "medium", "high") else "low",
                    requires_confirmation=bool(item.get("requires_confirmation", True)),
                    estimated_cost=str(item.get("estimated_cost", ""))[:200],
                    steps=[str(s)[:200] for s in item.get("steps", [])[:10]],
                ))
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
            steps.append(MissionStep(
                title=str(s.get("title", "Krok"))[:100],
                description=str(s.get("description", ""))[:300],
            ))

        return steps if steps else None

    def _parse_reflection(self, reply: str, job_id: str, job_type: str) -> Optional[ResidentReflection]:
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
                return json.loads(reply[s:e + 1])

        raise ValueError("No valid JSON found in response")


# Singleton
_reasoner = ResidentReasoner()


def get_resident_reasoner() -> ResidentReasoner:
    return _reasoner
