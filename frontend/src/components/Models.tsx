import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Download, Trash2, Search, HardDrive, Cpu,
  Loader2, AlertTriangle, RefreshCw,
  Star, Shield, X
} from 'lucide-react';
import { modelsApi } from '../api';
import { useToast } from '../context/ToastContext';

interface Model {
  name: string;
  size: number;
  modified_at?: string;
  is_uncensored: boolean;
  eligible_for_primary: boolean;
  quality_flags: string[];
  details?: {
    parameter_size?: string;
    quantization_level?: string;
    family?: string;
  };
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

export function Models() {
  const { success, error: showError } = useToast();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<Record<string, unknown>>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pullingModel, setPullingModel] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState(0);
  const [deletingModel, setDeletingModel] = useState<string | null>(null);
  const [disk, setDisk] = useState<Record<string, unknown> | null>(null);
  const [connection, setConnection] = useState<Record<string, unknown> | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [modelsData, diskData, connData] = await Promise.all([
        modelsApi.installed(),
        modelsApi.disk().catch(() => null),
        modelsApi.testConnection().catch(() => null),
      ]);
      setModels(modelsData.models as Model[]);
      if (diskData) setDisk(diskData);
      if (connData) setConnection(connData);
    } catch {
      showError('Nepodařilo se načíst modely');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const data = await modelsApi.searchOllama(searchQuery);
      setSearchResults(data.results as Array<Record<string, unknown>>);
    } catch {
      showError('Vyhledávání selhalo');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePull = async (name: string) => {
    setPullingModel(name);
    setPullProgress(0);
    try {
      const res = await modelsApi.pull(name);
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream');
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.percent != null) setPullProgress(data.percent);
            if (data.status === 'error') {
              showError(data.message || 'Stahování selhalo');
              break;
            }
            if (data.status === 'success') {
              success(`Model ${name} stažen!`);
              refresh();
            }
          } catch { /* skip */ }
        }
      }
    } catch {
      showError('Stahování selhalo');
    } finally {
      setPullingModel(null);
      setPullProgress(0);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Opravdu smazat model ${name}?`)) return;
    setDeletingModel(name);
    try {
      await modelsApi.delete(name);
      success(`Model ${name} smazán`);
      refresh();
    } catch {
      showError('Smazání selhalo');
    } finally {
      setDeletingModel(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-center">
        <Loader2 size={32} className="spinner" />
        <p>Načítám modely...</p>
      </div>
    );
  }

  return (
    <div className="models-layout">
      {/* Connection + Disk Info */}
      <div className="models-info-row">
        <div className="info-chip glass-panel">
          <Cpu size={16} />
          <span>Ollama: {connection?.status === 'ok' ? (
            <span style={{ color: '#10b981' }}>Online (v{connection.version as string})</span>
          ) : (
            <span style={{ color: '#ef4444' }}>Offline</span>
          )}</span>
        </div>
        {disk && (
          <div className="info-chip glass-panel">
            <HardDrive size={16} />
            <span>Disk: {formatSize((disk.used as number) || 0)} / {formatSize((disk.total as number) || 0)}</span>
          </div>
        )}
        <div className="info-chip glass-panel">
          <Box size={16} />
          <span>{models.length} nainstalovaných</span>
        </div>
        <button className="action-btn small" onClick={refresh}><RefreshCw size={14} /></button>
      </div>

      {/* Pull Progress */}
      <AnimatePresence>
        {pullingModel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pull-progress glass-panel"
          >
            <div className="pull-info">
              <Download size={18} className="spinner" />
              <span>Stahuji <strong>{pullingModel}</strong>...</span>
              <span>{pullProgress}%</span>
            </div>
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                animate={{ width: `${pullProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search / Pull Section */}
      <div className="models-search glass-panel">
        <div className="search-header">
          <h3>
            {showSearch ? (
              <><Search size={18} /> Stáhnout nový model</>
            ) : (
              <><Box size={18} /> Nainstalované modely</>
            )}
          </h3>
          <button className="action-btn small" onClick={() => setShowSearch(!showSearch)}>
            {showSearch ? <><X size={14} /> Zavřít</> : <><Download size={14} /> Stáhnout</>}
          </button>
        </div>

        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="search-body"
            >
              <div className="search-input-wrap">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Hledat modely v Ollama knihovně..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="glass-input"
                />
                <button className="action-btn small primary" onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? <Loader2 size={14} className="spinner" /> : 'Hledat'}
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((r, i) => (
                    <div key={i} className="search-result-item">
                      <div>
                        <strong>{r.name as string}</strong>
                        {r.description ? <span className="text-muted"> – {String(r.description).slice(0, 80)}</span> : null}
                      </div>
                      <button
                        className="action-btn small primary"
                        onClick={() => handlePull(r.name as string)}
                        disabled={!!pullingModel}
                      >
                        <Download size={14} /> Pull
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Model Grid */}
      <div className="models-grid">
        {models.map((model, i) => (
          <motion.div
            key={model.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="model-card glass-panel hover-lift"
          >
            <div className="model-card-header">
              <div className="model-name">
                <Box size={18} />
                <strong>{model.name}</strong>
              </div>
              {model.is_uncensored && (
                <span className="badge badge-warning"><AlertTriangle size={12} /> Uncensored</span>
              )}
            </div>
            <div className="model-details text-muted">
              <span>{formatSize(model.size)}</span>
              {model.details?.parameter_size && <span> • {model.details.parameter_size}</span>}
              {model.details?.quantization_level && <span> • {model.details.quantization_level}</span>}
              {model.details?.family && <span> • {model.details.family}</span>}
            </div>
            {model.quality_flags.length > 0 && (
              <div className="model-flags">
                {model.quality_flags.map(f => (
                  <span key={f} className={`badge ${f === 'good' ? 'badge-success' : f === 'warn' ? 'badge-warning' : 'badge-info'}`}>
                    {f === 'good' ? <Star size={10} /> : <Shield size={10} />} {f}
                  </span>
                ))}
              </div>
            )}
            <div className="model-actions">
              <button
                className="action-btn small danger"
                onClick={() => handleDelete(model.name)}
                disabled={deletingModel === model.name}
              >
                {deletingModel === model.name ? <Loader2 size={14} className="spinner" /> : <Trash2 size={14} />}
                Smazat
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
