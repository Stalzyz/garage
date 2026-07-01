"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Briefcase, Calendar, CheckCircle, Clock, Kanban, ArrowRightCircle, LayoutGrid, List } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useApi, fetchApi } from "@/lib/useApi"
import { SlideOver } from "@/components/SlideOver"
import { toast } from "sonner"

const STATUS_CONFIG = {
  BRIEFING:   { label: "Briefing",   color: "text-slate-400 bg-slate-500/10 border-slate-500/20", glow: "" },
  DISCOVERY:  { label: "Discovery",  color: "text-blue-400 bg-blue-500/10 border-blue-500/20", glow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]" },
  CONCEPT:    { label: "Concept",    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", glow: "shadow-[0_0_15px_rgba(99,102,241,0.3)]" },
  PRODUCTION: { label: "Production", color: "text-violet-400 bg-violet-500/10 border-violet-500/20", glow: "shadow-[0_0_15px_rgba(139,92,246,0.3)]" },
  REVIEW:     { label: "Review",     color: "text-amber-400 bg-amber-500/10 border-amber-500/20", glow: "shadow-[0_0_15px_rgba(251,191,36,0.3)] animate-pulse" },
  DELIVERY:   { label: "Delivery",   color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]" },
  CLOSED:     { label: "Closed",     color: "text-green-500 bg-green-500/10 border-green-500/20", glow: "" },
  ON_HOLD:    { label: "On Hold",    color: "text-red-400 bg-red-500/10 border-red-500/20", glow: "shadow-[0_0_15px_rgba(239,68,68,0.2)]" },
}

const INITIAL_PROJECTS = [
  { id: "proj_1", name: "RedBrick Brand Identity", client: "RedBrick Realty", type: "BRAND_IDENTITY", status: "CONCEPT", progress: 35, dueDate: "Jul 10, 2025", manager: "Aisha R.", color: "indigo" },
  { id: "proj_2", name: "Techflow SaaS Redesign", client: "Techflow SaaS", type: "WEBSITE", status: "PRODUCTION", progress: 60, dueDate: "Jul 15, 2025", manager: "Ravi K.", color: "violet" },
  { id: "proj_3", name: "Fitburst Launch Video", client: "Fitburst Gym", type: "MOTION", status: "REVIEW", progress: 90, dueDate: "Jun 20, 2025", manager: "Aisha R.", color: "amber" },
  { id: "proj_4", name: "Spice Kitchen Socials Q3", client: "Spice Kitchen", type: "CAMPAIGN", status: "BRIEFING", progress: 5, dueDate: "Aug 01, 2025", manager: "Maya S.", color: "slate" },
  { id: "proj_5", name: "Bloom Studios Packaging", client: "Bloom Studios", type: "CUSTOM", status: "DISCOVERY", progress: 15, dueDate: "Jul 30, 2025", manager: "Ravi K.", color: "blue" },
]

export default function ProjectsDashboard() {
  const { data, isLoading } = useApi<{data: any[], total: number}>("/projects")
  const [view, setView] = useState<"KANBAN" | "GRID" | "LIST">("KANBAN")
  const [search, setSearch] = useState("")
  const [projects, setProjects] = useState<any[]>([])
  const [draggedProject, setDraggedProject] = useState<string | null>(null)
  const [crmToast, setCrmToast] = useState<string | null>(null)
  
  const [isInitializeOpen, setIsInitializeOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "WEBSITE",
    managerId: "usr_1", // Default manager
    dueDate: ""
  })

  const handleInitializeProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload: any = {
        name: formData.name,
        type: formData.type,
        managerId: formData.managerId
      }
      if (formData.dueDate) {
        payload.dueDate = new Date(formData.dueDate).toISOString()
      }

      await fetchApi("/projects", {
        method: "POST",
        body: JSON.stringify(payload)
      })
      toast.success("Project initialized successfully")
      setIsInitializeOpen(false)
      setFormData({ name: "", type: "WEBSITE", managerId: "usr_1", dueDate: "" })
      // Trigger reload to fetch new project
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize project")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const queued = JSON.parse(localStorage.getItem("new_projects_queue") || "[]")
    if (queued.length > 0) {
      Promise.all(queued.map((q: any) => 
        fetchApi("/projects", {
          method: "POST",
          body: JSON.stringify({
            name: q.name,
            leadId: null,
            type: q.type,
            status: q.status,
            dueDate: q.dueDate,
            budget: q.budget
          })
        })
      )).then(() => {
        localStorage.removeItem("new_projects_queue")
        setCrmToast(`INTEGRATION SUCCESS: ${queued.length} project(s) synchronized from CRM Pipeline.`)
        setTimeout(() => setCrmToast(null), 5000)
        // trigger reload or simply refresh window for simplicity here
        window.location.reload()
      })
    }
  }, [])

  useEffect(() => {
    if (data?.data) {
      // Map colors if not provided by backend
      const colored = data.data.map((p: any) => ({
        ...p,
        color: STATUS_CONFIG[p.status as keyof typeof STATUS_CONFIG]?.color.match(/text-([a-z]+)-/)?.[1] || "slate",
        manager: p.managerId || "Unassigned", // we'll need to fetch user names if manager is a relation
        client: p.company?.name || "Unknown Client",
        progress: p.progress || 0
      }))
      setProjects(colored)
    }
  }, [data])

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.lead?.name || "").toLowerCase().includes(search.toLowerCase()))

  const activeProjects = filtered.filter(p => !['CLOSED', 'ON_HOLD'].includes(p.status))
  const completedProjects = filtered.filter(p => p.status === 'CLOSED')
  const delayedProjects = filtered.filter(p => p.status === 'ON_HOLD')

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedProject(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    if (!draggedProject) return

    setProjects(prev => prev.map(p => {
      if (p.id === draggedProject) {
        // Find color based on new status
        const color = STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG]?.color.match(/text-([a-z]+)-/)?.[1] || "slate"
        return { ...p, status: newStatus, color }
      }
      return p
    }))
    
    // Live update
    await fetchApi(`/projects/${draggedProject}`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus })
    }).catch(console.error)

    setDraggedProject(null)
  }

  const KANBAN_COLUMNS = Object.keys(STATUS_CONFIG).filter(k => !['CLOSED', 'ON_HOLD'].includes(k))

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-transparent text-white relative">
      
      {/* Background blurs */}
      <div className="absolute top-0 right-[20%] w-[40%] h-[40%] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-[20%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* CRM Import Toast */}
      <AnimatePresence>
        {crmToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] border bg-emerald-500/10 border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold tracking-widest uppercase backdrop-blur-md"
          >
            <ArrowRightCircle className="w-4 h-4 animate-pulse" />
            {crmToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-white/10 bg-black/20 backdrop-blur-md relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)] relative overflow-hidden">
              <div className="absolute inset-0 bg-violet-500/20 animate-pulse mix-blend-overlay" />
              <Briefcase className="w-6 h-6 text-violet-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Project Matrix</h1>
              <p className="text-xs font-mono tracking-widest uppercase text-white/40 mt-1">Deliverables & Timeline Telemetry</p>
            </div>
          </div>
          <button 
            onClick={() => setIsInitializeOpen(true)}
            className="group flex items-center gap-2 bg-white text-black font-bold tracking-widest uppercase text-[10px] px-5 py-3 rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] relative overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-[150%] animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
            <Plus className="w-4 h-4" /> Initialize Project
          </button>
        </div>

        {/* Stats & Filters */}
        <div className="flex items-end justify-between">
          <div className="flex gap-6">
            <StatBlock label="Active Deliverables" value={activeProjects.length} color="blue" />
            <StatBlock label="Completed" value={completedProjects.length} color="emerald" />
            <StatBlock label="Delayed / Hold" value={delayedProjects.length} color="red" />
            <StatBlock label="Avg Progress" value={`${Math.round(activeProjects.reduce((s, p) => s + p.progress, 0) / (activeProjects.length || 1))}%`} color="violet" />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
              <ViewButton icon={Kanban} label="Kanban" active={view === "KANBAN"} onClick={() => setView("KANBAN")} />
              <ViewButton icon={LayoutGrid} label="Grid" active={view === "GRID"} onClick={() => setView("GRID")} />
              <ViewButton icon={List} label="List" active={view === "LIST"} onClick={() => setView("LIST")} />
            </div>
            <div className="relative w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-all backdrop-blur-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8 relative z-10 custom-scrollbar">
        
        {view === "KANBAN" && (
          <div className="flex h-full gap-6 pb-4 overflow-x-auto snap-x custom-scrollbar">
            {KANBAN_COLUMNS.map(columnKey => {
              const cfg = STATUS_CONFIG[columnKey as keyof typeof STATUS_CONFIG]
              const colProjects = filtered.filter(p => p.status === columnKey)
              
              return (
                <div 
                  key={columnKey} 
                  className="flex-none w-80 flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden snap-start backdrop-blur-md"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, columnKey)}
                >
                  <div className={`p-5 border-b border-white/10 flex items-center justify-between bg-black/20`}>
                    <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white/70 flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${cfg.color.split(' ')[0].replace('text-', 'bg-')} ${cfg.glow.replace('shadow-', 'shadow-sm ')}`} />
                      {cfg.label}
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-white/50 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                      {colProjects.length}
                    </span>
                  </div>
                  
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                    <AnimatePresence>
                      {colProjects.map((project, i) => (
                        <motion.div 
                          layoutId={project.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          key={project.id}
                          draggable
                          onDragStart={(e: any) => handleDragStart(e, project.id)}
                          className={`bg-white/5 border border-white/10 rounded-xl p-5 cursor-grab active:cursor-grabbing hover:border-${project.color}-500/50 transition-all group relative overflow-hidden ${draggedProject === project.id ? 'opacity-50 scale-95 border-dashed border-white/30' : 'hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]'}`}
                        >
                          <div className={`absolute top-0 left-0 w-1 h-full bg-${project.color}-500/50 group-hover:bg-${project.color}-400 transition-colors shadow-[0_0_10px_var(--tw-shadow-color)] shadow-${project.color}-500/50`} />
                          
                          <div className="flex justify-between items-start mb-3 pl-2">
                            <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-white/40">{project.type.replace('_', ' ')}</span>
                            <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-white/70 font-mono font-bold text-[10px] border border-white/10">
                              {project.manager[0]}
                            </div>
                          </div>
                          
                          <Link href={`/dashboard/projects/${project.id}`} className="block pl-2">
                            <h4 className="font-bold text-white text-sm mb-1 group-hover:text-blue-400 transition-colors">{project.name}</h4>
                            <p className="text-xs font-mono text-white/50 mb-5 truncate">{project.client}</p>
                            
                            <div className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase">
                              <div className="flex items-center gap-1.5 text-white/40 group-hover:text-white/70 transition-colors">
                                <Calendar className="w-3 h-3" /> {project.dueDate}
                              </div>
                              <span className={`font-bold text-${project.color}-400`}>{project.progress}%</span>
                            </div>
                            
                            {/* Progress bar line */}
                            <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full bg-${project.color}-500`} style={{ width: `${project.progress}%` }} />
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {colProjects.length === 0 && (
                      <div className="h-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl m-1 opacity-50">
                        <span className="text-[10px] font-mono tracking-widest uppercase text-white/30 font-bold">Awaiting Input</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {view === "GRID" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(project => {
              const statusCfg = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG]
              return (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="group block bg-white/5 border border-white/10 rounded-2xl p-6 transition-all hover:border-white/20 hover:-translate-y-1 backdrop-blur-md relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br from-${project.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className="relative z-10 flex justify-between items-start mb-6">
                    <span className={`text-[9px] font-mono font-bold tracking-widest uppercase px-2.5 py-1.5 rounded-lg border ${statusCfg.color} ${statusCfg.glow}`}>
                      {statusCfg.label}
                    </span>
                    <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-white/40 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10">{project.type.replace('_', ' ')}</span>
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-base font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{project.name}</h3>
                    <p className="text-xs font-mono text-white/50 mb-6">{project.client}</p>
                    
                    {/* Progress bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-[10px] font-mono tracking-widest uppercase mb-2">
                        <span className="text-white/40">Completion</span>
                        <span className="text-white font-bold">{project.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 bg-${project.color}-500 shadow-[0_0_10px_var(--tw-shadow-color)] shadow-${project.color}-500/50`} style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-white/10 text-[10px] font-mono tracking-widest uppercase text-white/40">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" /> {project.dueDate}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-white/80 font-bold border border-white/20">
                          {project.manager[0]}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {view === "LIST" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-[10px] font-mono tracking-widest text-white/40 uppercase">
                  <th className="px-6 py-4 font-bold">Project Name</th>
                  <th className="px-6 py-4 font-bold">Client Matrix</th>
                  <th className="px-6 py-4 font-bold">Current Status</th>
                  <th className="px-6 py-4 font-bold">Telemetry</th>
                  <th className="px-6 py-4 font-bold">Deadline</th>
                  <th className="px-6 py-4 font-bold">Lead</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filtered.map(project => {
                  const statusCfg = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG]
                  return (
                    <tr key={project.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-5">
                        <Link href={`/dashboard/projects/${project.id}`} className="font-bold text-white group-hover:text-blue-400 transition-colors block">{project.name}</Link>
                        <p className="text-[9px] font-mono uppercase tracking-widest text-white/30 mt-1">{project.type.replace('_', ' ')}</p>
                      </td>
                      <td className="px-6 py-5 text-white/70">{project.client}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex text-[9px] font-mono font-bold tracking-widest uppercase px-2.5 py-1.5 rounded-lg border ${statusCfg.color} ${statusCfg.glow}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full bg-${project.color}-500 shadow-[0_0_10px_var(--tw-shadow-color)] shadow-${project.color}-500/50`} style={{ width: `${project.progress}%` }} />
                          </div>
                          <span className="text-[10px] font-mono tracking-widest font-bold text-white">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[10px] font-mono tracking-widest uppercase text-white/50">
                        {project.dueDate}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-white/80 font-bold border border-white/20 text-[10px]">
                            {project.manager[0]}
                          </div>
                          <span className="text-xs text-white/70">{project.manager}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* SlideOver for Initializing Project */}
      <SlideOver
        open={isInitializeOpen}
        onClose={() => setIsInitializeOpen(false)}
        title="Initialize Project"
        subtitle="Create a new project matrix for telemetry tracking."
      >
        <form onSubmit={handleInitializeProject} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Project Name *</label>
            <input 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/30"
              placeholder="e.g. RedBrick Brand Identity"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Project Type *</label>
            <select 
              required
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white"
            >
              <option value="BRAND_IDENTITY">Brand Identity</option>
              <option value="WEBSITE">Website</option>
              <option value="CAMPAIGN">Campaign</option>
              <option value="MOTION">Motion Graphics</option>
              <option value="FULL_PACKAGE">Full Package</option>
              <option value="CUSTOM">Custom Project</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Deadline</label>
            <input 
              type="date"
              value={formData.dueDate}
              onChange={e => setFormData({...formData, dueDate: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/30 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Project Manager ID *</label>
            <input 
              required
              value={formData.managerId}
              onChange={e => setFormData({...formData, managerId: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/30"
              placeholder="e.g. usr_1"
            />
          </div>
          <div className="pt-4 mt-6 border-t border-white/10">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Initializing..." : "Initialize Project"}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}

function StatBlock({ label, value, color }: { label: string, value: string | number, color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full bg-${color}-500 shadow-[0_0_10px_var(--tw-shadow-color)] shadow-${color}-500/50`} />
      <div>
        <p className="text-[9px] font-mono tracking-widest uppercase text-white/40 mb-0.5">{label}</p>
        <p className="text-xl font-black text-white">{value}</p>
      </div>
    </div>
  )
}

function ViewButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className={`px-4 py-2 text-[10px] font-mono font-bold tracking-widest uppercase rounded-lg transition-all flex items-center gap-2 ${
        active 
          ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
          : "text-white/40 hover:text-white hover:bg-white/10"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden md:inline">{label}</span>
    </button>
  )
}
