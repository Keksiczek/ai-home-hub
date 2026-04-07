#!/bin/bash
# run-app.sh – AI Home Hub launcher
# Usage: ./run-app.sh [dev|prod|stop]
set -euo pipefail

# ── Colors ────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

ok()   { echo -e "${GREEN}[OK]${NC}  $*"; }
info() { echo -e "${CYAN}[INFO]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERR]${NC}  $*" >&2; }

# ── Config ────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
VENV_DIR="$BACKEND_DIR/.venv"
LOG_FILE="$SCRIPT_DIR/ai-home-hub-$(date +%Y%m%d).log"
APP_PORT=8000
OLLAMA_PORT=11434
OPENWEBUI_PORT=8080
HEALTH_URL="http://localhost:${APP_PORT}/api/health/live"
OPENWEBUI_HEALTH_URL="http://localhost:${OPENWEBUI_PORT}/health"
OLLAMA_MODELS=("llama3.2" "qwen2.5-coder:3b" "llava:7b")

MODE="${1:-dev}"

# ── PID tracking ──────────────────────────────────────────────────────────────
OLLAMA_PID=""
APP_PID=""
OPENWEBUI_PID=""

# ── Graceful shutdown ─────────────────────────────────────────────────────────
cleanup() {
    echo ""
    info "Shutting down…"
    [[ -n "$APP_PID" ]]    && kill "$APP_PID"    2>/dev/null && ok "App stopped (PID $APP_PID)"
    [[ -n "$OLLAMA_PID" ]] && kill "$OLLAMA_PID" 2>/dev/null && ok "Ollama stopped (PID $OLLAMA_PID)"
    [[ -n "$OPENWEBUI_PID" ]] && kill "$OPENWEBUI_PID" 2>/dev/null && ok "OpenWebUI stopped (PID $OPENWEBUI_PID)"
    ok "Goodbye."
    exit 0
}
trap cleanup SIGINT SIGTERM

# ── Load .env ─────────────────────────────────────────────────────────────────
if [[ -f "$SCRIPT_DIR/.env" ]]; then
    # shellcheck source=/dev/null
    set -a; source "$SCRIPT_DIR/.env"; set +a
    info "Loaded .env"
fi

# ── Helper: stop all ─────────────────────────────────────────────────────────
stop_all() {
    info "Stopping existing processes…"
    pkill -f "uvicorn app.main" 2>/dev/null && ok "Killed uvicorn" || true
    pkill -f "ollama serve"     2>/dev/null && ok "Killed ollama"  || true
    pkill -f "uvicorn open_webui.main" 2>/dev/null && ok "Killed open-webui" || true
    sleep 1
}

# ── stop command ─────────────────────────────────────────────────────────────
if [[ "$MODE" == "stop" ]]; then
    stop_all
    ok "Done."
    exit 0
fi

# ── Validate mode ────────────────────────────────────────────────────────────
if [[ "$MODE" != "dev" && "$MODE" != "prod" ]]; then
    err "Unknown mode: $MODE  (use: dev | prod | stop)"
    exit 1
fi

# ── Banner ────────────────────────────────────────────────────────────────────
echo -e "${CYAN}"
echo "  ╔═══════════════════════════════╗"
echo "  ║   AI Home Hub  – $MODE mode   ║"
echo "  ╚═══════════════════════════════╝"
echo -e "${NC}"
info "Log → $LOG_FILE"

# ── Kill stale processes ──────────────────────────────────────────────────────
stop_all

# ── Git pull ──────────────────────────────────────────────────────────────────
info "Pulling latest changes…"
if git -C "$SCRIPT_DIR" pull origin main --ff-only >> "$LOG_FILE" 2>&1; then
    ok "Git up to date"
else
    warn "git pull failed (offline or dirty tree) – continuing with local version"
fi

