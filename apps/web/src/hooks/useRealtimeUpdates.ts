"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { useSession } from "next-auth/react"

export type WsEvent = {
  type: string
  payload?: unknown
  timestamp: string
}

const MAX_BACKOFF_MS = 30000

export function useRealtimeUpdates(onEvent?: (event: WsEvent) => void) {
  const { status } = useSession()
  const wsRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<WsEvent | null>(null)
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempt = useRef(0)
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    let wsUrl = process.env.NEXT_PUBLIC_WS_URL;

    if (!wsUrl) {
      if (typeof window !== 'undefined') {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        wsUrl = `${wsProtocol}//${window.location.host}/api/v1/ws`;
      } else {
        wsUrl = "ws://127.0.0.1:4000/api/v1/ws";
      }
    }

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        reconnectAttempt.current = 0
        setConnected(true)
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      }

      ws.onmessage = (e) => {
        try {
          const event: WsEvent = JSON.parse(e.data)
          setLastEvent(event)
          onEventRef.current?.(event)
        } catch {}
      }

      ws.onclose = (event) => {
        setConnected(false)
        // 4401 is the server's explicit "unauthenticated upgrade" close code.
        // Retrying it on a fixed 3s timer produced a permanent reconnect loop
        // (tens of thousands of rejected upgrades) whenever the session was
        // absent or the account was inactive. The session gate below re-runs
        // connect() when auth state actually changes, so drop the retry here.
        if (event.code === 4401) return

        reconnectAttempt.current = Math.min(reconnectAttempt.current + 1, 6)
        const delay = Math.min(3000 * 2 ** reconnectAttempt.current, MAX_BACKOFF_MS)
        reconnectTimer.current = setTimeout(connect, delay)
      }

      ws.onerror = () => ws.close()
    } catch {
      // WebSocket not available (SSR) — silently ignore
    }
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return
    connect()
    return () => {
      wsRef.current?.close()
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
    }
  }, [connect, status])

  const send = useCallback((type: string, payload?: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }))
    }
  }, [])

  return { connected, lastEvent, send }
}
