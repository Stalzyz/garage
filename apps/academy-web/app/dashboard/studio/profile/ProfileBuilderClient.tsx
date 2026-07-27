"use client"

import { useState, useTransition } from "react"
import { motion } from "framer-motion"
import { Save, Loader2, Link as LinkIcon, User, Camera, Eye } from "lucide-react"
import { updateEducatorProfile, checkSlugAvailability } from "./actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function ProfileBuilderClient({ initialEducator }: { initialEducator: any }) {
  const [isPending, startTransition] = useTransition()
  
  const [formData, setFormData] = useState({
    slug: initialEducator.slug || "",
    tagline: initialEducator.tagline || "",
    bio: initialEducator.bio || "",
    youtubeUrl: initialEducator.youtubeUrl || "",
    twitterUrl: initialEducator.twitterUrl || "",
    instagramUrl: initialEducator.instagramUrl || "",
    linkedInUrl: initialEducator.linkedInUrl || "",
    isPublic: initialEducator.isPublic || false,
    coverImageUrl: initialEducator.coverImageUrl || "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop"
  })

  const [slugError, setSlugError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === "slug") setSlugError("")
  }

  const handleSave = () => {
    if (!formData.slug) {
      setSlugError("Vanity URL is required")
      return
    }

    startTransition(async () => {
      try {
        const isAvailable = await checkSlugAvailability(formData.slug, initialEducator.id)
        if (!isAvailable) {
          setSlugError("This URL is already taken")
          return
        }
        
        await updateEducatorProfile(initialEducator.id, formData)
        toast.success("Profile saved successfully!")
      } catch (err: any) {
        toast.error(err.message || "Failed to save profile")
      }
    })
  }

  return (
    <div className="h-full flex flex-col bg-[#050505] text-white overflow-hidden">
      
      {/* Top Bar */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <User className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-sm">Instructor Profile Builder</h1>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span className={cn("w-2 h-2 rounded-full", formData.isPublic ? "bg-emerald-500" : "bg-yellow-500")} /> 
              {formData.isPublic ? "PUBLIC" : "DRAFT"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {formData.isPublic && formData.slug && (
            <a href={`/@${formData.slug}`} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold transition-colors flex items-center gap-2">
              <Eye className="w-4 h-4" /> View Live
            </a>
          )}
          <button onClick={handleSave} disabled={isPending} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)] disabled:opacity-50">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL - Editor Area */}
        <aside className="w-96 border-r border-white/10 bg-[#0a0a0a] flex flex-col shrink-0 h-full overflow-y-auto custom-scrollbar">
          
          <div className="p-6 space-y-8">
            
            {/* Status */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white/70 uppercase tracking-widest border-b border-white/10 pb-2">Visibility</h2>
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <input 
                  type="checkbox" 
                  checked={formData.isPublic} 
                  onChange={(e) => setFormData(p => ({ ...p, isPublic: e.target.checked }))} 
                  className="w-5 h-5 accent-indigo-500 rounded bg-black/50 border-white/20" 
                />
                <div>
                  <div className="font-bold text-sm">Make Profile Public</div>
                  <div className="text-xs text-white/50">Allow students to view your portfolio</div>
                </div>
              </label>
            </div>

            {/* Profile Info */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white/70 uppercase tracking-widest border-b border-white/10 pb-2">Profile Information</h2>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 ml-1">Vanity URL (Slug) *</label>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-shadow">
                  <span className="text-white/40 text-sm">academy.grekam.in/@</span>
                  <input 
                    name="slug"
                    type="text" 
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full h-12 bg-transparent text-sm font-bold text-white focus:outline-none placeholder:text-white/20" 
                    placeholder="yourname"
                  />
                </div>
                {slugError && <p className="text-xs text-red-400 ml-1 font-semibold">{slugError}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 ml-1">Tagline</label>
                <input 
                  name="tagline"
                  type="text" 
                  value={formData.tagline}
                  onChange={handleChange}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500/50" 
                  placeholder="e.g., Lead Instructor & Filmmaker" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 ml-1">Bio</label>
                <textarea 
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full h-24 py-3 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none custom-scrollbar" 
                  placeholder="Tell students about your background and expertise..." 
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white/70 uppercase tracking-widest border-b border-white/10 pb-2">Social Links</h2>
              
              <div className="space-y-2">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-shadow">
                  <LinkIcon className="w-4 h-4 text-white/40" />
                  <input 
                    name="youtubeUrl"
                    type="text" 
                    value={formData.youtubeUrl}
                    onChange={handleChange}
                    className="w-full h-12 bg-transparent text-sm ml-3 focus:outline-none placeholder:text-white/20" 
                    placeholder="YouTube Channel URL"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-shadow">
                  <LinkIcon className="w-4 h-4 text-white/40" />
                  <input 
                    name="instagramUrl"
                    type="text" 
                    value={formData.instagramUrl}
                    onChange={handleChange}
                    className="w-full h-12 bg-transparent text-sm ml-3 focus:outline-none placeholder:text-white/20" 
                    placeholder="Instagram Profile URL"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-shadow">
                  <LinkIcon className="w-4 h-4 text-white/40" />
                  <input 
                    name="twitterUrl"
                    type="text" 
                    value={formData.twitterUrl}
                    onChange={handleChange}
                    className="w-full h-12 bg-transparent text-sm ml-3 focus:outline-none placeholder:text-white/20" 
                    placeholder="Twitter/X Profile URL"
                  />
                </div>
              </div>
            </div>

          </div>
        </aside>

        {/* RIGHT PANEL - Live Preview */}
        <main className="flex-1 bg-[#111] overflow-y-auto relative flex items-center justify-center p-12 custom-scrollbar">
          
          {/* Mobile Frame Mockup */}
          <div className="w-[375px] h-[812px] bg-black rounded-[40px] border-[12px] border-[#1a1a1a] shadow-2xl overflow-hidden relative shrink-0 ring-1 ring-white/10">
            {/* Dynamic Island Mockup */}
            <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50">
              <div className="w-32 h-7 bg-[#1a1a1a] rounded-b-3xl"></div>
            </div>

            {/* Preview Content */}
            <div className="h-full overflow-y-auto bg-[#0a0a0a] custom-scrollbar pb-10">
              
              {/* Cover Image */}
              <div className="h-40 w-full relative">
                <img src={formData.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
                <button className="absolute top-8 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20 text-white hover:bg-black/70">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Header */}
              <div className="px-6 -mt-12 relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full border-4 border-[#0a0a0a] bg-[#1a1a1a] overflow-hidden mb-3">
                  <img src={initialEducator.user?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + initialEducator.userId} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                
                <h2 className="text-xl font-bold tracking-tight">
                  {initialEducator.user?.firstName} {initialEducator.user?.lastName}
                </h2>
                
                {formData.tagline && (
                  <p className="text-[#a855f7] font-semibold text-sm mt-1">{formData.tagline}</p>
                )}
                
                {formData.bio && (
                  <p className="text-white/60 text-xs mt-3 leading-relaxed">
                    {formData.bio}
                  </p>
                )}

                {/* Social Icons row */}
                <div className="flex items-center gap-3 mt-4">
                  {formData.youtubeUrl && (
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white hover:bg-[#ff0000] hover:border-transparent transition-colors">
                      <LinkIcon className="w-4 h-4" />
                    </a>
                  )}
                  {formData.instagramUrl && (
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white hover:bg-[#E1306C] hover:border-transparent transition-colors">
                      <LinkIcon className="w-4 h-4" />
                    </a>
                  )}
                  {formData.twitterUrl && (
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white hover:bg-[#1DA1F2] hover:border-transparent transition-colors">
                      <LinkIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Course Blocks */}
              {initialEducator.batches && initialEducator.batches.length > 0 && (
                <div className="px-6 mt-8 space-y-4">
                  <h3 className="font-bold text-sm tracking-widest uppercase text-white/50 mb-4">My Courses</h3>
                  
                  {initialEducator.batches.map((batch: any, i: number) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 hover:border-indigo-500/50 transition-colors cursor-pointer group relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-16 h-16 rounded-xl bg-black overflow-hidden shrink-0">
                        {batch.course?.thumbnail ? (
                          <img src={batch.course.thumbnail} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-white/10 flex items-center justify-center">
                            <MonitorPlay className="w-6 h-6 text-white/20" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 relative z-10">
                        <h4 className="font-bold text-sm leading-tight mb-1">{batch.course?.name || "Untitled Course"}</h4>
                        <p className="text-xs text-white/50">{batch.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

        </main>
      </div>
    </div>
  )
}

function MonitorPlay(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="m10 10 5 3-5 3v-6z" />
    </svg>
  )
}
