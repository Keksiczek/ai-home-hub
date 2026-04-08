import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Play, Square, RotateCw, Activity, Brain,
  Eye, Shield, Rocket, AlertCircle, Clock,
  Loader2, RefreshCw, CheckCircle2, XCircle, Hourglass, List
} from 'lucide-react';
import { residentApi } from '../api';
import { useToast } from '../context/ToastContext';
import { useAppWebSocket } from '../context/AppWebSocketContext';
import type { ResidentMode } from '../types';

const modeConfig: Record<ResidentMode, { icon: typeof Eye; label: string; desc: string; color: string }> = {
  observer: { icon: Eye, label: 'Observer', desc: 'Pouze sleduje, žádné akce', color: '#60a5fa' },
  advisor: { icon: Shield, label: 'Advisor', desc: 'Navrhuje akce ke schválení', color: '#f59e0b' },
  autonomous: { icon: Rocket, label: 'Autonomous', desc: 'Bezpečné akce provádí automaticky', color: '#10b981' },
};

/** Human-readable label + colour for each lifecycle phase */
const PHASE_META: Record<string, { label: string; color: string; icon: typeof Activity }> = {
  idle:          { label: 'Idle',                        color: '#6b7280', icon: Activity },
  thinking:      { label: 'Přemýšlí',                    color: '#60a5fa', icon: Brain },
  waiting_llm:   { label: 'Čeká na LLM',                 color: '#a78bfa', icon: Hourglass },
  retrying_llm:  { label: 'Opakuje LLM požadavek',       color: '#f59e0b', icon: RotateCw },
  executing:     { label: 'Provádí akci',                 color: '#10b981', icon: Zap },
  cooldown:      { label: 'Cooldown (po chybě)',          color: '#f97316', icon: Clock },
  error:         { label: 'Chyba',                       color: '#ef4444', icon: AlertCircle },
  degraded:      { label: 'Degraded režim',              color: '#dc2626', icon: AlertCircle },
  paused:        { label: 'Pozastaveno',                  color: '#6b7280', icon: Square },
};

/** Export for tests */
export { PHASE_META };

interface TimelineEvent {
  time: string;
  cycle_id: string;
  event: string;
  detail: string;
}

function formatTs(ts: string | null | undefined): string {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return ts;
  }
}

