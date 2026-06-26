"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CheckCircle2, Clock, Upload, Link as LinkIcon, FileText, User, X, Save, Loader2 } from "lucide-react"
import { fetchApi } from "@/lib/useApi"

export default function EducatorAssignmentsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Grading Modal State
  const [gradingSub, setGradingSub] = useState<any | null>(null)
  const [grade, setGrade] = useState("")
  const [feedback, setFeedback] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const fetchSubmissions = async () => {
    try {
      const data = await fetchApi<any>('/lms/assignments')
      const allSubs = data.assignments?.flatMap((a: any) => 
        (a.submissions || []).map((s: any) => ({ ...s, assignment: a }))
      ) || []
      
      allSubs.sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      setSubmissions(allSubs)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const handleSaveGrade = async () => {
    if (!gradingSub) return
    setIsSaving(true)
    try {
      await fetchApi(`/lms/assignments/submissions/${gradingSub.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          grade: parseInt(grade),
          feedback,
          status: 'GRADED'
        })
      })
      setGradingSub(null)
      fetchSubmissions()
    } catch (e) {
      console.error('Failed to save grade', e)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Educator Portal: Grading</h1>
          <p className="text-white/50">Review student submissions and assign grades.</p>
        </div>
        <div className="px-4 py-2 bg-white/10 rounded-lg text-sm font-bold text-white/80">
          {submissions.filter(s => s.status === 'SUBMITTED').length} Pending Review
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
           <div className="flex justify-center py-12"><div className="animate-pulse w-8 h-8 rounded-full border-4 border-white/20 border-t-violet-500" /></div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-24 text-white/50">No submissions found.</div>
        ) : submissions.map((sub) => (
          <div key={sub.id} className="bg-white/5 rounded-2xl border border-white/10 p-6 flex flex-col md:flex-row gap-6 items-start shadow-sm">
            <div className={`p-4 rounded-xl shrink-0 ${sub.status === 'GRADED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
              {sub.status === 'GRADED' ? <CheckCircle2 className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className={`text-xs font-bold ${sub.status === 'GRADED' ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {sub.status === 'GRADED' ? 'GRADED' : 'NEEDS GRADING'}
                </div>
                <div className="text-xs text-white/40">{new Date(sub.submittedAt).toLocaleString()}</div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1">{sub.assignment?.title || "Project Submission"}</h3>
              <div className="text-sm text-white/50 flex items-center gap-2 mb-4 font-mono">
                <User className="w-4 h-4" /> Student ID: {sub.studentId}
              </div>
              
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 mb-4">
                <div className="text-xs font-bold text-white/40 mb-2">SUBMITTED WORK</div>
                <div className="flex items-center gap-2 text-sm text-white/80 font-medium">
                  <LinkIcon className="w-4 h-4" />
                  <a href={sub.linkUrl} target="_blank" rel="noreferrer" className="text-violet-400 hover:underline truncate">
                    {sub.linkUrl}
                  </a>
                </div>
              </div>

              {sub.status === 'GRADED' ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-emerald-400">Final Grade: {sub.grade}/100</span>
                    <button 
                      onClick={() => { setGradingSub(sub); setGrade(sub.grade?.toString() || ""); setFeedback(sub.feedback || ""); }}
                      className="text-xs text-emerald-400/70 hover:text-emerald-400 underline"
                    >
                      Edit Grade
                    </button>
                  </div>
                  <p className="text-sm text-emerald-400/90"><strong>Feedback:</strong> {sub.feedback}</p>
                </div>
              ) : (
                <div className="flex gap-4">
                   <button 
                     onClick={() => { setGradingSub(sub); setGrade(""); setFeedback(""); }}
                     className="px-6 py-2 bg-violet-600 text-white rounded-lg text-sm font-bold hover:bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                   >
                     Grade Manually
                   </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Grading Modal */}
      {gradingSub && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Grade Submission</h2>
              <button onClick={() => setGradingSub(null)} className="text-white/40 hover:text-white p-2"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase mb-2">Score (0-100)</label>
                <input 
                  type="number" 
                  min="0" max="100"
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50"
                  placeholder="e.g. 95"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase mb-2">Feedback</label>
                <textarea 
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 resize-none"
                  placeholder="Provide constructive feedback..."
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => setGradingSub(null)}
                className="px-6 py-3 rounded-xl font-bold text-white/50 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveGrade}
                disabled={isSaving || !grade}
                className="px-6 py-3 rounded-xl font-bold bg-violet-600 text-white hover:bg-violet-500 transition-colors flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
