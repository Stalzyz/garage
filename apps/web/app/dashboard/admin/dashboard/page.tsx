"use client"

import { useState, useEffect } from "react"
import { 
  Building2, Users, DollarSign, TrendingUp, AlertTriangle, ShieldCheck, Activity, ArrowUpRight, LogIn, RefreshCw
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function SuperAdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalGarages: 0,
    directGarages: 0,
    resellerGarages: 0,
    totalResellers: 0,
    activeSubscriptions: 0,
    expiringSoon: 0,
    thisMonthRevenue: "₹0",
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [recentPayments, setRecentPayments] = useState<any[]>([])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/dashboard")
      const data = await res.json()
      if (data.success) {
        setStats(data.stats)
        setRecentActivity(data.recentActivity || [])
        setRecentPayments(data.recentPayments || [])
      }
    } catch {
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const resellerPercentage = stats.totalGarages > 0 
    ? Math.round((stats.resellerGarages / stats.totalGarages) * 100) 
    : 0
  const directPercentage = stats.totalGarages > 0 
    ? Math.round((stats.directGarages / stats.totalGarages) * 100) 
    : 0

  return (
    <div className="p-8 space-y-8 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Grekam Super Admin Control Plane</h1>
          <p className="text-xs text-zinc-400 mt-1">Live metrics across direct garages, partner floats, subscriptions, and platform revenue.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <span className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            Platform Owner Mode
          </span>
        </div>
      </div>

      {/* 7 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Total Garages</span>
          <p className="text-xl font-bold text-white font-mono">{stats.totalGarages}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Direct Garages</span>
          <p className="text-xl font-bold text-blue-400 font-mono">{stats.directGarages}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Partner Garages</span>
          <p className="text-xl font-bold text-purple-400 font-mono">{stats.resellerGarages}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Active Partners</span>
          <p className="text-xl font-bold text-white font-mono">{stats.totalResellers}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Active Subscriptions</span>
          <p className="text-xl font-bold text-emerald-400 font-mono">{stats.activeSubscriptions}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Expiring Soon</span>
          <p className="text-xl font-bold text-amber-400 font-mono">{stats.expiringSoon}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Verified Revenue</span>
          <p className="text-xl font-bold text-emerald-400 font-mono">{stats.thisMonthRevenue}</p>
        </div>
      </div>

      {/* Visual Overview & Growth Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Garages Breakdown Chart Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" /> Garages Distribution
          </h2>
          
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Partner Acquired Garages ({resellerPercentage}%)</span>
                <span className="text-white font-semibold font-mono">{stats.resellerGarages} / {stats.totalGarages}</span>
              </div>
              <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${resellerPercentage}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Direct Garage Customers ({directPercentage}%)</span>
                <span className="text-white font-semibold font-mono">{stats.directGarages} / {stats.totalGarages}</span>
              </div>
              <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${directPercentage}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Overview Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Float & Revenue Pipeline
            </h2>
            <Link href="/dashboard/admin/partners" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
              View Float Escrow <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2 pt-2">
            <div className="text-3xl font-black text-emerald-400 font-mono">{stats.thisMonthRevenue}</div>
            <p className="text-xs text-zinc-400">Total bank-verified partner float deposits and direct subscriptions credited to platform.</p>
          </div>
        </div>

      </div>

      {/* Bottom Row: Recent Activity & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Real Live Activity Log */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" /> Recent Platform Activity
            </h2>
            <Link href="/dashboard/admin/activity" className="text-xs text-blue-400 hover:underline">
              View All
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">No platform activity recorded yet.</div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((act) => (
                <div key={act.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-white">{act.who}</span>
                    <span className="text-zinc-400 text-[11px] block mt-0.5">{act.target}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono whitespace-nowrap ml-2">{act.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real Live Recent Payments */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Recent Transactions
            </h2>
            <Link href="/dashboard/admin/payments" className="text-xs text-blue-400 hover:underline">
              View All
            </Link>
          </div>

          {recentPayments.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">No transactions recorded yet.</div>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((pay) => (
                <div key={pay.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-white">{pay.garage}</span>
                    <span className="text-zinc-400 text-[11px] block mt-0.5">{pay.reseller}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white font-mono">{pay.amount}</div>
                    <span className={`text-[10px] font-bold ${
                      pay.status === "Paid" ? "text-emerald-400" : "text-amber-400"
                    }`}>
                      {pay.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
