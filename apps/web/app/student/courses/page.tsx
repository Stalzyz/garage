"use client"

import { useApi } from "@/lib/useApi"
import { Loader2, BookOpen, PlayCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function StudentCoursesPage() {
  const { data, isLoading } = useApi<any>("/lms/courses")
  // In a real app, this endpoint would specifically return ENROLLED courses for this student.
  const courses = data?.data?.slice(0, 3) || []

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Courses</h1>
        <p className="text-white/50 text-sm">Resume learning and track your progress.</p>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-white/50">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
          <p>Loading your courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-white/50 bg-white/5 border border-white/10 rounded-3xl">
          <BookOpen className="w-12 h-12 mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-white mb-2">No Enrolled Courses</h3>
          <p className="mb-6">You haven't enrolled in any masterclasses yet.</p>
          <Link href="/student/catalog" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map((course: any, idx: number) => {
            // Mock dynamic progress
            const progress = idx === 0 ? 85 : idx === 1 ? 40 : 100;
            const isCompleted = progress === 100;
            
            return (
              <div key={course.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center hover:bg-white/10 transition-colors group">
                <div className="w-full md:w-64 h-40 bg-black/50 rounded-2xl overflow-hidden shrink-0 relative">
                  <img src={course.thumbnailUrl || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop"} alt={course.title} className="w-full h-full object-cover opacity-80" />
                  {isCompleted && (
                    <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-emerald-500 text-white p-3 rounded-full shadow-2xl shadow-emerald-500/50">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-white/50">
                    <span className={isCompleted ? "text-emerald-400" : "text-blue-400"}>
                      {isCompleted ? "Completed" : "In Progress"}
                    </span>
                    <span>•</span>
                    <span>{course.level || "Intermediate"}</span>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-white transition-colors text-white/90">{course.title}</h2>
                  <p className="text-sm text-white/50 mb-8 line-clamp-2">{course.description}</p>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs text-white/50 font-bold uppercase tracking-widest">Progress</span>
                        <span className="text-sm font-bold font-mono text-white/80">{progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <button className={`shrink-0 flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-xl transition-all shadow-lg ${isCompleted ? 'bg-white/10 hover:bg-white/20 text-white shadow-none' : 'bg-white text-black hover:bg-slate-200 shadow-white/10'}`}>
                      {isCompleted ? (
                        <>Review Material</>
                      ) : (
                        <><PlayCircle className="w-5 h-5" /> Continue Learning</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
