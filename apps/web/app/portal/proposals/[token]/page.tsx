"use client"

import { useApi, fetchApi } from "@/lib/useApi"
import { useParams, useRouter } from "next/navigation"
import { Loader2, CheckCircle2, FileSignature, ShieldCheck, ChevronLeft, Eraser } from "lucide-react"
import { useState, useRef } from "react"
import Link from "next/link"
import { useOrganization } from "@/context/OrganizationContext"
import SignatureCanvas from "react-signature-canvas"

export default function PublicProposalPage() {
  const { token } = useParams()
  const router = useRouter()
  const { data: proposal, isLoading, mutate } = useApi<any>(`/crm/public/proposals/${token}`)
  const org = useOrganization()
  
  const [signatureName, setSignatureName] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const signatureRef = useRef<SignatureCanvas>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white/50">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white/50 flex-col gap-4">
        <ShieldCheck className="w-12 h-12 text-red-500 opacity-50" />
        <h2 className="text-xl font-bold text-white">Proposal Not Found</h2>
        <p>This proposal link is invalid or has expired.</p>
      </div>
    )
  }

  const isSigned = proposal.status === "APPROVED"

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) return;
    
    if (signatureRef.current?.isEmpty()) {
      alert("Please provide your signature");
      return;
    }
    
    const signatureData = signatureRef.current?.getTrimmedCanvas().toDataURL('image/png')
    
    setIsSigning(true)
    try {
      await fetchApi(`/crm/public/proposals/${token}/sign`, {
        method: 'POST',
        body: JSON.stringify({ signatureData })
      })
      mutate() // Refresh data to show signed state
    } catch (err) {
      console.error(err)
      alert("Error signing proposal")
    } finally {
      setIsSigning(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4 sm:px-6 relative overflow-hidden font-sans">
      <div className="max-w-4xl mx-auto relative z-10">
        
        <Link href="/portal/proposals" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Proposals
        </Link>

        {/* Proposal Document UI */}
        <div className="bg-white text-black rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:bg-white print:text-black">
          
          {/* Header */}
          <div className="p-10 border-b border-black/10 flex flex-col md:flex-row md:items-end justify-between gap-6 bg-slate-50">
            <div>
              <h3 className="font-bold tracking-widest uppercase text-blue-600 text-xs mb-2">Proposal / Statement of Work</h3>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">{proposal.title}</h1>
            </div>
            <div className="text-right">
              {org.logoUrl
                ? <img src={org.logoUrl} alt={org.name} className="h-10 w-auto object-contain ml-auto mb-1" />
                : <div className="w-10 h-10 bg-primary rounded-xl ml-auto mb-1 flex items-center justify-center text-white font-black text-lg">{org.name.charAt(0)}</div>
              }
              <p className="font-bold text-sm">{org.name}</p>
              {org.supportEmail && <p className="text-xs text-slate-500">{org.supportEmail}</p>}
              {org.phone && <p className="text-xs text-slate-500">{org.phone}</p>}
              <p className="text-xs text-slate-500 mt-2 font-mono">Date: {new Date(proposal.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Client Info */}
          <div className="p-10 border-b border-black/10">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Prepared For</h4>
            <p className="font-bold text-lg">{proposal.lead?.name}</p>
            {proposal.lead?.company && <p className="text-slate-600">{proposal.lead?.company}</p>}
          </div>

          {/* Scope / Notes */}
          {proposal.notes && (
            <div className="p-10 border-b border-black/10 whitespace-pre-wrap text-slate-700 leading-relaxed">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Project Overview</h4>
              {proposal.notes}
            </div>
          )}

          {/* Line Items */}
          <div className="p-10 border-b border-black/10">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Investment</h4>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-black/10 text-xs font-bold uppercase tracking-widest">
                  <th className="pb-3">Description</th>
                  <th className="pb-3 text-right">Qty</th>
                  <th className="pb-3 text-right">Unit Price</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {proposal.items?.map((item: any) => (
                  <tr key={item.id}>
                    <td className="py-4 text-sm font-medium">{item.description}</td>
                    <td className="py-4 text-sm text-right text-slate-600">{item.quantity}</td>
                    <td className="py-4 text-sm text-right text-slate-600">${item.unitPrice.toLocaleString()}</td>
                    <td className="py-4 text-sm text-right font-bold">${item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="py-6 text-right font-bold text-lg">Total Investment:</td>
                  <td className="py-6 text-right font-black text-2xl text-blue-600">${proposal.totalAmount?.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signature Block */}
          <div className="p-10 bg-slate-50 print:bg-white">
            {isSigned ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-900 mb-1">Proposal Accepted</h4>
                  <p className="text-emerald-800 text-sm mb-4">This proposal was electronically signed and legally bound.</p>
                  <div className="text-xs text-emerald-700 font-mono bg-emerald-100/50 p-3 rounded border border-emerald-200/50">
                    <p>Signature ID: <strong>{proposal.signatureData?.length > 100 ? "Stored Securely" : proposal.signatureData}</strong></p>
                    <p>Date: {new Date(proposal.signedAt).toLocaleString()}</p>
                    <p>Token ID: {proposal.publicToken}</p>
                  </div>
                  {proposal.signatureData && proposal.signatureData.startsWith('data:image') && (
                    <div className="mt-4 border border-emerald-200 bg-white p-2 rounded">
                      <img src={proposal.signatureData} alt="Client Signature" className="h-16" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSign} className="p-8 bg-white border-2 border-blue-100 rounded-2xl shadow-sm">
                <h4 className="flex items-center gap-2 font-bold text-lg mb-6"><FileSignature className="w-5 h-5 text-blue-500" /> Electronic Signature</h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Draw your signature</label>
                      <button type="button" onClick={() => signatureRef.current?.clear()} className="text-xs text-slate-400 hover:text-blue-500 flex items-center gap-1">
                        <Eraser className="w-3 h-3" /> Clear
                      </button>
                    </div>
                    <div className="border-2 border-slate-200 border-dashed rounded-lg bg-slate-50 overflow-hidden">
                      <SignatureCanvas 
                        ref={signatureRef}
                        canvasProps={{ className: 'w-full h-32 cursor-crosshair' }}
                        backgroundColor="rgba(255,255,255,0)"
                      />
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="mt-1">
                      <input 
                        type="checkbox" 
                        required
                        checked={agreed}
                        onChange={e => setAgreed(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <span className="text-sm text-slate-600 group-hover:text-black transition-colors leading-relaxed">
                      I agree to the scope of work and total investment outlined above. I understand this constitutes a legally binding digital signature.
                    </span>
                  </label>

                  <button 
                    disabled={!agreed || isSigning}
                    type="submit" 
                    className="w-full mt-4 bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                  >
                    {isSigning ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    {isSigning ? "Processing..." : "Accept & Sign Proposal"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
