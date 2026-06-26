"use client"

import { useSession } from "next-auth/react"
import { Trophy, BookOpen, Clock, ArrowRight, PlayCircle } from "lucide-react"
import Link from "next/link"
import { useApi } from "@/lib/useApi"

export default function StudentDashboardPage() {
  const { data: session } = useSession()
  
  // Fetch their enrolled courses (using our standard LMS API)
  const { data: coursesData, isLoading } = useApi<any>("/lms/courses")
  
  // Mock progress data since the real API might not have progress tracked yet
  const enrolledCourses = coursesData?.data?.slice(0, 2) || []

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="mb-10 p-8 rounded-3xl bg-gradient-to-br from-blue-900/40 to-black border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {session?.user?.name?.split(' ')[0] || 'Student'}! 🚀</h1>
          <p className="text-white/60 mb-6 max-w-xl text-sm leading-relaxed">
            You're currently in the top 15% of your cohort. Keep up the great work in the UI/UX Masterclass. 
            Your next assignment is due in 3 days.
          </p>
          <Link href="/student/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25">
            <PlayCircle className="w-5 h-5" /> Resume Learning
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content - Active Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Continue Learning</h2>
            <Link href="/student/courses" className="text-sm text-blue-400 hover:text-blue-300 font-medium">View all</Link>
          </div>

          {isLoading ? (
            <div className="h-40 border border-white/10 rounded-2xl bg-white/5 flex items-center justify-center">
              <span className="text-white/40 animate-pulse">Loading courses...</span>
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="p-8 border border-white/10 rounded-2xl bg-white/5 text-center">
              <BookOpen className="w-10 h-10 text-white/30 mx-auto mb-3" />
              <h3 className="font-bold mb-1">No Active Courses</h3>
              <p className="text-sm text-white/50 mb-4">You haven't enrolled in any masterclasses yet.</p>
              <Link href="/student/catalog" className="inline-flex px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors">
                Browse Catalog
              </Link>
            </div>
          ) : (
            enrolledCourses.map((course: any, idx: number) => {
              // Mocking a progress percentage
              const progress = idx === 0 ? 65 : 12;
              
              return (
                <div key={course.id} className="p-6 border border-white/10 rounded-3xl bg-white/5 hover:bg-white/10 transition-colors group flex flex-col sm:flex-row gap-6 items-center">
                  <div className="w-full sm:w-48 h-32 bg-black/50 rounded-2xl overflow-hidden shrink-0 relative border border-white/10">
                    <img src={course.thumbnailUrl || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop"} alt={course.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <PlayCircle className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-blue-400">
                      <span>Module {idx + 2}</span> • <span>{course.level}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-4">{course.title}</h3>
                    
                    <div className="mb-2 flex justify-between items-end">
                      <span className="text-xs text-white/50 font-medium">Overall Progress</span>
                      <span className="text-sm font-bold font-mono">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Sidebar Stats & Milestones */}
        <div className="space-y-6">
          <div className="p-6 border border-white/10 rounded-3xl bg-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />
            <h3 className="font-bold mb-6 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-400" /> Achievements</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <span className="text-xl">🔥</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm">7 Day Streak</h4>
                  <p className="text-xs text-white/50">You're on fire! Keep learning.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <span className="text-xl">🎨</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm">Design Thinker</h4>
                  <p className="text-xs text-white/50">Completed first UX module.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border border-white/10 rounded-3xl bg-white/5">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-400" /> Upcoming Deadlines</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                <h4 className="text-sm font-bold mb-1">Final Portfolio Submission</h4>
                <p className="text-xs text-red-400 font-bold mb-2">Due in 3 days</p>
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-mono">UI/UX Masterclass</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
