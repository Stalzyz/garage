"use client"

import { useApi, fetchApi } from "@/lib/useApi"
import { Loader2, Plus, BookOpen, Clock, Settings, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { SlideOver } from "@/components/SlideOver"

export default function EducatorCoursesPage() {
  const { data, isLoading, mutate } = useApi<any>("/lms/courses")
  const courses = data?.courses || []

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: "", code: "", description: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi("/lms/courses", {
        method: "POST",
        body: JSON.stringify(formData)
      })
      mutate()
      setIsModalOpen(false)
      setFormData({ name: "", code: "", description: "" })
    } catch (err) {
      console.error(err)
      alert("Failed to create course")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await fetchApi(`/lms/courses/${id}`, { method: "DELETE" })
      mutate()
    } catch (err) {
      console.error(err)
      alert("Failed to delete course")
    }
  }

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
      <div className="flex-none px-8 py-8 border-b border-white/10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Courses</h1>
          <p className="text-sm text-white/50 mt-2">Create and edit your curriculum</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          <Plus className="w-4 h-4" /> New Course
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        {courses.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
            <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Courses Yet</h3>
            <p className="text-white/50">Create your first course to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((lmsCourse: any) => {
              const { course, modules, isPublished } = lmsCourse;
              const totalLessons = modules.reduce((acc: number, mod: any) => acc + mod.lessons.length, 0);
              return (
                <div key={lmsCourse.id} className="group flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-[0_10px_40px_rgba(59,130,246,0.1)]">
                  <div className="h-40 bg-black/60 relative overflow-hidden">
                    {lmsCourse.thumbnail ? (
                      <img src={lmsCourse.thumbnail} alt={course.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/40 to-slate-800/40">
                        <BookOpen className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold font-mono tracking-widest uppercase rounded-md border ${isPublished ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                        {isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button onClick={(e) => handleDelete(e, lmsCourse.id)} className="w-8 h-8 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg flex items-center justify-center hover:bg-red-500/40 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{course.name}</h3>
                    <p className="text-xs text-white/50 font-mono mb-4">{course.code}</p>
                    
                    <div className="flex items-center gap-4 text-xs font-mono text-white/40 mb-6">
                      <div className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> {modules.length} Modules</div>
                      <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {totalLessons} Lessons</div>
                    </div>
                    
                    <Link 
                      href={`/dashboard/academy/educator/courses/${lmsCourse.id}/builder`}
                      className="w-full py-2.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-500 rounded-xl text-sm font-bold text-center transition-all mt-auto"
                    >
                      Edit Curriculum
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <SlideOver title="Create New Course" open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleCreateCourse} className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Course Name</label>
            <input 
              required 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none" 
              placeholder="e.g. Advanced TypeScript"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Course Code</label>
            <input 
              required 
              value={formData.code} 
              onChange={e => setFormData({...formData, code: e.target.value})} 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none" 
              placeholder="e.g. TS-401"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Description</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none h-32 resize-none" 
              placeholder="Brief course overview..."
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold font-mono tracking-widest uppercase transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Course"}
          </button>
        </form>
      </SlideOver>
    </div>
  )
}
