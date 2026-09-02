"use client"

import { useState, useEffect } from "react"
import { Search, Users, CheckCircle2, XCircle, Clock, Maximize2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useApi, fetchApi } from "@/lib/useApi"

const FALLBACK_BATCHES = ["UI/UX Cohort 4", "Brand Design Int.", "Web Dev Basics"]

const FALLBACK_LOGS = [
  { id: "S1001", studentCode: "S1001", name: "Rohan Patel", batch: "UI/UX Cohort 4", status: "PRESENT", checkIn: "10:00 AM", attendanceRate: "92%", attendanceRateNum: 92 },
  { id: "S1002", studentCode: "S1002", name: "Anjali Menon", batch: "UI/UX Cohort 4", status: "PRESENT", checkIn: "10:05 AM", attendanceRate: "88%", attendanceRateNum: 88 },
  { id: "S1003", studentCode: "S1003", name: "Vikram Singh", batch: "UI/UX Cohort 4", status: "ABSENT", checkIn: "--", attendanceRate: "71%", attendanceRateNum: 71 },
  { id: "S1004", studentCode: "S1004", name: "Sara Khan", batch: "UI/UX Cohort 4", status: "LATE", checkIn: "10:45 AM", attendanceRate: "85%", attendanceRateNum: 85 },
  { id: "S1005", studentCode: "S1005", name: "David Chen", batch: "UI/UX Cohort 4", status: "PRESENT", checkIn: "09:55 AM", attendanceRate: "98%", attendanceRateNum: 98 },
]

export default function AcademyAttendanceDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [batchFilter, setBatchFilter] = useState("All Batches")
  const [search, setSearch] = useState("")
  const [isRollCallMode, setIsRollCallMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Live API Hooks
  const { data: batchesRes } = useApi<{ data?: any[]; batches?: any[] }>("/academy/batches")
  const { data: attendanceRes, mutate: mutateAttendance } = useApi<{ logs: any[] }>(`/academy/attendance?date=${selectedDate}`)

  const batches = batchesRes?.batches || batchesRes?.data || []
  const batchNames = batches.length > 0 ? batches.map(b => b.name) : FALLBACK_BATCHES

  // Local editable roll call state
  const [liveLogs, setLiveLogs] = useState<any[]>([])

  useEffect(() => {
    const rawLogs = attendanceRes?.logs && attendanceRes.logs.length > 0 ? attendanceRes.logs : FALLBACK_LOGS
    setLiveLogs(rawLogs)
  }, [attendanceRes])

  const filteredLogs = liveLogs.filter(log => {
    if (batchFilter !== "All Batches" && log.batch !== batchFilter) return false
    if (search && !log.name.toLowerCase().includes(search.toLowerCase()) && !log.id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const updateStatus = (id: string, status: string) => {
    setLiveLogs(prev => prev.map(log => log.id === id ? { ...log, status, checkIn: status === "PRESENT" ? "10:00 AM" : "--" } : log))
  }

  const handleSubmitAttendance = async () => {
    setIsSubmitting(true)
    try {
      const recordsToSubmit = liveLogs.map(log => ({
        studentId: log.id,
        status: log.status
      }))

      await fetchApi("/academy/attendance/batch-mark", {
        method: "POST",
        body: JSON.stringify({ records: recordsToSubmit })
      })

      toast.success("Batch attendance submitted successfully")
      setIsRollCallMode(false)
      mutateAttendance()
    } catch (err: any) {
      toast.error(err.message || "Failed to submit attendance")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Instructor Roll Call View
  if (isRollCallMode) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Live Roll Call: {batchFilter}</h1>
            <p className="text-muted-foreground mt-1">Date: {new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
          <div className="flex gap-4">
            <button 
              disabled={isSubmitting}
              onClick={handleSubmitAttendance} 
              className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all text-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Attendance"}
            </button>
            <button onClick={() => setIsRollCallMode(false)} className="px-6 py-3 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 transition-all text-lg">
              Exit
            </button>
          </div>
        </div>
        
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredLogs.map(student => (
              <div key={student.id} className={`bg-card border-2 rounded-2xl p-6 shadow-sm transition-colors cursor-pointer flex flex-col items-center text-center ${student.status === 'PRESENT' ? 'border-emerald-500/50' : student.status === 'ABSENT' ? 'border-red-500/50' : student.status === 'LATE' ? 'border-amber-500/50' : 'border-border/50 hover:border-primary/50'}`}>
                <div className="w-20 h-20 bg-muted rounded-full mb-4 flex items-center justify-center text-2xl font-bold text-muted-foreground overflow-hidden">
                  {student.avatar ? (
                    <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    student.name[0]
                  )}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">{student.name}</h3>
                <p className="text-sm text-muted-foreground mb-6">{student.studentCode || student.id}</p>
                
                <div className="flex w-full gap-2 mt-auto">
                  <button onClick={() => updateStatus(student.id, 'PRESENT')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${student.status === 'PRESENT' ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white'}`}>
                    P
                  </button>
                  <button onClick={() => updateStatus(student.id, 'ABSENT')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${student.status === 'ABSENT' ? 'bg-red-500 text-white' : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white'}`}>
                    A
                  </button>
                  <button onClick={() => updateStatus(student.id, 'LATE')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${student.status === 'LATE' ? 'bg-amber-500 text-white' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-white'}`}>
                    L
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const lowAttendanceCount = filteredLogs.filter(l => (l.attendanceRateNum || parseInt(l.attendanceRate || '100')) < 75).length

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Academy Attendance</h1>
            <p className="text-sm text-muted-foreground mt-1">Track student attendance across physical and virtual batches.</p>
          </div>
          <button 
            onClick={() => setIsRollCallMode(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm"
          >
            <Maximize2 className="w-4 h-4" />
            Start Live Roll Call
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Alerts */}
        {lowAttendanceCount > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-500">Low Attendance Alert</h4>
              <p className="text-sm text-red-500/80 mt-1">{lowAttendanceCount} student(s) in this view have fallen below the 75% attendance threshold. Automated warning email queued.</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-muted/20 p-4 rounded-xl border border-border/50">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {["All Batches", ...batchNames].map(b => (
              <button
                key={b}
                onClick={() => setBatchFilter(b)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  batchFilter === b ? "bg-card text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:max-w-xs flex gap-2">
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" />
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search students..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-background border border-border/50 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Today's Status</th>
                  <th className="px-6 py-4 font-medium">Check-In Time</th>
                  <th className="px-6 py-4 font-medium">Overall Attendance</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredLogs.map((log) => {
                  const rate = log.attendanceRateNum || parseInt(log.attendanceRate || '100')
                  return (
                    <tr key={log.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{log.name}</div>
                        <div className="text-xs text-muted-foreground">{log.studentCode || log.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border ${
                          log.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          log.status === 'LATE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {log.status === 'PRESENT' && <CheckCircle2 className="w-3 h-3" />}
                          {log.status === 'LATE' && <Clock className="w-3 h-3" />}
                          {log.status === 'ABSENT' && <XCircle className="w-3 h-3" />}
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-muted-foreground">{log.checkIn}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`font-bold ${rate < 75 ? 'text-red-500' : 'text-foreground'}`}>
                            {log.attendanceRate}
                          </span>
                          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${rate < 75 ? 'bg-red-500' : 'bg-primary'}`} 
                              style={{ width: `${rate}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary hover:underline text-xs font-medium">View History</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredLogs.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p>No students found for this batch.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

