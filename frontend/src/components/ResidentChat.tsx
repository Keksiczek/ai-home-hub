import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { useAppWebSocket } from '../context/AppWebSocketContext';
import '../Chat.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ResidentChat() {
  const { residentState } = useAppWebSocket();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your AI Home Hub. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });

      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || data.response }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error communicating with backend.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container glass-panel">
      
      <div className="chat-history">
        {messages.map((msg, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`chat-bubble ${msg.role === 'user' ? 'user-msg' : 'assistant-msg'}`}
          >
            <div className="bubble-icon">
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className="bubble-content">
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="chat-bubble assistant-msg">
            <div className="bubble-icon"><Bot size={16} /></div>
            <div className="bubble-content"><Loader2 size={16} className="spinner" /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area" style={{ flexDirection: 'column', paddingBottom: '0.5rem' }}>
        {residentState?.is_running && (
           <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Agent is active: {residentState?.status || 'idle'}
           </div>
        )}
        <div style={{ display: 'flex', width: '100%', gap: '0.5rem' }}>
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Send a message to Resident Agent..."
            className="chat-input glass-input"
            disabled={isLoading}
          />
          <button className="chat-send-btn" onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
