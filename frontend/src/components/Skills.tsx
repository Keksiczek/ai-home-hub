import { useState, useEffect } from 'react';
import { Zap, Search, Loader2, ToggleLeft, ToggleRight, Play, RefreshCw } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  description?: string;
  enabled?: boolean;
  category?: string;
  tags?: string[];
}

export function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; ok: boolean; msg: string } | null>(null);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/skills?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSkills(data.skills || []);
      }
    } catch (e) {
      console.error('Failed to fetch skills', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSkills(); }, []);

  const toggleSkill = async (skill: Skill) => {
    const endpoint = skill.enabled ? `/api/skills-runtime/${skill.id}/disable` : `/api/skills-runtime/${skill.id}/enable`;
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      if (res.ok) fetchSkills();
    } catch (e) {
      console.error('Toggle failed', e);
    }
  };

  const testSkill = async (skill: Skill) => {
    setTesting(skill.id);
    setTestResult(null);
    try {
      const res = await fetch(`/api/skills-runtime/${skill.id}/test`, { method: 'POST' });
      const data = await res.json();
      setTestResult({ id: skill.id, ok: res.ok, msg: data.result || data.detail || 'OK' });
    } catch {
      setTestResult({ id: skill.id, ok: false, msg: 'Chyba připojení' });
    } finally {
      setTesting(null);
    }
  };

  const filteredSkills = search
    ? skills.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase()))
    : skills;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Search bar */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)',
          borderRadius: '8px', padding: '8px 12px',
        }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchSkills()}
            placeholder="Hledat skills..."
            style={{
              flex: 1, background: 'transparent', border: 'none', color: 'var(--text-main)',
              fontSize: '0.9rem', outline: 'none',
            }}
          />
        </div>
        <button
          onClick={fetchSkills}
          style={{
            padding: '8px 12px', background: 'rgba(255,255,255,0.06)',
            borderRadius: '8px', color: 'var(--text-muted)',
          }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Skills list */}
      {loading ? (
        <div className="empty-state">
          <Loader2 size={32} className="spinner" />
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="empty-state">
          <Zap size={48} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
          <p style={{ color: 'var(--text-muted)' }}>Žádné skills nenalezeny</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredSkills.map(skill => (
            <div
              key={skill.id}
              className="card glass-panel"
              style={{
                padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '16px',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{skill.name}</span>
                  {skill.category && (
                    <span style={{
                      fontSize: '0.7rem', padding: '2px 8px',
                      background: 'rgba(255,255,255,0.06)', borderRadius: '4px',
                      color: 'var(--text-muted)',
                    }}>
                      {skill.category}
                    </span>
                  )}
                </div>
                {skill.description && (
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {skill.description}
                  </p>
                )}
                {testResult?.id === skill.id && (
                  <div style={{
                    marginTop: '8px', fontSize: '0.8rem',
                    color: testResult.ok ? '#10b981' : '#ef4444',
                  }}>
                    {testResult.msg}
                  </div>
                )}
              </div>
              <button
                onClick={() => testSkill(skill)}
                disabled={testing === skill.id}
                style={{
                  padding: '6px 10px', borderRadius: '6px',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'var(--text-muted)', fontSize: '0.8rem',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                {testing === skill.id ? <Loader2 size={14} className="spinner" /> : <Play size={14} />}
                Test
              </button>
              <button
                onClick={() => toggleSkill(skill)}
                style={{ background: 'transparent', padding: '4px' }}
                title={skill.enabled ? 'Vypnout' : 'Zapnout'}
              >
                {skill.enabled
                  ? <ToggleRight size={24} style={{ color: '#10b981' }} />
                  : <ToggleLeft size={24} style={{ color: 'var(--text-muted)' }} />
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
