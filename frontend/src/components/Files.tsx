import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  File, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  ArrowLeft, 
  ChevronRight,
  Search,
  RefreshCw,
  Loader2,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { filesApi } from '../api';
import { useToast } from '../context/ToastContext';

interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  modified: number;
  extension: string;
  is_image: boolean;
}

export const Files: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('data');
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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
      toast.error('Chyba při načítání souborů');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentPath);
  }, []);

  const handleFolderClick = (path: string) => {
    fetchFiles(path);
  };

  const handleBackClick = () => {
    const parts = currentPath.split('/');
    if (parts.length > 1) {
      parts.pop();
      fetchFiles(parts.join('/'));
    }
  };

  const handleDelete = async (path: string, name: string) => {
    if (!window.confirm(`Opravdu chcete smazat "${name}"?`)) return;

    try {
      await filesApi.delete(path);
      toast.success('Soubor smazán');
      fetchFiles(currentPath);
    } catch (err: any) {
      toast.error(`Chyba: ${err.message}`);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (entry: FileEntry) => {
    if (entry.is_dir) return <Folder className="text-blue-400 w-8 h-8" />;
    if (entry.is_image) return <ImageIcon className="text-purple-400 w-8 h-8" />;
    if (['.txt', '.md', '.py', '.js', '.ts'].includes(entry.extension)) {
      return <FileText className="text-emerald-400 w-8 h-8" />;
    }
    return <File className="text-slate-400 w-8 h-8" />;
  };

  const filteredEntries = entries.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const breadcrumbs = currentPath.split('/').filter(Boolean);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full space-y-4"
    >
      {/* Header & Breadcrumbs */}
      <div className="card glass-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 overflow-hidden">
          <button 
            onClick={handleBackClick}
            disabled={breadcrumbs.length <= 1}
            className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center text-sm font-medium overflow-x-auto whitespace-nowrap scrollbar-hide">
             <Database size={16} className="text-blue-400 mr-2 shrink-0" />
             {breadcrumbs.map((part, i) => (
               <React.Fragment key={i}>
                 {i > 0 && <ChevronRight size={14} className="mx-1 opacity-40 shrink-0" />}
                 <span className={i === breadcrumbs.length - 1 ? "text-blue-400" : "opacity-60"}>
                   {part}
                 </span>
               </React.Fragment>
             ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Hledat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/20 border border-white/10 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all w-full md:w-64"
            />
          </div>
          <button 
            onClick={() => fetchFiles(currentPath)}
            className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
            title="Obnovit"
          >
            <RefreshCw size={20} className={loading ? "animate-spin text-blue-400" : ""} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading && entries.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
            <Loader2 className="animate-spin text-blue-400" size={48} />
            <p className="text-xl font-medium tracking-tight">Procházení souborů...</p>
          </div>
        ) : error ? (
          <div className="card glass-panel p-12 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
              <Trash2 className="text-red-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold">Chyba přístupu</h3>
            <p className="text-slate-400 max-w-md">{error}</p>
            <button 
              onClick={() => fetchFiles('data')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all font-medium"
            >
              Zpět do kořene
            </button>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-30 italic">
             <File size={48} />
             <p>Žádné soubory nenalezeny</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-8">
            <AnimatePresence mode="popLayout">
              {filteredEntries.map((entry) => (
                <motion.div
                  key={entry.path}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -4 }}
                  className={`card glass-panel group p-4 flex flex-col items-center text-center cursor-pointer transition-all border-white/5 hover:border-blue-500/30 ${entry.is_dir ? 'hover:bg-blue-500/5' : 'hover:bg-white/5'}`}
                  onClick={() => entry.is_dir ? handleFolderClick(entry.path) : null}
                >
                  <div className="relative mb-3">
                    {getFileIcon(entry)}
                  </div>
                  
                  <div className="w-full">
                    <p className="text-sm font-medium truncate w-full" title={entry.name}>
                      {entry.name}
                    </p>
                    <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">
                      {entry.is_dir ? 'Složka' : formatSize(entry.size)}
                    </p>
                  </div>

                  {/* Quick Actions */}
                  {!entry.is_dir && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(entry.path, entry.name);
                        }}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors"
                        title="Smazat"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};
