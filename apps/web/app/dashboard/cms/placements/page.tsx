"use client"

import { useState, useEffect } from "react"
import { Building2, Plus, Trash2, Globe, FileImage } from "lucide-react"

export default function PlacementsAdminPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({ name: "", industry: "", website: "", logoUrl: "" })

  const fetchCompanies = () => {
    fetch('/api/v1/cms/academy/placements')
      .then(res => res.json())
      .then(data => {
        setCompanies(data.data || [])
        setIsLoading(false)
      })
      .catch(console.error)
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return
    
    try {
      await fetch('/api/v1/cms/academy/placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      setIsCreating(false)
      setFormData({ name: "", industry: "", website: "", logoUrl: "" })
      fetchCompanies()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this hiring partner?")) return
    try {
      await fetch(`/api/v1/cms/academy/placements/${id}`, { method: 'DELETE' })
      fetchCompanies()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Hiring Partners</h1>
          <p className="text-slate-500">Manage placement companies displayed on the academy landing page.</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
        >
          {isCreating ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Partner</>}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4 border-b pb-2">Add New Hiring Partner</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-blue-500" placeholder="e.g. Google, Microsoft" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Industry</label>
              <input type="text" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-blue-500" placeholder="e.g. Technology" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Website URL</label>
              <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-blue-500" placeholder="https://" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Logo Image URL</label>
              <input type="url" value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-blue-500" placeholder="https://" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm">Save Partner</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12"><div className="animate-pulse w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <div key={company.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col relative overflow-hidden group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 overflow-hidden">
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <Building2 className="w-6 h-6 text-blue-500" />
                  )}
                </div>
                <button onClick={() => handleDelete(company.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{company.name}</h3>
                <p className="text-xs text-slate-500 mb-2">{company.industry || "No industry specified"}</p>
                {company.website && (
                  <a href={company.website} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Visit Website
                  </a>
                )}
              </div>
            </div>
          ))}
          
          {companies.length === 0 && !isCreating && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white border border-slate-200 border-dashed rounded-xl">
              <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>No hiring partners added yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
