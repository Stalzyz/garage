"use client"

import { useState } from "react"
import { Sparkles, Upload, Search, UserPlus, Globe, Link, CheckCircle2, Copy, ArrowRight, MoreHorizontal } from "lucide-react"

export default function AIProspectingDashboard() {
  const [urlInput, setUrlInput] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [prospect, setProspect] = useState<any>(null)

  const handleGenerateIcebreakers = () => {
    if (!urlInput) return
    setAnalyzing(true)
    
    // Mock API Call
    setTimeout(() => {
      setProspect({
        name: "David Chen",
        company: "Peak Performance Inc.",
        role: "Founder & CEO",
        industry: "Fitness Tech",
        location: "Austin, TX",
        icebreakers: [
          { type: "Email Subject", text: "Scaling Peak Performance's user base with AI", copied: false },
          { type: "Cold Call Opener", text: "Hi David, I saw Peak Performance just launched the new smartwatch integration. How are you handling the influx of new user data?", copied: false },
          { type: "LinkedIn DM", text: "Hey David, huge fan of the new Peak smartwatch app! I noticed you're based in Austin — we actually helped a similar fitness tech startup there increase their trial conversions by 30%. Open to connecting?", copied: false }
        ]
      })
      setAnalyzing(false)
    }, 2500)
  }

  const handleCopy = (index: number) => {
    // Mock copy
    const newI = [...prospect.icebreakers]
    newI[index].copied = true
    setProspect({ ...prospect, icebreakers: newI })
    setTimeout(() => {
      const resetI = [...prospect.icebreakers]
      resetI[index].copied = false
      setProspect({ ...prospect, icebreakers: resetI })
    }, 2000)
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Prospecting & Enrichment</h1>
            <p className="text-sm text-muted-foreground mt-1">Generate personalized icebreakers and enrich lead data from URLs.</p>
          </div>
          <button className="flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-all border border-border/50 shadow-sm">
            <Upload className="w-4 h-4" /> Import CSV List
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-5xl">
        
        {/* Input Section */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" /> Target a Prospect
          </h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="Paste LinkedIn URL or Company Website (e.g., peakperformance.com)"
                className="w-full bg-background border border-border/50 rounded-xl pl-11 pr-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                onKeyDown={e => e.key === 'Enter' && handleGenerateIcebreakers()}
              />
            </div>
            <button 
              onClick={handleGenerateIcebreakers}
              disabled={analyzing || !urlInput}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scraping...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Enrich & Generate</>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {prospect && (
          <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Prospect Profile */}
            <div className="p-6 border-b border-border/50 bg-muted/10 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-xl font-black shadow-lg">
                {prospect.name.split(" ").map((n: string) => n[0]).join("")}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-foreground">{prospect.name}</h2>
                  <a href="#" className="text-blue-500 hover:text-blue-400 transition-colors"><Link className="w-5 h-5" /></a>
                </div>
                <p className="text-muted-foreground">{prospect.role} @ <span className="font-semibold text-foreground">{prospect.company}</span></p>
                
                <div className="flex gap-4 mt-3 text-xs font-medium">
                  <span className="bg-muted px-2 py-1 rounded text-muted-foreground border border-border/50">📍 {prospect.location}</span>
                  <span className="bg-muted px-2 py-1 rounded text-muted-foreground border border-border/50">🏢 {prospect.industry}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-500/20 transition-all">
                  <UserPlus className="w-4 h-4" /> Add to CRM
                </button>
              </div>
            </div>

            {/* AI Icebreakers */}
            <div className="p-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> AI Generated Icebreakers
              </h3>
              
              <div className="grid gap-4">
                {prospect.icebreakers.map((ice: any, i: number) => (
                  <div key={i} className="group relative bg-background border border-border/50 rounded-xl p-5 hover:border-primary/50 transition-colors">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-2">
                      {ice.type}
                    </div>
                    <p className="text-foreground/90 leading-relaxed pr-10">
                      "{ice.text}"
                    </p>
                    
                    <button 
                      onClick={() => handleCopy(i)}
                      className="absolute top-4 right-4 p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy to clipboard"
                    >
                      {ice.copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
              
            </div>
            
            <div className="px-6 py-4 bg-primary/5 border-t border-primary/10 flex justify-between items-center">
              <span className="text-xs text-primary font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Analyzed recent company news and LinkedIn activity.
              </span>
              <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                Generate More <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
