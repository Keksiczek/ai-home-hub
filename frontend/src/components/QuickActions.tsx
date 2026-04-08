import { useState, useEffect } from 'react';
import { Wrench, Plus, Trash2, Play, Loader2, X } from 'lucide-react';

interface QuickAction {
  id: string;
  name: string;
  description?: string;
  steps?: Array<{ service: string; action: string; params?: Record<string, unknown> }>;
}

export function QuickActions() {
  const [actions, setActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<{ id: string; ok: boolean; msg: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const fetchActions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings/quick-actions');
      if (res.ok) {
        const data = await res.json();
        setActions(data.actions || []);
      }
    } catch (e) {
      console.error('Failed to fetch actions', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActions(); }, []);

  const runAction = async (action: QuickAction) => {
    setRunning(action.id);
    setRunResult(null);
    try {
      const res = await fetch('/api/actions/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_id: action.id, name: action.name, steps: action.steps || [] }),
      });
      const data = await res.json();
      setRunResult({ id: action.id, ok: res.ok, msg: data.message || data.detail || 'Hotovo' });
    } catch {
      setRunResult({ id: action.id, ok: false, msg: 'Chyba připojení' });
    } finally {
      setRunning(null);
    }
  };

  const deleteAction = async (id: string) => {
    try {
      await fetch(`/api/settings/quick-actions/${id}`, { method: 'DELETE' });
      fetchActions();
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  const createAction = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch('/api/settings/quick-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc, steps: [] }),
      });
      if (res.ok) {
        setNewName('');
        setNewDesc('');
        setShowForm(false);
        fetchActions();
      }
    } catch (e) {
      console.error('Create failed', e);
    }
  };

  if (loading) {
    return <div className="empty-state"><Loader2 size={32} className="spinner" /></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Rychlé akce pro automatizaci.
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', background: 'var(--primary-accent)',
            color: 'white', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
          }}
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'Zrušit' : 'Nová akce'}
        </button>
      </div>

      {showForm && (
        <div className="card glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Název akce"
            style={{
              background: 'var(--bg-deep)', color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)', borderRadius: '8px',
              padding: '10px 12px', fontSize: '0.9rem',
            }}
          />
          <input
            type="text"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Popis (volitelné)"
            style={{
              background: 'var(--bg-deep)', color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)', borderRadius: '8px',
              padding: '10px 12px', fontSize: '0.9rem',
            }}
          />
          <button
            onClick={createAction}
            disabled={!newName.trim()}
            style={{
              alignSelf: 'flex-start', padding: '8px 16px',
              background: 'var(--primary-accent)', color: 'white',
              borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
              opacity: newName.trim() ? 1 : 0.5,
            }}
          >
            Vytvořit
          </button>
        </div>
      )}

      {actions.length === 0 ? (
        <div className="empty-state" style={{ minHeight: '200px' }}>
          <Wrench size={48} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
          <p style={{ color: 'var(--text-muted)' }}>Žádné rychlé akce</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {actions.map(action => (
            <div
              key={action.id}
              className="card glass-panel"
              style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}
            >
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{action.name}</span>
                {action.description && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {action.description}
                  </p>
                )}
                {runResult?.id === action.id && (
                  <div style={{
                    marginTop: '6px', fontSize: '0.8rem',
                    color: runResult.ok ? '#10b981' : '#ef4444',
                  }}>
                    {runResult.msg}
                  </div>
                )}
              </div>
              <button
                onClick={() => runAction(action)}
                disabled={running === action.id}
                style={{
                  padding: '6px 12px', borderRadius: '6px',
                  background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem',
                }}
              >
                {running === action.id ? <Loader2 size={14} className="spinner" /> : <Play size={14} />}
                Spustit
              </button>
              <button
                onClick={() => deleteAction(action.id)}
                style={{ padding: '6px', background: 'transparent', color: 'var(--text-muted)' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