# ── Python venv + deps ────────────────────────────────────────────────────────
info "Setting up Python environment…"
if [[ ! -d "$VENV_DIR" ]]; then
    python3 -m venv "$VENV_DIR" >> "$LOG_FILE" 2>&1
    ok "Created venv at $VENV_DIR"
fi

# shellcheck source=/dev/null
source "$VENV_DIR/bin/activate"

if [[ "$MODE" == "prod" ]]; then
    pip install -r "$BACKEND_DIR/requirements.txt" --quiet >> "$LOG_FILE" 2>&1
else
    REQ_DEV="$BACKEND_DIR/requirements-dev.txt"
    if [[ -f "$REQ_DEV" ]]; then
        pip install -r "$REQ_DEV" --quiet >> "$LOG_FILE" 2>&1
    else
        pip install -r "$BACKEND_DIR/requirements.txt" --quiet >> "$LOG_FILE" 2>&1
    fi
fi
ok "Dependencies installed"

# ── Shared local LLM config ───────────────────────────────────────────────────
# LOCAL_LLM_* vars are the canonical source; legacy OLLAMA_* are fallbacks.
export LOCAL_LLM_PROVIDER="${LOCAL_LLM_PROVIDER:-ollama}"
export LOCAL_LLM_BASE_URL="${LOCAL_LLM_BASE_URL:-${OLLAMA_BASE_URL:-http://127.0.0.1:11434}}"
export LOCAL_LLM_MODEL="${LOCAL_LLM_MODEL:-qwen2.5:1.5b}"
# Ensure OLLAMA_BASE_URL stays in sync (used by OpenWebUI)
export OLLAMA_BASE_URL="${LOCAL_LLM_BASE_URL}"

# ── Ollama performance tuning ─────────────────────────────────────────────────
# These can be overridden in .env; here we set safe defaults for an 8 GB Mac.
export OLLAMA_FLASH_ATTENTION="${OLLAMA_FLASH_ATTENTION:-1}"
export OLLAMA_KV_CACHE_TYPE="${OLLAMA_KV_CACHE_TYPE:-q8_0}"
export OLLAMA_NUM_PARALLEL="${OLLAMA_NUM_PARALLEL:-1}"
export OLLAMA_CONTEXT_LENGTH="${OLLAMA_CONTEXT_LENGTH:-4096}"
export OLLAMA_KEEP_ALIVE="${OLLAMA_KEEP_ALIVE:-5m}"
info "Ollama perf: CTX=${OLLAMA_CONTEXT_LENGTH} KV=${OLLAMA_KV_CACHE_TYPE} FA=${OLLAMA_FLASH_ATTENTION} PAR=${OLLAMA_NUM_PARALLEL} ALIVE=${OLLAMA_KEEP_ALIVE}"

# ── Ollama ────────────────────────────────────────────────────────────────────
info "Checking Ollama…"
if ! command -v ollama &>/dev/null; then
    err "Ollama not found. Install: brew install ollama"
    exit 1
fi

if curl -sf "http://localhost:${OLLAMA_PORT}" &>/dev/null; then
    ok "Ollama already running"
else
    info "Starting Ollama server…"
    ollama serve >> "$LOG_FILE" 2>&1 &
    OLLAMA_PID=$!
    # Wait up to 15s for Ollama to be ready
    for i in $(seq 1 15); do
        if curl -sf "http://localhost:${OLLAMA_PORT}" &>/dev/null; then
            ok "Ollama ready (PID $OLLAMA_PID)"
            break
        fi
        [[ $i -eq 15 ]] && { err "Ollama failed to start"; exit 1; }
        sleep 1
    done
fi

# Pull models (skip if already present)
for model in "${OLLAMA_MODELS[@]}"; do
    if ollama list 2>/dev/null | grep -q "^${model}"; then
        ok "Model present: $model"
    else
        info "Pulling model: $model (this may take a while…)"
        ollama pull "$model" >> "$LOG_FILE" 2>&1 && ok "Pulled: $model" || warn "Failed to pull $model – continuing"
    fi
