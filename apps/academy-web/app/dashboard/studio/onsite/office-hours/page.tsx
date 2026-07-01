"use client"

import { useApi, fetchApi } from "@/lib/useApi"
import { Calendar, Clock, Video, Users, Plus, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function OfficeHoursPage() {
  const { data: slots, mutate, isLoading } = useApi<any[]>("/academy/office-hours")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState({ title: "", scheduledFor: "", durationMins: 15, capacity: 1, meetLink: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi("/academy/office-hours", { 
        method: "POST", 
        body: JSON.stringify({
          ...form, 
          durationMins: parseInt(form.durationMins.toString()),
          capacity: parseInt(form.capacity.toString())
        }) 
      })
      toast.success("Office Hour scheduled!")
      setIsAddOpen(false)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule slot")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Clock className="w-8 h-8 text-indigo-500" /> Mentorship Office Hours
          </h1>
          <p className="text-white/50 mt-2">Manage your availability for 1-on-1 or group mentoring sessions.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
          <Plus className="w-4 h-4" /> Open a Slot
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading && <div className="text-white/50">Loading slots...</div>}
        
        {(slots || []).map((slot: any) => {
          const isFull = slot._count.bookings >= slot.capacity;
          return (
            <div key={slot.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
              
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] bg-white/10 text-white/70 px-2 py-1 rounded font-bold uppercase tracking-widest">
                  {slot.durationMins} MINS
                </span>
                <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest ${isFull ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {isFull ? 'FULLY BOOKED' : 'OPEN'}
                </span>
              </div>
              
              <h3 className="font-bold text-lg mb-4">{slot.title}</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><Calendar className="w-4 h-4 text-indigo-400" /></div>
                  <div>
                    <div className="font-bold">{new Date(slot.scheduledFor).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    <div className="text-xs text-white/50">{new Date(slot.scheduledFor).toLocaleTimeString('en-IN', { timeStyle: 'short' })}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><Users className="w-4 h-4 text-emerald-400" /></div>
                  <div>
                    <div className="font-bold">{slot._count.bookings} / {slot.capacity} Booked</div>
                    <div className="text-xs text-white/50">{slot.capacity === 1 ? '1-on-1 Session' : 'Group Session'}</div>
                  </div>
                </div>

                {slot.meetLink && (
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><Video className="w-4 h-4 text-blue-400" /></div>
                    <a href={slot.meetLink} target="_blank" className="font-bold text-blue-400 hover:underline truncate">Google Meet</a>
                  </div>
                )}
              </div>

              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-auto">
                <div className={`h-full rounded-full transition-all ${isFull ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (slot._count.bookings / slot.capacity) * 100)}%` }} />
              </div>
            </div>
          )
        })}

        {(slots || []).length === 0 && !isLoading && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-white/10 rounded-3xl">
            <Clock className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <div className="text-white/50 font-bold">No upcoming office hours.</div>
          </div>
        )}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-black mb-6">Open Office Hour Slot</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              
              <div>
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Topic / Title</label>
                <input required placeholder="e.g. Portfolio Review, UI/UX Doubts" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                  value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} />
              </div>
              
              <div>
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Date & Time</label>
                <input required type="datetime-local" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors [color-scheme:dark]"
                  value={form.scheduledFor} onChange={e => setForm(p => ({...p, scheduledFor: e.target.value}))} />
              </div>

              <div className="flex gap-4">
                <div className="flex-[2]">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Duration (Mins)</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                    value={form.durationMins} onChange={e => setForm(p => ({...p, durationMins: parseInt(e.target.value)}))}>
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">1 Hour</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Capacity</label>
                  <input required type="number" min="1" max="50" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                    value={form.capacity} onChange={e => setForm(p => ({...p, capacity: parseInt(e.target.value)}))} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Meet Link (Optional)</label>
                <input placeholder="https://meet.google.com/..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                  value={form.meetLink} onChange={e => setForm(p => ({...p, meetLink: e.target.value}))} />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-black shadow-lg shadow-indigo-500/20 transition-colors flex justify-center items-center">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
