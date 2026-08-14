"use client"

import { useState, useEffect } from "react"
import { Briefcase, Plus, Trash2, ExternalLink, Link2 } from "lucide-react"

export default function PortfolioAdminPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({ title: "", description: "", thumbnailUrl: "", projectUrl: "", repositoryUrl: "", technologies: "" })

  const fetchProjects = () => {
    fetch('/api/v1/cms/academy/portfolio')
      .then(res => res.json())
      .then(data => {
        setProjects(data.data || [])
        setIsLoading(false)
      })
      .catch(console.error)
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) return
    
    try {
      await fetch('/api/v1/cms/academy/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          imageUrl: formData.thumbnailUrl,
          linkUrl: formData.projectUrl,
          technologies: formData.technologies.split(',').map(t => t.trim()).filter(Boolean)
        })
      })
      setIsCreating(false)
      setFormData({ title: "", description: "", thumbnailUrl: "", projectUrl: "", repositoryUrl: "", technologies: "" })
      fetchProjects()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this portfolio project?")) return
    try {
      await fetch(`/api/v1/cms/academy/portfolio/${id}`, { method: 'DELETE' })
      fetchProjects()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Student Portfolios</h1>
          <p className="text-slate-500">Manage student showcase projects for the academy landing page.</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
        >
          {isCreating ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Project</>}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4 border-b pb-2">Add New Showcase Project</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Project Title</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500" placeholder="e.g. E-Commerce Platform" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Technologies (comma separated)</label>
              <input type="text" value={formData.technologies} onChange={e => setFormData({...formData, technologies: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500" placeholder="React, Node, Prisma" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
              <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500 min-h-[80px]" placeholder="A brief description of what this project does..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Live URL (optional)</label>
              <input type="url" value={formData.projectUrl} onChange={e => setFormData({...formData, projectUrl: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500" placeholder="https://" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">GitHub / Repo URL (optional)</label>
              <input type="url" value={formData.repositoryUrl} onChange={e => setFormData({...formData, repositoryUrl: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500" placeholder="https://github.com/..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Thumbnail Image URL</label>
              <input type="url" value={formData.thumbnailUrl} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500" placeholder="https://" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-sm">Save Project</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12"><div className="animate-pulse w-8 h-8 rounded-full border-4 border-slate-200 border-t-purple-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col relative overflow-hidden group">
              <div className="h-40 bg-slate-100 relative">
                {project.imageUrl ? (
                  <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-slate-300">
                    <Briefcase className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDelete(project.id)} className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 shadow-sm">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{project.title}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">{project.description}</p>
                
                {project.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.technologies.slice(0, 4).map((tech: string) => (
                      <span key={tech} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-semibold border border-slate-200">{tech}</span>
                    ))}
                    {project.technologies.length > 4 && <span className="text-[10px] px-2 py-0.5 text-slate-400">+{project.technologies.length - 4}</span>}
                  </div>
                )}

                <div className="flex items-center gap-3 mt-auto pt-3 border-t border-slate-100">
                  {project.linkUrl && (
                    <a href={project.linkUrl} target="_blank" rel="noreferrer" className="text-xs text-purple-600 hover:underline flex items-center gap-1 font-medium">
                      <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                    </a>
                  )}
                  {project.repositoryUrl && (
                    <a href={project.repositoryUrl} target="_blank" rel="noreferrer" className="text-xs text-slate-600 hover:underline flex items-center gap-1 font-medium">
                      <Link2 className="w-3.5 h-3.5" /> Source
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {projects.length === 0 && !isCreating && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white border border-slate-200 border-dashed rounded-xl">
              <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>No student projects showcased yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
