"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Receipt, MoreHorizontal, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { fetchApi, useApi } from "@/lib/useApi"
import { toast } from "sonner"
import { useCurrency } from "@/hooks/useCurrency"
import { SlideOver } from "@/components/SlideOver"

export default function ExpensesPage() {
  const { symbol } = useCurrency()
  const { data: expensesData, mutate, isLoading } = useApi<any>("/finance/expenses")
  const expenses = expensesData?.expenses || []
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    category: "OFFICE",
    amount: "",
    vendorName: "",
    description: ""
  })

  const filteredExpenses = expenses.filter((exp: any) => {
    const matchesSearch = exp.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          exp.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || exp.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await fetchApi(`/finance/expenses/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      })
      toast.success(`Expense marked as ${newStatus}`)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    }
  }

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi("/finance/expenses", {
        method: "POST",
        body: JSON.stringify({
          category: formData.category,
          amount: parseFloat(formData.amount),
          description: formData.description || formData.title,
        })
      })
      toast.success("Expense created successfully")
      setIsAddOpen(false)
      setFormData({ title: "", category: "OFFICE", amount: "", vendorName: "", description: "" })
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to create expense")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20"><Clock className="w-3 h-3" /> Pending</span>
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"><CheckCircle className="w-3 h-3" /> Approved</span>
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-red-500/10 text-red-500 border border-red-500/20"><XCircle className="w-3 h-3" /> Rejected</span>
      case 'PAID':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-blue-500/10 text-blue-500 border border-blue-500/20"><CheckCircle className="w-3 h-3" /> Paid</span>
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-white/10 text-white/50 border border-white/20">{status}</span>
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 py-8 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
            <p className="text-sm text-white/50 mt-2">Manage vendor bills and internal expenses</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              <Plus className="w-4 h-4" /> New Expense
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mt-8">
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search expenses..." 
                className="w-64 bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/30"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40 bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-white appearance-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="PAID">Paid</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-black/40 border-b border-white/10 text-[10px] font-mono tracking-widest uppercase text-white/50">
              <tr>
                <th className="px-6 py-4 font-bold">Expense</th>
                <th className="px-6 py-4 font-bold">Vendor</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold text-right">Amount</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-white/50">Loading expenses...</td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-white/50">
                    <Receipt className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    No expenses found
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp: any) => (
                  <tr key={exp.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{exp.title}</div>
                      <div className="text-[10px] text-white/40 font-mono mt-1">{exp.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                          {exp.vendor?.name?.charAt(0) || "V"}
                        </div>
                        <span className="text-white/80">{exp.vendor?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/60 font-mono text-xs">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono text-white font-medium">{symbol}{exp.amount?.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(exp.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {exp.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleUpdateStatus(exp.id, 'APPROVED')} className="p-1.5 hover:bg-emerald-500/20 text-emerald-400 rounded-md transition-colors" title="Approve">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleUpdateStatus(exp.id, 'REJECTED')} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-md transition-colors" title="Reject">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/40 hover:text-white">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <SlideOver
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="New Expense"
      >
        <form onSubmit={handleCreateExpense} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Title</label>
              <input 
                required
                type="text" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Adobe Creative Cloud"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-white"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-white"
                >
                  <option value="OFFICE">Office</option>
                  <option value="SOFTWARE">Software</option>
                  <option value="TRAVEL">Travel</option>
                  <option value="PROJECT">Project</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Amount ({symbol})</label>
                <input 
                  required
                  type="number" 
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Description (Optional)</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Provide additional details..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-white h-24 resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <button 
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Expense"}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}
