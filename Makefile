# Makefile – AI Home Hub
# Usage: make <target>

.PHONY: run-dev run-prod stop logs clean help dev-start dev-stop dev-update dev-status

SHELL := /bin/bash
SCRIPT := ./run-app.sh
DEV_SCRIPT := ./scripts/dev.sh
BACKEND_DIR := backend
VENV := $(BACKEND_DIR)/.venv
LOG_PATTERN := ai-home-hub-*.log

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

dev-start: ## [Quick] Start backend + Tailscale funnel via scripts/dev.sh
	@chmod +x $(DEV_SCRIPT)
	$(DEV_SCRIPT) start

dev-stop: ## [Quick] Stop backend + Tailscale funnel via scripts/dev.sh
	@chmod +x $(DEV_SCRIPT)
	$(DEV_SCRIPT) stop

dev-update: ## [Quick] git pull + restart via scripts/dev.sh
	@chmod +x $(DEV_SCRIPT)
	$(DEV_SCRIPT) update

dev-status: ## [Quick] Show running processes status via scripts/dev.sh
	@chmod +x $(DEV_SCRIPT)
	$(DEV_SCRIPT) status

run-dev: ## Start in dev mode (hot-reload, port 8000)
	@chmod +x $(SCRIPT)
	$(SCRIPT) dev

run-prod: ## Start in prod mode (port 8000)
	@chmod +x $(SCRIPT)
	$(SCRIPT) prod

stop: ## Kill app and Ollama processes
	@chmod +x $(SCRIPT)
	$(SCRIPT) stop

logs: ## Tail today's log file
	@log=$$(ls -t $(LOG_PATTERN) 2>/dev/null | head -1); \
	if [[ -n "$$log" ]]; then tail -f "$$log"; \
	else echo "No log files found."; fi

venv: ## Create Python venv and install deps
	python3 -m venv $(VENV)
	$(VENV)/bin/pip install -r $(BACKEND_DIR)/requirements-dev.txt

test: ## Run backend tests
	@source $(VENV)/bin/activate && \
	cd $(BACKEND_DIR) && \
	python -m pytest tests/ -v

lint: ## Run ruff linter
	@source $(VENV)/bin/activate && \
	cd $(BACKEND_DIR) && \
	ruff check app/ || true

clean: ## Remove venv, __pycache__, logs
	rm -rf $(VENV)
	find $(BACKEND_DIR) -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	rm -f $(LOG_PATTERN)

docker-up: ## Start via Docker Compose (fallback)
	docker compose up --build

docker-down: ## Stop Docker Compose stack
	docker compose down
