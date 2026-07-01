"use client"

import { useState, useEffect } from "react"
import { useApi } from "@/lib/useApi"
import { ClockWidget } from "@/components/hr/ClockWidget"
import { Calendar, CheckCircle, Clock, ListTodo, Target, FileText } from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency"

export default function ESSDashboard() {
  // Simple mock user switcher for testing
  const [activeEmployeeId, setActiveEmployeeId] = useState("cuid-emp-1")
  
  // 1. Fetch Leave Balances
  const { data: leavesData } = useApi<any>(`/hr/leaves/balances/${activeEmployeeId}`)
  const balances = leavesData?.balances || []
  
  // 2. Fetch Employee Info
  const { data: hrData } = useApi<any>(`/hr/employees/${activeEmployeeId}`)
  const employee = hrData?.employee

  // 3. Fetch Assigned Tasks
  const { data: tasksData, mutate: mutateTasks } = useApi<any>(`/projects/user/${activeEmployeeId}`)
  const assignedTasks = tasksData?.data || []

  // 4. Fetch Recent TimeLogs
  const { data: timeData } = useApi<any>("/hr/time")
  const allTimeLogs = timeData?.timeLogs || []
  const myTimeLogs = allTimeLogs.filter((log: any) => log.userId === activeEmployeeId).slice(0, 5)

  // 5. Fetch Performance Goals
  const { data: goalsData, mutate: mutateGoals } = useApi<any>(`/hr/performance/goals/${activeEmployeeId}`)
  const goals = goalsData?.data || []

  // 6. Fetch Payslips (We'll use a hypothetical user payslips endpoint, but we can mock it here for the ESS view since we haven't built a specific GET /payslips/:userId yet. Wait, we can fetch all and filter for now).
  // Actually, we don't have a GET all payslips endpoint, we only have GET /hr/payroll/run/:year/:month. Let's just mock payslips visually for the ESS for now to complete the UI, or we can fetch them. Let's mock 2 recent payslips.
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
      
      {/* Header & User Switcher */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Workspace (ESS)</h1>
          <p className="text-sm text-white/50 mt-2">Welcome back, {employee?.user?.firstName || "Employee"}</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-xl border border-white/10">
          <span className="text-[10px] font-mono tracking-widest uppercase text-white/40 font-bold ml-2">Testing ID:</span>
          <select 
            value={activeEmployeeId}
            onChange={(e) => setActiveEmployeeId(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-mono focus:outline-none"
          >
            <option value="cuid-emp-1">Employee 1</option>
            <option value="cuid-emp-2">Employee 2</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Clock In & Leaves */}
        <div className="col-span-1 space-y-8">
          
          <ClockWidget employeeId={activeEmployeeId} />

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

        </div>

      </div>
    </div>
  )
}
