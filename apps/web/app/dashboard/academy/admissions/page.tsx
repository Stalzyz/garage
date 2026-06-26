"use client"

import { useState } from "react"
import { Search, Plus, UserPlus, Filter, MoreHorizontal, GraduationCap, ChevronRight, Phone } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { format } from "date-fns"
import { toast } from "sonner"

export default function AdmissionsPage() {
  const { data, mutate, isLoading } = useApi<any>("/academy/applications")
  const applications = data?.data || []

  const [searchQuery, setSearchQuery] = useState("")

  const filteredApps = applications.filter((app: any) => {
    const fn = app.student?.user?.firstName || ""
    const ln = app.student?.user?.lastName || ""
    const ct = app.course?.title || app.course?.name || ""
    return fn.toLowerCase().includes(searchQuery.toLowerCase()) ||
           ln.toLowerCase().includes(searchQuery.toLowerCase()) ||
           ct.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const columns = [
    { id: 'SUBMITTED', title: 'New Enquiries', color: 'bg-blue-500' },
    { id: 'UNDER_REVIEW', title: 'Under Review', color: 'bg-amber-500' },
    { id: 'INTERVIEW', title: 'Interview Scheduled', color: 'bg-purple-500' },
    { id: 'ACCEPTED', title: 'Accepted / Enrolled', color: 'bg-emerald-500' },
    { id: 'REJECTED', title: 'Rejected', color: 'bg-red-500' }
  ]

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("appId", id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const appId = e.dataTransfer.getData("appId")
    
    // Optimistic update
    const appToUpdate = applications.find((a: any) => a.id === appId)
    if (!appToUpdate || appToUpdate.status === newStatus) return
    
    try {
      await fetchApi(`/academy/applications/${appId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      })
      toast.success(`Application moved to ${newStatus}`)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to update application status")
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 py-8 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admissions Pipeline</h1>
            <p className="text-sm text-white/50 mt-2">Manage prospective students and enrollments</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <UserPlus className="w-4 h-4" /> New Application
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student or course..." 
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/30"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition-colors">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar p-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-white/40">Loading pipeline...</div>
        ) : (
          <div className="flex gap-6 h-full min-w-max pb-4">
            {columns.map(col => {
              const colApps = filteredApps.filter((a: any) => a.status === col.id)
              
              return (
                <div 
                  key={col.id} 
                  className="w-80 flex flex-col h-full bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between sticky top-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${col.color}`} />
                      <h3 className="font-bold text-sm tracking-wide text-white/80">{col.title}</h3>
                    </div>
                    <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded text-white/50">{colApps.length}</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                    {colApps.map((app: any) => (
                      <div 
                        key={app.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.id)}
                        className="bg-black/60 border border-white/10 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:bg-white/5 hover:border-white/20 transition-colors group relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-xs font-bold border border-white/10">
                              {app.student?.user?.firstName?.charAt(0)}{app.student?.user?.lastName?.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold leading-none">{app.student?.user?.firstName} {app.student?.user?.lastName}</h4>
                              <p className="text-[10px] text-white/40 mt-1 font-mono">ID: {app.id.slice(0, 6)}</p>
                            </div>
                          </div>
                          <button className="text-white/20 hover:text-white transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-white/60 bg-white/5 px-2 py-1.5 rounded-lg border border-white/5">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="truncate">{app.course?.name}</span>
                          </div>
                          
                          {app.student?.user?.email && (
                            <div className="flex items-center gap-2 text-[10px] text-white/50 px-1">
                              <span className="truncate">{app.student.user.email}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 font-mono">
                          <span>Applied: {app.appliedAt ? format(new Date(app.appliedAt), 'MMM d') : 'Unknown'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
