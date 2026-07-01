"use client"

import { useState } from "react"
import { Search, Plus, MessageSquare, Hash, Phone, Video, Send, Paperclip, MoreVertical, Settings, UserPlus, Smile, Search as SearchIcon } from "lucide-react"

export default function TeamChat() {
  const [activeChannel, setActiveChannel] = useState("#project-updates")

  const channels = [
    { id: 1, name: "#project-updates", unread: 3 },
    { id: 2, name: "#design-files", unread: 0 },
    { id: 3, name: "#billing-and-invoices", unread: 0 },
  ]

  const directMessages = [
    { id: 10, name: "Sarah (Design Lead)", status: "online", avatar: "S" },
    { id: 11, name: "Mike (Video)", status: "offline", avatar: "M" },
    { id: 12, name: "Elena (Project Mgr)", status: "online", avatar: "E" },
  ]

  return (
    <div className="flex h-full overflow-hidden bg-[#050508]">
      
      {/* Sidebar - Channels */}
      <div className="w-64 border-r border-white/5 flex flex-col shrink-0 bg-[#0a0a0f]">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-white font-bold text-lg">Team Chat</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-6">
          
          <div>
            <div className="flex justify-between items-center px-4 mb-2 group">
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">Channels</h3>
              <button className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="space-y-0.5">
              {channels.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setActiveChannel(c.name)}
                  className={`flex justify-between items-center px-4 py-2 mx-2 rounded-lg cursor-pointer transition-colors ${activeChannel === c.name ? 'bg-violet-600/20 text-violet-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'}`}
                >
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    <span className={`text-sm ${c.unread > 0 ? 'font-bold text-white' : ''}`}>{c.name.substring(1)}</span>
                  </div>
                  {c.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(139,92,246,0.5)]">
                      {c.unread}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center px-4 mb-2 group">
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">Direct Messages</h3>
              <button className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="space-y-0.5">
              {directMessages.map(user => (
                <div 
                  key={user.id}
                  onClick={() => setActiveChannel(user.name)}
                  className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-lg cursor-pointer transition-colors ${activeChannel === user.name ? 'bg-violet-600/20 text-violet-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'}`}
                >
                  <div className="relative">
                    <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                      {user.avatar}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0f] ${user.status === 'online' ? 'bg-emerald-500' : 'bg-transparent border border-slate-500'}`}></span>
                  </div>
                  <span className="text-sm truncate">{user.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Chat Header */}
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0f] shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-white font-bold text-lg">{activeChannel}</h2>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button className="hover:text-white transition-colors"><Phone className="w-5 h-5" /></button>
            <button className="hover:text-white transition-colors"><Video className="w-5 h-5" /></button>
            <div className="w-px h-6 bg-white/10"></div>
            <div className="relative">
              <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search..." className="w-48 pl-9 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-violet-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Today</span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>

          <div className="flex gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-bold text-white">Sarah (Design Lead)</span>
                <span className="text-xs text-slate-500">10:30 AM</span>
              </div>
              <p className="text-slate-300">Hey team, I've just uploaded the final version of the homepage design to the Asset Vault. John, let me know if those revisions hit the mark!</p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 text-slate-400 hover:text-white"><MoreVertical className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 shrink-0"></div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-bold text-white">John (You)</span>
                <span className="text-xs text-slate-500">10:45 AM</span>
              </div>
              <p className="text-slate-300">Looks perfect! I've approved the deliverable. Ready for dev handoff.</p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex">
              <button className="p-2 text-slate-400 hover:text-white"><Smile className="w-4 h-4" /></button>
            </div>
          </div>

        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5 bg-[#0a0a0f]">
          <div className="bg-white/5 border border-white/10 rounded-xl p-2 focus-within:border-violet-500 transition-colors">
            <textarea 
              placeholder={`Message ${activeChannel}...`}
              className="w-full bg-transparent p-2 text-white outline-none resize-none h-12 custom-scrollbar"
            ></textarea>
            <div className="flex justify-between items-center px-2 pt-2 border-t border-white/5">
              <div className="flex gap-2">
                <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Smile className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Hash className="w-4 h-4" />
                </button>
              </div>
              <button className="p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors shadow-lg shadow-violet-500/20">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
