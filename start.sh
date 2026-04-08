#!/usr/bin/env bash
# start.sh – AI Home Hub official entrypoint
#
# Single recommended way to start AI Home Hub.
# Designed for both interactive terminal use and automated execution
# (launchd, systemd, or any process supervisor).
#
# Usage: ./start.sh [OPTIONS]
#
# Options:
#   --port PORT        Listen port (default: 8000, or $PORT env)
#   --reload           Enable uvicorn hot-reload (development)
#   --check            Validate environment only, do not start
#   --backend-only     Start backend without building frontend
#   --no-build         Skip frontend build, use existing artifacts
#   --help             Show this help
#
# Exit codes:
#   0  Success (or --check passed)
#   1  Missing hard dependency or configuration error
#   2  Frontend build artifacts missing (with --no-build)
#   3  Backend failed to start

set -euo pipefail

# ── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
FRONTEND_DIST="$BACKEND_DIR/static/dist"
VENV="$BACKEND_DIR/venv"

# ── Defaults ─────────────────────────────────────────────────────────────────
PORT="${PORT:-8000}"
RELOAD=""
MODE="full"          # full | check | backend-only
SKIP_BUILD=0

# ── Logging ──────────────────────────────────────────────────────────────────
log_info()  { echo "[INFO]  $*"; }
log_ok()    { echo "[OK]    $*"; }
log_warn()  { echo "[WARN]  $*" >&2; }
log_error() { echo "[ERROR] $*" >&2; }
die()       { log_error "$*"; exit 1; }

# ── Usage ────────────────────────────────────────────────────────────────────
usage() {
    cat <<'HELP'
start.sh – AI Home Hub official entrypoint

Usage: ./start.sh [OPTIONS]

Modes:
  (default)          Build frontend + start backend (full stack)
  --check            Validate environment, print status, exit
  --backend-only     Start backend without frontend build
  --no-build         Skip frontend build, use existing dist/

Options:
  --port PORT        Listen port (default: 8000, env $PORT)
  --reload           Uvicorn hot-reload (development)
  --help             Show this help

Examples:
  ./start.sh                      # normal start
  ./start.sh --check              # CI / smoke test
  ./start.sh --backend-only       # agent/API server, no UI build
  ./start.sh --no-build --port 9000
HELP
    exit 0
}

# ── Parse arguments ──────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
    case "$1" in
        --port)
            [[ -n "${2:-}" ]] || die "--port requires a value"
            PORT="$2"; shift 2 ;;
        --reload)
            RELOAD="--reload"; shift ;;
        --check)
            MODE="check"; shift ;;
        --backend-only)
            MODE="backend-only"; shift ;;
        --no-build)
            SKIP_BUILD=1; shift ;;
        --help|-h)
            usage ;;
        *)
            die "Unknown argument: $1  (try --help)" ;;
    esac
done

# ── Banner ───────────────────────────────────────────────────────────────────
log_info "AI Home Hub – start.sh"
log_info "workdir: $SCRIPT_DIR"
log_info "mode:    $MODE"

# ── Dependency checks ────────────────────────────────────────────────────────

check_python() {
    if ! command -v python3 &>/dev/null; then
        log_error "python3 not found (hard dependency)"
        return 1
    fi
    log_ok "python3: $(python3 --version 2>&1)"
    return 0
}

check_node() {
    if ! command -v node &>/dev/null; then
        if [[ "$MODE" == "backend-only" ]] || [[ "$SKIP_BUILD" -eq 1 ]]; then
            log_warn "node not found (not needed for current mode)"
            return 0
        fi
        log_error "node not found (required for frontend build)"
        log_error "Install Node.js 18+ or use --backend-only / --no-build"
        return 1
    fi
    log_ok "node:    $(node --version 2>&1)"
    return 0
}

check_ollama() {
    if ! command -v ollama &>/dev/null; then
        log_warn "ollama not found – LLM features will not work"
        log_warn "Install: https://ollama.ai"
        return 0
    fi
    if curl -sf --max-time 2 http://localhost:11434 &>/dev/null; then
        log_ok "ollama:  running (localhost:11434)"
    else
        log_warn "ollama installed but not running – start with: ollama serve"
    fi
    return 0
}

check_frontend_dist() {
    if [[ -f "$FRONTEND_DIST/index.html" ]]; then
        log_ok "frontend dist: $FRONTEND_DIST/index.html exists"
        return 0
    fi
    log_warn "frontend dist: not found at $FRONTEND_DIST/"
    return 1
}

CHECKS_OK=0
check_python  || CHECKS_OK=1
check_node    || CHECKS_OK=1
check_ollama  || true  # ollama is optional, never fails the check

# In --no-build mode, frontend artifacts must already exist
if [[ "$SKIP_BUILD" -eq 1 ]] && [[ "$MODE" != "backend-only" ]]; then
    check_frontend_dist || {
        log_error "Frontend build artifacts missing. Run without --no-build first."
        exit 2
    }
fi

# ── --check mode: report and exit ────────────────────────────────────────────
if [[ "$MODE" == "check" ]]; then
    echo ""
    check_frontend_dist || true
    if [[ "$CHECKS_OK" -eq 0 ]]; then
        log_ok "Environment OK"
        exit 0
    else
        log_error "Environment has issues (see above)"
        exit 1
    fi
fi

# Hard fail if critical checks failed
[[ "$CHECKS_OK" -eq 0 ]] || exit 1

# ── Python virtualenv ────────────────────────────────────────────────────────
if [[ ! -d "$VENV" ]]; then
    log_info "Creating virtualenv: $VENV"
    python3.11 -m venv "$VENV" 2>/dev/null || python3 -m venv "$VENV"
fi
# shellcheck source=/dev/null
source "$VENV/bin/activate"

log_info "Installing Python dependencies..."
pip install -q -r "$BACKEND_DIR/requirements.txt"
log_ok "Python dependencies installed"

# ── Frontend build ───────────────────────────────────────────────────────────
if [[ "$MODE" == "backend-only" ]]; then
    log_info "Skipping frontend build (--backend-only)"
elif [[ "$SKIP_BUILD" -eq 1 ]]; then
    log_info "Skipping frontend build (--no-build)"
elif [[ -d "$FRONTEND_DIR" ]]; then
    log_info "Building React frontend..."
    (cd "$FRONTEND_DIR" && npm install --silent 2>/dev/null && npm run build)
    log_ok "Frontend built -> $FRONTEND_DIST/"
else
    log_warn "frontend/ directory not found, skipping build"
fi

# ── Start backend ────────────────────────────────────────────────────────────
cd "$BACKEND_DIR"

log_info "--- startup summary ---"
log_info "  url:      http://localhost:${PORT}/"
log_info "  api docs: http://localhost:${PORT}/docs"
log_info "  port:     $PORT"
log_info "  reload:   $([ -n "$RELOAD" ] && echo 'yes' || echo 'no')"
log_info "  frontend: $([ "$MODE" == "backend-only" ] && echo 'skipped' || echo 'included')"
log_info "  pid:      $$"
log_info "-----------------------"

exec uvicorn app.main:app $RELOAD --host 0.0.0.0 --port "$PORT"
