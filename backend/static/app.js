/**
 * AI Home Hub – Mac Control Center
 * Vanilla JS, zero dependencies, zero build step.
 * Features: sidebar nav, skills CRUD, model selector, profile pills
 */

/* ============================================================
   STATE
   ============================================================ */
const uploadedFiles = [];
const attachedImages = []; // {filename, data (base64), mime_type, previewUrl}
let currentSessionId = null;
let currentProfile = localStorage.getItem('aih_profile') || 'lean_ci';
let ws = null;
// wsReconnectTimer removed – handled inside ReconnectingWS
let _currentSettings = null;
let _settingsProjects = {};
let _settingsAllowedDirs = [];
let _settingsExternalPaths = [];
let _allSkills = [];
let _selectedTagFilter = null;
let _selectedAgentSkills = new Set();
let _selectedFsAgentSkills = new Set(); // filesystem-based SKILL.md skills
let _agentSkillsDirs = [];
let _ollamaModels = [];
let toast, toastTimer;
let _streamingWs = null; // active streaming WebSocket
let _isStreaming = false;

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

/* ============================================================
   I18N – Czech UI strings
   Add new keys here; never hard-code Czech strings elsewhere.
   API error details (HTTPException) stay in English.
   ============================================================ */
const TEXTS = {
  cs: {
    // Image / vision
    attach_image: 'Přidat obrázek',
    screenshot: 'Screenshot',
    vision_mode_active: 'Vision mode aktivní',

    // Session / chat
    new_chat: 'Nový chat zahájen',
    new_session: 'Nová relace',
    msg_empty: 'Zpráva nemůže být prázdná.',
    conversation_load_error: 'Chyba při načítání konverzace',
    conversation_deleted: 'Konverzace smazána',
    conversation_delete_confirm: 'Opravdu smazat tuto konverzaci?',
    delete_error: 'Chyba při mazání',

    // Agents
    goal_required: 'Cíl je povinný.',
    agent_stopped: 'zastaven',
    agent_deleted: 'smazán',
    agents_cleared: 'dokončených agentů odstraněno',

    // Skills
    skill_deleted: 'Skill smazán',
    skill_name_required: 'Název je povinný',
    skill_updated: 'Skill upraven',
    skill_created: 'Skill vytvořen',
    edit_skill: 'Upravit Skill',
    new_skill: 'Nový Skill',

    // Actions
    action_deleted: 'Akce smazána',
    action_updated: 'Akce upravena',
    action_created: 'Akce vytvořena',
    enter_action_name: 'Zadej název akce',
    edit_action: 'Upravit akci',
    new_action: 'Nová rychlá akce',
    action_delete_confirm: 'Smazat tuto akci?',

    // Settings
    settings_saved: 'Nastavení uloženo!',
    settings_load_error: 'Chyba načítání nastavení',
    settings_save_error: 'Chyba ukládání',
    key_path_required: 'Klíč a cesta jsou povinné',

    // Knowledge base
    enter_dir_path: 'Zadej cestu k adresáři',
    enter_path: 'Zadej cestu',
    path_exists: 'Cesta již existuje',
    files_found_label: 'Nalezeno souborů',
    scan_failed: 'Scan selhal',
    ingest_failed: 'Indexace selhala',
    ingest_done_title: 'Indexace dokončena',
    ingest_files_label: 'Indexováno souborů',
    total_chunks_label: 'Celkem chunků',
    failed_label: 'Selhalo',
    errors_title: 'Chyby',

    // Git / integrations
    enter_url: 'Zadej URL',
    select_project: 'Vyber projekt',
    enter_repo_path: 'Zadej cestu k repo',
    enter_commit_msg: 'Zadej commit zprávu',

    // Resident Agent
    resident_idle: 'Čeká',
    resident_thinking: 'Přemýšlí...',
    resident_executing: 'Provádí akci',
    resident_error: 'Chyba',
    resident_start: 'Spustit',
    resident_stop: 'Zastavit',
    resident_tick_label: 'Tick',
    resident_no_actions: 'Agent zatím neprovedl žádnou akci',
    resident_task_name: 'Název úkolu',
    resident_task_desc: 'Popis',
    resident_task_submit: 'Přidat úkol',
    resident_task_success: 'Úkol přidán',
    resident_agent_disabled: 'Nejdřív spusť agenta',
    resident_ago: 'před',

    // Resource Monitor
    resource_ram: 'RAM',
    resource_cpu: 'CPU',
    resource_swap: 'Swap',
    resource_ollama: 'Ollama',
    resource_backend: 'Backend',
    resource_throttle: 'Systém pod zátěží – agenti zpomaleni',
    resource_block: 'Systém přetížen – nové agenty blokovány',
    resource_updated: 'Aktualizováno',

    // Overnight Jobs
    overnight_active: 'Noční okno aktivní',
    overnight_inactive: 'Mimo noční okno',
    overnight_window: 'Noční okno',
    overnight_next: 'Příští spuštění',
    overnight_running_now: 'Probíhá nyní',
    overnight_kb_reindex: 'KB Reindexování',
    overnight_git_sweep: 'Git Sweep',
    overnight_summary: 'Noční Summary',
    overnight_done: 'Dokončeno',
    overnight_error_status: 'Chyba',
    overnight_waiting: 'Čeká',
    overnight_running: 'Probíhá',
    overnight_indexed: 'Indexováno',
    overnight_skipped: 'přeskočeno',
    overnight_checked: 'Zkontrolováno',
    overnight_dirty: 'dirty',
    overnight_no_summary: 'Žádné noční summary zatím. První proběhne tuto noc v 22:00.',
    overnight_summary_ready: 'Noční summary připraveno',
    overnight_show_all: 'zobrazit vše',

    // Guardrails
    guardrail_steps: 'Kroky',
    guardrail_tokens: 'Tokeny',
    guardrail_stopped: 'Guardrail zastaven',

    // Experimental features
    experimental_title: 'Experimentální funkce',
    experimental_warning: 'Experimentální funkce mohou být nestabilní nebo se rozbít při aktualizaci systému.',

    // Memory nightly
    memory_filter_nightly: 'Noční summary',

    // Knowledge Manager (upload)
    kb_drop_files: 'Přetáhni soubory nebo klikni pro výběr',
    kb_upload_btn: 'Nahrát soubory',
    kb_uploading: 'Nahrávám...',
    kb_upload_done: 'Nahrávání dokončeno',
    kb_upload_error: 'Chyba nahrávání',
    kb_mode_index: 'Indexovat',
    kb_mode_analyze: 'Analýza',
    kb_mode_index_hint: 'Soubory se uloží do KB pro sémantické vyhledávání.',
    kb_mode_analyze_hint: 'Soubory se okamžitě analyzují – AI vrátí shrnutí, nic se neukládá.',
    kb_no_files: 'Žádné soubory nebyly vybrány',
    kb_unsupported: 'Nepodporovaný formát',
    kb_collection_label: 'Kolekce',
    kb_overview_loading: 'Načítám přehled...',
    kb_overview_empty: 'Knowledge Base je prázdná. Nahraj soubory nebo spusť indexaci.',
    kb_doc_count: 'dokumentů',
    kb_chunk_count: 'chunků',

    // Generic UI
    delete: 'Smazat',
    close: 'Zavřít',
    scanning: 'Skenuji...',
    indexing: 'Indexuji...',
    checking: 'Kontroluji...',
    error_prefix: 'Chyba',
    error_generic: 'Chyba',
  },
};

/** Return the Czech translation for *key*, falling back to *key* itself. */
function t(key) {
  return TEXTS.cs[key] || key;
}

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
  bindStatusEvents();
  bindJobsEvents();
  bindResidentEvents();
  bindKnowledgeManagerEvents();
  bindQoLFeatures();
  bindWizard();
  bindPromptGenerator();
  bindFilesManager();
  bindCustomProfileBtn();
  initWebSocket();
  checkSetupStatus();
  bindMobileDragDrop();
  loadVersionFromHealth();
  restoreTheme();
});

async function loadVersionFromHealth() {
  try {
    const resp = await fetch('/api/health');
    if (!resp.ok) return;
    const data = await resp.json();
    if (data.version) {
      const el = document.getElementById('app-version');
      if (el) el.textContent = `v${data.version}`;
    }
  } catch (e) { /* non-critical */ }
}

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
  if (tabName === 'status') loadSystemStatus();
  if (tabName === 'agents') { refreshAgents(); loadAgentSkillSelect(); loadFsAgentSkillSelect(); }
  if (tabName === 'skills') loadSkills();
  if (tabName === 'jobs') loadJobs();
  if (tabName === 'actions') { loadQuickActions(); loadVSCodeProjects(); loadActionHistory(); }
  if (tabName === 'settings') { loadSettings(); loadOllamaModels(); loadRuntimeSkills(); }
  if (tabName === 'files-manager') loadFilesManager();
  if (tabName === 'resident') loadResidentDashboard();
  if (tabName === 'overnight') loadOvernightStatus();
  if (tabName === 'knowledge') { loadKbOverview(); loadKBFiles(); loadRetentionConfig(); }
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

/**
 * ReconnectingWS – drop-in wrapper around native WebSocket that:
 *  - reconnects automatically with exponential back-off (up to 30 s)
 *  - sends a JSON ping every 30 s to keep the connection alive
 *  - updates the status indicator in three states: connected / reconnecting / disconnected
 */
class ReconnectingWS {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 500;   // base delay (ms); doubled each retry
    this.pingInterval = null;
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      setWsStatus('connected');
      this._startPing();
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'pong') return;   // heartbeat reply – ignore
        handleWsMessage(msg);
      } catch (e) { /* ignore parse errors */ }
    };

    this.ws.onclose = () => {
      this._stopPing();
      setWsStatus('reconnecting');
      this._scheduleReconnect();
    };

    this.ws.onerror = () => {
      // onerror is always followed by onclose – let onclose drive reconnection
      this.ws.close();
    };
  }

  _startPing() {
    this._stopPing();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  _stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  _scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      setWsStatus('disconnected');
      return;
    }
    // Exponential back-off with jitter, capped at 30 s
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts) + Math.random() * 1000,
      30000,
    );
    this.reconnectAttempts++;
    setTimeout(() => this.connect(), delay);
  }

  /** Send arbitrary data when the socket is open (no-op otherwise). */
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  isConnected() {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

function initWebSocket() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  const wsUrl = `${proto}://${location.host}/ws`;
  ws = new ReconnectingWS(wsUrl);
}

/**
 * Update the sidebar status indicator.
 * @param {'connected'|'reconnecting'|'disconnected'} state
 */
function setWsStatus(state) {
  const dot = document.getElementById('ws-dot');
  const label = document.getElementById('ws-label');
  const map = {
    connected:    ['ws-dot--connected',    'Live'],
    reconnecting: ['ws-dot--reconnecting', 'Reconnecting…'],
    disconnected: ['ws-dot--disconnected', 'Offline'],
  };
  const [cls, text] = map[state] || map.disconnected;
  if (dot) dot.className = `ws-dot ${cls}`;
  if (label) label.textContent = text;
}

function handleWsMessage(msg) {
  if (msg.type === 'agent_update') updateAgentCard(msg.agent);
  else if (msg.type === 'notification') showToast(msg.message, 'info');
  else if (msg.type === 'ingest_progress') handleIngestProgress(msg);
  else if (msg.type === 'job_update') handleJobUpdate(msg.job);
  else if (msg.type === 'status_alert') handleStatusAlert(msg);
  else if (msg.type === 'resident_tick') handleResidentTick(msg);
  else if (msg.type === 'resident_action') handleResidentAction(msg);
  else if (msg.type === 'activity_update') handleActivityUpdate(msg);
  else if (msg.type === 'agent_status') handleAgentStatusUpdate(msg);
}

function handleIngestProgress(msg) {
  const results = document.getElementById('ingest-results');
  if (!results) return;
  results.innerHTML = `
    <div class="scan-summary">
      <strong>${t('indexing')}</strong> ${msg.current} / ${msg.total}<br>
      Soubor: ${escHtml(msg.file)} | Chunků: ${msg.chunks}
      <div class="ingest-progress-bar">
        <div class="ingest-progress-fill" style="width:${Math.round((msg.current / msg.total) * 100)}%"></div>
      </div>
    </div>
  `;
  show(results);
}

// wsPing / setInterval removed – ping is now managed inside ReconnectingWS._startPing

/* ============================================================
   PROFILE PILLS & MODEL SELECTOR
   ============================================================ */
// Fallback profile → default model mapping (used if settings not loaded)
const PROFILE_DEFAULT_MODELS = {
  lean_ci: 'llama3.2',
  pbi_dax: 'qwen2.5-coder:3b',
  mac_admin: 'llama3.2',
  ai_dev: 'llama3.2',
  vision: 'llava:7b',
  // Legacy
  chat: 'llama3.2:latest',
  tech: 'qwen2.5-coder:3b',
  dolphin: 'llama3.2',
};

function bindProfilePills() {
  document.querySelectorAll('#profile-pills .pill[data-profile]').forEach(pill => {
    pill.addEventListener('click', () => {
      currentProfile = pill.dataset.profile;
      localStorage.setItem('aih_profile', currentProfile);
      document.querySelectorAll('#profile-pills .pill[data-profile]').forEach(p =>
        p.classList.toggle('pill--active', p.dataset.profile === currentProfile)
      );
      // Reset model dropdown to default for the selected profile
      _resetModelForProfile(currentProfile);
      updateModelBadge();
      // Start new chat session on profile switch
      currentSessionId = null;
      const sessionLabel = document.getElementById('session-label');
      if (sessionLabel) sessionLabel.textContent = 'Nov\u00e1 relace';
      // RAM warning for vision profile (llava:7b is 4.4 GB)
      if (currentProfile === 'vision') _checkRamForVision();
    });
  });
  // Restore persisted profile on load
  const savedProfile = localStorage.getItem('aih_profile');
  if (savedProfile) {
    const pill = document.querySelector(`#profile-pills .pill[data-profile="${savedProfile}"]`);
    if (pill) {
      pill.click();
    }
  }
}

function _resetModelForProfile(profile) {
  const chatModelSelect = document.getElementById('chat-model-select');
  if (!chatModelSelect) return;

  // Try to get default model from settings
  const profileMap = { lean_ci: 'lean', pbi_dax: 'powerbi', mac_admin: 'chat', ai_dev: 'chat', vision: 'vision', chat: 'chat', tech: 'powerbi', dolphin: 'lean' };
  const settingsKey = profileMap[profile] || profile;
  const profiles = _currentSettings?.profiles || {};
  const profileConfig = profiles[settingsKey] || profiles[profile];

  let defaultModel = '';
  if (profileConfig && profileConfig.model) {
    defaultModel = profileConfig.model;
  } else {
    defaultModel = PROFILE_DEFAULT_MODELS[profile] || '';
  }

  // Set the dropdown – if model exists in options, select it; otherwise reset to empty (default)
  const optionExists = Array.from(chatModelSelect.options).some(o => o.value === defaultModel);
  chatModelSelect.value = optionExists ? defaultModel : '';
}

async function _checkRamForVision() {
  try {
    const resp = await fetch('/api/status/system/resources');
    if (!resp.ok) return;
    const data = await resp.json();
    if (data.status === 'no_data') return;
    const ramPct = data.ram_used_percent || 0;
    if (ramPct > 75 || data.throttle) {
      showToast(
        `llava:7b (4.4 GB) – RAM je na ${ramPct.toFixed(0)}%. Hrozí timeout 180s. Spusť: ollama stop llama3.2`,
        'warning',
        8000
      );
    }
  } catch (e) { /* non-critical */ }
}

function updateModelBadge() {
  const badge = document.getElementById('model-badge');
  const metaName = document.getElementById('chat-meta-model-name');

  let modelName = 'llama3.2';

  // If a chat model is explicitly selected, show that
  const chatModelSelect = document.getElementById('chat-model-select');
  if (chatModelSelect && chatModelSelect.value) {
    modelName = chatModelSelect.value;
  } else {
    // Map UI pill → settings profile key
    const profileMap = { lean_ci: 'lean', pbi_dax: 'powerbi', mac_admin: 'chat', ai_dev: 'chat', vision: 'vision', chat: 'chat', tech: 'powerbi', dolphin: 'lean' };
    const settingsProfileKey = profileMap[currentProfile] || currentProfile;

    const profiles = _currentSettings?.profiles || {};
    const profileConfig = profiles[settingsProfileKey] || profiles[currentProfile];
    if (profileConfig && profileConfig.model) {
      modelName = profileConfig.model;
    } else {
      modelName = _currentSettings?.llm?.default_model
        || _currentSettings?.llm?.model
        || 'llama3.2';
    }
  }

  if (badge) badge.textContent = modelName;
  if (metaName) metaName.textContent = modelName;
}

function populateChatModelSelect() {
  const select = document.getElementById('chat-model-select');
  if (!select) return;

  const prevValue = select.value;
  select.innerHTML = '<option value="">Vychozi model</option>';

  const visionModels = _ollamaModels.filter(m => m.profile === 'vision');
  const chatModels = _ollamaModels.filter(m => m.profile !== 'vision');

  if (chatModels.length) {
    const group = document.createElement('optgroup');
    group.label = 'Chat modely';
    chatModels.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.name;
      opt.textContent = `${m.name} (${m.size_gb} GB)`;
      group.appendChild(opt);
    });
    select.appendChild(group);
  }

  if (visionModels.length) {
    const group = document.createElement('optgroup');
    group.label = 'Vision modely';
    visionModels.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.name;
      opt.textContent = `${m.name} (${m.size_gb} GB)`;
      group.appendChild(opt);
    });
    select.appendChild(group);
  }

  if (prevValue) select.value = prevValue;
  select.addEventListener('change', updateModelBadge);
}

/* ============================================================
   CHAT
   ============================================================ */
function bindChatEvents() {
  bindProfilePills();

  document.getElementById('send-btn').addEventListener('click', sendMessage);
  document.getElementById('chat-input').addEventListener('keydown', (e) => {
    // Enter alone = send; Shift+Enter = new line; Ctrl/Meta+Enter also sends
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); sendMessage(); }
    if (e.key === 'Escape' && _isStreaming) stopStreaming();
  });
  document.getElementById('summarize-session-btn').addEventListener('click', summarizeSession);

  // New chat button (sidebar)
  document.getElementById('new-chat-btn').addEventListener('click', () => {
    currentSessionId = null;
    document.getElementById('chat-history').innerHTML = '';
    document.getElementById('session-label').textContent = t('new_session');
    document.querySelectorAll('.session-item').forEach(el => el.classList.remove('active'));
    showToast(t('new_chat'), 'info');
  });

  // Mobile sidebar toggle for chat history
  const sidebarToggle = document.getElementById('chat-sidebar-toggle');
  const chatBackdrop = document.getElementById('chat-sidebar-backdrop');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      document.getElementById('chat-sidebar').classList.toggle('open');
    });
  }
  if (chatBackdrop) {
    chatBackdrop.addEventListener('click', () => {
      document.getElementById('chat-sidebar').classList.remove('open');
    });
  }

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

  // Image attach
  const imageAttachBtn = document.getElementById('image-attach-btn');
  const imageInput = document.getElementById('image-input');
  if (imageAttachBtn && imageInput) {
    imageAttachBtn.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', () => {
      handleImageFiles(Array.from(imageInput.files));
      imageInput.value = '';
    });
  }

  // Screenshot button
  const screenshotBtn = document.getElementById('screenshot-btn');
  if (screenshotBtn) {
    screenshotBtn.addEventListener('click', takeScreenshot);
  }

  // Paste image support (Ctrl+V)
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageFiles = [];
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }
    if (imageFiles.length) {
      e.preventDefault();
      handleImageFiles(imageFiles);
    }
  });

  // Load sessions list on init
  loadSessions();
}

// chatAttachedFiles stores raw File objects for the /chat/with-files endpoint
let chatAttachedFiles = [];

async function handleFiles(files) {
  if (!files.length) return;
  for (const file of files) {
    chatAttachedFiles.push(file);
  }
  renderAttachedFiles();
  showToast(`${files.length} soubor(ů) připojeno k chatu`, 'success');
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
  const allFiles = [...uploadedFiles.map(f => ({name: f.filename, id: f.id, type: 'uploaded'})),
                     ...chatAttachedFiles.map((f, i) => ({name: f.name, id: `local_${i}`, type: 'local'}))];
  if (allFiles.length) {
    show(el);
    el.innerHTML = allFiles.map(f => `
      <span class="attached-file">
        📎 ${escHtml(truncate(f.name, 25))}
        <button class="attached-file__remove" data-id="${escHtml(f.id)}" data-type="${f.type}">&#10005;</button>
      </span>
    `).join('');
    el.querySelectorAll('.attached-file__remove').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.type === 'uploaded') {
          const idx = uploadedFiles.findIndex(f => f.id === btn.dataset.id);
          if (idx !== -1) uploadedFiles.splice(idx, 1);
        } else {
          const idx = parseInt(btn.dataset.id.replace('local_', ''), 10);
          if (!isNaN(idx)) chatAttachedFiles.splice(idx, 1);
        }
        renderAttachedFiles();
      });
    });
  } else {
    hide(el);
  }
}

/* ── Image handling ──────────────────────────────────────── */

async function handleImageFiles(files) {
  for (const file of files) {
    if (attachedImages.length >= MAX_IMAGES) {
      showToast(`Max ${MAX_IMAGES} obrazku na zpravu`, 'warning');
      break;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showToast(`Nepodporovany typ: ${file.type}`, 'warning');
      continue;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      showToast(`Obrazek ${file.name} presahuje 10MB`, 'warning');
      continue;
    }

    try {
      const base64 = await fileToBase64(file);
      attachedImages.push({
        filename: file.name,
        data: base64,
        mime_type: file.type,
        previewUrl: URL.createObjectURL(file),
      });
    } catch (err) {
      showToast(`Chyba nahravani: ${err.message}`, 'error');
    }
  }
  renderImagePreviews();
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      // Strip the data:...;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function renderImagePreviews() {
  const previewEl = document.getElementById('image-preview');
  const visionBadge = document.getElementById('vision-mode-indicator');
  if (!previewEl) return;

  if (attachedImages.length > 0) {
    show(previewEl);
    if (visionBadge) show(visionBadge);
    previewEl.innerHTML = attachedImages.map((img, idx) => `
      <div class="chat-image-preview-item">
        <img src="${img.previewUrl}" alt="${escHtml(img.filename)}" title="${escHtml(img.filename)}" />
        <button class="remove-image-btn" data-idx="${idx}" title="Odebrat">&#10005;</button>
      </div>
    `).join('');
    previewEl.querySelectorAll('.remove-image-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        URL.revokeObjectURL(attachedImages[idx].previewUrl);
        attachedImages.splice(idx, 1);
        renderImagePreviews();
      });
    });
  } else {
    hide(previewEl);
    if (visionBadge) hide(visionBadge);
    previewEl.innerHTML = '';
  }
}

