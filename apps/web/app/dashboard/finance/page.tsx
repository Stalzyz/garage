"use client"

import { useState, useEffect } from "react"
import { Activity, ArrowDownRight, ArrowUpRight, CheckCircle, Clock, DollarSign, Download, Eye, FileSpreadsheet, FileText, Plus, Search, Trash2 } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useApi, fetchApi } from "@/lib/useApi"
import { useCurrency } from "@/hooks/useCurrency"

const STATUS_CONFIG = {
  DRAFT:          { label: "Draft",          color: "text-zinc-400 bg-white/[0.06] border-white/[0.08]" },
  SENT:           { label: "Sent",           color: "text-[#0A84FF] bg-[#0A84FF]/10 border-[#0A84FF]/20" },
  VIEWED:         { label: "Viewed",         color: "text-[#5E5CE6] bg-[#5E5CE6]/10 border-[#5E5CE6]/20" },
  PARTIALLY_PAID: { label: "Partial",        color: "text-[#FF9F0A] bg-[#FF9F0A]/10 border-[#FF9F0A]/20" },
  PAID:           { label: "Paid",           color: "text-[#30D158] bg-[#30D158]/10 border-[#30D158]/20" },
  OVERDUE:        { label: "Overdue",        color: "text-[#FF453A] bg-[#FF453A]/10 border-[#FF453A]/20" },
  CANCELLED:      { label: "Cancelled",      color: "text-zinc-500 bg-white/[0.04] border-white/[0.06]" },
}

export default function FinanceDashboard() {
  const { data, isLoading } = useApi<{data: any[], total: number}>("/finance/invoices")
  const [search, setSearch] = useState("")
  const [unitFilter, setUnitFilter] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const { symbol, formatCurrency } = useCurrency()

  useEffect(() => {
    if (data?.data) {
      setInvoices(data.data)
    }
  }, [data])

  const handleExportGST = () => {
    const csv = `Type,Amount\nTotal Outstanding,${totalOutstanding}\nTotal Overdue,${totalOverdue}\nTotal Paid,${totalPaidThisMonth}`
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `GST_Report_Summary.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filtered = invoices.filter(i => {
    const matchSearch = search === "" || i.clientName.toLowerCase().includes(search.toLowerCase()) || i.invoiceNumber.toLowerCase().includes(search.toLowerCase())
    const matchUnit = !unitFilter || i.businessUnit === unitFilter
    return matchSearch && matchUnit
  })

  const totalOutstanding = invoices.filter(i => ["SENT", "VIEWED", "PARTIALLY_PAID", "OVERDUE"].includes(i.status)).reduce((s, i) => s + i.totalAmount, 0)
  const totalOverdue = invoices.filter(i => i.status === "OVERDUE").reduce((s, i) => s + i.totalAmount, 0)
  const totalPaidThisMonth = invoices.filter(i => i.status === "PAID").reduce((s, i) => s + i.totalAmount, 0)

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar bg-black text-[#f5f5f7]">
      <div className="max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#161618] border border-white/[0.08] flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-[#30D158]" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-[#f5f5f7]">Invoices &amp; Revenue</h1>
              <p className="text-xs text-zinc-400">Finance overview, receivable accounts, and tax reporting</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportGST}
              className="flex items-center gap-1.5 bg-transparent hover:bg-white/[0.06] text-zinc-300 text-xs font-medium px-3.5 py-2 rounded-lg border border-white/[0.08] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" /> Export GST
            </button>
            <Link 
              href="/dashboard/finance/invoices/new"
              className="flex items-center gap-1.5 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New Invoice
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            title="Outstanding" 
            value={formatCurrency(totalOutstanding, true)} 
            icon={<Activity className="w-4 h-4 text-[#0A84FF]" />} 
          />
          <StatCard 
            title="Overdue" 
            value={formatCurrency(totalOverdue, true)} 
            icon={<Clock className="w-4 h-4 text-[#FF453A]" />} 
          />
          <StatCard 
            title="Paid This Month" 
            value={formatCurrency(totalPaidThisMonth, true)} 
            icon={<CheckCircle className="w-4 h-4 text-[#30D158]" />} 
          />
          <StatCard 
            title="Pending Expenses" 
            value={`${symbol}24.5k`} 
            icon={<ArrowDownRight className="w-4 h-4 text-[#FF9F0A]" />} 
          />
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-end">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search invoices..."
              className="w-full bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#f5f5f7] placeholder:text-zinc-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Ledger */}
        <div className="bg-[#161618] border border-white/[0.08] rounded-xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-[#121214] text-[11px] font-medium text-zinc-400">
                  <th className="px-4 py-3">Invoice Ref</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs">
                {filtered.map((invoice) => {
                  const statusCfg = STATUS_CONFIG[invoice.status as keyof typeof STATUS_CONFIG]
                  return (
                    <tr 
                      key={invoice.id} 
                      className="hover:bg-white/[0.02] transition-colors group cursor-default"
                    >
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/finance/invoices/${invoice.id}`} className="text-xs font-medium text-[#f5f5f7] group-hover:text-[#0A84FF] transition-colors flex items-center gap-2">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#0A84FF] transition-colors" />
                          {invoice.invoiceNumber}
                        </Link>
                        <p className="text-[10px] uppercase text-zinc-500 mt-0.5">{invoice.businessUnit}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-zinc-300">{invoice.clientName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-sm text-[#f5f5f7] tabular-nums">{formatCurrency(invoice.totalAmount)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md border ${statusCfg?.color || ''}`}>
                          {statusCfg?.label || invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 tabular-nums text-xs">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link 
                            href={`/dashboard/finance/invoices/${invoice.id}`}
                            className="text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors p-1.5 rounded-md"
                            title="View Invoice"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button 
                            onClick={async () => {
                              if(confirm("Delete invoice?")) {
                                await fetchApi(`/finance/invoices/${invoice.id}`, { method: "DELETE" })
                                setInvoices(prev => prev.filter(p => p.id !== invoice.id))
                              }
                            }}
                            className="text-zinc-400 hover:text-[#FF453A] hover:bg-[#FF453A]/10 transition-colors p-1.5 rounded-md"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-xs text-zinc-500">No invoices found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: any }) {
  return (
    <div className="bg-[#161618] border border-white/[0.08] rounded-xl p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-medium text-zinc-400">{title}</h3>
        <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-xl font-semibold text-[#f5f5f7] tabular-nums">{value}</p>
      </div>
    </div>
  )
}
