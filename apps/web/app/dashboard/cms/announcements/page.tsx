"use client"

import { useState, useEffect } from "react"
import { Megaphone, Plus, Trash2, AlertCircle, Info, Star } from "lucide-react"

export default function AnnouncementsAdminPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({ 
    title: "", 
    content: "", 
    type: "SYSTEM", 
    priority: "MEDIUM", 
    isPublished: true, 
    validUntil: "" 
  })

  const fetchAnnouncements = () => {
    fetch('/api/v1/cms/academy/announcements')
      .then(res => res.json())
      .then(data => {
        setAnnouncements(data.data || [])
        setIsLoading(false)
      })
      .catch(console.error)
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) return
    
    try {
      await fetch('/api/v1/cms/academy/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      setIsCreating(false)
      setFormData({ title: "", content: "", type: "SYSTEM", priority: "MEDIUM", isPublished: true, validUntil: "" })
      fetchAnnouncements()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return
    try {
      await fetch(`/api/v1/cms/academy/announcements/${id}`, { method: 'DELETE' })
      fetchAnnouncements()
    } catch (err) {
      console.error(err)
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'HIGH': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'MEDIUM': return <Star className="w-4 h-4 text-amber-500" />
      default: return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Live Announcements</h1>
          <p className="text-slate-500">Push urgent messages and promotional banners to the academy landing page.</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
        >
          {isCreating ? 'Cancel' : <><Plus className="w-4 h-4" /> New Announcement</>}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4 border-b pb-2">Create Announcement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Headline (Short)</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-red-500" placeholder="e.g. Early Bird Discount ends tonight!" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Message</label>
              <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-red-500 min-h-[80px]" placeholder="Get 20% off all courses..." />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-red-500 bg-white">
                <option value="SYSTEM">System / General</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="FEATURE">Feature Release</option>
                <option value="PROMOTION">Promotion / Offer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Priority</label>
              <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-red-500 bg-white">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High (Urgent)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valid Until (Auto-hide after)</label>
              <input type="datetime-local" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-red-500" />
            </div>

            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" id="isPublished" checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} className="w-4 h-4 accent-red-600 rounded" />
              <label htmlFor="isPublished" className="text-sm font-bold text-slate-700 cursor-pointer">Publish immediately</label>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-sm">Push Announcement</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12"><div className="animate-pulse w-8 h-8 rounded-full border-4 border-slate-200 border-t-red-600" /></div>
      ) : (
        <div className="flex flex-col gap-4">
          {announcements.map((announcement) => {
            const isValid = !announcement.validUntil || new Date(announcement.validUntil) > new Date()
            const isActive = announcement.isPublished && isValid

            return (
              <div key={announcement.id} className={`bg-white rounded-xl shadow-sm border p-5 flex flex-col md:flex-row gap-4 items-start relative group transition-colors ${isActive ? 'border-red-200 border-l-4 border-l-red-500' : 'border-slate-200 opacity-70'}`}>
                <div className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-full ${isActive ? 'bg-red-50' : 'bg-slate-100'}`}>
                  {getPriorityIcon(announcement.priority)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-lg font-bold text-slate-900">{announcement.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${isActive ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button onClick={() => handleDelete(announcement.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-2">{announcement.content}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                    <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">Type: {announcement.type}</span>
                    {announcement.validUntil && (
                      <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        Expires: {new Date(announcement.validUntil).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          
          {announcements.length === 0 && !isCreating && (
            <div className="py-12 text-center text-slate-500 bg-white border border-slate-200 border-dashed rounded-xl">
              <Megaphone className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>No active announcements.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
