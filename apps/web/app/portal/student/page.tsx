"use client"

import { PlayCircle, BookOpen, Award, Clock, ChevronRight } from "lucide-react"

export default function StudentPortalPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Student</h1>
        <p className="text-white/50 mt-2">Pick up where you left off and continue your learning journey.</p>
      </div>

      {/* Continue Learning Banner */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl p-8 relative overflow-hidden flex items-center justify-between">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">
            <PlayCircle className="w-4 h-4" /> Continue Learning
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Advanced UI/UX Motion Design</h2>
          <p className="text-white/60 text-sm mb-6">Module 4: Implementing Scroll-Driven Animations in React</p>
          
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            Resume Course <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Progress Circle (Visual Only) */}
        <div className="hidden md:flex relative z-10 w-32 h-32 rounded-full border-8 border-white/10 items-center justify-center">
          {/* Fake active border */}
          <div className="absolute inset-0 rounded-full border-8 border-blue-500 border-t-transparent border-r-transparent rotate-45" />
          <div className="text-2xl font-bold font-mono text-white">45%</div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* My Courses */}
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" /> Enrolled Courses
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Course Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="aspect-video bg-black/40 rounded-xl mb-4 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 mix-blend-overlay" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle className="w-10 h-10 text-white/50 group-hover:text-white transition-colors" />
                </div>
              </div>
              <h4 className="font-bold text-white text-sm mb-1 line-clamp-1">Advanced UI/UX Motion Design</h4>
              <p className="text-xs text-white/50 mb-4">Instructor: Sarah Jenkins</p>
              
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[45%]" />
              </div>
            </div>

            {/* Course Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="aspect-video bg-black/40 rounded-xl mb-4 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 mix-blend-overlay" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle className="w-10 h-10 text-white/50 group-hover:text-white transition-colors" />
                </div>
              </div>
              <h4 className="font-bold text-white text-sm mb-1 line-clamp-1">Figma to React Pro Workflow</h4>
              <p className="text-xs text-white/50 mb-4">Instructor: Mike Chen</p>
              
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[100%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Upcoming Assignments */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-amber-400" /> Upcoming
            </h3>
            
            <div className="space-y-4">
              <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                <div className="text-xs text-blue-400 font-bold mb-1">Assignment</div>
                <div className="text-sm font-bold text-white mb-2">Build a Parallax Hero Section</div>
                <div className="text-xs text-white/40 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Due in 2 days
                </div>
              </div>
            </div>
          </div>

          {/* Certificates */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-emerald-400" /> Certificates
            </h3>
            
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center cursor-pointer hover:bg-emerald-500/20 transition-colors">
              <Award className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-emerald-400">View 1 Earned Certificate</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
