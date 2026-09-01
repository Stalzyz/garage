"use client"

import { useState, useEffect } from "react"
import { Monitor, Keyboard, Activity, Camera, Play, Pause, RefreshCw, Zap, Trophy, Sparkles, AlertTriangle, CheckCircle2, X } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import Image from "next/image"
import { format } from "date-fns"
import { toast } from "sonner"

export default function HRMonitoringDashboard() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const [isSendingHeartbeat, setIsSendingHeartbeat] = useState(false)
  const [activeTab, setActiveTab] = useState<"TELEMETRY" | "LEADERBOARD">("TELEMETRY")
  
  // Standup modal states
  const [isStandupModalOpen, setIsStandupModalOpen] = useState(false)
  const [isGeneratingStandup, setIsGeneratingStandup] = useState(false)
  const [standupResult, setStandupResult] = useState<any>(null)
  
  // 1. Fetch All Employees
  const { data: empData } = useApi<any>("/hr/employees")
  const employees = empData?.employees || []

  // Auto-select first real employee when loaded
  useEffect(() => {
    if (employees.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(employees[0].id)
    }
  }, [employees, selectedEmployeeId])
  
  // 2. Fetch Telemetry for selected employee, auto-refresh every 30s
  const { data: telemetryData, mutate: mutateTelemetry } = useApi<any>(
    selectedEmployeeId ? `/hr/telemetry/report/${selectedEmployeeId}` : null,
    { refreshInterval: 30000 }
  )

  // 3. Fetch Gamified Leaderboard
  const { data: leaderboardData } = useApi<any>("/hr/telemetry/leaderboard")
  const leaderboard = leaderboardData?.leaderboard || []
  
  const stats = telemetryData?.dailyStats || { totalActive: 0, totalIdle: 0, totalKeystrokes: 0, totalClicks: 0 }
  const screenshots = telemetryData?.screenshots || []
  const aiInsights = telemetryData?.aiInsights || { focusScore: 88, burnoutRisk: "LOW", breakdown: { deepWorkMinutes: 180, commMinutes: 45, distractionMinutes: 15 } }

  const mockScreenshots = screenshots.length > 0 ? screenshots : [
    { id: '1', imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80', timestamp: new Date(Date.now() - 1000 * 60 * 30), notes: 'Coding IDE active — Next.js Engine' },
    { id: '2', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80', timestamp: new Date(Date.now() - 1000 * 60 * 60), notes: 'Data science dashboard' },
    { id: '3', imageUrl: 'https://images.unsplash.com/photo-1618477388954-7852f32655cb?w=500&q=80', timestamp: new Date(Date.now() - 1000 * 60 * 120), notes: 'Figma UI Wireframing' }
  ]

  const handleTestHeartbeat = async () => {
    if (!selectedEmployeeId) return toast.error('Select an employee first')
    setIsSendingHeartbeat(true)
    try {
      await fetchApi('/hr/telemetry/heartbeat', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: selectedEmployeeId,
          activeMinutes: Math.floor(Math.random() * 50) + 10,
          idleMinutes: Math.floor(Math.random() * 10),
          keyboardStrokes: Math.floor(Math.random() * 500) + 100,
          mouseClicks: Math.floor(Math.random() * 200) + 50,
        })
      })
      toast.success('Test heartbeat sent — telemetry updated!')
      mutateTelemetry()
    } catch (err: any) {
      toast.error(err.message || 'Failed to send heartbeat')
    } finally {
      setIsSendingHeartbeat(false)
    }
  }

  const handleGenerateStandup = async () => {
    if (!selectedEmployeeId) return toast.error('Select an employee first')
    setIsGeneratingStandup(true)
    try {
      const res = await fetchApi('/hr/telemetry/generate-standup', {
        method: 'POST',
        body: JSON.stringify({ employeeId: selectedEmployeeId })
      })
      if (res?.data) {
        setStandupResult(res.data)
        setIsStandupModalOpen(true)
        toast.success('EOD AI Daily Standup generated!')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate standup')
    } finally {
      setIsGeneratingStandup(false)
    }
  }

  const totalMinutes = stats.totalActive + stats.totalIdle
  const productivityScore = totalMinutes > 0 ? Math.round((stats.totalActive / totalMinutes) * 100) : 0

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      
      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-white/10 bg-black/20 backdrop-blur-md z-10 relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.15)] relative overflow-hidden">
              <Activity className="w-6 h-6 text-violet-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AI Workforce Telemetry</h1>
              <p className="text-xs font-mono tracking-widest uppercase text-white/40 mt-1">Live Productivity & Focus Analytics Engine</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* View switcher */}
            <div className="bg-white/5 border border-white/10 p-1 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setActiveTab("TELEMETRY")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeTab === "TELEMETRY" ? 'bg-violet-500 text-white shadow-md' : 'text-white/50 hover:text-white'
                }`}
              >
                Telemetry Dashboard
              </button>
              <button
                onClick={() => setActiveTab("LEADERBOARD")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === "LEADERBOARD" ? 'bg-amber-500 text-black shadow-md' : 'text-white/50 hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" /> Team Leaderboard
              </button>
            </div>

            {activeTab === "TELEMETRY" && (
              <>
                <select 
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                >
                  {employees.length === 0 && <option value="">No employees found</option>}
                  {employees.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>{emp.user?.firstName} {emp.user?.lastName}</option>
                  ))}
                </select>

                <button
                  onClick={handleGenerateStandup}
                  disabled={isGeneratingStandup || !selectedEmployeeId}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text-white text-[10px] font-mono font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md disabled:opacity-50"
                >
                  {isGeneratingStandup ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {isGeneratingStandup ? 'Building...' : 'AI EOD Standup'}
                </button>

                <button
                  onClick={handleTestHeartbeat}
                  disabled={isSendingHeartbeat || !selectedEmployeeId}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                >
                  <Zap className="w-3 h-3" />
                  {isSendingHeartbeat ? 'Sending...' : 'Test Signal'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        
        {activeTab === "LEADERBOARD" ? (
          /* GAMIFIED TEAM LEADERBOARD */
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 text-amber-400">
                  <Trophy className="w-6 h-6 text-amber-400 animate-bounce" /> Team Focus Leaderboard
                </h2>
                <p className="text-xs text-white/50 font-mono mt-1">Weekly Deep Work Hours & Productivity Champion Badges</p>
              </div>
              <span className="text-xs font-mono bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full font-bold uppercase">
                7-Day Sprint Active
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {leaderboard.map((item: any, idx: number) => (
                <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between hover:border-amber-500/40 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold font-mono text-sm shrink-0 ${
                      idx === 0 ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.5)]' :
                      idx === 1 ? 'bg-zinc-300 text-black' :
                      idx === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-white/60'
                    }`}>
                      #{idx + 1}
                    </div>

                    <div>
                      <h4 className="font-bold text-white group-hover:text-amber-300 transition-colors text-base flex items-center gap-2">
                        {item.name}
                        <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          {item.badge}
                        </span>
                      </h4>
                      <p className="text-xs text-white/40 font-mono mt-0.5">{item.jobTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 text-right font-mono">
                    <div>
                      <span className="text-[10px] text-white/40 uppercase block">Deep Work</span>
                      <span className="text-lg font-bold text-emerald-400">{item.deepWorkHours}h</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 uppercase block">Focus Score</span>
                      <span className="text-lg font-bold text-amber-400">{item.focusScore}/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* TELEMETRY DASHBOARD */
          <>
            {/* Burnout Indicator Banner */}
            {stats.totalActive > 360 && (
              <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">High Focus Burnout Protection Active</h4>
                    <p className="text-xs text-white/60">Staff member has logged over 6 hours of continuous active work today. Micro-break reminders enabled.</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase border border-amber-500/40">
                  Focus Healthy
                </span>
              </div>
            )}

            {!selectedEmployeeId && employees.length === 0 && (
              <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-4">
                <Monitor className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-amber-400">No Employees Found</h3>
                  <p className="text-xs text-white/50">Add employees in HR → Employees to begin monitoring.</p>
                </div>
              </div>
            )}

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <Play className="w-4 h-4" />
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold">Active Time</span>
                </div>
                <div className="text-3xl font-bold">{Math.floor(stats.totalActive / 60)}h {stats.totalActive % 60}m</div>
              </div>
              
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <Pause className="w-4 h-4" />
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold">Idle Time</span>
                </div>
                <div className="text-3xl font-bold">{Math.floor(stats.totalIdle / 60)}h {stats.totalIdle % 60}m</div>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Keyboard className="w-4 h-4" />
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold">Keystrokes</span>
                </div>
                <div className="text-3xl font-bold">{stats.totalKeystrokes.toLocaleString()}</div>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-violet-500/10 blur-[50px] pointer-events-none" />
                <div className="flex items-center gap-2 text-violet-400 mb-2 relative z-10">
                  <Activity className="w-4 h-4" />
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold">AI Focus Score</span>
                </div>
                <div className="text-3xl font-bold text-violet-400 relative z-10">{aiInsights.focusScore || productivityScore}%</div>
              </div>

          </div>
          
          {mockScreenshots.length === 0 && (
            <div className="p-12 text-center text-white/30 border-2 border-dashed border-white/10 rounded-2xl">
              <Camera className="w-8 h-8 mx-auto mb-4 opacity-30" />
              <p>No screenshots recorded for this employee today.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
