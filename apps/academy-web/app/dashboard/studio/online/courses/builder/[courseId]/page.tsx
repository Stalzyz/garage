"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
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
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchApi } from "@/lib/useApi"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type LessonType = "VIDEO" | "TEXT" | "QUIZ" | "LINK"

function SortableModuleItem({ id, children }: { id: string, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: 50, position: 'relative' as any };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

interface Lesson {
  id: string
  title: string
  type: LessonType
  contentUrl?: string
  videoId?: string
  description?: string
}

interface Module {
  id: string
  title: string
  lessons: Lesson[]
}

export default function CourseBuilder() {
  const params = useParams()
  const courseId = params.courseId as string
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"SETTINGS" | "CURRICULUM">("CURRICULUM")
  const [modules, setModules] = useState<Module[]>([])
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  const [activeItem, setActiveItem] = useState<{ type: "COURSE" | "MODULE" | "LESSON" | "THUMBNAIL" | "PRICING", id?: string } | null>(null)
  
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [courseState, setCourseState] = useState({
    title: "",
    description: "",
    price: 0,
    status: "DRAFT"
  })

  useEffect(() => {
    fetchCourseData()
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      const data: any = await fetchApi(`/lms/courses/${courseId}`)
      const c = data.course

      setCourseState({
        title: c.course.name,
        description: c.course.description || "",
        price: c.course.fee || 0,
        status: c.isPublished ? "PUBLISHED" : "DRAFT"
      })
      setThumbnail(c.thumbnail)
      
      const loadedModules = c.modules.map((m: any) => ({
        id: m.id,
        title: m.title,
        lessons: m.lessons.map((l: any) => ({
          id: l.id,
          title: l.title,
          type: l.type,
          contentUrl: l.contentUrl,
          videoId: l.videoId,
          description: l.description
        }))
      }))

      setModules(loadedModules)
      if (loadedModules.length > 0) {
        setExpandedModules([loadedModules[0].id])
        setActiveItem({ type: "COURSE" })
      }
    } catch (err) {
      toast.error("Could not load course data")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (publish?: boolean) => {
    setIsSaving(true)
    const newStatus = publish !== undefined ? (publish ? "PUBLISHED" : "DRAFT") : courseState.status

    try {
      // 1. Save Course Metadata
      await fetchApi(`/lms/courses/${courseId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: courseState.title,
          description: courseState.description,
          fee: courseState.price,
          thumbnail: thumbnail,
          isPublished: newStatus === "PUBLISHED"
        })
      })

      // 2. Save Curriculum Structure
      await fetchApi(`/lms/courses/${courseId}/curriculum`, {
        method: "PUT",
        body: JSON.stringify({ modules })
      })

      setCourseState(prev => ({ ...prev, status: newStatus }))
      toast.success(publish ? "Course Published Successfully!" : "Course Saved Successfully!")
      
      // Reload to get real IDs for any newly created items
      await fetchCourseData()

    } catch (err) {
      toast.error("Failed to save course.")
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleModule = (id: string) => {
    setExpandedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const handleAddModule = () => {
    const newId = `new-mod-${Date.now()}`
    setModules([...modules, { id: newId, title: "New Module", lessons: [] }])
    setExpandedModules([...expandedModules, newId])
    setActiveItem({ type: "MODULE", id: newId })
  }

  const handleDeleteModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id))
    if (activeItem?.id === id) setActiveItem({ type: "COURSE" })
  }

  const handleAddLesson = (moduleId: string, type: LessonType) => {
    const newId = `new-les-${Date.now()}`
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return { ...m, lessons: [...m.lessons, { id: newId, title: "New Lesson", type }] }
      }
      return m
    }))
    setActiveItem({ type: "LESSON", id: newId })
    if (!expandedModules.includes(moduleId)) {
      setExpandedModules([...expandedModules, moduleId])
    }
  }

  const handleDeleteLesson = (lessonId: string) => {
    setModules(modules.map(m => ({
      ...m,
      lessons: m.lessons.filter(l => l.id !== lessonId)
    })))
    if (activeItem?.id === lessonId) setActiveItem({ type: "COURSE" })
  }

  const updateActiveModule = (field: string, value: any) => {
    if (activeItem?.type !== "MODULE") return;
    setModules(modules.map(m => m.id === activeItem.id ? { ...m, [field]: value } : m))
  }

  const updateActiveLesson = (field: string, value: any) => {
    if (activeItem?.type !== "LESSON") return;
    setModules(modules.map(m => ({
      ...m,
      lessons: m.lessons.map(l => l.id === activeItem.id ? { ...l, [field]: value } : l)
    })))
  }

  if (isLoading) {
    return <div className="h-full flex items-center justify-center bg-[#050505] text-white"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
  }

  return (
    <div className="h-full flex flex-col bg-[#050505] text-white">
      
      {/* Top Bar */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <MonitorPlay className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-sm">{courseState.title || "Untitled Course"}</h1>
            <div className="flex items-center gap-2 text-xs text-white/50">
              {courseState.status === "DRAFT" ? (
                <><span className="w-2 h-2 rounded-full bg-yellow-500" /> DRAFT</>
              ) : (
                <><span className="w-2 h-2 rounded-full bg-emerald-500" /> PUBLISHED</>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold transition-colors flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Draft
          </button>
          <button 
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50"
          >
            <Eye className="w-4 h-4" /> Publish
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL - Curriculum Sidebar */}
        <aside className="w-80 border-r border-white/10 bg-[#0a0a0a] flex flex-col shrink-0 z-10 relative">
          
          {/* Tabs */}
          <div className="flex p-2 border-b border-white/10">
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
                  <Settings className="w-4 h-4" />
                  General Settings
                </button>
                <button 
                  onClick={() => setActiveItem({ type: "THUMBNAIL" })}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors text-left",
                    activeItem?.type === "THUMBNAIL" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-white/5 hover:bg-white/10 border border-white/5"
                  )}
                >
                  <ImageIcon className="w-4 h-4" />
                  Thumbnail & Trailer
                </button>
                <button 
                  onClick={() => setActiveItem({ type: "PRICING" })}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors text-left",
                    activeItem?.type === "PRICING" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-white/5 hover:bg-white/10 border border-white/5"
                  )}
                >
                  <DollarSign className="w-4 h-4" />
                  Pricing & SEO
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Modules List */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {modules.map((module, mIdx) => (
                        <SortableModuleItem key={module.id} id={module.id}>
                          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative">
                      
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
                            <GripVertical className="w-4 h-4 text-white/20 cursor-grab hover:text-white transition-colors active:cursor-grabbing" />
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
                              {module.lessons.map((lesson) => (
                                <div 
                                  key={lesson.id}
                                  onClick={(e) => { e.stopPropagation(); setActiveItem({ type: "LESSON", id: lesson.id })}}
                                  className={cn(
                                    "flex items-center gap-3 p-2 rounded-xl text-sm cursor-pointer transition-all",
                                    activeItem?.id === lesson.id 
                                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" 
                                      : "hover:bg-white/10 border border-transparent text-white/70 hover:text-white"
                                  )}
                                >
                                  {lesson.type === "VIDEO" && <Video className="w-3.5 h-3.5 flex-shrink-0" />}
                                  {lesson.type === "TEXT" && <FileText className="w-3.5 h-3.5 flex-shrink-0" />}
                                  {lesson.type === "QUIZ" && <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                                  {lesson.type === "LINK" && <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />}
                                  <span className="truncate flex-1">{lesson.title}</span>
                                </div>
                              ))}
                              
                              {/* Add Lesson Dropdown (Simplified) */}
                              <div className="pt-2 px-2 pb-1">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleAddLesson(module.id, "VIDEO"); }}
                                  className="flex items-center gap-2 text-xs font-bold text-white/40 hover:text-purple-400 transition-colors py-1"
                                >
                                  <Plus className="w-3 h-3" /> Add Lesson
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                          </div>
                        </SortableModuleItem>
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
        <main className="flex-1 bg-[#050505] overflow-y-auto relative p-8 lg:p-12 z-0">
          
          <div className="max-w-3xl mx-auto">
            {activeItem?.type === "COURSE" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Course Settings</h2>
                  <p className="text-white/50 text-sm">Manage the high-level details of your course.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/70 ml-1">Course Title</label>
                    <input 
                      type="text" 
                      value={courseState.title}
                      onChange={e => setCourseState(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/70 ml-1">Course Description</label>
                    <textarea 
                      rows={4} 
                      value={courseState.description}
                      onChange={e => setCourseState(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/70 ml-1">Category</label>
                      <input type="text" defaultValue="Engineering" className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/70 ml-1">Visibility</label>
                      <select 
                        value={courseState.status}
                        onChange={e => setCourseState(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 appearance-none"
                      >
                        <option value="DRAFT">Draft (Hidden)</option>
                        <option value="PUBLISHED">Published (Public)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeItem?.type === "THUMBNAIL" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Thumbnail & Trailer</h2>
                  <p className="text-white/50 text-sm">Visuals used to promote your course.</p>
                </div>
                
                <div className="space-y-6">
                  <div 
                    onClick={() => setThumbnail("https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80")}
                    className="border-2 border-dashed border-white/10 hover:border-purple-500/50 bg-white/5 rounded-3xl overflow-hidden flex flex-col items-center justify-center text-center cursor-pointer transition-colors group relative h-64"
                  >
                    {thumbnail ? (
                      <>
                        <img src={thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={(e) => { e.stopPropagation(); setThumbnail(null); }} className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg text-sm font-bold">Remove</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-2xl bg-white/5 group-hover:bg-purple-500/20 flex items-center justify-center mb-4 transition-colors">
                          <ImageIcon className="w-8 h-8 text-white/40 group-hover:text-purple-400 transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">Upload Thumbnail</h3>
                        <p className="text-sm text-white/40 mb-6">1920x1080px (16:9) recommended</p>
                        <button className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold transition-colors">
                          Select File
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeItem?.type === "PRICING" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Pricing & SEO</h2>
                  <p className="text-white/50 text-sm">Set how users purchase and find this course.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/70 ml-1">Base Price (USD)</label>
                    <input 
                      type="number" 
                      value={courseState.price}
                      onChange={(e) => setCourseState(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50" 
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeItem?.type === "MODULE" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Section Settings</h2>
                    <p className="text-white/50 text-sm">Update section title and rules.</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteModule(activeItem.id!)}
                    className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center transition-colors text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70 ml-1">Section Title</label>
                  <input 
                    type="text" 
                    value={modules.find(m => m.id === activeItem.id)?.title || ""}
                    onChange={e => updateActiveModule("title", e.target.value)}
                    className="w-full h-14 text-xl font-bold bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50" 
                  />
                </div>
              </motion.div>
            )}

            {activeItem?.type === "LESSON" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={modules.flatMap(m => m.lessons).find(l => l.id === activeItem.id)?.title || ""}
                      onChange={e => updateActiveLesson("title", e.target.value)}
                      className="w-full bg-transparent text-3xl font-bold focus:outline-none placeholder:text-white/20" 
                      placeholder="Lesson Title" 
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors text-white/50 hover:text-white">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteLesson(activeItem.id!)}
                      className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center transition-colors text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lesson Content Builder (Notion-style mock) */}
                <div className="space-y-4">
                  
                  {/* Video Upload Mock */}
                  <div className="border-2 border-dashed border-white/10 hover:border-purple-500/50 bg-white/5 rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 group-hover:bg-purple-500/20 flex items-center justify-center mb-4 transition-colors">
                      <MonitorPlay className="w-8 h-8 text-white/40 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Upload Video Content</h3>
                    <p className="text-sm text-white/40 mb-6">Drag & drop your MP4, MOV, or paste a Youtube link</p>
                    <button className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold transition-colors">
                      Select File
                    </button>
                  </div>

                  {/* Rich Text Block Mock */}
                  <div className="group relative">
                    <div className="absolute -left-12 top-0 bottom-0 flex items-start pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 text-white/20 hover:text-white/60"><Plus className="w-5 h-5" /></button>
                      <button className="p-1 text-white/20 hover:text-white/60"><GripVertical className="w-5 h-5" /></button>
                    </div>
                    <div className="min-h-[150px] w-full text-lg text-white/80 p-2 outline-none" contentEditable suppressContentEditableWarning>
                      Start writing your lesson notes here... Highlight text to format. Type '/' for commands like images, code blocks, or attachments.
                    </div>
                  </div>
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
