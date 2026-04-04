import { useState } from 'react';
import { Gamepad2, Box, Code, Loader, Play } from 'lucide-react';

export function CreativeStudio() {
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'game' | 'scad' | 'ascii'>('game');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setResult(null);

    const endpoint = `/api/creative/${activeTab}`;
    const payload: any = { prompt };
    
    if (activeTab === 'ascii') {
      payload.width = 60;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        console.error('Generation failed', await res.text());
        setResult({ error: 'Něco se pokazilo při generování.' });
      }
    } catch (e) {
      console.error('Network error', e);
      setResult({ error: 'Chyba sítě.' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="card glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px' }}>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <button 
          className={`nav-item ${activeTab === 'game' ? 'active' : ''}`}
          onClick={() => { setActiveTab('game'); setResult(null); }}
          style={{ width: 'auto', padding: '8px 16px', background: activeTab === 'game' ? 'rgba(255,255,255,0.05)' : 'transparent' }}
        >
          <Gamepad2 size={18} /> HTML5 Hra
        </button>
        <button 
          className={`nav-item ${activeTab === 'scad' ? 'active' : ''}`}
          onClick={() => { setActiveTab('scad'); setResult(null); }}
          style={{ width: 'auto', padding: '8px 16px', background: activeTab === 'scad' ? 'rgba(255,255,255,0.05)' : 'transparent' }}
        >
          <Box size={18} /> OpenSCAD 3D
        </button>
        <button 
          className={`nav-item ${activeTab === 'ascii' ? 'active' : ''}`}
          onClick={() => { setActiveTab('ascii'); setResult(null); }}
          style={{ width: 'auto', padding: '8px 16px', background: activeTab === 'ascii' ? 'rgba(255,255,255,0.05)' : 'transparent' }}
        >
          <Code size={18} /> ASCII Art
        </button>
      </div>

      {/* Input area */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            activeTab === 'game' ? 'Popište jednoduchou HTML5 Canvas hru (např. Had s počítadlem skóre)...' : 
            activeTab === 'scad' ? 'Popište 3D objekt pro tisk (např. stojánek na mobil s výřezem na kabel)...' : 
            'Co chcete vykreslit v ASCII artu?'
          }
          style={{
            flex: 1, height: '80px', padding: '12px', resize: 'none',
            background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)', color: 'white'
          }}
          disabled={isGenerating}
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="hover-lift"
          style={{
            background: 'var(--primary-accent)', color: 'white', padding: '0 24px',
            borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', opacity: (isGenerating || !prompt.trim()) ? 0.5 : 1
          }}
        >
          {isGenerating ? <Loader size={20} className="spin" /> : <Play size={20} />}
          Generovat
        </button>
      </div>

      {/* Result Area */}
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {isGenerating ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader size={32} className="spin" style={{ margin: '0 auto 16px', color: 'var(--primary-accent)' }} />
            <p style={{ margin: 0 }}>Modely pracují na vašem výtvoru...<br/>Může to trvat několik minut dle zátěže.</p>
          </div>
        ) : result ? (
          result.error ? (
            <div style={{ margin: 'auto', color: '#ef4444' }}>{result.error}</div>
          ) : activeTab === 'game' && result.code ? (
            <iframe 
              srcDoc={result.code} 
              style={{ width: '100%', height: '100%', border: 'none', background: 'white' }} 
              sandbox="allow-scripts allow-same-origin"
            />
          ) : activeTab === 'scad' && result.code ? (
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <h3 style={{ marginTop: 0 }}>Vygenerovaný OpenSCAD Kód</h3>
              <pre style={{ background: '#1e1e1e', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '0.9rem', color: '#d4d4d4' }}>
                {result.code}
              </pre>
            </div>
          ) : activeTab === 'ascii' && result.payload ? (
            <div style={{ padding: '24px', overflowY: 'auto', textAlign: 'center', width: '100%' }}>
              <pre style={{ display: 'inline-block', textAlign: 'left', background: '#000', padding: '24px', borderRadius: '8px', fontSize: '0.75rem', lineHeight: 1.2, color: 'var(--secondary-accent)', fontFamily: 'monospace' }}>
                {result.payload}
              </pre>
            </div>
          ) : (
             <div style={{ margin: 'auto', color: 'var(--text-muted)' }}>Neznámý výstup.</div>
          )
        ) : (
          <div style={{ margin: 'auto', color: 'var(--text-muted)' }}>
            Zadejte prompt a klikněte na "Generovat".
          </div>
        )}
      </div>

      <style>
        {`
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}
      </style>
    </div>
  );
}
