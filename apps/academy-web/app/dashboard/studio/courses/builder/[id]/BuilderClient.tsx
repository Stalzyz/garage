"use client"

import { useState, useTransition, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Settings,
  DollarSign, 
  Video, 
  FileText, 
  HelpCircle, 
  GripVertical, 
  ChevronRight,
  ChevronDown,
  Trash2,
  Save,
  Eye,
  MonitorPlay,
  Image as ImageIcon,
  MoreVertical,
  Link as LinkIcon,
  Loader2,
  Search
} from "lucide-react"
import { cn } from "@/lib/utils"

import { ApiClient } from "@/lib/api"
import { createModule, updateModule, deleteModule, reorderModules, createLesson, updateLesson, deleteLesson, reorderLessons } from "./actions"
import { RichTextEditor } from "./RichTextEditor"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type LessonType = "VIDEO" | "RICH_TEXT" | "QUIZ" | "PDF"

interface Lesson {
  id: string
  title: string
  type: LessonType
  orderIndex: number
  contentUrl?: string
  richText?: string
  resources?: any
}

interface Module {
  id: string
  title: string
  orderIndex: number
  lessons: Lesson[]
}

export default function BuilderClient({ initialCourse }: { initialCourse: any }) {
  const [isPending, startTransition] = useTransition()
  
  const [activeTab, setActiveTab] = useState<"SETTINGS" | "CURRICULUM">("CURRICULUM")
  const [modules, setModules] = useState<Module[]>(initialCourse.modules || [])
  const [expandedModules, setExpandedModules] = useState<string[]>(initialCourse.modules?.map((m: any) => m.id) || [])
  const [activeItem, setActiveItem] = useState<{ type: "COURSE" | "MODULE" | "LESSON" | "THUMBNAIL" | "PRICING", id?: string } | null>(null)

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Keep standard logic
  }

  const toggleModule = (id: string) => {
    setExpandedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  // --- Actions ---

  const handleAddModule = () => {
    startTransition(async () => {
      const newModule = await createModule(initialCourse.id, "New Module", modules.length)
      if (newModule) {
        setModules(prev => [...prev, { ...newModule, lessons: [] }])
        setExpandedModules(prev => [...prev, newModule.id])
        setActiveItem({ type: "MODULE", id: newModule.id })
      }
    })
  }

  const handleUpdateModule = (moduleId: string, title: string) => {
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, title } : m))
    startTransition(async () => {
      await updateModule(moduleId, title)
    })
  }

  const handleDeleteModule = (moduleId: string) => {
    setModules(prev => prev.filter(m => m.id !== moduleId))
    if (activeItem?.id === moduleId) setActiveItem(null)
    startTransition(async () => {
      await deleteModule(moduleId)
    })
  }

  const handleAddLesson = (moduleId: string, type: string) => {
    const mod = modules.find(m => m.id === moduleId)
    if (!mod) return
    
    startTransition(async () => {
      const newLesson = await createLesson(moduleId, "New Lesson", type as any, mod.lessons.length)
      if (newLesson) {
        setModules(prev => prev.map(m => {
          if (m.id === moduleId) return { ...m, lessons: [...m.lessons, newLesson] }
          return m
        }))
        setActiveItem({ type: "LESSON", id: newLesson.id })
        if (!expandedModules.includes(moduleId)) {
          setExpandedModules(prev => [...prev, moduleId])
        }
      }
    })
  }

  const handleUpdateLesson = (moduleId: string, lessonId: string, title: string) => {
    setModules(prev => prev.map(m => {
      if (m.id === moduleId) return { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, title } : l) }
      return m
    }))
    startTransition(async () => {
      await updateLesson(lessonId, { title })
    })
  }

  const handleUpdateLessonContent = (moduleId: string, lessonId: string, richText: string) => {
    setModules(prev => prev.map(m => {
      if (m.id === moduleId) return { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, richText } : l) }
      return m
    }))
    startTransition(async () => {
      await updateLesson(lessonId, { richText })
    })
  }

  const handleUpdateLessonVideo = (moduleId: string, lessonId: string, contentUrl: string) => {
    setModules(prev => prev.map(m => {
      if (m.id === moduleId) return { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, contentUrl } : l) }
      return m
    }))
    startTransition(async () => {
      await updateLesson(lessonId, { contentUrl })
    })
  }

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    setModules(prev => prev.map(m => {
      if (m.id === moduleId) return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
      return m
    }))
    if (activeItem?.id === lessonId) setActiveItem(null)
    startTransition(async () => {
      await deleteLesson(lessonId)
    })
  }

  const handleDragEndModules = (event: any) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over?.id)
        const newItems = arrayMove(items, oldIndex, newIndex)
        
        const updates = newItems.map((item, idx) => ({ id: item.id, orderIndex: idx }))
        startTransition(() => { reorderModules(updates) })
        return newItems
      })
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#050505] text-white overflow-hidden">
      
      {/* Top Bar */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <MonitorPlay className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-sm">{initialCourse.course.name}</h1>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span className={cn("w-2 h-2 rounded-full", initialCourse.isPublished ? "bg-emerald-500" : "bg-yellow-500")} /> 
              {initialCourse.isPublished ? "PUBLISHED" : "DRAFT"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isPending && <Loader2 className="w-4 h-4 animate-spin text-white/50" />}
          <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold transition-colors flex items-center gap-2">
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Save className="w-4 h-4" /> Publish Course
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL - Curriculum Sidebar */}
        <aside className="w-80 border-r border-white/10 bg-[#0a0a0a] flex flex-col shrink-0 h-full overflow-hidden">
          
          {/* Tabs */}
          <div className="flex p-2 border-b border-white/10 shrink-0">
            <button 
              onClick={() => setActiveTab("SETTINGS")}
              className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-colors", activeTab === "SETTINGS" ? "bg-white/10 text-white" : "text-white/50 hover:text-white")}
            >
              SETTINGS
            </button>
            <button 
              onClick={() => setActiveTab("CURRICULUM")}
              className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-colors", activeTab === "CURRICULUM" ? "bg-white/10 text-white" : "text-white/50 hover:text-white")}
            >
              CURRICULUM
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === "SETTINGS" ? (
              <div className="space-y-2">
                <button 
                  onClick={() => setActiveItem({ type: "COURSE" })}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors text-left",
                    activeItem?.type === "COURSE" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-white/5 hover:bg-white/10 border border-white/5"
                  )}
                >
                  <Settings className="w-4 h-4" /> General Settings
                </button>
                <button 
                  onClick={() => setActiveItem({ type: "THUMBNAIL" })}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors text-left",
                    activeItem?.type === "THUMBNAIL" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-white/5 hover:bg-white/10 border border-white/5"
                  )}
                >
                  <ImageIcon className="w-4 h-4" /> Thumbnail & Trailer
                </button>
                <button 
                  onClick={() => setActiveItem({ type: "PRICING" })}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors text-left",
                    activeItem?.type === "PRICING" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-white/5 hover:bg-white/10 border border-white/5"
                  )}
                >
                  <DollarSign className="w-4 h-4" /> Pricing & SEO
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Modules List */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndModules}>
                  <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {modules.map((module, mIdx) => (
                        <SortableModule 
                          key={module.id} 
                          module={module} 
                          mIdx={mIdx} 
                          expandedModules={expandedModules} 
                          toggleModule={toggleModule} 
                          activeItem={activeItem} 
                          setActiveItem={setActiveItem} 
                          handleAddLesson={handleAddLesson}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <button 
                  onClick={handleAddModule}
                  className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white hover:border-white/40 hover:bg-white/5 text-sm font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Section
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT PANEL - Editor Area */}
        <main className="flex-1 bg-[#050505] overflow-y-auto relative p-8 lg:p-12">
          
          <div className="max-w-3xl mx-auto">
            {activeItem?.type === "COURSE" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Course Settings</h2>
                  <p className="text-white/50 text-sm">Manage the high-level details of your course.</p>
                </div>
                {/* Omitted for brevity */}
              </motion.div>
            )}

            {activeItem?.type === "MODULE" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Section Settings</h2>
                  <p className="text-white/50 text-sm">Update section title and rules.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70 ml-1">Section Title</label>
                  <input 
                    type="text" 
                    value={modules.find(m => m.id === activeItem.id)?.title || ""} 
                    onChange={(e) => activeItem.id && handleUpdateModule(activeItem.id, e.target.value)}
                    className="w-full h-14 text-xl font-bold bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50" 
                  />
                </div>
                <button 
                  onClick={() => activeItem.id && handleDeleteModule(activeItem.id)}
                  className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 text-sm font-bold transition-colors"
                >
                  Delete Section
                </button>
              </motion.div>
            )}

            {activeItem?.type === "LESSON" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                
                {(() => {
                  const mod = modules.find(m => m.lessons.some(l => l.id === activeItem.id))
                  const lesson = mod?.lessons.find(l => l.id === activeItem.id)
                  if (!lesson || !mod) return null
                  
                  return (
                    <>
                      <div className="flex items-center justify-between border-b border-white/10 pb-6">
                        <div className="flex-1">
                          <input 
                            type="text" 
                            value={lesson.title} 
                            onChange={(e) => handleUpdateLesson(mod.id, lesson.id, e.target.value)}
                            className="w-full bg-transparent text-3xl font-bold focus:outline-none placeholder:text-white/20" 
                            placeholder="Lesson Title" 
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors text-white/50 hover:text-white">
                            <Settings className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteLesson(mod.id, lesson.id)}
                            className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center transition-colors text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Lesson Content Builder (Notion-style mock) */}
                      <div className="space-y-4">
                        {lesson.type === "VIDEO" && (
                          <div className="space-y-4">
                            {!lesson.contentUrl ? (
                              <div className="border-2 border-dashed border-white/10 hover:border-purple-500/50 bg-white/5 rounded-3xl p-12 flex flex-col items-center justify-center text-center transition-colors group">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 group-hover:bg-purple-500/20 flex items-center justify-center mb-4 transition-colors">
                                  <MonitorPlay className="w-8 h-8 text-white/40 group-hover:text-purple-400 transition-colors" />
                                </div>
                                <h3 className="text-lg font-bold mb-1">Add Video Content</h3>
                                <p className="text-sm text-white/40 mb-6">Paste a YouTube or Vimeo link</p>
                                <input 
                                  type="text"
                                  placeholder="https://youtube.com/watch?v=..."
                                  className="w-full max-w-md bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateLessonVideo(mod.id, lesson.id, e.currentTarget.value)
                                    }
                                  }}
                                />
                                <p className="text-xs text-white/30 mt-2">Press Enter to save</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-bold text-sm text-white/70">Video Content</h3>
                                  <button onClick={() => handleUpdateLessonVideo(mod.id, lesson.id, "")} className="text-xs text-red-400 hover:text-red-300">Remove Video</button>
                                </div>
                                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black">
                                  <iframe 
                                    src={lesson.contentUrl.includes('youtube') ? lesson.contentUrl.replace('watch?v=', 'embed/') : lesson.contentUrl} 
                                    className="w-full h-full"
                                    allowFullScreen
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <input 
                                    type="text"
                                    value={lesson.contentUrl}
                                    onChange={(e) => handleUpdateLessonVideo(mod.id, lesson.id, e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="group relative mt-4">
                          <div className="flex items-center justify-between mb-4 pb-2">
                            <h3 className="font-bold text-sm text-white/70">Lesson Content</h3>
                          </div>
                          
                          <RichTextEditor 
                            initialContent={lesson.richText || ""}
                            onChange={(content) => handleUpdateLessonContent(mod.id, lesson.id, content)}
                            isSaving={isPending}
                          />
                        </div>
                        
                        {/* Resource Uploader Placeholder */}
                        <div className="group relative border border-white/5 border-dashed rounded-xl bg-white/5 p-6 mt-4 flex flex-col items-center justify-center text-center hover:bg-white/10 hover:border-white/20 transition-colors cursor-pointer">
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                            <FileText className="w-5 h-5 text-white/40" />
                          </div>
                          <h3 className="font-bold text-sm text-white/70">Downloadable Resources</h3>
                          <p className="text-xs text-white/40 mt-1">Drag and drop PDFs or ZIP files here to attach them to this lesson.</p>
                        </div>
                      </div>
                    </>
                  )
                })()}

              </motion.div>
            )}

            {activeItem?.type === "PRICING" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Pricing & SEO</h2>
                  <p className="text-white/50 text-sm">Configure how much your course costs and how it appears on search engines.</p>
                </div>
                
                <div className="space-y-6 bg-white/5 border border-white/10 rounded-3xl p-8">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-purple-400" /> Pricing Options</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/70 ml-1">Base Price (USD)</label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <input 
                          type="number" 
                          placeholder="e.g. 99.00"
                          defaultValue={initialCourse.course?.price || ""}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/70 ml-1">Discount Price (Optional)</label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <input 
                          type="number" 
                          placeholder="e.g. 79.00"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 bg-white/5 border border-white/10 rounded-3xl p-8">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Search className="w-5 h-5 text-purple-400" /> SEO Configuration</h3>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/70 ml-1">SEO Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. The Complete Guide to Advanced React"
                      defaultValue={initialCourse.course?.name || ""}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50" 
                    />
                    <p className="text-[10px] text-white/40 ml-1">50-60 characters recommended for best search engine visibility.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/70 ml-1">Meta Description</label>
                    <textarea 
                      rows={3}
                      placeholder="Master React by building real-world projects..."
                      defaultValue={initialCourse.course?.description || ""}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 resize-none" 
                    />
                    <p className="text-[10px] text-white/40 ml-1">150-160 characters describing what students will learn.</p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors shadow-lg">
                    Save Changes
                  </button>
                </div>
              </motion.div>
            )}

            {!activeItem && (
              <div className="h-full flex flex-col items-center justify-center text-white/30 text-center">
                <FileText className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-semibold">Select a lesson or module from the curriculum <br/> to start editing.</p>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  )
}

function SortableModule({ module, mIdx, expandedModules, toggleModule, activeItem, setActiveItem, handleAddLesson }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: module.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      
      {/* Module Header */}
      <div 
        className={cn(
          "flex items-center gap-2 p-3 cursor-pointer hover:bg-white/5 transition-colors",
          activeItem?.id === module.id && "bg-purple-500/10 text-purple-400"
        )}
        onClick={() => {
          toggleModule(module.id)
          setActiveItem({ type: "MODULE", id: module.id })
        }}
      >
        <button className="text-white/40 hover:text-white transition-colors">
          {expandedModules.includes(module.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <div className="flex-1 font-bold text-sm truncate">Section {mIdx + 1}: {module.title}</div>
        <button {...attributes} {...listeners} className="text-white/20 hover:text-white/60 cursor-grab focus:outline-none">
          <GripVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Lessons List */}
      <AnimatePresence>
        {expandedModules.includes(module.id) && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-white/10"
          >
            <div className="p-2 space-y-1 bg-black/40">
              {module.lessons.map((lesson: any) => (
                <div 
                  key={lesson.id}
                  onClick={(e) => { e.stopPropagation(); setActiveItem({ type: "LESSON", id: lesson.id }) }}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-xl text-sm cursor-pointer transition-all",
                    activeItem?.id === lesson.id 
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" 
                      : "hover:bg-white/10 border border-transparent text-white/70 hover:text-white"
                  )}
                >
                  {lesson.type === "VIDEO" && <Video className="w-3.5 h-3.5 flex-shrink-0" />}
                  {lesson.type === "RICH_TEXT" && <FileText className="w-3.5 h-3.5 flex-shrink-0" />}
                  {lesson.type === "QUIZ" && <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                  {lesson.type === "PDF" && <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />}
                  <span className="truncate flex-1">{lesson.title}</span>
                </div>
              ))}
              
              {/* Add Lesson Menu */}
              <div className="pt-2 px-2 pb-1 flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleAddLesson(module.id, "VIDEO") }}
                  className="flex items-center gap-1 text-xs font-bold text-white/40 hover:text-purple-400 transition-colors py-1"
                >
                  <Plus className="w-3 h-3" /> Video
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleAddLesson(module.id, "RICH_TEXT") }}
                  className="flex items-center gap-1 text-xs font-bold text-white/40 hover:text-purple-400 transition-colors py-1"
                >
                  <Plus className="w-3 h-3" /> Text
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
