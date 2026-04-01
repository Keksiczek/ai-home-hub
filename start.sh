#!/bin/bash
# Spustí ai-home-hub backend
# Použití: ./start.sh [--port 8000] [--reload]

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
            echo "Neznámý argument: $1"
            exit 1
            ;;
    esac
done

echo "╔═══════════════════════════════════╗"
echo "║   AI Home Hub – start.sh         ║"
echo "╚═══════════════════════════════════╝"

# Zkontrolovat venv
if [ ! -d "$VENV" ]; then
    echo "[INFO] Virtualenv nenalezen, vytvářím..."
    python3.11 -m venv "$VENV" 2>/dev/null || python3 -m venv "$VENV"
    echo "[OK]   Virtualenv vytvořen: $VENV"
fi

# Aktivovat venv
source "$VENV/bin/activate"

# Instalovat/aktualizovat dependencies
echo "[INFO] Instaluji dependencies..."
pip install -q -r "$BACKEND_DIR/requirements.txt"
echo "[OK]   Dependencies nainstalovány"

# Spustit
cd "$BACKEND_DIR"
echo "[INFO] Startuji na portu $PORT..."
exec uvicorn app.main:app ${RELOAD:---reload} --host 0.0.0.0 --port "$PORT"
