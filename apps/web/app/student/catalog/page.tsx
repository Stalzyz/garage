"use client"

import { useApi } from "@/lib/useApi"
import { Loader2, Search, BookOpen, Star, PlayCircle } from "lucide-react"
import Link from "next/link"

export default function StudentCatalogPage() {
  const { data, isLoading } = useApi<any>("/lms/courses")
  const courses = data?.data || []

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Course Catalog</h1>
          <p className="text-white/50 text-sm">Discover new masterclasses to level up your skills.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Search courses..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-white/30"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-white/50">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
          <p>Loading catalog...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-white/50 bg-white/5 border border-white/10 rounded-3xl">
          <BookOpen className="w-12 h-12 mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-white mb-2">No Courses Available</h3>
          <p>Check back soon for new masterclasses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <div key={course.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all group flex flex-col">
              <div className="h-48 bg-black/50 relative overflow-hidden shrink-0">
                <img src={course.thumbnailUrl || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop"} alt={course.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold text-white flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> 4.9
                </div>
                {course.level && (
                  <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-blue-500/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-white border border-blue-400/50">
                    {course.level}
                  </div>
                )}
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{course.title}</h3>
                <p className="text-sm text-white/50 mb-6 line-clamp-2 flex-1">
                  {course.description || "Learn the fundamentals and advanced techniques in this comprehensive masterclass."}
                </p>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-bold font-mono">
                    ${course.price?.toLocaleString() || '299'}
                  </span>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-slate-200 transition-colors">
                    <PlayCircle className="w-4 h-4" /> Enroll
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
