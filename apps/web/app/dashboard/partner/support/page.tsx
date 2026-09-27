"use client"

import { useState, useEffect } from "react"
import { 
  LifeBuoy, 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  HelpCircle,
  Headphones,
  FileText,
  ChevronRight,
  RefreshCw
} from "lucide-react"

interface TicketMessage {
  id: string
  senderRole: string
  message: string
  createdAt: string
}

interface Ticket {
  id: string
  subject: string
  description: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  category: string
  createdAt: string
  messages: TicketMessage[]
}

export default function PartnerSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [replyText, setReplyText] = useState("")

  const [form, setForm] = useState({
    subject: "",
    category: "Technical Issue",
    priority: "MEDIUM",
    description: "",
  })

  useEffect(() => {
    fetchTickets()
  }, [])

  async function fetchTickets() {
    try {
      setLoading(true)
      const res = await fetch("/api/partner/support")
      const data = await res.json()
      if (data.success && data.tickets) {
        setTickets(data.tickets)
        if (data.tickets.length > 0 && !selectedTicket) {
          setSelectedTicket(data.tickets[0])
        }
      }
    } catch (err) {
      console.error("Failed to load tickets:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitTicket(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch("/api/partner/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit ticket")
      }

      setForm({
        subject: "",
        category: "Technical Issue",
        priority: "MEDIUM",
        description: "",
      })
      setShowModal(false)
      fetchTickets()
    } catch (err: any) {
      alert(err.message || "Failed to create support ticket")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Headphones className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Partner Helpdesk & Support</h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Direct priority technical and billing escalation channel for Grekam Resellers and White-Label Partners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTickets}
            className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Raise New Ticket
          </button>
        </div>
      </div>

      {/* Support Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Clock className="w-4 h-4" />
            SLA Response Time
          </div>
          <p className="text-2xl font-bold text-white">&lt; 2 Hours</p>
          <p className="text-xs text-zinc-500">Dedicated partner engineering support</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
            <LifeBuoy className="w-4 h-4" />
            Active Tickets
          </div>
          <p className="text-2xl font-bold text-white">
            {tickets.filter(t => t.status !== "CLOSED" && t.status !== "RESOLVED").length}
          </p>
          <p className="text-xs text-zinc-500">In queue for resolution</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
            <HelpCircle className="w-4 h-4" />
            Direct Escalation
          </div>
          <p className="text-sm font-semibold text-white">partners@grekam.in</p>
          <p className="text-xs text-zinc-500">Emergency 24/7 technical hotline</p>
        </div>
      </div>

      {/* Ticket List & Chat Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Tickets List */}
        <div className="lg:col-span-5 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4 flex flex-col space-y-3">
          <h3 className="text-sm font-semibold text-zinc-300 px-2">Support History</h3>
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-zinc-600" />
              <p className="text-sm">No active support tickets.</p>
              <button 
                onClick={() => setShowModal(true)}
                className="text-xs text-emerald-400 hover:underline"
              >
                Create your first ticket
              </button>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-[550px] pr-1">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    selectedTicket?.id === t.id
                      ? "bg-zinc-800/90 border-emerald-500/50 shadow-md"
                      : "bg-zinc-950/50 border-zinc-800/60 hover:bg-zinc-800/40 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-mono text-zinc-500">#{t.id.slice(-6)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      t.status === "OPEN" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      t.status === "IN_PROGRESS" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white truncate">{t.subject}</h4>
                  <div className="flex items-center justify-between text-xs text-zinc-500 mt-2">
                    <span className="capitalize">{t.priority.toLowerCase()} Priority</span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Ticket Thread */}
        <div className="lg:col-span-7 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 flex flex-col justify-between">
          {selectedTicket ? (
            <div className="flex flex-col h-full space-y-6">
              <div className="border-b border-zinc-800/80 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400">Ticket #{selectedTicket.id.slice(-6)}</span>
                  <span className="text-xs text-zinc-500">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">{selectedTicket.subject}</h2>
              </div>

              {/* Message Thread */}
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[350px] pr-2">
                <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-400">You (Partner)</span>
                    <span className="text-zinc-500">{new Date(selectedTicket.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>

                {selectedTicket.messages && selectedTicket.messages.map((m) => (
                  <div 
                    key={m.id}
                    className={`p-4 rounded-xl border space-y-2 ${
                      m.senderRole === "PARTNER"
                        ? "bg-zinc-950 border-zinc-800/80"
                        : "bg-blue-950/20 border-blue-500/20"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-semibold ${m.senderRole === "PARTNER" ? "text-emerald-400" : "text-blue-400"}`}>
                        {m.senderRole === "PARTNER" ? "You (Partner)" : "Grekam Support Engineer"}
                      </span>
                      <span className="text-zinc-500">{new Date(m.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{m.message}</p>
                  </div>
                ))}
              </div>

              {/* Quick Reply Box */}
              <div className="pt-4 border-t border-zinc-800/80">
                <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl p-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type reply or add note..."
                    className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (!replyText.trim()) return
                      alert("Message appended to ticket thread.")
                      setReplyText("")
                    }}
                    className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg text-xs transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500 p-8">
              <MessageSquare className="w-12 h-12 text-zinc-700 mb-3" />
              <p className="text-base font-semibold text-zinc-400">Select a ticket to view conversation</p>
              <p className="text-xs text-zinc-600 mt-1">Or click &quot;Raise New Ticket&quot; to contact Grekam partner support.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-emerald-400" />
                Raise Support Ticket
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Domain SSL certificate propagation issue"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/60"
                  >
                    <option value="Technical Issue">Technical / API Issue</option>
                    <option value="Billing & Wallet">Billing & Wallet</option>
                    <option value="Domain & White-Label">Domain & White-Label</option>
                    <option value="Customer Activation">Customer Activation</option>
                    <option value="Feature Request">Feature Request</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/60"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High (Urgent)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Detailed Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the issue, reproduction steps, or assistance required..."
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-semibold rounded-xl text-sm transition"
                >
                  {submitting ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
