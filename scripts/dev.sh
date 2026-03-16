#!/usr/bin/env bash
# scripts/dev.sh – AI Home Hub dev helper
# Usage: ./scripts/dev.sh <start|stop|update|status>
#
# Design decision: git pull is intentionally NOT part of `start` – it is only
# done in `update`. This lets you start the app quickly from whatever local
# state you have without unexpected code changes mid-session.
set -euo pipefail

# ── Colors ────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

ok()   { echo -e "${GREEN}[OK]${NC}  $*"; }
info() { echo -e "${CYAN}[INFO]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERR]${NC}  $*" >&2; }

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
RUN_SCRIPT="$REPO_DIR/run-app.sh"
APP_PORT=8000
TAILSCALE_TARGET="localhost:${APP_PORT}"

# ── Helpers ───────────────────────────────────────────────────────────────────
_app_running() {
  curl -sf "http://localhost:${APP_PORT}/api/health/live" &>/dev/null
}

_tailscale_available() {
  command -v tailscale &>/dev/null
}

_tailscale_funnel_active() {
  _tailscale_available || return 1
  tailscale funnel status 2>/dev/null | grep -q "${APP_PORT}" || return 1
}

_start_tailscale_funnel() {
  if ! _tailscale_available; then
    warn "Tailscale není nainstalovaný – tunel neaktivován."
    warn "Instalace: brew install tailscale  nebo  https://tailscale.com/download"
    return 0
  fi
  if _tailscale_funnel_active; then
    ok "Tailscale funnel už běží pro port ${APP_PORT}"
    return 0
  fi
  info "Spouštím Tailscale funnel pro ${TAILSCALE_TARGET}…"
  if tailscale funnel --bg "${TAILSCALE_TARGET}" 2>/dev/null; then
    ok "Tailscale funnel spuštěn"
  else
    warn "tailscale funnel se nepodařilo spustit (zkontroluj tailscale status a oprávnění)"
  fi
}

_stop_tailscale_funnel() {
  if ! _tailscale_available; then
    return 0
  fi
  info "Vypínám Tailscale funnel pro ${TAILSCALE_TARGET}…"
  # Idempotent – pokud funnel neběží, příkaz skončí s OK
  tailscale funnel off "${TAILSCALE_TARGET}" 2>/dev/null && ok "Tailscale funnel zastaven" || true
}

# ── Commands ──────────────────────────────────────────────────────────────────

cmd_start() {
  echo -e "${CYAN}"
  echo "  ╔════════════════════════════════╗"
  echo "  ║   AI Home Hub – dev start      ║"
  echo "  ╚════════════════════════════════╝"
  echo -e "${NC}"

  if _app_running; then
    warn "Backend už běží na portu ${APP_PORT}."
    _start_tailscale_funnel
    ok "Nic nestartuje – vše je již aktivní."
    return 0
  fi

  chmod +x "$RUN_SCRIPT"
  info "Spouštím backend (run-app.sh dev)…"
  # run-app.sh spouštíme na pozadí – předá si vlastní PID tracking
  "$RUN_SCRIPT" dev &
  local run_pid=$!

  # Počkej max 60s na health check
  info "Čekám na health check (max 60s)…"
  local i=0
  while [[ $i -lt 60 ]]; do
    if _app_running; then
      ok "Backend je připraven (${i}s)"
      break
    fi
    sleep 1
    i=$((i + 1))
  done

  if ! _app_running; then
    err "Backend se nespustil do 60s. Zkontroluj logy: ls -t ${REPO_DIR}/ai-home-hub-*.log | head -1 | xargs tail -50"
    kill "$run_pid" 2>/dev/null || true
    exit 1
  fi

  _start_tailscale_funnel

  echo ""
  echo -e "${GREEN}┌────────────────────────────────────────┐${NC}"
  echo -e "${GREEN}│  ✓ AI Home Hub běží                    │${NC}"
  echo -e "${GREEN}│  Dashboard : http://localhost:${APP_PORT}/    │${NC}"
  echo -e "${GREEN}│  API       : http://localhost:${APP_PORT}/api │${NC}"
  echo -e "${GREEN}│  Zastavit  : ./scripts/dev.sh stop     │${NC}"
  echo -e "${GREEN}└────────────────────────────────────────┘${NC}"
  echo ""

  # Drž skript naživu, aby Ctrl+C zastavilo vše
  wait "$run_pid" || true
}

cmd_stop() {
  info "Zastavuji AI Home Hub…"
  _stop_tailscale_funnel
  if [[ -x "$RUN_SCRIPT" ]]; then
    "$RUN_SCRIPT" stop
  else
    # Záložní metoda: přímý pkill
    pkill -f "uvicorn app.main" 2>/dev/null && ok "Zabit uvicorn" || true
    pkill -f "ollama serve"     2>/dev/null && ok "Zabit ollama"  || true
  fi
  ok "Hotovo."
}

cmd_update() {
  info "Aktualizuji repozitář (git pull)…"
  if git -C "$REPO_DIR" pull origin main --ff-only; then
    ok "Repozitář aktualizován"
  else
    warn "git pull selhal (offline nebo dirty tree) – pokračuji s lokální verzí"
  fi

  if _app_running; then
    info "Restartuji backend…"
    cmd_stop
    sleep 2
  fi
  cmd_start
}

cmd_status() {
  echo ""
  echo "── AI Home Hub status ──────────────────────────"

  if _app_running; then
    echo -e "  Backend  : ${GREEN}RUNNING${NC}  (port ${APP_PORT})"
  else
    echo -e "  Backend  : ${RED}STOPPED${NC}  (port ${APP_PORT})"
  fi

  local uvicorn_pids
  uvicorn_pids=$(pgrep -f "uvicorn app.main" 2>/dev/null | tr '\n' ' ' || true)
  if [[ -n "$uvicorn_pids" ]]; then
    echo -e "  Uvicorn  : PID ${uvicorn_pids}"
  fi

  local ollama_pids
  ollama_pids=$(pgrep -f "ollama serve" 2>/dev/null | tr '\n' ' ' || true)
  if [[ -n "$ollama_pids" ]]; then
    echo -e "  Ollama   : PID ${ollama_pids}"
  else
    echo -e "  Ollama   : ${YELLOW}not running${NC}"
  fi

  if _tailscale_available; then
    if _tailscale_funnel_active; then
      echo -e "  Tailscale: ${GREEN}funnel ACTIVE${NC}  (${TAILSCALE_TARGET})"
    else
      echo -e "  Tailscale: ${YELLOW}funnel INACTIVE${NC}"
    fi
  else
    echo -e "  Tailscale: ${YELLOW}not installed${NC}"
  fi

  echo "────────────────────────────────────────────────"
  echo ""
}

# ── Entry point ───────────────────────────────────────────────────────────────
CMD="${1:-}"
case "$CMD" in
  start)  cmd_start  ;;
  stop)   cmd_stop   ;;
  update) cmd_update ;;
  status) cmd_status ;;
  *)
    echo "Použití: $0 <start|stop|update|status>"
    echo ""
    echo "  start   – spustí backend + Tailscale funnel"
    echo "  stop    – zastaví Tailscale funnel + backend"
    echo "  update  – git pull + restart"
    echo "  status  – zobrazí stav procesů"
    exit 1
    ;;
esac
