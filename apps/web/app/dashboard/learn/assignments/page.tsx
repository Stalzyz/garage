"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CheckCircle2, Clock, Upload, Link as LinkIcon, FileText } from "lucide-react"

export default function StudentAssignmentsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeUrl, setActiveUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null)
  
  const [mockContext, setMockContext] = useState<any>(null)
  
  const fetchSubmissions = (studentId: string) => {
    fetch(`http://localhost:4000/api/v1/lms/assignments/student/${studentId}`)
      .then(res => res.json())
      .then(data => {
        setSubmissions(data.submissions || [])
        setIsLoading(false)
      })
      .catch(console.error)
  }

  useEffect(() => {
    fetch('http://localhost:4000/api/v1/lms/assignments/mock-context')
      .then(res => res.json())
      .then(data => {
        setMockContext(data)
        if (data.studentId) {
          fetchSubmissions(data.studentId)
        } else {
          setIsLoading(false)
        }
      })
  }, [])

  const handleSubmit = async (assignmentId: string) => {
    if (!activeUrl) return alert("Please enter a URL (Figma, GitHub, or Drive link)")
    
    setIsSubmitting(assignmentId)
    try {
      const res = await fetch(`http://localhost:4000/api/v1/lms/assignments/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          studentId: mockContext.studentId,
          submissionUrl: activeUrl
        })
      })
      if (res.ok) {
        alert("Assignment submitted! The Matrix AI is grading it...")
        setActiveUrl("")
        fetchSubmissions(mockContext.studentId)
      } else {
        const errorData = await res.json()
        alert(`Failed to submit: ${errorData.message || "Invalid URL or Server Error"}`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(null)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">My Assignments</h1>
          <p className="text-slate-500">Submit your projects and view educator feedback.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Mock unsubmitted assignment for testing */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-start shadow-sm">
          <div className="bg-orange-50 text-orange-500 p-4 rounded-xl shrink-0">
            <FileText className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-orange-500 mb-1">DUE IN 2 DAYS</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{mockContext?.assignment?.title || "Build a SAAS Landing Page"}</h3>
            <p className="text-sm text-slate-500 mb-4 max-w-2xl">{mockContext?.assignment?.brief || "Create a high-converting landing page for a fictional AI startup. You must use Next.js, Tailwind CSS, and Framer Motion."}</p>
            
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl max-w-lg flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-slate-400" />
              <input 
                type="url" 
                placeholder="Paste your Figma or GitHub URL here..." 
                className="bg-transparent border-none outline-none flex-1 text-sm font-medium"
                value={activeUrl}
                onChange={e => setActiveUrl(e.target.value)}
              />
              <button 
                onClick={() => handleSubmit(mockContext?.assignmentId)}
                disabled={isSubmitting === mockContext?.assignmentId || !mockContext?.assignmentId}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 disabled:opacity-50"
              >
                {isSubmitting === mockContext?.assignmentId ? "Sending..." : "Submit"}
              </button>
            </div>
          </div>
        </div>

        {/* Render Submitted Assignments */}
        {submissions.map((sub) => (
          <div key={sub.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-start shadow-sm">
            <div className={`p-4 rounded-xl shrink-0 ${sub.status === 'GRADED' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
              {sub.status === 'GRADED' ? <CheckCircle2 className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className={`text-xs font-bold ${sub.status === 'GRADED' ? 'text-green-500' : 'text-blue-500'}`}>{sub.status}</div>
                <div className="text-xs text-slate-400">{new Date(sub.submittedAt).toLocaleDateString()}</div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{sub.assignment?.title || "Project Submission"}</h3>
              
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-4">
                <LinkIcon className="w-4 h-4" />
                <a href={sub.linkUrl} target="_blank" className="text-[#49ABC9] hover:underline truncate max-w-md">
                  {sub.linkUrl}
                </a>
              </div>

              {sub.status === 'GRADED' && (
                <div className="bg-[#F2F9FB] border border-[#49ABC9]/20 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[#49ABC9]">Grade: {sub.grade}/100</span>
                  </div>
                  <p className="text-sm text-slate-700">{sub.feedback}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
