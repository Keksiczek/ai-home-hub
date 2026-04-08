#!/bin/bash
# AI Home Hub – Official entrypoint
# Usage: ./start.sh [--port 8000] [--reload]
#
# This is the single recommended way to start AI Home Hub.
# For advanced orchestration (Ollama auto-start, OpenWebUI, model pulling)
# see run-app.sh (dev/ops helper).

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
VENV="$BACKEND_DIR/venv"
PORT=${PORT:-8000}
RELOAD=""

# Parse args
while [[ $# -gt 0 ]]; do
    case "$1" in
        --port)
            PORT="$2"
            shift 2
            ;;
        --reload)
            RELOAD="--reload"
            shift
            ;;
        *)
            echo "Unknown argument: $1"
            echo "Usage: ./start.sh [--port 8000] [--reload]"
            exit 1
            ;;
    esac
done

echo "╔═══════════════════════════════════╗"
echo "║   AI Home Hub – start.sh         ║"
echo "╚═══════════════════════════════════╝"

# ── Check: Python ────────────────────────────────────────────────────────────
if ! command -v python3 &>/dev/null; then
    echo "[ERR]  Python 3 not found. Install Python 3.11+."
    exit 1
fi

# ── Check: Node.js (for frontend build) ─────────────────────────────────────
if ! command -v node &>/dev/null; then
    echo "[WARN] Node.js not found – skipping frontend build."
    SKIP_FRONTEND=1
fi

# ── Check: Ollama ────────────────────────────────────────────────────────────
if command -v ollama &>/dev/null; then
    if curl -sf http://localhost:11434 &>/dev/null; then
        echo "[OK]   Ollama is running."
    else
        echo "[WARN] Ollama is installed but not running. Start it with: ollama serve"
    fi
else
    echo "[WARN] Ollama not found. LLM features will not work. Install: https://ollama.ai"
fi

# ── Python venv ──────────────────────────────────────────────────────────────
if [ ! -d "$VENV" ]; then
    echo "[INFO] Virtualenv not found, creating..."
    python3.11 -m venv "$VENV" 2>/dev/null || python3 -m venv "$VENV"
    echo "[OK]   Virtualenv created: $VENV"
fi

source "$VENV/bin/activate"

echo "[INFO] Installing Python dependencies..."
pip install -q -r "$BACKEND_DIR/requirements.txt"
echo "[OK]   Dependencies installed."

# ── Build React frontend ────────────────────────────────────────────────────
if [ -d "$SCRIPT_DIR/frontend" ] && [ -z "$SKIP_FRONTEND" ]; then
    echo "[INFO] Building React frontend..."
    cd "$SCRIPT_DIR/frontend"
    npm install --silent 2>/dev/null
    npm run build
    cd "$SCRIPT_DIR"
    echo "[OK]   Frontend built → backend/static/dist/"
fi

# ── Start ────────────────────────────────────────────────────────────────────
cd "$BACKEND_DIR"

echo ""
echo "┌──────────────────────────────────────────┐"
echo "│  Starting AI Home Hub                    │"
echo "│  URL:  http://localhost:${PORT}/              │"
echo "│  API:  http://localhost:${PORT}/docs           │"
echo "│  Mode: $([ -n "$RELOAD" ] && echo 'development (hot-reload)' || echo 'production')  │"
echo "│  Press Ctrl+C to stop                    │"
echo "└──────────────────────────────────────────┘"
echo ""

exec uvicorn app.main:app $RELOAD --host 0.0.0.0 --port "$PORT"
