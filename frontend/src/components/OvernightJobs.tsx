import { useState, useEffect } from 'react';
import { Moon, Play, Loader2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

interface OvernightStatus {
  is_night_window: boolean;
  night_window: { start: string; end: string };
  last_run: Record<string, { date?: string; timestamp?: string; preview?: string; result?: string } | null>;
  next_scheduled: string;
}

const JOB_LABELS: Record<string, string> = {
  kb_reindex: 'KB Reindex',
  git_sweep: 'Git Sweep',
  nightly_summary: 'Noční shrnutí',
};

export function OvernightJobs() {
  const [status, setStatus] = useState<OvernightStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<{ job: string; ok: boolean; msg: string } | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/overnight/status');
      if (res.ok) {
        setStatus(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch overnight status', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const runJob = async (jobName: string) => {
    setRunning(jobName);
    setRunResult(null);
    try {
      const res = await fetch(`/api/overnight/run/${jobName}`, { method: 'POST' });
      const data = await res.json();
      setRunResult({
        job: jobName,
        ok: res.ok,
        msg: data.job_id ? `Zařazeno: ${data.job_id}` : (data.detail || 'OK'),
      });
      setTimeout(fetchStatus, 2000);
    } catch {
      setRunResult({ job: jobName, ok: false, msg: 'Chyba připojení' });
    } finally {
      setRunning(null);
    }
  };

  if (loading) {
    return <div className="empty-state"><Loader2 size={32} className="spinner" /></div>;
  }

  if (!status) {
    return (
      <div className="empty-state">
        <Moon size={48} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
        <p style={{ color: 'var(--text-muted)' }}>Nepodařilo se načíst stav nočních úloh</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px' }}>
      {/* Status header */}
      <div className="card glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: status.is_night_window ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Moon size={20} style={{ color: status.is_night_window ? 'var(--primary-accent)' : 'var(--text-muted)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            {status.is_night_window ? 'Noční okno aktivní' : 'Noční okno neaktivní'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Okno: {status.night_window.start} - {status.night_window.end} | Další: {status.next_scheduled}
          </div>
        </div>
        <button
          onClick={fetchStatus}
          style={{ padding: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', color: 'var(--text-muted)' }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {runResult && (
        <div style={{
          padding: '10px 14px', borderRadius: '8px',
          background: runResult.ok ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          color: runResult.ok ? '#10b981' : '#ef4444',
          fontSize: '0.85rem',
        }}>
          {runResult.msg}
        </div>
      )}

      {/* Job list */}
      {Object.entries(JOB_LABELS).map(([key, label]) => {
        const lastRun = status.last_run[key];
        return (
          <div
            key={key}
            className="card glass-panel"
            style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{label}</div>
              {lastRun ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={12} style={{ color: '#10b981' }} />
                  Poslední: {lastRun.date || lastRun.timestamp?.slice(0, 10) || 'neznámé'}
                  {lastRun.preview && <span> - {lastRun.preview.slice(0, 80)}...</span>}
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <XCircle size={12} style={{ opacity: 0.5 }} />
                  Zatím nespuštěno
                </div>
              )}
            </div>
            <button
              onClick={() => runJob(key)}
              disabled={running === key}
              style={{
                padding: '8px 14px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)',
                fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px',
                opacity: running === key ? 0.6 : 1,
              }}
            >
              {running === key ? <Loader2 size={14} className="spinner" /> : <Play size={14} />}
              Spustit
            </button>
          </div>
        );
      })}
    </div>
  );
}
