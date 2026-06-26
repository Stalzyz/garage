"use client"

import { useState } from "react"
import { Clock, Plus, Calendar as CalendarIcon, Play, Square, List, User } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { format } from "date-fns"
import { toast } from "sonner"

export default function TimeTrackingPage() {
  const { data: logsData, mutate: mutateLogs, isLoading } = useApi<any>("/hr/time")
  const { data: projectsData } = useApi<any>("/projects")
  
  const timeLogs = logsData?.timeLogs || []
  const projects = projectsData?.projects || []

  const [isLogging, setIsLogging] = useState(false)
  const [formData, setFormData] = useState({
    projectId: "",
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
          projectId: formData.projectId,
          hours: parseFloat(formData.hours),
          description: formData.description,
          logDate: new Date(formData.logDate).toISOString()
        })
      })
      toast.success("Time logged successfully")
      setFormData({ ...formData, hours: "", description: "" })
      setIsLogging(false)
      mutateLogs()
    } catch (err: any) {
      toast.error(err.message || "Failed to log time")
    }
  }

  const totalHours = timeLogs.reduce((sum: number, log: any) => sum + log.hours, 0)

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 py-8 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Time Tracking</h1>
            <p className="text-sm text-white/50 mt-2">Log hours against projects and tasks</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex flex-col items-end justify-center">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Total Hours</span>
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        
        {isLogging && (
          <div className="mb-8 bg-white/5 border border-blue-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" /> New Time Entry
            </h3>
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
                  placeholder="What did you work on?"
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

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-black/40 border-b border-white/10 text-[10px] font-mono tracking-widest uppercase text-white/50">
              <tr>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Project</th>
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
                      <div className="font-medium text-white/90">{log.project?.name || "Unknown Project"}</div>
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
      </div>
    </div>
  )
}
