"use client"

import { useState } from "react"
import { Search, Plus, Filter, Users, CheckCircle2, XCircle, Clock, CalendarDays, Maximize2 } from "lucide-react"

// Mock Data
const BATCHES = ["UI/UX Cohort 4", "Brand Design Int.", "Web Dev Basics"]

const ACADEMY_ATTENDANCE = [
  { id: "S1001", name: "Rohan Patel", batch: "UI/UX Cohort 4", status: "PRESENT", checkIn: "10:00 AM", attendanceRate: "92%" },
  { id: "S1002", name: "Anjali Menon", batch: "UI/UX Cohort 4", status: "PRESENT", checkIn: "10:05 AM", attendanceRate: "88%" },
  { id: "S1003", name: "Vikram Singh", batch: "UI/UX Cohort 4", status: "ABSENT", checkIn: "--", attendanceRate: "71%" }, // < 75% alert
  { id: "S1004", name: "Sara Khan", batch: "UI/UX Cohort 4", status: "LATE", checkIn: "10:45 AM", attendanceRate: "85%" },
  { id: "S1005", name: "David Chen", batch: "UI/UX Cohort 4", status: "PRESENT", checkIn: "09:55 AM", attendanceRate: "98%" },
]

export default function AcademyAttendanceDashboard() {
  const [search, setSearch] = useState("")
  const [batchFilter, setBatchFilter] = useState("UI/UX Cohort 4")
  const [isRollCallMode, setIsRollCallMode] = useState(false)

  const filteredLogs = ACADEMY_ATTENDANCE.filter(log => {
    if (batchFilter !== "All Batches" && log.batch !== batchFilter) return false
    if (search && !log.name.toLowerCase().includes(search.toLowerCase()) && !log.id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Instructor Roll Call View
  if (isRollCallMode) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Live Roll Call: {batchFilter}</h1>
            <p className="text-muted-foreground mt-1">Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all text-lg">
              Submit Attendance
            </button>
            <button onClick={() => setIsRollCallMode(false)} className="px-6 py-3 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 transition-all text-lg">
              Exit
            </button>
          </div>
        </div>
        
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {ACADEMY_ATTENDANCE.map(student => (
              <div key={student.id} className="bg-card border-2 border-border/50 rounded-2xl p-6 shadow-sm hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-muted rounded-full mb-4 flex items-center justify-center text-2xl font-bold text-muted-foreground">
                  {student.name[0]}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">{student.name}</h3>
                <p className="text-sm text-muted-foreground mb-6">{student.id}</p>
                
                <div className="flex w-full gap-2 mt-auto">
                  <button className="flex-1 py-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl font-bold hover:bg-emerald-500 hover:text-white transition-all">
                    P
                  </button>
                  <button className="flex-1 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all">
                    A
                  </button>
                  <button className="flex-1 py-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl font-bold hover:bg-amber-500 hover:text-white transition-all">
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
        {filteredLogs.some(l => parseInt(l.attendanceRate) < 75) && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-500">Low Attendance Alert</h4>
              <p className="text-sm text-red-500/80 mt-1">1 student in this batch has fallen below the 75% attendance threshold. Automated warning email has been queued.</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-muted/20 p-4 rounded-xl border border-border/50">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {["All Batches", ...BATCHES].map(b => (
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
            <input type="date" defaultValue="2025-06-18" className="bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" />
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
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{log.name}</div>
                      <div className="text-xs text-muted-foreground">{log.id}</div>
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
                        <span className={`font-bold ${parseInt(log.attendanceRate) < 75 ? 'text-red-500' : 'text-foreground'}`}>
                          {log.attendanceRate}
                        </span>
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${parseInt(log.attendanceRate) < 75 ? 'bg-red-500' : 'bg-primary'}`} 
                            style={{ width: log.attendanceRate }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:underline text-xs font-medium">View History</button>
                    </td>
                  </tr>
                ))}
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
