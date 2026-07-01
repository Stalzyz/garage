"use client"

import { useState } from "react"
import { PlayCircle, CheckCircle2, Circle, Upload, MessageSquare, Menu, BookOpen, Star, Trophy, ChevronRight, Play } from "lucide-react"

export default function StudentLmsPortal() {
  const [activeModule, setActiveModule] = useState(0)
  const [activeLesson, setActiveLesson] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Mock Course Data
  const course = {
    title: "Mastering Brand Strategy",
    instructor: "Stalin Kumar",
    progress: 35,
    modules: [
      {
        id: 0,
        title: "Introduction to Brand Identity",
        lessons: [
          { id: 0, title: "Welcome to the Course", duration: "05:20", completed: true },
          { id: 1, title: "The Psychology of Colors", duration: "18:45", completed: false },
          { id: 2, title: "Typography Fundamentals", duration: "22:10", completed: false },
        ]
      },
      {
        id: 1,
        title: "Designing for the Web",
        lessons: [
          { id: 3, title: "Responsive Layouts", duration: "35:00", completed: false },
          { id: 4, title: "UI Components Library", duration: "28:15", completed: false },
        ]
      },
      {
        id: 2,
        title: "Final Assignment",
        lessons: [
          { id: 5, title: "Project Brief & Submission", duration: "10:00", completed: false, isAssignment: true },
        ]
      }
    ]
  }

  return (
    <div className="flex h-screen bg-[#020202] text-white font-sans overflow-hidden">
      
      {/* Sidebar (Course Navigation) */}
      <div className={`transition-all duration-300 ease-in-out border-r border-white/5 bg-[#050508] flex flex-col ${sidebarOpen ? 'w-80' : 'w-0 opacity-0 overflow-hidden'}`}>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-widest uppercase text-white/90">Grekam Academy</span>
          </div>
          
          <h2 className="font-black text-lg leading-tight mb-2">{course.title}</h2>
          <p className="text-xs text-slate-400 mb-4">Instructor: {course.instructor}</p>
          
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs mb-2 font-bold">
              <span className="text-violet-400">{course.progress}% Completed</span>
              <span className="text-slate-500"><Trophy className="w-3.5 h-3.5 inline mb-0.5"/></span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-1.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          {course.modules.map((mod) => (
            <div key={mod.id}>
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-3 ml-2">{mod.title}</h3>
              <div className="space-y-1">
                {mod.lessons.map((lesson) => {
                  const isActive = activeModule === mod.id && activeLesson === lesson.id
                  return (
                    <button 
                      key={lesson.id}
                      onClick={() => { setActiveModule(mod.id); setActiveLesson(lesson.id) }}
                      className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all ${
                        isActive 
                          ? 'bg-violet-500/10 border border-violet-500/20 text-white' 
                          : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="mt-0.5">
                        {lesson.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : lesson.isAssignment ? (
                          <Upload className={`w-4 h-4 ${isActive ? 'text-fuchsia-400' : 'text-slate-600'}`} />
                        ) : (
                          <PlayCircle className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-slate-600'}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isActive ? 'font-bold' : ''}`}>{lesson.title}</p>
                        <p className="text-[10px] uppercase font-bold tracking-wider mt-1 opacity-50">{lesson.duration}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-black relative">
        
        {/* Top Navbar */}
        <div className="h-16 absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors pointer-events-auto"
          >
            <Menu className="w-4 h-4" />
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold text-white hover:bg-white/20 transition-colors pointer-events-auto">
            <MessageSquare className="w-3.5 h-3.5" /> Ask Instructor
          </button>
        </div>

        {/* Cinematic Video Player */}
        <div className="flex-1 relative flex items-center justify-center group">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20"></div>
          
          {/* Mock Player UI */}
          <div className="relative z-10 flex flex-col items-center">
            <button className="w-24 h-24 rounded-full bg-violet-600/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-violet-500 hover:scale-110 transition-all shadow-[0_0_40px_rgba(124,58,237,0.5)]">
              <Play className="w-10 h-10 ml-2" />
            </button>
            <h2 className="text-3xl font-black mt-8 tracking-tight">The Psychology of Colors</h2>
            <p className="text-slate-300 mt-2">Module 1 • Lesson 2</p>
          </div>

          {/* Player Controls (Bottom) */}
          <div className="absolute bottom-0 left-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black to-transparent">
            <div className="w-full bg-white/20 h-1 rounded-full cursor-pointer overflow-hidden">
              <div className="bg-violet-500 h-full w-1/3"></div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs font-mono font-bold text-white/50">06:12 / 18:45</span>
              <div className="flex gap-4">
                {/* Icons */}
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Details Panel */}
        <div className="h-64 bg-[#0a0a0f] border-t border-white/5 p-8 overflow-y-auto custom-scrollbar flex shrink-0">
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-12">
            
            <div className="md:col-span-2 space-y-6">
              <h3 className="text-2xl font-bold">About this lesson</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                In this lesson, we dive deep into the psychology of colors and how they impact user behavior in brand identity and web design. You will learn the historical context of color theory and how to apply modern HSL values to create harmonious palettes that evoke specific emotions.
              </p>
              
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors">
                  Download Assets (ZIP)
                </button>
                <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors">
                  View Transcript
                </button>
              </div>
            </div>

            <div className="md:col-span-1 border-l border-white/10 pl-12 space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Your Skill Matrix</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white">Color Theory</span>
                      <span className="text-emerald-400 font-bold">Lvl 3</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full"><div className="bg-emerald-500 h-1 w-3/4 rounded-full"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white">Typography</span>
                      <span className="text-amber-400 font-bold">Lvl 1</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full"><div className="bg-amber-500 h-1 w-1/4 rounded-full"></div></div>
                  </div>
                </div>
              </div>
              
              <button className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                Mark as Complete
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
