"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useApi, fetchApi } from "@/lib/useApi"
import { 
  ChevronLeft, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Download, 
  FileCheck, 
  Send, 
  MessageSquare, 
  Calendar,
  Layers,
  ArrowUpRight
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { format } from "date-fns"

export default function ClientProjectDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: project, isLoading, mutate } = useApi<any>(`/projects/${id}`)

  // Approval Form State
  const [approvingPhaseId, setApprovingPhaseId] = useState<string | null>(null)
  const [approvingFileId, setApprovingFileId] = useState<string | null>(null)
  const [signatureName, setSignatureName] = useState("")
  const [feedbackNotes, setFeedbackNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-white/50 bg-[#050505]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-sm font-mono tracking-widest uppercase">Loading project data...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-white/50 bg-[#050505]">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Project Not Found</h3>
        <p className="text-sm text-white/40 mb-6">This project link is invalid or you do not have permission to view it.</p>
        <Link href="/portal/projects" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-medium transition-all">
          Back to Projects
        </Link>
      </div>
    )
  }

  const phases = project.phases || []
  const files = project.files || []
  const deliverables = files.filter((f: any) => f.isDelivery)

  // Calculations
  const approvedPhases = phases.filter((p: any) => p.approvedAt)
  const progressPercent = phases.length > 0 
    ? Math.round((approvedPhases.length / phases.length) * 100) 
    : 0

  const handleApprovePhase = async (phaseId: string) => {
    if (!signatureName.trim()) {
      toast.error("Please type your name to sign the approval")
      return
    }

    setIsSubmitting(true)
    try {
      await fetchApi(`/projects/${id}/phases/${phaseId}/approve`, {
        method: "POST",
        body: JSON.stringify({
          approvedBy: signatureName,
          clientNotes: feedbackNotes
        })
      })
      toast.success("Milestone signed and approved successfully!")
      setApprovingPhaseId(null)
      setSignatureName("")
      setFeedbackNotes("")
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to approve phase")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApproveFile = async (fileId: string) => {
    if (!signatureName.trim()) {
      toast.error("Please type your name to sign the approval")
      return
    }

    setIsSubmitting(true)
    try {
      await fetchApi(`/projects/${id}/files/${fileId}/approve`, {
        method: "POST",
        body: JSON.stringify({
          approvedBy: signatureName,
          clientNotes: feedbackNotes
        })
      })
      toast.success("Deliverable signed and approved successfully!")
      setApprovingFileId(null)
      setSignatureName("")
      setFeedbackNotes("")
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to approve deliverable")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-[#050505] text-white min-h-screen">
      
      {/* Breadcrumbs / Back navigation */}
      <div className="mb-8">
        <Link href="/portal/projects" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> 
          Back to Projects
        </Link>
      </div>

      {/* Hero Title & Metadata */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {project.status}
              </span>
              <span className="text-xs text-white/40 font-mono">ID: {project.id}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{project.name}</h1>
            <p className="text-white/60 mt-2 text-sm max-w-2xl">{project.description || "No project overview description provided."}</p>
          </div>
          
          <div className="bg-black/30 border border-white/5 rounded-2xl p-4 shrink-0 flex flex-col gap-2 min-w-[200px]">
            <div className="text-xs font-mono uppercase tracking-wider text-white/40">Project Type</div>
            <div className="text-sm font-bold text-white uppercase tracking-wider">{project.type.replace('_', ' ')}</div>
            <div className="border-t border-white/5 my-1" />
            <div className="text-xs font-mono uppercase tracking-wider text-white/40">Total Milestones</div>
            <div className="text-sm font-bold text-white">{approvedPhases.length} / {phases.length} Approved</div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div>
          <div className="flex justify-between text-xs font-bold text-white/50 mb-2 uppercase tracking-widest">
            <span>Overall Sign-off Progress</span>
            <span className="font-mono">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-1000" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Stepper & Deliverables */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Milestone Stepper Timeline */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider font-mono flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-500" /> Project Milestones
            </h2>

            {phases.length === 0 ? (
              <div className="py-8 text-center text-white/40 text-sm">
                No phases or milestones registered for this project.
              </div>
            ) : (
              <div className="relative border-l border-white/10 ml-4 pl-8 space-y-8">
                {phases.map((phase: any, index: number) => {
                  const isPhaseApproved = !!phase.approvedAt
                  return (
                    <div key={phase.id} className="relative group">
                      
                      {/* Stepper Dot */}
                      <span className={`absolute -left-[41px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center border text-xs font-mono font-bold ${
                        isPhaseApproved 
                          ? "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                          : "bg-[#0a0a0a] border-white/20 text-white/50"
                      }`}>
                        {isPhaseApproved ? "✓" : index + 1}
                      </span>

                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                            {phase.name}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-white/40 font-mono mt-1">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Due: {phase.dueDate ? format(new Date(phase.dueDate), 'MMM d, yyyy') : 'No date'}</span>
                          </div>
                        </div>

                        {/* Sign-off Actions */}
                        <div>
                          {isPhaseApproved ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-2 text-xs font-mono">
                              <p className="font-bold">Approved by {phase.approvedBy}</p>
                              <p className="text-[10px] text-white/40 mt-0.5">{format(new Date(phase.approvedAt), 'MMM d, yyyy h:mm a')}</p>
                              {phase.clientNotes && (
                                <p className="text-[10px] text-white/60 italic mt-1.5 bg-black/20 p-2 rounded">Notes: "{phase.clientNotes}"</p>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setApprovingPhaseId(phase.id)
                                setApprovingFileId(null)
                                setSignatureName("")
                                setFeedbackNotes("")
                              }}
                              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 rounded-xl text-xs font-bold transition-all"
                            >
                              Sign-off Milestone
                            </button>
                          )}
                        </div>
                      </div>

                      {/* inline Approval Form */}
                      {approvingPhaseId === phase.id && (
                        <div className="mt-4 p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4 max-w-xl animate-in fade-in-50 duration-200">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">Milestone Digital Approval</h4>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] text-white/40 block mb-1 font-mono uppercase">Type your full name to sign</label>
                              <input 
                                value={signatureName}
                                onChange={e => setSignatureName(e.target.value)}
                                placeholder="e.g. Sarah Connor"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-white/40 block mb-1 font-mono uppercase">Optional feedback or review notes</label>
                              <textarea
                                rows={2}
                                value={feedbackNotes}
                                onChange={e => setFeedbackNotes(e.target.value)}
                                placeholder="e.g. Overall layout looks excellent! Ready to move to the next phase."
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 resize-none"
                              />
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                              <button
                                onClick={() => setApprovingPhaseId(null)}
                                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white/60 hover:text-white transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleApprovePhase(phase.id)}
                                disabled={isSubmitting || !signatureName.trim()}
                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                              >
                                {isSubmitting ? "Signing..." : "Sign & Accept"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Design Deliverables Hub */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider font-mono flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-500" /> Final Deliverables
            </h2>

            {deliverables.length === 0 ? (
              <div className="py-12 text-center text-white/30 text-sm border-2 border-dashed border-white/5 rounded-2xl bg-black/20">
                <FileText className="w-10 h-10 mx-auto opacity-20 mb-3" />
                No final deliverable assets have been uploaded for review yet.
              </div>
            ) : (
              <div className="space-y-4">
                {deliverables.map((file: any) => {
                  const isFileApproved = !!file.approvedAt
                  return (
                    <div key={file.id} className="bg-black/30 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white break-all">{file.name}</h4>
                            <p className="text-xs text-white/40 font-mono mt-1">
                              Size: {(file.fileSize / (1024 * 1024)).toFixed(2)} MB • Mime: {file.mimeType}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <a 
                            href={file.fileUrl} 
                            download 
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-colors"
                            title="Download Deliverable"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          {isFileApproved ? (
                            <div className="bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-xl px-3.5 py-1.5 text-xs font-mono flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Approved
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setApprovingFileId(file.id)
                                setApprovingPhaseId(null)
                                setSignatureName("")
                                setFeedbackNotes("")
                              }}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/15"
                            >
                              Sign & Approve
                            </button>
                          )}
                        </div>
                      </div>

                      {/* File Approval Metadata (If Signed) */}
                      {isFileApproved && (
                        <div className="mt-3 text-xs text-white/50 font-mono bg-white/5 border border-white/5 rounded-xl p-3">
                          <p>Approved By: <strong className="text-white">{file.approvedBy}</strong> on {format(new Date(file.approvedAt), 'MMM d, yyyy h:mm a')}</p>
                          {file.clientNotes && <p className="mt-1 text-white/40 italic">Notes: "{file.clientNotes}"</p>}
                        </div>
                      )}

                      {/* inline File Approval Form */}
                      {approvingFileId === file.id && (
                        <div className="mt-4 p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4 max-w-xl animate-in fade-in-50 duration-200">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">Sign Asset Release Approval</h4>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] text-white/40 block mb-1 font-mono uppercase">Type your full name to sign</label>
                              <input 
                                value={signatureName}
                                onChange={e => setSignatureName(e.target.value)}
                                placeholder="e.g. Sarah Connor"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-white/40 block mb-1 font-mono uppercase">Optional feedback or review notes</label>
                              <textarea
                                rows={2}
                                value={feedbackNotes}
                                onChange={e => setFeedbackNotes(e.target.value)}
                                placeholder="e.g. Asset verified and accepted for delivery!"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 resize-none"
                              />
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                              <button
                                onClick={() => setApprovingFileId(null)}
                                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white/60 hover:text-white transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleApproveFile(file.id)}
                                disabled={isSubmitting || !signatureName.trim()}
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                              >
                                {isSubmitting ? "Signing..." : "Sign & Accept"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Client Support, Manager Info, and telemetry */}
        <div className="space-y-8">
          
          {/* Project Manager Card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h3 className="font-bold text-sm text-white/40 uppercase tracking-widest font-mono mb-4">Project Contact</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-extrabold text-lg">
                PM
              </div>
              <div>
                <h4 className="font-bold text-white">Project Manager</h4>
                <p className="text-xs text-white/50 font-mono">hello@grekam.com</p>
              </div>
            </div>
            
            <div className="border-t border-white/5 my-4 pt-4 flex flex-col gap-2">
              <button 
                onClick={() => toast("Chat module coming soon!")}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-blue-400" /> Chat with Team
              </button>
            </div>
          </div>

          {/* Quick FAQ / Instructions */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h3 className="font-bold text-sm text-white/40 uppercase tracking-widest font-mono mb-4">Client Manual</h3>
            <div className="space-y-4 text-xs text-white/70 leading-relaxed">
              <div>
                <h4 className="font-bold text-white mb-1">How sign-offs work</h4>
                <p>By typing your name and submitting, you digitally approve the milestone. Approved status will be logged on the platform for delivery scheduling.</p>
              </div>
              <div className="border-t border-white/5 pt-3">
                <h4 className="font-bold text-white mb-1">Downloading Files</h4>
                <p>Use the download icon next to each deliverable to retrieve high-resolution project files directly from our secure cloud storage.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
