"use client"

import { useState, useEffect } from "react"
import { Video, Calendar, Clock, User, ExternalLink } from "lucide-react"

export default function OfficeHoursPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:4000/api/v1/academy/office-hours')
      .then(res => res.json())
      .then(data => {
        setSessions(data.data || [])
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-pulse w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#49ABC9]" /></div>
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-[#050505] text-white pt-16 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-500 opacity-10 blur-[100px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm font-bold text-white mb-6">
            <Video className="w-4 h-4 text-red-400" /> Live Mentorship
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Office Hours</h1>
          <p className="text-white/60 max-w-xl text-lg mb-8">Join live Google Meet sessions with industry experts to ask questions, review your portfolio, and get unstuck.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-10 relative z-20 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(session => (
            <div key={session.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500" />
              
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(session.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">{session.title}</h3>
              <p className="text-slate-500 text-sm mb-6 flex-1">
                Hosted by: <strong className="text-slate-700">{session.mentor.firstName} {session.mentor.lastName}</strong>
              </p>
              
              <div className="pt-6 border-t border-slate-100 mt-auto">
                <a 
                  href={session.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#ea4335] hover:bg-[#d33426] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(234,67,53,0.3)]"
                >
                  <Video className="w-5 h-5" /> Join via Google Meet
                </a>
              </div>
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl p-12 border border-slate-200 text-center shadow-sm">
              <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No Upcoming Sessions</h3>
              <p className="text-slate-500 max-w-md mx-auto">Mentors haven't scheduled any new office hours yet. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
