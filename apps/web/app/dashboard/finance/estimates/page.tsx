"use client"

import { useState } from "react"
import { Plus, Search, FileText, Send, CheckCircle, Clock, Copy, MoreHorizontal, ArrowRight, Eye, Edit2, CopyPlus } from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency"
import { SlideOver } from "@/components/SlideOver"
import { toast } from "sonner"

import { useApi, fetchApi } from "@/lib/useApi"
import { format } from "date-fns"

export default function EstimatesDashboard() {
  const { symbol } = useCurrency()
  const { data, mutate } = useApi<any>("/finance/estimates")
  const estimatesList = data?.data || []
  
  const [search, setSearch] = useState("")
  
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingEst, setEditingEst] = useState<any>(null)
  const [formData, setFormData] = useState({
    client: "",
    project: "",
    amount: 0
  })

  const filtered = estimatesList.filter((e: any) => {
    return search === "" || e.clientName?.toLowerCase().includes(search.toLowerCase()) || e.estimateNumber?.toLowerCase().includes(search.toLowerCase())
  })

  const handleCreateEstimate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetchApi("/finance/estimates", {
        method: "POST",
        body: JSON.stringify({
          estimateNumber: `EST-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          clientName: formData.client,
          clientEmail: "test@example.com", // Mock email for now since form doesn't ask for it
          businessUnit: "AGENCY",
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString(), // +30 days validUntil
          items: [{ description: formData.project, quantity: 1, unitPrice: Number(formData.amount) }]
        })
      })
      toast.success("Estimate created as draft")
      setIsAddOpen(false)
      setFormData({ client: "", project: "", amount: 0 })
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to create estimate")
    }
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-4 md:px-6 py-4 md:py-5 border-b border-border/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Estimates & Quotes</h1>
            <p className="text-sm text-muted-foreground mt-1">Draft estimates, send for client approval, and convert to invoices.</p>
          </div>
          <div className="flex w-full md:w-auto">
            <button onClick={() => setIsAddOpen(true)} className="flex flex-1 md:flex-none items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm min-h-[44px]">
              <Plus className="w-4 h-4" />
              Create Estimate
            </button>
          </div>
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
                {filtered.map((est: any) => (
                  <tr key={est.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground hover:text-primary cursor-pointer transition-colors">{est.estimateNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{est.clientName}</div>
                      <div className="text-xs text-muted-foreground">{est.items?.[0]?.description || "No project specified"}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      {symbol}{est.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border ${
                        est.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        est.status === 'SENT' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        est.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-slate-500/10 text-slate-500 border-slate-500/20'
                      }`}>
                        {est.status === 'ACCEPTED' && <CheckCircle className="w-3 h-3" />}
                        {est.status === 'SENT' && <Send className="w-3 h-3" />}
                        {est.status === 'REJECTED' && <Clock className="w-3 h-3" />}
                        {est.status === 'DRAFT' && <FileText className="w-3 h-3" />}
                        {est.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{format(new Date(est.createdAt), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {est.status === 'APPROVED' ? (
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg text-xs font-bold border border-emerald-500/20 hover:border-emerald-500 transition-all">
                            Convert to Invoice <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <>
                            <button onClick={() => { navigator.clipboard.writeText(`https://grekam.com/verify/estimate/${est.id}`); toast.success("Client link copied!") }} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors tooltip" title="Copy Client Link">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button onClick={() => toast("Preview mode coming soon!")} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors tooltip" title="Preview">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingEst(est)} className="p-1.5 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-md transition-colors tooltip" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={async () => {
                              try {
                                await fetchApi("/finance/estimates", {
                                  method: "POST",
                                  body: JSON.stringify({
                                    estimateNumber: `EST-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                                    clientName: est.clientName,
                                    clientEmail: est.clientEmail,
                                    businessUnit: est.businessUnit,
                                    dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
                                    items: est.items || []
                                  })
                                })
                                mutate()
                                toast.success("Estimate duplicated successfully!")
                              } catch (err: any) {
                                toast.error(err.message || "Failed to duplicate estimate")
                              }
                            }} className="p-1.5 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors tooltip" title="Duplicate">
                              <CopyPlus className="w-4 h-4" />
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

      <SlideOver
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Estimate"
        subtitle="Draft a new quote for your client."
      >
        <form onSubmit={handleCreateEstimate} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Client Name *</label>
            <input required value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/30" placeholder="e.g. Acme Corp" />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Project Name *</label>
            <input required value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/30" placeholder="e.g. Website Redesign" />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Total Amount ({symbol}) *</label>
            <input required type="number" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/30" />
          </div>
          
          <div className="sticky bottom-0 bg-[#0a0a0a] pt-4 pb-6 -mb-6 -mx-6 px-6 border-t border-white/10 mt-6 z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.5)]">
            <button 
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all min-h-[44px]"
            >
              Save Draft
            </button>
          </div>
        </form>
      </SlideOver>

      <SlideOver
        open={!!editingEst}
        onClose={() => setEditingEst(null)}
        title="Manage Estimate"
        subtitle="Update the status or details of this estimate."
      >
        {editingEst && (
          <form onSubmit={(e) => {
            e.preventDefault()
            setEstimatesList(estimatesList.map(est => est.id === editingEst.id ? editingEst : est))
            toast.success("Estimate updated successfully")
            setEditingEst(null)
          }} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Client Name</label>
              <input type="text" value={editingEst.client} onChange={e => setEditingEst({...editingEst, client: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Project Name</label>
              <input type="text" value={editingEst.project} onChange={e => setEditingEst({...editingEst, project: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Status</label>
              <select value={editingEst.status} onChange={e => setEditingEst({...editingEst, status: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white">
                <option value="DRAFT" className="bg-[#090d16]">Draft</option>
                <option value="SENT" className="bg-[#090d16]">Sent</option>
                <option value="APPROVED" className="bg-[#090d16]">Approved</option>
                <option value="DECLINED" className="bg-[#090d16]">Declined</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Total Amount ({symbol})</label>
              <input type="number" value={editingEst.amount} onChange={e => setEditingEst({...editingEst, amount: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white" />
            </div>
            
            <div className="sticky bottom-0 bg-[#0a0a0a] pt-4 pb-6 -mb-6 -mx-6 px-6 border-t border-white/10 mt-6 z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.5)]">
              <button 
                type="submit"
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all min-h-[44px]"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </SlideOver>
    </div>
  )
}
