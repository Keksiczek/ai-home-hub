# AI Home Hub – Mac Control Center

Lokální AI orchestrační centrum pro macOS, které propojuje Ollama, lokální nástroje (VS Code, git, filesystem) a agentní orchestraci do jednoho dashboardu. Běží plně lokálně na tvém Macu, optimalizované pro stroje typu MacBook Pro 2019 (Intel, 8 GB RAM).

> ⚠️ Projekt je v aktivním vývoji. API se může měnit.

---

## Hlavní funkce

- **Jednotný dashboard**
  - Reálný přehled o CPU/RAM (včetně Ollama RSS) přes Resource Monitor.
  - Panel Resident Agent (stav, poslední kroky, historie jobů).
  - Overnight Jobs panel (naplánované noční joby, poslední běhy).
  - Agent Guardrails vizualizace + toggles pro experimentální featury.

- **Lokální LLM orchestrátor**
  - Napojení na Ollama (modely: `llama3.2`, `qwen2.5-coder:3b`, `llava:7b`).
  - Model routing přes profil → model (`coding` → `qwen2.5-coder:3b`, `summarize` → `llama3.2`).
  - Guardrails per agent: `max_steps`, `step_timeout_s`, `max_total_tokens` a experimental flags.

- **Resident Agent (daemon)**
  - Dlouho běžící asyncio agent, který každých X sekund:
    - čte joby z fronty,
    - staví kontext (system summary, allowed_actions, posledních N kroků),
    - volá LLM, které vrací **pouze JSON**, a deterministický dispatcher provede akci,
    - umí agent handoff přes `spawn_specialist`.
  - Každý krok má vlastní `asyncio.timeout` podle `AgentGuardrails`.

- **Knowledge Base & RAG**
  - KB index v ChromaDB (lokální persistent mód).
  - KB Context Filter – summarizační bariéra mezi raw RAG výsledky a agentním kontextem.
  - History compression – průběžná komprese konverzační historie do shrnutí.
  - Nightly `kb_reindex` (inkrementální) přes NightScheduler.

- **NightScheduler (overnight jobs)**
  - Noční okno: 22:00–06:00 lokální čas, dedup per den.
  - Vestavěné joby:
    - `kb_reindex` – inkrementální reindex znalostní báze,
    - `git_sweep` – scan & housekeeping VS Code projektů,
    - `nightly_summary` – LLM denní report uložený do ChromaDB memory.

- **Job systém**
  - Fronta jobů (ad hoc i plánované).
  - Job Worker daemon s guardraily, timeouty a WS broadcasting stavu.

- **Filesystem & integrace**
  - Bezpečné FS operace nad explicitně povolenými adresáři.
  - Integrace s VS Code projekty.
  - Hooky pro další integrace (MCP, devops/testing agenti jako experimentální features).

- **WebSocket real-time UI**
  - Async parallel broadcast (`asyncio.gather`) do více klientů.
  - SPA klient s automatickým reconnectem (exponential backoff + jitter, ping/pong keepalive).
  - Connection status indikátor (connected / reconnecting / failed).

- **Stability & guardrails**
  - Daemony postavené na `BackgroundService` base class (čisté start/stop, `CancelledError` handling).
  - Centrální `TaskSupervisor`: registrace tasků, monitoring výjimek, restart politika, stav v `/api/health`.
  - Chroma zápisy serializované přes globální `asyncio.Lock` + `asyncio.to_thread`.
  - Ollama `keep_alive` řízený per model/profil pro šetrné zacházení s 8 GB RAM.

---

## Architektura

### Backend stack

- Python 3.11+, FastAPI, asyncio
- ChromaDB (lokální persistent mód)
- Ollama (lokální LLM server)
- psutil (ResourceMonitor)

### Klíčové adresáře

```
backend/
  app/
    main.py               # FastAPI entrypoint, lifespan, TaskSupervisor
    routers/              # REST + WebSocket endpointy
    services/
      background_service.py   # Base class pro daemony
      task_supervisor.py      # Centrální supervision background tasků
      resident_agent.py       # Dlouho běžící agentní daemon
      night_scheduler.py      # Overnight job scheduler
      resource_monitor.py     # psutil daemon + WS broadcast
      job_worker.py           # Job fronta a worker
      vector_store_service.py # ChromaDB abstrakce + write lock
      kb_watchdog.py          # Filesystem watching (watchdog/FSEvents)
      ws_manager.py           # WebSocket ConnectionManager
      ...
    engines/              # LLM routing, Ollama klient, guardrails
    middleware/           # Logging, rate limiting
  static/                # Frontend SPA
docs/                    # API kontrakt, architektura
```

