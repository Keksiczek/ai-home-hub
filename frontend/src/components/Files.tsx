import { useState, useEffect } from 'react';
import {
  Folder, FileText, Image as ImageIcon, File, Trash2,
  ArrowLeft, ChevronRight, Search, RefreshCw, Loader2, Database,
} from 'lucide-react';
import { filesApi } from '../api';
import { useToast } from '../context/ToastContext';
import { PageShell } from './PageShell';

interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  modified: number;
  extension: string;
  is_image: boolean;
}

function formatSize(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function FileIcon({ entry }: { entry: FileEntry }) {
  if (entry.is_dir) return <Folder size={16} style={{ color: '#60a5fa', flexShrink: 0 }} />;
  if (entry.is_image) return <ImageIcon size={16} style={{ color: '#a78bfa', flexShrink: 0 }} />;
  if (['.txt', '.md', '.py', '.js', '.ts', '.json', '.yaml', '.toml', '.csv'].includes(entry.extension))
    return <FileText size={16} style={{ color: '#34d399', flexShrink: 0 }} />;
  return <File size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />;
}

export function Files() {
  const [currentPath, setCurrentPath] = useState('data');
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const fetchFiles = async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await filesApi.listTree(path, 1);
      setEntries(data.entries);
      setCurrentPath(data.path);
    } catch (err: any) {
      setError(err.message || 'Nepodařilo se načíst soubory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(currentPath); }, []);

  const handleBack = () => {
    const parts = currentPath.split('/').filter(Boolean);
    if (parts.length > 1) {
      parts.pop();
      fetchFiles(parts.join('/'));
    }
  };

  const handleDelete = async (path: string, name: string) => {
    if (!confirm(`Smazat „${name}"?`)) return;
    try {
      await filesApi.delete(path);
      toast.success('Soubor smazán');
      fetchFiles(currentPath);
    } catch (err: any) {
      toast.error(`Chyba: ${err.message}`);
    }
  };

  const handleIndexKB = async (path: string, name: string) => {
    try {
      await filesApi.uploadToKb(path);
      toast.success(`${name} zařazen do indexace KB`);
    } catch (err: any) {
      toast.error(`Indexace selhala: ${err.message}`);
    }
  };

  const breadcrumbs = currentPath.split('/').filter(Boolean);
  const canGoBack = breadcrumbs.length > 1;
  const filtered = search
    ? entries.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
    : entries;

  return (
    <PageShell description="Procházení souborů v datovém adresáři aplikace. Soubory lze indexovat do Knowledge Base.">
      {/* Toolbar */}
      <div className="glass-panel" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
        <button
          onClick={handleBack}
          disabled={!canGoBack}
          title="Zpět"
          style={{ padding: '5px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', opacity: canGoBack ? 1 : 0.3, flexShrink: 0 }}
        >
          <ArrowLeft size={15} />
        </button>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flex: 1, fontSize: '0.82rem', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <Database size={13} style={{ color: 'var(--text-muted)', flexShrink: 0, marginRight: '2px' }} />
          {breadcrumbs.map((part, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {i > 0 && <ChevronRight size={11} style={{ opacity: 0.4, flexShrink: 0 }} />}
              <span style={{ color: i === breadcrumbs.length - 1 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                {part}
              </span>
            </span>
          ))}
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)',
          borderRadius: '6px', padding: '5px 10px',
        }}>
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filtrovat..."
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-main)',
              fontSize: '0.82rem', outline: 'none', width: '120px',
            }}
          />
        </div>

        <button
          onClick={() => fetchFiles(currentPath)}
          title="Obnovit"
          style={{ padding: '5px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}
        >
          <RefreshCw size={15} className={loading ? 'spinner' : ''} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && entries.length === 0 ? (
          <div className="empty-state">
            <Loader2 size={28} className="spinner" />
            <p style={{ color: 'var(--text-muted)' }}>Načítám soubory…</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <p style={{ color: '#ef4444', margin: 0, fontSize: '0.9rem' }}>{error}</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button className="action-btn small" onClick={() => fetchFiles(currentPath)}>
                <RefreshCw size={13} /> Zkusit znovu
              </button>
              {currentPath !== 'data' && (
                <button className="action-btn small" onClick={() => fetchFiles('data')}>
                  Zpět do kořene
                </button>
              )}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <File size={36} style={{ opacity: 0.25 }} />
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              {search ? 'Nic nenalezeno' : 'Složka je prázdná'}
            </p>
            {!search && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', opacity: 0.7 }}>
                Soubory lze přidat přes upload v Knowledge Base.
              </span>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filtered.map(entry => (
              <div
                key={entry.path}
                className="glass-panel"
                onClick={() => entry.is_dir && fetchFiles(entry.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 14px', borderRadius: '7px',
                  cursor: entry.is_dir ? 'pointer' : 'default',
                  transition: 'background 0.1s',
                }}
              >
                <FileIcon entry={entry} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.875rem', fontWeight: 500,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {entry.name}
                  </div>
                  {!entry.is_dir && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                      {formatSize(entry.size)}{entry.extension ? ` · ${entry.extension}` : ''}
                    </div>
                  )}
                </div>

                {!entry.is_dir && (
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button
                      onClick={e => { e.stopPropagation(); handleIndexKB(entry.path, entry.name); }}
                      title="Indexovat do Knowledge Base"
                      style={{
                        padding: '3px 8px', borderRadius: '5px', fontSize: '0.72rem', fontWeight: 600,
                        background: 'rgba(99,102,241,0.1)', color: 'var(--primary-accent)',
                        border: '1px solid rgba(99,102,241,0.2)',
                      }}
                    >
                      KB
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(entry.path, entry.name); }}
                      title="Smazat"
                      style={{ padding: '4px', borderRadius: '5px', color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
