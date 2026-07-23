"use client"

import { useApi } from "@/lib/useApi"
import { Video, Plus, Loader2, Users, Calendar, Clock } from "lucide-react"

export default function OnsiteLiveSessionsPage() {
  const { data: sessions, isLoading } = useApi<any[]>("/academy/demo-sessions")

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
          <button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 font-bold px-6 py-3 rounded-xl transition-colors">
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
                <button className="text-rose-400 hover:text-rose-300 font-bold text-sm flex items-center gap-1 transition-colors">
                  Join Room
                </button>
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
    </div>
  )
}
