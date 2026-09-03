"use client"

import { useState, useEffect } from "react"
import { Calendar, Plus, Video, Clock, Users, X, LayoutGrid, List, Bell, ChevronLeft, ChevronRight } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

export default function MeetingsDashboard() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  const { data, isLoading, mutate } = useApi<any>("/hr/meetings")
  const [meetings, setMeetings] = useState<any[]>([])
  
  const { data: employeesData } = useApi<any>("/hr/employees")
  const [employees, setEmployees] = useState<any[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "11:00",
    attendeeIds: [] as string[]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingReminders, setIsSendingReminders] = useState(false)

  useEffect(() => {
    if (data?.data) setMeetings(data.data)
  }, [data])

  useEffect(() => {
    if (employeesData?.employees) {
      setEmployees(employeesData.employees)
    } else if (employeesData?.data) {
      setEmployees(employeesData.data)
    }
  }, [employeesData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const startIso = new Date(`${formData.date}T${formData.startTime}`).toISOString()
      const endIso = new Date(`${formData.date}T${formData.endTime}`).toISOString()
      
      const payload = {
        title: formData.title,
        description: formData.description,
        startTime: startIso,
        endTime: endIso,
        attendeeIds: formData.attendeeIds
      }

      const res = (await fetchApi("/hr/meetings", {
        method: "POST",
        body: JSON.stringify(payload)
      })) as any

      if (res.success) {
        toast.success("Meeting scheduled, Google Meet created, and invites sent!")
        setIsModalOpen(false)
        setFormData({
          title: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
          startTime: "10:00",
          endTime: "11:00",
          attendeeIds: []
        })
        mutate()
      } else {
        toast.error("Failed to schedule meeting")
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this meeting?")) return
    try {
      await fetchApi(`/hr/meetings/${id}`, { method: "DELETE" })
      toast.success("Meeting cancelled")
      mutate()
    } catch (err) {
      toast.error("Failed to cancel meeting")
    }
  }

  const handleSendReminders = async () => {
    setIsSendingReminders(true)
    try {
      const res = await fetchApi<{ success: boolean; sentCount: number }>("/hr/meetings/send-reminders", {
        method: "POST"
      })
      toast.success(`10-min meeting reminders sent to ${res.sentCount || 0} attendee(s)!`)
    } catch (err: any) {
      toast.error(err.message || "Failed to send reminders")
    } finally {
      setIsSendingReminders(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      <div className="absolute top-[10%] right-[10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-white/10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <Video className="w-5 h-5 text-blue-400" />
              </div>
              Internal Meetings & Google Meet
            </h1>
            <p className="text-sm text-muted-foreground mt-2">Schedule meetings, notify staff attendees, generate Google Meet links, and view your schedule calendar.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSendReminders}
              disabled={isSendingReminders}
              className="flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-500/20 transition-all"
            >
              <Bell className="w-4 h-4" /> {isSendingReminders ? "Sending..." : "Send 10-Min Reminders"}
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-white text-black font-bold tracking-widest uppercase text-xs px-5 py-3 rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] relative overflow-hidden"
            >
              <Plus className="w-4 h-4" /> Schedule Meeting
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              viewMode === "list" ? "bg-blue-600 text-white shadow-lg" : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            <List className="w-3.5 h-3.5" /> Meeting Cards
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              viewMode === "calendar" ? "bg-blue-600 text-white shadow-lg" : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Calendar Schedule View
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        {viewMode === "list" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {meetings.map((meeting: any) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 relative group overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                    <button 
                      onClick={() => handleDelete(meeting.id)}
                      className="absolute top-4 right-4 text-white/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <h3 className="text-xl font-bold text-foreground pr-8 mb-2">{meeting.title}</h3>
                    <p className="text-sm text-white/50 mb-6">{meeting.description || "No description provided."}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm text-white/70">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span>{new Date(meeting.startTime).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white/70">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span>{meeting.attendees?.length || 0} Staff Attendees</span>
                      </div>
                    </div>
                  </div>

                  {meeting.meetLink ? (
                    <a 
                      href={meeting.meetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-blue-500/20 text-blue-400 font-bold tracking-widest uppercase text-xs px-5 py-3 rounded-xl border border-blue-500/30 hover:bg-blue-500 hover:text-white transition-all"
                    >
                      <Video className="w-4 h-4" /> Join Google Meet
                    </a>
                  ) : (
                    <a
                      href={`https://meet.google.com/new`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-white/5 text-white/50 hover:text-white font-bold tracking-widest uppercase text-xs px-5 py-3 rounded-xl border border-white/10"
                    >
                      <Video className="w-4 h-4" /> Start Instant Meet
                    </a>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Calendar View */
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" /> Upcoming Scheduled Meetings Calendar
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="text-center font-bold text-xs uppercase tracking-widest text-white/40 pb-2 border-b border-white/10">
                  {day}
                </div>
              ))}

              {Array.from({ length: 14 }).map((_, i) => {
                const date = new Date()
                date.setDate(date.getDate() + i)
                const dateStr = date.toISOString().split("T")[0]
                const dayMeetings = meetings.filter(m => new Date(m.startTime).toISOString().split("T")[0] === dateStr)

                return (
                  <div key={i} className="min-h-[120px] bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white/60">{date.getDate()} {date.toLocaleString('default', { month: 'short' })}</span>
                      {dayMeetings.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                      )}
                    </div>

                    <div className="space-y-1.5 overflow-y-auto max-h-[80px]">
                      {dayMeetings.map(m => (
                        <div key={m.id} className="bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] p-1.5 rounded-lg truncate font-medium">
                          {new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {m.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!isLoading && meetings.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-bold text-white/50">No Upcoming Meetings</h3>
            <p className="text-sm text-white/30 mt-2">Schedule a new meeting to send staff invites and Google Meet links.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold">Schedule Internal Staff Meeting</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1 block">Meeting Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Weekly Product Sync"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1 block">Description / Agenda</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                  rows={2}
                  placeholder="Agenda items..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1 block">Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1 block">Start Time</label>
                  <input 
                    type="time" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                    value={formData.startTime}
                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1 block">End Time</label>
                  <input 
                    type="time" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                    value={formData.endTime}
                    onChange={e => setFormData({...formData, endTime: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1 block">Select Staff Attendees</label>
                <div className="max-h-40 overflow-y-auto bg-white/5 border border-white/10 rounded-lg p-2 space-y-1">
                  {employees.length === 0 ? (
                    <p className="text-xs text-white/40 p-2">Loading staff members...</p>
                  ) : (
                    employees.map(emp => (
                      <label key={emp.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer text-white">
                        <input 
                          type="checkbox"
                          checked={formData.attendeeIds.includes(emp.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({...formData, attendeeIds: [...formData.attendeeIds, emp.id]})
                            } else {
                              setFormData({...formData, attendeeIds: formData.attendeeIds.filter(id => id !== emp.id)})
                            }
                          }}
                          className="rounded border-white/20 text-blue-500 focus:ring-blue-500 focus:ring-offset-black"
                        />
                        <span className="text-sm">{emp.user?.firstName} {emp.user?.lastName} ({emp.jobTitle || 'Staff'})</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-white text-black font-bold tracking-widest uppercase text-xs px-6 py-3 rounded-lg hover:scale-105 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Scheduling..." : "Schedule & Send Invites"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
