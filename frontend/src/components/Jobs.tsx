import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal, Play, Pause, RotateCw, Trash2, Clock,
  CheckCircle2, XCircle, AlertCircle, Loader2,
  ChevronDown, ChevronUp, RefreshCw, Search, X
} from 'lucide-react';
import { jobsApi } from '../api';
import { useToast } from '../context/ToastContext';
import { useAppWebSocket } from '../context/AppWebSocketContext';

interface JobItem {
  id: string;
  type: string;
  title: string;
  status: string;
  progress: number;
  priority: string;
  created_at: string;
  started_at?: string;
  finished_at?: string;
  duration_s?: number;
  output_summary?: string;
  has_error?: boolean;
  error_preview?: string;
}

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  queued: { icon: Clock, color: '#60a5fa', label: 'Ve frontě' },
  running: { icon: Loader2, color: '#f59e0b', label: 'Běží' },
  succeeded: { icon: CheckCircle2, color: '#10b981', label: 'Hotovo' },
  failed: { icon: XCircle, color: '#ef4444', label: 'Chyba' },
  cancelled: { icon: X, color: '#6b7280', label: 'Zrušeno' },
  paused: { icon: Pause, color: '#a78bfa', label: 'Pozastaveno' },
};

export function Jobs() {
  const { success, error: showError } = useToast();
  const { lastMessage } = useAppWebSocket();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'active' | 'history'>('active');

  const refresh = useCallback(async () => {
    try {
      if (tab === 'active') {
        const data = await jobsApi.queue();
        setJobs(data.queue as JobItem[]);
      } else {
        const data = await jobsApi.history(50);
        setJobs(data.jobs as JobItem[]);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { setLoading(true); refresh(); }, [refresh]);
  useEffect(() => {
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Listen for job updates via WebSocket
  useEffect(() => {
    if (lastMessage?.type === 'job_update') {
      refresh();
    }
  }, [lastMessage, refresh]);

  const handleCancel = async (id: string) => {
    try { await jobsApi.cancel(id); success('Job zrušen'); refresh(); }
    catch { showError('Zrušení selhalo'); }
  };
  const handlePause = async (id: string) => {
    try { await jobsApi.pause(id); success('Job pozastaven'); refresh(); }
    catch { showError('Pozastavení selhalo'); }
  };
  const handleResume = async (id: string) => {
    try { await jobsApi.resume(id); success('Job obnoven'); refresh(); }
    catch { showError('Obnovení selhalo'); }
  };
  const handleRetry = async (id: string) => {
    try { await jobsApi.retry(id); success('Job zařazen znovu'); refresh(); }
    catch { showError('Retry selhalo'); }
  };
  const handleDelete = async (id: string) => {
    try { await jobsApi.delete(id); success('Job smazán'); refresh(); }
    catch { showError('Smazání selhalo'); }
  };

  const filteredJobs = jobs.filter(j => {
    if (filter && j.status !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return j.title.toLowerCase().includes(q) || j.type.toLowerCase().includes(q);
    }
    return true;
  });

  const statusCounts = jobs.reduce((acc, j) => {
    acc[j.status] = (acc[j.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="jobs-layout">
      {/* Tabs + Filters */}
      <div className="jobs-toolbar glass-panel">
        <div className="jobs-tabs">
          <button className={`jobs-tab ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>
            <Terminal size={16} /> Aktivní fronta
          </button>
          <button className={`jobs-tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
            <Clock size={16} /> Historie
          </button>
        </div>
        <div className="jobs-filters">
          <div className="search-input-wrap">
            <Search size={16} />
            <input
              type="text"
              placeholder="Hledat joby..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="glass-input"
            />
          </div>
          <button className="action-btn small" onClick={refresh}><RefreshCw size={14} /></button>
        </div>
      </div>

      {/* Status badges */}
      <div className="status-badges">
        <button className={`status-badge ${filter === '' ? 'active' : ''}`} onClick={() => setFilter('')}>
          Všechny ({jobs.length})
        </button>
        {Object.entries(statusCounts).map(([s, count]) => {
          const cfg = statusConfig[s];
          return (
            <button
              key={s}
              className={`status-badge ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(filter === s ? '' : s)}
              style={{ borderColor: filter === s ? cfg?.color : undefined }}
            >
              {cfg?.label || s} ({count})
            </button>
          );
        })}
      </div>

      {/* Job List */}
      <div className="jobs-list">
        {loading ? (
          <div className="loading-center">
            <Loader2 size={24} className="spinner" />
            <p>Načítám joby...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="empty-state-box glass-panel">
            <Terminal size={48} style={{ opacity: 0.3 }} />
            <p>{tab === 'active' ? 'Fronta je prázdná – žádné aktivní joby' : 'Žádné joby v historii'}</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredJobs.map((job, i) => {
              const cfg = statusConfig[job.status] || statusConfig.queued;
              const StatusIcon = cfg.icon;
              const isExpanded = expandedJob === job.id;
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.02 }}
                  className="job-card glass-panel"
                >
                  <div className="job-row" onClick={() => setExpandedJob(isExpanded ? null : job.id)}>
                    <div className="job-status-icon" style={{ color: cfg.color }}>
                      <StatusIcon size={18} className={job.status === 'running' ? 'spinner' : ''} />
                    </div>
                    <div className="job-info">
                      <div className="job-title">{job.title}</div>
                      <div className="job-meta text-muted">
                        {job.type} • {job.priority}
                        {job.duration_s != null && ` • ${job.duration_s}s`}
                        {' • '}
                        {new Date(job.created_at).toLocaleString('cs-CZ', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric' })}
                      </div>
                    </div>
                    {job.status === 'running' && job.progress > 0 && (
                      <div className="job-progress-mini">
                        <div className="progress-bar" style={{ width: '60px' }}>
                          <div className="progress-fill" style={{ width: `${job.progress}%` }} />
                        </div>
                        <span>{job.progress}%</span>
                      </div>
                    )}
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="job-detail"
                      >
                        {job.output_summary && (
                          <div className="job-output">
                            <strong>Výstup:</strong> {job.output_summary}
                          </div>
                        )}
                        {job.has_error && job.error_preview && (
                          <div className="job-error">
                            <AlertCircle size={14} /> {job.error_preview}
                          </div>
                        )}
                        <div className="job-actions">
                          {(job.status === 'queued' || job.status === 'running') && (
                            <button className="action-btn small danger" onClick={() => handleCancel(job.id)}>
                              <X size={14} /> Zrušit
                            </button>
                          )}
                          {job.status === 'running' && (
                            <button className="action-btn small" onClick={() => handlePause(job.id)}>
                              <Pause size={14} /> Pozastavit
                            </button>
                          )}
                          {job.status === 'paused' && (
                            <button className="action-btn small primary" onClick={() => handleResume(job.id)}>
                              <Play size={14} /> Obnovit
                            </button>
                          )}
                          {(job.status === 'failed' || job.status === 'cancelled') && (
                            <button className="action-btn small" onClick={() => handleRetry(job.id)}>
                              <RotateCw size={14} /> Retry
                            </button>
                          )}
                          {['succeeded', 'failed', 'cancelled'].includes(job.status) && (
                            <button className="action-btn small danger" onClick={() => handleDelete(job.id)}>
                              <Trash2 size={14} /> Smazat
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