export function ResidentAgent() {
  const { success, error: showError } = useToast();
  const { residentState, lastMessage } = useAppWebSocket();
  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null);
  const [mode, setMode] = useState<ResidentMode>('advisor');
  const [feed, setFeed] = useState<Array<Record<string, unknown>>>([]);
  const [pendingActions, setPendingActions] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const timelineRef = useRef<TimelineEvent[]>([]);

  const refresh = useCallback(async () => {
    try {
      const [dashData, modeData, feedData, pendingData] = await Promise.all([
        residentApi.dashboard(),
        residentApi.getMode(),
        residentApi.activityFeed(15),
        residentApi.pendingActions(),
      ]);
      setDashboard(dashData);
      setMode(modeData.mode as ResidentMode);
      setFeed((feedData as Record<string, unknown>).feed as Array<Record<string, unknown>> || []);
      setPendingActions(pendingData.actions as Array<Record<string, unknown>> || []);
    } catch {
      // partial failure is ok
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Merge WebSocket updates into dashboard state
  useEffect(() => {
    if (residentState) {
      setDashboard(prev => prev ? { ...prev, ...residentState } : residentState);
    }
  }, [residentState]);

  // Build mini-timeline from WS events
  useEffect(() => {
    if (!lastMessage) return;
    const msg = lastMessage as Record<string, unknown>;
    const type = msg.type as string;

    // Only track lifecycle events
    const interesting = new Set([
      'resident_tick', 'resident_action', 'agent_status',
    ]);
    if (!interesting.has(type)) return;

    const phase = (msg.phase as string) || (msg.status as string) || '';
    const cycle_id = (msg.active_cycle_id as string) || (msg.cycle_id as string) || '';
    const event = type === 'resident_action'
      ? `action: ${msg.action as string || '?'}`
      : `phase: ${phase || type}`;
    const detail = type === 'resident_action'
      ? (msg.result_preview as string || '').slice(0, 60)
      : (msg.last_error as string || (msg.in_progress ? 'in progress' : ''));

    const entry: TimelineEvent = {
      time: new Date().toISOString(),
      cycle_id,
      event,
      detail,
    };

    timelineRef.current = [entry, ...timelineRef.current].slice(0, 10);
    setTimeline([...timelineRef.current]);
  }, [lastMessage]);

  const dash = dashboard as Record<string, unknown> | null;
  const isRunning = !!(dash?.is_running);
  const phase = (dash?.phase as string) || 'idle';
  const status = (dash?.status as string) || 'idle';
  const tickCount = (dash?.tick_count as number) || 0;
  const errors = (dash?.consecutive_errors as number) || 0;
  const healthScore = (dash?.health_score as number) || 0;
  const lastThought = (dash?.current_thought as string) || (dash?.last_thought as string) || '';
  const activeCycleId = dash?.active_cycle_id as string | null;
  const cycleStartedAt = dash?.cycle_started_at as string | null;
  const lastSuccessAt = dash?.last_success_at as string | null;
  const lastError = dash?.last_error as string | null;
  const lastErrorAt = dash?.last_error_at as string | null;
  const retryCount = (dash?.retry_count as number) || 0;
  const nextRunAt = dash?.next_run_at as string | null;
  const inProgress = !!(dash?.in_progress);
  const cycleLockActive = !!(dash?.cycle_lock_active);
  const degradedMode = !!(dash?.degraded_mode);
  const degradedReason = dash?.degraded_reason as string | null;
  const consecutiveFailures = (dash?.consecutive_failures as number) || 0;
  const currentModel = dash?.current_model as string | null;
  const lastLlmDurationMs = dash?.last_llm_duration_ms as number | null;

  const phaseMeta = PHASE_META[phase] || PHASE_META['idle'];
  const PhaseIcon = phaseMeta.icon;

  const handleStart = async () => {
    setActionLoading('start');
    try { await residentApi.start(); success('Agent spuštěn'); refresh(); }
    catch { showError('Nepodařilo se spustit agenta'); }
    finally { setActionLoading(null); }
  };

  const handleStop = async () => {
    setActionLoading('stop');
    try { await residentApi.stop(); success('Agent zastaven'); refresh(); }
    catch { showError('Nepodařilo se zastavit agenta'); }
    finally { setActionLoading(null); }
  };

  const handleRunNow = async () => {
    setActionLoading('run');
    try { await residentApi.runNow(); success('Cyklus spuštěn'); }
    catch { showError('Run-now selhal'); }
    finally { setActionLoading(null); }
  };

  const handleModeChange = async (newMode: ResidentMode) => {
    try {
      await residentApi.setMode(newMode);
      setMode(newMode);
      success(`Režim změněn na ${modeConfig[newMode].label}`);
    } catch { showError('Změna režimu selhala'); }
  };

  const handleApprove = async (id: string) => {
    try { await residentApi.approveAction(id); success('Akce schválena'); refresh(); }
    catch { showError('Schválení selhalo'); }
  };

  const handleReject = async (id: string) => {
    try { await residentApi.rejectAction(id); success('Akce zamítnuta'); refresh(); }
    catch { showError('Zamítnutí selhalo'); }
  };

  if (loading) {
    return (
      <div className="loading-center">
        <Loader2 size={32} className="spinner" />
        <p>Načítám stav agenta...</p>
      </div>
    );
  }

  return (
    <div className="resident-layout">
      {/* Status Bar */}
      <div className="resident-status-bar glass-panel">
        <div className="status-indicator">
          <Activity size={20} className={`status-dot ${isRunning ? 'active' : 'stopped'}`} />
          <div>
            <strong>{isRunning ? 'Aktivní' : 'Zastavený'}</strong>
            <span className="text-muted"> • </span>
            {/* Phase badge — always truthful */}
            <span
              className="phase-badge"
              style={{ color: phaseMeta.color, fontWeight: 600 }}
              title={`status: ${status}`}
            >
              <PhaseIcon size={13} style={{ display: 'inline', marginRight: 3 }} />
              {phaseMeta.label}
            </span>
            {degradedMode && (
              <span
                className="degraded-badge"
                title={degradedReason || 'Degraded mode active'}
              >
                ⚠ Degraded
              </span>
            )}
            <span className="text-muted"> • {tickCount} cyklů</span>
            {cycleLockActive && (
              <span className="text-muted" style={{ marginLeft: 6, fontSize: '0.78em' }}>
                🔒 lock
              </span>
            )}
          </div>
        </div>
        <div className="status-actions">
          {isRunning ? (
            <>
              <button className="action-btn" onClick={handleRunNow} disabled={!!actionLoading || inProgress}>
                {actionLoading === 'run' ? <Loader2 size={16} className="spinner" /> : <RotateCw size={16} />}
                Run Now
              </button>
              <button className="action-btn danger" onClick={handleStop} disabled={!!actionLoading}>
                {actionLoading === 'stop' ? <Loader2 size={16} className="spinner" /> : <Square size={16} />}
                Stop
              </button>
            </>
          ) : (
            <button className="action-btn primary" onClick={handleStart} disabled={!!actionLoading}>
              {actionLoading === 'start' ? <Loader2 size={16} className="spinner" /> : <Play size={16} />}
              Spustit
            </button>
          )}
        </div>
      </div>

      <div className="resident-grid">
        {/* Health + Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="resident-card glass-panel">
          <h3><Brain size={18} /> Health Score</h3>
          <div className="health-score-display">
            <div className="health-ring" style={{
              background: `conic-gradient(${healthScore > 80 ? '#10b981' : healthScore > 50 ? '#f59e0b' : '#ef4444'} ${healthScore}%, rgba(255,255,255,0.05) 0)`
            }}>
              <span>{healthScore}%</span>
            </div>
          </div>
          {errors > 0 && (
            <div className="error-badge">
              <AlertCircle size={14} /> {errors} konsekutivní chyba{errors > 1 ? 'y' : ''}
            </div>
          )}
        </motion.div>

        {/* Runtime State – diagnostic card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="resident-card glass-panel">
          <h3><Activity size={18} /> Stav cyklu</h3>
          <div className="cycle-state-rows">
            <div className="cycle-state-row">
              <span className="cycle-state-label">Fáze</span>
              <span className="cycle-state-value" style={{ color: phaseMeta.color }}>
                <PhaseIcon size={13} style={{ display: 'inline', marginRight: 4 }} />
                {phaseMeta.label}
              </span>
            </div>
            {activeCycleId && (
              <div className="cycle-state-row">
                <span className="cycle-state-label">Aktivní cyklus</span>
                <span className="cycle-state-value mono">{activeCycleId}</span>
              </div>
            )}
            {cycleStartedAt && inProgress && (
              <div className="cycle-state-row">
                <span className="cycle-state-label">Spuštěn</span>
                <span className="cycle-state-value">{formatTs(cycleStartedAt)}</span>
              </div>
            )}
            {retryCount > 0 && (
              <div className="cycle-state-row">
                <span className="cycle-state-label">Pokusy LLM</span>
                <span className="cycle-state-value" style={{ color: '#f59e0b' }}>{retryCount + 1}</span>
              </div>
            )}
            <div className="cycle-state-row">
              <span className="cycle-state-label">Poslední úspěch</span>
              <span className="cycle-state-value">{formatTs(lastSuccessAt)}</span>
            </div>
            <div className="cycle-state-row">
              <span className="cycle-state-label">Příští běh</span>
              <span className="cycle-state-value">{formatTs(nextRunAt)}</span>
            </div>
            {consecutiveFailures > 0 && (
              <div className="cycle-state-row">
                <span className="cycle-state-label">Selhání za sebou</span>
                <span className="cycle-state-value" style={{ color: consecutiveFailures >= 3 ? '#ef4444' : '#f59e0b' }}>
                  {consecutiveFailures}
                </span>
              </div>
            )}
            {currentModel && (
              <div className="cycle-state-row">
                <span className="cycle-state-label">Model</span>
                <span className="cycle-state-value mono" style={{ fontSize: '0.78rem' }}>{currentModel}</span>
              </div>
            )}
            {lastLlmDurationMs != null && (
              <div className="cycle-state-row">
                <span className="cycle-state-label">Poslední LLM</span>
                <span className="cycle-state-value">{lastLlmDurationMs.toFixed(0)} ms</span>
              </div>
            )}
            {lastError && (
              <div className="cycle-state-row error-row">
                <span className="cycle-state-label"><AlertCircle size={12} /> Chyba</span>
                <span className="cycle-state-value error-text" title={lastError}>
                  {lastError.length > 50 ? lastError.slice(0, 50) + '…' : lastError}
                </span>
              </div>
            )}
            {lastErrorAt && lastError && (
              <div className="cycle-state-row">
                <span className="cycle-state-label">Čas chyby</span>
                <span className="cycle-state-value">{formatTs(lastErrorAt)}</span>
              </div>
            )}
            {degradedMode && (
              <div className="cycle-state-row error-row">
                <span className="cycle-state-label"><AlertCircle size={12} /> Degraded</span>
                <span className="cycle-state-value error-text" title={degradedReason || ''}>
                  {(degradedReason || 'active').length > 50
                    ? (degradedReason || 'active').slice(0, 50) + '…'
                    : (degradedReason || 'active')}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Mode Selector */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="resident-card glass-panel">
          <h3><Shield size={18} /> Režim autonomie</h3>
          <div className="mode-selector">
            {(Object.entries(modeConfig) as [ResidentMode, typeof modeConfig.observer][]).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const isActive = mode === key;
              return (
                <button
                  key={key}
                  className={`mode-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleModeChange(key)}
                  style={{ borderColor: isActive ? cfg.color : undefined }}
                >
                  <Icon size={18} style={{ color: isActive ? cfg.color : undefined }} />
                  <strong>{cfg.label}</strong>
                  <span className="text-muted">{cfg.desc}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Last Thought */}
        {lastThought && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="resident-card glass-panel thought-card">
            <h3><Brain size={18} /> Poslední myšlenka</h3>
            <p className="thought-text">{lastThought}</p>
          </motion.div>
        )}

        {/* Pending Actions */}
        {pendingActions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="resident-card glass-panel pending-card">
            <h3><Zap size={18} /> Čekající akce ({pendingActions.length})</h3>
            <div className="pending-list">
              {pendingActions.map((action) => (
                <div key={action.id as string} className="pending-item">
                  <div className="pending-info">
                    <strong>{action.action_type as string || action.type as string}</strong>
                    <span className="text-muted">{action.description as string || ''}</span>
                  </div>
                  <div className="pending-btns">
                    <button className="action-btn small primary" onClick={() => handleApprove(action.id as string)}>
                      <CheckCircle2 size={14} /> Schválit
                    </button>
                    <button className="action-btn small danger" onClick={() => handleReject(action.id as string)}>
                      <XCircle size={14} /> Zamítnout
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Mini Timeline – recent lifecycle events */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="resident-card glass-panel">
          <h3><List size={18} /> Poslední události</h3>
          <div className="timeline-list">
            {timeline.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', padding: '12px' }}>Čeká na události…</p>
            ) : (
              timeline.map((ev, i) => (
                <div key={i} className="timeline-item">
                  <span className="timeline-time text-muted">{formatTs(ev.time)}</span>
                  <span className="timeline-cycle text-muted mono">{ev.cycle_id || '—'}</span>
                  <span className="timeline-event">{ev.event}</span>
                  {ev.detail && <span className="timeline-detail text-muted">{ev.detail}</span>}
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="resident-card glass-panel feed-card">
          <div className="card-header-row">
            <h3><Clock size={18} /> Aktivita</h3>
            <button className="action-btn small" onClick={refresh}><RefreshCw size={14} /></button>
          </div>
          <div className="feed-list">
            {feed.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', padding: '24px' }}>Zatím žádná aktivita</p>
            ) : (
              feed.map((item, i) => (
                <div key={i} className="feed-item">
                  <span className="feed-icon">{item.icon as string}</span>
                  <div className="feed-info">
                    <span className="feed-desc">{item.description as string}</span>
                    <span className="feed-time text-muted">
                      {item.timestamp ? new Date(item.timestamp as string).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  {item.cycle_id ? (
                    <span className="feed-cycle text-muted mono">{String(item.cycle_id)}</span>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
