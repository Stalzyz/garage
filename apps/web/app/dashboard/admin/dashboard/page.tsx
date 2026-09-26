"use client"

import { useState } from "react"
import { 
  Building2, Users, DollarSign, TrendingUp, AlertTriangle, ShieldCheck, Activity, ArrowUpRight, LogIn
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function SuperAdminDashboardPage() {
  const [stats] = useState({
    totalGarages: 48,
    directGarages: 18,
    resellerGarages: 30,
    totalResellers: 8,
    activeSubscriptions: 42,
    expiringSoon: 4,
    thisMonthRevenue: "₹8,45,000",
  })

  const [recentActivity] = useState([
    { id: "act-1", who: "Apex Reseller", action: "Created garage XYZ Auto Care", date: "10 mins ago" },
    { id: "act-2", who: "Grekam Admin", action: "Updated Growth Plan pricing", date: "1 hour ago" },
    { id: "act-3", who: "Speedy Motors", action: "Payment received ₹29,999", date: "3 hours ago" },
    { id: "act-4", who: "Vanguard Reseller", action: "Custom domain verified", date: "5 hours ago" },
  ])

  const [recentPayments] = useState([
    { id: "p-1", garage: "Apex Auto Care", reseller: "Apex Reseller", amount: "₹49,999", date: "2026-09-26", status: "Paid" },
    { id: "p-2", garage: "City Garage Direct", reseller: "Direct Customer", amount: "₹29,999", date: "2026-09-25", status: "Paid" },
    { id: "p-3", garage: "Speedy Motors", reseller: "Apex Reseller", amount: "₹29,999", date: "2026-09-24", status: "Paid" },
    { id: "p-4", garage: "Royal Auto Works", reseller: "Royal Partners", amount: "₹14,999", date: "2026-09-23", status: "Pending" },
  ])

  return (
    <div className="p-8 space-y-8 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Grekam Super Admin Dashboard</h1>
          <p className="text-xs text-zinc-400 mt-1">Master control center for direct garages, resellers, plans, and platform revenue.</p>
        </div>

        <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          Platform Owner Mode
        </span>
      </div>

      {/* 7 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Total Garages</span>
          <p className="text-xl font-bold text-white">{stats.totalGarages}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Direct Garages</span>
          <p className="text-xl font-bold text-blue-400">{stats.directGarages}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Reseller Garages</span>
          <p className="text-xl font-bold text-purple-400">{stats.resellerGarages}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Total Resellers</span>
          <p className="text-xl font-bold text-white">{stats.totalResellers}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Active Subscriptions</span>
          <p className="text-xl font-bold text-emerald-400">{stats.activeSubscriptions}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Expiring Soon</span>
          <p className="text-xl font-bold text-amber-400">{stats.expiringSoon}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Monthly Revenue</span>
          <p className="text-xl font-bold text-emerald-400">{stats.thisMonthRevenue}</p>
        </div>
      </div>

      {/* Simple Visual Overview & Growth Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Garages Growth Chart Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" /> Garages Growth
          </h2>
          
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Reseller Garages (62.5%)</span>
                <span className="text-white font-semibold">30 / 48</span>
              </div>
              <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: "62.5%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Direct Garage Customers (37.5%)</span>
                <span className="text-white font-semibold">18 / 48</span>
              </div>
              <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: "37.5%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Overview Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Revenue Split
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <span className="text-zinc-400 block">Direct Customer MRR</span>
              <span className="text-lg font-bold text-blue-400 mt-1 block">₹4,20,000</span>
            </div>

            <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <span className="text-zinc-400 block">Reseller Wholesale MRR</span>
              <span className="text-lg font-bold text-purple-400 mt-1 block">₹4,25,000</span>
            </div>
          </div>
        </div>

      </div>

      {/* Two Column Layout: Recent Activity & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Activity */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Recent Activity</h2>
            <Link href="/dashboard/admin/activity" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
              View Audit Log <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivity.map((a) => (
              <div key={a.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-white">{a.who}</span>
                  <p className="text-zinc-400 text-[11px] mt-0.5">{a.action}</p>
                </div>
                <span className="text-zinc-500 text-[10px]">{a.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Recent Payments</h2>
            <Link href="/dashboard/admin/payments" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
              All Payments <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentPayments.map((p) => (
              <div key={p.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-white">{p.garage}</p>
                  <p className="text-zinc-500 text-[10px]">{p.reseller} • {p.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{p.amount}</p>
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
