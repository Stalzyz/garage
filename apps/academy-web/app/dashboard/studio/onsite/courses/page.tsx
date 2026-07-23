"use client"

import { useApi } from "@/lib/useApi"
import { BookOpen, Plus, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function OnsiteCoursesPage() {
  const { data: courses, isLoading } = useApi<any[]>("/academy/batches")

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white p-8 overflow-y-auto relative">
      <div className="flex-none border-b border-white/10 pb-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <BookOpen className="w-6 h-6 text-indigo-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Onsite Courses</h1>
              <p className="text-sm text-white/50 mt-2">Manage course curriculum and materials for onsite batches.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 font-bold px-6 py-3 rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Create Course
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((batch: any) => (
            <div key={batch.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col group hover:border-indigo-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded font-bold uppercase tracking-widest">
                  ONSITE BATCH
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-bold uppercase">
                  ACTIVE
                </span>
              </div>
              
              <h3 className="font-bold text-lg mb-2">{batch.course?.name || "Untitled Course"}</h3>
              <p className="text-sm text-white/50 mb-6">{batch.name} • {batch.type}</p>
              
              <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                <div className="text-sm text-white/60">
                  {batch._count?.enrollments || 0} Enrolled
                </div>
                <Link href={`/dashboard/studio/onsite/courses/builder/${batch.courseId}`} className="text-indigo-400 hover:text-indigo-300 font-bold text-sm flex items-center gap-1 transition-colors">
                  Open Builder <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}

          {(!courses || courses.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/10 rounded-3xl">
              <BookOpen className="w-16 h-16 text-white/10 mb-4" />
              <h2 className="text-xl font-bold text-white/80">No Courses Found</h2>
              <p className="text-sm text-white/40 mt-2 max-w-md">Get started by creating a new onsite course.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