async function takeScreenshot() {
  const btn = document.getElementById('screenshot-btn');
  if (btn) btn.disabled = true;
  try {
    // Try macOS native screenshot first
    const res = await fetch('/api/integrations/macos/screenshot?mode=file', { method: 'POST' });
    const data = await res.json();
    if (data.success && data.image) {
      if (attachedImages.length >= MAX_IMAGES) {
        showToast(`Max ${MAX_IMAGES} obrazku na zpravu`, 'warning');
        return;
      }
      const byteChars = atob(data.image);
      const byteArray = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteArray[i] = byteChars.charCodeAt(i);
      const blob = new Blob([byteArray], { type: 'image/png' });

      attachedImages.push({
        filename: 'screenshot.png',
        data: data.image,
        mime_type: 'image/png',
        previewUrl: URL.createObjectURL(blob),
      });
      renderImagePreviews();
      showToast('Screenshot prilozen', 'success');
    } else {
      // Fallback: html2canvas for mobile/non-macOS
      await _takeScreenshotFallback();
    }
  } catch (err) {
    // Network error → try fallback
    try {
      await _takeScreenshotFallback();
    } catch (fallbackErr) {
      showToast(`Screenshot chyba: ${fallbackErr.message}`, 'error');
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function _takeScreenshotFallback() {
  if (attachedImages.length >= MAX_IMAGES) {
    showToast(`Max ${MAX_IMAGES} obrazku na zpravu`, 'warning');
    return;
  }
  // Use canvas capture of the main content area
  const target = document.getElementById('main-content') || document.body;
  try {
    // Try html2canvas if available (loaded dynamically)
    if (typeof html2canvas !== 'undefined') {
      const canvas = await html2canvas(target, { scale: 1, useCORS: true });
      const dataUrl = canvas.toDataURL('image/png');
      const base64 = dataUrl.split(',')[1];
      attachedImages.push({
        filename: 'screenshot.png',
        data: base64,
        mime_type: 'image/png',
        previewUrl: dataUrl,
      });
      renderImagePreviews();
      showToast('Screenshot (fallback) prilozen', 'success');
    } else {
      showToast('Screenshot vyzaduje macOS nebo html2canvas knihovnu', 'warning');
    }
  } catch (err) {
    showToast('Screenshot fallback selhal: ' + err.message, 'error');
  }
}

async function sendMessage() {
  const chatInput = document.getElementById('chat-input');
  const message = chatInput.value.trim();
  if (!message) { showToast(t('msg_empty'), 'warning'); return; }

  // Map UI profile pill to backend mode (system-prompt selection) and LLM profile
  const modeMap = { lean_ci: 'lean_ci', pbi_dax: 'pbi_dax', mac_admin: 'mac_admin', ai_dev: 'ai_dev', vision: 'general', chat: 'general', tech: 'powerbi', dolphin: 'lean' };
  const mode = modeMap[currentProfile] || 'general';
  // LLM profile for model/sampling-param selection (maps UI pill names to settings profiles)
  const profileMap = { lean_ci: 'lean', pbi_dax: 'powerbi', mac_admin: 'chat', ai_dev: 'chat', vision: 'vision', chat: 'chat', tech: 'powerbi', dolphin: 'lean' };
  const llmProfile = profileMap[currentProfile] || currentProfile;

  const contextFileIds = uploadedFiles.map(f => f.id);

  const sendBtn = document.getElementById('send-btn');
  const chatSpinner = document.getElementById('chat-spinner');
  setLoading(sendBtn, chatSpinner, true);

  // Store image data for bubble display before clearing
  const sentImages = attachedImages.map(img => ({ ...img }));
  appendBubble('user', message, null, sentImages.length > 0 ? sentImages : null);
  chatInput.value = '';

  try {
    let data;

    if (attachedImages.length > 0) {
      // Multimodal chat with images – always use "vision" profile for LLM selection
      const body = {
        message,
        mode,
        profile: 'vision',
        images: attachedImages.map(img => ({
          data: img.data,
          media_type: img.mime_type,
        })),
      };
      if (currentSessionId) body.session_id = currentSessionId;

      const res = await fetch('/api/chat/multimodal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
      data = await res.json();

      if (data.session_id) {
        currentSessionId = data.session_id;
        document.getElementById('session-label').textContent = `Relace: ${data.session_id}`;
      }
      appendBubble('ai', data.reply, {
        provider: data.meta?.provider || 'ollama',
        model: data.meta?.model,
        kb_context_used: data.meta?.kb_context_used,
        images_count: data.meta?.images_count,
      });

      // Clear images
      attachedImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
      attachedImages.length = 0;
      renderImagePreviews();
    } else if (chatAttachedFiles.length > 0) {
      // Chat with file attachments – multipart POST
      const fd = new FormData();
      fd.append('message', message);
      fd.append('mode', mode);
      fd.append('profile', llmProfile);
      if (currentSessionId) fd.append('session_id', currentSessionId);
      for (const f of chatAttachedFiles) fd.append('files', f);

      const res = await fetch('/api/chat/with-files', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
      data = await res.json();

      if (data.session_id) {
        currentSessionId = data.session_id;
        document.getElementById('session-label').textContent = `Relace: ${data.session_id}`;
      }
      appendBubble('ai', data.reply, data.meta);
      chatAttachedFiles.length = 0;
      uploadedFiles.length = 0;
      renderAttachedFiles();
    } else {
      // Text-only chat – use streaming WebSocket
      const body = { message, mode, profile: llmProfile, context_file_ids: contextFileIds };
      if (currentSessionId) body.session_id = currentSessionId;
      const chatModelSelect = document.getElementById('chat-model-select');
      if (chatModelSelect && chatModelSelect.value) body.model = chatModelSelect.value;

      await sendMessageStreaming(body, sendBtn, chatSpinner);
      return; // sendMessageStreaming handles cleanup
    }

    // Reload sessions list to show new/updated session
    loadSessions();
  } catch (err) {
    showToast(`Chyba: ${err.message}`, 'error');
    // Remove last user bubble on error
    const bubbles = document.getElementById('chat-history').querySelectorAll('.bubble--user');
    if (bubbles.length) bubbles[bubbles.length - 1].remove();
  } finally {
    setLoading(sendBtn, chatSpinner, false);
  }
}

/**
 * Stream chat response via WebSocket.
 * Creates an empty AI bubble, appends tokens as they arrive,
 * then finalises with metadata on "done".
 */
async function sendMessageStreaming(body, sendBtn, chatSpinner) {
  const chatHistoryEl = document.getElementById('chat-history');

  // Create streaming AI bubble with cursor
  const bubble = document.createElement('div');
  bubble.className = 'bubble bubble--ai';
  bubble.style.position = 'relative';
  const textEl = document.createElement('p');
  textEl.className = 'bubble__text';
  const cursor = document.createElement('span');
  cursor.className = 'streaming-cursor';
  cursor.textContent = '\u258C';
  textEl.appendChild(cursor);
  bubble.appendChild(textEl);
  chatHistoryEl.appendChild(bubble);
  chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;

  // Show "AI typing" indicator
  _isStreaming = true;
  const wsLabel = document.getElementById('ws-label');
  const prevLabel = wsLabel ? wsLabel.textContent : '';
  if (wsLabel) wsLabel.textContent = 'AI píše...';
  const streamingIndicator = document.getElementById('chat-streaming-indicator');
  if (streamingIndicator) streamingIndicator.classList.remove('hidden');

  // Show stop button
  if (sendBtn) {
    sendBtn.dataset.prevText = sendBtn.textContent;
    sendBtn.textContent = 'Stop';
    sendBtn.onclick = stopStreaming;
  }

  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  const streamUrl = `${proto}://${location.host}/api/chat/stream`;
  const streamWs = new WebSocket(streamUrl);
  _streamingWs = streamWs;

  let fullText = '';

  return new Promise((resolve) => {
    streamWs.onopen = () => {
      streamWs.send(JSON.stringify(body));
    };

    streamWs.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'token') {
          fullText += msg.content;
          // Update bubble text (keep cursor at end)
          textEl.textContent = fullText;
          textEl.appendChild(cursor);
          chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
        } else if (msg.type === 'done') {
          // Remove cursor, add metadata
          cursor.remove();
          textEl.textContent = fullText;

          // Detect timeout/error in streamed text
          const isTimeout = fullText.startsWith('[Timeout:') || fullText.startsWith('[Chyba LLM:');
          if (isTimeout) {
            bubble.classList.add('bubble--error');
            textEl.style.color = 'var(--color-error, #e74c3c)';
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'bubble-error-actions';
            actionsDiv.style.cssText = 'margin-top:0.5rem;display:flex;gap:0.5rem';
            const retryBtn = document.createElement('button');
            retryBtn.className = 'btn btn--ghost btn--small';
            retryBtn.textContent = 'Zkusit znovu';
            retryBtn.addEventListener('click', () => {
              document.getElementById('chat-input').value = body.message || '';
              sendMessage();
            });
            const copyBtn = document.createElement('button');
            copyBtn.className = 'btn btn--ghost btn--small';
            copyBtn.textContent = '📋 Kopírovat';
            copyBtn.title = 'Zkopírovat do schránky';
            copyBtn.addEventListener('click', () => {
              navigator.clipboard.writeText(body.message || '').then(() => showToast('Zkopírováno', 'success'));
            });
            actionsDiv.appendChild(retryBtn);
            actionsDiv.appendChild(copyBtn);
            bubble.appendChild(actionsDiv);
          }

          if (msg.meta) {
            if (msg.meta.session_id) {
              currentSessionId = msg.meta.session_id;
              document.getElementById('session-label').textContent = `Relace: ${msg.meta.session_id}`;
            }
            const metaP = document.createElement('p');
            metaP.className = 'bubble__meta';
            let metaStr = `Provider: <strong>${escHtml(msg.meta.provider || '\u2014')}</strong>`;
            if (msg.meta.model) metaStr += ` \u00B7 ${escHtml(msg.meta.model)}`;
            if (msg.meta.latency_ms != null) metaStr += ` \u00B7 ${msg.meta.latency_ms} ms`;
            metaP.innerHTML = metaStr;
            bubble.appendChild(metaP);

            if (msg.meta.kb_context_used) {
              const badge = document.createElement('span');
              badge.className = 'kb-context-badge';
              badge.textContent = '\u{1F4DA} KB';
              badge.title = 'Odpoved vyuziva kontext z knowledge base';
              bubble.appendChild(badge);
            }
            if (msg.meta.memory_context_used) {
              const memBadge = document.createElement('span');
              memBadge.className = 'memory-context-badge';
              memBadge.style.right = (msg.meta.kb_context_used ? '3rem' : '-0.375rem');
              memBadge.textContent = '\u{1F4A1} Memory';
              memBadge.title = 'Odpoved vyuziva kontext ze sdilene pameti';
              bubble.appendChild(memBadge);
            }
          }
          // Add copy button to completed streaming response
          if (fullText) {
            const cpBtn = document.createElement('button');
            cpBtn.className = 'btn btn--ghost btn--small bubble-copy-ai-btn';
            cpBtn.title = 'Zkopírovat do schránky';
            cpBtn.textContent = '📋';
            cpBtn.style.cssText = 'position:absolute;top:0.4rem;right:0.4rem;opacity:0.6;font-size:0.85rem;padding:2px 5px;line-height:1';
            cpBtn.addEventListener('click', () => {
              navigator.clipboard.writeText(fullText).then(() => {
                showToast('Odpověď zkopírována', 'success');
                cpBtn.textContent = '✓';
                setTimeout(() => { cpBtn.textContent = '📋'; }, 2000);
              });
            });
            bubble.appendChild(cpBtn);
          }
          loadSessions();
        } else if (msg.type === 'error') {
          cursor.remove();
          textEl.textContent = msg.message || 'Chyba generovani';
          textEl.style.color = 'var(--color-error, #e74c3c)';
        }
      } catch (e) {
        /* ignore parse errors */
      }
    };

    streamWs.onclose = () => {
      _finishStreaming(sendBtn, chatSpinner, wsLabel, prevLabel);
      resolve();
    };

    streamWs.onerror = () => {
      cursor.remove();
      if (!fullText) {
        textEl.textContent = 'Chyba pripojeni ke streamu';
        textEl.style.color = 'var(--color-error, #e74c3c)';
      }
      _finishStreaming(sendBtn, chatSpinner, wsLabel, prevLabel);
      resolve();
    };
  });
}

function _finishStreaming(sendBtn, chatSpinner, wsLabel, prevLabel) {
  _isStreaming = false;
  _streamingWs = null;
  if (wsLabel) wsLabel.textContent = prevLabel;
  const streamingIndicator = document.getElementById('chat-streaming-indicator');
  if (streamingIndicator) streamingIndicator.classList.add('hidden');
  setLoading(sendBtn, chatSpinner, false);
  if (sendBtn) {
    sendBtn.textContent = sendBtn.dataset.prevText || 'Odeslat';
    sendBtn.onclick = sendMessage;
  }
}

function stopStreaming() {
  if (_streamingWs && _streamingWs.readyState === WebSocket.OPEN) {
    _streamingWs.close();
  }
}

function appendBubble(role, text, meta, images) {
  const chatHistoryEl = document.getElementById('chat-history');
  const bubble = document.createElement('div');
  bubble.className = `bubble bubble--${role}`;
  bubble.style.position = 'relative';

  let inner = `<p class="bubble__text">${escHtml(text)}</p>`;

  // Show images in bubble if provided
  if (images && images.length > 0) {
    inner += '<div class="bubble-images">';
    for (const img of images) {
      if (img.previewUrl) {
        inner += `<img src="${img.previewUrl}" alt="${escHtml(img.filename || 'image')}" />`;
      } else if (img.data) {
        inner += `<img src="data:${img.mime_type || 'image/png'};base64,${img.data}" alt="${escHtml(img.filename || 'image')}" />`;
      }
    }
    inner += '</div>';
  }

  // Style timeout / error bubbles differently
  if (meta && meta.error) {
    bubble.classList.add('bubble--error');
  }

  if (meta) {
    const provider = meta.provider || '\u2014';
    const latency = meta.latency_ms ?? '\u2014';
    let metaStr = `Provider: <strong>${escHtml(provider)}</strong>`;
    if (meta.model) metaStr += ` · ${escHtml(meta.model)}`;
    if (latency !== '\u2014') metaStr += ` · ${latency} ms`;
    if (meta.images_processed) metaStr += ` · ${meta.images_processed} img`;
    inner += `<p class="bubble__meta">${metaStr}</p>`;

    // Add retry + copy buttons for errors
    if (meta.error) {
      inner += `<div class="bubble-error-actions" style="margin-top:0.5rem;display:flex;gap:0.5rem">
        <button class="btn btn--ghost btn--small bubble-retry-btn" title="Zkusit znovu">Zkusit znovu</button>
        <button class="btn btn--ghost btn--small bubble-copy-err-btn" title="Zkopírovat zprávu">Zkopírovat</button>
      </div>`;
    }
  }

  // Copy button for every AI answer – rendered after bubble.innerHTML is set
  const isCopyable = (role === 'ai') && text;

  bubble.innerHTML = inner;

  // Bind error action buttons
  if (meta && meta.error) {
    const retryBtn = bubble.querySelector('.bubble-retry-btn');
    const copyErrBtn = bubble.querySelector('.bubble-copy-err-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        // Find the previous user bubble text and resend
        const userBubbles = document.querySelectorAll('#chat-history .bubble--user .bubble__text');
        if (userBubbles.length) {
          const lastMsg = userBubbles[userBubbles.length - 1].textContent;
          document.getElementById('chat-input').value = lastMsg;
          sendMessage();
        }
      });
    }
    if (copyErrBtn) {
      copyErrBtn.addEventListener('click', () => {
        const userBubbles = document.querySelectorAll('#chat-history .bubble--user .bubble__text');
        if (userBubbles.length) {
          const lastMsg = userBubbles[userBubbles.length - 1].textContent;
          navigator.clipboard.writeText(lastMsg).then(() => showToast('Zkopírováno', 'success'));
        }
      });
    }
  }

  // Copy button for all AI responses
  if (isCopyable) {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn--ghost btn--small bubble-copy-ai-btn';
    copyBtn.title = 'Zkopírovat do schránky';
    copyBtn.textContent = '📋';
    copyBtn.style.cssText = 'position:absolute;top:0.4rem;right:0.4rem;opacity:0.6;font-size:0.85rem;padding:2px 5px;line-height:1';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Odpověď zkopírována', 'success');
        copyBtn.textContent = '✓';
        setTimeout(() => { copyBtn.textContent = '📋'; }, 2000);
      });
    });
    bubble.appendChild(copyBtn);
  }

  if (role === 'ai' && meta && meta.kb_context_used) {
    const badge = document.createElement('span');
    badge.className = 'kb-context-badge';
    badge.textContent = '\u{1F4DA} KB';
    badge.title = 'Odpoved vyuziva kontext z knowledge base';
    bubble.appendChild(badge);
  }

  if (role === 'ai' && meta && meta.memory_context_used) {
    const memBadge = document.createElement('span');
    memBadge.className = 'memory-context-badge';
    memBadge.style.right = (meta.kb_context_used ? '3rem' : '-0.375rem');
    memBadge.textContent = '\u{1F4A1} Memory';
    memBadge.title = 'Odpoved vyuziva kontext ze sdilene pameti';
    bubble.appendChild(memBadge);

    const items = meta.memory_context_items || [];
    if (items.length > 0) {
      const details = document.createElement('details');
      details.className = 'memory-context-details';
      const summary = document.createElement('summary');
      summary.textContent = `\u{1F4A1} Pouzite pameti (${items.length})`;
      details.appendChild(summary);
      const ul = document.createElement('ul');
      items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.text} (dulezitost: ${item.importance})`;
        ul.appendChild(li);
      });
      details.appendChild(ul);
      bubble.appendChild(details);
    }
  }

  chatHistoryEl.appendChild(bubble);
  chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
}

/* ============================================================
   CHAT SESSIONS SIDEBAR
   ============================================================ */
async function loadSessions() {
  try {
    const resp = await fetch('/api/chat/sessions');
    const data = await resp.json();

    const list = document.getElementById('sessions-list');
    if (!data.sessions || data.sessions.length === 0) {
      list.innerHTML = '<div class="empty-state">Zatim zadne konverzace</div>';
      return;
    }

    list.innerHTML = data.sessions.map(s => `
      <div class="session-item ${s.session_id === currentSessionId ? 'active' : ''}"
           data-id="${escHtml(s.session_id)}">
        <div class="session-preview">${escHtml(s.preview || 'Prazdna konverzace')}</div>
        <div class="session-meta">
          <span>${s.message_count} zprav</span>
          <button class="btn-icon session-delete-btn" data-delete-session="${escHtml(s.session_id)}" title="${t('delete')}">&#128465;</button>
        </div>
      </div>
    `).join('');

    // Bind click handlers
    list.querySelectorAll('.session-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.session-delete-btn')) return;
        loadSession(el.dataset.id);
      });
    });

    list.querySelectorAll('.session-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteSession(btn.dataset.deleteSession);
      });
    });
  } catch (err) {
    console.error('Failed to load sessions:', err);
  }
}

async function loadSession(sessionId) {
  try {
    const resp = await fetch(`/api/chat/sessions/${sessionId}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    currentSessionId = sessionId;
    document.getElementById('session-label').textContent = `Relace: ${sessionId}`;

    // Clear chat area and load messages
    const chatHistory = document.getElementById('chat-history');
    chatHistory.innerHTML = '';

    (data.messages || []).forEach(msg => {
      appendBubble(msg.role === 'assistant' ? 'ai' : msg.role, msg.content, msg.meta);
    });

    // Update active session in sidebar
    document.querySelectorAll('.session-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === sessionId);
    });

    chatHistory.scrollTop = chatHistory.scrollHeight;

    // Close mobile sidebar
    document.getElementById('chat-sidebar').classList.remove('open');
  } catch (err) {
    console.error('Failed to load session:', err);
    showToast(t('conversation_load_error'), 'error');
  }
}

async function deleteSession(sessionId) {
  if (!confirm(t('conversation_delete_confirm'))) return;

  try {
    await fetch(`/api/chat/sessions/${sessionId}`, { method: 'DELETE' });

    if (currentSessionId === sessionId) {
      currentSessionId = null;
      document.getElementById('chat-history').innerHTML = '';
      document.getElementById('session-label').textContent = t('new_session');
    }

    await loadSessions();
    showToast(t('conversation_deleted'), 'success');
  } catch (err) {
    console.error('Failed to delete session:', err);
    showToast(t('delete_error'), 'error');
  }
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

  if (!goal) { showToast(t('goal_required'), 'warning'); return; }

  const spawnBtn = document.getElementById('spawn-btn');
  const spawnSpinner = document.getElementById('spawn-spinner');
  setLoading(spawnBtn, spawnSpinner, true);

  try {
    const body = {
      agent_type: agentType,
      task: { goal },
      workspace,
      skill_ids: Array.from(_selectedAgentSkills),
      skill_names: Array.from(_selectedFsAgentSkills),
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
    _selectedFsAgentSkills.clear();
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
  const isSubAgent = !!agent.parent_agent_id;
  const subAgentClass = isSubAgent ? ' agent-card--sub-agent' : '';

  return `
    <div class="agent-card${subAgentClass}" id="agent-${escHtml(agent.agent_id)}">
      <div class="agent-card-header">
        <span class="agent-type-badge">${escHtml(agent.agent_type)}</span>
        <span class="agent-id">${escHtml(agent.agent_id)}</span>
        ${isSubAgent ? `<span class="sub-agent-badge">sub-agent</span>` : ''}
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
          <button class="btn btn--ghost btn--small" data-delete-agent="${escHtml(agent.agent_id)}">${t('delete')}</button>
        </div>
      </div>
      <div id="artifacts-${escHtml(agent.agent_id)}" class="hidden"></div>
    </div>`;
}

function bindAgentCardButtons(container) {
  container.querySelectorAll('[data-interrupt]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await fetch(`/api/agents/${btn.dataset.interrupt}/interrupt`, { method: 'POST' });
      showToast(`Agent ${btn.dataset.interrupt} ${t('agent_stopped')}`, 'info');
      await refreshAgents();
    });
  });
  container.querySelectorAll('[data-delete-agent]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await fetch(`/api/agents/${btn.dataset.deleteAgent}`, { method: 'DELETE' });
      showToast(`Agent ${btn.dataset.deleteAgent} ${t('agent_deleted')}`, 'info');
      await refreshAgents();
    });
  });
  container.querySelectorAll('[data-view-artifacts]').forEach(btn => {
    btn.addEventListener('click', () => loadAgentArtifacts(btn.dataset.viewArtifacts));
  });
}

async function loadAgentArtifacts(agentId) {
  const container = document.getElementById(`artifacts-${agentId}`);
  if (!container) return;

  if (!container.classList.contains('hidden')) {
    hide(container);
    return;
  }

  try {
    const res = await fetch(`/api/agents/${agentId}/artifacts`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const artifacts = data.artifacts || [];

    if (!artifacts.length) {
      container.innerHTML = '<p class="hint-text">Zadne artefakty</p>';
    } else {
      container.innerHTML = '<div class="artifact-preview-list">' +
        artifacts.map(art => {
          const icon = art.type === 'markdown' ? '\u{1F4DD}' : art.type === 'image' ? '\u{1F5BC}' : '\u{1F4C4}';
          const sizeStr = art.size ? `${(art.size / 1024).toFixed(1)} KB` : '';
          return `
            <div class="artifact-preview-card">
              <div class="artifact-preview-card__header">
                <span class="artifact-preview-card__icon">${icon}</span>
                <span class="artifact-preview-card__name">${escHtml(art.filename || art.artifact_id)}</span>
                <span class="artifact-preview-card__size">${sizeStr}</span>
              </div>
              ${art.preview ? `<div class="artifact-preview-card__content">${escHtml(art.preview)}</div>` : ''}
            </div>`;
        }).join('') + '</div>';
    }
    show(container);
  } catch (err) {
    container.innerHTML = `<p class="hint-text">Chyba: ${escHtml(err.message)}</p>`;
    show(container);
  }
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
    showToast(`${data.removed} ${t('agents_cleared')}`, 'success');
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
        <button class="btn btn--ghost btn--small" data-delete-skill="${escHtml(s.id)}">${t('delete')}</button>
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
        showToast(t('skill_deleted'), 'success');
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
    title.textContent = t('edit_skill');
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
    title.textContent = t('new_skill');
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

  if (!name) { showToast(t('skill_name_required'), 'warning'); return; }

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
    showToast(t(editId ? 'skill_updated' : 'skill_created'), 'success');
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
    populateChatModelSelect();
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

  // Also populate the per-profile model dropdown
  _populateProfileModelDropdown();
}

function _populateProfileModelDropdown() {
  const sel = document.getElementById('s-profile-model');
  if (!sel) return;
  const cur = sel.value;
  if (_ollamaModels.length) {
    sel.innerHTML = _ollamaModels.map(m =>
      `<option value="${escHtml(m.name)}">${escHtml(m.name)}</option>`
    ).join('');
  }
  if (cur) { sel.value = cur; }
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
      if (!url) { showToast(t('enter_url'), 'warning'); return; }
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
      if (!key) { showToast(t('select_project'), 'warning'); return; }
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
      if (!path) { showToast(t('enter_path'), 'warning'); return; }
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

  // Quick Actions editor
  bindQuickActionsEditor();

  // History refresh
  const refreshHistoryBtn = document.getElementById('refresh-history-btn');
  if (refreshHistoryBtn) refreshHistoryBtn.addEventListener('click', loadActionHistory);
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
  if (!repoPath) { showToast(t('enter_repo_path'), 'warning'); return; }

  const params = { repo_path: repoPath };

  if (action === 'commit') {
    params.message = document.getElementById('git-commit-msg').value.trim();
    if (!params.message) { showToast(t('enter_commit_msg'), 'warning'); return; }
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
    const res = await fetch('/api/settings/quick-actions');
    const data = await res.json();
    const actions = data.actions || [];
    if (!actions.length) {
      list.innerHTML = '<p class="empty-state">Zadne rychle akce. Klikni "+ Nova akce".</p>';
      return;
    }
    list.innerHTML = actions.map(a => `
      <button class="action-card" data-action-id="${escHtml(a.id)}">
        <div class="action-card-controls">
          <button data-edit-action="${escHtml(a.id)}" title="Upravit">&#9998;</button>
          <button data-delete-action="${escHtml(a.id)}" title="${t('delete')}">&#10005;</button>
        </div>
        <span class="action-card__icon">${escHtml(a.icon || '\u26A1')}</span>
        <span class="action-card__name">${escHtml(a.name)}</span>
        <span class="action-card__desc">${a.steps?.length || 0} kroku</span>
      </button>
    `).join('');

    // Run action on card click
    list.querySelectorAll('.action-card').forEach(card => {
      card.addEventListener('click', async (e) => {
        // Ignore clicks on edit/delete buttons
        if (e.target.closest('[data-edit-action]') || e.target.closest('[data-delete-action]')) return;
        const actionId = card.dataset.actionId;
        const actionName = card.querySelector('.action-card__name').textContent;
        card.style.opacity = '0.5';
        card.style.pointerEvents = 'none';
        showToast(`Spoustim "${actionName}"...`, 'info');
        try {
          const res = await fetch('/api/actions/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action_id: actionId }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
          if (data.status === 'success') {
            showToast(`Akce "${actionName}" dokoncena`, 'success');
          } else {
            showToast(`Akce "${actionName}" selhala: ${data.error || ''}`, 'error');
          }
          loadActionHistory();
        } catch (err) {
          showToast(`Chyba: ${err.message}`, 'error');
        } finally {
          card.style.opacity = '';
          card.style.pointerEvents = '';
        }
      });
    });

    // Edit buttons
    list.querySelectorAll('[data-edit-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const actionId = btn.dataset.editAction;
        const action = actions.find(a => a.id === actionId);
        if (action) openActionEditorModal(action);
      });
    });

    // Delete buttons
    list.querySelectorAll('[data-delete-action]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const actionId = btn.dataset.deleteAction;
        if (!confirm(t('action_delete_confirm'))) return;
        try {
          await fetch(`/api/settings/quick-actions/${encodeURIComponent(actionId)}`, { method: 'DELETE' });
          showToast(t('action_deleted'), 'success');
          loadQuickActions();
        } catch (err) {
          showToast(`${t('delete_error')}: ${err.message}`, 'error');
        }
      });
    });
  } catch (err) {
    list.innerHTML = `<p class="empty-state">Chyba: ${escHtml(err.message)}</p>`;
  }
}

