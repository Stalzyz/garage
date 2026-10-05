"use client"

import { useState, useEffect } from "react"
import { 
  Smartphone, 
  Phone, 
  Mic, 
  RefreshCw, 
  Check, 
  Copy, 
  ExternalLink, 
  X, 
  Download, 
  Play, 
  CheckCircle2, 
  Radio, 
  Settings2, 
  ArrowRight, 
  Clock, 
  Sparkles,
  ShieldCheck,
  HelpCircle,
  FileAudio
} from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface AndroidSyncModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AndroidSyncModal({ isOpen, onClose }: AndroidSyncModalProps) {
  const [activeTab, setActiveTab] = useState<"setup" | "live_feed" | "test">("setup")
  const [selectedBrand, setSelectedBrand] = useState<"samsung" | "xiaomi" | "vivo" | "oppo" | "generic">("samsung")
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [isLoadingRecent, setIsLoadingRecent] = useState(false)
  const [recentRecordings, setRecentRecordings] = useState<any[]>([])
  
  // Test Sync State
  const [testPhone, setTestPhone] = useState("+919876543210")
  const [testCaller, setTestCaller] = useState("Staff Telecaller")
  const [testDuration, setTestDuration] = useState("65")
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const WEBHOOK_URL = "https://grekam.in/api/v1/crm/public/telephony/sync"

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(WEBHOOK_URL)
    setCopiedUrl(true)
    toast.success("Webhook URL copied to clipboard!")
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const fetchRecent = async () => {
    setIsLoadingRecent(true)
    try {
      const res = await fetch("https://grekam.in/api/v1/crm/public/telephony/recent?limit=25")
      const data = await res.json()
      if (data.recordings) {
        setRecentRecordings(data.recordings)
      }
    } catch (err: any) {
      toast.error("Failed to load synced recordings")
    } finally {
      setIsLoadingRecent(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchRecent()
    }
  }, [isOpen])

  const handleRunTest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsTesting(true)
    setTestResult(null)
    try {
      const res = await fetch("https://grekam.in/api/v1/crm/public/telephony/test-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: testPhone,
          caller: testCaller,
          duration: parseInt(testDuration, 10) || 60,
        })
      })
      const data = await res.json()
      if (data.success) {
        setTestResult(data)
        toast.success(`Test call synced successfully! Linked to lead: ${data.leadName}`)
        fetchRecent()
      } else {
        toast.error(data.message || "Test sync failed")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger test sync")
    } finally {
      setIsTesting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 md:p-6 animate-in fade-in duration-200">
      <div className="bg-card border border-border/60 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-inner">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-foreground">Android Native Call Sync Hub</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ₹0 / Free Native
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automatically records via Android phone dialer & syncs audio to CRM lead timeline in real time.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/60 hover:bg-destructive/20 hover:text-destructive transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-border/50 px-6 bg-muted/10 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("setup")}
              className={`py-3 px-3 border-b-2 font-medium flex items-center gap-2 transition-all ${
                activeTab === "setup" 
                  ? "border-primary text-primary font-bold" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Settings2 className="w-4 h-4" /> 1. Phone & Macro Setup
            </button>
            <button
              onClick={() => { setActiveTab("live_feed"); fetchRecent(); }}
              className={`py-3 px-3 border-b-2 font-medium flex items-center gap-2 transition-all ${
                activeTab === "live_feed" 
                  ? "border-primary text-primary font-bold" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-400" /> 2. Live Synced Audio Stream ({recentRecordings.length})
            </button>
            <button
              onClick={() => setActiveTab("test")}
              className={`py-3 px-3 border-b-2 font-medium flex items-center gap-2 transition-all ${
                activeTab === "test" 
                  ? "border-primary text-primary font-bold" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> 3. Test Pipeline
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Endpoint Live
          </div>
        </div>

        {/* Tab 1: Setup */}
        {activeTab === "setup" && (
          <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs">
            {/* Quick Webhook Endpoint Banner */}
            <div className="bg-muted/30 border border-border/60 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-2 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cloud Sync Webhook URL (Public & Protected)
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  HTTP POST (Multipart)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={WEBHOOK_URL} 
                  className="flex-1 bg-background border border-border/80 rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none select-all"
                />
                <button
                  onClick={handleCopyWebhook}
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-all shadow-sm shrink-0"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedUrl ? "Copied!" : "Copy Webhook"}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Your mobile companion app or MacroDroid rule sends call events and audio files directly to this endpoint. No browser cookies required.
              </p>
            </div>

            {/* Step 1: Turn on Auto Call Recording on Phone */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</span>
                  Enable Native Auto Call Recording on Device
                </h4>
                <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/50">
                  <button
                    onClick={() => setSelectedBrand("samsung")}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${selectedBrand === "samsung" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Samsung
                  </button>
                  <button
                    onClick={() => setSelectedBrand("xiaomi")}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${selectedBrand === "xiaomi" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Xiaomi / Redmi
                  </button>
                  <button
                    onClick={() => setSelectedBrand("vivo")}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${selectedBrand === "vivo" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Vivo / iQOO
                  </button>
                  <button
                    onClick={() => setSelectedBrand("oppo")}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${selectedBrand === "oppo" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Oppo / Realme
                  </button>
                </div>
              </div>

              <div className="bg-card border border-border/60 rounded-xl p-4 space-y-3">
                {selectedBrand === "samsung" && (
                  <div className="space-y-2 text-foreground/90">
                    <p className="font-medium text-emerald-400">Samsung Galaxy One UI Instructions:</p>
                    <ol className="list-decimal pl-5 space-y-1.5 text-muted-foreground">
                      <li>Open the default <strong className="text-foreground">Phone</strong> app on your Samsung phone.</li>
                      <li>Tap the <strong className="text-foreground">3 dots (⋮)</strong> in the top-right corner → select <strong className="text-foreground">Settings</strong>.</li>
                      <li>Tap <strong className="text-foreground">Record calls</strong> → toggle <strong className="text-emerald-400">Auto record calls = ON</strong> (choose &ldquo;All calls&rdquo;).</li>
                      <li>Audio recordings are saved automatically in: <code className="bg-muted px-2 py-0.5 rounded text-foreground font-mono">/Recordings/Call/</code> (.m4a format).</li>
                    </ol>
                  </div>
                )}

                {selectedBrand === "xiaomi" && (
                  <div className="space-y-2 text-foreground/90">
                    <p className="font-medium text-emerald-400">Xiaomi / Redmi / Poco (MIUI &amp; HyperOS) Instructions:</p>
                    <ol className="list-decimal pl-5 space-y-1.5 text-muted-foreground">
                      <li>Open the default <strong className="text-foreground">Phone</strong> dialer app.</li>
                      <li>Tap the <strong className="text-foreground">Gear icon (Settings)</strong> → tap <strong className="text-foreground">Call recording</strong>.</li>
                      <li>Turn on <strong className="text-emerald-400">Record calls automatically</strong> (Select &ldquo;All numbers&rdquo;).</li>
                      <li>Recordings save to: <code className="bg-muted px-2 py-0.5 rounded text-foreground font-mono">/MIUI/sound_recorder/call_rec/</code> (.mp3 format).</li>
                    </ol>
                  </div>
                )}

                {selectedBrand === "vivo" && (
                  <div className="space-y-2 text-foreground/90">
                    <p className="font-medium text-emerald-400">Vivo / iQOO (Funtouch OS) Instructions:</p>
                    <ol className="list-decimal pl-5 space-y-1.5 text-muted-foreground">
                      <li>Open Phone Settings → tap <strong className="text-foreground">Phone (or System app settings)</strong>.</li>
                      <li>Select <strong className="text-foreground">Record settings</strong>.</li>
                      <li>Choose <strong className="text-emerald-400">Record all calls automatically</strong>.</li>
                      <li>Recordings save to: <code className="bg-muted px-2 py-0.5 rounded text-foreground font-mono">/Record/Call/</code> or <code className="bg-muted px-2 py-0.5 rounded text-foreground font-mono">/Recordings/</code>.</li>
                    </ol>
                  </div>
                )}

                {selectedBrand === "oppo" && (
                  <div className="space-y-2 text-foreground/90">
                    <p className="font-medium text-emerald-400">Oppo / Realme / OnePlus (ColorOS / Realme UI) Instructions:</p>
                    <ol className="list-decimal pl-5 space-y-1.5 text-muted-foreground">
                      <li>Open the <strong className="text-foreground">Phone</strong> app → tap 3 dots → <strong className="text-foreground">Settings</strong>.</li>
                      <li>Tap <strong className="text-foreground">Call recording</strong>.</li>
                      <li>Turn on <strong className="text-emerald-400">Record all calls</strong>.</li>
                      <li>Recordings save to: <code className="bg-muted px-2 py-0.5 rounded text-foreground font-mono">/Recordings/Call/</code> (.m4a format).</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Auto-Upload via MacroDroid */}
            <div className="space-y-3">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</span>
                Automate Instant Upload via MacroDroid (2-Minute Setup)
              </h4>

              <div className="bg-card border border-border/60 rounded-xl p-4 space-y-4">
                <p className="text-muted-foreground">
                  Install <strong className="text-foreground">MacroDroid</strong> from Google Play Store (free). Create a macro with the following trigger and actions:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                  <div className="p-3 bg-muted/20 border border-border/50 rounded-lg space-y-1">
                    <span className="text-amber-400 font-bold block uppercase text-[10px]">Trigger</span>
                    <p className="text-foreground">Call Ended</p>
                    <span className="text-[10px] text-muted-foreground block">(Any incoming or outgoing call)</span>
                  </div>

                  <div className="p-3 bg-muted/20 border border-border/50 rounded-lg space-y-1">
                    <span className="text-emerald-400 font-bold block uppercase text-[10px]">Action 1 (File)</span>
                    <p className="text-foreground">File Operation → Get Newest File</p>
                    <span className="text-[10px] text-muted-foreground block">From your phone&apos;s recording directory</span>
                  </div>

                  <div className="md:col-span-2 p-3 bg-muted/20 border border-border/50 rounded-lg space-y-2">
                    <span className="text-primary font-bold block uppercase text-[10px]">Action 2 (HTTP Upload)</span>
                    <p className="text-foreground">HTTP Request: <strong className="text-emerald-400">POST</strong> to <code className="text-primary">{WEBHOOK_URL}</code></p>
                    <div className="text-[10px] text-muted-foreground grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 border-t border-border/40">
                      <div><strong className="text-foreground">audio:</strong> [latest_file]</div>
                      <div><strong className="text-foreground">phone:</strong> [call_number]</div>
                      <div><strong className="text-foreground">duration:</strong> [call_duration]</div>
                      <div><strong className="text-foreground">callType:</strong> [call_type]</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="font-bold text-emerald-400 text-xs">Failproof Guarantee:</span>
                    <p className="text-[11px] text-muted-foreground">
                      If the lead doesn&apos;t exist yet in Grekam OS, the system automatically creates a new lead and links the audio. No call is ever lost.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const sampleConfig = JSON.stringify({
                        name: "Grekam OS Call Sync",
                        trigger: "Call Ended",
                        url: WEBHOOK_URL,
                        parameters: {
                          audio: "FILE_UPLOAD",
                          phone: "[call_number]",
                          duration: "[call_duration]",
                          callType: "[call_type]",
                          callerPhone: "[sim_number]"
                        }
                      }, null, 2);
                      const blob = new Blob([sampleConfig], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "grekam_call_sync_macro.json";
                      a.click();
                      toast.success("MacroDroid config template downloaded!");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shrink-0 transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Config Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Live Feed */}
        {activeTab === "live_feed" && (
          <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" /> Synced Call Recordings
                </h4>
                <p className="text-muted-foreground text-[11px]">
                  Recent calls synced from telecaller mobile devices. Click play to listen.
                </p>
              </div>
              <button
                onClick={fetchRecent}
                disabled={isLoadingRecent}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium text-xs transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRecent ? "animate-spin text-primary" : ""}`} />
                Refresh
              </button>
            </div>

            {recentRecordings.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border/60 rounded-xl space-y-2">
                <FileAudio className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="font-bold text-foreground">No synced recordings found yet</p>
                <p className="text-muted-foreground text-[11px]">
                  Send a call via MacroDroid or use the &ldquo;Test Pipeline&rdquo; tab to simulate an upload.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentRecordings.map((rec) => (
                  <div key={rec.id} className="bg-card border border-border/50 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-border transition-all">
                    <div className="space-y-1 min-w-[180px]">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          rec.direction === "INCOMING" 
                            ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" 
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {rec.direction}
                        </span>
                        <span className="font-bold text-foreground">{rec.leadName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                        <span className="font-mono">{rec.leadPhone}</span>
                        <span>•</span>
                        <span>{rec.formattedDuration}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(rec.timestamp), { addSuffix: true })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-1 max-w-md">
                      {rec.recordingUrl ? (
                        <div className="flex items-center gap-2 w-full">
                          <audio controls src={rec.recordingUrl} className="h-7 w-full max-w-xs" preload="none" />
                          <a 
                            href={rec.recordingUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            title="Open/Download audio"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 italic text-[11px]">No audio file attached</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Test Pipeline */}
        {activeTab === "test" && (
          <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs">
            <div className="bg-muted/20 border border-border/60 rounded-xl p-4 space-y-4">
              <div>
                <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> 1-Click Verification Test
                </h4>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Simulate a completed phone call from an Android telecaller to verify end-to-end webhook ingestion, lead matching, activity logging, and audio playback.
                </p>
              </div>

              <form onSubmit={handleRunTest} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Prospect Phone Number</label>
                  <input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="w-full mt-1 bg-background border border-border/80 rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Telecaller / Agent Name</label>
                  <input
                    type="text"
                    value={testCaller}
                    onChange={(e) => setTestCaller(e.target.value)}
                    className="w-full mt-1 bg-background border border-border/80 rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Call Duration (Seconds)</label>
                  <input
                    type="number"
                    value={testDuration}
                    onChange={(e) => setTestDuration(e.target.value)}
                    className="w-full mt-1 bg-background border border-border/80 rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="md:col-span-3 pt-1">
                  <button
                    type="submit"
                    disabled={isTesting}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    {isTesting ? "Executing Pipeline Test..." : "Run Live Test Simulation"}
                  </button>
                </div>
              </form>

              {testResult && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" /> Pipeline Test Passed Successfully!
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px] text-foreground">
                    <div className="bg-background/80 p-2 rounded border border-border/40">
                      <span className="text-[9px] text-muted-foreground uppercase block font-sans">Lead Name</span>
                      {testResult.leadName}
                    </div>
                    <div className="bg-background/80 p-2 rounded border border-border/40">
                      <span className="text-[9px] text-muted-foreground uppercase block font-sans">Lead Phone</span>
                      {testResult.leadPhone}
                    </div>
                    <div className="bg-background/80 p-2 rounded border border-border/40">
                      <span className="text-[9px] text-muted-foreground uppercase block font-sans">Auto-Created</span>
                      {testResult.autoCreatedLead ? "Yes (New Lead)" : "Matched Existing"}
                    </div>
                    <div className="bg-background/80 p-2 rounded border border-border/40">
                      <span className="text-[9px] text-muted-foreground uppercase block font-sans">Activity ID</span>
                      <span className="truncate block">{testResult.activityId}</span>
                    </div>
                  </div>
                  {testResult.recordingUrl && (
                    <div className="pt-2 flex items-center gap-3">
                      <span className="text-xs font-bold text-foreground">Test Audio Playback:</span>
                      <audio controls src={testResult.recordingUrl} className="h-7 w-64" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-border/50 bg-muted/10 flex items-center justify-between text-xs text-muted-foreground">
          <span>Failproof architecture: 0% data loss, automatic fuzzy phone matching, and real-time audio playback.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
