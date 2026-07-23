"use client"

import { useState, useEffect } from "react"
import { Target, TrendingUp, Award, Star, MessageSquare, CheckCircle2, Circle, Plus, Loader2, User } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"

export default function PerformanceManagement() {
  const [activeTab, setActiveTab] = useState("goals")
  const [selectedEmpId, setSelectedEmpId] = useState("")
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [goalForm, setGoalForm] = useState({ title: "", description: "", targetDate: "" })

  const { data: empData } = useApi<any>("/hr/employees")
  const employees = empData?.employees || []

  // Auto-select first employee
  useEffect(() => {
    if (employees.length > 0 && !selectedEmpId) {
      setSelectedEmpId(employees[0].id)
    }
  }, [employees, selectedEmpId])

  const { data: goalsData, mutate: mutateGoals, isLoading: goalsLoading } = useApi<any>(
    selectedEmpId ? `/hr/performance/goals/${selectedEmpId}` : null
  )
  const goals = goalsData?.data || []

  const selectedEmployee = employees.find((e: any) => e.id === selectedEmpId)
  const employeeName = selectedEmployee ? `${selectedEmployee.user?.firstName} ${selectedEmployee.user?.lastName}` : "—"

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmpId) return
    setIsSubmitting(true)
    try {
      await fetchApi("/hr/performance/goals", {
        method: "POST",
        body: JSON.stringify({
          employeeId: selectedEmpId,
          title: goalForm.title,
          description: goalForm.description || undefined,
          targetDate: goalForm.targetDate || undefined
        })
      })
      toast.success("Goal added successfully!")
      setIsAddGoalOpen(false)
      setGoalForm({ title: "", description: "", targetDate: "" })
      mutateGoals()
    } catch (err: any) {
      toast.error(err.message || "Failed to add goal")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateGoalStatus = async (goalId: string, status: string) => {
    try {
      await fetchApi(`/hr/performance/goals/${goalId}`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      })
      mutateGoals()
    } catch (err: any) {
      toast.error("Failed to update goal")
    }
  }

  const STATUS_STYLES: Record<string, string> = {
    NOT_STARTED: "text-white/40 border-white/20",
    IN_PROGRESS: "text-blue-400 border-blue-500/30",
    ACHIEVED: "text-emerald-400 border-emerald-500/30",
    MISSED: "text-red-400 border-red-500/30"
  }

  const goalCounts = {
    total: goals.length,
    achieved: goals.filter((g: any) => g.status === "ACHIEVED").length,
    inProgress: goals.filter((g: any) => g.status === "IN_PROGRESS").length
  }

  return (
    <div className="flex flex-col h-full bg-[#050508] text-white overflow-y-auto custom-scrollbar font-sans">
      
      {/* Header */}
      <div className="flex-none px-8 py-8 border-b border-white/10 bg-[#0a0a0f]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Performance & Reviews</h1>
            <p className="text-sm text-slate-400 mt-2">Manage goals, skill progression, and employee feedback</p>
          </div>
          <div className="flex gap-3 items-center">
            {/* Employee Selector */}
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
            >
              {employees.length === 0 && <option value="">Loading...</option>}
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>{emp.user?.firstName} {emp.user?.lastName}</option>
              ))}
            </select>
            {activeTab === "goals" && (
              <button
                onClick={() => setIsAddGoalOpen(true)}
                className="px-5 py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-500 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Goal
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8">
          {["goals", "overview"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors relative ${activeTab === tab ? 'text-violet-400' : 'text-slate-500 hover:text-white'}`}
            >
              {tab === "goals" ? "Goals & OKRs" : "Overview"}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 shadow-[0_0_10px_rgba(124,58,237,0.5)]"></div>}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        
        {activeTab === "goals" && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">Total Goals</p>
                <p className="text-3xl font-bold">{goalCounts.total}</p>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/60 mb-2">Achieved</p>
                <p className="text-3xl font-bold text-emerald-400">{goalCounts.achieved}</p>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-blue-400/60 mb-2">In Progress</p>
                <p className="text-3xl font-bold text-blue-400">{goalCounts.inProgress}</p>
              </div>
            </div>

            {/* Goals List */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/10 flex items-center gap-3">
                <User className="w-4 h-4 text-violet-400" />
                <h2 className="font-bold text-sm uppercase tracking-widest text-white/60">{employeeName}'s Goals</h2>
              </div>

              {goalsLoading ? (
                <div className="p-12 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-white/30" />
                </div>
              ) : goals.length === 0 ? (
                <div className="p-12 text-center">
                  <Target className="w-8 h-8 mx-auto mb-3 text-white/20" />
                  <p className="text-white/40 text-sm">No goals set yet. Add the first one!</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {goals.map((goal: any) => (
                    <div key={goal.id} className="p-5 flex items-start justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex-1">
                        <p className="font-bold text-white">{goal.title}</p>
                        {goal.description && <p className="text-sm text-white/50 mt-1">{goal.description}</p>}
                        {goal.targetDate && (
                          <p className="text-[10px] font-mono text-white/30 mt-2">
                            Target: {new Date(goal.targetDate).toLocaleDateString('en-IN')}
                          </p>
                        )}
                      </div>
                      <select
                        value={goal.status}
                        onChange={(e) => handleUpdateGoalStatus(goal.id, e.target.value)}
                        className={`bg-black/40 border rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none shrink-0 ${STATUS_STYLES[goal.status] || "text-white/50 border-white/20"}`}
                      >
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="ACHIEVED">Achieved ✓</option>
                        <option value="MISSED">Missed</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "overview" && (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 bg-white/5 border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl font-black text-violet-400">
                    {selectedEmployee?.user?.firstName?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{employeeName}</h2>
                    <p className="text-violet-400 text-sm font-medium">{selectedEmployee?.jobTitle || "—"}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">Goals Progress</p>
                    <p className="text-2xl font-black">{goalCounts.achieved}<span className="text-sm font-normal text-white/40">/{goalCounts.total}</span></p>
                    <div className="mt-2 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500" style={{ width: goalCounts.total > 0 ? `${Math.round((goalCounts.achieved / goalCounts.total) * 100)}%` : '0%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center">
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-4">Goal Status Distribution</p>
                <div className="grid grid-cols-2 gap-4 w-full">
                  {[
                    { label: "Not Started", count: goals.filter((g: any) => g.status === "NOT_STARTED").length, color: "bg-white/20" },
                    { label: "In Progress", count: goals.filter((g: any) => g.status === "IN_PROGRESS").length, color: "bg-blue-500" },
                    { label: "Achieved", count: goals.filter((g: any) => g.status === "ACHIEVED").length, color: "bg-emerald-500" },
                    { label: "Missed", count: goals.filter((g: any) => g.status === "MISSED").length, color: "bg-red-500" },
                  ].map(item => (
                    <div key={item.label} className="bg-black/40 rounded-2xl p-4 border border-white/5">
                      <div className={`w-3 h-3 rounded-full ${item.color} mb-3`} />
                      <p className="text-2xl font-bold">{item.count}</p>
                      <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {isAddGoalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-bold text-lg">Add Goal for {employeeName}</h2>
              <button onClick={() => setIsAddGoalOpen(false)} className="text-white/40 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddGoal} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block mb-2">Goal Title *</label>
                <input required value={goalForm.title} onChange={e => setGoalForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50"
                  placeholder="e.g. Complete Q3 Sales Targets" />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block mb-2">Description</label>
                <textarea value={goalForm.description} onChange={e => setGoalForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 min-h-[80px] resize-none"
                  placeholder="Optional details..." />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block mb-2">Target Date</label>
                <input type="date" value={goalForm.targetDate} onChange={e => setGoalForm(f => ({ ...f, targetDate: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50" />
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full bg-violet-600 text-white font-bold py-3 rounded-xl hover:bg-violet-500 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Goal"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
