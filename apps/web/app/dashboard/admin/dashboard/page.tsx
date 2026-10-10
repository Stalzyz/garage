"use client"

import { useState, useEffect } from "react"
import { 
  Building2, Users, DollarSign, ShieldCheck, Activity, ArrowUpRight, RefreshCw,
  Copy, Send, Key
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
    <div className="p-8 space-y-6 bg-black text-[#f5f5f7] min-h-screen font-sans">
      
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Super Admin Control Plane</h1>
          <p className="text-xs text-[#86868b] mt-0.5">Live platform telemetry across direct garages, partner floats, subscriptions, and revenue.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2 bg-[#161618] border border-white/[0.08] rounded-lg text-[#86868b] hover:text-white transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.08] text-white/80 text-[11px] font-medium font-mono">
            Platform Owner
          </span>
        </div>
      </div>

      {/* 7 Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <div className="bg-[#161618] border border-white/[0.08] rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] text-[#86868b] uppercase tracking-wider font-medium">Total Garages</span>
          <p className="text-lg font-semibold text-white font-mono">{stats.totalGarages}</p>
        </div>

        <div className="bg-[#161618] border border-white/[0.08] rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] text-[#86868b] uppercase tracking-wider font-medium">Direct Garages</span>
          <p className="text-lg font-semibold text-white font-mono">{stats.directGarages}</p>
        </div>

        <div className="bg-[#161618] border border-white/[0.08] rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] text-[#86868b] uppercase tracking-wider font-medium">Partner Garages</span>
          <p className="text-lg font-semibold text-white font-mono">{stats.resellerGarages}</p>
        </div>

        <div className="bg-[#161618] border border-white/[0.08] rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] text-[#86868b] uppercase tracking-wider font-medium">Partners</span>
          <p className="text-lg font-semibold text-white font-mono">{stats.totalResellers}</p>
        </div>

        <div className="bg-[#161618] border border-white/[0.08] rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] text-[#86868b] uppercase tracking-wider font-medium">Subscriptions</span>
          <p className="text-lg font-semibold text-[#0A84FF] font-mono">{stats.activeSubscriptions}</p>
        </div>

        <div className="bg-[#161618] border border-white/[0.08] rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] text-[#86868b] uppercase tracking-wider font-medium">Expiring Soon</span>
          <p className="text-lg font-semibold text-white font-mono">{stats.expiringSoon}</p>
        </div>

        <div className="bg-[#161618] border border-white/[0.08] rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] text-[#86868b] uppercase tracking-wider font-medium">Total Revenue</span>
          <p className="text-lg font-semibold text-white font-mono">{stats.thisMonthRevenue}</p>
        </div>
      </div>

      {/* DEMO ACCOUNTS SHAREABLE MANAGER */}
      <div className="bg-[#161618] border border-white/[0.08] rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/80">
              <Key className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-white">Configured Demo Environments</h2>
              <p className="text-[11px] text-[#86868b]">Share and inspect direct SaaS and Whitelabel partner demo instances.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Account 1 Card */}
          <div className="p-4 rounded-lg bg-[#121214] border border-white/[0.06] space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-white flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#86868b]" /> 1. Direct SaaS Demo
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-[#86868b]">Public Landing</span>
            </div>
            <p className="text-xs text-[#86868b]">Standard direct SaaS experience pre-filled for landing visitors.</p>
            <div className="p-2.5 rounded-md bg-black/40 border border-white/[0.04] font-mono text-xs space-y-1">
              <div><span className="text-white/40">Email:</span> demo@garage.in</div>
              <div><span className="text-white/40">Password:</span> Demo2023</div>
            </div>
          </div>

          {/* Account 2 Card */}
          <div className="p-4 rounded-lg bg-[#121214] border border-white/[0.06] space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#86868b]" /> 2. Partner Whitelabel Demo
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-[#86868b]">Partner Share</span>
            </div>
            <p className="text-xs text-[#86868b]">Reseller experience with custom branding, margins, and float wallet.</p>
            <div className="p-2.5 rounded-md bg-black/40 border border-white/[0.04] font-mono text-xs space-y-1">
              <div><span className="text-white/40">Email:</span> reseller@grekam.com</div>
              <div><span className="text-white/40">Password:</span> reseller123</div>
              <div><span className="text-white/40">Link:</span> /partner/login?demo=partner</div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText("https://grekam.in/partner/login?demo=partner\nCredentials: reseller@grekam.com / reseller123")
                  toast.success("Partner Demo credentials copied!")
                }}
                className="px-3 py-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3 h-3" /> Copy Details
              </button>
              <a
                href="https://wa.me/?text=Hi%20Partner!%20Here%20are%20your%20Whitelabel%20Partner%20Demo%20credentials%20for%20Garage%20CRM:%0A%0A🌐%20Portal:%20https://grekam.in/partner/login?demo=partner%0A📧%20Email:%20reseller@grekam.com%0A🔑%20Password:%20reseller123"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3 h-3" /> Share WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Overview & Growth Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Garages Breakdown Chart Card */}
        <div className="bg-[#161618] border border-white/[0.08] rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-semibold text-white flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-[#86868b]" /> Garages Distribution
          </h2>
          
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs text-[#86868b] mb-1.5">
                <span>Partner Acquired ({resellerPercentage}%)</span>
                <span className="text-white font-mono">{stats.resellerGarages} / {stats.totalGarages}</span>
              </div>
              <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden">
                <div className="bg-white/70 h-full rounded-full transition-all duration-300" style={{ width: `${resellerPercentage}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-[#86868b] mb-1.5">
                <span>Direct Accounts ({directPercentage}%)</span>
                <span className="text-white font-mono">{stats.directGarages} / {stats.totalGarages}</span>
              </div>
              <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden">
                <div className="bg-[#0A84FF] h-full rounded-full transition-all duration-300" style={{ width: `${directPercentage}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Overview Card */}
        <div className="bg-[#161618] border border-white/[0.08] rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-semibold text-white flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-[#86868b]" /> Verified Revenue
            </h2>
            <Link href="/dashboard/admin/partners" className="text-xs text-[#0A84FF] hover:underline flex items-center gap-1">
              Escrow Float <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="text-2xl font-semibold text-white font-mono">{stats.thisMonthRevenue}</div>
            <p className="text-xs text-[#86868b]">Verified partner float deposits and direct subscriptions credited to platform.</p>
          </div>
        </div>

      </div>

      {/* Bottom Row: Recent Activity & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Real Live Activity Log */}
        <div className="bg-[#161618] border border-white/[0.08] rounded-xl p-5 space-y-3.5">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-semibold text-white flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#86868b]" /> Recent Activity
            </h2>
            <Link href="/dashboard/admin/activity" className="text-xs text-[#0A84FF] hover:underline">
              View All
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="py-6 text-center text-[#86868b] text-xs">No platform activity recorded yet.</div>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((act) => (
                <div key={act.id} className="p-2.5 bg-[#121214] border border-white/[0.04] rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <span className="font-medium text-white">{act.who}</span>
                    <span className="text-[#86868b] text-[11px] block mt-0.5">{act.target}</span>
                  </div>
                  <span className="text-[10px] text-[#86868b] font-mono whitespace-nowrap ml-2">{act.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real Live Recent Payments */}
        <div className="bg-[#161618] border border-white/[0.08] rounded-xl p-5 space-y-3.5">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#86868b]" /> Recent Transactions
            </h2>
            <Link href="/dashboard/admin/payments" className="text-xs text-[#0A84FF] hover:underline">
              View All
            </Link>
          </div>

          {recentPayments.length === 0 ? (
            <div className="py-6 text-center text-[#86868b] text-xs">No transactions recorded yet.</div>
          ) : (
            <div className="space-y-2">
              {recentPayments.map((pay) => (
                <div key={pay.id} className="p-2.5 bg-[#121214] border border-white/[0.04] rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <span className="font-medium text-white">{pay.garage}</span>
                    <span className="text-[#86868b] text-[11px] block mt-0.5">{pay.reseller}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white font-mono">{pay.amount}</div>
                    <span className="text-[10px] font-mono text-[#86868b]">
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