async function loadActionHistory() {
  const list = document.getElementById('action-history-list');
  if (!list) return;
  try {
    const res = await fetch('/api/actions/history?limit=10');
    const data = await res.json();
    const history = data.history || [];
    if (!history.length) {
      list.innerHTML = '<p class="empty-state">Zadna historie.</p>';
      return;
    }
    list.innerHTML = history.reverse().map(h => {
      const statusClass = h.status === 'success' ? 'result-box--ok' : 'result-box--error';
      const time = h.started_at ? new Date(h.started_at).toLocaleString() : '-';
      return `
        <div class="result-box ${statusClass}" style="margin-bottom:0.4rem;padding:0.5rem 0.75rem;font-size:0.85rem">
          <strong>${escHtml(h.action_name || 'Unknown')}</strong>
          <span style="color:#64748b;margin-left:0.5rem">${escHtml(time)}</span>
          <span style="float:right;text-transform:uppercase;font-size:0.75rem">${escHtml(h.status || '-')}</span>
        </div>
      `;
    }).join('');
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
  document.getElementById('add-external-path-btn').addEventListener('click', addExternalPath);
  document.getElementById('add-agent-skills-dir-btn').addEventListener('click', addAgentSkillsDir);
  document.getElementById('rescan-agent-skills-btn').addEventListener('click', rescanAgentSkills);
  document.getElementById('save-custom-prompt-btn')?.addEventListener('click', saveCustomPromptAppend);
  document.getElementById('scan-storage-btn').addEventListener('click', scanExternalStorage);
  document.getElementById('ingest-files-btn').addEventListener('click', ingestAllFiles);
  document.getElementById('incremental-ingest-btn').addEventListener('click', incrementalIngest);
  document.getElementById('kb-stats-btn').addEventListener('click', loadKnowledgeStats);
  document.getElementById('kb-export-btn').addEventListener('click', exportKbMetadata);

  // Shared Memory
  document.getElementById('add-memory-btn').addEventListener('click', addMemory);
  document.getElementById('view-memories-btn').addEventListener('click', toggleMemories);

  // LLM timeout slider live update
  const timeoutSlider = document.getElementById('s-llm-timeout');
  if (timeoutSlider) {
    timeoutSlider.addEventListener('input', (e) => {
      const label = document.getElementById('s-llm-timeout-value');
      if (label) label.textContent = e.target.value + 's';
    });
  }

  // Advanced LLM profile selector – switch displayed params when profile changes
  const profileSel = document.getElementById('s-llm-profile-select');
  if (profileSel) {
    profileSel.addEventListener('change', () => _loadProfileFields(profileSel.value));
  }

  // Temperature slider ↔ number input sync
  const tempSlider = document.getElementById('s-profile-temp-slider');
  const tempNum = document.getElementById('s-profile-temp');
  if (tempSlider && tempNum) {
    tempSlider.addEventListener('input', () => { tempNum.value = tempSlider.value; });
    tempNum.addEventListener('input', () => { tempSlider.value = tempNum.value; });
  }
}

/** Populate the advanced profile fields from _currentSettings for the given profileKey. */
function _loadProfileFields(profileKey) {
  if (!_currentSettings) return;
  const profiles = _currentSettings.profiles || {};
  const p = profiles[profileKey] || {};
  const params = p.params || {};

  const defaultParams = _currentSettings.llm?.default_params || {};

  // Model
  const modelSel = document.getElementById('s-profile-model');
  if (modelSel) {
    _populateProfileModelDropdown();
    const model = p.model || _currentSettings.llm?.default_model || _currentSettings.llm?.model || '';
    modelSel.value = model;
    if (!modelSel.value && modelSel.options.length) {
      const opt = document.createElement('option');
      opt.value = model; opt.textContent = model;
      modelSel.prepend(opt);
      modelSel.value = model;
    }
  }

  // Sampling params – prefer profile.params, fall back to llm.default_params
  const temp = params.temperature ?? defaultParams.temperature ?? 0.3;
  const topP = params.top_p ?? defaultParams.top_p ?? 0.9;
  const topK = params.top_k ?? defaultParams.top_k ?? 40;
  const maxTok = params.max_tokens ?? defaultParams.max_tokens ?? 2048;

  setVal('s-profile-temp', temp);
  const slider = document.getElementById('s-profile-temp-slider');
  if (slider) slider.value = temp;
  setVal('s-profile-top-p', topP);
  setVal('s-profile-top-k', topK);
  setVal('s-profile-max-tokens', maxTok);
}

async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    const s = data.settings;
    _currentSettings = s;

    // LLM
    setVal('s-llm-provider', s.llm?.provider || 'ollama');
    setVal('s-llm-url', s.llm?.ollama_url || s.llm?.base_url || 'http://localhost:11434');

    // LLM timeout
    const timeoutVal = s.llm?.timeout_seconds || 180;
    setVal('s-llm-timeout', timeoutVal);
    const timeoutLabel = document.getElementById('s-llm-timeout-value');
    if (timeoutLabel) timeoutLabel.textContent = timeoutVal + 's';

    // Default model – set after models are loaded
    const defaultModel = s.llm?.default_model || s.llm?.model || 'llama3.2';
    const modelSelect = document.getElementById('s-llm-model');
    if (modelSelect && modelSelect.options.length <= 1) {
      modelSelect.innerHTML = `<option value="${escHtml(defaultModel)}">${escHtml(defaultModel)}</option>`;
    }
    setVal('s-llm-model', defaultModel);

    // Advanced per-profile fields – load for the currently selected profile
    const profileSel = document.getElementById('s-llm-profile-select');
    const activeProfile = profileSel ? profileSel.value : 'chat';
    _loadProfileFields(activeProfile);

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

    // Custom system prompt append
    setVal('s-custom-prompt-append', s.custom_system_prompt_append || '');

    // Knowledge base external paths
    _settingsExternalPaths = [...(s.knowledge_base?.external_paths || [])];
    renderExternalPaths();

    // Agent Skills
    const agentSkillsCfg = s.agent_skills || {};
    setChecked('s-agent-skills-defaults', agentSkillsCfg.use_default_skill_paths !== false);
    _agentSkillsDirs = [...(agentSkillsCfg.skills_directories || [])];
    renderAgentSkillsDirsList();
    loadAgentSkillsCatalog();

    // Tailscale Funnel
    const ts = s.tailscale || {};
    setChecked('s-tailscale-enabled', ts.enable_funnel || false);
    setVal('s-tailscale-port', ts.port ?? 8000);
    setVal('s-tailscale-timeout', ts.timeout ?? 300);

    // API key – never pre-fill; user must re-enter to change
    setVal('s-api-key', '');

    // Update model badge
    updateModelBadge();
    // Refresh tailscale status badge after loading
    tailscaleRefreshStatus();
  } catch (err) {
    showToast(`${t('settings_load_error')}: ${err.message}`, 'error');
  }
}

async function saveSettings() {
  const saveBtn = document.getElementById('save-settings-btn');
  const saveSpinner = document.getElementById('settings-spinner');
  setLoading(saveBtn, saveSpinner, true);

  const agKey = document.getElementById('s-ag-key').value;
  const apiKey = getVal('s-api-key');

  // Collect per-profile settings from the Advanced panel
  const editedProfile = document.getElementById('s-llm-profile-select')?.value || 'chat';
  const profileModel = getVal('s-profile-model');
  const profileTemp = parseFloat(getVal('s-profile-temp') || '0.3');
  const profileTopP = parseFloat(getVal('s-profile-top-p') || '0.9');
  const profileTopK = parseInt(getVal('s-profile-top-k') || '40');
  const profileMaxTok = parseInt(getVal('s-profile-max-tokens') || '2048');

  // Merge edited profile into existing profiles (keep untouched profiles intact)
  const existingProfiles = (_currentSettings?.profiles) || {};
  const updatedProfiles = {
    ...existingProfiles,
    [editedProfile]: {
      ...(existingProfiles[editedProfile] || {}),
      model: profileModel,
      params: {
        temperature: profileTemp,
        top_p: profileTopP,
        top_k: profileTopK,
        max_tokens: profileMaxTok,
      },
    },
  };

  const defaultModel = getVal('s-llm-model');
  const patch = {
    llm: {
      provider: getVal('s-llm-provider'),
      model: defaultModel,
      default_model: defaultModel,
      timeout_seconds: Math.max(60, Math.min(600, parseInt(getVal('s-llm-timeout')) || 180)),
      ollama_url: getVal('s-llm-url'),
      base_url: getVal('s-llm-url'),
    },
    profiles: updatedProfiles,
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
    custom_system_prompt_append: getVal('s-custom-prompt-append') || '',
    agents: {
      max_concurrent: parseInt(getVal('s-agents-max') || '5'),
      timeout_minutes: parseInt(getVal('s-agents-timeout') || '30'),
    },
    filesystem: {
      ...((_currentSettings && _currentSettings.filesystem) || {}),
      allowed_directories: _settingsAllowedDirs,
    },
    knowledge_base: {
      ...((_currentSettings && _currentSettings.knowledge_base) || {}),
      external_paths: _settingsExternalPaths,
    },
    agent_skills: {
      use_default_skill_paths: getChecked('s-agent-skills-defaults'),
      skills_directories: _agentSkillsDirs,
    },
    tailscale: {
      enable_funnel: getChecked('s-tailscale-enabled'),
      port: Math.max(1, Math.min(65535, parseInt(getVal('s-tailscale-port') || '8000'))),
      timeout: Math.max(30, Math.min(3600, parseInt(getVal('s-tailscale-timeout') || '300'))),
    },
    // Only include api_key when the user has typed a value; empty means "keep existing"
    ...(apiKey ? { api_key: apiKey } : {}),
  };

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: patch }),
    });
    if (!res.ok) throw new Error(await res.text());
    showToast(t('settings_saved'), 'success');
    // Show inline hint in Advanced LLM panel
    const hint = document.getElementById('s-profile-save-hint');
    if (hint) { hint.style.display = ''; setTimeout(() => { hint.style.display = 'none'; }, 3000); }
    await loadSettings();
  } catch (err) {
    showToast(`${t('settings_save_error')}: ${err.message}`, 'error');
  } finally {
    setLoading(saveBtn, saveSpinner, false);
  }
}

async function saveCustomPromptAppend() {
  const val = getVal('s-custom-prompt-append') || '';
  try {
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ custom_system_prompt_append: val }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    showToast('Vlastni instrukce ulozeny', 'success');
  } catch (err) {
    showToast(`Chyba: ${err.message}`, 'error');
  }
}