### LLM a RAM optimalizace

- `MODEL_ROUTING` + `resolve_model(profile)` mapuje profily na Ollama modely.
- `AgentGuardrails` dataclass: `max_steps`, `step_timeout_s`, `max_total_tokens`, experimental flags.
- `keep_alive` per model:
  - `qwen2.5-coder:3b` → `120s`
  - `llama3.2` → `60s`
  - `llava:7b` → `0` (unload hned po použití)
  - overnight joby → `0` (čistá RAM po skončení)
- `asyncio.timeout` kolem každého LLM volání (z guardrails nebo fixní konstanty).

### ChromaDB

- Jeden sdílený `PersistentClient` per proces.
- Zápisy přes globální `asyncio.Lock` + `asyncio.to_thread`.
- Reads běží paralelně bez locku.
- `/api/health/ready` má `asyncio.timeout(2.0)` kolem `get_stats()`.

---

## Požadavky

- **Hardware:** MacBook Pro 2019 (Intel i5, 8 GB RAM) nebo ekvivalent
- **OS:** macOS
- **Software:** Python 3.11+, Ollama (latest stable)

> Na 8 GB RAM doporučujeme mít v daný moment aktivní jen jeden větší model.

---

## Instalace a spuštění

### 1. Klonování repozitáře

```bash
git clone https://github.com/Keksiczek/ai-home-hub.git
cd ai-home-hub/backend
```

### 2. Python prostředí

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Ollama

```bash
# Spusť Ollama server
ollama serve

# Stáhni modely
ollama pull llama3.2
ollama pull qwen2.5-coder:3b
ollama pull llava:7b
```

### 4. Spuštění backendu

```bash
uvicorn app.main:app --reload
```

- Dashboard: `http://localhost:8000/`
- API: `http://localhost:8000/api/...`
- WebSocket: `ws://localhost:8000/ws`

> ⚠️ Vždy spouštěj s `--workers 1` (výchozí pro `--reload`). Více workerů není podporováno kvůli lokální ChromaDB a per-process write locku.

---

## API (výběr)

| Endpoint | Popis |
|---|---|
| `GET /api/health` | Souhrnný health (komponenty, WS connections, background tasks) |
| `GET /api/health/live` | Liveness probe |
| `GET /api/health/ready` | Readiness probe (ChromaDB check s timeoutem) |
| `GET /api/health/setup` | Checklist první konfigurace |
| `DELETE /api/embeddings/cache` | Vyprázdnění embeddings cache |
| `POST /api/chat` | LLM chat |
| `POST /api/chat_multimodal` | Multimodální chat (llava) |
| `/api/agents`, `/api/tasks`, `/api/jobs` | Agent orchestrace a job systém |
| `/api/resident` | Resident Agent kontrola |
| `/api/knowledge`, `/api/memory` | RAG a vektorová paměť |
| `/api/files`, `/api/filesystem` | Filesystem operace |
| `/api/settings` | Konfigurace |
| `/api/media`, `/api/document-analysis` | Media a dokumenty |

---

## Roadmap

### Hotovo

- ✅ BackgroundService base class + TaskSupervisor
- ✅ ChromaDB write lock + health timeout
- ✅ Ollama `keep_alive` per model/profil
- ✅ `asyncio.timeout` kolem všech LLM volání
- ✅ WebSocket parallel broadcast + frontend reconnect + status indikátor
- ✅ pytest-asyncio testy pro daemony a TaskSupervisor
- ✅ Filesystem watching (watchdog + FSEvents + debounce → KB dirty flag)

### Plánováno

- 🔲 Rozšíření experimentálních agentů (openclaw, antigravity, devops/testing)
- 🔲 Vylepšený knowledge management (tagging, multi-KB)
- 🔲 Monitoring metriky (Prometheus endpoint / lokální logging)
- 🔲 Separace heavy jobů do samostatného worker procesu
- 🔲 Rozšíření integrací (Home Assistant, další IDE)

---

## Licence

MIT – viz [LICENSE](LICENSE) (doplnit).
