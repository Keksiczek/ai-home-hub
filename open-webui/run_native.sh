#!/bin/bash

# Configuration
export PORT=8080
export OLLAMA_BASE_URL="http://localhost:11434"
export WEBUI_AUTH=false
export WEBUI_NAME="AI Home Hub - OpenWebUI"
export DATA_DIR="./backend/data"

# Activate Virtual Environment
source ./venv/bin/activate

# Move to backend directory to find open_webui module
cd backend || exit

# Run the backend
echo "Starting OpenWebUI backend on port $PORT..."
python -m uvicorn open_webui.main:app --host 0.0.0.0 --port "$PORT" --forwarded-allow-ips "*"
