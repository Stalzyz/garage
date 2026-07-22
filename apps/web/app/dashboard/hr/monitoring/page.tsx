"use client"

import { useState } from "react"
import { Search, Monitor, MousePointer2, Keyboard, Clock, Activity, Camera, AlertTriangle, Play, Pause } from "lucide-react"
import { useApi } from "@/lib/useApi"
import Image from "next/image"
import { format } from "date-fns"

export default function HRMonitoringDashboard() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("cuid-emp-1")
  
  // 1. Fetch All Employees for the selector
  const { data: empData } = useApi<any>("/hr/employees")
  const employees = empData?.employees || []
  
  // 2. Fetch Telemetry for selected employee
  const { data: telemetryData } = useApi<any>(`/hr/telemetry/report/${selectedEmployeeId}`)
  
  const stats = telemetryData?.dailyStats || { totalActive: 0, totalIdle: 0, totalKeystrokes: 0, totalClicks: 0 }
  const screenshots = telemetryData?.screenshots || []
  
  // Mock image generation for demo if screenshots are empty
  const mockScreenshots = screenshots.length > 0 ? screenshots : [
    { id: '1', imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80', timestamp: new Date(Date.now() - 1000 * 60 * 30), notes: 'Coding IDE active' },
    { id: '2', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80', timestamp: new Date(Date.now() - 1000 * 60 * 60), notes: 'Data science dashboard' },
    { id: '3', imageUrl: 'https://images.unsplash.com/photo-1618477388954-7852f32655cb?w=500&q=80', timestamp: new Date(Date.now() - 1000 * 60 * 120), notes: 'Idle on desktop' }
  ]

  const totalMinutes = stats.totalActive + stats.totalIdle
  const productivityScore = totalMinutes > 0 ? Math.round((stats.totalActive / totalMinutes) * 100) : 0

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      
      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-white/10 bg-black/20 backdrop-blur-md z-10 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.15)] relative overflow-hidden">
              <Activity className="w-6 h-6 text-violet-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Workforce Telemetry</h1>
              <p className="text-xs font-mono tracking-widest uppercase text-white/40 mt-1">Live Employee Activity Monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono tracking-widest uppercase text-white/40 font-bold">Monitor:</span>
            <select 
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
            >
              <option value="cuid-emp-1">Employee 1</option>
              <option value="cuid-emp-2">Employee 2</option>
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>{emp.user?.firstName} {emp.user?.lastName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        
        {stats.totalActive === 0 && stats.totalIdle === 0 && (
          <div className="mb-8 p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl flex items-center gap-4 animate-pulse">
            <Monitor className="w-6 h-6 text-violet-400" />
            <div>
              <h3 className="text-sm font-bold text-violet-400">Waiting for Data...</h3>
              <p className="text-xs text-white/50">Telemetry requires the Grekam OS Desktop Client to be running on the employee's machine.</p>
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
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold">Productivity Score</span>
            </div>
            <div className="text-3xl font-bold text-violet-400 relative z-10">{productivityScore}%</div>
            
            <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
              <div className="h-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" style={{ width: `${productivityScore}%` }} />
            </div>
          </div>
        </div>

        {/* Screenshot Gallery */}
        <div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Camera className="w-5 h-5 text-white/50" /> Automated Screen Captures
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockScreenshots.map((shot: any) => (
              <div key={shot.id} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative hover:-translate-y-1 transition-all hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-white/20">
                <div className="aspect-video relative overflow-hidden bg-black/50">
                  <Image src={shot.imageUrl} alt="Screen capture" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Overlay tags */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase text-white/80 border border-white/10">
                    {format(new Date(shot.timestamp), 'HH:mm:ss')}
                  </div>
                </div>
                
                <div className="p-4 border-t border-white/10">
                  <p className="text-[10px] font-mono tracking-widest uppercase text-white/40 mb-1">Context Analysis</p>
                  <p className="text-sm text-white/90">{shot.notes || "No unusual activity detected"}</p>
                </div>
              </div>
            ))}
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
