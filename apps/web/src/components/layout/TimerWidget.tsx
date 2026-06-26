"use client"

import { useState, useEffect } from "react"
import { Play, Square, Clock } from "lucide-react"

export function TimerWidget() {
  const [isRunning, setIsRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    let interval: any
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)
    } else if (!isRunning && seconds !== 0) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isRunning, seconds])

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleToggle = () => {
    if (isRunning) {
      // Pause
      setIsRunning(false)
    } else {
      // Start
      setIsRunning(true)
    }
  }

  const handleReset = () => {
    setIsRunning(false)
    setSeconds(0)
  }

  return (
    <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-1.5 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2 px-2">
        <Clock className={`w-3 h-3 ${isRunning ? 'text-emerald-400 animate-pulse' : 'text-white/40'}`} />
        <span className={`text-[10px] font-mono font-bold tracking-wider ${isRunning ? 'text-emerald-400' : 'text-white/60'}`}>
          {formatTime(seconds)}
        </span>
      </div>
      <button 
        onClick={handleToggle}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isRunning ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30' : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'}`}
      >
        {isRunning ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
      </button>
      {seconds > 0 && !isRunning && (
        <button 
          onClick={handleReset}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
          title="Reset Timer"
        >
          <Square className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}
