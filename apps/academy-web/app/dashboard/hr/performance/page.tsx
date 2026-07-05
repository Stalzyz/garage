"use client"

import { useState } from "react"
import { Target, TrendingUp, Award, Star, MessageSquare, ChevronDown, CheckCircle2, Circle } from "lucide-react"

export default function PerformanceManagement() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex flex-col h-full bg-[#050508] text-white overflow-y-auto custom-scrollbar font-sans">
      
      {/* Header */}
      <div className="flex-none px-8 py-8 border-b border-white/10 bg-[#0a0a0f]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Performance & Reviews</h1>
            <p className="text-sm text-slate-400 mt-2">Manage goals, skill progression, and 360-degree feedback</p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
              Self Assessment
            </button>
            <button className="px-5 py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-500 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              Schedule Review
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8">
          <button 
            onClick={() => setActiveTab("overview")}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'overview' ? 'text-violet-400' : 'text-slate-500 hover:text-white'}`}
          >
            Overview
            {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 shadow-[0_0_10px_rgba(124,58,237,0.5)]"></div>}
          </button>
          <button 
            onClick={() => setActiveTab("goals")}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'goals' ? 'text-violet-400' : 'text-slate-500 hover:text-white'}`}
          >
            Goals (Q3)
            {activeTab === 'goals' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 shadow-[0_0_10px_rgba(124,58,237,0.5)]"></div>}
          </button>
          <button 
            onClick={() => setActiveTab("feedback")}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'feedback' ? 'text-violet-400' : 'text-slate-500 hover:text-white'}`}
          >
            360 Feedback
            {activeTab === 'feedback' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 shadow-[0_0_10px_rgba(124,58,237,0.5)]"></div>}
          </button>
        </div>
      </div>

      <div className="p-8">
        
        {activeTab === 'overview' && (
          <div className="max-w-5xl mx-auto space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Employee Summary Card */}
              <div className="md:col-span-1 bg-white/5 border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <img src="https://ui-avatars.com/api/?name=Stalin+Kumar&background=6d28d9&color=fff" className="w-16 h-16 rounded-2xl" />
                  <div>
                    <h2 className="font-bold text-lg">Stalin Kumar</h2>
                    <p className="text-violet-400 text-sm font-medium">Senior Architect</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Overall Rating (2025)</p>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black text-white">4.8</span>
                      <span className="text-sm text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +0.2
                      </span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {[1,2,3,4].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                      <div className="relative">
                        <Star className="w-4 h-4 text-amber-400/30" />
                        <div className="absolute inset-0 overflow-hidden" style={{ width: '80%' }}>
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-sm transition-colors">
                    Download Full Report (PDF)
                  </button>
                </div>
              </div>

              {/* Skill Radar Chart Mock */}
              <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center">
                <h3 className="absolute top-6 left-8 font-bold uppercase tracking-widest text-slate-400 text-xs">Skill Matrix (Spider Web)</h3>
                
                {/* CSS purely visual mock of a radar chart */}
                <div className="relative w-64 h-64 mt-4">
                  {/* Concentric hexagons/circles */}
                  <div className="absolute inset-4 rounded-full border border-white/10"></div>
                  <div className="absolute inset-12 rounded-full border border-white/10"></div>
                  <div className="absolute inset-20 rounded-full border border-white/10 bg-white/5"></div>
                  
                  {/* Axes lines */}
                  <div className="absolute inset-y-0 left-1/2 w-[1px] bg-white/10 -translate-x-1/2"></div>
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/10 -translate-y-1/2"></div>
                  <div className="absolute inset-0 border-l border-white/10 rotate-45 transform origin-center opacity-50"></div>
                  <div className="absolute inset-0 border-l border-white/10 -rotate-45 transform origin-center opacity-50"></div>

                  {/* Polygon shape */}
                  <svg className="absolute inset-0 w-full h-full text-violet-500/30" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polygon points="50,15 85,35 75,80 30,85 10,40" fill="currentColor" stroke="#8b5cf6" strokeWidth="2" className="drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                  </svg>
                  
                  {/* Labels */}
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white tracking-widest uppercase">Technical</span>
                  <span className="absolute top-1/2 -right-16 -translate-y-1/2 text-[10px] font-bold text-white tracking-widest uppercase">Leadership</span>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white tracking-widest uppercase">Communication</span>
                  <span className="absolute top-1/2 -left-14 -translate-y-1/2 text-[10px] font-bold text-white tracking-widest uppercase">Delivery</span>
                </div>
              </div>
            </div>

            {/* Recent Feedback Stream */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" /> Recent Shoutouts & Feedback
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">SM</div>
                    <div>
                      <p className="text-sm font-bold text-white">Sarah Miller (Design Lead)</p>
                      <p className="text-xs text-slate-500">2 days ago</p>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Stalin did an incredible job architecting the new CRM modules. The speed and quality of delivery completely exceeded our expectations. Great leadership in guiding the junior devs!
                  </p>
                </div>
                
                <div className="bg-black/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">JR</div>
                    <div>
                      <p className="text-sm font-bold text-white">James Rogers (CTO)</p>
                      <p className="text-xs text-slate-500">Last week</p>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Solid quarter. We should focus more on writing comprehensive documentation for the backend endpoints moving forward, but the code itself is spotless.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
