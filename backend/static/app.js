/**
 * AI Home Hub v0.3.0 – Mac Control Center
 * Vanilla JS, zero dependencies, zero build step.
 * Features: sidebar nav, skills CRUD, model selector, profile pills
 */

/* ============================================================
   STATE
   ============================================================ */
const uploadedFiles = [];
let currentSessionId = null;
let currentProfile = 'chat';
let ws = null;
let wsReconnectTimer = null;
let _currentSettings = null;
let _settingsProjects = {};
let _settingsAllowedDirs = [];
let _allSkills = [];
let _selectedTagFilter = null;
let _selectedAgentSkills = new Set();
let _ollamaModels = [];
let toast, toastTimer;

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  toast = document.getElementById('toast');

  bindSidebarNav();
  bindMobileMenu();
  initSidebarOverlay();
  bindChatEvents();
  bindAgentsEvents();
  bindSkillsEvents();
  bindActionsEvents();
  bindSettingsEvents();
  initWebSocket();
  checkSetupStatus();
  bindMobileDragDrop();
});

/* ============================================================
   SIDEBAR NAVIGATION
   ============================================================ */
function bindSidebarNav() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tabName) {
  document.querySelectorAll('.nav-item').forEach(b => {
    b.classList.toggle('nav-item--active', b.dataset.tab === tabName);
    b.setAttribute('aria-selected', String(b.dataset.tab === tabName));
  });
  document.querySelectorAll('.tab-panel').forEach(p => {
    p.classList.toggle('hidden', p.id !== `tab-${tabName}`);
  });

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('sidebar--open');

  // Lazy-load tab data
  if (tabName === 'agents') { refreshAgents(); loadAgentSkillSelect(); }
  if (tabName === 'skills') loadSkills();
  if (tabName === 'actions') { loadQuickActions(); loadVSCodeProjects(); }
  if (tabName === 'settings') { loadSettings(); loadOllamaModels(); }
}

function bindMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (btn) {
    btn.addEventListener('click', () => {
      sidebar.classList.toggle('sidebar--open');
    });
  }

  // Close sidebar when tapping overlay
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('sidebar--open');
    });
  }
}

/** Observe sidebar open/close to toggle overlay visibility */
function initSidebarOverlay() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!sidebar || !overlay) return;

  const observer = new MutationObserver(() => {
    const isOpen = sidebar.classList.contains('sidebar--open');
    overlay.style.display = isOpen ? 'block' : 'none';
  });
  observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
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
    try { handleWsMessage(JSON.parse(event.data)); } catch (e) { /* ignore */ }
  };
  ws.onclose = () => {
    setWsStatus(false);
    wsReconnectTimer = setTimeout(initWebSocket, 5000);
  };
  ws.onerror = () => setWsStatus(false);
}

function setWsStatus(connected) {
  const dot = document.getElementById('ws-dot');
  const label = document.getElementById('ws-label');
  if (dot) dot.className = `ws-dot ${connected ? 'ws-dot--connected' : 'ws-dot--disconnected'}`;
  if (label) label.textContent = connected ? 'Live' : 'Offline';
}

function handleWsMessage(msg) {
  if (msg.type === 'agent_update') updateAgentCard(msg.agent);
  else if (msg.type === 'notification') showToast(msg.message, 'info');
}

function wsPing() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }));
  }
}
setInterval(wsPing, 30000);

/* ============================================================
   PROFILE PILLS & MODEL SELECTOR
   ============================================================ */
function bindProfilePills() {
  document.querySelectorAll('#profile-pills .pill').forEach(pill => {
    pill.addEventListener('click', () => {
      currentProfile = pill.dataset.profile;
      document.querySelectorAll('#profile-pills .pill').forEach(p =>
        p.classList.toggle('pill--active', p.dataset.profile === currentProfile)
      );
      updateModelBadge();
    });
  });
}

