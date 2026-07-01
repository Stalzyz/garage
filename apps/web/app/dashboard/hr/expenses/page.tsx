"use client"

import { useState } from "react"
import { Search, Plus, Filter, Paperclip, Receipt, IndianRupee, CheckCircle, Clock, XCircle, MoreHorizontal } from "lucide-react"

// Mock Data
const EXPENSES = [
  { id: "EXP-2025-081", employee: "Maya Sharma", category: "Software", amount: "₹4,200", date: "Jul 10, 2025", status: "PENDING", description: "Figma Pro Annual License", receipt: true },
  { id: "EXP-2025-080", employee: "Ravi Kumar", category: "Travel", amount: "₹12,500", date: "Jul 05, 2025", status: "APPROVED", description: "Flight to Mumbai Client Meeting", receipt: true },
  { id: "EXP-2025-079", employee: "Priya Desai", category: "Meals", amount: "₹1,850", date: "Jul 02, 2025", status: "REJECTED", description: "Team Lunch - Client Onboarding", receipt: false, reason: "Missing receipt attachment" },
  { id: "EXP-2025-078", employee: "Karthik N.", category: "Equipment", amount: "₹45,000", date: "Jun 28, 2025", status: "PAID", description: "New Dell UltraSharp Monitor", receipt: true },
  { id: "EXP-2025-077", employee: "Aisha Rahman", category: "Software", amount: "₹1,200", date: "Jun 25, 2025", status: "PAID", description: "Midjourney Subscription", receipt: true },
]

export default function ExpensesDashboard() {
  const [expensesList, setExpensesList] = useState(EXPENSES)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [formData, setFormData] = useState({
    employee: "Current User",
    category: "Software",
    amount: "",
    description: ""
  })

  const filteredExpenses = expensesList.filter(exp => {
    if (filter !== "all" && exp.status.toLowerCase() !== filter) return false
    if (search && !exp.employee.toLowerCase().includes(search.toLowerCase()) && !exp.category.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

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
      default:
        return null
    }
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    setExpensesList(expensesList.map(exp => exp.id === id ? { ...exp, status: newStatus } : exp))
  }

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault()
    const newExp = {
      id: `EXP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      employee: formData.employee,
      category: formData.category,
      amount: `₹${Number(formData.amount).toLocaleString()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: "PENDING",
      description: formData.description,
      receipt: true
    }
    setExpensesList([newExp, ...expensesList])
    setIsSubmitOpen(false)
    setFormData({ employee: "Current User", category: "Software", amount: "", description: "" })
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
            <Plus className="w-4 h-4" />
            Submit Claim
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border/50 p-5 rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Pending Approvals</p>
              <p className="text-2xl font-bold text-foreground">4 Claims</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-card border border-border/50 p-5 rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Approved (To be Paid)</p>
              <p className="text-2xl font-bold text-foreground">₹28,400</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-card border border-border/50 p-5 rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Total Paid (This Month)</p>
              <p className="text-2xl font-bold text-foreground">₹1,12,000</p>
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
          <div className="relative w-full sm:max-w-xs flex gap-2">
            <div className="relative flex-1">
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
        </div>

        {/* Data Table */}
        <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Claim ID & Date</th>
                  <th className="px-6 py-4 font-medium">Employee</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{exp.id}</div>
                      <div className="text-xs text-muted-foreground">{exp.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{exp.employee}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{exp.category}</span>
                        <span className="text-foreground truncate max-w-[200px]">{exp.description}</span>
                        {exp.receipt && <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />}
                      </div>
                      {exp.reason && <div className="text-xs text-red-500 mt-1">Reason: {exp.reason}</div>}
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">{exp.amount}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(exp.status)}
                    </td>
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
                      ) : (
                        <button className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredExpenses.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                <Receipt className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p>No expense claims found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-card border border-border/50 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-bold text-foreground text-lg">Submit Expense Claim</h3>
              <button onClick={() => setIsSubmitOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors text-xs font-medium px-2.5 py-1 rounded-lg">Close</button>
            </div>
            
            <form onSubmit={handleSubmitClaim} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground block">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary">
                  <option value="Software">Software</option>
                  <option value="Travel">Travel</option>
                  <option value="Meals">Meals</option>
                  <option value="Equipment">Equipment</option>
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground block">Amount (₹)</label>
                <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground block">Description</label>
                <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary" />
              </div>

              <div className="pt-4 border-t border-border/50">
                <button type="submit" className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-xl hover:bg-primary/90 transition-all">
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
