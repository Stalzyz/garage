"use client"
import { useState, useRef, useEffect } from "react"
import { PlayCircle, FileText, CheckCircle2, Circle, MessageSquare, X, Send, Sparkles, Play, Lock, Loader2 } from "lucide-react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useApi, fetchApi } from "@/lib/useApi"
import { useCurrentUser } from "@/context/CurrentUserContext"

import Script from "next/script"

export default function CoursePlayerPage() {
  const params = useParams()
  const courseId = params.id as string

  const { data: courseData, isLoading } = useApi<any>(`/lms/courses/${courseId}`)
  const course = courseData?.course

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [activeLessonData, setActiveLessonData] = useState<any>(null)
  
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hi! I'm your AI Teaching Assistant. I have context on this lesson. What do you need help with?" }
  ])
  const [isAiTyping, setIsAiTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { studentId } = useCurrentUser()
  const [enrollmentStatus, setEnrollmentStatus] = useState<'checking' | 'enrolled' | 'not_enrolled'>('checking')
  const [isEnrolling, setIsEnrolling] = useState(false)

  useEffect(() => {
    if (course && course.modules && course.modules.length > 0 && !activeLessonId) {
      const firstModule = course.modules[0];
      if (firstModule.lessons && firstModule.lessons.length > 0) {
        setActiveLessonId(firstModule.lessons[0].id);
      }
    }
  }, [course, activeLessonId])

  useEffect(() => {
    if (activeLessonId) {
      fetchApi(`/lms/lessons/${activeLessonId}`).then((res: any) => {
        setActiveLessonData(res.lesson);
      }).catch(console.error);
    }
  }, [activeLessonId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isAiTyping])

  useEffect(() => {
    if (courseId && studentId) {
      fetchApi<any>(`/lms/enrollments/check?studentId=${studentId}&courseId=${courseId}`)
        .then(res => setEnrollmentStatus(res.enrolled ? 'enrolled' : 'not_enrolled'))
        .catch(() => setEnrollmentStatus('not_enrolled'))
    } else if (courseId && !studentId) {
      setEnrollmentStatus('not_enrolled')
    }
  }, [courseId, studentId])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessage.trim()) return

    const newMessages = [...messages, { role: "user", content: chatMessage }]
    setMessages(newMessages)
    setChatMessage("")
    setIsAiTyping(true)

    setTimeout(() => {
      let aiReply = "That's a great question about the current lesson content. In a real environment, I would provide a specific AI-generated answer here!"
      setMessages([...newMessages, { role: "ai", content: aiReply }])
      setIsAiTyping(false)
    }, 1500)
  }

  if (isLoading || enrollmentStatus === 'checking') {
    return (
      <div className="flex h-full items-center justify-center bg-[#050505] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex h-full items-center justify-center bg-[#050505] text-white">
        Course not found.
      </div>
    )
  }

  const courseTitle = course.course?.title || "Course"

  const handleEnroll = async () => {
    setIsEnrolling(true)
    try {
      if (!studentId) {
        return
      }

      const data = await fetchApi<any>('/lms/enrollments', {
        method: 'POST',
        body: JSON.stringify({ courseId, studentId: studentId })
      })
      
      if (data.requiresPayment) {
        const options = {
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: course.course?.name || "LMS Course",
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



  if (enrollmentStatus === 'not_enrolled') {
    return (
      <>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <div className="flex h-full items-center justify-center bg-[#050505] text-white flex-col">
          <Lock className="w-16 h-16 text-violet-500/50 mb-6" />
          <h1 className="text-3xl font-bold mb-4">{course.course?.name || "This Course"}</h1>
          <p className="text-white/60 mb-8 max-w-md text-center">You are not enrolled in this course yet. Enroll now to get full access to all modules, resources, and the AI teaching assistant.</p>
          <button 
            onClick={handleEnroll}
            disabled={isEnrolling}
            className="px-8 py-4 bg-violet-600 hover:bg-violet-500 rounded-2xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)] disabled:opacity-50 flex items-center gap-3"
          >
            {isEnrolling ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {isEnrolling ? "Enrolling..." : `Enroll for ₹${course.course?.fee || 0}`}
          </button>
        </div>
      </>
    )
  }

  return (
    <div className="flex h-full min-h-0 relative bg-[#050505] text-white overflow-hidden">
      <div className="absolute top-0 right-[20%] w-[40%] h-[40%] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-80 border-r border-white/10 bg-black/40 backdrop-blur-md overflow-y-auto custom-scrollbar flex flex-col relative z-10">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-bold text-white tracking-tight">{courseTitle}</h2>
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-[9px] font-mono tracking-widest uppercase font-bold text-white/50">
              <span>Progress</span>
              <span className="text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">45%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "45%" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)] rounded-full" 
              />
            </div>
          </div>
        </div>
        
        <div className="p-0 flex-1">
          {course.modules.map((mod: any, mIdx: number) => (
            <div key={mod.id} className="border-b border-white/5">
              <div className="px-6 py-4 bg-white/5 text-[10px] font-mono tracking-widest uppercase font-bold text-white/50 border-b border-white/5">
                Module {mIdx + 1}: {mod.title}
              </div>
              <div className="flex flex-col">
                {mod.lessons.map((lesson: any, lIdx: number) => {
                  const isActive = activeLessonId === lesson.id;
                  return (
                    <button 
                      key={lesson.id}
                      onClick={() => setActiveLessonId(lesson.id)}
                      className={`flex items-start gap-4 px-6 py-4 transition-all hover:bg-white/5 relative overflow-hidden ${isActive ? 'bg-white/5' : ''}`}
                    >
                      {isActive && (
                        <motion.div layoutId="active-lesson" className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                      )}
                      {isActive 
                        ? <Play className="h-4 w-4 mt-0.5 text-violet-400 fill-violet-400 drop-shadow-[0_0_5px_rgba(139,92,246,0.8)] shrink-0 animate-pulse" />
                        : <CheckCircle2 className="h-4 w-4 mt-0.5 text-white/20 shrink-0" />
                      }
                      <div className="text-left">
                        <p className={`text-sm font-medium transition-colors ${isActive ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]' : 'text-white/70 group-hover:text-white'}`}>
                          {lIdx + 1}. {lesson.title}
                        </p>
                        <p className="text-[10px] font-mono tracking-widest flex items-center mt-1 text-white/40">
                          <PlayCircle className="h-3 w-3 mr-1.5" /> 10:00
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-transparent flex flex-col relative">
        <div className="w-full aspect-video bg-black flex items-center justify-center relative flex-none shadow-2xl border-b border-white/5 overflow-hidden">
          {activeLessonData?.videoId ? (
            <iframe
              key={activeLessonData.videoId}
              src={`https://www.youtube-nocookie.com/embed/${activeLessonData.videoId}?rel=0&modestbranding=1&autoplay=1`}
              title={activeLessonData.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-violet-500/20 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform hover:bg-violet-500/30 group">
                <Play className="h-8 w-8 text-violet-400 fill-violet-400 group-hover:drop-shadow-[0_0_15px_rgba(139,92,246,0.8)] ml-1" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-8 text-white z-10">
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-violet-400 mb-2 block drop-shadow-[0_0_5px_rgba(139,92,246,0.5)]">
                  {activeLessonData?.module?.title}
                </span>
                <h3 className="text-2xl font-bold tracking-tight">{activeLessonData?.title}</h3>
                <p className="text-xs text-white/40 mt-1">No video attached yet. Educator can add a YouTube link.</p>
              </div>
            </>
          )}
        </div>
        
        <div className="p-10 max-w-4xl mx-auto flex-1 w-full relative z-10">
          <div className="prose prose-invert prose-p:text-white/60 prose-headings:text-white max-w-none">
            <p className="text-lg leading-relaxed">{activeLessonData?.content || "No content provided."}</p>
            
            <h3 className="text-lg font-bold mt-10 mb-4">Resources</h3>
            <div className="grid grid-cols-2 gap-4">
              <a href="#" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform"><FileText className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm font-bold text-white">Exercise File</p>
                  <p className="text-[10px] font-mono tracking-widest uppercase text-white/40">Figma (.fig)</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform"><FileText className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm font-bold text-white">Cheat Sheet</p>
                  <p className="text-[10px] font-mono tracking-widest uppercase text-white/40">PDF Document</p>
                </div>
              </a>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-white/10 flex justify-between">
            <button className="px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-xs font-mono font-bold uppercase tracking-widest transition-all">
              &larr; Previous Lesson
            </button>
            <button className="px-6 py-3 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-xl hover:bg-violet-500/30 text-xs font-mono font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              Mark Complete & Next &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* AI Teaching Assistant Chat Widget */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
        {/* Chat Window */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-80 h-[500px] bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] mb-4 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-white/5 border-b border-white/10 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 border border-violet-500/30 shadow-[inset_0_0_10px_rgba(139,92,246,0.2)] relative">
                    <Sparkles className="w-4 h-4 relative z-10" />
                    <div className="absolute inset-0 bg-violet-500/20 animate-ping rounded-full" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">AI Assistant</h3>
                    <p className="text-[9px] font-mono text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)] uppercase tracking-widest font-bold mt-0.5">Online</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-white/40 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
                {messages.map((msg, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-violet-500/20 text-white border border-violet-500/30 rounded-br-sm shadow-[0_0_15px_rgba(139,92,246,0.1)]' 
                        : 'bg-white/5 text-white/80 rounded-bl-sm border border-white/10'
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {isAiTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-white/5 text-white rounded-2xl rounded-bl-sm px-4 py-4 border border-white/10 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10 bg-black/40">
                <form onSubmit={handleSendMessage} className="relative flex items-center">
                  <input 
                    type="text" 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask a question..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-colors font-mono"
                  />
                  <button 
                    type="submit"
                    disabled={!chatMessage.trim() || isAiTyping}
                    className="absolute right-2 p-2 text-violet-400 hover:bg-violet-500/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 border ${
            isChatOpen 
              ? 'bg-white/5 text-white/50 border-white/10' 
              : 'bg-violet-500/20 text-violet-400 border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:bg-violet-500/30'
          }`}
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>
    </div>
  )
}
