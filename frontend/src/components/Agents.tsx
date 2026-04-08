import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Trash2, 
  StopCircle,
  RefreshCw,
  Plus,
  Search,
  Layers,
  ExternalLink,
  Loader2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { agentsApi } from '../api';
import { useToast } from '../context/ToastContext';

interface Agent {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'aborted';
  task: {
    goal: string;
    [key: string]: any;
  };
  progress?: number;
  created_at: string;
  finished_at?: string;
  artifacts_count: number;
}

export const Agents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const data = await agentsApi.list();
      setAgents(data.agents);
    } catch (err: any) {
      toast.error('Nepodařilo se načíst agenty');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    // Poll for status updates
    const timer = setInterval(() => {
      fetchAgents();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await agentsApi.delete(id);
      setAgents(prev => prev.filter(a => a.id !== id));
      toast.success('Agent odstraněn');
    } catch (err: any) {
      toast.error('Chyba při odstraňování agenta');
    }
  };

  const handleInterrupt = async (id: string) => {
    try {
      await agentsApi.interrupt(id);
      toast.info('Požadavek na přerušení odeslán');
      fetchAgents();
    } catch (err: any) {
      toast.error('Agenta nelze přerušit');
    }
  };

  const handleCleanup = async () => {
    try {
      const data = await agentsApi.cleanup();
      toast.success(`Odstraněno ${data.removed} neaktivních agentů`);
      fetchAgents();
    } catch (err: any) {
      toast.error('Chyba při čištění');
    }
  };

  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="text-emerald-400" size={18} />;
      case 'error': return <AlertCircle className="text-red-400" size={18} />;
      case 'running': return <Loader2 className="animate-spin text-blue-400" size={18} />;
      case 'aborted': return <StopCircle className="text-amber-400" size={18} />;
      default: return <Clock className="text-slate-400" size={18} />;
    }
  };

  const filteredAgents = agents.filter(a => 
    a.task.goal.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col h-full space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center tracking-tight">
            <Users className="mr-3 text-blue-400" />
            Agenti
          </h2>
          <p className="text-slate-400 text-sm mt-1">Správa autonomních AI instancí vykonávajících úkoly.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Hledat agenta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/20 border border-white/10 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          
          <button 
            onClick={fetchAgents}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
            title="Obnovit"
          >
            <RefreshCw size={20} className={loading ? "animate-spin text-blue-400" : ""} />
          </button>

          <button 
            onClick={handleCleanup}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all text-sm font-medium flex items-center"
          >
            <Trash2 size={16} className="mr-2 opacity-60" />
            Vyčistit
          </button>

          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all text-sm font-bold flex items-center shadow-lg shadow-blue-500/20">
            <Plus size={18} className="mr-2" />
            Nový Agent
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {agents.length === 0 && !loading ? (
          <div className="h-64 card glass-panel flex flex-col items-center justify-center opacity-30 italic text-center p-8">
            <Users size={48} className="mb-4" />
            <p className="text-lg">Žádní aktivní agenti nejsou k dispozici.</p>
            <p className="text-sm mt-2">Vytvořte nového agenta pomocí tlačítka výše.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            <AnimatePresence mode="popLayout">
              {filteredAgents.map((agent) => (
                <motion.div
                  key={agent.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="card glass-panel group flex flex-col border-white/10 hover:border-blue-500/30 transition-all hover:bg-blue-500/[0.02]"
                >
                  {/* Status Bar */}
                  <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-blue-500/10 rounded-lg">
                        <Terminal size={14} className="text-blue-400" />
                      </div>
                      <span className="text-[11px] font-mono opacity-50 tracking-tighter">
                        {agent.id.slice(0, 13)}...
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 px-2 py-1 bg-black/20 rounded-full">
                      {getStatusIcon(agent.status)}
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {agent.status}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-blue-400/70 uppercase tracking-widest">Cíl úlohy</p>
                      <p className="text-sm line-clamp-3 font-medium leading-relaxed">
                        {agent.task.goal}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2">
                       <div className="flex items-center opacity-50">
                         <Layers size={14} className="mr-1.5" />
                         <span>{agent.artifacts_count} Artefaktů</span>
                       </div>
                       <div className="flex items-center opacity-50">
                         <Sparkles size={14} className="mr-1.5 text-amber-400" />
                         <span>{agent.type}</span>
                       </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-3 bg-black/10 border-t border-white/5 flex items-center justify-end space-x-2">
                    {agent.status === 'running' && (
                      <button 
                        onClick={() => handleInterrupt(agent.id)}
                        className="p-2 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors"
                        title="Přerušit"
                      >
                        <StopCircle size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(agent.id)}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      title="Smazat"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button 
                      className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                      title="Detail"
                    >
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};
