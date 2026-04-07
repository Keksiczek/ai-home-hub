# Shared Local LLM Server (AI Home Hub + OpenClaw + OpenWebUI)

One Ollama process, one model in RAM, three clients.

## Architecture

```
Ollama server (http://127.0.0.1:11434)
         |
   ┌─────┼──────────┐
   │     │           │
   v     v           v
AI Home Hub   OpenWebUI   OpenClaw
  (:8000)      (:8080)     (TUI)
LOCAL_LLM_*  OLLAMA_BASE_URL  ollama provider config
```

## Setup

### 1. Ollama server

```bash
# Install (macOS)
brew install ollama

# Start server
ollama serve

# Pull the shared model
ollama pull qwen2.5:1.5b
```

### 2. AI Home Hub

```bash
cp .env.prod.example .env

# Edit .env – set LOCAL_LLM_MODEL to your model
# LOCAL_LLM_PROVIDER=ollama
# LOCAL_LLM_BASE_URL=http://127.0.0.1:11434
# LOCAL_LLM_MODEL=qwen2.5:1.5b

./run-app.sh
```

At startup, the backend logs:

```
[LLM] Using shared local provider=ollama base_url=http://127.0.0.1:11434 model=qwen2.5:1.5b
[LLM] Available for: AI Home Hub + OpenClaw + OpenWebUI (:8080)
```

### 3. OpenWebUI

Already started by `run-app.sh` on `http://localhost:8080`.
It reads `OLLAMA_BASE_URL` from the environment, which `run-app.sh` sets
to the same value as `LOCAL_LLM_BASE_URL`. The model is shared automatically.

If OpenWebUI runs in Docker, use `host.docker.internal:11434` or `--network=host`
so it can reach the host Ollama process.

### 4. OpenClaw

```bash
# Copy the shared Ollama config
cp integration/openclaw/local-shared-ollama.json ~/.openclaw/config.json

# Or merge the models.providers.ollama section into your existing config
```

Edit the config to match your `LOCAL_LLM_MODEL` if you changed it from the
default `qwen2.5:1.5b`.

## Environment Variables Reference

| Variable                | Default                      | Description                           |
|------------------------|------------------------------|---------------------------------------|
| `LOCAL_LLM_PROVIDER`   | `ollama`                     | Provider type (`ollama`, `openai_compat`) |
| `LOCAL_LLM_BASE_URL`   | `http://127.0.0.1:11434`    | Ollama server URL                     |
| `LOCAL_LLM_API_KEY`    | `ollama-local`               | Dummy key (Ollama needs none)         |
| `LOCAL_LLM_MODEL`      | `qwen2.5:1.5b`              | Shared model name                     |
| `LOCAL_LLM_CONTEXT_WINDOW` | `8192`                   | Context window size                   |
| `LOCAL_LLM_MAX_TOKENS` | `2048`                       | Max output tokens                     |
| `OLLAMA_BASE_URL`      | (set from `LOCAL_LLM_BASE_URL`) | Legacy alias, still respected     |

## Performance Tips

- One model in RAM, three clients – optimized for Mac 8 GB.
- Use Q4_K_M / Q4_0 quantization for better concurrency.
- Set `OLLAMA_NUM_PARALLEL=4` in `~/.ollama/config` (experimental).
- The adaptive keep-alive manager in AI Home Hub automatically adjusts
  model retention based on RAM pressure.
