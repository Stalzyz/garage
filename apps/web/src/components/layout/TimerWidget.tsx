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
    <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.07] rounded-lg px-2 py-1">
      <div className="flex items-center gap-1.5">
        <Clock className={`w-3 h-3 ${isRunning ? 'text-zinc-200' : 'text-zinc-500'}`} />
        <span className="text-[11px] font-mono tabular-nums text-zinc-300">
          {formatTime(seconds)}
        </span>
      </div>
      <button 
        onClick={handleToggle}
        className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${isRunning ? 'bg-white/10 text-white hover:bg-white/20' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
        title={isRunning ? "Pause" : "Start"}
      >
        {isRunning ? <Square className="w-2.5 h-2.5 fill-current" /> : <Play className="w-2.5 h-2.5 fill-current ml-0.5" />}
      </button>
      {seconds > 0 && !isRunning && (
        <button 
          onClick={handleReset}
          className="w-5 h-5 flex items-center justify-center rounded text-zinc-400 hover:text-red-400 hover:bg-white/10 transition-colors"
          title="Reset"
        >
          <Square className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  )
}
