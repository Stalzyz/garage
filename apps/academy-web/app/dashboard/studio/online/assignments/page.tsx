"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Download,
  ExternalLink,
  MessageSquare,
  Award,
  ChevronRight,
  FileText,
  CheckSquare
} from "lucide-react"

type SubmissionStatus = "UNDER_REVIEW" | "GRADED" | "RESUBMIT_REQUESTED"

interface Submission {
  id: string
  studentName: string
  avatar: string
  course: string
  assignmentTitle: string
  submittedAt: string
  status: SubmissionStatus
  grade?: number
  feedback?: string
}

const mockSubmissions: Submission[] = [
  {
    id: "sub-1",
    studentName: "Alex Johnson",
    avatar: "bg-blue-500",
    course: "Advanced Web Architecture",
    assignmentTitle: "Final Project: E-Commerce Store",
    submittedAt: "2 hours ago",
    status: "UNDER_REVIEW"
  },
  {
    id: "sub-2",
    studentName: "Samantha Reed",
    avatar: "bg-pink-500",
    course: "UI/UX Masterclass",
    assignmentTitle: "Wireframing the Dashboard",
    submittedAt: "5 hours ago",
    status: "UNDER_REVIEW"
  },
  {
    id: "sub-3",
    studentName: "David Chen",
    avatar: "bg-emerald-500",
    course: "Advanced Web Architecture",
    assignmentTitle: "API Design Document",
    submittedAt: "1 day ago",
    status: "GRADED",
    grade: 92,
    feedback: "Excellent work on the rate-limiting section."
  }
]

export default function AssignmentsReview() {
  const [activeSub, setActiveSub] = useState<Submission | null>(mockSubmissions[0])
  const [gradeInput, setGradeInput] = useState<string>("")
  const [feedbackInput, setFeedbackInput] = useState<string>("")

  return (
    <div className="h-full flex bg-[#050505] text-white overflow-hidden">
      
      {/* Left List Pane */}
      <div className="w-1/3 border-r border-white/10 bg-[#0a0a0a] flex flex-col shrink-0">
        
        {/* Header & Filters */}
        <div className="p-6 border-b border-white/10 space-y-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Assessments</h1>
            <p className="text-sm text-white/50">Review and grade student submissions.</p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1 group/input">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within/input:text-purple-400" />
              <input 
                type="text" 
                placeholder="Search students..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>
            <button className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {mockSubmissions.map((sub) => (
            <div 
              key={sub.id}
              onClick={() => setActiveSub(sub)}
              className={`p-4 rounded-2xl cursor-pointer transition-all border \${
                activeSub?.id === sub.id 
                  ? "bg-purple-500/10 border-purple-500/30 text-white" 
                  : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full \${sub.avatar} opacity-80`} />
                  <div>
                    <h3 className="text-sm font-bold">{sub.studentName}</h3>
                    <p className="text-xs text-white/50">{sub.submittedAt}</p>
                  </div>
                </div>
                {sub.status === "UNDER_REVIEW" ? (
                  <span className="w-2 h-2 rounded-full bg-yellow-400 mt-2 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                )}
              </div>
              <div className="text-xs font-semibold text-purple-400 mb-1">{sub.course}</div>
              <div className="text-sm truncate">{sub.assignmentTitle}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Review Pane */}
      <div className="flex-1 bg-[#050505] flex flex-col relative">
        {activeSub ? (
          <>
            {/* Header */}
            <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md">
              <div>
                <h2 className="text-xl font-bold tracking-tight">{activeSub.assignmentTitle}</h2>
                <div className="flex items-center gap-2 text-sm text-white/50 mt-1">
                  <span>{activeSub.studentName}</span>
                  <span>•</span>
                  <span>{activeSub.course}</span>
                </div>
              </div>
              
              {activeSub.status === "GRADED" && (
                <div className="px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center gap-2 text-sm font-bold">
                  <Award className="w-4 h-4" /> Graded: {activeSub.grade}/100
                </div>
              )}
            </header>

            <div className="flex-1 overflow-y-auto p-8 lg:p-12">
              <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Submission Content */}
                <section>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" /> Submitted Files
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">architecture_diagram.pdf</div>
                          <div className="text-xs text-white/40">2.4 MB</div>
                        </div>
                      </div>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400">
                          <ExternalLink className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Live Project URL</div>
                          <div className="text-xs text-white/40">vercel.app</div>
                        </div>
                      </div>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </section>

                {/* Grading Area */}
                <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Assessment & Feedback
                  </h3>
                  
                  {activeSub.status === "GRADED" ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-sm text-white/50 mb-1">Feedback provided</div>
                        <p className="text-white text-sm leading-relaxed">{activeSub.feedback}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-white/70 ml-1">Grade (0-100)</label>
                          <input 
                            type="number" 
                            value={gradeInput}
                            onChange={(e) => setGradeInput(e.target.value)}
                            placeholder="e.g. 95" 
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-xl font-bold focus:outline-none focus:ring-1 focus:ring-purple-500/50" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-white/70 ml-1">Quick Rubric</label>
                          <select className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 appearance-none">
                            <option value="">Select template...</option>
                            <option value="perfect">Perfect (100) - Met all criteria</option>
                            <option value="good">Good (85) - Minor issues</option>
                            <option value="pass">Pass (70) - Bare minimum</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-white/70 ml-1">Detailed Feedback</label>
                        <textarea 
                          rows={5}
                          value={feedbackInput}
                          onChange={(e) => setFeedbackInput(e.target.value)}
                          placeholder="Provide constructive feedback for the student..." 
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none text-sm" 
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-4">
                        <button className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                          Submit Grade & Feedback
                        </button>
                        <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors">
                          Request Resubmission
                        </button>
                      </div>

                    </div>
                  )}
                </section>

              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white/30 text-center">
            <CheckSquare className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-semibold">Select a submission from the list <br/> to begin reviewing.</p>
          </div>
        )}
      </div>
    </div>
  )
}
