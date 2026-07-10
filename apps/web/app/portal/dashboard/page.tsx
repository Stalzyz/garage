"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useApi, fetchApi } from "@/lib/useApi"
import {
  Sparkles, LogOut, Briefcase, FileText, CheckCircle,
  Clock, Download, MessageSquare, Bell, ChevronRight,
  Package, Star, AlertCircle, ExternalLink, GraduationCap, PlayCircle,
  CreditCard, Landmark, Eye, LifeBuoy
} from "lucide-react"
import { useOrganization } from "@/context/OrganizationContext"
import { AssetReviewer } from "@/components/portal/AssetReviewer"
import { SupportTickets } from "@/components/portal/SupportTickets"
import { ProjectTimeline } from "@/components/portal/ProjectTimeline"

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PRODUCTION: { label: "In Production", color: "text-violet-400 bg-violet-400/10 border-violet-400/20" },
  REVIEW:     { label: "In Review",     color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  APPROVED:   { label: "Approved",      color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  PAID:       { label: "Paid",          color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  PENDING:    { label: "Pending",       color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  OVERDUE:    { label: "Overdue",       color: "text-red-400 bg-red-400/10 border-red-400/20" },
  INVOICED:   { label: "Invoiced",      color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  DRAFT:      { label: "Draft",         color: "text-slate-400 bg-slate-400/10 border-slate-400/20" },
  SENT:       { label: "Sent",          color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  VIEWED:     { label: "Viewed",        color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20" },
  BRIEFING:   { label: "Briefing",      color: "text-slate-400 bg-slate-400/10 border-slate-400/20" },
}

type TabId = "overview" | "projects" | "invoices" | "proposals" | "courses" | "support"

export default function ClientDashboard() {
  const { data: session, status } = useSession()
  const org = useOrganization()
  const [tab, setTab] = useState<TabId>("overview")
  const [showNotifications, setShowNotifications] = useState(false)
  const [reviewFile, setReviewFile] = useState<{ projectId: string, fileId: string, url: string, type: 'image' | 'video' } | null>(null)

  // API Fetches
  const { data: dashboard, error: dashError, isLoading: dashLoading } = useApi<any>("/portal/dashboard")
  const { data: projects, error: projError, isLoading: projLoading } = useApi<any>("/portal/projects")
  const { data: invoices, error: invError, isLoading: invLoading } = useApi<any>("/portal/invoices")
  const { data: proposals, error: propError, isLoading: propLoading } = useApi<any>("/portal/proposals")
  const { data: notifications = [], error: notifError } = useApi<any>("/portal/notifications")

  if (status === "loading" || dashLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session?.user) return null;

  const clientName = session.user.name || "Client"
  const avatarInitials = clientName.charAt(0).toUpperCase()
  const unreadCount = notifications.filter((n: any) => !n.readAt).length

  const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "overview",  label: "Overview",  icon: Sparkles },
    { id: "projects",  label: "Projects",  icon: Briefcase },
    { id: "invoices",  label: "Invoices",  icon: FileText },
    { id: "proposals", label: "Proposals", icon: CheckCircle },
    { id: "support",   label: "Support",   icon: LifeBuoy },
    { id: "courses",   label: "Courses",   icon: GraduationCap },
  ]

  const handlePayment = (method: 'stripe' | 'razorpay' | 'bank', milestoneId: string, amount: number) => {
    if (method === 'bank') {
      alert(`Bank Transfer Instructions for Milestone ${milestoneId}:\n\nAccount Name: ${org.name}\nAccount No: 123456789\nIFSC: HDFC000123\n\nPlease email the receipt to ${org.supportEmail || 'billing@agency.com'}`);
    } else {
      alert(`Redirecting to ${method} checkout for ₹${amount}...`);
      // In production, this would call your payment gateway integration
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-white/8 bg-[#0a0a0f]/90 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {org.logoUrl
            ? <img src={org.logoUrl} alt={org.name} className="w-8 h-8 rounded-lg object-contain" />
            : <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
          }
          <div>
            <p className="text-xs font-bold text-white">{org.name}</p>
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
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-white/40 text-xs">No notifications yet.</div>
                ) : (
                  notifications.map((n: any) => (
                    <div key={n.id} className={`px-4 py-3 border-b border-white/5 flex items-start gap-3 ${!n.readAt ? "bg-violet-500/5" : ""}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-none ${!n.readAt ? "bg-violet-400" : "bg-transparent"}`} />
                      <div>
                        <p className="text-xs text-white/80">{n.title}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-[10px] font-bold">
              {avatarInitials}
            </div>
            <span className="text-xs text-white/70">{clientName}</span>
          </div>

          <button onClick={() => signOut({ callbackUrl: '/portal' })}
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
                Welcome back, <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">{clientName}</span> 👋
              </h1>
              <p className="text-white/40 text-sm mt-1">Here's a snapshot of your active engagement with {org.name}.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Active Projects", value: dashboard.activeProjects, icon: Briefcase, color: "from-violet-600/20 to-violet-600/5", border: "border-violet-500/20" },
                { label: "Overall Progress",        value: `${dashboard.progress}%`,          icon: Clock,     color: "from-blue-600/20 to-blue-600/5",   border: "border-blue-500/20" },
                { label: "Amount Paid",     value: `₹${(dashboard.paidTotal/1000).toFixed(1)}k`, icon: CheckCircle, color: "from-emerald-600/20 to-emerald-600/5", border: "border-emerald-500/20" },
                { label: "Amount Due",      value: `₹${(dashboard.pendingTotal/1000).toFixed(1)}k`, icon: AlertCircle, color: "from-amber-600/20 to-amber-600/5", border: "border-amber-500/20" },
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

            {/* Active Project Card */}
            {dashboard.activeProject && (
            <>
              <div className="bg-[#14141f] border border-white/8 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-violet-400" />
                  <p className="text-sm font-semibold text-white">{dashboard.activeProject.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[dashboard.activeProject.status]?.color || STATUS_CONFIG.PRODUCTION.color}`}>
                    {STATUS_CONFIG[dashboard.activeProject.status]?.label || dashboard.activeProject.status}
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
                    <span className="text-white font-medium">{dashboard.activeProject.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all"
                      style={{ width: `${dashboard.activeProject.progress}%` }} />
                  </div>
                </div>

                {/* Phases */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {dashboard.activeProject.phases.map((phase: any) => (
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
            </>
            )}
          </>
        )}

        {/* ── PROJECTS ── */}
        {tab === "projects" && projects?.map((p: any) => (
          <div key={p.id} className="bg-[#14141f] border border-white/8 rounded-2xl overflow-hidden mb-6">
            <div className="px-6 py-5 border-b border-white/8">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{p.name}</h2>
                  <p className="text-xs text-white/40 mt-0.5">Due: {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'TBD'}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_CONFIG[p.status]?.color || STATUS_CONFIG.PRODUCTION.color}`}>
                  {STATUS_CONFIG[p.status]?.label || p.status}
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
                {p.phases.length === 0 ? (
                  <p className="text-xs text-white/30">No phases defined.</p>
                ) : (
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
                )}
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-4">Deliverables</p>
                {p.deliverables.length === 0 ? (
                  <p className="text-xs text-white/30">No deliverables available yet.</p>
                ) : (
                  <div className="space-y-2">
                    {p.deliverables.map((d: any) => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full flex-none ${d.ready ? "bg-emerald-400" : "bg-white/15"}`} />
                          <span className="text-sm text-white/70">{d.name}</span>
                        </div>
                        {d.ready && (
                          <div className="flex gap-3">
                            {(d.url.match(/\.(jpeg|jpg|gif|png)$/i) || d.url.match(/\.(mp4|webm)$/i)) && (
                              <button 
                                onClick={() => setReviewFile({ 
                                  projectId: p.id, 
                                  fileId: d.id, 
                                  url: d.url, 
                                  type: d.url.match(/\.(mp4|webm)$/i) ? 'video' : 'image' 
                                })}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                              >
                                <Eye className="w-3 h-3" /> Review
                              </button>
                            )}
                            <a href={d.url} target="_blank" rel="noreferrer" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                              <Download className="w-3 h-3" /> Get
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Billing Milestones (Installments) */}
            {p.billingSchedule && p.billingSchedule.milestones.length > 0 && (
              <div className="px-6 py-6 border-t border-white/8 bg-white/2">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-white">Payment Installments</h3>
                </div>
                <div className="space-y-3">
                  {p.billingSchedule.milestones.map((milestone: any) => (
                    <div key={milestone.id} className="flex items-center justify-between p-4 rounded-xl bg-[#1a1a24] border border-white/5">
                      <div>
                        <p className="text-sm font-medium text-white">{milestone.name}</p>
                        <p className="text-xs text-white/40 mt-1">Due: {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : 'TBD'}</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-white">₹{milestone.amount.toLocaleString()}</span>
                        
                        {milestone.status === "PAID" ? (
                          <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">PAID</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button onClick={() => handlePayment('stripe', milestone.id, milestone.amount)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
                              Pay via Stripe
                            </button>
                            <button onClick={() => handlePayment('razorpay', milestone.id, milestone.amount)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                              Razorpay
                            </button>
                            <button onClick={() => handlePayment('bank', milestone.id, milestone.amount)} className="p-1.5 text-white/40 hover:text-white transition-colors border border-white/10 rounded-lg hover:bg-white/5" title="Bank Transfer">
                              <Landmark className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Activity Timeline */}
            <div className="px-6 py-6 border-t border-white/8 bg-white/2">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white">Live Activity Timeline</h3>
              </div>
              <ProjectTimeline projectId={p.id} />
            </div>

            <div className="px-6 py-4 bg-white/2 border-t border-white/8 flex justify-end gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors">
                <MessageSquare className="w-3.5 h-3.5" /> Message Team
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
                <span className="text-emerald-400">Paid: ₹{(dashboard.paidTotal/1000).toFixed(1)}k</span>
                <span className="text-amber-400">Due: ₹{(dashboard.pendingTotal/1000).toFixed(1)}k</span>
              </div>
            </div>
            {invoices?.length === 0 ? (
              <div className="p-8 text-center text-white/40 text-sm">No invoices found.</div>
            ) : (
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
                  {invoices?.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-violet-400">{inv.number}</td>
                      <td className="px-4 py-4 text-sm text-white/60">Professional Services</td>
                      <td className="px-4 py-4 text-sm text-white/40">{new Date(inv.issueDate).toLocaleDateString()}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-white text-right">₹{inv.total.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_CONFIG[inv.status]?.color || STATUS_CONFIG.PENDING.color}`}>
                          {STATUS_CONFIG[inv.status]?.label || inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── PROPOSALS ── */}
        {tab === "proposals" && (
          <div className="space-y-4">
            {proposals?.length === 0 && (
              <div className="p-8 text-center text-white/40 text-sm bg-[#14141f] border border-white/8 rounded-2xl">No proposals found.</div>
            )}
            {proposals?.map((prop: any) => (
              <div key={prop.id} className="bg-[#14141f] border border-white/8 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-mono text-violet-400 mb-1">{prop.id.substring(0,8)}</p>
                    <h3 className="text-lg font-bold text-white">{prop.title}</h3>
                    <p className="text-xs text-white/40 mt-0.5">Issued: {new Date(prop.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_CONFIG[prop.status]?.color || STATUS_CONFIG.DRAFT.color}`}>
                    {STATUS_CONFIG[prop.status]?.label || prop.status}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/8">
                  <div>
                    <p className="text-xs text-white/30">Total Value</p>
                    <p className="text-xl font-bold text-white mt-0.5">₹{prop.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={`/portal/proposals/${prop.publicToken}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" /> View Proposal
                    </a>
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
            
            <div className="bg-[#14141f] border border-white/8 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
              <GraduationCap className="w-12 h-12 text-white/10 mb-4" />
              <h3 className="text-lg font-bold text-white">No courses yet</h3>
              <p className="text-white/40 mt-1">You aren't enrolled in any Academy courses.</p>
              <button className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors">
                Browse Catalog
              </button>
            </div>
          </div>
        )}

      </div>
      
      {reviewFile && (
        <AssetReviewer 
          projectId={reviewFile.projectId}
          fileId={reviewFile.fileId}
          fileUrl={reviewFile.url}
          fileType={reviewFile.type}
          onClose={() => setReviewFile(null)}
        />
      )}
    </div>
  )
}
