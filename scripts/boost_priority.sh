#!/bin/bash
# Nastaví vysokou prioritu pro AI Home Hub procesy a swap hint.
# Spouštěj s: sudo bash scripts/boost_priority.sh
#
# POZNÁMKY:
#   - renice na záporné hodnoty vyžaduje sudo; efekt trvá jen do restartu procesu.
#   - vm.swapfilesize je HINT pro macOS dynamic_pager, nikoliv pevný limit.
#     macOS swap je vždy dynamicky spravovaný kernelem; tento sysctl jen nastavuje
#     doporučenou velikost jednoho swapfile souboru (výchozí 1 GB → 2 GB).
#   - Pro trvalý efekt je nutné spouštět skript po každém startu procesů.

echo "=== AI Home Hub – Boost Priority ==="

# 1. Backend (uvicorn / ai-home-hub)
BACKEND_PID=$(pgrep -f "uvicorn|ai.home.hub" | head -1)
if [ -n "$BACKEND_PID" ]; then
    renice -n -10 -p "$BACKEND_PID" 2>&1 && \
        echo "Backend PID $BACKEND_PID: priorita nastavena na -10" || \
        echo "Backend PID $BACKEND_PID: renice selhalo (spusť jako sudo?)"
else
    echo "Backend proces nenalezen (uvicorn / ai.home.hub)"
fi

# 2. Ollama
OLLAMA_PID=$(pgrep -f "ollama" | head -1)
if [ -n "$OLLAMA_PID" ]; then
    renice -n -10 -p "$OLLAMA_PID" 2>&1 && \
        echo "Ollama PID $OLLAMA_PID: priorita nastavena na -10" || \
        echo "Ollama PID $OLLAMA_PID: renice selhalo"
else
    echo "Ollama proces nenalezen"
fi

# 3. Swap hint (dynamic_pager) – doporučená velikost swapfile: 2 GB místo výchozí 1 GB
CURRENT_SWAP=$(sysctl vm.swapusage 2>/dev/null | awk '{print $4}' | tr -d 'M')
echo "Aktuální swap usage: ${CURRENT_SWAP:-?}M"

if sudo sysctl -w vm.swapfilesize=2048 2>/dev/null; then
    echo "Swap soubory (dynamic_pager hint) nastaveny na 2 GB"
else
    echo "vm.swapfilesize: nelze nastavit (macOS verze nebo práva?)"
fi

echo ""
echo "Hotovo. Pro reset spusť: sudo bash scripts/reset_priority.sh"
