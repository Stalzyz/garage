"use client"

import { useState } from "react"
import { 
  Search, Plus, Filter, UserCheck, Clock, CheckCircle2, XCircle, LogIn, LogOut, 
  Calendar, Download, Eye, MapPin, Shuffle, Moon, Shield, Settings, Mail, ShieldAlert,
  CalendarDays, Trash2, CheckCircle, AlertCircle
} from "lucide-react"
import { SlideOver } from "@/components/SlideOver"
import { toast } from "sonner"
import { Modal } from "@/components/ui/modal"
import { useApi, fetchApi, API_BASE_URL } from "@/lib/useApi"

type TabType = "tracker" | "shifts" | "geofences" | "holidays" | "weekoffs" | "regularization" | "rules"

export default function StaffAttendanceDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("tracker")

  // API Hooks
  const { data: attendanceData, mutate: mutateAttendance } = useApi<{ attendance: any[] }>("/hr/attendance/all")
  const { data: employeesData } = useApi<{ employees: any[] }>("/hr/employees")
  const { data: shiftsData, mutate: mutateShifts } = useApi<{ data: any[] }>("/hr/shifts")
  const { data: assignmentsData, mutate: mutateAssignments } = useApi<{ data: any[] }>("/hr/shifts/assignments")
  const { data: geofencesData, mutate: mutateGeofences } = useApi<{ data: any[] }>("/hr/geofences")
  const { data: holidaysData, mutate: mutateHolidays } = useApi<{ data: any[] }>("/hr/holidays")
  const { data: weekoffsData, mutate: mutateWeekoffs } = useApi<{ data: any[] }>("/hr/weekoffs")
  const { data: regularizationData, mutate: mutateRegularization } = useApi<{ data: any[] }>("/hr/regularization")
  const { data: overtimeRuleData, mutate: mutateOvertimeRules } = useApi<{ data: any }>("/hr/rules/overtime")
  const { data: schedulersData, mutate: mutateSchedulers } = useApi<{ data: any[] }>("/hr/rules/scheduler")

  // Daily Tracker States
  const logs = attendanceData?.attendance || []
  const employees = employeesData?.employees || []
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  
  const [isManualOpen, setIsManualOpen] = useState(false)
  const [manualFormData, setManualFormData] = useState({
    employeeId: "",
    status: "PRESENT",
    checkIn: "09:00 AM",
    checkOut: "05:00 PM"
  })

  const [selectedLog, setSelectedLog] = useState<any | null>(null)
  const [overrideStatus, setOverrideStatus] = useState("")
  const [overrideNotes, setOverrideNotes] = useState("")
  const [isSavingOverride, setIsSavingOverride] = useState(false)

  // Forms Open/Close and Data States
  const [isShiftOpen, setIsShiftOpen] = useState(false)
  const [shiftForm, setShiftForm] = useState({
    name: "",
    type: "STANDARD" as "STANDARD" | "SPLIT" | "OPEN",
    startTime: "09:00",
    endTime: "17:00",
    startTime2: "",
    endTime2: "",
    minHours: 8.0,
    isFlexible: false
  })

  const [isAssignShiftOpen, setIsAssignShiftOpen] = useState(false)
  const [assignShiftForm, setAssignShiftForm] = useState({
    employeeId: "",
    shiftId: "",
    startDate: new Date().toISOString().split("T")[0]
  })

  const [isGeofenceOpen, setIsGeofenceOpen] = useState(false)
  const [geofenceForm, setGeofenceForm] = useState({
    name: "",
    latitude: 11.0168,
    longitude: 76.9558,
    radius: 100.0,
    isActive: true
  })

  const [isHolidayOpen, setIsHolidayOpen] = useState(false)
  const [holidayForm, setHolidayForm] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    isOptional: false
  })

  const [isWeekoffOpen, setIsWeekoffOpen] = useState(false)
  const [weekoffForm, setWeekoffForm] = useState({
    employeeId: "",
    daysOfWeek: [] as number[],
    effectiveFrom: new Date().toISOString().split("T")[0]
  })

  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false)
  const [schedulerForm, setSchedulerForm] = useState({
    name: "",
    type: "ATTENDANCE" as "ATTENDANCE" | "TELEMETRY" | "PAYROLL",
    frequency: "DAILY" as "DAILY" | "WEEKLY" | "MONTHLY",
    emailRecipients: "",
    time: "08:00",
    isActive: true
  })

  const [isProcessingAbsence, setIsProcessingAbsence] = useState(false)

  const handleExportCsv = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
      const queryParams = new URLSearchParams()
      if (filter && filter !== "all") queryParams.set("status", filter)
      const res = await fetch(`${apiBase}/exports/attendance.csv?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        }
      })
      if (!res.ok) throw new Error("Export failed")
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Staff_Attendance_${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success("Attendance CSV exported successfully")
    } catch (err: any) {
      toast.error(err.message || "Failed to export attendance CSV")
    }
  }

  const handleTriggerAutoAbsence = async () => {
    setIsProcessingAbsence(true)
    try {
      const res = await fetchApi<{ success: boolean; markedCount: number; targetDate?: string }>("/hr/attendance/auto-absence", {
        method: "POST",
        body: JSON.stringify({ date: new Date(Date.now() - 86400000).toISOString().split("T")[0] })
      })
      toast.success(`Auto-marked ${res.markedCount} employee(s) as ABSENT for ${res.targetDate || 'yesterday'}`)
      mutateAttendance()
    } catch (err: any) {
      toast.error(err.message || "Auto-absence processing failed")
    } finally {
      setIsProcessingAbsence(false)
    }
  }

  // Action Submit Helpers
  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualFormData.employeeId) return toast.error("Select an employee")
    try {
      await fetchApi("/hr/attendance", {
        method: "POST",
        body: JSON.stringify(manualFormData)
      })
      toast.success("Attendance marked manually")
      setIsManualOpen(false)
      mutateAttendance()
    } catch (err: any) {
      toast.error(err.message || "Failed to mark attendance")
    }
  }

  const handleOpenReview = (log: any) => {
    setSelectedLog(log)
    setOverrideStatus(log.status || "PRESENT")
    setOverrideNotes(log.notes || "")
  }

  const handleSaveOverride = async () => {
    setIsSavingOverride(true)
    try {
      await fetchApi(`/hr/attendance/override/${selectedLog.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: overrideStatus,
          notes: overrideNotes
        })
      })
      toast.success("Attendance log updated")
      setSelectedLog(null)
      mutateAttendance()
    } catch (err: any) {
      toast.error(err.message || "Failed to update attendance")
    } finally {
      setIsSavingOverride(false)
    }
  }

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetchApi("/hr/shifts", {
        method: "POST",
        body: JSON.stringify(shiftForm)
      })
      toast.success("Shift created successfully")
      setIsShiftOpen(false)
      mutateShifts()
    } catch (err: any) {
      toast.error(err.message || "Failed to create shift")
    }
  }

  const handleAssignShift = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetchApi("/hr/shifts/assign", {
        method: "POST",
        body: JSON.stringify(assignShiftForm)
      })
      toast.success("Shift assigned successfully")
      setIsAssignShiftOpen(false)
      mutateAssignments()
    } catch (err: any) {
      toast.error(err.message || "Failed to assign shift")
    }
  }

  const handleCreateGeofence = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetchApi("/hr/geofences", {
        method: "POST",
        body: JSON.stringify(geofenceForm)
      })
      toast.success("Geofence added successfully")
      setIsGeofenceOpen(false)
      mutateGeofences()
    } catch (err: any) {
      toast.error(err.message || "Failed to add geofence")
    }
  }

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetchApi("/hr/holidays", {
        method: "POST",
        body: JSON.stringify(holidayForm)
      })
      toast.success("Holiday created successfully")
      setIsHolidayOpen(false)
      mutateHolidays()
    } catch (err: any) {
      toast.error(err.message || "Failed to add holiday")
    }
  }

  const handleCreateWeekoff = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetchApi("/hr/weekoffs", {
        method: "POST",
        body: JSON.stringify(weekoffForm)
      })
      toast.success("Week off configured")
      setIsWeekoffOpen(false)
      mutateWeekoffs()
    } catch (err: any) {
      toast.error(err.message || "Failed to configure week off")
    }
  }

  const handleCreateScheduler = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetchApi("/hr/rules/scheduler", {
        method: "POST",
        body: JSON.stringify(schedulerForm)
      })
      toast.success("Report scheduler configured")
      setIsSchedulerOpen(false)
      mutateSchedulers()
    } catch (err: any) {
      toast.error(err.message || "Failed to configure scheduler")
    }
  }

  const handleRegularizationAction = async (id: string, action: "APPROVED" | "REJECTED") => {
    try {
      await fetchApi(`/hr/regularization/${id}/action`, {
        method: "PUT",
        body: JSON.stringify({ action })
      })
      toast.success(`Request ${action.toLowerCase()}`)
      mutateRegularization()
      mutateAttendance()
    } catch (err: any) {
      toast.error(err.message || "Action failed")
    }
  }

  const handleSaveOvertimeRules = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const data = {
      minHoursForOT: parseFloat((form.elements.namedItem("minHoursForOT") as HTMLInputElement).value),
      otMultiplier: parseFloat((form.elements.namedItem("otMultiplier") as HTMLInputElement).value),
      gracePeriodMins: parseInt((form.elements.namedItem("gracePeriodMins") as HTMLInputElement).value),
      isEodAutoCloseEnabled: (form.elements.namedItem("isEodAutoCloseEnabled") as HTMLInputElement).checked,
      eodAutoCloseTime: (form.elements.namedItem("eodAutoCloseTime") as HTMLInputElement).value
    }
    try {
      await fetchApi("/hr/rules/overtime", {
        method: "POST",
        body: JSON.stringify(data)
      })
      toast.success("Overtime and EOD configurations updated")
      mutateOvertimeRules()
    } catch (err: any) {
      toast.error(err.message || "Failed to save overtime configurations")
    }
  }

  // Filters and Counts (Daily Tracker)
  const filteredLogs = logs.filter((log: any) => {
    if (filter !== "all" && log.status?.toLowerCase() !== filter) return false
    const employeeName = log.employee?.user?.firstName ? `${log.employee.user.firstName} ${log.employee.user.lastName}` : "Unknown"
    const role = log.employee?.jobTitle || ""
    if (search && !employeeName.toLowerCase().includes(search.toLowerCase()) && !role.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const presentCount = logs.filter(l => l.status === "PRESENT").length
  const lateCount = logs.filter(l => l.status === "LATE").length
  const absentCount = logs.filter(l => l.status === "ABSENT").length
  const halfDayCount = logs.filter(l => l.status === "HALF_DAY").length

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-4 md:px-6 py-4 md:py-5 border-b border-border/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Staff Attendance</h1>
            <p className="text-sm text-muted-foreground mt-1">Track daily check-ins, configurations, shifts, and schedules.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            {activeTab === "tracker" && (
              <>
                <button onClick={handleExportCsv} className="flex flex-1 md:flex-none justify-center items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-all border border-border/50 min-h-[44px]">
                  <Download className="w-4 h-4" /> Export CSV
                </button>
                <button onClick={handleTriggerAutoAbsence} disabled={isProcessingAbsence} className="flex flex-1 md:flex-none justify-center items-center gap-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-500/20 transition-all min-h-[44px]">
                  <XCircle className="w-4 h-4" /> {isProcessingAbsence ? "Processing..." : "Auto-Mark Absences"}
                </button>
                <button onClick={() => setIsManualOpen(true)} className="flex flex-1 md:flex-none justify-center items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm min-h-[44px]">
                  <UserCheck className="w-4 h-4" /> Mark Manual Entry
                </button>
              </>
            )}
            {activeTab === "shifts" && (
              <>
                <button onClick={() => setIsAssignShiftOpen(true)} className="flex justify-center items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium border border-border/50 min-h-[44px]">
                  <Shuffle className="w-4 h-4" /> Assign Shift
                </button>
                <button onClick={() => setIsShiftOpen(true)} className="flex justify-center items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm min-h-[44px]">
                  <Plus className="w-4 h-4" /> New Shift Profile
                </button>
              </>
            )}
            {activeTab === "geofences" && (
              <button onClick={() => setIsGeofenceOpen(true)} className="flex justify-center items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm min-h-[44px]">
                <MapPin className="w-4 h-4" /> Add Geofence Site
              </button>
            )}
            {activeTab === "holidays" && (
              <button onClick={() => setIsHolidayOpen(true)} className="flex justify-center items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm min-h-[44px]">
                <Calendar className="w-4 h-4" /> Add Calendar Holiday
              </button>
            )}
            {activeTab === "weekoffs" && (
              <button onClick={() => setIsWeekoffOpen(true)} className="flex justify-center items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm min-h-[44px]">
                <CalendarDays className="w-4 h-4" /> Configure Week Off
              </button>
            )}
            {activeTab === "rules" && (
              <button onClick={() => setIsSchedulerOpen(true)} className="flex justify-center items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm min-h-[44px]">
                <Mail className="w-4 h-4" /> Setup Report Scheduler
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex-none bg-muted/40 border-b border-border/50 px-6">
        <div className="flex gap-4 overflow-x-auto py-2.5">
          {[
            { id: "tracker", label: "Daily Tracker" },
            { id: "shifts", label: "Shift Planner" },
            { id: "geofences", label: "Geofencing & Tagging" },
            { id: "holidays", label: "Holiday Calendar" },
            { id: "weekoffs", label: "Week Offs" },
            { id: "regularization", label: "Regularizations" },
            { id: "rules", label: "Rules & Schedulers" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as TabType)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                activeTab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === "tracker" && (
          <>
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
                <input type="date" defaultValue={new Date().toISOString().split("T")[0]} className="bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" />
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
                      <th className="px-6 py-4 font-medium">Telemetry/Details</th>
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
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-foreground">
                            <LogOut className="w-3.5 h-3.5 text-muted-foreground" />
                            {log.clockOut ? new Date(log.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs space-y-0.5 text-muted-foreground">
                            {log.isGeofenced && <div className="text-emerald-500 font-semibold flex items-center gap-1"> Verified GPS location</div>}
                            {log.isRegularized && <div className="text-blue-500 font-semibold flex items-center gap-1">️ Regularized record</div>}
                            {!log.isGeofenced && !log.isRegularized && <div>Standard web verification</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleOpenReview(log)} 
                            className="text-primary hover:underline text-xs font-medium flex items-center gap-1.5 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" /> Review Log
                          </button>
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
          </>
        )}

        {activeTab === "shifts" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-foreground">Active Shift Configuration Profiles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(shiftsData?.data || []).map((shift: any) => (
                <div key={shift.id} className="bg-card border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <h3 className="font-bold text-foreground text-base">{shift.name}</h3>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-md border border-primary/20">
                      {shift.type}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Work Timings:</span>
                      <span className="font-semibold text-foreground">
                        {shift.type === "OPEN" ? "Flexible / Open" : `${shift.startTime} - ${shift.endTime}`}
                      </span>
                    </div>
                    {shift.type === "SPLIT" && (
                      <div className="flex justify-between">
                        <span>Split Timings:</span>
                        <span className="font-semibold text-foreground">
                          {shift.startTime2} - {shift.endTime2}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Min Daily Hours:</span>
                      <span className="font-semibold text-foreground">{shift.minHours} hrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Assigned Staff:</span>
                      <span className="font-semibold text-foreground">{shift._count?.employeeShifts || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(shiftsData?.data || []).length === 0 && (
                <div className="col-span-full border border-dashed border-border/50 rounded-xl p-12 text-center text-muted-foreground">
                  <Shuffle className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p>No shift profiles configured yet. Create one to begin scheduling staff.</p>
                </div>
              )}
            </div>

            {/* Assignments List */}
            <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border/50">
                <h3 className="font-bold text-foreground">Employee Shift Assignments</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="px-6 py-4 font-medium">Employee</th>
                      <th className="px-6 py-4 font-medium">Assigned Shift</th>
                      <th className="px-6 py-4 font-medium">Start Date</th>
                      <th className="px-6 py-4 font-medium">End Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {(assignmentsData?.data || []).map((asg: any) => (
                      <tr key={asg.id}>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">
                            {asg.employee?.user?.firstName} {asg.employee?.user?.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-foreground">{asg.shift?.name}</td>
                        <td className="px-6 py-4">{new Date(asg.startDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-muted-foreground">{asg.endDate ? new Date(asg.endDate).toLocaleDateString() : "Ongoing"}</td>
                      </tr>
                    ))}
                    {(assignmentsData?.data || []).length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                          No active shift assignments. Select "Assign Shift" to schedule an employee.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "geofences" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-foreground">Fencing Locations & Coordinate Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(geofencesData?.data || []).map((geo: any) => (
                <div key={geo.id} className="bg-card border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-foreground font-bold text-base">
                      <MapPin className="w-4 h-4 text-primary" />
                      {geo.name}
                    </div>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${geo.isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-muted text-muted-foreground border border-border'}`}>
                      {geo.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground border-t border-border/50 pt-3">
                    <div className="flex justify-between">
                      <span>Coordinates:</span>
                      <span className="font-mono text-xs text-foreground">{geo.latitude.toFixed(6)}, {geo.longitude.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Allowed Radius:</span>
                      <span className="font-semibold text-foreground">{geo.radius} meters</span>
                    </div>
                  </div>
                </div>
              ))}
              {(geofencesData?.data || []).length === 0 && (
                <div className="col-span-full border border-dashed border-border/50 rounded-xl p-12 text-center text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p>No geofences configured. Geotagging enforces clock-ins to happen only inside approved site coordinates.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "holidays" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-foreground">Calendar Holidays</h2>
            <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="px-6 py-4 font-medium">Holiday Date</th>
                      <th className="px-6 py-4 font-medium">Name</th>
                      <th className="px-6 py-4 font-medium">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {(holidaysData?.data || []).map((hol: any) => (
                      <tr key={hol.id}>
                        <td className="px-6 py-4 font-semibold text-foreground">
                          {new Date(hol.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-foreground">{hol.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${hol.isOptional ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                            {hol.isOptional ? "Optional / Restricted" : "General Holiday"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(holidaysData?.data || []).length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-12 text-center text-muted-foreground">
                          No holidays configured in the calendar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "weekoffs" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-foreground">Weekly Off Assignments</h2>
            <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="px-6 py-4 font-medium">Employee</th>
                      <th className="px-6 py-4 font-medium">Designation</th>
                      <th className="px-6 py-4 font-medium">Assigned Weekly Offs</th>
                      <th className="px-6 py-4 font-medium">Effective From</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {(weekoffsData?.data || []).map((wo: any) => {
                      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                      const daysStr = wo.daysOfWeek.map((d: number) => days[d]).join(", ")
                      return (
                        <tr key={wo.id}>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-foreground">
                              {wo.employee?.user?.firstName} {wo.employee?.user?.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{wo.employee?.jobTitle}</td>
                          <td className="px-6 py-4 font-medium text-foreground">{daysStr || "No Off Days"}</td>
                          <td className="px-6 py-4">{new Date(wo.effectiveFrom).toLocaleDateString()}</td>
                        </tr>
                      )
                    })}
                    {(weekoffsData?.data || []).length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-muted-foreground">
                          No custom week offs configured.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "regularization" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-foreground">Attendance Regularization Request Queue</h2>
            <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="px-6 py-4 font-medium">Employee</th>
                      <th className="px-6 py-4 font-medium">Request Date</th>
                      <th className="px-6 py-4 font-medium">Type</th>
                      <th className="px-6 py-4 font-medium">Reason</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {(regularizationData?.data || []).map((req: any) => (
                      <tr key={req.id}>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">
                            {req.employee?.user?.firstName} {req.employee?.user?.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">{req.employee?.jobTitle}</div>
                        </td>
                        <td className="px-6 py-4">{new Date(req.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-medium text-foreground">
                          {req.requestType}
                          {req.requestedTime && ` (${new Date(req.requestedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">{req.reason}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                            req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            req.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {req.status === 'PENDING' ? (
                            <div className="flex gap-2 justify-end">
                              <button 
                                onClick={() => handleRegularizationAction(req.id, "APPROVED")} 
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleRegularizationAction(req.id, "REJECTED")} 
                                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-semibold"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Processed by {req.approvedBy || "Admin"}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(regularizationData?.data || []).length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-muted-foreground">
                          No regularization requests submitted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "rules" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Overtime & EOD Configurations */}
            <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground text-lg">Overtime & EOD Settings</h3>
              </div>

              <form onSubmit={handleSaveOvertimeRules} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Grace Period (Minutes)</label>
                  <input type="number" name="gracePeriodMins" defaultValue={overtimeRuleData?.data?.gracePeriodMins || 15} className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Min Daily Hours for Overtime (OT)</label>
                  <input type="number" step="0.1" name="minHoursForOT" defaultValue={overtimeRuleData?.data?.minHoursForOT || 8.0} className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Overtime Hours Multiplier</label>
                  <input type="number" step="0.1" name="otMultiplier" defaultValue={overtimeRuleData?.data?.otMultiplier || 1.5} className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary" />
                </div>
                <div className="border-t border-border/50 pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Auto-Close EOD Attendance</h4>
                      <p className="text-xs text-muted-foreground">Clock out any employee still clocked in at EOD</p>
                    </div>
                    <input type="checkbox" name="isEodAutoCloseEnabled" defaultChecked={overtimeRuleData?.data?.isEodAutoCloseEnabled || false} className="w-5 h-5 rounded border-border" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Auto-Close Execution Time</label>
                    <input type="text" name="eodAutoCloseTime" defaultValue={overtimeRuleData?.data?.eodAutoCloseTime || "23:59"} className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/95 transition-all text-sm mt-4 shadow-sm">
                  Save Settings
                </button>
              </form>
            </div>

            {/* Report Schedulers */}
            <div className="space-y-6">
              <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border/50 pb-3 mb-4">
                  <Mail className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-foreground text-lg">Active Report Schedulers</h3>
                </div>
                <div className="space-y-4">
                  {(schedulersData?.data || []).map((sch: any) => (
                    <div key={sch.id} className="border border-border/50 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{sch.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {sch.frequency} · {sch.time} · {sch.type}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-xs">
                          To: {sch.emailRecipients}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sch.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted'}`}>
                        {sch.isActive ? "ACTIVE" : "PAUSED"}
                      </span>
                    </div>
                  ))}
                  {(schedulersData?.data || []).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-6">No scheduled reports. Select "Setup Report Scheduler" to configure.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Entry SlideOver */}
      <SlideOver
        open={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        title="Mark Manual Entry"
        subtitle="Manually update an employee's attendance record."
      >
        <form onSubmit={handleSaveManual} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Employee *</label>
            <select 
              value={manualFormData.employeeId} 
              onChange={e => setManualFormData({...manualFormData, employeeId: e.target.value})}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 text-white"
            >
              <option value="">Select Employee</option>
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>{emp.user?.firstName} {emp.user?.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Status</label>
            <select value={manualFormData.status} onChange={e => setManualFormData({...manualFormData, status: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 text-white">
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ABSENT">Absent</option>
              <option value="HALF_DAY">Half Day</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Check In</label>
              <input value={manualFormData.checkIn} onChange={e => setManualFormData({...manualFormData, checkIn: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Check Out</label>
              <input value={manualFormData.checkOut} onChange={e => setManualFormData({...manualFormData, checkOut: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 text-white" />
            </div>
          </div>
          
          <div className="pt-4 mt-6 border-t border-white/10">
            <button 
              type="submit"
              className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all"
            >
              Save Entry
            </button>
          </div>
        </form>
      </SlideOver>

      {/* New Shift SlideOver */}
      <SlideOver
        open={isShiftOpen}
        onClose={() => setIsShiftOpen(false)}
        title="Create Shift Profile"
        subtitle="Setup standard, split, or flexible shifts rules."
      >
        <form onSubmit={handleCreateShift} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Shift Profile Name *</label>
            <input required placeholder="e.g. Morning Shift" value={shiftForm.name} onChange={e => setShiftForm({...shiftForm, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Shift Type</label>
            <select value={shiftForm.type} onChange={e => setShiftForm({...shiftForm, type: e.target.value as any})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
              <option value="STANDARD">Standard Shift</option>
              <option value="SPLIT">Split Shift</option>
              <option value="OPEN">Flexible / Open Shift</option>
            </select>
          </div>
          {shiftForm.type !== "OPEN" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Start Time</label>
                <input value={shiftForm.startTime} onChange={e => setShiftForm({...shiftForm, startTime: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">End Time</label>
                <input value={shiftForm.endTime} onChange={e => setShiftForm({...shiftForm, endTime: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
              </div>
            </div>
          )}
          {shiftForm.type === "SPLIT" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Start Time 2</label>
                <input value={shiftForm.startTime2} onChange={e => setShiftForm({...shiftForm, startTime2: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">End Time 2</label>
                <input value={shiftForm.endTime2} onChange={e => setShiftForm({...shiftForm, endTime2: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Minimum Work Hours Required</label>
            <input type="number" step="0.1" value={shiftForm.minHours} onChange={e => setShiftForm({...shiftForm, minHours: parseFloat(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
          </div>
          <div className="pt-4 mt-6 border-t border-white/10">
            <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all">
              Create Profile
            </button>
          </div>
        </form>
      </SlideOver>

      {/* Assign Shift SlideOver */}
      <SlideOver
        open={isAssignShiftOpen}
        onClose={() => setIsAssignShiftOpen(false)}
        title="Assign Shift Profile"
        subtitle="Schedule an employee under a specific shift rules."
      >
        <form onSubmit={handleAssignShift} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Employee *</label>
            <select 
              value={assignShiftForm.employeeId} 
              onChange={e => setAssignShiftForm({...assignShiftForm, employeeId: e.target.value})}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
            >
              <option value="">Select Employee</option>
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>{emp.user?.firstName} {emp.user?.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Shift Profile *</label>
            <select 
              value={assignShiftForm.shiftId} 
              onChange={e => setAssignShiftForm({...assignShiftForm, shiftId: e.target.value})}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
            >
              <option value="">Select Shift Profile</option>
              {(shiftsData?.data || []).map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Effective From (Start Date) *</label>
            <input type="date" value={assignShiftForm.startDate} onChange={e => setAssignShiftForm({...assignShiftForm, startDate: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
          </div>
          <div className="pt-4 mt-6 border-t border-white/10">
            <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all">
              Assign Shift
            </button>
          </div>
        </form>
      </SlideOver>

      {/* Add Geofence SlideOver */}
      <SlideOver
        open={isGeofenceOpen}
        onClose={() => setIsGeofenceOpen(false)}
        title="Add Geofence Parameters"
        subtitle="Tag a location coordinates boundary for clock-ins verification."
      >
        <form onSubmit={handleCreateGeofence} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Office / Site Name *</label>
            <input required placeholder="e.g. Coimbatore Main HQ" value={geofenceForm.name} onChange={e => setGeofenceForm({...geofenceForm, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Latitude *</label>
              <input type="number" step="0.000001" required value={geofenceForm.latitude} onChange={e => setGeofenceForm({...geofenceForm, latitude: parseFloat(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Longitude *</label>
              <input type="number" step="0.000001" required value={geofenceForm.longitude} onChange={e => setGeofenceForm({...geofenceForm, longitude: parseFloat(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Radius Threshold (meters)</label>
            <input type="number" value={geofenceForm.radius} onChange={e => setGeofenceForm({...geofenceForm, radius: parseFloat(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
          </div>
          <div className="pt-4 mt-6 border-t border-white/10">
            <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all">
              Save Geofence
            </button>
          </div>
        </form>
      </SlideOver>

      {/* Add Holiday SlideOver */}
      <SlideOver
        open={isHolidayOpen}
        onClose={() => setIsHolidayOpen(false)}
        title="Add Holiday Date"
        subtitle="Mark a date in the calendar as a holiday status."
      >
        <form onSubmit={handleCreateHoliday} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Holiday Label *</label>
            <input required placeholder="e.g. Independence Day" value={holidayForm.name} onChange={e => setHolidayForm({...holidayForm, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Holiday Date *</label>
            <input type="date" value={holidayForm.date} onChange={e => setHolidayForm({...holidayForm, date: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">Optional/Restricted Holiday</h4>
              <p className="text-xs text-white/50">Allow staff to optionally select this holiday</p>
            </div>
            <input type="checkbox" checked={holidayForm.isOptional} onChange={e => setHolidayForm({...holidayForm, isOptional: e.target.checked})} className="w-5 h-5 rounded border-white/10 bg-black/40" />
          </div>
          <div className="pt-4 mt-6 border-t border-white/10">
            <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all">
              Save Holiday
            </button>
          </div>
        </form>
      </SlideOver>

      {/* Configure Weekoff SlideOver */}
      <SlideOver
        open={isWeekoffOpen}
        onClose={() => setIsWeekoffOpen(false)}
        title="Configure Week Off Days"
        subtitle="Define custom week-off parameters for an employee."
      >
        <form onSubmit={handleCreateWeekoff} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Employee *</label>
            <select 
              value={weekoffForm.employeeId} 
              onChange={e => setWeekoffForm({...weekoffForm, employeeId: e.target.value})}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
            >
              <option value="">Select Employee</option>
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>{emp.user?.firstName} {emp.user?.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Off Days (Select Days)</label>
            <div className="grid grid-cols-2 gap-2 pt-2 text-white">
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, idx) => (
                <label key={day} className="flex items-center gap-2 text-sm cursor-pointer py-1">
                  <input 
                    type="checkbox"
                    checked={weekoffForm.daysOfWeek.includes(idx)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setWeekoffForm({...weekoffForm, daysOfWeek: [...weekoffForm.daysOfWeek, idx]})
                      } else {
                        setWeekoffForm({...weekoffForm, daysOfWeek: weekoffForm.daysOfWeek.filter(d => d !== idx)})
                      }
                    }}
                    className="w-4 h-4 rounded border-white/10"
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Effective From *</label>
            <input type="date" value={weekoffForm.effectiveFrom} onChange={e => setWeekoffForm({...weekoffForm, effectiveFrom: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
          </div>
          <div className="pt-4 mt-6 border-t border-white/10">
            <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all">
              Apply Week Off Days
            </button>
          </div>
        </form>
      </SlideOver>

      {/* Setup Scheduler SlideOver */}
      <SlideOver
        open={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        title="Create Report Scheduler"
        subtitle="Automate attendance or telemetry logs direct to executive emails."
      >
        <form onSubmit={handleCreateScheduler} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Scheduler Name *</label>
            <input required placeholder="e.g. Executive Daily Summary" value={schedulerForm.name} onChange={e => setSchedulerForm({...schedulerForm, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Report Type</label>
              <select value={schedulerForm.type} onChange={e => setSchedulerForm({...schedulerForm, type: e.target.value as any})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                <option value="ATTENDANCE">Attendance Summary</option>
                <option value="TELEMETRY">Telemetry Log Sheet</option>
                <option value="PAYROLL">Payroll Status</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Frequency</label>
              <select value={schedulerForm.frequency} onChange={e => setSchedulerForm({...schedulerForm, frequency: e.target.value as any})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Recipients Email *</label>
            <input required placeholder="e.g. manager@grekam.in, boss@grekam.in" value={schedulerForm.emailRecipients} onChange={e => setSchedulerForm({...schedulerForm, emailRecipients: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Execution Time</label>
            <input placeholder="e.g. 08:00" value={schedulerForm.time} onChange={e => setSchedulerForm({...schedulerForm, time: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
          </div>
          <div className="pt-4 mt-6 border-t border-white/10">
            <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all">
              Schedule Report
            </button>
          </div>
        </form>
      </SlideOver>

      {/* Review Log Modal */}
      {selectedLog && (
        <Modal onClose={() => setSelectedLog(null)}>
          <div className="p-6 w-[500px] text-white">
            <h2 className="text-xl font-bold mb-4">Review Attendance Log</h2>
            <p className="text-xs text-white/50 mb-6 font-mono">
              Employee: {selectedLog.employee?.user?.firstName} {selectedLog.employee?.user?.lastName}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-[10px] font-mono tracking-widest uppercase text-white/40 mb-2">Check In Photo</p>
                <div className="w-full aspect-video bg-black/40 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center">
                  {selectedLog.clockInPhotoUrl ? (
                    <img src={selectedLog.clockInPhotoUrl} alt="Clock In Selfie" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-white/30 font-mono">No photo</span>
                  )}
                </div>
                <p className="text-xs text-white/60 mt-1 font-mono text-center">
                  {selectedLog.clockIn ? new Date(selectedLog.clockIn).toLocaleTimeString() : "N/A"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-mono tracking-widest uppercase text-white/40 mb-2">Check Out Photo</p>
                <div className="w-full aspect-video bg-black/40 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center">
                  {selectedLog.clockOutPhotoUrl ? (
                    <img src={selectedLog.clockOutPhotoUrl} alt="Clock Out Selfie" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-white/30 font-mono">No photo</span>
                  )}
                </div>
                <p className="text-xs text-white/60 mt-1 font-mono text-center">
                  {selectedLog.clockOut ? new Date(selectedLog.clockOut).toLocaleTimeString() : "N/A"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Override Status</label>
                <select 
                  value={overrideStatus} 
                  onChange={e => setOverrideStatus(e.target.value)} 
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 text-white"
                >
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late</option>
                  <option value="ABSENT">Absent</option>
                  <option value="HALF_DAY">Half Day</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Admin Notes</label>
                <textarea 
                  value={overrideNotes} 
                  onChange={e => setOverrideNotes(e.target.value)} 
                  placeholder="Reason for overriding or verification details"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 text-white h-20 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest border border-white/10 text-white/60 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={isSavingOverride}
                  onClick={handleSaveOverride}
                  className="px-5 py-2 text-xs font-mono font-bold uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSavingOverride ? "Saving..." : "Save Override"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

