"use client"

import { useState } from "react"
import { Calendar, Plus, Check, X, Clock, User, Filter } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { format } from "date-fns"

export default function LeavesPage() {
  const { data, mutate, isLoading } = useApi<any>("/hr/leaves")
  const leaves = data?.leaves || []

  const [filter, setFilter] = useState("ALL")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [leaveData, setLeaveData] = useState({
    type: "SICK",
    startDate: "",
    endDate: "",
    days: 1,
    reason: ""
  })

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetchApi("/hr/leaves", {
        method: "POST",
        body: JSON.stringify(leaveData)
      })
      toast.success("Leave requested successfully!")
      setIsModalOpen(false)
      setLeaveData({ type: "SICK", startDate: "", endDate: "", days: 1, reason: "" })
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to submit leave request")
    }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await fetchApi(`/hr/leaves/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      })
      toast.success(`Leave request ${status.toLowerCase()}`)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    }
  }

  const filteredLeaves = leaves.filter((leave: any) => 
    filter === "ALL" ? true : leave.status === filter
  )

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20"><Clock className="w-3 h-3" /> Pending</span>
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"><Check className="w-3 h-3" /> Approved</span>
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-red-500/10 text-red-500 border border-red-500/20"><X className="w-3 h-3" /> Rejected</span>
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
            <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
            <p className="text-sm text-white/50 mt-2">Manage employee time off and absences</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          >
            <Plus className="w-4 h-4" /> Request Leave
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-8">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-48 bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-white appearance-none cursor-pointer"
            >
              <option value="ALL">All Requests</option>
              <option value="PENDING">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        <div className="grid gap-4">
          {isLoading ? (
            <div className="text-center py-12 text-white/40">Loading requests...</div>
          ) : filteredLeaves.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
              <Calendar className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-white/50">No leave requests found</p>
            </div>
          ) : (
            filteredLeaves.map((leave: any) => (
              <div key={leave.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 w-48 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                      <User className="w-5 h-5 text-white/60" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{leave.employee?.user?.name || 'Unknown Employee'}</div>
                      <div className="text-[10px] text-white/40 font-mono mt-0.5">{leave.employee?.department || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="w-px h-10 bg-white/10 shrink-0" />

                  <div className="w-64">
                    <div className="text-xs font-medium text-white/70 mb-1 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-white/40" />
                      {format(new Date(leave.startDate), 'MMM d, yyyy')} - {format(new Date(leave.endDate), 'MMM d, yyyy')}
                    </div>
                    <div className="text-[10px] font-mono text-white/50 bg-black/40 px-2 py-1 rounded inline-block">
                      {leave.days} Days • {leave.type.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="w-px h-10 bg-white/10 shrink-0" />

                  <div className="flex-1 max-w-md">
                    <div className="text-xs text-white/60 line-clamp-2">{leave.reason}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pl-4 border-l border-white/10 shrink-0">
                  {getStatusBadge(leave.status)}
                  
                  {leave.status === 'PENDING' && (
                    <div className="flex items-center gap-2 ml-2">
                      <button 
                        onClick={() => handleStatusUpdate(leave.id, 'APPROVED')}
                        className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(leave.id, 'REJECTED')}
                        className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    {/* Request Leave Modal */}
      {isModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Request Leave</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitLeave} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-mono tracking-widest uppercase text-white/50">Leave Type</label>
                <select 
                  value={leaveData.type}
                  onChange={e => setLeaveData({...leaveData, type: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white appearance-none cursor-pointer"
                  required
                >
                  <option value="SICK" className="bg-black text-white">Sick Leave</option>
                  <option value="CASUAL" className="bg-black text-white">Casual Leave</option>
                  <option value="EARNED" className="bg-black text-white">Annual PTO</option>
                  <option value="UNPAID" className="bg-black text-white">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono tracking-widest uppercase text-white/50">Start Date</label>
                  <input 
                    type="date" 
                    value={leaveData.startDate}
                    onChange={e => setLeaveData({...leaveData, startDate: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono tracking-widest uppercase text-white/50">End Date</label>
                  <input 
                    type="date" 
                    value={leaveData.endDate}
                    onChange={e => setLeaveData({...leaveData, endDate: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono tracking-widest uppercase text-white/50">Total Days</label>
                <input 
                  type="number" 
                  min="0.5" step="0.5"
                  value={leaveData.days}
                  onChange={e => setLeaveData({...leaveData, days: parseFloat(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono tracking-widest uppercase text-white/50">Reason</label>
                <textarea 
                  value={leaveData.reason}
                  onChange={e => setLeaveData({...leaveData, reason: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white resize-none h-24"
                  placeholder="Please provide a brief explanation..."
                  required
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-white/60 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold tracking-wide rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
