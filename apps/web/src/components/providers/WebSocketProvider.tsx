"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface WebSocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
});

export const useWebSocket = () => useContext(WebSocketContext);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let reconnectAttempt = 0;
    const maxReconnectDelay = 30000; // max 30 seconds

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/v1/ws`;
      
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WS] Connected to real-time hub');
        setIsConnected(true);
        reconnectAttempt = 0; // reset attempts on success
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'PONG') {
            // Heartbeat received
            return;
          }

          if (data.type === 'NOTIFICATION') {
            toast(data.payload.title, {
              description: data.payload.message,
            });
          }

          if (data.type === 'MOBILE_DIAL_TRIGGER') {
            const { email, leadPhone } = data.payload;
            const userEmail = session?.user?.email;
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            if (isMobile && userEmail && email === userEmail) {
              console.log('[WS] Mobile dialer activated for:', leadPhone);
              window.location.href = `tel:${leadPhone}`;
            }
          }

          // Emit custom event so other components can listen
          window.dispatchEvent(new CustomEvent('ws-message', { detail: data }));
        } catch (err) {
          console.error('Failed to parse WS message', err);
        }
      };

      ws.onclose = () => {
        console.log('[WS] Disconnected');
        setIsConnected(false);
        setSocket(null);

        // Exponential backoff logic
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempt), maxReconnectDelay);
        console.log(`[WS] Attempting to reconnect in ${delay}ms...`);
        reconnectTimeout = setTimeout(() => {
          reconnectAttempt++;
          connect();
        }, delay);
      };

      setSocket(ws);
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) {
        ws.onclose = null; // Prevent reconnect on explicit unmount
        ws.close();
      }
    };
  }, [status, session?.user?.email]);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}
