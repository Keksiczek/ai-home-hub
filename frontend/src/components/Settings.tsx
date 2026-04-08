import { useState, useEffect } from 'react';
import { Save, RefreshCw, Loader2, Shield, Globe, Server } from 'lucide-react';

interface SettingsData {
  cors?: { allowed_origins?: string[] };
  tailscale?: { enable_funnel?: boolean; funnel_url?: string };
  cleanup?: Record<string, unknown>;
  [key: string]: unknown;
}

export function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [corsOrigins, setCorsOrigins] = useState('');
  const [funnelUrl, setFunnelUrl] = useState('');
  const [funnelEnabled, setFunnelEnabled] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        const s: SettingsData = data.settings || {};
        setCorsOrigins((s.cors?.allowed_origins || []).join('\n'));
        setFunnelUrl(s.tailscale?.funnel_url || '');
        setFunnelEnabled(s.tailscale?.enable_funnel || false);
      }
    } catch {
      setMessage({ type: 'error', text: 'Nepodařilo se načíst nastavení' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const origins = corsOrigins.split('\n').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            cors: { allowed_origins: origins },
            tailscale: { enable_funnel: funnelEnabled, funnel_url: funnelUrl },
          }
        }),
      });
      if (res.ok) {
        setMessage({ type: 'ok', text: 'Nastavení uloženo' });
      } else {
        const err = await res.text();
        setMessage({ type: 'error', text: err });
      }
    } catch {
      setMessage({ type: 'error', text: 'Chyba při ukládání' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="empty-state">
        <Loader2 size={32} className="spinner" />
        <p>Načítání nastavení...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '720px' }}>
      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          background: message.type === 'ok' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          color: message.type === 'ok' ? '#10b981' : '#ef4444',
          fontSize: '0.9rem',
        }}>
          {message.text}
        </div>
      )}

      {/* CORS Settings */}
      <section className="card glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Shield size={18} style={{ color: 'var(--primary-accent)' }} />
          <h3 style={{ margin: 0, fontSize: '1rem' }}>CORS Origins</h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 12px' }}>
          Povolené origins pro cross-origin požadavky (jeden na řádek).
        </p>
        <textarea
          value={corsOrigins}
          onChange={e => setCorsOrigins(e.target.value)}
          rows={4}
          style={{
            width: '100%',
            background: 'var(--bg-deep)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '0.85rem',
            fontFamily: 'monospace',
            resize: 'vertical',
          }}
          placeholder="http://localhost:8000&#10;https://your-tailscale-url.ts.net"
        />
      </section>

      {/* Tailscale */}
      <section className="card glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Globe size={18} style={{ color: 'var(--primary-accent)' }} />
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Tailscale</h3>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={funnelEnabled}
            onChange={e => setFunnelEnabled(e.target.checked)}
            style={{ accentColor: 'var(--primary-accent)' }}
          />
          <span style={{ fontSize: '0.9rem' }}>Povolit Tailscale Funnel</span>
        </label>
        <input
          type="text"
          value={funnelUrl}
          onChange={e => setFunnelUrl(e.target.value)}
          placeholder="https://hostname.tail040ffa.ts.net"
          style={{
            width: '100%',
            background: 'var(--bg-deep)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '0.85rem',
          }}
        />
      </section>

      {/* System Info */}
      <section className="card glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Server size={18} style={{ color: 'var(--text-muted)' }} />
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Systém</h3>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
          <div>API: <code style={{ color: 'var(--text-main)' }}>http://localhost:8000</code></div>
          <div>Ollama: <code style={{ color: 'var(--text-main)' }}>http://localhost:11434</code></div>
          {funnelUrl && <div>Tailscale: <code style={{ color: 'var(--text-main)' }}>{funnelUrl}</code></div>}
        </div>
      </section>

      {/* Save */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px',
            background: 'var(--primary-accent)',
            color: 'white',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? <Loader2 size={16} className="spinner" /> : <Save size={16} />}
          Uložit
        </button>
        <button
          onClick={fetchSettings}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.06)',
            color: 'var(--text-muted)',
            borderRadius: '8px',
            fontSize: '0.9rem',
          }}
        >
          <RefreshCw size={16} />
          Obnovit
        </button>
      </div>
    </div>
  );
}
