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

## 🏥 Health & Metrics

### Startup component health

Aplikace startuje i bez Ollaamy – přechází do **degraded mode** místo pádu.
Výsledek startup kontroly je dostupný jako:

```
GET /api/system/health
```

Příklad odpovědi:

```json
{
  "ollama": "ok",
  "kb": "ok",
  "jobs_db": "ok",
  "overall": "healthy",
  "ollama_models": ["llama3.2:latest"]
}
```

Možné stavy per-komponenty: `"ok"`, `"degraded"`, `"unavailable"`, `"error"`.
`overall`: `"healthy"`, `"degraded"`, `"critical"`.

### Safe mode (bez Ollama)

Spustit app bez Ollama (LLM funkce budou nedostupné, vše ostatní funguje):

```bash
# Ollama nemusí běžet – app nastartuje s "ollama: unavailable"
./run-app.sh

# Ověření stavu:
curl http://localhost:8000/api/system/health
```

Dashboard automaticky zobrazí alert `"Ollama degraded – LLM features unavailable"`.

### Prometheus metriky

| Metrika | Typ | Popis |
|---------|-----|-------|
| `agent_spawn_blocked_total{reason}` | Counter | Blocked spawn pokusy (`resource`, `concurrent_limit`, `experimental`) |
| `resident_cycles_total{status}` | Counter | Výsledky cyklů (`success`, `fail`, `aborted`) |
| `kb_reindex_jobs_total{status}` | Counter | KB reindex joby (`queued`, `success`, `fail`) |
| `resident_queue_depth` | Gauge | Počet čekajících tasků v resident frontě |

Všechny metriky jsou dostupné na `GET /metrics` (Prometheus scrape endpoint).

### Resident dashboard (Control Room)

`GET /api/resident/dashboard` vrací rozšířená data:

```json
{
  "status": "running",
  "health": { "ollama": "ok", "overall": "healthy" },
  "metrics_24h": {
    "cycles_total": 42,
    "success_rate": 0.92,
    "avg_cycle_duration_s": 127.3
  },
  "alerts": ["Queue depth high", "Ollama degraded"],
  "current_task": { ... },
  "recent_tasks": [ ... ]
}
```

### Structured agent spawn errors

Při blokování spawnu agent vrátí strukturovanou HTTP 429 odpověď:

```json
{
  "detail": {
    "error": "spawn_blocked",
    "reason": "resource"
  }
}
```

Možné `reason` hodnoty: `"resource"`, `"concurrent_limit"`, `"experimental"`.

---

## 🧪 Testy

```bash
cd backend
pytest tests/ -v
```

Testovací skupiny: `test_resident_flow.py`, `test_kb_upload_flow.py`, `test_jobs_api.py`, `test_resident_health.py`

---

## 🔒 Safe Mode & Guardrails (Hardening v2)

Resident Agent podporuje konfigurovatelné guardrails pro bezpečný 24/7 autonomous provoz.

### Safe Mode

Aktivuj Safe Mode pro konzervativní limity:

```bash
# Přes API
curl -X POST http://localhost:8000/api/settings/safe-mode \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'

# Nebo v docker-compose s .env:
docker-compose up --env-file .env.safe
```

**Co Safe Mode dělá:**
- Zamkne Resident Agent na `observer` mód (žádné destruktivní akce)
- Omezí concurrent agents na 1
- Snižuje agent guardrails (max_steps=8, max_tokens=16k)
- Zakáže experimentální agenty (devops, testing)

### Autonomy Levels (Action Tiers)

| Level | Povolené akce |
|-------|---------------|
| `observer` | Pouze čtení stavu (system_health, no_op, ...) |
| `advisor` | + čtení souborů, git status, KB search |
| `autonomous` | Všechny akce včetně git_operations, spawn_devops_agent |

### Cooldowns per action

| Akce | Cooldown |
|------|----------|
| `git_operations` | 1 hodina |
| `system_commands` | 2 hodiny |
| `spawn_devops_agent` | 24 hodin |

### Daily Budgets

Každá nebezpečná akce má denní limit (reset o půlnoci UTC):
- `git_operations`: 5×/den
- `system_commands`: 3×/den
- `spawn_devops_agent`: 1×/den

### Guardrail tuning

Uprav přes API nebo v `backend/data/settings.json` pod klíčem `guardrails`:

```json
{
  "guardrails": {
    "safe_mode": false,
    "resident": {
      "autonomy_level": "advisor",
      "interval_seconds": 900,
      "max_cycles_per_day": 96
    }
  }
}
```

Defaulty jsou konzervativní pro 24/7 provoz.

### Migrace ze starší konfigurace

```bash
python scripts/migrate-settings-v1-to-v2.py
# nebo dry-run:
python scripts/migrate-settings-v1-to-v2.py --dry-run
```

---

## 📄 Licence

MIT – projekt je lokální a privátní. Sdílej zodpovědně.
