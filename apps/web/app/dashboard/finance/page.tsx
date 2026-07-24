"use client"

import { useState, useEffect } from "react"
import { Plus, Search, DollarSign, Download, ArrowUpRight, ArrowDownRight, FileText, CheckCircle, Clock, Activity, FileSpreadsheet } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useApi, fetchApi } from "@/lib/useApi"
import { useCurrency } from "@/hooks/useCurrency"

const STATUS_CONFIG = {
  DRAFT:          { label: "Draft",          color: "text-slate-400 bg-slate-500/10 border-slate-500/20", glow: "" },
  SENT:           { label: "Sent",           color: "text-blue-400 bg-blue-500/10 border-blue-500/20", glow: "shadow-[0_0_10px_rgba(59,130,246,0.2)]" },
  VIEWED:         { label: "Viewed",         color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", glow: "shadow-[0_0_10px_rgba(99,102,241,0.2)]" },
  PARTIALLY_PAID: { label: "Partial",        color: "text-amber-400 bg-amber-500/10 border-amber-500/20", glow: "shadow-[0_0_10px_rgba(251,191,36,0.2)]" },
  PAID:           { label: "Paid",           color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", glow: "shadow-[0_0_10px_rgba(16,185,129,0.2)]" },
  OVERDUE:        { label: "Overdue",        color: "text-red-400 bg-red-500/10 border-red-500/20", glow: "shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse" },
  CANCELLED:      { label: "Cancelled",      color: "text-slate-500 bg-slate-500/10 border-slate-500/20", glow: "" },
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

  const filtered = invoices.filter(i => {
    const matchSearch = search === "" || i.clientName.toLowerCase().includes(search.toLowerCase()) || i.invoiceNumber.toLowerCase().includes(search.toLowerCase())
    const matchUnit = !unitFilter || i.businessUnit === unitFilter
    return matchSearch && matchUnit
  })

  const totalOutstanding = invoices.filter(i => ["SENT", "VIEWED", "PARTIALLY_PAID", "OVERDUE"].includes(i.status)).reduce((s, i) => s + i.totalAmount, 0)
  const totalOverdue = invoices.filter(i => i.status === "OVERDUE").reduce((s, i) => s + i.totalAmount, 0)
  const totalPaidThisMonth = invoices.filter(i => i.status === "PAID").reduce((s, i) => s + i.totalAmount, 0)

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar bg-transparent text-white relative">
      
      {/* Background ambient light */}
      <div className="absolute top-[10%] right-[10%] w-[50%] h-[50%] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto p-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)] relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/20 animate-pulse mix-blend-overlay" />
              <DollarSign className="w-6 h-6 text-emerald-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Finance Engine</h1>
              <p className="text-xs font-mono tracking-widest uppercase text-white/40 mt-1">Invoicing, Expenses & Tax Telemetry</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <button className="w-full md:w-auto justify-center group flex items-center gap-2 bg-white/5 text-white font-bold tracking-widest uppercase text-[10px] px-5 py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md min-h-[44px]">
              <Download className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" /> Export GST Report
            </button>
            <Link 
              href="/dashboard/finance/invoices/new"
              className="w-full md:w-auto justify-center group flex items-center gap-2 bg-white text-black font-bold tracking-widest uppercase text-[10px] px-5 py-3 rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] relative overflow-hidden min-h-[44px]"
            >
              <div className="absolute inset-0 -translate-x-[150%] animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
              <Plus className="w-4 h-4" /> New Invoice
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard 
            title="Outstanding" 
            value={formatCurrency(totalOutstanding, true)} 
            icon={<Activity className="w-5 h-5 text-blue-400" />} 
            color="blue" 
            delay={0} 
          />
          <StatCard 
            title="Overdue" 
            value={formatCurrency(totalOverdue, true)} 
            icon={<Clock className="w-5 h-5 text-red-400" />} 
            color="red" 
            delay={0.1} 
          />
          <StatCard 
            title="Paid This Month" 
            value={formatCurrency(totalPaidThisMonth, true)} 
            icon={<CheckCircle className="w-5 h-5 text-emerald-400" />} 
            color="emerald" 
            delay={0.2} 
          />
          <StatCard 
            title="Pending Expenses" 
            value={`${symbol}24.5k`} 
            icon={<ArrowDownRight className="w-5 h-5 text-amber-400" />} 
            color="amber" 
            delay={0.3} 
          />
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
            {[null, "AGENCY", "ACADEMY"].map(unit => (
              <button
                key={unit ?? "all"}
                onClick={() => setUnitFilter(unit)}
                className={`text-[10px] px-4 py-2 rounded-lg font-mono tracking-widest uppercase font-bold transition-all ${
                  unitFilter === unit
                    ? "bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {unit ? unit : "All Units"}
              </button>
            ))}
          </div>
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search invoices..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all backdrop-blur-md"
            />
          </div>
        </div>

        {/* Ledger */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-[10px] font-mono tracking-widest text-white/40 uppercase">
                  <th className="px-6 py-4 font-bold">Invoice Ref</th>
                  <th className="px-6 py-4 font-bold">Client / Student</th>
                  <th className="px-6 py-4 font-bold">Amount (INR)</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Due Date</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                <AnimatePresence>
                  {filtered.map((invoice, i) => {
                    const statusCfg = STATUS_CONFIG[invoice.status as keyof typeof STATUS_CONFIG]
                    return (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={invoice.id} 
                        className="hover:bg-white/5 transition-colors group cursor-default"
                      >
                        <td className="px-6 py-5">
                          <Link href={`/dashboard/finance/invoices/${invoice.id}`} className="font-mono text-xs font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-white/20 group-hover:text-blue-400 transition-colors" />
                            {invoice.invoiceNumber}
                          </Link>
                          <p className="text-[9px] uppercase font-bold text-white/30 mt-1.5 tracking-widest">{invoice.businessUnit}</p>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-bold text-white/90">{invoice.clientName}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-black text-lg text-white tracking-tight">{formatCurrency(invoice.totalAmount)}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg border ${statusCfg?.color || ''} ${statusCfg?.glow || ''}`}>
                            {statusCfg?.label || invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-mono text-xs text-white/50">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button 
                            onClick={async () => {
                              if(confirm("Delete invoice?")) {
                                await fetchApi(`/finance/invoices/${invoice.id}`, { method: "DELETE" })
                                setInvoices(prev => prev.filter(p => p.id !== invoice.id))
                              }
                            }}
                            className="text-white/30 hover:text-red-400 hover:bg-white/10 transition-all p-2 rounded-lg border border-transparent hover:border-white/10">
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-center bg-black/20">
              <div className="w-12 h-12 border border-white/10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <Search className="w-5 h-5 text-white/30" />
              </div>
              <p className="text-xs font-mono tracking-widest text-white/40 uppercase">No invoices found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, delay }: { title: string, value: string, icon: any, color: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-${color}-500/30 transition-colors`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase text-white/50">{title}</h3>
        <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_20px_var(--tw-shadow-color)] shadow-${color}-500/20 transition-all`}>
          {icon}
        </div>
      </div>
      
      <div className="relative z-10">
        <p className={`text-4xl font-black tracking-tight text-white group-hover:text-${color}-400 transition-colors`}>{value}</p>
      </div>
    </motion.div>
  )
}
