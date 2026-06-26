"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, Clock, MapPin, Video, Users, ChevronLeft, ChevronRight, Plus, ExternalLink } from "lucide-react"

// Mock Data
const SCHEDULE = [
  { id: "c1", title: "UI/UX Fundamentals - Color Theory", batch: "UI/UX Cohort 4", type: "ONLINE", instructor: "Ravi Kumar", date: "Today", time: "10:00 AM - 12:00 PM", location: "Zoom (Link Attached)", attendees: 24, status: "UPCOMING" },
  { id: "c2", title: "Brand Identity Workshop", batch: "Brand Design Int.", type: "ONSITE", instructor: "Aisha Rahman", date: "Today", time: "02:00 PM - 05:00 PM", location: "Studio Room A", attendees: 12, status: "UPCOMING" },
  { id: "c3", title: "React Components Intro", batch: "Web Dev Basics", type: "ONLINE", instructor: "Maya Sharma", date: "Tomorrow", time: "11:00 AM - 01:00 PM", location: "Google Meet", attendees: 18, status: "SCHEDULED" },
  { id: "c4", title: "Typography Masterclass", batch: "UI/UX Cohort 4", type: "ONSITE", instructor: "Ravi Kumar", date: "20 Jun 2025", time: "10:00 AM - 01:00 PM", location: "Main Lecture Hall", attendees: 24, status: "SCHEDULED" },
]

export default function AcademyScheduleDashboard() {
  const [filter, setFilter] = useState("all")

  const filteredSchedule = SCHEDULE.filter(session => {
    if (filter !== "all" && session.type.toLowerCase() !== filter) return false
    return true
  })

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Class Schedule</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage online and onsite academy sessions.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
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
            {filteredSchedule.map(session => (
              <div key={session.id} className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm hover:border-primary/30 transition-all flex gap-5 group">
                
                {/* Date/Time Block */}
                <div className="flex flex-col items-center justify-center w-24 h-24 bg-muted/50 rounded-xl border border-border/50 flex-none shrink-0">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">{session.date === "Today" || session.date === "Tomorrow" ? session.date : session.date.split(" ")[1]}</span>
                  <span className="text-2xl font-black text-foreground mt-1">{session.date === "Today" || session.date === "Tomorrow" ? new Date().getDate() + (session.date === "Tomorrow" ? 1 : 0) : session.date.split(" ")[0]}</span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-lg font-bold text-foreground truncate pr-4">{session.title}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex-none ${
                        session.type === 'ONLINE' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      }`}>
                        {session.type}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">{session.batch} • {session.instructor}</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> {session.time}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {session.type === 'ONLINE' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                      {session.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" /> {session.attendees} Students
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-center items-end gap-2 border-l border-border/40 pl-5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {session.type === 'ONLINE' ? (
                    <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full justify-center shadow-sm shadow-blue-500/20">
                      <Video className="w-4 h-4" /> Start Class
                    </button>
                  ) : (
                    <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full justify-center shadow-sm shadow-emerald-500/20">
                      <Users className="w-4 h-4" /> Take Attendance
                    </button>
                  )}
                  <button className="flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors w-full justify-center border border-border/50">
                    Edit Details
                  </button>
                </div>
              </div>
            ))}
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
            <h3 className="font-bold text-foreground mb-4">Zoom Integration</h3>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border/50 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  <Video className="w-4 h-4" />
                </div>
                <div className="text-sm font-medium text-foreground">Zoom Pro</div>
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">CONNECTED</span>
            </div>
            <p className="text-xs text-muted-foreground">Virtual class links are automatically generated and emailed to students 15 mins prior.</p>
          </div>
        </div>

      </div>
    </div>
  )
}
