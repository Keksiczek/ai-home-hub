# AI Home Hub – Mac Control Center

> **v0.3.0** – Added multimodal chat with vision models, OCR support for images in Knowledge Base, incremental KB indexing, and sub-agent spawning.

---

## Features

| Category | Capability |
|----------|-----------|
| **LLM Chat** | Multi-session chat powered by Ollama (local) with `general`, `powerbi`, and `lean` modes |
| **AI Agents** | Spawn autonomous agents (`general`, `code`, `research`, `testing`, `devops`) with real-time progress via WebSocket |
| **macOS Automation** | Safari, Finder, volume, app launch/quit, battery, notifications, mail via AppleScript |
| **VS Code** | Open projects/files, run tasks, read diagnostics |
| **Git** | Status, commit, push, pull, log – all from the UI |
| **Filesystem** | Browse, read, write, search, mkdir (sandboxed to configured allowed directories) |
| **File Upload** | Upload context files and reference them in chat |
| **Knowledge Base** | Semantic search over PDF/DOCX/XLSX/TXT/MD files with ChromaDB + Ollama embeddings |
| **Quick Actions** | One-click multi-step sequences combining any service |
| **Integrations** | Claude MCP, Google Antigravity IDE, OpenClaw screen control, ntfy.sh push notifications |
| **Real-time UI** | WebSocket feed for live agent/task status updates |

---

## Quick Start

### Prerequisites