function updateModelBadge() {
  const badge = document.getElementById('model-badge');
  if (!badge) return;

  // Try to find model for current profile from settings
  const profiles = _currentSettings?.profiles || {};
  const profileConfig = profiles[currentProfile];
  if (profileConfig && profileConfig.model) {
    badge.textContent = profileConfig.model;
  } else {
    // Fallback: find from ollama models
    const match = _ollamaModels.find(m => m.profile === currentProfile);
    badge.textContent = match ? match.name : (_currentSettings?.llm?.model || 'llama3.2');
  }
}

/* ============================================================
   CHAT
   ============================================================ */
function bindChatEvents() {
  bindProfilePills();

  document.getElementById('send-btn').addEventListener('click', sendMessage);
  document.getElementById('chat-input').addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') sendMessage();
  });
  document.getElementById('new-session-btn').addEventListener('click', () => {
    currentSessionId = null;
    document.getElementById('chat-history').innerHTML = '';
    document.getElementById('session-label').textContent = 'Nova relace';
    showToast('Nova relace zahajena', 'info');
  });

  // File attach
  const attachBtn = document.getElementById('attach-btn');
  const fileInput = document.getElementById('file-input');
  if (attachBtn && fileInput) {
    attachBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      handleFiles(Array.from(fileInput.files));
      fileInput.value = '';
    });
  }
}

async function handleFiles(files) {
  if (!files.length) return;
  for (const file of files) {
    try {
      const data = await uploadFile(file);
      uploadedFiles.push({ id: data.id, filename: data.filename });
      renderAttachedFiles();
      showToast(`Soubor "${data.filename}" nahran.`, 'success');
    } catch (err) {
      showToast(`Chyba nahravani "${file.name}": ${err.message}`, 'error');
    }
  }
}

async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
  return res.json();
}

function renderAttachedFiles() {
  const el = document.getElementById('attached-files');
  if (!el) return;
  if (uploadedFiles.length) {
    show(el);
    el.innerHTML = uploadedFiles.map(f => `
      <span class="attached-file">
        ${escHtml(truncate(f.filename, 25))}
        <button class="attached-file__remove" data-id="${escHtml(f.id)}">&#10005;</button>
      </span>
    `).join('');
    el.querySelectorAll('.attached-file__remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = uploadedFiles.findIndex(f => f.id === btn.dataset.id);
        if (idx !== -1) uploadedFiles.splice(idx, 1);
        renderAttachedFiles();
      });
    });
  } else {
    hide(el);
  }
}

async function sendMessage() {
  const chatInput = document.getElementById('chat-input');
  const message = chatInput.value.trim();
  if (!message) { showToast('Zprava nemuze byt prazdna.', 'warning'); return; }

  // Map profile to mode
  const modeMap = { chat: 'general', tech: 'general', vision: 'general', dolphin: 'general' };
  const mode = modeMap[currentProfile] || 'general';

  const contextFileIds = uploadedFiles.map(f => f.id);

  const sendBtn = document.getElementById('send-btn');
  const chatSpinner = document.getElementById('chat-spinner');
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
    if (data.session_id) {
      currentSessionId = data.session_id;
      document.getElementById('session-label').textContent = `Relace: ${data.session_id}`;
    }
    appendBubble('ai', data.reply, data.meta);
  } catch (err) {
    showToast(`Chyba: ${err.message}`, 'error');
    // Remove last user bubble on error
    const bubbles = document.getElementById('chat-history').querySelectorAll('.bubble--user');
    if (bubbles.length) bubbles[bubbles.length - 1].remove();
  } finally {
    setLoading(sendBtn, chatSpinner, false);
  }
}

function appendBubble(role, text, meta) {
  const chatHistoryEl = document.getElementById('chat-history');
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
   AGENTS
   ============================================================ */
function bindAgentsEvents() {
  document.getElementById('spawn-btn').addEventListener('click', spawnAgent);
  document.getElementById('refresh-agents-btn').addEventListener('click', refreshAgents);
  document.getElementById('cleanup-agents-btn').addEventListener('click', cleanupAgents);

  // Agent type pill group
  bindPillGroup('agent-type-pills');
}

function bindPillGroup(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      container.querySelectorAll('.pill').forEach(p => p.classList.remove('pill--active'));
      pill.classList.add('pill--active');
    });
  });
}

