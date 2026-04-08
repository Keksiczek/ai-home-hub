# AI Home Hub

Local AI orchestration hub. Connects Ollama, a React dashboard, an autonomous Resident Agent, Knowledge Base, job scheduling, and optional Open WebUI into a single self-hosted control center.

> Personal project, active development.

---

## What it is

A FastAPI + React single-page application that acts as a local AI command center. It provides:

- **Chat** with local LLM models (Ollama) including vision support
- **Resident Agent** – autonomous background agent with observer/advisor/autonomous modes
- **Knowledge Base** – ChromaDB-powered semantic search across document collections
- **Job System** – background job queue with scheduling
- **Model Manager** – pull, delete, and manage Ollama models
- **File Manager** – browse files, upload to KB
- **Monitoring** – optional Prometheus + Grafana stack

Everything runs locally. No cloud dependencies for core functionality.

---

## Current architecture

```
frontend/           React 19 + TypeScript + Vite (SPA)
  src/
    components/     Chat, Dashboard, ResidentAgent, KnowledgeBase,
                    Models, Jobs, Files, Agents, OpenWebUI, CreativeStudio
    context/        WebSocket + Toast providers
    api.ts          Typed API client

backend/            FastAPI (Python 3.11+)
  app/
    main.py         Entrypoint, lifespan, middleware
    routers/        REST + WebSocket endpoints (20+)
    services/       Core logic (LLM, resident agent, KB, jobs, ...)
  static/dist/      Built React frontend (served by FastAPI)

open-webui/         Optional – separate Open WebUI instance (port 8080)
grafana/            Grafana dashboard definitions
prometheus/         Prometheus scrape config
```

The React frontend builds into `backend/static/dist/` and is served directly by FastAPI. In development, Vite proxies `/api` and `/ws` to the backend.

---

## How to start

`./start.sh` is the **single recommended entrypoint**. It is designed for both interactive terminal use and automated execution under a process supervisor (launchd, systemd).

### Prerequisites

