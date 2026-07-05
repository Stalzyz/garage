"use client"

import { useState } from "react"
import { Search, Filter, Download, Plus, IndianRupee, TrendingUp, AlertCircle, FileText, CheckCircle2, Clock, XCircle } from "lucide-react"

// Types
type InvoiceStatus = 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE' | 'CANCELLED'

interface Invoice {
  id: string
  student: string
  course: string
  amount: number
  date: string
  dueDate: string
  status: InvoiceStatus
}

// Initial Data
const dummyInvoices: Invoice[] = [
  { id: 'INV-2024-001', student: 'John Doe', course: 'UI/UX Masterclass', amount: 45000, date: 'Oct 12, 2024', dueDate: 'Oct 19, 2024', status: 'PAID' },
  { id: 'INV-2024-002', student: 'Jane Smith', course: 'Advanced React', amount: 30000, date: 'Oct 15, 2024', dueDate: 'Oct 22, 2024', status: 'PARTIAL' },
  { id: 'INV-2024-003', student: 'Mike Johnson', course: 'Next.js Enterprise', amount: 60000, date: 'Oct 18, 2024', dueDate: 'Oct 25, 2024', status: 'PENDING' },
  { id: 'INV-2024-004', student: 'Sarah Wilson', course: 'UI/UX Masterclass', amount: 45000, date: 'Sep 01, 2024', dueDate: 'Sep 08, 2024', status: 'OVERDUE' },
  { id: 'INV-2024-005', student: 'Tom Brown', course: 'Advanced React', amount: 30000, date: 'Sep 15, 2024', dueDate: 'Sep 22, 2024', status: 'CANCELLED' },
  { id: 'INV-2024-006', student: 'Emily Chen', course: 'UI/UX Masterclass', amount: 45000, date: 'Oct 20, 2024', dueDate: 'Oct 27, 2024', status: 'PENDING' },
]

export default function FeeManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const getStatusConfig = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID': return { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 }
      case 'PARTIAL': return { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Clock }
      case 'PENDING': return { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock }
      case 'OVERDUE': return { color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: AlertCircle }
      case 'CANCELLED': return { color: 'bg-white/5 text-white/40 border-white/10', icon: XCircle }
    }
  }

  return (
    <div className="flex-1 overflow-y-auto h-full bg-[#050505] text-white">
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
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
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
            <h3 className="text-white/50 text-sm font-medium mb-1 relative z-10">Total Collected (This Month)</h3>
            <div className="flex items-center gap-1 text-3xl font-bold text-white relative z-10">
              <IndianRupee className="w-6 h-6 text-white/50" />
              4,50,000
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
              1,35,000
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl transition-all" />
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4 relative z-10">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-white/50 text-sm font-medium mb-1 relative z-10">Overdue Invoices</h3>
            <div className="flex items-center gap-1 text-3xl font-bold text-white relative z-10">
              <IndianRupee className="w-6 h-6 text-white/50" />
              45,000
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
                {dummyInvoices
                  .filter(inv => inv.student.toLowerCase().includes(searchQuery.toLowerCase()) || inv.id.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((invoice) => {
                  const statusConfig = getStatusConfig(invoice.status)
                  const StatusIcon = statusConfig.icon
                  
                  return (
                    <tr key={invoice.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-medium text-white/80">
                          <FileText className="w-4 h-4 text-white/40" />
                          {invoice.id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{invoice.student}</div>
                        <div className="text-white/50 text-xs mt-0.5">{invoice.course}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white flex items-center">
                          <IndianRupee className="w-3 h-3 text-white/50" />
                          {invoice.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/60">
                        <div>{invoice.date}</div>
                        <div className="text-[10px] text-white/40 mt-0.5">Due: {invoice.dueDate}</div>
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
    </div>
  )
}
