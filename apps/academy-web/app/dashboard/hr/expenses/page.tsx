"use client"

import { useState } from "react"
import { Search, Plus, Paperclip, Receipt, IndianRupee, CheckCircle, Clock, XCircle, MoreHorizontal, Loader2 } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"

export default function ExpensesDashboard() {
  const { data, mutate, isLoading } = useApi<any>("/hr/expenses")
  const allExpenses = data?.expenses || []

  const { data: empData } = useApi<any>("/hr/employees")
  const allEmployees = empData?.employees || []

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    employeeId: "",
    category: "SOFTWARE",
    amount: "",
    description: ""
  })

  const filteredExpenses = allExpenses.filter((exp: any) => {
    if (filter !== "all" && exp.status?.toLowerCase() !== filter) return false
    if (search && !exp.employeeName?.toLowerCase().includes(search.toLowerCase()) && !exp.category?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const pendingCount = allExpenses.filter((e: any) => e.status === "PENDING").length
  const approvedTotal = allExpenses.filter((e: any) => e.status === "APPROVED").reduce((sum: number, e: any) => sum + e.amount, 0)
  const paidTotal = allExpenses.filter((e: any) => e.status === "PAID").reduce((sum: number, e: any) => sum + e.amount, 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20"><Clock className="w-3 h-3" /> Pending</span>
      case "APPROVED":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold text-blue-500 bg-blue-500/10 border border-blue-500/20"><CheckCircle className="w-3 h-3" /> Approved</span>
      case "REJECTED":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold text-red-500 bg-red-500/10 border border-red-500/20"><XCircle className="w-3 h-3" /> Rejected</span>
      case "PAID":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20"><IndianRupee className="w-3 h-3" /> Paid</span>
      default: return null
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetchApi(`/hr/expenses/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      })
      toast.success(`Expense ${newStatus.toLowerCase()}`)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    }
  }

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi("/hr/expenses", {
        method: "POST",
        body: JSON.stringify({
          employeeId: formData.employeeId || undefined,
          category: formData.category,
          amount: parseFloat(formData.amount),
          description: formData.description
        })
      })
      toast.success("Expense claim submitted!")
      setIsSubmitOpen(false)
      setFormData({ employeeId: "", category: "SOFTWARE", amount: "", description: "" })
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to submit claim")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Expense Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Review and approve employee reimbursement claims.</p>
          </div>
          <button onClick={() => setIsSubmitOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
            <Plus className="w-4 h-4" /> Submit Claim
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border/50 p-5 rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Pending Approvals</p>
              <p className="text-2xl font-bold text-foreground">{pendingCount} Claims</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-card border border-border/50 p-5 rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Approved (To be Paid)</p>
              <p className="text-2xl font-bold text-foreground">₹{approvedTotal.toLocaleString('en-IN')}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-card border border-border/50 p-5 rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-foreground">₹{paidTotal.toLocaleString('en-IN')}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-muted/20 p-4 rounded-xl border border-border/50">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {[
              { id: "all", label: "All Claims" },
              { id: "pending", label: "Pending" },
              { id: "approved", label: "Approved" },
              { id: "rejected", label: "Rejected" },
              { id: "paid", label: "Paid" },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  filter === f.id ? "bg-card text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search employee or category..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-background border border-border/50 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Employee</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr><td colSpan={6} className="p-12 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">
                    <Receipt className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p>No expense claims found.</p>
                  </td></tr>
                ) : (
                  filteredExpenses.map((exp: any) => (
                    <tr key={exp.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="text-xs text-muted-foreground">{new Date(exp.submittedAt).toLocaleDateString('en-IN')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{exp.employeeName || "—"}</div>
                        <div className="text-xs text-muted-foreground">{exp.department}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{exp.category}</span>
                          <span className="text-foreground truncate max-w-[200px]">{exp.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">₹{exp.amount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">{getStatusBadge(exp.status)}</td>
                      <td className="px-6 py-4 text-right">
                        {exp.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleStatusChange(exp.id, 'APPROVED')} className="px-3 py-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors border border-emerald-500/20 hover:border-emerald-500">
                              Approve
                            </button>
                            <button onClick={() => handleStatusChange(exp.id, 'REJECTED')} className="px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-500/20 hover:border-red-500">
                              Reject
                            </button>
                          </div>
                        ) : exp.status === 'APPROVED' ? (
                          <button onClick={() => handleStatusChange(exp.id, 'PAID')} className="px-3 py-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors border border-emerald-500/20">
                            Mark Paid
                          </button>
                        ) : (
                          <button className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Submit Claim Modal */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-card border border-border/50 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-bold text-foreground text-lg">Submit Expense Claim</h3>
              <button onClick={() => setIsSubmitOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors text-xs font-medium px-2.5 py-1 rounded-lg">Close</button>
            </div>
            
            <form onSubmit={handleSubmitClaim} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground block">Employee</label>
                <select value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary">
                  <option value="">Select employee (optional)</option>
                  {allEmployees.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>{emp.user?.firstName} {emp.user?.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground block">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary">
                  <option value="SOFTWARE">Software</option>
                  <option value="TRAVEL">Travel</option>
                  <option value="MEALS">Meals</option>
                  <option value="EQUIPMENT">Equipment</option>
                  <option value="OFFICE">Office</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground block">Amount (₹)</label>
                <input type="number" required min="1" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary" placeholder="e.g. 4200" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground block">Description</label>
                <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary" placeholder="e.g. Figma Pro Annual License" />
              </div>
              <div className="pt-4 border-t border-border/50">
                <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
