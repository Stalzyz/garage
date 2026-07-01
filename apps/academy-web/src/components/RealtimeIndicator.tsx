"use client"

import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates"
import { useState, useEffect } from "react"
import { Radio, Wifi, WifiOff } from "lucide-react"

export default function RealtimeIndicator() {
  const [events, setEvents] = useState<string[]>([])
  const [flashEvent, setFlashEvent] = useState<string | null>(null)

  const { connected, lastEvent } = useRealtimeUpdates((event) => {
    if (event.type === "CONNECTED") return
    const msg = formatEvent(event)
    if (msg) {
      setFlashEvent(msg)
      setEvents(prev => [msg, ...prev].slice(0, 5))
      setTimeout(() => setFlashEvent(null), 4000)
    }
  })

  return (
    <>
      {/* Status pill — always visible in top bar */}
      <div className={`flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full border transition-all ${
        connected
          ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
          : "text-slate-500 bg-slate-500/10 border-slate-500/20"
      }`}>
        {connected
          ? <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live</>
          : <><WifiOff className="w-3 h-3" />Offline</>}
      </div>

      {/* Flash toast for incoming WS events */}
      {flashEvent && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-primary/30 shadow-2xl shadow-primary/10 text-sm text-foreground max-w-sm animate-in slide-in-from-bottom-4">
          <Radio className="w-4 h-4 text-primary animate-pulse flex-none" />
          <span>{flashEvent}</span>
        </div>
      )}
    </>
  )
}

function formatEvent(event: { type: string; payload?: unknown }): string | null {
  const p = event.payload as any
  switch (event.type) {
    case "PROJECT_UPDATE":    return `📦 Project update: ${p?.projectName}`
    case "INVOICE_CREATED":   return `🧾 New invoice created: ${p?.invoiceId}`
    case "PROPOSAL_APPROVED": return `✅ Proposal approved by ${p?.clientName}`
    case "DELIVERABLE_READY": return `📁 Deliverable ready: ${p?.fileName}`
    case "NEW_LEAD":          return `👤 New lead: ${p?.name}`
    case "NOTIFICATION":      return p?.message
    default:                  return null
  }
}
