"use client"

import { useState, useEffect } from "react"
import { ArrowRightCircle, Briefcase, Calendar, CheckCircle, Clock, Filter, Kanban, LayoutGrid, List, Plus, Search, Trash2 } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useApi, fetchApi } from "@/lib/useApi"
import { SlideOver } from "@/components/SlideOver"
import { toast } from "sonner"

const STATUS_CONFIG = {
  BRIEFING:   { label: "Briefing",   color: "text-zinc-400 bg-white/[0.06] border-white/[0.08]" },
  DISCOVERY:  { label: "Discovery",  color: "text-[#0A84FF] bg-[#0A84FF]/10 border-[#0A84FF]/20" },
  CONCEPT:    { label: "Concept",    color: "text-[#BF5AF2] bg-[#BF5AF2]/10 border-[#BF5AF2]/20" },
  PRODUCTION: { label: "Production", color: "text-[#5E5CE6] bg-[#5E5CE6]/10 border-[#5E5CE6]/20" },
  REVIEW:     { label: "Review",     color: "text-[#FF9F0A] bg-[#FF9F0A]/10 border-[#FF9F0A]/20" },
  DELIVERY:   { label: "Delivery",   color: "text-[#30D158] bg-[#30D158]/10 border-[#30D158]/20" },
  CLOSED:     { label: "Closed",     color: "text-zinc-400 bg-white/[0.06] border-white/[0.08]" },
  ON_HOLD:    { label: "On Hold",    color: "text-[#FF453A] bg-[#FF453A]/10 border-[#FF453A]/20" },
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
  const { data: companiesData } = useApi<any>("/crm/companies")
  const { data: contactsData } = useApi<any>("/crm/contacts")
  const companies = companiesData?.data || []
  const contacts = contactsData?.data || []

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
    customTypeName: "",
    contactId: "",
    companyId: "",
    newCompanyName: "",
    managerId: "usr_1", // Default manager
    dueDate: "",
    budget: ""
  })

  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete project "${name}"? This action cannot be undone.`)) return;
    try {
      await fetchApi(`/projects/${id}`, { method: "DELETE" })
      toast.success(`Project "${name}" deleted successfully`)
      window.location.reload()
    } catch (err: any) {
      toast.error(`Failed to delete project: ${err.message}`)
    }
  }

  const handleInitializeProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload: any = {
        name: formData.name,
        type: formData.type,
        ...(formData.type === "CUSTOM" && formData.customTypeName.trim() && { customTypeName: formData.customTypeName.trim() }),
        managerId: formData.managerId,
        ...(formData.contactId && { contactId: formData.contactId }),
        ...(formData.companyId && formData.companyId !== "NEW" && { companyId: formData.companyId }),
        ...(formData.newCompanyName && { newCompanyName: formData.newCompanyName }),
        ...(formData.budget && { budget: parseFloat(formData.budget) })
      }
      if (formData.dueDate) {
        payload.dueDate = new Date(formData.dueDate).toISOString()
      }

      await fetchApi("/projects", {
        method: "POST",
        body: JSON.stringify(payload)
      })
      toast.success("Project created successfully")
      setIsInitializeOpen(false)
      setFormData({ name: "", type: "WEBSITE", customTypeName: "", contactId: "", companyId: "", newCompanyName: "", managerId: "usr_1", dueDate: "", budget: "" })
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message || "Failed to create project")
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
        setCrmToast(`${queued.length} project(s) synchronized from CRM pipeline.`)
        setTimeout(() => setCrmToast(null), 5000)
        window.location.reload()
      })
    }
  }, [])

  useEffect(() => {
    if (data?.data) {
      const colored = data.data.map((p: any) => ({
        ...p,
        color: STATUS_CONFIG[p.status as keyof typeof STATUS_CONFIG]?.color.match(/text-([a-z]+)-/)?.[1] || "slate",
        manager: p.managerId || "Unassigned",
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
        const color = STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG]?.color.match(/text-([a-z]+)-/)?.[1] || "slate"
        return { ...p, status: newStatus, color }
      }
      return p
    }))
    
    await fetchApi(`/projects/${draggedProject}`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus })
    }).catch(console.error)

    setDraggedProject(null)
  }

  const KANBAN_COLUMNS = Object.keys(STATUS_CONFIG).filter(k => !['CLOSED', 'ON_HOLD'].includes(k))

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-black text-[#f5f5f7]">
      
      {/* CRM Import Toast */}
      <AnimatePresence>
        {crmToast && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border bg-[#161618] border-white/[0.1] text-zinc-200 text-xs shadow-xl backdrop-blur-md"
          >
            <CheckCircle className="w-4 h-4 text-[#30D158]" />
            {crmToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-white/[0.07] bg-[#121214]/60 backdrop-blur-md">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#161618] border border-white/[0.08] flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-[#0A84FF]" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-[#f5f5f7]">Projects</h1>
              <p className="text-xs text-zinc-400">Deliverables, sprints, and milestones</p>
            </div>
          </div>
          <button 
            onClick={() => setIsInitializeOpen(true)}
            className="flex items-center gap-1.5 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Project
          </button>
        </div>

        {/* Stats & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <StatBlock label="Active" value={activeProjects.length} />
            <StatBlock label="Completed" value={completedProjects.length} />
            <StatBlock label="On Hold" value={delayedProjects.length} />
            <StatBlock label="Avg Progress" value={`${Math.round(activeProjects.reduce((s, p) => s + p.progress, 0) / (activeProjects.length || 1))}%`} />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-[#1c1c1e] p-0.5 rounded-lg border border-white/[0.08]">
              <ViewButton icon={Kanban} label="Kanban" active={view === "KANBAN"} onClick={() => setView("KANBAN")} />
              <ViewButton icon={LayoutGrid} label="Grid" active={view === "GRID"} onClick={() => setView("GRID")} />
              <ViewButton icon={List} label="List" active={view === "LIST"} onClick={() => setView("LIST")} />
            </div>
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter projects..."
                className="w-full bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#f5f5f7] placeholder:text-zinc-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        
        {view === "KANBAN" && (
          <div className="flex h-full gap-4 pb-4 overflow-x-auto snap-x custom-scrollbar">
            {KANBAN_COLUMNS.map(columnKey => {
              const cfg = STATUS_CONFIG[columnKey as keyof typeof STATUS_CONFIG]
              const colProjects = filtered.filter(p => p.status === columnKey)
              
              return (
                <div 
                  key={columnKey} 
                  className="flex-none w-72 flex flex-col bg-[#121214] border border-white/[0.07] rounded-xl overflow-hidden snap-start"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, columnKey)}
                >
                  <div className="px-3.5 py-2.5 border-b border-white/[0.06] flex items-center justify-between bg-[#161618]">
                    <h3 className="text-xs font-medium text-zinc-300 flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.color.split(' ')[0].replace('text-', 'bg-')}`} />
                      {cfg.label}
                    </h3>
                    <span className="text-[11px] font-medium text-zinc-400 bg-white/[0.06] px-2 py-0.5 rounded-full tabular-nums">
                      {colProjects.length}
                    </span>
                  </div>
                  
                  <div className="flex-1 p-3 space-y-2.5 overflow-y-auto custom-scrollbar">
                    <AnimatePresence>
                      {colProjects.map((project) => (
                        <motion.div 
                          layoutId={project.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          key={project.id}
                          draggable
                          onDragStart={(e: any) => handleDragStart(e, project.id)}
                          className={`bg-[#1c1c1e] border border-white/[0.08] hover:border-white/[0.16] rounded-xl p-3.5 cursor-grab active:cursor-grabbing transition-colors group ${draggedProject === project.id ? 'opacity-40 border-dashed border-white/20' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{project.type.replace('_', ' ')}</span>
                            <div className="w-5 h-5 rounded-md bg-white/[0.06] flex items-center justify-center text-zinc-300 font-medium text-[10px]">
                              {project.manager[0]}
                            </div>
                          </div>
                          
                          <Link href={`/dashboard/projects/${project.id}`} className="block">
                            <h4 className="font-medium text-xs text-[#f5f5f7] mb-0.5 group-hover:text-[#0A84FF] transition-colors">{project.name}</h4>
                            <p className="text-[11px] text-zinc-400 mb-3 truncate">{project.client}</p>
                            
                            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5">
                              <div className="flex items-center gap-1 text-zinc-500">
                                <Calendar className="w-3 h-3" /> {project.dueDate}
                              </div>
                              <span className="font-medium tabular-nums text-zinc-300">{project.progress}%</span>
                            </div>
                            
                            {/* Progress bar line */}
                            <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
                              <div className="h-full bg-[#0A84FF] rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {colProjects.length === 0 && (
                      <div className="h-28 flex items-center justify-center border border-dashed border-white/[0.06] rounded-lg">
                        <span className="text-[11px] text-zinc-600">No projects</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {view === "GRID" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(project => {
              const statusCfg = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG]
              return (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="group block bg-[#161618] border border-white/[0.08] hover:border-white/[0.16] rounded-xl p-4 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${statusCfg?.color || 'text-zinc-400 border-white/[0.08]'}`}>
                      {statusCfg?.label || project.status}
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{project.type.replace('_', ' ')}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-[#f5f5f7] mb-0.5 group-hover:text-[#0A84FF] transition-colors">{project.name}</h3>
                    <p className="text-xs text-zinc-400 mb-4">{project.client}</p>
                    
                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-zinc-500">Progress</span>
                        <span className="text-zinc-300 font-medium tabular-nums">{project.progress}%</span>
                      </div>
                      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full bg-[#0A84FF] rounded-full transition-all duration-300" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs text-zinc-400">
                      <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
                        <Calendar className="w-3 h-3" /> {project.dueDate}
                      </div>
                      <div className="w-5 h-5 rounded-md bg-white/[0.06] flex items-center justify-center text-zinc-300 font-medium text-[10px]">
                        {project.manager[0]}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {view === "LIST" && (
          <div className="bg-[#161618] border border-white/[0.08] rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-[#121214] text-[11px] font-medium text-zinc-400">
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs">
                {filtered.map(project => {
                  const statusCfg = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG]
                  return (
                    <tr key={project.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/projects/${project.id}`} className="font-medium text-[#f5f5f7] group-hover:text-[#0A84FF] transition-colors block">{project.name}</Link>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">{project.type.replace('_', ' ')}</p>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{project.client}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-md border ${statusCfg?.color || 'text-zinc-400 border-white/[0.08]'}`}>
                          {statusCfg?.label || project.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-20 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-[#0A84FF]" style={{ width: `${project.progress}%` }} />
                          </div>
                          <span className="text-[11px] font-medium tabular-nums text-zinc-300">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-zinc-400 tabular-nums">
                        {project.dueDate}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleDeleteProject(project.id, project.name)}
                          title="Delete Project"
                          className="p-1.5 rounded-md text-zinc-500 hover:text-[#FF453A] hover:bg-[#FF453A]/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* SlideOver for New Project */}
      <SlideOver
        open={isInitializeOpen}
        onClose={() => setIsInitializeOpen(false)}
        title="New Project"
        subtitle="Set up project scope, client contact, and schedule."
      >
        <form onSubmit={handleInitializeProject} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Project Name *</label>
            <input 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg px-3 py-2 text-xs text-[#f5f5f7] placeholder:text-zinc-500 focus:outline-none transition-colors"
              placeholder="e.g. Fleet Overhaul Sprint"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Project Type *</label>
            <select 
              required
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
              className="w-full bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg px-3 py-2 text-xs text-[#f5f5f7] focus:outline-none transition-colors"
            >
              <option value="WEBSITE">Website Development</option>
              <option value="MOBILE_APP">Mobile App Development</option>
              <option value="BRAND_IDENTITY">Brand Identity</option>
              <option value="CAMPAIGN">Campaign</option>
              <option value="MOTION">Motion Graphics</option>
              <option value="FULL_PACKAGE">Full Package</option>
              <option value="CUSTOM">Custom Project Type...</option>
            </select>
            {formData.type === "CUSTOM" && (
              <input 
                type="text"
                placeholder="Enter custom project type..."
                value={formData.customTypeName}
                onChange={e => setFormData({...formData, customTypeName: e.target.value})}
                className="w-full mt-2 bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg px-3 py-2 text-xs text-[#f5f5f7] placeholder:text-zinc-500 focus:outline-none transition-colors"
              />
            )}
          </div>
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Assign Client Contact</label>
            <select 
              value={formData.contactId}
              onChange={e => {
                const selectedContactId = e.target.value;
                const contact = contacts.find((c: any) => c.id === selectedContactId);
                setFormData({
                  ...formData,
                  contactId: selectedContactId,
                  ...(contact?.companyId && { companyId: contact.companyId })
                });
              }}
              className="w-full bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg px-3 py-2 text-xs text-[#f5f5f7] focus:outline-none transition-colors"
            >
              <option value="">Select Contact...</option>
              {contacts.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} {c.email ? `(${c.email})` : ''} {c.company?.name ? `— ${c.company.name}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Company / Organization</label>
            <select 
              value={formData.companyId}
              onChange={e => setFormData({...formData, companyId: e.target.value, ...(e.target.value !== "NEW" && { newCompanyName: "" })})}
              className="w-full bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg px-3 py-2 text-xs text-[#f5f5f7] focus:outline-none transition-colors"
            >
              <option value="">Independent (No Company)</option>
              {companies.map((comp: any) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name}
                </option>
              ))}
              <option value="NEW">+ Create New Company...</option>
            </select>
            {formData.companyId === "NEW" && (
              <input 
                type="text"
                placeholder="Enter new company name..."
                value={formData.newCompanyName}
                onChange={e => setFormData({...formData, newCompanyName: e.target.value})}
                className="w-full mt-2 bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg px-3 py-2 text-xs text-[#f5f5f7] placeholder:text-zinc-500 focus:outline-none transition-colors"
              />
            )}
          </div>
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Budget (₹)</label>
            <input 
              type="number"
              value={formData.budget}
              onChange={e => setFormData({...formData, budget: e.target.value})}
              className="w-full bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg px-3 py-2 text-xs text-[#f5f5f7] placeholder:text-zinc-500 focus:outline-none transition-colors tabular-nums"
              placeholder="e.g. 150000"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Deadline</label>
            <input 
              type="date"
              value={formData.dueDate}
              onChange={e => setFormData({...formData, dueDate: e.target.value})}
              className="w-full bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg px-3 py-2 text-xs text-[#f5f5f7] focus:outline-none transition-colors [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Project Manager ID *</label>
            <input 
              required
              value={formData.managerId}
              onChange={e => setFormData({...formData, managerId: e.target.value})}
              className="w-full bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg px-3 py-2 text-xs text-[#f5f5f7] placeholder:text-zinc-500 focus:outline-none transition-colors"
              placeholder="e.g. usr_1"
            />
          </div>
          <div className="pt-3 border-t border-white/[0.07] flex justify-end gap-2">
            <button 
              type="button"
              onClick={() => setIsInitializeOpen(false)}
              className="px-3.5 py-2 bg-transparent hover:bg-white/[0.06] border border-white/[0.08] rounded-lg text-xs font-medium text-zinc-300 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-medium rounded-lg text-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}

function StatBlock({ label, value }: { label: string, value: string | number }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-zinc-400 mb-0.5">{label}</p>
      <p className="text-base font-semibold text-[#f5f5f7] tabular-nums">{value}</p>
    </div>
  )
}

function ViewButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
        active 
          ? "bg-white/[0.12] text-white" 
          : "text-zinc-400 hover:text-white"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden md:inline">{label}</span>
    </button>
  )
}
