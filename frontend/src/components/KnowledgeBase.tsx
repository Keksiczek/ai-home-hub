import { useState, useEffect, useRef } from 'react';
import { Search, Upload, FileText, Trash2, Database, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { PageShell } from './PageShell';

interface KBFile {
  file_id: string;
  filename: string;
  size_bytes?: number;
  updated_at?: string;
  chunk_count?: number;
}

interface SearchResult {
  text: string;
  metadata?: { source?: string };
  score?: number;
}

export function KnowledgeBase() {
  const [files, setFiles] = useState<KBFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/knowledge/files');
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      setFiles(data.files || []);
    } catch (e: any) {
      setFetchError(e.message || 'Nepodařilo se načíst soubory KB');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(); }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    try {
      const res = await fetch(
        `/api/knowledge/search?q=${encodeURIComponent(searchQuery)}&top_k=5`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e: any) {
      setSearchError(e.message || 'Vyhledávání selhalo');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    setUploading(true);
    setUploadMsg(null);
    const formData = new FormData();
    for (let i = 0; i < event.target.files.length; i++) {
      formData.append('files', event.target.files[i]);
    }
    formData.append('mode', 'index');
    formData.append('collection', 'knowledge_base');
    try {
      const res = await fetch('/api/knowledge/upload/batch', { method: 'POST', body: formData });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      setUploadMsg({ ok: true, text: `${event.target.files.length} soubor(ů) nahrán a zařazen do indexace.` });
      await fetchFiles();
    } catch (e: any) {
      setUploadMsg({ ok: false, text: e.message || 'Nahrávání selhalo' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const res = await fetch(`/api/knowledge/files/${encodeURIComponent(fileId)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchFiles();
    } catch (e: any) {
      setFetchError(`Smazání selhalo: ${e.message}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
  };

  const uploadAction = (
    <button
      onClick={() => fileInputRef.current?.click()}
      disabled={uploading}
      className="action-btn"
      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
    >
      {uploading ? <Loader2 size={14} className="spinner" /> : <Upload size={14} />}
      Nahrát soubor
    </button>
  );

  return (
    <PageShell
      description="Znalostní báze pro vyhledávání kontextu. Nahrajte dokumenty k indexaci a vyhledávejte relevantní části."
      action={uploadAction}
    >
      <input
        type="file"
        multiple
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* Upload feedback */}
      {uploadMsg && (
        <div style={{
          padding: '10px 14px', borderRadius: '8px', fontSize: '0.875rem',
          background: uploadMsg.ok ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          color: uploadMsg.ok ? '#10b981' : '#ef4444', flexShrink: 0,
        }}>
          {uploadMsg.text}
        </div>
      )}

      {/* Search bar */}
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)',
          borderRadius: '8px', padding: '8px 12px',
        }}>
          <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Hledat ve znalostní bázi…"
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
          />
          {searchQuery && (
            <button onClick={clearSearch} style={{ color: 'var(--text-muted)', padding: '2px' }}>×</button>
          )}
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="action-btn primary"
        >
          {isSearching ? <Loader2 size={14} className="spinner" /> : 'Hledat'}
        </button>
      </div>

      {/* Search error */}
      {searchError && (
        <div style={{
          padding: '10px 14px', borderRadius: '8px', fontSize: '0.875rem',
          background: 'rgba(239,68,68,0.1)', color: '#ef4444',
          display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
        }}>
          <AlertCircle size={14} /> {searchError}
        </div>
      )}

      {/* Main content: search results OR file list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {searchResults.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{searchResults.length} výsledků pro „{searchQuery}"</span>
              <button className="action-btn small" onClick={clearSearch}>Zpět na soubory</button>
            </div>
            {searchResults.map((result, i) => (
              <div key={i} className="glass-panel" style={{ padding: '14px 16px', borderRadius: '8px' }}>
                <div style={{ color: 'var(--primary-accent)', fontWeight: 600, fontSize: '0.82rem', marginBottom: '6px' }}>
                  {result.metadata?.source || 'Neznámý zdroj'}
                  {result.score != null && (
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '8px' }}>
                      skóre: {result.score.toFixed(3)}
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  {result.text}
                </p>
              </div>
            ))}
          </div>
        ) : loading ? (
          <div className="empty-state">
            <Loader2 size={28} className="spinner" />
            <p style={{ color: 'var(--text-muted)' }}>Načítám znalostní bázi…</p>
          </div>
        ) : fetchError ? (
          <div className="empty-state">
            <AlertCircle size={36} style={{ color: '#ef4444', opacity: 0.7 }} />
            <p style={{ color: '#ef4444', margin: 0, fontSize: '0.9rem' }}>{fetchError}</p>
            <button className="action-btn small" onClick={fetchFiles} style={{ marginTop: '4px' }}>
              <RefreshCw size={13} /> Zkusit znovu
            </button>
          </div>
        ) : files.length === 0 ? (
          <div className="empty-state-box glass-panel">
            <Database size={40} style={{ opacity: 0.25 }} />
            <p style={{ margin: 0 }}>Znalostní báze je prázdná</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', opacity: 0.7 }}>
              Nahrajte dokumenty pomocí tlačítka výše. Podporované formáty: .txt, .md, .pdf, .docx
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', padding: '0 2px' }}>
              {files.length} indexovaných {files.length === 1 ? 'soubor' : files.length < 5 ? 'soubory' : 'souborů'}
            </div>
            {files.map(f => (
              <div key={f.file_id} className="glass-panel" style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: '7px',
              }}>
                <FileText size={15} style={{ color: 'var(--primary-accent)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.filename}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                    {f.size_bytes ? `${Math.round(f.size_bytes / 1024)} KB` : '—'}
                    {f.chunk_count != null && ` · ${f.chunk_count} fragmentů`}
                    {f.updated_at && ` · ${new Date(f.updated_at).toLocaleDateString('cs-CZ')}`}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(f.file_id)}
                  title="Smazat z KB"
                  style={{ padding: '5px', color: '#ef4444', background: 'rgba(239,68,68,0.08)', borderRadius: '5px', flexShrink: 0 }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
