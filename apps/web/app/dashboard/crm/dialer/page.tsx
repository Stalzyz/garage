"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { 
  Phone, Mic, PhoneOff, User, Zap, Voicemail, FileText, CheckCircle2, 
  ChevronRight, Volume2, Smartphone, Loader2, ExternalLink, Link2, 
  HardDrive, X, Settings, Disc, Search, Filter, Clock, Calendar, 
  Users, SlidersHorizontal, RefreshCw, Play, AlertCircle, Info, Sparkles, Plus, Check
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { AIAssistButton } from "@/components/ui/ai-assist-button"
import { formatAudioStreamingUrl } from "@/lib/utils"

export interface UnifiedDialerRecord {
  id: string
  recordType: "LEAD" | "CONTACT"
  name: string
  phone: string
  email: string
  company: string
  score: number
  status: string
  source: string
  role: string
  createdAt?: string
}

interface DialerSettings {
  routeThroughMobile: boolean
  enableCallRecording: boolean
  autoAdvanceOnDisposition: boolean
  wrapupCooldownSeconds: number
  defaultQueueSource: "ALL" | "LEADS" | "CONTACTS"
  defaultSortBy: "score" | "name" | "recent"
  mobileCallerPhone?: string
}

const DEFAULT_SETTINGS: DialerSettings = {
  routeThroughMobile: false,
  enableCallRecording: true,
  autoAdvanceOnDisposition: false,
  wrapupCooldownSeconds: 5,
  defaultQueueSource: "ALL",
  defaultSortBy: "score",
  mobileCallerPhone: "",
}

