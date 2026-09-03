"use client"

import { useState } from "react"
import { Clock, Plus, Calendar as CalendarIcon, Play, Square, List, User, Activity, AlertCircle, CheckCircle2, Shield } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { format } from "date-fns"
import { toast } from "sonner"

export default function TimeTrackingPage() {
  const [activeTab, setActiveTab] = useState<"timesheet" | "ongoing">("timesheet")

  const { data: logsData, mutate: mutateLogs, isLoading } = useApi<any>("/hr/time")
  const { data: projectsData } = useApi<any>("/projects")
  const { data: tasksData } = useApi<any>("/projects/tasks/all")
  const { data: ongoingData, mutate: mutateOngoing } = useApi<any>("/projects/tasks/ongoing")

  const timeLogs = logsData?.timeLogs || []
  const projects = projectsData?.data || []
  const allTasks = tasksData?.data || []
  const ongoingTasks = ongoingData?.data || []

  const [isLogging, setIsLogging] = useState(false)
  const [taskType, setTaskType] = useState<"PROJECT" | "INTERNAL">("PROJECT")
  const [formData, setFormData] = useState({
    projectId: "",
    taskId: "",
    hours: "",
    description: "",
    logDate: format(new Date(), 'yyyy-MM-dd')
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetchApi("/hr/time", {
        method: "POST",
        body: JSON.stringify({
          projectId: taskType === "PROJECT" ? (formData.projectId || undefined) : undefined,
          taskId: formData.taskId || undefined,
          hours: parseFloat(formData.hours),
          description: formData.description,
          logDate: new Date(formData.logDate).toISOString()
        })
      })
      toast.success("Time logged successfully")
      setFormData({ ...formData, hours: "", description: "", projectId: "", taskId: "" })
      setIsLogging(false)
      mutateLogs()
      mutateOngoing()
    } catch (err: any) {
      toast.error(err.message || "Failed to log time")
    }
  }

  const totalHours = timeLogs.reduce((sum: number, log: any) => sum + log.hours, 0)

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Time Tracking & Task Monitor</h1>
            <p className="text-sm text-white/50 mt-1">Log hours against Project or Internal Tasks, and monitor active workforce tasks in real-time.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex flex-col items-end justify-center">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Total Hours Logged</span>
              <span className="font-mono text-lg font-bold text-emerald-400">{totalHours.toFixed(1)}h</span>
            </div>
            <button 
              onClick={() => setIsLogging(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] h-[46px]"
            >
              <Plus className="w-4 h-4" /> Log Time
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setActiveTab("timesheet")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "timesheet" ? "bg-blue-600 text-white shadow-lg" : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            My Timesheet
          </button>
          <button
            onClick={() => setActiveTab("ongoing")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === "ongoing" ? "bg-purple-600 text-white shadow-lg" : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-purple-300" /> Admin Ongoing Tasks Monitor ({ongoingTasks.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        
        {isLogging && (
          <div className="mb-8 bg-white/5 border border-blue-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" /> New Time Entry
              </h3>
              <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setTaskType("PROJECT")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    taskType === "PROJECT" ? "bg-blue-600 text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  Project Task
                </button>
                <button
                  type="button"
                  onClick={() => setTaskType("INTERNAL")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    taskType === "INTERNAL" ? "bg-purple-600 text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  Internal Company Task
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="text-xs text-white/50 mb-1 block">Date</label>
                <input 
                  type="date"
                  required
                  value={formData.logDate}
                  onChange={e => setFormData({...formData, logDate: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50" 
                />
              </div>

              {taskType === "PROJECT" ? (
                <div className="md:col-span-1">
                  <label className="text-xs text-white/50 mb-1 block">Project</label>
                  <select 
                    required
                    value={formData.projectId}
                    onChange={e => setFormData({...formData, projectId: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 appearance-none text-white"
                  >
                    <option value="">Select Project...</option>
                    {projects.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="md:col-span-1">
                  <label className="text-xs text-white/50 mb-1 block">Internal Activity / Task</label>
                  <select 
                    value={formData.taskId}
                    onChange={e => setFormData({...formData, taskId: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 appearance-none text-white"
                  >
                    <option value="">General Internal Task / Ops</option>
                    {allTasks.filter((t: any) => !t.projectId).map((t: any) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="md:col-span-1">
                <label className="text-xs text-white/50 mb-1 block">Hours</label>
                <input 
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 2.5"
                  value={formData.hours}
                  onChange={e => setFormData({...formData, hours: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-blue-500/50" 
                />
              </div>

              <div className="md:col-span-1">
                <label className="text-xs text-white/50 mb-1 block">Description</label>
                <input 
                  type="text"
                  placeholder="What work was performed?"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50" 
                />
              </div>

              <div className="md:col-span-4 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsLogging(false)} className="px-5 py-2 text-sm text-white/50 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">Save Entry</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "timesheet" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-black/40 border-b border-white/10 text-[10px] font-mono tracking-widest uppercase text-white/50">
                <tr>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Type & Name</th>
                  <th className="px-6 py-4 font-bold">Description</th>
                  <th className="px-6 py-4 font-bold text-right">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-white/50">Loading timesheets...</td>
                  </tr>
                ) : timeLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-white/50">
                      <List className="w-8 h-8 mx-auto mb-3 opacity-20" />
                      No time logs found
                    </td>
                  </tr>
                ) : (
                  timeLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white/60 text-xs">
                        {format(new Date(log.logDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white/90">
                          {log.project?.name ? (
                            <span className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">Project</span>
                              {log.project.name}
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">Internal</span>
                              {log.task?.title || "Internal Operations"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white/70">{log.description || "-"}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md">{log.hours.toFixed(1)}h</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "ongoing" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl">
              <div className="flex items-center gap-3 text-purple-300">
                <Activity className="w-5 h-5 animate-pulse" />
                <span className="text-sm font-semibold">Real-Time Active Tasks Monitor across Agency & Internal Operations</span>
              </div>
              <button onClick={() => mutateOngoing()} className="px-3 py-1.5 bg-purple-600 text-xs font-bold rounded-lg hover:bg-purple-500 transition-colors">
                Refresh Monitor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongoingTasks.length === 0 ? (
                <div className="col-span-full py-12 text-center text-white/50 bg-white/5 border border-white/10 rounded-2xl">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-60" />
                  <p className="font-bold text-lg">No Active Tasks Pending</p>
                  <p className="text-xs text-white/40 mt-1">All assigned staff tasks are currently complete or up to date.</p>
                </div>
              ) : (
                ongoingTasks.map((t: any) => (
                  <div key={t.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-purple-500/40 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${
                          t.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          t.status === 'IN_REVIEW' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] uppercase font-bold ${
                          t.priority === 'CRITICAL' ? 'text-red-400' :
                          t.priority === 'HIGH' ? 'text-amber-400' : 'text-white/50'
                        }`}>
                          {t.priority}
                        </span>
                      </div>

                      <h4 className="font-bold text-base text-white/90 mb-1">{t.title}</h4>
                      <p className="text-xs text-white/50 mb-4">{t.project ? `Project: ${t.project.name}` : 'Internal Company Task'}</p>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-purple-400" />
                        <span className="font-medium text-white/80">{t.assigneeName}</span>
                      </div>
                      <span className="text-[10px] text-white/40">Updated {format(new Date(t.updatedAt), 'HH:mm')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
