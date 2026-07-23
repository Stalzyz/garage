"use client"

import { useState } from "react"
import { Search, Plus, Filter, UserCheck, Clock, CheckCircle2, XCircle, LogIn, LogOut, Calendar, Download } from "lucide-react"
import { SlideOver } from "@/components/SlideOver"
import { toast } from "sonner"

import { useApi, fetchApi } from "@/lib/useApi"

export default function StaffAttendanceDashboard() {
  const { data: attendanceData, mutate, isLoading } = useApi<{ attendance: any[] }>("/hr/attendance/all")
  const logs = attendanceData?.attendance || []
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [isManualOpen, setIsManualOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: empData } = useApi<any>("/hr/employees")
  const allEmployees = empData?.employees || []

  const [formData, setFormData] = useState({
    employeeId: "",
    status: "PRESENT",
    clockIn: "",
    clockOut: ""
  })

  const filteredLogs = logs.filter((log: any) => {
    if (filter !== "all" && log.status?.toLowerCase() !== filter) return false
    const employeeName = log.employee?.user?.firstName ? `${log.employee.user.firstName} ${log.employee.user.lastName}` : "Unknown"
    const role = log.employee?.jobTitle || ""
    if (search && !employeeName.toLowerCase().includes(search.toLowerCase()) && !role.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const presentCount = logs.filter((l: any) => l.status === "PRESENT").length
  const lateCount = logs.filter((l: any) => l.status === "LATE").length
  const absentCount = logs.filter((l: any) => l.status === "ABSENT").length
  const halfDayCount = logs.filter((l: any) => l.status === "HALF_DAY").length

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.employeeId) { toast.error("Please select an employee"); return }
    setIsSubmitting(true)
    try {
      // Clock-in
      await fetchApi("/hr/attendance/clock-in", {
        method: "POST",
        body: JSON.stringify({ employeeId: formData.employeeId })
      })
      // Then immediately override with the provided times if given
      if (formData.clockIn || formData.clockOut) {
        const todayRecord = await fetchApi<any>(`/hr/attendance/${formData.employeeId}`)
        const latestLog = todayRecord?.attendance?.[0]
        if (latestLog?.id) {
          await fetchApi(`/hr/attendance/override/${latestLog.id}`, {
            method: "PUT",
            body: JSON.stringify({
              status: formData.status,
              clockIn: formData.clockIn ? new Date(new Date().toDateString() + ' ' + formData.clockIn).toISOString() : undefined,
              clockOut: formData.clockOut ? new Date(new Date().toDateString() + ' ' + formData.clockOut).toISOString() : undefined
            })
          })
        }
      }
      toast.success("Attendance recorded successfully!")
      setIsManualOpen(false)
      setFormData({ employeeId: "", status: "PRESENT", clockIn: "", clockOut: "" })
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to record attendance")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExport = () => {
    const rows = [
      ["Employee", "Date", "Status", "Clock In", "Clock Out", "Hours"],
      ...logs.map((log: any) => [
        log.employee?.user ? `${log.employee.user.firstName} ${log.employee.user.lastName}` : "Unknown",
        new Date(log.date).toLocaleDateString('en-IN'),
        log.status || "",
        log.clockIn ? new Date(log.clockIn).toLocaleTimeString('en-IN') : "",
        log.clockOut ? new Date(log.clockOut).toLocaleTimeString('en-IN') : "",
        log.clockIn && log.clockOut
          ? `${Math.floor((new Date(log.clockOut).getTime() - new Date(log.clockIn).getTime()) / 3600000)}h ${Math.floor(((new Date(log.clockOut).getTime() - new Date(log.clockIn).getTime()) % 3600000) / 60000)}m`
          : "—"
      ])
    ]
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Attendance exported as CSV")
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Staff Attendance</h1>
            <p className="text-sm text-muted-foreground mt-1">Track daily check-ins, check-outs, and working hours.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleExport} className="flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-all border border-border/50">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button onClick={() => setIsManualOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
              <UserCheck className="w-4 h-4" />
              Mark Manual Entry
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border/50 p-5 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-emerald-500 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Present</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{presentCount}</span>
              <span className="text-sm text-muted-foreground">staff</span>
            </div>
          </div>
          
          <div className="bg-card border border-border/50 p-5 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Late In</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{lateCount}</span>
              <span className="text-sm text-muted-foreground">staff</span>
            </div>
          </div>

          <div className="bg-card border border-border/50 p-5 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-blue-500 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Half Day / Leave</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{halfDayCount}</span>
              <span className="text-sm text-muted-foreground">staff</span>
            </div>
          </div>

          <div className="bg-card border border-border/50 p-5 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <XCircle className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Absent</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{absentCount}</span>
              <span className="text-sm text-muted-foreground">staff</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-muted/20 p-4 rounded-xl border border-border/50">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {[
              { id: "all", label: "All Staff" },
              { id: "present", label: "Present" },
              { id: "late", label: "Late" },
              { id: "absent", label: "Absent" },
              { id: "half_day", label: "Half Day" },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  filter === f.id ? "bg-card text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:max-w-xs flex gap-2">
            <input type="date" defaultValue="2025-06-18" className="bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" />
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search staff..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-background border border-border/50 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Employee</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Check In</th>
                  <th className="px-6 py-4 font-medium">Check Out</th>
                  <th className="px-6 py-4 font-medium">Total Hours</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{log.employee?.user?.firstName} {log.employee?.user?.lastName}</div>
                      <div className="text-xs text-muted-foreground">{log.employee?.jobTitle}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border ${
                        log.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        log.status === 'LATE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        log.status === 'ABSENT' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>
                        {log.status === 'PRESENT' && <CheckCircle2 className="w-3 h-3" />}
                        {log.status === 'LATE' && <Clock className="w-3 h-3" />}
                        {log.status === 'ABSENT' && <XCircle className="w-3 h-3" />}
                        {log.status === 'HALF_DAY' && <Calendar className="w-3 h-3" />}
                        {log.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-foreground">
                        <LogIn className="w-3.5 h-3.5 text-muted-foreground" />
                        {log.clockIn ? new Date(log.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--"}
                        {log.clockInPhotoUrl && (
                          <div className="group relative ml-2">
                            <img src={log.clockInPhotoUrl} alt="Clock In Selfie" className="w-6 h-6 rounded-full object-cover border border-border/50 cursor-pointer hover:ring-2 hover:ring-primary transition-all" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50">
                              <img src={log.clockInPhotoUrl} alt="Selfie Enlarge" className="w-32 h-32 rounded-xl object-cover border-2 border-border/50 shadow-xl" />
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-foreground">
                        <LogOut className="w-3.5 h-3.5 text-muted-foreground" />
                        {log.clockOut ? new Date(log.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--"}
                        {log.clockOutPhotoUrl && (
                          <div className="group relative ml-2">
                            <img src={log.clockOutPhotoUrl} alt="Clock Out Selfie" className="w-6 h-6 rounded-full object-cover border border-border/50 cursor-pointer hover:ring-2 hover:ring-primary transition-all" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50">
                              <img src={log.clockOutPhotoUrl} alt="Selfie Enlarge" className="w-32 h-32 rounded-xl object-cover border-2 border-border/50 shadow-xl" />
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-foreground">
                      {log.clockIn && log.clockOut 
                        ? `${Math.floor((new Date(log.clockOut).getTime() - new Date(log.clockIn).getTime()) / 3600000)}h ${Math.floor(((new Date(log.clockOut).getTime() - new Date(log.clockIn).getTime()) % 3600000) / 60000)}m` 
                        : "--"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:underline text-xs font-medium">Edit Log</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLogs.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                <UserCheck className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p>No attendance logs found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      <SlideOver
        open={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        title="Mark Manual Entry"
        subtitle="Manually create or update an employee's attendance record."
      >
        <form onSubmit={handleManualEntry} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Employee *</label>
            <select required value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 text-white">
              <option value="">Select employee...</option>
              {allEmployees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>{emp.user?.firstName} {emp.user?.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Status</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 text-white">
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ABSENT">Absent</option>
              <option value="HALF_DAY">Half Day</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Clock In (HH:MM)</label>
              <input type="time" value={formData.clockIn} onChange={e => setFormData({...formData, clockIn: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Clock Out (HH:MM)</label>
              <input type="time" value={formData.clockOut} onChange={e => setFormData({...formData, clockOut: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 text-white" />
            </div>
          </div>
          
          <div className="pt-4 mt-6 border-t border-white/10">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}
