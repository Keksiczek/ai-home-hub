/**
 * Centralized API layer – typed fetch helpers with error handling.
 */

const API_BASE = '/api';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(text, res.status);
  }
  return res.json();
}

// ── Chat ────────────────────────────────────────────────

export const chatApi = {
  /** Send a message (async job-based, returns job_id). */
  send: (message: string, sessionId?: string, model?: string, mode = 'general') =>
    request<{ status: string; job_id: string; session_id: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId, model, mode }),
    }),

  /** SSE streaming endpoint. Returns a ReadableStream. */
  streamSSE: async (message: string, sessionId?: string, model?: string, mode = 'general') => {
    const res = await fetch(`${API_BASE}/chat/stream/sse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, session_id: sessionId, model, mode }),
    });
    if (!res.ok) throw new ApiError(await res.text(), res.status);
    return res;
  },

  listSessions: () =>
    request<{ sessions: Array<{ id: string; name?: string; created_at: string; message_count?: number; last_activity?: string }>; count: number }>('/chat/sessions'),

  getSession: (id: string) =>
    request<{ session_id: string; messages: Array<{ role: string; content: string; timestamp?: string; meta?: Record<string, unknown> }> }>(`/chat/sessions/${id}`),

  deleteSession: (id: string) =>
    request<{ deleted: boolean }>(`/chat/sessions/${id}`, { method: 'DELETE' }),

  renameSession: (id: string, name: string) =>
    request<{ session_id: string; name: string }>(`/chat/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),
};

// ── Resident Agent ──────────────────────────────────────

export const residentApi = {
  status: () => request<Record<string, unknown>>('/resident/status'),
  dashboard: () => request<Record<string, unknown>>('/resident/dashboard'),
  heartbeat: () => request<Record<string, unknown>>('/resident/heartbeat'),
  start: () => request<{ status: string; message: string }>('/resident/start', { method: 'POST' }),
  stop: () => request<{ status: string; message: string }>('/resident/stop', { method: 'POST' }),
  pause: () => request<Record<string, unknown>>('/resident/pause', { method: 'POST' }),
  resume: () => request<Record<string, unknown>>('/resident/resume', { method: 'POST' }),
  runNow: () => request<Record<string, unknown>>('/resident/run-now', { method: 'POST' }),
  restart: () => request<Record<string, unknown>>('/resident/restart', { method: 'POST' }),
  history: (limit = 20) => request<{ history: unknown[]; count: number }>(`/resident/history?limit=${limit}`),
  logs: (level?: string, limit = 100) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (level) params.set('level', level);
    return request<{ logs: unknown[]; count: number }>(`/resident/logs?${params}`);
  },
  getMode: () => request<{ mode: string; allowed_actions: string[] }>('/resident/mode'),
  setMode: (mode: string) => request<{ mode: string }>('/resident/mode', { method: 'PATCH', body: JSON.stringify({ mode }) }),
  pauseMode: () => request<Record<string, unknown>>('/resident/mode/pause', { method: 'POST' }),
  enableAutonomous: () => request<Record<string, unknown>>('/resident/mode/autonomous', { method: 'POST' }),
  suggestions: (limit = 10) => request<{ suggestions: unknown[] }>(`/resident/suggestions?limit=${limit}`),
  activityFeed: (limit = 20) => request<{ feed: unknown[] }>(`/resident/activity-feed?limit=${limit}`),
  curiosity: (status?: string) => {
    const params = new URLSearchParams({ limit: '50' });
    if (status) params.set('status', status);
    return request<{ items: unknown[] }>(`/resident/curiosity?${params}`);
  },
  pendingActions: () => request<{ actions: unknown[]; count: number }>('/resident/pending-actions'),
  approveAction: (id: string) => request<Record<string, unknown>>(`/resident/pending-actions/${id}/approve`, { method: 'POST' }),
  rejectAction: (id: string) => request<Record<string, unknown>>(`/resident/pending-actions/${id}/reject`, { method: 'POST' }),
  agentSettings: () => request<Record<string, unknown>>('/resident/agent-settings'),
};

// ── Jobs ────────────────────────────────────────────────

