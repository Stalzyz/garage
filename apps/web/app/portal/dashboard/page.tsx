"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Sparkles, LogOut, Briefcase, FileText, CheckCircle,
  Clock, Download, MessageSquare, Bell, ChevronRight,
  Package, Star, AlertCircle, ExternalLink, GraduationCap, PlayCircle
} from "lucide-react"

// ─── Mock Data ───────────────────────────────────────────────────────────────

const CLIENT_DATA: Record<string, {
  projects: any[]; invoices: any[]; proposals: any[]; notifications: any[]; courses: any[]
}> = {
  "RedBrick Realty": {
    projects: [
      {
        id: "p1", name: "Full Brand Identity Package", status: "PRODUCTION", progress: 65,
        manager: "Aisha R.", dueDate: "Jul 10, 2025",
        phases: [
          { name: "Logo Design",            done: true  },
          { name: "Brand Guidelines",       done: true  },
          { name: "Business Stationery",    done: false },
          { name: "Social Media Templates", done: false },
        ],
        deliverables: [
          { name: "Logo_Draft_v2.ai",    ready: true  },
          { name: "Brand_Moodboard.pdf", ready: true  },
          { name: "Guidelines_WIP.pdf",  ready: false },
        ],
      },
    ],
    invoices: [
      { id: "INV-001", amount: 84000,  status: "PAID",    date: "Jun 10, 2025", desc: "50% Advance — Brand Identity" },
      { id: "INV-002", amount: 84000,  status: "PENDING", date: "Jul 01, 2025", desc: "Final Payment — Brand Identity" },
    ],
    proposals: [
      { id: "PRO-001", title: "Full Brand Identity Package", amount: 420000, status: "APPROVED", date: "Jun 5, 2025" },
    ],
    notifications: [
      { id: "n1", message: "Logo Draft v2 is ready for review!", time: "2 hrs ago", unread: true },
      { id: "n2", message: "Invoice INV-002 due in 9 days.",      time: "1 day ago", unread: false },
    ],
    courses: [],
  },
  "Techflow SaaS": {
    projects: [
      {
        id: "p2", name: "Website Redesign", status: "REVIEW", progress: 85,
        manager: "Ravi K.", dueDate: "Jul 15, 2025",
        phases: [
          { name: "UX Research",   done: true  },
          { name: "UI Design",     done: true  },
          { name: "Development",   done: true  },
          { name: "Client Review", done: false },
        ],
        deliverables: [
          { name: "Wireframes_v4.fig",   ready: true },
          { name: "Staging_Link.txt",    ready: true },
          { name: "Final_Export.zip",    ready: false },
        ],
      },
    ],
    invoices: [
      { id: "INV-010", amount: 59000,  status: "PAID",    date: "Jun 14, 2025", desc: "Milestone 1 — UX & Design" },
      { id: "INV-011", amount: 118000, status: "PENDING", date: "Jul 05, 2025", desc: "Milestone 2 — Development" },
    ],
    proposals: [
      { id: "PRO-002", title: "Website Redesign — Techflow SaaS", amount: 295000, status: "APPROVED", date: "Jun 10, 2025" },
    ],
    notifications: [
      { id: "n3", message: "Staging site is live! Please review.", time: "5 hrs ago", unread: true },
    ],
    courses: [
      { id: "c1", title: "SaaS Marketing Foundations", progress: 45, nextLesson: "Module 3: Funnel Optimization", lastAccessed: "2 days ago" }
    ],
  },
  "Fitburst Gym": {
    projects: [
      {
        id: "p3", name: "Product Launch Video", status: "REVIEW", progress: 90,
        manager: "Aisha R.", dueDate: "Jun 25, 2025",
        phases: [
          { name: "Pre-Production", done: true },
          { name: "Shoot",          done: true },
          { name: "Editing",        done: true },
          { name: "Final Approval", done: false },
        ],
        deliverables: [
          { name: "Hero_Video_Draft.mp4",  ready: true  },
          { name: "Social_Cutdowns.zip",   ready: false },
          { name: "Final_Master.mp4",      ready: false },
        ],
      },
    ],
    invoices: [
      { id: "INV-020", amount: 23600,  status: "PAID",    date: "Jun 10, 2025", desc: "Pre-Production Advance" },
      { id: "INV-021", amount: 47200,  status: "OVERDUE", date: "Jun 15, 2025", desc: "Shoot & Post-Production" },
    ],
    proposals: [
      { id: "PRO-003", title: "Video Production — Product Launch", amount: 141600, status: "APPROVED", date: "Jun 5, 2025" },
    ],
    notifications: [
      { id: "n4", message: "Draft video uploaded — awaiting your approval!", time: "1 day ago", unread: true },
      { id: "n5", message: "Invoice INV-021 is overdue. Please process payment.", time: "3 days ago", unread: true },
    ],
    courses: [],
  },
  "Student Demo": {
    projects: [], invoices: [], proposals: [],
    notifications: [
      { id: "n6", message: "New assignment posted in Advanced UI/UX.", time: "1 hr ago", unread: true }
    ],
    courses: [
      { id: "c2", title: "Advanced UI/UX Masterclass", progress: 85, nextLesson: "Module 8: Micro-interactions", lastAccessed: "Just now" },
      { id: "c3", title: "Figma Pro Secrets", progress: 100, nextLesson: "Completed", lastAccessed: "1 week ago", certificate: true }
    ],
  }
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PRODUCTION: { label: "In Production", color: "text-violet-400 bg-violet-400/10 border-violet-400/20" },
  REVIEW:     { label: "In Review",     color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  APPROVED:   { label: "Approved",      color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  PAID:       { label: "Paid",          color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  PENDING:    { label: "Pending",       color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  OVERDUE:    { label: "Overdue",       color: "text-red-400 bg-red-400/10 border-red-400/20" },
}

type TabId = "overview" | "projects" | "invoices" | "proposals" | "courses"

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClientDashboard() {
  const router = useRouter()
  const [client, setClient] = useState<{ name: string; email: string; avatar: string } | null>(null)
  const [tab, setTab] = useState<TabId>("overview")
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem("portal_client")
    if (!stored) { router.replace("/portal"); return }
    setClient(JSON.parse(stored))
  }, [router])

  if (!client) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const data = CLIENT_DATA[client.name] || CLIENT_DATA["RedBrick Realty"]
  const unreadCount = data.notifications.filter(n => n.unread).length
  const project = data.projects[0]
  const paidTotal = data.invoices.filter(i => i.status === "PAID").reduce((s, i) => s + i.amount, 0)
  const pendingTotal = data.invoices.filter(i => ["PENDING", "OVERDUE"].includes(i.status)).reduce((s, i) => s + i.amount, 0)

  const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "overview",  label: "Overview",  icon: Sparkles },
    { id: "projects",  label: "Projects",  icon: Briefcase },
    { id: "invoices",  label: "Invoices",  icon: FileText },
    { id: "proposals", label: "Proposals", icon: CheckCircle },
    { id: "courses",   label: "Courses",   icon: GraduationCap },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-white/8 bg-[#0a0a0f]/90 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Grekam Visuals</p>
            <p className="text-[9px] text-white/30 uppercase tracking-widest">Client Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Bell className="w-4 h-4 text-white/60" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-10 w-80 bg-[#14141f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/8">
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Notifications</p>
                </div>
                {data.notifications.map(n => (
                  <div key={n.id} className={`px-4 py-3 border-b border-white/5 flex items-start gap-3 ${n.unread ? "bg-violet-500/5" : ""}`}>
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-none ${n.unread ? "bg-violet-400" : "bg-transparent"}`} />
                    <div>
                      <p className="text-xs text-white/80">{n.message}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-[10px] font-bold">
              {client.avatar}
            </div>
            <span className="text-xs text-white/70">{client.name}</span>
          </div>

          <button onClick={() => { sessionStorage.removeItem("portal_client"); router.replace("/portal") }}
            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Tab Bar */}
      <div className="px-6 pt-6 border-b border-white/8 flex gap-1">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all border-b-2 ${
                tab === t.id
                  ? "text-white border-violet-500 bg-violet-500/5"
                  : "text-white/40 border-transparent hover:text-white/70 hover:bg-white/3"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome back, <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">{client.name}</span> 👋
              </h1>
              <p className="text-white/40 text-sm mt-1">Here's a snapshot of your active engagement with Grekam Visuals.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Active Projects", value: data.projects.length.toString(), icon: Briefcase, color: "from-violet-600/20 to-violet-600/5", border: "border-violet-500/20" },
                { label: "Progress",        value: `${project.progress}%`,          icon: Clock,     color: "from-blue-600/20 to-blue-600/5",   border: "border-blue-500/20" },
                { label: "Amount Paid",     value: `₹${(paidTotal/1000).toFixed(0)}k`, icon: CheckCircle, color: "from-emerald-600/20 to-emerald-600/5", border: "border-emerald-500/20" },
                { label: "Amount Due",      value: `₹${(pendingTotal/1000).toFixed(0)}k`, icon: AlertCircle, color: "from-amber-600/20 to-amber-600/5", border: "border-amber-500/20" },
              ].map(stat => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className={`bg-gradient-to-br ${stat.color} border ${stat.border} rounded-2xl p-5`}>
                    <Icon className="w-5 h-5 text-white/40 mb-3" />
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/40 mt-1">{stat.label}</p>
                  </div>
                )
              })}
            </div>

            {/* Active Project Card (if any) */}
            {project && (
            <>
              <div className="bg-[#14141f] border border-white/8 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-violet-400" />
                  <p className="text-sm font-semibold text-white">{project.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[project.status].color}`}>
                    {STATUS_CONFIG[project.status].label}
                  </span>
                </div>
                <button onClick={() => setTab("projects")} className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  View Detail <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="px-6 py-5">
                {/* Progress Bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-white/40 mb-2">
                    <span>Overall Progress</span>
                    <span className="text-white font-medium">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }} />
                  </div>
                </div>

                {/* Phases */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {project.phases.map((phase: any) => (
                    <div key={phase.name} className={`p-3 rounded-xl border text-center ${
                      phase.done ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/3 border-white/8"
                    }`}>
                      {phase.done
                        ? <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                        : <Clock className="w-4 h-4 text-white/30 mx-auto mb-1" />}
                      <p className="text-[10px] font-medium text-white/60">{phase.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Deliverables Preview */}
            <div className="bg-[#14141f] border border-white/8 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/8 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-400" />
                <p className="text-sm font-semibold text-white">Deliverables</p>
              </div>
              <div className="divide-y divide-white/5">
                {project.deliverables.map((d: any) => (
                  <div key={d.name} className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${d.ready ? "bg-emerald-400" : "bg-white/20"}`} />
                      <p className="text-sm text-white/70">{d.name}</p>
                    </div>
                    {d.ready
                      ? <button className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                      : <span className="text-[10px] text-white/25 bg-white/5 px-2 py-0.5 rounded">Pending</span>
                    }
                  </div>
                ))}
              </div>
            </div>
            </>
            )}
          </>
        )}

        {/* ── PROJECTS ── */}
        {tab === "projects" && data.projects.map(p => (
          <div key={p.id} className="bg-[#14141f] border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/8">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{p.name}</h2>
                  <p className="text-xs text-white/40 mt-0.5">Manager: {p.manager} · Due: {p.dueDate}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_CONFIG[p.status].color}`}>
                  {STATUS_CONFIG[p.status].label}
                </span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-white/40 mb-2">
                  <span>Progress</span><span className="text-white font-semibold">{p.progress}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/8">
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-4">Phases</p>
                <div className="space-y-2">
                  {p.phases.map((phase: any) => (
                    <div key={phase.name} className="flex items-center gap-3">
                      {phase.done
                        ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-none" />
                        : <div className="w-4 h-4 rounded-full border border-white/20 flex-none" />}
                      <span className={`text-sm ${phase.done ? "text-white/60 line-through" : "text-white/80"}`}>{phase.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-4">Deliverables</p>
                <div className="space-y-2">
                  {p.deliverables.map((d: any) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-none ${d.ready ? "bg-emerald-400" : "bg-white/15"}`} />
                        <span className="text-sm text-white/70">{d.name}</span>
                      </div>
                      {d.ready && (
                        <button className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                          <Download className="w-3 h-3" /> Get
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-white/2 border-t border-white/8 flex justify-end gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors">
                <MessageSquare className="w-3.5 h-3.5" /> Message Team
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors">
                <CheckCircle className="w-3.5 h-3.5" /> Approve Deliverable
              </button>
            </div>
          </div>
        ))}

        {/* ── INVOICES ── */}
        {tab === "invoices" && (
          <div className="bg-[#14141f] border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <p className="text-sm font-semibold text-white">Invoices</p>
              </div>
              <div className="flex gap-4 text-xs">
                <span className="text-emerald-400">Paid: ₹{(paidTotal/1000).toFixed(0)}k</span>
                <span className="text-amber-400">Due: ₹{(pendingTotal/1000).toFixed(0)}k</span>
              </div>
            </div>
            <table className="w-full">
              <thead className="bg-white/3">
                <tr>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-white/30 px-6 py-3">Invoice</th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-white/30 px-4 py-3">Description</th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-white/30 px-4 py-3">Date</th>
                  <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-white/30 px-4 py-3">Amount</th>
                  <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-white/30 px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-violet-400">{inv.id}</td>
                    <td className="px-4 py-4 text-sm text-white/60">{inv.desc}</td>
                    <td className="px-4 py-4 text-sm text-white/40">{inv.date}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-white text-right">₹{inv.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_CONFIG[inv.status].color}`}>
                        {STATUS_CONFIG[inv.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── PROPOSALS ── */}
        {tab === "proposals" && (
          <div className="space-y-4">
            {data.proposals.map(prop => (
              <div key={prop.id} className="bg-[#14141f] border border-white/8 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-mono text-violet-400 mb-1">{prop.id}</p>
                    <h3 className="text-lg font-bold text-white">{prop.title}</h3>
                    <p className="text-xs text-white/40 mt-0.5">Issued: {prop.date}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_CONFIG[prop.status].color}`}>
                    {STATUS_CONFIG[prop.status].label}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/8">
                  <div>
                    <p className="text-xs text-white/30">Total Value</p>
                    <p className="text-xl font-bold text-white mt-0.5">₹{prop.amount.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors">
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" /> View Online
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── COURSES (STUDENT PORTAL) ── */}
        {tab === "courses" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">My Academy Courses</h2>
            </div>
            
            {data.courses.length === 0 ? (
              <div className="bg-[#14141f] border border-white/8 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                <GraduationCap className="w-12 h-12 text-white/10 mb-4" />
                <h3 className="text-lg font-bold text-white">No courses yet</h3>
                <p className="text-white/40 mt-1">You aren't enrolled in any Academy courses.</p>
                <button className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors">
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {data.courses.map((course: any) => (
                  <div key={course.id} className="bg-[#14141f] border border-white/8 rounded-2xl overflow-hidden group hover:border-indigo-500/30 transition-all">
                    {/* Course Banner */}
                    <div className="h-32 bg-gradient-to-br from-indigo-900/50 to-slate-900 flex items-end p-6 border-b border-white/8">
                      <h3 className="text-xl font-bold text-white">{course.title}</h3>
                    </div>
                    <div className="p-6">
                      <div className="mb-6">
                        <div className="flex justify-between text-xs text-white/40 mb-2">
                          <span>Course Progress</span>
                          <span className="text-white font-semibold">{course.progress}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${course.progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} style={{ width: `${course.progress}%` }} />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm bg-white/3 p-3 rounded-xl border border-white/5">
                          <span className="text-white/40">Next Lesson</span>
                          <span className="text-white font-medium truncate ml-4">{course.nextLesson}</span>
                        </div>
                        
                        <div className="flex gap-3">
                          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors">
                            {course.progress === 100 ? <><Star className="w-4 h-4"/> Review</> : <><PlayCircle className="w-4 h-4"/> Resume</>}
                          </button>
                          {course.certificate && (
                            <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-bold transition-colors border border-emerald-500/20">
                              <Download className="w-4 h-4"/> Cert
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
