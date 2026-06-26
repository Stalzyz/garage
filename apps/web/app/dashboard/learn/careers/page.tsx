"use client"

import { useState, useEffect } from "react"
import { Briefcase, Building, MapPin, DollarSign, Clock, Send, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function CareerPortalPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mockUserId, setMockUserId] = useState<string | null>(null)
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null)
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Fetch mock user ID for testing
    fetch('http://localhost:4000/api/v1/auth/me')
      .then(res => res.json())
      .catch(() => {
        fetch('http://localhost:4000/api/v1/lms/assignments/mock-context')
          .then(res => res.json())
          .then(data => {
            if (data.studentId) setMockUserId(data.studentId)
          })
      })

    fetch('http://localhost:4000/api/v1/academy/jobs')
      .then(res => res.json())
      .then(data => {
        setJobs(data.data || [])
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  const handleApply = async (jobId: string) => {
    if (!mockUserId) return toast.error("User not authenticated")
    
    setApplyingJobId(jobId)
    try {
      const res = await fetch(`http://localhost:4000/api/v1/academy/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: mockUserId })
      })
      
      if (res.ok) {
        toast.success("Application submitted successfully!")
        setAppliedJobs(prev => new Set(prev).add(jobId))
      } else {
        toast.error("Failed to submit application.")
      }
    } catch (e) {
      toast.error("Network error.")
    } finally {
      setApplyingJobId(null)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-80px)]"><div className="animate-pulse w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#49ABC9]" /></div>
  }

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] overflow-y-auto font-sans selection:bg-[#CCF0FA] pb-24">
      <div className="bg-slate-900 text-white pt-16 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm font-bold text-white mb-6">
            <Briefcase className="w-4 h-4" /> Grekam Partner Network
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Exclusive Job Portal</h1>
          <p className="text-white/60 max-w-xl text-lg">Apply to open roles directly through your Academy profile. Your certificates and portfolio are automatically sent to the hiring managers.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => {
            const isApplied = appliedJobs.has(job.id)
            return (
              <div key={job.id} className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col shadow-sm hover:shadow-xl transition-shadow group relative overflow-hidden">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                  <Building className="w-6 h-6 text-slate-500 group-hover:text-[#49ABC9] transition-colors" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">{job.title}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                  <MapPin className="w-4 h-4" /> Remote / Flexible
                </div>
                
                <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-1">{job.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {job.requirements?.slice(0, 3).map((req: string, i: number) => (
                    <span key={i} className="text-xs font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded-md border border-slate-100">{req}</span>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-400">
                    <Clock className="w-3 h-3 inline mr-1" /> {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                  <button 
                    onClick={() => handleApply(job.id)}
                    disabled={isApplied || applyingJobId === job.id}
                    className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                      isApplied 
                        ? 'bg-green-50 text-green-600 border border-green-200' 
                        : 'bg-[#49ABC9] text-white hover:bg-[#398FA8] hover:shadow-lg hover:shadow-[#49ABC9]/20'
                    }`}
                  >
                    {isApplied ? (
                      <><CheckCircle2 className="w-4 h-4" /> Applied</>
                    ) : applyingJobId === job.id ? (
                      "Applying..."
                    ) : (
                      <><Send className="w-4 h-4" /> Easy Apply</>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {jobs.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Open Roles</h3>
            <p className="text-slate-500 max-w-md mx-auto">There are currently no partner job openings available. Keep building your portfolio and check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
