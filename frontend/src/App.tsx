import { useState, useEffect } from 'react';
import {
  Bot, Terminal, LayoutDashboard, Database, Settings as SettingsIcon, Activity, Folder,
  Users, Zap, ShieldAlert, Cpu, Gamepad2, Moon, Wrench, Menu, X, ExternalLink
} from 'lucide-react';
import { useAppWebSocket } from './context/AppWebSocketContext';
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

const mainNavItems = [
  { id: 'chat', label: 'Chat', icon: Bot },
  { id: 'resident', label: 'Resident AI', icon: Zap },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'knowledge', label: 'Knowledge Base', icon: Database },
];

const advancedNavItems = [
  { id: 'files', label: 'Soubory', icon: Folder },
  { id: 'agents', label: 'Agenti', icon: Users },
  { id: 'skills', label: 'Skills', icon: Zap },
  { id: 'actions', label: 'Rychlé akce', icon: Wrench },
  { id: 'jobs', label: 'Jobs', icon: Terminal },
  { id: 'creative', label: 'Creative Studio', icon: Gamepad2 },
  { id: 'overnight', label: 'Noční úlohy', icon: Moon },
  { id: 'models', label: 'Modely', icon: Database },
];

const systemNavItems = [
  { id: 'control-room', label: 'Control Room', icon: ShieldAlert },
  { id: 'llm-settings', label: 'LLM nastavení', icon: Cpu },
  { id: 'settings', label: 'Nastavení', icon: SettingsIcon },
];

const allNavItems = [...mainNavItems, ...advancedNavItems, ...systemNavItems];

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [residentStatus, setResidentStatus] = useState('stopped');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { status, residentState } = useAppWebSocket();

  useEffect(() => {
    if (residentState?.type === 'resident_tick') {
      const isRunning = residentState.is_running;
      setResidentStatus(isRunning ? 'active' : 'stopped');
    }
  }, [residentState]);

  const activeNavItem = allNavItems.find(i => i.id === activeTab) || allNavItems[0];

  const selectTab = (id: string) => {
    setActiveTab(id);
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'chat': return <Chat />;
      case 'resident': return <ResidentAgent />;
      case 'dashboard': return <Dashboard />;
      case 'knowledge': return <KnowledgeBase />;
      case 'creative': return <CreativeStudio />;
      case 'jobs': return <Jobs />;
      case 'models': return <Models />;
      case 'files': return <Files />;
      case 'agents': return <Agents />;
      case 'skills': return <Skills />;
      case 'actions': return <QuickActions />;
      case 'control-room': return <ControlRoom />;
      case 'overnight': return <OvernightJobs />;
      case 'llm-settings': return <LLMSettings />;
      case 'settings': return <Settings />;
      default: return <Chat />;
    }
  };

  const renderNavGroup = (label: string, items: typeof mainNavItems) => (
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
            <Icon size={18} className="nav-icon" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </>
  );

  // Detect OpenWebUI URL: use Tailscale hostname if not on localhost
  const openWebUIUrl = (() => {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8080';
    }
    // On Tailscale or other remote access, use same host with port 8080
    return `${window.location.protocol}//${host}:8080`;
  })();

  return (
    <div className="app-container">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon">
            <Bot size={20} strokeWidth={2.5} />
          </div>
          <h2>AI Home Hub</h2>
          <button className="mobile-close-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {renderNavGroup('Hlavní', mainNavItems)}
          {renderNavGroup('Funkce', advancedNavItems)}
          {renderNavGroup('Systém', systemNavItems)}

          {/* OpenWebUI external link */}
          <div className="nav-group-label">Externí</div>
          <a
            href={openWebUIUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item nav-external-link"
          >
            <Bot size={18} className="nav-icon" />
            <span>Open WebUI</span>
            <ExternalLink size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="page-title">{activeNavItem.label}</h1>
          </div>

          <div className="topbar-right">
            <div className="activity-badge">
              <Activity size={14} className={`status-icon status-${status === 'connected' ? residentStatus : 'stopped'}`} />
              <span className="status-text">
                {status === 'connected' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </header>

        <div className="content-area">
          <div className="tab-content" key={activeTab}>
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
