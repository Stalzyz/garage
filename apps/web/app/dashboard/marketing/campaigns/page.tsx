"use client"

import { useState } from "react"
import { BarChart2, TrendingUp, DollarSign, Target, Plus, Search, Filter, CheckCircle2 } from "lucide-react"

// Mock Data
const ADS = [
  { id: "A-01", platform: "Facebook", campaign: "Retargeting - Q3 Promo", status: "Active", spend: "$1,240.50", cpa: "$45.20", roas: "3.2x", leads: 28 },
  { id: "A-02", platform: "Google", campaign: "Search - 'SaaS Marketing Agency'", status: "Active", spend: "$3,800.00", cpa: "$112.50", roas: "4.5x", leads: 34 },
  { id: "A-03", platform: "LinkedIn", campaign: "InMail - Founder Outreach", status: "Paused", spend: "$850.00", cpa: "$210.00", roas: "1.1x", leads: 4 },
  { id: "A-04", platform: "TikTok", campaign: "Brand Awareness Video 1", status: "Active", spend: "$450.00", cpa: "$12.80", roas: "0.8x", leads: 35 },
]

export default function AdCampaignsDashboard() {
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" /> Ad Campaigns
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Unified view of your ad spend, CPA, and ROAS across all platforms.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-sm">
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-red-500" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Spend (30d)</h3>
              </div>
              <p className="text-2xl font-bold text-foreground">$6,340.50</p>
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12% from last month</p>
            </div>
            
            <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-500" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">Avg. CPA</h3>
              </div>
              <p className="text-2xl font-bold text-foreground">$62.70</p>
              <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 rotate-180" /> -5% from last month</p>
            </div>
            
            <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <BarChart2 className="w-4 h-4 text-emerald-500" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">Blended ROAS</h3>
              </div>
              <p className="text-2xl font-bold text-foreground">3.8x</p>
              <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +0.4x from last month</p>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Leads</h3>
              </div>
              <p className="text-2xl font-bold text-foreground">101</p>
              <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +18% from last month</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search campaigns..." 
                className="w-full pl-10 pr-4 py-2 bg-card border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button className="flex items-center gap-2 bg-card border border-border/50 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                <Filter className="w-4 h-4" /> Filter
              </button>
              <select className="bg-card border border-border/50 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:border-primary cursor-pointer appearance-none">
                <option>Last 30 Days</option>
                <option>This Month</option>
                <option>Last Quarter</option>
                <option>Year to Date</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground text-left">
                  <tr>
                    <th className="px-6 py-4 font-medium">Platform</th>
                    <th className="px-6 py-4 font-medium">Campaign Name</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Spend</th>
                    <th className="px-6 py-4 font-medium text-right">Leads</th>
                    <th className="px-6 py-4 font-medium text-right">CPA</th>
                    <th className="px-6 py-4 font-medium text-right">ROAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {ADS.map((ad) => (
                    <tr key={ad.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            ad.platform === "Facebook" ? "bg-blue-600" :
                            ad.platform === "Google" ? "bg-red-500" :
                            ad.platform === "LinkedIn" ? "bg-blue-400" :
                            "bg-black dark:bg-white"
                          }`} />
                          <span className="text-sm font-medium text-foreground">{ad.platform}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-sm text-foreground">{ad.campaign}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${ad.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
                          {ad.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-red-400 text-right">{ad.spend}</td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground text-right">{ad.leads}</td>
                      <td className="px-6 py-4 text-sm font-mono text-muted-foreground text-right">{ad.cpa}</td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-500 text-right">{ad.roas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
