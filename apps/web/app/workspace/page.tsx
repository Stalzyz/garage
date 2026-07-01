"use client"

import { useState, useEffect } from "react"
import { Activity, AlertTriangle, CheckCircle2, ChevronRight, Clock, CreditCard, Download, FileText, MessageSquare, PlayCircle, Plus, Sparkles, Video } from "lucide-react"

export default function MissionControl() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/workspace/dashboard')
      .then(res => res.json())
      .then(json => {
        setData(json.data)
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-20">
        <div className="animate-pulse w-8 h-8 rounded-full border-4 border-slate-200 border-t-violet-500" />
      </div>
    )
  }

  const { project, financials, activity, upcomingMeeting } = data || {}

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* 1. Header & AI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">Mission Control</h1>
          <p className="text-slate-400">Welcome back, John. Here is your daily project intelligence.</p>
          
          <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-violet-600/10 to-blue-600/10 border border-violet-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-blue-500"></div>
            <div className="flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <div className="space-y-4">
                <p className="text-white text-lg font-medium">Good Morning. You have <span className="text-violet-400 font-bold">2 actions required</span> today.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs text-white/50 uppercase tracking-widest font-bold">Yesterday</p>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300">Designer completed Homepage V5.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-white/50 uppercase tracking-widest font-bold">Risk Level: Low</p>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300">Brand guidelines PDF not received yet. Required for UI Phase.</p>
                    </div>
                  </div>
                </div>
                <div className="pt-2 flex gap-3">
                  <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                    Approve Homepage
                  </button>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors border border-white/10">
                    Upload Guidelines
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting & Quick Actions */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-widest font-bold mb-1">Upcoming Meeting</p>
                <h3 className="text-white font-semibold">Website Review Sync</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Video className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300 mb-6">
              <Clock className="w-4 h-4 text-slate-500" />
              Tomorrow, 11:00 AM EST
            </div>
            <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors text-center">
              Join Google Meet
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Project Progress */}
        <div className="p-6 rounded-2xl bg-[#0a0a0f] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] group-hover:bg-emerald-500/10 transition-colors"></div>
          <p className="text-xs text-white/50 uppercase tracking-widest font-bold mb-2">Active Project</p>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-white">{project?.name || "No Active Projects"}</h2>
            <span className="text-3xl font-black text-emerald-400">{project?.progress || 0}%</span>
          </div>
          
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-emerald-500 rounded-full relative" style={{ width: `${project?.progress || 0}%` }}>
              <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/30"></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Next Milestone</p>
              <p className="text-white text-sm font-medium">{project?.nextPhase || 'All complete'}</p>
            </div>
            <div className="text-emerald-400 text-sm font-bold">Due Friday</div>
          </div>
        </div>

        {/* Financial Snapshot */}
        <div className="p-6 rounded-2xl bg-[#0a0a0f] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px] group-hover:bg-rose-500/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs text-white/50 uppercase tracking-widest font-bold mb-2">Pending Invoice</p>
              <h2 className="text-3xl font-black text-white">₹{financials?.pendingAmount?.toLocaleString() || '0'}</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{financials?.pendingInvoiceId || 'None'}</span>
              <span className="text-rose-400 font-medium">{financials?.dueDate ? new Date(financials.dueDate).toLocaleDateString() : ''}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Paid to date</span>
              <span className="text-white font-medium">₹{financials?.totalPaid?.toLocaleString() || '0'}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-xl transition-colors">
              Pay Now
            </button>
            <button className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Visual Timeline & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Timeline */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0a0a0f] border border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-white">Project Timeline</h3>
            <button className="text-xs font-bold text-violet-400 hover:text-violet-300">View Full Schedule &rarr;</button>
          </div>

          <div className="space-y-6">
            {(project?.phases || []).map((item: any) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="flex justify-between text-sm mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${item.status === 'completed' ? 'bg-emerald-500' : item.status === 'active' ? 'bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'bg-slate-700'}`}></span>
                    <span className={`font-bold ${item.status === 'pending' ? 'text-slate-500' : 'text-white'}`}>{item.name}</span>
                  </div>
                  <span className={`font-medium ${item.status === 'completed' ? 'text-emerald-400' : item.status === 'active' ? 'text-violet-400' : 'text-slate-600'}`}>{item.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${item.status === 'completed' ? 'bg-emerald-500' : 'bg-violet-500 group-hover:bg-violet-400'}`} 
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="p-6 rounded-2xl bg-[#0a0a0f] border border-white/5 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
          
          <div className="flex-1 space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-white/10 before:to-transparent">
            
            {[
              { title: "Designer uploaded Homepage V5", time: "2 hours ago", icon: <FileText className="w-4 h-4 text-violet-400" />, dot: "bg-violet-500" },
              { title: "You approved Branding Phase", time: "Yesterday", icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, dot: "bg-emerald-500" },
              { title: "Invoice INV-2026-041 Paid", time: "Oct 12", icon: <CreditCard className="w-4 h-4 text-blue-400" />, dot: "bg-blue-500" },
              { title: "Developer joined project", time: "Oct 10", icon: <Activity className="w-4 h-4 text-slate-400" />, dot: "bg-slate-500" },
            ].map((feed, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#0a0a0f] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10">
                  {feed.icon}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-sm font-medium text-white mb-1">{feed.title}</p>
                  <p className="text-xs text-slate-500">{feed.time}</p>
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  )
}
