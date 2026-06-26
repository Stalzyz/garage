"use client"

import { useState } from "react"
import { Search, Plus, CheckCircle2, Circle, Clock, Mail, Laptop, ShieldCheck, MoreVertical, LayoutDashboard } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { motion } from "framer-motion"

export default function OnboardingDashboard() {
  const { data, mutate } = useApi<any>("/hr/onboarding")
  const hiresData = data?.data || []

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  const hires = hiresData.map((emp: any) => {
    const completedTasks = emp.tasks.filter((t: any) => t.isCompleted).length
    const totalTasks = emp.tasks.length
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
    let status = "NOT_STARTED"
    if (progress > 0 && progress < 100) status = "IN_PROGRESS"
    if (progress === 100 && totalTasks > 0) status = "COMPLETED"

    return {
      ...emp,
      progress,
      status
    }
  })

  const filteredHires = hires.filter((hire: any) => {
    if (filter !== "all" && hire.status !== filter.toUpperCase()) return false
    const searchString = search.toLowerCase()
    if (search && !hire.user?.name?.toLowerCase().includes(searchString) && !hire.designation?.toLowerCase().includes(searchString)) return false
    return true
  })

  const handleTaskComplete = async (taskId: string) => {
    try {
      await fetchApi(`/hr/onboarding/${taskId}/complete`, { method: "PATCH" })
      mutate()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar bg-transparent text-white relative p-6 lg:p-10 space-y-10">
      
      <div className="absolute top-[10%] left-[50%] w-[30%] h-[30%] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)] relative overflow-hidden">
            <LayoutDashboard className="w-6 h-6 text-emerald-400 relative z-10" />
            <div className="absolute inset-0 bg-emerald-500/20 animate-pulse mix-blend-overlay" />
          </div>
          <div>
            <p className="text-[10px] font-mono tracking-widest uppercase font-bold text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)] mb-1">Human Resources</p>
            <h1 className="text-3xl font-bold text-white tracking-tight leading-none">
              Onboarding Workflows
            </h1>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold tracking-widest uppercase px-5 py-3 rounded-xl hover:bg-emerald-500/30 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Plus className="w-4 h-4" /> Add Workflow
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 relative z-10 border-y border-white/10 py-6">
        <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
          {[
            { id: "all", label: "All Hires" },
            { id: "in_progress", label: "In Progress" },
            { id: "not_started", label: "Not Started" },
            { id: "completed", label: "Completed" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`text-[9px] font-mono tracking-widest uppercase font-bold px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${
                filter === f.id
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                  : "bg-black/40 border-white/10 text-white/40 hover:text-white hover:border-white/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Query Workflows..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[10px] font-mono tracking-widest uppercase text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredHires.map((hire: any) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={hire.id} 
              className="bg-white/5 border border-white/10 rounded-2xl shadow-sm flex flex-col h-[420px] overflow-hidden group hover:border-emerald-500/30 transition-all backdrop-blur-md relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              {/* Card Header */}
              <div className="p-5 border-b border-white/10 bg-black/20 relative">
                <div className="flex justify-between items-start mb-4">
                  <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border font-mono ${
                    hire.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 
                    hire.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 
                    'bg-slate-500/10 text-slate-400 border-slate-500/20 shadow-[0_0_10px_rgba(148,163,184,0.2)]'
                  }`}>
                    {hire.status.replace("_", " ")}
                  </div>
                  <button className="text-white/40 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-xl font-black text-white flex-none shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]">
                    {hire.user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">{hire.user?.name}</h3>
                    <p className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase truncate mt-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block">{hire.designation}</p>
                    <p className="text-[9px] text-white/50 font-mono uppercase tracking-widest mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-white/30" /> Starts {new Date(hire.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-5 py-4 border-b border-white/10 bg-black/20">
                <div className="flex justify-between text-[10px] font-mono tracking-widest uppercase font-bold mb-2">
                  <span className="text-white/50">Progress</span>
                  <span className="text-white">{hire.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${hire.progress === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'}`} 
                    style={{ width: `${hire.progress}%` }} 
                  />
                </div>
              </div>

              {/* Task List */}
              <div className="flex-1 p-5 overflow-y-auto custom-scrollbar relative z-10">
                <h4 className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-4 font-mono">Task Checklist</h4>
                <div className="space-y-3">
                  {hire.tasks.map((task: any) => (
                    <div key={task.id} className="flex items-start gap-3 group/task">
                      <button 
                        onClick={() => !task.isCompleted && handleTaskComplete(task.id)}
                        disabled={task.isCompleted}
                        className="mt-0.5 flex-none transition-colors"
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                        ) : (
                          <Circle className="w-4 h-4 text-white/30 group-hover/task:text-emerald-400 transition-colors" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold transition-colors ${task.isCompleted ? 'text-white/30 line-through' : 'text-white/80 group-hover/task:text-white'}`}>
                          {task.title}
                        </p>
                        <span className="text-[8px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 bg-black/40 border border-white/10 rounded text-white/50 mt-1.5 inline-block">
                          {task.category}
                        </span>
                      </div>
                    </div>
                  ))}
                  {hire.tasks.length === 0 && (
                    <p className="text-xs text-white/30 font-mono text-center pt-4">No tasks assigned</p>
                  )}
                </div>
              </div>

            </motion.div>
          ))}

          {filteredHires.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-black/20 border border-dashed border-white/10 rounded-2xl">
              <div className="w-12 h-12 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center mb-4">
                <LayoutDashboard className="w-5 h-5 text-white/30" />
              </div>
              <h3 className="text-sm font-bold font-mono tracking-widest uppercase text-white/50">No Workflows Found</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
