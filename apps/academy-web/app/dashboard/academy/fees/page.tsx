"use client"

import { useState } from "react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import {
  IndianRupee, AlertCircle, Clock, CheckCircle2,
  ChevronRight, Phone, MessageSquare, Mail, Loader2, PlusCircle, X
} from "lucide-react"
import Link from "next/link"

function StatCard({ label, value, color, icon: Icon }: any) {
  return (
    <div className={`bg-black/40 border ${color} rounded-2xl p-6 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.replace('border-', 'bg-').replace('/20', '/10')}`}>
        <Icon className={`w-6 h-6 ${color.replace('border-', 'text-').replace('/20', '')}`} />
      </div>
      <div>
        <p className="text-white/50 text-sm">{label}</p>
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
    </div>
  )
}

export default function FeeCollectionPage() {
  const { data, mutate, isLoading } = useApi<any>("/academy/fees")
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addForm, setAddForm] = useState({ enrollmentId: "", dueDate: "", amount: "", notes: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const stats = data?.stats
  const overdueList = data?.overdue || []
  const upcomingList = data?.upcoming || []

  const handleAddInstallment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi("/academy/fees/installment", {
        method: "POST",
        body: JSON.stringify({
          enrollmentId: addForm.enrollmentId,
          dueDate: addForm.dueDate,
          amount: parseFloat(addForm.amount),
          notes: addForm.notes || undefined
        })
      })
      toast.success("Fee installment created!")
      setAddModalOpen(false)
      setAddForm({ enrollmentId: "", dueDate: "", amount: "", notes: "" })
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to create installment")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading && !data) {
    return <div className="flex h-full items-center justify-center text-white"><Loader2 className="animate-spin w-6 h-6" /></div>
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white p-8 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Fee Collection</h1>
          <p className="text-white/40 text-sm mt-1">Monitor outstanding dues, overdue accounts and upcoming payments</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 bg-white text-black font-bold text-sm px-5 py-3 rounded-xl hover:scale-105 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Add Installment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Collected" value={`₹${(stats?.totalCollected || 0).toLocaleString('en-IN')}`} color="border-emerald-500/20" icon={CheckCircle2} />
        <StatCard label="Outstanding" value={`₹${(stats?.totalOutstanding || 0).toLocaleString('en-IN')}`} color="border-amber-500/20" icon={IndianRupee} />
        <StatCard label="Overdue Accounts" value={stats?.overdueCount || 0} color="border-red-500/20" icon={AlertCircle} />
        <StatCard label="Due in 7 Days" value={stats?.upcomingCount || 0} color="border-blue-500/20" icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Board */}
        <div className="bg-white/[0.02] border border-red-500/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4" /> Overdue ({overdueList.length})
          </h2>
          <div className="space-y-3">
            {overdueList.length === 0 && <p className="text-white/30 text-sm text-center py-6">No overdue accounts 🎉</p>}
            {overdueList.map((inst: any) => {
              const student = inst.enrollment?.student
              const name = `${student?.user?.firstName || ''} ${student?.user?.lastName || ''}`.trim()
              const daysOverdue = Math.floor((Date.now() - new Date(inst.dueDate).getTime()) / (1000 * 60 * 60 * 24))
              return (
                <Link key={inst.id} href={`/dashboard/academy/fees/${student?.id}`}
                  className="flex items-center gap-4 p-4 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/10 transition-colors group">
                  <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center font-bold text-xs text-red-400">
                    {name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{name}</p>
                    <p className="text-[11px] text-white/40">{inst.enrollment?.batch?.name} · {daysOverdue}d overdue</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-red-400">₹{(inst.amount - inst.paidAmount).toLocaleString('en-IN')}</p>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white ml-auto mt-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Upcoming Dues */}
        <div className="bg-white/[0.02] border border-amber-500/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-400">
            <Clock className="w-4 h-4" /> Upcoming (Next 7 Days)
          </h2>
          <div className="space-y-3">
            {upcomingList.length === 0 && <p className="text-white/30 text-sm text-center py-6">No upcoming dues</p>}
            {upcomingList.map((inst: any) => {
              const student = inst.enrollment?.student
              const name = `${student?.user?.firstName || ''} ${student?.user?.lastName || ''}`.trim()
              const daysLeft = Math.ceil((new Date(inst.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return (
                <Link key={inst.id} href={`/dashboard/academy/fees/${student?.id}`}
                  className="flex items-center gap-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl hover:bg-amber-500/10 transition-colors group">
                  <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center font-bold text-xs text-amber-400">
                    {name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{name}</p>
                    <p className="text-[11px] text-white/40">{inst.enrollment?.batch?.name} · Due in {daysLeft}d</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-amber-400">₹{(inst.amount - inst.paidAmount).toLocaleString('en-IN')}</p>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white ml-auto mt-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Add Installment Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Add Fee Installment</h2>
              <button onClick={() => setAddModalOpen(false)}><X className="w-5 h-5 text-white/50 hover:text-white" /></button>
            </div>
            <form onSubmit={handleAddInstallment} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Enrollment ID</label>
                <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  placeholder="Enrollment ID from the student record"
                  value={addForm.enrollmentId} onChange={e => setAddForm(p => ({...p, enrollmentId: e.target.value}))} />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Due Date</label>
                <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  value={addForm.dueDate} onChange={e => setAddForm(p => ({...p, dueDate: e.target.value}))} />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Amount (₹)</label>
                <input required type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  placeholder="e.g. 8000"
                  value={addForm.amount} onChange={e => setAddForm(p => ({...p, amount: e.target.value}))} />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Notes (optional)</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  placeholder="e.g. Month 2 fee"
                  value={addForm.notes} onChange={e => setAddForm(p => ({...p, notes: e.target.value}))} />
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Installment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
