"use client"

import { useState } from "react"
import { Search, Plus, MessageSquare, Clock, CheckCircle2, AlertCircle, Send, Paperclip, MoreVertical, X } from "lucide-react"

export default function SupportHub() {
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  
  const tickets = [
    { id: "T-8091", title: "Domain Transfer Issue", status: "open", priority: "high", lastUpdate: "10 mins ago", unread: true },
    { id: "T-8088", title: "Update Team Members on About Page", status: "in_progress", priority: "low", lastUpdate: "2 hours ago", unread: false },
    { id: "T-8042", title: "Stripe Webhook Failing", status: "resolved", priority: "critical", lastUpdate: "Oct 12", unread: false },
    { id: "T-8011", title: "Logo SVG format needed", status: "resolved", priority: "medium", lastUpdate: "Oct 10", unread: false },
  ]

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'open': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'in_progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'open': return <AlertCircle className="w-3 h-3" />
      case 'in_progress': return <Clock className="w-3 h-3" />
      case 'resolved': return <CheckCircle2 className="w-3 h-3" />
      default: return null
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      
      {/* Main Support Area */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col h-full">
        <div className="flex justify-between items-end mb-8 shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Support Hub</h1>
            <p className="text-slate-400">Raise requests, report bugs, and track resolutions.</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search tickets..." className="w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-violet-500 transition-colors" />
            </div>
            <button className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all flex items-center gap-2">
              <Plus className="w-5 h-5" /> New Ticket
            </button>
          </div>
        </div>

        {/* Tickets List */}
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-xs font-bold text-white/50 uppercase tracking-widest bg-black/20">
            <div className="col-span-6">Ticket Title</div>
            <div className="col-span-2">Ticket ID</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Last Update</div>
          </div>
          
          <div className="overflow-y-auto custom-scrollbar flex-1">
            {tickets.map(t => (
              <div 
                key={t.id} 
                onClick={() => setSelectedTicket(t)}
                className={`grid grid-cols-12 gap-4 p-4 border-b border-white/5 cursor-pointer items-center transition-colors hover:bg-white/5 ${selectedTicket?.id === t.id ? 'bg-violet-500/10' : ''}`}
              >
                <div className="col-span-6 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${t.unread ? 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]' : 'bg-transparent'}`}></div>
                  <div>
                    <p className={`text-sm ${t.unread ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>{t.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Priority: <span className="capitalize">{t.priority}</span></p>
                  </div>
                </div>
                <div className="col-span-2 text-sm text-slate-400 font-mono">{t.id}</div>
                <div className="col-span-2">
                  <span className={`flex items-center w-max gap-1.5 px-2.5 py-1 border rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(t.status)}`}>
                    {getStatusIcon(t.status)} {t.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-slate-400">{t.lastUpdate}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ticket Thread Side Panel */}
      {selectedTicket && (
        <div className="w-[450px] bg-[#0a0a0f] border-l border-white/5 flex flex-col shrink-0 relative">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0a0a0f] z-10">
            <div>
              <p className="text-xs text-slate-500 font-mono mb-1">{selectedTicket.id}</p>
              <h3 className="text-white font-bold">{selectedTicket.title}</h3>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
              <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            
            {/* Thread messages */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 shrink-0"></div>
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-bold text-white">John (You)</span>
                  <span className="text-xs text-slate-500">Oct 14, 09:00 AM</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl rounded-tl-none border border-white/5 text-sm text-slate-300">
                  Hi team, I'm trying to transfer the domain from GoDaddy but it says it's locked. Can someone check?
                </div>
              </div>
            </div>

            <div className="flex gap-4 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 shrink-0 shadow-lg shadow-violet-500/20 flex items-center justify-center">
                <span className="text-white font-bold text-xs">R</span>
              </div>
              <div className="items-end flex flex-col">
                <div className="flex items-baseline gap-2 mb-1 flex-row-reverse">
                  <span className="text-sm font-bold text-white">Support Team</span>
                  <span className="text-xs text-slate-500">10 mins ago</span>
                </div>
                <div className="p-3 bg-violet-600/20 rounded-xl rounded-tr-none border border-violet-500/20 text-sm text-slate-200">
                  Hi John! GoDaddy usually puts a 60-day lock on newly registered domains. Let me check the WHOIS record and I'll get back to you with the exact unlock date.
                </div>
              </div>
            </div>

          </div>

          {/* Reply Box */}
          {selectedTicket.status !== 'resolved' && (
            <div className="p-4 border-t border-white/5 bg-[#0a0a0f]">
              <div className="relative">
                <textarea 
                  placeholder="Type your reply..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pr-12 text-sm text-white outline-none focus:border-violet-500 transition-colors resize-none h-24 custom-scrollbar"
                ></textarea>
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>
                <button className="absolute bottom-3 right-3 p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors shadow-lg shadow-violet-500/20">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  )
}
