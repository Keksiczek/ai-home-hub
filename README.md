# AI Home Hub

Local AI orchestration hub. One React frontend, FastAPI backend, Ollama LLM, autonomous Resident Agent, Knowledge Base, job scheduling -- all in a single self-hosted control center.

> Personal project, active development.

---

## What it is

A FastAPI + React single-page application that acts as a local AI command center:

- **Chat** with local LLM models (Ollama) including vision support
- **Resident Agent** -- autonomous background agent with observer/advisor/autonomous modes
- **Knowledge Base** -- ChromaDB-powered semantic search across document collections
- **Job System** -- background job queue with scheduling and overnight batch jobs
- **Model Manager** -- pull, delete, and manage Ollama models
- **File Manager** -- browse files, upload to KB
- **Skills** -- extensible agent skill system
- **Quick Actions** -- configurable automation shortcuts
- **Control Room** -- system-level operations (force cycles, shutdown, cache purge)
- **Creative Studio** -- game/ASCII/3D generation experiments
- **Settings** -- CORS, Tailscale, LLM performance tuning

Everything runs locally. No cloud dependencies for core functionality.

---

## Architecture

```
frontend/           React 19 + TypeScript + Vite (SPA)
  src/
    components/     Chat, Dashboard, ResidentAgent, KnowledgeBase,
                    Models, Jobs, Files, Agents, Skills, QuickActions,
                    ControlRoom, OvernightJobs, LLMSettings, Settings,
                    CreativeStudio
    context/        WebSocket + Toast providers
    api.ts          Typed API client

backend/            FastAPI (Python 3.11+)
  app/
    main.py         Entrypoint, lifespan, middleware
    routers/        REST + WebSocket endpoints (20+)
    services/       Core logic (LLM, resident agent, KB, jobs, ...)
  static/dist/      Built React frontend (served by FastAPI)

open-webui/         Optional external companion (not part of core UI)
grafana/            Grafana dashboard definitions
prometheus/         Prometheus scrape config
```

The React frontend builds into `backend/static/dist/` and is served directly by FastAPI. All UI is React -- there are no legacy HTML views or iframe fallbacks.

---

## How to start

`./start.sh` is the **single recommended entrypoint**.

### Prerequisites

- **Python 3.11+** (required)
- **Node.js 18+** (required for frontend build; not needed with `--backend-only`)
- **[Ollama](https://ollama.ai)** installed and running (`ollama serve`)

### Quick start

```bash
git clone https://github.com/Keksiczek/ai-home-hub
cd ai-home-hub
chmod +x start.sh
./start.sh
```

Opens at **http://localhost:8000**.

### Startup modes

| Mode | Command | Use case |
|------|---------|----------|
| Full start | `./start.sh` | Normal use -- builds frontend, starts backend |
| Check only | `./start.sh --check` | Validate environment (CI, smoke test) |
| Backend only | `./start.sh --backend-only` | API server without frontend (Node.js not needed) |
| Reuse build | `./start.sh --no-build` | Skip frontend build, use existing dist/ |

Options: `--port PORT`, `--reload` (dev hot-reload), `--help`.

### Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Missing dependency or config error |
| 2 | Frontend build artifacts missing (with `--no-build`) |

---

## Remote access (Tailscale)

The app binds to `0.0.0.0`, so it's reachable from any device on the same Tailscale network.

### From another device on the same tailnet

Access via `http://<tailscale-hostname>:8000/`.

### Tailscale Funnel (public HTTPS)

Enable in **Settings > Tailscale** within the app, or configure manually:

```bash
tailscale funnel 8000
```

This exposes the app at `https://<hostname>.ts.net/`.

### Open WebUI (optional companion)

Open WebUI is a **separate external service**, not part of the core UI. It runs independently on port 8080 and shares the same Ollama backend.

The sidebar includes a link to Open WebUI as an external resource. When accessed via Tailscale, the link automatically adjusts to use the Tailscale hostname:

- Local: `http://localhost:8080`
- Remote: `http://<tailscale-hostname>:8080`

To make Open WebUI accessible remotely, either:
1. Run it bound to `0.0.0.0` (default for Docker)
2. Use Tailscale Funnel: `tailscale funnel --bg 8080`

---

## Monitoring (optional)

Prometheus + Grafana via Docker Compose:

```bash
docker compose -f docker-compose.prod.yml up -d
# Grafana: http://localhost:3001 (admin/changeme)
# Prometheus: http://localhost:9090
```

---

## Troubleshooting

```bash
./start.sh --check          # validate environment
./start.sh --port 9000      # different port
cd frontend && rm -rf node_modules && npm install  # fix build issues
ollama serve                 # ensure Ollama is running
```

---

## License

MIT
