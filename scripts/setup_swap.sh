#!/bin/bash
# Skript pro optimalizaci paměti na MacBooku Pro 2019 (8 GB RAM)
# pro běh AI Home Hub s Ollama modely

echo "=== AI Home Hub – Memory Optimization ==="

# 1. Zkontroluj aktuální swap
echo ""
echo "Aktuální stav paměti:"
vm_stat | grep -E "Pages (free|active|inactive|wired|speculative)"
sysctl vm.swapusage

# 2. Uvolni neaktivní paměť
echo ""
echo "Uvolňuji neaktivní paměť (purge)..."
sudo purge
echo "Hotovo."

# 3. Zobraz stav po purge
echo ""
echo "Stav po purge:"
sysctl vm.swapusage

# 4. Nastav Ollama keep_alive na 0 pro velké modely
echo ""
echo "Nastavuji OLLAMA_KEEP_ALIVE=0 pro šetření RAM..."
export OLLAMA_KEEP_ALIVE=0
echo "OLLAMA_KEEP_ALIVE=0 nastaven (modely se uvolní z RAM po každém použití)."

# 5. Doporučení
echo ""
echo "=== DOPORUČENÍ ==="
echo "1. Pro llava:7b (4.4 GB): zavři ostatní aplikace před použitím"
echo "2. Ollama modely aktivní v RAM:"
ollama ps 2>/dev/null || echo "   (ollama ps nedostupný)"
echo "3. Pro uvolnění konkrétního modelu z RAM:"
echo "   ollama stop llava:7b"
echo "   ollama stop llama3.2"
echo ""
echo "4. Pro trvalé zvýšení výkonu na 8 GB Mac:"
echo "   - System Preferences → Privacy & Security → vypni FileVault (uvolní CPU)"
echo "   - Activity Monitor → zavři Chrome/Electron aplikace před AI inference"
