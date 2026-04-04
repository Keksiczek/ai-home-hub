import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Play, Square, Pause, RotateCw, Activity, Brain,
  Eye, Shield, Rocket, AlertCircle, Clock, ChevronRight,
  Loader2, RefreshCw, CheckCircle2, XCircle
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

export function ResidentAgent() {
  const { success, error: showError } = useToast();
  const { residentState } = useAppWebSocket();
  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null);
  const [mode, setMode] = useState<ResidentMode>('advisor');
  const [feed, setFeed] = useState<Array<Record<string, unknown>>>([]);
  const [pendingActions, setPendingActions] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  // Update from websocket
  useEffect(() => {
    if (residentState?.type === 'resident_tick') {
      setDashboard(prev => prev ? { ...prev, ...residentState } : residentState);
    }
  }, [residentState]);

  const isRunning = !!(dashboard as Record<string, unknown>)?.is_running;
  const status = (dashboard as Record<string, unknown>)?.status as string || 'idle';
  const tickCount = (dashboard as Record<string, unknown>)?.tick_count as number || 0;
  const errors = (dashboard as Record<string, unknown>)?.consecutive_errors as number || 0;
  const healthScore = (dashboard as Record<string, unknown>)?.health_score as number || 0;
  const lastThought = (dashboard as Record<string, unknown>)?.last_thought as string || '';

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
    try { await residentApi.runNow(); success('Cyklus spuštěn');  }
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
            <span className="text-muted"> • {status} • {tickCount} cyklů</span>
          </div>
        </div>
        <div className="status-actions">
          {isRunning ? (
            <>
              <button className="action-btn" onClick={handleRunNow} disabled={!!actionLoading}>
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
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
