"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Filter, TrendingUp, TrendingDown, Users, DollarSign, Activity, AlertCircle, Play, Pause, XCircle, Loader2 } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { motion, AnimatePresence } from "framer-motion"

export default function SubscriptionsDashboard() {
  const { data, mutate, isLoading } = useApi<{ data: any[], total: number, metrics: any }>("/finance/subscriptions")
  const { data: companiesData } = useApi<{ data: any[], total: number }>("/crm/companies")
  
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState("")
  const [productName, setProductName] = useState("")
  const [planName, setPlanName] = useState("")
  const [mrr, setMrr] = useState("")
  const [usage, setUsage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Local state for tracking action loading states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  
  // Manage modal state
  const [editingSub, setEditingSub] = useState<any>(null)

  const handlePause = async (id: string) => {
    setActionLoadingId(id)
    try {
      await fetchApi(`/finance/subscriptions/${id}/pause`, {
        method: "POST",
        body: JSON.stringify({})
      })
      await mutate()
    } catch (err) {
      console.error("Error pausing subscription:", err)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleResume = async (id: string) => {
    setActionLoadingId(id)
    try {
      await fetchApi(`/finance/subscriptions/${id}/resume`, {
        method: "POST",
        body: JSON.stringify({})
      })
      await mutate()
    } catch (err) {
      console.error("Error resuming subscription:", err)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCompanyId || !productName || !planName || !mrr) return
    
    setIsSubmitting(true)
    try {
      await fetchApi("/finance/subscriptions", {
        method: "POST",
        body: JSON.stringify({
          companyId: selectedCompanyId,
          productName,
          planName,
          mrr: parseFloat(mrr),
          usage: usage || null,
          status: "active"
        })
      })
      // Reset form
      setSelectedCompanyId("")
      setProductName("")
      setPlanName("")
      setMrr("")
      setUsage("")
      setIsModalOpen(false)
      await mutate()
    } catch (err) {
      console.error("Error creating subscription:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const subscriptions = data?.data || []
  const metrics = data?.metrics || {
    totalMrr: 0,
    activeSubscribers: 0,
    churnRate: 0,
    atRiskCount: 0
  }

  const KPIS = [
    { label: "Total MRR", value: `₹${metrics.totalMrr.toLocaleString('en-IN')}`, trend: "+12.5%", isPositive: true, icon: DollarSign },
    { label: "Active Subscribers", value: String(metrics.activeSubscribers), trend: "+4", isPositive: true, icon: Users },
    { label: "Churn Rate (30d)", value: `${metrics.churnRate}%`, trend: "-0.5%", isPositive: true, icon: Activity },
    { label: "At Risk", value: String(metrics.atRiskCount), trend: "Needs attention", isPositive: false, icon: AlertCircle },
  ]

  const filteredSubs = subscriptions.filter(sub => {
    if (filter !== "all" && sub.status !== filter) return false
    const companyName = sub.company?.name || ""
    if (
      search &&
      !companyName.toLowerCase().includes(search.toLowerCase()) &&
      !sub.productName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false
    }
    return true
  })

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar bg-transparent text-white relative">
      
      {/* Background ambient light */}
      <div className="absolute top-[10%] right-[10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto p-4 md:p-8 relative z-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)] relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-500/20 animate-pulse mix-blend-overlay" />
              <Activity className="w-6 h-6 text-blue-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Retainer Billing</h1>
              <p className="text-[10px] font-mono tracking-widest uppercase text-white/40 mt-1">Metrics, Subscriptions & Recurring Telemetry</p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-white text-black font-bold tracking-widest uppercase text-[10px] px-5 py-3 rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] relative overflow-hidden"
          >
            <Plus className="w-4 h-4" /> New Subscription
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {KPIS.map((kpi, i) => (
            <div 
              key={i} 
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition-all shadow-lg"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase text-white/50">{kpi.label}</h3>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                  kpi.label === "At Risk" 
                    ? "bg-red-500/10 border-red-500/20 text-red-400" 
                    : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                }`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-white/20" />
                  ) : (
                    kpi.value
                  )}
                </p>
                <div className={`flex items-center gap-1 text-[10px] font-mono mt-2 font-bold ${
                  kpi.isPositive ? "text-emerald-400" : "text-amber-400"
                }`}>
                  {kpi.trend}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All Subscribers" },
              { id: "active", label: "Active" },
              { id: "at_risk", label: "At Risk" },
              { id: "paused", label: "Paused" },
              { id: "churned", label: "Churned" },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`text-[10px] px-4 py-2.5 rounded-lg font-mono tracking-widest uppercase font-bold transition-all whitespace-nowrap ${
                  filter === f.id
                    ? "bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="Search client or product..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all backdrop-blur-md"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-white/10 rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-2" />
            <span className="text-xs font-mono text-white/40">Querying billing records...</span>
          </div>
        )}

        {/* Data Table / Cards */}
        {!isLoading && (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/40 text-[10px] font-mono tracking-widest text-white/40 uppercase">
                      <th className="px-6 py-4 font-bold">Client</th>
                      <th className="px-6 py-4 font-bold">Product & Plan</th>
                      <th className="px-6 py-4 font-bold">MRR</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold">Usage / Notes</th>
                      <th className="px-6 py-4 font-bold">Next Billing</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {filteredSubs.map((sub) => (
                      <tr key={sub.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="font-bold text-white/90">{sub.company?.name || "Unknown Client"}</div>
                          <div className="text-[10px] font-mono text-white/40 mt-0.5">{sub.id}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-medium text-white">{sub.productName}</div>
                          <div className="text-[10px] font-mono text-white/40 mt-0.5">{sub.planName} Plan</div>
                        </td>
                        <td className="px-6 py-5 font-bold text-white">₹{sub.mrr.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold uppercase ${
                            sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            sub.status === 'paused' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            sub.status === 'at_risk' ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' :
                            'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}>
                            {sub.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                            {sub.status === 'paused' && <Pause className="w-3 h-3" />}
                            {sub.status === 'at_risk' && <AlertCircle className="w-3 h-3" />}
                            {sub.status === 'churned' && <XCircle className="w-3 h-3" />}
                            {sub.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-white/80">{sub.usage || "Included"}</div>
                          {sub.status === 'at_risk' && <div className="text-[10px] font-mono text-red-400 mt-1">High cancellation risk</div>}
                        </td>
                        <td className="px-6 py-5 text-white/50 font-mono text-xs">
                          {sub.status === 'paused' ? 'Paused' : sub.status === 'churned' ? 'Cancelled' : new Date(sub.nextBilling).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {actionLoadingId === sub.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-white/40 mr-4" />
                            ) : (
                              <>
                                {sub.status === 'active' && (
                                  <button 
                                    onClick={() => handlePause(sub.id)}
                                    className="p-2 text-white/40 hover:text-amber-400 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-all" 
                                    title="Pause Subscription"
                                  >
                                    <Pause className="w-4 h-4" />
                                  </button>
                                )}
                                {(sub.status === 'paused' || sub.status === 'at_risk') && (
                                  <button 
                                    onClick={() => handleResume(sub.id)}
                                    className="p-2 text-white/40 hover:text-emerald-400 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-all" 
                                    title="Resume Subscription"
                                  >
                                    <Play className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                            <button onClick={() => setEditingSub(sub)} className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                              Manage
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredSubs.length === 0 && (
                  <div className="p-12 text-center text-white/40">
                    <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-50 text-white/20" />
                    <p className="font-mono text-xs uppercase">No subscriptions found matching filters</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredSubs.map((sub) => (
                <div 
                  key={sub.id} 
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative space-y-4 shadow-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-white text-base">{sub.company?.name || "Unknown Client"}</div>
                      <div className="text-[10px] font-mono text-white/40 mt-0.5">{sub.id}</div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-mono font-bold uppercase ${
                      sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      sub.status === 'paused' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      sub.status === 'at_risk' ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' :
                      'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {sub.status === 'active' && <span className="w-1 h-1 rounded-full bg-emerald-400" />}
                      {sub.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-b border-white/5 py-3">
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-widest text-white/40">Product</div>
                      <div className="text-xs text-white font-medium mt-1">{sub.productName}</div>
                      <div className="text-[9px] font-mono text-white/40 mt-0.5">{sub.planName} Plan</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-widest text-white/40">MRR</div>
                      <div className="text-sm text-white font-bold mt-1">₹{sub.mrr.toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-widest text-white/40">Next Billing</div>
                      <div className="text-white/60 font-mono mt-1 text-[11px]">
                        {sub.status === 'paused' ? 'Paused' : sub.status === 'churned' ? 'Cancelled' : new Date(sub.nextBilling).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {actionLoadingId === sub.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white/40" />
                      ) : (
                        <>
                          {sub.status === 'active' && (
                            <button 
                              onClick={() => handlePause(sub.id)}
                              className="p-2 text-white/40 hover:text-amber-400 hover:bg-white/5 rounded-lg border border-white/10 transition-all" 
                              title="Pause"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {(sub.status === 'paused' || sub.status === 'at_risk') && (
                            <button 
                              onClick={() => handleResume(sub.id)}
                              className="p-2 text-white/40 hover:text-emerald-400 hover:bg-white/5 rounded-lg border border-white/10 transition-all" 
                              title="Resume"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                      <button onClick={() => setEditingSub(sub)} className="px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-white/5 text-white rounded-lg border border-white/10">
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredSubs.length === 0 && (
                <div className="p-8 text-center text-white/40 bg-white/5 border border-white/10 rounded-2xl">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50 text-white/20" />
                  <p className="font-mono text-[10px] uppercase">No subscriptions found</p>
                </div>
              )}
            </div>
          </>
        )}

      </div>

      {/* New Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div 
            className="w-full max-w-md bg-[#090d16] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
          >
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-white text-lg">Create Retainer Subscription</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/40 hover:text-white transition-colors text-xs font-mono tracking-widest uppercase border border-white/10 px-2.5 py-1 rounded-lg"
              >
                Close
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">Select Company</label>
                <select
                  required
                  value={selectedCompanyId}
                  onChange={e => setSelectedCompanyId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-white/30"
                >
                  <option value="" disabled className="bg-[#090d16] text-white/30">Choose a company...</option>
                  {companiesData?.data?.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#090d16] text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grafty Pro"
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Retainer"
                  value={planName}
                  onChange={e => setPlanName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">MRR (INR)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 15000"
                  value={mrr}
                  onChange={e => setMrr(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">Usage / Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 10/10 workspaces, 10 hrs limit"
                  value={usage}
                  onChange={e => setUsage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="pt-4 border-t border-white/5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold tracking-widest uppercase text-[10px] py-4 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Create Subscription"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subscription Modal */}
      {editingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#090d16] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-white text-lg">Manage Subscription</h3>
              <button 
                onClick={() => setEditingSub(null)}
                className="text-white/40 hover:text-white transition-colors text-xs font-mono tracking-widest uppercase border border-white/10 px-2.5 py-1 rounded-lg"
              >
                Close
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              try {
                await fetchApi(`/finance/subscriptions/${editingSub.id}`, {
                  method: 'PATCH',
                  body: JSON.stringify({ 
                    mrr: parseFloat(editingSub.mrr), 
                    usage: editingSub.usage, 
                    status: editingSub.status 
                  })
                });
                setEditingSub(null);
                await mutate();
              } catch (err) {
                console.error(err);
                alert("Failed to update subscription");
              } finally {
                setIsSubmitting(false);
              }
            }} className="p-6 space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">MRR (INR)</label>
                <input 
                  type="number" 
                  required 
                  value={editingSub.mrr} 
                  onChange={e => setEditingSub({...editingSub, mrr: e.target.value})} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-white/30" 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">Usage / Notes</label>
                <input 
                  type="text" 
                  value={editingSub.usage || ""} 
                  onChange={e => setEditingSub({...editingSub, usage: e.target.value})} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-white/30" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">Status</label>
                <select 
                  value={editingSub.status} 
                  onChange={e => setEditingSub({...editingSub, status: e.target.value})} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-white/30"
                >
                  <option value="active" className="bg-[#090d16]">Active</option>
                  <option value="paused" className="bg-[#090d16]">Paused</option>
                  <option value="at_risk" className="bg-[#090d16]">At Risk</option>
                  <option value="churned" className="bg-[#090d16]">Churned</option>
                </select>
              </div>

              <div className="pt-4 border-t border-white/5">
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold tracking-widest uppercase text-[10px] py-4 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
