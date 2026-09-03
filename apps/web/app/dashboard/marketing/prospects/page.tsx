"use client"

import { useState } from "react"
import { Sparkles, Search, UserPlus, Globe, CheckCircle2, Copy, AlertTriangle, MessageSquareShare, Mail, Phone } from "lucide-react"
import { fetchApi } from "@/lib/useApi"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1"

export default function AIProspectingDashboard() {
  const [urlInput, setUrlInput] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [prospect, setProspect] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [addedToCrm, setAddedToCrm] = useState(false)
  const [addingToCrm, setAddingToCrm] = useState(false)

  const handleGenerateIcebreakers = async () => {
    if (!urlInput) return
    setAnalyzing(true)
    setErrorMsg(null)
    setAddedToCrm(false)

    try {
      const res = await fetch(`${API_BASE}/ai/prospect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urlInput }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze prospect.")
      }

      setProspect({
        ...data.prospect,
        icebreakers: (data.prospect.icebreakers || []).map((ice: any) => ({ ...ice, copied: false }))
      })
    } catch (err: any) {
      console.error("Enrichment Error:", err)
      setErrorMsg(err.message || "Failed to generate prospect enrichment.")
    } finally {
      setAnalyzing(false)
    }
  }

  const handleCopy = (index: number) => {
    if (!prospect || !prospect.icebreakers[index]) return
    const textToCopy = prospect.icebreakers[index].text
    navigator.clipboard.writeText(textToCopy)

    const newI = [...prospect.icebreakers]
    newI[index].copied = true
    setProspect({ ...prospect, icebreakers: newI })

    setTimeout(() => {
      const resetI = [...prospect.icebreakers]
      resetI[index].copied = false
      setProspect({ ...prospect, icebreakers: resetI })
    }, 2000)
  }

  const handleWhatsAppShare = (text: string) => {
    const encoded = encodeURIComponent(text)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
  }

  const handleAddToCrm = async () => {
    if (!prospect || addingToCrm || addedToCrm) return
    setAddingToCrm(true)
    setErrorMsg(null)

    try {
      await fetchApi("/crm/leads", {
        method: "POST",
        body: JSON.stringify({
          name: prospect.name || "Prospect Lead",
          email: prospect.email || (prospect.emails && prospect.emails[0]) || "",
          phone: prospect.phone || (prospect.phones && prospect.phones[0]) || "",
          company: prospect.company || "Unknown Company",
          status: "NEW",
          source: "COLD_OUTREACH",
          notes: `Enriched via AI Web Scraper:\nRole: ${prospect.role || "N/A"}\nIndustry: ${prospect.industry || "N/A"}\nLocation: ${prospect.location || "N/A"}\nBio: ${prospect.bio || ""}`
        }),
      })

      setAddedToCrm(true)
    } catch (err: any) {
      console.error("Failed to add to CRM:", err)
      setErrorMsg(err.message || "Failed to add prospect to CRM leads.")
    } finally {
      setAddingToCrm(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Prospecting & Live Web Enrichment</h1>
            <p className="text-sm text-muted-foreground mt-1">Extract live webpage content, emails, contact numbers, and generate AI sales icebreakers.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-5xl">
        
        {/* Input Section */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" /> Target a Prospect Website or LinkedIn Profile
          </h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="Paste Company Domain or URL (e.g. stripe.com, visualspro.in)"
                className="w-full bg-background border border-border/50 rounded-xl pl-11 pr-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                onKeyDown={e => e.key === 'Enter' && handleGenerateIcebreakers()}
              />
            </div>
            <button 
              onClick={handleGenerateIcebreakers}
              disabled={analyzing || !urlInput.trim()}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scraping & Enriching...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Scrape & Enrich</>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Results Section */}
        {prospect && (
          <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Prospect Profile */}
            <div className="p-6 border-b border-border/50 bg-muted/10 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-xl font-black shadow-lg">
                {(prospect.name || "P").split(" ").map((n: string) => n[0]).join("")}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-foreground">{prospect.name}</h2>
                  {prospect.scrapedLive && (
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      ⚡ Live Web Scraped
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground">{prospect.role} @ <span className="font-semibold text-foreground">{prospect.company}</span></p>
                {prospect.bio && <p className="text-xs text-muted-foreground mt-1 max-w-2xl">{prospect.bio}</p>}
                
                {/* Location, Industry, Scraped Emails & Phones */}
                <div className="flex flex-wrap gap-2 mt-3 text-xs font-medium">
                  {prospect.location && <span className="bg-muted px-2.5 py-1 rounded-lg text-muted-foreground border border-border/50">📍 {prospect.location}</span>}
                  {prospect.industry && <span className="bg-muted px-2.5 py-1 rounded-lg text-muted-foreground border border-border/50">🏢 {prospect.industry}</span>}
                  
                  {/* Scraped Emails */}
                  {prospect.emails && prospect.emails.length > 0 ? (
                    prospect.emails.map((e: string, idx: number) => (
                      <a key={idx} href={`mailto:${e}`} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-blue-500/20 transition-colors">
                        <Mail className="w-3.5 h-3.5" /> {e}
                      </a>
                    ))
                  ) : prospect.email ? (
                    <a href={`mailto:${prospect.email}`} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" /> {prospect.email}
                    </a>
                  ) : null}

                  {/* Scraped Phones */}
                  {prospect.phones && prospect.phones.length > 0 ? (
                    prospect.phones.map((p: string, idx: number) => (
                      <a key={idx} href={`tel:${p}`} className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-emerald-500/20 transition-colors">
                        <Phone className="w-3.5 h-3.5" /> {p}
                      </a>
                    ))
                  ) : prospect.phone ? (
                    <a href={`tel:${prospect.phone}`} className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {prospect.phone}
                    </a>
                  ) : null}
                </div>
              </div>
              
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <button 
                  onClick={handleAddToCrm}
                  disabled={addingToCrm || addedToCrm}
                  className={`w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                    addedToCrm 
                      ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                  }`}
                >
                  {addingToCrm ? "Saving..." : addedToCrm ? "✓ Added to CRM Leads" : <><UserPlus className="w-4 h-4" /> Add to CRM</>}
                </button>
              </div>
            </div>

            {/* AI Icebreakers */}
            <div className="p-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> AI Generated Outreach Icebreakers
              </h3>
              
              <div className="grid gap-4">
                {(prospect.icebreakers || []).map((ice: any, i: number) => (
                  <div key={i} className="group relative bg-background border border-border/50 rounded-xl p-5 hover:border-primary/50 transition-colors">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2 flex items-center justify-between">
                      <span>{ice.type}</span>
                    </div>
                    <p className="text-foreground/90 leading-relaxed pr-24">
                      "{ice.text}"
                    </p>
                    
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      <button 
                        onClick={() => handleWhatsAppShare(ice.text)}
                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                        title="Share via WhatsApp"
                      >
                        <MessageSquareShare className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleCopy(i)}
                        className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy to clipboard"
                      >
                        {ice.copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-6 py-4 bg-primary/5 border-t border-primary/10 flex justify-between items-center">
              <span className="text-xs text-primary font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {prospect.scrapedLive ? "Live webpage HTML parsed, emails/phones extracted, and enriched with OpenAI." : "Enriched using OpenAI knowledge base."}
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
