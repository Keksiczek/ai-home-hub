/**
 * AI Home Hub – Mac Control Center
 * Vanilla JS, zero dependencies, zero build step.
 * API base: relative paths → /api/...
 */

/* ============================================================
   STATE
   ============================================================ */
const uploadedFiles = [];
const chatHistory = [];
let currentSessionId = null;
let ws = null;
let wsReconnectTimer = null;

/* ============================================================
   DOM REFERENCES  (resolved after DOMContentLoaded)
   ============================================================ */
let dropZone, fileInput, uploadSpinner, fileListWrap, fileList;
let modeSelect, chatInput, contextFilesWrap, contextFileList;
let sendBtn, chatSpinner, historyWrap, chatHistoryEl;
let openclawToggle, openclawBody, actionSelect, actionBtn, actionSpinner, actionResult;
let toast, toastTimer;
let sessionLabel, newSessionBtn;

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Core refs
  dropZone         = document.getElementById('drop-zone');
  fileInput        = document.getElementById('file-input');
  uploadSpinner    = document.getElementById('upload-spinner');
  fileListWrap     = document.getElementById('file-list-wrap');
  fileList         = document.getElementById('file-list');

  modeSelect       = document.getElementById('mode-select');
  chatInput        = document.getElementById('chat-input');
  contextFilesWrap = document.getElementById('context-files-wrap');
  contextFileList  = document.getElementById('context-file-list');
  sendBtn          = document.getElementById('send-btn');
  chatSpinner      = document.getElementById('chat-spinner');
  historyWrap      = document.getElementById('history-wrap');
  chatHistoryEl    = document.getElementById('chat-history');
  sessionLabel     = document.getElementById('session-label');
  newSessionBtn    = document.getElementById('new-session-btn');

  openclawToggle   = document.getElementById('openclaw-toggle');
  openclawBody     = document.getElementById('openclaw-body');
  actionSelect     = document.getElementById('action-select');
  actionBtn        = document.getElementById('action-btn');
  actionSpinner    = document.getElementById('action-spinner');
  actionResult     = document.getElementById('action-result');

  toast            = document.getElementById('toast');

  // Wire events
  bindTabNav();
  bindUploadEvents();
  bindChatEvents();
  bindOpenClawEvents();
  bindAgentsEvents();
  bindActionsEvents();
  bindSettingsEvents();
  initWebSocket();

  // First-time setup check
  checkSetupStatus();
});

/* ============================================================
   TAB NAVIGATION
   ============================================================ */
function bindTabNav() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('tab-btn--active', b.dataset.tab === tabName);
    b.setAttribute('aria-selected', String(b.dataset.tab === tabName));
  });
  document.querySelectorAll('.tab-panel').forEach(p => {
    p.classList.toggle('hidden', p.id !== `tab-${tabName}`);
  });

  // Lazy-load tab data
  if (tabName === 'agents') refreshAgents();
  if (tabName === 'actions') { loadQuickActions(); loadVSCodeProjects(); }
  if (tabName === 'settings') loadSettings();
}

/* ============================================================
   WEBSOCKET
   ============================================================ */
function initWebSocket() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  const wsUrl = `${proto}://${location.host}/ws`;

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    setWsStatus(true);
    clearTimeout(wsReconnectTimer);
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      handleWsMessage(msg);
    } catch (e) { /* ignore */ }
  };

  ws.onclose = () => {
    setWsStatus(false);
    wsReconnectTimer = setTimeout(initWebSocket, 5000);
  };

  ws.onerror = () => {
    setWsStatus(false);
  };
}

function setWsStatus(connected) {
  const dot = document.getElementById('ws-dot');
  const label = document.getElementById('ws-label');
  if (dot) {
    dot.className = `ws-dot ${connected ? 'ws-dot--connected' : 'ws-dot--disconnected'}`;
  }
  if (label) label.textContent = connected ? 'Live' : 'Offline';
}

