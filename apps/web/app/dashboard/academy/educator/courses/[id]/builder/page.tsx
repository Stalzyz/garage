"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useApi, fetchApi } from "@/lib/useApi"
import { Loader2, ChevronLeft, Plus, GripVertical, Trash2, Video, FileText, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function CourseBuilderPage() {
  const params = useParams()
  const courseId = params.id as string
  
  const { data, isLoading } = useApi<any>(`/lms/courses/${courseId}`)
  
  const [modules, setModules] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (data?.course?.modules) {
      setModules(data.course.modules)
    }
  }, [data])

  const handleAddModule = () => {
    setModules([...modules, { id: `new-mod-${Date.now()}`, title: "New Module", lessons: [] }])
  }

  const handleAddLesson = (modIndex: number) => {
    const updated = [...modules]
    updated[modIndex].lessons.push({
      id: `new-les-${Date.now()}`,
      title: "New Lesson",
      type: "VIDEO",
      duration: 5
    })
    setModules(updated)
  }

  const handleUpdateModule = (modIndex: number, title: string) => {
    const updated = [...modules]
    updated[modIndex].title = title
    setModules(updated)
  }

  const handleUpdateLesson = (modIndex: number, lesIndex: number, field: string, value: any) => {
    const updated = [...modules]
    updated[modIndex].lessons[lesIndex] = { ...updated[modIndex].lessons[lesIndex], [field]: value }
    setModules(updated)
  }

  const handleRemoveModule = (modIndex: number) => {
    if(!window.confirm("Delete this entire module?")) return;
    setModules(modules.filter((_, i) => i !== modIndex))
  }

  const handleRemoveLesson = (modIndex: number, lesIndex: number) => {
    const updated = [...modules]
    updated[modIndex].lessons = updated[modIndex].lessons.filter((_: any, i: number) => i !== lesIndex)
    setModules(updated)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await fetchApi(`/lms/courses/${courseId}/curriculum`, {
        method: "PUT",
        body: JSON.stringify({ modules })
      })
      toast.success("Curriculum saved successfully")
    } catch (err) {
      console.error(err)
      toast.error("Failed to save curriculum")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-[#050505] text-white/50">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading Builder...</p>
      </div>
    )
  }

  const lmsCourse = data?.course
  if (!lmsCourse) return null;

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/academy/educator/courses" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">Curriculum Builder</h1>
            <p className="text-xs text-white/50 font-mono">{lmsCourse.course.name}</p>
          </div>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8 max-w-4xl mx-auto w-full">
        {modules.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
            <h3 className="text-xl font-bold text-white mb-2">Empty Curriculum</h3>
            <p className="text-white/50 mb-6">Start by adding your first module.</p>
            <button onClick={handleAddModule} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all">
              Add Module
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {modules.map((mod, modIdx) => (
              <div key={mod.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {/* Module Header */}
                <div className="bg-white/5 p-4 flex items-center gap-4 border-b border-white/10">
                  <GripVertical className="w-5 h-5 text-white/20 cursor-grab" />
                  <div className="font-mono text-sm font-bold text-white/40">Section {modIdx + 1}:</div>
                  <input 
                    value={mod.title} 
                    onChange={e => handleUpdateModule(modIdx, e.target.value)}
                    className="flex-1 bg-transparent border-none text-lg font-bold text-white focus:outline-none focus:ring-0" 
                    placeholder="Module Title"
                  />
                  <button onClick={() => handleRemoveModule(modIdx)} className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Lessons */}
                <div className="p-4 space-y-3">
                  {mod.lessons.map((les: any, lesIdx: number) => (
                    <div key={les.id} className="flex items-center gap-3 bg-black/40 border border-white/5 p-3 rounded-xl group">
                      <GripVertical className="w-4 h-4 text-white/20 cursor-grab" />
                      <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center flex-none">
                        {les.type === 'VIDEO' ? <Video className="w-3 h-3 text-blue-400" /> : <FileText className="w-3 h-3 text-purple-400" />}
                      </div>
                      
                      <input 
                        value={les.title} 
                        onChange={e => handleUpdateLesson(modIdx, lesIdx, "title", e.target.value)}
                        className="flex-1 bg-transparent border-none text-sm font-medium text-white/80 focus:outline-none" 
                        placeholder="Lesson Title"
                      />
                      
                      <select 
                        value={les.type} 
                        onChange={e => handleUpdateLesson(modIdx, lesIdx, "type", e.target.value)}
                        className="w-32 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="VIDEO">Video</option>
                        <option value="PDF">PDF</option>
                        <option value="RICH_TEXT">Text Article</option>
                      </select>
                      
                      <div className="w-24 relative">
                        <input 
                          type="number" 
                          value={les.duration || 0} 
                          onChange={e => handleUpdateLesson(modIdx, lesIdx, "duration", Number(e.target.value))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 pr-6 text-xs text-white focus:outline-none font-mono" 
                          placeholder="Mins"
                        />
                        <span className="absolute right-2 top-1.5 text-xs text-white/30 font-mono">m</span>
                      </div>
                      
                      <button onClick={() => handleRemoveLesson(modIdx, lesIdx)} className="w-8 h-8 flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  <button onClick={() => handleAddLesson(modIdx)} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-xs font-bold font-mono tracking-widest uppercase text-white/40 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 mt-2">
                    <Plus className="w-3 h-3" /> Add Lesson
                  </button>
                </div>
              </div>
            ))}
            
            <button onClick={handleAddModule} className="w-full py-6 border-2 border-dashed border-white/10 rounded-2xl text-sm font-bold text-white/50 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" /> Add New Module
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
