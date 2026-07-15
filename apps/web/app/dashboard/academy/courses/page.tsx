"use client"

import { useApi } from "@/lib/useApi"
import { Loader2, BookOpen, Clock, PlayCircle } from "lucide-react"
import Link from "next/link"

export default function CoursesPage() {
  const { data, isLoading } = useApi<any>("/lms/courses")
  const courses = data?.courses || []

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-[#050505] text-white/50">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading Courses...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      <div className="flex-none px-8 py-8 border-b border-white/10">
        <h1 className="text-3xl font-bold tracking-tight">My Learning</h1>
        <p className="text-sm text-white/50 mt-2">Access your enrolled courses and training materials</p>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        {courses.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
            <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Courses Available</h3>
            <p className="text-white/50">You are not enrolled in any courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((lmsCourse: any) => {
              const { course, modules } = lmsCourse;
              const totalLessons = modules.reduce((acc: number, mod: any) => acc + mod.lessons.length, 0);
              return (
                <div key={lmsCourse.id} className="group flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-[0_10px_40px_rgba(59,130,246,0.1)]">
                  <div className="h-48 bg-black/60 relative overflow-hidden">
                    {lmsCourse.thumbnail ? (
                      <img src={lmsCourse.thumbnail} alt={course.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/40 to-purple-900/40">
                        <BookOpen className="w-12 h-12 text-white/20" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-mono font-bold">
                      {course.code}
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">{course.name}</h3>
                    <p className="text-sm text-white/50 line-clamp-2 mb-4 flex-1">{course.description || "No description provided."}</p>
                    
                    <div className="flex items-center gap-4 text-xs font-mono text-white/40 mb-6">
                      <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {course.duration}</div>
                      <div className="flex items-center gap-1.5"><PlayCircle className="w-3.5 h-3.5" /> {totalLessons} Lessons</div>
                    </div>
                    
                    <Link 
                      href={`/dashboard/academy/courses/${lmsCourse.id}`}
                      className="w-full py-3 bg-white/5 hover:bg-blue-600 border border-white/10 hover:border-blue-500 rounded-xl text-sm font-bold text-center transition-all group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] block"
                    >
                      Enter Course
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
