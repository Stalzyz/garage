"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, Clock, MapPin, Video, Users, ChevronLeft, ChevronRight, Plus, ExternalLink } from "lucide-react"

import { SlideOver } from "@/components/SlideOver"
import { toast } from "sonner"

import { useApi, fetchApi } from "@/lib/useApi"
import { format } from "date-fns"

export default function AcademyScheduleDashboard() {
  const { data: upcomingData, mutate } = useApi<any>("/academy/batches/sessions/upcoming")
  const schedule = upcomingData?.data || []

  const [filter, setFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    batchId: "",
    type: "ONLINE",
    date: "",
    startTime: "",
    endTime: ""
  })

  // To list batches in dropdown
  const { data: batchesData } = useApi<any>("/academy/batches")
  const batchesList = batchesData?.data || batchesData?.batches || []

  const filteredSchedule = schedule.filter((session: any) => {
    // Determine type based on if it has meetLink or location
    const sessionType = session.meetLink ? "online" : "onsite"
    if (filter !== "all" && sessionType !== filter) return false
    return true
  })

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!formData.batchId) {
      toast.error("Please select a batch");
      return;
    }
    setIsSubmitting(true)
    try {
      await fetchApi(`/academy/batches/${formData.batchId}/sessions`, {
        method: "POST",
        body: JSON.stringify({
          title: formData.title,
          startTime: new Date(`${formData.date}T${formData.startTime}:00`).toISOString(),
          endTime: new Date(`${formData.date}T${formData.endTime}:00`).toISOString(),
          meetLink: formData.type === "ONLINE" ? "https://meet.google.com/new" : undefined,
          location: formData.type === "ONSITE" ? "Main Hall" : undefined
        })
      })
      mutate()
      setIsCreateOpen(false)
      toast.success("Session scheduled successfully")
    } catch (e: any) {
      toast.error(e.message || "Failed to schedule session")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Class Schedule</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage online and onsite academy sessions.</p>
          </div>
          <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
            <Plus className="w-4 h-4" />
            Schedule Session
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex gap-6">
        
        {/* Main Content (Upcoming Classes) */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between bg-muted/20 p-4 rounded-xl border border-border/50">
            <div className="flex items-center gap-2">
              <button className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors"><ChevronLeft className="w-5 h-5" /></button>
              <h2 className="text-lg font-bold text-foreground px-2">June 2025</h2>
              <button className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setFilter("all")} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === "all" ? "bg-card shadow-sm border border-border/50 text-foreground" : "text-muted-foreground hover:bg-muted"}`}>All</button>
              <button onClick={() => setFilter("online")} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === "online" ? "bg-card shadow-sm border border-border/50 text-foreground" : "text-muted-foreground hover:bg-muted"}`}>Online</button>
              <button onClick={() => setFilter("onsite")} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === "onsite" ? "bg-card shadow-sm border border-border/50 text-foreground" : "text-muted-foreground hover:bg-muted"}`}>Onsite</button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredSchedule.map((session: any) => {
              const d = new Date(session.startTime)
              const dateStr = format(d, "MMM d")
              const dayStr = format(d, "dd")
              const type = session.meetLink ? "ONLINE" : "ONSITE"
              
              return (
              <div key={session.id} className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm hover:border-primary/30 transition-all flex gap-5 group">
                
                {/* Date/Time Block */}
                <div className="flex flex-col items-center justify-center w-24 h-24 bg-muted/50 rounded-xl border border-border/50 flex-none shrink-0">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">{dateStr.split(" ")[0]}</span>
                  <span className="text-2xl font-black text-foreground mt-1">{dayStr}</span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-lg font-bold text-foreground truncate pr-4">{session.title}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex-none ${
                        type === 'ONLINE' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      }`}>
                        {type}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">{session.batch?.name || "Unknown Batch"}</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> {format(d, "hh:mm a")} - {format(new Date(session.endTime), "hh:mm a")}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {type === 'ONLINE' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                      {session.location || "Google Meet"}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-center items-end gap-2 border-l border-border/40 pl-5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {type === 'ONLINE' ? (
                    <a href={session.meetLink || "#"} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full justify-center shadow-sm shadow-blue-500/20">
                      <Video className="w-4 h-4" /> Start Class
                    </a>
                  ) : (
                    <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full justify-center shadow-sm shadow-emerald-500/20">
                      <Users className="w-4 h-4" /> Take Attendance
                    </button>
                  )}
                </div>
              </div>
            )})}
            {filteredSchedule.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">No upcoming sessions found.</div>
            )}
          </div>
        </div>

        {/* Sidebar (Quick Stats & Calendar Mini) */}
        <div className="w-80 flex-none hidden lg:block space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" /> Mini Calendar
            </h3>
            {/* Simple mock calendar grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
              {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => <div key={d} className="text-muted-foreground font-medium py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {Array.from({length: 30}).map((_, i) => (
                <div key={i} className={`p-1.5 rounded-md ${i+1 === 18 ? 'bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/20' : 'hover:bg-muted cursor-pointer text-foreground'}`}>
                  {i+1}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-foreground mb-4">Google Meet Integration</h3>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border/50 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-500">
                  <Video className="w-4 h-4" />
                </div>
                <div className="text-sm font-medium text-foreground">Google Workspace</div>
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">CONNECTED</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Meet links are automatically generated for online classes.</p>
            <a href="/dashboard/settings/integrations" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">Manage in Settings <ExternalLink className="w-3 h-3"/></a>
          </div>
        </div>

      </div>

      <SlideOver
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Schedule Session"
        subtitle="Create a new class session for a batch."
      >
        <form onSubmit={handleCreateSession} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-foreground/50 uppercase tracking-wider mb-2">Session Title *</label>
            <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground" />
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground/50 uppercase tracking-wider mb-2">Batch</label>
            <select value={formData.batchId} onChange={e => setFormData({...formData, batchId: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground">
              <option value="">Select a Batch...</option>
              {batchesList.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground/50 uppercase tracking-wider mb-2">Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground">
                <option value="ONLINE">Online (Google Meet)</option>
                <option value="ONSITE">Onsite</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground/50 uppercase tracking-wider mb-2">Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground [color-scheme:dark]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground/50 uppercase tracking-wider mb-2">Start Time</label>
              <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground/50 uppercase tracking-wider mb-2">End Time</label>
              <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground [color-scheme:dark]" />
            </div>
          </div>
          <div className="pt-4 mt-6 border-t border-border/50">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Scheduling..." : "Schedule Session"}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}
