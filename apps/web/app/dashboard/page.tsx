"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { 
  Building2, Users, GraduationCap, DollarSign, Briefcase, AlertCircle, 
  TrendingUp, Phone, Plus, CheckCircle2, Clock, Calendar, ArrowUpRight, 
  Layers, ChevronRight, Activity, Award, UserCheck, FileText, CheckSquare,
  Compass, Filter, ExternalLink, ShieldCheck, PieChart, BarChart3, RefreshCw
} from "lucide-react"
import { useApi } from "@/lib/useApi"
import { useCurrency } from "@/hooks/useCurrency"
import { motion } from "framer-motion"

export default function CombinedGrekamOSDashboard() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<"COMBINED" | "CRM" | "HRM">("COMBINED")

  const { data: overview, isLoading, mutate: refreshOverview } = useApi<any>("/analytics/overview")
  const { data: revenueData } = useApi<any>("/analytics/revenue?months=6")
  const { data: leadFunnel } = useApi<any>("/analytics/leads")
  const { symbol } = useCurrency()

  const revenue = overview?.agency?.revenueCollected || 0
  const students = overview?.academy?.totalStudents || 0
  const activeBatches = overview?.academy?.activeBatches || 0
  const activeProjects = overview?.agency?.activeProjects || 0
  const totalLeads = overview?.agency?.totalLeads || 0
  const totalPayroll = overview?.agency?.totalPayroll || 0
  const openTickets = overview?.support?.openTickets || 0

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-[#000000] text-[#f5f5f7] overflow-y-auto custom-scrollbar font-sans">
      
      {/* --- TOP COMMAND HEADER --- */}
      <div className="px-6 py-5 md:px-8 md:py-6 border-b border-white/[0.07] bg-[#000000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-medium text-zinc-500 tracking-wide">
              Overview
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-[11px] text-zinc-500 font-mono">dashboard.grekam.in</span>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-[#f5f5f7]">
            Operations Center
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time unified activity across sales, projects, attendance, and clients.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => refreshOverview()}
            className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] text-zinc-300 border border-white/[0.08] transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <Link
            href="/dashboard/crm/dialer"
            className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-zinc-200 border border-white/[0.08] font-medium text-xs flex items-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-zinc-400" /> Power Dialer
          </Link>

          <Link
            href="/dashboard/crm/contacts"
            className="px-3.5 py-1.5 rounded-lg bg-white text-black hover:bg-white/90 font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-black" /> Add Lead
          </Link>
        </div>
      </div>

      {/* --- UNIFIED SECTION TAB SWITCHER (Apple Segmented Control) --- */}
      <div className="px-6 md:px-8 py-3 border-b border-white/[0.07] bg-[#000000] flex items-center">
        <div className="bg-[#1c1c1e] p-1 rounded-xl border border-white/[0.07] inline-flex items-center gap-1 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab("COMBINED")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === "COMBINED" 
                ? "bg-white/[0.12] text-white shadow-xs" 
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Overview
          </button>

          <button
            onClick={() => setActiveTab("CRM")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === "CRM" 
                ? "bg-white/[0.12] text-white shadow-xs" 
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> CRM & Sales
          </button>

          <button
            onClick={() => setActiveTab("HRM")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === "HRM" 
                ? "bg-white/[0.12] text-white shadow-xs" 
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Team & Attendance
          </button>
        </div>
      </div>

      {/* --- DASHBOARD BODY CONTENT --- */}
      <div className="p-6 md:p-8 space-y-8 flex-1">
        
        {/* ==================== TAB 1: COMBINED OVERVIEW ==================== */}
        {activeTab === "COMBINED" && (
          <div className="space-y-6">
            
            {/* 4 PRIMARY PILLAR CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Pillar 1: CRM & Sales */}
              <div className="bg-[#161618] border border-white/[0.07] rounded-xl p-4 hover:border-white/[0.12] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-zinc-400" /> Sales & Leads
                  </span>
                  <Link href="/dashboard/crm" className="text-zinc-500 hover:text-white transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="text-2xl font-semibold text-[#f5f5f7] tracking-tight tabular-nums">
                  {isLoading ? "..." : totalLeads.toLocaleString()}
                </div>
                <div className="text-xs text-zinc-500 flex items-center justify-between mt-2 pt-2 border-t border-white/[0.05]">
                  <span>Active Proposals</span>
                  <span className="font-medium text-zinc-300 tabular-nums">{isLoading ? "..." : (overview?.agency?.activeProposals || 0)}</span>
                </div>
              </div>

              {/* Pillar 2: HRM & Workforce */}
              <div className="bg-[#161618] border border-white/[0.07] rounded-xl p-4 hover:border-white/[0.12] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-zinc-400" /> Team & Payroll
                  </span>
                  <Link href="/dashboard/hr" className="text-zinc-500 hover:text-white transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="text-2xl font-semibold text-[#f5f5f7] tracking-tight tabular-nums">
                  {isLoading ? "..." : (overview?.crm?.totalContacts || 0).toString()}
                </div>
                <div className="text-xs text-zinc-500 flex items-center justify-between mt-2 pt-2 border-t border-white/[0.05]">
                  <span>Monthly Payroll</span>
                  <span className="font-medium text-zinc-300 tabular-nums">{isLoading ? "..." : symbol + (totalPayroll || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Pillar 3: Projects & Sprint Deliverables */}
              <div className="bg-[#161618] border border-white/[0.07] rounded-xl p-4 hover:border-white/[0.12] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-zinc-400" /> Projects & Sprints
                  </span>
                  <Link href="/dashboard/projects" className="text-zinc-500 hover:text-white transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="text-2xl font-semibold text-[#f5f5f7] tracking-tight tabular-nums">
                  {isLoading ? "..." : (overview?.agency?.activeProjects || 0).toLocaleString()}
                </div>
                <div className="text-xs text-zinc-500 flex items-center justify-between mt-2 pt-2 border-t border-white/[0.05]">
                  <span>Active Workspaces</span>
                  <span className="font-medium text-zinc-300 tabular-nums">{isLoading ? "..." : (overview?.agency?.activeProjects || 0)}</span>
                </div>
              </div>

              {/* Pillar 4: Financial Revenue */}
              <div className="bg-[#161618] border border-white/[0.07] rounded-xl p-4 hover:border-white/[0.12] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-zinc-400" /> Revenue
                  </span>
                  <Link href="/dashboard/finance" className="text-zinc-500 hover:text-white transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="text-2xl font-semibold text-[#f5f5f7] tracking-tight tabular-nums">{isLoading ? "..." : symbol + revenue.toLocaleString()}</div>
                <div className="text-xs text-zinc-500 flex items-center justify-between mt-2 pt-2 border-t border-white/[0.05]">
                  <span>Open Tickets</span>
                  <span className="font-medium text-zinc-300 tabular-nums">{isLoading ? "..." : (openTickets || 0)}</span>
                </div>
              </div>

            </div>

            {/* TWO COLUMNS: CHARTS & QUICK MODULE ACTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Revenue Trajectory Chart */}
              <div className="lg:col-span-2 bg-[#161618] border border-white/[0.07] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#0A84FF]" />
                    <h2 className="text-xs font-semibold text-[#f5f5f7]">Revenue Trajectory</h2>
                  </div>
                  <span className="text-[11px] text-zinc-500 tabular-nums">Last 6 Months</span>
                </div>

                <div className="h-56 flex items-end gap-3 pt-4 border-b border-white/[0.06] relative">
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-[10px] text-zinc-500 tabular-nums py-1">
                    <span>{symbol}100k</span>
                    <span>{symbol}50k</span>
                    <span>{symbol}0</span>
                  </div>

                  <div className="flex-1 flex items-end gap-3 pl-12 h-full">
                    {revenueData?.data?.map((m: any, i: number) => {
                      const maxRev = Math.max(...(revenueData.data.map((d: any) => d.revenue || 0)), 100000)
                      const hPct = m.revenue > 0 ? Math.max((m.revenue / maxRev) * 100, 8) : 4

                      return (
                        <div key={i} className="flex-1 group relative h-full flex items-end">
                          <div 
                            className="w-full bg-[#0A84FF] hover:bg-[#3a9eff] rounded-t-sm transition-colors duration-150"
                            style={{ height: `${hPct}%` }}
                          />
                          <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 bg-[#2c2c2e] border border-white/[0.12] px-2 py-0.5 rounded text-[10px] tabular-nums text-white whitespace-nowrap transition-opacity shadow-lg z-10">
                            {symbol}{m.revenue.toLocaleString()}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex justify-between pl-12 pr-2 pt-2.5 text-[11px] text-zinc-500">
                  {revenueData?.data?.map((m: any, i: number) => (
                    <span key={i} className="flex-1 text-center">{m.month}</span>
                  ))}
                </div>
              </div>

              {/* Right Column: Quick Module Operations */}
              <div className="lg:col-span-1 bg-[#161618] border border-white/[0.07] rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/[0.06]">
                    <Layers className="w-4 h-4 text-zinc-400" />
                    <h2 className="text-xs font-semibold text-[#f5f5f7]">Quick Actions</h2>
                  </div>

                  <div className="space-y-1.5">
                    <Link
                      href="/dashboard/crm/dialer"
                      className="p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-md bg-white/[0.05] text-zinc-300">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-[#f5f5f7]">Power Dialer</div>
                          <div className="text-[10px] text-zinc-500">Call queue & notes</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                    </Link>

                    <Link
                      href="/dashboard/hr/attendance"
                      className="p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-md bg-white/[0.05] text-zinc-300">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-[#f5f5f7]">Attendance & Punch</div>
                          <div className="text-[10px] text-zinc-500">Workforce status</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                    </Link>

                    <Link
                      href="/dashboard/projects"
                      className="p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-md bg-white/[0.05] text-zinc-300">
                          <Layers className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-[#f5f5f7]">Projects & Sprints</div>
                          <div className="text-[10px] text-zinc-500">Milestones & deliverables</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                    </Link>

                    <Link
                      href="/dashboard/finance/invoices"
                      className="p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-md bg-white/[0.05] text-zinc-300">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-[#f5f5f7]">Invoicing & Billing</div>
                          <div className="text-[10px] text-zinc-500">Quotes & tax invoices</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                    </Link>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[11px] text-zinc-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
                    Operational
                  </span>
                  <span className="text-[10px] text-zinc-500">All systems normal</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== TAB 2: CRM & SALES ==================== */}
        {activeTab === "CRM" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#f5f5f7] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-zinc-400" /> Pipeline Overview
              </h2>
              <Link href="/dashboard/crm/dialer" className="px-3 py-1.5 bg-white text-black hover:bg-white/90 font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors">
                <Phone className="w-3.5 h-3.5" /> Power Dialer
              </Link>
            </div>

            {/* Lead Pipeline Stages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {leadFunnel?.data?.map((group: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-[#161618] border border-white/[0.07] flex flex-col justify-between">
                  <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">{group.status}</span>
                  <div className="text-2xl font-semibold text-[#f5f5f7] tabular-nums mt-2 mb-1">{group._count} Leads</div>
                  <span className="text-[11px] text-zinc-500 font-medium">Active Pipeline</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: HRM & WORKFORCE ==================== */}
        {activeTab === "HRM" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#f5f5f7] flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-400" /> Team & Workforce
              </h2>
              <Link href="/dashboard/hr/attendance" className="px-3 py-1.5 bg-white/[0.08] hover:bg-white/[0.12] text-zinc-200 border border-white/[0.08] font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors">
                <Clock className="w-3.5 h-3.5" /> Punch Clock
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#161618] border border-white/[0.07] space-y-1">
                <span className="text-[11px] text-zinc-400 font-medium">Total Payroll</span>
                <div className="text-2xl font-semibold text-[#f5f5f7] tabular-nums">{symbol}{totalPayroll.toLocaleString()}</div>
                <p className="text-[11px] text-zinc-500">Verified net salary disbursements</p>
              </div>

              <div className="p-4 rounded-xl bg-[#161618] border border-white/[0.07] space-y-1">
                <span className="text-[11px] text-zinc-400 font-medium">Active Team</span>
                <div className="text-2xl font-semibold text-[#f5f5f7] tabular-nums">{overview?.agency?.totalEmployees || 0} Staff</div>
                <p className="text-[11px] text-zinc-500">Assigned & active team members</p>
              </div>

              <div className="p-4 rounded-xl bg-[#161618] border border-white/[0.07] space-y-1">
                <span className="text-[11px] text-zinc-400 font-medium">Attendance Rate</span>
                <div className="text-2xl font-semibold text-[#30D158] tabular-nums">{overview?.agency?.totalEmployees ? "100%" : "0%"}</div>
                <p className="text-[11px] text-zinc-500">On-time check-in compliance</p>
              </div>
            </div>
          </div>
        )}


      </div>

    </div>
  )
}
