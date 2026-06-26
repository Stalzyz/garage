"use client"

import { useApi } from "@/lib/useApi"
import { FileText, Loader2, ArrowRight, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function PortalProposalsPage() {
  const { data, isLoading } = useApi<any>("/crm/proposals")
  const proposals = data?.data || []

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Proposals</h1>
        <p className="text-white/50 text-sm">Review, sign, or download your proposals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-white/50">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
            <p>Loading proposals...</p>
          </div>
        ) : proposals.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-white/50 bg-white/5 border border-white/10 rounded-3xl">
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-white mb-2">No Proposals</h3>
            <p>We haven't sent you any proposals yet.</p>
          </div>
        ) : (
          proposals.map((prop: any) => (
            <div key={prop.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors group relative overflow-hidden flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{prop.title}</h2>
                  <p className="text-sm text-white/50 font-mono">${prop.totalAmount?.toLocaleString() || '0'}</p>
                </div>
                {prop.status === 'APPROVED' ? (
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Signed</span>
                ) : prop.status === 'EXPIRED' ? (
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Expired</span>
                ) : (
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">Pending</span>
                )}
              </div>

              <div className="flex-1 text-sm text-white/60 mb-6 line-clamp-2">
                {prop.notes || "Please review the proposed scope of work."}
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                <div className="text-xs text-white/40">
                  {prop.signedAt ? `Signed: ${new Date(prop.signedAt).toLocaleDateString()}` : `Sent: ${new Date(prop.createdAt).toLocaleDateString()}`}
                </div>
                <Link href={prop.publicToken ? `/portal/proposals/${prop.publicToken}` : `#`} className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors group/link">
                  {prop.status === 'APPROVED' ? 'View Document' : 'Review & Sign'} <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
