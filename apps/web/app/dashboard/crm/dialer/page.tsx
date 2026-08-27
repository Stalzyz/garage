"use client"

import { useState, useEffect } from "react"
import { Phone, Mic, PhoneOff, User, Zap, Voicemail, FileText, CheckCircle2, ChevronRight, Volume2, Pause, Smartphone } from "lucide-react"
import { useSession } from "next-auth/react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { AIAssistButton } from "@/components/ui/ai-assist-button"


export default function PowerDialerDashboard() {
  const [callState, setCallState] = useState<"idle" | "dialing" | "connected" | "voicemail" | "wrapup">("idle")
  const [queuePos, setQueuePos] = useState(0)
  const [sortBy, setSortBy] = useState<"score" | "name" | "recent">("score")
  const [routeThroughMobile, setRouteThroughMobile] = useState(false)
  const { data: session } = useSession()

  // Fetch real leads from API
  const { data: apiResponse, mutate } = useApi<any>("/crm/leads")
  const leads = apiResponse?.data || []
  
  // Filter for leads with phone numbers and sort based on dynamic option
  const queue = leads
    .filter((l: any) => !!l.phone)
    .sort((a: any, b: any) => {
      if (sortBy === "score") {
        return (b.score || 0) - (a.score || 0)
      } else if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "")
      } else {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      }
    })
    .slice(0, 50)
  const activeLead = queue[queuePos] || queue[0] || null

  // Load configuration from local storage on mount
  useEffect(() => {
    const savedPos = localStorage.getItem("crm_dialer_pos")
    if (savedPos) {
      const pos = parseInt(savedPos, 10)
      if (pos >= 0 && pos < queue.length) {
        setQueuePos(pos)
      } else {
        setQueuePos(0)
      }
    }
    const savedSort = localStorage.getItem("crm_dialer_sort") as any
    if (savedSort && ["score", "name", "recent"].includes(savedSort)) {
      setSortBy(savedSort)
    }
  }, [queue.length])

  const updateQueuePos = (pos: number) => {
    const safePos = pos >= queue.length ? 0 : pos
    setQueuePos(safePos)
    localStorage.setItem("crm_dialer_pos", safePos.toString())
  }

  const updateSortBy = (mode: "score" | "name" | "recent") => {
    setSortBy(mode)
    setQueuePos(0)
    localStorage.setItem("crm_dialer_sort", mode)
    localStorage.setItem("crm_dialer_pos", "0")
  }

  const [callNotes, setCallNotes] = useState("")
  const [selectedDisposition, setSelectedDisposition] = useState<string | null>(null)

  const [meetingSummary, setMeetingSummary] = useState("")
  const [meetingTime, setMeetingTime] = useState("")
  const [attendeeEmail, setAttendeeEmail] = useState("")
  const [isScheduling, setIsScheduling] = useState(false)

  useEffect(() => {
    if (activeLead) {
      setAttendeeEmail(activeLead.email || "")
      setMeetingSummary(`Intro Call with ${activeLead.name}`)
    }
  }, [activeLead])

  const handleScheduleMeeting = async () => {
    if (!meetingTime || !meetingSummary || !attendeeEmail) {
      toast.error("Please fill in summary, date/time, and email.")
      return
    }
    setIsScheduling(true)
    try {
      const start = new Date(meetingTime)
      const end = new Date(start.getTime() + 30 * 60 * 1000) // default 30 mins
      await fetchApi('/crm/calendar/invite', {
        method: 'POST',
        body: JSON.stringify({
          leadId: activeLead.id,
          summary: meetingSummary,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          attendeeEmail,
        })
      });
      toast.success("Google Calendar invite sent to prospect!")
      
      // Directly log WON status and disposition activity
      await fetchApi(`/crm/leads/${activeLead.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "WON" })
      })
      await fetchApi(`/crm/leads/${activeLead.id}/activities`, {
        method: "POST",
        body: JSON.stringify({
          type: "CALL",
          content: `[Call Disposition] Outcome marked as: Meeting Booked. Google Calendar Invite sent.`
        })
      })
      
      setMeetingSummary("")
      setMeetingTime("")
      mutate()
    } catch (err: any) {
      toast.error("Failed to schedule meeting: " + err.message)
    } finally {
      setIsScheduling(false)
    }
  }

  const [isDncOpen, setIsDncOpen] = useState(false)
  const [dncNumberInput, setDncNumberInput] = useState("")
  const [dncReasonInput, setDncReasonInput] = useState("")
  const { data: dncResponse, mutate: mutateDnc } = useApi<any>(isDncOpen ? "/crm/dnc" : null)
  const dncList = dncResponse?.data || []

  const handleAddDnc = async () => {
    if (!dncNumberInput) return
    try {
      await fetchApi("/crm/dnc", {
        method: "POST",
        body: JSON.stringify({ phone: dncNumberInput, reason: dncReasonInput })
      })
      toast.success("Number added to DNC list")
      setDncNumberInput("")
      setDncReasonInput("")
      mutateDnc()
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to add DNC number")
    }
  }

  const handleRemoveDnc = async (id: string) => {
    try {
      await fetchApi(`/crm/dnc/${id}`, {
        method: "DELETE"
      })
      toast.success("Number removed from DNC list")
      mutateDnc()
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to remove DNC number")
    }
  }

  const handleStartDialer = async () => {
    if (!activeLead || !activeLead.phone) {
      toast.error("Active lead does not have a valid phone number to dial.")
      return
    }

    setCallState("dialing")

    // Trigger device native tel: dialer / web softphone
    try {
      const cleanPhone = activeLead.phone.replace(/[^0-9+]/g, '')
      window.location.href = `tel:${cleanPhone}`
    } catch (e) {
      console.warn("Could not open native dialer URI:", e)
    }

    if (routeThroughMobile) {
      const email = session?.user?.email
      if (!email) {
        toast.error("You must be logged in to route calls.")
        setCallState("idle")
        return
      }

      try {
        await fetchApi('/crm/dial-mobile', {
          method: 'POST',
          body: JSON.stringify({ leadPhone: activeLead.phone, email })
        })
        toast.info(`Dial signal sent to your mobile: ${activeLead.phone}`)
      } catch (err) {
        console.error("Failed to trigger mobile dial:", err)
        toast.error("Could not trigger mobile dial. Check connection.")
      }
    }

    setTimeout(() => {
      setCallState("connected")
    }, 2500)
  }

  const handleEndCall = () => {
    setCallState("wrapup")
  }

  const handleVoicemailDrop = async () => {
    setCallState("voicemail")
    if (activeLead) {
      try {
        await fetchApi(`/crm/leads/${activeLead.id}/activities`, {
          method: "POST",
          body: JSON.stringify({
            type: "CALL",
            content: "[Voicemail] Dropped pre-recorded voicemail"
          })
        })
        toast.success("Voicemail logged to CRM")
      } catch (err) {
        console.error(err)
      }
    }
    setTimeout(() => {
      handleNextLead()
    }, 2000)
  }

  const handleDisposition = async (disposition: string) => {
    setSelectedDisposition(disposition)
    
    if (disposition === "Meeting Booked") {
      // Don't auto-save; wait for meeting scheduling form submission
      return
    }

    let newStatus: string | null = null
    if (disposition === "Call Back Later") newStatus = "CONTACTED"
    else if (disposition === "Not Interested") newStatus = "LOST"
    else if (disposition === "Left Voicemail") newStatus = "CONTACTED"

    if (newStatus && activeLead) {
      try {
        await fetchApi(`/crm/leads/${activeLead.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus })
        })
        await fetchApi(`/crm/leads/${activeLead.id}/activities`, {
          method: "POST",
          body: JSON.stringify({
            type: "CALL",
            content: `[Call Disposition] Outcome marked as: ${disposition}`
          })
        })
        toast.success(`Disposition logged: ${disposition}`)
        mutate()
      } catch (err: any) {
        toast.error("Failed to sync disposition status: " + err.message)
      }
    }
  }

  const saveCallNotes = async () => {
    if (activeLead && callNotes.trim()) {
      try {
        await fetchApi(`/crm/leads/${activeLead.id}/activities`, {
          method: "POST",
          body: JSON.stringify({
            type: "CALL",
            content: `[Call Notes] ${callNotes}`
          })
        })
        toast.success("Call notes saved!")
      } catch (err: any) {
        toast.error("Failed to save notes: " + err.message)
      }
    }
  }

  const handleNextLead = async () => {
    if (callState === "wrapup") {
      await saveCallNotes()
    }
    setCallNotes("")
    setSelectedDisposition(null)
    if (queuePos + 1 < queue.length) {
      updateQueuePos(queuePos + 1)
      setCallState("idle")
    }
  }

  if (!queue || queue.length === 0) {
    return (
      <div className="flex flex-col h-full bg-background items-center justify-center">
        <PhoneOff className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-bold text-foreground">No leads available</h2>
        <p className="text-muted-foreground">Add more leads with phone numbers to use the power dialer.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-4 md:px-6 py-4 md:py-5 border-b border-border/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Phone className="w-6 h-6 text-primary" /> AI Power Dialer
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              {routeThroughMobile 
                ? "Routing call triggers to your mobile device. Keep Grekam OS open on your phone."
                : 'Auto-dialing through "Q3 High Intent Leads" campaign.'}
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider">Sort Queue:</span>
              <select
                value={sortBy}
                onChange={(e) => updateSortBy(e.target.value as any)}
                className="bg-muted/40 hover:bg-muted/70 text-foreground border border-border/50 rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none transition-colors"
              >
                <option value="score">Lead Score</option>
                <option value="name">Alphabetical</option>
                <option value="recent">Recently Created</option>
              </select>
            </div>
            <label className="flex items-center justify-between md:justify-start gap-2.5 cursor-pointer bg-muted/30 px-3 py-2 md:py-1.5 rounded-lg border border-border/50 hover:bg-muted/50 transition-all select-none">
              <Smartphone className={`w-4 h-4 transition-colors ${routeThroughMobile ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-xs font-bold text-foreground">Mobile Dialer Mode</span>
              <input 
                type="checkbox" 
                checked={routeThroughMobile}
                onChange={(e) => setRouteThroughMobile(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${routeThroughMobile ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${routeThroughMobile ? 'translate-x-3.5' : 'translate-x-0'}`} />
              </div>
            </label>
            <div className="flex items-center justify-between md:justify-start gap-4">
              <span className="text-sm font-medium text-muted-foreground">Queue: {queuePos + 1}/{queue.length}</span>
              <button 
                onClick={() => setIsDncOpen(true)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg bg-muted/40 hover:bg-muted/70 border border-border/50 transition-colors"
              >
                Manage DNC
              </button>
              {callState === "idle" || callState === "wrapup" ? (
                <div className="flex items-center gap-2">
                  {callState === "idle" && queuePos + 1 < queue.length && (
                    <button 
                      onClick={() => updateQueuePos(queuePos + 1)}
                      className="text-xs font-bold text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg bg-muted/40 hover:bg-muted/70 border border-border/50 transition-colors min-h-[44px]"
                    >
                      Skip Lead
                    </button>
                  )}
                  <button 
                    onClick={callState === "wrapup" ? handleNextLead : handleStartDialer}
                    className="flex flex-1 md:flex-none items-center justify-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-600 transition-all shadow-sm min-h-[44px]"
                  >
                    <Phone className="w-4 h-4" /> {callState === "wrapup" ? "Dial Next Lead" : "Start Power Dialer"}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleEndCall}
                  className="flex flex-1 md:flex-none items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition-all shadow-sm min-h-[44px]"
                >
                  <PhoneOff className="w-4 h-4" /> End Call
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col xl:flex-row gap-6">
        
        {/* Left Col: Queue */}
        <div className="w-full xl:w-[350px] flex-none space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-border/50 bg-muted/20">
              <h3 className="font-bold text-foreground">Dialing Queue</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {queue.map((lead: any, i: any) => (
                  <div 
                    key={lead.id} 
                    onClick={() => {
                      if (callState !== "idle" && callState !== "wrapup") {
                        toast.warning("Cannot switch leads during an active call.")
                        return
                      }
                      updateQueuePos(i)
                      setCallNotes("")
                      setSelectedDisposition(null)
                    }}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                      i === queuePos ? 'bg-primary/10 border-primary/30' : 
                      i < queuePos ? 'bg-muted/30 border-transparent opacity-50' : 
                      'bg-background border-border/50 hover:border-primary/30 hover:bg-muted/30'
                    }`}
                  >
                    {i < queuePos ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : i === queuePos ? (
                      <Volume2 className="w-5 h-5 text-primary animate-pulse" />
                    ) : (
                      <User className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground text-sm">{lead.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                          Score: {lead.score || 0}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">{lead.company}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Col: Dialer Interface */}
        <div className="flex-1 space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl shadow-sm h-[600px] flex flex-col items-center justify-center p-8 relative overflow-hidden">
            
            {/* Background effects based on state */}
            {callState === "dialing" && <div className="absolute inset-0 bg-primary/5 animate-pulse" />}
            {callState === "connected" && <div className="absolute inset-0 bg-emerald-500/5" />}

            <div className="relative z-10 w-full max-w-md mx-auto text-center">
              
              {/* Avatar / Initials */}
              <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-black transition-all duration-500 ${
                callState === "connected" ? "bg-emerald-500/20 text-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]" :
                callState === "dialing" ? "bg-primary/20 text-primary shadow-[0_0_40px_rgba(139,92,246,0.3)] animate-pulse" :
                "bg-muted text-muted-foreground"
              }`}>
                {activeLead.name.split(" ").map((n: any) => n[0]).join("")}
              </div>

              <h2 className="text-3xl font-bold text-foreground mb-1">{activeLead.name}</h2>
              <p className="text-lg text-muted-foreground mb-2">{activeLead.role} @ {activeLead.company}</p>
              <p className="text-sm font-mono text-muted-foreground mb-8">{activeLead.phone}</p>

              {/* Status Display */}
              <div className="h-12 mb-8 flex items-center justify-center">
                {callState === "idle" && <span className="text-muted-foreground font-medium">Ready to dial</span>}
                {callState === "dialing" && <span className="text-primary font-bold animate-pulse">Dialing...</span>}
                {callState === "connected" && <span className="text-emerald-500 font-bold flex items-center gap-2"><Mic className="w-4 h-4 animate-pulse" /> 00:04 Connected</span>}
                {callState === "voicemail" && <span className="text-amber-500 font-bold">Dropping Voicemail & Moving to Next...</span>}
                {callState === "wrapup" && <span className="text-orange-500 font-bold">Call Ended. Wrap up notes.</span>}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4">
                {callState === "connected" || callState === "dialing" ? (
                  <>
                    <button className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors tooltip-trigger" title="Mute">
                      <Mic className="w-6 h-6" />
                    </button>
                    <button onClick={handleEndCall} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
                      <PhoneOff className="w-6 h-6" />
                    </button>
                    <button onClick={handleVoicemailDrop} className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 hover:bg-amber-500/20 transition-colors" title="1-Click Voicemail Drop">
                      <Voicemail className="w-6 h-6" />
                    </button>
                  </>
                ) : (
                  <>
                    {callState === "idle" ? (
                      <button onClick={handleStartDialer} className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
                        <Phone className="w-6 h-6 fill-current" />
                      </button>
                    ) : (
                      <button onClick={handleNextLead} className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-lg flex items-center gap-2">
                        Next Lead <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Right Col: AI Script Panel */}
        <div className="w-full xl:w-[450px] flex-none space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl shadow-sm h-[600px] flex flex-col relative overflow-hidden">
            {/* Sparkle Header */}
            <div className="p-4 bg-gradient-to-r from-primary/10 to-blue-500/10 border-b border-border/50 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground">AI Dynamic Script</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Context */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prospect Context</div>
                <div className="bg-muted/30 p-3 rounded-xl border border-border/50 text-sm text-foreground">
                  {activeLead.name} recently downloaded the "State of SaaS Marketing 2025" whitepaper. Nexus Health just raised a Series B last month.
                </div>
              </div>

              {/* The Script */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Opening Line</div>
                <div className="bg-primary/5 border-l-4 border-primary p-3 rounded-r-xl text-foreground font-medium text-lg">
                  "Hi {activeLead.name.split(" ")[0]}, saw Nexus Health just closed your Series B — huge congrats! I'm calling because I noticed you downloaded our SaaS Marketing whitepaper..."
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Key Value Props to Hit</div>
                <ul className="space-y-2 text-sm text-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    We help healthcare SaaS companies reduce CPA by 40% using AI-driven campaigns.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    Mention our case study with 'MedTech Pro' where we doubled their inbound demo requests.
                  </li>
                </ul>
              </div>

              {/* Wrapup form if call ended */}
              {callState === "wrapup" && (
                <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl animate-in slide-in-from-bottom-2">
                  <div className="text-sm font-bold text-amber-500 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Quick Disposition
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {["Meeting Booked", "Call Back Later", "Not Interested", "Left Voicemail"].map((disp) => {
                      const isActive = selectedDisposition === disp;
                      return (
                        <button
                          key={disp}
                          onClick={() => handleDisposition(disp)}
                          className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all ${
                            isActive
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-background border-border/50 text-foreground hover:border-primary"
                          }`}
                        >
                          {disp}
                        </button>
                      );
                    })}
                  </div>
                  {selectedDisposition === "Meeting Booked" && (
                    <div className="my-3 p-3 bg-background border border-border rounded-lg space-y-2">
                      <div className="text-xs font-bold text-foreground">Schedule Google Calendar Event</div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground uppercase font-bold">Event Title</label>
                        <input 
                          type="text" 
                          value={meetingSummary} 
                          onChange={e => setMeetingSummary(e.target.value)} 
                          className="w-full bg-muted/30 border border-border/50 rounded p-1.5 text-xs text-foreground focus:outline-none"
                          placeholder="e.g. Intro Call"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground uppercase font-bold">Prospect Email</label>
                        <input 
                          type="email" 
                          value={attendeeEmail} 
                          onChange={e => setAttendeeEmail(e.target.value)} 
                          className="w-full bg-muted/30 border border-border/50 rounded p-1.5 text-xs text-foreground focus:outline-none"
                          placeholder="prospect@company.com"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground uppercase font-bold">Date & Time</label>
                        <input 
                          type="datetime-local" 
                          value={meetingTime} 
                          onChange={e => setMeetingTime(e.target.value)} 
                          className="w-full bg-muted/30 border border-border/50 rounded p-1.5 text-xs text-foreground focus:outline-none"
                        />
                      </div>

                      <button 
                        onClick={handleScheduleMeeting} 
                        disabled={isScheduling}
                        className="w-full mt-2 py-1.5 bg-emerald-500 text-white font-bold text-xs rounded hover:bg-emerald-600 transition-colors disabled:opacity-50"
                      >
                        {isScheduling ? "Creating event..." : "Confirm & Send Calendar Invite"}
                      </button>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-muted-foreground">Call Notes</label>
                    <AIAssistButton 
                      format="text"
                      context="CRM Call Notes summarizer."
                      onGenerate={(text) => {
                        const ta = document.getElementById('dialer-notes') as HTMLTextAreaElement;
                        if(ta) ta.value = text;
                      }}
                      buttonLabel="AI Notes"
                    />
                  </div>
                  <textarea value={callNotes} onChange={e => setCallNotes(e.target.value)} id="dialer-notes" className="w-full bg-background border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none h-20" placeholder="Optional notes..."></textarea>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      {/* DNC Drawer */}
      {isDncOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-fade-in">
          <div className="w-full max-w-md bg-background border-l border-border h-full flex flex-col p-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <h3 className="text-lg font-bold text-foreground">Do Not Call (DNC) List</h3>
              <button onClick={() => setIsDncOpen(false)} className="text-muted-foreground hover:text-foreground font-bold">Close</button>
            </div>

            {/* Add to DNC Form */}
            <div className="space-y-4 mb-6 bg-muted/20 p-4 rounded-xl border border-border/50">
              <h4 className="text-sm font-bold text-foreground">Add Phone Number</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Phone number (e.g. +1234567890)"
                  value={dncNumberInput}
                  onChange={(e) => setDncNumberInput(e.target.value)}
                  className="w-full bg-background border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Reason (optional)"
                  value={dncReasonInput}
                  onChange={(e) => setDncReasonInput(e.target.value)}
                  className="w-full bg-background border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={handleAddDnc}
                  className="w-full py-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/95 transition-all shadow-sm"
                >
                  Add to DNC
                </button>
              </div>
            </div>

            {/* DNC List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Restricted Numbers</div>
              {dncList.length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center">No DNC numbers listed.</div>
              ) : (
                dncList.map((item: any) => (
                  <div key={item.id} className="p-3 bg-muted/10 border border-border/50 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-sm font-mono font-bold text-foreground">{item.phone}</div>
                      {item.reason && <div className="text-xs text-muted-foreground mt-0.5">{item.reason}</div>}
                    </div>
                    <button
                      onClick={() => handleRemoveDnc(item.id)}
                      className="text-xs text-red-500 hover:text-red-600 font-bold px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
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
