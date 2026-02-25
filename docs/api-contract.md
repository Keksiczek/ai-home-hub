# AI Home Hub – API Contract v0.2.0

Base URL: `http://<host>:8000/api`

Interactive docs (Swagger UI): `http://<host>:8000/docs`

WebSocket: `ws://<host>:8000/ws`

---

## Health

### GET /api/health

```json
{
  "status": "ok",
  "message": "AI Home Hub Mac Control Center is running",
  "version": "0.2.0",
  "ws_connections": 0
}
```

---

## Chat

### POST /api/chat

**Request:**
```json
{
  "message": "Otevři lean-rpg projekt",
  "mode": "general",
  "context_file_ids": [],
  "session_id": "abc123"
}
```

`mode`: `general` | `powerbi` | `lean`

**Response:**
```json
{
  "reply": "Projekt otevřen.",
  "meta": {"provider": "ollama", "model": "llama3.2", "latency_ms": 1234},
  "session_id": "abc123"
}
```

### GET /api/chat/sessions – List sessions
### GET /api/chat/sessions/{id} – Full message history
### DELETE /api/chat/sessions/{id} – Delete session

---

## File Upload

### POST /api/upload  (`multipart/form-data`)

```json
{"id": "uuid", "filename": "file.txt"}
```

---

## Agents

### POST /api/agents/spawn

```json
{"agent_type": "code", "task": {"goal": "Refactor login module"}, "workspace": "/path"}
```

`agent_type`: `general` | `code` | `research` | `testing` | `devops`

### GET /api/agents – List all agents
### GET /api/agents/{id}/status – Progress + status
### GET /api/agents/{id}/artifacts – Generated artifacts
### POST /api/agents/{id}/interrupt – Stop gracefully
### DELETE /api/agents/{id} – Terminate + remove
### POST /api/agents/cleanup – Remove finished agents

---

## Settings

### GET /api/settings – All settings (keys masked)
### POST /api/settings – Deep-merge update `{"settings": {...}}`
### GET /api/settings/schema – JSON schema for form generation
### POST /api/settings/ollama/health – Check Ollama + list models

---

## Integrations

### Claude MCP
- `POST /api/integrations/mcp/call-tool`
- `GET /api/integrations/mcp/available-tools`

### VS Code
- `POST /api/integrations/vscode/open-project`
- `POST /api/integrations/vscode/open-file`
- `POST /api/integrations/vscode/run-task`
- `GET /api/integrations/vscode/diagnostics?project_key=...`
- `GET /api/integrations/vscode/projects`

### Google Antigravity
- `POST /api/integrations/antigravity/start-agent`
- `GET /api/integrations/antigravity/agent-status?task_id=...`
- `GET /api/integrations/antigravity/artifacts?task_id=...`
- `GET /api/integrations/antigravity/health`

### macOS
- `POST /api/integrations/macos/action` – `{"action": "safari_open", "params": {"url": "..."}}`
- `POST /api/integrations/macos/safari-open?url=...`
- `POST /api/integrations/macos/volume-set?level=50`
- `GET /api/integrations/macos/running-apps`

**Actions:** `safari_open` | `finder_open` | `volume_set` | `sleep_display` | `open_app` | `quit_app` | `list_apps` | `battery` | `notification` | `mail_send`

### Git
- `GET /api/integrations/git/status?repo_path=...`
- `POST /api/integrations/git/commit` – `{"repo_path": "...", "message": "..."}`
- `POST /api/integrations/git/push` – `{"repo_path": "..."}`
- `POST /api/integrations/git/pull` – `{"repo_path": "..."}`
- `GET /api/integrations/git/log?repo_path=...&count=10`

### OpenClaw
- `POST /api/integrations/openclaw?action=screenshot`

**Actions:** `screenshot` | `click_at` | `type_text` | `open_application`

### Notifications
- `POST /api/integrations/notify` – `{"title": "...", "message": "...", "priority": "default"}`

---

## Filesystem

Paths must be in configured `allowed_directories`.

- `GET /api/filesystem/read?path=...`
- `GET /api/filesystem/list?path=...`
- `POST /api/filesystem/write?path=...` – `{"content": "..."}`
- `DELETE /api/filesystem/delete?path=...`
- `POST /api/filesystem/search` – `{"path": "...", "pattern": "..."}`
- `POST /api/filesystem/mkdir?path=...`
- `GET /api/filesystem/config`

---

## Tasks

- `GET /api/tasks` – List all tasks
- `GET /api/tasks/{id}/status` – Progress
- `POST /api/tasks/{id}/cancel` – Cancel
- `POST /api/tasks/cleanup` – Remove finished

---

## WebSocket  `ws://<host>/ws`

**Server events:**

| type | payload |
|------|---------|
| `connected` | `{message}` |
| `agent_update` | `{agent: AgentRecord}` |
| `task_update` | `{task: TaskRecord}` |
| `notification` | `{title, message}` |
| `pong` | — |

**Client → send:** `{"type": "ping"}`

---

## Legacy

### POST /api/actions/openclaw  (backward compatible)
```json
{"action": "start_whatsapp_agent", "params": {}}
```