function getPillValue(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;
  const active = container.querySelector('.pill--active');
  return active ? active.dataset.value : null;
}

async function loadAgentSkillSelect() {
  const el = document.getElementById('agent-skill-select');
  if (!el) return;
  try {
    const res = await fetch('/api/skills');
    const data = await res.json();
    const skills = data.skills || [];
    if (!skills.length) {
      el.innerHTML = '<p class="hint-text">Zadne skills k dispozici.</p>';
      return;
    }
    el.innerHTML = skills.map(s => `
      <div class="skill-select-chip" data-skill-id="${escHtml(s.id)}">
        <span class="skill-select-chip__icon">${escHtml(s.icon || '⚡')}</span>
        ${escHtml(s.name)}
      </div>
    `).join('');
    el.querySelectorAll('.skill-select-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const id = chip.dataset.skillId;
        if (_selectedAgentSkills.has(id)) {
          _selectedAgentSkills.delete(id);
          chip.classList.remove('skill-select-chip--selected');
        } else {
          _selectedAgentSkills.add(id);
          chip.classList.add('skill-select-chip--selected');
        }
      });
    });
  } catch (err) {
    el.innerHTML = `<p class="hint-text">Chyba: ${escHtml(err.message)}</p>`;
  }
}

async function spawnAgent() {
  const agentType = getPillValue('agent-type-pills') || 'general';
  const goal = document.getElementById('agent-goal').value.trim();
  const workspace = document.getElementById('agent-workspace').value.trim() || null;

  if (!goal) { showToast('Cil je povinny.', 'warning'); return; }

  const spawnBtn = document.getElementById('spawn-btn');
  const spawnSpinner = document.getElementById('spawn-spinner');
  setLoading(spawnBtn, spawnSpinner, true);

  try {
    const body = {
      agent_type: agentType,
      task: { goal },
      workspace,
      skill_ids: Array.from(_selectedAgentSkills),
    };
    const res = await fetch('/api/agents/spawn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
    const data = await res.json();
    showToast(`Agent ${data.agent_id} spusten!`, 'success');
    document.getElementById('agent-goal').value = '';
    _selectedAgentSkills.clear();
    document.querySelectorAll('.skill-select-chip--selected').forEach(c =>
      c.classList.remove('skill-select-chip--selected')
    );
    await refreshAgents();
  } catch (err) {
    showToast(`Chyba spawnu: ${err.message}`, 'error');
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
    list.innerHTML = `<p class="empty-state">Chyba: ${escHtml(err.message)}</p>`;
  }
}

function renderAgentsList(agents) {
  const list = document.getElementById('agents-list');
  if (!agents.length) {
    list.innerHTML = '<p class="empty-state">Zadni agenti nebezi.</p>';
    return;
  }
  list.innerHTML = agents.map(a => renderAgentCard(a)).join('');
  bindAgentCardButtons(list);
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
  const elapsed = agent.created_at ? getElapsed(agent.created_at) : '';

  return `
    <div class="agent-card" id="agent-${escHtml(agent.agent_id)}">
      <div class="agent-card-header">
        <span class="agent-type-badge">${escHtml(agent.agent_type)}</span>
        <span class="agent-id">${escHtml(agent.agent_id)}</span>
        <span class="agent-status ${statusClass}">${escHtml(agent.status)}</span>
      </div>
      <p class="agent-goal">${escHtml(agent.task?.goal || 'Zadny cil')}</p>
      <div class="progress-bar-wrap">
        <div class="progress-bar" style="width:${agent.progress}%"></div>
      </div>
      <p class="agent-message">${escHtml(agent.message || '')}</p>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span class="agent-elapsed">${elapsed}</span>
        <div class="agent-actions">
          ${isActive ? `<button class="btn btn--ghost btn--small" data-interrupt="${escHtml(agent.agent_id)}">Stop</button>` : ''}
          <button class="btn btn--ghost btn--small" data-delete-agent="${escHtml(agent.agent_id)}">Smazat</button>
        </div>
      </div>
      ${agent.artifacts.length ? `<p class="agent-artifacts">Artefakty: ${agent.artifacts.length}</p>` : ''}
    </div>`;
}

function bindAgentCardButtons(container) {
  container.querySelectorAll('[data-interrupt]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await fetch(`/api/agents/${btn.dataset.interrupt}/interrupt`, { method: 'POST' });
      showToast(`Agent ${btn.dataset.interrupt} zastaven`, 'info');
      await refreshAgents();
    });
  });
  container.querySelectorAll('[data-delete-agent]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await fetch(`/api/agents/${btn.dataset.deleteAgent}`, { method: 'DELETE' });
      showToast(`Agent ${btn.dataset.deleteAgent} smazan`, 'info');
      await refreshAgents();
    });
  });
}

