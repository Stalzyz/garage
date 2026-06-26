"use client"

import { useState } from "react"
import { Search, Plus, Users, Calendar, Clock, BookOpen, MoreHorizontal, GraduationCap, ChevronRight } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { format } from "date-fns"

export default function BatchesPage() {
  const { data, isLoading } = useApi<any>("/academy/batches")
  const batches = data?.batches || []

  const [searchQuery, setSearchQuery] = useState("")

  const filteredBatches = batches.filter((b: any) => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.course.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">Upcoming</span>
      case 'ACTIVE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
      case 'COMPLETED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-white/10 text-white/50 border border-white/20">Completed</span>
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 py-8 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Batches & Cohorts</h1>
            <p className="text-sm text-white/50 mt-2">Manage course cohorts and schedule sessions</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <Plus className="w-4 h-4" /> Create Batch
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search batches or courses..." 
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/30"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        {isLoading ? (
          <div className="text-center py-12 text-white/40">Loading batches...</div>
        ) : filteredBatches.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
            <Users className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">No batches found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBatches.map((batch: any) => (
              <div key={batch.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-blue-400">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white leading-tight">{batch.name}</h3>
                      <p className="text-xs text-white/40 mt-0.5">{batch.course.title}</p>
                    </div>
                  </div>
                  {getStatusBadge(batch.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Duration</p>
                    <div className="flex items-center gap-1.5 text-xs text-white/80">
                      <Calendar className="w-3.5 h-3.5 text-white/30" />
                      <span>{format(new Date(batch.startDate), 'MMM d, yyyy')} - {format(new Date(batch.endDate), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Students</p>
                    <div className="flex items-center gap-1.5 text-xs text-white/80">
                      <Users className="w-3.5 h-3.5 text-white/30" />
                      <span>{batch.capacity} Max</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex -space-x-2 overflow-hidden">
                    {/* Mock avatars */}
                    {[1,2,3].map(i => (
                      <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-black bg-white/20" />
                    ))}
                    <div className="inline-flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-black bg-white/5 text-[8px] font-medium text-white">
                      +12
                    </div>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors flex items-center gap-1">
                    Manage <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
