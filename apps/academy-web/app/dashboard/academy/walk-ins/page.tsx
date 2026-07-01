"use client"

import { useApi, fetchApi } from "@/lib/useApi"
import { Users, Phone, MessageSquare, Clock, ArrowRight, UserPlus, FileText, CheckCircle2, Bot, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

export default function WalkInsAdmin() {
  const { data: stats } = useApi<any>("/academy/walk-ins/stats")
  const { data: walkIns, mutate, isLoading } = useApi<any[]>("/academy/walk-ins")
  
  const [selectedWalkIn, setSelectedWalkIn] = useState<any>(null)
  const [notes, setNotes] = useState("")

  const [pitchWalkIn, setPitchWalkIn] = useState<any>(null)
  const [pitches, setPitches] = useState<string[]>([])
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false)

  const generatePitch = async (w: any) => {
    setPitchWalkIn(w)
    setPitches([])
    setIsGeneratingPitch(true)
    try {
      const data = await fetchApi(`/academy/walk-ins/${w.id}/generate-pitch`, { method: "POST" }) as any
      setPitches(data.pitches || [])
    } catch (err: any) {
      toast.error(err.message || "Failed to generate pitch")
      setPitchWalkIn(null)
    } finally {
      setIsGeneratingPitch(false)
    }
  }

  const openWhatsApp = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    const encodedText = encodeURIComponent(text)
    window.open(`whatsapp://send?phone=${cleanPhone}&text=${encodedText}`, '_blank')
    toast.success("Opening WhatsApp...")
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetchApi(`/academy/walk-ins/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      })
      toast.success(`Moved to ${status}`)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    }
  }

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWalkIn || !notes.trim()) return
    try {
      await fetchApi(`/academy/walk-ins/${selectedWalkIn.id}`, {
        method: "PATCH",
        body: JSON.stringify({ notes: `${selectedWalkIn.notes || ''}\n[${new Date().toLocaleDateString()}] ${notes}` })
      })
      toast.success("Note added")
      setNotes("")
      setSelectedWalkIn(null)
      mutate()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Users className="w-8 h-8 text-sky-500" /> Walk-In Tracker
          </h1>
          <p className="text-white/50 mt-2">Manage campus visitors, demo requests, and walk-in leads.</p>
        </div>
        <a href="/kiosk" target="_blank" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition-colors font-bold text-sm">
          <ArrowRight className="w-4 h-4" /> Open Kiosk Mode
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-6">
          <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-2">Today's Walk-ins</h3>
          <div className="text-4xl font-black text-white">{stats?.todayCount || 0}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">New Leads</h3>
          <div className="text-4xl font-black text-white">{stats?.totalNew || 0}</div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Total Converted</h3>
          <div className="text-4xl font-black text-white">{stats?.totalConverted || 0}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Conversion Rate</h3>
          <div className="text-4xl font-black text-white">{stats?.conversionRate || 0}%</div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-white/50 text-xs uppercase tracking-widest">
            <tr>
              <th className="p-4 font-bold">Visitor Info</th>
              <th className="p-4 font-bold">Visit Details</th>
              <th className="p-4 font-bold">Timing</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading && <tr><td colSpan={5} className="p-8 text-center text-white/50">Loading walk-ins...</td></tr>}
            {(walkIns || []).length === 0 && !isLoading && (
              <tr><td colSpan={5} className="p-8 text-center text-white/50">No walk-ins recorded yet.</td></tr>
            )}
            {(walkIns || []).map((w: any) => (
              <tr key={w.id} className="hover:bg-white/[0.02]">
                <td className="p-4">
                  <div className="font-bold text-sky-400 text-base">{w.name}</div>
                  <div className="text-xs text-white/50 flex items-center gap-2 mt-1">
                    <Phone className="w-3 h-3" /> {w.phone}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-bold flex items-center gap-2">
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded uppercase">{w.type}</span>
                    {w.interestArea}
                  </div>
                  <div className="text-xs text-white/50 mt-1 uppercase">Source: {w.source}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-medium">{formatDistanceToNow(new Date(w.createdAt), { addSuffix: true })}</div>
                  <div className="text-xs text-white/50 mt-1">{new Date(w.createdAt).toLocaleTimeString()}</div>
                </td>
                <td className="p-4">
                  <select 
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg appearance-none cursor-pointer outline-none transition-colors
                      ${w.status === 'NEW' ? 'bg-sky-500/20 text-sky-400' : 
                        w.status === 'COUNSELLING' ? 'bg-amber-500/20 text-amber-400' :
                        w.status === 'CONVERTED' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-white/10 text-white/60'}`}
                    value={w.status}
                    onChange={(e) => updateStatus(w.id, e.target.value)}
                  >
                    <option value="NEW">New Walk-In</option>
                    <option value="COUNSELLING">In Counselling</option>
                    <option value="DEMO_SCHEDULED">Demo Scheduled</option>
                    <option value="FOLLOW_UP">Follow Up Required</option>
                    <option value="CONVERTED">Converted to Admission</option>
                    <option value="COLD">Cold / No Response</option>
                    <option value="LOST">Lost</option>
                  </select>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedWalkIn(w)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> Notes
                    </button>
                    <button onClick={() => generatePitch(w)} className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 border border-emerald-500/20">
                      <Bot className="w-3 h-3" /> AI Pitch
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedWalkIn && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-2">Visitor Notes</h2>
            <p className="text-white/50 text-sm mb-4">Tracking history for {selectedWalkIn.name}</p>
            
            <div className="bg-white/5 rounded-xl p-4 mb-4 min-h-[100px] max-h-[200px] overflow-y-auto whitespace-pre-wrap text-sm text-white/80">
              {selectedWalkIn.notes || "No notes yet. Add one below."}
            </div>

            <form onSubmit={addNote} className="space-y-4">
              <textarea 
                required 
                placeholder="Add a new note or interaction..." 
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm resize-none"
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
              />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setSelectedWalkIn(null)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors">Close</button>
                <button type="submit" className="flex-1 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition-colors">Add Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pitchWalkIn && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <h2 className="text-xl font-black mb-2 flex items-center gap-2 text-emerald-400">
              <Bot className="w-6 h-6" /> AI Pitch Generator
            </h2>
            <p className="text-white/50 text-sm mb-6">Generated tailored WhatsApp messages for {pitchWalkIn.name}.</p>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-6">
              {isGeneratingPitch && (
                <div className="flex flex-col items-center justify-center py-12 text-white/50">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-400" />
                  <div>Analyzing lead data and crafting pitches...</div>
                </div>
              )}
              
              {!isGeneratingPitch && pitches.map((pitch, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 group hover:border-emerald-500/30 transition-colors">
                  <div className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-2">Option {idx + 1}</div>
                  <div className="text-sm whitespace-pre-wrap text-white/90 leading-relaxed mb-4">{pitch}</div>
                  <button onClick={() => openWhatsApp(pitchWalkIn.phone, pitch)} className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-xl font-bold transition-colors text-sm flex justify-center items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Send on WhatsApp
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 mt-auto">
              <button type="button" onClick={() => setPitchWalkIn(null)} className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