function handleWsMessage(msg) {
  if (msg.type === 'agent_update') {
    updateAgentCard(msg.agent);
  } else if (msg.type === 'task_update') {
    // Could update a task indicator
  } else if (msg.type === 'notification') {
    showToast(msg.message, 'info');
  }
}

function wsPing() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }));
  }
}
setInterval(wsPing, 30000);

/* ============================================================
   UPLOAD
   ============================================================ */
function bindUploadEvents() {
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') fileInput.click();
  });
  fileInput.addEventListener('change', () => {
    handleFiles(Array.from(fileInput.files));
    fileInput.value = '';
  });
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drop-zone--active');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drop-zone--active');
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drop-zone--active');
    handleFiles(Array.from(e.dataTransfer.files));
  });
}

async function handleFiles(files) {
  if (!files.length) return;
  show(uploadSpinner);
  for (const file of files) {
    try {
      const data = await uploadFile(file);
      uploadedFiles.push({ id: data.id, filename: data.filename });
      renderFileList();
      showToast(`File "${data.filename}" uploaded.`, 'success');
    } catch (err) {
      showToast(`Upload failed for "${file.name}": ${err.message}`, 'error');
    }
  }
  hide(uploadSpinner);
}

async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
  return res.json();
}

function renderFileList() {
  if (uploadedFiles.length) {
    show(fileListWrap);
    fileList.innerHTML = '';
    uploadedFiles.forEach((f) => {
      const li = document.createElement('li');
      li.className = 'file-item';
      li.dataset.id = f.id;
      li.innerHTML = `
        <span class="file-item__name" title="${escHtml(f.filename)}">${escHtml(truncate(f.filename, 40))}</span>
        <span class="file-item__id">${escHtml(f.id.slice(0, 8))}…</span>
        <button class="file-item__remove" aria-label="Remove ${escHtml(f.filename)}" data-id="${escHtml(f.id)}">&#10005;</button>
      `;
      li.querySelector('.file-item__remove').addEventListener('click', () => removeFile(f.id));
      fileList.appendChild(li);
    });
  } else {
    hide(fileListWrap);
  }

  if (uploadedFiles.length) {
    show(contextFilesWrap);
    contextFileList.innerHTML = '';
    uploadedFiles.forEach((f) => {
      const li = document.createElement('li');
      li.className = 'context-item';
      const cbId = `ctx-${f.id}`;
      li.innerHTML = `
        <label class="context-item__label">
          <input type="checkbox" class="context-checkbox" id="${cbId}" value="${escHtml(f.id)}" />
          <span>${escHtml(truncate(f.filename, 45))}</span>
        </label>
      `;
      contextFileList.appendChild(li);
    });
  } else {
    hide(contextFilesWrap);
  }
}

function removeFile(id) {
  const idx = uploadedFiles.findIndex((f) => f.id === id);
  if (idx !== -1) uploadedFiles.splice(idx, 1);
  renderFileList();
}

/* ============================================================
   CHAT
   ============================================================ */
function bindChatEvents() {
  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') sendMessage();
  });
  newSessionBtn.addEventListener('click', () => {
    currentSessionId = null;
    chatHistoryEl.innerHTML = '';
    hide(historyWrap);
    sessionLabel.textContent = 'New session';
    showToast('Started new session', 'info');
  });
}

async function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) { showToast('Message cannot be empty.', 'warning'); return; }

  const mode = modeSelect.value;
  const contextFileIds = Array.from(document.querySelectorAll('.context-checkbox:checked'))
    .map((cb) => cb.value);

  setLoading(sendBtn, chatSpinner, true);
  appendBubble('user', message);
  chatInput.value = '';

  try {
    const body = { message, mode, context_file_ids: contextFileIds };
    if (currentSessionId) body.session_id = currentSessionId;

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);

    const data = await res.json();

    // Track session
    if (data.session_id) {
      currentSessionId = data.session_id;
      sessionLabel.textContent = `Session: ${data.session_id}`;
    }

    appendBubble('ai', data.reply, data.meta);
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
    const bubbles = chatHistoryEl.querySelectorAll('.bubble--user');
    if (bubbles.length) bubbles[bubbles.length - 1].remove();
  } finally {
    setLoading(sendBtn, chatSpinner, false);
  }
}

