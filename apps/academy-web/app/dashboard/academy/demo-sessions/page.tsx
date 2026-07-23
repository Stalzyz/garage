"use client"

import { useApi, fetchApi } from "@/lib/useApi"
import { CalendarDays, Plus, MapPin, Users, Calendar, Loader2, PlayCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function DemoSessionsAdmin() {
  const { data: sessions, mutate } = useApi<any[]>("/academy/demo-sessions")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState({ title: "", scheduledAt: "", venue: "", meetLink: "", capacity: 20, durationMins: 60 })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi("/academy/demo-sessions", { method: "POST", body: JSON.stringify({
        ...form, capacity: parseInt(form.capacity.toString()), durationMins: parseInt(form.durationMins.toString())
      }) })
      toast.success("Demo session created!")
      setIsAddOpen(false)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to create session")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <PlayCircle className="w-8 h-8 text-fuchsia-500" /> Demo Sessions
          </h1>
          <p className="text-white/50 mt-2">Schedule and manage introductory demo classes for walk-in leads.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 font-bold px-6 py-3 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Schedule Demo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(sessions || []).map((session: any) => (
          <div key={session.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-fuchsia-500/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-400 px-2 py-1 rounded font-bold uppercase tracking-widest">DEMO CLASS</span>
              <span className="text-[10px] px-2 py-1 rounded font-bold uppercase bg-emerald-500/10 text-emerald-400">UPCOMING</span>
            </div>
            <h3 className="font-bold text-lg mb-2">{session.title}</h3>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Calendar className="w-4 h-4 text-white/30" /> {new Date(session.scheduledAt).toLocaleString('en-IN')} ({session.durationMins} mins)
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <MapPin className="w-4 h-4 text-white/30" /> {session.venue || "Campus Main Hall"}
              </div>
              {session.meetLink && (
                <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
                  <a href={session.meetLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-fuchsia-400 hover:text-fuchsia-300 font-bold transition-colors">
                    <PlayCircle className="w-4 h-4" /> Join Google Meet
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Users className="w-4 h-4 text-white/30" /> {session._count?.registrations || 0} / {session.capacity} Seats Booked
              </div>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-fuchsia-500 rounded-full" style={{ width: `${Math.min(100, ((session._count?.registrations || 0) / session.capacity) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-6">Schedule Demo Class</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <input required placeholder="Demo Title (e.g. Intro to UI/UX)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} />
              
              <div className="grid grid-cols-3 gap-4">
                <input required type="datetime-local" className="col-span-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 [color-scheme:dark]"
                  value={form.scheduledAt} onChange={e => setForm(p => ({...p, scheduledAt: e.target.value}))} />
                <input required type="number" placeholder="Duration (mins)" className="col-span-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                  value={form.durationMins} onChange={e => setForm(p => ({...p, durationMins: parseInt(e.target.value)}))} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Venue / Room" className="col-span-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                  value={form.venue} onChange={e => setForm(p => ({...p, venue: e.target.value}))} />
                <input placeholder="Google Meet Link (Optional)" className="col-span-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                  value={form.meetLink} onChange={e => setForm(p => ({...p, meetLink: e.target.value}))} />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <input required type="number" placeholder="Capacity" className="col-span-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                  value={form.capacity} onChange={e => setForm(p => ({...p, capacity: parseInt(e.target.value)}))} />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-xl font-bold transition-colors flex justify-center items-center">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
