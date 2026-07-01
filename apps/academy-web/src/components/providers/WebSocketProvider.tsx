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

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use the Next.js rewrite to proxy the WS connection
    const wsUrl = `${protocol}//${window.location.host}/api/v1/ws`;
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[WS] Connected to real-time hub');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
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
      // Optional: Add reconnection logic here
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [status]);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}
