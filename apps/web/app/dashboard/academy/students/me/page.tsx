"use client"

import { useApi } from "@/lib/useApi"
import { Loader2, Flame, Award, Clock, BookOpen, ChevronRight, PlayCircle, Star, Target } from "lucide-react"
import Link from "next/link"

export default function StudentDashboardPage() {
  const { data, isLoading } = useApi<any>("/lms/enrollments/my")

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-[#050505] text-white/50">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading Your Profile...</p>
      </div>
    )
  }

  // Fallback to empty if not enrolled in anything
  const enrollments = data?.enrollments || []
  const totalCourses = data?.totalCourses || 0
  const certificatesEarned = data?.certificatesEarned || 0
  const totalWatchedSecs = data?.totalWatchedSecs || 0

  const hoursWatched = Math.floor(totalWatchedSecs / 3600)
  const minutesWatched = Math.floor((totalWatchedSecs % 3600) / 60)

  // Mocking learning streak for gamification
  const learningStreak = 4

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header Profile Section */}
      <div className="flex-none px-8 py-8 border-b border-white/10 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">My Learning Profile</h1>
            <p className="text-sm text-white/70">Welcome back! Keep up the great work.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(255,153,0,0.1)]">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Day Streak</p>
              <p className="text-2xl font-black text-amber-500">{learningStreak} <span className="text-sm font-medium text-white/70">Days</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Analytics Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <BookOpen className="w-8 h-8 text-blue-400 mb-3" />
                <p className="text-3xl font-black">{totalCourses}</p>
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/50 mt-1">Enrolled Courses</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <Clock className="w-8 h-8 text-purple-400 mb-3" />
                <p className="text-3xl font-black">{hoursWatched}<span className="text-sm text-white/50">h</span> {minutesWatched}<span className="text-sm text-white/50">m</span></p>
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/50 mt-1">Time Spent Learning</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <Award className="w-8 h-8 text-emerald-400 mb-3" />
                <p className="text-3xl font-black">{certificatesEarned}</p>
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/50 mt-1">Certificates Earned</p>
              </div>
            </div>

            {/* In Progress Courses */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" /> Currently Learning
              </h2>
              <div className="space-y-4">
                {enrollments.length === 0 ? (
                  <div className="text-center py-10 bg-white/5 border border-dashed border-white/10 rounded-2xl text-white/50 text-sm">
                    You aren't enrolled in any courses yet.
                  </div>
                ) : (
                  enrollments.map((enr: any) => (
                    <div key={enr.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row gap-6 items-center">
                      <div className="w-full md:w-48 h-32 bg-black/60 rounded-xl overflow-hidden relative shrink-0">
                        {enr.course.thumbnail ? (
                          <img src={enr.course.thumbnail} alt={enr.course.name} className="w-full h-full object-cover opacity-60" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/40 to-slate-900/40">
                            <BookOpen className="w-8 h-8 text-white/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PlayCircle className="w-12 h-12 text-white/80 drop-shadow-lg" />
                        </div>
                      </div>
                      
                      <div className="flex-1 w-full">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold">{enr.course.name}</h3>
                          <span className="text-xs font-mono font-bold text-white/50 bg-black/40 px-2 py-1 rounded-md">{enr.completedLessons}/{enr.totalLessons} Lessons</span>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-6">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${enr.completionPct}%` }} />
                          </div>
                          <span className="text-sm font-bold text-blue-400 w-10 text-right">{enr.completionPct}%</span>
                        </div>
                        
                        <Link 
                          href={`/dashboard/academy/courses/${enr.course.id}`} 
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                        >
                          {enr.completionPct === 0 ? "Start Course" : "Resume Learning"} <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
          </div>
          
          {/* Sidebar Area */}
          <div className="space-y-8">
            
            {/* Gamification / Badges */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" /> Recent Achievements
              </h3>
              
              <div className="space-y-4">
                {/* Mock Achievements */}
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">On Fire!</h4>
                    <p className="text-xs text-white/50">3 Day Learning Streak</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">First Steps</h4>
                    <p className="text-xs text-white/50">Completed your first lesson</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5 opacity-40">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/30 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Course Graduate</h4>
                    <p className="text-xs text-white/50">Complete 1 full course (Locked)</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Assignments / Deadlines */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-400" /> Upcoming Deadlines
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-xl relative overflow-hidden group hover:border-red-500/40 transition-colors cursor-pointer">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                  <h4 className="font-bold text-sm text-red-200">React Final Project</h4>
                  <p className="text-xs text-white/50 mt-1 mb-3">Advanced React Course</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-red-400 font-bold">Due in 2 days</span>
                    <span className="text-white hover:text-red-300 font-medium">Submit Now →</span>
                  </div>
                </div>
                
                <div className="p-4 border border-white/10 bg-white/5 rounded-xl relative overflow-hidden group hover:border-white/20 transition-colors cursor-pointer">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                  <h4 className="font-bold text-sm text-blue-200">Node.js Quiz 1</h4>
                  <p className="text-xs text-white/50 mt-1 mb-3">Node.js Basics</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-white/40">Due next week</span>
                    <span className="text-white hover:text-blue-300 font-medium">Take Quiz →</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}
