"use client"

import { useState } from "react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import {
  ChevronRight, Clock, CheckCircle2, AlertCircle, XCircle,
  MessageSquare, RotateCcw, Star, Send, Check, Loader2,
  GitBranch, Layers, Award, Archive, Plus, ExternalLink
} from "lucide-react"

const STATUS_META: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT:              { label: "Draft",            color: "text-white/40 border-white/10 bg-white/5",          icon: Archive },
  SUBMITTED:          { label: "Submitted",         color: "text-blue-400 border-blue-500/20 bg-blue-500/10",    icon: Send },
  UNDER_REVIEW:       { label: "Under Review",      color: "text-amber-400 border-amber-500/20 bg-amber-500/10", icon: Clock },
  GRADED:             { label: "Graded",            color: "text-violet-400 border-violet-500/20 bg-violet-500/10", icon: Star },
  RESUBMIT_REQUESTED: { label: "Revision Needed",   color: "text-orange-400 border-orange-500/20 bg-orange-500/10", icon: RotateCcw },
  APPROVED:           { label: "Approved ✓",        color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10", icon: CheckCircle2 },
  FINAL:              { label: "Final",             color: "text-white border-white/20 bg-white/10",            icon: Award },
}

const PIPELINE = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "GRADED", "RESUBMIT_REQUESTED", "APPROVED"]

