"""Resident Agent – all tool definitions, tool registry, and action dispatch."""

from __future__ import annotations

import json
import logging
from typing import Any, Dict

import structlog

logger = logging.getLogger(__name__)
log = structlog.get_logger("resident_agent")


class ToolsMixin:
    """Mixin providing tool definitions and action dispatch for ResidentAgent."""

    def _parse_json_response(self, reply: str) -> dict:
        """Try to parse JSON from LLM response, handling common formats."""
        reply = reply.strip()

        # Try direct parse
        try:
            return json.loads(reply)
        except json.JSONDecodeError:
            pass

        # Try to find JSON block in markdown code fence
        if "```json" in reply:
            start = reply.index("```json") + 7
            end = reply.index("```", start)
            return json.loads(reply[start:end].strip())

        if "```" in reply:
            start = reply.index("```") + 3
            end = reply.index("```", start)
            return json.loads(reply[start:end].strip())

        # Try to find JSON object in the text
        brace_start = reply.find("{")
        brace_end = reply.rfind("}")
        if brace_start != -1 and brace_end != -1:
            return json.loads(reply[brace_start : brace_end + 1])

        raise ValueError("No valid JSON found in response")

    async def _dispatch_action(self, payload: dict) -> dict:
        """
        Deterministický dispatcher – exekuuje akce na základě LLM payloadu.

        payload struktura:
        {
            "reasoning_summary": "...",
            "action": "action_name",
            "params": {...},
            "priority": "low|medium|high",
            "risk_level": "safe|medium|high"
        }
        """
        from app.core.settings import ActionBlockedError
        from .core import ALLOWED_ACTIONS, MODE_ALLOWED_ACTIONS

        action = payload.get("action", "")
        params = payload.get("params", {})
        mode = self._get_resident_mode()

        # ── Consistent guardrail check (covers mode gate + cooldown + daily budget) ──
        try:
            self.check_action_allowed(action)
        except ActionBlockedError as exc:
            self._blocked_actions_since_start += 1
            self._add_log(
                "INFO",
                "action_blocked",
                action=action,
                mode=mode,
                reason=str(exc),
            )
            return {"action": action, "blocked": True, "reason": str(exc), "mode": mode}

        # ── Additional mode-based routing ─────────────────────────
        # (check_action_allowed already blocks by tier, but we also keep the
        #  explicit MODE_ALLOWED_ACTIONS set check for actions not in ACTION_TIERS)
        allowed_for_mode = MODE_ALLOWED_ACTIONS.get(
            mode, MODE_ALLOWED_ACTIONS["advisor"]
        )
        if action not in allowed_for_mode and action not in ALLOWED_ACTIONS:
            self._blocked_actions_since_start += 1
            log.warning("Action not allowed for mode", action=action, mode=mode)
            return {
                "error": "action_not_allowed_for_mode",
                "action": action,
                "mode": mode,
            }

        # ── Log dangerous actions before execution (autonomous mode) ──────────
        if mode == "autonomous" and self._get_action_tier(action) == "dangerous":
            self._add_log(
                "WARN",
                "dangerous_action_pre_dispatch",
                action=action,
                params=str(params)[:200],
                mode=mode,
            )

        if action == "read_file":
            from app.services.filesystem_service import get_filesystem_service

            fs = get_filesystem_service()
            content = await fs.read_file(params.get("path", ""))
            return {"action": "read_file", "content": content[:2000]}

        elif action == "list_directory":
            from app.services.filesystem_service import get_filesystem_service

            fs = get_filesystem_service()
            entries = await fs.list_directory(params.get("path", ""))
            return {"action": "list_directory", "entries": entries}

        elif action == "git_status":
            from app.services.git_service import GitService

            git_svc = GitService()
            status = await git_svc.status(params.get("repo_path", ""))
            return {"action": "git_status", "status": status}

        elif action == "git_log":
            from app.services.git_service import GitService

            git_svc = GitService()
            log = await git_svc.log(
                params.get("repo_path", ""), limit=params.get("limit", 5)
            )
            return {"action": "git_log", "log": log}

        elif action == "kb_search":
            from app.services.vector_store_service import get_vector_store_service
            from app.services.embeddings_service import get_embeddings_service

            vs = get_vector_store_service()
            emb_svc = get_embeddings_service()
            query = params.get("query", "")
            embedding = await emb_svc.generate_embedding(query)
            if not embedding:
                return {
                    "action": "kb_search",
                    "results": [],
                    "error": "embedding_failed",
                }
            results = vs.search(query_embedding=embedding, top_k=params.get("top_k", 5))
            # Format results
            formatted = []
            for doc, meta in zip(
                results.get("documents", []), results.get("metadatas", [])
            ):
                formatted.append(
                    {
                        "text": doc[:300],
                        "file_name": meta.get("file_name", ""),
                    }
                )
            return {"action": "kb_search", "results": formatted}

        elif action == "memory_store":
            from app.services.memory_service import get_memory_service

            mem = get_memory_service()
            memory_id = await mem.add_memory(
                text=params.get("content", ""),
                tags=["resident", params.get("category", "general")],
                source="resident_agent",
                importance=params.get("importance", 5),
            )
            return {"action": "memory_store", "memory_id": memory_id}

        elif action == "memory_search":
            from app.services.memory_service import get_memory_service

            mem = get_memory_service()
            records = await mem.search_memory(
                params.get("query", ""), top_k=params.get("top_k", 5)
            )
            return {
                "action": "memory_search",
                "results": [r.to_dict() for r in records],
            }

        elif action == "send_notification":
            from app.services.notification_service import get_notification_service

            notif = get_notification_service()
            success = await notif.send(
                title="Resident Agent",
                message=params.get("message", ""),
            )
            return {"action": "send_notification", "sent": success}

        elif action == "system_status":
            from app.services.resource_monitor import get_resource_monitor

            monitor = get_resource_monitor()
            return {"action": "system_status", **monitor.to_dict()}

        elif action == "spawn_specialist":
            return await self._dispatch_spawn_specialist(params)

        elif action == "no_op":
            logger.info(
                "Resident agent no_op: %s", payload.get("reasoning_summary", "")
            )
            return {
                "action": "no_op",
                "reasoning": payload.get("reasoning_summary", ""),
            }

        elif action == "web_search":
            try:
                from app.services.skills_runtime_service import WebSearchSkill

                skill = WebSearchSkill()
                query = params.get("query", payload.get("goal", ""))
                max_results = params.get("max_results", 5)
                results = await skill.run(query=query, max_results=max_results)
                return {"action": "web_search", "query": query, "results": results}
            except Exception as exc:
                logger.error("web_search skill failed: %s", exc)
                return {"action": "web_search", "error": str(exc), "results": []}

        else:
            # Dynamic skill dispatch fallback
            try:
                from app.services.skills_runtime_service import SKILL_REGISTRY

                if action in SKILL_REGISTRY:
                    skill_cls = SKILL_REGISTRY[action]
                    skill_instance = skill_cls()
                    result = await skill_instance.run(**params)
                    return {"action": action, "result": result}
            except Exception as exc:
                logger.debug("Dynamic skill dispatch failed for %s: %s", action, exc)

            logger.warning("Resident agent action_not_allowed: %s", action)
            return {"error": "action_not_allowed", "action": action}

    async def _dispatch_spawn_specialist(self, params: dict) -> dict:
        """
        Spawne specializovaný agent přes agent_orchestrator.

        params:
        {
            "agent_type": "code|research",
            "goal": "...",
            "context_memory_query": "..."  # optional
        }
        """
        agent_type = params.get("agent_type", "")

        # Ověř že agent_type je "code" nebo "research"
        if agent_type not in ("code", "research"):
            return {
                "error": "agent_type_not_allowed",
                "agent_type": agent_type,
                "allowed": ["code", "research"],
            }

        goal = params.get("goal", "unknown")
        task: Dict[str, Any] = {"goal": goal}

        # Load relevant skill context for the agent type
        try:
            from app.services.skills_service import get_skills_service

            skills_svc = get_skills_service()
            all_skills = skills_svc.list()
            # Map agent_type to relevant skill tags
            tag_map = {
                "code": ["code", "quality"],
                "research": ["analytics", "lean", "process"],
            }
            relevant_tags = set(tag_map.get(agent_type, []))
            for skill in all_skills:
                skill_tags = set(skill.get("tags", []))
                if skill_tags & relevant_tags and skill.get("system_prompt_addition"):
                    task.setdefault("skill_context", "")
                    task[
                        "skill_context"
                    ] += f"\n{skill['name']}: {skill['system_prompt_addition'][:300]}"
        except Exception as exc:
            logger.debug("Failed to load skill for specialist: %s", exc)

        # Pokud context_memory_query existuje → přidej memory kontext
        context_query = params.get("context_memory_query")
        if context_query:
            try:
                from app.services.memory_service import get_memory_service

                mem = get_memory_service()
                history = await mem.search_memory(context_query, top_k=5)
                if history:
                    task["memory_context"] = [r.to_dict() for r in history]
            except Exception as exc:
                logger.debug("Memory context search failed: %s", exc)

        # Spawne agent přes orchestrator
        from app.services.agent_orchestrator import get_agent_orchestrator

        orchestrator = get_agent_orchestrator()
        agent_id = await orchestrator.spawn_agent(
            agent_type=agent_type,
            task=task,
            depth=1,
            parent_agent_id="resident",
        )

        # Ulož do memory
        try:
            from app.services.memory_service import get_memory_service

            mem = get_memory_service()
            await mem.add_memory(
                text=f"Resident spawned {agent_type} agent: {goal}",
                tags=["resident", "agent_handoff"],
                source="resident_agent",
                importance=5,
            )
        except Exception as exc:
            logger.debug("Failed to store agent handoff in memory: %s", exc)

        return {"spawned_agent_id": agent_id, "agent_type": agent_type, "goal": goal}
