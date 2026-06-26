"use client"

import { useState } from "react"
import { Mic, Play, Pause, BarChart2, Star, Sparkles, TrendingUp, AlertTriangle, FileText, CheckCircle2 } from "lucide-react"

export default function CallIntelligenceDashboard() {
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Mic className="w-6 h-6 text-primary" /> Call Intelligence
            </h1>
            <p className="text-sm text-muted-foreground mt-1">AI transcripts, sentiment analysis, and auto-CRM logging.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-all border border-primary/20 shadow-sm">
            <BarChart2 className="w-4 h-4" /> Team Analytics
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col xl:flex-row gap-6">
        
        {/* Left Col: Transcript & Playback */}
        <div className="flex-1 space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
            {/* Audio Player Strip */}
            <div className="p-4 border-b border-border/50 bg-muted/20 flex items-center gap-4">
              <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shrink-0">
                <Play className="w-4 h-4 ml-0.5" />
              </button>
              <div className="flex-1">
                <div className="h-1.5 bg-border rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-primary w-1/3 rounded-full relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                  <span>02:14</span>
                  <span>06:45</span>
                </div>
              </div>
              <button className="px-3 py-1 bg-background border border-border/50 rounded-lg text-xs font-medium hover:bg-muted transition-colors">
                1.5x
              </button>
            </div>

            {/* Transcript */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="text-sm text-center text-muted-foreground bg-muted/30 py-2 rounded-lg mb-4">Call connected at 10:42 AM PST</div>

              <div className="flex gap-4 group">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0">Rep</div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-sm text-foreground">Aisha (Sales)</span>
                    <span className="text-[10px] text-muted-foreground">00:02</span>
                  </div>
                  <div className="text-sm text-foreground/80 leading-relaxed">
                    Hi Sarah, this is Aisha calling from Grekam. I saw Nexus Health just closed a Series B, huge congrats on that! 
                  </div>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">Pro</div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-sm text-foreground">Sarah (Nexus Health)</span>
                    <span className="text-[10px] text-muted-foreground">00:09</span>
                  </div>
                  <div className="text-sm text-foreground/80 leading-relaxed">
                    Oh, thank you! It's been a crazy few weeks here. Who did you say you were with again?
                  </div>
                </div>
              </div>

              <div className="flex gap-4 group bg-primary/5 -mx-6 px-6 py-3 border-y border-primary/10 relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0">Rep</div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-sm text-foreground">Aisha (Sales)</span>
                    <span className="text-[10px] text-muted-foreground">00:15</span>
                  </div>
                  <div className="text-sm text-foreground/80 leading-relaxed">
                    Grekam. We're a creative and growth agency. I noticed you downloaded our SaaS Marketing whitepaper last week. I'm guessing with the new funding, you're looking to scale up your paid acquisition?
                  </div>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">Pro</div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-sm text-foreground">Sarah (Nexus Health)</span>
                    <span className="text-[10px] text-muted-foreground">00:26</span>
                    <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ml-2">Positive Buying Signal</span>
                  </div>
                  <div className="text-sm text-foreground/80 leading-relaxed">
                    Yeah, exactly. Our Board wants us to double our demo volume by Q4. I actually was meaning to read that whitepaper but haven't gotten around to it. How exactly do you guys help with CPA? 
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Col: AI Insights */}
        <div className="w-full xl:w-[400px] flex-none space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl shadow-sm h-[600px] flex flex-col relative overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-primary/10 to-blue-500/10 border-b border-border/50 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground">AI Call Summary</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Sentiment & Score */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 border border-border/50 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Overall Sentiment</div>
                  <div className="text-emerald-500 font-bold flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" /> Highly Interested
                  </div>
                </div>
                <div className="bg-muted/30 border border-border/50 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Objections Handled</div>
                  <div className="text-foreground font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 2 / 2
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Auto-Generated Summary</div>
                <div className="text-sm text-foreground/80 leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/50">
                  Sarah confirmed Nexus Health just raised a Series B and needs to double demo volume by Q4. She hasn't read the whitepaper yet but was highly engaged when Aisha explained our CPA reduction strategies. She agreed to a 15-minute discovery call next Tuesday.
                </div>
              </div>

              {/* CRM Injection */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Auto-CRM Logging
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Lead Status updated from <b>Cold</b> to <b>Meeting Booked</b></span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span><b>Task created:</b> Send MedTech Pro case study via email before Tuesday.</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span><b>Event created:</b> Discovery Call on Tue, Jul 12 @ 2:00 PM.</span>
                  </div>
                </div>
              </div>

              <button className="w-full py-2.5 bg-muted text-foreground hover:bg-muted/80 rounded-xl text-sm font-bold transition-colors">
                Edit CRM Details Manually
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
