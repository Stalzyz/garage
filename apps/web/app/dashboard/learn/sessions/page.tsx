"use client"

import { useState, useEffect } from "react"
import { Calendar, Video, Clock, Users, PlayCircle } from "lucide-react"

export default function StudentSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(`http://localhost:4000/api/v1/academy/batches/sessions/upcoming`)
      .then(res => res.json())
      .then(data => {
        setSessions(data.data || [])
        setIsLoading(false)
      })
      .catch(console.error)
  }, [])

  // In a real app we'd filter these properly based on `startTime` vs `new Date()`
  const upcomingSessions = sessions.filter(s => new Date(s.endTime) > new Date())
  const pastSessions = sessions.filter(s => new Date(s.endTime) <= new Date())

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Live Classes</h1>
        <p className="text-slate-500">Join your cohort for interactive mentor sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#49ABC9]" /> Upcoming Sessions
            </h2>
            
            <div className="space-y-4">
              {isLoading ? (
                <div className="animate-pulse h-32 bg-slate-100 rounded-2xl w-full" />
              ) : upcomingSessions.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                  <p className="text-slate-500">You have no upcoming live sessions scheduled.</p>
                </div>
              ) : upcomingSessions.map(session => (
                <div key={session.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-[#E5F4F8] text-[#49ABC9] w-24 h-24 rounded-xl flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold uppercase">{new Date(session.startTime).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-3xl font-black">{new Date(session.startTime).getDate()}</span>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">{session.batch?.course?.name} • {session.batch?.name}</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{session.title}</h3>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Mentor Session</span>
                    </div>
                  </div>
                  
                  <div className="shrink-0 w-full md:w-auto">
                    <a 
                      href={session.meetLink || "#"} 
                      target={session.meetLink ? "_blank" : "_self"}
                      className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                        session.meetLink 
                          ? 'bg-[#49ABC9] text-white hover:bg-[#398FA8]' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Video className="w-4 h-4" /> Join Call
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-slate-400" /> Past Recordings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastSessions.map(session => (
                <div key={session.id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="w-24 h-16 bg-slate-900 rounded-lg relative flex items-center justify-center shrink-0">
                    <PlayCircle className="w-6 h-6 text-white opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="font-bold text-slate-900 line-clamp-1">{session.title}</h4>
                    <span className="text-xs text-slate-500">{new Date(session.startTime).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {!isLoading && pastSessions.length === 0 && (
                <div className="col-span-full text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  No past recordings available yet.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-slate-900 rounded-2xl p-8 text-white sticky top-24">
            <h3 className="text-xl font-bold mb-4">Cohort Guidelines</h3>
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#49ABC9] shrink-0" />
                <span>Join meetings 5 minutes early to test your audio and video.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#49ABC9] shrink-0" />
                <span>Keep your camera on during interactive discussions.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#49ABC9] shrink-0" />
                <span>Attendance counts towards your final certificate grade.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckCircle2(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
  )
}
