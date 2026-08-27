"use client"

import { useState, useMemo } from "react"
import { 
  CheckSquare, Plus, Search, Filter, Calendar, User, Clock, 
  Trash2, Kanban, List, AlertCircle, CheckCircle2, MoreVertical,
  Briefcase, ArrowUpRight, Flame, ShieldAlert
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useApi, fetchApi } from "@/lib/useApi"
import { SlideOver } from "@/components/SlideOver"
import { toast } from "sonner"

const STATUS_CONFIG: Record<string, { label: string; color: string; border: string }> = {
  TODO:        { label: "To Do",       color: "text-slate-400 bg-slate-500/10",   border: "border-slate-500/20" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-400 bg-blue-500/10",     border: "border-blue-500/20" },
  IN_REVIEW:   { label: "In Review",   color: "text-amber-400 bg-amber-500/10",   border: "border-amber-500/20" },
  DONE:        { label: "Completed",   color: "text-emerald-400 bg-emerald-500/10", border: "border-emerald-500/20" },
  BLOCKED:     { label: "Blocked",     color: "text-red-400 bg-red-500/10",       border: "border-red-500/20" },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  CRITICAL: { label: "Critical", color: "text-red-400 bg-red-500/10 border-red-500/30" },
  HIGH:     { label: "High",     color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
  NORMAL:   { label: "Normal",   color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  LOW:      { label: "Low",      color: "text-slate-400 bg-slate-500/10 border-slate-500/30" },
}

export default function StaffTasksDashboard() {
  const { data: tasksData, mutate: mutateTasks, isLoading } = useApi<{ data: any[]; total: number }>("/projects/tasks/all")
  const { data: employeesData } = useApi<any>("/hr/employees")
  const { data: projectsData } = useApi<any>("/projects")

  const rawTasks = tasksData?.data || []
  const employees = employeesData?.employees || []
  const projects = projectsData?.data || []

  // View & Filter States
  const [viewMode, setViewMode] = useState<"KANBAN" | "LIST">("KANBAN")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [assigneeFilter, setAssigneeFilter] = useState("ALL")
  const [priorityFilter, setPriorityFilter] = useState("ALL")

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assigneeId: "",
    priority: "NORMAL",
    status: "TODO",
    dueDate: "",
    projectId: ""
  })

  // Helper for staff name lookup
  const getStaffName = (assigneeId: string | null) => {
    if (!assigneeId) return "Unassigned"
    const emp = employees.find((e: any) => e.id === assigneeId || e.userId === assigneeId)
    if (emp && emp.user) {
      return `${emp.user.firstName} ${emp.user.lastName}`
    }
    if (emp) return `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || assigneeId
    return assigneeId
  }

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return rawTasks.filter(task => {
      if (statusFilter !== "ALL" && task.status !== statusFilter) return false
      if (assigneeFilter !== "ALL" && task.assigneeId !== assigneeFilter) return false
      if (priorityFilter !== "ALL" && task.priority !== priorityFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = task.title.toLowerCase().includes(q)
        const matchDesc = (task.description || "").toLowerCase().includes(q)
        const matchAssignee = getStaffName(task.assigneeId).toLowerCase().includes(q)
        return matchTitle || matchDesc || matchAssignee
      }
      return true
    })
  }, [rawTasks, statusFilter, assigneeFilter, priorityFilter, searchQuery, employees])

  // Telemetry Metrics
  const totalCount = rawTasks.length
  const completedCount = rawTasks.filter(t => t.status === "DONE").length
  const inProgressCount = rawTasks.filter(t => t.status === "IN_PROGRESS" || t.status === "IN_REVIEW").length
  const criticalCount = rawTasks.filter(t => t.priority === "CRITICAL" && t.status !== "DONE").length

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingTask(null)
    setTaskForm({
      title: "",
      description: "",
      assigneeId: "",
      priority: "NORMAL",
      status: "TODO",
      dueDate: "",
      projectId: ""
    })
    setIsTaskModalOpen(true)
  }

  const handleOpenEditModal = (task: any) => {
    setEditingTask(task)
    setTaskForm({
      title: task.title,
      description: task.description || "",
      assigneeId: task.assigneeId || "",
      priority: task.priority || "NORMAL",
      status: task.status || "TODO",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
      projectId: task.projectId || ""
    })
    setIsTaskModalOpen(true)
  }

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskForm.title.trim()) {
      toast.error("Task title is required")
      return
    }
    setIsSubmitting(true)

    try {
      const payload: any = {
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || undefined,
        assigneeId: taskForm.assigneeId || undefined,
        priority: taskForm.priority,
        status: taskForm.status,
        projectId: taskForm.projectId || undefined,
        ...(taskForm.dueDate && { dueDate: new Date(taskForm.dueDate).toISOString() })
      }

      if (editingTask) {
        await fetchApi(`/projects/tasks/${editingTask.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        })
        toast.success("Task updated successfully")
      } else {
        await fetchApi("/projects/tasks", {
          method: "POST",
          body: JSON.stringify(payload)
        })
        toast.success("Task assigned & staff notified via email")
      }

      setIsTaskModalOpen(false)
      mutateTasks()
    } catch (err: any) {
      toast.error(err.message || "Failed to save task")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete task "${title}"?`)) return
    try {
      await fetchApi(`/projects/tasks/${taskId}`, { method: "DELETE" })
      toast.success("Task deleted")
      setIsTaskModalOpen(false)
      mutateTasks()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete task")
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await fetchApi(`/projects/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      })
      toast.success(`Task status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`)
      mutateTasks()
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    }
  }

  const KANBAN_STAGES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED"]

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-transparent text-white relative">
      
      {/* Background blurs */}
      <div className="absolute top-0 right-[20%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-[20%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-white/10 bg-black/20 backdrop-blur-md relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)] relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-500/20 animate-pulse mix-blend-overlay" />
              <CheckSquare className="w-6 h-6 text-blue-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Staff Task Control</h1>
              <p className="text-xs font-mono tracking-widest uppercase text-white/40 mt-1">Internal Operations & Team Assignments</p>
            </div>
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="group flex items-center gap-2 bg-white text-black font-bold tracking-widest uppercase text-[10px] px-5 py-3 rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] relative overflow-hidden"
          >
            <Plus className="w-4 h-4" /> Create & Assign Task
          </button>
        </div>

        {/* Telemetry Stats & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              <div>
                <p className="text-[9px] font-mono tracking-widest uppercase text-white/40 mb-0.5">Total Tasks</p>
                <p className="text-xl font-black text-white">{totalCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              <div>
                <p className="text-[9px] font-mono tracking-widest uppercase text-white/40 mb-0.5">In Progress</p>
                <p className="text-xl font-black text-white">{inProgressCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <div>
                <p className="text-[9px] font-mono tracking-widest uppercase text-white/40 mb-0.5">Completed</p>
                <p className="text-xl font-black text-white">{completedCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              <div>
                <p className="text-[9px] font-mono tracking-widest uppercase text-white/40 mb-0.5">Critical Active</p>
                <p className="text-xl font-black text-red-400">{criticalCount}</p>
              </div>
            </div>
          </div>

          {/* Filters & View Switches */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
              <button 
                onClick={() => setViewMode("KANBAN")}
                className={`px-3 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase rounded-lg transition-all flex items-center gap-1.5 ${viewMode === "KANBAN" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}
              >
                <Kanban className="w-3.5 h-3.5" /> Kanban
              </button>
              <button 
                onClick={() => setViewMode("LIST")}
                className={`px-3 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase rounded-lg transition-all flex items-center gap-1.5 ${viewMode === "LIST" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}
              >
                <List className="w-3.5 h-3.5" /> List
              </button>
            </div>

            {/* Staff Filter */}
            <select 
              value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="ALL">All Staff</option>
              {employees.map((emp: any) => (
                <option key={emp.id || emp.userId} value={emp.userId || emp.id}>
                  {emp.user ? `${emp.user.firstName} ${emp.user.lastName}` : (emp.firstName ? `${emp.firstName} ${emp.lastName}` : emp.name || emp.id)}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select 
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="NORMAL">Normal</option>
              <option value="LOW">Low</option>
            </select>

            {/* Search */}
            <div className="relative w-56">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search staff tasks..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-auto overflow-y-auto p-8 relative z-10">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20 text-white/40 font-mono text-xs uppercase border border-dashed border-white/10 rounded-2xl">
            No staff tasks match filters.
          </div>
        ) : viewMode === "KANBAN" ? (
          /* KANBAN BOARD VIEW */
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-w-[1000px] h-full items-start">
            {KANBAN_STAGES.map(stage => {
              const stageTasks = filteredTasks.filter(t => t.status === stage)
              const cfg = STATUS_CONFIG[stage] || { label: stage, color: "text-white", border: "border-white/10" }

              return (
                <div key={stage} className="bg-black/30 border border-white/10 rounded-2xl p-4 flex flex-col min-h-[400px]">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <span className={`text-xs font-mono font-bold uppercase tracking-wider ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-full text-white/60">
                      {stageTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {stageTasks.map(task => {
                      const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.NORMAL
                      const staffName = getStaffName(task.assigneeId)

                      return (
                        <motion.div
                          key={task.id}
                          layout
                          onClick={() => handleOpenEditModal(task)}
                          className="bg-black/60 border border-white/10 hover:border-blue-500/40 rounded-xl p-4 cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                              {task.title}
                            </h4>
                            <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border flex-none ${prio.color}`}>
                              {prio.label}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-xs text-white/50 line-clamp-2 mb-3">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] font-mono text-white/50">
                            <div className="flex items-center gap-1.5 text-blue-300">
                              <User className="w-3 h-3 text-blue-400" />
                              <span className="truncate max-w-[100px]">{staffName}</span>
                            </div>

                            {task.dueDate && (
                              <div className="flex items-center gap-1 text-white/40">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* LIST TABLE VIEW */
          <div className="w-full border border-white/10 rounded-2xl overflow-hidden bg-black/30 backdrop-blur-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[10px] font-mono uppercase tracking-widest text-white/50">
                  <th className="p-4">Task</th>
                  <th className="p-4">Staff Assignee</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredTasks.map(task => {
                  const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.NORMAL
                  const st = STATUS_CONFIG[task.status] || { label: task.status, color: "text-white", border: "border-white/10" }

                  return (
                    <tr key={task.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-white text-sm">{task.title}</p>
                        {task.description && <p className="text-white/40 line-clamp-1 text-xs">{task.description}</p>}
                      </td>
                      <td className="p-4 font-mono text-blue-300">
                        {getStaffName(task.assigneeId)}
                      </td>
                      <td className="p-4">
                        <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${prio.color}`}>
                          {prio.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={task.status}
                          onChange={e => handleStatusChange(task.id, e.target.value)}
                          className={`bg-black/40 border rounded-lg px-2.5 py-1 text-[11px] font-mono cursor-pointer focus:outline-none ${st.color} ${st.border}`}
                        >
                          {KANBAN_STAGES.map(stage => (
                            <option key={stage} value={stage} className="bg-black text-white">
                              {STATUS_CONFIG[stage]?.label || stage}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 font-mono text-white/50">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(task)}
                            className="p-1.5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-colors"
                            title="Edit Task"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id, task.title)}
                            className="p-1.5 hover:bg-red-500/10 text-red-400/60 hover:text-red-400 rounded-lg transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* CREATE / EDIT STAFF TASK SLIDE-OVER */}
      <SlideOver
        open={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title={editingTask ? "Edit Staff Task" : "Assign Staff Task"}
        subtitle="Create & control internal staff assignments with real-time email alerts."
      >
        <form onSubmit={handleSaveTask} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Task Title *</label>
            <input
              required
              value={taskForm.title}
              onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white placeholder:text-white/30"
              placeholder="e.g. Prepare monthly GST filing report"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Assign to Staff Member</label>
            <select
              value={taskForm.assigneeId}
              onChange={e => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white"
            >
              <option value="">Unassigned (Open Staff Pool)</option>
              {employees.map((emp: any) => (
                <option key={emp.id || emp.userId} value={emp.userId || emp.id}>
                  {emp.user ? `${emp.user.firstName} ${emp.user.lastName} (${emp.user.email})` : (emp.firstName ? `${emp.firstName} ${emp.lastName}` : emp.name || emp.id)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Priority</label>
              <select
                value={taskForm.priority}
                onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="NORMAL">Normal</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Stage</label>
              <select
                value={taskForm.status}
                onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Completed</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Due Date</label>
            <input
              type="date"
              value={taskForm.dueDate}
              onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Link to Client Project (Optional)</label>
            <select
              value={taskForm.projectId}
              onChange={e => setTaskForm({ ...taskForm, projectId: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white"
            >
              <option value="">No Project (Internal Operational Task)</option>
              {projects.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.company?.name || 'Client'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Task Details / Instructions</label>
            <textarea
              value={taskForm.description}
              onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
              rows={4}
              placeholder="Provide specific instructions, deliverables, or checklist steps for the staff member..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white placeholder:text-white/30 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            {editingTask ? (
              <button
                type="button"
                onClick={() => handleDeleteTask(editingTask.id, editingTask.title)}
                className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold uppercase transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete Task
              </button>
            ) : <div />}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="px-5 py-3 border border-white/10 text-white/60 hover:text-white rounded-xl text-xs font-bold uppercase transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase transition-all shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : (editingTask ? "Apply Changes" : "Assign & Notify Staff")}
              </button>
            </div>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}
