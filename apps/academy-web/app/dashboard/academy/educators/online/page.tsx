"use client"

import { GraduationCap, Plus, Mail, Building, Briefcase, Search, Loader2, X } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { useState } from "react"
import { toast } from "sonner"

export default function OnlineEducatorsPage() {
  const { data: educatorsData, mutate, isLoading } = useApi<any[]>("/academy/educators")
  const educators = educatorsData?.filter(e => e.deliveryMode === 'ONLINE') || []
  
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    designation: "",
    company: "",
    yearsExperience: 0,
    skills: "",
    bio: ""
  })

  const handleAddEducator = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi("/academy/educators", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          yearsExperience: Number(form.yearsExperience),
          skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
          deliveryMode: 'ONLINE'
        })
      })
      toast.success("Educator added successfully!")
      setIsSlideOverOpen(false)
      setForm({ firstName: "", lastName: "", email: "", designation: "", company: "", yearsExperience: 0, skills: "", bio: "" })
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to add educator")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white p-8 overflow-y-auto relative">
      <div className="flex-none border-b border-white/10 pb-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
              <GraduationCap className="w-6 h-6 text-violet-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Remote Faculty</h1>
              <p className="text-sm text-white/50 mt-2">Manage virtual academy instructors and online cohorts</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSlideOverOpen(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 font-bold px-6 py-3 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Educator
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(educators || []).map((educator: any) => (
            <div key={educator.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative group overflow-hidden">
              <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest">
                ACTIVE
              </div>
              
              <div className="w-16 h-16 rounded-full bg-violet-500/20 border-2 border-violet-500/30 flex items-center justify-center text-2xl font-black text-violet-400 mb-4">
                {educator.user.firstName.charAt(0)}{educator.user.lastName.charAt(0)}
              </div>
              
              <h3 className="text-lg font-bold truncate">{educator.user.firstName} {educator.user.lastName}</h3>
              <p className="text-sm text-violet-400 font-medium mb-4">{educator.designation || "Instructor"}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Mail className="w-4 h-4 text-white/30" /> <span className="truncate">{educator.user.email}</span>
                </div>
                {educator.company && (
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Building className="w-4 h-4 text-white/30" /> {educator.company}
                  </div>
                )}
                {educator.yearsExperience > 0 && (
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Briefcase className="w-4 h-4 text-white/30" /> {educator.yearsExperience} Years Experience
                  </div>
                )}
              </div>
              
              {educator.skills && educator.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                  {educator.skills.slice(0, 3).map((skill: string, i: number) => (
                    <span key={i} className="text-[10px] bg-white/10 px-2 py-1 rounded text-white/70">{skill}</span>
                  ))}
                  {educator.skills.length > 3 && (
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/50">+{educator.skills.length - 3} more</span>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {(!educators || educators.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/10 rounded-3xl">
              <GraduationCap className="w-16 h-16 text-white/10 mb-4" />
              <h2 className="text-xl font-bold text-white/80">No Remote Educators Found</h2>
              <p className="text-sm text-white/40 mt-2 max-w-md">Add your first remote instructor by clicking the Add Educator button above.</p>
            </div>
          )}
        </div>
      )}

      {/* SlideOver for Add Educator */}
      {isSlideOverOpen && (
        <div className="absolute inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSlideOverOpen(false)} />
          <div className="w-[450px] bg-[#111] h-full border-l border-[#222] relative flex flex-col shadow-2xl z-10 animate-in slide-in-from-right">
            <div className="p-6 border-b border-[#222] flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-violet-500" />
                Add Educator
              </h2>
              <button onClick={() => setIsSlideOverOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-white/50 hover:text-white" />
              </button>
            </div>
            
            <form onSubmit={handleAddEducator} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70">First Name</label>
                  <input required value={form.firstName} onChange={e => setForm(p => ({...p, firstName: e.target.value}))} className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-violet-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70">Last Name</label>
                  <input required value={form.lastName} onChange={e => setForm(p => ({...p, lastName: e.target.value}))} className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-violet-500 outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70">Email Address</label>
                <input required type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-violet-500 outline-none" />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70">Designation / Role</label>
                <input value={form.designation} onChange={e => setForm(p => ({...p, designation: e.target.value}))} placeholder="e.g. Senior Frontend Instructor" className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-violet-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70">Current Company</label>
                  <input value={form.company} onChange={e => setForm(p => ({...p, company: e.target.value}))} placeholder="Optional" className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-violet-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70">Years of Experience</label>
                  <input type="number" min="0" value={form.yearsExperience} onChange={e => setForm(p => ({...p, yearsExperience: parseInt(e.target.value) || 0}))} className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-violet-500 outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70">Skills (Comma Separated)</label>
                <input value={form.skills} onChange={e => setForm(p => ({...p, skills: e.target.value}))} placeholder="React, Node.js, System Design" className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-violet-500 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70">Short Bio</label>
                <textarea rows={4} value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-violet-500 outline-none resize-none" />
              </div>
            </form>

            <div className="p-6 border-t border-[#222] bg-[#111] flex gap-3">
              <button disabled={isSubmitting} onClick={() => setIsSlideOverOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors">
                Cancel
              </button>
              <button disabled={isSubmitting} onClick={handleAddEducator} className="flex-[2] py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-violet-500/20">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Educator"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