function StatusPill({ status }: { status: string }) {
  const meta = STATUS_META[status] || STATUS_META.DRAFT
  const Icon = meta.icon
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-xl border ${meta.color}`}>
      <Icon className="w-3 h-3" /> {meta.label}
    </span>
  )
}

export default function SubmissionReviewPage() {
  const { data: submissions, mutate, isLoading } = useApi<any[]>("/academy/submissions?status=SUBMITTED")
  const [selected, setSelected] = useState<any>(null)
  const [versions, setVersions] = useState<any[]>([])
  const [annotation, setAnnotation] = useState("")
  const [gradeForm, setGradeForm] = useState({ grade: "", feedback: "", status: "GRADED" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"REVIEW"|"VERSIONS"|"ANNOTATIONS">("REVIEW")

  const loadFull = async (sub: any) => {
    const full = await fetchApi<any>(`/academy/submissions/${sub.id}`)
    setSelected(full)
    setVersions(full.versions || [])
    setAnnotation("")
    setGradeForm({ grade: full.grade?.toString() || "", feedback: full.feedback || "", status: full.status === "APPROVED" ? "APPROVED" : "GRADED" })
    setActiveTab("REVIEW")
  }

  const handleReview = async () => {
    if (!selected) return
    setIsSubmitting(true)
    try {
      await fetchApi(`/academy/submissions/${selected.id}/review`, {
        method: "PATCH",
        body: JSON.stringify({
          status: gradeForm.status,
          grade: gradeForm.grade ? parseInt(gradeForm.grade) : undefined,
          feedback: gradeForm.feedback,
        })
      })
      const msg = gradeForm.status === "APPROVED"
        ? "✅ Approved! Auto-pushed to student portfolio."
        : gradeForm.status === "RESUBMIT_REQUESTED"
        ? "Revision requested from student."
        : "Submission graded!"
      toast.success(msg)
      mutate()
      setSelected(null)
    } catch (err: any) {
      toast.error(err.message || "Failed to update submission")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAnnotate = async () => {
    if (!selected || !annotation.trim()) return
    setIsSubmitting(true)
    try {
      await fetchApi(`/academy/submissions/${selected.id}/annotate`, {
        method: "POST",
        body: JSON.stringify({ mentorId: "MENTOR", content: annotation })
      })
      toast.success("Annotation added!")
      setAnnotation("")
      await loadFull(selected)
    } catch (err: any) {
      toast.error(err.message || "Failed to add annotation")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResolve = async (annotationId: string) => {
    await fetchApi(`/academy/submissions/annotations/${annotationId}/resolve`, { method: "PATCH" })
    toast.success("Marked resolved")
    await loadFull(selected)
  }

  return (
    <div className="flex h-full bg-[#050505] text-white overflow-hidden">
      {/* ── Left: Submission Queue ───────────────────────── */}
      <div className="w-80 flex-none border-r border-white/10 flex flex-col">
        <div className="p-5 border-b border-white/10">
          <h2 className="font-black text-lg">Submission Queue</h2>
          <p className="text-xs text-white/40 mt-1">Click any submission to review</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {isLoading && <div className="flex justify-center p-8"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>}
          {(submissions || []).length === 0 && !isLoading && (
            <div className="p-8 text-center text-white/30 text-sm">No submissions waiting for review.</div>
          )}
          {(submissions || []).map((sub: any) => (
            <button key={sub.id} onClick={() => loadFull(sub)}
              className={`w-full text-left p-5 hover:bg-white/5 transition-colors ${selected?.id === sub.id ? "bg-white/5 border-l-2 border-violet-500" : ""}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-semibold text-sm truncate">{sub.assignment?.title}</span>
                <StatusPill status={sub.status} />
              </div>
              <div className="flex items-center gap-3 text-xs text-white/40">
                <GitBranch className="w-3 h-3" />
                <span>v{sub.versionCount || 1}</span>
                {(sub._count?.annotations || 0) > 0 && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <MessageSquare className="w-3 h-3" /> {sub._count.annotations} open
                  </span>
                )}
                <span className="ml-auto">{new Date(sub.updatedAt).toLocaleDateString('en-IN')}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Right: Review Panel ───────────────────────────── */}
      {!selected ? (
        <div className="flex-1 flex items-center justify-center flex-col gap-4 text-white/20">
          <Layers className="w-12 h-12" />
          <p className="text-sm">Select a submission to review</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black">{selected.assignment?.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <StatusPill status={selected.status} />
                <span className="text-xs text-white/40 flex items-center gap-1">
                  <GitBranch className="w-3 h-3" /> Version {selected.versionCount}
                </span>
                {selected.pushedToPortfolio && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <Award className="w-3 h-3" /> In Portfolio
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white transition-colors text-xs">✕ Close</button>
          </div>

          {/* Status Pipeline */}
          <div className="px-8 py-4 border-b border-white/5 flex items-center gap-1 overflow-x-auto">
            {PIPELINE.map((s, i) => {
              const meta = STATUS_META[s]
              const isActive = s === selected.status
              const isPast = PIPELINE.indexOf(selected.status) > i
              return (
                <div key={s} className="flex items-center gap-1 shrink-0">
                  <div className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg border transition-all
                    ${isActive ? meta.color : isPast ? "text-white/20 border-white/5 bg-white/5 line-through" : "text-white/20 border-white/5"}`}>
                    {meta.label}
                  </div>
                  {i < PIPELINE.length - 1 && <ChevronRight className="w-3 h-3 text-white/10 shrink-0" />}
                </div>
              )
            })}
          </div>

          {/* Tabs */}
          <div className="px-8 pt-4 flex gap-4 border-b border-white/5">
            {(["REVIEW", "VERSIONS", "ANNOTATIONS"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`text-xs font-bold uppercase tracking-widest pb-3 border-b-2 transition-all
                  ${activeTab === tab ? "border-violet-500 text-white" : "border-transparent text-white/30 hover:text-white/60"}`}>
                {tab} {tab === "ANNOTATIONS" && selected.annotations?.length > 0 && `(${selected.annotations.filter((a:any)=>!a.resolved).length})`}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6">

            {/* ─ Review Tab ─ */}
            {activeTab === "REVIEW" && (
              <div className="space-y-6 max-w-2xl">
                {/* Files */}
                {selected.fileUrls?.length > 0 && (
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Submitted Files</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.fileUrls.map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs px-3 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-white/70">
                          <ExternalLink className="w-3 h-3" /> File {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {selected.linkUrl && (
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Link Submission</p>
                    <a href={selected.linkUrl} target="_blank" rel="noopener noreferrer"
                      className="text-blue-400 text-sm underline flex items-center gap-1 hover:text-blue-300">
                      <ExternalLink className="w-3 h-3" />{selected.linkUrl}
                    </a>
                  </div>
                )}

                {/* Grade Form */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold">Grade & Review</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-widest block mb-2">Score (out of {selected.assignment?.maxScore || 100})</label>
                      <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                        placeholder="e.g. 88"
                        value={gradeForm.grade} onChange={e => setGradeForm(p => ({...p, grade: e.target.value}))} />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-widest block mb-2">Action</label>
                      <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                        value={gradeForm.status} onChange={e => setGradeForm(p => ({...p, status: e.target.value}))}>
                        <option value="UNDER_REVIEW">Mark Under Review</option>
                        <option value="GRADED">Grade Only</option>
                        <option value="RESUBMIT_REQUESTED">Request Revision</option>
                        <option value="APPROVED">Approve → Push to Portfolio</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-widest block mb-2">Feedback to Student</label>
                    <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm resize-none"
                      placeholder="Write detailed feedback for the student..."
                      value={gradeForm.feedback} onChange={e => setGradeForm(p => ({...p, feedback: e.target.value}))} />
                  </div>
                  <button onClick={handleReview} disabled={isSubmitting}
                    className={`w-full font-bold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2
                      ${gradeForm.status === "APPROVED" ? "bg-emerald-500 text-black" :
                        gradeForm.status === "RESUBMIT_REQUESTED" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
                        "bg-white text-black"}`}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> :
                      gradeForm.status === "APPROVED" ? "✓ Approve & Push to Portfolio" :
                      gradeForm.status === "RESUBMIT_REQUESTED" ? "↩ Request Revision" :
                      "Submit Review"}
                  </button>
                </div>
              </div>
            )}

            {/* ─ Versions Tab ─ */}
            {activeTab === "VERSIONS" && (
              <div className="max-w-xl space-y-3">
                {versions.length === 0 && <p className="text-white/30 text-sm">No version history yet.</p>}
                {versions.map((v: any) => (
                  <div key={v.id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-sm font-black text-violet-400">
                        v{v.version}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Version {v.version}</p>
                        <p className="text-xs text-white/40">{new Date(v.submittedAt).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    {v.note && <p className="text-xs text-white/60 italic mb-3">"{v.note}"</p>}
                    {v.fileUrls?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {v.fileUrls.map((url: string, i: number) => (
                          <a key={i} href={url} target="_blank"
                            className="text-xs px-2.5 py-1.5 bg-white/5 rounded-lg text-white/50 hover:text-white border border-white/5 transition-colors">
                            File {i+1}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ─ Annotations Tab ─ */}
            {activeTab === "ANNOTATIONS" && (
              <div className="max-w-xl space-y-4">
                {/* Add annotation */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex gap-3">
                  <textarea rows={2} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm resize-none"
                    placeholder="Add an inline note, question, or suggestion..."
                    value={annotation} onChange={e => setAnnotation(e.target.value)} />
                  <button onClick={handleAnnotate} disabled={isSubmitting || !annotation.trim()}
                    className="px-4 py-2 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-xl text-xs font-bold hover:bg-violet-500/30 transition disabled:opacity-40 self-start mt-1">
                    {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                  </button>
                </div>

                {/* Annotation list */}
                {(selected.annotations || []).length === 0 && (
                  <p className="text-white/30 text-sm text-center py-4">No annotations yet. Add the first one above.</p>
                )}
                {(selected.annotations || []).map((a: any) => (
                  <div key={a.id} className={`flex gap-3 p-4 rounded-2xl border transition-all
                    ${a.resolved ? "opacity-40 bg-white/[0.01] border-white/5" : "bg-white/[0.03] border-white/10"}`}>
                    <div className="w-7 h-7 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare className="w-3 h-3 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80">{a.content}</p>
                      <p className="text-[10px] text-white/30 mt-1">{new Date(a.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                    {!a.resolved && (
                      <button onClick={() => handleResolve(a.id)}
                        className="shrink-0 flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                        <Check className="w-3 h-3" /> Resolve
                      </button>
                    )}
                    {a.resolved && <span className="text-xs text-white/20 shrink-0">Resolved</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
