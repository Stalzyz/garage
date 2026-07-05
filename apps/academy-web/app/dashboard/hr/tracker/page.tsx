"use client"

import { useState, useEffect } from "react"
import { Play, Square, Clock, Monitor, Activity, CheckCircle2, ChevronRight, Pause, MousePointer2 } from "lucide-react"

export default function TimeTrackerPage() {
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0) // in seconds
  const [activeProject, setActiveProject] = useState("Website Redesign")

  // Mock projects
  const projects = ["Website Redesign", "Brand Identity", "SEO Campaign"]

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isActive, isPaused])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setIsActive(true)
    setIsPaused(false)
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleStop = async () => {
    setIsActive(false)
    setIsPaused(false)
    
    // Call existing POST /api/v1/hr/time endpoint
    try {
      await fetch('/api/v1/hr/time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: "cuid-project-mock", // In a real app we'd map activeProject to ID
          hours: timeElapsed / 3600,
          description: `Worked on ${activeProject}`,
        })
      })
    } catch (e) {
      console.error(e)
    }
    
    setTimeElapsed(0)
  }

  return (
    <div className="flex flex-col h-full bg-[#050508] text-white overflow-hidden">
      
      {/* Header */}
      <div className="flex-none px-8 py-8 border-b border-white/10 bg-[#0a0a0f]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Live Tracker</h1>
            <p className="text-sm text-slate-400 mt-2">Track time and monitor productivity telemetry</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Activity className="w-4 h-4" /> Telemetry Active
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Stopwatch Col */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* The Stopwatch UI */}
            <div className={`p-10 rounded-3xl border transition-all duration-500 flex flex-col items-center justify-center relative overflow-hidden ${
              isActive && !isPaused 
                ? 'bg-blue-600/10 border-blue-500/30 shadow-[0_0_50px_rgba(37,99,235,0.15)]' 
                : 'bg-white/5 border-white/10'
            }`}>
              
              {/* Background Radar Effect when active */}
              {isActive && !isPaused && (
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                  <div className="w-[150%] h-[150%] rounded-full border border-blue-500 animate-ping" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute w-[100%] h-[100%] rounded-full border border-blue-400 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
                </div>
              )}

              <select 
                value={activeProject}
                onChange={e => setActiveProject(e.target.value)}
                disabled={isActive}
                className="mb-8 bg-black/40 border border-white/10 rounded-xl px-6 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 appearance-none text-center font-bold text-slate-300 disabled:opacity-50 relative z-10"
              >
                {projects.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <div className="font-mono text-7xl md:text-9xl font-black tracking-tighter mb-12 relative z-10 drop-shadow-2xl">
                {formatTime(timeElapsed)}
              </div>

              <div className="flex gap-4 relative z-10">
                {!isActive ? (
                  <button 
                    onClick={handleStart}
                    className="w-20 h-20 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105"
                  >
                    <Play className="w-8 h-8 ml-1" />
                  </button>
                ) : (
                  <>
                    {isPaused ? (
                      <button 
                        onClick={handleStart}
                        className="w-20 h-20 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105"
                      >
                        <Play className="w-8 h-8 ml-1" />
                      </button>
                    ) : (
                      <button 
                        onClick={handlePause}
                        className="w-20 h-20 rounded-full bg-amber-500 hover:bg-amber-400 text-white flex items-center justify-center transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-105"
                      >
                        <Pause className="w-8 h-8" />
                      </button>
                    )}
                    <button 
                      onClick={handleStop}
                      className="w-20 h-20 rounded-full bg-rose-500 hover:bg-rose-400 text-white flex items-center justify-center transition-all shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:scale-105"
                    >
                      <Square className="w-7 h-7" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Time Log Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0a0a0f]">
                <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400">Today's Logs</h3>
                <span className="text-sm font-mono font-bold">Total: 04:30:00</span>
              </div>
              <div className="divide-y divide-white/5">
                <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <div>
                      <p className="font-bold text-sm text-white">Brand Identity</p>
                      <p className="text-xs text-slate-500 mt-0.5">09:00 AM - 11:30 AM</p>
                    </div>
                  </div>
                  <div className="font-mono text-sm font-bold">02:30:00</div>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <div>
                      <p className="font-bold text-sm text-white">Website Redesign</p>
                      <p className="text-xs text-slate-500 mt-0.5">12:30 PM - 02:30 PM</p>
                    </div>
                  </div>
                  <div className="font-mono text-sm font-bold">02:00:00</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Col - Telemetry & Screenshots */}
          <div className="lg:col-span-1 space-y-8">
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest text-slate-400 mb-6">
                <Monitor className="w-4 h-4 text-blue-400" /> Recent Screenshots
              </h3>
              
              <div className="space-y-4">
                <div className="relative group cursor-pointer overflow-hidden rounded-xl border border-white/10 aspect-video bg-black/50">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80')] bg-cover bg-center opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                    <span className="text-xs font-mono text-white/70">10:45 AM • Figma</span>
                  </div>
                </div>
                <div className="relative group cursor-pointer overflow-hidden rounded-xl border border-white/10 aspect-video bg-black/50">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80')] bg-cover bg-center opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                    <span className="text-xs font-mono text-white/70">11:15 AM • VS Code</span>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 py-2 text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1">
                View All Screenshots <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest text-slate-400 mb-6">
                <MousePointer2 className="w-4 h-4 text-purple-400" /> Activity Level
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400">Keystrokes / Min</span>
                    <span className="font-bold text-emerald-400">High (140)</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400">Mouse Movement</span>
                    <span className="font-bold text-amber-400">Medium</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400">Active App Focus</span>
                    <span className="font-bold text-white">VS Code (85%)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  )
}