function appendBubble(role, text, meta) {
  show(historyWrap);
  const bubble = document.createElement('div');
  bubble.className = `bubble bubble--${role}`;

  let inner = `<p class="bubble__text">${escHtml(text)}</p>`;
  if (meta) {
    const provider = meta.provider || '—';
    const latency = meta.latency_ms ?? '—';
    inner += `<p class="bubble__meta">Provider: <strong>${escHtml(provider)}</strong> · ${latency} ms</p>`;
  }
  bubble.innerHTML = inner;
  chatHistoryEl.appendChild(bubble);
  chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
}

/* ============================================================
   OPENCLAW
   ============================================================ */
function bindOpenClawEvents() {
  openclawToggle.addEventListener('click', () => {
    const expanded = openclawToggle.getAttribute('aria-expanded') === 'true';
    openclawToggle.setAttribute('aria-expanded', String(!expanded));
    openclawBody.classList.toggle('collapsed', expanded);
  });
  actionBtn.addEventListener('click', triggerAction);
}

async function triggerAction() {
  const action = actionSelect.value;
  setLoading(actionBtn, actionSpinner, true);
  hide(actionResult);

  try {
    const res = await fetch('/api/actions/openclaw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, params: {} }),
    });
    if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);

    const data = await res.json();
    const statusClass = data.status === 'ok' ? 'result-box--ok'
                      : data.status === 'error' ? 'result-box--error'
                      : 'result-box--warn';
    actionResult.className = `result-box ${statusClass}`;
    actionResult.innerHTML = `<strong>Status:</strong> ${escHtml(data.status)}<br/>` +
      (data.detail ? `<strong>Detail:</strong> ${escHtml(data.detail)}` : '');
    show(actionResult);
  } catch (err) {
    showToast(`Action error: ${err.message}`, 'error');
  } finally {
    setLoading(actionBtn, actionSpinner, false);
  }
}

/* ============================================================
   AGENTS
   ============================================================ */
function bindAgentsEvents() {
  document.getElementById('spawn-btn').addEventListener('click', spawnAgent);
  document.getElementById('refresh-agents-btn').addEventListener('click', refreshAgents);
  document.getElementById('cleanup-agents-btn').addEventListener('click', cleanupAgents);
}

async function spawnAgent() {
  const agentType = document.getElementById('agent-type-select').value;
  const goal = document.getElementById('agent-goal').value.trim();
  const workspace = document.getElementById('agent-workspace').value.trim() || null;

  if (!goal) { showToast('Goal is required.', 'warning'); return; }

  const spawnBtn = document.getElementById('spawn-btn');
  const spawnSpinner = document.getElementById('spawn-spinner');
  setLoading(spawnBtn, spawnSpinner, true);

  try {
    const res = await fetch('/api/agents/spawn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_type: agentType, task: { goal }, workspace }),
    });
    if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
    const data = await res.json();
    showToast(`Agent ${data.agent_id} spawned!`, 'success');
    document.getElementById('agent-goal').value = '';
    await refreshAgents();
    switchTab('agents');
  } catch (err) {
    showToast(`Spawn error: ${err.message}`, 'error');
  } finally {
    setLoading(spawnBtn, spawnSpinner, false);
  }
}

async function refreshAgents() {
  const list = document.getElementById('agents-list');
  if (!list) return;
  try {
    const res = await fetch('/api/agents');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderAgentsList(data.agents || []);
  } catch (err) {
    list.innerHTML = `<p class="empty-state">Error loading agents: ${escHtml(err.message)}</p>`;
  }
}

