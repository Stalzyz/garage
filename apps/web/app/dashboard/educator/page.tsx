"use client"

import { useState } from "react"
import React from "react"
import {
  BookOpen, Plus, Save, Trash2, ChevronDown, ChevronRight,
  CheckCircle2, AlertCircle, Loader2, Video, FileText, ExternalLink,
  GripVertical, PenLine, X, Sparkles, Globe, Lock, Eye
} from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"

// Custom YouTube icon (not available in lucide-react)
function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

// --- Helpers ---
function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|\youtu\.be\/)([a-zA-Z0-9_-]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

function YouTubeThumbnail({ videoId }: { videoId: string }) {
  return (
    <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10">
      <img src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} alt="" className="w-full h-full object-cover opacity-70" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-red-600/90 flex items-center justify-center">
          <div className="w-0 h-0 border-t-[7px] border-b-[7px] border-l-[12px] border-transparent border-l-white ml-0.5" />
        </div>
      </div>
    </div>
  )
}

// --- Sub-components ---
function LessonRow({ lesson, onVideoSave, onDelete }: any) {
  const [isEditing, setIsEditing] = useState(false)
  const [url, setUrl] = useState(lesson.contentUrl || "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)

  const videoId = lesson.videoId || extractYouTubeId(lesson.contentUrl || "")

  const handleSave = async () => {
    const vid = extractYouTubeId(url)
    if (!vid) { setError(true); return }
    setSaving(true)
    await onVideoSave(lesson.id, vid, url)
    setSaving(false)
    setIsEditing(false)
    setError(false)
  }

  const lessonTypeIcon: Record<string, React.ReactElement> = {
    VIDEO: <Video className="w-3.5 h-3.5" />,
    PDF: <FileText className="w-3.5 h-3.5" />,
  }

  return (
    <div className={`rounded-xl border p-4 transition-all ${isEditing ? 'border-red-500/30 bg-red-500/5' : 'border-white/8 bg-white/[0.015]'}`}>
      <div className="flex items-start gap-3">
        <GripVertical className="w-4 h-4 text-white/20 mt-1 flex-none cursor-grab" />
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-none ${videoId ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/30'}`}>
          {videoId ? <YoutubeIcon className="w-3.5 h-3.5" /> : lessonTypeIcon[lesson.type] || <Video className="w-3.5 h-3.5" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white/85 truncate">{lesson.title}</p>
          <p className="text-[11px] text-white/30 mt-0.5">{lesson.type}{lesson.duration ? ` · ${lesson.duration} min` : ''}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-none">
          {videoId && !isEditing && (
            <a href={`https://youtu.be/${videoId}`} target="_blank" rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-white/30 hover:text-white/70 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button onClick={() => { setIsEditing(!isEditing); setError(false) }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${isEditing ? 'bg-white/10 text-white/50' : videoId ? 'bg-white/5 text-white/50 hover:bg-white/10' : 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)]'}`}>
            {isEditing ? 'Cancel' : videoId ? 'Change' : '+ Video'}
          </button>
          <button onClick={() => onDelete(lesson.id)}
            className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {videoId && !isEditing && (
        <div className="mt-3 ml-10 max-w-[240px]">
          <YouTubeThumbnail videoId={videoId} />
        </div>
      )}

      {isEditing && (
        <div className="mt-3 ml-10 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <YoutubeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-red-400" />
              <input type="url" placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(false) }}
                className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50 transition-colors"
              />
            </div>
            <button onClick={handleSave} disabled={saving || !url.trim()}
              className="px-3 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-500 disabled:opacity-50 flex items-center gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
            </button>
          </div>
          {url && extractYouTubeId(url) && (
            <div className="max-w-[220px]">
              <p className="text-[10px] text-white/30 mb-1">Preview:</p>
              <YouTubeThumbnail videoId={extractYouTubeId(url)!} />
            </div>
          )}
          {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Invalid YouTube URL</p>}
          <p className="text-[10px] text-white/25">💡 Use an <strong className="text-white/40">Unlisted</strong> YouTube video — it won't appear in search.</p>
        </div>
      )}
    </div>
  )
}

function ModuleSection({ module, onAddLesson, onVideoSave, onDeleteLesson, onDeleteModule }: any) {
  const [open, setOpen] = useState(true)
  const [addingLesson, setAddingLesson] = useState(false)
  const [lessonTitle, setLessonTitle] = useState("")
  const [lessonType, setLessonType] = useState<"VIDEO" | "PDF">("VIDEO")
  const [saving, setSaving] = useState(false)

  const handleAddLesson = async () => {
    if (!lessonTitle.trim()) return
    setSaving(true)
    await onAddLesson(module.id, lessonTitle.trim(), lessonType)
    setSaving(false)
    setAddingLesson(false)
    setLessonTitle("")
  }

  return (
    <div className="bg-black/20 border border-white/8 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <button onClick={() => setOpen(!open)} className="flex items-center gap-2 flex-1 text-left">
          {open ? <ChevronDown className="w-4 h-4 text-white/30" /> : <ChevronRight className="w-4 h-4 text-white/30" />}
          <span className="text-sm font-bold text-white/80">{module.title}</span>
          <span className="text-[10px] text-white/30 ml-1">({module.lessons?.length || 0} lessons)</span>
        </button>
        <button onClick={() => onDeleteModule(module.id)} className="p-1.5 text-white/20 hover:text-red-400 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {open && (
        <div className="p-4 space-y-2">
          {(module.lessons || []).map((lesson: any) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              onVideoSave={onVideoSave}
              onDelete={onDeleteLesson}
            />
          ))}

          {addingLesson ? (
            <div className="flex gap-2 mt-2">
              <input type="text" placeholder="Lesson title..."
                value={lessonTitle}
                onChange={e => setLessonTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddLesson()}
                autoFocus
                className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50"
              />
              <select value={lessonType} onChange={e => setLessonType(e.target.value as any)}
                className="bg-black/60 border border-white/10 rounded-xl px-2 py-2 text-sm text-white focus:outline-none">
                <option value="VIDEO">Video</option>
                <option value="PDF">PDF</option>
              </select>
              <button onClick={handleAddLesson} disabled={saving || !lessonTitle.trim()}
                className="px-3 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-500 disabled:opacity-50 flex items-center gap-1.5">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add
              </button>
              <button onClick={() => setAddingLesson(false)} className="p-2 text-white/30 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => setAddingLesson(true)}
              className="w-full py-2.5 border border-dashed border-white/10 rounded-xl text-xs font-semibold text-white/30 hover:text-white/60 hover:border-white/20 transition-all flex items-center justify-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add Lesson
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// --- Main Educator Studio ---
export default function EducatorStudioPage() {
  const { data, isLoading, mutate } = useApi<any>('/lms/courses')
  const { data: analyticsData } = useApi<any>('/lms/analytics/educator')
  const courses = data?.courses || []

  const [activeTab, setActiveTab] = useState<'courses' | 'create' | 'analytics'>('analytics')
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null)

  // Create Course Form
  const [form, setForm] = useState({ name: '', code: '', description: '', duration: 'Self-paced', fee: '' })
  const [creating, setCreating] = useState(false)
  const [createStatus, setCreateStatus] = useState<'idle' | 'ok' | 'err'>('idle')

  // Add Module
  const [addingModule, setAddingModule] = useState(false)
  const [moduleTitle, setModuleTitle] = useState("")
  const [savingModule, setSavingModule] = useState(false)

  const activeCourse = courses.find((c: any) => c.id === activeCourseId)

  // --- Handlers ---
  const handleCreateCourse = async () => {
    if (!form.name || !form.code) return
    setCreating(true)
    try {
      await fetchApi('/lms/courses', {
        method: 'POST',
        body: JSON.stringify({ ...form, fee: parseFloat(form.fee) || 0 })
      })
      setCreateStatus('ok')
      setForm({ name: '', code: '', description: '', duration: 'Self-paced', fee: '' })
      await mutate()
      setTimeout(() => { setCreateStatus('idle'); setActiveTab('courses') }, 1200)
    } catch {
      setCreateStatus('err')
    } finally {
      setCreating(false)
    }
  }

  const handleAddModule = async () => {
    if (!moduleTitle.trim() || !activeCourseId) return
    setSavingModule(true)
    await fetchApi('/lms/lessons/modules', {
      method: 'POST',
      body: JSON.stringify({ lmsCourseId: activeCourseId, title: moduleTitle.trim() })
    })
    setModuleTitle("")
    setAddingModule(false)
    setSavingModule(false)
    mutate()
  }

  const handleAddLesson = async (moduleId: string, title: string, type: string) => {
    await fetchApi('/lms/lessons', {
      method: 'POST',
      body: JSON.stringify({ moduleId, title, type, sortOrder: 99 })
    })
    mutate()
  }

  const handleVideoSave = async (lessonId: string, videoId: string, contentUrl: string) => {
    await fetchApi(`/lms/lessons/${lessonId}`, {
      method: 'PATCH',
      body: JSON.stringify({ videoId, contentUrl, type: 'VIDEO' })
    })
    mutate()
  }

  const handleDeleteLesson = async (lessonId: string) => {
    await fetchApi(`/lms/lessons/${lessonId}`, { method: 'DELETE' })
    mutate()
  }

  const handleDeleteModule = async (moduleId: string) => {
    await fetchApi(`/lms/lessons/modules/${moduleId}`, { method: 'DELETE' })
    mutate()
  }

  const handlePublish = async (courseId: string, current: boolean) => {
    await fetchApi(`/lms/courses/${courseId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished: !current })
    })
    mutate()
  }

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-white/30" /></div>
  }

  return (
    <div className="flex h-full bg-[#050505] text-white overflow-hidden">

      {/* Left Sidebar — Course List */}
      <div className="w-72 flex-none border-r border-white/8 flex flex-col bg-black/30">
        <div className="px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold">Educator Studio</h1>
              <p className="text-[10px] text-white/30">Create & manage your courses</p>
            </div>
          </div>
          
          <div className="flex gap-2 mb-4">
            <button onClick={() => setActiveTab('analytics')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'analytics' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5'}`}>
              Analytics
            </button>
            <button onClick={() => setActiveTab('create')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'create' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5'}`}>
              + New
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {courses.length === 0 && (
            <p className="text-center text-xs text-white/25 py-8">No courses yet.<br />Create your first one!</p>
          )}
          {courses.map((c: any) => (
            <button key={c.id}
              onClick={() => { setActiveCourseId(c.id); setActiveTab('courses') }}
              className={`w-full text-left rounded-xl px-3 py-2.5 transition-all ${activeCourseId === c.id && activeTab === 'courses' ? 'bg-violet-500/15 border border-violet-500/30' : 'hover:bg-white/5 border border-transparent'}`}>
              <p className="text-sm font-semibold text-white/80 truncate">{c.course?.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-white/30">{c.modules?.length || 0} modules</span>
                {c.isPublished
                  ? <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">LIVE</span>
                  : <span className="text-[9px] font-bold text-white/20 bg-white/5 px-1.5 py-0.5 rounded">DRAFT</span>
                }
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Analytics Dashboard */}
        {activeTab === 'analytics' && (
          <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
            <h2 className="text-2xl font-bold mb-6">Student Analytics</h2>
            
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <p className="text-sm font-bold text-white/50 mb-2">Total Students Enrolled</p>
                <p className="text-4xl font-black">{analyticsData?.metrics?.totalStudents || 0}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <p className="text-sm font-bold text-white/50 mb-2">Avg. Completion Rate</p>
                <p className="text-4xl font-black text-emerald-400">{analyticsData?.metrics?.avgCompletionPct || 0}%</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <p className="text-sm font-bold text-white/50 mb-2">Total Courses</p>
                <p className="text-4xl font-black text-violet-400">{analyticsData?.metrics?.totalCourses || 0}</p>
              </div>
            </div>

            <h3 className="text-lg font-bold mb-4">Recent Enrollments</h3>
            <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-white/50 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-wider">Student Name</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Course</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Progress</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Enrolled On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(!analyticsData?.recentEnrollments || analyticsData.recentEnrollments.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-white/30">No students enrolled yet.</td>
                    </tr>
                  )}
                  {(analyticsData?.recentEnrollments || []).map((enrollment: any) => (
                    <tr key={enrollment.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium">{enrollment.studentName}</td>
                      <td className="px-6 py-4 text-white/70">{enrollment.courseName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${enrollment.progressPct}%` }} />
                          </div>
                          <span className="text-xs text-white/50">{enrollment.progressPct}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/50">{new Date(enrollment.enrolledAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Course Form */}
        {activeTab === 'create' && (
          <div className="flex-1 overflow-y-auto p-8 max-w-2xl mx-auto w-full">
            <h2 className="text-2xl font-bold mb-1">Create New Course</h2>
            <p className="text-white/40 text-sm mb-8">Set up the course structure — you'll add modules & videos after.</p>

            <div className="space-y-4">
              {[
                { label: 'Course Name *', key: 'name', placeholder: 'e.g. UI/UX Design Masterclass' },
                { label: 'Course Code *', key: 'code', placeholder: 'e.g. UIUX-101' },
                { label: 'Description', key: 'description', placeholder: 'What will students learn?' },
                { label: 'Duration', key: 'duration', placeholder: 'e.g. 8 Weeks, Self-paced' },
                { label: 'Fee (₹)', key: 'fee', placeholder: '0 for free' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5 block">{field.label}</label>
                  {field.key === 'description' ? (
                    <textarea
                      placeholder={field.placeholder}
                      value={form[field.key as keyof typeof form]}
                      onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      rows={3}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                    />
                  ) : (
                    <input
                      type={field.key === 'fee' ? 'number' : 'text'}
                      placeholder={field.placeholder}
                      value={form[field.key as keyof typeof form]}
                      onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                  )}
                </div>
              ))}

              <button onClick={handleCreateCourse} disabled={creating || !form.name || !form.code}
                className="w-full py-3.5 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                {creating ? 'Creating...' : 'Create Course'}
              </button>

              {createStatus === 'ok' && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm justify-center">
                  <CheckCircle2 className="w-4 h-4" /> Course created! Add modules & videos next.
                </div>
              )}
              {createStatus === 'err' && (
                <div className="flex items-center gap-2 text-red-400 text-sm justify-center">
                  <AlertCircle className="w-4 h-4" /> Something went wrong. Check the course code is unique.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Course Editor */}
        {activeTab === 'courses' && activeCourse && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Course Header Bar */}
            <div className="flex-none px-8 py-4 border-b border-white/8 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">{activeCourse.course?.name}</h2>
                <p className="text-xs text-white/40 mt-0.5">{activeCourse.modules?.length || 0} modules · {activeCourse.modules?.reduce((a: number, m: any) => a + (m.lessons?.length || 0), 0)} lessons</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handlePublish(activeCourse.id, activeCourse.isPublished)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeCourse.isPublished
                    ? 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10'
                    : 'bg-emerald-600/80 text-white hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'}`}>
                  {activeCourse.isPublished
                    ? <><Lock className="w-4 h-4" /> Unpublish</>
                    : <><Globe className="w-4 h-4" /> Publish</>}
                </button>
              </div>
            </div>

            {/* Modules + Lessons */}
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              {(activeCourse.modules || []).map((module: any) => (
                <ModuleSection
                  key={module.id}
                  module={module}
                  onAddLesson={handleAddLesson}
                  onVideoSave={handleVideoSave}
                  onDeleteLesson={handleDeleteLesson}
                  onDeleteModule={handleDeleteModule}
                />
              ))}

              {/* Add Module */}
              {addingModule ? (
                <div className="flex gap-2">
                  <input type="text" placeholder="Module title (e.g. Introduction to Figma)"
                    value={moduleTitle}
                    onChange={e => setModuleTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddModule()}
                    autoFocus
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50"
                  />
                  <button onClick={handleAddModule} disabled={savingModule || !moduleTitle.trim()}
                    className="px-4 py-3 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-500 disabled:opacity-50 flex items-center gap-2">
                    {savingModule ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Module
                  </button>
                  <button onClick={() => setAddingModule(false)} className="p-3 text-white/30 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => setAddingModule(true)}
                  className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-sm font-bold text-white/30 hover:text-white/60 hover:border-white/20 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" /> Add Module
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

