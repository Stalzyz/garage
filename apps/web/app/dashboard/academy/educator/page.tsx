"use client"

import Link from "next/link"
import { BookOpen, Users, BarChart3, Settings, Plus, GraduationCap, ChevronRight } from "lucide-react"
import { useApi } from "@/lib/useApi"

export default function EducatorDashboard() {
  const { data: coursesData } = useApi<any>("/lms/courses")
  const courses = coursesData?.courses || []

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 py-8 border-b border-white/10">
        <h1 className="text-3xl font-bold tracking-tight">Educator Hub</h1>
        <p className="text-sm text-white/50 mt-2">Manage your courses, students, and curriculum</p>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            <BookOpen className="w-8 h-8 text-blue-400 mb-4" />
            <p className="text-sm text-white/50 font-bold uppercase tracking-wider mb-1">Active Courses</p>
            <p className="text-3xl font-black">{courses.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            <Users className="w-8 h-8 text-emerald-400 mb-4" />
            <p className="text-sm text-white/50 font-bold uppercase tracking-wider mb-1">Total Students</p>
            <p className="text-3xl font-black">124</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
            <GraduationCap className="w-8 h-8 text-purple-400 mb-4" />
            <p className="text-sm text-white/50 font-bold uppercase tracking-wider mb-1">Avg Completion</p>
            <p className="text-3xl font-black">68%</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
            <BarChart3 className="w-8 h-8 text-amber-400 mb-4" />
            <p className="text-sm text-white/50 font-bold uppercase tracking-wider mb-1">Assignments</p>
            <p className="text-3xl font-black">12 <span className="text-sm font-medium text-amber-400 ml-2">To Grade</span></p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/dashboard/academy/educator/courses" className="group bg-white/5 border border-white/10 hover:border-blue-500/50 rounded-2xl p-8 transition-all hover:bg-white/10">
            <div className="flex justify-between items-center mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30 text-blue-400 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-blue-400 transition-colors" />
            </div>
            <h2 className="text-xl font-bold mb-2">Course Builder</h2>
            <p className="text-sm text-white/50">Create new courses, organize modules, and upload lesson materials.</p>
          </Link>
          
          <Link href="/dashboard/academy/educator/students" className="group bg-white/5 border border-white/10 hover:border-emerald-500/50 rounded-2xl p-8 transition-all hover:bg-white/10">
            <div className="flex justify-between items-center mb-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h2 className="text-xl font-bold mb-2">Student Performance</h2>
            <p className="text-sm text-white/50">Track individual student progress, grades, and engagement metrics.</p>
          </Link>
        </div>

      </div>
    </div>
  )
}
