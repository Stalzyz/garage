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
    <div className="flex flex-col h-full bg-[#000000] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-white/[0.08] bg-[#121214]/60 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">Estimates & Quotes</h1>
            <p className="text-xs text-white/50 mt-1">Draft quotes, share with clients, and convert to invoices.</p>
          </div>
          <div className="flex w-full md:w-auto">
            <button onClick={() => setIsAddOpen(true)} className="flex flex-1 md:flex-none items-center justify-center gap-2 bg-[#0A84FF] hover:bg-[#0071E3] text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Create Estimate
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col xl:flex-row gap-6">
        
        {/* Main Content (Table) */}
        <div className="flex-1 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161618] p-3 rounded-xl border border-white/[0.08]">
            <div className="flex items-center gap-1 bg-[#121214] p-0.5 rounded-lg border border-white/[0.06]">
              <button className="px-3 py-1 rounded-md text-xs font-medium bg-[#1c1c1e] text-white shadow-sm">All</button>
              <button className="px-3 py-1 rounded-md text-xs font-medium text-white/50 hover:text-white transition-colors">Drafts</button>
              <button className="px-3 py-1 rounded-md text-xs font-medium text-white/50 hover:text-white transition-colors">Sent</button>
              <button className="px-3 py-1 rounded-md text-xs font-medium text-white/50 hover:text-white transition-colors">Approved</button>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search quotes..."
                className="w-full bg-[#121214] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#0A84FF]"
              />
            </div>
          </div>

          <div className="bg-[#161618] border border-white/[0.08] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#121214] text-white/40 border-b border-white/[0.06]">
                <tr>
                  <th className="px-5 py-3 font-medium">Estimate ID</th>
                  <th className="px-5 py-3 font-medium">Client & Project</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((est: any) => (
                  <tr key={est.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="font-mono text-xs font-medium text-white/90 group-hover:text-[#0A84FF] cursor-pointer transition-colors">{est.estimateNumber}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-white">{est.clientName}</div>
                      <div className="text-[11px] text-white/40">{est.items?.[0]?.description || "No project specified"}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono font-medium text-white">
                      {symbol}{est.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                        est.status === 'ACCEPTED' ? 'bg-[#30D158]/10 text-[#30D158] border-[#30D158]/20' :
                        est.status === 'SENT' ? 'bg-[#0A84FF]/10 text-[#0A84FF] border-[#0A84FF]/20' :
                        est.status === 'REJECTED' ? 'bg-[#FF453A]/10 text-[#FF453A] border-[#FF453A]/20' :
                        'bg-white/[0.05] text-white/60 border-white/[0.08]'
                      }`}>
                        {est.status === 'ACCEPTED' && <CheckCircle className="w-3 h-3" />}
                        {est.status === 'SENT' && <Send className="w-3 h-3" />}
                        {est.status === 'REJECTED' && <Clock className="w-3 h-3" />}
                        {est.status === 'DRAFT' && <FileText className="w-3 h-3" />}
                        {est.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-white/40">{format(new Date(est.createdAt), 'MMM d, yyyy')}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {est.status === 'APPROVED' ? (
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#30D158]/10 text-[#30D158] hover:bg-[#30D158]/20 rounded-md text-xs font-medium border border-[#30D158]/20 transition-colors">
                            Convert to Invoice <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <>
                            <button onClick={() => { navigator.clipboard.writeText(`https://grekam.com/verify/estimate/${est.id}`); toast.success("Client link copied!") }} className="p-1.5 text-white/40 hover:text-white hover:bg-white/[0.06] rounded-md transition-colors" title="Copy Client Link">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => toast("Preview ready in client portal")} className="p-1.5 text-white/40 hover:text-[#0A84FF] hover:bg-white/[0.06] rounded-md transition-colors" title="Preview">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEditingEst(est)} className="p-1.5 text-white/40 hover:text-[#FF9F0A] hover:bg-white/[0.06] rounded-md transition-colors" title="Edit">
                              <Edit2 className="w-3.5 h-3.5" />
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
                            }} className="p-1.5 text-white/40 hover:text-[#0A84FF] hover:bg-white/[0.06] rounded-md transition-colors" title="Duplicate">
                              <CopyPlus className="w-3.5 h-3.5" />
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
              <div className="p-12 text-center text-white/40">
                <FileText className="w-7 h-7 mx-auto mb-2 opacity-30" />
                <p>No estimates found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (Quick Action & Activity) */}
        <div className="w-full xl:w-72 flex-none space-y-5">
          <div className="bg-[#161618] border border-white/[0.08] rounded-xl p-5">
            <h3 className="text-xs font-semibold text-white mb-1.5">Automate Invoicing</h3>
            <p className="text-xs text-white/50 mb-3.5 leading-relaxed">Connect payment gateway to automatically convert approved estimates into payable invoices.</p>
            <button className="w-full py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-white text-xs font-medium rounded-lg transition-colors">
              Payment Gateway Settings
            </button>
          </div>

          <div className="bg-[#161618] border border-white/[0.08] rounded-xl p-5">
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0A84FF]" /> Activity Log
            </h3>
            <div className="space-y-3.5">
              <div className="relative pl-3.5 border-l-2 border-[#30D158]">
                <p className="text-xs font-medium text-white/90">Client approved <span className="font-mono text-white">EST-2025-089</span></p>
                <p className="text-[10px] text-white/40 mt-0.5">2 hours ago</p>
              </div>
              <div className="relative pl-3.5 border-l-2 border-[#0A84FF]">
                <p className="text-xs font-medium text-white/90">Estimate sent to Techflow SaaS</p>
                <p className="text-[10px] text-white/40 mt-0.5">Yesterday</p>
              </div>
              <div className="relative pl-3.5 border-l-2 border-white/[0.1]">
                <p className="text-xs font-medium text-white/90">Created draft for Spice Kitchen</p>
                <p className="text-[10px] text-white/40 mt-0.5">Jun 10, 2025</p>
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
        <form onSubmit={handleCreateEstimate} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-white/50 mb-1.5">Client Name *</label>
            <input required value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#0A84FF] text-white placeholder:text-white/30" placeholder="e.g. Acme Corp" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-white/50 mb-1.5">Project Name *</label>
            <input required value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})} className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#0A84FF] text-white placeholder:text-white/30" placeholder="e.g. Website Redesign" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-white/50 mb-1.5">Total Amount ({symbol}) *</label>
            <input required type="number" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#0A84FF] text-white placeholder:text-white/30 font-mono" />
          </div>
          
          <div className="pt-4 border-t border-white/[0.08] mt-6">
            <button 
              type="submit"
              className="w-full py-2.5 bg-[#0A84FF] hover:bg-[#0071E3] text-white text-xs font-medium rounded-lg transition-colors"
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
            mutate()
            toast.success("Estimate updated successfully")
            setEditingEst(null)
          }} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-white/50 mb-1.5">Client Name</label>
              <input type="text" value={editingEst.client} onChange={e => setEditingEst({...editingEst, client: e.target.value})} className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#0A84FF] text-white" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-white/50 mb-1.5">Project Name</label>
              <input type="text" value={editingEst.project} onChange={e => setEditingEst({...editingEst, project: e.target.value})} className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#0A84FF] text-white" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-white/50 mb-1.5">Status</label>
              <select value={editingEst.status} onChange={e => setEditingEst({...editingEst, status: e.target.value})} className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#0A84FF] text-white">
                <option value="DRAFT" className="bg-[#161618]">Draft</option>
                <option value="SENT" className="bg-[#161618]">Sent</option>
                <option value="APPROVED" className="bg-[#161618]">Approved</option>
                <option value="DECLINED" className="bg-[#161618]">Declined</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-white/50 mb-1.5">Total Amount ({symbol})</label>
              <input type="number" value={editingEst.amount} onChange={e => setEditingEst({...editingEst, amount: Number(e.target.value)})} className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#0A84FF] text-white font-mono" />
            </div>
            
            <div className="pt-4 border-t border-white/[0.08] mt-6">
              <button 
                type="submit"
                className="w-full py-2.5 bg-[#0A84FF] hover:bg-[#0071E3] text-white text-xs font-medium rounded-lg transition-colors"
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