function renderAgentsList(agents) {
  const list = document.getElementById('agents-list');
  if (!agents.length) {
    list.innerHTML = '<p class="empty-state">No agents running.</p>';
    return;
  }
  list.innerHTML = agents.map(a => renderAgentCard(a)).join('');
  // Bind interrupt buttons
  list.querySelectorAll('[data-interrupt]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.interrupt;
      await fetch(`/api/agents/${id}/interrupt`, { method: 'POST' });
      showToast(`Agent ${id} interrupted`, 'info');
      await refreshAgents();
    });
  });
  list.querySelectorAll('[data-delete-agent]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.deleteAgent;
      await fetch(`/api/agents/${id}`, { method: 'DELETE' });
      showToast(`Agent ${id} deleted`, 'info');
      await refreshAgents();
    });
  });
}

function renderAgentCard(agent) {
  const statusClass = {
    pending: 'agent-status--pending',
    running: 'agent-status--running',
    completed: 'agent-status--completed',
    failed: 'agent-status--failed',
    interrupted: 'agent-status--interrupted',
  }[agent.status] || '';

  const isActive = agent.status === 'running' || agent.status === 'pending';

  return `
    <div class="agent-card" id="agent-${escHtml(agent.agent_id)}">
      <div class="agent-card-header">
        <span class="agent-type-badge">${escHtml(agent.agent_type)}</span>
        <span class="agent-id">${escHtml(agent.agent_id)}</span>
        <span class="agent-status ${statusClass}">${escHtml(agent.status)}</span>
        <div class="agent-actions">
          ${isActive ? `<button class="btn btn--ghost btn--small" data-interrupt="${escHtml(agent.agent_id)}">Stop</button>` : ''}
          <button class="btn btn--ghost btn--small" data-delete-agent="${escHtml(agent.agent_id)}">Delete</button>
        </div>
      </div>
      <p class="agent-goal">${escHtml(agent.task?.goal || 'No goal')}</p>
      <div class="progress-bar-wrap">
        <div class="progress-bar" style="width:${agent.progress}%"></div>
      </div>
      <p class="agent-message">${escHtml(agent.message || '')}</p>
      ${agent.artifacts.length ? `<p class="agent-artifacts">Artifacts: ${agent.artifacts.length}</p>` : ''}
    </div>`;
}

function updateAgentCard(agent) {
  const existing = document.getElementById(`agent-${agent.agent_id}`);
  const list = document.getElementById('agents-list');
  if (!list) return;

  if (existing) {
    existing.outerHTML = renderAgentCard(agent);
    // Re-bind buttons for the updated card
    const updated = document.getElementById(`agent-${agent.agent_id}`);
    if (updated) {
      updated.querySelectorAll('[data-interrupt]').forEach(btn => {
        btn.addEventListener('click', async () => {
          await fetch(`/api/agents/${btn.dataset.interrupt}/interrupt`, { method: 'POST' });
          await refreshAgents();
        });
      });
    }
  } else {
    // New agent – refresh the whole list
    refreshAgents();
  }
}

async function cleanupAgents() {
  try {
    const res = await fetch('/api/agents/cleanup', { method: 'POST' });
    const data = await res.json();
    showToast(`Removed ${data.removed} finished agents`, 'success');
    await refreshAgents();
  } catch (err) {
    showToast(`Cleanup error: ${err.message}`, 'error');
  }
}

/* ============================================================
   ACTIONS TAB
   ============================================================ */