async function checkOllama() {
  const el = document.getElementById('ollama-status');
  el.className = 'result-box';
  el.textContent = t('checking');
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
  if (!key || !path) { showToast(t('key_path_required'), 'warning'); return; }
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
  if (!dir) { showToast(t('enter_dir_path'), 'warning'); return; }
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
   KNOWLEDGE BASE
   ============================================================ */
function renderExternalPaths() {
  const el = document.getElementById('external-paths-list');
  if (!el) return;
  if (!_settingsExternalPaths.length) {
    el.innerHTML = '<p class="hint-text">Zatim zadne cesty.</p>';
    return;
  }
  el.innerHTML = _settingsExternalPaths.map((p, idx) => `
    <div class="list-item">
      <code class="list-item__val" style="flex:1">${escHtml(p)}</code>
      <button class="btn btn--ghost btn--small" data-remove-ext-path="${idx}">Odebrat</button>
    </div>
  `).join('');
  el.querySelectorAll('[data-remove-ext-path]').forEach(btn => {
    btn.addEventListener('click', () => {
      _settingsExternalPaths.splice(parseInt(btn.dataset.removeExtPath), 1);
      renderExternalPaths();
    });
  });
}

function addExternalPath() {
  const input = document.getElementById('new-external-path');
  const path = input.value.trim();
  if (!path) { showToast('Zadej cestu', 'warning'); return; }
  if (_settingsExternalPaths.includes(path)) {
    showToast(t('path_exists'), 'warning');
    return;
  }
  _settingsExternalPaths.push(path);
  input.value = '';
  renderExternalPaths();
}

/* ── Agent Skills (SKILL.md) helpers ───────────────────── */

function renderAgentSkillsDirsList() {
  const el = document.getElementById('agent-skills-dirs-list');
  if (!el) return;
  if (!_agentSkillsDirs.length) {
    el.innerHTML = '<p class="hint-text">Zatim zadne dalsi cesty.</p>';
    return;
  }
  el.innerHTML = _agentSkillsDirs.map((p, idx) => `
    <div class="list-item">
      <code class="list-item__val" style="flex:1">${escHtml(p)}</code>
      <button class="btn btn--ghost btn--small" data-remove-askill-dir="${idx}">Odebrat</button>
    </div>
  `).join('');
  el.querySelectorAll('[data-remove-askill-dir]').forEach(btn => {
    btn.addEventListener('click', () => {
      _agentSkillsDirs.splice(parseInt(btn.dataset.removeAskillDir), 1);
      renderAgentSkillsDirsList();
    });
  });
}

function addAgentSkillsDir() {
  const input = document.getElementById('new-agent-skills-dir');
  const path = input.value.trim();
  if (!path) { showToast('Zadej cestu', 'warning'); return; }
  if (_agentSkillsDirs.includes(path)) {
    showToast(t('path_exists'), 'warning');
    return;
  }
  _agentSkillsDirs.push(path);
  input.value = '';
  renderAgentSkillsDirsList();
}

async function rescanAgentSkills() {
  const btn = document.getElementById('rescan-agent-skills-btn');
  btn.disabled = true;
  try {
    const res = await fetch('/api/agent-skills/refresh', { method: 'POST' });
    const data = await res.json();
    renderAgentSkillsCatalogData(data.skills || []);
    const countEl = document.getElementById('agent-skills-count');
    if (countEl) countEl.textContent = `Nalezeno: ${data.count || 0}`;
    showToast(`Agent skills refreshed: ${data.count || 0} nalezeno`, 'success');
  } catch (err) {
    showToast(`Chyba rescan: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
  }
}

async function loadAgentSkillsCatalog() {
  try {
    const res = await fetch('/api/agent-skills');
    const data = await res.json();
    renderAgentSkillsCatalogData(data.skills || []);
    const countEl = document.getElementById('agent-skills-count');
    if (countEl) countEl.textContent = `Nalezeno: ${data.count || 0}`;
  } catch (err) { /* silent */ }
}

function renderAgentSkillsCatalogData(skills) {
  const el = document.getElementById('agent-skills-catalog');
  if (!el) return;
  if (!skills.length) {
    el.innerHTML = '<p class="hint-text">Zadne agent skills nalezeny.</p>';
    return;
  }
  el.innerHTML = skills.map(s => `
    <div class="list-item" style="flex-direction:column;align-items:flex-start;gap:0.25rem">
      <strong>${escHtml(s.name)}</strong>
      <span class="hint-text">${escHtml(s.description)}</span>
      <code class="hint-text" style="font-size:0.7rem">${escHtml(s.path)}</code>
    </div>
  `).join('');
}

async function loadFsAgentSkillSelect() {
  const el = document.getElementById('agent-fs-skill-select');
  if (!el) return;
  try {
    const res = await fetch('/api/agent-skills');
    const data = await res.json();
    const skills = data.skills || [];
    if (!skills.length) {
      el.innerHTML = '<p class="hint-text">Zadne agent skills k dispozici.</p>';
      return;
    }
    el.innerHTML = skills.map(s => `
      <div class="skill-select-chip" data-fs-skill-name="${escHtml(s.name)}">
        <span class="skill-select-chip__icon">&#127919;</span>
        ${escHtml(s.name)}
      </div>
    `).join('');
    el.querySelectorAll('.skill-select-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const name = chip.dataset.fsSkillName;
        if (_selectedFsAgentSkills.has(name)) {
          _selectedFsAgentSkills.delete(name);
          chip.classList.remove('skill-select-chip--selected');
        } else {
          _selectedFsAgentSkills.add(name);
          chip.classList.add('skill-select-chip--selected');
        }
      });
    });
  } catch (err) {
    el.innerHTML = `<p class="hint-text">Chyba: ${escHtml(err.message)}</p>`;
  }
}

async function scanExternalStorage() {
  const btn = document.getElementById('scan-storage-btn');
  const results = document.getElementById('scan-results');

  btn.disabled = true;
  btn.textContent = t('scanning');
  results.innerHTML = '';
  show(results);

  try {
    const resp = await fetch('/api/knowledge/scan', { method: 'POST' });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ detail: `HTTP ${resp.status}` }));
      throw new Error(err.detail || `HTTP ${resp.status}`);
    }
    const data = await resp.json();

    results.innerHTML = `
      <div class="scan-summary">
        <strong>${t('files_found_label')}:</strong> ${data.total_count}
        ${data.warning ? `<div style="color:#fbbf24;margin-top:0.5rem">${escHtml(data.warning)}</div>` : ''}
      </div>
      ${data.errors.length > 0 ? `
        <div class="scan-errors">
          <strong>${t('errors_title')}:</strong>
          ${data.errors.map(e => `<div>${escHtml(e)}</div>`).join('')}
        </div>
      ` : ''}
      ${data.discovered_files.length > 0 ? `
        <details>
          <summary>Detail (${data.discovered_files.length} souboru)</summary>
          <ul class="file-list">
            ${data.discovered_files.slice(0, 50).map(f => `
              <li>${escHtml(f.name)} (${(f.size_bytes / 1024).toFixed(1)} KB)</li>
            `).join('')}
            ${data.discovered_files.length > 50
              ? `<li>... a ${data.discovered_files.length - 50} dalsich</li>` : ''}
          </ul>
        </details>
      ` : ''}
    `;

    showToast(`${t('files_found_label')}: ${data.total_count}`, 'success');
  } catch (err) {
    console.error('Scan failed:', err);
    results.innerHTML = `<div class="scan-errors">${escHtml(err.message)}</div>`;
    showToast(t('scan_failed'), 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '&#128269; Skenovat uloziste';
  }
}

function _renderIngestProgress(results, current, total) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  results.innerHTML = `
    <div class="scan-summary">
      <strong>${t('indexing')}</strong> ${current} / ${total}
      <div class="ingest-progress-bar">
        <div class="ingest-progress-fill" style="width:${pct}%"></div>
      </div>
    </div>
  `;
}

function _renderIngestResult(results, data) {
  results.innerHTML = `
    <div class="scan-summary">
      <strong>${t('ingest_done_title')}</strong><br>
      ${t('ingest_files_label')}: ${data.ingested_count} |
      ${t('total_chunks_label')}: ${data.total_chunks}
      ${data.failed_count > 0 ? ` | ${t('failed_label')}: ${data.failed_count}` : ''}
    </div>
    ${data.errors && data.errors.length > 0 ? `
      <div class="scan-errors">
        <strong>${t('errors_title')}:</strong>
        ${data.errors.map(e => `<div>${escHtml(e)}</div>`).join('')}
      </div>
    ` : ''}
  `;
}

async function _pollIngestJob(jobId, results) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const r = await fetch(`/api/knowledge/ingest-jobs/${jobId}`);
        if (!r.ok) { clearInterval(interval); return reject(new Error(`HTTP ${r.status}`)); }
        const job = await r.json();

        if (job.status === 'running' || job.status === 'pending') {
          const { current, total } = job.progress;
          _renderIngestProgress(results, current, total);
        } else if (job.status === 'completed') {
          clearInterval(interval);
          _renderIngestResult(results, job.result);
          resolve(job.result);
        } else if (job.status === 'failed') {
          clearInterval(interval);
          reject(new Error(job.result?.error || 'Ingest failed'));
        }
      } catch (err) {
        clearInterval(interval);
        reject(err);
      }
    }, 1000);
  });
}

async function ingestAllFiles() {
  const btn = document.getElementById('ingest-files-btn');
  const results = document.getElementById('ingest-results');

  btn.disabled = true;
  btn.textContent = t('indexing');
  results.innerHTML = '';
  show(results);

  try {
    const resp = await fetch('/api/knowledge/ingest', { method: 'POST' });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ detail: `HTTP ${resp.status}` }));
      throw new Error(err.detail || `HTTP ${resp.status}`);
    }
    const { job_id } = await resp.json();

    _renderIngestProgress(results, 0, 0);
    const data = await _pollIngestJob(job_id, results);
    showToast(`${t('ingest_files_label')}: ${data.ingested_count} (${data.total_chunks} chunků)`, 'success');
  } catch (err) {
    console.error('Ingest failed:', err);
    results.innerHTML = `<div class="scan-errors">${escHtml(err.message)}</div>`;
    showToast(t('ingest_failed'), 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '&#128260; Indexovat vsechny soubory';
  }
}

async function loadKnowledgeStats() {
  const display = document.getElementById('kb-stats-display');
  const filesDisplay = document.getElementById('kb-files-display');

  try {
    const resp = await fetch('/api/knowledge/stats?detailed=true');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    const fileTypesHtml = data.file_types
      ? Object.entries(data.file_types)
          .sort((a, b) => b[1] - a[1])
          .map(([ext, cnt]) => `${escHtml(ext || 'unknown')}: ${cnt}`)
          .join(' | ')
      : '';

    const topSourcesHtml = data.top_sources && data.top_sources.length
      ? `<br><small>Top soubory: ${data.top_sources.slice(0, 5)
            .map(s => `${escHtml(s.path.split('/').pop())} (${s.chunks})`)
            .join(', ')}</small>`
      : '';

    const warningHtml = data.warning
      ? `<div class="scan-errors" style="margin-top:0.5rem">
           &#9432; ${escHtml(data.warning)}
         </div>`
      : '';

    display.innerHTML = `
      <div class="scan-summary">
        <strong>Knowledge Base statistiky</strong><br>
        Celkem chunk&#367;: ${data.total_chunks}${data.total_documents !== undefined ? ` | Soubor&#367;: ${data.total_documents}` : ''} |
        Kolekce: ${escHtml(data.collection_name)}
        ${fileTypesHtml ? `<br><small>Typy soubor&#367;: ${fileTypesHtml}</small>` : ''}
        ${topSourcesHtml}
      </div>
      ${warningHtml}
    `;
    show(display);

    // Show file list with delete buttons
    if (data.top_sources && data.top_sources.length > 0 && filesDisplay) {
      let filesHtml = '<strong style="color:#94a3b8;font-size:0.8125rem">Soubory v KB (top 20):</strong>';
      filesHtml += '<div class="kb-files-list">';
      for (const src of data.top_sources) {
        filesHtml += `
          <div class="kb-file-item">
            <span class="kb-file-item__path" title="${escHtml(src.path)}">${escHtml(src.path)}</span>
            <span class="kb-file-item__chunks">${src.chunks} ch.</span>
            <button class="btn btn--ghost btn--small" data-delete-kb-file="${escHtml(src.path)}" title="Smazat z KB">&#128465;</button>
          </div>`;
      }
      filesHtml += '</div>';
      filesDisplay.innerHTML = filesHtml;
      show(filesDisplay);

      // Bind delete buttons
      filesDisplay.querySelectorAll('[data-delete-kb-file]').forEach(btn => {
        btn.addEventListener('click', () => deleteKbFile(btn.dataset.deleteKbFile));
      });
    }
  } catch (err) {
    console.error('Stats failed:', err);
    display.innerHTML = `<div class="scan-errors">${escHtml(err.message)}</div>`;
    show(display);
  }
}

async function incrementalIngest() {
  const btn = document.getElementById('incremental-ingest-btn');
  const results = document.getElementById('ingest-results');

  btn.disabled = true;
  btn.textContent = 'Synkuji...';
  results.innerHTML = '';
  show(results);

  try {
    const resp = await fetch('/api/knowledge/incremental-ingest', { method: 'POST' });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ detail: `HTTP ${resp.status}` }));
      throw new Error(err.detail || `HTTP ${resp.status}`);
    }
    const data = await resp.json();

    results.innerHTML = `
      <div class="scan-summary">
        <strong>Inkrementalni sync dokoncen</strong><br>
        Novych: ${data.new_indexed} |
        Re-indexovano: ${data.re_indexed} |
        Preskoceno: ${data.skipped} |
        Chunky: ${data.total_chunks}
        ${data.failed > 0 ? ` | Selhalo: ${data.failed}` : ''}
      </div>
      ${data.errors.length > 0 ? `
        <div class="scan-errors">
          <strong>Chyby:</strong>
          ${data.errors.map(e => `<div>${escHtml(e)}</div>`).join('')}
        </div>
      ` : ''}
    `;

    showToast(`Sync: ${data.new_indexed} novych, ${data.re_indexed} aktualizovanych, ${data.skipped} preskoceno`, 'success');
  } catch (err) {
    results.innerHTML = `<div class="scan-errors">${escHtml(err.message)}</div>`;
    showToast('Sync selhal', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '&#128260; Sync soubory';
  }
}

async function deleteKbFile(filePath) {
  if (!confirm(`Opravdu smazat "${filePath}" z Knowledge Base?`)) return;

  try {
    const resp = await fetch(`/api/knowledge/files?path=${encodeURIComponent(filePath)}`, { method: 'DELETE' });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ detail: `HTTP ${resp.status}` }));
      throw new Error(err.detail || `HTTP ${resp.status}`);
    }
    const data = await resp.json();
    showToast(`Smazano: ${data.deleted_chunks} chunku`, 'success');
    // Reload stats
    loadKnowledgeStats();
  } catch (err) {
    showToast(`Chyba mazani: ${err.message}`, 'error');
  }
}

function exportKbMetadata() {
  window.open('/api/knowledge/export-metadata', '_blank');
  showToast('Stahuji export CSV...', 'info');
}

/* ============================================================
   KNOWLEDGE MANAGER – drag-and-drop upload, index / analyze
   ============================================================ */

let _kbSelectedFiles = []; // Array<File>
let _kbMode = 'index';     // 'index' | 'analyze'

const KB_SUPPORTED_EXTS = new Set([
  '.pdf', '.docx', '.xlsx', '.txt', '.md',
  '.png', '.jpg', '.jpeg', '.gif', '.bmp',
  '.py', '.js', '.ts', '.jsx', '.tsx',
  '.json', '.yaml', '.yml', '.toml', '.sh',
  '.bash', '.zsh', '.html', '.css', '.sql',
  '.rs', '.go', '.java', '.c', '.cpp', '.h', '.rb', '.php',
]);

function _kbExt(filename) {
  const i = filename.lastIndexOf('.');
  return i >= 0 ? filename.slice(i).toLowerCase() : '';
}

function _kbIsSupported(filename) {
  return KB_SUPPORTED_EXTS.has(_kbExt(filename));
}

function bindKnowledgeManagerEvents() {
  const dropzone    = document.getElementById('kb-dropzone');
  const fileInput   = document.getElementById('kb-file-input');
  const uploadBtn   = document.getElementById('kb-upload-btn');
  const clearBtn    = document.getElementById('kb-clear-btn');
  const modeGroup   = document.getElementById('kb-mode-group');
  const refreshBtn  = document.getElementById('kb-refresh-overview-btn');
  if (!dropzone) return;

  // ── Mode toggle ──
  modeGroup.querySelectorAll('.kb-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modeGroup.querySelectorAll('.kb-mode-btn').forEach(b => {
        b.classList.toggle('kb-mode-btn--active', b === btn);
        b.classList.toggle('btn--secondary', b === btn);
        b.classList.toggle('btn--ghost', b !== btn);
      });
      _kbMode = btn.dataset.mode;
      const hint = document.getElementById('kb-mode-hint');
      if (hint) hint.textContent = t(_kbMode === 'index' ? 'kb_mode_index_hint' : 'kb_mode_analyze_hint');
      const collRow = document.getElementById('kb-collection-row');
      if (collRow) collRow.classList.toggle('hidden', _kbMode !== 'index');
    });
  });

  // ── File input via click ──
  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
  });
  fileInput.addEventListener('change', () => {
    _kbAddFiles(Array.from(fileInput.files || []));
    fileInput.value = '';
  });

  // ── Drag & drop ──
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('kb-dropzone--active');
  });
  dropzone.addEventListener('dragleave', (e) => {
    if (!dropzone.contains(e.relatedTarget)) dropzone.classList.remove('kb-dropzone--active');
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('kb-dropzone--active');
    const files = Array.from(e.dataTransfer.files || []);
    _kbAddFiles(files);
  });

  // ── Buttons ──
  uploadBtn.addEventListener('click', kbUploadFiles);
  clearBtn.addEventListener('click', _kbClearSelection);
  if (refreshBtn) refreshBtn.addEventListener('click', loadKbOverview);
}

function _kbAddFiles(files) {
  const rejected = [];
  for (const f of files) {
    if (!_kbIsSupported(f.name)) {
      rejected.push(f.name);
      continue;
    }
    if (!_kbSelectedFiles.find(x => x.name === f.name && x.size === f.size)) {
      _kbSelectedFiles.push(f);
    }
  }
  if (rejected.length) showToast(`${t('kb_unsupported')}: ${rejected.join(', ')}`, 'error');
  _kbRenderSelectedFiles();
}

function _kbClearSelection() {
  _kbSelectedFiles = [];
  _kbRenderSelectedFiles();
  hide(document.getElementById('kb-upload-result'));
  hide(document.getElementById('kb-upload-progress'));
}

function _kbRenderSelectedFiles() {
  const el = document.getElementById('kb-selected-files');
  const btn = document.getElementById('kb-upload-btn');
  if (!el) return;

  if (_kbSelectedFiles.length === 0) {
    hide(el);
    btn.disabled = true;
    return;
  }

  btn.disabled = false;
  el.innerHTML = _kbSelectedFiles.map((f, i) => `
    <div class="kb-file-row">
      <span class="kb-file-row__ext">${escHtml(_kbExt(f.name).toUpperCase() || 'FILE')}</span>
      <span class="kb-file-row__name" title="${escHtml(f.name)}">${escHtml(f.name)}</span>
      <span class="kb-file-row__size">${(f.size / 1024).toFixed(1)} KB</span>
      <button class="btn btn--ghost btn--small" data-kb-remove="${i}" title="Odebrat">&#x2715;</button>
    </div>
  `).join('');
  show(el);

  el.querySelectorAll('[data-kb-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      _kbSelectedFiles.splice(Number(btn.dataset.kbRemove), 1);
      _kbRenderSelectedFiles();
    });
  });
}

async function kbUploadFiles() {
  if (!_kbSelectedFiles.length) {
    showToast(t('kb_no_files'), 'error');
    return;
  }

  const btn = document.getElementById('kb-upload-btn');
  const progressEl = document.getElementById('kb-upload-progress');
  const progressFill = document.getElementById('kb-progress-fill');
  const progressLabel = document.getElementById('kb-progress-label');
  const resultEl = document.getElementById('kb-upload-result');
  const collection = (document.getElementById('kb-collection-input')?.value || 'default').trim() || 'default';

  btn.disabled = true;
  btn.textContent = t('kb_uploading');
  hide(resultEl);
  show(progressEl);
  if (progressFill) progressFill.style.width = '0%';
  if (progressLabel) progressLabel.textContent = `0 / ${_kbSelectedFiles.length}`;

  const fd = new FormData();
  for (const f of _kbSelectedFiles) fd.append('files', f);
  fd.append('mode', _kbMode);
  if (_kbMode === 'index') fd.append('collection', collection);

  try {
    const resp = await fetch('/api/knowledge/upload/batch', { method: 'POST', body: fd });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ detail: `HTTP ${resp.status}` }));
      throw new Error(err.detail || `HTTP ${resp.status}`);
    }
    const data = await resp.json();

    if (_kbMode === 'index' && data.job_id) {
      // Poll the ingest job for progress
      if (progressLabel) progressLabel.textContent = 'Indexuji v pozadí...';
      await _kbPollUploadJob(data.job_id, progressFill, progressLabel);
      showToast(t('kb_upload_done'), 'success');
      // Show "indexing started" notice with link to Jobs tab
      if (resultEl) {
        resultEl.innerHTML = `
          <div class="kb-analyze-card" style="display:flex;align-items:center;justify-content:space-between;gap:1rem">
            <span>Indexace dokončena.</span>
            <button class="btn btn--ghost btn--small" onclick="switchTab('jobs')">Zobrazit v Jobech</button>
          </div>`;
        show(resultEl);
      }
      loadKbOverview();
    } else {
      // analyze mode – show results immediately
      if (progressFill) progressFill.style.width = '100%';
      if (progressLabel) progressLabel.textContent = `${data.results.length} / ${data.results.length}`;
      _kbRenderAnalyzeResults(resultEl, data.results);
      showToast(t('kb_upload_done'), 'success');
    }
    _kbClearSelection();
  } catch (err) {
    console.error('KB upload failed:', err);
    if (resultEl) {
      resultEl.innerHTML = `<div class="scan-errors">${escHtml(err.message)}</div>`;
      show(resultEl);
    }
    showToast(t('kb_upload_error'), 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = t('kb_upload_btn');
  }
}

async function _kbPollUploadJob(jobId, progressFill, progressLabel) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const r = await fetch(`/api/knowledge/ingest-jobs/${jobId}`);
        if (!r.ok) { clearInterval(interval); return reject(new Error(`HTTP ${r.status}`)); }
        const job = await r.json();
        const { current, total } = job.progress || { current: 0, total: 1 };
        const pct = total > 0 ? Math.round((current / total) * 100) : 0;
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (progressLabel) progressLabel.textContent = `${current} / ${total} souborů`;
        if (job.status === 'completed') {
          clearInterval(interval);
          resolve(job.result);
        } else if (job.status === 'failed') {
          clearInterval(interval);
          reject(new Error(job.result?.error || 'Upload indexing failed'));
        }
      } catch (err) {
        clearInterval(interval);
        reject(err);
      }
    }, 1000);
  });
}

function _kbRenderAnalyzeResults(el, results) {
  if (!el || !results) return;
  el.innerHTML = results.map(r => {
    if (r.error) return `
      <div class="kb-analyze-card kb-analyze-card--error">
        <strong>${escHtml(r.file)}</strong>: ${escHtml(r.error)}
      </div>`;
    // Build copyable text: filename + summary + preview
    const copyText = [r.file, r.summary || '', r.preview || ''].filter(Boolean).join('\n\n');
    return `
      <div class="kb-analyze-card">
        <div class="kb-analyze-card__header">
          <strong>${escHtml(r.file)}</strong>
          <span class="hint-text">${r.page_count || 1} str. · ${r.char_count || 0} znaků</span>
          <button class="btn btn--ghost btn--small" style="margin-left:auto"
            onclick="navigator.clipboard.writeText(${JSON.stringify(copyText)}).then(()=>showToast('Výsledek zkopírován','success'))"
            title="Zkopírovat výsledek">Zkopírovat</button>
        </div>
        <div class="kb-analyze-card__summary">${escHtml(r.summary || '')}</div>
        ${r.preview ? `<details><summary style="color:#94a3b8;font-size:0.8rem;cursor:pointer">Náhled textu</summary><pre class="kb-preview-text">${escHtml(r.preview)}</pre></details>` : ''}
      </div>`;
  }).join('');
  show(el);
}

async function loadKbOverview() {
  const el = document.getElementById('kb-overview-content');
  const badge = document.getElementById('kb-doc-count-badge');
  if (!el) return;
  el.innerHTML = `<p class="hint-text">${t('kb_overview_loading')}</p>`;

  try {
    const resp = await fetch('/api/knowledge/overview');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    if (badge) badge.textContent = `${data.total_documents || 0} ${t('kb_doc_count')}`;

    if (!data.total_chunks) {
      el.innerHTML = `
        <div class="kb-empty-state">
          <p class="empty-state hint-text">${t('kb_overview_empty')}</p>
          <p class="hint-text" style="margin-top:0.25rem">Nahrej první dokument – přetáhni soubor do oblasti výše nebo klikni na „Nahrát soubory".</p>
        </div>`;
      return;
    }

    const statsHtml = `
      <div class="kb-overview-stats">
        <div class="kb-stat-card"><div class="kb-stat-card__value">${data.total_documents}</div><div class="kb-stat-card__label">Dokumenty</div></div>
        <div class="kb-stat-card"><div class="kb-stat-card__value">${data.total_chunks}</div><div class="kb-stat-card__label">Chunky</div></div>
        <div class="kb-stat-card"><div class="kb-stat-card__value">${data.storage_size_mb} MB</div><div class="kb-stat-card__label">Velikost</div></div>
      </div>`;

    const collectionsHtml = data.collections.length ? `
      <table class="kb-collections-table">
        <thead>
          <tr><th>Kolekce</th><th>Dokumenty</th><th>Chunky</th><th>Typy souborů</th></tr>
        </thead>
        <tbody>
          ${data.collections.map(c => `
            <tr class="kb-collection-row" title="Klikni pro detail (připravujeme)">
              <td><strong>${escHtml(c.name)}</strong></td>
              <td>${c.document_count}</td>
              <td>${c.chunk_count}</td>
              <td>${Object.entries(c.file_types).sort((a,b)=>b[1]-a[1]).slice(0,5)
                      .map(([ext,n]) => `<span class="badge">${escHtml(ext||'?')} ${n}</span>`).join(' ')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>` : '<p class="hint-text">Žádné kolekce.</p>';

    el.innerHTML = statsHtml + collectionsHtml;

    if (data.last_indexed) {
      const ago = Math.round((Date.now() - new Date(data.last_indexed).getTime()) / 60000);
      el.innerHTML += `<p class="hint-text" style="margin-top:0.5rem">Poslední indexace: před ${ago} min</p>`;
    }
  } catch (err) {
    el.innerHTML = `<div class="scan-errors">${escHtml(err.message)}</div>`;
  }
}

/* ============================================================
   KB FILES LIST
   ============================================================ */
let kbFilesOffset = 0;
const _KB_FILES_LIMIT = 50;

const _mediaIcons = {
  text: '\u{1F4C4}', image: '\u{1F5BC}', audio: '\u{1F3B5}',
  video: '\u{1F3AC}', office: '\u{1F4CA}', archive: '\u{1F4E6}',
};

function _formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function _timeAgo(mtime) {
  if (!mtime) return '';
  const now = Date.now() / 1000;
  const diff = now - mtime;
  if (diff < 60) return 'právě teď';
  if (diff < 3600) return Math.floor(diff / 60) + 'min zpět';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h zpět';
  return Math.floor(diff / 86400) + 'd zpět';
}

async function loadKBFiles(offset) {
  if (offset === undefined || offset < 0) offset = 0;
  kbFilesOffset = offset;

  const el = document.getElementById('kb-files-list');
  const countEl = document.getElementById('kb-files-count');
  const pagEl = document.getElementById('kb-files-pagination');
  if (!el) return;
  el.innerHTML = '<p class="hint-text">Načítám soubory...</p>';

  try {
    const resp = await fetch(`/api/knowledge/files?limit=${_KB_FILES_LIMIT}&offset=${offset}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    if (countEl) countEl.textContent = data.total;

    if (!data.files || data.files.length === 0) {
      el.innerHTML = '<p class="empty-state hint-text">Žádné indexované soubory. Nahrajte dokumenty výše.</p>';
      if (pagEl) pagEl.classList.add('hidden');
      return;
    }

    const rows = data.files.map(f => {
      const icon = _mediaIcons[f.media_type] || '\u{1F4C4}';
      const size = _formatBytes(f.size_bytes);
      const ago = _timeAgo(f.mtime);
      const name = escHtml(f.file_name || '');
      return `
        <div class="kb-file-row" data-filepath="${escHtml(f.file_path)}">
          <span class="kb-file-icon">${icon}</span>
          <div class="kb-file-info">
            <span class="kb-file-name" title="${escHtml(f.file_path)}">${name}</span>
            <span class="kb-file-meta">${size} · ${f.chunk_count} chunks · ${ago}</span>
          </div>
          <div class="kb-file-actions">
            <button class="btn btn--ghost btn--small" title="Preview" onclick="previewKBFile('${escHtml(f.file_path)}')">👁️</button>
            <button class="btn btn--ghost btn--small btn--danger-text" title="Smazat" onclick="deleteKBFileUI('${escHtml(f.file_path)}')">🗑️</button>
          </div>
        </div>`;
    }).join('');
    el.innerHTML = rows;

    // Pagination
    if (pagEl) {
      if (data.total > _KB_FILES_LIMIT) {
        pagEl.classList.remove('hidden');
        const pageInfo = document.getElementById('kb-files-page-info');
        if (pageInfo) pageInfo.textContent = `${offset + 1}–${Math.min(offset + _KB_FILES_LIMIT, data.total)} z ${data.total}`;
        const prevBtn = document.getElementById('kb-files-prev');
        const nextBtn = document.getElementById('kb-files-next');
        if (prevBtn) prevBtn.disabled = offset === 0;
        if (nextBtn) nextBtn.disabled = offset + _KB_FILES_LIMIT >= data.total;
      } else {
        pagEl.classList.add('hidden');
      }
    }
  } catch (err) {
    el.innerHTML = `<div class="scan-errors">${escHtml(err.message)}</div>`;
  }
}

async function deleteKBFileUI(filePath) {
  if (!confirm(`Opravdu smazat soubor z KB?\n${filePath}`)) return;
  try {
    const resp = await fetch(`/api/knowledge/files/${encodeURIComponent(filePath)}`, { method: 'DELETE' });
    if (!resp.ok) throw new Error(await resp.text());
    showToast('Soubor smazán z KB', 'success');
    loadKBFiles(kbFilesOffset);
    loadKbOverview();
  } catch (err) {
    showToast('Chyba mazání: ' + err.message, 'error');
  }
}

async function previewKBFile(filePath) {
  // Search KB for chunks of this specific file
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.value = `Zobraz obsah souboru: ${filePath.split('/').pop()}`;
    chatInput.focus();
    showToast('Dotaz připraven v chatu – stiskni Enter', 'info');
  }
}

/* ============================================================
   KB RETENTION
   ============================================================ */

async function loadRetentionConfig() {
  const el = document.getElementById('kb-retention-info');
  if (!el) return;
  try {
    const resp = await fetch('/api/knowledge/retention/config');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const cfg = await resp.json();
    el.innerHTML = `
      <span class="badge" style="margin-right:0.5rem">&#128197; Retention: ${cfg.retention_days} dní</span>
      <span class="badge">&#128190; Max velikost: ${cfg.max_size_gb} GB</span>`;
  } catch (err) {
    el.innerHTML = `<span class="hint-text">Nelze načíst konfiguraci: ${escHtml(err.message)}</span>`;
  }
}

async function runRetention() {
  const btn = document.getElementById('retention-run-btn');
  const resultEl = document.getElementById('kb-retention-result');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Probíhá úklid...'; }
  if (resultEl) resultEl.classList.add('hidden');

  try {
    const resp = await fetch('/api/knowledge/retention/run', { method: 'POST' });
    if (!resp.ok) throw new Error(await resp.text() || `HTTP ${resp.status}`);
    const data = await resp.json();
    if (resultEl) {
      resultEl.classList.remove('hidden');
      resultEl.innerHTML = `
        <div class="alert alert--success" style="padding:0.5rem 0.75rem;border-radius:6px;background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.3);color:#4ade80;font-size:0.85rem">
          ✅ Úklid dokončen – smazáno starých souborů: ${data.deleted_old}, přebytečných: ${data.deleted_size}
          ${data.errors.length ? `<br>⚠️ Chyby: ${data.errors.slice(0,3).map(e => escHtml(e)).join(', ')}` : ''}
        </div>`;
    }
    loadKbOverview();
    loadKBFiles();
  } catch (err) {
    showToast('Chyba retention: ' + err.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🧹 Spustit úklid nyní'; }
  }
}

/* ============================================================
   STATUS DASHBOARD
   ============================================================ */
let _statusRefreshInterval = null;

function bindStatusEvents() {
  const refreshBtn = document.getElementById('refresh-status-btn');
  if (refreshBtn) refreshBtn.addEventListener('click', loadSystemStatus);
}

async function loadResourceMonitor() {
  const gauges = document.getElementById('resource-gauges');
  const banners = document.getElementById('resource-banners');
  const updatedAt = document.getElementById('resource-updated-at');
  if (!gauges) return;

  try {
    const resp = await fetch('/api/status/system/resources');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    if (data.status === 'no_data') {
      gauges.innerHTML = '<p class="empty-state">Zatim zadna data...</p>';
      return;
    }

    // Banners
    if (banners) {
      let bannerHtml = '';
      if (data.throttle) {
        bannerHtml += `<div class="resource-banner resource-banner--warning">${t('resource_throttle')}</div>`;
      }
      if (data.block) {
        bannerHtml += `<div class="resource-banner resource-banner--error">${t('resource_block')}</div>`;
      }
      banners.innerHTML = bannerHtml;
    }

    // Gauges
    const ramPct = data.ram_used_percent || 0;
    const cpuPct = data.cpu_percent || 0;
    const swapUsed = data.swap_used_mb || 0;
    const swapTotal = data.swap_total_mb || 1;
    const swapPct = swapTotal > 0 ? Math.round((swapUsed / swapTotal) * 100) : 0;

    const ramColor = ramPct > 85 ? 'var(--color-error, #e74c3c)' : ramPct > 70 ? 'var(--color-warning, #f39c12)' : 'var(--color-success, #2ecc71)';
    const cpuColor = cpuPct > 85 ? 'var(--color-error, #e74c3c)' : cpuPct > 70 ? 'var(--color-warning, #f39c12)' : 'var(--color-success, #2ecc71)';
    const swapColor = swapPct > 80 ? 'var(--color-error, #e74c3c)' : swapPct > 50 ? 'var(--color-warning, #f39c12)' : 'var(--color-success, #2ecc71)';

    gauges.innerHTML = `
      <div class="resource-gauge">
        <div class="resource-gauge-label">${t('resource_ram')}: ${ramPct.toFixed(1)}% (${data.ram_used_mb || 0} / ${data.ram_total_mb || 0} MB)</div>
        <div class="progress-bar-wrap"><div class="progress-bar" style="width:${ramPct}%;background:${ramColor}"></div></div>
      </div>
      <div class="resource-gauge">
        <div class="resource-gauge-label">${t('resource_cpu')}: ${cpuPct.toFixed(1)}%</div>
        <div class="progress-bar-wrap"><div class="progress-bar" style="width:${cpuPct}%;background:${cpuColor}"></div></div>
      </div>
      <div class="resource-gauge">
        <div class="resource-gauge-label">${t('resource_swap')}: ${swapUsed.toFixed(0)} / ${swapTotal.toFixed(0)} MB (${swapPct}%)</div>
        <div class="progress-bar-wrap"><div class="progress-bar" style="width:${swapPct}%;background:${swapColor}"></div></div>
      </div>
      <div class="resource-gauge">
        <div class="resource-gauge-label">${t('resource_ollama')}: ${(data.ollama_rss_mb || 0).toFixed(0)} MB</div>
        <div class="resource-gauge-label" style="font-size:0.7rem">${t('resource_backend')}: ${(data.backend_rss_mb || 0).toFixed(0)} MB</div>
      </div>
    `;

    if (updatedAt) {
      updatedAt.textContent = `${t('resource_updated')}: ${new Date(data.timestamp).toLocaleTimeString()}`;
    }
  } catch (err) {
    gauges.innerHTML = `<p class="empty-state">Chyba: ${escHtml(err.message)}</p>`;
  }
}

async function loadSystemStatus() {
  const grid = document.getElementById('status-grid');
  const badge = document.getElementById('overall-status-badge');
  const timestamp = document.getElementById('status-timestamp');
  if (!grid) return;

  // Load resource monitor in parallel
  loadResourceMonitor();

  try {
    const response = await fetch('/api/status');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    // Overall status badge
    if (badge) {
      badge.textContent = data.overall_status.toUpperCase();
      badge.className = `status-badge status-badge--${data.overall_status}`;
    }

    // Timestamp
    if (timestamp) {
      timestamp.textContent = `Aktualizovano: ${new Date(data.timestamp).toLocaleTimeString()}`;
    }

    // Render component cards
    grid.innerHTML = '';
    const components = data.components || {};
    for (const [key, component] of Object.entries(components)) {
      if (key === 'integrations') {
        // Integrations get a special card with sub-cards
        const card = createIntegrationsCard(component);
        grid.appendChild(card);
      } else {
        const card = createStatusCard(key, component);
        grid.appendChild(card);
      }
    }

    // Start auto-refresh if not already running
    if (!_statusRefreshInterval) {
      _statusRefreshInterval = setInterval(() => {
        // Only auto-refresh if status tab is visible
        const statusTab = document.getElementById('tab-status');
        if (statusTab && !statusTab.classList.contains('hidden')) {
          loadSystemStatus();
        }
      }, 30000);
    }
  } catch (err) {
    grid.innerHTML = `<p class="empty-state">Chyba: ${escHtml(err.message)}</p>`;
  }
}

function createStatusCard(name, component) {
  const card = document.createElement('div');
  card.className = 'status-card';

  const status = component.status || 'unknown';
  const details = component.details || {};

  card.innerHTML = `
    <div class="status-card-header">
      <span class="status-card-title">${escHtml(formatComponentName(name))}</span>
      <span class="status-indicator status-indicator--${escHtml(status)}" title="${escHtml(status)}"></span>
    </div>
    <div class="status-details">
      ${renderStatusDetails(details)}
    </div>
  `;
  return card;
}

function createIntegrationsCard(integrations) {
  const card = document.createElement('div');
  card.className = 'status-card';
  card.style.gridColumn = '1 / -1';  // full width for integrations

  let subcardsHtml = '';
  for (const [name, sub] of Object.entries(integrations)) {
    const status = sub.status || 'unknown';
    subcardsHtml += `
      <div class="status-subcard">
        <div class="status-subcard-title">${escHtml(formatComponentName(name))}</div>
        <span class="status-indicator status-indicator--${escHtml(status)}" title="${escHtml(status)}"></span>
        <div style="margin-top:0.35rem">${renderStatusDetails(sub.details || {}, true)}</div>
      </div>
    `;
  }

  card.innerHTML = `
    <div class="status-card-header">
      <span class="status-card-title">Integrace</span>
    </div>
    <div class="status-subgrid">${subcardsHtml}</div>
  `;
  return card;
}

function renderStatusDetails(details, compact) {
  const entries = Object.entries(details);
  if (!entries.length) return '<span class="status-detail">Zadne detaily</span>';

  return entries.map(([key, value]) => {
    let displayValue = value;
    if (typeof value === 'boolean') displayValue = value ? 'Ano' : 'Ne';
    else if (value === null || value === undefined) displayValue = '-';
    else if (Array.isArray(value)) displayValue = value.length ? value.join(', ') : '(prazdne)';

    if (compact) {
      return `<div class="status-detail" style="font-size:0.7rem;justify-content:center"><span>${escHtml(String(displayValue))}</span></div>`;
    }
    return `<div class="status-detail"><strong>${escHtml(formatDetailKey(key))}:</strong> <span class="status-detail-value">${escHtml(String(displayValue))}</span></div>`;
  }).join('');
}

function formatComponentName(name) {
  const names = {
    'ollama': 'Ollama LLM',
    'knowledge_base': 'Knowledge Base',
    'filesystem': 'Filesystem',
    'integrations': 'Integrace',
    'agents': 'Agenti',
    'websocket': 'WebSocket',
    'vscode': 'VS Code',
    'git': 'Git',
    'macos': 'macOS',
    'claude_mcp': 'Claude MCP',
    'antigravity': 'Antigravity',
  };
  return names[name] || name.charAt(0).toUpperCase() + name.slice(1);
}

function formatDetailKey(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function handleStatusAlert(msg) {
  addStatusAlert(msg);
  // Auto-refresh status if status tab is active
  const statusTab = document.getElementById('tab-status');
  if (statusTab && !statusTab.classList.contains('hidden')) {
    loadSystemStatus();
  }
}

function addStatusAlert(alert) {
  const container = document.getElementById('status-alerts');
  if (!container) return;

  const alertEl = document.createElement('div');
  const severity = alert.severity || 'info';
  alertEl.className = `status-alert status-alert--${escHtml(severity)}`;
  alertEl.innerHTML = `
    <strong>${escHtml((alert.component || '').toUpperCase())}</strong>: ${escHtml(alert.message || '')}
    <span class="status-alert-time">${new Date().toLocaleTimeString()}</span>
  `;
  container.prepend(alertEl);

  // Auto-remove after 30 seconds
  setTimeout(() => alertEl.remove(), 30000);
}

/* ============================================================
   QUICK ACTIONS EDITOR
   ============================================================ */
let _editingActionId = null;

function bindQuickActionsEditor() {
  const addBtn = document.getElementById('add-action-btn');
  if (addBtn) addBtn.addEventListener('click', () => openActionEditorModal(null));

  const closeBtn = document.getElementById('action-modal-close');
  const cancelBtn = document.getElementById('action-modal-cancel');
  const saveBtn = document.getElementById('action-modal-save');
  const addStepBtn = document.getElementById('add-step-btn');

  if (closeBtn) closeBtn.addEventListener('click', closeActionEditorModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeActionEditorModal);
  if (saveBtn) saveBtn.addEventListener('click', saveQuickAction);
  if (addStepBtn) addStepBtn.addEventListener('click', addStepToEditor);
}

function openActionEditorModal(action) {
  const modal = document.getElementById('action-editor-modal');
  const title = document.getElementById('action-modal-title');
  const nameInput = document.getElementById('action-name-input');
  const iconInput = document.getElementById('action-icon-input');
  const stepsList = document.getElementById('action-steps-list');

  if (action) {
    // Editing existing action
    _editingActionId = action.id;
    title.textContent = t('edit_action');
    nameInput.value = action.name || '';
    iconInput.value = action.icon || '';
    stepsList.innerHTML = '';
    (action.steps || []).forEach(step => addStepToEditor(step));
  } else {
    // Creating new action
    _editingActionId = null;
    title.textContent = t('new_action');
    nameInput.value = '';
    iconInput.value = '\u26A1';
    stepsList.innerHTML = '';
  }

  show(modal);
}

function closeActionEditorModal() {
  hide(document.getElementById('action-editor-modal'));
  _editingActionId = null;
}

function addStepToEditor(existingStep) {
  const stepsList = document.getElementById('action-steps-list');
  const stepNum = stepsList.children.length + 1;

  const stepEl = document.createElement('div');
  stepEl.className = 'action-step-editor';

  const stepType = existingStep?.type || existingStep?.service || '';
  const stepAction = existingStep?.action || '';
  const stepParams = existingStep?.params || {};

  stepEl.innerHTML = `
    <div class="step-header">
      <span class="step-number">${stepNum}.</span>
      <select class="select step-type" style="flex:1">
        <option value="">-- Vyber typ --</option>
        <option value="git" ${stepType === 'git' ? 'selected' : ''}>Git</option>
        <option value="vscode" ${stepType === 'vscode' ? 'selected' : ''}>VS Code</option>
        <option value="macos" ${stepType === 'macos' ? 'selected' : ''}>macOS</option>
        <option value="filesystem" ${stepType === 'filesystem' ? 'selected' : ''}>Filesystem</option>
        <option value="knowledge" ${stepType === 'knowledge' ? 'selected' : ''}>Knowledge Search</option>
        <option value="chat" ${stepType === 'chat' ? 'selected' : ''}>Chat Message</option>
      </select>
    </div>
    <div class="step-params"></div>
    <button class="btn-remove-step" title="Odebrat krok">&times;</button>
  `;

  stepEl.querySelector('.step-type').addEventListener('change', (e) => {
    renderStepParams(stepEl, e.target.value, {});
    updateStepNumbers();
  });

  stepEl.querySelector('.btn-remove-step').addEventListener('click', () => {
    stepEl.remove();
    updateStepNumbers();
  });

  stepsList.appendChild(stepEl);

  // If we have existing data, render params
  if (stepType) {
    renderStepParams(stepEl, stepType, stepParams, stepAction);
  }
}

function updateStepNumbers() {
  document.querySelectorAll('.action-step-editor .step-number').forEach((el, i) => {
    el.textContent = `${i + 1}.`;
  });
}

function renderStepParams(stepEl, type, params, action) {
  const paramsDiv = stepEl.querySelector('.step-params');
  params = params || {};
  action = action || '';

  switch (type) {
    case 'git':
      paramsDiv.innerHTML = `
        <div class="form-group">
          <label class="form-label">Repo cesta:</label>
          <input type="text" class="input step-param" name="repo_path" value="${escHtml(params.repo_path || '')}" placeholder="/cesta/k/repo" />
        </div>
        <div class="form-group">
          <label class="form-label">Prikaz:</label>
          <select class="select step-param" name="command">
            <option value="status" ${(action || params.command) === 'status' ? 'selected' : ''}>Status</option>
            <option value="pull" ${(action || params.command) === 'pull' ? 'selected' : ''}>Pull</option>
            <option value="commit" ${(action || params.command) === 'commit' ? 'selected' : ''}>Commit</option>
            <option value="push" ${(action || params.command) === 'push' ? 'selected' : ''}>Push</option>
            <option value="fetch" ${(action || params.command) === 'fetch' ? 'selected' : ''}>Fetch</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Commit zprava (pro commit):</label>
          <input type="text" class="input step-param" name="message" value="${escHtml(params.message || '')}" placeholder="Auto-commit" />
        </div>
      `;
      break;
    case 'vscode':
      paramsDiv.innerHTML = `
        <div class="form-group">
          <label class="form-label">Akce:</label>
          <select class="select step-param" name="action">
            <option value="open_project" ${(action || params.action) === 'open_project' ? 'selected' : ''}>Otevrit projekt</option>
            <option value="open_file" ${(action || params.action) === 'open_file' ? 'selected' : ''}>Otevrit soubor</option>
            <option value="run_task" ${(action || params.action) === 'run_task' ? 'selected' : ''}>Spustit task</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Cesta / Projekt:</label>
          <input type="text" class="input step-param" name="path" value="${escHtml(params.path || params.project_key || '')}" placeholder="/cesta nebo klic projektu" />
        </div>
      `;
      break;
    case 'macos':
      paramsDiv.innerHTML = `
        <div class="form-group">
          <label class="form-label">Akce:</label>
          <select class="select step-param" name="action">
            <option value="notification" ${(action || params.action) === 'notification' ? 'selected' : ''}>Notifikace</option>
            <option value="launch_app" ${(action || params.action) === 'launch_app' ? 'selected' : ''}>Spustit aplikaci</option>
            <option value="quit_app" ${(action || params.action) === 'quit_app' ? 'selected' : ''}>Zavrit aplikaci</option>
            <option value="volume_set" ${(action || params.action) === 'volume_set' ? 'selected' : ''}>Nastavit hlasitost</option>
            <option value="safari_open" ${(action || params.action) === 'safari_open' ? 'selected' : ''}>Otevrit Safari</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Parametry (JSON):</label>
          <textarea class="textarea step-param" name="params" rows="2" placeholder='{"level": 50}'>${escHtml(typeof params.params === 'object' ? JSON.stringify(params.params) : (params.params || ''))}</textarea>
        </div>
      `;
      break;
    case 'filesystem':
      paramsDiv.innerHTML = `
        <div class="form-group">
          <label class="form-label">Operace:</label>
          <select class="select step-param" name="action">
            <option value="read" ${(action || params.action) === 'read' ? 'selected' : ''}>Precist soubor</option>
            <option value="write" ${(action || params.action) === 'write' ? 'selected' : ''}>Zapsat soubor</option>
            <option value="list" ${(action || params.action) === 'list' ? 'selected' : ''}>Vypsat adresar</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Cesta:</label>
          <input type="text" class="input step-param" name="path" value="${escHtml(params.path || '')}" placeholder="/cesta/k/souboru" />
        </div>
      `;
      break;
    case 'knowledge':
      paramsDiv.innerHTML = `
        <div class="form-group">
          <label class="form-label">Vyhledavaci dotaz:</label>
          <input type="text" class="input step-param" name="query" value="${escHtml(params.query || '')}" placeholder="Co hledat v knowledge base..." />
        </div>
      `;
      break;
    case 'chat':
      paramsDiv.innerHTML = `
        <div class="form-group">
          <label class="form-label">Zprava:</label>
          <textarea class="textarea step-param" name="message" rows="2" placeholder="Zprava pro chat...">${escHtml(params.message || '')}</textarea>
        </div>
      `;
      break;
    default:
      paramsDiv.innerHTML = '';
  }
}

async function saveQuickAction() {
  const name = document.getElementById('action-name-input').value.trim();
  const icon = document.getElementById('action-icon-input').value.trim() || '\u26A1';

  if (!name) {
    showToast(t('enter_action_name'), 'warning');
    return;
  }

  const steps = [];
  document.querySelectorAll('.action-step-editor').forEach(stepEl => {
    const type = stepEl.querySelector('.step-type').value;
    if (!type) return;

    const params = {};
    let action = '';
    stepEl.querySelectorAll('.step-param').forEach(input => {
      const val = input.value.trim();
      if (!val) return;
      if (input.name === 'action' || input.name === 'command') {
        action = val;
      } else {
        params[input.name] = val;
      }
    });

    steps.push({ service: type, action: action, params });
  });

  const actionData = { name, icon, steps };

  try {
    if (_editingActionId) {
      // Update existing
      actionData.id = _editingActionId;
      const res = await fetch(`/api/settings/quick-actions/${encodeURIComponent(_editingActionId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Update failed');
      }
      showToast(t('action_updated'), 'success');
    } else {
      // Create new
      const res = await fetch('/api/settings/quick-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Create failed');
      }
      showToast(t('action_created'), 'success');
    }

    closeActionEditorModal();
    loadQuickActions();
  } catch (err) {
    showToast('Chyba: ' + err.message, 'error');
  }
}

/* ============================================================
   SETUP CHECK
   ============================================================ */
async function checkSetupStatus() {
  try {
    const res = await fetch('/api/setup/status');
    if (!res.ok) return;
    const data = await res.json();
    if (data.first_run) {
      showSetupWizard();
    }
  } catch (e) { /* non-critical – wizard is optional */ }
}

async function quickIndexKB(btn) {
  if (btn) { btn.disabled = true; btn.textContent = 'Indexuji...'; }
  try {
    const resp = await fetch('/api/knowledge/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(null),
    });
    if (!resp.ok) throw new Error(await resp.text());
    const data = await resp.json();
    showToast(`KB indexace spuštěna (job: ${data.job_id})`, 'success');
    if (btn) btn.textContent = 'Spuštěno';
  } catch (err) {
    showToast(`Chyba: ${err.message}`, 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'Indexovat'; }
  }
}

/* ============================================================
   TOAST
   ============================================================ */
function showToast(message, type = 'info', duration = 4000) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = `toast toast--${type}`;
  toast.classList.remove('hidden');
  toastTimer = setTimeout(() => toast.classList.add('hidden'), duration);
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
    if (!files.length) return;

    // Separate images from other files
    const imageFiles = files.filter(f => ALLOWED_IMAGE_TYPES.includes(f.type));
    const otherFiles = files.filter(f => !ALLOWED_IMAGE_TYPES.includes(f.type));

    if (imageFiles.length) handleImageFiles(imageFiles);
    if (otherFiles.length) handleFiles(otherFiles);
  });
}

/* ============================================================
   SHARED MEMORY
   ============================================================ */

async function addMemory() {
  const text = getVal('mem-text');
  if (!text.trim()) { showToast('Text je povinny', 'error'); return; }
  const tagsRaw = getVal('mem-tags');
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
  const importance = parseInt(getVal('mem-importance') || '5');

  try {
    const res = await fetch('/api/memory/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, tags, importance, source: 'ui' }),
    });
    if (!res.ok) throw new Error(await res.text());
    setVal('mem-text', '');
    setVal('mem-tags', '');
    setVal('mem-importance', '5');
    showToast('Pamet ulozena', 'success');
    // Refresh list if visible
    const list = document.getElementById('memory-list');
    if (list && !list.classList.contains('hidden')) loadMemories();
  } catch (err) {
    showToast('Chyba: ' + err.message, 'error');
  }
}

function toggleMemories() {
  const list = document.getElementById('memory-list');
  if (list.classList.contains('hidden')) {
    list.classList.remove('hidden');
    loadMemories();
  } else {
    list.classList.add('hidden');
  }
}

async function loadMemories() {
  const list = document.getElementById('memory-list');
  const countEl = document.getElementById('memory-count');
  list.innerHTML = '<span style="color:#94a3b8">Nacitam...</span>';

  try {
    const res = await fetch('/api/memory/all?limit=200');
    const data = await res.json();
    const memories = data.memories || [];
    countEl.textContent = memories.length + ' zaznamu';

    if (!memories.length) {
      list.innerHTML = '<span style="color:#94a3b8">Zadne pameti.</span>';
      return;
    }

    list.innerHTML = memories.map(m => {
      const tagsHtml = (m.tags || []).map(t => `<span style="background:#334155;padding:2px 6px;border-radius:4px;font-size:0.75rem">${escHtml(t)}</span>`).join(' ');
      const ts = m.timestamp ? new Date(m.timestamp).toLocaleString('cs-CZ') : '';
      return `<div style="border:1px solid #334155;border-radius:8px;padding:0.75rem;margin-bottom:0.5rem">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:0.5rem">
          <div style="flex:1">
            <div style="color:#e2e8f0">${escHtml(m.text)}</div>
            <div style="margin-top:0.25rem;display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center">
              ${tagsHtml}
              <span style="color:#64748b;font-size:0.75rem">dulezitost: ${m.importance}/10</span>
              ${m.source ? `<span style="color:#64748b;font-size:0.75rem">zdroj: ${escHtml(m.source)}</span>` : ''}
              <span style="color:#64748b;font-size:0.75rem">${ts}</span>
            </div>
          </div>
          <button class="btn btn--ghost btn--small" onclick="deleteMemory('${escHtml(m.id)}')" title="Smazat">&#128465;</button>
        </div>
      </div>`;
    }).join('');
  } catch (err) {
    list.innerHTML = `<span style="color:#f87171">Chyba: ${escHtml(err.message)}</span>`;
  }
}

async function deleteMemory(id) {
  if (!confirm('Smazat tuto pamet?')) return;
  try {
    const res = await fetch('/api/memory/' + encodeURIComponent(id), { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
    showToast('Pamet smazana', 'success');
    loadMemories();
  } catch (err) {
    showToast('Chyba: ' + err.message, 'error');
  }
}

/* ============================================================
   JOBS
   ============================================================ */
let _jobsCache = [];
let _jobsPollTimer = null;
let _selectedJobId = null;
let _jobsLimit = 50;

function bindJobsEvents() {
  const refreshBtn = document.getElementById('refresh-jobs-btn');
  if (refreshBtn) refreshBtn.addEventListener('click', loadJobs);

  const createDummyBtn = document.getElementById('create-dummy-job-btn');
  if (createDummyBtn) createDummyBtn.addEventListener('click', () => createQuickJob('dummy_long_task'));

  const createLlmBtn = document.getElementById('create-llm-job-btn');
  if (createLlmBtn) createLlmBtn.addEventListener('click', () => createQuickJob('long_llm_task'));

  const detailCloseBtn = document.getElementById('job-detail-close');
  if (detailCloseBtn) detailCloseBtn.addEventListener('click', closeJobDetail);

  // Media upload
  bindMediaUploadEvents();

  // Jobs limit toggle
  const limitBtn = document.getElementById('jobs-limit-btn');
  const limitAllBtn = document.getElementById('jobs-limit-all-btn');
  if (limitBtn) limitBtn.addEventListener('click', () => {
    _jobsLimit = 50;
    limitBtn.classList.add('jobs-limit-toggle--active');
    if (limitAllBtn) limitAllBtn.classList.remove('jobs-limit-toggle--active');
    loadJobs();
  });
  if (limitAllBtn) limitAllBtn.addEventListener('click', () => {
    _jobsLimit = 0;
    limitAllBtn.classList.add('jobs-limit-toggle--active');
    if (limitBtn) limitBtn.classList.remove('jobs-limit-toggle--active');
    loadJobs();
  });

  // Document analysis wizard
  bindDocAnalysisEvents();
}

async function loadJobs() {
  const container = document.getElementById('jobs-list');
  if (!container) return;

  // Read filter values
  const statusFilter = (document.getElementById('jobs-filter-status') || {}).value || '';
  const typeFilter = (document.getElementById('jobs-filter-type') || {}).value || '';
  const limitParam = _jobsLimit > 0 ? _jobsLimit : 500;
  let url = `/api/jobs?limit=${limitParam}`;
  if (statusFilter) url += '&status=' + encodeURIComponent(statusFilter);
  if (typeFilter) url += '&type=' + encodeURIComponent(typeFilter);

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    _jobsCache = data.jobs || [];
    renderJobsList(_jobsCache);

    // Populate type dropdown from unique types (only once if empty)
    const typeSelect = document.getElementById('jobs-filter-type');
    if (typeSelect && typeSelect.options.length <= 1 && !statusFilter && !typeFilter) {
      const types = [...new Set(_jobsCache.map(j => j.type))].sort();
      types.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        typeSelect.appendChild(opt);
      });
    }
  } catch (err) {
    container.innerHTML = `<div class="resident-error-box"><span>Chyba: ${escHtml(err.message)}</span><button class="btn btn--ghost btn--small" onclick="loadJobs()">Zkusit znovu</button></div>`;
  }

  // Set up polling while on jobs tab
  clearInterval(_jobsPollTimer);
  _jobsPollTimer = setInterval(() => {
    const panel = document.getElementById('tab-jobs');
    if (panel && !panel.classList.contains('hidden')) {
      loadJobs();
    } else {
      clearInterval(_jobsPollTimer);
    }
  }, 10000);
}

function renderJobsList(jobs) {
  const container = document.getElementById('jobs-list');
  if (!container) return;

  if (!jobs.length) {
    container.innerHTML = '<p class="empty-state">Zadne joby.</p>';
    return;
  }

  container.innerHTML = `
    <div class="jobs-table-wrap">
    <table class="jobs-table">
      <thead>
        <tr>
          <th>Název</th>
          <th>Typ</th>
          <th>Status</th>
          <th>Progress</th>
          <th>Trvání</th>
          <th>Vytvořeno</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${jobs.map(j => `
          <tr class="jobs-row ${j.status === 'running' ? 'jobs-row--running' : ''}" data-job-id="${escHtml(j.id)}">
            <td class="jobs-cell-title" onclick="showJobDetail('${escHtml(j.id)}')" style="cursor:pointer;color:#60a5fa">${escHtml(j.title)}</td>
            <td><span class="job-type-badge">${escHtml(j.type)}</span></td>
            <td><span class="job-status-badge job-status--${j.status}">${escHtml(j.status)}</span></td>
            <td>
              <div class="job-progress-bar">
                <div class="job-progress-fill" style="width:${Math.round(j.progress)}%"></div>
              </div>
              <span class="job-progress-text">${Math.round(j.progress)}%</span>
            </td>
            <td class="jobs-cell-duration">${formatJobDuration(j.started_at, j.finished_at)}</td>
            <td class="jobs-cell-date">${formatJobDate(j.created_at)}</td>
            <td style="white-space:nowrap">
              ${j.status === 'running'
                ? `<button class="btn btn--ghost btn--small" onclick="pauseJob('${escHtml(j.id)}',this)" title="Pozastavit">&#9208; Pause</button>`
                : ''}
              ${j.status === 'paused'
                ? `<button class="btn btn--secondary btn--small" onclick="resumeJob('${escHtml(j.id)}',this)" title="Obnovit">&#9654; Resume</button>`
                : ''}
              ${(j.status === 'queued' || j.status === 'running' || j.status === 'paused')
                ? `<button class="btn btn--ghost btn--small jobs-action-cancel" onclick="cancelJob('${escHtml(j.id)}',this)">Zru&#353;it</button>`
                : ''}
              ${(j.status === 'failed' || j.status === 'cancelled')
                ? `<button class="btn btn--secondary btn--small jobs-action-retry" onclick="retryJob('${escHtml(j.id)}',this)">Znovu</button>`
                : ''}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    </div>
  `;
}

function formatJobDate(iso) {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return d.toLocaleString('cs-CZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

/** Format duration in seconds to human-readable "1m 23s" / "45s" / "2h 3m" */
function formatJobDuration(startIso, finishIso) {
  if (!startIso) return '-';
  const start = new Date(startIso).getTime();
  const end = finishIso ? new Date(finishIso).getTime() : Date.now();
  const totalSec = Math.max(0, Math.round((end - start) / 1000));
  if (totalSec < 60) return totalSec + 's';
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m < 60) return m + 'm ' + s + 's';
  const h = Math.floor(m / 60);
  return h + 'h ' + (m % 60) + 'm';
}

async function showJobDetail(jobId) {
  _selectedJobId = jobId;
  const section = document.getElementById('job-detail-section');
  const content = document.getElementById('job-detail-content');
  if (!section || !content) return;

  try {
    const res = await fetch('/api/jobs/' + encodeURIComponent(jobId));
    if (!res.ok) throw new Error(await res.text());
    const job = await res.json();
    renderJobDetail(job);
    section.classList.remove('hidden');
  } catch (err) {
    content.innerHTML = `<span style="color:#f87171">Chyba: ${escHtml(err.message)}</span>`;
    section.classList.remove('hidden');
  }
}

function renderJobDetail(job) {
  const title = document.getElementById('job-detail-title');
  const content = document.getElementById('job-detail-content');
  if (!content) return;
  if (title) title.textContent = job.title || 'Detail jobu';

  const meta = job.meta || {};
  const metaHtml = Object.keys(meta).length
    ? `<div class="job-detail-meta"><strong>Meta:</strong> <pre style="margin:0.25rem 0;white-space:pre-wrap;font-size:0.8rem;color:#94a3b8">${escHtml(JSON.stringify(meta, null, 2))}</pre></div>`
    : '';

  // Type-specific extra info
  let extraHtml = '';

  if (job.type === 'media_ingest') {
    extraHtml = renderMediaIngestDetail(job);
  } else if (job.type === 'document_analysis' && job.status === 'succeeded') {
    extraHtml = renderDocAnalysisDetail(job);
  } else if (job.type === 'report_generation' && job.status === 'succeeded') {
    extraHtml = renderReportDetail(job);
  }

  // Show filename + collection from metadata if present
  const fileInfoHtml = (meta.file || meta.filename)
    ? `<div class="job-detail-row">
         <span class="job-detail-label">Soubor:</span>
         <span>${escHtml(meta.file || meta.filename || '')}${meta.collection ? ` <span class="hint-text">(${escHtml(meta.collection)})</span>` : ''}</span>
       </div>`
    : '';

  // Copy-error box – error text in a box with a copy button
  const errorHtml = job.last_error
    ? `<div class="job-detail-row" style="flex-direction:column;align-items:flex-start;gap:0.25rem">
         <span class="job-detail-label">Chyba:</span>
         <div class="job-error-box">
           <pre style="margin:0;white-space:pre-wrap;font-size:0.8rem;color:#f87171;flex:1">${escHtml(job.last_error)}</pre>
           <button class="btn btn--ghost btn--small" onclick="navigator.clipboard.writeText(${JSON.stringify(job.last_error)}).then(()=>showToast('Zkopírováno','success'))" title="Zkopírovat chybu">Kopírovat</button>
         </div>
       </div>`
    : '';

  const durationHtml = job.started_at
    ? `<div class="job-detail-row"><span class="job-detail-label">Trvání:</span> ${formatJobDuration(job.started_at, job.finished_at)}</div>`
    : '';

  content.innerHTML = `
    <div class="job-detail-grid">
      <div class="job-detail-row"><span class="job-detail-label">ID:</span> <code>${escHtml(job.id)}</code></div>
      <div class="job-detail-row"><span class="job-detail-label">Typ:</span> <span class="job-type-badge">${escHtml(job.type)}</span></div>
      <div class="job-detail-row"><span class="job-detail-label">Status:</span> <span class="job-status-badge job-status--${job.status}">${escHtml(job.status)}</span></div>
      <div class="job-detail-row"><span class="job-detail-label">Priorita:</span> ${escHtml(job.priority)}</div>
      <div class="job-detail-row"><span class="job-detail-label">Popis:</span> ${escHtml(job.input_summary || '-')}</div>
      ${fileInfoHtml}
      <div class="job-detail-row">
        <span class="job-detail-label">Progress:</span>
        <div style="display:flex;align-items:center;gap:0.5rem;flex:1">
          <div class="job-progress-bar" style="flex:1">
            <div class="job-progress-fill" style="width:${Math.round(job.progress)}%"></div>
          </div>
          <span>${Math.round(job.progress)}%</span>
        </div>
      </div>
      <div class="job-detail-row"><span class="job-detail-label">Vytvořeno:</span> ${formatJobDate(job.created_at)}</div>
      <div class="job-detail-row"><span class="job-detail-label">Spuštěno:</span> ${formatJobDate(job.started_at)}</div>
      <div class="job-detail-row"><span class="job-detail-label">Dokončeno:</span> ${formatJobDate(job.finished_at)}</div>
      ${durationHtml}
      ${errorHtml}
      ${extraHtml}
      ${metaHtml}
    </div>
    <div style="margin-top:0.75rem;display:flex;gap:0.5rem;flex-wrap:wrap">
      ${(job.status === 'queued' || job.status === 'running')
        ? `<button class="btn btn--ghost btn--small jobs-action-cancel" onclick="cancelJob('${escHtml(job.id)}',this)">Zrušit job</button>`
        : ''}
      ${(job.status === 'failed' || job.status === 'cancelled')
        ? `<button class="btn btn--secondary btn--small jobs-action-retry" onclick="retryJob('${escHtml(job.id)}',this)">Zkusit znovu</button>`
        : ''}
    </div>
    ${(job.type === 'document_analysis' && job.status === 'succeeded')
      ? `<div style="margin-top:0.75rem;display:flex;gap:0.5rem;flex-wrap:wrap">
           <button class="btn btn--primary btn--small" onclick="createReportFromJob('${escHtml(job.id)}', 'html')">Generovat HTML report</button>
           <button class="btn btn--secondary btn--small" onclick="createReportFromJob('${escHtml(job.id)}', 'slides')">Generovat slides</button>
           <button class="btn btn--secondary btn--small" onclick="createReportFromJob('${escHtml(job.id)}', 'pdf')">Generovat PDF</button>
         </div>`
      : ''}
  `;
}

function closeJobDetail() {
  _selectedJobId = null;
  const section = document.getElementById('job-detail-section');
  if (section) section.classList.add('hidden');
}

async function cancelJob(jobId, triggerBtn) {
  // Disable the button that triggered the action to prevent double-clicks
  if (triggerBtn) { triggerBtn.disabled = true; triggerBtn.textContent = 'Ruším…'; }
  // Also disable any matching buttons in the table row
  document.querySelectorAll(`[data-job-id="${CSS.escape(jobId)}"] .jobs-action-cancel`).forEach(b => { b.disabled = true; });
  try {
    const res = await fetch('/api/jobs/' + encodeURIComponent(jobId) + '/cancel', { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
    showToast('Job zrušen', 'success');
    loadJobs();
    if (_selectedJobId === jobId) showJobDetail(jobId);
  } catch (err) {
    showToast('Chyba: ' + err.message, 'error');
    if (triggerBtn) { triggerBtn.disabled = false; triggerBtn.textContent = 'Zrušit'; }
  }
}

async function retryJob(jobId, triggerBtn) {
  if (triggerBtn) { triggerBtn.disabled = true; triggerBtn.textContent = 'Zařazuji…'; }
  document.querySelectorAll(`[data-job-id="${CSS.escape(jobId)}"] .jobs-action-retry`).forEach(b => { b.disabled = true; });
  try {
    const res = await fetch('/api/jobs/' + encodeURIComponent(jobId) + '/retry', { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    showToast('Job znovu zařazen do fronty', 'success');
    loadJobs();
    if (data.id) showJobDetail(data.id);
  } catch (err) {
    showToast('Chyba: ' + err.message, 'error');
    if (triggerBtn) { triggerBtn.disabled = false; triggerBtn.textContent = 'Zkusit znovu'; }
  }
}

async function pauseJob(jobId, triggerBtn) {
  if (triggerBtn) { triggerBtn.disabled = true; triggerBtn.textContent = 'Pausing\u2026'; }
  try {
    const res = await fetch('/api/jobs/' + encodeURIComponent(jobId) + '/pause', { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
    showToast('Job pozastaven', 'success');
    loadJobs();
  } catch (err) {
    showToast('Chyba: ' + err.message, 'error');
    if (triggerBtn) { triggerBtn.disabled = false; }
  }
}

async function resumeJob(jobId, triggerBtn) {
  if (triggerBtn) { triggerBtn.disabled = true; triggerBtn.textContent = 'Resuming\u2026'; }
  try {
    const res = await fetch('/api/jobs/' + encodeURIComponent(jobId) + '/resume', { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
    showToast('Job obnoven', 'success');
    loadJobs();
  } catch (err) {
    showToast('Chyba: ' + err.message, 'error');
    if (triggerBtn) { triggerBtn.disabled = false; }
  }
}

async function createQuickJob(type) {
  const configs = {
    dummy_long_task: {
      title: 'Dummy overnight job',
      input_summary: 'Simulace dlouheho zpracovani (10 kroku)',
      payload: { steps: 10, sleep_seconds: 1 },
      priority: 'low',
    },
    long_llm_task: {
      title: 'Long LLM task (test)',
      input_summary: 'Testovaci LLM uloha',
      payload: { prompt: 'Vysvetli podrobne, co je to strojove uceni, jeho hlavni principy, metody a aplikace v praxi.', chunk_size: 20 },
      priority: 'normal',
    },
  };
  const cfg = configs[type];
  if (!cfg) return;

  try {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...cfg }),
    });
    if (!res.ok) throw new Error(await res.text());
    showToast('Job vytvoren', 'success');
    loadJobs();
  } catch (err) {
    showToast('Chyba: ' + err.message, 'error');
  }
}

function handleJobUpdate(jobData) {
  if (!jobData) return;
  // Update the cache entry
  const idx = _jobsCache.findIndex(j => j.id === jobData.id);
  if (idx >= 0) {
    _jobsCache[idx] = { ..._jobsCache[idx], ...jobData };
  }
  // Re-render list if jobs tab is visible
  const panel = document.getElementById('tab-jobs');
  if (panel && !panel.classList.contains('hidden')) {
    renderJobsList(_jobsCache);
    // Update detail if this job is selected
    if (_selectedJobId === jobData.id) {
      showJobDetail(jobData.id);
    }
  }
}

async function summarizeSession() {
  if (!currentSessionId) {
    showToast('Zadna aktivni session', 'warning');
    return;
  }
  const btn = document.getElementById('summarize-session-btn');
  if (btn) btn.disabled = true;
  try {
    const res = await fetch('/api/memory/summarize-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: currentSessionId }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    if (data.summary_count > 0) {
      showToast(`Vytvoreno ${data.summary_count} pameti z konverzace`, 'success');
    } else {
      showToast('Zadne relevantn\u00ed fakta nalezeny', 'info');
    }
  } catch (err) {
    showToast('Chyba: ' + err.message, 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

/* ============================================================
   MEDIA UPLOAD
   ============================================================ */

function bindMediaUploadEvents() {
  const uploadBtn = document.getElementById('media-upload-btn');
  if (uploadBtn) uploadBtn.addEventListener('click', handleMediaUpload);

  const postAnalysisCb = document.getElementById('media-post-analysis');
  if (postAnalysisCb) {
    postAnalysisCb.addEventListener('change', () => {
      const taskGroup = document.getElementById('media-task-group');
      if (taskGroup) {
        taskGroup.style.display = postAnalysisCb.checked ? '' : 'none';
      }
    });
  }
}

async function handleMediaUpload() {
  const fileInput = document.getElementById('media-file-input');
  const language = getVal('media-language');
  const postAnalysis = document.getElementById('media-post-analysis')?.checked || false;
  const task = getVal('media-task');
  const statusEl = document.getElementById('media-upload-status');
  const spinner = document.getElementById('media-upload-spinner');
  const btn = document.getElementById('media-upload-btn');

  if (!fileInput || !fileInput.files.length) {
    showToast('Vyber soubor', 'error');
    return;
  }

  const file = fileInput.files[0];
  if (btn) btn.disabled = true;
  if (spinner) spinner.classList.remove('hidden');
  if (statusEl) { statusEl.innerHTML = 'Nahravam...'; show(statusEl); }

  try {
    // Step 1: Upload file
    const formData = new FormData();
    formData.append('file', file);
    const uploadRes = await fetch('/api/media/upload', { method: 'POST', body: formData });
    if (!uploadRes.ok) throw new Error(await uploadRes.text());
    const uploadData = await uploadRes.json();

    if (statusEl) statusEl.innerHTML = `Nahrano: ${escHtml(uploadData.filename)} (${uploadData.size_mb} MB). Vytvarim job...`;

    // Step 2: Create media_ingest job
    const jobPayload = {
      type: 'media_ingest',
      title: `Transkripce: ${uploadData.filename}`,
      input_summary: `Transkripce souboru ${uploadData.filename}`,
      payload: {
        file_path: uploadData.file_path,
        language: language,
        post_analysis: postAnalysis,
        post_analysis_task: postAnalysis ? task : '',
        llm_profile: 'general',
      },
      priority: 'low',
    };

    const jobRes = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobPayload),
    });
    if (!jobRes.ok) throw new Error(await jobRes.text());
    const jobData = await jobRes.json();

    if (statusEl) {
      statusEl.innerHTML = `<span style="color:#4ade80">Job vytvoren: ${escHtml(jobData.title)}</span>
        <br><code>${escHtml(jobData.id)}</code>
        <br><span style="color:#94a3b8">Status: ${escHtml(jobData.status)}</span>`;
    }

    showToast('Media job vytvoren', 'success');
    fileInput.value = '';
    loadJobs();

  } catch (err) {
    showToast('Chyba: ' + err.message, 'error');
    if (statusEl) statusEl.innerHTML = `<span style="color:#f87171">Chyba: ${escHtml(err.message)}</span>`;
  } finally {
    if (btn) btn.disabled = false;
    if (spinner) spinner.classList.add('hidden');
  }
}

/* ============================================================
   DOCUMENT ANALYSIS WIZARD
   ============================================================ */

let _daSelectedFiles = [];

function bindDocAnalysisEvents() {
  const openBtn = document.getElementById('open-doc-analysis-btn');
  if (openBtn) openBtn.addEventListener('click', openDocAnalysisWizard);

  const closeBtn = document.getElementById('doc-analysis-modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeDocAnalysisModal);

  const step1Next = document.getElementById('da-step1-next');
  if (step1Next) step1Next.addEventListener('click', daGoToStep2);

  const step2Back = document.getElementById('da-step2-back');
  if (step2Back) step2Back.addEventListener('click', daGoToStep1);

  const step2Submit = document.getElementById('da-step2-submit');
  if (step2Submit) step2Submit.addEventListener('click', daSubmitAnalysis);

  const step3Done = document.getElementById('da-step3-done');
  if (step3Done) step3Done.addEventListener('click', () => {
    closeDocAnalysisModal();
    loadJobs();
  });
}

function closeDocAnalysisModal() {
  const modal = document.getElementById('doc-analysis-modal');
  if (modal) modal.classList.add('hidden');
}

async function openDocAnalysisWizard() {
  _daSelectedFiles = [];
  const modal = document.getElementById('doc-analysis-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  // Reset to step 1
  show(document.getElementById('da-step-1'));
  hide(document.getElementById('da-step-2'));
  hide(document.getElementById('da-step-3'));

  const loading = document.getElementById('da-files-loading');
  const uploadsSection = document.getElementById('da-uploads-section');
  const kbSection = document.getElementById('da-kb-section');
  if (loading) show(loading);
  if (uploadsSection) hide(uploadsSection);
  if (kbSection) hide(kbSection);

  const nextBtn = document.getElementById('da-step1-next');
  if (nextBtn) nextBtn.disabled = true;

  try {
    const res = await fetch('/api/document-analysis/available-files');
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();

    if (loading) hide(loading);

    // Render uploads
    if (data.uploads && data.uploads.length) {
      if (uploadsSection) show(uploadsSection);
      const list = document.getElementById('da-uploads-list');
      if (list) {
        list.innerHTML = data.uploads.map(f => `
          <label class="toggle-label" style="display:block;margin-bottom:0.25rem;padding:0.25rem 0">
            <input type="checkbox" class="da-file-cb" data-path="${escHtml(f.file_path)}" />
            <span>${escHtml(f.filename)}</span>
            <span style="color:#64748b;font-size:0.8rem;margin-left:0.5rem">${f.size_mb} MB</span>
          </label>
        `).join('');
        list.querySelectorAll('.da-file-cb').forEach(cb => cb.addEventListener('change', daUpdateSelection));
      }
    }

    // Render KB documents
    if (data.kb_documents && data.kb_documents.length) {
      if (kbSection) show(kbSection);
      const list = document.getElementById('da-kb-list');
      if (list) {
        list.innerHTML = data.kb_documents.map(f => `
          <label class="toggle-label" style="display:block;margin-bottom:0.25rem;padding:0.25rem 0">
            <input type="checkbox" class="da-file-cb" data-path="${escHtml(f.file_path)}" />
            <span>${escHtml(f.filename)}</span>
            <span style="color:#64748b;font-size:0.8rem;margin-left:0.5rem">${escHtml(f.type)}</span>
          </label>
        `).join('');
        list.querySelectorAll('.da-file-cb').forEach(cb => cb.addEventListener('change', daUpdateSelection));
      }
    }

    if ((!data.uploads || !data.uploads.length) && (!data.kb_documents || !data.kb_documents.length)) {
      if (loading) { show(loading); loading.textContent = 'Zadne soubory k dispozici. Nahrajte soubory nebo indexujte KB.'; }
    }
  } catch (err) {
    if (loading) { show(loading); loading.textContent = 'Chyba: ' + err.message; }
  }
}

function daUpdateSelection() {
  _daSelectedFiles = [];
  document.querySelectorAll('.da-file-cb:checked').forEach(cb => {
    _daSelectedFiles.push(cb.dataset.path);
  });
  const nextBtn = document.getElementById('da-step1-next');
  if (nextBtn) nextBtn.disabled = _daSelectedFiles.length === 0;
}

function daGoToStep2() {
  hide(document.getElementById('da-step-1'));
  show(document.getElementById('da-step-2'));
}

function daGoToStep1() {
  hide(document.getElementById('da-step-2'));
  show(document.getElementById('da-step-1'));
}

async function daSubmitAnalysis() {
  const task = getVal('da-task');
  if (!task.trim()) {
    showToast('Zadej ukol pro analyzu', 'error');
    return;
  }

  const profile = getVal('da-profile') || 'general';
  const language = getVal('da-language') || 'cs';

  const submitBtn = document.getElementById('da-step2-submit');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const res = await fetch('/api/document-analysis/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_paths: _daSelectedFiles,
        task_description: task,
        llm_profile: profile,
        language: language,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();

    // Show step 3
    hide(document.getElementById('da-step-2'));
    show(document.getElementById('da-step-3'));

    const info = document.getElementById('da-result-info');
    if (info) {
      info.innerHTML = `
        <div style="background:#1a2332;border:1px solid #2d3348;border-radius:8px;padding:1rem">
          <div style="color:#4ade80;font-weight:600;margin-bottom:0.5rem">Job vytvoren</div>
          <div><strong>Nazev:</strong> ${escHtml(data.title)}</div>
          <div><strong>ID:</strong> <code>${escHtml(data.job_id)}</code></div>
          <div><strong>Status:</strong> ${escHtml(data.status)}</div>
          <div><strong>Souboru:</strong> ${data.estimated_files}</div>
        </div>
      `;
    }

    showToast('Analyza spustena', 'success');
  } catch (err) {
    showToast('Chyba: ' + err.message, 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

/* ============================================================
   JOB DETAIL ENHANCEMENTS (media_ingest, report, doc analysis)
   ============================================================ */

function renderMediaIngestDetail(job) {
  const meta = job.meta || {};
  const outputs = meta.outputs || (job.meta && job.meta.result_outputs) || {};
  let html = '';

  if (meta.post_analysis_job_id) {
    html += `<div class="job-detail-row"><span class="job-detail-label">Chained analysis:</span>
      <a href="#" onclick="showJobDetail('${escHtml(meta.post_analysis_job_id)}');return false;" style="color:#60a5fa">${escHtml(meta.post_analysis_job_id)}</a></div>`;
  }

  if (job.status === 'succeeded') {
    html += `<div style="margin-top:0.75rem;display:flex;gap:0.5rem;flex-wrap:wrap">`;

    const transcriptPath = outputs.transcript_txt;
    if (transcriptPath) {
      html += `<button class="btn btn--secondary btn--small" onclick="viewArtifact('${escHtml(transcriptPath)}')">Zobrazit transcript</button>`;
    }

    const segmentsPath = outputs.transcript_segments;
    if (segmentsPath) {
      html += `<button class="btn btn--ghost btn--small" onclick="viewArtifact('${escHtml(segmentsPath)}')">Segmenty</button>`;
    }

    html += `</div>`;
  }

  return html;
}

function renderDocAnalysisDetail(job) {
  const meta = job.meta || {};
  const outputs = meta.outputs || {};
  let html = '';

  const reportPath = outputs.report_md;
  if (reportPath) {
    html += `<div class="job-detail-row"><span class="job-detail-label">Report:</span>
      <a href="#" onclick="viewArtifact('${escHtml(reportPath)}');return false;" style="color:#60a5fa">${escHtml(reportPath)}</a></div>`;
  }

  return html;
}

function renderReportDetail(job) {
  const meta = job.meta || {};
  const outputs = meta.outputs || {};
  let html = '<div style="margin-top:0.5rem">';

  for (const [fmt, path] of Object.entries(outputs)) {
    if (fmt.endsWith('_error')) continue;
    html += `<div class="job-detail-row"><span class="job-detail-label">${escHtml(fmt.toUpperCase())}:</span>
      <a href="#" onclick="viewArtifact('${escHtml(path)}');return false;" style="color:#60a5fa">${escHtml(path)}</a></div>`;
  }

  html += '</div>';
  return html;
}

async function viewArtifact(relativePath) {
  // Open artifact in a new tab by fetching from the data directory
  // For text files, show in a modal; for HTML/PDF, open directly
  const ext = relativePath.split('.').pop().toLowerCase();

  if (ext === 'html' || ext === 'pdf') {
    window.open('/api/files/artifact?path=' + encodeURIComponent(relativePath), '_blank');
    return;
  }

  try {
    const res = await fetch('/api/files/artifact?path=' + encodeURIComponent(relativePath));
    if (!res.ok) throw new Error(await res.text());
    const text = await res.text();

    // Show in job detail area
    const content = document.getElementById('job-detail-content');
    if (content) {
      const existing = content.querySelector('.artifact-viewer');
      if (existing) existing.remove();

      const viewer = document.createElement('div');
      viewer.className = 'artifact-viewer';
      viewer.style.cssText = 'margin-top:1rem;background:#1a1d27;border:1px solid #2d3348;border-radius:8px;padding:1rem;max-height:400px;overflow:auto';
      viewer.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
        <strong style="color:#94a3b8">${escHtml(relativePath)}</strong>
        <button class="btn btn--ghost btn--small" onclick="this.closest('.artifact-viewer').remove()">Zavrit</button>
      </div>
      <pre style="white-space:pre-wrap;font-size:0.8rem;color:#e2e8f0">${escHtml(text)}</pre>`;
      content.appendChild(viewer);
    }
  } catch (err) {
    showToast('Chyba: ' + err.message, 'error');
  }
}

async function createReportFromJob(sourceJobId, format) {
  try {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'report_generation',
        title: `Report (${format}) z analyzy`,
        input_summary: `Generovani ${format} reportu z job ${sourceJobId}`,
        payload: {
          source_job_id: sourceJobId,
          output_formats: [format],
          title: 'Document Analysis Report',
          template: 'general',
        },
        priority: 'normal',
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    showToast(`Report job vytvoren (${format})`, 'success');
    loadJobs();
  } catch (err) {
    showToast('Chyba: ' + err.message, 'error');
  }
}

/* ============================================================
   OVERNIGHT JOBS TAB
   ============================================================ */
async function loadOvernightStatus() {
  const overview = document.getElementById('overnight-status-overview');
  const kbBody = document.getElementById('overnight-kb-body');
  const gitBody = document.getElementById('overnight-git-body');
  const summaryBody = document.getElementById('overnight-summary-body');

  try {
    const resp = await fetch('/api/overnight/status');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    // C1: Status overview panel
    if (overview) {
      const windowStatus = data.is_night_window
        ? `<span class="badge badge--green">${t('overnight_active')}</span>`
        : `<span class="badge badge--gray">${t('overnight_inactive')}</span>`;
      const windowRange = data.night_window
        ? `${data.night_window.start} – ${data.night_window.end}`
        : '22:00 – 06:00';
      overview.innerHTML = `
        <div class="overnight-overview-grid">
          <div class="overnight-overview-item">
            <span class="overnight-overview-label">${t('overnight_window')}</span>
            <span>${windowStatus} <span class="hint-text">(${escHtml(windowRange)})</span></span>
          </div>
          <div class="overnight-overview-item">
            <span class="overnight-overview-label">${t('overnight_next')}</span>
            <span>${escHtml(data.next_scheduled || '-')}</span>
          </div>
        </div>
      `;
    }

    // C2: Last run cards
    const lastRun = data.last_run || {};
    _renderOvernightJobCard(kbBody, lastRun.kb_reindex, 'kb_reindex');
    _renderOvernightJobCard(gitBody, lastRun.git_sweep, 'git_sweep');
    _renderOvernightJobCard(summaryBody, lastRun.nightly_summary, 'nightly_summary');

  } catch (err) {
    if (overview) overview.innerHTML = `<p class="empty-state">Chyba: ${escHtml(err.message)}</p>`;
  }
}

function _renderOvernightJobCard(el, runData, jobType) {
  if (!el) return;

  const runBtn = `<button class="btn btn--ghost btn--small overnight-run-btn" data-job="${escHtml(jobType)}" style="margin-top:0.5rem">Spustit nyni</button>`;

  if (!runData) {
    el.innerHTML = `<p class="empty-state">${t('overnight_waiting')}</p>${runBtn}`;
    _bindOvernightRunBtn(el);
    return;
  }
  const date = runData.date || '-';
  const ts = runData.timestamp ? new Date(runData.timestamp).toLocaleString() : '';
  let detail = '';
  if (jobType === 'nightly_summary' && runData.preview) {
    detail = `<p class="hint-text" style="margin-top:0.5rem">${escHtml(runData.preview)}</p>`;
  } else if (runData.result) {
    const resultText = typeof runData.result === 'string'
      ? runData.result
      : JSON.stringify(runData.result);
    detail = `<p class="hint-text" style="margin-top:0.5rem">${escHtml(resultText.substring(0, 300))}</p>`;
  }
  el.innerHTML = `
    <div class="overnight-job-status">
      <span class="badge badge--green">${t('overnight_done')}</span>
      <span class="hint-text">${escHtml(date)}</span>
    </div>
    ${ts ? `<p class="hint-text" style="font-size:0.7rem">${escHtml(ts)}</p>` : ''}
    ${detail}
    ${runBtn}
  `;
  _bindOvernightRunBtn(el);
}

function _bindOvernightRunBtn(container) {
  const btn = container.querySelector('.overnight-run-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const jobName = btn.dataset.job;
    btn.disabled = true;
    btn.textContent = 'Spouštím...';
    try {
      const resp = await fetch(`/api/overnight/run/${jobName}`, { method: 'POST' });
      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json();
      showToast(`Job ${jobName} zařazen (${data.job_id})`, 'success');
      btn.textContent = 'Zařazeno';
    } catch (err) {
      showToast(`Chyba: ${err.message}`, 'error');
      btn.disabled = false;
      btn.textContent = 'Spustit nyni';
    }
  });
}


/* ============================================================
   KNOWLEDGE BASE – Upload, Overview, Collections
   ============================================================ */

function bindKnowledgeBaseEvents() {
  const dropzone = document.getElementById('kb-dropzone');
  const fileInput = document.getElementById('kb-file-input');
  const browseBtn = document.getElementById('kb-browse-btn');
  const refreshBtn = document.getElementById('kb-refresh-overview');

  if (!dropzone) return;

  // Browse button
  if (browseBtn) browseBtn.addEventListener('click', (e) => { e.preventDefault(); fileInput.click(); });

  // File input change
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) handleKBUpload(fileInput.files);
  });

  // Drag & drop
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('kb-dropzone--active'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('kb-dropzone--active'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('kb-dropzone--active');
    if (e.dataTransfer.files.length > 0) handleKBUpload(e.dataTransfer.files);
  });

  // Mode selector styling
  document.querySelectorAll('.kb-mode-option input').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.kb-mode-option').forEach(opt => opt.classList.remove('kb-mode-option--active'));
      radio.closest('.kb-mode-option').classList.add('kb-mode-option--active');
    });
  });

  // Refresh button
  if (refreshBtn) refreshBtn.addEventListener('click', loadKBOverview);
}


async function handleKBUpload(fileList) {
  const progressEl = document.getElementById('kb-upload-progress');
  const statusEl = document.getElementById('kb-upload-status');
  const fillEl = document.getElementById('kb-progress-fill');
  const resultsEl = document.getElementById('kb-upload-results');
  const fileInput = document.getElementById('kb-file-input');

  const mode = document.querySelector('input[name="kb-upload-mode"]:checked')?.value || 'index';

  show(progressEl);
  hide(resultsEl);
  statusEl.textContent = `Nahravám ${fileList.length} soubor${fileList.length > 1 ? 'ů' : ''}...`;
  fillEl.style.width = '10%';

  const formData = new FormData();
  formData.append('mode', mode);
  formData.append('collection', 'default');
  for (const file of fileList) {
    formData.append('files', file);
  }

  try {
    fillEl.style.width = '40%';

    const resp = await fetch('/api/knowledge/upload/batch', {
      method: 'POST',
      body: formData,
    });

    fillEl.style.width = '80%';

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ detail: `HTTP ${resp.status}` }));
      throw new Error(err.detail || `HTTP ${resp.status}`);
    }

    const data = await resp.json();
    fillEl.style.width = '100%';

    // Render results
    renderKBUploadResults(data, mode);

    const successCount = data.uploaded;
    const errorCount = data.results.filter(r => r.error).length;
    if (errorCount > 0) {
      showToast(`Nahráno: ${successCount}, chyby: ${errorCount}`, 'warning');
    } else {
      showToast(`Úspěšně nahráno ${successCount} souborů`, 'success');
    }

    // Refresh overview
    setTimeout(() => loadKBOverview(), 1000);

  } catch (err) {
    console.error('KB upload failed:', err);
    showToast(`Upload selhal: ${err.message}`, 'error');
    resultsEl.innerHTML = `<div class="kb-result-error">${escHtml(err.message)}</div>`;
    show(resultsEl);
  } finally {
    setTimeout(() => hide(progressEl), 2000);
    fileInput.value = '';
  }
}


