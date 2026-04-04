import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Terminal, LayoutDashboard, Database, Settings, Activity, Folder, 
  Users, Zap, ShieldAlert, Cpu, Gamepad2, Moon, Box, Wrench, Menu, X
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
import OpenWebUI from './components/OpenWebUI';
import { LegacyView } from './components/LegacyView';
import './App.css';

const navItems = [
  { id: 'chat', legacyId: 'chat', label: 'Chat', icon: Bot, isReact: true },
  { id: 'resident', legacyId: 'resident', label: 'Resident AI', icon: Zap, isReact: true },
  { id: 'dashboard', legacyId: 'status', label: 'Dashboard', icon: LayoutDashboard, isReact: true },
  { id: 'knowledge', legacyId: 'knowledge', label: 'Knowledge Base', icon: Database, isReact: true },
  { id: 'open-webui', legacyId: 'open-webui', label: 'Open WebUI', icon: Box, isReact: true },
  { id: 'files', legacyId: 'files-manager', label: 'Soubory', icon: Folder, isReact: true },
  { id: 'agents', legacyId: 'agents', label: 'Agenti', icon: Users, isReact: true },
  { id: 'skills', legacyId: 'skills', label: 'Skills Marketplace', icon: Zap, isReact: false },
  { id: 'jobs', legacyId: 'jobs', label: 'Jobs', icon: Terminal, isReact: true },
  { id: 'actions', legacyId: 'actions', label: 'Rychlé Akce', icon: Wrench, isReact: false },
  { id: 'control-room', legacyId: 'control-room', label: 'Control Room', icon: ShieldAlert, isReact: false },
  { id: 'creative', legacyId: 'creative', label: 'Creative Studio', icon: Gamepad2, isReact: true },
  { id: 'overnight', legacyId: 'overnight', label: 'Noční úlohy', icon: Moon, isReact: false },
  { id: 'models', legacyId: 'models', label: 'Modely', icon: Database, isReact: true },
  { id: 'llm-settings', legacyId: 'llm-settings', label: 'LLM Settings', icon: Cpu, isReact: false },
];

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

  const activeNavItem = navItems.find(i => i.id === activeTab) || { id: 'settings', legacyId: 'settings', label: 'Settings', isReact: false };

  const selectTab = (id: string) => {
    setActiveTab(id);
    setIsSidebarOpen(false);
  }

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
      case 'open-webui': return <OpenWebUI />;
      default:
        // Fallback to Legacy iframe for non-react tabs
        if (!activeNavItem.isReact) {
          return <LegacyView tabId={activeNavItem.legacyId} />;
        }
        return null;
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
           className="sidebar-overlay fixed inset-0 bg-black/50 z-40 md:hidden"
           onClick={() => setIsSidebarOpen(false)}
           style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}

      {/* Sidebar - Floating style */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon">
            <Bot size={24} strokeWidth={2.5} />
          </div>
          <h2>AI Home Hub</h2>
          <button className="mobile-close-btn md:hidden" onClick={() => setIsSidebarOpen(false)} style={{marginLeft: 'auto'}}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-label" style={{ marginBottom: '8px', paddingLeft: '16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Hlavní Menu</div>
          {navItems.slice(0, 4).map((item) => {
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
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="active-indicator"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}

          <div className="nav-group-label" style={{ marginTop: '24px', marginBottom: '8px', paddingLeft: '16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Pokročilé Funkce</div>
          {navItems.slice(4).map((item) => {
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
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="active-indicator"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button 
             className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
             onClick={() => selectTab('settings')}
          >
            <Settings size={18} className="nav-icon" />
            <span>Nastavení</span>
            {activeTab === 'settings' && (
              <motion.div
                layoutId="active-indicator"
                className="active-indicator"
                initial={false}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Modern Topbar */}
        <header className="topbar">
          <div className="topbar-left" style={{ display: 'flex', alignItems: 'center' }}>
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="page-title">
              {activeNavItem.label}
            </h1>
          </div>
          
          <div className="topbar-right">
             <div className="activity-badge glass-panel hover-lift">
              <Activity size={16} className={`status-icon status-${status === 'connected' ? residentStatus : 'stopped'}`} />
              <span className="status-text hide-on-mobile">
                {status === 'connected' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="content-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="tab-content"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;
