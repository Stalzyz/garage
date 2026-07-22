"use client"

import { useState } from "react"
import { useApi, fetchApi } from "@/lib/useApi"
import { BarChart2, TrendingUp, DollarSign, Target, Plus, Search, Filter, CheckCircle2, Loader2 } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { toast } from "sonner"

export default function AdCampaignsDashboard() {
  const { data, mutate } = useApi<any>("/marketing/campaigns")
  const campaigns = data?.campaigns || []
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    type: "EMAIL",
    status: "DRAFT",
    targetAudience: "",
    content: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi("/marketing/campaigns", {
        method: "POST",
        body: JSON.stringify(formData)
      })
      toast.success("Campaign created successfully!")
      setIsModalOpen(false)
      setFormData({ title: "", type: "EMAIL", status: "DRAFT", targetAudience: "", content: "" })
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to create campaign")
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-sm"
          >
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
                  {campaigns.map((ad: any) => (
                    <tr key={ad.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            ad.type === "EMAIL" ? "bg-blue-600" :
                            ad.type === "SMS" ? "bg-emerald-500" :
                            "bg-purple-500"
                          }`} />
                          <span className="text-sm font-medium text-foreground">{ad.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-sm text-foreground">{ad.title}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${ad.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
                          {ad.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-red-400 text-right">-</td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground text-right">-</td>
                      <td className="px-6 py-4 text-sm font-mono text-muted-foreground text-right">-</td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-500 text-right">-</td>
                    </tr>
                  ))}
                  {campaigns.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No campaigns found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="w-[500px] p-6">
            <h2 className="text-xl font-bold text-white mb-6">Create New Campaign</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Campaign Title</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="e.g. Summer Sale 2025"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Campaign Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="EMAIL">Email</option>
                    <option value="AD">Paid Ad</option>
                    <option value="SOCIAL">Social</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="ACTIVE">Active</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Target Audience (Optional)</label>
                <input 
                  type="text" 
                  value={formData.targetAudience}
                  onChange={e => setFormData({...formData, targetAudience: e.target.value})}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="e.g. Enterprise Leads"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Brief Content/Budget (Optional)</label>
                <textarea 
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary min-h-[100px]"
                  placeholder="Any details..."
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-white font-bold rounded-lg hover:bg-white/5 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm flex items-center"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  )
}
