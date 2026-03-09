# AI Home Hub – API Contract v0.3.0

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

## Multimodal Chat

### POST /api/chat/multimodal

Send a text message with optional images to a vision-capable model. When images are present the request is routed to `POST /api/generate` (Ollama vision endpoint); otherwise it falls back to the standard `POST /api/chat` endpoint.

**Request:**
```json
{
  "session_id": "abc123",
  "message": "What is in this image?",
  "images": [
    {
      "filename": "screenshot.png",
      "data": "<base64-encoded bytes>",
      "mime_type": "image/png"
    }
  ],
  "model": "llava:7b"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `message` | string | yes | Text prompt |
| `images` | array | no | Max 5 items, each ≤ 10 MB |
| `images[].filename` | string | no | Original filename (informational) |
| `images[].data` | string | yes (if image) | Raw base64, no data-URI prefix |
| `images[].mime_type` | string | yes (if image) | `image/png` \| `image/jpeg` \| `image/gif` \| `image/webp` |
| `session_id` | string | no | Reuse an existing session |
| `model` | string | no | Overrides the profile default |

**Response:**
```json
{
  "response": "The image shows a terminal window with Python code.",
  "model_used": "llava:7b",
  "session_id": "abc123",
  "kb_context_used": false,
  "images_processed": 1
}
```

**Errors:**

| Code | Reason |
|------|--------|
| `400` | Validation failure – too many images, unsupported MIME type, or image exceeds 10 MB |
| `500` | Ollama unreachable or model not loaded |

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

### POST /api/agents/{agent_id}/search-kb

Search the Knowledge Base on behalf of a specific agent. Results below the minimum cosine-similarity threshold (`MIN_KB_SEARCH_SCORE = 0.3`) are filtered out before returning.

**Request:**
```json
{
  "query": "How do I configure the embeddings model?",
  "top_k": 3
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `query` | string | yes | 1–500 characters |
| `top_k` | integer | no | 1–20, default `3` |

**Response:**
```json
{
  "agent_id": "a1b2c3d4",
  "query": "How do I configure the embeddings model?",
  "results": [
    {
      "text": "To configure the embeddings model, open Settings → Knowledge Base…",
      "file_name": "configuration-guide.md",
      "file_path": "/docs/configuration-guide.md",
      "score": 0.82
    }
  ]
}
```

### POST /api/agents/{agent_id}/spawn-sub-agent

Spawn a child agent under the given parent. Returns HTTP 429 if the parent has already reached the maximum sub-agent depth (`MAX_SUB_AGENT_DEPTH = 2`).

**Request:**
```json
{
  "task": "Run the full test suite and report failures",
  "agent_type": "testing"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `task` | string | yes | 1–2000 characters |
| `agent_type` | string | no | `general` \| `code` \| `research` \| `testing` \| `devops` |

**Response:**
```json
{
  "parent_agent_id": "a1b2c3d4",
  "sub_agent_id": "e5f6g7h8",
  "agent_type": "testing",
  "status": "pending"
}
```

**Errors:**

| Code | Reason |
|------|--------|
| `404` | Parent agent not found |
| `429` | Sub-agent depth limit reached |

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

### POST /api/integrations/macos/screenshot?mode=clipboard|file

Capture a screenshot on macOS. Requires **Screen Recording** permission granted to the Python process in *System Settings → Privacy & Security → Screen Recording*.

| Query param | Values | Default | Notes |
|-------------|--------|---------|-------|
| `mode` | `clipboard` \| `file` | `clipboard` | `clipboard` copies to clipboard and returns base64; `file` saves to a temp path and returns the path |

**Response:**
```json
{
  "success": true,
  "image": "<base64-encoded PNG>",
  "path": null,
  "error": null
}
```

When `mode=file`:
```json
{
  "success": true,
  "image": null,
  "path": "/tmp/screenshot_20240101_120000.png",
  "error": null
}
```

**Errors:**

| Code | Reason |
|------|--------|
| `403` | Screen Recording permission not granted |
| `500` | Screenshot capture failed (e.g. non-macOS host) |

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

## Knowledge Base

### POST /api/knowledge/ingest

Full ingest of all (or specified) files: parse → chunk → embed → store.

**Request:** `{"file_paths": ["/path/to/file.pdf"]}` (omit to ingest all scanned files)

**Response:** `{"ingested_count": 3, "failed_count": 0, "total_chunks": 42, "errors": []}`

### POST /api/knowledge/search

**Request:** `{"query": "embeddings model", "top_k": 5}`

**Response:**
```json
{
  "results": [{"text": "...", "file_name": "guide.md", "file_path": "/docs/guide.md", "score": 0.87, "metadata": {}}],
  "query": "embeddings model"
}
```

### GET /api/knowledge/stats

**Response:** `{"total_chunks": 1240, "collection_name": "knowledge_base"}`

### POST /api/knowledge/ingest/incremental

Re-index only files that are new or whose `mtime` has changed since the last indexing run. Unchanged files are counted in `skipped` and never re-embedded, keeping the operation fast.

**Request body:** JSON array of absolute file paths.
```json
["/docs/guide.md", "/docs/api-contract.md"]
```

**Response:**
```json
{
  "new_indexed": 1,
  "re_indexed": 0,
  "skipped": 1,
  "failed": 0,
  "total_chunks": 18,
  "errors": []
}
```

### DELETE /api/knowledge/files?path=\<file_path\>

Remove all indexed chunks for a specific file path from the vector store.

**Query parameter:** `path` – absolute path of the file to delete (URL-encoded).

**Response:**
```json
{"success": true, "deleted_chunks": 12, "message": "Removed 12 chunks for /docs/old-guide.md"}
```

**Errors:**

| Code | Reason |
|------|--------|
| `404` | No chunks found for the given path |

### POST /api/knowledge/reindex-file

Force re-index a single file regardless of whether its `mtime` has changed. Existing chunks are deleted first.

**Request:**
```json
{"path": "/docs/guide.md"}
```

**Response:**
```json
{"success": true, "path": "/docs/guide.md", "chunks": 18, "message": "Re-indexed successfully"}
```

### GET /api/knowledge/export-metadata

Download a CSV file containing metadata for every indexed chunk (file path, file name, chunk index, page count, mtime, score).

**Response:** `Content-Type: text/csv` file download named `kb_metadata.csv`.

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
