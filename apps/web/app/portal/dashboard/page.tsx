"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useApi, fetchApi } from "@/lib/useApi"
import {
  Zap, LogOut, Briefcase, FileText, CheckCircle,
  Clock, Download, MessageSquare, Bell, ChevronRight,
  Package, Star, AlertCircle, ExternalLink, GraduationCap, PlayCircle,
  CreditCard, Landmark, Eye, LifeBuoy, X, Loader2, Calendar, UploadCloud, Layers
} from "lucide-react"
import { toast } from "sonner"
import { useOrganization } from "@/context/OrganizationContext"
import { AssetReviewer } from "@/components/portal/AssetReviewer"
import { PaymentModal } from "@/components/portal/PaymentModal"
import { SupportTickets } from "@/components/portal/SupportTickets"
import { ProjectTimeline } from "@/components/portal/ProjectTimeline"
import { useCurrency } from "@/hooks/useCurrency"

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
  const { symbol } = useCurrency()
  const [tab, setTab] = useState<TabId>("overview")
  const [showNotifications, setShowNotifications] = useState(false)
  const [reviewFile, setReviewFile] = useState<{ projectId: string, fileId: string, url: string, type: 'image' | 'video' | 'pdf' | string } | null>(null)

  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingDate, setBookingDate] = useState("")
  const [bookingTime, setBookingTime] = useState("")
  const [bookingTopic, setBookingTopic] = useState("Project Update")
  const [bookingNotes, setBookingNotes] = useState("")
  const [bookingLoading, setBookingLoading] = useState(false)

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadProject, setUploadProject] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadLoading, setUploadLoading] = useState(false)

  // Sandbox state
  const [showSandbox, setShowSandbox] = useState(false)
  const [sandboxInvoice, setSandboxInvoice] = useState<any>(null)
  const [sandboxProcessing, setSandboxProcessing] = useState(false)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentTarget, setPaymentTarget] = useState<{invoiceId: string, amount: number} | null>(null)

  // API Fetches
  const { data: profileMe } = useApi<any>("/portal/me")
  const { data: dashboard, error: dashError, isLoading: dashLoading, mutate: dashMutate } = useApi<any>("/portal/dashboard")
  const { data: projects, error: projError, isLoading: projLoading, mutate: projMutate } = useApi<any>("/portal/projects")
  const { data: invoices, error: invError, isLoading: invLoading, mutate: invMutate } = useApi<any>("/portal/invoices")
  const { data: proposals, error: propError, isLoading: propLoading, mutate: propMutate } = useApi<any>("/portal/proposals")
  const { data: notifications = [], error: notifError, mutate: notifMutate } = useApi<any>("/portal/notifications")

  const mutate = () => {
    dashMutate()
    projMutate()
    invMutate()
    propMutate()
    notifMutate()
  }

  useEffect(() => {
    if (projects && projects.length > 0 && !uploadProject) {
      setUploadProject(projects[0].id)
    }
  }, [projects, uploadProject])

  // Dynamically load Razorpay checkout script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayWithGateway = async (invoiceId: string) => {
    setPayingId(invoiceId)
    try {
      const res = await fetchApi<any>(`/finance/invoices/${invoiceId}/pay`, {
        method: 'POST',
        body: JSON.stringify({})
      })

      if (res?.isLive) {
        const scriptLoaded = await loadRazorpayScript()
        if (!scriptLoaded) {
          toast.error("Failed to load Razorpay Payment gateway.")
          setPayingId(null)
          return
        }

        const options = {
          key: res.keyId,
          amount: res.amount,
          currency: res.currency,
          name: org.name || "Grekam OS",
          description: `Invoice ${res.orderId || invoiceId}`,
          order_id: res.orderId,
          prefill: {
            name: res.clientName || "",
            email: res.clientEmail || ""
          },
          theme: {
            color: "#6d28d9"
          },
          handler: function (response: any) {
            toast.success("Payment completed successfully!")
            mutate()
          },
          modal: {
            ondismiss: function () {
              toast.info("Payment cancelled")
            }
          }
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      } else {
        const allInvoices = invoices || []
        const targetInvoice = allInvoices.find((inv: any) => inv.id === invoiceId)
        setSandboxInvoice(targetInvoice || { id: invoiceId, total: 0, number: "INV-GEN" })
        setShowSandbox(true)
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Failed to process payment request")
    } finally {
      setPayingId(null)
    }
  }

  const triggerPayFullInvoice = (inv: any) => {
    setPaymentTarget({ invoiceId: inv.id, amount: inv.total || inv.totalAmount || 0 });
    setShowPaymentModal(true);
  }

  const handlePayInstallment = async (projectId: string, milestone: any) => {
    try {
      let invoiceId = milestone.invoiceId
      let targetAmount = milestone.amount;
      
      if (!invoiceId) {
        toast.info("Generating invoice for installment...")
        const genRes = await fetchApi<any>(`/projects/${projectId}/billing-milestones/${milestone.id}/generate-invoice`, {
          method: 'POST',
          body: JSON.stringify({})
        })
        if (genRes?.success && genRes.invoice) {
          invoiceId = genRes.invoice.id
          targetAmount = genRes.invoice.total || milestone.amount;
          toast.success("Invoice generated successfully!")
        } else {
          throw new Error("Failed to generate invoice for this installment")
        }
      }
      
      setPaymentTarget({ invoiceId, amount: targetAmount })
      setShowPaymentModal(true)
    } catch (err: any) {
      toast.error(err.message || "Installment payment failed")
    }
  }

  const handleSimulatePayment = async () => {
    if (!sandboxInvoice) return
    setSandboxProcessing(true)
    try {
      await fetchApi(`/finance/invoices/${sandboxInvoice.id}/mock-pay`, {
        method: 'POST',
        body: JSON.stringify({})
      })
      toast.success("Payment simulated successfully!")
      setShowSandbox(false)
      mutate()
    } catch (err: any) {
      toast.error("Failed to simulate payment")
    } finally {
      setSandboxProcessing(false)
    }
  }

  const handleBookCall = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingDate || !bookingTime || !bookingNotes) {
      toast.error("Please fill in all fields")
      return
    }
    setBookingLoading(true)
    try {
      const dateTime = `${bookingDate}T${bookingTime}:00`
      await fetchApi('/portal/bookings', {
        method: 'POST',
        body: JSON.stringify({
          dateTime,
          topic: `${bookingTopic} - ${bookingNotes}`
        })
      })
      toast.success("Meeting booked successfully!")
      setShowBookingModal(false)
      setBookingNotes("")
    } catch (err: any) {
      toast.error("Failed to schedule call")
    } finally {
      setBookingLoading(false)
    }
  }

  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadProject || !uploadFile) {
      toast.error("Please select a project and file")
      return
    }
    setUploadLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      
      const uploadRes = await fetch("/api/v1/storage/upload-local", {
        method: "POST",
        body: formData
      })
      if (!uploadRes.ok) throw new Error("File upload failed")
      
      const fileData = await uploadRes.json()
      
      await fetchApi(`/portal/projects/${uploadProject}/files`, {
        method: 'POST',
        body: JSON.stringify({
          name: uploadFile.name,
          fileUrl: fileData.downloadUrl,
          fileSize: uploadFile.size,
          mimeType: uploadFile.type || 'application/octet-stream'
        })
      })
      
      toast.success("File uploaded successfully!")
      setShowUploadModal(false)
      setUploadFile(null)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file")
    } finally {
      setUploadLoading(false)
    }
  }

  const [activeCommentTexts, setActiveCommentTexts] = useState<Record<string, string>>({})
  const [commentingId, setCommentingId] = useState<string | null>(null)

  const handlePostComment = async (proposalId: string) => {
    const commentText = activeCommentTexts[proposalId]
    if (!commentText || !commentText.trim()) return

    setCommentingId(proposalId)
    try {
      await fetchApi(`/portal/proposals/${proposalId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ comment: commentText })
      })
      toast.success("Comment posted successfully!")
      setActiveCommentTexts(prev => ({ ...prev, [proposalId]: "" }))
      mutate()
    } catch (err: any) {
      toast.error("Failed to post comment")
    } finally {
      setCommentingId(null)
    }
  }

  if (status === "loading" || dashLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session?.user) return null;

  if (dashError || !dashboard) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="text-white/40 mb-4">{dashError?.message || "There was a problem connecting to the API."}</p>
          <button onClick={() => mutate()} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const clientName = profileMe?.name || session?.user?.name || "Client"
  const companyName = profileMe?.companyName || "Independent Client"
  const tier = profileMe?.tier || "BRONZE"
  const avatarInitials = clientName.charAt(0).toUpperCase()
  const unreadCount = notifications.filter((n: any) => !n.readAt).length

  const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "overview",  label: "Overview",  icon: Zap },
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
      alert(`Redirecting to ${method} checkout for ${symbol}${amount}...`);
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
                <Zap className="w-4 h-4 text-white" />
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

      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-r border-white/8 p-4 md:p-6 space-y-1 shrink-0">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  tab === t.id
                    ? "text-white bg-violet-500/10 border border-violet-500/20 shadow-lg shadow-violet-500/5"
                    : "text-white/40 border border-transparent hover:text-white/70 hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            )
          })}
        </aside>

        {/* Content */}
        <div className="flex-1 w-full max-w-5xl px-4 md:px-8 py-8 space-y-8">

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">
                  Welcome back, <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">{clientName}</span> 
                </h1>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2.5 py-0.5 rounded-full">
                  {tier} Tier
                </span>
              </div>
              <p className="text-white/40 text-sm mt-1.5 flex flex-wrap items-center gap-2">
                <span className="text-white/80 font-medium">{companyName}</span>
                <span>•</span>
                <span>{profileMe?.email || session?.user?.email}</span>
                {profileMe?.phone && (
                  <>
                    <span>•</span>
                    <span>{profileMe.phone}</span>
                  </>
                )}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Active Projects", value: dashboard.activeProjects, icon: Briefcase, color: "from-violet-600/20 to-violet-600/5", border: "border-violet-500/20" },
                { label: "Overall Progress",        value: `${dashboard.progress}%`,          icon: Clock,     color: "from-blue-600/20 to-blue-600/5",   border: "border-blue-500/20" },
                { label: "Amount Paid",     value: `${symbol}${(dashboard.paidTotal/1000).toFixed(1)}k`, icon: CheckCircle, color: "from-emerald-600/20 to-emerald-600/5", border: "border-emerald-500/20" },
                { label: "Amount Due",      value: `${symbol}${(dashboard.pendingTotal/1000).toFixed(1)}k`, icon: AlertCircle, color: "from-amber-600/20 to-amber-600/5", border: "border-amber-500/20" },
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

            {/* Active Project & Active Subscription Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Active Project Card */}
              <div className="lg:col-span-2">
                {dashboard.activeProject ? (
                  <div className="bg-[#14141f] border border-white/8 rounded-2xl overflow-hidden h-full flex flex-col justify-between">
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
                    <div className="px-6 py-5 flex-1 flex flex-col justify-center">
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
                ) : (
                  <div className="bg-[#14141f] border border-white/8 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[200px] text-white/40 text-sm">
                    <Briefcase className="w-8 h-8 opacity-40 mb-3" />
                    No active projects at the moment.
                  </div>
                )}
              </div>

              {/* Active Subscription Card */}
              <div className="lg:col-span-1">
                {dashboard.subscription ? (
                  <div className="bg-[#14141f] border border-white/8 rounded-2xl overflow-hidden h-full flex flex-col justify-between">
                    <div className="px-6 py-4 border-b border-white/8 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <p className="text-sm font-semibold text-white">Active Retainer</p>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white">{dashboard.subscription.plan.name}</h3>
                        <p className="text-2xl font-mono font-extrabold text-emerald-400 mt-2">
                          {symbol}{dashboard.subscription.plan.amount.toLocaleString()}
                          <span className="text-xs text-white/40 font-medium font-sans"> / mrr</span>
                        </p>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-white/60">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <span>Product: {dashboard.subscription.plan.product}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/60">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <span>Status: <span className="uppercase text-emerald-400 font-bold">{dashboard.subscription.status}</span></span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 border-t border-white/5 pt-4">
                        <div className="flex justify-between items-center text-xs text-white/40 mb-2">
                          <span>Billing Cycle Progress</span>
                          <span>Next Bill: {dashboard.subscription.plan.nextBilling ? new Date(dashboard.subscription.plan.nextBilling).toLocaleDateString() : 'Continuous'}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
                          <div className="h-full bg-emerald-500 rounded-full w-1/2" />
                        </div>
                        <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white transition-colors">
                          Manage Subscription
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#14141f] border border-white/8 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[200px] text-white/40 text-sm">
                    <Layers className="w-8 h-8 opacity-40 mb-3" />
                    No active retainer plans.
                  </div>
                )}
              </div>

            </div>
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
                            {((d.mimeType && (d.mimeType.startsWith("image/") || d.mimeType.startsWith("video/") || d.mimeType.includes("pdf"))) ||
                             d.url.match(/\.(jpeg|jpg|gif|png|mp4|webm|pdf)/i)) && (
                              <button 
                                onClick={() => setReviewFile({ 
                                  projectId: p.id, 
                                  fileId: d.id, 
                                  url: d.url, 
                                  type: (d.mimeType?.startsWith("video/") || d.url.match(/\.(mp4|webm)/i)) ? 'video' : (d.mimeType?.includes("pdf") || d.url.match(/\.(pdf)/i)) ? 'pdf' : 'image' 
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
                        <span className="text-sm font-bold text-white">{symbol}{milestone.amount.toLocaleString()}</span>
                        
                        {milestone.status === "PAID" ? (
                          <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">PAID</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handlePayInstallment(p.id, milestone)} 
                              disabled={payingId !== null}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-white/10 text-white transition-colors flex items-center gap-1"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Pay Installment
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
              <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors">
                <UploadCloud className="w-3.5 h-3.5" /> Upload File
              </button>
              <button onClick={() => setShowBookingModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors">
                <Calendar className="w-3.5 h-3.5" /> Book Call
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors">
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
                <span className="text-emerald-400">Paid: {symbol}{(dashboard.paidTotal/1000).toFixed(1)}k</span>
                <span className="text-amber-400">Due: {symbol}{(dashboard.pendingTotal/1000).toFixed(1)}k</span>
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
                      <td className="px-4 py-4 text-sm font-semibold text-white text-right">{symbol}{inv.total.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_CONFIG[inv.status]?.color || STATUS_CONFIG.PENDING.color}`}>
                            {STATUS_CONFIG[inv.status]?.label || inv.status}
                          </span>
                          {inv.status !== 'PAID' && (
                            <button 
                              onClick={() => triggerPayFullInvoice(inv)}
                              disabled={payingId === inv.id}
                              className="px-2.5 py-1 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-white/10 text-white text-xs font-bold transition-colors"
                            >
                              {payingId === inv.id ? "Paying..." : "Pay Now"}
                            </button>
                          )}
                        </div>
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
                    <p className="text-xl font-bold text-white mt-0.5">{symbol}{prop.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={`/portal/proposals/${prop.publicToken}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" /> View Proposal
                    </a>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="mt-6 border-t border-white/5 pt-4">
                  <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-violet-400" /> Proposal Discussion ({prop.comments?.length || 0})
                  </h4>
                  
                  {prop.comments && prop.comments.length > 0 && (
                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {prop.comments.map((c: any) => (
                        <div key={c.id} className="bg-white/2 border border-white/5 rounded-xl p-3">
                          <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
                            <span className="font-bold text-violet-400">{c.userName}</span>
                            <span>{new Date(c.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-white/80">{c.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Ask a question or request revision..."
                      value={activeCommentTexts[prop.id] || ""}
                      onChange={e => setActiveCommentTexts(prev => ({ ...prev, [prop.id]: e.target.value }))}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500"
                    />
                    <button
                      onClick={() => handlePostComment(prop.id)}
                      disabled={commentingId === prop.id || !activeCommentTexts[prop.id]?.trim()}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-white/5 disabled:text-white/20 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                    >
                      {commentingId === prop.id ? "..." : "Send"}
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
      </div>
      
      {reviewFile && (
        <AssetReviewer 
          projectId={reviewFile.projectId}
          fileId={reviewFile.fileId}
          fileUrl={reviewFile.url}
          fileType={reviewFile.type}
          onClose={() => {
            setReviewFile(null)
            mutate()
          }}
        />
      )}

      {/* Book Call Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-[#14141f] border border-white/10 rounded-3xl w-full max-w-md p-6 relative overflow-hidden">
            <button onClick={() => setShowBookingModal(false)} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" /> Schedule a Call
            </h3>
            <form onSubmit={handleBookCall} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase mb-1">Select Date</label>
                <input 
                  type="date" 
                  value={bookingDate} 
                  onChange={e => setBookingDate(e.target.value)} 
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase mb-1">Select Time</label>
                <input 
                  type="time" 
                  value={bookingTime} 
                  onChange={e => setBookingTime(e.target.value)} 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase mb-1">Topic</label>
                <select 
                  value={bookingTopic} 
                  onChange={e => setBookingTopic(e.target.value)}
                  className="w-full bg-[#1c1c27] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="Project Update">Project Update</option>
                  <option value="Technical Briefing">Technical Briefing</option>
                  <option value="Billing & Invoicing">Billing & Invoicing</option>
                  <option value="Other Support">Other Support</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase mb-1">Brief Description / Notes</label>
                <textarea 
                  rows={3}
                  value={bookingNotes}
                  onChange={e => setBookingNotes(e.target.value)}
                  placeholder="What would you like to discuss?"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500 resize-none" 
                />
              </div>
              <button 
                type="submit" 
                disabled={bookingLoading}
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-white/10 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2"
              >
                {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {bookingLoading ? "Scheduling..." : "Schedule Call"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-[#14141f] border border-white/10 rounded-3xl w-full max-w-md p-6 relative overflow-hidden">
            <button onClick={() => setShowUploadModal(false)} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-400" /> Upload Project Files
            </h3>
            <form onSubmit={handleFileUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase mb-1">Select Project</label>
                <select 
                  value={uploadProject} 
                  onChange={e => setUploadProject(e.target.value)}
                  required
                  className="w-full bg-[#1c1c27] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                >
                  {projects?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase mb-1">Select File</label>
                <input 
                  type="file" 
                  onChange={e => setUploadFile(e.target.files?.[0] || null)} 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-500 file:cursor-pointer" 
                />
              </div>
              <button 
                type="submit" 
                disabled={uploadLoading}
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-white/10 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2"
              >
                {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {uploadLoading ? "Uploading..." : "Upload File"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sandbox Simulator Modal */}
      {showSandbox && sandboxInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="bg-[#14141f] border border-white/10 rounded-3xl w-full max-w-md p-6 relative overflow-hidden">
            <button onClick={() => setShowSandbox(false)} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Payment Gateway Simulator</h3>
              <p className="text-xs text-white/55 mt-1">This checkout is running in sandbox mode.</p>
            </div>

            <div className="bg-white/3 rounded-2xl p-4 border border-white/5 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Invoice/Order</span>
                <span className="text-white font-mono">{sandboxInvoice.number || sandboxInvoice.invoiceNumber || "INV-GEN"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Payable Amount</span>
                <span className="text-white font-bold">{symbol}{(sandboxInvoice.total || sandboxInvoice.totalAmount || 0).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleSimulatePayment}
              disabled={sandboxProcessing}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/10 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
            >
              {sandboxProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {sandboxProcessing ? "Processing..." : "Complete Simulated Payment"}
            </button>
          </div>
        </div>
      )}
      
      {showPaymentModal && paymentTarget && (
        <PaymentModal
          invoiceId={paymentTarget.invoiceId}
          amount={paymentTarget.amount}
          currency={symbol}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            mutate();
          }}
          onPayWithGateway={(id) => handlePayWithGateway(id)}
        />
      )}
    </div>
  )
}
