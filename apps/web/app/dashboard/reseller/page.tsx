"use client"

import { useState } from "react"
import { 
  Building2, Users, DollarSign, Wallet, Globe, Plus, 
  ArrowUpRight, ShieldCheck, CheckCircle2, Clock, AlertTriangle, Eye, Edit, PauseCircle, RefreshCw, LogIn
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function ResellerDashboard() {
  const [stats] = useState({
    totalGarages: 12,
    activeGarages: 10,
    expiringSoon: 2,
    thisMonthSales: "₹1,45,000",
    earnings: "₹36,250",
  })

  const [recentGarages] = useState([
    { id: "gar-1", name: "Apex Auto Care", owner: "Rajesh Kumar", plan: "Enterprise Garage", status: "Active", renewal: "2026-10-15", domain: "apex.autocare.com" },
    { id: "gar-2", name: "Speedy Motors", owner: "Anita Sharma", plan: "Growth Garage", status: "Active", renewal: "2026-10-02", domain: "speedy.reseller.com" },
    { id: "gar-3", name: "Royal Auto Works", owner: "Suresh Patel", plan: "Basic Garage", status: "Expiring Soon", renewal: "2026-09-29", domain: "royal.garage.in" },
    { id: "gar-4", name: "City Garage Service", owner: "Vikram Singh", plan: "Growth Garage", status: "Active", renewal: "2026-11-20", domain: "citygarage.com" },
  ])

  const [recentPayments] = useState([
    { id: "pay-101", garage: "Apex Auto Care", plan: "Enterprise Garage", amount: "₹49,999", date: "2026-09-24", status: "Paid" },
    { id: "pay-102", garage: "Speedy Motors", plan: "Growth Garage", amount: "₹29,999", date: "2026-09-22", status: "Paid" },
    { id: "pay-103", garage: "Royal Auto Works", plan: "Basic Garage", amount: "₹14,999", date: "2026-09-18", status: "Pending" },
  ])

  return (
    <div className="p-8 space-y-8 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reseller Dashboard</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage your acquired garages, sales volume, and white-label operations.</p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link 
            href="/dashboard/reseller/garages?action=new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Garage
          </Link>
          <Link 
            href="/dashboard/reseller/garages"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            <Building2 className="w-4 h-4 text-zinc-400" /> View Garages
          </Link>
          <Link 
            href="/dashboard/reseller/whitelabel"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            <Globe className="w-4 h-4 text-purple-400" /> White Label
          </Link>
          <Link 
            href="/dashboard/reseller/earnings"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            <DollarSign className="w-4 h-4 text-emerald-400" /> View Earnings
          </Link>
        </div>
      </div>

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold">Total Garages</span>
          <p className="text-2xl font-bold text-white">{stats.totalGarages}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold">Active Garages</span>
          <p className="text-2xl font-bold text-emerald-400">{stats.activeGarages}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold">Expiring Soon</span>
          <p className="text-2xl font-bold text-amber-400">{stats.expiringSoon}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold">This Month Sales</span>
          <p className="text-2xl font-bold text-blue-400">{stats.thisMonthSales}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold">Earnings</span>
          <p className="text-2xl font-bold text-purple-400">{stats.earnings}</p>
        </div>
      </div>

      {/* Two Column Layout: Recent Garages & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Garages (2 Cols) */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Recent Garages</h2>
            <Link href="/dashboard/reseller/garages" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
              View All Garages <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400 uppercase text-[10px] font-semibold">
                  <th className="py-3 px-3">Garage Name</th>
                  <th className="py-3 px-3">Owner</th>
                  <th className="py-3 px-3">Plan</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Renewal</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentGarages.map((g) => (
                  <tr key={g.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3 font-medium text-white">{g.name}</td>
                    <td className="py-3 px-3 text-zinc-400">{g.owner}</td>
                    <td className="py-3 px-3 text-zinc-300">{g.plan}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        g.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-400">{g.renewal}</td>
                    <td className="py-3 px-3 text-right">
                      <button 
                        onClick={() => toast.info(`Impersonating ${g.name} Garage Dashboard...`)}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Login
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments (1 Col) */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Recent Payments</h2>
            <Link href="/dashboard/reseller/sales" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
              Sales History <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentPayments.map((p) => (
              <div key={p.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">{p.garage}</p>
                  <p className="text-[11px] text-zinc-500">{p.plan} • {p.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white">{p.amount}</p>
                  <span className={`text-[10px] font-semibold ${p.status === "Paid" ? "text-emerald-400" : "text-amber-400"}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}
