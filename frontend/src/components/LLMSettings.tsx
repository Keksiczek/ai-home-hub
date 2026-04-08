import { useState, useEffect } from 'react';
import { Cpu, Save, Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface LLMSettingsData {
  models?: Record<string, string>;
  default_model?: string;
  provider?: string;
  base_url?: string;
  [key: string]: unknown;
}

interface PerfSettings {
  context_length: number;
  kv_cache_type: string;
  flash_attention: boolean;
  num_parallel: number;
  keep_alive: string;
}

export function LLMSettings() {
  const [settings, setSettings] = useState<LLMSettingsData>({});
  const [perf, setPerf] = useState<PerfSettings>({
    context_length: 4096, kv_cache_type: 'q8_0', flash_attention: true,
    num_parallel: 1, keep_alive: '5m',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testOk, setTestOk] = useState<boolean | null>(null);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [llmRes, perfRes] = await Promise.all([
        fetch('/api/llm/settings'),
        fetch('/api/settings/llm'),
      ]);
      if (llmRes.ok) {
        const data = await llmRes.json();
        setSettings(data.settings || data);
      }
      if (perfRes.ok) {
        const data = await perfRes.json();
        setPerf(p => ({ ...p, ...(data.performance || {}) }));
      }
    } catch {
      setMessage({ type: 'error', text: 'Nepodařilo se načíst nastavení' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const savePerf = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/settings/llm', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ollama_performance: perf }),
      });
      if (res.ok) {
        setMessage({ type: 'ok', text: 'Nastavení uloženo' });
      } else {
        setMessage({ type: 'error', text: await res.text() });
      }
    } catch {
      setMessage({ type: 'error', text: 'Chyba při ukládání' });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setTestOk(null);
    try {
      const res = await fetch('/api/llm/test', { method: 'POST' });
      setTestOk(res.ok);
    } catch {
      setTestOk(false);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return <div className="empty-state"><Loader2 size={32} className="spinner" /></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px',
          background: message.type === 'ok' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          color: message.type === 'ok' ? '#10b981' : '#ef4444',
          fontSize: '0.9rem',
        }}>
          {message.text}
        </div>
      )}

      {/* Connection test */}
      <section className="card glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} style={{ color: 'var(--primary-accent)' }} />
            Ollama Connection
          </h3>
          <button
            onClick={testConnection}
            disabled={testing}
            style={{
              padding: '6px 14px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--text-muted)', fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            {testing ? <Loader2 size={14} className="spinner" /> : (
              testOk === null ? <Wifi size={14} /> : testOk ? <Wifi size={14} style={{ color: '#10b981' }} /> : <WifiOff size={14} style={{ color: '#ef4444' }} />
            )}
            Test
          </button>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Provider: <code style={{ color: 'var(--text-main)' }}>{settings.provider || 'ollama'}</code>
          {settings.base_url && <span> | URL: <code style={{ color: 'var(--text-main)' }}>{settings.base_url}</code></span>}
          {settings.default_model && <span> | Model: <code style={{ color: 'var(--text-main)' }}>{settings.default_model}</code></span>}
        </div>
      </section>

      {/* Performance settings */}
      <section className="card glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem' }}>Výkon Ollama</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <SettingRow label="Context Length" value={
            <select
              value={perf.context_length}
              onChange={e => setPerf(p => ({ ...p, context_length: parseInt(e.target.value) }))}
              style={selectStyle}
            >
              {[2048, 4096, 8192, 16384, 32768].map(v => (
                <option key={v} value={v}>{v.toLocaleString()}</option>
              ))}
            </select>
          } />
          <SettingRow label="KV Cache Type" value={
            <select
              value={perf.kv_cache_type}
              onChange={e => setPerf(p => ({ ...p, kv_cache_type: e.target.value }))}
              style={selectStyle}
            >
              {['f16', 'q8_0', 'q4_0'].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          } />
          <SettingRow label="Flash Attention" value={
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={perf.flash_attention}
                onChange={e => setPerf(p => ({ ...p, flash_attention: e.target.checked }))}
                style={{ accentColor: 'var(--primary-accent)' }}
              />
              <span style={{ fontSize: '0.85rem' }}>{perf.flash_attention ? 'Zapnuto' : 'Vypnuto'}</span>
            </label>
          } />
          <SettingRow label="Num Parallel" value={
            <input
              type="number"
              min={1}
              max={8}
              value={perf.num_parallel}
              onChange={e => setPerf(p => ({ ...p, num_parallel: parseInt(e.target.value) || 1 }))}
              style={inputStyle}
            />
          } />
          <SettingRow label="Keep Alive" value={
            <input
              type="text"
              value={perf.keep_alive}
              onChange={e => setPerf(p => ({ ...p, keep_alive: e.target.value }))}
              placeholder="5m"
              style={inputStyle}
            />
          } />
        </div>
      </section>

      {/* Save */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={savePerf}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', background: 'var(--primary-accent)',
            color: 'white', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600,
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? <Loader2 size={16} className="spinner" /> : <Save size={16} />}
          Uložit
        </button>
        <button
          onClick={fetchAll}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', background: 'rgba(255,255,255,0.06)',
            color: 'var(--text-muted)', borderRadius: '8px', fontSize: '0.9rem',
          }}
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  background: 'var(--bg-deep)', color: 'var(--text-main)',
  border: '1px solid var(--border-subtle)', borderRadius: '6px',
  padding: '6px 10px', fontSize: '0.85rem',
};

const inputStyle: React.CSSProperties = {
  ...selectStyle, width: '100px',
};

function SettingRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{label}</span>
      {value}
    </div>
  );
}