done

# ── Start application ─────────────────────────────────────────────────────────
cd "$BACKEND_DIR"

if [[ "$MODE" == "dev" ]]; then
    info "Starting app in DEV mode (hot-reload)…"
    uvicorn app.main:app --reload --host 0.0.0.0 --port "$APP_PORT" \
        --workers 1 >> "$LOG_FILE" 2>&1 &
else
    info "Starting app in PROD mode…"
    uvicorn app.main:app --host 0.0.0.0 --port "$APP_PORT" \
        --workers 1 >> "$LOG_FILE" 2>&1 &
fi
APP_PID=$!
ok "App started (PID $APP_PID)"

# ── Start OpenWebUI ───────────────────────────────────────────────────────────
if [[ -f "$SCRIPT_DIR/run_openwebui.sh" ]]; then
    info "Starting OpenWebUI service…"
    "$SCRIPT_DIR/run_openwebui.sh" >> "$LOG_FILE" 2>&1 &
    OPENWEBUI_PID=$!
    ok "OpenWebUI started (PID $OPENWEBUI_PID)"
fi

# ── Health check ──────────────────────────────────────────────────────────────
info "Waiting for app to be healthy…"
HEALTH_OK=false
for i in $(seq 1 30); do
    if curl -sf "$HEALTH_URL" &>/dev/null; then
        HEALTH_OK=true
        ok "Health check passed (${i}s)"
        break
    fi
    sleep 1
done

info "Waiting for OpenWebUI to be healthy…"
OPENWEBUI_OK=false
if [[ -n "$OPENWEBUI_PID" ]]; then
    for i in $(seq 1 30); do
        if curl -sf "$OPENWEBUI_HEALTH_URL" &>/dev/null; then
            OPENWEBUI_OK=true
            ok "OpenWebUI health check passed (${i}s)"
            break
        fi
        sleep 1
    done
else
    # Check if maybe it was already running outside this script
    if curl -sf "$OPENWEBUI_HEALTH_URL" &>/dev/null; then
        OPENWEBUI_OK=true
        ok "OpenWebUI already running and healthy"
    fi
fi

if [[ "$HEALTH_OK" == false ]]; then
    err "App did not become healthy within 30s"
    err "Check logs: tail -f $LOG_FILE"
    exit 1
fi

# ── Open browser (macOS only) ─────────────────────────────────────────────────
if command -v open &>/dev/null; then
    open "http://localhost:${APP_PORT}/" 2>/dev/null || true
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}┌──────────────────────────────────────────────────────┐${NC}"
echo -e "${GREEN}│  AI Home Hub is running!                             │${NC}"
echo -e "${GREEN}│  Dashboard : http://localhost:${APP_PORT}/                │${NC}"
echo -e "${GREEN}│  OpenWebUI : http://localhost:${OPENWEBUI_PORT}/                │${NC}"
echo -e "${GREEN}│  API       : http://localhost:${APP_PORT}/api             │${NC}"
echo -e "${GREEN}│  Logs      : $(basename "$LOG_FILE")               │${NC}"
echo -e "${GREEN}│  Press Ctrl+C to stop                                │${NC}"
echo -e "${GREEN}│──────────────────────────────────────────────────────│${NC}"
echo -e "${GREEN}│  Shared LLM: ${LOCAL_LLM_PROVIDER} @ ${LOCAL_LLM_BASE_URL}${NC}"
echo -e "${GREEN}│  Model     : ${LOCAL_LLM_MODEL}${NC}"
echo -e "${GREEN}│  OpenWebUI : http://localhost:${OPENWEBUI_PORT}/ → shares Ollama${NC}"
echo -e "${GREEN}│  OpenClaw  : see integration/openclaw/              │${NC}"
echo -e "${GREEN}└──────────────────────────────────────────────────────┘${NC}"
echo ""

# Keep script alive (wait for background processes)
wait "$APP_PID"
