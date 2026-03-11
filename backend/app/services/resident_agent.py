"""
Resident Agent – dlouho běžící daemon agent který žije v Macu.

Má vlastní async loop, čte úkoly z fronty, provádí periodické checks.
LLM dostane vždy jen: system_summary + allowed_actions + posledních 5 kroků.
LLM vrací POUZE JSON payload – exekuci dělá vždy deterministický Python kód.
"""

import asyncio
import json
import logging
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional

logger = logging.getLogger(__name__)

# WS event types (imported locally to avoid circular imports)
WS_EVENT_RESIDENT_TICK = "resident_tick"
WS_EVENT_RESIDENT_ACTION = "resident_action"

ALLOWED_ACTIONS = [
    "read_file",
    "list_directory",
    "git_status",
    "git_log",
    "kb_search",
    "memory_store",
    "memory_search",
    "send_notification",
    "system_status",
    "spawn_specialist",
    "no_op",
]


@dataclass
class ResidentAgentState:
    is_running: bool = False
    current_task: Optional[str] = None
    last_tick: Optional[str] = None
    last_action: Optional[str] = None
    tick_count: int = 0
    errors_since_start: int = 0
    recent_steps: list[dict] = field(default_factory=list)  # max 5 položek
    status: str = "idle"  # idle | thinking | executing | error

    def to_dict(self) -> dict:
        return asdict(self)


