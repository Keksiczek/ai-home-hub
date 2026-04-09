import { useState } from 'react';
import { RotateCcw, Power, Trash2, Loader2 } from 'lucide-react';

interface ActionResult {
  action: string;
  ok: boolean;
  msg: string;
}

export function ControlRoom() {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);

  const runAction = async (action: string, endpoint: string, method = 'POST') => {
    setLoading(action);
    setResult(null);
    try {
      const res = await fetch(`/api${endpoint}`, { method });
      const data = await res.json();
      setResult({
        action,
        ok: res.ok,
        msg: data.message || data.status || data.detail || JSON.stringify(data),
      });
    } catch {
      setResult({ action, ok: false, msg: 'Chyba připojení' });
    } finally {
      setLoading(null);
    }
  };

  const actions = [
    {
      id: 'force-cycle',
      label: 'Force Resident Cycle',
      desc: 'Okamžitě spustí nový cyklus Resident Agenta.',
      icon: RotateCcw,
      endpoint: '/control/resident/force-cycle',
      color: 'var(--primary-accent)',
    },
    {
      id: 'purge-kb-cache',
      label: 'Purge KB Cache',
      desc: 'Vymaže cache statistik Knowledge Base.',
      icon: Trash2,
      endpoint: '/control/kb/purge-cache',
      color: '#f59e0b',
    },
    {
      id: 'shutdown',
      label: 'Graceful Shutdown',
      desc: 'Ukončí server s uložením stavu.',
      icon: Power,
      endpoint: '/control/shutdown-graceful',
      color: '#ef4444',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Pokročilé systémové operace. Používejte s rozvahou.
      </p>

      {result && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px',
          background: result.ok ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          color: result.ok ? '#10b981' : '#ef4444',
          fontSize: '0.85rem',
        }}>
          <strong>{result.action}:</strong> {result.msg}
        </div>
      )}

      {actions.map(action => {
        const Icon = action.icon;
        const isLoading = loading === action.id;
        return (
          <div
            key={action.id}
            className="card glass-panel"
            style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: `${action.color}15`, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={20} style={{ color: action.color }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{action.label}</div>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {action.desc}
              </p>
            </div>
            <button
              onClick={() => runAction(action.id, action.endpoint)}
              disabled={isLoading}
              style={{
                padding: '8px 16px', borderRadius: '8px',
                background: `${action.color}20`, color: action.color,
                fontSize: '0.85rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '6px',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? <Loader2 size={14} className="spinner" /> : null}
              Spustit
            </button>
          </div>
        );
      })}
    </div>
  );
}
