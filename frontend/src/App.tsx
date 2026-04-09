import { useState, useEffect } from 'react';
import {
  Bot, Terminal, LayoutDashboard, Database, Settings as SettingsIcon, Activity,
  Folder, Users, Zap, ShieldAlert, Cpu, Gamepad2, Moon, Wrench, Menu, X,
  ExternalLink, Package, AlertTriangle, Box,
} from 'lucide-react';
import { useAppWebSocket } from './context/AppWebSocketContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Dashboard } from './components/Dashboard';
import { Chat } from './components/Chat';
import { KnowledgeBase } from './components/KnowledgeBase';
import { CreativeStudio } from './components/CreativeStudio';
import { ResidentAgent } from './components/ResidentAgent';
import { Jobs } from './components/Jobs';
import { Models } from './components/Models';
import { Files } from './components/Files';
import { Agents } from './components/Agents';
import { Skills } from './components/Skills';
import { QuickActions } from './components/QuickActions';
import { ControlRoom } from './components/ControlRoom';
import { OvernightJobs } from './components/OvernightJobs';
import { LLMSettings } from './components/LLMSettings';
import { Settings } from './components/Settings';
import './App.css';

// ── Navigation groups – IA: Core / Knowledge / Control / Models / System ──

const coreNavItems = [
  { id: 'chat',      label: 'Chat',         icon: Bot },
  { id: 'dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'resident',  label: 'Resident AI',  icon: Zap },
];

const knowledgeNavItems = [
  { id: 'knowledge', label: 'Knowledge Base', icon: Database },
  { id: 'files',     label: 'Soubory',        icon: Folder },
  { id: 'jobs',      label: 'Jobs',           icon: Terminal },
];

const controlNavItems = [
  { id: 'agents',       label: 'Agenti',        icon: Users },
  { id: 'skills',       label: 'Skills',        icon: Package },
  { id: 'actions',      label: 'Rychlé akce',   icon: Wrench },
  { id: 'control-room', label: 'Control Room',  icon: ShieldAlert },
  { id: 'overnight',    label: 'Noční úlohy',   icon: Moon },
];

const modelsNavItems = [
  { id: 'models',       label: 'Modely',         icon: Box },
  { id: 'llm-settings', label: 'LLM nastavení',  icon: Cpu },
];

const systemNavItems = [
  { id: 'settings', label: 'Nastavení',      icon: SettingsIcon },
  { id: 'creative', label: 'Creative Studio', icon: Gamepad2 },
];

const allNavItems = [
  ...coreNavItems,
  ...knowledgeNavItems,
  ...controlNavItems,
  ...modelsNavItems,
  ...systemNavItems,
];

// ── Section error / unknown page fallbacks ────────────────────────────────

function SectionErrorFallback({ name }: { name: string }) {
  return (
    <div className="section-error">
      <AlertTriangle size={32} style={{ color: '#f59e0b', flexShrink: 0 }} />
      <h3 style={{ margin: 0, fontSize: '1rem' }}>{name}</h3>
      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '320px' }}>
        Sekce se nepodařila načíst. Přejděte na jinou stránku a zkuste to znovu.
      </p>
    </div>
  );
}

function UnknownPage() {
  return (
    <div className="section-error">
      <AlertTriangle size={32} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      <h3 style={{ margin: 0, fontSize: '1rem' }}>Stránka nenalezena</h3>
      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Tato sekce neexistuje nebo není implementována.
      </p>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [residentStatus, setResidentStatus] = useState('stopped');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { status, residentState } = useAppWebSocket();

  useEffect(() => {
    if (residentState?.type === 'resident_tick') {
      setResidentStatus(residentState.is_running ? 'active' : 'stopped');
    }
  }, [residentState]);

  const activeNavItem = allNavItems.find(i => i.id === activeTab) || allNavItems[0];

  const selectTab = (id: string) => {
    setActiveTab(id);
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':         return <Chat />;
      case 'resident':     return <ResidentAgent />;
      case 'dashboard':    return <Dashboard />;
      case 'knowledge':    return <KnowledgeBase />;
      case 'creative':     return <CreativeStudio />;
      case 'jobs':         return <Jobs />;
      case 'models':       return <Models />;
      case 'files':        return <Files />;
      case 'agents':       return <Agents />;
      case 'skills':       return <Skills />;
      case 'actions':      return <QuickActions />;
      case 'control-room': return <ControlRoom />;
      case 'overnight':    return <OvernightJobs />;
      case 'llm-settings': return <LLMSettings />;
      case 'settings':     return <Settings />;
      default:             return <UnknownPage />;
    }
  };

  const renderNavGroup = (label: string, items: typeof coreNavItems) => (
    <>
      <div className="nav-group-label">{label}</div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => selectTab(item.id)}
          >
            <Icon size={16} className="nav-icon" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </>
  );

  const isLocalhost =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const openWebUIUrl = isLocalhost
    ? 'http://localhost:8080'
    : `${window.location.protocol}//${window.location.hostname}:8080`;

  return (
    <div className="app-container">
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon">
            <Bot size={18} strokeWidth={2.5} />
          </div>
          <h2>AI Home Hub</h2>
          <button className="mobile-close-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {renderNavGroup('Core',      coreNavItems)}
          {renderNavGroup('Znalosti',  knowledgeNavItems)}
          {renderNavGroup('Řízení',    controlNavItems)}
          {renderNavGroup('Modely',    modelsNavItems)}
          {renderNavGroup('Systém',    systemNavItems)}

          {/* OpenWebUI companion */}
          <div className="nav-group-label">Companion</div>
          <div className="openwebui-entry">
            <div className="openwebui-header">
              <Bot size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span className="openwebui-name">Open WebUI</span>
              <span className={`openwebui-badge ${isLocalhost ? 'badge-local' : 'badge-remote'}`}>
                {isLocalhost ? 'jen lokálně' : 'port 8080'}
              </span>
            </div>
            <p className="openwebui-note">
              {isLocalhost
                ? 'Dostupné jen z tohoto zařízení. Pro přístup odjinud je potřeba reverse proxy nebo Tailscale Funnel.'
                : 'Port 8080 pravděpodobně není z jiných zařízení přístupný bez reverse proxy.'}
            </p>
            <a
              href={openWebUIUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="openwebui-link"
            >
              Otevřít <ExternalLink size={11} />
            </a>
          </div>
        </nav>
      </aside>

      {/* ── Main content ── */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <h1 className="page-title">{activeNavItem.label}</h1>
          </div>

          <div className="topbar-right">
            <div className="activity-badge">
              <Activity
                size={13}
                className={`status-icon status-${status === 'connected' ? residentStatus : 'stopped'}`}
              />
              <span className="status-text">
                {status === 'connected' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </header>

        <div className={`content-area${activeTab === 'chat' ? ' content-chat' : ''}`}>
          <ErrorBoundary
            key={activeTab}
            fallback={<SectionErrorFallback name={activeNavItem.label} />}
          >
            <div className="tab-content">
              {renderContent()}
            </div>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

export default App;