function updateAgentCard(agent) {
  const existing = document.getElementById(`agent-${agent.agent_id}`);
  const list = document.getElementById('agents-list');
  if (!list) return;

  if (existing) {
    existing.outerHTML = renderAgentCard(agent);
    const updated = document.getElementById(`agent-${agent.agent_id}`);
    if (updated) bindAgentCardButtons(updated);
  } else {
    refreshAgents();
  }
}

async function cleanupAgents() {
  try {
    const res = await fetch('/api/agents/cleanup', { method: 'POST' });
    const data = await res.json();
    showToast(`Odstraneno ${data.removed} dokoncenych agentu`, 'success');
    await refreshAgents();
  } catch (err) {
    showToast(`Chyba: ${err.message}`, 'error');
  }
}

function getElapsed(isoDate) {
  try {
    const ms = Date.now() - new Date(isoDate).getTime();
    const sec = Math.floor(ms / 1000);
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ${sec % 60}s`;
    return `${Math.floor(min / 60)}h ${min % 60}m`;
  } catch { return ''; }
}

/* ============================================================
   SKILLS
   ============================================================ */
function bindSkillsEvents() {
  document.getElementById('add-skill-btn').addEventListener('click', () => openSkillModal());
  document.getElementById('skill-modal-close').addEventListener('click', closeSkillModal);
  document.getElementById('skill-modal-cancel').addEventListener('click', closeSkillModal);
  document.getElementById('skill-modal-save').addEventListener('click', saveSkill);
  document.getElementById('skills-search').addEventListener('input', debounce(loadSkills, 300));

  // Close modal on overlay click
  document.getElementById('skill-modal').addEventListener('click', (e) => {
    if (e.target.id === 'skill-modal') closeSkillModal();
  });
}

async function loadSkills() {
  const grid = document.getElementById('skills-grid');
  const searchInput = document.getElementById('skills-search');
  const search = searchInput ? searchInput.value.trim() : '';

  try {
    let url = '/api/skills';
    const params = [];
    if (_selectedTagFilter) params.push(`tag=${encodeURIComponent(_selectedTagFilter)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (params.length) url += '?' + params.join('&');

    const [skillsRes, tagsRes] = await Promise.all([
      fetch(url),
      fetch('/api/skills/tags'),
    ]);
    const skillsData = await skillsRes.json();
    const tagsData = await tagsRes.json();

    _allSkills = skillsData.skills || [];
    renderSkillsGrid(_allSkills);
    renderTagPills(tagsData.tags || []);
  } catch (err) {
    grid.innerHTML = `<p class="empty-state">Chyba: ${escHtml(err.message)}</p>`;
  }
}

function renderSkillsGrid(skills) {
  const grid = document.getElementById('skills-grid');
  if (!skills.length) {
    grid.innerHTML = '<p class="empty-state">Zadne skills nalezeny.</p>';
    return;
  }
  grid.innerHTML = skills.map(s => `
    <div class="skill-card" data-skill-id="${escHtml(s.id)}">
      <div class="skill-card-header">
        <span class="skill-card-icon">${escHtml(s.icon || '⚡')}</span>
        <div class="skill-card-info">
          <div class="skill-card-name">${escHtml(s.name)}</div>
          <div class="skill-card-desc">${escHtml(s.description || '')}</div>
        </div>
      </div>
      <div class="skill-card-tags">
        ${(s.tags || []).map(t => `<span class="skill-tag">${escHtml(t)}</span>`).join('')}
      </div>
      <div class="skill-card-actions">
        <button class="btn btn--ghost btn--small" data-edit-skill="${escHtml(s.id)}">Upravit</button>
        <button class="btn btn--ghost btn--small" data-delete-skill="${escHtml(s.id)}">Smazat</button>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('[data-edit-skill]').forEach(btn => {
    btn.addEventListener('click', () => {
      const skill = _allSkills.find(s => s.id === btn.dataset.editSkill);
      if (skill) openSkillModal(skill);
    });
  });

  grid.querySelectorAll('[data-delete-skill]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.deleteSkill;
      try {
        const res = await fetch(`/api/skills/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        showToast('Skill smazan', 'success');
        loadSkills();
      } catch (err) {
        showToast(`Chyba: ${err.message}`, 'error');
      }
    });
  });
}

