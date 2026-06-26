"use client"

import { useState, useEffect } from "react"
import { Hash, MessageSquare, Plus, Search, Send, Phone, Video, Info, Paperclip, Smile } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { format } from "date-fns"
import { useWebSocket } from "@/components/providers/WebSocketProvider"

export default function ChatPage() {
  const { data, mutate, isLoading } = useApi<any>("/chat/channels")
  const channels = data?.channels || []

  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  const activeChannel = channels.find((c: any) => c.id === activeChannelId)
  const { data: messagesData, mutate: mutateMessages } = useApi<any>(activeChannelId ? `/chat/channels/${activeChannelId}/messages` : null)
  const messages = messagesData?.messages || []

  // Real-time listener
  useEffect(() => {
    const handleWsMessage = (e: any) => {
      const data = e.detail;
      if (data.type === 'NEW_CHAT_MESSAGE' && data.payload.channelId === activeChannelId) {
        mutateMessages();
      }
    };
    window.addEventListener('ws-message', handleWsMessage);
    return () => window.removeEventListener('ws-message', handleWsMessage);
  }, [activeChannelId, mutateMessages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !activeChannelId) return
    try {
      await fetchApi(`/chat/channels/${activeChannelId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: message })
      })
      setMessage("")
      mutateMessages()
    } catch (err: any) {
      console.error("Failed to send message")
    }
  }

  return (
    <div className="flex h-full bg-[#050505] text-white overflow-hidden border-t border-white/10">
      
      {/* Sidebar - Channels & DMs */}
      <div className="w-64 flex flex-col border-r border-white/10 bg-black/40">
        
        {/* Workspace Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-bold tracking-tight">Grekam Internal</h2>
          <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
          
          <div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 px-2 flex items-center justify-between">
              Channels <Plus className="w-3 h-3 cursor-pointer hover:text-white" />
            </div>
            <div className="space-y-1">
              {channels.filter((c: any) => c.type === 'GROUP').map((c: any) => (
                <div 
                  key={c.id} 
                  onClick={() => setActiveChannelId(c.id)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors ${activeChannelId === c.id ? 'bg-blue-600 text-white' : 'text-white/70 hover:bg-white/10'}`}
                >
                  <Hash className="w-3.5 h-3.5 opacity-50" />
                  <span className="truncate">{c.name}</span>
                </div>
              ))}
              {/* Mock channels if none exist */}
              {channels.length === 0 && (
                <>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm text-white/70 hover:bg-white/10">
                    <Hash className="w-3.5 h-3.5 opacity-50" /> general
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm text-white/70 hover:bg-white/10">
                    <Hash className="w-3.5 h-3.5 opacity-50" /> engineering
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 px-2 flex items-center justify-between">
              Direct Messages <Plus className="w-3 h-3 cursor-pointer hover:text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm text-white/70 hover:bg-white/10">
                <div className="relative">
                  <div className="w-5 h-5 rounded bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-[10px] font-bold">JD</div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-black" />
                </div>
                <span className="truncate">John Doe</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm text-white/70 hover:bg-white/10">
                <div className="relative">
                  <div className="w-5 h-5 rounded bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-[10px] font-bold">AS</div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full border border-black" />
                </div>
                <span className="truncate">Alice Smith</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed relative">
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
        
        <div className="relative z-10 h-full flex flex-col">
          {!activeChannelId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white/40">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a channel or conversation to start chatting</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-white/50" />
                  <h2 className="font-bold">{activeChannel?.name || 'general'}</h2>
                </div>
                <div className="flex items-center gap-4 text-white/50">
                  <Phone className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
                  <Video className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
                  <Info className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                
                {messages.length === 0 ? (
                  <div className="text-center text-white/30 text-sm mt-10">No messages yet. Say hi!</div>
                ) : (
                  messages.map((msg: any) => (
                    <div key={msg.id} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center font-bold">
                        {msg.sender?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">{msg.sender?.name || 'Unknown'}</span>
                          <span className="text-[10px] text-white/40 font-mono">
                            {format(new Date(msg.createdAt), 'h:mm a')}
                          </span>
                        </div>
                        <div className="text-sm text-white/80 leading-relaxed">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))
                )}

              </div>

              {/* Input Area */}
              <div className="p-4 bg-black/40 backdrop-blur-xl border-t border-white/10">
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-blue-500/50 transition-colors flex items-end p-2">
                  <button className="p-2 text-white/40 hover:text-white transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                  <textarea 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={`Message #${activeChannel?.name || 'general'}`}
                    className="flex-1 bg-transparent p-2 text-sm focus:outline-none resize-none max-h-32 custom-scrollbar"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <div className="flex items-center gap-1 p-1">
                    <button className="p-2 text-white/40 hover:text-white transition-colors">
                      <Smile className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  )
}