class ResidentAgent:
    def __init__(self) -> None:
        self._state = ResidentAgentState()
        self._task: Optional[asyncio.Task] = None
        self._broadcast_fn: Optional[Callable] = None

    def set_broadcast(self, fn: Callable) -> None:
        """Register a coroutine for broadcasting WebSocket messages."""
        self._broadcast_fn = fn

    async def _broadcast(self, message: dict) -> None:
        if self._broadcast_fn:
            try:
                await self._broadcast_fn(message)
            except Exception as exc:
                logger.debug("Resident agent broadcast failed: %s", exc)

    def get_state(self) -> dict:
        return self._state.to_dict()

    async def start(self) -> dict:
        """Spustí async loop jako asyncio.Task, uloží do memory_service záznam o startu."""
        if self._state.is_running:
            return {"status": "already_running"}

        self._state.is_running = True
        self._state.status = "idle"
        self._state.tick_count = 0
        self._state.errors_since_start = 0
        self._state.recent_steps = []
        self._task = asyncio.create_task(self._loop())

        # Ulož záznam o startu do memory
        try:
            from app.services.memory_service import get_memory_service
            mem = get_memory_service()
            await mem.add_memory(
                text="Resident agent started",
                tags=["resident", "lifecycle"],
                source="resident_agent",
                importance=3,
            )
        except Exception as exc:
            logger.debug("Failed to store resident agent start in memory: %s", exc)

        logger.info("Resident agent started")
        return {"status": "started"}

    async def stop(self) -> dict:
        """Graceful shutdown, uloží stav do memory."""
        if not self._state.is_running:
            return {"status": "not_running"}

        self._state.is_running = False
        self._state.status = "idle"

        if self._task and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

        # Ulož stav do memory
        try:
            from app.services.memory_service import get_memory_service
            mem = get_memory_service()
            await mem.add_memory(
                text=f"Resident agent stopped after {self._state.tick_count} ticks, "
                     f"{self._state.errors_since_start} errors",
                tags=["resident", "lifecycle"],
                source="resident_agent",
                importance=3,
            )
        except Exception as exc:
            logger.debug("Failed to store resident agent stop in memory: %s", exc)

        logger.info("Resident agent stopped after %d ticks", self._state.tick_count)
        return {"status": "stopped", "ticks": self._state.tick_count}

    async def _loop(self) -> None:
        """Hlavní smyčka resident agenta."""
        try:
            while self._state.is_running:
                self._state.tick_count += 1
                self._state.last_tick = _now()

                try:
                    await self._process_task_queue()
                    await self._periodic_check()
                except Exception as exc:
                    self._state.errors_since_start += 1
                    self._state.status = "error"
                    logger.error("Resident agent tick error: %s", exc)

                await self._broadcast({
                    "type": WS_EVENT_RESIDENT_TICK,
                    "tick": self._state.tick_count,
                    "status": self._state.status,
                    "last_tick": self._state.last_tick,
                })

                await asyncio.sleep(30)
        except asyncio.CancelledError:
            logger.info("Resident agent loop cancelled")

    async def _process_task_queue(self) -> None:
        """Načte pending tasky z job_service kde job_type == 'resident_task'."""
        try:
            from app.services.job_service import get_job_service
            job_svc = get_job_service()
            pending_jobs = job_svc.list_jobs(status="queued", type="resident_task")

            for job in pending_jobs:
                self._state.current_task = job.title
                self._state.status = "thinking"

                task = {
                    "job_id": job.id,
                    "goal": job.title,
                    "description": job.input_summary,
                    **job.payload,
                }

                # Mark job as running
                job.status = "running"
                job.started_at = _now()
                job_svc.update_job(job)

                try:
                    result = await self._execute_with_llm(task)
                    job.status = "succeeded"
                    job.progress = 100.0
                    job.finished_at = _now()
                    job.meta["result"] = str(result)[:500]
                except Exception as exc:
                    job.status = "failed"
                    job.last_error = str(exc)
                    job.finished_at = _now()
                    self._state.errors_since_start += 1
                    logger.error("Resident task %s failed: %s", job.id, exc)
                finally:
                    job_svc.update_job(job)

                self._state.current_task = None
                self._state.status = "idle"

        except Exception as exc:
            logger.error("Resident task queue processing error: %s", exc)

    async def _periodic_check(self) -> None:
        """Každých 5 minut (tick_count % 10 == 0) provede system check."""
        if self._state.tick_count % 10 != 0:
            return

        try:
            from app.services.resource_monitor import get_resource_monitor
            monitor = get_resource_monitor()
            snapshot = monitor.to_dict()

            # Check git status pro nakonfigurované projekty
            git_statuses = {}
            try:
                from app.services.settings_service import get_settings_service
                settings = get_settings_service().load()
                projects = settings.get("integrations", {}).get("vscode", {}).get("projects", {})

                if projects:
                    from app.services.git_service import GitService
                    git_svc = GitService()
                    for name, project in projects.items():
                        path = project if isinstance(project, str) else project.get("path", "")
                        if path:
                            try:
                                status = await git_svc.status(path)
                                git_statuses[name] = status
                            except Exception:
                                git_statuses[name] = {"error": "failed to get status"}
            except Exception as exc:
                logger.debug("Resident periodic git check failed: %s", exc)

            # Pokud resource_monitor.is_throttled() → uloží warning do memory
            if monitor.is_throttled():
                try:
                    from app.services.memory_service import get_memory_service
                    mem = get_memory_service()
                    await mem.add_memory(
                        text=f"System resource warning: RAM {snapshot.get('ram_used_percent', '?')}%, "
                             f"CPU {snapshot.get('cpu_percent', '?')}%",
                        tags=["resident", "resource_warning"],
                        source="resident_agent",
                        importance=7,
                    )
                except Exception as exc:
                    logger.debug("Failed to store resource warning: %s", exc)

            # Ulož výsledek do memory jako entry typu "system_check"
            try:
                from app.services.memory_service import get_memory_service
                mem = get_memory_service()
                check_summary = (
                    f"System check: RAM {snapshot.get('ram_used_percent', '?')}%, "
                    f"CPU {snapshot.get('cpu_percent', '?')}%, "
                    f"projects checked: {len(git_statuses)}"
                )
                await mem.add_memory(
                    text=check_summary,
                    tags=["resident", "system_check"],
                    source="resident_agent",
                    importance=2,
                )
            except Exception as exc:
                logger.debug("Failed to store system check: %s", exc)

            logger.info("Resident periodic check completed (tick %d)", self._state.tick_count)

        except Exception as exc:
            logger.error("Resident periodic check error: %s", exc)

    async def _execute_with_llm(self, task: dict) -> dict:
        """
        Jádro resident agenta – sestaví kontext, zavolá LLM, parsuje JSON, exekuuje akci.
        """
        self._state.status = "thinking"

        # 1. Sestav system_summary (max 300 tokenů)
        from app.services.resource_monitor import get_resource_monitor
        monitor = get_resource_monitor()
        resource_snapshot = monitor.to_dict()

        system_summary = (
            f"System: RAM {resource_snapshot.get('ram_used_percent', '?')}%, "
            f"CPU {resource_snapshot.get('cpu_percent', '?')}%, "
            f"throttled: {resource_snapshot.get('throttle', False)}, "
            f"blocked: {resource_snapshot.get('block', False)}. "
            f"Tick #{self._state.tick_count}."
        )

        if self._state.recent_steps:
            steps_text = "\n".join(
                f"- [{s.get('action', '?')}] {s.get('reasoning', '')[:80]}"
                for s in self._state.recent_steps[-5:]
            )
            system_summary += f"\n\nPoslední kroky:\n{steps_text}"

        # 2. Sestav allowed_actions list
        allowed_actions_text = "Povolené akce: " + ", ".join(ALLOWED_ACTIONS)

        # 3. Zavolej LLM
        from app.services.llm_service import get_llm_service
        from app.services.settings_service import get_settings_service

        llm_svc = get_llm_service()
        system_prompt = get_settings_service().get_system_prompt("resident")

        user_message = (
            f"{system_summary}\n\n"
            f"{allowed_actions_text}\n\n"
            f"Úkol: {task.get('goal', 'unknown')}\n"
            f"Popis: {task.get('description', 'žádný')}"
        )

        reply, meta = await llm_svc.generate(
            message=user_message,
            mode="resident",
            profile="general",
        )

        # 4. Parsuj JSON response
        try:
            # Try to extract JSON from response
            payload = self._parse_json_response(reply)
        except (json.JSONDecodeError, ValueError) as exc:
            logger.error("Resident agent LLM returned invalid JSON: %s", exc)
            # Ulož do memory jako failed
            try:
                from app.services.memory_service import get_memory_service
                mem = get_memory_service()
                await mem.add_memory(
                    text=f"Resident agent LLM invalid JSON response for task: {task.get('goal', '?')}",
                    tags=["resident", "error", "invalid_json"],
                    source="resident_agent",
                    importance=5,
                )
            except Exception:
                pass
            return {"error": "invalid_json", "raw_reply": reply[:200]}

        # 5. Check risk_level
        if payload.get("risk_level") == "high":
            logger.warning("Resident agent blocked high-risk action: %s", payload.get("action"))
            try:
                from app.services.memory_service import get_memory_service
                mem = get_memory_service()
                await mem.add_memory(
                    text=f"Blocked high-risk action: {payload.get('action')} - {payload.get('reasoning_summary', '')}",
                    tags=["resident", "blocked_high_risk"],
                    source="resident_agent",
                    importance=8,
                )
            except Exception:
                pass
            return {"blocked": True, "reason": "high_risk", "action": payload.get("action")}

        # 6. Exekuuj akci deterministicky
        self._state.status = "executing"
        result = await self._dispatch_action(payload)

        # 7. Výsledek přidej do recent_steps (max 5)
        step_record = {
            "tick": self._state.tick_count,
            "timestamp": _now(),
            "action": payload.get("action", "unknown"),
            "reasoning": payload.get("reasoning_summary", ""),
            "result_summary": str(result)[:200],
            "priority": payload.get("priority", "low"),
        }
        self._state.recent_steps.append(step_record)
        if len(self._state.recent_steps) > 5:
            self._state.recent_steps = self._state.recent_steps[-5:]

        self._state.last_action = payload.get("action")

        # Broadcast action
        await self._broadcast({
            "type": WS_EVENT_RESIDENT_ACTION,
            "action": payload.get("action"),
            "reasoning": payload.get("reasoning_summary", ""),
            "result_preview": str(result)[:200],
        })

        # 8. Ulož do memory_service jako entry
        try:
            from app.services.memory_service import get_memory_service
            mem = get_memory_service()
            await mem.add_memory(
                text=f"Resident action: {payload.get('action')} - {payload.get('reasoning_summary', '')} | Result: {str(result)[:300]}",
                tags=["resident", "action", payload.get("action", "unknown")],
                source="resident_agent",
                importance=3,
            )
        except Exception as exc:
            logger.debug("Failed to store resident action in memory: %s", exc)

        return result

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
            return json.loads(reply[brace_start:brace_end + 1])

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
        action = payload.get("action", "")
        params = payload.get("params", {})

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
            log = await git_svc.log(params.get("repo_path", ""), limit=params.get("limit", 5))
            return {"action": "git_log", "log": log}

        elif action == "kb_search":
            from app.services.vector_store_service import get_vector_store_service
            from app.services.embeddings_service import get_embeddings_service
            vs = get_vector_store_service()
            emb_svc = get_embeddings_service()
            query = params.get("query", "")
            embedding = await emb_svc.generate_embedding(query)
            if not embedding:
                return {"action": "kb_search", "results": [], "error": "embedding_failed"}
            results = vs.search(query_embedding=embedding, top_k=params.get("top_k", 5))
            # Format results
            formatted = []
            for doc, meta in zip(results.get("documents", []), results.get("metadatas", [])):
                formatted.append({
                    "text": doc[:300],
                    "file_name": meta.get("file_name", ""),
                })
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
            records = await mem.search_memory(params.get("query", ""), top_k=params.get("top_k", 5))
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
            logger.info("Resident agent no_op: %s", payload.get("reasoning_summary", ""))
            return {"action": "no_op", "reasoning": payload.get("reasoning_summary", "")}

        else:
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
            return {"error": "agent_type_not_allowed", "agent_type": agent_type,
                    "allowed": ["code", "research"]}

        goal = params.get("goal", "unknown")
        task: Dict[str, Any] = {"goal": goal}

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


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# Singleton
_resident_agent = ResidentAgent()


def get_resident_agent() -> ResidentAgent:
    return _resident_agent
