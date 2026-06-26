"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Clock, PlayCircle, BookOpen, GraduationCap, Layout, Video, Users } from "lucide-react"

export default function CourseDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [isEnrolling, setIsEnrolling] = useState(false)

  useEffect(() => {
    fetch(`/api/v1/lms/courses/${id}`)
      .then(res => res.json())
      .then(data => {
        setCourse(data.course)
      })
      .catch(console.error)
  }, [id])

  const handleEnroll = async () => {
    setIsEnrolling(true)
    try {
      // Mock checkout call
      const res = await fetch(`/api/v1/academy/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lmsCourseId: id })
      })
      if (res.ok) {
        router.push(`/dashboard/learn`)
      } else {
        alert("Failed to enroll")
        setIsEnrolling(false)
      }
    } catch (err) {
      console.error(err)
      setIsEnrolling(false)
    }
  }

  if (!course) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#49ABC9]" /></div>

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#CCF0FA]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link href="/academy" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#49ABC9] text-white flex items-center justify-center text-xs">G</span>
            Grekam Academy
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-[#49ABC9] text-xs font-bold mb-6">
              {course.course.code}
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">{course.course.name}</h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl">{course.course.description}</p>
            
            <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-400">
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {course.course.duration}</div>
              <div className="flex items-center gap-2"><PlayCircle className="w-4 h-4" /> {course.modules?.length || 0} Modules</div>
              <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Certificate of Completion</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Outcomes */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">What you'll learn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-8 rounded-2xl border border-slate-200">
              {course.outcomes.map((outcome: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#49ABC9] shrink-0 mt-0.5" />
                  <span className="text-slate-700">{outcome}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Curriculum */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Course Curriculum</h2>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {course.modules?.map((mod: any, idx: number) => (
                <div key={mod.id} className="border-b border-slate-100 last:border-0">
                  <div className="p-6 bg-slate-50 font-bold text-slate-900 flex justify-between items-center">
                    <span>Module {idx + 1}: {mod.title}</span>
                    <span className="text-sm font-normal text-slate-500">{mod.lessons?.length || 0} lectures</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {mod.lessons?.map((lesson: any) => (
                      <div key={lesson.id} className="p-4 px-6 flex items-center gap-4 text-slate-700">
                        {lesson.type === 'VIDEO' ? <PlayCircle className="w-4 h-4 text-slate-400" /> : <BookOpen className="w-4 h-4 text-slate-400" />}
                        <span className="text-sm">{lesson.title}</span>
                        {lesson.duration && <span className="ml-auto text-xs text-slate-400">{lesson.duration}m</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {(!course.modules || course.modules.length === 0) && (
                <div className="p-12 text-center text-slate-500">Curriculum is being updated.</div>
              )}
            </div>
          </section>
        </div>

        {/* Right Sticky Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden sticky top-28 transform -translate-y-32 z-10">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.course.name} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-slate-100 flex items-center justify-center"><Layout className="w-12 h-12 text-slate-300" /></div>
            )}
            <div className="p-8">
              <div className="text-4xl font-black text-slate-900 mb-6">₹{course.course.fee.toLocaleString('en-IN')}</div>
              <button 
                onClick={handleEnroll}
                disabled={isEnrolling}
                className="w-full py-4 bg-[#49ABC9] text-white font-bold rounded-xl text-lg hover:bg-[#398FA8] transition-colors mb-4 disabled:opacity-50"
              >
                {isEnrolling ? 'Processing...' : 'Enroll Now'}
              </button>
              <p className="text-xs text-center text-slate-500 mb-6">30-Day Money-Back Guarantee</p>
              
              <div className="space-y-4 text-sm text-slate-600">
                <div className="font-bold text-slate-900 mb-2">This course includes:</div>
                <div className="flex items-center gap-3"><Video className="w-4 h-4" /> 40+ hours on-demand video</div>
                <div className="flex items-center gap-3"><BookOpen className="w-4 h-4" /> Downloadable resources</div>
                <div className="flex items-center gap-3"><Users className="w-4 h-4" /> Mentor support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
