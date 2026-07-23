"use client"

import { useApi, fetchApi } from "@/lib/useApi"
import { Video, Plus, Loader2, Users, Calendar, Clock, ExternalLink, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function OnsiteLiveSessionsPage() {
  const { data: sessions, isLoading, mutate } = useApi<any[]>("/academy/demo-sessions")
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: "",
    scheduledAt: "",
    durationMins: 60,
    capacity: 30,
    meetUrl: "",
    venue: "Online / Google Meet"
  })

  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const finalMeetUrl = form.meetUrl || `https://meet.google.com/new`
      await fetchApi("/academy/demo-sessions", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          durationMins: Number(form.durationMins),
          capacity: Number(form.capacity),
          venue: `${form.venue} | ${finalMeetUrl}`
        })
      })
      toast.success("Live session scheduled successfully!")
      setIsScheduleOpen(false)
      setForm({ title: "", scheduledAt: "", durationMins: 60, capacity: 30, meetUrl: "", venue: "Online / Google Meet" })
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule session")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white p-8 overflow-y-auto relative">
      <div className="flex-none border-b border-white/10 pb-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <Video className="w-6 h-6 text-rose-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Live Classes</h1>
              <p className="text-sm text-white/50 mt-2">Manage ongoing live sessions and demo classes.</p>
            </div>
          </div>
          <button onClick={() => setIsScheduleOpen(true)} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 font-bold px-6 py-3 rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Schedule Session
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions?.map((session: any) => (
            <div key={session.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col group hover:border-rose-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-1 rounded font-bold uppercase tracking-widest">
                  LIVE SESSION
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-bold uppercase">
                  SCHEDULED
                </span>
              </div>
              
              <h3 className="font-bold text-lg mb-2">{session.title}</h3>
              <p className="text-sm text-white/50 mb-6">{session.venue || "Main Hall"}</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <Calendar className="w-4 h-4 text-white/40" />
                  {new Date(session.scheduledAt).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <Clock className="w-4 h-4 text-white/40" />
                  {new Date(session.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} ({session.durationMins} mins)
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Users className="w-4 h-4" />
                  {session._count?.registrations || 0} / {session.capacity}
                </div>
                <a 
                  href={session.venue?.includes('http') ? session.venue.split('|').pop()?.trim() : 'https://meet.google.com/new'} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-rose-400 hover:text-rose-300 font-bold text-sm flex items-center gap-1.5 transition-colors bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/20"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Join Room
                </a>
              </div>
            </div>
          ))}

          {(!sessions || sessions.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/10 rounded-3xl">
              <Video className="w-16 h-16 text-white/10 mb-4" />
              <h2 className="text-xl font-bold text-white/80">No Live Sessions</h2>
              <p className="text-sm text-white/40 mt-2 max-w-md">Schedule a new live class or demo session to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Schedule Session Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Schedule Live Class</h2>
              <button onClick={() => setIsScheduleOpen(false)}><X className="w-5 h-5 text-white/50 hover:text-white" /></button>
            </div>
            <form onSubmit={handleScheduleSession} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Class Title</label>
                <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                  placeholder="e.g. Advanced UI Workshop"
                  value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Date & Time</label>
                <input required type="datetime-local" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                  value={form.scheduledAt} onChange={e => setForm(p => ({...p, scheduledAt: e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Duration (Mins)</label>
                  <input required type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                    value={form.durationMins} onChange={e => setForm(p => ({...p, durationMins: Number(e.target.value)}))} />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Max Capacity</label>
                  <input required type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                    value={form.capacity} onChange={e => setForm(p => ({...p, capacity: Number(e.target.value)}))} />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Google Meet URL (Optional)</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={form.meetUrl} onChange={e => setForm(p => ({...p, meetUrl: e.target.value}))} />
                <p className="text-[10px] text-white/40 mt-1">Leave empty to generate a new Google Meet room link automatically.</p>
              </div>
              <button disabled={isSubmitting || !form.title || !form.scheduledAt} type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 mt-4 flex justify-center items-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Schedule Session"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
