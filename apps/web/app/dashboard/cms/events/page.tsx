"use client"

import { useState, useEffect } from "react"
import { Calendar, Plus, Trash2, Clock, MapPin, Users } from "lucide-react"

export default function EventsAdminPage() {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({ 
    title: "", 
    description: "", 
    eventType: "WORKSHOP", 
    locationType: "ONLINE", 
    startDate: "", 
    endDate: "", 
    locationDetails: "", 
    maxAttendees: "" 
  })

  const fetchEvents = () => {
    fetch('/api/v1/cms/academy/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data.data || [])
        setIsLoading(false)
      })
      .catch(console.error)
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.startDate || !formData.endDate) return
    
    try {
      await fetch('/api/v1/cms/academy/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      setIsCreating(false)
      setFormData({ title: "", description: "", eventType: "WORKSHOP", locationType: "ONLINE", startDate: "", endDate: "", locationDetails: "", maxAttendees: "" })
      fetchEvents()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return
    try {
      await fetch(`/api/v1/cms/academy/events/${id}`, { method: 'DELETE' })
      fetchEvents()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Events & Masterclasses</h1>
          <p className="text-slate-500">Manage upcoming academy events, webinars, and demo sessions.</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
        >
          {isCreating ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Event</>}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4 border-b pb-2">Schedule New Event</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Event Title</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-orange-500" placeholder="e.g. Full-Stack Web Dev Masterclass" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Event Type</label>
              <select value={formData.eventType} onChange={e => setFormData({...formData, eventType: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-orange-500 bg-white">
                <option value="WORKSHOP">Workshop</option>
                <option value="SEMINAR">Seminar</option>
                <option value="HACKATHON">Hackathon</option>
                <option value="NETWORKING">Networking</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location Type</label>
              <select value={formData.locationType} onChange={e => setFormData({...formData, locationType: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-orange-500 bg-white">
                <option value="ONLINE">Online (Zoom/Meet)</option>
                <option value="IN_PERSON">In Person (Campus)</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date & Time</label>
              <input required type="datetime-local" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-orange-500" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date & Time</label>
              <input required type="datetime-local" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-orange-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
              <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-orange-500 min-h-[80px]" placeholder="Event details..." />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location Details (URL or Address)</label>
              <input type="text" value={formData.locationDetails} onChange={e => setFormData({...formData, locationDetails: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-orange-500" placeholder="Zoom Link or Physical Address" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max Attendees (optional)</label>
              <input type="number" value={formData.maxAttendees} onChange={e => setFormData({...formData, maxAttendees: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-orange-500" placeholder="e.g. 100" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 shadow-sm">Schedule Event</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12"><div className="animate-pulse w-8 h-8 rounded-full border-4 border-slate-200 border-t-orange-600" /></div>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event) => {
            const startDate = new Date(event.startDate)
            const isUpcoming = startDate > new Date()
            
            return (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row gap-5 items-start relative group hover:border-orange-200 transition-colors">
                <div className="w-20 shrink-0 flex flex-col items-center justify-center bg-orange-50 text-orange-600 rounded-lg p-2 border border-orange-100">
                  <span className="text-xs font-bold uppercase">{startDate.toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-2xl font-black">{startDate.getDate()}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-lg font-bold text-slate-900">{event.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${isUpcoming ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {isUpcoming ? 'Upcoming' : 'Past'}
                      </span>
                      <button onClick={() => handleDelete(event.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{event.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {event.locationType}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {event.maxAttendees ? `${event.maxAttendees} max capacity` : 'Unlimited capacity'}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          
          {events.length === 0 && !isCreating && (
            <div className="py-12 text-center text-slate-500 bg-white border border-slate-200 border-dashed rounded-xl">
              <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>No upcoming events or masterclasses.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
