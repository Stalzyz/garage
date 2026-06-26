"use client"

import { useState } from "react"
import { Search, Plus, Filter, UserCheck, Clock, CheckCircle2, XCircle, LogIn, LogOut, Calendar, Download } from "lucide-react"

// Mock Data
const STAFF_ATTENDANCE = [
  { id: "A001", name: "Aisha Rahman", role: "Creative Director", date: "Today", checkIn: "09:15 AM", checkOut: "--", status: "PRESENT", hours: "4h 30m" },
  { id: "A002", name: "Ravi Kumar", role: "Senior UX Designer", date: "Today", checkIn: "09:45 AM", checkOut: "--", status: "LATE", hours: "4h 00m" },
  { id: "A003", name: "Maya Sharma", role: "Frontend Developer", date: "Today", checkIn: "10:05 AM", checkOut: "--", status: "LATE", hours: "3h 40m" },
  { id: "A004", name: "Karthik N.", role: "Operations Lead", date: "Today", checkIn: "--", checkOut: "--", status: "ABSENT", hours: "0h 00m" },
  { id: "A005", name: "Priya Desai", role: "Marketing Intern", date: "Today", checkIn: "09:00 AM", checkOut: "01:00 PM", status: "HALF_DAY", hours: "4h 00m" },
]

export default function StaffAttendanceDashboard() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  const filteredLogs = STAFF_ATTENDANCE.filter(log => {
    if (filter !== "all" && log.status.toLowerCase() !== filter) return false
    if (search && !log.name.toLowerCase().includes(search.toLowerCase()) && !log.role.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

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
            <button className="flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-all border border-border/50">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
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
              <span className="text-3xl font-bold text-foreground">18</span>
              <span className="text-sm text-muted-foreground">/ 24 staff</span>
            </div>
          </div>
          
          <div className="bg-card border border-border/50 p-5 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Late In</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">3</span>
              <span className="text-sm text-muted-foreground">staff</span>
            </div>
          </div>

          <div className="bg-card border border-border/50 p-5 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-blue-500 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Half Day / Leave</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">2</span>
              <span className="text-sm text-muted-foreground">staff</span>
            </div>
          </div>

          <div className="bg-card border border-border/50 p-5 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <XCircle className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Absent</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">1</span>
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
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{log.name}</div>
                      <div className="text-xs text-muted-foreground">{log.role}</div>
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
                        {log.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-foreground">
                        <LogIn className="w-3.5 h-3.5 text-muted-foreground" />
                        {log.checkIn}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-foreground">
                        <LogOut className="w-3.5 h-3.5 text-muted-foreground" />
                        {log.checkOut}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-foreground">
                      {log.hours}
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
    </div>
  )
}
