import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type WebSocketEvent = any;

interface AppWebSocketContextType {
  isConnected: boolean;
  status: 'connected' | 'reconnecting' | 'failed';
  sendMessage: (data: any) => void;
  lastMessage: WebSocketEvent | null;
  residentState: any | null;
  activityState: any | null;
}

const AppWebSocketContext = createContext<AppWebSocketContextType | undefined>(undefined);

export function AppWebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<'connected' | 'reconnecting' | 'failed'>('reconnecting');
  const [lastMessage, setLastMessage] = useState<WebSocketEvent | null>(null);
  const [residentState, setResidentState] = useState<any>(null);
  const [activityState, setActivityState] = useState<any>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempt = useRef(0);
  const maxReconnectAttempts = 20;

  const connect = () => {
    // In Vite dev mode, we connect relatively, and proxy handles it
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${proto}//${window.location.host}/ws`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      setStatus('connected');
      reconnectAttempt.current = 0;
    };

    ws.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'pong') return; // ignore heartbeat replies
        setLastMessage(msg);
        
        // Globally track certain easy states
        if (msg.type === 'resident_tick' || msg.type === 'resident_action') {
             setResidentState(msg);
        } else if (msg.type === 'activity_update') {
             setActivityState(msg);
        }
      } catch (e) {
        console.error('WebSocket parse error', e);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      scheduleReconnect();
    };

    ws.current.onerror = () => {
      ws.current?.close();
    };
  };

  const scheduleReconnect = () => {
    if (reconnectAttempt.current >= maxReconnectAttempts) {
      setStatus('failed');
      return;
    }
    
    setStatus('reconnecting');
    const delayMs = Math.min(1000 * Math.pow(2, reconnectAttempt.current), 30000);
    reconnectAttempt.current += 1;
    
    setTimeout(() => {
      connect();
    }, delayMs);
  };

  // Ping interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const sendMessage = (data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  };

  return (
    <AppWebSocketContext.Provider value={{ isConnected, status, sendMessage, lastMessage, residentState, activityState }}>
      {children}
    </AppWebSocketContext.Provider>
  );
}

export function useAppWebSocket() {
  const context = useContext(AppWebSocketContext);
  if (context === undefined) {
    throw new Error('useAppWebSocket must be used within an AppWebSocketProvider');
  }
  return context;
}