| Tool | Install | Purpose |
|------|---------|---------|
| Python 3.11+ | [python.org](https://python.org) | Backend runtime |
| Ollama | `brew install ollama` | Local LLM |
| VS Code CLI | Install VS Code → add `code` to PATH | VS Code control |
| cliclick | `brew install cliclick` | Mouse simulation (OpenClaw) |

### 1. Start Ollama

```bash
ollama serve          # runs on localhost:11434
ollama pull llama3.2  # download a model
```

### 2. Start the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Open the UI

Navigate to **http://localhost:8000** in your browser.

### 4. First-time configuration

1. Click the **Settings** tab in the UI.
2. Verify the LLM provider and model (`Ollama` / `llama3.2` by default).
3. Add at least one **allowed directory** under *Filesystem Security* (required for filesystem API access).
4. Optionally configure VS Code projects and integrations.

Run the setup check endpoint to verify:

```bash
curl http://localhost:8000/api/health/setup
```

---

## Project Structure

```
ai-home-hub/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, lifespan, route wiring
│   │   ├── routers/             # API route handlers
│   │   │   ├── agents.py
│   │   │   ├── chat.py
│   │   │   ├── filesystem.py
│   │   │   ├── integrations.py
│   │   │   ├── knowledge.py
│   │   │   ├── settings.py
│   │   │   ├── tasks.py
│   │   │   └── websocket_router.py
│   │   ├── services/            # Business logic
│   │   │   ├── agent_orchestrator.py
│   │   │   ├── embeddings_service.py
│   │   │   ├── file_parser_service.py
│   │   │   ├── llm_service.py
│   │   │   ├── macos_service.py
│   │   │   ├── vscode_service.py
│   │   │   ├── git_service.py
│   │   │   ├── filesystem_service.py
│   │   │   ├── settings_service.py
│   │   │   ├── vector_store_service.py
│   │   │   └── ws_manager.py
│   │   ├── utils/
│   │   │   └── text_chunker.py
│   │   └── models/
│   ├── static/                  # Frontend SPA (served by FastAPI)
│   │   ├── index.html
│   │   ├── app.js
│   │   └── style.css
│   ├── data/                    # Runtime data (gitignored)
│   │   ├── sessions/
│   │   ├── artifacts/
│   │   ├── uploads/
│   │   └── settings.json
│   └── requirements.txt
└── docs/
    ├── api-contract.md          # Full API reference
    ├── configuration-guide.md   # Detailed configuration guide
    └── prompts.md
```

---

## Multimodal Chat

AI Home Hub supports sending images alongside text messages to vision-capable models.

### How to Attach Images
- **Drag & drop** image files onto the chat input area
- **Paste** images directly from the clipboard (Ctrl+V / Cmd+V)
- **File picker** – click the attachment icon in the chat toolbar
- **Screenshot** – use the macOS screenshot button in the toolbar (captures screen and attaches automatically)

### Limits
- Max **5 images** per message
- Max **10 MB** per image
- Accepted formats: **PNG, JPEG, GIF, WebP**

### Model Configuration
Select a vision-capable model (e.g. `llava:7b`) in **Settings → Profiles → Vision**. Text-only messages continue to use the standard chat model.

### KB Context with Images
When the Knowledge Base is configured, relevant document chunks are retrieved and injected into the prompt even for multimodal (image-bearing) requests.

---

## Knowledge Base

AI Home Hub supports semantic search across your documents.

### Supported Formats
- PDF, DOCX, XLSX
- TXT, Markdown
- Images (OCR via Tesseract)

### OCR Support
- **Supported image formats:** PNG, JPEG, GIF, BMP, WebP
- **Requires:** `pytesseract` (listed in `requirements.txt`) + Tesseract binary (`brew install tesseract` on macOS)
- **Languages:** `eng+ces` by default – configurable in `backend/app/services/file_parser_service.py`
- Images are automatically OCR-processed and their extracted text indexed during the normal ingest pipeline

### Setup
1. Add external paths in Settings → Knowledge Base
2. Click "Scan storage" to discover files
3. Click "Index all files" to parse & embed
4. Chat queries automatically search KB for relevant context

### Requirements
- Ollama with embeddings model: `ollama pull nomic-embed-text`
- Python packages: see `requirements.txt`

### How It Works
1. Files are parsed and chunked (500 chars, 50 char overlap)
2. Embeddings generated via Ollama (`nomic-embed-text`)
3. Stored in ChromaDB vector store (`backend/data/chroma/`)
4. Chat queries search top-3 relevant chunks (cosine similarity > 0.3)
5. Context injected into LLM prompt automatically

---

## Shared Memory

Shared Memory is a **central long-term memory** for your AI models – separate from the Knowledge Base. While KB stores large document collections, Memory holds lightweight user-specific facts, preferences, and summaries (high importance, low volume).

### How It Works

1. Add memories via the **Settings → Shared Memory** UI or the REST API.
2. Each memory has `text`, `tags`, `source`, `importance` (1-10), and a `timestamp`.
3. Memories are embedded and stored in a dedicated ChromaDB collection (`memory`).
4. During chat, the system automatically searches for relevant memories. If matches are found (cosine distance < 0.7), they are injected into the system prompt as `<user_memory>` notes.
5. External agents or web services can read/write memories via the HTTP API.

### Managing Memories in the UI

- Open **Settings → Shared Memory**.
- **Add**: fill in the text, optional tags (comma-separated), importance, and click *Save*.
- **View**: click *View memories* to expand the list.
- **Delete**: click the trash icon next to any memory.

### Auto-summarize Session

After a chat conversation, click the **"Paměť"** button in the chat header to automatically extract key facts and preferences from the session and save them as memories.

- The system uses the LLM to analyze the conversation and extract relevant user-specific information.
- Each extracted fact is saved with tags `["auto-summary", "session"]` and importance 7.
- The memories are then available for future chat sessions.

```bash
# Summarize a session via API
curl -X POST http://localhost:8000/api/memory/summarize-session \
  -H "Content-Type: application/json" \
  -d '{"session_id": "abc-123-def", "max_messages": 50}'
```

### Memory Preview in Chat

When a chat response uses shared memory context, a purple **"Memory"** badge appears on the message bubble. Click the expandable **"Použité paměti"** section below the response to see which memories were used.

### API Endpoints

All `/api/memory/*` endpoints are protected by `X-API-Key` when configured.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/memory/add` | POST | Add a new memory |
| `/api/memory/search` | POST | Semantic search over memories |
| `/api/memory/all` | GET | List all memories (query param: `limit`) |
| `/api/memory/{id}` | DELETE | Delete a memory |
| `/api/memory/{id}` | PUT | Update text/tags/importance |
| `/api/memory/summarize-session` | POST | Summarize chat session into memories |

### Examples

```bash
# Add a memory
curl -X POST http://localhost:8000/api/memory/add \
  -H "Content-Type: application/json" \
  -d '{"text": "Stepan preferuje kratke odpovedi v cestine", "tags": ["preference", "jazyk"], "importance": 8}'

# Search memories
curl -X POST http://localhost:8000/api/memory/search \
  -H "Content-Type: application/json" \
  -d '{"query": "jazyková preference", "top_k": 3}'

# List all
curl http://localhost:8000/api/memory/all?limit=50

# Delete
curl -X DELETE http://localhost:8000/api/memory/mem_abc123def456
```

---

## Agent Skills Integration

AI Home Hub supports **Agent Skills** – reusable skill packages based on the [agentskills.io](https://agentskills.io) specification.

### How It Works

- Each skill is a **directory containing a `SKILL.md` file** with optional YAML frontmatter (`name`, `description`) and instructions for the agent.
- By default, the system scans `~/.agents/skills` and `~/.ai-home-hub/skills` for skill directories.
- Additional directories can be configured in **Settings → Agent Skills**.
- When spawning an agent, select which skills it should use. The skill instructions from `SKILL.md` are injected into the agent's system prompt.

### Example Skill Structure

```
~/.agents/skills/
└── pdf-processing/
    ├── SKILL.md          # Required: frontmatter + instructions
    ├── scripts/           # Optional: helper scripts
    ├── references/        # Optional: reference docs
    └── assets/            # Optional: templates, configs
```

### Example SKILL.md

```markdown
---
name: pdf-processing
description: Extract text and tables from PDF files, fill forms, merge documents.
---

## Instructions

When asked to process PDF files, use the following approach:
1. Extract text using appropriate tools
2. Parse tables into structured format
3. Return results in markdown
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agent-skills` | GET | List discovered agent skills |
| `/api/agent-skills/refresh` | POST | Re-scan directories for skills |
| `/api/agent-skills/{name}` | GET | Get skill instructions (SKILL.md content) |

---

## API Overview

Base URL: `http://localhost:8000/api`
Interactive docs (Swagger UI): `http://localhost:8000/docs`
WebSocket: `ws://localhost:8000/ws`

| Route group | Routes |
|-------------|--------|
| Health | `GET /api/health` |
| Chat | `POST /api/chat`, `GET/DELETE /api/chat/sessions/{id}` |
| Multimodal Chat | `POST /api/chat/multimodal` |
| File upload | `POST /api/upload` |
| Agents | `POST /api/agents/spawn`, `GET /api/agents/{id}/status`, `POST /api/agents/{id}/search-kb`, `POST /api/agents/{id}/spawn-sub-agent` |
| Tasks | `GET /api/tasks`, `POST /api/tasks/{id}/cancel` |
| Settings | `GET/POST /api/settings` |
| Filesystem | `GET /api/filesystem/read`, `POST /api/filesystem/write`, … |
| Knowledge Base | `POST /api/knowledge/ingest`, `POST /api/knowledge/search`, `GET /api/knowledge/stats`, `POST /api/knowledge/ingest/incremental`, `DELETE /api/knowledge/files`, `POST /api/knowledge/reindex`, `GET /api/knowledge/export-metadata` |
| Shared Memory | `POST /api/memory/add`, `POST /api/memory/search`, `GET /api/memory/all`, `DELETE /api/memory/{id}`, `PUT /api/memory/{id}` |
| Integrations | `/api/integrations/macos/action`, `POST /api/integrations/macos/screenshot`, `/api/integrations/vscode/…`, … |

See [`docs/api-contract.md`](docs/api-contract.md) for the full reference.

---

## Configuration

All configuration is managed through the **Settings** tab in the UI and persisted to `backend/data/settings.json`. Key sections:

- **LLM** – provider, model, temperature, Ollama URL
- **Integrations** – VS Code, Claude MCP, Google Antigravity, ntfy.sh notifications
- **Filesystem Security** – allowed directory whitelist
- **Agent Limits** – max concurrent agents, timeout
- **Quick Actions** – custom multi-step automation sequences
- **System Prompts** – per-mode AI personality

See [`docs/configuration-guide.md`](docs/configuration-guide.md) for a full reference.

---

## WebSocket Real-time Events

Connect to `ws://localhost:8000/ws` to receive live updates:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');
ws.onmessage = (e) => {
  const { type, ...payload } = JSON.parse(e.data);
  // type: "connected" | "agent_update" | "task_update" | "notification" | "pong"
};
```

Send `{"type": "ping"}` to keep the connection alive.

---

## macOS Requirements

The macOS automation features require:

- **osascript** (built-in) – AppleScript actions (notifications, mail, app control)
- **Accessibility permissions** – grant Terminal (or your Python process) access in *System Settings → Privacy & Security → Accessibility*
- **cliclick** (`brew install cliclick`) – mouse/keyboard simulation via OpenClaw

---

## Security Notes

- **Filesystem access** is sandboxed to directories listed in *allowed_directories*. An empty list blocks all filesystem API calls.
- **API keys** (e.g., Antigravity) are stored in `backend/data/settings.json`. The UI masks key values. **Never commit `settings.json` to git** – it is listed in `.gitignore`.
- The server allows all CORS origins by default (`allow_origins=["*"]`). Restrict this if exposing the server beyond localhost.
- Agent concurrency is capped (default: 5) with a timeout (default: 30 min) to prevent runaway processes.

### API Key Authentication

Sensitive endpoints (screenshot capture, KB file deletion, KB reindex) support optional `X-API-Key` header authentication:

- **Disabled (default):** leave the *API Key* field empty in *Settings → Security*. All requests are accepted – suitable for localhost-only use.
- **Enabled:** set a non-empty value in *Settings → Security → API Key*. Every request to a protected endpoint must include the header `X-API-Key: <your-key>`. Requests without the header or with a wrong key receive **HTTP 403**.
- **Recommendation:** always set an API key when exposing AI Home Hub on a LAN, VPN, or reverse proxy.

```bash
# Example – delete a KB file with API key auth
curl -X DELETE "http://localhost:8000/api/knowledge/files?path=/docs/old.txt" \
     -H "X-API-Key: your-secret-key"
```

Protected endpoints:
| Endpoint | Method |
|----------|--------|
| `/api/integrations/macos/screenshot` | POST |
| `/api/knowledge/files` | DELETE |
| `/api/knowledge/reindex` | POST |
| `/api/memory/*` | ALL |

---

## Testing & CI

Backend tests run automatically on every push and pull request to `main` via the GitHub Actions workflow at [`.github/workflows/backend-ci.yml`](.github/workflows/backend-ci.yml) (Python 3.11 and 3.12).

To run tests locally:

```bash
cd backend
pip install -r requirements.txt
pytest -q tests
```

---

## Troubleshooting

**Ollama not connecting**
```bash
ollama serve            # ensure Ollama is running
curl http://localhost:11434  # verify it responds
ollama list             # check models are downloaded
```

**VS Code not opening**
- Run *Shell Command: Install 'code' command in PATH* from the VS Code command palette.
- Update the binary path in *Settings → Integrations → VS Code*.

**AppleScript / macOS actions failing**
- Grant accessibility permissions: *System Settings → Privacy & Security → Accessibility*.
- Test manually: `osascript -e 'display notification "test"'`

**Agents timing out**
- Increase `timeout_minutes` in *Settings → Agent Limits*.
- Ensure Ollama is running if the agent uses the LLM.
