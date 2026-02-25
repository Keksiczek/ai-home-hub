# AI Home Hub – Configuration Guide

## Quick Start

1. **Start the server:**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

2. **Open the UI:** http://localhost:8000

3. **Configure settings:** Click the **Settings** tab (no terminal editing needed).

---

## First-Time Setup

### 1. Install Ollama (local LLM)
```bash
# macOS
brew install ollama
ollama serve  # runs on localhost:11434

# Pull a model
ollama pull llama3.2
```

### 2. Configure LLM in Settings
- Open **Settings → LLM Configuration**
- Set Provider: `Ollama`
- Set Model: `llama3.2`
- Click **Check Ollama** to verify connection

### 3. Add allowed directories (Security)
- Open **Settings → Filesystem Security**
- Add directories you want the API to access (e.g., `/Users/you/projects`)
- Without this, filesystem API calls are blocked

### 4. Configure VS Code
- Open **Settings → Integrations → VS Code**
- Check the checkbox to enable
- Set binary path: `/usr/local/bin/code` (or `code` if on PATH)
- Add projects under **VS Code Projects**

---

## Settings Reference

### LLM Configuration

| Field | Default | Description |
|-------|---------|-------------|
| provider | `ollama` | LLM provider (`ollama` or `stub`) |
| model | `llama3.2` | Ollama model name |
| temperature | `0.7` | Response randomness (0-2) |
| ollama_url | `http://localhost:11434` | Ollama server URL |

### Integrations

#### VS Code
```json
{
  "enabled": true,
  "binary_path": "/usr/local/bin/code",
  "projects": {
    "my-project": {
      "path": "/Users/you/projects/my-project",
      "workspace": "/Users/you/projects/my-project/project.code-workspace"
    }
  }
}
```

#### Claude MCP
Requires Claude Desktop with MCP servers configured.
```json
{
  "enabled": true,
  "connection_type": "http",
  "http_endpoint": "http://localhost:3000"
}
```

#### Google Antigravity IDE
```json
{
  "enabled": true,
  "api_endpoint": "http://localhost:8080",
  "api_key": "your-key",
  "workspace_root": "/Users/you/projects"
}
```

#### Push Notifications (ntfy.sh)
```json
{
  "enabled": true,
  "ntfy_url": "https://ntfy.sh",
  "topic": "ai-home-hub-UNIQUE_TOPIC"
}
```

Subscribe on iOS/Android via the ntfy app with your topic.

### Quick Actions

Quick actions are step sequences configured in `settings.json`:

```json
{
  "quick_actions": [
    {
      "id": "daily-standup",
      "name": "Daily Standup",
      "icon": "📊",
      "steps": [
        {"service": "vscode", "action": "open_project", "params": {"project_key": "my-project"}},
        {"service": "git", "action": "pull", "params": {"repo_path": "/path/to/project"}},
        {"service": "macos", "action": "safari_open", "params": {"url": "https://github.com"}}
      ]
    }
  ]
}
```

**Available services and actions:**

| Service | Actions |
|---------|---------|
| `vscode` | `open_project`, `open_file`, `run_task` |
| `git` | `pull`, `push`, `commit`, `status`, `fetch` |
| `macos` | `safari_open`, `finder_open`, `volume_set`, `open_app`, `quit_app` |
| `llm` | `generate` |
| `openclaw` | `screenshot`, `click_at`, `type_text` |

---

## System Prompts

Customize AI behavior per mode in **Settings → System Prompts**:

- **General** – Default assistant mode
- **Power BI** – DAX/Power Query specialist
- **Lean** – CI/Lean process specialist

---

## Security

### Filesystem Whitelist
Only directories in **allowed_directories** are accessible via `/api/filesystem/*`. Leaving this empty blocks all filesystem API access.

### API Key Storage
API keys (Antigravity) are stored in `backend/data/settings.json`. The UI masks them. Never commit `settings.json` to git.

### Agent Limits
- Default: 5 concurrent agents, 30 minute timeout
- Agents exceeding the limit are rejected (HTTP 429)

---

## macOS Requirements

| Tool | Install | Required for |
|------|---------|-------------|
| Ollama | `brew install ollama` | Local LLM |
| VS Code CLI | Install VS Code, add to PATH | VS Code control |
| cliclick | `brew install cliclick` | Mouse simulation |
| osascript | Built-in | All AppleScript actions |

**Accessibility permissions:** Grant Terminal/Python accessibility access in System Settings → Privacy & Security → Accessibility for AppleScript keyboard/mouse control.

---

## WebSocket Real-time Updates

Connect to `ws://localhost:8000/ws` for real-time events:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  // msg.type: "agent_update" | "task_update" | "notification" | "ping"
};
```

---

## Troubleshooting

**Ollama not connecting:**
- Run `ollama serve` and check http://localhost:11434
- Verify model is downloaded: `ollama list`

**VS Code not opening:**
- Install VS Code command line tools: `Shell Command: Install 'code' command in PATH`
- Check binary path in settings

**AppleScript failing:**
- Grant accessibility permissions in System Settings
- Test with: `osascript -e 'display notification "test"'`

**Agents timing out:**
- Increase `timeout_minutes` in Settings → Agent Limits
- Check that Ollama is running if agents use LLM
