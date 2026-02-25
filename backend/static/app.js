/**
 * AI Home Hub – SPA frontend
 * Vanilla JS, zero dependencies, zero build step.
 * API base: relative paths → /api/...
 */

/* ============================================================
   STATE
   ============================================================ */
/** @type {{ id: string, filename: string }[]} */
const uploadedFiles = [];

/** @type {{ role: 'user'|'ai', message: string, meta?: object }[]} */
const chatHistory = [];

/* ============================================================
   DOM REFERENCES  (resolved after DOMContentLoaded)
   ============================================================ */
let dropZone, fileInput, uploadSpinner, fileListWrap, fileList;
let modeSelect, chatInput, contextFilesWrap, contextFileList;
let sendBtn, chatSpinner, historyWrap, chatHistoryEl;
let openclawToggle, openclawBody, actionSelect, actionBtn, actionSpinner, actionResult;
let toast, toastTimer;

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Resolve DOM refs
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

  openclawToggle   = document.getElementById('openclaw-toggle');
  openclawBody     = document.getElementById('openclaw-body');
  actionSelect     = document.getElementById('action-select');
  actionBtn        = document.getElementById('action-btn');
  actionSpinner    = document.getElementById('action-spinner');
  actionResult     = document.getElementById('action-result');

  toast            = document.getElementById('toast');

  // Wire up events
  bindUploadEvents();
  bindChatEvents();
  bindOpenClawEvents();
});

/* ============================================================
   UPLOAD
   ============================================================ */
function bindUploadEvents() {
  // Click on drop zone → open file picker
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') fileInput.click();
  });

  // File input change
  fileInput.addEventListener('change', () => {
    handleFiles(Array.from(fileInput.files));
    fileInput.value = ''; // reset so same file can be re-added
  });

  // Drag & drop
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

/**
 * Upload each file sequentially; show spinner during upload.
 * @param {File[]} files
 */
async function handleFiles(files) {
  if (!files.length) return;

  show(uploadSpinner);

  for (const file of files) {
    try {
      const data = await uploadFile(file);
      uploadedFiles.push({ id: data.id, filename: data.filename });
      renderFileList();
      showToast(`Soubor „${data.filename}" byl nahrán.`, 'success');
    } catch (err) {
      showToast(`Chyba při nahrávání „${file.name}": ${err.message}`, 'error');
    }
  }

  hide(uploadSpinner);
}

/**
 * POST /api/upload – upload a single file.
 * @param {File} file
 * @returns {Promise<{ id: string, filename: string }>}
 */
async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `HTTP ${res.status}`);
  }
  return res.json();
}

/** Re-render the uploaded files list and the context checkboxes in the chat section. */
function renderFileList() {
  // Main file list (upload section)
  if (uploadedFiles.length) {
    show(fileListWrap);
    fileList.innerHTML = '';
    uploadedFiles.forEach((f) => {
      const li = document.createElement('li');
      li.className = 'file-item';
      li.dataset.id = f.id;
      li.innerHTML = `
        <span class="file-item__name" title="${escHtml(f.filename)}">
          ${escHtml(truncate(f.filename, 40))}
        </span>
        <span class="file-item__id">${escHtml(f.id.slice(0, 8))}…</span>
        <button class="file-item__remove" aria-label="Odebrat ${escHtml(f.filename)}"
                data-id="${escHtml(f.id)}">&#10005;</button>
      `;
      li.querySelector('.file-item__remove').addEventListener('click', () => removeFile(f.id));
      fileList.appendChild(li);
    });
  } else {
    hide(fileListWrap);
  }

  // Context checkboxes (chat section)
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

/** Remove a file from the UI-only list (does NOT call DELETE on server). */
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

  // Ctrl+Enter / Cmd+Enter also sends
  chatInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') sendMessage();
  });
}

async function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) {
    showToast('Zpráva nesmí být prázdná.', 'warning');
    return;
  }

  const mode = modeSelect.value;

  // Collect checked file IDs
  const contextFileIds = Array.from(
    document.querySelectorAll('.context-checkbox:checked')
  ).map((cb) => cb.value);

  // Disable UI during request
  setLoading(sendBtn, chatSpinner, true);

  // Optimistically append user bubble
  appendBubble('user', message);
  chatInput.value = '';

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, mode, context_file_ids: contextFileIds }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `HTTP ${res.status}`);
    }

    const data = await res.json();
    appendBubble('ai', data.reply, data.meta);
  } catch (err) {
    showToast(`Chyba: ${err.message}`, 'error');
    // Remove the optimistic user bubble on hard errors
    const bubbles = chatHistoryEl.querySelectorAll('.bubble--user');
    if (bubbles.length) bubbles[bubbles.length - 1].remove();
  } finally {
    setLoading(sendBtn, chatSpinner, false);
  }
}

/**
 * Append a chat bubble to the history.
 * @param {'user'|'ai'} role
 * @param {string} text
 * @param {object} [meta]
 */
function appendBubble(role, text, meta) {
  show(historyWrap);

  const bubble = document.createElement('div');
  bubble.className = `bubble bubble--${role}`;

  let inner = `<p class="bubble__text">${escHtml(text)}</p>`;

  if (meta) {
    inner += `
      <p class="bubble__meta">
        Mode: <strong>${escHtml(meta.mode || '—')}</strong> ·
        Provider: <strong>${escHtml(meta.provider || '—')}</strong> ·
        Latency: <strong>${meta.latency_ms ?? '—'} ms</strong>
      </p>`;
  }

  bubble.innerHTML = inner;
  chatHistoryEl.appendChild(bubble);

  // Scroll to bottom
  chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
}

/* ============================================================
   OPENCLAW
   ============================================================ */
function bindOpenClawEvents() {
  // Toggle collapse
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

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const statusClass = data.status === 'ok' ? 'result-box--ok'
                      : data.status === 'error' ? 'result-box--error'
                      : 'result-box--warn';

    actionResult.className = `result-box ${statusClass}`;
    actionResult.innerHTML = `
      <strong>Status:</strong> ${escHtml(data.status)}<br/>
      ${data.detail ? `<strong>Detail:</strong> ${escHtml(data.detail)}` : ''}
    `;
    show(actionResult);
  } catch (err) {
    showToast(`Chyba při spuštění akce: ${err.message}`, 'error');
  } finally {
    setLoading(actionBtn, actionSpinner, false);
  }
}

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
/**
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 */
function showToast(message, type = 'info') {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = `toast toast--${type}`;
  toast.classList.remove('hidden');

  toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 4000);
}

/* ============================================================
   HELPERS
   ============================================================ */
/** Show element (removes 'hidden' class). */
function show(el) { el.classList.remove('hidden'); }

/** Hide element (adds 'hidden' class). */
function hide(el) { el.classList.add('hidden'); }

/**
 * Toggle loading state on a button with an embedded spinner.
 * @param {HTMLButtonElement} btn
 * @param {HTMLElement} spinnerEl
 * @param {boolean} loading
 */
function setLoading(btn, spinnerEl, loading) {
  btn.disabled = loading;
  if (loading) {
    spinnerEl.classList.remove('hidden');
  } else {
    spinnerEl.classList.add('hidden');
  }
}

/**
 * Escape HTML special chars to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Truncate a string to maxLen characters.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
function truncate(str, maxLen) {
  return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;
}
