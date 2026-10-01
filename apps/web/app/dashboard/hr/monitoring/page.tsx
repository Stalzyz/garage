"use client"

import { useState, useEffect } from "react"
import { Activity, AlertTriangle, Camera, CheckCircle2, ChevronRight, Clock, ExternalLink, Eye, FileText, Keyboard, Maximize2, Monitor, MousePointer, Pause, Play, RefreshCw, Trophy, UserCheck, X, Zap } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { format } from "date-fns"
import { toast } from "sonner"

export default function HRMonitoringDashboard() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const [isSendingHeartbeat, setIsSendingHeartbeat] = useState(false)
  const [isCapturingTestSnap, setIsCapturingTestSnap] = useState(false)
  const [activeTab, setActiveTab] = useState<"TELEMETRY" | "LEADERBOARD">("TELEMETRY")
  
  // Standup modal states
  const [isStandupModalOpen, setIsStandupModalOpen] = useState(false)
  const [isGeneratingStandup, setIsGeneratingStandup] = useState(false)
  const [standupResult, setStandupResult] = useState<any>(null)

  // Zoomed screenshot lightbox state
  const [previewScreenshot, setPreviewScreenshot] = useState<any | null>(null)
  
  // 1. Fetch All Employees
  const { data: empData } = useApi<any>("/hr/employees")
  const employees = empData?.employees || []

  // Auto-select first real employee when loaded
  useEffect(() => {
    if (employees.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(employees[0].id)
    }
  }, [employees, selectedEmployeeId])
  
  // 2. Fetch Telemetry for selected employee, auto-refresh every 15s
  const { data: telemetryData, mutate: mutateTelemetry } = useApi<any>(
    selectedEmployeeId ? `/hr/telemetry/report/${selectedEmployeeId}` : null,
    { refreshInterval: 15000 }
  )

  // 3. Listen to WebSocket telemetry events for instantaneous UI updates
  useEffect(() => {
    const handleWsTelemetry = (e: any) => {
      const payload = e.detail
      if (!payload) return
      const eventName = payload.payload?.event || payload.event || payload.type
      if (eventName === 'TELEMETRY_HEARTBEAT' || eventName === 'TELEMETRY_SCREENSHOT') {
        mutateTelemetry()
      }
    }

    window.addEventListener('telemetry-event', handleWsTelemetry)
    return () => window.removeEventListener('telemetry-event', handleWsTelemetry)
  }, [mutateTelemetry])

  // 4. Fetch Gamified Leaderboard
  const { data: leaderboardData } = useApi<any>("/hr/telemetry/leaderboard")
  const leaderboard = leaderboardData?.leaderboard || []
  
  const stats = telemetryData?.dailyStats || { totalActive: 0, totalIdle: 0, totalKeystrokes: 0, totalClicks: 0 }
  const screenshots = telemetryData?.screenshots || []
  const aiInsights = telemetryData?.aiInsights || { focusScore: 88, burnoutRisk: "LOW", breakdown: { deepWorkMinutes: 180, commMinutes: 45, distractionMinutes: 15 } }
  const isOnline = telemetryData?.isOnline || false
  const lastSeenMinutesAgo = telemetryData?.lastSeenMinutesAgo

  const handleTestHeartbeat = async () => {
    if (!selectedEmployeeId) return toast.error('Select an employee first')
    setIsSendingHeartbeat(true)
    try {
      await fetchApi<any>('/hr/telemetry/heartbeat', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: selectedEmployeeId,
          activeMinutes: Math.floor(Math.random() * 20) + 5,
          idleMinutes: Math.floor(Math.random() * 3),
          keyboardStrokes: Math.floor(Math.random() * 250) + 50,
          mouseClicks: Math.floor(Math.random() * 100) + 20,
          activeAppTitle: 'Visual Studio Code — grekam-os'
        })
      })
      toast.success('Live test signal dispatched & recorded!')
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
      const res = await fetchApi<any>('/hr/telemetry/generate-standup', {
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

  const handleCreateMockScreenshot = async () => {
    if (!selectedEmployeeId) return toast.error('Select an employee first')
    setIsCapturingTestSnap(true)
    try {
      await fetchApi<any>('/hr/telemetry/screenshot', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: selectedEmployeeId,
          imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1280&q=80',
          notes: 'Test snapshot verification ping'
        })
      })
      toast.success('Test snapshot registered!')
      mutateTelemetry()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create snapshot')
    } finally {
      setIsCapturingTestSnap(false)
    }
  }

  const totalMinutes = stats.totalActive + stats.totalIdle
  const productivityScore = totalMinutes > 0 ? Math.round((stats.totalActive / totalMinutes) * 100) : 0

  const selectedEmpObj = employees.find((e: any) => e.id === selectedEmployeeId)

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      
      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-white/10 bg-black/30 backdrop-blur-md z-10 relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.15)] relative overflow-hidden">
              <Activity className="w-6 h-6 text-violet-400 relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">AI Workforce Telemetry</h1>
                {selectedEmployeeId && (
                  <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide uppercase border ${
                    isOnline 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-zinc-500'}`} />
                    {isOnline ? 'Online • Active' : (lastSeenMinutesAgo !== null ? `Seen ${lastSeenMinutesAgo}m ago` : 'Offline')}
                  </div>
                )}
              </div>
              <p className="text-xs font-mono tracking-widest uppercase text-white/40 mt-1">Live Productivity & Screen Monitoring Hub</p>
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
                    <option key={emp.id} value={emp.id}>
                      {emp.user?.firstName || 'Staff'} {emp.user?.lastName || ''} ({emp.jobTitle || 'Team Member'})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleGenerateStandup}
                  disabled={isGeneratingStandup || !selectedEmployeeId}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text-white text-[10px] font-mono font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md disabled:opacity-50"
                >
                  {isGeneratingStandup ? <RefreshCw className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                  {isGeneratingStandup ? 'Building...' : 'EOD Standup'}
                </button>

                <button
                  onClick={handleTestHeartbeat}
                  disabled={isSendingHeartbeat || !selectedEmployeeId}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                  title="Simulate telemetry ping"
                >
                  <Zap className="w-3 h-3" />
                  {isSendingHeartbeat ? 'Pinging...' : 'Test Signal'}
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
              {leaderboard.length === 0 ? (
                <div className="p-8 text-center text-white/40 border border-dashed border-white/10 rounded-2xl">
                  No telemetry sessions recorded this week yet.
                </div>
              ) : (
                leaderboard.map((item: any, idx: number) => (
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
                ))
              )}
            </div>
          </div>
        ) : (
          /* TELEMETRY DASHBOARD */
          <div className="space-y-8 max-w-6xl mx-auto">
            
            {/* Burnout Indicator Banner */}
            {stats.totalActive > 360 && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-4">
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
              <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-4">
                <Monitor className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-amber-400">No Employees Found</h3>
                  <p className="text-xs text-white/50">Add staff in HR → Employees to begin monitoring.</p>
                </div>
              </div>
            )}

            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <Play className="w-4 h-4" />
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold">Active Work</span>
                </div>
                <div className="text-3xl font-bold font-mono">{Math.floor(stats.totalActive / 60)}h {stats.totalActive % 60}m</div>
                <p className="text-[11px] text-white/40 font-mono mt-2">Documented interaction time</p>
              </div>
              
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <Pause className="w-4 h-4" />
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold">Idle / Pause</span>
                </div>
                <div className="text-3xl font-bold font-mono">{Math.floor(stats.totalIdle / 60)}h {stats.totalIdle % 60}m</div>
                <p className="text-[11px] text-white/40 font-mono mt-2">No keyboard/mouse activity</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Keyboard className="w-4 h-4" />
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold">Input Activity</span>
                </div>
                <div className="text-3xl font-bold font-mono">{stats.totalKeystrokes.toLocaleString()}</div>
                <p className="text-[11px] text-white/40 font-mono mt-2">{stats.totalClicks.toLocaleString()} mouse clicks recorded</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-violet-500/10 blur-[50px] pointer-events-none" />
                <div className="flex items-center gap-2 text-violet-400 mb-2 relative z-10">
                  <Activity className="w-4 h-4" />
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold">AI Focus Score</span>
                </div>
                <div className="text-3xl font-bold text-violet-400 relative z-10 font-mono">{aiInsights.focusScore || productivityScore}%</div>
                <p className="text-[11px] text-white/40 font-mono mt-2 relative z-10">Burnout Risk: {aiInsights.burnoutRisk || 'LOW'}</p>
              </div>
            </div>

            {/* SCREEN SNAPSHOTS SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Camera className="w-5 h-5 text-violet-400" />
                  <div>
                    <h3 className="text-lg font-bold text-white leading-none">Live Screen Snapshots</h3>
                    <p className="text-xs text-white/50 font-mono mt-1">Periodic screen captures taken during active shift</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-white/40">
                    {screenshots.length} captured today
                  </span>
                  <button
                    onClick={handleCreateMockScreenshot}
                    disabled={isCapturingTestSnap || !selectedEmployeeId}
                    className="px-2.5 py-1 text-[10px] font-mono text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors disabled:opacity-50"
                  >
                    {isCapturingTestSnap ? 'Capturing...' : '+ Test Snap'}
                  </button>
                </div>
              </div>

              {screenshots.length === 0 ? (
                <div className="p-12 text-center text-white/40 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                  <Monitor className="w-10 h-10 mx-auto mb-3 opacity-30 text-violet-400" />
                  <h4 className="text-sm font-semibold text-white/70">No Screen Snapshots Recorded Today</h4>
                  <p className="text-xs text-white/40 max-w-md mx-auto mt-1">
                    When {selectedEmpObj?.user?.firstName || 'staff'} starts their shift, they click <strong>"Start Screen Stream"</strong> in their bottom telemetry bar. Captures automatically sync every 5 minutes.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {screenshots.map((snap: any) => (
                    <div 
                      key={snap.id}
                      onClick={() => setPreviewScreenshot(snap)}
                      className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/40 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col"
                    >
                      {/* Image Thumbnail Container */}
                      <div className="relative aspect-video bg-black/50 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={snap.imageUrl}
                          alt={snap.notes || 'Screen Snapshot'}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1280&q=80'
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-3 py-1.5 rounded-lg bg-black/70 border border-white/20 text-white text-xs font-mono font-medium flex items-center gap-1.5 backdrop-blur-md">
                            <Maximize2 className="w-3.5 h-3.5" /> Enlarge View
                          </span>
                        </div>
                      </div>

                      {/* Card Meta */}
                      <div className="p-3 flex items-center justify-between border-t border-white/5 text-xs font-mono">
                        <span className="text-white/60 truncate mr-2" title={snap.notes}>
                          {snap.notes || 'Periodic Capture'}
                        </span>
                        <span className="text-white/40 shrink-0 text-[10px]">
                          {format(new Date(snap.timestamp), 'hh:mm a')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TELEMETRY HOURLY LOGS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-lg font-bold text-white leading-none">Telemetry Interval Logs</h3>
                    <p className="text-xs text-white/50 font-mono mt-1">Real-time stream of heartbeats received today</p>
                  </div>
                </div>
              </div>

              {(!telemetryData?.telemetryLogs || telemetryData.telemetryLogs.length === 0) ? (
                <div className="p-8 text-center text-white/40 border border-dashed border-white/10 rounded-2xl">
                  No telemetry pulses logged today yet.
                </div>
              ) : (
                <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-white/5 border-b border-white/10 text-white/50">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Active</th>
                        <th className="p-3">Idle</th>
                        <th className="p-3">Keystrokes</th>
                        <th className="p-3">Mouse Clicks</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {telemetryData.telemetryLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 text-white/70">
                            {format(new Date(log.timestamp), 'hh:mm:ss a')}
                          </td>
                          <td className="p-3 text-emerald-400 font-bold">
                            {log.activeMinutes}m
                          </td>
                          <td className="p-3 text-amber-400">
                            {log.idleMinutes}m
                          </td>
                          <td className="p-3 text-blue-400">
                            {log.keyboardStrokes.toLocaleString()}
                          </td>
                          <td className="p-3 text-purple-400">
                            {log.mouseClicks.toLocaleString()}
                          </td>
                          <td className="p-3 text-right">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                              RECORDED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* SCREENSHOT FULLSCREEN LIGHTBOX */}
      {previewScreenshot && (
        <div 
          onClick={() => setPreviewScreenshot(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl w-full bg-[#0c0c10] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">
                  {previewScreenshot.notes || 'Screen Snapshot'}
                </h4>
                <p className="text-xs font-mono text-white/40">
                  Captured at {format(new Date(previewScreenshot.timestamp), 'yyyy-MM-dd hh:mm:ss a')}
                </p>
              </div>
              <button
                onClick={() => setPreviewScreenshot(null)}
                className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-black flex items-center justify-center p-2 max-h-[75vh] overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewScreenshot.imageUrl}
                alt="Enlarged Screenshot"
                className="max-h-[72vh] w-auto object-contain rounded-lg border border-white/5"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1280&q=80'
                }}
              />
            </div>

            <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/40">
              <span>Employee: {selectedEmpObj?.user?.firstName} {selectedEmpObj?.user?.lastName}</span>
              <a
                href={previewScreenshot.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="text-violet-400 hover:text-violet-300 flex items-center gap-1"
              >
                Open Original in New Tab <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* AI DAILY STANDUP RESULT MODAL */}
      {isStandupModalOpen && standupResult && (
        <div 
          onClick={() => setIsStandupModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full bg-[#0d0d12] border border-white/20 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI EOD Daily Standup</h3>
                  <p className="text-xs font-mono text-white/40">Generated from telemetry logs & work activity</p>
                </div>
              </div>
              <button
                onClick={() => setIsStandupModalOpen(false)}
                className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2 text-sm">
              <div className="p-3.5 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <span className="text-[10px] font-mono text-violet-400 uppercase font-bold tracking-wider block mb-1">Executive Summary</span>
                <p className="text-white/90 leading-relaxed">{standupResult.summary}</p>
              </div>

              <div>
                <h5 className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold mb-2">Key Accomplishments</h5>
                <ul className="space-y-1.5">
                  {standupResult.accomplishments?.map((acc: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-white/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{acc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {standupResult.blockers && standupResult.blockers !== 'None' && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <h5 className="text-xs font-mono text-rose-400 uppercase tracking-wider font-bold mb-1">Blockers Identified</h5>
                  <p className="text-white/80">{standupResult.blockers}</p>
                </div>
              )}

              <div>
                <h5 className="text-xs font-mono text-blue-400 uppercase tracking-wider font-bold mb-2">Tomorrow's Deliverables</h5>
                <ul className="space-y-1.5">
                  {standupResult.tomorrowPlan?.map((plan: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-white/80">
                      <ChevronRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>{plan}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-mono text-white/50 border-t border-white/5">
                <span>Productivity Rating: <strong className="text-violet-400">{standupResult.productivityRating}</strong></span>
                <span>Employee: {selectedEmpObj?.user?.firstName} {selectedEmpObj?.user?.lastName}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setIsStandupModalOpen(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-mono font-bold text-white transition-colors"
              >
                Close Standup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
