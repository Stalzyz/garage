"use client"

import { useEffect, useRef, useCallback, useState } from "react"

export type WsEvent = {
  type: string
  payload?: unknown
  timestamp: string
}

export function useRealtimeUpdates(onEvent?: (event: WsEvent) => void) {
  const wsRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<WsEvent | null>(null)
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null)
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:4000/ws"

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
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

      ws.onclose = () => {
        setConnected(false)
        // Auto-reconnect after 3 seconds
        reconnectTimer.current = setTimeout(connect, 3000)
      }

      ws.onerror = () => ws.close()
    } catch {
      // WebSocket not available (SSR) — silently ignore
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      wsRef.current?.close()
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
    }
  }, [connect])

  const send = useCallback((type: string, payload?: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }))
    }
  }, [])

  return { connected, lastEvent, send }
}
