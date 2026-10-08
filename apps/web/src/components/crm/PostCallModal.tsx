"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  Phone, MessageSquare, Mail, CheckCircle2, Clock, 
  Send, ExternalLink, Sparkles, X, ChevronRight, 
  Volume2, ShieldCheck, Tag, Check, Copy, AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { useOrganization } from "@/context/OrganizationContext"
import { AIAssistButton } from "@/components/ui/ai-assist-button"
import { formatAudioStreamingUrl } from "@/lib/utils"

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

const QUICK_TAGS = [
  "Quotation Requested",
  "Callback Tomorrow 11 AM",
  "Price Negotiation",
  "Vehicle Drop Planned",
  "Doorstep Diagnostic Requested",
  "Send WhatsApp Catalog",
  "Spoke with Owner",
  "Follow up next week",
]

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
  const org = useOrganization()

  const [selectedDisposition, setSelectedDisposition] = useState("Interested")
  const [notes, setNotes] = useState("")
  const [activeTab, setActiveTab] = useState<"whatsapp" | "email">("whatsapp")
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingApi, setIsSendingApi] = useState(false)

  // Format dynamic timestamp
  const timestampHeader = useMemo(() => {
    const now = new Date()
    const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    return `[${dateStr}, ${timeStr} · ${agentName}]`
  }, [agentName, isOpen])

  // WhatsApp Templates
  const [selectedTemplate, setSelectedTemplate] = useState("intro")
  const [customWaMessage, setCustomWaMessage] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")

  useEffect(() => {
    if (isOpen && record) {
      const initialHeader = `${timestampHeader}: `
      setNotes(initialHeader)
      setSelectedDisposition("Interested")

      const cleanName = record.name?.split(" ")[0] || "there"
      const orgName = org.name || "Garage"

      // Default WhatsApp templates
      const waTemplates: Record<string, string> = {
        intro: `Hi ${cleanName}, thank you for taking my call! Great connecting with you regarding your vehicle service requirements with ${orgName}. Here is our overview and booking link: https://garage.grekam.in. Feel free to reply here if you have any questions!`,
        quote: `Hi ${cleanName}, as discussed on our call, here is the initial estimation and service breakdown from ${orgName}. We look forward to assisting you. Let us know if you would like to confirm your diagnostic slot!`,
        callback: `Hi ${cleanName}, sorry we couldn't connect properly on the phone earlier. Please let me know a convenient time for a quick 2-minute callback today! — ${agentName} from ${orgName}`,
        booking: `Hi ${cleanName}, your service appointment with ${orgName} has been recorded. Our team will prepare the diagnostic bay for your vehicle. Garage Address: ${org.billingAddress || "Main Workshop"}.`,
      }

      setCustomWaMessage(waTemplates.intro)
      setEmailSubject(`Follow-up regarding your vehicle & service — ${orgName}`)
      setEmailBody(`Hi ${record.name || 'Customer'},\n\nThank you for speaking with me today regarding your requirements with ${orgName}.\n\nAs discussed, we provide comprehensive diagnostics, genuine OEM parts, transparent digital estimates, and real-time status tracking.\n\nPlease feel free to reply to this email or call us directly at ${org.phone || "+91 99000 00000"}.\n\nBest regards,\n${agentName}\n${orgName}`)
    }
  }, [isOpen, record, timestampHeader, org.name])

  if (!isOpen || !record) return null

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey)
    const cleanName = record.name?.split(" ")[0] || "there"
    const orgName = org.name || "Garage"

    const templates: Record<string, string> = {
      intro: `Hi ${cleanName}, thank you for taking my call! Great connecting with you regarding your vehicle service requirements with ${orgName}. Here is our overview and booking link: https://garage.grekam.in. Feel free to reply here if you have any questions!`,
      quote: `Hi ${cleanName}, as discussed on our call, here is the initial estimation and service breakdown from ${orgName}. We look forward to assisting you. Let us know if you would like to confirm your diagnostic slot!`,
      callback: `Hi ${cleanName}, sorry we couldn't connect properly on the phone earlier. Please let me know a convenient time for a quick 2-minute callback today! — ${agentName} from ${orgName}`,
      booking: `Hi ${cleanName}, your service appointment with ${orgName} has been recorded. Our team will prepare the diagnostic bay for your vehicle. Garage Address: ${org.billingAddress || "Main Workshop"}.`,
    }

    if (templates[templateKey]) {
      setCustomWaMessage(templates[templateKey])
    }
  }

  const handleAddTag = (tag: string) => {
    setNotes((prev) => {
      if (prev.includes(tag)) return prev
      return `${prev.trim()} [${tag}] `
    })
  }

  // 1. Open in WhatsApp App (wa.me click-to-chat)
  const handleOpenWhatsAppApp = () => {
    if (!record.phone) {
      toast.error("Prospect has no valid phone number")
      return
    }
    const cleanPhone = record.phone.replace(/\D/g, "")
    const encoded = encodeURIComponent(customWaMessage)
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank")
    toast.success("Opened in WhatsApp!")
  }

  // 2. Send via Official WhatsApp Cloud API
  const handleSendWhatsAppApi = async () => {
    if (!record.phone) {
      toast.error("Prospect has no valid phone number")
      return
    }
    setIsSendingApi(true)
    try {
      const res = await fetch("/api/automations/whatsapp-drip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: record.phone,
          name: record.name,
          message: customWaMessage,
          leadId: record.id,
        }),
      }).catch(() => null)

      if (res && res.ok) {
        toast.success("WhatsApp message dispatched via Cloud API!")
      } else {
        // Fallback to wa.me if server webhook is mock/demo
        handleOpenWhatsAppApp()
      }
    } catch {
      handleOpenWhatsAppApp()
    } finally {
      setIsSendingApi(false)
    }
  }

  // 3. Open Email Client
  const handleOpenEmail = () => {
    if (!record.email) {
      toast.error("Prospect has no email address on record")
      return
    }
    const mailto = `mailto:${record.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    window.open(mailto, "_blank")
  }

  // Save actions
  const handleSave = async (advance: boolean) => {
    if (!notes.trim() || notes.trim() === `${timestampHeader}:`) {
      toast.warning("Please enter a short note about the conversation.")
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        disposition: selectedDisposition,
        notes: notes.trim(),
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
      <div className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm tracking-tight">{record.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  {record.recordType || "LEAD"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                <span>{record.phone || "No phone"}</span>
                {record.company && <span>· {record.company}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">Call Duration</span>
              <span className="font-mono font-bold text-xs text-emerald-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatDuration(callDurationSeconds)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Audio Player if recorded */}
        {recordedAudioUrl && (
          <div className="px-5 py-2.5 bg-emerald-950/20 border-b border-emerald-500/20 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" /> Audio Recording Captured
            </span>
            <audio controls src={formatAudioStreamingUrl(recordedAudioUrl)} className="h-7 w-64" preload="metadata" />
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">

          {/* 1. Disposition Select */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
              1. Call Outcome / Disposition <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DISPOSITIONS.map((disp) => {
                const isSelected = selectedDisposition === disp.label
                return (
                  <button
                    key={disp.label}
                    type="button"
                    onClick={() => setSelectedDisposition(disp.label)}
                    className={`py-2 px-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-emerald-500 text-black border-emerald-400 shadow-md scale-[1.02]"
                        : disp.color
                    }`}
                  >
                    <span>{disp.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Mandatory Timestamped Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                2. Telecaller Call Notes <span className="text-emerald-400 font-mono text-[10px]">(Auto-Timestamped)</span>
              </label>
              <AIAssistButton
                format="text"
                context="Call notes summarizer for CRM lead follow-up."
                onGenerate={(aiText) => setNotes(`${timestampHeader}: ${aiText}`)}
                buttonLabel="AI Summary"
              />
            </div>

            <div className="relative">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter summary of discussion, customer requirements, pain points, next steps..."
                rows={3}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 resize-none font-sans leading-relaxed"
                autoFocus
              />
            </div>

            {/* Quick Tag Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-zinc-500 font-bold uppercase mr-1">Quick Tags:</span>
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="px-2 py-0.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-[10px] text-zinc-300 hover:text-white transition-all"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Post-Call Outreach Trigger (WhatsApp & Email) */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                3. Instant Post-Call Follow-up
              </span>

              {/* Tabs */}
              <div className="flex items-center bg-black/40 p-0.5 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab("whatsapp")}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === "whatsapp" ? "bg-emerald-500 text-black shadow-xs" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-3 h-3" /> WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("email")}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === "email" ? "bg-blue-500 text-white shadow-xs" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Mail className="w-3 h-3" /> Email
                </button>
              </div>
            </div>

            {activeTab === "whatsapp" ? (
              <div className="space-y-3">
                {/* Template Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: "intro", label: "Intro & Overview" },
                    { id: "quote", label: "Quotation & Pricing" },
                    { id: "booking", label: "Diagnostic Slot" },
                    { id: "callback", label: "Callback Request" },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleTemplateChange(tpl.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                        selectedTemplate === tpl.id
                          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                          : "bg-black/30 border-white/10 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>

                {/* Editable Message Box */}
                <textarea
                  value={customWaMessage}
                  onChange={(e) => setCustomWaMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-sans resize-none"
                  placeholder="Type or customize your WhatsApp follow-up message..."
                />

                {/* Dual WhatsApp Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleOpenWhatsAppApp}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all shadow-md shadow-emerald-950"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in WhatsApp App (Free)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendWhatsAppApi}
                    disabled={isSendingApi}
                    className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-bold rounded-xl border border-emerald-500/30 flex items-center justify-center gap-1.5 text-xs transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingApi ? "Sending API..." : "Send via Official Cloud API"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email Subject..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                />
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={4}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-sans resize-none"
                  placeholder="Email body content..."
                />
                <button
                  type="button"
                  onClick={handleOpenEmail}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Open Email Client & Send</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-zinc-400 hover:text-white text-xs font-semibold rounded-xl hover:bg-white/5 transition-colors"
          >
            Skip / Dismiss
          </button>

          <div className="flex items-center gap-2">
            {onSaveAndStay && (
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-all border border-white/10 disabled:opacity-50"
              >
                Save & Stay
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{isSaving ? "Saving..." : "Save Note & Next Prospect"}</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