function renderKBUploadResults(data, mode) {
  const resultsEl = document.getElementById('kb-upload-results');
  if (!resultsEl) return;

  const modeLabel = mode === 'index' ? 'Indexace' : 'Analýza';
  let html = `<div class="kb-results-header">${modeLabel}: ${data.uploaded} souborů nahráno</div>`;
  html += '<div class="kb-results-list">';

  for (const r of data.results) {
    if (r.error) {
      html += `
        <div class="kb-result-item kb-result-item--error">
          <span class="kb-result-icon">✗</span>
          <div class="kb-result-body">
            <span class="kb-result-name">${escHtml(r.file)}</span>
            <div class="kb-result-error-detail">${escHtml(r.error)}</div>
          </div>
        </div>`;
    } else if (r.job_id) {
      html += `
        <div class="kb-result-item kb-result-item--success">
          <span class="kb-result-icon">✓</span>
          <div class="kb-result-body">
            <span class="kb-result-name">${escHtml(r.file)}</span>
            <span class="kb-result-detail">Indexace spuštěna</span>
          </div>
          <button class="btn btn--ghost btn--small" onclick="showJobDetail('${escHtml(r.job_id)}');switchTab('jobs')">Otevřít job</button>
        </div>`;
    } else if (r.preview) {
      html += `
        <div class="kb-result-item kb-result-item--preview">
          <span class="kb-result-icon">🔍</span>
          <div class="kb-result-body">
            <span class="kb-result-name">${escHtml(r.file)}</span>
            <span class="kb-result-detail">${r.chars} znaků, ${r.pages || '?'} stran</span>
            <div class="kb-result-preview">${escHtml(r.preview)}</div>
          </div>
          <button class="btn btn--ghost btn--small" onclick="navigator.clipboard.writeText(${JSON.stringify(r.preview || '')}).then(()=>showToast('Zkopírováno','success'))">Kopírovat</button>
        </div>`;
    }
  }

  html += '</div>';

  // Global action link
  if (mode === 'index') {
    html += `<div style="margin-top:0.5rem"><button class="btn btn--ghost btn--small" onclick="switchTab('jobs')">Otevřít Joby →</button></div>`;
  }

  resultsEl.innerHTML = html;
  show(resultsEl);
}


