"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, CheckCircle2, Circle, PlayCircle, FileText, ChevronDown, Award, Loader2, Trophy, Lock } from "lucide-react"
import Link from "next/link"
import Script from "next/script"
import { fetchApi } from "@/lib/useApi"
import { useCurrentUser } from "@/context/CurrentUserContext"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

export default function StudentLearnPage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<any>(null)
  const [progress, setProgress] = useState<Record<string, boolean>>({})
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)
  const [completionPct, setCompletionPct] = useState(0)
  const [enrollmentStatus, setEnrollmentStatus] = useState<'checking' | 'enrolled' | 'not_enrolled'>('checking')
  const [isEnrolling, setIsEnrolling] = useState(false)

  const { studentId } = useCurrentUser()

  const loadCourse = useCallback(async () => {
    try {
      const data = await fetchApi<any>(`/lms/courses/${params.courseId}`)
      if (data?.course) {
        setCourse(data.course)
        // Set the first lesson as active
        const firstLesson = data.course.modules?.[0]?.lessons?.[0]
        if (firstLesson) setActiveLessonId(firstLesson.id)
      }
    } catch (err) {
      console.error('Failed to fetch course', err)
    } finally {
      setIsLoading(false)
    }
  }, [params.courseId])

  const loadProgress = useCallback(async () => {
    try {
      if (!studentId) return
      const progressData = await fetchApi<any>(`/lms/enrollments/progress/${params.courseId}/${studentId}`)
      if (progressData?.progress) setCompletionPct(progressData.progress.completionPct || 0)
    } catch { /* ignore if course not in DB */ }
  }, [params.courseId, studentId])

  const checkEnrollment = useCallback(async () => {
    try {
      if (!studentId) {
        setEnrollmentStatus('not_enrolled')
        return
      }
      const data = await fetchApi<any>(`/lms/enrollments/check?studentId=${studentId}&courseId=${params.courseId}`)
      setEnrollmentStatus(data?.enrolled ? 'enrolled' : 'not_enrolled')
      if (data?.enrolled) {
        loadProgress()
      }
    } catch {
      setEnrollmentStatus('not_enrolled')
    }
  }, [params.courseId, studentId, loadProgress])

  useEffect(() => {
    if (studentId) {
      checkEnrollment().then(() => {
        loadCourse()
      })
    }
  }, [checkEnrollment, loadCourse, studentId])

  const handleEnroll = async () => {
    setIsEnrolling(true)
    try {
      if (!studentId) return

      const data = await fetchApi<any>('/lms/enrollments', {
        method: 'POST',
        body: JSON.stringify({ courseId: params.courseId, studentId: studentId })
      })
      
      if (data.requiresPayment) {
        const options = {
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: course?.name || "LMS Course",
          description: "Course Enrollment",
          order_id: data.orderId,
          handler: function (response: any) {
            // Once paid, wait for webhook or just optimistically unlock
            setTimeout(() => {
              setEnrollmentStatus('enrolled')
            }, 2000)
          },
          prefill: {
            name: "Student",
            email: "student@example.com"
          },
          theme: {
            color: "#8b5cf6"
          }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        setEnrollmentStatus('enrolled')
      }
    } catch (e) {
      console.error('Failed to enroll', e)
    } finally {
      setIsEnrolling(false)
    }
  }

  const handleMarkComplete = async () => {
    if (!activeLessonId || !studentId || isMarkingComplete) return
    setIsMarkingComplete(true)
    try {
      await fetchApi('/lms/enrollments/progress', {
        method: 'POST',
        body: JSON.stringify({
          studentId: studentId,
          courseId: params.courseId,
          lessonId: activeLessonId,
          isCompleted: true,
          watchedSecs: 0,
        })
      })
      // Optimistically update local state
      setProgress(prev => ({ ...prev, [activeLessonId]: true }))
      // Refresh completion percentage from server
      await loadProgress()

      // Auto-navigate to next lesson
      if (course) {
        const allLessons = course.modules.flatMap((m: any) => m.lessons)
        const currentIdx = allLessons.findIndex((l: any) => l.id === activeLessonId)
        if (currentIdx < allLessons.length - 1) {
          setActiveLessonId(allLessons[currentIdx + 1].id)
        }
      }
    } catch (err) {
      console.error('Failed to mark as complete:', err)
    } finally {
      setIsMarkingComplete(false)
    }
  }

  const handlePrevLesson = () => {
    if (!course || !activeLessonId) return
    const allLessons = course.modules.flatMap((m: any) => m.lessons)
    const currentIdx = allLessons.findIndex((l: any) => l.id === activeLessonId)
    if (currentIdx > 0) setActiveLessonId(allLessons[currentIdx - 1].id)
  }

  if (isLoading || enrollmentStatus === 'checking') {
    return (
      <div className="h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  // Fallback to mock data if course not in DB (for development)
  const displayCourse = course || {
    course: { name: "UI/UX Design Masterclass", fee: 0 },
    modules: [
      {
        id: "m1", title: "Module 1: Introduction to UI/UX",
        lessons: [
          { id: "l1", title: "Welcome to the course", type: "VIDEO", duration: 5 },
          { id: "l2", title: "The Design Process", type: "VIDEO", duration: 12 },
          { id: "l3", title: "Course Syllabus & Resources", type: "PDF", duration: 0 },
        ]
      },
      {
        id: "m2", title: "Module 2: Figma Basics",
        lessons: [
          { id: "l4", title: "Interface Overview", type: "VIDEO", duration: 15 },
          { id: "l5", title: "Working with Components", type: "VIDEO", duration: 20 },
          { id: "l6", title: "Component Practice", type: "ASSIGNMENT", duration: 0 },
        ]
      }
    ]
  }

  if (enrollmentStatus === 'not_enrolled') {
    return (
      <div className="h-screen flex items-center justify-center bg-[#050505] text-white flex-col">
        <Lock className="w-16 h-16 text-blue-500/50 mb-6" />
        <h1 className="text-3xl font-bold mb-4">{displayCourse.course?.name || "This Course"}</h1>
        <p className="text-white/60 mb-8 max-w-md text-center">You are not enrolled in this course yet. Enroll now to start learning.</p>
        <button 
          onClick={handleEnroll}
          disabled={isEnrolling}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] disabled:opacity-50 flex items-center gap-3"
        >
          {isEnrolling ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          {isEnrolling ? "Enrolling..." : `Enroll for ₹${displayCourse.course?.fee || 0}`}
        </button>
      </div>
    )
  }

  const allLessons = displayCourse.modules.flatMap((m: any) => m.lessons)
  const activeLesson = allLessons.find((l: any) => l.id === activeLessonId)
  const activeIdx = allLessons.findIndex((l: any) => l.id === activeLessonId)
  const isLessonCompleted = (id: string) => progress[id] || false
  const isCourseComplete = completionPct === 100

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="flex h-screen overflow-hidden bg-[#050505] text-white">
        
        {/* Sidebar Curriculum */}
        <div className="w-80 flex-none bg-[#0a0a0a] border-r border-white/10 flex flex-col">
        {/* Course Header */}
        <div className="p-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="font-bold text-lg mb-4">{displayCourse.course?.name || "Course"}</h1>
          
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-white/50">Your Progress</span>
              <span className={`font-bold ${completionPct === 100 ? 'text-emerald-400' : 'text-blue-400'}`}>{completionPct}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full shadow-lg transition-all duration-1000 ${completionPct === 100 ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-blue-500 shadow-blue-500/30'}`}
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="flex-1 overflow-y-auto">
          {displayCourse.modules.map((module: any) => (
            <div key={module.id} className="border-b border-white/5">
              <div className="p-4 bg-white/[0.02] flex justify-between items-center">
                <h2 className="font-bold text-sm text-white/70">{module.title}</h2>
                <ChevronDown className="w-4 h-4 text-white/30" />
              </div>
              <div className="flex flex-col py-1">
                {module.lessons.map((lesson: any) => {
                  const isActive = activeLessonId === lesson.id
                  const isDone = isLessonCompleted(lesson.id)
                  return (
                    <button 
                      key={lesson.id}
                      onClick={() => setActiveLessonId(lesson.id)}
                      className={`flex items-start gap-3 px-6 py-3 text-left transition-colors ${
                        isActive ? 'bg-blue-500/10 border-l-2 border-blue-500' : 'hover:bg-white/5 border-l-2 border-transparent'
                      }`}
                    >
                      <div className="mt-0.5 flex-none">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-white/20" />
                        )}
                      </div>
                      <div>
                        <div className={`text-sm font-medium leading-snug ${isActive ? 'text-blue-400' : isDone ? 'text-white/50 line-through' : 'text-white/70'}`}>
                          {lesson.title}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {lesson.type === 'VIDEO' && <PlayCircle className="w-3 h-3 text-white/30" />}
                          {lesson.type === 'PDF' && <FileText className="w-3 h-3 text-white/30" />}
                          <span className="text-[10px] text-white/30">{lesson.duration ? `${lesson.duration} min` : lesson.type}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full bg-black">
        {/* Video / Content Player Area */}
        <div className="flex-1 bg-zinc-950 flex items-center justify-center relative">
          {isCourseComplete ? (
            <div className="text-center p-12 max-w-lg mx-auto animate-in fade-in zoom-in duration-500">
              <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6 drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]" />
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Course Complete!</h1>
              <p className="text-white/60 text-lg mb-8">🎉 Congratulations! Your certificate is being generated and will be emailed to you shortly.</p>
              <Link href="/dashboard/lms" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-white/90 transition-colors">
                Back to My Courses
              </Link>
            </div>
          ) : activeLesson?.type === 'ASSIGNMENT' ? (
             <div className="w-full max-w-lg p-8 bg-black/40 border border-white/10 rounded-3xl mx-auto shadow-2xl">
               <h3 className="text-2xl font-bold mb-2">Project Submission</h3>
               <p className="text-white/50 mb-8 text-sm">Submit your Figma link or portfolio URL for this assignment.</p>
               <form 
                 onSubmit={async (e) => {
                   e.preventDefault();
                   const input = (e.target as any).elements.url.value;
                   if (input) {
                     await fetchApi('/lms/assignments/submit', {
                       method: 'POST',
                       body: JSON.stringify({
                         assignmentId: 'mock-assignment-123',
                         studentId: studentId,
                         submissionUrl: input
                       })
                     });
                     handleMarkComplete();
                     alert("Submitted successfully! The AI assistant will grade it shortly.");
                   }
                 }}
               >
                 <input 
                   name="url"
                   type="url"
                   required
                   placeholder="Paste your URL here (e.g. Figma link)"
                   className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 mb-4"
                 />
                 <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors">
                   Submit Work
                 </button>
               </form>
             </div>
          ) : activeLesson?.type === 'VIDEO' ? (
            <div className="w-full h-full flex items-center justify-center">
              {activeLesson?.videoId ? (
                <iframe
                  key={activeLesson.videoId}
                  src={`https://www.youtube-nocookie.com/embed/${activeLesson.videoId}?rel=0&modestbranding=1&autoplay=1`}
                  title={activeLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-6">
                    <PlayCircle className="w-12 h-12 text-blue-400" />
                  </div>
                  <p className="text-white/50 text-sm">Video Player</p>
                  <p className="text-white/25 text-xs mt-1">Cloudflare Stream · HLS Encrypted</p>
                </div>
              )}
            </div>
          ) : activeLesson?.type === 'PDF' ? (
            <div className="text-center">
              <FileText className="w-16 h-16 text-red-400/50 mx-auto mb-4" />
              <p className="text-white/40">PDF Resource Viewer</p>
            </div>
          ) : (
            <div className="text-center">
              <Award className="w-16 h-16 text-emerald-500/50 mx-auto mb-4" />
              <p className="text-white/40">Quiz Component</p>
            </div>
          )}
        </div>

        {/* Lesson Controls */}
        {!isCourseComplete && (
          <div className="h-24 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-between px-8">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white truncate">{activeLesson?.title}</h2>
              <p className="text-xs text-white/40 mt-1">Lesson {activeIdx + 1} of {allLessons.length}</p>
            </div>
            <div className="flex items-center gap-3 flex-none ml-4">
              <button 
                onClick={handlePrevLesson}
                disabled={activeIdx === 0}
                className="px-5 py-2.5 rounded-xl font-medium text-sm text-white/60 hover:bg-white/5 transition-colors border border-white/10 disabled:opacity-30"
              >
                Previous
              </button>
              <button 
                onClick={handleMarkComplete}
                disabled={isMarkingComplete || isLessonCompleted(activeLessonId || '')}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-500 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-60"
              >
                {isMarkingComplete ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : isLessonCompleted(activeLessonId || '') ? (
                  <><CheckCircle2 className="w-4 h-4" /> Completed</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Mark as Complete</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      </div>
    </>
  )
}
