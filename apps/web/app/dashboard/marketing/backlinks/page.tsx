"use client"

import { useState } from "react"
import { Link2, Sparkles, CheckCircle2, Copy, Check, ExternalLink, Globe, FileText, Send, Award, ArrowUpRight, ShieldCheck, Zap, Layers, RefreshCw, ChevronRight } from "lucide-react"
import { toast } from "sonner"

interface BacklinkDirectory {
  id: string
  name: string
  dr: number
  category: string
  type: "Dofollow" | "Nofollow" | "Editorial"
  status: "Ready" | "Submitted" | "Verified"
  url: string
}

const HIGH_DR_DIRECTORIES: BacklinkDirectory[] = [
  { id: "crunchbase", name: "Crunchbase Profile", dr: 91, category: "Tech & Corporate", type: "Dofollow", status: "Verified", url: "https://crunchbase.com" },
  { id: "producthunt", name: "Product Hunt Showcase", dr: 90, category: "Product Launch", type: "Dofollow", status: "Verified", url: "https://producthunt.com" },
  { id: "trustpilot", name: "Trustpilot Company Page", dr: 93, category: "Reviews & Authority", type: "Dofollow", status: "Verified", url: "https://trustpilot.com" },
  { id: "medium", name: "Medium Canonical Syndication", dr: 95, category: "Content Marketing", type: "Dofollow", status: "Ready", url: "https://medium.com" },
  { id: "substack", name: "Substack Newsletter Link", dr: 89, category: "Publication", type: "Dofollow", status: "Ready", url: "https://substack.com" },
  { id: "saashub", name: "SaaSHub Directory", dr: 78, category: "Software & Services", type: "Dofollow", status: "Ready", url: "https://saashub.com" },
  { id: "alternativeto", name: "AlternativeTo Listing", dr: 84, category: "Tech Alternatives", type: "Dofollow", status: "Ready", url: "https://alternativeto.net" },
  { id: "clutch", name: "Clutch Agency Profile", dr: 87, category: "B2B Services", type: "Dofollow", status: "Ready", url: "https://clutch.co" },
  { id: "g2", name: "G2 Business Profile", dr: 91, category: "Software & Design", type: "Dofollow", status: "Ready", url: "https://g2.com" },
]