export const jobsApi = {
  list: (status?: string, type?: string, limit = 50) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (status) params.set('status', status);
    if (type) params.set('type', type);
    return request<{ jobs: unknown[]; count: number }>(`/jobs?${params}`);
  },
  queue: () => request<{ queue: unknown[]; running_count: number; queued_count: number; total: number }>('/jobs/queue'),
  history: (limit = 20) => request<{ jobs: unknown[]; count: number }>(`/jobs/history?limit=${limit}`),
  get: (id: string) => request<Record<string, unknown>>(`/jobs/${id}`),
  getDetail: (id: string) => request<Record<string, unknown>>(`/jobs/${id}/detail`),
  cancel: (id: string) => request<Record<string, unknown>>(`/jobs/${id}/cancel`, { method: 'POST' }),
  pause: (id: string) => request<Record<string, unknown>>(`/jobs/${id}/pause`, { method: 'POST' }),
  resume: (id: string) => request<Record<string, unknown>>(`/jobs/${id}/resume`, { method: 'POST' }),
  retry: (id: string) => request<Record<string, unknown>>(`/jobs/${id}/retry`, { method: 'POST' }),
  delete: (id: string) => request<Record<string, unknown>>(`/jobs/${id}`, { method: 'DELETE' }),
  runNow: (type: string, title: string, payload = {}) =>
    request<Record<string, unknown>>('/jobs/run-now', {
      method: 'POST',
      body: JSON.stringify({ type, title, payload }),
    }),
  nightlyReport: () => request<Record<string, unknown>>('/jobs/nightly-report'),
  overnightStatus: () => request<Record<string, unknown>>('/overnight/status'),
  runOvernightJob: (name: string) => request<Record<string, unknown>>(`/overnight/run/${name}`, { method: 'POST' }),
};

// ── Models ──────────────────────────────────────────────

export const modelsApi = {
  installed: () => request<{ models: unknown[]; count: number; allow_uncensored_models: boolean }>('/models/installed'),
  recommended: () => request<{ models: unknown[] }>('/models/recommended'),
  searchOllama: (q: string) => request<{ results: unknown[] }>(`/models/search/ollama?q=${encodeURIComponent(q)}`),
  searchHuggingFace: (q: string) => request<{ results: unknown[] }>(`/models/search/huggingface?q=${encodeURIComponent(q)}`),
  pull: async (name: string) => {
    const res = await fetch(`${API_BASE}/models/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new ApiError(await res.text(), res.status);
    return res; // SSE stream
  },
  delete: (name: string) => request<{ status: string }>(`/models/${encodeURIComponent(name)}`, { method: 'DELETE' }),
  disk: () => request<Record<string, unknown>>('/models/disk'),
  llmSettings: () => request<Record<string, unknown>>('/llm/settings'),
  updateLlmSettings: (updates: Record<string, unknown>) =>
    request<Record<string, unknown>>('/llm/settings', { method: 'PATCH', body: JSON.stringify(updates) }),
  testConnection: () => request<Record<string, unknown>>('/llm/test', { method: 'POST' }),
};

// ── Files ───────────────────────────────────────────────

export const filesApi = {
  /** list files/folders in a path. Uses /files/tree for the manager. */
  listTree: (path: string, maxDepth = 2) =>
    request<{ path: string; entries: any[]; count: number }>(`/files/tree?path=${encodeURIComponent(path)}&max_depth=${maxDepth}`),

  /** Browse for picking paths (less restrictive). */
  browse: (path = '~') =>
    request<{ current: string; parent?: string; entries: any[] }>(`/filesystem/browse?path=${encodeURIComponent(path)}`),

  /** Get file content preview. */
  preview: (path: string) =>
    request<{ type: 'text' | 'image' | 'binary'; content?: string; name: string; size: number; extension: string }>(`/files/preview?path=${encodeURIComponent(path)}`),

  /** Delete a file. */
  delete: (path: string) =>
    request<{ status: string }>(`/files/action?type=delete&path=${encodeURIComponent(path)}`, { method: 'POST' }),

  /** Index into KB. */
  uploadToKb: (path: string) =>
    request<{ status: string; job_id: string }>(`/files/upload-to-kb?path=${encodeURIComponent(path)}`, { method: 'POST' }),

  /** Serve artifact URL. */
  getArtifactUrl: (path: string) => `${API_BASE}/files/artifact?path=${encodeURIComponent(path)}`,
};

// ── Agents ──────────────────────────────────────────────

export const agentsApi = {
  list: () => request<{ agents: any[]; count: number }>('/agents'),
  get: (id: string) => request<any>(`/agents/${id}/status`),
  spawn: (task: string, agentType = 'general') =>
    request<{ agent_id: string; status: string }>('/agents/spawn', {
      method: 'POST',
      body: JSON.stringify({ task, agent_type: agentType }),
    }),
  interrupt: (id: string) => request<{ status: string }>(`/agents/${id}/interrupt`, { method: 'POST' }),
  delete: (id: string) => request<{ deleted: boolean }>(`/agents/${id}`, { method: 'DELETE' }),
  cleanup: () => request<{ removed: number }>('/agents/cleanup', { method: 'POST' }),
  artifacts: (id: string) => request<{ artifacts: any[] }>(`/agents/${id}/artifacts`),
};

export { ApiError };
