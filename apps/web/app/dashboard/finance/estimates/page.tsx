"use client"

import { useState } from "react"
import { Plus, Search, FileText, Send, CheckCircle, Clock, Copy, MoreHorizontal, ArrowRight, Eye } from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency"

// Mock Data
const ESTIMATES = [
  { id: "EST-2025-089", client: "RedBrick Realty", project: "Brand Identity Refresh", amount: 420000, date: "Jun 16, 2025", status: "APPROVED" },
  { id: "EST-2025-088", client: "Techflow SaaS", project: "Landing Page Wireframes", amount: 295000, date: "Jun 15, 2025", status: "SENT" },
  { id: "EST-2025-087", client: "Fitburst Gym", project: "Promo Video Edits", amount: 141600, date: "Jun 12, 2025", status: "DECLINED" },
  { id: "EST-2025-086", client: "Spice Kitchen", project: "Menu Design & Social Assets", amount: 70800, date: "Jun 10, 2025", status: "DRAFT" },
]

export default function EstimatesDashboard() {
  const { symbol } = useCurrency()
  const [search, setSearch] = useState("")

  const filtered = ESTIMATES.filter(e => {
    return search === "" || e.client.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Estimates & Quotes</h1>
            <p className="text-sm text-muted-foreground mt-1">Draft estimates, send for client approval, and convert to invoices.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
            <Plus className="w-4 h-4" />
            Create Estimate
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col xl:flex-row gap-6">
        
        {/* Main Content (Table) */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between bg-muted/20 p-4 rounded-xl border border-border/50">
            <div className="flex items-center gap-4 text-sm font-medium">
              <button className="text-foreground border-b-2 border-primary pb-1">All Estimates</button>
              <button className="text-muted-foreground hover:text-foreground pb-1">Drafts</button>
              <button className="text-muted-foreground hover:text-foreground pb-1">Sent</button>
              <button className="text-muted-foreground hover:text-foreground pb-1">Approved</button>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search estimates..."
                className="w-full bg-background border border-border/50 rounded-lg pl-9 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Estimate ID</th>
                  <th className="px-6 py-4 font-medium">Client & Project</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((est) => (
                  <tr key={est.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground hover:text-primary cursor-pointer transition-colors">{est.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{est.client}</div>
                      <div className="text-xs text-muted-foreground">{est.project}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      {symbol}{est.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border ${
                        est.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        est.status === 'SENT' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        est.status === 'DECLINED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-slate-500/10 text-slate-500 border-slate-500/20'
                      }`}>
                        {est.status === 'APPROVED' && <CheckCircle className="w-3 h-3" />}
                        {est.status === 'SENT' && <Send className="w-3 h-3" />}
                        {est.status === 'DECLINED' && <Clock className="w-3 h-3" />}
                        {est.status === 'DRAFT' && <FileText className="w-3 h-3" />}
                        {est.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{est.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {est.status === 'APPROVED' ? (
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg text-xs font-bold border border-emerald-500/20 hover:border-emerald-500 transition-all">
                            Convert to Invoice <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <>
                            <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors tooltip" title="Copy Client Link">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors tooltip" title="Preview">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p>No estimates found matching your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (Quick Action & Activity) */}
        <div className="w-full xl:w-80 flex-none space-y-6">
          <div className="bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-foreground mb-2">Automate Invoicing</h3>
            <p className="text-sm text-muted-foreground mb-4">Connect your Stripe or Razorpay account to automatically convert approved estimates into payable invoices.</p>
            <button className="w-full py-2 bg-background border border-border/50 text-foreground text-sm font-bold rounded-lg hover:bg-muted transition-colors shadow-sm">
              Connect Payment Gateway
            </button>
          </div>

          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="relative pl-4 border-l-2 border-emerald-500/50">
                <div className="absolute w-2 h-2 bg-emerald-500 rounded-full -left-[5px] top-1"></div>
                <p className="text-sm font-medium text-foreground">RedBrick Realty approved <span className="font-bold">EST-2025-089</span></p>
                <p className="text-xs text-muted-foreground mt-0.5">2 hours ago</p>
              </div>
              <div className="relative pl-4 border-l-2 border-blue-500/50">
                <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[5px] top-1"></div>
                <p className="text-sm font-medium text-foreground">Estimate sent to Techflow SaaS</p>
                <p className="text-xs text-muted-foreground mt-0.5">Yesterday</p>
              </div>
              <div className="relative pl-4 border-l-2 border-border/50">
                <div className="absolute w-2 h-2 bg-border rounded-full -left-[5px] top-1"></div>
                <p className="text-sm font-medium text-foreground">Created draft for Spice Kitchen</p>
                <p className="text-xs text-muted-foreground mt-0.5">Jun 10, 2025</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
