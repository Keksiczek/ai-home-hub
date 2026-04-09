import { useState, useEffect, useCallback } from 'react';
import {
  Users, CheckCircle2, AlertCircle, Clock, Trash2,
  StopCircle, RefreshCw, Loader2,
} from 'lucide-react';
import { agentsApi } from '../api';
import { useToast } from '../context/ToastContext';
import { PageShell } from './PageShell';

interface Agent {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'aborted';
  task: { goal: string; [k: string]: unknown };
  progress?: number;
  created_at: string;
  finished_at?: string;
  artifacts_count: number;
}

const STATUS_CONF: Record<string, { label: string; color: string; badgeClass: string }> = {
  pending:  { label: 'Čeká',     color: '#71717a', badgeClass: '' },
  running:  { label: 'Běží',     color: '#60a5fa', badgeClass: 'badge-info' },
  success:  { label: 'Hotovo',   color: '#10b981', badgeClass: 'badge-success' },
  error:    { label: 'Chyba',    color: '#ef4444', badgeClass: 'badge-danger' },
  aborted:  { label: 'Přerušen', color: '#f59e0b', badgeClass: 'badge-warning' },
};

export function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchAgents = useCallback(async () => {
    try {
      const data = await agentsApi.list();
      setAgents(data.agents);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Nepodařilo se načíst agenty');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const handleDelete = async (id: string) => {
    try {
      await agentsApi.delete(id);
      setAgents(prev => prev.filter(a => a.id !== id));
      toast.success('Agent odstraněn');
    } catch {
      toast.error('Chyba při odstraňování agenta');
    }
  };

  const handleInterrupt = async (id: string) => {
    try {
      await agentsApi.interrupt(id);
      toast.info('Požadavek na přerušení odeslán');
      fetchAgents();
    } catch {
      toast.error('Agenta nelze přerušit');
    }
  };

  const handleCleanup = async () => {
    try {
      const data = await agentsApi.cleanup();
      toast.success(`Odstraněno ${data.removed} neaktivních agentů`);
      fetchAgents();
    } catch {
      toast.error('Chyba při čištění');
    }
  };

  const actionBar = (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button className="action-btn small" onClick={handleCleanup} title="Odstranit dokončené agenty">
        <Trash2 size={13} /> Vyčistit
      </button>
      <button className="action-btn small" onClick={fetchAgents} title="Obnovit">
        <RefreshCw size={13} />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-center">
        <Loader2 size={28} className="spinner" />
        <p>Načítám agenty…</p>
      </div>
    );
  }

  return (
    <PageShell
      description="Přehled autonomních AI instancí spuštěných resident agentem nebo z fronty úloh."
      action={actionBar}
    >
      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px',
          background: 'rgba(239,68,68,0.1)', color: '#ef4444',
          fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span>{error}</span>
          <button className="action-btn small" onClick={fetchAgents}>
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {agents.length === 0 && !error ? (
        <div className="empty-state-box glass-panel">
          <Users size={40} style={{ opacity: 0.25 }} />
          <p style={{ margin: 0 }}>Žádní aktivní agenti</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', opacity: 0.7 }}>
            Agenti jsou spouštěni automaticky resident agentem nebo z Jobs.
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1 }}>
          {agents.map(agent => {
            const cfg = STATUS_CONF[agent.status] || STATUS_CONF.pending;
            const isRunning = agent.status === 'running';
            const isFinished = ['success', 'error', 'aborted'].includes(agent.status);

            return (
              <div key={agent.id} className="card glass-panel" style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  {/* Status icon */}
                  <div style={{ marginTop: '2px', flexShrink: 0 }}>
                    {agent.status === 'running'  && <Loader2     size={16} className="spinner" style={{ color: cfg.color }} />}
                    {agent.status === 'success'  && <CheckCircle2 size={16} style={{ color: cfg.color }} />}
                    {agent.status === 'error'    && <AlertCircle  size={16} style={{ color: cfg.color }} />}
                    {agent.status === 'aborted'  && <StopCircle   size={16} style={{ color: cfg.color }} />}
                    {agent.status === 'pending'  && <Clock        size={16} style={{ color: cfg.color }} />}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 500, fontSize: '0.875rem', marginBottom: '4px',
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {agent.task.goal}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'monospace' }}>{agent.id.slice(0, 12)}…</span>
                      <span>{agent.type}</span>
                      <span>{agent.artifacts_count} artefaktů</span>
                      <span>
                        {new Date(agent.created_at).toLocaleString('cs-CZ', {
                          day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={`badge ${cfg.badgeClass}`} style={!cfg.badgeClass ? { color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)' } : {}}>
                    {cfg.label}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    {isRunning && (
                      <button
                        onClick={() => handleInterrupt(agent.id)}
                        className="action-btn small"
                        title="Přerušit"
                        style={{ color: '#f59e0b' }}
                      >
                        <StopCircle size={13} />
                      </button>
                    )}
                    {isFinished && (
                      <button
                        onClick={() => handleDelete(agent.id)}
                        className="action-btn small danger"
                        title="Smazat"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
