import { useAppWebSocket } from '../context/AppWebSocketContext';
import { motion } from 'framer-motion';

export function Dashboard() {
  const { activityState } = useAppWebSocket();

  // Parse state with defaults
  const resources = activityState?.resources || {};
  const ramUsed = resources.ram_used_mb ? (resources.ram_used_mb / 1024).toFixed(1) : '0';
  const ramTotal = resources.ram_total_mb ? (resources.ram_total_mb / 1024).toFixed(1) : '8';
  const ramPct = resources.ram_total_mb ? (resources.ram_used_mb / resources.ram_total_mb) * 100 : 0;
  
  const jobs = activityState?.jobs || {};
  const activeJobs = jobs.total_active || 0;

  const ollama = activityState?.ollama || {};
  const isOllamaRunning = ollama.status === 'running';

  const residentStatus = activityState?.resident?.status || 'idle';

  return (
    <div className="dashboard-grid">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="card glass-panel stat-card"
      >
        <h3>System Resources</h3>
        <p>RAM: {ramUsed} GB / {ramTotal} GB</p>
        {/* Inline styles to avoid conflict with Chat.css .progress-bar definition */}
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden', marginTop: '8px' }}>
          <motion.div
            style={{ height: '100%', background: 'var(--primary-accent)', borderRadius: '9999px' }}
            initial={{ width: 0 }}
            animate={{ width: `${ramPct}%` }}
            transition={{ type: 'spring', bounce: 0.2 }}
          />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="card glass-panel stat-card"
      >
        <h3>Queued Jobs</h3>
        <p className="big-stat">{activeJobs}</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="card glass-panel stat-card"
      >
        <h3>Ollama Status</h3>
        <p className="big-stat" style={{ color: isOllamaRunning ? 'var(--secondary-accent)' : 'var(--text-muted)' }}>
          {isOllamaRunning ? 'Running' : 'Stopped'}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card glass-panel main-panel"
      >
        <h3>Resident Status</h3>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 1.5rem' }}>
          Aktuální stav agenta: <strong style={{ color: 'var(--text-main)' }}>{residentStatus.toUpperCase()}</strong>
        </p>
        <div style={{
          padding: '1rem',
          background: 'var(--bg-deep)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}>
          Historie aktivity není k dispozici — přejděte do sekce <em>Resident AI</em> pro detailní přehled.
        </div>
      </motion.div>
    </div>
  );
}
