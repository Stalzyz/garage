"use client"

import { useState } from "react"
import { Search, Plus, MoreHorizontal, Sparkles, UploadCloud, Calendar, UserCheck, Star, BrainCircuit } from "lucide-react"

// Mock Data
const CANDIDATES = [
  { id: "c1", name: "David Kim", role: "Senior Frontend Engineer", stage: "NEW", score: null, applied: "2 hours ago" },
  { id: "c2", name: "Elena Rostova", role: "UI/UX Instructor", stage: "SCREENING", score: 92, applied: "1 day ago" },
  { id: "c3", name: "Marcus Johnson", role: "Sales Executive", stage: "SCREENING", score: 45, applied: "1 day ago" },
  { id: "c4", name: "Aisha Patel", role: "Senior Frontend Engineer", stage: "INTERVIEW", score: 88, applied: "3 days ago" },
  { id: "c5", name: "Tom Baker", role: "Junior Designer", stage: "OFFER", score: 75, applied: "1 week ago" },
]

const STAGES = [
  { id: "NEW", label: "New Applied", color: "border-slate-500" },
  { id: "SCREENING", label: "AI Screening", color: "border-blue-500" },
  { id: "INTERVIEW", label: "Interviewing", color: "border-amber-500" },
  { id: "OFFER", label: "Offer Extended", color: "border-emerald-500" },
]

export default function ATSDashboard() {
  const [search, setSearch] = useState("")
  const [isParsing, setIsParsing] = useState(false)

  const handleParseMock = () => {
    setIsParsing(true)
    setTimeout(() => {
      setIsParsing(false)
      alert("AI Parsing Complete! 3 new candidates matched.")
    }, 2500)
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Applicant Tracking <Sparkles className="w-5 h-5 text-primary" />
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage hiring pipeline with AI-powered resume screening.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleParseMock}
              disabled={isParsing}
              className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-bold border border-primary/20 hover:bg-primary/20 transition-all disabled:opacity-50"
            >
              {isParsing ? (
                <><BrainCircuit className="w-4 h-4 animate-pulse" /> Parsing Resumes...</>
              ) : (
                <><UploadCloud className="w-4 h-4" /> Upload & Parse Resumes</>
              )}
            </button>
            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
              <Plus className="w-4 h-4" /> Add Candidate
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-2">
            {["All Roles", "Senior Frontend Engineer", "UI/UX Instructor", "Sales Executive"].map(role => (
              <button key={role} className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${role === "All Roles" ? "bg-foreground text-background border-foreground" : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted"}`}>
                {role}
              </button>
            ))}
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search candidates..."
              className="w-full bg-muted/50 border border-border/50 rounded-lg pl-9 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex h-full gap-6 min-w-max">
          {STAGES.map(stage => {
            const columnCandidates = CANDIDATES.filter(c => c.stage === stage.id && (search === "" || c.name.toLowerCase().includes(search.toLowerCase())))
            
            return (
              <div key={stage.id} className="w-80 flex flex-col h-full">
                {/* Column Header */}
                <div className={`px-4 py-3 bg-muted/30 border-t-2 rounded-t-xl ${stage.color} border-x border-x-border/50 flex items-center justify-between`}>
                  <h3 className="font-bold text-sm text-foreground">{stage.label}</h3>
                  <span className="text-xs font-bold text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border/50">
                    {columnCandidates.length}
                  </span>
                </div>
                
                {/* Column Body */}
                <div className="flex-1 bg-muted/10 border-x border-b border-border/50 rounded-b-xl p-3 overflow-y-auto space-y-3">
                  {columnCandidates.map(candidate => (
                    <div key={candidate.id} className="bg-card border border-border/50 rounded-xl p-4 shadow-sm cursor-pointer hover:border-primary/50 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-foreground text-sm">{candidate.name}</h4>
                        <button className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">{candidate.role}</p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <span className="text-[10px] text-muted-foreground font-mono">{candidate.applied}</span>
                        
                        {candidate.score ? (
                          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded border ${
                            candidate.score >= 80 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            candidate.score >= 60 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}>
                            <Sparkles className="w-3 h-3" /> {candidate.score}% Match
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 uppercase">
                            Needs Scan
                          </span>
                        )}
                      </div>

                      {/* Quick Actions overlay */}
                      <div className="mt-3 flex gap-2 hidden group-hover:flex">
                        {stage.id === 'NEW' && (
                          <button className="flex-1 bg-primary text-primary-foreground text-xs font-bold py-1.5 rounded flex items-center justify-center gap-1">
                            <BrainCircuit className="w-3 h-3" /> AI Screen
                          </button>
                        )}
                        {stage.id === 'SCREENING' && candidate.score && candidate.score >= 80 && (
                          <button className="flex-1 bg-amber-500 text-white text-xs font-bold py-1.5 rounded flex items-center justify-center gap-1">
                            <Calendar className="w-3 h-3" /> Schedule
                          </button>
                        )}
                        {stage.id === 'INTERVIEW' && (
                          <button className="flex-1 bg-emerald-500 text-white text-xs font-bold py-1.5 rounded flex items-center justify-center gap-1">
                            <UserCheck className="w-3 h-3" /> Extend Offer
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {columnCandidates.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center text-xs text-muted-foreground opacity-50">
                      Drop candidates here
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
