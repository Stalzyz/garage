"use client"

import { useState, useEffect } from "react"
import { Play, Square, Coffee, Clock, ChevronDown, ChevronUp, Layers, Activity } from "lucide-react"
import { useApi } from "@/lib/useApi"
import { useCurrentUser } from "@/context/CurrentUserContext"
import { JibblePunchModal, ClockAction } from "./JibblePunchModal"

export function GlobalClockWidget() {
  const { userId, employeeId: ctxEmpId } = useCurrentUser()
  const employeeId = ctxEmpId || userId || ""

  const { data, mutate } = useApi<any>(employeeId ? `/hr/attendance/telemetry/${employeeId}` : null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [activeAction, setActiveAction] = useState<ClockAction | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const activeShift = data?.activeShift || false
  const onBreak = data?.onBreak || false
  const activeProject = data?.activeProject?.name || "General Shift"
  const shiftStartTime = data?.shiftStartTime ? new Date(data.shiftStartTime).getTime() : null

  // Live timer calculation
  useEffect(() => {
    if (!shiftStartTime || !activeShift || onBreak) return
    const updateTimer = () => {
      const now = Date.now()
      setElapsedSeconds(Math.max(0, Math.floor((now - shiftStartTime) / 1000)))
    }
    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [shiftStartTime, activeShift, onBreak])

  const formatHoursMinsSecs = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (!employeeId) return null

  return (
    <>
      {/* Floating Header Mini Bar */}
      <div className="fixed top-3 right-20 z-[100] hidden md:flex items-center gap-2 bg-[#0d0f17]/90 backdrop-blur-xl border border-white/10 rounded-full px-3 py-1.5 shadow-2xl transition-all hover:border-white/20">
        
        {/* Status Indicator & Live Counter */}
        <div className="flex items-center gap-2 pl-1 pr-2 border-r border-white/10">
          <span className="relative flex h-2.5 w-2.5">
            {activeShift && !onBreak ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </>
            ) : onBreak ? (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            ) : (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white/30"></span>
            )}
          </span>

          <div className="flex flex-col">
            <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 leading-none">
              {activeShift ? (onBreak ? "ON BREAK" : "WORKING") : "CLOCKED OUT"}
            </span>
            <span className="text-xs font-mono font-bold text-white tracking-tight leading-tight mt-0.5">
              {activeShift && !onBreak ? formatHoursMinsSecs(elapsedSeconds) : "00:00:00"}
            </span>
          </div>
        </div>

        {/* Current Project Tag */}
        {activeShift && (
          <div className="hidden lg:flex items-center gap-1.5 px-2 text-[11px] text-white/70 font-medium max-w-[140px] truncate">
            <Layers className="w-3 h-3 text-blue-400 flex-shrink-0" />
            <span className="truncate">{activeProject}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {!activeShift ? (
            <button
              onClick={() => setActiveAction('clock-in')}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-full text-[11px] font-mono font-semibold tracking-wider uppercase transition-colors"
            >
              <Play className="w-3 h-3 fill-emerald-400" /> Clock In
            </button>
          ) : (
            <>
              <button
                onClick={() => setActiveAction('switch-task')}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded-full text-[10px] font-mono uppercase tracking-wider transition-colors"
                title="Switch Project or Task"
              >
                Switch
              </button>
              <button
                onClick={() => setActiveAction(onBreak ? 'break-out' : 'break-in')}
                className={`p-1.5 rounded-full border transition-colors ${
                  onBreak
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30"
                }`}
                title={onBreak ? "End Break" : "Start Break"}
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveAction('clock-out')}
                className="p-1.5 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 rounded-full transition-colors"
                title="Clock Out"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Jibble Punch Modal Triggered */}
      {activeAction && (
        <JibblePunchModal
          action={activeAction}
          employeeId={employeeId}
          onClose={() => setActiveAction(null)}
          onSuccess={() => mutate()}
        />
      )}
    </>
  )
}
