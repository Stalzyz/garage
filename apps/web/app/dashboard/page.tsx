"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { 
  Activity, Users, DollarSign, TrendingUp, Calendar, AlertCircle, 
  Briefcase, GraduationCap, BookOpen, CheckCircle, Clock, ArrowRight, 
  UploadCloud, PlayCircle, Image as ImageIcon, CreditCard, FileText, 
  ExternalLink, MessageSquare, Layers, Eye, Download, X, Loader2 
} from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { useOrganization } from "@/context/OrganizationContext"
import { useCurrency } from "@/hooks/useCurrency"
import { toast } from "sonner"
import { AssetReviewer } from "@/components/portal/AssetReviewer"

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "text-white/40 border-white/10 bg-white/5" },
  SENT: { label: "Sent", color: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
  VIEWED: { label: "Viewed", color: "text-amber-400 border-amber-500/20 bg-amber-500/10" },
  APPROVED: { label: "Approved", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
  ACCEPTED: { label: "Accepted", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
  REJECTED: { label: "Rejected", color: "text-rose-400 border-rose-500/20 bg-rose-500/10" },
}

export default function DashboardHome() {
  const { data: session } = useSession()
  const role = session?.user?.role || "INTERN"

  if (role === "STUDENT") {
    return <StudentDashboard />
  }
  
  if (role === "CLIENT") {
    return <ClientDashboard />
  }

  if (role === "STAFF") {
    return <StaffDashboard />
  }

  // Super Admin / Manager view
  return <AdminDashboard session={session} />
}

function StaffDashboard() {
  return (
    <div className="flex flex-col h-full bg-dash-bg-surface text-dash-text-primary p-8">
      <h1 className="text-3xl font-bold mb-2">Staff Portal</h1>
      <p className="text-dash-text-secondary mb-8">Welcome to your workspace.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="My Projects" value="4" icon={<Briefcase className="w-5 h-5"/>} color="text-blue-400" bg="bg-blue-500/10" />
        <StatCard title="Open Tasks" value="12" icon={<Activity className="w-5 h-5"/>} color="text-amber-400" bg="bg-amber-500/10" />
        <StatCard title="Hours Logged" value="32h" icon={<Clock className="w-5 h-5"/>} color="text-emerald-400" bg="bg-emerald-500/10" />
      </div>

      <div className="mt-8 bg-dash-bg-card border border-dash-border-subtle rounded-3xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-400"/> Recent Activity</h2>
        <div className="text-sm text-dash-text-secondary">You recently completed the "Wireframing" task for Project X.</div>
      </div>
    </div>
  )
}

function StudentDashboard() {
  return (
    <div className="flex flex-col h-full bg-dash-bg-surface text-dash-text-primary p-8">
      <h1 className="text-3xl font-bold mb-2">My Academy</h1>
      <p className="text-dash-text-secondary mb-8">Welcome back! Ready to continue learning?</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Enrolled Courses" value="3" icon={<BookOpen className="w-5 h-5"/>} color="text-blue-400" bg="bg-blue-500/10" />
        <StatCard title="Completed" value="1" icon={<GraduationCap className="w-5 h-5"/>} color="text-emerald-400" bg="bg-emerald-500/10" />
        <StatCard title="Pending Assignments" value="2" icon={<Briefcase className="w-5 h-5"/>} color="text-amber-400" bg="bg-amber-500/10" />
      </div>

      <div className="mt-8 bg-dash-bg-card border border-dash-border-subtle rounded-3xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-400"/> Continue Learning</h2>
        <div className="text-sm text-dash-text-secondary">You are currently taking "Advanced Web Development". You have completed 45% of the course.</div>
      </div>
    </div>
  )
}

function EducatorDashboard() {
  return (
    <div className="flex flex-col h-full bg-dash-bg-surface text-dash-text-primary p-8">
      <h1 className="text-3xl font-bold mb-2">Educator Portal</h1>
      <p className="text-dash-text-secondary mb-8">Here is the overview of your classes and students.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Active Classes" value="4" icon={<BookOpen className="w-5 h-5"/>} color="text-blue-400" bg="bg-blue-500/10" />
        <StatCard title="Total Students" value="128" icon={<Users className="w-5 h-5"/>} color="text-emerald-400" bg="bg-emerald-500/10" />
        <StatCard title="Assignments to Grade" value="15" icon={<AlertCircle className="w-5 h-5"/>} color="text-amber-400" bg="bg-amber-500/10" />
      </div>
    </div>
  )
}

function ClientDashboard() {
  const { data: session } = useSession()
  const org = useOrganization()
  const { symbol } = useCurrency()
  const [reviewFile, setReviewFile] = useState<{ projectId: string, fileId: string, url: string, type: 'image' | 'video' } | null>(null)

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

  // Proposal comment states
  const [activeCommentTexts, setActiveCommentTexts] = useState<Record<string, string>>({})
  const [commentingId, setCommentingId] = useState<string | null>(null)

  // API Fetches
  const { data: dashboard, isLoading: dashLoading, mutate: dashMutate } = useApi<any>("/portal/dashboard")
  const { data: projects, mutate: projMutate } = useApi<any>("/portal/projects")
  const { data: invoices, mutate: invMutate } = useApi<any>("/portal/invoices")
  const { data: proposals, mutate: propMutate } = useApi<any>("/portal/proposals")
  const { data: notifications = [], mutate: notifMutate } = useApi<any>("/portal/notifications")

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

  const handlePayInvoice = async (invoiceId: string) => {
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

  const handlePayFirstUnpaidInvoice = async () => {
    const unpaid = invoices?.find((inv: any) => inv.status !== 'PAID')
    if (unpaid) {
      await handlePayInvoice(unpaid.id)
    } else {
      toast.info("No outstanding invoices found.")
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

  if (dashLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  if (!dashboard) return null

  const deliverables = projects?.reduce((acc: any[], project: any) => {
    const projectFiles = project.deliverables || [];
    return [...acc, ...projectFiles.map((d: any) => ({ ...d, projectName: project.name, projectId: project.id }))];
  }, []) || [];

  return (
    <div className="flex flex-col h-full bg-dash-bg-surface text-dash-text-primary p-6 md:p-10 overflow-y-auto custom-scrollbar space-y-8">
      
      {/* 1. Welcome Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-dash-text-primary to-dash-text-secondary bg-clip-text text-transparent">
            Client Portal
          </h1>
          <p className="text-dash-text-secondary mt-2 text-lg">Your central hub for projects, assets, and billing.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button onClick={() => {
            if (projects && projects.length > 0) {
              setUploadProject(projects[0].id)
            }
            setShowUploadModal(true)
          }} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all flex items-center gap-2">
            <UploadCloud className="w-4 h-4" /> Upload Files
          </button>
          <button onClick={() => setShowBookingModal(true)} className="px-4 py-2 bg-dash-bg-elevated hover:bg-dash-border-subtle border border-dash-border-strong rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" /> Book Call
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 2. Visual Project "Pizza Tracker" */}
          {dashboard.activeProject ? (
            <div className="bg-dash-bg-card border border-dash-border-subtle rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-1/4 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-400" /> {dashboard.activeProject.name}
                  </h2>
                  <p className="text-xs text-dash-text-secondary mt-1">Overall Progress: {dashboard.activeProject.progress}%</p>
                </div>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold tracking-wider uppercase">
                  {dashboard.activeProject.status}
                </span>
              </div>

              {/* Progress Line */}
              <div className="relative pt-4 pb-2">
                <div className="absolute top-8 left-[10%] right-[10%] h-1 bg-dash-border-subtle rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all duration-500" 
                    style={{ width: `${Math.max(10, dashboard.activeProject.progress)}%` }}
                  />
                </div>
                
                <div className="flex justify-between relative z-10">
                  {dashboard.activeProject.phases.map((phase: any, idx: number) => (
                    <div key={idx} className="flex flex-col items-center gap-3 w-1/4">
                      {phase.done ? (
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-dash-bg-base border-2 border-dash-border-strong text-dash-text-secondary flex items-center justify-center">
                          <Clock className="w-4 h-4" />
                        </div>
                      )}
                      <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${phase.done ? "text-dash-text-primary" : "text-dash-text-secondary"}`}>
                        {phase.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-dash-bg-card border border-dash-border-subtle rounded-3xl p-8 text-center flex flex-col items-center justify-center text-white/40 text-sm">
              <Briefcase className="w-8 h-8 opacity-40 mb-3" />
              No active projects at the moment.
            </div>
          )}

          {/* 3. Recent Deliverables Gallery */}
          <div className="bg-dash-bg-card border border-dash-border-subtle rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-400" /> Recent Deliverables
              </h2>
            </div>
            
            {deliverables.length === 0 ? (
              <div className="text-center py-10 text-white/30 text-xs border border-dashed border-white/10 rounded-2xl">
                No deliverables uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deliverables.slice(0, 6).map((file: any) => {
                  const isImage = file.mimeType?.startsWith('image/') || file.url?.match(/\.(jpeg|jpg|gif|png)/i);
                  const isVideo = file.mimeType?.startsWith('video/') || file.url?.match(/\.(mp4|webm)/i);
                  return (
                    <div key={file.id} className="group relative aspect-video rounded-xl overflow-hidden bg-dash-bg-elevated border border-dash-border-strong cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-blue-500/10 group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-black/40">
                        {isImage ? <ImageIcon className="w-6 h-6 text-blue-400 mb-2" /> : isVideo ? <PlayCircle className="w-6 h-6 text-purple-400 mb-2" /> : <FileText className="w-6 h-6 text-emerald-400 mb-2" />}
                        <span className="text-xs font-bold text-white truncate w-full" title={file.name}>{file.name}</span>
                        <p className="text-[9px] text-white/40 mt-1 uppercase tracking-wider">{file.projectName}</p>
                      </div>
                      
                      <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 bg-black/85 transition-opacity duration-300">
                        {(isImage || isVideo) && (
                          <button
                            onClick={() => setReviewFile({
                              projectId: file.projectId,
                              fileId: file.id,
                              url: file.url,
                              type: isVideo ? 'video' : 'image'
                            })}
                            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors animate-pulse"
                          >
                            <Eye className="w-3.5 h-3.5" /> Review
                          </button>
                        )}
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> Get
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Proposals Received List & Comments */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-indigo-400" /> Proposals Received
            </h2>
            
            {proposals?.length === 0 ? (
              <div className="p-8 text-center text-white/40 text-sm bg-dash-bg-card border border-dash-border-subtle rounded-2xl">No proposals found.</div>
            ) : (
              proposals.map((prop: any) => (
                <div key={prop.id} className="bg-dash-bg-card border border-dash-border-subtle rounded-3xl p-6">
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
                  
                  <div className="flex items-center justify-between pt-4 border-t border-dash-border-subtle">
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

                  {/* Proposal Comments Thread */}
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
              ))
            )}
          </div>
          
        </div>

        {/* Right Column (1/3 width) */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* 5. Dynamic Financial Summary (Pay Now) */}
          <div className="bg-gradient-to-br from-dash-bg-card to-dash-bg-base border border-dash-border-subtle rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full group-hover:bg-amber-500/20 transition-colors pointer-events-none" />
            
            <h2 className="text-sm font-bold tracking-wider uppercase text-dash-text-secondary mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" /> Outstanding Balance
            </h2>
            <p className="text-4xl font-black font-mono text-dash-text-primary tracking-tight mb-1">
              {symbol}{dashboard.pendingTotal.toLocaleString()}
            </p>
            <p className="text-xs text-dash-text-secondary mb-6">Total pending payable client invoices</p>
            
            <button 
              onClick={handlePayFirstUnpaidInvoice}
              disabled={payingId !== null || dashboard.pendingTotal === 0}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-white/10 disabled:text-white/40 text-black rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all"
            >
              {payingId !== null ? "Processing..." : "Pay Invoice Now"}
            </button>
          </div>

          {/* 6. Active Subscription Card */}
          {dashboard.subscription ? (
            <div className="bg-dash-bg-card border border-dash-border-subtle rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">Active Retainer Plan</h3>
                </div>
                <h4 className="text-xl font-bold text-white">{dashboard.subscription.plan.name}</h4>
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
              <div className="mt-6 border-t border-white/5 pt-4 text-xs text-white/40">
                <span>Next Billing: {dashboard.subscription.plan.nextBilling ? new Date(dashboard.subscription.plan.nextBilling).toLocaleDateString() : 'Continuous'}</span>
              </div>
            </div>
          ) : (
            <div className="bg-dash-bg-card border border-dash-border-subtle rounded-3xl p-6 text-center text-white/40 text-xs">
              No active retainer subscriptions.
            </div>
          )}

          {/* 7. Live Activity Feed */}
          <div className="bg-dash-bg-card border border-dash-border-subtle rounded-3xl p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" /> Recent Activity
            </h2>
            <div className="space-y-6">
              {notifications.slice(0, 5).map((n: any) => (
                <ActivityItem 
                  key={n.id}
                  title={n.title} 
                  desc={n.message} 
                  time={new Date(n.createdAt).toLocaleDateString()} 
                  color="bg-blue-500" 
                />
              ))}
              {notifications.length === 0 && (
                <div className="text-center text-white/30 text-xs py-4">No recent activity logs.</div>
              )}
            </div>
          </div>

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
    </div>
  )
}

function AdminDashboard({ session }: { session: any }) {
  const { data: overview, isLoading } = useApi<any>("/analytics/overview")
  const { data: revenueData } = useApi<any>("/analytics/revenue?months=8")
  const { symbol } = useCurrency()

  const revenue = overview?.agency?.revenueCollected || 0
  const students = overview?.academy?.totalStudents || 0
  const activeProjects = overview?.agency?.activeProjects || 0
  const openTickets = overview?.support?.openTickets || 0

  return (
    <div className="flex flex-col h-full bg-dash-bg-surface text-dash-text-primary overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="px-8 py-10">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-dash-text-primary to-dash-text-secondary bg-clip-text text-transparent">
          Welcome back, {session?.user?.name || 'Commander'}
        </h1>
        <p className="text-dash-text-secondary mt-2 text-lg">Here is your system overview for today.</p>
      </div>

      <div className="px-8 pb-10 space-y-8">
        
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={isLoading ? "..." : `${symbol}${revenue.toLocaleString()}`} 
            trend="Live Data" 
            icon={<DollarSign className="w-5 h-5" />} 
            color="text-emerald-400"
            bg="bg-emerald-500/10"
          />
          <StatCard 
            title="Active Students" 
            value={isLoading ? "..." : students.toLocaleString()} 
            trend="Live Data" 
            icon={<GraduationCap className="w-5 h-5" />} 
            color="text-blue-400"
            bg="bg-blue-500/10"
          />
          <StatCard 
            title="Open Projects" 
            value={isLoading ? "..." : activeProjects.toLocaleString()} 
            trend="Live Data" 
            icon={<Briefcase className="w-5 h-5" />} 
            color="text-purple-400"
            bg="bg-purple-500/10"
          />
          <StatCard 
            title="Support Tickets" 
            value={isLoading ? "..." : openTickets.toLocaleString()} 
            trend="Live Data" 
            icon={<AlertCircle className="w-5 h-5" />} 
            color="text-amber-400"
            bg="bg-amber-500/10"
          />
        </div>

        {/* Two Col Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart Area */}
          <div className="lg:col-span-2 bg-dash-bg-card border border-dash-border-subtle rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" /> Revenue Growth
            </h2>
            
            {/* Live Chart Visualization using CSS Grid */}
            <div className="h-64 flex items-end gap-3 pt-6 border-b border-white/10 relative">
              {/* Y Axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-[10px] text-white/30 font-mono py-2">
                <span>{symbol}50k</span>
                <span>{symbol}25k</span>
                <span>{symbol}0</span>
              </div>
              
              <div className="flex-1 flex items-end gap-4 pl-12 h-full">
                {revenueData?.data?.map((m: any, i: number) => {
                  const maxRev = Math.max(...(revenueData.data.map((d: any) => d.revenue || 0)), 50000)
                  const hPct = m.revenue > 0 ? Math.max((m.revenue / maxRev) * 100, 5) : 2 // 2% minimum height
                  
                  return (
                    <div key={i} className="flex-1 group relative h-full flex items-end">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-600/50 to-blue-400/80 rounded-t-md border-t border-x border-blue-400/50 transition-all duration-500 hover:from-blue-500 hover:to-blue-300"
                        style={{ height: `${hPct}%` }}
                      />
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap transition-opacity">
                        {symbol}{m.revenue.toLocaleString()}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex justify-between pl-12 pr-4 pt-4 text-[10px] text-white/40 font-mono">
              {revenueData?.data?.map((m: any, i: number) => (
                <span key={i} className="flex-1 text-center">{m.month}</span>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-1 bg-dash-bg-card border border-dash-border-subtle rounded-3xl p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" /> Recent Activity
            </h2>
            <div className="space-y-6">
              <div className="text-center text-white/30 text-xs py-4">No recent activity logs.</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function StatCard({ title, value, trend, icon, color, bg }: any) {
  return (
    <div className="bg-dash-bg-card border border-dash-border-subtle rounded-3xl p-6 hover:bg-dash-bg-elevated transition-colors group relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-dash-bg-elevated rounded-full blur-2xl group-hover:bg-dash-border-subtle transition-colors" />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-dash-text-secondary tracking-wider uppercase">{title}</h3>
        <div className={`p-2 rounded-xl ${bg} ${color}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold font-mono tracking-tight mb-2">{value}</div>
      <div className="text-xs text-white/40">{trend}</div>
    </div>
  )
}

function ActivityItem({ title, desc, time, color }: any) {
  return (
    <div className="flex gap-4 relative">
      <div className="flex flex-col items-center">
        <div className={`w-2.5 h-2.5 rounded-full ${color} mt-1.5 ring-4 ring-black`} />
        <div className="w-px h-full bg-dash-border-subtle mt-2" />
      </div>
      <div className="pb-2">
        <h4 className="text-sm font-bold">{title}</h4>
        <p className="text-dash-text-secondary text-xs mt-2">{desc}</p>
        <span className="text-[10px] text-dash-text-secondary font-mono">{time}</span>
      </div>
    </div>
  )
}
