"use client"

import { useApi } from "@/lib/useApi"
import { Loader2, Clock, Briefcase, CheckCircle2, Circle, PlayCircle, FolderKanban } from "lucide-react"
import { motion } from "framer-motion"

function getTaskIcon(status: string) {
  switch(status) {
    case "DONE": return <CheckCircle2 className="w-4 h-4 text-emerald-400" />
    case "IN_PROGRESS": return <PlayCircle className="w-4 h-4 text-blue-400" />
    default: return <Circle className="w-4 h-4 text-white/30" />
  }
}

export function EmployeeActivity({ employeeId }: { employeeId: string }) {
  const { data, isLoading } = useApi<any>(`/hr/employees/${employeeId}/activity`)

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-white/40 text-sm font-mono tracking-widest uppercase">Loading Activity Data...</p>
      </div>
    )
  }

  const { timeEntries = [], projects = [], tasks = [] } = data || {}

  const totalTimeSecs = timeEntries.reduce((acc: number, t: any) => {
    if (!t.endTime) return acc
    const diff = new Date(t.endTime).getTime() - new Date(t.startTime).getTime()
    return acc + (diff / 1000)
  }, 0)
  const totalTimeHrs = (totalTimeSecs / 3600).toFixed(1)

  const activeTasks = tasks.filter((t: any) => t.status !== "DONE")
  const doneTasks = tasks.filter((t: any) => t.status === "DONE")

  return (
    <div className="space-y-8 pb-10">
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <Clock className="w-4 h-4" />
            <h4 className="text-[10px] font-mono tracking-widest uppercase font-bold">Time Logged (30d)</h4>
          </div>
          <p className="text-3xl font-black text-white">{totalTimeHrs} <span className="text-sm font-normal text-white/40">hrs</span></p>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <FolderKanban className="w-4 h-4" />
            <h4 className="text-[10px] font-mono tracking-widest uppercase font-bold">Managed Projects</h4>
          </div>
          <p className="text-3xl font-black text-white">{projects.length}</p>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <h4 className="text-[10px] font-mono tracking-widest uppercase font-bold">Tasks Completed</h4>
          </div>
          <p className="text-3xl font-black text-white">{doneTasks.length} <span className="text-sm font-normal text-white/40">/ {tasks.length}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Tasks List */}
        <div>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-white/50" /> Active Tasks
          </h3>
          {activeTasks.length === 0 ? (
            <div className="text-white/40 text-sm p-4 bg-white/5 border border-white/10 rounded-xl">No active tasks assigned.</div>
          ) : (
            <div className="space-y-3">
              {activeTasks.map((t: any, i: number) => (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3"
                >
                  <div className="mt-0.5">{getTaskIcon(t.status)}</div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.title}</p>
                    {t.project && (
                      <p className="text-[10px] font-mono text-emerald-400 mt-1 uppercase">{t.project.name}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Time Entries */}
        <div>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/50" /> Recent Time Logs
          </h3>
          {timeEntries.length === 0 ? (
            <div className="text-white/40 text-sm p-4 bg-white/5 border border-white/10 rounded-xl">No time entries recorded recently.</div>
          ) : (
            <div className="space-y-3">
              {timeEntries.map((t: any, i: number) => {
                let duration = "In Progress"
                if (t.endTime) {
                  const d = new Date(t.endTime).getTime() - new Date(t.startTime).getTime()
                  const h = Math.floor(d / 3600000)
                  const m = Math.floor((d % 3600000) / 60000)
                  duration = `${h}h ${m}m`
                }
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{new Date(t.date).toLocaleDateString()}</p>
                      <p className="text-[10px] text-white/50 font-mono mt-1">{t.description || "No description"}</p>
                    </div>
                    <div className="text-sm font-black font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                      {duration}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
