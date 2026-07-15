"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { LayoutList, KanbanSquare, CheckCircle, FileText, Settings, Plus, ChevronLeft, Loader2, GripVertical, CreditCard } from "lucide-react"
import Link from "next/link"
import { useApi, fetchApi } from "@/lib/useApi"
import { FinanceTab } from "./FinanceTab"
import { SlideOver } from "@/components/SlideOver"

const TABS = [
  { id: "tasks", label: "Tasks", icon: KanbanSquare },
  { id: "brief", label: "Brief", icon: FileText },
  { id: "files", label: "Files", icon: LayoutList },
  { id: "finance", label: "Finance", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
]

const STAGES = [
  { id: "TODO", label: "To Do", color: "bg-slate-500" },
  { id: "IN_PROGRESS", label: "In Progress", color: "bg-blue-500" },
  { id: "IN_REVIEW", label: "Review", color: "bg-amber-500" },
  { id: "DONE", label: "Done", color: "bg-emerald-500" },
]

function TaskCard({ task, employees, onStatusChange }: { task: any, employees: any[], onStatusChange: (taskId: string, newStatus: string) => void }) {
  const prioColor = task.priority === "CRITICAL" ? "text-red-400 bg-red-400/10 border-red-400/20" :
                    task.priority === "HIGH" ? "text-orange-400 bg-orange-400/10 border-orange-400/20" :
                    "text-slate-400 bg-slate-400/10 border-slate-400/20"

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("taskId", task.id);
  }

  const assignee = employees.find(e => e.userId === task.assigneeId || e.id === task.assigneeId)
  const assigneeInitials = assignee ? (assignee.user?.firstName?.charAt(0) || assignee.firstName?.charAt(0) || "?").toUpperCase() : "?"
  const assigneeName = assignee ? `${assignee.user?.firstName || assignee.firstName}` : "Unassigned"

  return (
    <div 
      draggable 
      onDragStart={handleDragStart}
      className="bg-card border border-border/60 rounded-xl p-3.5 cursor-grab active:cursor-grabbing hover:border-border hover:shadow-lg hover:shadow-black/20 transition-all group"
    >
      <div className="flex items-start gap-2 mb-2">
        <CheckCircle 
          onClick={() => onStatusChange(task.id, task.status === 'DONE' ? 'TODO' : 'DONE')}
          className={`w-4 h-4 mt-0.5 flex-none cursor-pointer ${task.status === "DONE" ? "text-emerald-500" : "text-muted-foreground/50 hover:text-primary transition-colors"}`} 
        />
        <p className={`text-sm font-medium leading-tight ${task.status === "DONE" ? "text-muted-foreground line-through" : "text-foreground"}`}>
          {task.title}
        </p>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-1.5">
          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${prioColor}`}>{task.priority}</span>
        </div>
        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[9px] border border-primary/30" title={assigneeName}>
          {task.assigneeId ? assigneeInitials : <Plus className="w-3 h-3" />}
        </div>
      </div>
    </div>
  )
}

export default function ProjectDetailsPage() {
  const params = useParams()
  const projectId = params.id as string
  const [activeTab, setActiveTab] = useState("tasks")
  
  const { data: project, isLoading: isProjectLoading } = useApi<any>(`/projects/${projectId}`)
  const { data: tasksData, isLoading: isTasksLoading, mutate } = useApi<any>(`/projects/${projectId}/tasks`)
  const { data: hrData } = useApi<any>("/hr/employees")
  
  const employees = hrData?.employees || []

  const [tasks, setTasks] = useState<any[]>([])
  
  // Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "NORMAL", assigneeId: "", status: "TODO" })

  useEffect(() => {
    if (tasksData?.data) {
      setTasks(tasksData.data)
    }
  }, [tasksData])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await fetchApi(`/projects/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      });
      mutate();
    } catch (err) {
      console.error(err);
      mutate(); // Revert on failure
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await fetchApi(`/projects/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      });
      mutate();
    } catch (err) {
      console.error(err);
      mutate();
    }
  }

  const handleOpenTaskModal = (status: string) => {
    setTaskForm({ title: "", description: "", priority: "NORMAL", assigneeId: "", status })
    setIsTaskModalOpen(true)
  }

  const submitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title) return;
    try {
      const newTask = await fetchApi<any>("/projects/tasks", {
        method: "POST",
        body: JSON.stringify({
          projectId,
          ...taskForm
        })
      });
      setTasks(prev => [newTask, ...prev]);
      setIsTaskModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create task");
    }
  }

  if (isProjectLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading Project...</p>
      </div>
    )
  }

  if (!project) return null;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-background">
      {/* Header */}
      <div className="flex-none px-6 pt-5 pb-0 border-b border-border/50">
        <Link href="/dashboard/projects" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Projects
        </Link>
        
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border text-indigo-400 border-indigo-400/20 bg-indigo-400/10">{project.status}</span>
            </div>
            <p className="text-sm text-muted-foreground">Type: {project.type} · Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        {activeTab === "tasks" && (
          <div className="flex gap-4 h-full p-6 min-w-max">
            {STAGES.map(stage => {
              const stageTasks = tasks.filter(t => t.status === stage.id)
              return (
                <div 
                  key={stage.id} 
                  className="flex flex-col w-72 bg-muted/20 rounded-2xl border border-border/40 max-h-full"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  {/* Column header */}
                  <div className="flex-none p-3.5 border-b border-border/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                      <span className="text-sm font-semibold text-foreground">{stage.label}</span>
                    </div>
                    <span className="text-xs font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{stageTasks.length}</span>
                  </div>

                  {/* Tasks */}
                  <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
                    {stageTasks.map(task => (
                      <TaskCard key={task.id} task={task} employees={employees} onStatusChange={handleStatusChange} />
                    ))}
                    {stageTasks.length === 0 && (
                      <div className="flex items-center justify-center h-24 text-xs text-muted-foreground/50 border-2 border-dashed border-border/30 rounded-xl">
                        Drop here
                      </div>
                    )}
                  </div>

                  {/* Add button */}
                  <div className="flex-none p-2.5">
                    <button onClick={() => handleOpenTaskModal(stage.id)} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                      Add task
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === "brief" && (
          <div className="p-6 max-w-4xl mx-auto h-full">
            <div className="bg-card border border-border/60 rounded-2xl p-8 max-w-none">
              <h2 className="text-xl font-bold text-foreground mb-6 border-b border-border pb-4">Project Brief</h2>
              {project.description ? (
                <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {project.description}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm border-2 border-dashed border-border/30 rounded-xl">
                  No brief provided for this project. Update the project description to show it here.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "files" && (
          <div className="p-6 max-w-6xl mx-auto h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-foreground">Project Deliverables & Files</h2>
              <button className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> Upload File
              </button>
            </div>
            {project.files && project.files.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {project.files.map((file: any) => (
                  <div key={file.id} className="bg-card border border-border/60 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors cursor-pointer group">
                    <FileText className="w-10 h-10 text-muted-foreground group-hover:text-primary mb-3 transition-colors" />
                    <p className="text-xs font-bold text-foreground truncate w-full">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase">{file.type}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border border-border/60 rounded-2xl border-dashed">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <LayoutList className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-foreground font-bold mb-1">No files yet</p>
                <p className="text-muted-foreground text-xs">Upload design files, contracts, or final deliverables here.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "finance" && (
          <FinanceTab projectId={project.id} budget={project.budget || 0} />
        )}

        {activeTab === "settings" && (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Settings view placeholder
          </div>
        )}
      </div>

      {/* Task Creation SlideOver */}
      <SlideOver title="Add New Task" open={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)}>
        <form onSubmit={submitTask} className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Title</label>
            <input 
              required 
              value={taskForm.title} 
              onChange={e => setTaskForm({...taskForm, title: e.target.value})} 
              className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-3 text-foreground focus:border-primary outline-none" 
              placeholder="e.g. Design Homepage Wireframe"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Description</label>
            <textarea 
              value={taskForm.description} 
              onChange={e => setTaskForm({...taskForm, description: e.target.value})} 
              className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-3 text-foreground focus:border-primary outline-none h-24 resize-none" 
              placeholder="Task details..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Priority</label>
              <select 
                value={taskForm.priority} 
                onChange={e => setTaskForm({...taskForm, priority: e.target.value})} 
                className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-3 text-foreground focus:border-primary outline-none"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Status</label>
              <select 
                value={taskForm.status} 
                onChange={e => setTaskForm({...taskForm, status: e.target.value})} 
                className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-3 text-foreground focus:border-primary outline-none"
              >
                {STAGES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Assign To</label>
            <select 
              value={taskForm.assigneeId} 
              onChange={e => setTaskForm({...taskForm, assigneeId: e.target.value})} 
              className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-3 text-foreground focus:border-primary outline-none"
            >
              <option value="">Unassigned</option>
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.userId || emp.id}>
                  {emp.user?.firstName || emp.firstName} {emp.user?.lastName || emp.lastName} ({emp.jobTitle})
                </option>
              ))}
            </select>
          </div>
          
          <button type="submit" className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-bold font-mono tracking-widest uppercase hover:bg-primary/90 transition-colors mt-8">
            Create Task
          </button>
        </form>
      </SlideOver>
    </div>
  )
}