async function loadKBOverview() {
  const docsEl = document.getElementById('kb-total-docs');
  const chunksEl = document.getElementById('kb-total-chunks');
  const collectionsEl = document.getElementById('kb-total-collections');
  const listEl = document.getElementById('kb-collections-list');
  const emptyEl = document.getElementById('kb-empty-state');

  try {
    const resp = await fetch('/api/knowledge/overview');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    docsEl.textContent = data.total_documents || 0;
    chunksEl.textContent = data.total_chunks || 0;
    collectionsEl.textContent = data.total_collections || 0;

    if (data.total_documents === 0) {
      listEl.innerHTML = '';
      listEl.appendChild(emptyEl || createEmptyState());
      return;
    }

    let html = '';
    for (const col of data.collections) {
      // File types badges
      const typeBadges = col.file_types
        ? Object.entries(col.file_types)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([ext, cnt]) => `<span class="kb-type-badge">${escHtml(ext)} (${cnt})</span>`)
            .join('')
        : '';

      const lastUpdate = col.last_updated
        ? new Date(col.last_updated).toLocaleString('cs-CZ')
        : 'Neznámý';

      html += `
        <div class="kb-collection-card">
          <div class="kb-collection-header">
            <h3 class="kb-collection-name">${escHtml(col.name)}</h3>
            <div class="kb-collection-meta">
              <span>${col.document_count} dokumentů</span>
              <span>${col.total_chunks} chunků</span>
            </div>
          </div>
          <div class="kb-collection-types">${typeBadges}</div>
          <div class="kb-collection-updated">Poslední aktualizace: ${lastUpdate}</div>
          ${col.documents && col.documents.length > 0 ? renderKBDocumentList(col.documents) : ''}
        </div>
      `;
    }

    listEl.innerHTML = html;

    // Bind expand/collapse for doc lists
    listEl.querySelectorAll('.kb-doc-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const list = btn.nextElementSibling;
        if (list) list.classList.toggle('hidden');
        btn.textContent = list && list.classList.contains('hidden') ? '▶ Zobrazit dokumenty' : '▼ Skrýt dokumenty';
      });
    });

  } catch (err) {
    console.error('KB overview failed:', err);
  }
}


function renderKBDocumentList(documents) {
  let html = `<button class="btn-link kb-doc-toggle">▶ Zobrazit dokumenty</button>`;
  html += '<div class="kb-doc-list hidden">';

  for (const doc of documents) {
    const typeIcon = getFileTypeIcon(doc.type);
    html += `
      <div class="kb-doc-item">
        <span class="kb-doc-icon">${typeIcon}</span>
        <span class="kb-doc-name" title="${escHtml(doc.file_path)}">${escHtml(doc.filename)}</span>
        <span class="kb-doc-type">${escHtml(doc.type)}</span>
        <span class="kb-doc-chunks">${doc.chunks} ch.</span>
      </div>`;
  }

  html += '</div>';
  return html;
}


function getFileTypeIcon(type) {
  const icons = {
    pdf: '&#128196;', docx: '&#128196;', xlsx: '&#128202;',
    txt: '&#128221;', md: '&#128221;', py: '&#128187;',
    js: '&#128187;', ts: '&#128187;', json: '&#128187;',
    html: '&#127760;', css: '&#127912;',
    png: '&#128247;', jpg: '&#128247;', jpeg: '&#128247;',
  };
  return icons[type] || '&#128196;';
}


/* ============================================================
   RESIDENT AGENT DASHBOARD
   ============================================================ */
let _residentPollTimer = null;
let _residentDashboardData = null;

function bindResidentEvents() {
  const startBtn = document.getElementById('resident-start-btn');
  const stopBtn = document.getElementById('resident-stop-btn');
  const taskSubmitBtn = document.getElementById('resident-task-submit-btn');
  const taskNameInput = document.getElementById('resident-task-name');
  const reasoningBtn = document.getElementById('resident-trigger-reasoning-btn');

  if (startBtn) startBtn.addEventListener('click', residentStart);
  if (stopBtn) stopBtn.addEventListener('click', residentStop);
  if (taskSubmitBtn) taskSubmitBtn.addEventListener('click', residentSubmitTask);
  if (reasoningBtn) reasoningBtn.addEventListener('click', residentTriggerReasoning);

  // Enable submit only when name is filled
  if (taskNameInput) {
    taskNameInput.addEventListener('input', () => {
      if (taskSubmitBtn) taskSubmitBtn.disabled = !taskNameInput.value.trim();
    });
  }
}

async function loadResidentDashboard() {
  const loading = document.getElementById('resident-loading');
  const content = document.getElementById('resident-dashboard-content');
  const errorEl = document.getElementById('resident-error');
  if (loading) show(loading);
  if (errorEl) hide(errorEl);

  try {
    const res = await fetch('/api/resident/dashboard');
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    _residentDashboardData = data;
    renderResidentDashboard(data);
    if (content) show(content);
  } catch (err) {
    showToast('Chyba dashboardu: ' + err.message, 'error');
    // Show inline error with retry – uživatel vidí příčinu místo prázdné stránky
    if (errorEl) {
      errorEl.innerHTML = `
        <div class="resident-error-box">
          <span>Nepodařilo se načíst dashboard: ${escHtml(err.message)}</span>
          <button class="btn btn--ghost btn--small" onclick="loadResidentDashboard()">Zkusit znovu</button>
        </div>`;
      show(errorEl);
    }
    if (content) hide(content);
  } finally {
    if (loading) hide(loading);
  }

  // Poll only when tab is visible AND page isn't hidden – šetří CPU/battery
  clearInterval(_residentPollTimer);
  _residentPollTimer = setInterval(() => {
    const panel = document.getElementById('tab-resident');
    const tabVisible = panel && !panel.classList.contains('hidden');
    if (tabVisible && document.visibilityState !== 'hidden') {
      loadResidentDashboard();
    } else if (!tabVisible) {
      clearInterval(_residentPollTimer);
    }
  }, 15000);
}

