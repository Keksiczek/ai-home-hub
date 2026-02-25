"""Agent orchestrator – multi-agent spawning, monitoring, and artifact generation."""
import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)

ARTIFACTS_DIR = Path(__file__).parent.parent.parent / "data" / "artifacts"

# Agent status values
AGENT_STATUS_PENDING = "pending"
AGENT_STATUS_RUNNING = "running"
AGENT_STATUS_COMPLETED = "completed"
AGENT_STATUS_FAILED = "failed"
AGENT_STATUS_INTERRUPTED = "interrupted"

# Valid agent types
AGENT_TYPES = {"code", "research", "testing", "devops", "general"}


class AgentRecord:
    def __init__(
        self,
        agent_id: str,
        agent_type: str,
        task: Dict[str, Any],
        workspace: Optional[str],
    ) -> None:
        self.agent_id = agent_id
        self.agent_type = agent_type
        self.task = task
        self.workspace = workspace
        self.status = AGENT_STATUS_PENDING
        self.progress = 0
        self.message: Optional[str] = None
        self.artifacts: List[str] = []
        self.created_at = _now()
        self.updated_at = _now()
        self._asyncio_task: Optional[asyncio.Task] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "agent_id": self.agent_id,
            "agent_type": self.agent_type,
            "task": self.task,
            "workspace": self.workspace,
            "status": self.status,
            "progress": self.progress,
            "message": self.message,
            "artifacts": self.artifacts,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }


class AgentOrchestrator:
    """
    Manages multiple concurrent agents with:
    - Spawning and monitoring
    - Progress tracking via WebSocket broadcast
    - Artifact generation and storage
    - Graceful interruption
    """

    def __init__(self) -> None:
        self._agents: Dict[str, AgentRecord] = {}
        self._settings = get_settings_service()
        self._broadcast_fn: Optional[Callable] = None
        ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

    def set_broadcast(self, fn: Callable) -> None:
        """Register a coroutine for broadcasting WebSocket messages."""
        self._broadcast_fn = fn

    async def _broadcast(self, agent: AgentRecord) -> None:
        if self._broadcast_fn:
            try:
                await self._broadcast_fn(
                    {"type": "agent_update", "agent": agent.to_dict()}
                )
            except Exception as exc:
                logger.debug("Agent broadcast failed: %s", exc)

    # ── Spawning ───────────────────────────────────────────────

    async def spawn_agent(
        self,
        agent_type: str,
        task: Dict[str, Any],
        workspace: Optional[str] = None,
    ) -> str:
        """Spawn a new agent. Returns agent_id."""
        cfg = self._settings.load().get("agents", {})
        max_concurrent = cfg.get("max_concurrent", 5)

        active_count = sum(
            1 for a in self._agents.values()
            if a.status in (AGENT_STATUS_PENDING, AGENT_STATUS_RUNNING)
        )
        if active_count >= max_concurrent:
            raise RuntimeError(
                f"Maximum concurrent agents ({max_concurrent}) reached. "
                "Interrupt or wait for existing agents to finish."
            )

        if agent_type not in AGENT_TYPES:
            agent_type = "general"

        agent_id = str(uuid.uuid4())[:8]
        record = AgentRecord(agent_id, agent_type, task, workspace)
        self._agents[agent_id] = record

        # Start agent coroutine
        timeout_min = cfg.get("timeout_minutes", 30)
        record._asyncio_task = asyncio.create_task(
            self._run_agent(record, timeout_min)
        )
        logger.info("Spawned agent %s (%s)", agent_id, agent_type)
        await self._broadcast(record)
        return agent_id

    async def _run_agent(self, record: AgentRecord, timeout_minutes: int) -> None:
        """Execute the agent's task lifecycle."""
        record.status = AGENT_STATUS_RUNNING
        record.message = "Agent started"
        record.updated_at = _now()
        await self._broadcast(record)

        try:
            async with asyncio.timeout(timeout_minutes * 60):
                await self._execute_agent_task(record)

            record.status = AGENT_STATUS_COMPLETED
            record.progress = 100
            record.message = "Agent completed successfully"
        except asyncio.CancelledError:
            record.status = AGENT_STATUS_INTERRUPTED
            record.message = "Agent was interrupted"
            logger.info("Agent %s interrupted", record.agent_id)
        except TimeoutError:
            record.status = AGENT_STATUS_FAILED
            record.message = f"Agent timed out after {timeout_minutes} minutes"
            logger.warning("Agent %s timed out", record.agent_id)
        except Exception as exc:
            record.status = AGENT_STATUS_FAILED
            record.message = f"Agent failed: {exc}"
            logger.error("Agent %s failed: %s", record.agent_id, exc)
        finally:
            record.updated_at = _now()
            await self._broadcast(record)

    async def _execute_agent_task(self, record: AgentRecord) -> None:
        """
        Simulate agent work phases with progress tracking.

        In a full implementation, each agent type would invoke the appropriate
        services (LLM, filesystem, git, etc.) based on the task definition.
        """
        goal = record.task.get("goal", "No goal specified")
        agent_type = record.agent_type

        phases = self._get_agent_phases(agent_type)

        for i, (phase_name, phase_pct) in enumerate(phases):
            record.progress = phase_pct
            record.message = f"[{agent_type.upper()}] {phase_name}"
            record.updated_at = _now()
            await self._broadcast(record)

            # Simulate work (in real impl, actual service calls happen here)
            await asyncio.sleep(0.5)

            # Generate artifact at 50% progress
            if phase_pct == 50:
                artifact_id = await self.generate_artifact(
                    record.agent_id,
                    "plan",
                    {
                        "goal": goal,
                        "agent_type": agent_type,
                        "phase": phase_name,
                        "content": self._generate_plan_content(goal, agent_type),
                    },
                )
                record.artifacts.append(artifact_id)

    def _get_agent_phases(self, agent_type: str) -> List[tuple]:
        """Return (phase_name, progress_pct) pairs for each agent type."""
        phases = {
            "code": [
                ("Analysing requirements", 10),
                ("Reading existing code", 25),
                ("Generating implementation plan", 50),
                ("Writing code", 70),
                ("Running tests", 85),
                ("Reviewing output", 95),
            ],
            "research": [
                ("Searching documentation", 15),
                ("Analysing sources", 35),
                ("Synthesising findings", 50),
                ("Generating report", 75),
                ("Finalising summary", 95),
            ],
            "testing": [
                ("Identifying test cases", 15),
                ("Writing test stubs", 35),
                ("Running existing tests", 50),
                ("Analysing coverage", 70),
                ("Generating test report", 90),
            ],
            "devops": [
                ("Checking repository state", 15),
                ("Validating CI configuration", 35),
                ("Running deployment checks", 50),
                ("Executing git operations", 70),
                ("Verifying deployment", 90),
            ],
            "general": [
                ("Analysing task", 20),
                ("Processing", 50),
                ("Generating output", 80),
                ("Finalising", 95),
            ],
        }
        return phases.get(agent_type, phases["general"])

    def _generate_plan_content(self, goal: str, agent_type: str) -> str:
        return (
            f"# {agent_type.title()} Agent Plan\n\n"
            f"**Goal:** {goal}\n\n"
            f"## Steps\n\n"
            f"- [ ] Analyse requirements\n"
            f"- [ ] Gather context\n"
            f"- [ ] Execute primary task\n"
            f"- [ ] Verify output\n"
            f"- [ ] Generate summary\n\n"
            f"*Generated by {agent_type} agent at {_now()}*"
        )

    # ── Artifact generation ────────────────────────────────────

    async def generate_artifact(
        self,
        agent_id: str,
        artifact_type: str,
        content: Any,
    ) -> str:
        """
        Generate and persist an artifact.
        artifact_type: plan | task_breakdown | test_results | screenshot | report
        Returns artifact_id.
        """
        artifact_id = str(uuid.uuid4())[:8]
        artifact = {
            "artifact_id": artifact_id,
            "agent_id": agent_id,
            "artifact_type": artifact_type,
            "content": content,
            "created_at": _now(),
        }
        artifact_path = ARTIFACTS_DIR / f"{artifact_id}.json"
        with open(artifact_path, "w", encoding="utf-8") as f:
            json.dump(artifact, f, indent=2, ensure_ascii=False)

        logger.info("Artifact %s (%s) created for agent %s", artifact_id, artifact_type, agent_id)
        return artifact_id

    def get_artifact(self, artifact_id: str) -> Optional[Dict[str, Any]]:
        """Load an artifact by ID."""
        path = ARTIFACTS_DIR / f"{artifact_id}.json"
        if not path.exists():
            return None
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    # ── Monitoring ─────────────────────────────────────────────

    def list_agents(self) -> List[Dict[str, Any]]:
        return [a.to_dict() for a in self._agents.values()]

    def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        record = self._agents.get(agent_id)
        return record.to_dict() if record else None

    def get_agent_artifacts(self, agent_id: str) -> List[Dict[str, Any]]:
        record = self._agents.get(agent_id)
        if not record:
            return []
        artifacts = []
        for artifact_id in record.artifacts:
            art = self.get_artifact(artifact_id)
            if art:
                artifacts.append(art)
        return artifacts

    # ── Control ────────────────────────────────────────────────

    async def interrupt_agent(self, agent_id: str) -> bool:
        """Gracefully stop an agent."""
        record = self._agents.get(agent_id)
        if record and record._asyncio_task and not record._asyncio_task.done():
            record._asyncio_task.cancel()
            try:
                await record._asyncio_task
            except asyncio.CancelledError:
                pass
            return True
        return False

    async def delete_agent(self, agent_id: str) -> bool:
        """Terminate and remove an agent."""
        await self.interrupt_agent(agent_id)
        if agent_id in self._agents:
            del self._agents[agent_id]
            return True
        return False

    def cleanup_finished(self) -> int:
        """Remove completed/failed agents. Returns count removed."""
        done = [
            aid for aid, a in self._agents.items()
            if a.status in (AGENT_STATUS_COMPLETED, AGENT_STATUS_FAILED, AGENT_STATUS_INTERRUPTED)
        ]
        for aid in done:
            del self._agents[aid]
        return len(done)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# Shared singleton
_orchestrator = AgentOrchestrator()


def get_agent_orchestrator() -> AgentOrchestrator:
    return _orchestrator
