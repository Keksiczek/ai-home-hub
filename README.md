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
