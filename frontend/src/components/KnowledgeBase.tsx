import { useState, useEffect, useRef } from 'react';
import { Search, Upload, FileText, Trash2, Database, Loader, RefreshCw } from 'lucide-react';

interface KBFile {
  file_id: string;
  filename: string;
  size_bytes?: number;
  updated_at?: string;
  chunk_count?: number;
}

export function KnowledgeBase() {
  const [files, setFiles] = useState<KBFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/knowledge/files');
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (e) {
      console.error('Failed to fetch KB files', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setIsSearching(true);
      const res = await fetch(`/api/knowledge/search?q=${encodeURIComponent(searchQuery)}&top_k=5`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (e) {
      console.error('Failed to search KB', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < event.target.files.length; i++) {
       formData.append('files', event.target.files[i]);
    }
    formData.append('mode', 'index');
    formData.append('collection', 'knowledge_base');

    try {
      const res = await fetch('/api/knowledge/upload/batch', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        await fetchFiles();
      }
    } catch (e) {
      console.error('Upload failed', e);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
         fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const res = await fetch(`/api/knowledge/files/${encodeURIComponent(fileId)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchFiles();
      }
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  return (
    <div className="card glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px' }}>
      
      {/* Header controls */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <input 
             type="text" 
             placeholder="Hledat ve znalostní bázi..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
             style={{ 
               width: '100%', padding: '12px 16px 12px 40px', 
               background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)',
               borderRadius: 'var(--radius-md)', color: 'white', fontSize: '1rem'
             }}
          />
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
        </div>
        
        <button 
           className="hover-lift"
           onClick={handleSearch}
           disabled={isSearching}
           style={{ 
             background: 'var(--primary-accent)', color: 'white', 
             padding: '0 24px', borderRadius: 'var(--radius-md)', fontWeight: 600
           }}
        >
          {isSearching ? <Loader size={18} className="spin" /> : 'Hledat'}
        </button>

        <button 
           className="hover-lift"
           onClick={() => fileInputRef.current?.click()}
           disabled={uploading}
           style={{ 
             background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)',
             color: 'white', padding: '0 24px', borderRadius: 'var(--radius-md)', fontWeight: 500,
             display: 'flex', alignItems: 'center', gap: '8px'
           }}
        >
          {uploading ? <Loader size={18} className="spin" /> : <Upload size={18} />}
          <span>Nahrát soubor</span>
        </button>
        <input 
           type="file" 
           multiple 
           ref={fileInputRef} 
           style={{ display: 'none' }} 
           onChange={handleFileUpload} 
        />
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1, overflow: 'hidden' }}>
        
        {/* Search Results / File List */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
             {searchResults.length > 0 ? 'Výsledky vyhledávání' : 'Indexované Soubory'}
          </h3>
          
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {searchResults.length > 0 ? (
              searchResults.map((res, i) => (
                <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                   <div style={{ color: 'var(--primary-accent)', fontWeight: 600, marginBottom: '8px' }}>
                      {res.metadata?.source || 'Neznámý zdroj'}
                   </div>
                   <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                     {res.text}
                   </p>
                </div>
              ))
            ) : loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                 <RefreshCw size={24} className="spin" style={{ margin: '0 auto 16px' }} />
                 <p>Načítám znalostní bázi...</p>
              </div>
            ) : files.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                 <Database size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                 <p>Znalostní báze je prázdná.<br/>Nahrajte nějaké soubory k indexaci.</p>
              </div>
            ) : (
              files.map(f => (
                <div key={f.file_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FileText size={20} color="var(--secondary-accent)" />
                      <div>
                        <div style={{ fontWeight: 500 }}>{f.filename}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                           {(f.size_bytes || 0) / 1024 < 1024 ? `${Math.round((f.size_bytes || 0) / 1024)} KB` : `${Math.round((f.size_bytes || 0) / 1024 / 1024)} MB`}
                           {' • '}{f.chunk_count || 0} fragmentů
                        </div>
                      </div>
                   </div>
                   <button 
                      onClick={() => handleDelete(f.file_id)}
                      style={{ padding: '8px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)' }}
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              ))
            )}
          </div>
        </div>
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
