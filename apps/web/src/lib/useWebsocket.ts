import { useEffect, useState, useRef } from 'react';

function getWsUrl(): string {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${window.location.host}/api/v1/ws`;
  }
  return process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:4000/api/v1/ws';
}

export function useWebsocket() {
  const [messages, setMessages] = useState<any[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Only connect on the client side
    if (typeof window === 'undefined') return;

    ws.current = new WebSocket(getWsUrl());

    ws.current.onopen = () => {
      console.log('Connected to Telemetry Hub');
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
        // Also emit a custom event so floating components can catch it globally
        window.dispatchEvent(new CustomEvent('telemetry-event', { detail: data }));
      } catch (e) {
        console.error('Error parsing telemetry message', e);
      }
    };

    ws.current.onclose = () => {
      console.log('Disconnected from Telemetry Hub');
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  return { messages };
}
