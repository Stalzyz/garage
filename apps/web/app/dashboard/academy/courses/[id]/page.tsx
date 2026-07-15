"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useApi, fetchApi } from "@/lib/useApi"
import { Loader2, ChevronLeft, PlayCircle, FileText, CheckCircle, Circle, Video, Lock } from "lucide-react"
import Link from "next/link"

export default function CoursePlayerPage() {
  const params = useParams()
  const courseId = params.id as string
  
  const { data, isLoading } = useApi<any>(`/lms/courses/${courseId}`)
  const lmsCourse = data?.course
  
  const [activeLesson, setActiveLesson] = useState<any>(null)
  
  useEffect(() => {
    // Auto-select first lesson if none selected
    if (lmsCourse && !activeLesson && lmsCourse.modules.length > 0) {
      const firstMod = lmsCourse.modules[0]
      if (firstMod.lessons.length > 0) {
        setActiveLesson(firstMod.lessons[0])
      }
    }
  }, [lmsCourse, activeLesson])

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-[#050505] text-white/50">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading Course Player...</p>
      </div>
    )
  }

  if (!lmsCourse) return null;

  const { course, modules } = lmsCourse

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/academy/courses" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">{course.name}</h1>
            <p className="text-xs text-white/50 font-mono">{course.code}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Player Area */}
        <div className="flex-1 overflow-auto custom-scrollbar flex flex-col bg-[#050505]">
          {activeLesson ? (
            <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
              {/* Video Player Placeholder */}
              <div className="w-full aspect-video bg-black border-b border-white/10 relative overflow-hidden group flex-none">
                {activeLesson.type === 'VIDEO' ? (
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <button className="w-20 h-20 rounded-full bg-blue-600/90 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_40px_rgba(37,99,235,0.4)]">
                      <PlayCircle className="w-10 h-10 ml-1" />
                    </button>
                    <p className="text-white/50 text-sm mt-4 font-mono uppercase tracking-widest">{activeLesson.duration || 0} mins</p>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center flex-col bg-white/5">
                    <FileText className="w-16 h-16 text-white/20 mb-4" />
                    <p className="text-white/50 text-sm font-mono uppercase tracking-widest">Document Lesson</p>
                  </div>
                )}
              </div>

              {/* Lesson Details */}
              <div className="p-10 flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-bold tracking-widest uppercase font-mono">
                    {activeLesson.type}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-6">{activeLesson.title}</h2>
                <div className="prose prose-invert max-w-none text-white/70 leading-relaxed text-sm">
                  {activeLesson.description ? (
                    <p>{activeLesson.description}</p>
                  ) : (
                    <p className="text-white/30 italic">No description provided for this lesson.</p>
                  )}
                  {activeLesson.richText && (
                    <div className="mt-8 pt-8 border-t border-white/10" dangerouslySetInnerHTML={{ __html: activeLesson.richText }} />
                  )}
                </div>
                
                <div className="mt-12 pt-8 border-t border-white/10 flex justify-end">
                  <button className="px-6 py-3 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-sm hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Mark as Complete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/30 flex-col">
              <PlayCircle className="w-16 h-16 mb-4 opacity-20" />
              <p>Select a lesson from the syllabus to begin</p>
            </div>
          )}
        </div>

        {/* Sidebar Syllabus */}
        <div className="w-80 bg-black/40 border-l border-white/10 flex flex-col flex-none">
          <div className="p-5 border-b border-white/10">
            <h3 className="text-sm font-bold tracking-wide uppercase text-white/50">Course Syllabus</h3>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar p-3 space-y-4">
            {modules.map((mod: any, mIdx: number) => (
              <div key={mod.id} className="space-y-1">
                <div className="px-3 py-2 text-xs font-bold text-white/80">
                  Section {mIdx + 1}: {mod.title}
                </div>
                <div className="space-y-0.5">
                  {mod.lessons.map((les: any, lIdx: number) => {
                    const isActive = activeLesson?.id === les.id
                    return (
                      <button
                        key={les.id}
                        onClick={() => setActiveLesson(les)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-3 transition-colors ${isActive ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                      >
                        <div className="mt-0.5 flex-none">
                          {isActive ? (
                            <PlayCircle className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-white/30" />
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-medium leading-tight mb-1 ${isActive ? 'text-blue-400' : 'text-white/80'}`}>{lIdx + 1}. {les.title}</p>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase">
                            {les.type === 'VIDEO' ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                            {les.type} {les.duration ? `• ${les.duration}m` : ''}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                  {mod.lessons.length === 0 && (
                    <div className="px-10 py-2 text-xs text-white/30 italic">No lessons in this section</div>
                  )}
                </div>
              </div>
            ))}
            {modules.length === 0 && (
              <div className="text-center py-10 text-white/40 text-sm">
                No syllabus available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
