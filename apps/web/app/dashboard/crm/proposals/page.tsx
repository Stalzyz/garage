"use client"

import { useState } from "react"
import { Search, Plus, FileText, CheckCircle2, Clock, Send, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { useApi } from "@/lib/useApi"
import { format } from "date-fns"
import { useCurrency } from "@/hooks/useCurrency"

import { toast } from "sonner"
import { fetchApi } from "@/lib/useApi"
import { Copy } from "lucide-react"

export default function ProposalsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'all' | 'templates'>('all')
  const [sendingId, setSendingId] = useState<string | null>(null)
  const limit = 20
  const { symbol } = useCurrency()

  const { data, isLoading, mutate } = useApi<any>(`/crm/proposals?page=${page}&limit=${limit}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}${viewMode === 'templates' ? '&isTemplate=true' : ''}`)
  const proposals = data?.data || []
  const totalPages = data?.totalPages || 1

  const handleSendProposal = async (p: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setSendingId(p.id)
    try {
      await fetchApi(`/crm/proposals/${p.id}/send`, { method: "POST" })
      toast.success(`Proposal "${p.title}" emailed to client & updated to SENT!`)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to send proposal")
    } finally {
      setSendingId(null)
    }
  }

  const handleCopyLink = (p: any, e: React.MouseEvent) => {
    e.stopPropagation()
    const token = p.publicToken || p.id
    const link = `${window.location.origin}/portal/proposals/${token}`
    navigator.clipboard.writeText(link)
    toast.success("Proposal link copied to clipboard!")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-white/10 text-white/50 border border-white/20"><FileText className="w-3 h-3" /> Draft</span>
      case 'SENT':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20"><Send className="w-3 h-3" /> Sent</span>
      case 'ACCEPTED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> Accepted</span>
      case 'EXPIRED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-red-500/10 text-red-500 border border-red-500/20"><Clock className="w-3 h-3" /> Expired</span>
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 py-8 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
            <p className="text-sm text-white/50 mt-2">Create and track business proposals</p>
          </div>
          <Link href="/dashboard/crm/proposals/new" className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <Plus className="w-4 h-4" /> New Proposal
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search proposals..." 
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/30"
            />
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => { setViewMode('all'); setPage(1); }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${viewMode === 'all' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
            >
              All Proposals
            </button>
            <button 
              onClick={() => { setViewMode('templates'); setPage(1); }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${viewMode === 'templates' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
            >
              Templates
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-black/40 border-b border-white/10 text-[10px] font-mono tracking-widest uppercase text-white/50">
              <tr>
                <th className="px-6 py-4 font-bold">Proposal Name</th>
                <th className="px-6 py-4 font-bold">Client / Lead</th>
                <th className="px-6 py-4 font-bold">Value</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-white/50">Loading proposals...</td>
                </tr>
              ) : proposals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/50">
                    <FileText className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    No proposals found
                  </td>
                </tr>
              ) : (
                proposals.map((p: any) => {
                  const clientName = p.contact ? `${p.contact.firstName} ${p.contact.lastName}` : (p.lead?.name || "Unknown");
                  const clientCompany = p.contact?.company?.name || p.lead?.company || "";
                  
                  return (
                    <tr 
                      key={p.id} 
                      onClick={() => window.location.href = `/dashboard/crm/proposals/${p.id}`}
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{p.title}</div>
                        <div className="text-[10px] text-white/40 font-mono mt-1">ID: {p.id.slice(0, 8)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white/80 flex items-center gap-2">
                          {clientName} {p.contact && <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded-sm text-[9px] uppercase tracking-wider font-bold">Contact</span>}
                        </div>
                        <div className="text-[10px] text-white/40 mt-1">{clientCompany}</div>
                      </td>
                    <td className="px-6 py-4 font-mono font-medium text-white">
                      {symbol}{p.totalAmount?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="px-6 py-4 text-white/60 text-xs">
                      {format(new Date(p.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleSendProposal(p, e)}
                          disabled={sendingId === p.id}
                          className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold rounded-lg text-[11px] border border-blue-500/20 transition-colors disabled:opacity-50"
                          title="Email PDF & link directly to client"
                        >
                          <Send className="w-3 h-3" /> {sendingId === p.id ? "Sending..." : p.status === 'SENT' ? "Resend" : "Send Email"}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleCopyLink(p, e)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/70 font-bold rounded-lg text-[11px] border border-white/10 transition-colors"
                          title="Copy client proposal URL"
                        >
                          <Copy className="w-3 h-3" /> Copy Link
                        </button>
                        <Link 
                          href={`/dashboard/crm/proposals/${p.id}`} 
                          onClick={e => e.stopPropagation()} 
                          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg text-[11px] transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 bg-white/5 p-4 rounded-xl border border-white/10">
            <span className="text-sm text-white/50 font-mono">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