function renderTagPills(tags) {
  const el = document.getElementById('skills-tag-pills');
  if (!el) return;
  el.innerHTML = `
    <button class="pill pill--tag ${!_selectedTagFilter ? 'pill--active' : ''}" data-tag="">Vse</button>
    ${tags.map(t => `
      <button class="pill pill--tag ${_selectedTagFilter === t ? 'pill--active' : ''}" data-tag="${escHtml(t)}">${escHtml(t)}</button>
    `).join('')}
  `;
  el.querySelectorAll('.pill--tag').forEach(pill => {
    pill.addEventListener('click', () => {
      _selectedTagFilter = pill.dataset.tag || null;
      loadSkills();
    });
  });
}

function openSkillModal(skill = null) {
  const modal = document.getElementById('skill-modal');
  const title = document.getElementById('skill-modal-title');

  if (skill) {
    title.textContent = 'Upravit Skill';
    document.getElementById('skill-edit-id').value = skill.id;
    document.getElementById('skill-name').value = skill.name || '';
    document.getElementById('skill-description').value = skill.description || '';
    document.getElementById('skill-icon').value = skill.icon || '';
    document.getElementById('skill-prompt').value = skill.system_prompt_addition || '';
    document.getElementById('skill-tags').value = (skill.tags || []).join(', ');

    // Set tool checkboxes
    const tools = skill.tools || [];
    document.querySelectorAll('.skill-tool-cb').forEach(cb => {
      cb.checked = tools.includes(cb.value);
    });
  } else {
    title.textContent = 'Novy Skill';
    document.getElementById('skill-edit-id').value = '';
    document.getElementById('skill-name').value = '';
    document.getElementById('skill-description').value = '';
    document.getElementById('skill-icon').value = '';
    document.getElementById('skill-prompt').value = '';
    document.getElementById('skill-tags').value = '';
    document.querySelectorAll('.skill-tool-cb').forEach(cb => cb.checked = false);
  }

  show(modal);
}

function closeSkillModal() {
  hide(document.getElementById('skill-modal'));
}

