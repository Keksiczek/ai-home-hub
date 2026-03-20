#!/bin/bash
# Resetuje procesní priority a swap hint na výchozí hodnoty.
# Spouštěj s: sudo bash scripts/reset_priority.sh

echo "=== AI Home Hub – Reset Priority ==="

BACKEND_PID=$(pgrep -f "uvicorn|ai.home.hub" | head -1)
OLLAMA_PID=$(pgrep -f "ollama" | head -1)

if [ -n "$BACKEND_PID" ]; then
    renice -n 0 -p "$BACKEND_PID" 2>&1 && echo "Backend PID $BACKEND_PID: priorita resetována na 0"
else
    echo "Backend proces nenalezen"
fi

if [ -n "$OLLAMA_PID" ]; then
    renice -n 0 -p "$OLLAMA_PID" 2>&1 && echo "Ollama PID $OLLAMA_PID: priorita resetována na 0"
else
    echo "Ollama proces nenalezen"
fi

# Reset swap hint na výchozí 1 GB (dynamic_pager)
if sudo sysctl -w vm.swapfilesize=1024 2>/dev/null; then
    echo "Swap hint resetován na 1 GB"
else
    echo "vm.swapfilesize: reset přeskočen"
fi

echo "Priority resetovány."