function bindActionsEvents() {
  // Volume slider
  const slider = document.getElementById('volume-slider');
  const volLabel = document.getElementById('volume-value');
  if (slider) {
    slider.addEventListener('input', () => {
      volLabel.textContent = `${slider.value}%`;
    });
    document.getElementById('set-volume-btn').addEventListener('click', async () => {
      const r = await macOSAction('volume_set', { level: parseInt(slider.value) });
      showMacResult(r);
    });
  }

  // Safari
  const safariBtn = document.getElementById('safari-open-btn');
  if (safariBtn) {
    safariBtn.addEventListener('click', async () => {
      const url = document.getElementById('safari-url').value.trim();
      if (!url) { showToast('Enter a URL', 'warning'); return; }
      const r = await macOSAction('safari_open', { url });
      showMacResult(r);
    });
  }

  // VS Code open project
  const vcBtn = document.getElementById('vscode-open-btn');
  if (vcBtn) {
    vcBtn.addEventListener('click', async () => {
      const sel = document.getElementById('vscode-project-select');
      const key = sel.value;
      if (!key) { showToast('Select a project', 'warning'); return; }
      try {
        const res = await fetch('/api/integrations/vscode/open-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_key: key }),
        });
        const data = await res.json();
        showMacResult(data);
      } catch (err) {
        showMacResult({ status: 'error', detail: err.message });
      }
    });
  }

  // Finder
  const finderBtn = document.getElementById('finder-open-btn');
  if (finderBtn) {
    finderBtn.addEventListener('click', async () => {
      const path = document.getElementById('finder-path').value.trim();
      if (!path) { showToast('Enter a path', 'warning'); return; }
      const r = await macOSAction('finder_open', { path });
      showMacResult(r);
    });
  }

  // Git buttons
  document.querySelectorAll('[data-git]').forEach(btn => {
    btn.addEventListener('click', () => handleGitAction(btn.dataset.git));
  });
}

async function macOSAction(action, params) {
  try {
    const res = await fetch('/api/integrations/macos/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, params }),
    });
    return await res.json();
  } catch (err) {
    return { status: 'error', detail: err.message };
  }
}

function showMacResult(data) {
  const el = document.getElementById('mac-action-result');
  if (!el) return;
  const statusClass = data.status === 'ok' ? 'result-box--ok' : 'result-box--error';
  el.className = `result-box ${statusClass}`;
  el.innerHTML = `<strong>${escHtml(data.status)}</strong> ${escHtml(data.detail || JSON.stringify(data.data || ''))}`;
  show(el);
}