export default function PowerDialerDashboard() {
  const { data: session } = useSession()

  // Navigation tab view: 'dialer' or 'recordings'
  const [viewMode, setViewMode] = useState<"dialer" | "recordings">("dialer")

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settings, setSettings] = useState<DialerSettings>(DEFAULT_SETTINGS)

  // Dialer Core State
  const [callState, setCallState] = useState<"idle" | "dialing" | "connected" | "voicemail" | "wrapup">("idle")
  const [queuePos, setQueuePos] = useState(0)
  const [sortBy, setSortBy] = useState<"score" | "name" | "recent">("score")
  const [queueSource, setQueueSource] = useState<"ALL" | "LEADS" | "CONTACTS">("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  const [callDurationSeconds, setCallDurationSeconds] = useState(0)
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null)
  const [isUploadingAudio, setIsUploadingAudio] = useState(false)
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [externalAudioInput, setExternalAudioInput] = useState("")
  const [showDriveInput, setShowDriveInput] = useState(false)

  // Disposition & Notes State
  const [callNotes, setCallNotes] = useState("")
  const [selectedDisposition, setSelectedDisposition] = useState<string | null>(null)
  const [meetingSummary, setMeetingSummary] = useState("")
  const [meetingTime, setMeetingTime] = useState("")
  const [attendeeEmail, setAttendeeEmail] = useState("")
  const [isScheduling, setIsScheduling] = useState(false)

  // DNC Drawer State
  const [isDncOpen, setIsDncOpen] = useState(false)
  const [dncNumberInput, setDncNumberInput] = useState("")
  const [dncReasonInput, setDncReasonInput] = useState("")

  // Recordings Tab Filter & Attachment State
  const [recordingsSearch, setRecordingsSearch] = useState("")
  const [recordingsFilterType, setRecordingsFilterType] = useState<"ALL" | "LEAD" | "CONTACT">("ALL")
  const [attachModalLogId, setAttachModalLogId] = useState<string | null>(null)
  const [attachUrlInput, setAttachUrlInput] = useState("")
  const [isAttachingRecording, setIsAttachingRecording] = useState(false)

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const callTimerRef = useRef<any>(null)
  const durationSecondsRef = useRef<number>(0)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const autoAdvanceTimeoutRef = useRef<any>(null)

  // Format seconds to mm:ss
  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60)
    const secs = totalSec % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Load persistent settings on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("crm_dialer_settings")
      if (stored) {
        const parsed = JSON.parse(stored)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
        if (parsed.defaultSortBy) setSortBy(parsed.defaultSortBy)
        if (parsed.defaultQueueSource) setQueueSource(parsed.defaultQueueSource)
      }
      const savedPos = localStorage.getItem("crm_dialer_pos")
      if (savedPos) {
        setQueuePos(parseInt(savedPos, 10) || 0)
      }
    } catch (e) {
      console.warn("Failed to load dialer settings:", e)
    }
  }, [])

  const saveSettings = (newSettings: DialerSettings) => {
    setSettings(newSettings)
    try {
      localStorage.setItem("crm_dialer_settings", JSON.stringify(newSettings))
      toast.success("Dialer settings saved successfully!")
    } catch (e) {
      console.warn("Failed to save settings to localStorage:", e)
    }
  }

  // 1. Fetch leads & contacts concurrently from API
  const { data: leadsResponse, mutate: mutateLeads, isLoading: isLoadingLeads } = useApi<any>("/crm/leads")
  const { data: contactsResponse, mutate: mutateContacts, isLoading: isLoadingContacts } = useApi<any>("/crm/contacts")
  const { data: dncResponse, mutate: mutateDnc } = useApi<any>(isDncOpen ? "/crm/dnc" : null)
  const { data: dailyReportResponse, mutate: mutateRecordings, isLoading: isLoadingRecordings } = useApi<any>(
    viewMode === "recordings" ? "/crm/telephony/daily-report?all=true" : null
  )

  const dncList = dncResponse?.data || []
  const dncPhones = useMemo(() => {
    return (dncList || []).map((d: any) => (d.phone || "").replace(/[^0-9]/g, "")).filter(Boolean)
  }, [dncList])

  // 2. Unify Leads & Contacts into a single standardized calling queue
  const unifiedRecords: UnifiedDialerRecord[] = useMemo(() => {
    const rawLeads = leadsResponse?.data || []
    const rawContacts = contactsResponse?.data || []

    const normalizedLeads: UnifiedDialerRecord[] = rawLeads
      .filter((l: any) => !!l.phone && l.phone.trim().length > 3)
      .map((l: any) => ({
        id: l.id,
        recordType: "LEAD" as const,
        name: l.name || "Unnamed Lead",
        phone: l.phone.trim(),
        email: l.email || "",
        company: l.company || "N/A",
        score: l.score || 0,
        status: l.status || "NEW",
        source: l.source || "Website",
        role: l.industry || l.projectType || "Prospective Client",
        createdAt: l.createdAt,
      }))

    const normalizedContacts: UnifiedDialerRecord[] = rawContacts
      .filter((c: any) => (!!c.phone && c.phone.trim().length > 3) || (!!c.whatsapp && c.whatsapp.trim().length > 3))
      .map((c: any) => {
        const phone = (c.phone || c.whatsapp || "").trim()
        const tier = c.tier || "STANDARD"
        const score = tier === "VIP" ? 95 : tier === "ENTERPRISE" ? 85 : tier === "PREMIUM" ? 75 : 60
        return {
          id: c.id,
          recordType: "CONTACT" as const,
          name: `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Unnamed Contact",
          phone,
          email: c.email || "",
          company: c.company?.name || "Independent",
          score,
          status: tier,
          source: "Direct Contact",
          role: c.isPrimary ? "Primary Decision Maker" : "Contact",
          createdAt: c.createdAt,
        }
      })

    let combined = [...normalizedLeads, ...normalizedContacts]

    // Exclude DNC numbers
    if (dncPhones.length > 0) {
      combined = combined.filter((r) => {
        const clean = r.phone.replace(/[^0-9]/g, "")
        return !dncPhones.includes(clean)
      })
    }

    return combined
  }, [leadsResponse?.data, contactsResponse?.data, dncPhones])

  // 3. Filter and Sort the Queue
  const filteredQueue = useMemo(() => {
    let result = unifiedRecords

    // Source filter
    if (queueSource === "LEADS") {
      result = result.filter((r) => r.recordType === "LEAD")
    } else if (queueSource === "CONTACTS") {
      result = result.filter((r) => r.recordType === "CONTACT")
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.phone.toLowerCase().includes(q) ||
          r.company.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q)
      )
    }

    // Sort order
    return result.sort((a, b) => {
      if (sortBy === "score") {
        return (b.score || 0) - (a.score || 0)
      } else if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "")
      } else {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      }
    })
  }, [unifiedRecords, queueSource, searchQuery, sortBy])

  // Active record to dial
  const activeRecord: UnifiedDialerRecord | null = filteredQueue[queuePos] || filteredQueue[0] || null

  // Ensure queuePos stays valid when filters change
  useEffect(() => {
    if (queuePos >= filteredQueue.length && filteredQueue.length > 0) {
      setQueuePos(0)
    }
  }, [filteredQueue.length, queuePos])

  const updateQueuePos = (pos: number) => {
    const safePos = pos >= filteredQueue.length ? 0 : pos
    setQueuePos(safePos)
    localStorage.setItem("crm_dialer_pos", safePos.toString())
  }

  const updateSortBy = (mode: "score" | "name" | "recent") => {
    setSortBy(mode)
    setQueuePos(0)
    localStorage.setItem("crm_dialer_sort", mode)
    localStorage.setItem("crm_dialer_pos", "0")
  }

  // Pre-fill meeting invite when active record changes
  useEffect(() => {
    if (activeRecord) {
      setAttendeeEmail(activeRecord.email || "")
      setMeetingSummary(`Discovery Call with ${activeRecord.name}`)
    }
  }, [activeRecord])

  // Handler: Schedule Meeting
  const handleScheduleMeeting = async () => {
    if (!meetingTime || !meetingSummary || !attendeeEmail || !activeRecord) {
      toast.error("Please fill in summary, date/time, and email.")
      return
    }
    setIsScheduling(true)
    try {
      const start = new Date(meetingTime)
      const end = new Date(start.getTime() + 30 * 60 * 1000)

      await fetchApi("/crm/calendar/invite", {
        method: "POST",
        body: JSON.stringify({
          leadId: activeRecord.recordType === "LEAD" ? activeRecord.id : undefined,
          contactId: activeRecord.recordType === "CONTACT" ? activeRecord.id : undefined,
          summary: meetingSummary,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          attendeeEmail,
        }),
      })
      toast.success("Google Calendar invite sent to prospect!")

      // If it's a lead, mark WON
      if (activeRecord.recordType === "LEAD") {
        await fetchApi(`/crm/leads/${activeRecord.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "WON" }),
        })
      }

      const duration = durationSecondsRef.current || callDurationSeconds || 0
      await fetchApi("/crm/telephony/recordings", {
        method: "POST",
        body: JSON.stringify({
          leadId: activeRecord.recordType === "LEAD" ? activeRecord.id : undefined,
          contactId: activeRecord.recordType === "CONTACT" ? activeRecord.id : undefined,
          recordType: activeRecord.recordType,
          durationSeconds: duration,
          disposition: "MEETING BOOKED",
          recordingUrl: recordedAudioUrl || undefined,
          notes: `${meetingSummary}. Calendar invite sent to ${attendeeEmail}.${callNotes ? " Notes: " + callNotes : ""}`,
        }),
      })

      setMeetingSummary("")
      setMeetingTime("")
      mutateLeads()
      mutateContacts()
      if (viewMode === "recordings") mutateRecordings()
    } catch (err: any) {
      toast.error("Failed to schedule meeting: " + (err.message || "Unknown error"))
    } finally {
      setIsScheduling(false)
    }
  }

  // Handler: Start Dialer
  const handleStartDialer = async () => {
    if (!activeRecord || !activeRecord.phone) {
      toast.error("Active contact does not have a valid phone number to dial.")
      return
    }

    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current)
      autoAdvanceTimeoutRef.current = null
    }

    setRecordedAudioUrl(null)
    setCallDurationSeconds(0)
    durationSecondsRef.current = 0
    audioChunksRef.current = []

    setCallState("dialing")

    // Request microphone access and start MediaRecorder if enabled in settings
    if (settings.enableCallRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioStreamRef.current = stream
        const recorder = new MediaRecorder(stream)
        mediaRecorderRef.current = recorder
        audioChunksRef.current = []

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        recorder.onstop = async () => {
          if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach((t) => t.stop())
            audioStreamRef.current = null
          }

          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
          if (audioBlob.size > 0) {
            const fileName = `call_${activeRecord?.recordType}_${activeRecord?.id || "prospect"}_${Date.now()}.webm`
            const file = new File([audioBlob], fileName, { type: "audio/webm" })
            setIsUploadingAudio(true)
            try {
              const formData = new FormData()
              formData.append("file", file)
              const res = await fetchApi<any>("/storage/upload-local", {
                method: "POST",
                body: formData,
              })
              if (res?.downloadUrl) {
                setRecordedAudioUrl(res.downloadUrl)
                toast.success("Call audio recording captured and ready!")
              }
            } catch (err: any) {
              console.error("Audio recording upload error:", err)
              toast.error("Failed to upload call recording: " + (err.message || "Network error"))
            } finally {
              setIsUploadingAudio(false)
            }
          }
        }

        recorder.start(1000)
      } catch (err: any) {
        console.warn("Microphone access not granted:", err)
        toast.warning("Microphone access not granted. Proceeding without audio recording.")
      }
    }

    // Trigger device native tel: dialer or softphone
    try {
      const cleanPhone = activeRecord.phone.replace(/[^0-9+]/g, "")
      window.location.href = `tel:${cleanPhone}`
    } catch (e) {
      console.warn("Could not open native dialer URI:", e)
    }

    // Route through mobile trigger if enabled
    if (settings.routeThroughMobile) {
      const email = session?.user?.email
      if (!email) {
        toast.error("You must be logged in to route calls to mobile.")
        setCallState("idle")
        return
      }

      try {
        await fetchApi("/crm/dial-mobile", {
          method: "POST",
          body: JSON.stringify({ leadPhone: activeRecord.phone, email }),
        })
        toast.info(`Dial signal broadcast to your mobile device: ${activeRecord.phone}`)
      } catch (err) {
        console.error("Failed to trigger mobile dial:", err)
        toast.error("Could not trigger mobile dial. Check connection.")
      }
    }

    setTimeout(() => {
      setCallState("connected")
      if (callTimerRef.current) clearInterval(callTimerRef.current)
      callTimerRef.current = setInterval(() => {
        durationSecondsRef.current += 1
        setCallDurationSeconds(durationSecondsRef.current)
      }, 1000)
    }, 2500)
  }

  // Handler: End Call
  const handleEndCall = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current)
      callTimerRef.current = null
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop()
      } catch (e) {
        console.warn("Error stopping recorder", e)
      }
    }

    setCallState("wrapup")
  }

  // Handler: Voicemail Drop
  const handleVoicemailDrop = async () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current)
      callTimerRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop()
      } catch (e) {}
    }
    setCallState("voicemail")
    if (activeRecord) {
      try {
        const duration = durationSecondsRef.current || 20
        await fetchApi("/crm/telephony/recordings", {
          method: "POST",
          body: JSON.stringify({
            leadId: activeRecord.recordType === "LEAD" ? activeRecord.id : undefined,
            contactId: activeRecord.recordType === "CONTACT" ? activeRecord.id : undefined,
            recordType: activeRecord.recordType,
            durationSeconds: duration,
            disposition: "LEFT VOICEMAIL",
            recordingUrl: recordedAudioUrl || undefined,
            notes: "[Voicemail] Dropped pre-recorded voicemail message",
          }),
        })
        toast.success("Voicemail logged to CRM")
        mutateLeads()
        mutateContacts()
      } catch (err) {
        console.error(err)
      }
    }
    setTimeout(() => {
      handleNextLead()
    }, 2000)
  }

  // Handler: Save Disposition
  const handleDisposition = async (disposition: string) => {
    setSelectedDisposition(disposition)

    if (disposition === "Meeting Booked") {
      return
    }

    let newStatus: string | null = null
    if (disposition === "Call Back Later") newStatus = "CONTACTED"
    else if (disposition === "Not Interested") newStatus = "LOST"
    else if (disposition === "Left Voicemail") newStatus = "CONTACTED"

    if (activeRecord) {
      try {
        if (newStatus && activeRecord.recordType === "LEAD") {
          await fetchApi(`/crm/leads/${activeRecord.id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: newStatus }),
          })
        }

        const duration = durationSecondsRef.current || callDurationSeconds || 0
        await fetchApi("/crm/telephony/recordings", {
          method: "POST",
          body: JSON.stringify({
            leadId: activeRecord.recordType === "LEAD" ? activeRecord.id : undefined,
            contactId: activeRecord.recordType === "CONTACT" ? activeRecord.id : undefined,
            recordType: activeRecord.recordType,
            durationSeconds: duration,
            disposition: disposition.toUpperCase(),
            recordingUrl: recordedAudioUrl || undefined,
            notes: callNotes ? `Notes: ${callNotes}` : undefined,
          }),
        })

        toast.success(`Disposition logged: ${disposition}`)
        mutateLeads()
        mutateContacts()
        if (viewMode === "recordings") mutateRecordings()

        // Pacing: Auto-advance if enabled in settings
        if (settings.autoAdvanceOnDisposition) {
          const cooldown = Math.max(1, settings.wrapupCooldownSeconds || 5)
          toast.info(`Auto-advancing to next prospect in ${cooldown}s...`)
          if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current)
          autoAdvanceTimeoutRef.current = setTimeout(() => {
            handleNextLead()
          }, cooldown * 1000)
        }
      } catch (err: any) {
        toast.error("Failed to sync disposition status: " + (err.message || "Unknown error"))
      }
    }
  }

  // Handler: Save Call Notes
  const saveCallNotes = async () => {
    if (activeRecord && callNotes.trim()) {
      try {
        const duration = durationSecondsRef.current || callDurationSeconds || 0
        await fetchApi("/crm/telephony/recordings", {
          method: "POST",
          body: JSON.stringify({
            leadId: activeRecord.recordType === "LEAD" ? activeRecord.id : undefined,
            contactId: activeRecord.recordType === "CONTACT" ? activeRecord.id : undefined,
            recordType: activeRecord.recordType,
            durationSeconds: duration,
            disposition: selectedDisposition ? selectedDisposition.toUpperCase() : "CONTACTED",
            recordingUrl: recordedAudioUrl || undefined,
            notes: callNotes,
          }),
        })
        toast.success("Call notes and activity saved!")
        mutateLeads()
        mutateContacts()
        if (viewMode === "recordings") mutateRecordings()
      } catch (err: any) {
        toast.error("Failed to save notes: " + (err.message || "Unknown error"))
      }
    }
  }

  // Handler: Next Lead
  const handleNextLead = async () => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current)
      autoAdvanceTimeoutRef.current = null
    }

    if ((callState === "wrapup" || durationSecondsRef.current > 0) && activeRecord) {
      if (!selectedDisposition) {
        const duration = durationSecondsRef.current || callDurationSeconds || 0
        if (duration > 0 || callNotes.trim() || recordedAudioUrl) {
          try {
            await fetchApi("/crm/telephony/recordings", {
              method: "POST",
              body: JSON.stringify({
                leadId: activeRecord.recordType === "LEAD" ? activeRecord.id : undefined,
                contactId: activeRecord.recordType === "CONTACT" ? activeRecord.id : undefined,
                recordType: activeRecord.recordType,
                durationSeconds: duration,
                disposition: "COMPLETED",
                recordingUrl: recordedAudioUrl || undefined,
                notes: callNotes.trim() ? callNotes.trim() : "Call completed",
              }),
            })
            mutateLeads()
            mutateContacts()
          } catch (e) {
            console.error("Auto call log error:", e)
          }
        }
      } else if (callNotes.trim()) {
        await saveCallNotes()
      }
    }

    if (callTimerRef.current) {
      clearInterval(callTimerRef.current)
      callTimerRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop()
      } catch (e) {}
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop())
      audioStreamRef.current = null
    }

    setCallNotes("")
    setSelectedDisposition(null)
    setRecordedAudioUrl(null)
    setCallDurationSeconds(0)
    durationSecondsRef.current = 0

    if (queuePos + 1 < filteredQueue.length) {
      updateQueuePos(queuePos + 1)
      setCallState("idle")
    } else {
      updateQueuePos(0)
      setCallState("idle")
      toast.info("Completed current calling queue.")
    }
  }

  // Handler: Add DNC Number
  const handleAddDnc = async () => {
    if (!dncNumberInput.trim()) return
    try {
      await fetchApi("/crm/dnc", {
        method: "POST",
        body: JSON.stringify({ phone: dncNumberInput.trim(), reason: dncReasonInput.trim() || undefined }),
      })
      toast.success("Number added to DNC list")
      setDncNumberInput("")
      setDncReasonInput("")
      mutateDnc()
      mutateLeads()
      mutateContacts()
    } catch (err: any) {
      toast.error(err.message || "Failed to add DNC number")
    }
  }

  // Handler: Remove DNC Number
  const handleRemoveDnc = async (id: string) => {
    try {
      await fetchApi(`/crm/dnc/${id}`, {
        method: "DELETE",
      })
      toast.success("Number removed from DNC list")
      mutateDnc()
      mutateLeads()
      mutateContacts()
    } catch (err: any) {
      toast.error(err.message || "Failed to remove DNC number")
    }
  }

  // Handler: Attach Recording to Past Call
  const handleSaveAttachRecording = async () => {
    if (!attachModalLogId || !attachUrlInput.trim()) {
      toast.error("Please provide a valid audio streaming or Google Drive link.")
      return
    }

    setIsAttachingRecording(true)
    try {
      const cleanUrl = formatAudioStreamingUrl(attachUrlInput.trim())
      await fetchApi(`/crm/telephony/recordings/${attachModalLogId}`, {
        method: "PATCH",
        body: JSON.stringify({ recordingUrl: cleanUrl }),
      })
      toast.success("Call recording attached successfully!")
      setAttachModalLogId(null)
      setAttachUrlInput("")
      mutateRecordings()
    } catch (err: any) {
      toast.error("Failed to attach recording: " + (err.message || "Unknown error"))
    } finally {
      setIsAttachingRecording(false)
    }
  }

  // Call Recordings Data & Metrics
  const recordingsData = dailyReportResponse?.detailedLogs || []
  const filteredRecordings = useMemo(() => {
    let list = recordingsData
    if (recordingsFilterType !== "ALL") {
      list = list.filter((r: any) => r.recordType === recordingsFilterType)
    }
    if (recordingsSearch.trim()) {
      const q = recordingsSearch.toLowerCase().trim()
      list = list.filter(
        (r: any) =>
          (r.leadName || "").toLowerCase().includes(q) ||
          (r.leadPhone || "").toLowerCase().includes(q) ||
          (r.telecallerName || "").toLowerCase().includes(q) ||
          (r.leadCompany || "").toLowerCase().includes(q) ||
          (r.disposition || "").toLowerCase().includes(q)
      )
    }
    return list
  }, [recordingsData, recordingsFilterType, recordingsSearch])

  const totalCallsLogged = recordingsData.length
  const callsWithRecordings = recordingsData.filter((r: any) => !!r.recordingUrl).length
  const totalTalkTimeSec = (recordingsData || []).reduce((acc: number, r: any) => acc + (r.durationSeconds || 0), 0)
  const totalMeetingsBooked = recordingsData.filter(
    (r: any) => (r.disposition || "").toUpperCase().includes("MEETING") || (r.content || "").toUpperCase().includes("MEETING")
  ).length

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex-none px-4 md:px-6 py-3.5 border-b border-border/50 bg-card/40 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Title & Mode Switcher */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/30 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-foreground tracking-tight">AI Power Dialer</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                  Pro CRM
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {settings.routeThroughMobile
                  ? "Routing cellular calls through your Vivo / Mobile SIM. Keep app open on your phone."
                  : "Ultra-fast auto dialing through high-intent lead & contact records."}
              </p>
            </div>
          </div>

          {/* Center Tabs: Queue vs Recordings */}
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60 self-start lg:self-center">
            <button
              onClick={() => setViewMode("dialer")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "dialer"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              Dialer Queue
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                viewMode === "dialer" ? "bg-primary-foreground/20 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {filteredQueue.length}
              </span>
            </button>

            <button
              onClick={() => {
                setViewMode("recordings")
                mutateRecordings()
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "recordings"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Disc className="w-3.5 h-3.5 text-rose-400" />
              Call Recordings
              {recordingsData.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  viewMode === "recordings" ? "bg-primary-foreground/20 text-white" : "bg-rose-500/20 text-rose-300"
                }`}>
                  {recordingsData.length}
                </span>
              )}
            </button>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Quick Status Pill */}
            {settings.routeThroughMobile && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile SIM Active</span>
              </div>
            )}

            {/* Manage DNC */}
            <button
              onClick={() => setIsDncOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-muted/40 hover:bg-muted/70 text-foreground text-xs font-semibold border border-border/50 transition-colors flex items-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
              <span>DNC ({dncPhones.length})</span>
            </button>

            {/* Dialer Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted/80 text-foreground text-xs font-bold border border-border/60 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Settings className="w-3.5 h-3.5 text-primary" />
              <span>Settings</span>
            </button>

            {/* Primary Action Button (in Dialer view) */}
            {viewMode === "dialer" && (
              <>
                {callState === "idle" || callState === "wrapup" ? (
                  <div className="flex items-center gap-1.5">
                    {callState === "idle" && queuePos + 1 < filteredQueue.length && (
                      <button
                        onClick={() => updateQueuePos(queuePos + 1)}
                        className="text-xs font-bold text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg bg-muted/40 hover:bg-muted/70 border border-border/50 transition-colors"
                      >
                        Skip
                      </button>
                    )}
                    <button
                      onClick={callState === "wrapup" ? handleNextLead : handleStartDialer}
                      disabled={filteredQueue.length === 0}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {callState === "wrapup" ? "Next Prospect" : "Start Calling"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEndCall}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm animate-pulse"
                  >
                    <PhoneOff className="w-3.5 h-3.5" /> End Call
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: POWER DIALER CANVAS                                    */}
      {/* ============================================================== */}
      {viewMode === "dialer" && (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col xl:flex-row gap-6">
          
          {/* Left Column: Comprehensive Queue with Source & Search Filters */}
          <div className="w-full xl:w-[360px] flex-none flex flex-col gap-3">
            <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[640px]">
              
              {/* Queue Controls & Filters */}
              <div className="p-3.5 border-b border-border/50 bg-muted/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-sm text-foreground">Contact Queue</h3>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                    {filteredQueue.length > 0 ? `${queuePos + 1} of ${filteredQueue.length}` : "0 contacts"}
                  </span>
                </div>

                {/* Queue Source Filter Buttons: ALL / LEADS / CONTACTS */}
                <div className="grid grid-cols-3 gap-1 bg-muted/40 p-1 rounded-xl border border-border/50">
                  <button
                    onClick={() => {
                      setQueueSource("ALL")
                      setQueuePos(0)
                    }}
                    className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                      queueSource === "ALL" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All ({unifiedRecords.length})
                  </button>
                  <button
                    onClick={() => {
                      setQueueSource("LEADS")
                      setQueuePos(0)
                    }}
                    className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                      queueSource === "LEADS" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Leads ({unifiedRecords.filter(r => r.recordType === "LEAD").length})
                  </button>
                  <button
                    onClick={() => {
                      setQueueSource("CONTACTS")
                      setQueuePos(0)
                    }}
                    className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                      queueSource === "CONTACTS" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Contacts ({unifiedRecords.filter(r => r.recordType === "CONTACT").length})
                  </button>
                </div>

                {/* Live Search & Sort Row */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search name, phone, company..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setQueuePos(0)
                      }}
                      className="w-full pl-8 pr-2.5 py-1 text-xs bg-background border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => updateSortBy(e.target.value as any)}
                    className="bg-background border border-border/60 rounded-lg px-2 py-1 text-xs font-semibold text-foreground focus:outline-none"
                    title="Sort order"
                  >
                    <option value="score">Score</option>
                    <option value="name">Name</option>
                    <option value="recent">Recent</option>
                  </select>
                </div>
              </div>

              {/* Queue List Scrollable Container */}
              <div className="flex-1 overflow-y-auto p-2">
                {filteredQueue.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                    <PhoneOff className="w-8 h-8 mb-2 opacity-40" />
                    <p className="text-xs font-medium">No prospects found</p>
                    <p className="text-[11px] text-muted-foreground/80 mt-1">
                      {searchQuery ? "Try refining your search filter." : "Add leads or contacts with valid phone numbers."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {filteredQueue.map((record, i) => {
                      const isActive = i === queuePos
                      const isPast = i < queuePos

                      return (
                        <div
                          key={`${record.recordType}_${record.id}`}
                          onClick={() => {
                            if (callState !== "idle" && callState !== "wrapup") {
                              toast.warning("Cannot switch prospects during an active call.")
                              return
                            }
                            updateQueuePos(i)
                            setCallNotes("")
                            setSelectedDisposition(null)
                          }}
                          className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                            isActive
                              ? "bg-primary/10 border-primary/40 shadow-xs"
                              : isPast
                              ? "bg-muted/20 border-transparent opacity-60"
                              : "bg-background border-border/50 hover:border-primary/30 hover:bg-muted/20"
                          }`}
                        >
                          {/* Left Icon Status Indicator */}
                          {isPast ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : isActive ? (
                            <Volume2 className="w-4 h-4 text-primary animate-pulse shrink-0" />
                          ) : (
                            <User className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}

                          {/* Record Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="font-semibold text-foreground text-xs truncate">
                                {record.name}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <span
                                  className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                                    record.recordType === "LEAD"
                                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                      : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                  }`}
                                >
                                  {record.recordType}
                                </span>
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                                  {record.score}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                              <span className="truncate max-w-[160px]">{record.company}</span>
                              <span className="font-mono text-[10px]">{record.phone}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Quick Refresh / Status */}
              <div className="p-2.5 border-t border-border/50 bg-muted/10 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  DNC Filtering Active
                </span>
                <button
                  onClick={() => {
                    mutateLeads()
                    mutateContacts()
                    toast.info("Queue refreshed")
                  }}
                  className="hover:text-foreground flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>

            </div>
          </div>

          {/* Middle Column: Active Dialer Interface */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-card border border-border/60 rounded-2xl shadow-sm h-[640px] flex flex-col items-center justify-center p-6 md:p-8 relative overflow-hidden">
              
              {/* Animated Canvas States */}
              {callState === "dialing" && <div className="absolute inset-0 bg-primary/5 animate-pulse" />}
              {callState === "connected" && <div className="absolute inset-0 bg-emerald-500/5" />}

              {activeRecord ? (
                <div className="relative z-10 w-full max-w-md mx-auto text-center flex flex-col items-center">
                  
                  {/* Record Type Pill */}
                  <div className="mb-4 flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      activeRecord.recordType === "LEAD"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    }`}>
                      {activeRecord.recordType} Record
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Score: {activeRecord.score}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                      {activeRecord.status}
                    </span>
                  </div>

                  {/* Prospect Initials Avatar */}
                  <div className={`w-24 h-24 rounded-full mb-4 flex items-center justify-center text-3xl font-black transition-all duration-500 ${
                    callState === "connected"
                      ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)] ring-4 ring-emerald-500/30"
                      : callState === "dialing"
                      ? "bg-primary/20 text-primary shadow-[0_0_40px_rgba(139,92,246,0.3)] animate-pulse ring-4 ring-primary/30"
                      : "bg-muted text-muted-foreground border border-border/80"
                  }`}>
                    {activeRecord.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>

                  {/* Prospect Details */}
                  <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight mb-1">
                    {activeRecord.name}
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground font-medium mb-1">
                    {activeRecord.role} • <span className="text-foreground">{activeRecord.company}</span>
                  </p>
                  <p className="text-xs font-mono text-muted-foreground/80 mb-6 bg-muted/40 px-3 py-1 rounded-full border border-border/50">
                    {activeRecord.phone} {activeRecord.email ? `• ${activeRecord.email}` : ""}
                  </p>

                  {/* Dynamic Status Display */}
                  <div className="h-16 mb-6 flex flex-col items-center justify-center">
                    {callState === "idle" && (
                      <span className="text-muted-foreground font-semibold text-sm flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-500" />
                        Ready to connect • Click to dial
                      </span>
                    )}

                    {callState === "dialing" && (
                      <span className="text-primary font-bold text-base flex items-center gap-2 animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        Connecting line to {activeRecord.phone}...
                      </span>
                    )}

                    {callState === "connected" && (
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-emerald-400 font-mono text-xl font-bold flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          {formatDuration(callDurationSeconds)} Connected
                        </span>
                        {settings.enableCallRecording && (
                          <span className="text-[11px] text-rose-400 font-mono flex items-center gap-1.5 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            REC {isMicMuted ? "(Muted)" : "Active"}
                          </span>
                        )}
                      </div>
                    )}

                    {callState === "voicemail" && (
                      <span className="text-amber-400 font-bold flex items-center gap-2">
                        <Voicemail className="w-4 h-4 text-amber-400 animate-spin" />
                        Dropping Voicemail & Moving to Next...
                      </span>
                    )}

                    {callState === "wrapup" && (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-amber-400 font-bold text-sm flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-400" />
                          Call Ended ({formatDuration(callDurationSeconds)}) • Complete Wrap-up
                        </span>
                        {settings.autoAdvanceOnDisposition && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            Auto-advance active on disposition select
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Large Softphone Action Buttons */}
                  <div className="flex items-center justify-center gap-4">
                    {callState === "connected" || callState === "dialing" ? (
                      <>
                        <button
                          onClick={() => {
                            if (audioStreamRef.current) {
                              audioStreamRef.current.getAudioTracks().forEach((track) => {
                                track.enabled = !track.enabled
                              })
                              setIsMicMuted(!isMicMuted)
                              toast.info(isMicMuted ? "Microphone Unmuted" : "Microphone Muted")
                            }
                          }}
                          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md ${
                            isMicMuted
                              ? "bg-rose-500 text-white shadow-rose-500/20 ring-4 ring-rose-500/20"
                              : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                          }`}
                          title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
                        >
                          <Mic className="w-6 h-6" />
                        </button>

                        <button
                          onClick={handleEndCall}
                          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-all shadow-lg shadow-red-600/30 ring-4 ring-red-600/20"
                          title="End Active Call"
                        >
                          <PhoneOff className="w-7 h-7" />
                        </button>

                        <button
                          onClick={handleVoicemailDrop}
                          className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 hover:bg-amber-500/20 transition-all shadow-md"
                          title="1-Click Voicemail Drop"
                        >
                          <Voicemail className="w-6 h-6" />
                        </button>
                      </>
                    ) : (
                      <>
                        {callState === "idle" ? (
                          <button
                            onClick={handleStartDialer}
                            className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center transition-all shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-500/20"
                            title="Dial Contact"
                          >
                            <Phone className="w-7 h-7 fill-current" />
                          </button>
                        ) : (
                          <button
                            onClick={handleNextLead}
                            className="px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2 text-sm"
                          >
                            Next Prospect <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>

                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <PhoneOff className="w-12 h-12 mb-3 opacity-40 mx-auto" />
                  <p className="text-sm font-bold">No Prospect Selected</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">Select a prospect from the queue list on the left.</p>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: AI Dynamic Script & Wrapup Form */}
          <div className="w-full xl:w-[440px] flex-none space-y-6">
            <div className="bg-card border border-border/60 rounded-2xl shadow-sm h-[640px] flex flex-col relative overflow-hidden">
              
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-primary/10 to-blue-500/10 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-sm text-foreground">AI Sales Script & Wrapup</h3>
                </div>
                {activeRecord && (
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {activeRecord.recordType}
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {activeRecord ? (
                  <>
                    {/* Context Box */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Prospect Intel & Source
                      </div>
                      <div className="bg-muted/30 p-3 rounded-xl border border-border/50 text-xs text-foreground leading-relaxed">
                        <span className="font-bold text-primary">{activeRecord.name}</span> ({activeRecord.role} at {activeRecord.company}). Lead source: <span className="font-semibold">{activeRecord.source}</span>. Status: <span className="font-semibold">{activeRecord.status}</span>.
                      </div>
                    </div>

                    {/* Opening Script Line */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Opening Line Recommendation
                      </div>
                      <div className="bg-primary/5 border-l-4 border-primary p-3 rounded-r-xl text-foreground font-medium text-xs leading-relaxed">
                        "Hi {activeRecord.name.split(" ")[0]}, Stalin from Visuals Pro here! Calling regarding your work at {activeRecord.company} — do you have 90 seconds to see how we've streamlined client acquisition for similar teams?"
                      </div>
                    </div>

                    {/* Value Props */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        High-Converting Talking Points
                      </div>
                      <ul className="space-y-2 text-xs text-foreground">
                        <li className="flex items-start gap-2 bg-muted/20 p-2.5 rounded-lg border border-border/40">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          <span>40% reduction in customer acquisition cost via dedicated creative workflows.</span>
                        </li>
                        <li className="flex items-start gap-2 bg-muted/20 p-2.5 rounded-lg border border-border/40">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          <span>Guaranteed 24-hour turnaround on revisions with dedicated production pods.</span>
                        </li>
                      </ul>
                    </div>

                    {/* Wrap-up and Disposition Section */}
                    {callState === "wrapup" && (
                      <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-3">
                        <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> Call Wrap-up & Disposition
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            Duration: {formatDuration(callDurationSeconds)}
                          </span>
                        </div>

                        {/* Call Recording Player or Drive Linker */}
                        {recordedAudioUrl ? (
                          <div className="p-3 bg-card border border-border rounded-xl space-y-2">
                            <div className="text-xs font-bold text-foreground flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-emerald-400">
                                <Volume2 className="w-3.5 h-3.5" /> Call Audio Captured
                              </span>
                              <div className="flex items-center gap-2">
                                <a
                                  href={recordedAudioUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" /> Open
                                </a>
                                <button
                                  type="button"
                                  onClick={() => setRecordedAudioUrl(null)}
                                  className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-0.5"
                                >
                                  <X className="w-3 h-3" /> Remove
                                </button>
                              </div>
                            </div>
                            <audio controls src={formatAudioStreamingUrl(recordedAudioUrl)} className="h-8 w-full" preload="metadata" />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {!showDriveInput ? (
                              <button
                                type="button"
                                onClick={() => setShowDriveInput(true)}
                                className="w-full py-1.5 px-3 rounded-lg border border-dashed border-border/80 hover:border-primary bg-muted/20 hover:bg-muted/40 text-xs font-medium text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-all"
                              >
                                <HardDrive className="w-3.5 h-3.5 text-primary" />
                                Attach Vivo / Google Drive Call Recording
                              </button>
                            ) : (
                              <div className="p-3 bg-card border border-border rounded-xl space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                                  <span className="flex items-center gap-1.5 text-primary">
                                    <HardDrive className="w-3.5 h-3.5" /> Link Vivo / Drive Audio Link
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowDriveInput(false)
                                      setExternalAudioInput("")
                                    }}
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="url"
                                    value={externalAudioInput}
                                    onChange={(e) => setExternalAudioInput(e.target.value)}
                                    placeholder="Paste Google Drive or audio link..."
                                    className="flex-1 bg-background border border-border/60 rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!externalAudioInput.trim()) {
                                        toast.error("Please paste an audio or Google Drive URL.")
                                        return
                                      }
                                      const cleanUrl = formatAudioStreamingUrl(externalAudioInput.trim())
                                      setRecordedAudioUrl(cleanUrl)
                                      setShowDriveInput(false)
                                      setExternalAudioInput("")
                                      toast.success("Call recording attached!")
                                    }}
                                    className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-all shrink-0 flex items-center gap-1"
                                  >
                                    <Link2 className="w-3 h-3" /> Attach
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {isUploadingAudio && (
                          <div className="text-xs text-amber-400 flex items-center gap-2 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                            Uploading recorded call audio...
                          </div>
                        )}

                        {/* Quick Disposition Select Buttons */}
                        <div className="flex flex-wrap gap-1.5">
                          {["Meeting Booked", "Call Back Later", "Not Interested", "Left Voicemail"].map((disp) => {
                            const isActive = selectedDisposition === disp
                            return (
                              <button
                                key={disp}
                                onClick={() => handleDisposition(disp)}
                                className={`px-2.5 py-1.5 border rounded-lg text-xs font-bold transition-all ${
                                  isActive
                                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                    : "bg-background border-border/60 text-foreground hover:border-primary"
                                }`}
                              >
                                {disp}
                              </button>
                            )
                          })}
                        </div>

                        {/* Meeting Booking Sub-Form */}
                        {selectedDisposition === "Meeting Booked" && (
                          <div className="p-3 bg-background border border-border rounded-xl space-y-2">
                            <div className="text-xs font-bold text-foreground">Schedule Google Calendar Meeting</div>
                            
                            <div className="space-y-1">
                              <label className="text-[10px] text-muted-foreground uppercase font-bold">Event Title</label>
                              <input
                                type="text"
                                value={meetingSummary}
                                onChange={(e) => setMeetingSummary(e.target.value)}
                                className="w-full bg-muted/30 border border-border/50 rounded-lg p-1.5 text-xs text-foreground focus:outline-none"
                                placeholder="e.g. Discovery Call"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] text-muted-foreground uppercase font-bold">Prospect Email</label>
                              <input
                                type="email"
                                value={attendeeEmail}
                                onChange={(e) => setAttendeeEmail(e.target.value)}
                                className="w-full bg-muted/30 border border-border/50 rounded-lg p-1.5 text-xs text-foreground focus:outline-none"
                                placeholder="prospect@company.com"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] text-muted-foreground uppercase font-bold">Date & Time</label>
                              <input
                                type="datetime-local"
                                value={meetingTime}
                                onChange={(e) => setMeetingTime(e.target.value)}
                                className="w-full bg-muted/30 border border-border/50 rounded-lg p-1.5 text-xs text-foreground focus:outline-none"
                              />
                            </div>

                            <button
                              onClick={handleScheduleMeeting}
                              disabled={isScheduling}
                              className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isScheduling ? "Creating Event..." : "Send Calendar Invite & Save"}
                            </button>
                          </div>
                        )}

                        {/* Notes Section with AI Assist */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-medium text-muted-foreground">Call Notes</label>
                            <AIAssistButton
                              format="text"
                              context="CRM Call Notes summarizer."
                              onGenerate={(text) => setCallNotes(text)}
                              buttonLabel="AI Notes"
                            />
                          </div>
                          <textarea
                            value={callNotes}
                            onChange={(e) => setCallNotes(e.target.value)}
                            className="w-full bg-background border border-border/60 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary resize-none h-20 placeholder:text-muted-foreground/60"
                            placeholder="Prospect feedback, pain points, next steps..."
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-muted-foreground text-xs py-8">
                    Select a prospect to view script and context.
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: CALL RECORDINGS ARCHIVE & MANAGER                       */}
      {/* ============================================================== */}
      {viewMode === "recordings" && (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Total Calls Today</span>
                <Phone className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-black text-foreground mt-2">{totalCallsLogged}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Across all telecallers</p>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Calls With Audio</span>
                <Disc className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-black text-foreground mt-2">{callsWithRecordings}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Streamable in browser</p>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Total Talk Time</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-foreground mt-2">
                {dailyReportResponse?.formattedTotalTalkTime || formatDuration(totalTalkTimeSec)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Recorded connection time</p>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Meetings Booked</span>
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-black text-foreground mt-2">{totalMeetingsBooked}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Calendar invites dispatched</p>
            </div>
          </div>

          {/* Recordings List & Filter Controls */}
          <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            
            {/* Header / Filter Bar */}
            <div className="p-4 border-b border-border/50 bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Disc className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-sm text-foreground">Call Recordings & Audio Archive</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                  {filteredRecordings.length} logs
                </span>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                {/* Search */}
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search prospect, phone, telecaller..."
                    value={recordingsSearch}
                    onChange={(e) => setRecordingsSearch(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1 text-xs bg-background border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
                  />
                  {recordingsSearch && (
                    <button
                      onClick={() => setRecordingsSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Filter Type */}
                <select
                  value={recordingsFilterType}
                  onChange={(e) => setRecordingsFilterType(e.target.value as any)}
                  className="bg-background border border-border/60 rounded-lg px-2.5 py-1 text-xs font-semibold text-foreground focus:outline-none"
                >
                  <option value="ALL">All Records</option>
                  <option value="LEAD">Leads Only</option>
                  <option value="CONTACT">Contacts Only</option>
                </select>

                <button
                  onClick={() => {
                    mutateRecordings()
                    toast.info("Recordings refreshed")
                  }}
                  className="px-2.5 py-1 rounded-lg bg-muted/40 hover:bg-muted/70 text-foreground text-xs font-semibold border border-border/50 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>
            </div>

            {/* List / Table */}
            <div className="divide-y divide-border/40">
              {filteredRecordings.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Disc className="w-10 h-10 mb-2 opacity-30 mx-auto" />
                  <p className="text-sm font-bold">No call recordings found</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    Calls made through the Power Dialer with auto-record enabled or attached Drive links appear here.
                  </p>
                </div>
              ) : (
                filteredRecordings.map((call: any) => {
                  const hasAudio = !!call.recordingUrl
                  const disp = call.disposition || "COMPLETED"

                  return (
                    <div
                      key={call.id}
                      className="p-4 hover:bg-muted/10 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      {/* Left: Prospect & Call Info */}
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-foreground">{call.leadName}</span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                              call.recordType === "LEAD"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            }`}
                          >
                            {call.recordType || "PROSPECT"}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">{call.leadPhone}</span>
                          <span className="text-xs text-muted-foreground">• {call.leadCompany}</span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Telecaller: <strong className="text-foreground">{call.telecallerName}</strong></span>
                          <span>•</span>
                          <span>Time: {new Date(call.timestamp).toLocaleString()}</span>
                          <span>•</span>
                          <span className="font-mono text-emerald-400 font-semibold">{call.formattedDuration || `${call.durationSeconds}s`}</span>
                        </div>

                        {call.content && (
                          <p className="text-xs text-muted-foreground/90 line-clamp-1 italic">
                            "{call.content.replace(/\[(?:Recording|Audio|Disposition|Call Duration):[^\]]+\]/gi, '').trim() || call.content}"
                          </p>
                        )}
                      </div>

                      {/* Right: Audio Player / Attach Link & Disposition Tag */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                        {/* Disposition Badge */}
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide shrink-0 ${
                            disp.includes("MEETING")
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : disp.includes("CALL BACK") || disp.includes("CONTACTED")
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : disp.includes("NOT INTERESTED") || disp.includes("LOST")
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : disp.includes("VOICEMAIL")
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {disp}
                        </span>

                        {/* Audio Streaming Player or Attach Button */}
                        {hasAudio ? (
                          <div className="flex items-center gap-2 bg-card p-1.5 rounded-xl border border-border/80">
                            <audio
                              controls
                              src={formatAudioStreamingUrl(call.recordingUrl)}
                              className="h-8 w-48 sm:w-56"
                              preload="metadata"
                            />
                            <a
                              href={call.recordingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                              title="Open original audio link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => {
                                setAttachModalLogId(call.id)
                                setAttachUrlInput(call.recordingUrl)
                              }}
                              className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted font-medium"
                              title="Edit attached recording URL"
                            >
                              Edit Link
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAttachModalLogId(call.id)
                              setAttachUrlInput("")
                            }}
                            className="px-3 py-1.5 bg-muted/40 hover:bg-muted/70 text-foreground border border-dashed border-border/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                          >
                            <Link2 className="w-3.5 h-3.5 text-primary" />
                            Attach Recording
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: ATTACH CALL RECORDING DIALOG                          */}
      {/* ============================================================== */}
      {attachModalLogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-primary" />
                <h3 className="text-base font-bold text-foreground">Attach Call Audio Recording</h3>
              </div>
              <button
                onClick={() => {
                  setAttachModalLogId(null)
                  setAttachUrlInput("")
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Paste a Google Drive share link, direct audio link, or storage URL. Grekam OS will format it to stream directly inside the browser.
            </p>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Audio Stream / Google Drive URL
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/... or audio file URL"
                value={attachUrlInput}
                onChange={(e) => setAttachUrlInput(e.target.value)}
                className="w-full bg-background border border-border/80 rounded-xl p-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAttachModalLogId(null)
                  setAttachUrlInput("")
                }}
                className="px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAttachRecording}
                disabled={isAttachingRecording}
                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isAttachingRecording ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                Save Recording Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: DIALER SETTINGS DIALOG                                */}
      {/* ============================================================== */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-border/60 flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Dialer Configuration & Telephony Settings</h3>
                  <p className="text-xs text-muted-foreground">Configure device routing, audio capture, and queue pacing</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Telephony / Device Routing Mode */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Call Routing & Telephony</h4>
                </div>

                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-border/60 hover:border-primary/40 bg-muted/10 cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="routingMode"
                      checked={!settings.routeThroughMobile}
                      onChange={() => setSettings({ ...settings, routeThroughMobile: false })}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-xs font-bold text-foreground">Browser Softphone & Native Dialer (Default)</div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Triggers device native telephone URI handler (`tel:`) or your web softphone.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-border/60 hover:border-primary/40 bg-muted/10 cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="routingMode"
                      checked={settings.routeThroughMobile}
                      onChange={() => setSettings({ ...settings, routeThroughMobile: true })}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-xs font-bold text-foreground">Route Through Mobile / Vivo SIM Card</div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Broadcasts real-time WebSocket signals to your logged-in mobile phone to dial via your physical SIM card.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Call Audio Recording Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-rose-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Call Recording & Audio</h4>
                </div>

                <label className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/10 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-foreground">Auto-Record Outbound Calls</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Automatically captures browser microphone during calls and saves audio to CRM.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableCallRecording}
                    onChange={(e) => setSettings({ ...settings, enableCallRecording: e.target.checked })}
                    className="w-4 h-4 rounded text-primary"
                  />
                </label>

                {/* Vivo Phone Auto-Recording Tips */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Info className="w-3.5 h-3.5" /> Vivo & Android SIM Call Recording Guide
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Vivo and Android smartphones have built-in cellular call recording under <em>Settings &gt; Phone &gt; Record Settings &gt; Record all calls automatically</em>. Recorded calls save to internal storage and can auto-sync to Google Drive. Simply paste the Google Drive link into the Call Recordings tab to stream anywhere.
                  </p>
                </div>
              </div>

              {/* Pacing & Queue Automation */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Pacing & Auto-Advance</h4>
                </div>

                <label className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/10 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-foreground">Auto-Advance After Disposition</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Automatically moves to the next prospect in queue once a disposition is selected.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoAdvanceOnDisposition}
                    onChange={(e) => setSettings({ ...settings, autoAdvanceOnDisposition: e.target.checked })}
                    className="w-4 h-4 rounded text-primary"
                  />
                </label>

                {settings.autoAdvanceOnDisposition && (
                  <div className="space-y-1 pl-1">
                    <label className="text-[11px] font-bold text-muted-foreground">Wrap-up Cooldown (Seconds)</label>
                    <select
                      value={settings.wrapupCooldownSeconds}
                      onChange={(e) => setSettings({ ...settings, wrapupCooldownSeconds: parseInt(e.target.value, 10) || 5 })}
                      className="w-full bg-background border border-border/80 rounded-xl p-2 text-xs font-semibold text-foreground focus:outline-none"
                    >
                      <option value={3}>3 seconds (Fastest)</option>
                      <option value={5}>5 seconds (Recommended)</option>
                      <option value={10}>10 seconds (Standard)</option>
                      <option value={15}>15 seconds (Extended wrap-up)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Queue Default Preferences */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Queue Defaults</h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Default Queue Source</label>
                    <select
                      value={settings.defaultQueueSource}
                      onChange={(e) => setSettings({ ...settings, defaultQueueSource: e.target.value as any })}
                      className="w-full bg-background border border-border/80 rounded-xl p-2 text-xs font-semibold text-foreground focus:outline-none"
                    >
                      <option value="ALL">All (Leads & Contacts)</option>
                      <option value="LEADS">Leads Only</option>
                      <option value="CONTACTS">Contacts Only</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Default Sort</label>
                    <select
                      value={settings.defaultSortBy}
                      onChange={(e) => setSettings({ ...settings, defaultSortBy: e.target.value as any })}
                      className="w-full bg-background border border-border/80 rounded-xl p-2 text-xs font-semibold text-foreground focus:outline-none"
                    >
                      <option value="score">Lead Score</option>
                      <option value="name">Alphabetical</option>
                      <option value="recent">Recently Added</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border/60 bg-muted/20 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setSettings(DEFAULT_SETTINGS)
                  toast.info("Reset to default settings")
                }}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold"
              >
                Reset to Defaults
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    saveSettings(settings)
                    setIsSettingsOpen(false)
                  }}
                  className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm"
                >
                  Save & Apply
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DRAWER: DNC (DO NOT CALL) MANAGEMENT                           */}
      {/* ============================================================== */}
      {isDncOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-card border-l border-border h-full flex flex-col p-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <h3 className="text-base font-bold text-foreground">Do Not Call (DNC) Registry</h3>
              </div>
              <button
                onClick={() => setIsDncOpen(false)}
                className="text-muted-foreground hover:text-foreground font-bold p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add to DNC Form */}
            <div className="space-y-3 mb-6 bg-muted/20 p-4 rounded-2xl border border-border/50">
              <h4 className="text-xs font-bold text-foreground">Add Number to Restriction List</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Phone number (e.g. +91 98765 43210)"
                  value={dncNumberInput}
                  onChange={(e) => setDncNumberInput(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Reason (e.g. Explicit opt-out, competitor)"
                  value={dncReasonInput}
                  onChange={(e) => setDncReasonInput(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-xl p-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleAddDnc}
                  className="w-full py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add to DNC Registry
                </button>
              </div>
            </div>

            {/* DNC List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Restricted Numbers ({dncList.length})
              </div>
              {dncList.length === 0 ? (
                <div className="text-xs text-muted-foreground py-8 text-center">
                  No phone numbers currently on the DNC list.
                </div>
              ) : (
                dncList.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-3 bg-muted/10 border border-border/50 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-mono font-bold text-foreground">{item.phone}</div>
                      {item.reason && <div className="text-[11px] text-muted-foreground mt-0.5">{item.reason}</div>}
                    </div>
                    <button
                      onClick={() => handleRemoveDnc(item.id)}
                      className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
