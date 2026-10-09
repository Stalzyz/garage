"use client"

import { useState, useEffect } from "react"
import { 
  Phone, Check, Clock, X, MessageSquare, ExternalLink, Save, ArrowRight
} from "lucide-react"
import { toast } from "sonner"

export interface PostCallRecord {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  company?: string | null
  role?: string | null
  recordType?: "LEAD" | "CONTACT" | string
}

interface PostCallModalProps {
  isOpen: boolean
  onClose: () => void
  record: PostCallRecord | null
  callDurationSeconds?: number
  recordedAudioUrl?: string | null
  agentName?: string
  onSaveAndAdvance: (data: { disposition: string; notes: string; audioUrl?: string }) => Promise<void> | void
  onSaveAndStay?: (data: { disposition: string; notes: string; audioUrl?: string }) => Promise<void> | void
}

const DISPOSITIONS = [
  { label: "Interested", color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" },
  { label: "Meeting Booked", color: "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20" },
  { label: "Quote Requested", color: "bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20" },
  { label: "Call Back Later", color: "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20" },
  { label: "Not Reachable", color: "bg-zinc-500/10 border-zinc-500/30 text-zinc-400 hover:bg-zinc-500/20" },
  { label: "Not Interested", color: "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20" },
  { label: "Wrong Number", color: "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20" },
]

const FOLLOWUP_STAGES = ["Followup 1", "Followup 2", "Followup 3"] as const;

export function PostCallModal({
  isOpen,
  onClose,
  record,
  callDurationSeconds = 0,
  recordedAudioUrl = null,
  agentName = "Telecaller",
  onSaveAndAdvance,
  onSaveAndStay,
}: PostCallModalProps) {
  const [selectedDisposition, setSelectedDisposition] = useState("Interested")
  const [followupStage, setFollowupStage] = useState<"Followup 1" | "Followup 2" | "Followup 3">("Followup 1")
  const [timestamp, setTimestamp] = useState("")
  const [comments, setComments] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen && record) {
      const now = new Date()
      const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
      setTimestamp(`[${dateStr}, ${timeStr} · ${agentName}]`)
      setSelectedDisposition("Interested")
      setFollowupStage("Followup 1")
      setComments("")
    }
  }, [isOpen, record, agentName])

  if (!isOpen || !record) return null

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleOpenWhatsApp = () => {
    if (!record.phone) {
      toast.error("Prospect has no valid phone number")
      return
    }
    const cleanPhone = record.phone.replace(/\D/g, "")
    const cleanName = record.name?.split(" ")[0] || "there"
    const text = encodeURIComponent(
      `Hi ${cleanName}, thank you for taking my call! Here is the summary of our conversation: ${comments || "Great connecting with you."}`
    )
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank")
  }

  const handleSave = async (advance: boolean) => {
    if (!comments.trim()) {
      toast.warning("Please enter your call comments/notes.")
      return
    }

    setIsSaving(true)
    try {
      const combinedNotes = `${timestamp.trim()} [${followupStage}]: ${comments.trim()}`
      const payload = {
        disposition: selectedDisposition,
        notes: combinedNotes,
        audioUrl: recordedAudioUrl || undefined,
      }

      if (advance) {
        await onSaveAndAdvance(payload)
      } else if (onSaveAndStay) {
        await onSaveAndStay(payload)
      }
      onClose()
    } catch (err: any) {
      toast.error("Failed to save post-call notes: " + (err.message || "Unknown error"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-[#121214] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white truncate">{record.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                  {record.recordType || "LEAD"}
                </span>
              </div>
              <p className="text-xs text-white/50 truncate mt-0.5">
                {record.phone || "No phone"} {record.company ? `· ${record.company}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold block">Call Duration</span>
              <span className="font-mono font-bold text-xs text-emerald-400 flex items-center justify-end gap-1">
                <Clock className="w-3 h-3" /> {formatDuration(callDurationSeconds)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">

          {/* 1. Call Outcome / Disposition */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider block">
              1. Call Outcome / Disposition <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DISPOSITIONS.map((disp) => {
                const isSelected = selectedDisposition === disp.label
                return (
                  <button
                    key={disp.label}
                    type="button"
                    onClick={() => setSelectedDisposition(disp.label)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500 text-black border-emerald-400 shadow-md font-bold"
                        : disp.color
                    }`}
                  >
                    <span className="truncate">{disp.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] shrink-0 ml-1" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Follow-up Stage */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider block">
              2. Follow-up Stage
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FOLLOWUP_STAGES.map((stage) => {
                const isSelected = followupStage === stage
                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setFollowupStage(stage)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all text-center cursor-pointer ${
                      isSelected
                        ? "bg-[#0A84FF] text-white border-[#0A84FF] shadow-sm font-bold"
                        : "bg-white/[0.04] border-white/[0.08] text-white/70 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    {stage}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. Editable Timestamp */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider block">
              3. Timestamp <span className="text-white/40 text-[10px] font-normal lowercase">(auto-added, editable)</span>
            </label>
            <input
              type="text"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full bg-[#1c1c1e] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#0A84FF]"
            />
          </div>

          {/* 4. Telecaller Comments */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider block">
                4. Call Comments & Notes <span className="text-rose-400">*</span>
              </label>
              {record.phone && (
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3 h-3" /> Quick WhatsApp &rarr;
                </button>
              )}
            </div>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter discussion notes, vehicle requirement, client response, or next action..."
              rows={4}
              className="w-full bg-[#1c1c1e] border border-white/[0.08] rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#0A84FF] resize-none leading-relaxed"
              autoFocus
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-white/[0.02] border-t border-white/[0.08] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            Skip / Dismiss
          </button>

          <div className="flex items-center gap-2">
            {onSaveAndStay && (
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSave(false)}
                className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold rounded-xl text-xs border border-white/[0.08] transition-colors cursor-pointer disabled:opacity-50"
              >
                Save & Stay
              </button>
            )}

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave(true)}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              <span>{isSaving ? "Saving..." : "Save Note & Next Prospect"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
