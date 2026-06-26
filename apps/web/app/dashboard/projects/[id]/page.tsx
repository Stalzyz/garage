"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { LayoutList, KanbanSquare, CheckCircle, FileText, Settings, Plus, ChevronLeft, Loader2, GripVertical } from "lucide-react"
import Link from "next/link"
import { useApi, fetchApi } from "@/lib/useApi"

const TABS = [
  { id: "tasks", label: "Tasks", icon: KanbanSquare },
  { id: "brief", label: "Brief", icon: FileText },
  { id: "files", label: "Files", icon: LayoutList },
  { id: "settings", label: "Settings", icon: Settings },
]

const STAGES = [
  { id: "TODO", label: "To Do", color: "bg-slate-500" },
  { id: "IN_PROGRESS", label: "In Progress", color: "bg-blue-500" },
  { id: "IN_REVIEW", label: "Review", color: "bg-amber-500" },
  { id: "DONE", label: "Done", color: "bg-emerald-500" },
]

function TaskCard({ task, onStatusChange }: { task: any, onStatusChange: (taskId: string, newStatus: string) => void }) {
  const prioColor = task.priority === "CRITICAL" ? "text-red-400 bg-red-400/10 border-red-400/20" :
                    task.priority === "HIGH" ? "text-orange-400 bg-orange-400/10 border-orange-400/20" :
                    "text-slate-400 bg-slate-400/10 border-slate-400/20"

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("taskId", task.id);
  }

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
        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[9px] border border-primary/30" title="Assignee">
          {task.assigneeId ? task.assigneeId.slice(0, 1).toUpperCase() : '?'}
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

  const [tasks, setTasks] = useState<any[]>([])

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

  const handleAddTask = async (status: string) => {
    const title = prompt("Task title:");
    if (!title) return;

    try {
      const newTask = await fetchApi<any>("/projects/tasks", {
        method: "POST",
        body: JSON.stringify({
          projectId,
          title,
          status,
          priority: "NORMAL"
        })
      });
      setTasks(prev => [newTask, ...prev]);
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
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        {activeTab === "tasks" && (
          <div className="flex gap-4 h-full p-6 min-w-max">
            {STAGES.map(stage => {
              const stageTasks = tasks.filter(t => t.status === stage.id)
              return (
                <div 
                  key={stage.id} 
                  className="flex flex-col w-72 bg-muted/20 rounded-2xl border border-border/40"
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
                  <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                    {stageTasks.map(task => (
                      <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
                    ))}
                    {stageTasks.length === 0 && (
                      <div className="flex items-center justify-center h-24 text-xs text-muted-foreground/50 border-2 border-dashed border-border/30 rounded-xl">
                        Drop here
                      </div>
                    )}
                  </div>

                  {/* Add button */}
                  <div className="flex-none p-2.5">
                    <button onClick={() => handleAddTask(stage.id)} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                      Add task
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab !== "tasks" && (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} view placeholder
          </div>
        )}
      </div>
    </div>
  )
}