async function saveSkill() {
  const editId = document.getElementById('skill-edit-id').value;
  const name = document.getElementById('skill-name').value.trim();
  const description = document.getElementById('skill-description').value.trim();
  const icon = document.getElementById('skill-icon').value.trim() || '\u26A1';
  const systemPrompt = document.getElementById('skill-prompt').value.trim();
  const tagsStr = document.getElementById('skill-tags').value.trim();
  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];
  const tools = Array.from(document.querySelectorAll('.skill-tool-cb:checked')).map(cb => cb.value);

  if (!name) { showToast('Nazev je povinny', 'warning'); return; }

  const body = { name, description, icon, system_prompt_addition: systemPrompt, tools, tags };

  try {
    let res;
    if (editId) {
      res = await fetch(`/api/skills/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }
    if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
    showToast(editId ? 'Skill upraven' : 'Skill vytvoren', 'success');
    closeSkillModal();
    loadSkills();
  } catch (err) {
    showToast(`Chyba: ${err.message}`, 'error');
  }
}

/* ============================================================
   OLLAMA MODELS
   ============================================================ */
async function loadOllamaModels() {
  try {
    const res = await fetch('/api/ollama/models');
    const data = await res.json();
    _ollamaModels = data.models || [];
    populateModelDropdown();
  } catch (err) {
    // Silently fail – models dropdown will have manual input fallback
  }
}

function populateModelDropdown() {
  const select = document.getElementById('s-llm-model');
  if (!select) return;

  const currentModel = select.value || (_currentSettings?.llm?.model || 'llama3.2');

  if (_ollamaModels.length) {
    select.innerHTML = _ollamaModels.map(m =>
      `<option value="${escHtml(m.name)}">${escHtml(m.name)} (${m.size_gb} GB, ${m.profile})</option>`
    ).join('');
  } else {
    select.innerHTML = `<option value="${escHtml(currentModel)}">${escHtml(currentModel)}</option>`;
  }

  // Restore selection
  if (currentModel) {
    select.value = currentModel;
    if (!select.value && select.options.length) select.selectedIndex = 0;
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
    slider.addEventListener('input', () => volLabel.textContent = `${slider.value}%`);
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
      if (!url) { showToast('Zadej URL', 'warning'); return; }
      const r = await macOSAction('safari_open', { url });
      showMacResult(r);
    });
  }

  // VS Code
  const vcBtn = document.getElementById('vscode-open-btn');
  if (vcBtn) {
    vcBtn.addEventListener('click', async () => {
      const sel = document.getElementById('vscode-project-select');
      const key = sel.value;
      if (!key) { showToast('Vyber projekt', 'warning'); return; }
      try {
        const res = await fetch('/api/integrations/vscode/open-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_key: key }),
        });
        showMacResult(await res.json());
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
      if (!path) { showToast('Zadej cestu', 'warning'); return; }
      const r = await macOSAction('finder_open', { path });
      showMacResult(r);
    });
  }

  // Git buttons
  document.querySelectorAll('[data-git]').forEach(btn => {
    btn.addEventListener('click', () => handleGitAction(btn.dataset.git));
  });

  // OpenClaw
  const openclawToggle = document.getElementById('openclaw-toggle');
  if (openclawToggle) {
    openclawToggle.addEventListener('click', () => {
      const expanded = openclawToggle.getAttribute('aria-expanded') === 'true';
      openclawToggle.setAttribute('aria-expanded', String(!expanded));
      document.getElementById('openclaw-body').classList.toggle('collapsed', expanded);
    });
  }

  const actionBtn = document.getElementById('action-btn');
  if (actionBtn) actionBtn.addEventListener('click', triggerAction);
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
  if (!repoPath) { showToast('Zadej cestu k repo', 'warning'); return; }

  const params = { repo_path: repoPath };

  if (action === 'commit') {
    params.message = document.getElementById('git-commit-msg').value.trim();
    if (!params.message) { showToast('Zadej commit zpravu', 'warning'); return; }
  }

  try {
    if (['status', 'log', 'branches'].includes(action)) {
      const url = `/api/integrations/git/${action}?repo_path=${encodeURIComponent(repoPath)}`;
      const r = await fetch(url);
      showGitResult(await r.json());
    } else {
      const r = await fetch(`/api/integrations/git/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      showGitResult(await r.json());
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
  if (data.data) content += `<pre style="margin-top:0.5rem;font-size:0.8rem;overflow-x:auto;color:#94a3b8">${escHtml(JSON.stringify(data.data, null, 2))}</pre>`;
  el.innerHTML = content;
  show(el);
}

async function triggerAction() {
  const actionSelect = document.getElementById('action-select');
  const actionBtn = document.getElementById('action-btn');
  const actionSpinner = document.getElementById('action-spinner');
  const actionResult = document.getElementById('action-result');
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
    showToast(`Chyba akce: ${err.message}`, 'error');
  } finally {
    setLoading(actionBtn, actionSpinner, false);
  }
}

async function loadQuickActions() {
  const list = document.getElementById('quick-actions-list');
  if (!list) return;
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    const actions = data.settings?.quick_actions || [];
    if (!actions.length) {
      list.innerHTML = '<p class="empty-state">Zadne rychle akce. Pridej je v settings.json.</p>';
      return;
    }
    list.innerHTML = actions.map(a => `
      <button class="action-card" data-action-id="${escHtml(a.id)}">
        <span class="action-card__icon">${escHtml(a.icon || '⚡')}</span>
        <span class="action-card__name">${escHtml(a.name)}</span>
        <span class="action-card__desc">${a.steps?.length || 0} kroku</span>
      </button>
    `).join('');
    list.querySelectorAll('[data-action-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        showToast(`Akce "${btn.querySelector('.action-card__name').textContent}" spustena`, 'info');
      });
    });
  } catch (err) {
    list.innerHTML = `<p class="empty-state">Chyba: ${escHtml(err.message)}</p>`;
  }
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
      : '<option value="">Zadne projekty</option>';
  } catch (e) {
    sel.innerHTML = '<option value="">Chyba nacitani</option>';
  }
}

