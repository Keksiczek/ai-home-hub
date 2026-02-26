from typing import Any, Dict, List, Optional

from pydantic import BaseModel


# ── File upload ─────────────────────────────────────────────

class UploadResponse(BaseModel):
    id: str
    filename: str


# ── Chat ────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    mode: str = "general"
    context_file_ids: List[str] = []
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    meta: Dict[str, Any] = {}
    session_id: str


# ── OpenClaw ────────────────────────────────────────────────

class OpenClawActionRequest(BaseModel):
    action: str
    params: Dict[str, Any] = {}


class OpenClawActionResponse(BaseModel):
    status: str
    detail: Optional[str] = None
    data: Dict[str, Any] = {}


# ── Agents ──────────────────────────────────────────────────

class SpawnAgentRequest(BaseModel):
    agent_type: str  # code | research | testing | devops | general
    task: Dict[str, Any]
    workspace: Optional[str] = None
    skill_ids: List[str] = []


class AgentStatusResponse(BaseModel):
    agent_id: str
    agent_type: str
    status: str  # pending | running | completed | failed | interrupted
    progress: int = 0  # 0-100
    message: Optional[str] = None
    artifacts: List[str] = []
    created_at: str
    updated_at: str


class ArtifactResponse(BaseModel):
    artifact_id: str
    artifact_type: str  # plan | task_breakdown | test_results | screenshot
    content: Any
    created_at: str


# ── Tasks ───────────────────────────────────────────────────

class CreateTaskRequest(BaseModel):
    name: str
    task_type: str
    params: Dict[str, Any] = {}


class TaskStatusResponse(BaseModel):
    task_id: str
    name: str
    task_type: str
    status: str  # pending | running | completed | failed | cancelled
    progress: int = 0
    message: Optional[str] = None
    result: Optional[Any] = None
    created_at: str
    updated_at: str


# ── Settings ────────────────────────────────────────────────

class SettingsResponse(BaseModel):
    settings: Dict[str, Any]


class UpdateSettingsRequest(BaseModel):
    settings: Dict[str, Any]


# ── Integrations ─────────────────────────────────────────────

class MCPCallRequest(BaseModel):
    tool_name: str
    arguments: Dict[str, Any] = {}


class VSCodeOpenProjectRequest(BaseModel):
    project_key: str


class VSCodeOpenFileRequest(BaseModel):
    file_path: str
    line: Optional[int] = None


class VSCodeRunTaskRequest(BaseModel):
    project_key: str
    task_name: str


class GitOperationRequest(BaseModel):
    repo_path: str
    message: Optional[str] = None
    branch: Optional[str] = None


class MacOSActionRequest(BaseModel):
    action: str  # safari_open | mail_send | volume_set | sleep_display | finder_open | quit_app
    params: Dict[str, Any] = {}


class AntigravityAgentRequest(BaseModel):
    prompt: str
    workspace: Optional[str] = None


# ── Filesystem ──────────────────────────────────────────────

class WriteFileRequest(BaseModel):
    content: str
    encoding: str = "utf-8"


class SearchRequest(BaseModel):
    path: str
    pattern: str
    file_pattern: Optional[str] = None


# ── Quick Actions ────────────────────────────────────────────

class QuickActionStep(BaseModel):
    service: str  # vscode | git | safari | llm | macos | openclaw
    action: str
    params: Dict[str, Any] = {}


class QuickAction(BaseModel):
    id: str
    name: str
    icon: str = "⚡"
    steps: List[QuickActionStep] = []


class ExecuteActionRequest(BaseModel):
    action_id: str


# ── Sessions ─────────────────────────────────────────────────

class SessionListItem(BaseModel):
    session_id: str
    created_at: str
    message_count: int
    last_message: Optional[str] = None


# ── Notifications ────────────────────────────────────────────

class NotificationRequest(BaseModel):
    title: str
    message: str
    priority: str = "default"  # low | default | high | urgent
