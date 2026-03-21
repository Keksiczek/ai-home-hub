# AI Home Hub – Mac Control Center

Lokální AI orchestrační centrum pro macOS. Propojuje Ollama, VS Code, filesystem a agentní orchestraci do jednoho dashboardu. Běží plně lokálně, optimalizované pro MacBook Pro 2019 (Intel, 8 GB RAM).

> ⚠️ Projekt je v aktivním vývoji.

---

## ✨ Co umí

| Feature | Stav |
|---------|------|
| 💬 Chat s LLM (Ollama) | ✅ |
| 🖼️ Image upload + Vision (llava:7b) | ✅ |
| 🤖 4 custom profily (Lean/CI, PBI/DAX, Mac Admin, AI Dev) | ✅ |
| 🧠 Resident Agent (autonomous, quiet hours, structured log) | ✅ |
| 📚 Knowledge Base + multi-kolekce + tag search | ✅ |
| 📁 File Manager (tree, VSCode open, KB upload) | ✅ |
| 🔧 11 Agent Skills (web search, code exec, vision, shell...) | ✅ |
| 💼 Job systém (run now, schedule, queue) | ✅ |
| 🧠 Model Manager (Ollama + HuggingFace GGUF stahování) | ✅ |
| ⚙️ LLM Settings (model routing, parametry, hot-reload) | ✅ |
| 📊 Prometheus /metrics endpoint | ✅ |
| 📈 Grafana Dashboards (5 panelů) | ✅ |
| 🔔 Slack Alerting (Grafana + webhook relay) | ✅ |
| ⚡ Power UX (force-cycle, CSV export, graceful shutdown) | ✅ |
| ⚡ Live Activity Bar (WebSocket, RAM, jobs, KB stats) | ✅ |
| 📸 Screenshot (Mac native + mobile html2canvas) | ✅ |
| 🌐 Tailscale Funnel (remote přístup) | ✅ |
| 🎯 First-run Onboarding Wizard | ✅ |
| 🔍 Global Search Ctrl+K | ✅ |
| 📊 Nightly Report Widget | ✅ |

---

## 🚀 Rychlý start