/* ============================================================
   SETTINGS
   ============================================================ */
function bindSettingsEvents() {
  document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
  document.getElementById('reload-settings-btn').addEventListener('click', () => {
    loadSettings();
    loadOllamaModels();
  });
  document.getElementById('check-ollama-btn').addEventListener('click', checkOllama);
  document.getElementById('add-project-btn').addEventListener('click', addProject);
  document.getElementById('add-dir-btn').addEventListener('click', addAllowedDir);
}

async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    const s = data.settings;
    _currentSettings = s;

    // LLM
    setVal('s-llm-provider', s.llm?.provider || 'ollama');
    setVal('s-llm-temp', s.llm?.temperature ?? 0.7);
    setVal('s-llm-url', s.llm?.ollama_url || 'http://localhost:11434');

    // Model – set after models are loaded
    const modelSelect = document.getElementById('s-llm-model');
    if (modelSelect && modelSelect.options.length <= 1) {
      modelSelect.innerHTML = `<option value="${escHtml(s.llm?.model || 'llama3.2')}">${escHtml(s.llm?.model || 'llama3.2')}</option>`;
    }
    setVal('s-llm-model', s.llm?.model || 'llama3.2');

    // Integrations
    setChecked('s-vscode-enabled', s.integrations?.vscode?.enabled);
    setVal('s-vscode-binary', s.integrations?.vscode?.binary_path || '');
    setChecked('s-macos-enabled', s.integrations?.macos?.enabled);
    setChecked('s-mcp-enabled', s.integrations?.claude_mcp?.enabled);
    setVal('s-mcp-type', s.integrations?.claude_mcp?.connection_type || 'stdio');
    setVal('s-mcp-path', s.integrations?.claude_mcp?.stdio_path || '');
    setChecked('s-ag-enabled', s.integrations?.antigravity?.enabled);
    setVal('s-ag-endpoint', s.integrations?.antigravity?.api_endpoint || '');
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

    // Update model badge
    updateModelBadge();
  } catch (err) {
    showToast(`Chyba nacitani nastaveni: ${err.message}`, 'error');
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
    showToast('Nastaveni ulozeno!', 'success');
    await loadSettings();
  } catch (err) {
    showToast(`Chyba ukladani: ${err.message}`, 'error');
  } finally {
    setLoading(saveBtn, saveSpinner, false);
  }
}

