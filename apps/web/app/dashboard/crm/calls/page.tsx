import { useState } from "react"
import { Mic, Play, Pause, BarChart2, Zap, TrendingUp, FileText, CheckCircle2, Sparkles, BookOpen, RefreshCw, X, Send, Calendar, Users, PhoneCall, Phone, UserCheck, Clock, Plus, Volume2 } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { format } from "date-fns"

export default function CallIntelligenceDashboard() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [selectedStaffId, setSelectedStaffId] = useState<string>("ALL")

  const { data: dailyReportData, mutate: mutateDailyReport } = useApi<any>(`/crm/telephony/daily-report?date=${selectedDate}&userId=${selectedStaffId}`, { refreshInterval: 15000 })
  const { data: employeesData } = useApi<any>("/hr/employees")
  const { data: leadsData } = useApi<any>("/crm/leads")

  const dailyReport = dailyReportData || { totalCallsToday: 0, formattedTotalTalkTime: "0m 0s", summary: [], detailedLogs: [] }
  const employees = employeesData?.employees || []
  const leads = leadsData?.leads || []

  // Master list of system staff / telecallers
  const allStaffOptions = employees.map((emp: any) => {
    const uId = emp.userId || emp.id;
    const name = emp.user 
      ? `${emp.user.firstName || ''} ${emp.user.lastName || ''}`.trim() || emp.user.email 
      : (emp.firstName || emp.jobTitle || 'Employee');
    const email = emp.user?.email || '';
    const reportStat = dailyReport.summary?.find((s: any) => s.userId === uId);
    return {
      userId: uId,
      userName: name,
      email,
      jobTitle: emp.jobTitle || 'Staff',
      totalCalls: reportStat ? reportStat.totalCalls : 0,
      formattedTalkTime: reportStat ? reportStat.formattedTalkTime : "0m 0s",
      formattedAvgCallDuration: reportStat ? reportStat.formattedAvgCallDuration : "0m 0s",
      uniqueLeadsCount: reportStat ? reportStat.uniqueLeadsCount : 0,
      meetingsBooked: reportStat ? reportStat.meetingsBooked : 0,
    };
  });

  // Include any extra staff from daily report summary if not in HR employees
  dailyReport.summary?.forEach((st: any) => {
    if (!allStaffOptions.some((s: any) => s.userId === st.userId)) {
      allStaffOptions.push({
        userId: st.userId,
        userName: st.userName,
        email: st.email || '',
        jobTitle: 'Telecaller',
        totalCalls: st.totalCalls,
        formattedTalkTime: st.formattedTalkTime,
        formattedAvgCallDuration: st.formattedAvgCallDuration,
        uniqueLeadsCount: st.uniqueLeadsCount,
        meetingsBooked: st.meetingsBooked,
      });
    }
  });

  const activeStaffSummary = selectedStaffId === "ALL" 
    ? allStaffOptions 
    : allStaffOptions.filter((s: any) => s.userId === selectedStaffId)

  const activeLogs = selectedStaffId === "ALL"
    ? (dailyReport.detailedLogs || [])
    : (dailyReport.detailedLogs || []).filter((log: any) => log.userId === selectedStaffId)

  const displayTotalCalls = selectedStaffId === "ALL" 
    ? dailyReport.totalCallsToday 
    : (activeStaffSummary?.[0]?.totalCalls || 0)

  const displayTalkTime = selectedStaffId === "ALL" 
    ? (dailyReport.formattedTotalTalkTime || "0m 0s")
    : (activeStaffSummary?.[0]?.formattedTalkTime || "0m 0s")

  const displayAvgDuration = selectedStaffId === "ALL"
    ? (dailyReport.summary?.length > 0 
        ? dailyReport.summary[0]?.formattedAvgCallDuration || "0m 0s" 
        : "0m 0s")
    : (activeStaffSummary?.[0]?.formattedAvgCallDuration || "0m 0s")

  const displayMeetingsBooked = activeStaffSummary?.reduce((acc: number, curr: any) => acc + (curr.meetingsBooked || 0), 0) || 0

  // Log Call Activity Modal State
  const [isLogCallModalOpen, setIsLogCallModalOpen] = useState(false)
  const [isSubmittingCall, setIsSubmittingCall] = useState(false)
  const [logCallForm, setLogCallForm] = useState({
    leadId: "",
    userId: "ALL",
    durationSeconds: 120,
    disposition: "MEETING BOOKED",
    recordingUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    notes: "Client interested in demo next week. Call recorded for quality audit."
  })

  const [transcript, setTranscript] = useState(`Aisha (Sales): Hi Sarah, this is Aisha calling from Grekam. I saw Nexus Health just closed a Series B, huge congrats on that!
Sarah (Nexus Health): Oh, thank you! It's been a crazy few weeks here. Who did you say you were with again?
Aisha (Sales): Grekam. We're a creative and growth agency. I noticed you downloaded our SaaS Marketing whitepaper last week. I'm guessing with the new funding, you're looking to scale up your paid acquisition?
Sarah (Nexus Health): Yeah, exactly. Our Board wants us to double our demo volume by Q4. I actually was meaning to read that whitepaper but haven't gotten around to it. How exactly do you guys help with CPA?`)

  const [repName, setRepName] = useState("Aisha (Sales)")
  const [prospectName, setProspectName] = useState("Sarah (Nexus Health)")
  
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>({
    sentiment: "Highly Interested",
    callScore: 92,
    objectionsHandledCount: 2,
    totalObjectionsCount: 2,
    buyingSignals: [
      "Asked about CPA reduction strategy",
      "Confirmed recent funding round and Q4 demo volume goals",
      "Agreed to 15-minute discovery call next Tuesday"
    ],
    summary: "Sarah confirmed Nexus Health just raised a Series B and needs to double demo volume by Q4. She hasn't read the whitepaper yet but was highly engaged when Aisha explained our CPA reduction strategies. She agreed to a 15-minute discovery call next Tuesday.",
    suggestedCrmActions: [
      { type: "STATUS_UPDATE", text: "Lead Status updated from Cold to Meeting Booked" },
      { type: "TASK", text: "Send MedTech Pro case study via email before Tuesday." },
      { type: "EVENT", text: "Discovery Call on Tue, Jul 12 @ 2:00 PM." }
    ]
  })

  // Script Generator Modal State
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false)
  const [scriptForm, setScriptForm] = useState({
    productService: "Grekam OS & B2B Growth Agency",
    targetAudience: "SaaS & Healthcare Founders",
    tone: "Consultative & Authoritative"
  })
  const [isGeneratingScript, setIsGeneratingScript] = useState(false)
  const [activeScript, setActiveScript] = useState<any>(null)

  const handleLogCallActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!logCallForm.leadId) return toast.error("Please select a lead")
    setIsSubmittingCall(true)
    try {
      const res = await fetchApi("/crm/telephony/recordings", {
        method: "POST",
        body: JSON.stringify({
          leadId: logCallForm.leadId,
          userId: logCallForm.userId !== "ALL" ? logCallForm.userId : undefined,
          durationSeconds: Number(logCallForm.durationSeconds),
          disposition: logCallForm.disposition,
          recordingUrl: logCallForm.recordingUrl,
          notes: logCallForm.notes
        })
      })
      if (res?.data || res?.success) {
        toast.success("Call activity & recording logged successfully!")
        setIsLogCallModalOpen(false)
        mutateDailyReport()
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to log call activity")
    } finally {
      setIsSubmittingCall(false)
    }
  }

  const handleAnalyzeCall = async () => {
    if (!transcript.trim()) return toast.error("Please enter a call transcript")
    setIsAnalyzing(true)
    try {
      const res = await fetchApi("/crm/ai/analyze-call", {
        method: "POST",
        body: JSON.stringify({ transcript, prospectName, repName })
      })
      if (res?.data) {
        setAnalysisResult(res.data)
        toast.success("AI Call Intelligence audit completed!")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze call")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateScript = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGeneratingScript(true)
    try {
      const res = await fetchApi("/crm/ai/generate-call-script", {
        method: "POST",
        body: JSON.stringify(scriptForm)
      })
      if (res?.data) {
        setActiveScript(res.data)
        toast.success("AI Call Script generated successfully!")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate call script")
    } finally {
      setIsGeneratingScript(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Mic className="w-6 h-6 text-primary" /> Call Intelligence & AI Scripts
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Live Gemini AI transcripts audit, sentiment scoring, and dynamic sales script builder.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (leads.length > 0 && !logCallForm.leadId) {
                  setLogCallForm(prev => ({ ...prev, leadId: leads[0].id }))
                }
                setIsLogCallModalOpen(true)
              }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md"
            >
              <Plus className="w-4 h-4" /> Log Call & Recording
            </button>
            <button
              onClick={() => setIsScriptModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-md"
            >
              <BookOpen className="w-4 h-4" /> AI Script Generator
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* TELECALLER DAILY CALL PERFORMANCE MONITOR */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-emerald-500" /> Telecaller Daily Call Performance Monitor
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Real-time daily call volume, total spoken talk time, and disposition metrics per telecaller.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Staff Selector Dropdown */}
              <div className="flex items-center gap-2 bg-muted/30 border border-border/50 px-3 py-1.5 rounded-xl">
                <Users className="w-4 h-4 text-primary" />
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="bg-transparent text-xs text-foreground font-bold focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Telecallers & Staff ({allStaffOptions.length})</option>
                  {allStaffOptions.map((st: any) => (
                    <option key={st.userId} value={st.userId}>
                      {st.userName} ({st.totalCalls} calls)
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Picker */}
              <div className="flex items-center gap-2 bg-muted/30 border border-border/50 px-3 py-1.5 rounded-xl">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs text-foreground font-mono focus:outline-none"
                />
              </div>

              <button
                onClick={() => mutateDailyReport()}
                className="p-2 rounded-xl bg-muted/40 hover:bg-muted/70 text-foreground transition-colors border border-border/50"
                title="Refresh Report"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Key Call Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-muted/20 border border-border/40 p-4 rounded-xl">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">Total Calls Spoken</span>
              <div className="text-2xl font-bold text-foreground mt-1">{displayTotalCalls}</div>
            </div>
            <div className="bg-muted/20 border border-border/40 p-4 rounded-xl">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">Total Spoken Talk Time</span>
              <div className="text-2xl font-bold text-primary mt-1">{displayTalkTime}</div>
            </div>
            <div className="bg-muted/20 border border-border/40 p-4 rounded-xl">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">Avg Call Duration</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{displayAvgDuration}</div>
            </div>
            <div className="bg-muted/20 border border-border/40 p-4 rounded-xl">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">Meetings Booked</span>
              <div className="text-2xl font-bold text-amber-500 mt-1">{displayMeetingsBooked}</div>
            </div>
          </div>

          {/* Telecaller Summary Breakdown Table */}
          <div className="border border-border/50 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-mono uppercase text-[10px] border-b border-border/50">
                <tr>
                  <th className="px-4 py-3">Staff / Telecaller Name</th>
                  <th className="px-4 py-3 text-center">Total Calls Spoken</th>
                  <th className="px-4 py-3 text-center">Spoken Talk Time</th>
                  <th className="px-4 py-3 text-center">Avg Call Duration</th>
                  <th className="px-4 py-3 text-center">Unique Leads</th>
                  <th className="px-4 py-3 text-center">Meetings Booked</th>
                  <th className="px-4 py-3 text-right">Conversion %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {(!activeStaffSummary || activeStaffSummary.length === 0) ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No staff members found. Add staff in HR or log call activities to record calls.
                    </td>
                  </tr>
                ) : (
                  activeStaffSummary.map((st: any) => {
                    const convRate = st.totalCalls > 0 ? Math.round((st.meetingsBooked / st.totalCalls) * 100) : 0;
                    return (
                      <tr 
                        key={st.userId} 
                        onClick={() => setSelectedStaffId(st.userId)}
                        className={`transition-colors cursor-pointer ${selectedStaffId === st.userId ? 'bg-primary/10' : 'hover:bg-muted/20'}`}
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          <div className="font-bold flex items-center gap-2">
                            <UserCheck className="w-3.5 h-3.5 text-primary" /> {st.userName}
                          </div>
                          <div className="text-[10px] text-muted-foreground">{st.email || st.jobTitle}</div>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-foreground">{st.totalCalls}</td>
                        <td className="px-4 py-3 text-center font-bold text-primary font-mono">{st.formattedTalkTime}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground font-mono">{st.formattedAvgCallDuration}</td>
                        <td className="px-4 py-3 text-center font-mono">{st.uniqueLeadsCount}</td>
                        <td className="px-4 py-3 text-center font-bold text-emerald-500">{st.meetingsBooked}</td>
                        <td className="px-4 py-3 text-right font-bold text-primary">{convRate}%</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Detailed Call Logs for Selected Staff */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold font-mono uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> 
                Detailed Call Log & Recording History {selectedStaffId !== "ALL" ? `for ${activeStaffSummary?.[0]?.userName || "Selected Telecaller"}` : ""}
              </h4>
              <span className="text-[10px] text-muted-foreground font-mono">Total {activeLogs.length} Records</span>
            </div>

            <div className="border border-border/40 rounded-xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-muted/30 text-muted-foreground font-mono uppercase text-[9px] sticky top-0 bg-card border-b border-border/40">
                  <tr>
                    <th className="px-3 py-2">Time</th>
                    <th className="px-3 py-2">Telecaller</th>
                    <th className="px-3 py-2">Lead Name / Phone</th>
                    <th className="px-3 py-2">Call Disposition / Notes</th>
                    <th className="px-3 py-2 text-center">Audio Recording</th>
                    <th className="px-3 py-2 text-right">Spoken Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {activeLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground italic">
                        No call recordings found for this selection. Click &quot;Log Call &amp; Recording&quot; to log a call recording.
                      </td>
                    </tr>
                  ) : (
                    activeLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-muted/10">
                        <td className="px-3 py-2 font-mono text-muted-foreground">
                          {format(new Date(log.timestamp), "hh:mm a")}
                        </td>
                        <td className="px-3 py-2 font-bold text-foreground">{log.telecallerName}</td>
                        <td className="px-3 py-2">
                          <div className="font-medium text-foreground">{log.leadName}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{log.leadPhone}</div>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground truncate max-w-xs">{log.content}</td>
                        <td className="px-3 py-2 text-center">
                          {log.recordingUrl ? (
                            <audio controls src={log.recordingUrl} className="h-7 w-48 mx-auto" />
                          ) : (
                            <span className="text-[10px] text-muted-foreground/60 italic flex items-center justify-center gap-1">
                              <Volume2 className="w-3 h-3 text-muted-foreground" /> No audio file
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-emerald-400">{log.formattedDuration}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Left Col: Live Call Transcript & Audit */}
        <div className="flex-1 space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[650px]">
            {/* Control Strip */}
            <div className="p-4 border-b border-border/50 bg-muted/20 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={repName}
                  onChange={(e) => setRepName(e.target.value)}
                  placeholder="Sales Rep Name"
                  className="bg-background border border-border/50 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none"
                />
                <span className="text-xs text-muted-foreground">speaking with</span>
                <input
                  type="text"
                  value={prospectName}
                  onChange={(e) => setProspectName(e.target.value)}
                  placeholder="Prospect Name"
                  className="bg-background border border-border/50 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <button
                onClick={handleAnalyzeCall}
                disabled={isAnalyzing}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
              >
                {isAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {isAnalyzing ? "Auditing with Gemini..." : "Run AI Audit"}
              </button>
            </div>

            {/* Transcript Textarea / Display */}
            <div className="flex-1 p-6 flex flex-col space-y-4">
              <label className="text-xs font-mono font-bold uppercase text-muted-foreground tracking-wider flex items-center justify-between">
                <span>Call Transcript Log</span>
                <span className="text-[10px] text-primary">Editable / Paste Raw Call Log</span>
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste or type call transcript here..."
                className="flex-1 bg-muted/20 border border-border/50 rounded-xl p-4 text-sm font-mono leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none custom-scrollbar"
              />
            </div>
          </div>
        </div>

        {/* Right Col: AI Insights */}
        <div className="w-full xl:w-[420px] flex-none space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl shadow-sm h-[650px] flex flex-col relative overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-primary/10 to-blue-500/10 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Gemini AI Call Audit</h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                Score: {analysisResult.callScore || 90}/100
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              
              {/* Sentiment & Score */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 border border-border/50 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Sentiment</div>
                  <div className="text-emerald-500 font-bold flex items-center gap-1.5 text-xs">
                    <TrendingUp className="w-3.5 h-3.5" /> {analysisResult.sentiment || "Interested"}
                  </div>
                </div>
                <div className="bg-muted/30 border border-border/50 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Objections</div>
                  <div className="text-foreground font-bold flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {analysisResult.objectionsHandledCount || 2} / {analysisResult.totalObjectionsCount || 2} Handled
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Executive Summary</div>
                <div className="text-sm text-foreground/80 leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/50">
                  {analysisResult.summary}
                </div>
              </div>

              {/* Buying Signals */}
              {analysisResult.buyingSignals?.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Key Buying Signals Detected</div>
                  <ul className="space-y-1.5">
                    {analysisResult.buyingSignals.map((sig: string, idx: number) => (
                      <li key={idx} className="text-xs text-foreground/90 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        {sig}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CRM Injection */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Auto-CRM Logging Actions
                </div>
                
                <div className="space-y-2.5">
                  {analysisResult.suggestedCrmActions?.map((act: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{act.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Log Call Activity & Audio Recording Modal */}
      {isLogCallModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-card border border-border/50 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/20">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-lg text-foreground">Log Call Activity &amp; Recording</h3>
              </div>
              <button onClick={() => setIsLogCallModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-destructive/20 hover:text-destructive transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogCallActivity} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Select Staff / Telecaller</label>
                  <select
                    value={logCallForm.userId}
                    onChange={(e) => setLogCallForm({ ...logCallForm, userId: e.target.value })}
                    className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer font-medium"
                  >
                    <option value="ALL">Current Logged-in User</option>
                    {allStaffOptions.map((st: any) => (
                      <option key={st.userId} value={st.userId}>
                        {st.userName} ({st.email || st.jobTitle})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Select Lead *</label>
                  <select
                    value={logCallForm.leadId}
                    onChange={(e) => setLogCallForm({ ...logCallForm, leadId: e.target.value })}
                    className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer font-medium"
                    required
                  >
                    {leads.length === 0 ? (
                      <option value="">No leads found in CRM</option>
                    ) : (
                      leads.map((l: any) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l.phone || l.company || l.status})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Spoken Talk Time (Seconds)</label>
                  <input
                    type="number"
                    value={logCallForm.durationSeconds}
                    onChange={(e) => setLogCallForm({ ...logCallForm, durationSeconds: Math.max(0, parseInt(e.target.value) || 0) })}
                    placeholder="e.g. 180"
                    className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Call Disposition</label>
                  <select
                    value={logCallForm.disposition}
                    onChange={(e) => setLogCallForm({ ...logCallForm, disposition: e.target.value })}
                    className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer font-medium"
                  >
                    <option value="MEETING BOOKED">Meeting Booked</option>
                    <option value="CONTACTED">Contacted / Interested</option>
                    <option value="CALL BACK">Call Back Requested</option>
                    <option value="NOT INTERESTED">Not Interested</option>
                    <option value="VOICEMAIL">Voicemail / No Answer</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Audio Recording File URL</label>
                  <button
                    type="button"
                    onClick={() => setLogCallForm({ ...logCallForm, recordingUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" })}
                    className="text-[10px] text-emerald-400 hover:underline font-mono"
                  >
                    + Use Demo Audio URL
                  </button>
                </div>
                <input
                  type="url"
                  value={logCallForm.recordingUrl}
                  onChange={(e) => setLogCallForm({ ...logCallForm, recordingUrl: e.target.value })}
                  placeholder="https://your-server.com/recordings/call_123.mp3"
                  className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Call Summary &amp; Transcript Notes</label>
                <textarea
                  value={logCallForm.notes}
                  onChange={(e) => setLogCallForm({ ...logCallForm, notes: e.target.value })}
                  placeholder="Enter key talking points, prospect objection, or call transcript..."
                  className="w-full bg-background border border-border/60 rounded-xl p-3 text-xs text-foreground font-mono focus:outline-none focus:border-primary resize-none h-24 custom-scrollbar"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingCall}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isSubmittingCall ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                  {isSubmittingCall ? "Saving Call Activity..." : "Save Call Activity & Recording"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Script Generator Modal */}
      {isScriptModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-card border border-border/50 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <h3 className="font-bold text-lg text-foreground">AI Sales Script Generator</h3>
              </div>
              <button onClick={() => setIsScriptModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-destructive/20 hover:text-destructive transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleGenerateScript} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Product / Service</label>
                  <input
                    type="text"
                    value={scriptForm.productService}
                    onChange={(e) => setScriptForm({ ...scriptForm, productService: e.target.value })}
                    className="w-full mt-1 bg-background border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Target Audience</label>
                  <input
                    type="text"
                    value={scriptForm.targetAudience}
                    onChange={(e) => setScriptForm({ ...scriptForm, targetAudience: e.target.value })}
                    className="w-full mt-1 bg-background border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Tone</label>
                  <input
                    type="text"
                    value={scriptForm.tone}
                    onChange={(e) => setScriptForm({ ...scriptForm, tone: e.target.value })}
                    className="w-full mt-1 bg-background border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="md:col-span-3">
                  <button
                    type="submit"
                    disabled={isGeneratingScript}
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGeneratingScript ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isGeneratingScript ? "Building Custom Script..." : "Generate AI Sales Script"}
                  </button>
                </div>
              </form>

              {activeScript && (
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <h4 className="font-bold text-foreground text-sm flex items-center gap-2 text-violet-400">
                    <BookOpen className="w-4 h-4" /> {activeScript.title}
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-muted/30 border border-border/50 rounded-xl">
                      <span className="font-bold text-primary block mb-1">1. Opening Hook (First 15s)</span>
                      <p className="text-foreground/80">{activeScript.openingHook}</p>
                    </div>

                    <div className="p-3 bg-muted/30 border border-border/50 rounded-xl">
                      <span className="font-bold text-primary block mb-1">2. Value Proposition</span>
                      <p className="text-foreground/80">{activeScript.valueProposition}</p>
                    </div>

                    <div className="p-3 bg-muted/30 border border-border/50 rounded-xl">
                      <span className="font-bold text-primary block mb-1">3. Key Discovery Questions</span>
                      <ul className="list-disc pl-4 space-y-1 text-foreground/80">
                        {activeScript.qualifyingQuestions?.map((q: string, idx: number) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>

                    {activeScript.commonObjections?.length > 0 && (
                      <div className="p-3 bg-muted/30 border border-border/50 rounded-xl">
                        <span className="font-bold text-primary block mb-2">4. Objection Handling</span>
                        <div className="space-y-2">
                          {activeScript.commonObjections.map((obj: any, idx: number) => (
                            <div key={idx} className="bg-background/60 p-2 rounded border border-border/40">
                              <span className="text-destructive font-bold">Objection: </span>&ldquo;{obj.objection}&rdquo;
                              <br />
                              <span className="text-emerald-400 font-bold">Rebuttal: </span>{obj.rebuttal}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <span className="font-bold text-emerald-400 block mb-1">5. Closing CTA</span>
                      <p className="text-foreground">{activeScript.closingCta}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
