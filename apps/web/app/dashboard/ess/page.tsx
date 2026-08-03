"use client"

import { useState, useEffect } from "react"
import { useApi } from "@/lib/useApi"
import { ClockWidget } from "@/components/hr/ClockWidget"
import { Calendar, CheckCircle, Clock, ListTodo, Target, FileText, Lock, Shuffle, Monitor, DollarSign, Send, HelpCircle, AlertCircle } from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency"
import { useSession } from "next-auth/react"

export default function ESSDashboard() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  // 1. Fetch Employee Info by userId
  const { data: hrData } = useApi<any>(userId ? `/hr/employees/by-user/${userId}` : null)
  const employee = hrData?.employee
  const activeEmployeeId = employee?.id

  // Fetch Requests submitted by employee
  const { data: requestsData, mutate: mutateRequests } = useApi<any>(activeEmployeeId ? `/hr/requests/employee/${activeEmployeeId}` : null)
  const myRequests = requestsData?.data || []

  // Fetch Available Shift Profiles
  const { data: shiftsData } = useApi<any>("/hr/shifts")
  const shiftsList = shiftsData?.data || []

  // Request Modal States
  const [isRequestOpen, setIsRequestOpen] = useState(false)
  const [requestForm, setRequestForm] = useState({
    type: "SHIFT_SWAP" as "SHIFT_SWAP" | "OVERTIME_CLAIM" | "ASSET_ALLOCATION" | "CUSTOM_CLAIM",
    title: "",
    description: "",
    shiftId: "",
    shiftName: "",
    startDate: "",
    hours: 1,
    taskRef: "",
    assetType: "",
    priority: "MEDIUM",
    category: "",
    amount: ""
  })
  const [isSubmittingReq, setIsSubmittingReq] = useState(false)

  // 2. Fetch Leave Balances
  const { data: leavesData } = useApi<any>(activeEmployeeId ? `/hr/leaves/balances/${activeEmployeeId}` : null)
  const balances = leavesData?.balances || []

  // 3. Fetch Assigned Tasks
  const { data: tasksData, mutate: mutateTasks } = useApi<any>(activeEmployeeId ? `/projects/user/${activeEmployeeId}` : null)
  const assignedTasks = tasksData?.data || []

  // 4. Fetch Recent TimeLogs
  const { data: timeData } = useApi<any>("/hr/time")
  const allTimeLogs = timeData?.timeLogs || []
  const myTimeLogs = allTimeLogs.filter((log: any) => log.userId === activeEmployeeId).slice(0, 5)

  // 5. Fetch Performance Goals
  const { data: goalsData, mutate: mutateGoals } = useApi<any>(activeEmployeeId ? `/hr/performance/goals/${activeEmployeeId}` : null)
  const goals = goalsData?.data || []

  // 6. Fetch Payslips
  const myPayslips = [
    { id: '1', month: 6, year: 2026, netSalary: 45000, paidAt: new Date(2026, 5, 30) },
    { id: '2', month: 5, year: 2026, netSalary: 45000, paidAt: new Date(2026, 4, 31) }

  ]

  const { symbol } = useCurrency()

  const handleCompleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/v1/projects/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DONE" })
      })
      mutateTasks()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white p-8 overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Workspace (ESS)</h1>
          <p className="text-sm text-white/50 mt-2">Welcome back, {employee?.user?.firstName || session?.user?.name || "Employee"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Clock In & Leaves */}
        <div className="col-span-1 space-y-8">
          
          {activeEmployeeId ? (
            <ClockWidget employeeId={activeEmployeeId} />
          ) : (
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 text-center text-white/50 text-sm">
              No employee profile found for your account. Please contact HR.
            </div>
          )}

          {/* Leave Balances */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" /> Leave Balances
            </h3>
            <div className="space-y-4">
              {balances.length > 0 ? balances.map((b: any) => (
                <div key={b.id} className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-xs font-mono font-bold tracking-widest uppercase text-white/70">{b.type}</span>
                  <span className="text-sm font-bold text-blue-400">{b.balance} Days</span>
                </div>
              )) : (
                <div className="p-4 text-center text-white/40 text-xs border border-dashed border-white/10 rounded-xl">
                  No leave balances found for current year.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Tasks & Timesheets */}
        <div className="col-span-1 lg:col-span-2 space-y-8">
          
          {/* My Tasks */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-violet-400" /> My Active Tasks
              </h3>
            </div>
            
            <div className="space-y-3">
              {assignedTasks.length > 0 ? assignedTasks.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 hover:border-violet-500/30 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${task.priority === 'CRITICAL' ? 'bg-red-500' : task.priority === 'HIGH' ? 'bg-orange-500' : 'bg-slate-400'}`} />
                      <h4 className="font-bold text-sm text-white">{task.title}</h4>
                    </div>
                    <p className="text-[10px] font-mono tracking-widest uppercase text-white/40">{task.project?.name || "No Project"} · Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <button 
                    onClick={() => handleCompleteTask(task.id)}
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-emerald-400 hover:border-emerald-400/30 hover:bg-emerald-400/10 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              )) : (
                <div className="p-8 text-center text-white/40 border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center">
                  <CheckCircle className="w-8 h-8 mb-3 opacity-50" />
                  <p className="text-sm">You have no pending tasks assigned.</p>
                  <p className="text-[10px] font-mono tracking-widest uppercase mt-2 text-white/30">Enjoy your day!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Time Logs */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" /> Recent Timesheets
            </h3>
            <div className="space-y-3">
              {myTimeLogs.length > 0 ? myTimeLogs.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                  <div>
                    <h4 className="font-bold text-sm text-white">{log.project?.name || "General"}</h4>
                    <p className="text-xs text-white/50">{log.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-mono font-bold text-amber-400">{log.hours}h</p>
                    <p className="text-[9px] font-mono tracking-widest uppercase text-white/30">{new Date(log.logDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-white/40 border-2 border-dashed border-white/5 rounded-xl">
                  <p className="text-sm mb-2">No time logged recently.</p>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg text-xs font-bold font-mono tracking-widest uppercase text-white">
                    Log Time
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* My Goals */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-pink-400" /> My Performance Goals
            </h3>
            <div className="space-y-4">
              {goals.length > 0 ? goals.map((goal: any) => (
                <div key={goal.id} className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm text-white">{goal.title}</h4>
                    <span className="text-[10px] font-mono uppercase bg-white/10 px-2 py-0.5 rounded text-white/70">{goal.status}</span>
                  </div>
                  <p className="text-xs text-white/50 mb-3">{goal.description}</p>
                  
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" min="0" max="100" value={goal.progress}
                      onChange={async (e) => {
                        const newProg = parseInt(e.target.value);
                        await fetch(`/api/v1/hr/performance/goals/${goal.id}`, {
                          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ progress: newProg, status: newProg === 100 ? 'ACHIEVED' : 'IN_PROGRESS' })
                        });
                        mutateGoals();
                      }}
                      className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                    <span className="text-xs font-mono font-bold text-pink-400 w-8">{goal.progress}%</span>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-white/40 border-2 border-dashed border-white/5 rounded-xl">
                  <Target className="w-6 h-6 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No active goals assigned for this cycle.</p>
                </div>
              )}
            </div>
          </div>

          {/* My Payslips */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" /> Recent Payslips
            </h3>
            <div className="space-y-3">
              {myPayslips.map((slip) => (
                <div key={slip.id} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 group hover:bg-white/5 transition-colors cursor-pointer">
                  <div>
                    <h4 className="font-bold text-sm text-white">{new Date(slip.year, slip.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                    <p className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 mt-1">Net: {symbol}{slip.netSalary.toLocaleString()}</p>
                  </div>
                  <button className="px-3 py-1.5 bg-white/10 group-hover:bg-emerald-500 hover:text-white transition-colors rounded-lg text-xs font-bold font-mono tracking-widest uppercase text-white/50">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Requests & Claims Widget */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-sky-400" /> Requests & Claims
              </h3>
              <button 
                onClick={() => setIsRequestOpen(true)}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 transition-colors rounded-lg text-xs font-bold font-mono tracking-widest uppercase text-white"
              >
                Submit Request
              </button>
            </div>
            
            <div className="space-y-3">
              {myRequests.length > 0 ? myRequests.slice(0, 5).map((req: any) => (
                <div key={req.id} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                      {req.type === "SHIFT_SWAP" && <Shuffle className="w-3.5 h-3.5 text-blue-400" />}
                      {req.type === "OVERTIME_CLAIM" && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                      {req.type === "ASSET_ALLOCATION" && <Monitor className="w-3.5 h-3.5 text-purple-400" />}
                      {req.type === "CUSTOM_CLAIM" && <DollarSign className="w-3.5 h-3.5 text-emerald-400" />}
                      {req.title}
                    </h4>
                    <p className="text-[10px] font-mono tracking-widest uppercase text-white/40 mt-1">
                      {req.type.replace("_", " ")} · {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold border ${
                      req.status === "PENDING" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      req.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-white/40 border border-dashed border-white/10 rounded-xl">
                  <p className="text-xs">No requests submitted yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Security / Password Reset */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" /> Security
            </h3>
            <ChangePasswordForm />
          </div>

        </div>

      </div>

      {/* New Request Modal */}
      {isRequestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-white">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Send className="w-5 h-5 text-sky-400" /> Submit Operation Request
            </h2>
            <p className="text-xs text-white/50 mb-6">
              Create a custom operation request. This will route automatically to HR for verification and approval.
            </p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmittingReq(true);
              try {
                // Construct request payload based on type
                let finalPayload: any = {};
                if (requestForm.type === "SHIFT_SWAP") {
                  finalPayload = {
                    shiftId: requestForm.shiftId,
                    shiftName: requestForm.shiftName || shiftsList.find((s: any) => s.id === requestForm.shiftId)?.name,
                    startDate: requestForm.startDate
                  };
                } else if (requestForm.type === "OVERTIME_CLAIM") {
                  finalPayload = {
                    date: requestForm.startDate,
                    hours: parseFloat(requestForm.hours as any),
                    taskRef: requestForm.taskRef
                  };
                } else if (requestForm.type === "ASSET_ALLOCATION") {
                  finalPayload = {
                    assetType: requestForm.assetType,
                    priority: requestForm.priority
                  };
                } else if (requestForm.type === "CUSTOM_CLAIM") {
                  finalPayload = {
                    category: requestForm.category,
                    amount: parseFloat(requestForm.amount),
                    hasInvoice: true
                  };
                }

                const res = await fetch("/api/v1/hr/requests", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    type: requestForm.type,
                    title: requestForm.title,
                    description: requestForm.description,
                    payload: finalPayload,
                    employeeId: activeEmployeeId
                  })
                });

                if (!res.ok) throw new Error("Failed to submit request");
                
                mutateRequests();
                setIsRequestOpen(false);
                setRequestForm({
                  type: "SHIFT_SWAP",
                  title: "",
                  description: "",
                  shiftId: "",
                  shiftName: "",
                  startDate: "",
                  hours: 1,
                  taskRef: "",
                  assetType: "",
                  priority: "MEDIUM",
                  category: "",
                  amount: ""
                });
              } catch (err) {
                console.error(err);
                alert("Submission failed: " + err);
              } finally {
                setIsSubmittingReq(false);
              }
            }} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Request Type *</label>
                <select 
                  value={requestForm.type}
                  onChange={e => setRequestForm({ ...requestForm, type: e.target.value as any })}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                >
                  <option value="SHIFT_SWAP">🔄 Shift Swap</option>
                  <option value="OVERTIME_CLAIM">⚡ Overtime Claim</option>
                  <option value="ASSET_ALLOCATION">💻 Asset Allocation</option>
                  <option value="CUSTOM_CLAIM">💵 Custom Claim</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Title / Short Summary *</label>
                <input 
                  required
                  placeholder="e.g. Swapping to Night Shift for Sunday"
                  value={requestForm.title}
                  onChange={e => setRequestForm({ ...requestForm, title: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Description & Justification *</label>
                <textarea 
                  required
                  placeholder="Provide context or explanation for approval..."
                  value={requestForm.description}
                  onChange={e => setRequestForm({ ...requestForm, description: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500/50 h-20 resize-none"
                />
              </div>

              {/* Conditional Inputs */}
              {requestForm.type === "SHIFT_SWAP" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Target Shift *</label>
                    <select
                      required
                      value={requestForm.shiftId}
                      onChange={e => {
                        const shift = shiftsList.find((s: any) => s.id === e.target.value);
                        setRequestForm({ ...requestForm, shiftId: e.target.value, shiftName: shift?.name || "" });
                      }}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                    >
                      <option value="">Select Shift</option>
                      {shiftsList.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Effective Date *</label>
                    <input 
                      type="date"
                      required
                      value={requestForm.startDate}
                      onChange={e => setRequestForm({ ...requestForm, startDate: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500/50"
                    />
                  </div>
                </div>
              )}

              {requestForm.type === "OVERTIME_CLAIM" && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Work Date *</label>
                    <input 
                      type="date"
                      required
                      value={requestForm.startDate}
                      onChange={e => setRequestForm({ ...requestForm, startDate: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Hours *</label>
                    <input 
                      type="number"
                      step="0.5"
                      min="0.5"
                      required
                      value={requestForm.hours}
                      onChange={e => setRequestForm({ ...requestForm, hours: parseFloat(e.target.value) })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500/50"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Task Reference / Description</label>
                    <input 
                      placeholder="e.g. Bugfix task #451"
                      value={requestForm.taskRef}
                      onChange={e => setRequestForm({ ...requestForm, taskRef: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500/50"
                    />
                  </div>
                </div>
              )}

              {requestForm.type === "ASSET_ALLOCATION" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Device/Asset Type *</label>
                    <input 
                      required
                      placeholder="e.g. MacBook Pro, 4K Monitor"
                      value={requestForm.assetType}
                      onChange={e => setRequestForm({ ...requestForm, assetType: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Priority *</label>
                    <select
                      value={requestForm.priority}
                      onChange={e => setRequestForm({ ...requestForm, priority: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>
              )}

              {requestForm.type === "CUSTOM_CLAIM" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Category *</label>
                    <input 
                      required
                      placeholder="e.g. Travel, Software, License"
                      value={requestForm.category}
                      onChange={e => setRequestForm({ ...requestForm, category: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Claim Amount *</label>
                    <input 
                      type="number"
                      step="0.01"
                      required
                      placeholder="INR Amount"
                      value={requestForm.amount}
                      onChange={e => setRequestForm({ ...requestForm, amount: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500/50"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsRequestOpen(false)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-white/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReq}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors disabled:opacity-50"
                >
                  {isSubmittingReq ? "Submitting..." : "Submit Request"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/v1/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to change password")
      
      alert("Password changed successfully!")
      setCurrentPassword("")
      setNewPassword("")
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-bold text-white/50 block mb-1">Current Password</label>
        <input 
          type="password" required 
          value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50" 
        />
      </div>
      <div>
        <label className="text-xs font-bold text-white/50 block mb-1">New Password (min 8 chars)</label>
        <input 
          type="password" required minLength={8}
          value={newPassword} onChange={e => setNewPassword(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50" 
        />
      </div>
      <button 
        type="submit" disabled={loading}
        className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  )
}