export default function AIBacklinksDashboard() {
  const [activeTab, setActiveTab] = useState<"directory" | "pitch" | "widget" | "outreach">("directory")
  
  // AI Pitch State
  const [queryTopic, setQueryTopic] = useState("")
  const [targetKeyword, setTargetKeyword] = useState("")
  const [generatedPitch, setGeneratedPitch] = useState("")
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false)
  const [copiedPitch, setCopiedPitch] = useState(false)

  // Badge Widget State
  const [badgeStyle, setBadgeStyle] = useState<"dark" | "glass" | "minimal">("glass")
  const [copiedBadge, setCopiedBadge] = useState(false)

  // Outreach Email State
  const [competitorUrl, setCompetitorUrl] = useState("")
  const [outreachEmail, setOutreachEmail] = useState("")
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)

  const handleGeneratePitch = () => {
    if (!queryTopic) {
      toast.error("Please enter a journalist query or topic")
      return
    }
    setIsGeneratingPitch(true)
    setTimeout(() => {
      const pitch = `Hi there,

Regarding your query on "${queryTopic}":

"In modern digital product architecture, speed and brand authority directly dictate conversion rates. When engineering high-performance web platforms, sub-800ms page transitions and bespoke UI design build immediate trust that standard templates simply cannot match."

— Lead Architect, Grekam Visuals (${targetKeyword ? `https://grekam.in?ref=${encodeURIComponent(targetKeyword)}` : 'https://grekam.in'})

Bio: Grekam Visuals engineers bespoke digital experiences, high-converting e-commerce engines, and automated AI workflows for scaling brands.`
      setGeneratedPitch(pitch)
      setIsGeneratingPitch(false)
      toast.success("AI Journalist Pitch generated!")
    }, 1200)
  }

  const handleGenerateEmail = () => {
    if (!competitorUrl) {
      toast.error("Please enter a target blog or competitor article URL")
      return
    }
    setIsGeneratingEmail(true)
    setTimeout(() => {
      const email = `Subject: Broken Resource / Content Suggestion for ${competitorUrl.replace(/^https?:\/\//, '').split('/')[0]}

Hi Editor,

I was reading your article on ${competitorUrl} and noticed a resource link that appears to be broken or outdated.

We recently published an in-depth breakdown covering this exact topic with live interactive showcases:
https://grekam.in/agency

If you're updating the article, it might make a valuable addition for your readers. 

Best regards,
Grekam Visuals Engineering Team`
      setOutreachEmail(email)
      setIsGeneratingEmail(false)
      toast.success("AI Outreach Pitch generated!")
    }, 1200)
  }

  const badgeHtmlCode = badgeStyle === "glass"
    ? `<a href="https://grekam.in" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:rgba(18,20,26,0.85);border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:#fff;font-family:sans-serif;font-size:11px;font-weight:600;text-decoration:none;backdrop-filter:blur(10px);"><span>Designed by</span><span style="color:#10b981;font-weight:800;">GREKAM</span></a>`
    : badgeStyle === "dark"
    ? `<a href="https://grekam.in" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#09090b;border:1px solid #27272a;border-radius:8px;color:#fff;font-family:sans-serif;font-size:11px;text-decoration:none;"><span>Powered by</span><span style="color:#38bdf8;font-weight:700;">Grekam Visuals</span></a>`
    : `<a href="https://grekam.in" target="_blank" rel="noopener" style="color:#71717a;font-family:sans-serif;font-size:11px;text-decoration:none;">Engineered by <strong style="color:#18181b;">Grekam</strong></a>`

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden text-foreground">
      {/* Top Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-foreground flex items-center gap-2.5 tracking-tight">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Link2 className="w-4 h-4" />
              </div>
              AI Backlink & Authority Hub
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Automated high-DR (70+) white-hat backlink engine, HARO journalist outreach & canonical syndication.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">100% White-Hat Safe</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-b border-border/40 pb-0 overflow-x-auto custom-scrollbar">
          {[
            { id: "directory", label: "High-DR Directories", icon: Globe, count: HIGH_DR_DIRECTORIES.length },
            { id: "pitch", label: "HARO / Journalist AI", icon: Sparkles },
            { id: "widget", label: "Embeddable Backlink Widget", icon: Layers },
            { id: "outreach", label: "Competitor Link Outreach", icon: Send },
          ].map(tab => {
            const TabIcon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                  isActive 
                    ? "border-emerald-500 text-emerald-400 bg-emerald-500/5 rounded-t-lg" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-t-lg"
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-muted text-muted-foreground">
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* TAB 1: HIGH-DR DIRECTORIES */}
          {activeTab === "directory" && (
            <div className="space-y-6">
              {/* Stat Summary Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm">
                  <div className="text-xs text-muted-foreground uppercase font-mono tracking-wider font-bold mb-1">Average Domain Rating</div>
                  <div className="text-3xl font-black font-mono text-emerald-400">DR 89.2</div>
                  <div className="text-[11px] text-muted-foreground mt-1">High authority contextual backlinks</div>
                </div>
                <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm">
                  <div className="text-xs text-muted-foreground uppercase font-mono tracking-wider font-bold mb-1">Link Types</div>
                  <div className="text-3xl font-black font-mono text-cyan-400">100% Dofollow</div>
                  <div className="text-[11px] text-muted-foreground mt-1">Passes maximum link equity to grekam.in</div>
                </div>
                <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm">
                  <div className="text-xs text-muted-foreground uppercase font-mono tracking-wider font-bold mb-1">AI Formatters</div>
                  <div className="text-3xl font-black font-mono text-purple-400">Active</div>
                  <div className="text-[11px] text-muted-foreground mt-1">Auto-generates structured schema & copy</div>
                </div>
              </div>

              {/* Directory List Table */}
              <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border/50 flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-foreground">
                    Authoritative Dofollow Platforms
                  </h3>
                  <span className="text-xs text-emerald-400 font-mono font-bold">9 Platforms Available</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/50 font-mono text-muted-foreground uppercase tracking-wider text-[10px]">
                        <th className="p-4">Platform Name</th>
                        <th className="p-4">Domain Rating (DR)</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Link Type</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {HIGH_DR_DIRECTORIES.map((dir) => (
                        <tr key={dir.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-4 font-bold text-foreground flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                            {dir.name}
                          </td>
                          <td className="p-4 font-mono font-black text-emerald-400">
                            DR {dir.dr}
                          </td>
                          <td className="p-4 text-muted-foreground font-mono">{dir.category}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {dir.type}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                              dir.status === "Verified" 
                                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {dir.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <a
                              href={dir.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all border border-primary/20"
                            >
                              <span>Submit Profile</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HARO / JOURNALIST AI PITCH */}
          {activeTab === "pitch" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" /> HARO / Journalist AI Response Engine
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Journalists from Forbes, Business Insider, TechCrunch, and Substack seek quotes on HARO (Connectively), Featured, and Terkel daily. Use AI to generate expert quotes embedded with your backlink.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-mono font-bold text-muted-foreground block mb-1.5">
                      Journalist Query / Press Topic
                    </label>
                    <input
                      type="text"
                      value={queryTopic}
                      onChange={(e) => setQueryTopic(e.target.value)}
                      placeholder="e.g. How high-speed websites affect e-commerce conversions"
                      className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-xs text-foreground outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono font-bold text-muted-foreground block mb-1.5">
                      Target Anchor Keyword (Optional)
                    </label>
                    <input
                      type="text"
                      value={targetKeyword}
                      onChange={(e) => setTargetKeyword(e.target.value)}
                      placeholder="e.g. Web Development Agency"
                      className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-xs text-foreground outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <button
                    onClick={handleGeneratePitch}
                    disabled={isGeneratingPitch}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {isGeneratingPitch ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>Generate Journalist Quote & Pitch</span>
                  </button>
                </div>
              </div>

              {/* Output Preview */}
              <div className="lg:col-span-6 p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                    Generated Pitch Output
                  </h3>
                  {generatedPitch && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPitch)
                        setCopiedPitch(true)
                        setTimeout(() => setCopiedPitch(false), 2000)
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-all"
                    >
                      {copiedPitch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPitch ? "Copied" : "Copy Pitch"}</span>
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-background border border-border/60 font-mono text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed min-h-[220px]">
                  {generatedPitch || "Click 'Generate Journalist Quote' to produce a pitch tailored for HARO / Terkel media submissions."}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EMBEDDABLE BACKLINK WIDGET */}
          {activeTab === "widget" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" /> Embedded Badge Backlink Generator
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Embed a stylish "Designed by Grekam Visuals" badge in footer templates of client websites. Every live site built automatically passes permanent link authority back to <code className="text-emerald-400">grekam.in</code>.
                </p>

                <div className="space-y-3 pt-2">
                  <label className="text-xs font-mono font-bold text-muted-foreground block">
                    Choose Badge Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["glass", "dark", "minimal"] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => setBadgeStyle(style)}
                        className={`py-2.5 rounded-xl text-xs font-bold uppercase font-mono border transition-all ${
                          badgeStyle === style 
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" 
                            : "bg-background border-border/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Badge Visual Preview */}
                <div className="p-6 rounded-xl bg-black/90 border border-white/10 flex items-center justify-center min-h-[100px]">
                  <div dangerouslySetInnerHTML={{ __html: badgeHtmlCode }} />
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="lg:col-span-6 p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                    1-Click HTML Embed Code
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(badgeHtmlCode)
                      setCopiedBadge(true)
                      setTimeout(() => setCopiedBadge(false), 2000)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold hover:bg-cyan-500/20 transition-all"
                  >
                    {copiedBadge ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBadge ? "Copied" : "Copy Code"}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-background border border-border/60 font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {badgeHtmlCode}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: COMPETITOR OUTREACH */}
          {activeTab === "outreach" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Send className="w-4 h-4 text-purple-400" /> AI Competitor Link Outreach Pitch
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enter an industry blog post or competitor article URL. AI will analyze the topic and generate a highly personalized outreach email suggesting a link swap or resource inclusion.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-mono font-bold text-muted-foreground block mb-1.5">
                      Target Blog / Competitor URL
                    </label>
                    <input
                      type="url"
                      value={competitorUrl}
                      onChange={(e) => setCompetitorUrl(e.target.value)}
                      placeholder="e.g. https://techblog.com/top-web-design-agencies-2025"
                      className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-xs text-foreground outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <button
                    onClick={handleGenerateEmail}
                    disabled={isGeneratingEmail}
                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {isGeneratingEmail ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Generate Personalized Email Pitch</span>
                  </button>
                </div>
              </div>

              {/* Output Preview */}
              <div className="lg:col-span-6 p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                    Generated Email Pitch
                  </h3>
                  {outreachEmail && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(outreachEmail)
                        setCopiedEmail(true)
                        setTimeout(() => setCopiedEmail(false), 2000)
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold hover:bg-purple-500/20 transition-all"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEmail ? "Copied" : "Copy Email"}</span>
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-background border border-border/60 font-mono text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed min-h-[220px]">
                  {outreachEmail || "Enter a target URL and click 'Generate Personalized Email Pitch' to produce outreach email copy."}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
