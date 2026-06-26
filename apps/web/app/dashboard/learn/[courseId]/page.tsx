"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, PlayCircle, BookOpen, CheckCircle2, ChevronDown, ChevronRight, FileText } from "lucide-react"

export default function LMSVideoPlayer() {
  const { courseId } = useParams()
  const router = useRouter()
  
  const [course, setCourse] = useState<any>(null)
  const [activeLesson, setActiveLesson] = useState<any>(null)
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch(`http://localhost:4000/api/v1/lms/courses/${courseId}`)
      .then(res => res.json())
      .then(data => {
        setCourse(data.course)
        if (data.course?.modules?.length > 0) {
          // Expand first module by default
          setExpandedModules({ [data.course.modules[0].id]: true })
          // Set first lesson active
          if (data.course.modules[0].lessons?.length > 0) {
            setActiveLesson(data.course.modules[0].lessons[0])
          }
        }
      })
      .catch(console.error)
  }, [courseId])

  const toggleModule = (modId: string) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }))
  }

  if (!course) return <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-slate-900"><div className="animate-pulse w-12 h-12 rounded-full border-4 border-slate-700 border-t-[#49ABC9]" /></div>

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      
      {/* Sidebar: Curriculum */}
      <div className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0 h-[50vh] md:h-full">
        <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10 flex items-center gap-3">
          <Link href="/dashboard/learn" className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="font-bold text-slate-900 truncate">{course.course.name}</div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {course.modules?.map((mod: any, idx: number) => (
            <div key={mod.id} className="border-b border-slate-100">
              <button 
                onClick={() => toggleModule(mod.id)}
                className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 mb-1">Section {idx + 1}</span>
                  <span className="text-sm font-bold text-slate-900">{mod.title}</span>
                </div>
                {expandedModules[mod.id] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>
              
              {expandedModules[mod.id] && (
                <div className="py-2 bg-white divide-y divide-slate-50">
                  {mod.lessons?.map((lesson: any) => {
                    const isActive = activeLesson?.id === lesson.id
                    // Mock completion state for the first lesson if it's not active just to show UI
                    const isCompleted = lesson.sortOrder === 1 && !isActive
                    
                    return (
                      <button 
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`w-full p-4 flex gap-3 text-left transition-colors ${isActive ? 'bg-[#E5F4F8]' : 'hover:bg-slate-50'}`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                          ) : lesson.type === 'VIDEO' ? (
                            <PlayCircle className={`w-4 h-4 ${isActive ? 'text-[#49ABC9]' : 'text-slate-400'}`} />
                          ) : (
                            <FileText className={`w-4 h-4 ${isActive ? 'text-[#49ABC9]' : 'text-slate-400'}`} />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm ${isActive ? 'font-bold text-[#398FA8]' : 'text-slate-700'}`}>
                            {lesson.title}
                          </span>
                          {lesson.duration && <span className="text-xs text-slate-400 mt-1">{lesson.duration} min</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content: Video Player & Tabs */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50">
        {activeLesson ? (
          <>
            {/* The Player Area */}
            <div className="w-full bg-slate-900 aspect-video flex items-center justify-center relative shadow-inner">
              {activeLesson.type === 'VIDEO' ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Mock Video Thumbnail / Play Button */}
                    <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md cursor-pointer hover:bg-white/20 transition-all hover:scale-110">
                      <PlayCircle className="w-10 h-10 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white/50 text-xs font-mono">
                    <span>00:00 / {activeLesson.duration}:00</span>
                    <div className="flex gap-4">
                      <span>1x</span>
                      <span>HD</span>
                      <span>CC</span>
                      <span>[ ]</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-white text-center">
                  <FileText className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold">Document Viewer</h3>
                  <p className="text-slate-400 text-sm mt-2">Content URL: {activeLesson.contentUrl || 'Not provided'}</p>
                </div>
              )}
            </div>

            {/* Below Player Content */}
            <div className="flex-1 bg-white p-8">
              <h1 className="text-3xl font-black text-slate-900 mb-6">{activeLesson.title}</h1>
              
              {/* Tabs */}
              <div className="flex items-center gap-8 border-b border-slate-200 mb-8">
                <button className="px-1 py-4 border-b-2 border-[#49ABC9] text-[#49ABC9] font-bold text-sm">Overview</button>
                <button className="px-1 py-4 border-b-2 border-transparent text-slate-500 font-bold text-sm hover:text-slate-900">Resources (2)</button>
                <button className="px-1 py-4 border-b-2 border-transparent text-slate-500 font-bold text-sm hover:text-slate-900">Q&A</button>
              </div>

              {/* Tab Content */}
              <div className="prose prose-slate max-w-none">
                <p>{activeLesson.description || "This lesson covers the fundamental concepts required to master the module. Pay close attention to the examples provided in the video."}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12">
            <PlayCircle className="w-16 h-16 mb-4 text-slate-200" />
            <p>Select a lesson from the curriculum to start learning.</p>
          </div>
        )}
      </div>

    </div>
  )
}
