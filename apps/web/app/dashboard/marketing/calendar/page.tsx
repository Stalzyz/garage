"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Mail, MessageSquare, Megaphone, Image as ImageIcon } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns"

export default function MarketingCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Mock data for campaigns/posts
  const events = [
    { date: 5, title: "Summer Sale Email", type: "email", icon: Mail, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { date: 12, title: "New Course Launch", type: "social", icon: MessageSquare, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    { date: 15, title: "Webinar Invite", type: "email", icon: Mail, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { date: 22, title: "Facebook Ad Setup", type: "ad", icon: Megaphone, color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    { date: 28, title: "IG Reels Upload", type: "social", icon: ImageIcon, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" }
  ]

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 py-8 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Content Calendar</h1>
            <p className="text-sm text-white/50 mt-2">Plan and schedule marketing campaigns</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <Plus className="w-4 h-4" /> Schedule Content
          </button>
        </div>

        {/* Calendar Controls */}
        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-bold min-w-[150px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button onClick={nextMonth} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" /> Email
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400" /> Social
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" /> Ads
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden h-full flex flex-col">
          {/* Days of Week */}
          <div className="grid grid-cols-7 border-b border-white/10 bg-black/40">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="px-4 py-3 text-center text-xs font-mono font-bold tracking-widest text-white/40 uppercase">
                {day}
              </div>
            ))}
          </div>
          
          {/* Dates */}
          <div className="grid grid-cols-7 flex-1 auto-rows-[minmax(120px,1fr)]">
            {/* Empty slots for starting offset */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="border-b border-r border-white/5 bg-black/20" />
            ))}
            
            {/* Actual days */}
            {daysInMonth.map(day => {
              const dayEvents = events.filter(e => e.date === day.getDate())
              
              return (
                <div 
                  key={day.toString()} 
                  className={`border-b border-r border-white/5 p-2 transition-colors hover:bg-white/[0.02] ${isToday(day) ? 'bg-blue-500/[0.02]' : ''}`}
                >
                  <div className={`text-xs font-mono font-bold mb-2 flex items-center justify-center w-6 h-6 rounded-full ${isToday(day) ? 'bg-blue-500 text-white' : 'text-white/40'}`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1.5">
                    {dayEvents.map((event, idx) => {
                      const Icon = event.icon
                      return (
                        <div key={idx} className={`px-2 py-1.5 rounded-md border text-[10px] font-medium flex items-center gap-1.5 truncate cursor-pointer hover:opacity-80 transition-opacity ${event.color}`}>
                          <Icon className="w-3 h-3 shrink-0" />
                          <span className="truncate">{event.title}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
