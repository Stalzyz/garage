"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { 
  CheckSquare, Plus, Search, Filter, Calendar, User, Clock, 
  Trash2, Kanban, List, AlertCircle, CheckCircle2, MoreVertical,
  Briefcase, ArrowUpRight, Flame, ShieldAlert, Play, Square, Timer
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

  // Kanban drag state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  // Time tracking state: { [taskId]: { startedAt: number, totalSecs: number, running: boolean } }
  const [timers, setTimers] = useState<Record<string, { startedAt: number; totalSecs: number; running: boolean }>>(() => {
    try { return JSON.parse(localStorage.getItem('task_timers') || '{}') } catch { return {} }
  })
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Persist timers to localStorage
  useEffect(() => {
    localStorage.setItem('task_timers', JSON.stringify(timers))
  }, [timers])

  // Tick running timers every second
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimers(prev => {
        const updated = { ...prev }
        let changed = false
        for (const id in updated) {
          if (updated[id].running) {
            updated[id] = { ...updated[id], totalSecs: updated[id].totalSecs + 1 }
            changed = true
          }
        }
        return changed ? updated : prev
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

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
      toast.success(`Task moved to ${STATUS_CONFIG[newStatus]?.label || newStatus}`)
      mutateTasks()
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    }
  }

  // Kanban drag handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, column: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(column)
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    if (!draggedTaskId) return
    const task = rawTasks.find(t => t.id === draggedTaskId)
    if (task && task.status !== newStatus) {
      await handleStatusChange(draggedTaskId, newStatus)
    }
    setDraggedTaskId(null)
    setDragOverColumn(null)
  }

  const handleDragEnd = () => {
    setDraggedTaskId(null)
    setDragOverColumn(null)
  }

  // Timer helpers
  const formatTimer = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600)
    const m = Math.floor((totalSecs % 3600) / 60)
    const s = totalSecs % 60
    if (h > 0) return `${h}h ${m.toString().padStart(2,'0')}m`
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
  }

  const toggleTimer = (taskId: string) => {
    setTimers(prev => {
      const cur = prev[taskId] || { startedAt: 0, totalSecs: 0, running: false }
      return { ...prev, [taskId]: { ...cur, running: !cur.running, startedAt: Date.now() } }
    })
  }

  const KANBAN_STAGES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED"]

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-black text-[#f5f5f7]">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-white/[0.07] bg-[#121214]/60 backdrop-blur-md">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#161618] border border-white/[0.08] flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-[#0A84FF]" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-[#f5f5f7]">Tasks</h1>
              <p className="text-xs text-zinc-400">Team assignments, internal operations, and schedules</p>
            </div>
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Task
          </button>
        </div>

        {/* Stats & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[11px] font-medium text-zinc-400 mb-0.5">Total Tasks</p>
              <p className="text-base font-semibold text-[#f5f5f7] tabular-nums">{totalCount}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-zinc-400 mb-0.5">In Progress</p>
              <p className="text-base font-semibold text-[#f5f5f7] tabular-nums">{inProgressCount}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-zinc-400 mb-0.5">Completed</p>
              <p className="text-base font-semibold text-[#30D158] tabular-nums">{completedCount}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-zinc-400 mb-0.5">Critical</p>
              <p className="text-base font-semibold text-[#FF453A] tabular-nums">{criticalCount}</p>
            </div>
          </div>

          {/* Filters & View Switches */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex bg-[#1c1c1e] p-0.5 rounded-lg border border-white/[0.08]">
              <button 
                onClick={() => setViewMode("KANBAN")}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${viewMode === "KANBAN" ? "bg-white/[0.12] text-white" : "text-zinc-400 hover:text-white"}`}
              >
                <Kanban className="w-3.5 h-3.5" /> Kanban
              </button>
              <button 
                onClick={() => setViewMode("LIST")}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${viewMode === "LIST" ? "bg-white/[0.12] text-white" : "text-zinc-400 hover:text-white"}`}
              >
                <List className="w-3.5 h-3.5" /> List
              </button>
            </div>

            {/* Staff Filter */}
            <select 
              value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)}
              className="bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg px-2.5 py-1 text-xs text-[#f5f5f7] focus:outline-none transition-colors"
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
              className="bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg px-2.5 py-1 text-xs text-[#f5f5f7] focus:outline-none transition-colors"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="NORMAL">Normal</option>
              <option value="LOW">Low</option>
            </select>

            {/* Search */}
            <div className="relative w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter tasks..."
                className="w-full bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg pl-8 pr-3 py-1 text-xs text-[#f5f5f7] placeholder:text-zinc-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#0A84FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-xs border border-dashed border-white/[0.08] rounded-xl">
            No tasks match the selected filters.
          </div>
        ) : viewMode === "KANBAN" ? (
          /* KANBAN BOARD VIEW */
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 min-w-[1000px] h-full items-start">
            {KANBAN_STAGES.map(stage => {
              const stageTasks = filteredTasks.filter(t => t.status === stage)
              const cfg = STATUS_CONFIG[stage] || { label: stage, color: "text-zinc-400 bg-white/[0.06]", border: "border-white/[0.08]" }

              return (
                <div
                  key={stage}
                  onDragOver={(e) => handleDragOver(e, stage)}
                  onDrop={(e) => handleDrop(e, stage)}
                  onDragLeave={() => setDragOverColumn(null)}
                  className={`rounded-xl p-3 flex flex-col min-h-[400px] border transition-colors ${
                    dragOverColumn === stage
                      ? 'bg-[#161618] border-[#0A84FF]/40 border-dashed'
                      : 'bg-[#121214] border-white/[0.07]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.06]">
                    <span className="text-xs font-medium text-zinc-300">
                      {cfg.label}
                    </span>
                    <span className="text-[11px] font-medium text-zinc-400 bg-white/[0.06] px-2 py-0.5 rounded-full tabular-nums">
                      {stageTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1 overflow-y-auto">
                    {stageTasks.map(task => {
                      const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.NORMAL
                      const staffName = getStaffName(task.assigneeId)

                      return (
                        <motion.div
                          key={task.id}
                          layout
                          draggable
                          onDragStart={(e: any) => handleDragStart(e, task.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => handleOpenEditModal(task)}
                          className={`bg-[#1c1c1e] border rounded-xl p-3.5 cursor-grab active:cursor-grabbing transition-colors group ${
                            draggedTaskId === task.id
                              ? 'opacity-40 scale-95 border-dashed border-white/20'
                              : 'border-white/[0.08] hover:border-white/[0.16]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h4 className="text-xs font-medium text-[#f5f5f7] group-hover:text-[#0A84FF] transition-colors line-clamp-2">
                              {task.title}
                            </h4>
                            <span className={`text-[10px] font-medium uppercase px-1.5 py-0.5 rounded border flex-none ${prio.color}`}>
                              {prio.label}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-[11px] text-zinc-400 line-clamp-2 mb-2.5">
                              {task.description}
                            </p>
                          )}

                          {/* Time Tracker */}
                          <div
                            onClick={(e) => { e.stopPropagation(); toggleTimer(task.id) }}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-medium cursor-pointer mb-2.5 transition-colors ${
                              timers[task.id]?.running
                                ? 'bg-[#30D158]/10 border-[#30D158]/20 text-[#30D158]'
                                : 'bg-white/[0.04] border-white/[0.06] text-zinc-400 hover:text-white'
                            }`}
                          >
                            {timers[task.id]?.running ? <Square className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
                            <Timer className="w-2.5 h-2.5" />
                            <span className="tabular-nums">{formatTimer(timers[task.id]?.totalSecs || 0)}</span>
                          </div>

                          <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-[11px] text-zinc-400">
                            <div className="flex items-center gap-1 text-zinc-300">
                              <User className="w-3 h-3 text-zinc-500" />
                              <span className="truncate max-w-[90px]">{staffName}</span>
                            </div>

                            {task.dueDate && (
                              <div className="flex items-center gap-1 text-zinc-500">
                                <Calendar className="w-3 h-3" />
                                <span className="tabular-nums">{new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
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
          <div className="w-full border border-white/[0.08] rounded-xl overflow-hidden bg-[#161618]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-[#121214] text-[11px] font-medium text-zinc-400">
                  <th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs">
                {filteredTasks.map(task => {
                  const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.NORMAL
                  const st = STATUS_CONFIG[task.status] || { label: task.status, color: "text-zinc-400", border: "border-white/[0.08]" }

                  return (
                    <tr key={task.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#f5f5f7] text-xs">{task.title}</p>
                        {task.description && <p className="text-zinc-400 line-clamp-1 text-[11px]">{task.description}</p>}
                      </td>
                      <td className="px-4 py-3 text-zinc-300 text-xs">
                        {getStaffName(task.assigneeId)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${prio.color}`}>
                          {prio.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={task.status}
                          onChange={e => handleStatusChange(task.id, e.target.value)}
                          className={`bg-[#121214] border border-white/[0.08] rounded-md px-2 py-1 text-xs cursor-pointer focus:outline-none ${st.color}`}
                        >
                          {KANBAN_STAGES.map(stage => (
                            <option key={stage} value={stage} className="bg-[#1c1c1e] text-white">
                              {STATUS_CONFIG[stage]?.label || stage}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 tabular-nums text-xs">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(task)}
                            className="p-1.5 hover:bg-white/[0.08] text-zinc-400 hover:text-white rounded-md transition-colors"
                            title="Edit Task"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id, task.title)}
                            className="p-1.5 hover:bg-[#FF453A]/10 text-zinc-400 hover:text-[#FF453A] rounded-md transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
        title={editingTask ? "Edit Task" : "New Task"}
        subtitle="Manage task scope, assignment, and completion schedule."
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Task Title *</label>
            <input
              required
              value={taskForm.title}
              onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
              className="w-full bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg px-3 py-2 text-xs text-[#f5f5f7] placeholder:text-zinc-500 focus:outline-none transition-colors"
              placeholder="e.g. Prepare monthly GST filing report"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Assign to Staff Member</label>
            <select
              value={taskForm.assigneeId}
              onChange={e => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
              className="w-full bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg px-3 py-2 text-xs text-[#f5f5f7] focus:outline-none transition-colors"
            >
              <option value="">Unassigned</option>
              {employees.map((emp: any) => (
                <option key={emp.id || emp.userId} value={emp.userId || emp.id}>
                  {emp.user ? `${emp.user.firstName} ${emp.user.lastName} (${emp.user.email})` : (emp.firstName ? `${emp.firstName} ${emp.lastName}` : emp.name || emp.id)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Priority</label>
              <select
                value={taskForm.priority}
                onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg px-3 py-2 text-xs text-[#f5f5f7] focus:outline-none transition-colors"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="NORMAL">Normal</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Stage</label>
              <select
                value={taskForm.status}
                onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}
                className="w-full bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg px-3 py-2 text-xs text-[#f5f5f7] focus:outline-none transition-colors"
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
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Due Date</label>
            <input
              type="date"
              value={taskForm.dueDate}
              onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              className="w-full bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg px-3 py-2 text-xs text-[#f5f5f7] focus:outline-none transition-colors [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Link to Client Project (Optional)</label>
            <select
              value={taskForm.projectId}
              onChange={e => setTaskForm({ ...taskForm, projectId: e.target.value })}
              className="w-full bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg px-3 py-2 text-xs text-[#f5f5f7] focus:outline-none transition-colors"
            >
              <option value="">No Project (Internal Task)</option>
              {projects.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.company?.name || 'Client'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Instructions / Notes</label>
            <textarea
              value={taskForm.description}
              onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
              rows={4}
              placeholder="Provide specific instructions or checklist steps..."
              className="w-full bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg px-3 py-2 text-xs text-[#f5f5f7] placeholder:text-zinc-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="pt-3 border-t border-white/[0.07] flex items-center justify-between gap-2">
            {editingTask ? (
              <button
                type="button"
                onClick={() => handleDeleteTask(editingTask.id, editingTask.title)}
                className="px-3.5 py-2 bg-[#FF453A]/10 hover:bg-[#FF453A]/20 text-[#FF453A] border border-[#FF453A]/20 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="px-3.5 py-2 bg-transparent hover:bg-white/[0.06] border border-white/[0.08] rounded-lg text-xs font-medium text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-medium rounded-lg text-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : (editingTask ? "Save Changes" : "Assign Task")}
              </button>
            </div>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}
