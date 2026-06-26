"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PlayCircle, Trophy, BookOpen, Clock, ArrowRight } from "lucide-react"

export default function StudentLMSDashboard() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [certificates, setCertificates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch enrollments with credentials
    fetch('/api/v1/academy/enrollments/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setEnrollments(data.data || [])
        setIsLoading(false)
      })
      .catch(err => {
        console.error("Error fetching enrollments:", err)
        setIsLoading(false)
      })

    // Fetch certificates with credentials
    fetch('/api/v1/academy/certificates', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setCertificates(data.data || [])
      })
      .catch(err => {
        console.error("Error fetching certificates:", err)
      })
  }, [])

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">My Learning</h1>
          <p className="text-slate-500">Pick up where you left off and track your progress.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <div className="animate-pulse w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#49ABC9]" />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">You aren't enrolled in any courses yet!</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Explore the academy to find the perfect course to advance your career.</p>
            <Link href="/academy" className="px-6 py-3 bg-[#49ABC9] text-white rounded-xl font-bold hover:bg-[#398FA8] transition-colors inline-block">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enrollments.map((enrollment) => {
              const lms = enrollment.batch.course.lmsCourse
              return (
                <div key={enrollment.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col">
                  <div className="h-48 relative overflow-hidden bg-slate-100">
                    {lms?.thumbnail && (
                      <img src={lms.thumbnail} alt="thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#49ABC9]">{enrollment.batch.name}</span>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {enrollment.batch.course.duration}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-2">
                      {enrollment.batch.course.name}
                    </h3>
                    
                    {/* Progress Bar (Mocked) */}
                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-bold">
                        <span>Course Progress</span>
                        <span>15%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
                        <div className="h-full bg-[#49ABC9] rounded-full" style={{ width: '15%' }} />
                      </div>

                      <Link 
                        href={`/dashboard/learn/${lms?.id}`}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                      >
                        Resume Learning <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Certificates Section */}
      {certificates.length > 0 && (
        <div className="pt-8 border-t border-slate-200">
          <div className="mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-black text-slate-900">My Certificates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div key={cert.id} className="bg-gradient-to-br from-amber-500/5 to-yellow-500/10 border border-amber-200/60 rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-4 -mt-4 pointer-events-none" />
                
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mb-2">
                    <Trophy className="w-4 h-4" /> Certified Graduate
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{cert.course.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {cert.certificateId} {cert.grade ? `| Grade: ${cert.grade}` : ''}</p>
                </div>
                
                <div className="mt-6 flex items-center justify-between border-t border-slate-200/60 pt-4">
                  <span className="text-xs text-slate-400">
                    Issued {new Date(cert.issuedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/verify/${cert.id}`}
                      className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all"
                    >
                      Verify
                    </Link>
                    <a
                      href={`/api/v1/academy/certificates/${cert.id}/download`}
                      download
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm shadow-amber-500/10"
                    >
                      Download PDF
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
