#!/usr/bin/env bash
# deploy-macos.sh – Deploy AI Home Hub on macOS via Docker Compose + launchd
#
# Usage:
#   bash deploy-macos.sh [--with-monitoring]
#
# This script:
#   1. Copies/updates the repo to /opt/ai-home-hub (or uses current location)
#   2. Starts docker compose prod
#   3. Installs launchd agent for auto-start

set -euo pipefail

INSTALL_DIR="/opt/ai-home-hub"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PLIST_NAME="com.aihomehub.plist"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
COMPOSE_PROFILES=""

# Parse args
while [[ $# -gt 0 ]]; do
    case "$1" in
        --with-monitoring)
            COMPOSE_PROFILES="--profile monitoring"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "=== AI Home Hub – macOS Deploy ==="

# Check prerequisites
if ! command -v docker &>/dev/null; then
    echo "ERROR: docker is not installed."
    echo "Please install Docker Desktop for Mac: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

if ! docker compose version &>/dev/null; then
    echo "ERROR: docker compose plugin not found."
    exit 1
fi

# Copy or update install directory
if [ "$REPO_ROOT" != "$INSTALL_DIR" ]; then
    echo "Copying repo to $INSTALL_DIR ..."
    sudo mkdir -p "$INSTALL_DIR"
    sudo chown "$(whoami)" "$INSTALL_DIR"
    rsync -a --exclude='.git' --exclude='__pycache__' --exclude='.venv' \
          --exclude='*.pyc' --exclude='node_modules' \
          "$REPO_ROOT/" "$INSTALL_DIR/"
else
    echo "Already running from $INSTALL_DIR, skipping copy."
fi

cd "$INSTALL_DIR"

# Create data directory
mkdir -p "$INSTALL_DIR/data"

# Copy .env.prod if not exists
if [ ! -f "$INSTALL_DIR/.env.prod" ] && [ -f "$INSTALL_DIR/.env.prod.example" ]; then
    echo "Creating .env.prod from example..."
    cp "$INSTALL_DIR/.env.prod.example" "$INSTALL_DIR/.env.prod"
    echo "  → Edit $INSTALL_DIR/.env.prod to customize settings."
fi

# Start compose
echo "Starting Docker Compose (prod)..."
docker compose -f docker-compose.prod.yml $COMPOSE_PROFILES up -d --build

# Install launchd agent
echo "Installing launchd agent..."
mkdir -p "$LAUNCH_AGENTS_DIR"

# Unload existing if present
if launchctl list | grep -q com.aihomehub 2>/dev/null; then
    launchctl unload "$LAUNCH_AGENTS_DIR/$PLIST_NAME" 2>/dev/null || true
fi

# Update plist with actual install dir
sed "s|/opt/ai-home-hub|$INSTALL_DIR|g" \
    "$INSTALL_DIR/files/macos/$PLIST_NAME" > "$LAUNCH_AGENTS_DIR/$PLIST_NAME"

launchctl load "$LAUNCH_AGENTS_DIR/$PLIST_NAME"

echo ""
echo "=== Deploy complete ==="
echo "  App:      http://localhost:${APP_PORT:-8000}"
echo "  Status:   launchctl list | grep aihomehub"
echo "  Logs:     docker compose -f docker-compose.prod.yml logs -f"
echo "  Unload:   launchctl unload ~/Library/LaunchAgents/$PLIST_NAME"
if [ -n "$COMPOSE_PROFILES" ]; then
    echo "  Grafana:  http://localhost:${GRAFANA_PORT:-3001}"
fi
