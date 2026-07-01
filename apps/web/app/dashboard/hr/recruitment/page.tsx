"use client"

import { useState } from "react"
import { Briefcase, Users, Plus, Calendar, Clock, Star, Mail, Phone, MoreHorizontal, ChevronRight, FileText } from "lucide-react"

export default function RecruitmentATS() {
  const [activeJob, setActiveJob] = useState("Full Stack Developer")
  
  const jobs = [
    { id: 1, title: "Full Stack Developer", applicants: 24, status: "OPEN" },
    { id: 2, title: "Brand Strategist", applicants: 12, status: "OPEN" },
    { id: 3, title: "UI/UX Designer", applicants: 8, status: "CLOSED" }
  ]

  // Mock Kanban data for the active job
  const board = {
    APPLIED: [
      { id: "c1", name: "Sarah Jenkins", role: "Frontend Dev", experience: "4 yrs", date: "2 days ago" },
      { id: "c2", name: "David Chen", role: "Full Stack", experience: "2 yrs", date: "3 days ago" },
    ],
    INTERVIEWING: [
      { id: "c3", name: "Michael Ross", role: "Software Eng", experience: "5 yrs", date: "1 week ago", nextInterview: "Tomorrow, 10 AM" },
    ],
    OFFERED: [
      { id: "c4", name: "Emma Watson", role: "Senior Dev", experience: "7 yrs", date: "2 weeks ago" },
    ]
  }

  return (
    <div className="flex flex-col h-full bg-[#050508] text-white overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-white/10 bg-[#0a0a0f] flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recruitment & ATS</h1>
          <p className="text-sm text-slate-400 mt-1">Manage job postings and candidate pipelines</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <Plus className="w-4 h-4" /> New Job Posting
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Job Postings */}
        <div className="w-72 border-r border-white/10 bg-[#0a0a0f] p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 px-2">Active Jobs</h3>
          
          {jobs.map(job => (
            <button 
              key={job.id}
              onClick={() => setActiveJob(job.title)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${activeJob === job.title ? 'bg-blue-600/10 border-blue-500/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-sm text-white">{job.title}</h4>
                <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${job.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-slate-400'}`}>
                  {job.status}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Users className="w-3.5 h-3.5" /> {job.applicants} Candidates
              </div>
            </button>
          ))}
        </div>

        {/* Main Content - Kanban Board */}
        <div className="flex-1 p-8 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-6 h-full min-w-max pb-4">
            
            {/* Column: APPLIED */}
            <div className="w-[320px] flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                  APPLIED <span className="bg-white/10 text-white/50 px-2 py-0.5 rounded-full text-xs">{board.APPLIED.length}</span>
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {board.APPLIED.map(c => (
                  <div key={c.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all cursor-grab active:cursor-grabbing group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-white text-sm">{c.name}</h4>
                        <p className="text-xs text-blue-400 font-medium">{c.role}</p>
                      </div>
                      <button className="text-white/30 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-4">
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {c.experience}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {c.date}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex gap-2">
                        <button className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-slate-400 hover:text-white"><Mail className="w-3.5 h-3.5" /></button>
                        <button className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-slate-400 hover:text-white"><FileText className="w-3.5 h-3.5" /></button>
                      </div>
                      <button className="text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 flex items-center gap-1">Review <ChevronRight className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column: INTERVIEWING */}
            <div className="w-[320px] flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                  INTERVIEWING <span className="bg-white/10 text-white/50 px-2 py-0.5 rounded-full text-xs">{board.INTERVIEWING.length}</span>
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {board.INTERVIEWING.map(c => (
                  <div key={c.id} className="bg-white/5 border border-blue-500/20 rounded-2xl p-4 hover:border-blue-500/40 transition-all cursor-grab active:cursor-grabbing group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-white text-sm">{c.name}</h4>
                        <p className="text-xs text-blue-400 font-medium">{c.role}</p>
                      </div>
                      <button className="text-white/30 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-2 mb-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Next Interview</p>
                      <p className="text-xs text-white">{c.nextInterview}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex gap-2">
                        <button className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-slate-400 hover:text-white"><Phone className="w-3.5 h-3.5" /></button>
                        <button className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-slate-400 hover:text-white"><FileText className="w-3.5 h-3.5" /></button>
                      </div>
                      <button className="text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 flex items-center gap-1">Scorecard <ChevronRight className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column: OFFERED */}
            <div className="w-[320px] flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  OFFERED <span className="bg-white/10 text-white/50 px-2 py-0.5 rounded-full text-xs">{board.OFFERED.length}</span>
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {board.OFFERED.map(c => (
                  <div key={c.id} className="bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/30 rounded-2xl p-4 hover:border-emerald-500/50 transition-all cursor-grab active:cursor-grabbing group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-white text-sm">{c.name}</h4>
                        <p className="text-xs text-emerald-400 font-medium">{c.role}</p>
                      </div>
                      <button className="text-white/30 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-4">
                      {[1,2,3,4,5].map(star => <Star key={star} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                      <span className="text-xs font-bold ml-1 text-white">Top Pick</span>
                    </div>

                    <button className="w-full py-2 bg-emerald-600/20 text-emerald-400 font-bold text-xs uppercase tracking-widest rounded-lg border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors">
                      Awaiting Signature
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column: HIRED */}
            <div className="w-[320px] flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                  HIRED <span className="bg-white/10 text-white/50 px-2 py-0.5 rounded-full text-xs">0</span>
                </h3>
              </div>
              
              <div className="flex-1 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                <Star className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm font-bold">No hires yet</p>
                <p className="text-xs mt-1">Drag candidates here to initiate onboarding sequence</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
