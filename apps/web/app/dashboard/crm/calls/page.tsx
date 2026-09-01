"use client"

import { useState } from "react"
import { Mic, Play, Pause, BarChart2, Zap, TrendingUp, FileText, CheckCircle2, Sparkles, BookOpen, RefreshCw, X, Send } from "lucide-react"
import { fetchApi } from "@/lib/useApi"
import { toast } from "sonner"

export default function CallIntelligenceDashboard() {
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
              onClick={() => setIsScriptModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-md"
            >
              <BookOpen className="w-4 h-4" /> AI Script Generator
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col xl:flex-row gap-6">
        
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
  )
}