**Required (hard dependencies):**
- Python 3.11+
- [Ollama](https://ollama.ai) installed and running (`ollama serve`) – needed for LLM features

**Required for frontend build:**
- Node.js 18+ (not needed with `--backend-only` or `--no-build`)

### Quick start

```bash
git clone https://github.com/Keksiczek/ai-home-hub
cd ai-home-hub
chmod +x start.sh
./start.sh
```

This builds the React frontend and starts the FastAPI server on **http://localhost:8000**.

### Startup modes

| Mode | Command | When to use |
|------|---------|-------------|
| Full start | `./start.sh` | Normal local use – builds frontend, starts backend |
| Check only | `./start.sh --check` | Validate environment without starting anything (CI, smoke test) |
| Backend only | `./start.sh --backend-only` | API/agent server without frontend build (Node.js not needed) |
| Reuse build | `./start.sh --no-build` | Skip frontend build, use existing `backend/static/dist/` |

Additional options:

```bash
./start.sh --port 9000       # custom port (default: 8000, or $PORT env)
./start.sh --reload          # uvicorn hot-reload for development
./start.sh --help            # full usage info
```

Options can be combined: `./start.sh --no-build --reload --port 9000`

### Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success (or `--check` passed) |
| 1 | Missing hard dependency or configuration error |
| 2 | Frontend build artifacts missing (with `--no-build`) |
| 3 | Backend failed to start |

### Other scripts (not required for normal use)

| Script | Purpose |
|--------|---------|
| `run-app.sh [dev\|prod\|stop]` | Full orchestrator – auto-starts Ollama, pulls models, starts Open WebUI, health checks. Dev/ops helper. |
| `scripts/dev.sh` | Dev helper – manages backend + Tailscale Funnel for remote access. |
| `Makefile` | Convenience targets (`make start`, `make test`, `make docker-up`, etc.) |

These are helpers, not the primary entrypoint.

---

## Automatic startup (macOS launchd)

`start.sh` is designed to work under a process supervisor. A sample launchd plist is provided at `files/macos/com.aihomehub.native.plist`.

### Setup

```bash
# 1. Edit the plist – adjust /opt/ai-home-hub to your actual path
#    and ensure PATH includes your python3/node/ollama locations.

# 2. Copy to LaunchAgents
cp files/macos/com.aihomehub.native.plist ~/Library/LaunchAgents/

# 3. Load
launchctl load ~/Library/LaunchAgents/com.aihomehub.native.plist

# 4. Check status
launchctl list | grep aihomehub

# 5. View logs
tail -f /tmp/aihomehub-native.stdout.log /tmp/aihomehub-native.stderr.log
```

### Unload / update

```bash
# Stop the service
launchctl unload ~/Library/LaunchAgents/com.aihomehub.native.plist

# Update code, rebuild frontend, etc.
cd /opt/ai-home-hub && git pull && ./start.sh --check

# Reload
launchctl load ~/Library/LaunchAgents/com.aihomehub.native.plist
```

### Notes on KeepAlive

The plist ships with `KeepAlive` set to `false`. If you set it to `true`, launchd will restart the process whenever it exits. This is useful for crash recovery but has trade-offs:

- During updates, you must `unload` first, then update, then `reload`. Otherwise launchd will keep restarting the old process.
- If the app fails immediately on startup (bad config, missing dependency), launchd will retry repeatedly. Use `./start.sh --check` to validate the environment first.

For Docker-based deployment, see `files/macos/com.aihomehub.plist` and `deploy-macos.sh`.

---

## UI overview

After starting, open **http://localhost:8000** in your browser. The UI has a sidebar with:

**Main menu:**
- **Chat** – LLM conversation with streaming, markdown, code highlighting, image upload
- **Resident AI** – autonomous agent control (start/stop, mode switching, activity feed)
- **Dashboard** – system stats, RAM, Ollama status, job queue
- **Knowledge Base** – semantic search, document upload, multi-collection

**Advanced features:**
- **Open WebUI** – iframe integration (requires separate Open WebUI instance, see below)
- **Files** – file browser with KB upload
- **Agents** – multi-agent spawning and management
- **Jobs** – job queue, history, nightly reports
- **Models** – Ollama model manager (pull, delete, search)
- **Creative Studio**, **Control Room**, **Settings**, and more

The UI is responsive (works on mobile) and supports keyboard shortcuts (Ctrl+K for global search).

---

## Integrations

### Ollama (required for LLM features)

Core LLM provider. Must be running on `localhost:11434` (default).

```bash
# Install
# macOS: brew install ollama
# Linux: curl -fsSL https://ollama.com/install.sh | sh

# Start
ollama serve

# Pull a model
ollama pull qwen2.5:7b-instruct-q4_K_M
```

The app works with any Ollama model. Default model routing per profile is configured in the backend (see `LLM_MODEL_*` env vars).

### Open WebUI (optional, separate service)

Open WebUI is **not** started by `./start.sh`. It is a separate service that runs on port 8080 and shares the same Ollama backend.

To use it:
```bash
# Docker
cd open-webui && ./run.sh

# Or native Python
cd open-webui && ./run_native.sh
```

When running, it appears in the sidebar under "Open WebUI" as an embedded iframe. When not running, the UI shows a helpful message with instructions.

`run-app.sh` can auto-start Open WebUI if `run_openwebui.sh` exists in the project root.

### Home Assistant

Not directly integrated. The project is a standalone local AI hub. Remote access is available via Tailscale Funnel (`scripts/dev.sh`).

### Monitoring (optional)

Prometheus + Grafana via Docker Compose:

```bash
docker compose -f docker-compose.prod.yml --profile monitoring up -d
# Grafana: http://localhost:3001 (admin/changeme)
# Prometheus: http://localhost:9090
```

---

## Troubleshooting

### Validate environment first

```bash
./start.sh --check
```

This reports all dependency issues without starting anything.

### `./start.sh` fails on frontend build

```
error TS2688: Cannot find type definition file...
```

Run `cd frontend && rm -rf node_modules && npm install`, then retry. Or use `--backend-only` to skip the frontend entirely.

### Ollama not running

The app starts but Chat returns errors. Make sure Ollama is running:
```bash
ollama serve
# or check: curl http://localhost:11434
```

### Port already in use

```bash
./start.sh --port 9000
# or kill the existing process:
lsof -ti:8000 | xargs kill
```

### Open WebUI not loading

Open WebUI is a separate service. Start it manually:
```bash
cd open-webui && ./run_native.sh
```

### Frontend not updating after code changes

Rebuild:
```bash
cd frontend && npm run build
```

Or use `./start.sh --reload` for development (hot-reload for backend; for frontend dev, run `cd frontend && npm run dev` separately).

### launchd: process keeps restarting

If `KeepAlive` is `true` and the app crashes on startup, launchd will retry. Fix:
```bash
launchctl unload ~/Library/LaunchAgents/com.aihomehub.native.plist
./start.sh --check   # find the issue
# fix it, then reload
launchctl load ~/Library/LaunchAgents/com.aihomehub.native.plist
```

---

## Project status

Active personal project. The React frontend is relatively new and replaces older legacy HTML views (some tabs still use iframe fallback to legacy endpoints). Core features (Chat, Resident Agent, KB, Jobs, Models) are fully React-native. Some advanced tabs (Control Room, Skills Marketplace, LLM Settings) still use legacy iframe views.

---

## License

MIT