function renderResidentDashboard(data) {
  // Status indicator
  const indicator = document.getElementById('resident-status-indicator');
  const statusText = document.getElementById('resident-status-text');
  if (indicator) {
    indicator.className = 'resident-status-indicator resident-status--' + data.status;
  }
  const statusLabels = { running: 'Běží', stopped: 'Zastaven', error: 'Chyba' };
  if (statusText) statusText.textContent = statusLabels[data.status] || data.status;

  // Uptime
  const uptimeEl = document.getElementById('resident-uptime');
  if (uptimeEl) {
    uptimeEl.textContent = data.status !== 'stopped' ? formatUptime(data.uptime_seconds) : '';
  }

  // Heartbeat badge
  const hbEl = document.getElementById('resident-heartbeat');
  if (hbEl) {
    if (data.status !== 'stopped') {
      show(hbEl);
      hbEl.className = 'resident-heartbeat resident-hb--' + data.heartbeat_status;
      hbEl.textContent = data.heartbeat_status;
    } else {
      hide(hbEl);
    }
  }

  // Start/Stop buttons
  const startBtn = document.getElementById('resident-start-btn');
  const stopBtn = document.getElementById('resident-stop-btn');
  if (startBtn) startBtn.disabled = data.status === 'running';
  if (stopBtn) stopBtn.disabled = data.status === 'stopped';

  // Current task
  const taskCard = document.getElementById('resident-current-task-card');
  const taskInfo = document.getElementById('resident-current-task-info');
  if (data.current_task) {
    if (taskCard) show(taskCard);
    if (taskInfo) {
      taskInfo.innerHTML = `
        <div class="resident-current-task-detail">
          <span class="job-status-badge job-status--running">${escHtml(data.current_task.status)}</span>
          <strong>${escHtml(data.current_task.title)}</strong>
          <span class="text-muted">${data.current_task.started_at ? formatJobDate(data.current_task.started_at) : ''}</span>
        </div>`;
    }
  } else {
    if (taskCard) hide(taskCard);
  }

  // Stat cards
  const stats = data.stats_24h || {};
  const totalEl = document.getElementById('resident-stat-total');
  const successEl = document.getElementById('resident-stat-success');
  const durationEl = document.getElementById('resident-stat-duration');
  if (totalEl) totalEl.textContent = stats.tasks_total ?? '-';
  if (successEl) successEl.textContent = stats.tasks_total > 0 ? Math.round(stats.success_rate * 100) + '%' : '-';
  if (durationEl) durationEl.textContent = stats.avg_task_duration_s > 0 ? stats.avg_task_duration_s + ' s' : '-';

  // Alerts
  const alertsCard = document.getElementById('resident-alerts-card');
  const alertsList = document.getElementById('resident-alerts-list');
  if (data.alerts && data.alerts.length > 0) {
    if (alertsCard) show(alertsCard);
    if (alertsList) {
      alertsList.innerHTML = data.alerts.map(a =>
        `<div class="resident-alert-item">${escHtml(a)}</div>`
      ).join('');
    }
  } else {
    if (alertsCard) hide(alertsCard);
  }

  // Recent tasks table
  renderResidentRecentTasks(data.recent_tasks || []);

  // Mode hint + autonomous logbook
  updateResidentModeHint(data.resident_mode || 'advisor');
  renderResidentAutoLogbook(data);

  // Brain orchestrator sections
  renderResidentSuggestions(data);
  renderResidentMissions(data.missions || []);
  renderResidentReflections();
  loadResidentReasoningHistory();
}

