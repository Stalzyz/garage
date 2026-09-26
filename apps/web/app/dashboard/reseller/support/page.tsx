"use client"

import { useState } from "react"
import { LifeBuoy, Plus, MessageSquare, Paperclip, X } from "lucide-react"
import { toast } from "sonner"

export default function ResellerSupportPage() {
  const [showNewModal, setShowNewModal] = useState(false)
  const [tickets, setTickets] = useState([
    { id: "t-101", subject: "Custom domain SSL verification issue", garage: "Apex Auto Care", status: "In Progress", date: "2026-09-25", message: "DNS CNAME added but SSL status still showing pending." },
    { id: "t-102", subject: "WhatsApp template approval request", garage: "Speedy Motors", status: "Open", date: "2026-09-24", message: "Need approval for new service reminder template." },
    { id: "t-103", subject: "Plan upgrade assistance", garage: "Royal Auto Works", status: "Closed", date: "2026-09-15", message: "Garage wants to upgrade from Basic to Growth." },
  ])

  const [form, setForm] = useState({
    subject: "",
    garage: "Apex Auto Care",
    message: "",
    attachment: "",
  })

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject || !form.message) return toast.error("Please enter Subject and Message")

    const newTicket = {
      id: `t-${Math.floor(100 + Math.random() * 900)}`,
      subject: form.subject,
      garage: form.garage,
      status: "Open",
      date: new Date().toISOString().split("T")[0],
      message: form.message,
    }

    setTickets([newTicket, ...tickets])
    setShowNewModal(false)
    setForm({ subject: "", garage: "Apex Auto Care", message: "", attachment: "" })
    toast.success("Support ticket submitted to Grekam Super Admin team.")
  }

  return (
    <div className="p-8 space-y-6 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support</h1>
          <p className="text-xs text-zinc-400 mt-1">Raise support tickets directly with Grekam for your garages.</p>
        </div>

        <button 
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
        {tickets.map((t) => (
          <div key={t.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-white">{t.subject}</span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-zinc-300 font-medium">
                  Garage: {t.garage}
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                t.status === "Open" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                t.status === "In Progress" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
              }`}>
                {t.status}
              </span>
            </div>

            <p className="text-xs text-zinc-400">{t.message}</p>
            <div className="text-[10px] text-zinc-500 pt-1 flex items-center justify-between">
              <span>Ticket ID: {t.id}</span>
              <span>Submitted: {t.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* NEW REQUEST MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b0f19] border border-white/10 rounded-3xl p-6 w-full max-w-lg space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">New Support Request</h2>
              <button onClick={() => setShowNewModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="Summary of issue..."
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Garage</label>
                <select
                  value={form.garage}
                  onChange={(e) => setForm({ ...form, garage: e.target.value })}
                  className="w-full bg-[#111625] border border-white/10 rounded-xl p-2.5 text-white"
                >
                  <option value="Apex Auto Care">Apex Auto Care</option>
                  <option value="Speedy Motors">Speedy Motors</option>
                  <option value="Royal Auto Works">Royal Auto Works</option>
                  <option value="General Platform Issue">General Platform Issue</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the issue or assistance needed..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Attachment (Optional URL)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={form.attachment}
                  onChange={(e) => setForm({ ...form, attachment: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/30"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