### Požadavky
- macOS (optimalizováno pro Intel 8GB)
- Python 3.11+
- [Ollama](https://ollama.com) nainstalovaný

### Instalace

```bash
git clone https://github.com/Keksiczek/ai-home-hub.git
cd ai-home-hub

# Stáhni modely
ollama pull llama3.2
ollama pull qwen2.5-coder:3b
ollama pull llava:7b

# Spusť
./run-app.sh
# nebo:
cd backend && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Dashboard: http://localhost:8000

### Make příkazy

```bash
make dev-start    # spustit backend + Tailscale
make dev-stop     # zastavit vše
make dev-update   # git pull + restart
make dev-status   # stav procesů
```

---

## 🏗️ Architektura

```
backend/
  app/
    main.py                 # FastAPI entrypoint, lifespan, TaskSupervisor
    routers/                # REST + WebSocket endpointy
      chat.py               # LLM chat
      chat_multimodal.py    # Vision chat (llava)
      resident.py           # Resident Agent kontrola
      models.py             # Model Manager + LLM Settings
      knowledge.py          # KB + multi-kolekce
      files.py              # File Manager
      jobs.py               # Job systém
      skills.py             # Agent Skills
      websocket_router.py   # Activity bar WS
    services/
      resident_agent.py     # Autonomous daemon (structured log, quiet hours)
      agent_orchestrator.py # LLM orchestrace + tool dispatch
      job_service.py        # Job fronta a scheduling
      model_manager_service.py  # Ollama + HuggingFace
      vector_store_service.py   # ChromaDB + multi-KB
      activity_service.py   # Live system stats aggregace
      skills_service.py     # 11 agent skills
      llm_service.py        # Model routing + keep_alive
      resource_monitor.py   # psutil daemon
    models/                 # Pydantic schemas
    middleware/             # Logging, rate limiting
    static/                 # Frontend SPA
```

### LLM Model routing

| Profil | Model | keep_alive |
|--------|-------|-----------|
| chat | llama3.2:3b | 60s |
| code | qwen2.5-coder:3b | 120s |
| vision | llava:7b | 0 (unload) |
| agent | dolphin-llama3:8b | 30s |

---

## 📡 API přehled

| Endpoint | Popis |
|----------|-------|
| POST /api/chat | LLM chat |
| POST /api/chat/multimodal | Vision chat (base64 image) |
| GET /api/models/installed | Nainstalované Ollama modely |
| POST /api/models/pull | Stáhnout model (SSE stream) |
| GET /api/kb/collections | Seznam KB kolekcí |
| GET /api/kb/search?q= | Semantic + tag search |
| GET /api/resident/status | Stav agenta |
| POST /api/resident/run-now | Okamžitý cyklus |
| GET /api/jobs/queue | Job fronta |
| POST /api/jobs/run-now | Spustit job okamžitě |
| GET /api/jobs/nightly-report | Nightly Report (latest) |
| GET /api/llm/settings | LLM konfigurace |
| PATCH /api/llm/settings | Změna nastavení (hot-reload) |
| GET /metrics | Prometheus metriky |
| GET /api/health | Health check (komponenty + background tasky) |
| GET /api/system/health | Startup component health (Ollama, KB, Jobs DB) |
| WS /ws | WebSocket (activity, agent status) |

Kompletní API: http://localhost:8000/docs

---

## 🎯 First-run Onboarding

Při prvním spuštění se zobrazí průvodce, který:
1. Zkontroluje dostupnost Ollama
2. Navede k nastavení Knowledge Base
3. Umožní výběr výchozího profilu (Lean/CI, PBI/DAX, Mac Admin, AI Dev)
4. Spustí Resident Agent

Průvodce lze kdykoli znovu spustit v **Nastavení → 🔄 Průvodce**.

---

## 🔍 Global Search (Ctrl+K)

Command palette dostupná zkratkou **Ctrl+K** umožňuje:
- Rychlou navigaci mezi záložkami
- Spouštění akcí (Job, Agent, Screenshot...)
- Sémantické vyhledávání v Knowledge Base (min. 3 znaky)

---

## 📊 Nightly Report

Widget v záložce **Noční úlohy** zobrazuje poslední automaticky generovaný denní report (LLM souhrn aktivity agenta za 24h). Lze regenerovat ručně nebo exportovat jako `.md` soubor.

---

## 📱 Mobile PWA

Aplikace funguje jako Progressive Web App. Na mobilu:
1. Otevři `http://<server>:8000` v Chrome/Safari
2. **Add to Home Screen** → standalone ikona
3. Offline dashboard funguje díky Service Worker cache

Touch-friendly UI: min 44px buttons, responsive grid → stack na mobile.

---

## 🔄 Auto-cleanup

Běží automaticky každých 6 hodin – není potřeba manuální údržba:
- Smazání sessions starších 7 dní
- Archivace KB artefaktů starších 30 dní do `data/archive/`
- VACUUM SQLite databází (jobs.db, resident_state.db)
- Stav: `GET /api/health/cleanup`

---

## 📊 Monitoring (Grafana + Slack)

Produkční stack zahrnuje Prometheus + Grafana pro kompletní observability.

### Spuštění

```bash
# Zkopíruj env soubor a doplň Slack webhook
cp .env.example .env
# SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Spusť produkční stack
docker compose -f docker-compose.prod.yml up -d
```

### Přístup

| Služba | URL | Přihlášení |
|--------|-----|-----------|
| App (hub) | http://localhost:8000 | – |
| Grafana | http://localhost:3001 | admin / hub123 |
| Prometheus | http://localhost:9090 | – |

### Dashboard

**AI Home Hub Resident** (`grafana/provisioning/dashboards/ai-home-hub.json`) – automaticky importován při startu Grafany.

Obsahuje 5 panelů:
1. **Resident Health** – Success Rate 24h (Stat, červená <80%, žlutá <90%)
2. **Agent Lifecycle** – Spawned vs Blocked, Queue Depth (Time Series)
3. **Resource Usage** – Memory (GB), Concurrent Agents % (Gauge)
4. **KB Operations** – Reindex Success Rate, Watchdog Triggers (Stat)
5. **Alerts Summary** – Active Failures tabulka (Table)

### Slack Alerts

Alerty se posílají do kanálu `#ai-home-hub`:
- `ResidentSuccessRateLow` – success rate <80% po dobu 15 minut → 🔴 critical
- `AgentMemoryHigh` – memory >4GB po dobu 5 minut → 🟡 warning

Grafana contact point míří na `http://app:8000/api/alerts/slack`.

Test integrace: `POST /api/alerts/test`

### Power Features (Control Room)

| Akce | Endpoint |
|------|----------|
| ⚡ Force Resident Cycle | `POST /api/control/resident/force-cycle` |
| 📥 CSV Export (1000 cyklů) | `GET /api/control/resident/history/csv?limit=1000` |
| 🛑 Graceful Shutdown | `POST /api/control/shutdown-graceful` |
| 🗑️ Purge KB Cache | `POST /api/control/kb/purge-cache` |
| 📌 Grafana Annotation | `POST /api/alerts/annotation` |

---

## 🆘 When things go wrong

1. **Control Room** → zkontroluj Alerts a status agenta
2. **Export Debug** → `GET /api/health/errors` pro posledních 50 chyb
3. **Error Boundary** → při JS crash se zobrazí banner s [Reload] [Export logs]
4. **Persistent History** → `GET /api/agent/history/persistent` – cykly přežívají restart
5. **Self-healing** → agent se po 5 konsekutivních chybách automaticky restartuje

---

## 🚀 Production Deploy (Docker)

Cross-platform deploy přes Docker Compose. Funguje na Linux, Windows (Docker Desktop) i macOS (Docker Desktop).

### Rychlý start (všechny platformy)

```bash
# 1. Zkopíruj .env.prod
cp .env.prod.example .env.prod
# 2. Uprav nastavení dle potřeby
# 3. Spusť
docker compose -f docker-compose.prod.yml up -d

# S Grafana monitoringem:
docker compose -f docker-compose.prod.yml --profile monitoring up -d
```

### Platform-specific deploy

| Platforma | Skript | Popis |
|-----------|--------|-------|
| **Linux** | `sudo bash files/linux/deploy-linux.sh` | Kopíruje do /opt, nastaví systemd službu |
| **Linux + monitoring** | `sudo bash files/linux/deploy-linux.sh --with-monitoring` | + Grafana na portu 3001 |
| **Windows** | `files\windows\install.bat` (jako Admin) | Docker Compose + volitelný scheduled task |
| **macOS** | `bash files/macos/deploy-macos.sh` | Docker Compose + launchd agent |
| **macOS + monitoring** | `bash files/macos/deploy-macos.sh --with-monitoring` | + Grafana na portu 3001 |

### Grafana Dashboards

Při spuštění s `--profile monitoring` je Grafana dostupná na `http://localhost:3001` (default heslo: `admin`/`changeme`).

Dashboard **AI Home Hub – Overview** zobrazuje:
- Resident agent health (success/fail rate, queue depth)
- Job queue status a active jobs
- Ollama request rate a memory usage
- KB reindex jobs a ChromaDB query latency
- Chat latency a upload stats

---

## 💾 Backup & Restore

Cross-platform PowerShell skript pro zálohu dat a SQLite databází.

```bash
# Linux / macOS (vyžaduje pwsh – PowerShell Core)
pwsh scripts/backup.ps1

# Windows (PowerShell je nativní)
pwsh scripts/backup.ps1

# Custom cesta a retence
pwsh scripts/backup.ps1 -BackupDir /mnt/backups -RetentionDays 14
```

### Automatické zálohy

**Linux/macOS (cron):**
```bash
# Každý den ve 3:00
0 3 * * * /usr/bin/pwsh /opt/ai-home-hub/scripts/backup.ps1
```

**Windows (Task Scheduler):**
1. Otevři Task Scheduler
2. Create Basic Task → "AI Home Hub Backup"
3. Trigger: Daily, 3:00 AM
4. Action: Start a program → `pwsh.exe` s argumentem `-File C:\ai-home-hub\scripts\backup.ps1`

### Restore

```bash
# Zastav app
docker compose -f docker-compose.prod.yml down
# Rozbal zálohu
unzip backups/ai-home-hub-backup-YYYY-MM-DD_HH-mm-ss.zip -d data/
# Spusť znovu
docker compose -f docker-compose.prod.yml up -d
```

---

## 🧪 Testy

```bash
cd backend
pytest tests/ -v
```

Testovací skupiny: `test_resident_flow.py`, `test_kb_upload_flow.py`, `test_jobs_api.py`, `test_polish_production.py`, `test_enterprise_deploy.py`

### CI Pipeline

Push/PR na `main` automaticky spouští:
- `pytest` (Python 3.11 + 3.12)
- `black --check` (formátování)
- Validace Grafana dashboard JSON

---

## 📄 Licence

MIT – projekt je lokální a privátní. Sdílej zodpovědně.
