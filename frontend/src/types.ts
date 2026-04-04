// ── Chat Types ──────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  meta?: Record<string, unknown>;
}

export interface ChatSession {
  id: string;
  name?: string;
  created_at: string;
  last_activity?: string;
  message_count?: number;
}

export interface ChatStreamChunk {
  type: 'chat_chunk' | 'error';
  delta?: { plain_text: string; markdown?: string };
  is_final?: boolean;
  meta?: ChatMeta;
  message?: string; // for error type
}

export interface ChatMeta {
  provider: string;
  model: string;
  latency_ms: number;
  mode: string;
  session_id: string;
  sanitized?: boolean;
  kb_context_used?: boolean;
  memory_context_used?: boolean;
}

// ── Resident Agent Types ────────────────────────────────
export interface ResidentStatus {
  is_running: boolean;
  status: string;
  heartbeat_status: string;
  last_heartbeat?: string;
  tick_count: number;
  consecutive_errors: number;
  mode?: string;
  current_thought?: string;
}

export interface ResidentDashboard {
  is_running: boolean;
  status: string;
  mode: string;
  tick_count: number;
  cycle_success_rate: number;
  consecutive_errors: number;
  last_thought?: string;
  recent_actions: ResidentAction[];
  health_score: number;
  uptime_hours?: number;
}

export interface ResidentAction {
  timestamp: string;
  type: string;
  icon: string;
  description: string;
}

export interface ResidentSuggestion {
  id: string;
  description: string;
  actions: { id: string; label: string; type: string }[];
  timestamp: string;
}

export interface CuriosityItem {
  id: string;
  kind: string;
  source: string;
  title: string;
  priority: number;
  status: string;
  updated_at: string;
}

export type ResidentMode = 'observer' | 'advisor' | 'autonomous';

// ── Jobs Types ──────────────────────────────────────────
export interface Job {
  id: string;
  type: string;
  title: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled' | 'paused';
  progress: number;
  priority: string;
  input_summary: string;
  created_at: string;
  started_at?: string;
  finished_at?: string;
  duration_s?: number;
  action?: string;
  output_summary?: string;
  model_used?: string;
  has_error?: boolean;
  error_preview?: string;
  last_error?: string;
  payload?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export interface JobQueue {
  queue: Job[];
  running_count: number;
  queued_count: number;
  paused_count: number;
  total: number;
}

// ── Models Types ────────────────────────────────────────
export interface InstalledModel {
  name: string;
  size: number;
  digest?: string;
  modified_at?: string;
  is_uncensored: boolean;
  eligible_for_primary: boolean;
  quality_flags: string[];
  quality_reasons: string[];
  details?: {
    format?: string;
    family?: string;
    parameter_size?: string;
    quantization_level?: string;
  };
}

export interface ModelPullProgress {
  status: string;
  percent?: number;
  message?: string;
  completed?: number;
  total?: number;
}

export interface LLMSettings {
  active_models: {
    chat: string;
    vision: string;
    code: string;
    agent: string;
  };
  parameters: {
    temperature: number;
    max_tokens: number;
    context_length: number;
    top_p: number;
  };
  ollama_url: string;
}

// ── Toast Types ─────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}