async function checkOllama() {
  const el = document.getElementById('ollama-status');
  el.className = 'result-box';
  el.textContent = 'Kontroluji...';
  el.style.color = '#94a3b8';
  show(el);
  try {
    const res = await fetch('/api/settings/ollama/health', { method: 'POST' });
    const data = await res.json();
    const ok = data.status === 'ok';
    el.className = `result-box ${ok ? 'result-box--ok' : 'result-box--error'}`;
    el.style.color = '';
    el.innerHTML = ok
      ? `Pripojeno k Ollama na <strong>${escHtml(data.url)}</strong>. Modely: ${(data.models || []).map(m => `<code>${escHtml(m)}</code>`).join(', ') || 'zadne'}`
      : `Nelze se pripojit k Ollama: ${escHtml(data.error || data.status)}`;
    // Reload models after health check
    if (ok) loadOllamaModels();
  } catch (err) {
    el.className = 'result-box result-box--error';
    el.style.color = '';
    el.textContent = `Chyba: ${err.message}`;
  }
}

// Project management
function addProject() {
  const key = document.getElementById('new-project-key').value.trim();
  const path = document.getElementById('new-project-path').value.trim();
  if (!key || !path) { showToast('Klic a cesta jsou povinne', 'warning'); return; }
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
  if (!keys.length) { el.innerHTML = '<p class="hint-text">Zadne projekty.</p>'; return; }
  el.innerHTML = keys.map(k => `
    <div class="list-item">
      <code class="list-item__key">${escHtml(k)}</code>
      <span class="list-item__val">${escHtml(_settingsProjects[k].path || '')}</span>
      <button class="btn btn--ghost btn--small" data-remove-project="${escHtml(k)}">Odebrat</button>
    </div>
  `).join('');
  el.querySelectorAll('[data-remove-project]').forEach(btn => {
    btn.addEventListener('click', () => removeProject(btn.dataset.removeProject));
  });
}

// Allowed dirs
function addAllowedDir() {
  const dir = document.getElementById('new-allowed-dir').value.trim();
  if (!dir) { showToast('Zadej cestu k adresari', 'warning'); return; }
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
    el.innerHTML = '<p class="hint-text" style="color:#f87171">Varovani: Zadne povolene adresare. API pristup k fs je zakazan.</p>';
    return;
  }
  el.innerHTML = _settingsAllowedDirs.map(d => `
    <div class="list-item">
      <code class="list-item__val" style="flex:1">${escHtml(d)}</code>
      <button class="btn btn--ghost btn--small" data-remove-dir="${escHtml(d)}">Odebrat</button>
    </div>
  `).join('');
  el.querySelectorAll('[data-remove-dir]').forEach(btn => {
    btn.addEventListener('click', () => removeAllowedDir(btn.dataset.removeDir));
  });
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
      const banner = document.createElement('div');
      banner.id = 'setup-banner';
      banner.className = 'setup-banner';
      banner.innerHTML = `
        <strong>Prvni nastaveni potreba</strong>
        <button class="setup-banner__dismiss" onclick="document.getElementById('setup-banner').remove()" title="Zavrít">&#10005;</button>
        <ul class="setup-banner__list">
          ${incomplete.map(i => `<li><button class="setup-banner__link" onclick="switchTab('settings')">${escHtml(i.label)}</button> – ${escHtml(i.hint)}</li>`).join('')}
        </ul>
      `;
      const panel = document.getElementById('tab-chat');
      if (panel) panel.prepend(banner);
    }
  } catch (e) { /* non-critical */ }
}

/* ============================================================
   TOAST
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
function show(el) { if (el) el.classList.remove('hidden'); }
function hide(el) { if (el) el.classList.add('hidden'); }

function setLoading(btn, spinnerEl, loading) {
  if (btn) btn.disabled = loading;
  if (spinnerEl) spinnerEl.classList.toggle('hidden', !loading);
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
  return str.length > maxLen ? str.slice(0, maxLen - 1) + '\u2026' : str;
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

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/* ============================================================
   MOBILE DRAG & DROP FILE UPLOAD
   ============================================================ */
function bindMobileDragDrop() {
  const chatArea = document.getElementById('tab-chat');
  if (!chatArea) return;

  chatArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    chatArea.classList.add('drag-over');
  });
  chatArea.addEventListener('dragleave', () => {
    chatArea.classList.remove('drag-over');
  });
  chatArea.addEventListener('drop', (e) => {
    e.preventDefault();
    chatArea.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files);
    if (files.length) handleFiles(files);
  });
}
