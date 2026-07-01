"use client"

import { useState } from "react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { FolderGit2, Plus, Users, Clock, X, Loader2 } from "lucide-react"

export default function AcademyProjects() {
  const { data: projects, mutate: refreshProjects } = useApi<any[]>("/academy/projects")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState({ title: "", type: "INTERNAL", description: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi("/academy/projects", { method: "POST", body: JSON.stringify(form) })
      toast.success("Project created!")
      setIsAddOpen(false)
      setForm({ title: "", type: "INTERNAL", description: "" })
      refreshProjects()
    } catch (err: any) {
      toast.error(err.message || "Failed to create project")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <FolderGit2 className="w-8 h-8 text-cyan-500" /> Live Project Hub
          </h1>
          <p className="text-white/50 mt-2">Manage internal, client, and hackathon projects for students.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-3 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(projects || []).map((p: any) => (
          <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-cyan-500/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg">{p.title}</h3>
              <span className="text-[10px] bg-white/10 px-2 py-1 rounded font-bold uppercase">{p.type}</span>
            </div>
            <p className="text-sm text-white/50 mb-6 line-clamp-2">{p.description || "No description provided."}</p>
            <div className="flex justify-between items-center text-xs text-white/40 border-t border-white/10 pt-4">
              <div className="flex items-center gap-1"><Users className="w-4 h-4" /> {p.members?.length || 0} Members</div>
              <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {p.status}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Project Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create Project</h2>
              <button onClick={() => setIsAddOpen(false)}><X className="w-5 h-5 text-white/50 hover:text-white" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase block mb-2">Project Title</label>
                <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase block mb-2">Type</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}>
                  <option value="INTERNAL">Internal Concept</option>
                  <option value="CLIENT">Real Client Project</option>
                  <option value="HACKATHON">Hackathon</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase block mb-2">Description</label>
                <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} />
              </div>
              <button disabled={isSubmitting} type="submit"
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 font-bold rounded-xl flex justify-center items-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Project"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
