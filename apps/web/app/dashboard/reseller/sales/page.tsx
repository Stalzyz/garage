"use client"

import { useState } from "react"
import { DollarSign, Search, Filter } from "lucide-react"

export default function ResellerSalesPage() {
  const [filterStatus, setFilterStatus] = useState<"All" | "Paid" | "Pending">("All")
  const [searchQuery, setSearchQuery] = useState("")

  const [sales] = useState([
    { id: "sale-101", garage: "Apex Auto Care", plan: "Enterprise Garage", amount: "₹49,999", date: "2026-09-24", status: "Paid" },
    { id: "sale-102", garage: "Speedy Motors", plan: "Growth Garage", amount: "₹29,999", date: "2026-09-22", status: "Paid" },
    { id: "sale-103", garage: "Royal Auto Works", plan: "Basic Garage", amount: "₹14,999", date: "2026-09-18", status: "Pending" },
    { id: "sale-104", garage: "City Garage Service", plan: "Growth Garage", amount: "₹29,999", date: "2026-09-10", status: "Paid" },
  ])

  const filteredSales = sales.filter(s => {
    const matchesSearch = s.garage.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "All" || s.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-8 space-y-6 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
        <p className="text-xs text-zinc-400 mt-1">Overview of subscription sales generated across your garage customers.</p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold">Total Sales</span>
          <p className="text-2xl font-bold text-white">₹1,24,996</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold">This Month</span>
          <p className="text-2xl font-bold text-blue-400">₹1,24,996</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold">This Year</span>
          <p className="text-2xl font-bold text-emerald-400">₹4,85,000</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by garage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-semibold">
          {(["All", "Paid", "Pending"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === st ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Sales List Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 text-zinc-400 uppercase text-[10px] font-semibold bg-white/[0.02]">
              <th className="py-3.5 px-4">Garage</th>
              <th className="py-3.5 px-4">Plan</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredSales.map((s) => (
              <tr key={s.id} className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-4 font-semibold text-white">{s.garage}</td>
                <td className="py-3.5 px-4 text-zinc-400">{s.plan}</td>
                <td className="py-3.5 px-4 font-bold text-white">{s.amount}</td>
                <td className="py-3.5 px-4 text-zinc-400">{s.date}</td>
                <td className="py-3.5 px-4 text-right">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    s.status === "Paid" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
