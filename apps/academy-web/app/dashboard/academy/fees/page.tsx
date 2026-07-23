"use client"

import { useState } from "react"
import { Search, Filter, Download, Plus, IndianRupee, TrendingUp, AlertCircle, FileText, CheckCircle2, Clock, XCircle, Loader2, X } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"

// Types
type InvoiceStatus = 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE' | 'CANCELLED'

export default function FeeManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: feesData, mutate, isLoading } = useApi<any>("/academy/fees")
  const { data: enrollData } = useApi<any>("/academy/enroll/all")
  
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    enrollmentId: "",
    amount: "",
    taxRate: "18",
    discount: "0",
    referralCode: "",
    dueDate: "",
    notes: ""
  })

  const stats = feesData?.stats || { totalCollected: 0, totalOutstanding: 0, overdueCount: 0 }
  const installments = feesData?.installments || []
  const enrollments = enrollData?.data || []

  const getStatusConfig = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID': return { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 }
      case 'PARTIAL': return { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Clock }
      case 'PENDING': return { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock }
      case 'OVERDUE': return { color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: AlertCircle }
      case 'CANCELLED': return { color: 'bg-white/5 text-white/40 border-white/10', icon: XCircle }
      default: return { color: 'bg-white/5 text-white/40 border-white/10', icon: Clock }
    }
  }

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi("/academy/fees/installment", {
        method: "POST",
        body: JSON.stringify({
          enrollmentId: form.enrollmentId,
          amount: Number(form.amount),
          taxRate: Number(form.taxRate),
          discount: Number(form.discount),
          referralCode: form.referralCode || undefined,
          dueDate: new Date(form.dueDate).toISOString(),
          notes: form.notes
        })
      })
      toast.success("Invoice created successfully")
      setIsSlideOverOpen(false)
      setForm({ enrollmentId: "", amount: "", taxRate: "18", discount: "0", referralCode: "", dueDate: "", notes: "" })
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to create invoice")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredInstallments = installments.filter((inv: any) => {
    const search = searchQuery.toLowerCase()
    const studentName = `${inv.enrollment?.student?.user?.firstName || ''} ${inv.enrollment?.student?.user?.lastName || ''}`.toLowerCase()
    const courseName = inv.enrollment?.batch?.course?.name?.toLowerCase() || ''
    return studentName.includes(search) || inv.id.toLowerCase().includes(search) || courseName.includes(search)
  })

  return (
    <div className="flex-1 overflow-y-auto h-full bg-[#050505] text-white relative">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Fee Management</h1>
            <p className="text-white/50 mt-1">Track payments, issue invoices, and manage GST compliance.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button onClick={() => setIsSlideOverOpen(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Invoice
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl transition-all" />
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 relative z-10">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-white/50 text-sm font-medium mb-1 relative z-10">Total Collected</h3>
            <div className="flex items-center gap-1 text-3xl font-bold text-white relative z-10">
              <IndianRupee className="w-6 h-6 text-white/50" />
              {stats.totalCollected.toLocaleString()}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl transition-all" />
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4 relative z-10">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-white/50 text-sm font-medium mb-1 relative z-10">Outstanding Dues</h3>
            <div className="flex items-center gap-1 text-3xl font-bold text-white relative z-10">
              <IndianRupee className="w-6 h-6 text-white/50" />
              {stats.totalOutstanding.toLocaleString()}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl transition-all" />
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4 relative z-10">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-white/50 text-sm font-medium mb-1 relative z-10">Overdue Invoices</h3>
            <div className="flex items-center gap-1 text-3xl font-bold text-white relative z-10">
              <span className="text-red-400 mr-2">{stats.overdueCount}</span> Invoices
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="Search by student name or invoice ID..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Invoices Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-white/60">
                <tr>
                  <th className="px-6 py-4 font-medium">Invoice ID</th>
                  <th className="px-6 py-4 font-medium">Student / Course</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Date Issued</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-white/50"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading Invoices...</td></tr>
                ) : filteredInstallments.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-white/50">No invoices found.</td></tr>
                ) : filteredInstallments.map((invoice: any) => {
                  const statusConfig = getStatusConfig(invoice.status)
                  const StatusIcon = statusConfig.icon
                  
                  return (
                    <tr key={invoice.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-medium text-white/80">
                          <FileText className="w-4 h-4 text-white/40" />
                          {invoice.id.split('-')[0]}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{invoice.enrollment?.student?.user?.firstName} {invoice.enrollment?.student?.user?.lastName}</div>
                        <div className="text-white/50 text-xs mt-0.5">{invoice.enrollment?.batch?.course?.name || "Unknown Course"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white flex items-center">
                          <IndianRupee className="w-3 h-3 text-white/50" />
                          {invoice.amount.toLocaleString()}
                        </div>
                        {invoice.paidAmount > 0 && <div className="text-[10px] text-emerald-400 mt-0.5">Paid: ₹{invoice.paidAmount}</div>}
                      </td>
                      <td className="px-6 py-4 text-white/60">
                        <div>{new Date(invoice.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric'})}</div>
                        <div className="text-[10px] text-white/40 mt-0.5">Due: {new Date(invoice.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric'})}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide border ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-purple-400 hover:text-purple-300 font-medium text-sm transition-colors">
                          View Details
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* SlideOver for Add Invoice */}
      {isSlideOverOpen && (
        <div className="absolute inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSlideOverOpen(false)} />
          <div className="w-[450px] bg-[#111] h-full border-l border-[#222] relative flex flex-col shadow-2xl z-10 animate-in slide-in-from-right">
            <div className="p-6 border-b border-[#222] flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                Create New Invoice
              </h2>
              <button onClick={() => setIsSlideOverOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-white/50 hover:text-white" />
              </button>
            </div>
            
            <form onSubmit={handleCreateInvoice} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70">Select Student / Course Enrollment</label>
                <select required value={form.enrollmentId} onChange={e => setForm(p => ({...p, enrollmentId: e.target.value}))} className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-purple-500 outline-none text-white appearance-none">
                  <option value="">Select Enrollment...</option>
                  {enrollments.map((enr: any) => (
                    <option key={enr.id} value={enr.id}>
                      {enr.student?.user?.firstName} {enr.student?.user?.lastName} - {enr.batch?.course?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70">Base Course Fee (₹)</label>
                <input required type="number" min="1" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-purple-500 outline-none text-white" placeholder="e.g. 50000" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70">GST / Tax Rate (%)</label>
                  <input type="number" min="0" value={form.taxRate} onChange={e => setForm(p => ({...p, taxRate: e.target.value}))} className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-purple-500 outline-none text-white" placeholder="18" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70">Fee Reduction / Discount (₹)</label>
                  <input type="number" min="0" value={form.discount} onChange={e => setForm(p => ({...p, discount: e.target.value}))} className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-purple-500 outline-none text-white" placeholder="0" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70">Referral Code (Optional)</label>
                <input value={form.referralCode} onChange={e => setForm(p => ({...p, referralCode: e.target.value.toUpperCase()}))} className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-purple-500 outline-none text-white font-mono uppercase" placeholder="e.g. ALUMNI50" />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70">Due Date</label>
                <input required type="date" value={form.dueDate} onChange={e => setForm(p => ({...p, dueDate: e.target.value}))} className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-purple-500 outline-none [color-scheme:dark] text-white" />
              </div>

              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1 font-mono">
                <div className="flex justify-between text-white/70"><span>Base Fee:</span> <span>₹{Number(form.amount || 0)}</span></div>
                <div className="flex justify-between text-white/70"><span>GST ({form.taxRate}%):</span> <span>+₹{(Number(form.amount || 0) * Number(form.taxRate || 0)) / 100}</span></div>
                <div className="flex justify-between text-white/70"><span>Discount:</span> <span>-₹{Number(form.discount || 0)}</span></div>
                <div className="flex justify-between text-purple-400 font-bold border-t border-purple-500/30 pt-1.5 text-sm">
                  <span>Net Payable Amount:</span> 
                  <span>₹{Math.max(0, Number(form.amount || 0) + ((Number(form.amount || 0) * Number(form.taxRate || 0)) / 100) - Number(form.discount || 0))}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70">Notes / Remarks</label>
                <textarea rows={3} value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-purple-500 outline-none resize-none text-white" placeholder="Optional notes regarding this installment" />
              </div>
            </form>

            <div className="p-6 border-t border-[#222] bg-[#111] flex gap-3">
              <button disabled={isSubmitting} onClick={() => setIsSlideOverOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors">
                Cancel
              </button>
              <button disabled={isSubmitting} onClick={handleCreateInvoice} className="flex-[2] py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-purple-500/20">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