async function handleGitAction(action) {
  const repoPath = document.getElementById('git-repo-path').value.trim();
  if (!repoPath) { showToast('Enter a repo path', 'warning'); return; }

  const gitResult = document.getElementById('git-result');
  const params = { repo_path: repoPath };

  if (action === 'commit') {
    params.message = document.getElementById('git-commit-msg').value.trim();
    if (!params.message) { showToast('Enter a commit message', 'warning'); return; }
  }

  try {
    const res = await fetch(`/api/integrations/git/${action}`, {
      method: action === 'status' || action === 'log' || action === 'branches' ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: ['status', 'log', 'branches'].includes(action) ? undefined : JSON.stringify(params),
    });

    let url = `/api/integrations/git/${action}`;
    if (['status', 'log', 'branches'].includes(action)) {
      url += `?repo_path=${encodeURIComponent(repoPath)}`;
      const r = await fetch(url);
      const data = await r.json();
      showGitResult(data);
    } else {
      const r = await fetch(`/api/integrations/git/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await r.json();
      showGitResult(data);
    }
  } catch (err) {
    showGitResult({ status: 'error', detail: err.message });
  }
}

function showGitResult(data) {
  const el = document.getElementById('git-result');
  if (!el) return;
  const statusClass = data.status === 'ok' ? 'result-box--ok' : 'result-box--error';
  el.className = `result-box ${statusClass}`;
  let content = `<strong>${escHtml(data.status)}</strong> `;
  if (data.detail) content += escHtml(data.detail);
  if (data.data) content += `<pre style="margin-top:0.5rem;font-size:0.8rem;overflow-x:auto">${escHtml(JSON.stringify(data.data, null, 2))}</pre>`;
  el.innerHTML = content;
  show(el);
}

async function loadQuickActions() {
  const list = document.getElementById('quick-actions-list');
  if (!list) return;
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    const actions = data.settings?.quick_actions || [];
    if (!actions.length) {
      list.innerHTML = '<p class="empty-state">No quick actions configured. Add them in settings.json or Settings tab.</p>';
      return;
    }
    list.innerHTML = actions.map(a => `
      <button class="quick-action-btn" data-action-id="${escHtml(a.id)}">
        <span class="qa-icon">${escHtml(a.icon || '⚡')}</span>
        <span class="qa-name">${escHtml(a.name)}</span>
        <span class="qa-steps">${a.steps?.length || 0} steps</span>
      </button>
    `).join('');
    list.querySelectorAll('[data-action-id]').forEach(btn => {
      btn.addEventListener('click', () => executeQuickAction(btn.dataset.actionId));
    });
  } catch (err) {
    list.innerHTML = `<p class="empty-state">Error: ${escHtml(err.message)}</p>`;
  }
}

async function executeQuickAction(actionId) {
  showToast(`Executing action ${actionId}…`, 'info');
  // Quick actions are executed step-by-step based on settings
  // For now, show the action ID to confirm it's wired up
  // Full sequential execution would require the actions router
  showToast(`Action "${actionId}" triggered (sequential execution planned)`, 'success');
}

async function loadVSCodeProjects() {
  const sel = document.getElementById('vscode-project-select');
  if (!sel) return;
  try {
    const res = await fetch('/api/integrations/vscode/projects');
    const data = await res.json();
    const projects = data.projects || {};
    sel.innerHTML = Object.keys(projects).length
      ? Object.keys(projects).map(k => `<option value="${escHtml(k)}">${escHtml(k)}</option>`).join('')
      : '<option value="">No projects configured</option>';
  } catch (e) {
    sel.innerHTML = '<option value="">Error loading projects</option>';
  }
}

/* ============================================================
   SETTINGS
   ============================================================ */
function bindSettingsEvents() {
  document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
  document.getElementById('reload-settings-btn').addEventListener('click', loadSettings);
  document.getElementById('check-ollama-btn').addEventListener('click', checkOllama);
  document.getElementById('add-project-btn').addEventListener('click', addProject);
  document.getElementById('add-dir-btn').addEventListener('click', addAllowedDir);
}

let _currentSettings = null;
let _settingsProjects = {};
let _settingsAllowedDirs = [];

async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    const s = data.settings;
    _currentSettings = s;

    // LLM
    setVal('s-llm-provider', s.llm?.provider || 'ollama');
    setVal('s-llm-model', s.llm?.model || 'llama3.2');
    setVal('s-llm-temp', s.llm?.temperature ?? 0.7);
    setVal('s-llm-url', s.llm?.ollama_url || 'http://localhost:11434');

    // Integrations
    setChecked('s-vscode-enabled', s.integrations?.vscode?.enabled);
    setVal('s-vscode-binary', s.integrations?.vscode?.binary_path || '');
    setChecked('s-macos-enabled', s.integrations?.macos?.enabled);
    setChecked('s-mcp-enabled', s.integrations?.claude_mcp?.enabled);
    setVal('s-mcp-type', s.integrations?.claude_mcp?.connection_type || 'stdio');
    setVal('s-mcp-path', s.integrations?.claude_mcp?.stdio_path || '');
    setChecked('s-ag-enabled', s.integrations?.antigravity?.enabled);
    setVal('s-ag-endpoint', s.integrations?.antigravity?.api_endpoint || '');
    // API key is masked – don't populate

    setChecked('s-ntfy-enabled', s.notifications?.enabled);
    setVal('s-ntfy-url', s.notifications?.ntfy_url || '');
    setVal('s-ntfy-topic', s.notifications?.topic || '');

    // Prompts
    setVal('s-prompt-general', s.system_prompts?.general || '');
    setVal('s-prompt-powerbi', s.system_prompts?.powerbi || '');
    setVal('s-prompt-lean', s.system_prompts?.lean || '');

    // Agent limits
    setVal('s-agents-max', s.agents?.max_concurrent ?? 5);
    setVal('s-agents-timeout', s.agents?.timeout_minutes ?? 30);

    // Projects
    _settingsProjects = { ...(s.integrations?.vscode?.projects || {}) };
    renderProjectsList();

    // Allowed dirs
    _settingsAllowedDirs = [...(s.filesystem?.allowed_directories || [])];
    renderAllowedDirsList();

  } catch (err) {
    showToast(`Failed to load settings: ${err.message}`, 'error');
  }
}

async function saveSettings() {
  const saveBtn = document.getElementById('save-settings-btn');
  const saveSpinner = document.getElementById('settings-spinner');
  setLoading(saveBtn, saveSpinner, true);

  const agKey = document.getElementById('s-ag-key').value;

  const patch = {
    llm: {
      provider: getVal('s-llm-provider'),
      model: getVal('s-llm-model'),
      temperature: parseFloat(getVal('s-llm-temp') || '0.7'),
      ollama_url: getVal('s-llm-url'),
    },
    integrations: {
      vscode: {
        enabled: getChecked('s-vscode-enabled'),
        binary_path: getVal('s-vscode-binary'),
        projects: _settingsProjects,
      },
      macos: { enabled: getChecked('s-macos-enabled') },
      claude_mcp: {
        enabled: getChecked('s-mcp-enabled'),
        connection_type: getVal('s-mcp-type'),
        stdio_path: getVal('s-mcp-path'),
      },
      antigravity: {
        enabled: getChecked('s-ag-enabled'),
        api_endpoint: getVal('s-ag-endpoint'),
        ...(agKey ? { api_key: agKey } : {}),
      },
    },
    notifications: {
      enabled: getChecked('s-ntfy-enabled'),
      ntfy_url: getVal('s-ntfy-url'),
      topic: getVal('s-ntfy-topic'),
    },
    system_prompts: {
      general: getVal('s-prompt-general'),
      powerbi: getVal('s-prompt-powerbi'),
      lean: getVal('s-prompt-lean'),
    },
    agents: {
      max_concurrent: parseInt(getVal('s-agents-max') || '5'),
      timeout_minutes: parseInt(getVal('s-agents-timeout') || '30'),
    },
    filesystem: {
      ...((_currentSettings && _currentSettings.filesystem) || {}),
      allowed_directories: _settingsAllowedDirs,
    },
  };

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: patch }),
    });
    if (!res.ok) throw new Error(await res.text());
    showToast('Settings saved!', 'success');
    await loadSettings();
  } catch (err) {
    showToast(`Save failed: ${err.message}`, 'error');
  } finally {
    setLoading(saveBtn, saveSpinner, false);
  }
}

async function checkOllama() {
  const el = document.getElementById('ollama-status');
  el.className = 'result-box';
  el.textContent = 'Checking…';
  show(el);
  try {
    const res = await fetch('/api/settings/ollama/health', { method: 'POST' });
    const data = await res.json();
    const ok = data.status === 'ok';
    el.className = `result-box ${ok ? 'result-box--ok' : 'result-box--error'}`;
    el.innerHTML = ok
      ? `Connected to Ollama at <strong>${escHtml(data.url)}</strong>. Models: ${(data.models || []).map(m => `<code>${escHtml(m)}</code>`).join(', ') || 'none'}`
      : `Cannot reach Ollama: ${escHtml(data.error || data.status)}`;
  } catch (err) {
    el.className = 'result-box result-box--error';
    el.textContent = `Error: ${err.message}`;
  }
}

// Project management
function addProject() {
  const key = document.getElementById('new-project-key').value.trim();
  const path = document.getElementById('new-project-path').value.trim();
  if (!key || !path) { showToast('Key and path required', 'warning'); return; }
  _settingsProjects[key] = { path, workspace: null, auto_tasks: [] };
  document.getElementById('new-project-key').value = '';
  document.getElementById('new-project-path').value = '';
  renderProjectsList();
}

function removeProject(key) {
  delete _settingsProjects[key];
  renderProjectsList();
}

function renderProjectsList() {
  const el = document.getElementById('projects-list');
  if (!el) return;
  const keys = Object.keys(_settingsProjects);
  if (!keys.length) { el.innerHTML = '<p class="hint-text">No projects configured.</p>'; return; }
  el.innerHTML = keys.map(k => `
    <div class="list-item">
      <code class="list-item__key">${escHtml(k)}</code>
      <span class="list-item__val">${escHtml(_settingsProjects[k].path || '')}</span>
      <button class="btn btn--ghost btn--small" onclick="removeProject('${escHtml(k)}')">Remove</button>
    </div>
  `).join('');
}

// Allowed dirs management
function addAllowedDir() {
  const dir = document.getElementById('new-allowed-dir').value.trim();
  if (!dir) { showToast('Enter a directory path', 'warning'); return; }
  if (!_settingsAllowedDirs.includes(dir)) _settingsAllowedDirs.push(dir);
  document.getElementById('new-allowed-dir').value = '';
  renderAllowedDirsList();
}

function removeAllowedDir(dir) {
  _settingsAllowedDirs = _settingsAllowedDirs.filter(d => d !== dir);
  renderAllowedDirsList();
}

function renderAllowedDirsList() {
  const el = document.getElementById('allowed-dirs-list');
  if (!el) return;
  if (!_settingsAllowedDirs.length) {
    el.innerHTML = '<p class="hint-text" style="color:#ef4444">Warning: No allowed directories. API filesystem access is disabled.</p>';
    return;
  }
  el.innerHTML = _settingsAllowedDirs.map(d => `
    <div class="list-item">
      <code class="list-item__val" style="flex:1">${escHtml(d)}</code>
      <button class="btn btn--ghost btn--small" onclick="removeAllowedDir('${escHtml(d)}')">Remove</button>
    </div>
  `).join('');
}

/* ============================================================
   SETUP CHECK
   ============================================================ */
async function checkSetupStatus() {
  try {
    const res = await fetch('/api/health/setup');
    if (!res.ok) return;
    const data = await res.json();
    if (!data.setup_complete) {
      const incomplete = data.items.filter(i => !i.ok);
      const hints = incomplete.map(i => `• ${i.label}: ${i.hint}`).join('\n');
      // Insert a dismissible setup banner above the tab content
      const banner = document.createElement('div');
      banner.id = 'setup-banner';
      banner.className = 'setup-banner';
      banner.innerHTML = `
        <strong>First-time setup needed</strong>
        <button class="setup-banner__dismiss" onclick="document.getElementById('setup-banner').remove()" title="Dismiss">&#10005;</button>
        <ul class="setup-banner__list">
          ${incomplete.map(i => `<li><button class="setup-banner__link" onclick="switchTab('settings')">${escHtml(i.label)}</button> – ${escHtml(i.hint)}</li>`).join('')}
        </ul>
      `;
      const main = document.querySelector('.main');
      if (main) main.prepend(banner);
    }
  } catch (e) { /* non-critical */ }
}

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
function showToast(message, type = 'info') {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = `toast toast--${type}`;
  toast.classList.remove('hidden');
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 4000);
}

/* ============================================================
   HELPERS
   ============================================================ */
function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

function setLoading(btn, spinnerEl, loading) {
  btn.disabled = loading;
  spinnerEl.classList.toggle('hidden', !loading);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncate(str, maxLen) {
  return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val !== null && val !== undefined ? val : '';
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function setChecked(id, val) {
  const el = document.getElementById(id);
  if (el) el.checked = !!val;
}

function getChecked(id) {
  const el = document.getElementById(id);
  return el ? el.checked : false;
}