function renderResidentRecentTasks(tasks) {
  const container = document.getElementById('resident-recent-tasks');
  const emptyEl = document.getElementById('resident-tasks-empty');
  if (!container) return;

  if (!tasks.length) {
    container.innerHTML = '';
    if (emptyEl) { container.appendChild(emptyEl); show(emptyEl); }
    return;
  }
  if (emptyEl) hide(emptyEl);

  container.innerHTML = `
    <table class="jobs-table">
      <thead>
        <tr>
          <th>Název</th>
          <th>Stav</th>
          <th>Trvání</th>
          <th>Vytvořeno</th>
        </tr>
      </thead>
      <tbody>
        ${tasks.map(t => `
          <tr class="jobs-row" onclick="showJobDetail('${escHtml(t.id)}')" style="cursor:pointer">
            <td>${escHtml(t.title)}</td>
            <td><span class="job-status-badge job-status--${t.status}">${escHtml(t.status)}</span></td>
            <td>${t.duration_s != null ? formatJobDuration(t.started_at, t.finished_at) : '-'}</td>
            <td class="jobs-cell-date">${formatJobDate(t.created_at)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

function formatUptime(seconds) {
  if (!seconds || seconds <= 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return h + 'h ' + m + 'm';
  if (m > 0) return m + 'm ' + s + 's';
  return s + 's';
}

async function residentStart() {
  const startBtn = document.getElementById('resident-start-btn');
  if (startBtn) startBtn.disabled = true;
  try {
    const res = await fetch('/api/resident/start', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Failed');
    showToast(data.message || 'Agent spuštěn', 'success');
    await loadResidentDashboard();
  } catch (err) {
    showToast('Chyba: ' + err.message, 'error');
    if (startBtn) startBtn.disabled = false;
  }
}

async function residentStop() {
  const stopBtn = document.getElementById('resident-stop-btn');
  if (stopBtn) stopBtn.disabled = true;
  try {
    const res = await fetch('/api/resident/stop', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Failed');
    showToast(data.message || 'Agent zastaven', 'success');
    await loadResidentDashboard();
  } catch (err) {
    showToast('Chyba: ' + err.message, 'error');
    if (stopBtn) stopBtn.disabled = false;
  }
}

async function residentSubmitTask() {
  const nameInput = document.getElementById('resident-task-name');
  const descInput = document.getElementById('resident-task-desc');
  const submitBtn = document.getElementById('resident-task-submit-btn');
  const spinner = document.getElementById('resident-task-spinner');
  const name = (nameInput && nameInput.value || '').trim();
  if (!name) return;

  setLoading(submitBtn, spinner, true);
  try {
    const res = await fetch('/api/resident/task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: name, description: (descInput && descInput.value || '').trim() }),
    });
    if (!res.ok) throw new Error(await res.text());
    showToast('Úkol přidán', 'success');
    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
    await loadResidentDashboard();
  } catch (err) {
    showToast('Chyba: ' + err.message, 'error');
  } finally {
    setLoading(submitBtn, spinner, false);
  }
}

function handleResidentTick(msg) {
  // Live update status indicator from WS
  const indicator = document.getElementById('resident-status-indicator');
  const statusText = document.getElementById('resident-status-text');
  if (indicator && msg.status) {
    const mapped = msg.status === 'idle' ? 'running' : msg.status === 'thinking' || msg.status === 'executing' ? 'running' : msg.status;
    indicator.className = 'resident-status-indicator resident-status--' + mapped;
  }
  if (statusText && msg.status) {
    const labels = { idle: 'Běží', thinking: 'Přemýšlí...', executing: 'Provádí akci', error: 'Chyba' };
    statusText.textContent = labels[msg.status] || msg.status;
  }
  // Update heartbeat badge live
  const hbEl = document.getElementById('resident-heartbeat');
  if (hbEl && msg.heartbeat_status) {
    show(hbEl);
    hbEl.className = 'resident-heartbeat resident-hb--' + msg.heartbeat_status;
    hbEl.textContent = msg.heartbeat_status;
  }
}

function handleResidentAction(msg) {
  // Show toast for completed actions
  if (msg.action) {
    showToast(`Resident: ${msg.action}`, 'info', 3000);
  }
  // Refresh dashboard if the tab is visible
  const panel = document.getElementById('tab-resident');
  if (panel && !panel.classList.contains('hidden')) {
    loadResidentDashboard();
  }
}

/* ============================================================
   RESIDENT BRAIN ORCHESTRATOR – suggestions, missions, reflections
   ============================================================ */

async function residentSetMode(mode) {
  try {
    const res = await fetch('/api/resident/mode', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    showToast(data.message || 'Režim změněn', 'success');
    await loadResidentDashboard();
  } catch (err) {
    showToast('Chyba: ' + err.message, 'error');
  }
}

function renderResidentSuggestions(data) {
  const card = document.getElementById('resident-suggestions-card');
  const list = document.getElementById('resident-suggestions-list');
  const mode = data.resident_mode || 'advisor';
  const modeSelect = document.getElementById('resident-mode-select');
  if (modeSelect) modeSelect.value = mode;

  if (mode === 'observer' || !data.suggestions_count) {
    if (card) hide(card);
    return;
  }

  // Fetch full suggestions
  fetch('/api/resident/suggestions?limit=3')
    .then(r => r.json())
    .then(result => {
      const suggestions = result.suggestions || [];
      if (!suggestions.length) { if (card) hide(card); return; }
      if (card) show(card);
      if (!list) return;

      let html = '';
      suggestions.forEach(s => {
        html += `<div class="resident-suggestion-group" style="margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:8px">
          <div class="text-muted" style="font-size:0.8em">${s.created_at ? new Date(s.created_at).toLocaleString('cs') : ''}</div>
          <div style="font-size:0.85em;color:var(--text-secondary);margin-bottom:4px">${escHtml(s.context_summary || '')}</div>`;

        (s.actions || []).forEach(a => {
          const executed = (s.executed_action_ids || []).includes(a.id);
          const priorityColors = { high: '#e74c3c', medium: '#f39c12', low: '#95a5a6' };
          const color = priorityColors[a.priority] || '#95a5a6';
          html += `<div class="resident-suggestion-item" style="display:flex;align-items:center;gap:8px;padding:6px 0">
            <span style="background:${color};color:#fff;padding:2px 8px;border-radius:4px;font-size:0.75em">${escHtml(a.priority)}</span>
            <span style="background:var(--bg-secondary);padding:2px 8px;border-radius:4px;font-size:0.75em">${escHtml(a.action_type)}</span>
            <strong style="flex:1">${escHtml(a.title)}</strong>`;

          if (executed) {
            const autoExec = (s.auto_executed_ids || []).includes(a.id);
            html += autoExec
              ? `<span class="suggestion-exec-badge suggestion-exec--auto">Auto</span>`
              : `<span class="suggestion-exec-badge suggestion-exec--manual">Ručně</span>`;
          } else if (mode === 'advisor' || mode === 'autonomous') {
            html += `<button class="btn btn--primary btn--small" onclick="residentAcceptSuggestion('${s.id}','${a.id}')">Spustit</button>`;
          }
          html += `</div>
            <div style="font-size:0.85em;color:var(--text-secondary);padding-left:24px">${escHtml(a.description)}</div>`;
        });
        html += '</div>';
      });
      list.innerHTML = html;
    })
    .catch(() => { if (card) hide(card); });
}

async function residentAcceptSuggestion(suggestionId, actionId) {
  try {
    const res = await fetch(`/api/resident/suggestions/${suggestionId}/accept?action_id=${actionId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(await res.text());
    showToast('Akce přijata', 'success');
    await loadResidentDashboard();
  } catch (err) {
    showToast('Chyba: ' + err.message, 'error');
  }
}

function renderResidentMissions(missions) {
  const list = document.getElementById('resident-missions-list');
  const empty = document.getElementById('resident-missions-empty');
  if (!list) return;

  if (!missions || !missions.length) {
    if (empty) show(empty);
    return;
  }
  if (empty) hide(empty);

  const statusLabels = { planned: 'Naplánováno', in_progress: 'Probíhá', done: 'Hotovo', error: 'Chyba' };
  const statusColors = { planned: 'var(--text-secondary)', in_progress: 'var(--primary)', done: 'var(--success)', error: 'var(--error)' };

  let html = missions.map(m => `
    <div class="resident-mission-item" style="padding:8px 0;border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="color:${statusColors[m.status] || 'inherit'};font-weight:600;font-size:0.85em">${statusLabels[m.status] || m.status}</span>
        <strong style="flex:1">${escHtml(m.goal)}</strong>
        <span class="text-muted" style="font-size:0.8em">${m.current_step}/${m.total_steps} kroků</span>
      </div>
      <div style="margin-top:4px;background:var(--bg-secondary);border-radius:4px;height:6px;overflow:hidden">
        <div style="background:var(--primary);height:100%;width:${m.progress || 0}%;transition:width 0.3s"></div>
      </div>
    </div>
  `).join('');

  // Keep the empty state element but hidden, prepend missions
  list.innerHTML = html + (empty ? `<p class="empty-state hidden" id="resident-missions-empty">Žádné mise</p>` : '');
}

async function residentCreateMission() {
  const input = document.getElementById('resident-mission-goal');
  const goal = (input && input.value || '').trim();
  if (!goal) return;

  try {
    const res = await fetch('/api/resident/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    showToast(`Mise vytvořena (${data.steps_count} kroků)`, 'success');
    if (input) input.value = '';
    await loadResidentDashboard();
  } catch (err) {
    showToast('Chyba: ' + err.message, 'error');
  }
}

function renderResidentReflections() {
  const list = document.getElementById('resident-reflections-list');
  const empty = document.getElementById('resident-reflections-empty');
  if (!list) return;

  fetch('/api/resident/reflections?limit=5')
    .then(r => r.json())
    .then(result => {
      const reflections = result.reflections || [];
      if (!reflections.length) {
        if (empty) show(empty);
        return;
      }
      if (empty) hide(empty);

      list.innerHTML = reflections.map(r => `
        <div style="padding:6px 0;border-bottom:1px solid var(--border)">
          <div style="display:flex;gap:8px;align-items:center">
            <span style="font-size:0.8em;color:var(--text-secondary)">${r.created_at ? new Date(r.created_at).toLocaleString('cs') : ''}</span>
            <span style="font-size:0.8em;background:var(--bg-secondary);padding:2px 6px;border-radius:4px">${escHtml(r.job_type)}</span>
            ${r.useful === true ? '<span style="color:var(--success)">Užitečné</span>' : r.useful === false ? '<span style="color:var(--error)">Neužitečné</span>' : ''}
          </div>
          <ul style="margin:4px 0 0 16px;font-size:0.9em">
            ${r.points.map(p => `<li>${escHtml(p)}</li>`).join('')}
          </ul>
          ${r.recommendation ? `<div style="font-size:0.85em;color:var(--text-secondary);margin-top:2px">Doporučení: ${escHtml(r.recommendation)}</div>` : ''}
        </div>
      `).join('');
    })
    .catch(() => { if (empty) show(empty); });
}

/* ============================================================
   RESIDENT – Reasoning history (tool calling)
   ============================================================ */

async function residentTriggerReasoning() {
  const btn = document.getElementById('resident-trigger-reasoning-btn');
  const spinner = document.getElementById('resident-reasoning-spinner');
  setLoading(btn, spinner, true);
  try {
    const res = await fetch('/api/resident/reasoning', { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
    showToast('Reasoning cycle dokončen', 'success');
    await loadResidentReasoningHistory();
    await loadResidentDashboard();
  } catch (err) {
    showToast('Reasoning selhal: ' + err.message, 'error');
  } finally {
    setLoading(btn, spinner, false);
  }
}

async function loadResidentReasoningHistory() {
  const list = document.getElementById('resident-reasoning-list');
  const empty = document.getElementById('resident-reasoning-empty');
  if (!list) return;

  try {
    const res = await fetch('/api/resident/reasoning?limit=5');
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const cycles = data.cycles || [];

    if (!cycles.length) {
      if (empty) show(empty);
      list.innerHTML = '';
      list.appendChild(empty);
      return;
    }
    if (empty) hide(empty);

    const toolIcons = {
      search_web: '🔍', browse_page: '🌐', kb_search: '📚',
      get_system_stats: '📊', list_jobs: '📋', get_weather: '🌤️',
    };

    list.innerHTML = cycles.reverse().map(c => {
      const time = c.created_at ? new Date(c.created_at).toLocaleString('cs') : '';
      const toolsHtml = (c.tool_calls || []).map(tc => {
        const icon = toolIcons[tc.tool_name] || '🔧';
        const status = tc.ok ? '✓' : '✗';
        const statusClass = tc.ok ? 'reasoning-tool--ok' : 'reasoning-tool--fail';
        const argsStr = Object.entries(tc.arguments || {}).map(([k, v]) => `${k}="${v}"`).join(', ');
        return `<span class="reasoning-tool-badge ${statusClass}" title="${escHtml(JSON.stringify(tc.result || {}).substring(0, 200))}">${icon} ${escHtml(tc.tool_name)}(${escHtml(argsStr)}) ${status} ${tc.duration_ms}ms</span>`;
      }).join('');

      const suggestionsCount = (c.final_suggestions || []).length;

      return `
        <details class="reasoning-cycle-item">
          <summary class="reasoning-cycle-summary">
            <span class="reasoning-cycle-time">${time}</span>
            <span class="reasoning-cycle-model">${escHtml(c.model || '')}</span>
            <span class="reasoning-cycle-stats">${(c.tools_used || []).length} nástrojů · ${suggestionsCount} návrhů · ${c.total_duration_ms || 0}ms</span>
          </summary>
          <div class="reasoning-cycle-detail">
            ${toolsHtml ? `<div class="reasoning-tools-row">${toolsHtml}</div>` : '<div class="text-muted">Žádné nástroje použity</div>'}
            ${(c.final_suggestions || []).length ? `
              <div class="reasoning-suggestions-mini">
                ${c.final_suggestions.map(s => `
                  <div class="reasoning-suggestion-mini-item">
                    <span class="priority-dot priority-dot--${s.priority}"></span>
                    <strong>${escHtml(s.title)}</strong>
                    <span class="text-muted">${escHtml(s.action_type)}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </details>`;
    }).join('');
  } catch (err) {
    console.error('Reasoning history load failed:', err);
  }
}

/* ============================================================
   RESIDENT – Mode hints + autonomous logbook
   ============================================================ */

const _modeHints = {
  observer: 'Jen sleduje, nic nespouští',
  advisor: 'Navrhuje akce, ty klikneš Spustit',
  autonomous: 'Spouští bezpečné akce sám',
};
const _modeIcons = {
  observer: '👁️',
  advisor: '🧑‍🏫',
  autonomous: '🤖',
};

function updateResidentModeHint(mode) {
  const hint = document.getElementById('resident-mode-hint');
  if (hint) hint.textContent = _modeHints[mode] || '';

  const icon = document.getElementById('resident-mode-icon');
  if (icon) icon.textContent = _modeIcons[mode] || '🤖';

  const warning = document.getElementById('resident-autonomous-warning');
  if (warning) {
    if (mode === 'autonomous') {
      warning.classList.remove('hidden');
    } else {
      warning.classList.add('hidden');
    }
  }
}

// ── Panic / toggle autonomy ──────────────────────────────────────────────────
async function toggleResidentAutonomy() {
  const btn = document.getElementById('resident-panic-btn');
  const modeSelect = document.getElementById('resident-mode-select');
  const currentMode = modeSelect ? modeSelect.value : 'advisor';
  // If currently autonomous → pause (advisor). Otherwise → autonomous.
  const targetMode = currentMode === 'autonomous' ? 'advisor' : 'autonomous';
  const endpoint = targetMode === 'advisor' ? '/api/resident/mode/pause' : '/api/resident/mode/autonomous';

  if (btn) btn.disabled = true;
  try {
    const res = await fetch(endpoint, { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    if (modeSelect) modeSelect.value = data.mode;
    updateResidentModeHint(data.mode);
    // Update button label
    if (btn) {
      if (data.mode === 'autonomous') {
        btn.textContent = '⏸️ Pozastavit autonomii';
        btn.classList.add('btn--danger');
        btn.classList.remove('btn--primary');
      } else {
        btn.textContent = '🤖 Zapnout autonomii';
        btn.classList.remove('btn--danger');
        btn.classList.add('btn--primary');
      }
    }
    showToast(data.message || 'Režim změněn', 'success');
  } catch (e) {
    showToast('Chyba při změně režimu: ' + e.message, 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

// ── Tailscale Funnel status helpers ──────────────────────────────────────────

async function tailscaleRefreshStatus() {
  const badge = document.getElementById('tailscale-status-badge');
  const urlWrap = document.getElementById('tailscale-url-wrap');
  const urlText = document.getElementById('tailscale-url-text');
  if (!badge) return;

  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    const ts = data.tailscale_funnel || {};
    const status = ts.status || 'unknown';

    badge.className = 'badge';
    urlWrap && (urlWrap.style.display = 'none');

    if (status === 'disabled') {
      badge.textContent = '— vypnuto';
      badge.classList.add('badge--neutral');
    } else if (status === 'running') {
      badge.textContent = '● spuštěno';
      badge.classList.add('badge--success');
      if (ts.url && urlWrap && urlText) {
        urlText.textContent = ts.url;
        urlWrap.style.display = 'flex';
      }
    } else if (status === 'stopped') {
      badge.textContent = '○ zastaveno';
      badge.classList.add('badge--warning');
    } else if (status === 'error') {
      badge.textContent = '✕ chyba';
      badge.classList.add('badge--danger');
      badge.title = ts.error || '';
    } else {
      badge.textContent = status;
      badge.classList.add('badge--neutral');
    }
  } catch (err) {
    if (badge) { badge.textContent = '— nelze načíst'; badge.className = 'badge badge--neutral'; }
  }
}

function tailscaleCopyUrl() {
  const urlText = document.getElementById('tailscale-url-text');
  if (!urlText || !urlText.textContent) return;
  navigator.clipboard.writeText(urlText.textContent)
    .then(() => showToast('URL zkopírována do schránky', 'success'))
    .catch(() => showToast('Kopírování selhalo', 'error'));
}

// ── System controls (restart / update) ───────────────────────────────────────
async function restartApp() {
  const btn = document.getElementById('restart-app-btn');
  const statusEl = document.getElementById('restart-status');
  if (!confirm('Opravdu restartovat AI Home Hub? Backend se na ~30 s nedostupný.')) return;
  if (btn) btn.disabled = true;
  if (statusEl) statusEl.textContent = 'Restart zahájen…';
  try {
    const res = await fetch('/api/admin/restart', { method: 'POST' });
    const data = await res.json();
    if (statusEl) statusEl.textContent = data.message || 'Restart zahájen';
    showToast('Restart zahájen – backend se vrátí za cca 30 s', 'info');
  } catch (e) {
    if (statusEl) statusEl.textContent = 'Chyba: ' + e.message;
    showToast('Restart selhal: ' + e.message, 'error');
    if (btn) btn.disabled = false;
  }
  // Leave button disabled – backend is restarting and connection will drop
}

async function updateApp() {
  const btn = document.getElementById('update-app-btn');
  const statusEl = document.getElementById('update-status');
  if (!confirm('Stáhnout aktualizace z Gitu a restartovat? Backend bude cca 30 s nedostupný.')) return;
  if (btn) btn.disabled = true;
  if (statusEl) statusEl.textContent = 'Update zahájen…';
  try {
    const res = await fetch('/api/admin/update', { method: 'POST' });
    const data = await res.json();
    if (statusEl) statusEl.textContent = data.message || 'Update zahájen';
    showToast('Update zahájen (git pull + restart)', 'info');
  } catch (e) {
    if (statusEl) statusEl.textContent = 'Chyba: ' + e.message;
    showToast('Update selhal: ' + e.message, 'error');
    if (btn) btn.disabled = false;
  }
}

function renderResidentAutoLogbook(data) {
  const card = document.getElementById('resident-auto-logbook-card');
  const list = document.getElementById('resident-auto-logbook-list');
  if (!card || !list) return;

  const mode = data.resident_mode || 'advisor';
  if (mode !== 'autonomous') { hide(card); return; }

  // Show recent tasks that were auto-executed (resident_task jobs created by autonomous mode)
  const autoTasks = (data.recent_tasks || []).filter(t =>
    t.meta && t.meta.auto_executed
  );

  if (!autoTasks.length) {
    // Still show card in autonomous mode but with hint
    show(card);
    list.innerHTML = '<p class="empty-state">Zatím žádné automatické akce</p>';
    return;
  }

  show(card);
  list.innerHTML = autoTasks.slice(0, 10).map(t => {
    const ok = t.status === 'succeeded';
    return `
      <div class="auto-logbook-item">
        <span class="auto-logbook-status ${ok ? 'auto-logbook--ok' : 'auto-logbook--fail'}">${ok ? '✓' : '✗'}</span>
        <span class="auto-logbook-time">${formatJobDate(t.created_at)}</span>
        <span class="auto-logbook-type">${escHtml(t.type)}</span>
        <span class="auto-logbook-title">${escHtml(t.title)}</span>
      </div>`;
  }).join('');
}

/* ============================================================
   QoL FEATURES – theme, quick prompts, view density, KB filter
   ============================================================ */

function restoreTheme() {
  const saved = localStorage.getItem('ai-hub-theme') || 'dark';
  applyTheme(saved);
}

function applyTheme(theme) {
  const html = document.documentElement;
  if (theme === 'light') {
    html.setAttribute('data-theme', 'light');
  } else {
    html.removeAttribute('data-theme');
  }
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.textContent = theme === 'light' ? '☀️ Světlé' : '🌙 Tmavé';
  }
  localStorage.setItem('ai-hub-theme', theme);
}

function bindQoLFeatures() {
  // ── Theme toggle ──────────────────────────────────────────
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = localStorage.getItem('ai-hub-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // ── Quick prompts ─────────────────────────────────────────
  const quickPromptsBar = document.getElementById('quick-prompts-bar');
  if (quickPromptsBar) {
    quickPromptsBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.quick-prompt-btn');
      if (!btn) return;
      const promptText = btn.dataset.prompt;
      if (!promptText) return;
      const textarea = document.getElementById('chat-input');
      if (textarea) {
        const existing = textarea.value.trim();
        textarea.value = existing ? `${promptText}\n\n${existing}` : promptText + '\n\n';
        textarea.focus();
        // Position cursor at end
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        // Auto-resize
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
      }
    });
  }

  // ── View density toggle ───────────────────────────────────
  const viewToggleBtn = document.getElementById('view-toggle-btn');
  if (viewToggleBtn) {
    const savedCompact = localStorage.getItem('ai-hub-compact') === 'true';
    if (savedCompact) {
      document.body.classList.add('view-compact');
      viewToggleBtn.textContent = '⊞ Standardní';
    }
    viewToggleBtn.addEventListener('click', () => {
      const isCompact = document.body.classList.toggle('view-compact');
      viewToggleBtn.textContent = isCompact ? '⊞ Standardní' : '⊟ Kompaktní';
      localStorage.setItem('ai-hub-compact', isCompact);
    });
  }

  // ── KB type filter ────────────────────────────────────────
  const kbTypeFilter = document.getElementById('kb-type-filter');
  if (kbTypeFilter) {
    kbTypeFilter.addEventListener('change', () => {
      filterKbOverview(kbTypeFilter.value);
    });
  }
}

// Filter KB collections table by media_type (client-side only)
function filterKbOverview(typeFilter) {
  const el = document.getElementById('kb-overview-content');
  if (!el) return;

  const rows = el.querySelectorAll('.kb-collections-table tbody tr');
  if (!rows.length) return;

  rows.forEach(row => {
    if (!typeFilter) {
      row.style.display = '';
      return;
    }
    const typesCell = row.cells[3];
    const text = typesCell ? typesCell.textContent.toLowerCase() : '';
    const matches = _kbTypeMatchesFilter(text, typeFilter);
    row.style.display = matches ? '' : 'none';
  });
}

function _kbTypeMatchesFilter(cellText, filter) {
  const textExts = ['txt', 'md', 'json', 'csv', 'html', 'xml', 'yml', 'yaml', 'py', 'js', 'ts'];
  const pdfExts = ['pdf', 'docx', 'xlsx'];
  const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
  const audioExts = ['mp3', 'mp4', 'wav', 'm4a', 'ogg', 'webm', 'mov'];

  switch (filter) {
    case 'text':  return textExts.some(e => cellText.includes(e));
    case 'pdf':   return pdfExts.some(e => cellText.includes(e));
    case 'image': return imageExts.some(e => cellText.includes(e));
    case 'audio': return audioExts.some(e => cellText.includes(e));
    default: return true;
  }
}

/* ============================================================
   SETUP WIZARD
   ============================================================ */

let _wizardStep = 1;
let _wizardDirs = [];

function showSetupWizard() {
  const overlay = document.getElementById('setup-wizard-overlay');
  if (!overlay) return;
  _wizardStep = 1;
  _wizardDirs = [];
  overlay.classList.add('active');
  _wizardRenderStep(1);
  document.addEventListener('keydown', _wizardEscHandler);
}

function closeSetupWizard() {
  const overlay = document.getElementById('setup-wizard-overlay');
  if (overlay) overlay.classList.remove('active');
  document.removeEventListener('keydown', _wizardEscHandler);
  // Mark setup complete so wizard doesn't reappear
  fetch('/api/setup/complete', { method: 'POST' }).catch(() => {});
}

function _wizardEscHandler(e) {
  if (e.key === 'Escape') closeSetupWizard();
}

function _wizardRenderStep(n) {
  _wizardStep = n;
  // Update step indicators
  document.querySelectorAll('.wizard-step').forEach(el => {
    const s = parseInt(el.dataset.step, 10);
    el.classList.toggle('wizard-step--active', s === n);
    el.classList.toggle('wizard-step--done', s < n);
  });
  // Show/hide panes
  document.querySelectorAll('.wizard-pane').forEach(el => {
    el.style.display = parseInt(el.dataset.pane, 10) === n ? '' : 'none';
  });
  // Step-specific init
  if (n === 2) _wizardRunChecks();
}

async function _wizardRunChecks() {
  const container = document.getElementById('wizard-checks-list');
  if (!container) return;
  container.innerHTML = '<div class="wizard-check-item"><span class="wizard-check-icon">⏳</span><div class="wizard-check-body"><div class="wizard-check-label">Probíhá kontrola...</div></div></div>';

  try {
    const res = await fetch('/api/setup/status');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const checks = data.checks || {};

    const items = [
      { key: 'ollama_running',    label: 'Ollama běží' },
      { key: 'required_models',   label: 'Potřebné modely' },
      { key: 'chromadb_writable', label: 'ChromaDB zapisovatelná' },
      { key: 'filesystem_dirs',   label: 'Povolené adresáře' },
    ];

    container.innerHTML = items.map(({ key, label }) => {
      const item = checks[key] || {};
      const icon = item.ok ? '✅' : '❌';
      const cls  = item.ok ? 'ok' : 'fail';
      const msg  = item.message || '';
      const missing = (item.missing || []).map(m => `<span class="wizard-dir-chip">${escHtml(m)}</span>`).join(' ');
      return `
        <div class="wizard-check-item wizard-check-item--${cls}">
          <span class="wizard-check-icon">${icon}</span>
          <div class="wizard-check-body">
            <div class="wizard-check-label">${escHtml(label)}</div>
            ${msg ? `<div class="wizard-check-msg">${escHtml(msg)}</div>` : ''}
            ${missing ? `<div class="wizard-check-missing">${missing}</div>` : ''}
          </div>
        </div>`;
    }).join('');
  } catch {
    container.innerHTML = '<div class="wizard-check-item wizard-check-item--fail"><span class="wizard-check-icon">❌</span><div class="wizard-check-body"><div class="wizard-check-label">Chyba při kontrole prostředí</div></div></div>';
  }
}

function _wizardRenderDirs() {
  const list = document.getElementById('wizard-dirs-list');
  if (!list) return;
  if (!_wizardDirs.length) {
    list.innerHTML = '<span style="color:var(--text-dim);font-size:0.85rem">Zatím žádné adresáře.</span>';
    return;
  }
  list.innerHTML = _wizardDirs.map((d, i) =>
    `<span class="wizard-dir-chip">${escHtml(d)} <button class="wizard-dir-remove" data-idx="${i}" title="Odebrat">×</button></span>`
  ).join('');
  list.querySelectorAll('.wizard-dir-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      _wizardDirs.splice(parseInt(btn.dataset.idx, 10), 1);
      _wizardRenderDirs();
    });
  });
}

function _wizardAddDir() {
  const input = document.getElementById('wizard-dir-input');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  if (!_wizardDirs.includes(val)) {
    _wizardDirs.push(val);
    _wizardRenderDirs();
  }
  input.value = '';
}

async function _wizardSaveSettings() {
  const btn = document.getElementById('wizard-save-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Ukládám...'; }

  try {
    // Save allowed dirs
    if (_wizardDirs.length) {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filesystem: { allowed_directories: _wizardDirs } }),
      });
      if (!res.ok) throw new Error(await res.text());
    }

    // Save resident mode if selected
    const modeEl = document.getElementById('wizard-resident-mode');
    if (modeEl && modeEl.value) {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resident: { mode: modeEl.value } }),
      });
    }

    showToast('Nastavení uloženo');
    _wizardRenderStep(4);
  } catch (err) {
    showToast('Chyba při ukládání: ' + err.message, 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'Uložit a pokračovat'; }
  }
}

async function _wizardGeneratePrompt() {
  const btn = document.getElementById('wizard-gen-prompt-btn');
  const out = document.getElementById('wizard-prompt-result');
  if (!out) return;

  const taskType = (document.getElementById('wizard-pg-task') || {}).value || 'chat';
  const context  = (document.getElementById('wizard-pg-context') || {}).value || '';
  const tone     = (document.getElementById('wizard-pg-tone') || {}).value || 'professional';

  if (btn) { btn.disabled = true; btn.textContent = 'Generuji...'; }
  out.textContent = '';

  try {
    const res = await fetch('/api/prompts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_type: taskType, context, tone }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    out.textContent = data.generated_prompt;

    const exampleEl = document.getElementById('wizard-prompt-example');
    if (exampleEl) exampleEl.textContent = data.example_usage || '';

    const copyBtn = document.getElementById('wizard-copy-prompt-btn');
    if (copyBtn) copyBtn.style.display = '';
  } catch (err) {
    out.textContent = 'Chyba: ' + err.message;
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '✨ Generovat prompt'; }
  }
}

function bindWizard() {
  const overlay = document.getElementById('setup-wizard-overlay');
  if (!overlay) return;

  // Close on overlay background click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSetupWizard();
  });

  // Close button
  const closeBtn = document.getElementById('wizard-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeSetupWizard);

  // Step navigation buttons
  overlay.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-wizard-next]');
    if (btn) {
      const next = parseInt(btn.dataset.wizardNext, 10);
      _wizardRenderStep(next);
    }
  });

  // Add directory
  const addDirBtn = document.getElementById('wizard-add-dir-btn');
  if (addDirBtn) addDirBtn.addEventListener('click', _wizardAddDir);

  const dirInput = document.getElementById('wizard-dir-input');
  if (dirInput) {
    dirInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); _wizardAddDir(); }
    });
  }

  // Save settings (step 3 → 4)
  const saveBtn = document.getElementById('wizard-save-btn');
  if (saveBtn) saveBtn.addEventListener('click', _wizardSaveSettings);

  // Generate prompt inside wizard step 3
  const genBtn = document.getElementById('wizard-gen-prompt-btn');
  if (genBtn) genBtn.addEventListener('click', _wizardGeneratePrompt);

  // Copy wizard prompt
  const copyBtn = document.getElementById('wizard-copy-prompt-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const out = document.getElementById('wizard-prompt-result');
      if (out && out.textContent) {
        navigator.clipboard.writeText(out.textContent).then(() => showToast('Zkopírováno!'));
      }
    });
  }

  // Finish / Done
  const doneBtn = document.getElementById('wizard-done-btn');
  if (doneBtn) doneBtn.addEventListener('click', closeSetupWizard);

  // Re-launch from settings
  const relaunchBtn = document.getElementById('relaunch-wizard-btn');
  if (relaunchBtn) relaunchBtn.addEventListener('click', showSetupWizard);
}

/* ============================================================
   PROMPT GENERATOR (Settings panel)
   ============================================================ */

async function generatePrompt() {
  const btn    = document.getElementById('pg-generate-btn');
  const result = document.getElementById('pg-result-text');
  const wrap   = document.getElementById('pg-result-wrap');
  if (!result) return;

  const taskType = (document.getElementById('pg-task-type') || {}).value || 'chat';
  const context  = (document.getElementById('pg-context') || {}).value || '';
  const tone     = (document.getElementById('pg-tone') || {}).value || 'professional';

  if (btn) { btn.disabled = true; btn.textContent = '⏳ Generuji...'; }
  if (wrap) wrap.style.display = 'none';

  try {
    const res = await fetch('/api/prompts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_type: taskType, context, tone }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText);
    }
    const data = await res.json();

    result.textContent = data.generated_prompt;
    const exampleEl = document.getElementById('pg-example-usage');
    if (exampleEl) exampleEl.textContent = data.example_usage || '';

    if (wrap) wrap.style.display = '';
  } catch (err) {
    if (result) result.textContent = 'Chyba: ' + err.message;
    if (wrap) wrap.style.display = '';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '✨ Generovat prompt'; }
  }
}

function bindPromptGenerator() {
  const section = document.getElementById('prompt-generator-section');
  if (!section) return;

  // Generate button
  const genBtn = document.getElementById('pg-generate-btn');
  if (genBtn) genBtn.addEventListener('click', generatePrompt);

  // Example chips – fill context textarea
  section.addEventListener('click', (e) => {
    const chip = e.target.closest('.pg-example-chip');
    if (!chip) return;
    const ctx = document.getElementById('pg-context');
    if (ctx) ctx.value = chip.dataset.example || chip.textContent.trim();
  });

  // Copy generated prompt
  const copyBtn = document.getElementById('pg-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = (document.getElementById('pg-result-text') || {}).textContent;
      if (text) navigator.clipboard.writeText(text).then(() => showToast('Zkopírováno!'));
    });
  }

  // Insert into chat
  const insertBtn = document.getElementById('pg-insert-chat-btn');
  if (insertBtn) {
    insertBtn.addEventListener('click', () => {
      const text = (document.getElementById('pg-result-text') || {}).textContent;
      if (!text) return;
      const chatInput = document.getElementById('chat-input');
      if (chatInput) chatInput.value = text;
      // Switch to chat tab
      const chatNavBtn = document.querySelector('[data-section="chat"]');
      if (chatNavBtn) chatNavBtn.click();
      showToast('Prompt vložen do chatu');
    });
  }
}

/* ============================================================
   FILE MANAGER
   ============================================================ */

let _filesCurrentPath = '';

function bindFilesManager() {
  const browseBtn = document.getElementById('files-browse-btn');
  const refreshBtn = document.getElementById('refresh-files-btn');
  const pathInput = document.getElementById('files-path-input');
  const previewClose = document.getElementById('files-preview-close');

  if (browseBtn) browseBtn.addEventListener('click', () => {
    const path = (pathInput || {}).value.trim();
    if (!path) { showToast('Zadej cestu', 'warning'); return; }
    _filesCurrentPath = path;
    loadFileTree(path);
  });

  if (refreshBtn) refreshBtn.addEventListener('click', () => {
    if (_filesCurrentPath) loadFileTree(_filesCurrentPath);
  });

  if (pathInput) pathInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); browseBtn && browseBtn.click(); }
  });

  if (previewClose) previewClose.addEventListener('click', () => {
    const panel = document.getElementById('files-preview-panel');
    if (panel) panel.classList.add('hidden');
  });
}

function loadFilesManager() {
  if (_filesCurrentPath) loadFileTree(_filesCurrentPath);
}

async function loadFileTree(path) {
  const container = document.getElementById('files-tree-container');
  if (!container) return;
  container.innerHTML = '<div class="empty-state">Na\u010d\u00edt\u00e1m...</div>';

  try {
    const res = await fetch('/api/files/tree?path=' + encodeURIComponent(path) + '&max_depth=3');
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    container.innerHTML = renderFileTree(data.entries, 0);
  } catch (err) {
    container.innerHTML = '<div class="resident-error-box">Chyba: ' + escHtml(err.message) + '</div>';
  }
}

function renderFileTree(entries, depth) {
  if (!entries || !entries.length) return '<div class="empty-state">\u017d\u00e1dn\u00e9 soubory</div>';
  const indent = depth * 1.25;
  return entries.map(e => {
    const icon = e.is_dir ? '\ud83d\udcc1' : (e.is_image ? '\ud83d\uddbc\ufe0f' : '\ud83d\udcc4');
    const sizeStr = e.is_dir ? '' : formatFileSize(e.size);
    const children = e.children ? renderFileTree(e.children, depth + 1) : '';
    const actions = e.is_dir
      ? `<button class="btn btn--ghost btn--small" onclick="navigateToDir('${escHtml(e.path)}')">Otev\u0159\u00edt</button>`
      : `<button class="btn btn--ghost btn--small" onclick="previewFile('${escHtml(e.path)}')" title="N\u00e1hled">N\u00e1hled</button>
         <button class="btn btn--ghost btn--small" onclick="uploadFileToKB('${escHtml(e.path)}')" title="Do KB">KB\u2191</button>`;
    return `
      <div class="file-tree-item" style="padding-left:${indent}rem">
        <span class="file-tree-icon">${icon}</span>
        <span class="file-tree-name" title="${escHtml(e.path)}">${escHtml(e.name)}</span>
        <span class="file-tree-size">${sizeStr}</span>
        <span class="file-tree-actions">${actions}</span>
      </div>
      ${children}`;
  }).join('');
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function navigateToDir(path) {
  const pathInput = document.getElementById('files-path-input');
  if (pathInput) pathInput.value = path;
  _filesCurrentPath = path;
  loadFileTree(path);
}

async function previewFile(path) {
  const panel = document.getElementById('files-preview-panel');
  const title = document.getElementById('files-preview-title');
  const content = document.getElementById('files-preview-content');
  if (!panel || !content) return;

  panel.classList.remove('hidden');
  if (title) title.textContent = path.split('/').pop();
  content.innerHTML = '<div class="empty-state">Na\u010d\u00edt\u00e1m...</div>';

  try {
    const res = await fetch('/api/files/preview?path=' + encodeURIComponent(path));
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();

    if (data.type === 'text') {
      content.innerHTML = '<pre class="file-preview-text">' + escHtml(data.content) + '</pre>';
    } else if (data.type === 'image') {
      content.innerHTML = '<div style="text-align:center"><img src="/api/filesystem/read?path=' +
        encodeURIComponent(path) + '" style="max-width:100%;max-height:400px;border-radius:8px" alt="' +
        escHtml(data.name) + '" /></div>';
    } else {
      content.innerHTML = '<div class="empty-state">Bin\u00e1rn\u00ed soubor \u2013 n\u00e1hled nen\u00ed dostupn\u00fd<br>' +
        'Velikost: ' + formatFileSize(data.size) + '</div>';
    }
  } catch (err) {
    content.innerHTML = '<div class="resident-error-box">Chyba: ' + escHtml(err.message) + '</div>';
  }
}

async function uploadFileToKB(path) {
  try {
    const res = await fetch('/api/files/upload-to-kb?path=' + encodeURIComponent(path), { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    showToast('Soubor za\u0159azen do KB: ' + (data.file || path.split('/').pop()), 'success');
  } catch (err) {
    showToast('Chyba: ' + err.message, 'error');
  }
}

/* ============================================================
   CUSTOM PROFILES MODAL
   ============================================================ */

function bindCustomProfileBtn() {
  const btn = document.getElementById('custom-profile-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const name = prompt('N\u00e1zev nov\u00e9ho profilu (nap\u0159. data_analyst):');
    if (!name || !name.trim()) return;
    const profileId = name.trim().toLowerCase().replace(/\s+/g, '_');
    const profilePrompt = prompt('Syst\u00e9mov\u00fd prompt pro profil:');
    if (!profilePrompt) return;

    try {
      const res = await fetch('/api/profiles/' + encodeURIComponent(profileId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          icon: '\ud83e\udd16',
          prompt: profilePrompt,
          tools: [],
          temperature: 0.3,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      showToast('Profil vytvo\u0159en: ' + name.trim(), 'success');
    } catch (err) {
      showToast('Chyba: ' + err.message, 'error');
    }
  });
}

/* ============================================================
   LIVE ACTIVITY BAR
   ============================================================ */
function handleActivityUpdate(msg) {
  const pulse = document.getElementById('activity-pulse');
  const resStatus = document.getElementById('act-resident-status');
  const jobsCount = document.getElementById('act-jobs-count');
  const kbChunks = document.getElementById('act-kb-chunks');
  const ollamaStatus = document.getElementById('act-ollama-status');
  const ramUsage = document.getElementById('act-ram-usage');

  if (!pulse) return;

  // Resident status
  const resident = msg.resident || {};
  const statusMap = { idle: '\ud83d\udfe2 idle', thinking: '\ud83d\udfe1 thinking...', executing: '\ud83d\udfe1 executing', error: '\ud83d\udd34 error' };
  if (resStatus) resStatus.textContent = statusMap[resident.status] || resident.status || 'unknown';

  // Pulse color
  if (resident.status === 'error') {
    pulse.className = 'activity-pulse activity-pulse--error';
  } else if (resident.status === 'thinking' || resident.status === 'executing') {
    pulse.className = 'activity-pulse activity-pulse--working';
  } else {
    pulse.className = 'activity-pulse';
  }

  // Jobs
  const jobs = msg.jobs || {};
  if (jobsCount) jobsCount.textContent = jobs.total_active || 0;

  // KB
  const kb = msg.kb || {};
  if (kbChunks) kbChunks.textContent = kb.total_chunks || 0;

  // Ollama
  const ollama = msg.ollama || {};
  if (ollamaStatus) {
    if (ollama.status === 'running') {
      ollamaStatus.textContent = '\ud83d\udfe2 Ollama';
    } else {
      ollamaStatus.textContent = '\u26aa Ollama';
    }
  }

  // RAM
  const resources = msg.resources || {};
  if (ramUsage && resources.ram_used_mb) {
    const used = (resources.ram_used_mb / 1024).toFixed(1);
    const total = (resources.ram_total_mb / 1024).toFixed(1);
    ramUsage.textContent = `${used}/${total}GB`;
  }
}

/* ============================================================
   AGENT STATUS LIVE WIDGET
   ============================================================ */
function handleAgentStatusUpdate(msg) {
  const statusEl = document.getElementById('aw-status');
  const thoughtEl = document.getElementById('aw-thought');
  const lastActionEl = document.getElementById('aw-last-action');
  const cycleEl = document.getElementById('aw-cycle');

  if (!statusEl) return;

  const statusIcons = { idle: '\ud83d\udfe2', thinking: '\ud83d\udfe1', executing: '\ud83d\udfe1', error: '\ud83d\udd34' };
  const statusTexts = { idle: 'Idle', thinking: 'Thinking...', executing: 'Executing', error: 'Error' };
  const status = msg.status || 'idle';
  statusEl.textContent = `${statusIcons[status] || '\u26aa'} ${statusTexts[status] || status}`;

  if (thoughtEl) {
    thoughtEl.textContent = msg.current_thought || '\u2014';
  }

  if (lastActionEl) {
    lastActionEl.textContent = msg.last_action || '\u2014';
  }

  if (cycleEl) {
    const nextRun = msg.next_run_in || 0;
    const mins = Math.floor(nextRun / 60);
    const secs = nextRun % 60;
    cycleEl.textContent = `#${msg.cycle_count || 0} | Dal\u0161\u00ed za: ${mins}:${String(secs).padStart(2, '0')}`;
  }
}

/* ============================================================
   FILE PICKER (Native OS / fallback)
   ============================================================ */
function bindFilePickers() {
  document.querySelectorAll('.browse-picker-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetId = btn.dataset.target;
      const pickerType = btn.dataset.type || 'directory';
      const targetInput = document.getElementById(targetId);
      if (!targetInput) return;

      // Try native File System Access API (modern browsers)
      if (pickerType === 'directory' && window.showDirectoryPicker) {
        try {
          const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
          targetInput.value = dirHandle.name;
          showToast('Slo\u017eka vybr\u00e1na: ' + dirHandle.name, 'info');
          return;
        } catch (e) {
          if (e.name === 'AbortError') return;
        }
      }

      if (pickerType === 'file' && window.showOpenFilePicker) {
        try {
          const [fileHandle] = await window.showOpenFilePicker({
            types: [{ description: 'All Files', accept: { '*/*': [] } }],
            multiple: false,
          });
          targetInput.value = fileHandle.name;
          showToast('Soubor vybr\u00e1n: ' + fileHandle.name, 'info');
          return;
        } catch (e) {
          if (e.name === 'AbortError') return;
        }
      }

      // Fallback: use an <input type="file"> element
      const fallbackInput = document.createElement('input');
      fallbackInput.type = 'file';
      if (pickerType === 'directory') {
        fallbackInput.webkitdirectory = true;
      }
      fallbackInput.onchange = () => {
        if (fallbackInput.files.length > 0) {
          const file = fallbackInput.files[0];
          if (pickerType === 'directory' && file.webkitRelativePath) {
            const dir = file.webkitRelativePath.split('/')[0];
            targetInput.value = dir;
            showToast('Slo\u017eka vybr\u00e1na: ' + dir, 'info');
          } else {
            targetInput.value = file.name;
            showToast('Soubor vybr\u00e1n: ' + file.name, 'info');
          }
        }
      };
      fallbackInput.click();
    });
  });
}

/* ============================================================
   CLICKABLE LINKS – Markdown, file paths, job IDs
   ============================================================ */
function linkifyContent(html) {
  // Auto-linkify URLs in plain text
  html = html.replace(
    /(?<!["'=])https?:\/\/[^\s<>"')\]]+/g,
    function(url) { return '<a href="' + escHtml(url) + '" target="_blank" rel="noopener">' + escHtml(url) + '</a>'; }
  );

  // File path regex -> inline Open link
  html = html.replace(
    /((?:\/[\w.\-]+){2,})/g,
    function(match) {
      if (match.startsWith('http')) return match;
      return match + ' <a class="chat-file-link" href="/api/files/action?type=open_vscode&path=' + encodeURIComponent(match) + '" target="_blank">\ud83d\udcc1 Open</a>';
    }
  );

  // Job ID regex -> inline View link (UUID pattern)
  html = html.replace(
    /\b([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b/g,
    function(match) { return '<a class="chat-job-link" onclick="showJobDetail(\'' + match + '\')">\ud83d\udcca ' + match.substring(0, 8) + '...</a>'; }
  );

  return html;
}

/* ============================================================
   RUNTIME SKILLS PANEL (Settings tab)
   ============================================================ */
async function loadRuntimeSkills() {
  const panel = document.getElementById('runtime-skills-panel');
  const badge = document.getElementById('skills-count-badge');
  if (!panel) return;

  try {
    const resp = await fetch('/api/skills-runtime/catalog');
    if (!resp.ok) return;
    const data = await resp.json();
    const skills = data.skills || [];

    if (badge) badge.textContent = skills.length;

    panel.innerHTML = skills.map(function(s) {
      return '<label class="skill-toggle-item">' +
        '<input type="checkbox" ' + (s.enabled ? 'checked' : '') + ' data-skill="' + escHtml(s.name) + '" onchange="toggleRuntimeSkill(this)" />' +
        '<span class="skill-icon">' + (s.icon || '\u2699') + '</span>' +
        '<span class="skill-name">' + escHtml(s.name) + '</span>' +
        '</label>';
    }).join('');
  } catch (e) {
    panel.innerHTML = '<p class="empty-state">Chyba na\u010d\u00edt\u00e1n\u00ed skills</p>';
  }
}

async function toggleRuntimeSkill(checkbox) {
  const panel = document.getElementById('runtime-skills-panel');
  if (!panel) return;

  const allCheckboxes = panel.querySelectorAll('input[type="checkbox"]');
  const enabledSkills = [];
  allCheckboxes.forEach(function(cb) {
    if (cb.checked) enabledSkills.push(cb.dataset.skill);
  });

  try {
    await fetch('/api/skills-runtime/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled_skills: enabledSkills }),
    });
    showToast('Skills aktualizov\u00e1ny', 'success');
  } catch (e) {
    showToast('Chyba: ' + e.message, 'error');
  }
}

/* ============================================================
   JOB RUN NOW / SCHEDULE / QUEUE
   ============================================================ */
function bindJobRunControls() {
  const runNowBtn = document.getElementById('job-run-now-btn');
  const scheduleBtn = document.getElementById('job-schedule-btn');

  if (runNowBtn) {
    runNowBtn.addEventListener('click', async function() {
      const type = (document.getElementById('job-run-type') || {}).value || 'long_llm_task';
      const title = (document.getElementById('job-run-title') || {}).value || ('Manual: ' + type);
      try {
        const resp = await fetch('/api/jobs/run-now', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: type, title: title }),
        });
        if (!resp.ok) throw new Error(await resp.text());
        const data = await resp.json();
        showToast('Job spu\u0161t\u011bn: ' + data.id.substring(0, 8), 'success');
        loadJobs();
      } catch (e) {
        showToast('Chyba: ' + e.message, 'error');
      }
    });
  }

  if (scheduleBtn) {
    scheduleBtn.addEventListener('click', async function() {
      const type = (document.getElementById('job-run-type') || {}).value || 'long_llm_task';
      const title = (document.getElementById('job-run-title') || {}).value || ('Scheduled: ' + type);
      const dt = (document.getElementById('job-schedule-datetime') || {}).value;
      if (!dt) {
        showToast('Vyber datum a \u010das pro napl\u00e1nov\u00e1n\u00ed', 'error');
        return;
      }
      try {
        const resp = await fetch('/api/jobs/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: type, title: title, run_at: new Date(dt).toISOString() }),
        });
        if (!resp.ok) throw new Error(await resp.text());
        showToast('Job napl\u00e1nov\u00e1n', 'success');
        loadJobs();
      } catch (e) {
        showToast('Chyba: ' + e.message, 'error');
      }
    });
  }
}

async function loadJobQueue() {
  const section = document.getElementById('job-queue-section');
  const list = document.getElementById('job-queue-list');
  if (!section || !list) return;

  section.classList.remove('hidden');

  try {
    const resp = await fetch('/api/jobs/queue');
    if (!resp.ok) throw new Error(await resp.text());
    const data = await resp.json();
    const queue = data.queue || [];

    if (queue.length === 0) {
      list.innerHTML = '<p class="empty-state">\u017d\u00e1dn\u00e9 aktivn\u00ed joby</p>';
      return;
    }

    list.innerHTML = queue.map(function(j) {
      return '<div class="job-queue-item">' +
        '<span class="job-queue-title">' + escHtml(j.title) + '</span>' +
        '<span class="job-queue-status job-queue-status--' + j.status + '">' + j.status + '</span>' +
        '<button class="btn btn--ghost btn--small" onclick="cancelJobFromQueue(\'' + j.id + '\')" title="Zru\u0161it">\u2715</button>' +
        '</div>';
    }).join('');
  } catch (e) {
    list.innerHTML = '<p class="empty-state">Chyba: ' + escHtml(e.message) + '</p>';
  }
}

async function cancelJobFromQueue(jobId) {
  try {
    await fetch('/api/jobs/' + jobId + '/cancel', { method: 'POST' });
    showToast('Job zru\u0161en', 'success');
    loadJobQueue();
    loadJobs();
  } catch (e) {
    showToast('Chyba: ' + e.message, 'error');
  }
}

/* ============================================================
   INIT NEW FEATURES (called from DOMContentLoaded)
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
  bindFilePickers();
  bindJobRunControls();
});
