import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OpenWebUI: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Default OpenWebUI port is 8080
  const openWebUIUrl = 'http://localhost:8080';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full w-full gap-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Open WebUI
          </h2>
          <p className="text-gray-400 text-sm">Externí LLM rozhraní se všemi funkcemi</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.open(openWebUIUrl, '_blank')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10 text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Otevřít v novém okně
          </button>
        </div>
      </div>

      <div className="relative flex-grow rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl min-h-[600px]">
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-10"
            >
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <p className="text-white font-medium">Načítání Open WebUI...</p>
              <p className="text-gray-400 text-xs mt-2">Ujistěte se, že služba běží na portu 8080</p>
            </motion.div>
          )}
        </AnimatePresence>

        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-2">Nepodařilo se připojit k Open WebUI</h3>
            <p className="text-gray-400 max-w-md mb-6">
              Služba pravděpodobně neběží nebo je blokována. Spusťte ji pomocí příkazu <br/>
              <code className="bg-white/10 px-2 py-1 rounded mt-2 inline-block">./run_openwebui.sh</code>
            </p>
            <button 
              onClick={() => { setError(false); setLoading(true); }}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl transition-all shadow-lg shadow-blue-500/25"
            >
              Zkusit znovu
            </button>
          </div>
        ) : (
          <iframe 
            src={openWebUIUrl}
            className="w-full h-full border-none"
            onLoad={() => setLoading(false)}
            onError={() => { setError(true); setLoading(false); }}
            title="Open WebUI"
          />
        )}
      </div>
    </motion.div>
  );
};

export default OpenWebUI;
