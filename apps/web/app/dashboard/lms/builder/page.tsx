"use client"

import { useState } from "react"
import { GripVertical, Plus, Video, FileText, LayoutList, Settings, CheckCircle2, ChevronDown, Save, FileQuestion, Sparkles, Loader2 } from "lucide-react"

// Mock Data
const INITIAL_MODULES = [
  {
    id: "m1",
    title: "Module 1: Introduction to UI/UX",
    lessons: [
      { id: "l1", title: "1. Welcome to the course", type: "video", duration: "5:00" },
      { id: "l2", title: "2. The Design Process", type: "video", duration: "12:30" },
      { id: "l3", title: "3. Course Syllabus & Resources", type: "pdf", duration: "Read" },
    ]
  },
  {
    id: "m2",
    title: "Module 2: Figma Basics",
    lessons: [
      { id: "l4", title: "1. Interface Overview", type: "video", duration: "15:45" },
      { id: "l5", title: "2. Working with Components", type: "video", duration: "20:15" },
      { id: "l6", title: "3. Component Practice", type: "assignment", duration: "AI Graded" },
    ]
  }
]

export default function CourseBuilderDashboard() {
  const [modules, setModules] = useState(INITIAL_MODULES)
  const [aiSubject, setAiSubject] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateCurriculum = async () => {
    if (!aiSubject.trim()) return
    setIsGenerating(true)
    try {
      const response = await fetch('/api/v1/crm/ai/generate-curriculum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subject: aiSubject })
      })
      const result = await response.json()
      if (result?.success && Array.isArray(result.data)) {
        setModules(result.data)
        setAiSubject("")
      }
    } catch (err) {
      console.error("Failed to generate curriculum:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 uppercase tracking-wider">Draft</span>
              <h1 className="text-2xl font-bold text-foreground">Course Builder</h1>
            </div>
            <p className="text-sm text-muted-foreground">UI/UX Design Masterclass</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-all border border-border/50">
              <Settings className="w-4 h-4" />
              Course Settings
            </button>
            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
              <Save className="w-4 h-4" />
              Save & Publish
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex gap-6">
        
        {/* Main Canvas (Builder) */}
        <div className="flex-1 max-w-4xl mx-auto space-y-6">
          
          {modules.map((module, mIndex) => (
            <div key={module.id} className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden group/module transition-all hover:border-primary/30">
              {/* Module Header */}
              <div className="bg-muted/30 px-4 py-3 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing hover:text-foreground transition-colors opacity-50 group-hover/module:opacity-100" />
                  <input 
                    type="text" 
                    value={module.title}
                    onChange={(e) => {
                      const newModules = [...modules]
                      newModules[mIndex] = { ...newModules[mIndex], title: e.target.value }
                      setModules(newModules)
                    }}
                    className="bg-transparent font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 py-0.5 min-w-[300px]"
                  />
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              {/* Lessons List */}
              <div className="p-2 space-y-1">
                {module.lessons.map((lesson, lIndex) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group/lesson border border-transparent hover:border-border/50">
                    <div className="flex items-center gap-4">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab active:cursor-grabbing opacity-0 group-hover/lesson:opacity-50 hover:!opacity-100 transition-opacity" />
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        lesson.type === 'video' ? 'bg-blue-500/10 text-blue-500' :
                        lesson.type === 'pdf' ? 'bg-red-500/10 text-red-500' :
                        'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {lesson.type === 'video' && <Video className="w-4 h-4" />}
                        {lesson.type === 'pdf' && <FileText className="w-4 h-4" />}
                        {lesson.type === 'assignment' && <FileQuestion className="w-4 h-4" />}
                      </div>
                      <input 
                        type="text" 
                        value={lesson.title}
                        onChange={(e) => {
                          const newModules = [...modules]
                          const newLessons = [...newModules[mIndex].lessons]
                          newLessons[lIndex] = { ...newLessons[lIndex], title: e.target.value }
                          newModules[mIndex] = { ...newModules[mIndex], lessons: newLessons }
                          setModules(newModules)
                        }}
                        className="bg-transparent text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 py-0.5 min-w-[250px]"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground font-mono">{lesson.duration}</span>
                      <button className="text-xs font-medium text-primary hover:underline opacity-0 group-hover/lesson:opacity-100 transition-opacity">Edit</button>
                    </div>
                  </div>
                ))}

                {/* Add Lesson Dropzone */}
                <button className="w-full mt-2 py-3 border-2 border-dashed border-border/50 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Lesson
                </button>
              </div>
            </div>
          ))}

          {/* Add Module Button */}
          <button className="w-full py-4 border-2 border-dashed border-border/50 rounded-2xl text-base font-bold text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-muted/20 transition-all flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Add New Module
          </button>
        </div>

        {/* Sidebar (Tools) */}
        <div className="w-72 flex-none hidden lg:block space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm sticky top-0">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <LayoutList className="w-4 h-4 text-primary" /> Drag & Drop Elements
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 border border-border/50 rounded-xl flex items-center gap-3 cursor-grab hover:border-blue-500/50 hover:bg-blue-500/5 transition-all bg-background">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center"><Video className="w-4 h-4" /></div>
                <div className="text-sm font-medium text-foreground">Video Lesson</div>
              </div>
              <div className="p-3 border border-border/50 rounded-xl flex items-center gap-3 cursor-grab hover:border-red-500/50 hover:bg-red-500/5 transition-all bg-background">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                <div className="text-sm font-medium text-foreground">PDF / Resource</div>
              </div>
              <div className="p-3 border border-border/50 rounded-xl flex items-center gap-3 cursor-grab hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all bg-background">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><FileQuestion className="w-4 h-4" /></div>
                <div>
                  <div className="text-sm font-medium text-foreground">AI Assignment</div>
                  <div className="text-[10px] text-muted-foreground">Auto-graded via OpenAI</div>
                </div>
              </div>
              <div className="p-3 border border-border/50 rounded-xl flex items-center gap-3 cursor-grab hover:border-amber-500/50 hover:bg-amber-500/5 transition-all bg-background">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></div>
                <div className="text-sm font-medium text-foreground">Multiple Choice Quiz</div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <h4 className="font-bold text-sm text-foreground mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" /> AI Curriculum Generator
                </h4>
                <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
                  Enter a target topic to generate a comprehensive multi-module syllabus instantly.
                </p>
                <input
                  type="text"
                  placeholder="e.g. Intro to Python, Advanced Figma"
                  value={aiSubject}
                  onChange={(e) => setAiSubject(e.target.value)}
                  className="w-full bg-background border border-border/50 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground/50 mb-3"
                  disabled={isGenerating}
                />
                <button 
                  onClick={handleGenerateCurriculum}
                  disabled={isGenerating || !aiSubject.trim()}
                  className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating Outline...</>
                  ) : (
                    "Generate with AI"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
