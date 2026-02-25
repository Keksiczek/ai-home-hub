# AI Home Hub – Mac Control Center

> **v0.2.0** – A unified local control hub that brings together an Ollama LLM chat interface, autonomous AI agents, macOS automation, VS Code control, Git operations, and filesystem access into a single browser-based dashboard.

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
│   │   │   ├── settings.py
│   │   │   ├── tasks.py
│   │   │   └── websocket_router.py
│   │   ├── services/            # Business logic
│   │   │   ├── agent_orchestrator.py
│   │   │   ├── llm_service.py
│   │   │   ├── macos_service.py
│   │   │   ├── vscode_service.py
│   │   │   ├── git_service.py
│   │   │   ├── filesystem_service.py
│   │   │   ├── settings_service.py
│   │   │   └── ws_manager.py
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

## API Overview

Base URL: `http://localhost:8000/api`
Interactive docs (Swagger UI): `http://localhost:8000/docs`
WebSocket: `ws://localhost:8000/ws`

| Route group | Prefix |
|-------------|--------|
| Health | `GET /api/health` |
| Chat | `POST /api/chat`, `GET/DELETE /api/chat/sessions/{id}` |
| File upload | `POST /api/upload` |
| Agents | `POST /api/agents/spawn`, `GET /api/agents/{id}/status` |
| Tasks | `GET /api/tasks`, `POST /api/tasks/{id}/cancel` |
| Settings | `GET/POST /api/settings` |
| Filesystem | `GET /api/filesystem/read`, `POST /api/filesystem/write`, … |
| Integrations | `/api/integrations/macos/action`, `/api/integrations/vscode/…`, … |

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
