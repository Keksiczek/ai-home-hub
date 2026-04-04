import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, User, Bot, Loader2, Plus, MessageSquare, Trash2, 
  ChevronLeft, Copy, Check, Image as ImageIcon, X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { chatApi, modelsApi } from '../api';
import { useToast } from '../context/ToastContext';
import type { ChatStreamChunk } from '../types';
import '../Chat.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  meta?: Record<string, unknown>;
  isStreaming?: boolean;
}

interface Session {
  id: string;
  name?: string;
  created_at: string;
  message_count?: number;
}

function CodeBlock({ language, children }: { language: string; children: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="code-block-wrap">
      <div className="code-block-header">
        <span>{language || 'code'}</span>
        <button className="code-copy-btn" onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Zkopírováno' : 'Kopírovat'}
        </button>
      </div>
      <SyntaxHighlighter 
        style={oneDark} 
        language={language || 'text'} 
        PreTag="div" 
        customStyle={{ margin: 0, borderRadius: '0 0 8px 8px', fontSize: '0.85rem' }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

export function Chat() {
  const { success, error: showError } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Ahoj! Jsem tvůj AI Home Hub asistent. Jak ti mohu pomoci?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load installed models
  useEffect(() => {
    modelsApi.installed().then(data => {
      const names = (data.models as Array<{ name: string }>).map(m => m.name);
      setModels(names);
    }).catch(() => {});
  }, []);

  // Load sessions
  const loadSessions = useCallback(async () => {
    try {
      const data = await chatApi.listSessions();
      setSessions(data.sessions as Session[]);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const loadSession = async (id: string) => {
    try {
      const data = await chatApi.getSession(id);
      setSessionId(id);
      setMessages(data.messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
        meta: m.meta as Record<string, unknown> | undefined,
      })));
      setShowSidebar(false);
    } catch {
      showError('Nepodařilo se načíst konverzaci');
    }
  };

  const startNewChat = () => {
    setSessionId(undefined);
    setMessages([
      { role: 'assistant', content: 'Ahoj! Jsem tvůj AI Home Hub asistent. Jak ti mohu pomoci?' }
    ]);
    setShowSidebar(false);
  };

  const deleteSession = async (id: string) => {
    try {
      await chatApi.deleteSession(id);
      if (sessionId === id) startNewChat();
      loadSessions();
      success('Konverzace smazána');
    } catch {
      showError('Smazání selhalo');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    // Add placeholder for streaming response
    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

    try {
      const res = await chatApi.streamSSE(userMsg, sessionId, selectedModel || undefined);
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream');
      
      const decoder = new TextDecoder();
      let accumulated = '';
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
            const chunk: ChatStreamChunk = JSON.parse(line.slice(6));
            if (chunk.type === 'error') {
              showError(chunk.message || 'Chyba streamu');
              break;
            }
            if (chunk.type === 'chat_chunk') {
              if (chunk.is_final && chunk.meta) {
                // Final chunk – set full content + meta
                setSessionId(chunk.meta.session_id);
                setMessages(prev => {
                  const next = [...prev];
                  const last = next[next.length - 1];
                  if (last.role === 'assistant') {
                    last.content = chunk.delta?.plain_text || accumulated;
                    last.isStreaming = false;
                    last.meta = chunk.meta as Record<string, unknown>;
                  }
                  return next;
                });
              } else if (chunk.delta?.plain_text) {
                accumulated += chunk.delta.plain_text;
                setMessages(prev => {
                  const next = [...prev];
                  const last = next[next.length - 1];
                  if (last.role === 'assistant') {
                    last.content = accumulated;
                  }
                  return next;
                });
              }
            }
          } catch { /* skip parse errors */ }
        }
      }

      loadSessions();
    } catch (e) {
      console.error(e);
      setMessages(prev => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last.role === 'assistant' && last.isStreaming) {
          last.content = 'Chyba komunikace s backendem.';
          last.isStreaming = false;
        }
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-layout">
      {/* Sessions Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="chat-sidebar glass-panel"
          >
            <div className="chat-sidebar-header">
              <h3>Konverzace</h3>
              <button onClick={() => setShowSidebar(false)}><X size={18} /></button>
            </div>
            <button className="new-chat-btn" onClick={startNewChat}>
              <Plus size={16} /> Nový chat
            </button>
            <div className="session-list">
              {sessions.map(s => (
                <div
                  key={s.id}
                  className={`session-item ${sessionId === s.id ? 'active' : ''}`}
                  onClick={() => loadSession(s.id)}
                >
                  <MessageSquare size={14} />
                  <span className="session-name">{s.name || `Chat ${s.id.slice(0, 6)}`}</span>
                  <button 
                    className="session-delete" 
                    onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {sessions.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '16px', textAlign: 'center' }}>
                  Žádné uložené konverzace
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat */}
      <div className="chat-container glass-panel">
        {/* Chat toolbar */}
        <div className="chat-toolbar">
          <button className="chat-toolbar-btn" onClick={() => setShowSidebar(!showSidebar)}>
            <ChevronLeft size={18} style={{ transform: showSidebar ? 'rotate(0)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
            Historie
          </button>
          <div className="chat-toolbar-right">
            {models.length > 0 && (
              <select 
                className="model-select glass-input"
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
              >
                <option value="">Výchozí model</option>
                {models.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Messages */}
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
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeStr = String(children).replace(/\n$/, '');
                        if (match) {
                          return <CodeBlock language={match[1]}>{codeStr}</CodeBlock>;
                        }
                        return <code className="inline-code" {...props}>{children}</code>;
                      },
                    }}
                  >
                    {msg.content || (msg.isStreaming ? '▍' : '')}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
                {msg.meta && (
                  <div className="msg-meta">
                    {(msg.meta as Record<string, unknown>).model as string}
                    {' • '}
                    {(msg.meta as Record<string, unknown>).latency_ms as number}ms
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && messages[messages.length - 1]?.content === '' && (
            <div className="chat-bubble assistant-msg">
              <div className="bubble-icon"><Bot size={16} /></div>
              <div className="bubble-content"><Loader2 size={16} className="spinner" /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <div className="chat-input-row">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Napiš zprávu... (Enter = odeslat, Shift+Enter = nový řádek)"
              className="chat-input glass-input"
              disabled={isLoading}
              rows={1}
            />
            <button className="chat-send-btn" onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
