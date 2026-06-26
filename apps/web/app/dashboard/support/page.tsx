"use client"

import { useState } from "react"
import { Search, Filter, Send, Paperclip, MoreVertical, CircleDot, AlertCircle, Clock, CheckCircle2, Plus, X } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { format } from "date-fns"
import { toast } from "sonner"
import { useCurrentUser } from "@/context/CurrentUserContext"

export default function SupportPage() {
  const { data, mutate, isLoading } = useApi<any>("/support/tickets")
  const tickets = data?.tickets || []
  const { role } = useCurrentUser()

  const [activeTicketId, setActiveTicketId] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // New ticket state
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false)
  const [newTicket, setNewTicket] = useState({ subject: "", priority: "MEDIUM", message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredTickets = tickets.filter((t: any) => 
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeTicket = tickets.find((t: any) => t.id === activeTicketId)

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'URGENT': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'HIGH': return <AlertCircle className="w-4 h-4 text-amber-500" />
      case 'MEDIUM': return <CircleDot className="w-4 h-4 text-blue-500" />
      case 'LOW': return <CircleDot className="w-4 h-4 text-white/30" />
      default: return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'OPEN': return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold">OPEN</span>
      case 'IN_PROGRESS': return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold">IN PROGRESS</span>
      case 'RESOLVED': return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold">RESOLVED</span>
      case 'CLOSED': return <span className="bg-white/10 text-white/50 border border-white/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold">CLOSED</span>
      default: return null
    }
  }

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !activeTicketId) return
    try {
      await fetchApi(`/support/tickets/${activeTicketId}/messages`, {
        method: "POST",
        body: JSON.stringify({ message: replyMessage, isInternal: false })
      })
      setReplyMessage("")
      mutate()
    } catch (err: any) {
      toast.error("Failed to send reply")
    }
  }

  const handleStatusChange = async (status: string) => {
    if (!activeTicketId) return
    try {
      await fetchApi(`/support/tickets/${activeTicketId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      })
      toast.success(`Ticket marked as ${status}`)
      mutate()
    } catch (err: any) {
      toast.error("Failed to update status")
    }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTicket.subject || !newTicket.message) return
    
    setIsSubmitting(true)
    try {
      const ticket = await fetchApi<any>("/support/tickets", {
        method: "POST",
        body: JSON.stringify(newTicket)
      })
      toast.success("Ticket created successfully")
      setIsNewTicketOpen(false)
      setNewTicket({ subject: "", priority: "MEDIUM", message: "" })
      mutate()
      setActiveTicketId(ticket.id)
    } catch (err) {
      toast.error("Failed to create ticket")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Support Helpdesk</h1>
            <p className="text-sm text-white/50 mt-2">Manage client and student support tickets</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Col - Ticket List */}
        <div className="w-1/3 flex flex-col border-r border-white/10 bg-black/20">
          <div className="p-4 border-b border-white/10 flex flex-col gap-4">
            <button 
              onClick={() => setIsNewTicketOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-sm font-bold transition-colors"
            >
              <Plus className="w-4 h-4" /> New Ticket
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets..." 
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/30"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="p-8 text-center text-white/40 text-sm">Loading tickets...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-white/40 text-sm">No tickets found</div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredTickets.map((ticket: any) => (
                  <div 
                    key={ticket.id} 
                    onClick={() => setActiveTicketId(ticket.id)}
                    className={`p-4 cursor-pointer transition-colors ${activeTicketId === ticket.id ? 'bg-blue-500/10 border-l-2 border-blue-500' : 'hover:bg-white/5 border-l-2 border-transparent'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(ticket.priority)}
                        <h4 className="font-bold text-sm text-white truncate max-w-[200px]">{ticket.subject}</h4>
                      </div>
                      <span className="text-[10px] text-white/40 font-mono shrink-0">
                        {format(new Date(ticket.updatedAt), 'MMM d')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-white/50 truncate max-w-[200px]">
                        {ticket.messages?.[0]?.message || "No messages yet"}
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col - Ticket Thread */}
        <div className="w-2/3 flex flex-col bg-black/40">
          {!activeTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white/30">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a ticket to view the conversation</p>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="p-6 border-b border-white/10 flex items-start justify-between bg-white/[0.02]">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold">{activeTicket.subject}</h2>
                    {role === 'Staff' || role === 'Manager' || role === 'Super Admin' ? (
                      <select 
                        value={activeTicket.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded text-xs font-mono px-2 py-1 outline-none focus:border-blue-500/50"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    ) : (
                      getStatusBadge(activeTicket.status)
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/50 font-mono">
                    <span>ID: {activeTicket.id}</span>
                    <span>Created: {format(new Date(activeTicket.createdAt), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                </div>
                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                {activeTicket.messages?.map((msg: any) => {
                  const isStaff = msg.senderId.includes("staff")
                  return (
                    <div key={msg.id} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-4 ${isStaff ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white/10 text-white rounded-tl-sm border border-white/5'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold uppercase opacity-60">
                            {isStaff ? 'Staff Support' : 'Client / Student'}
                          </span>
                          <span className="text-[10px] opacity-40 ml-4">
                            {format(new Date(msg.createdAt), 'h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t border-white/10 bg-white/[0.02]">
                <div className="bg-black/60 border border-white/10 rounded-xl overflow-hidden focus-within:border-blue-500/50 transition-colors">
                  <textarea 
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    placeholder="Type your reply here..."
                    className="w-full bg-transparent p-4 text-sm focus:outline-none resize-none"
                    rows={3}
                  />
                  <div className="px-4 py-3 bg-white/5 flex items-center justify-between border-t border-white/5">
                    <button className="p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleSendReply}
                      disabled={!replyMessage.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" /> Reply
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-lg">Create New Ticket</h3>
              <button onClick={() => setIsNewTicketOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-mono text-white/50 uppercase mb-2 block">Subject</label>
                <input 
                  required
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50" 
                  placeholder="E.g., Issue with course video playback"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-white/50 uppercase mb-2 block">Priority</label>
                <select 
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-mono text-white/50 uppercase mb-2 block">Message</label>
                <textarea 
                  required
                  rows={4}
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 resize-none" 
                  placeholder="Describe your issue in detail..."
                />
              </div>
              <div className="pt-2 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function MessageSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
