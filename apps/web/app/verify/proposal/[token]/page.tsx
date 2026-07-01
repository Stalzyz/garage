"use client"

import { useState, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import { CheckCircle2, ShieldCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { fetchApi } from "@/lib/useApi"
import { useOrganization } from "@/context/OrganizationContext"

function OrgAvatar({ size = 32 }: { size?: number }) {
  const org = useOrganization()
  const initial = (org.name ?? 'G').charAt(0).toUpperCase()
  if (org.logoUrl) return (
    <img src={org.logoUrl} alt={org.name} style={{ width: size, height: size }} className="rounded-xl object-contain" />
  )
  return (
    <div style={{ width: size, height: size }} className="rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-black text-white shadow-lg shadow-violet-500/20">
      <span style={{ fontSize: Math.round(size * 0.4) }}>{initial}</span>
    </div>
  )
}

export default function PublicProposalPage() {
  const params = useParams()
  const token = params.token as string
  const org = useOrganization()

  const [proposal, setProposal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // Fetch proposal via public token route (we will build this backend route)
  useEffect(() => {
    fetch(`/api/v1/crm/proposals/public/${token}`)
      .then(res => res.json())
      .then(json => {
        setProposal(json.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [token])

  // Canvas Signature Logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    draw(e)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      ctx?.beginPath()
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    // Setup coordinates for mouse or touch
    let clientX, clientY
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.strokeStyle = "white"

    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.beginPath()
    }
  }

  const submitSignature = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const signatureData = canvas.toDataURL("image/png")
    
    // Simple validation to check if canvas is blank
    const blankCanvas = document.createElement("canvas")
    blankCanvas.width = canvas.width
    blankCanvas.height = canvas.height
    if (signatureData === blankCanvas.toDataURL()) {
      return toast.error("Please provide a signature before accepting.")
    }

    setSigning(true)
    try {
      // We will build this backend route
      const res = await fetch(`/api/v1/crm/proposals/public/${token}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureData })
      })
      
      if (res.ok) {
        toast.success("Proposal Accepted & Signed!")
        setProposal({ ...proposal, status: "APPROVED", signatureData })
      } else {
        toast.error("Failed to sign proposal.")
      }
    } catch (err: any) {
      toast.error(err.message || "Error submitting signature")
    } finally {
      setSigning(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold mb-2">Proposal Not Found</h1>
        <p className="text-slate-400">This link may be invalid or expired.</p>
      </div>
    )
  }

  // Calculate total from items
  const items = proposal.items || []
  const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)

  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans selection:bg-violet-500/30 overflow-x-hidden">
      
      {/* Top Bar */}
      <div className="h-16 border-b border-white/5 bg-[#0a0a0f] sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 lg:px-24">
        <div className="flex items-center gap-3">
          <OrgAvatar size={32} />
          <span className="font-bold text-sm tracking-widest uppercase">{org.name}</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
          <ShieldCheck className="w-4 h-4" /> Secure Document
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-6">
        
        {/* Proposal Document */}
        <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-8 md:p-16 shadow-2xl shadow-black relative overflow-hidden">
          
          {/* Status Badge Overlay */}
          {proposal.status === 'APPROVED' && (
            <div className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-4 h-4" /> LEGALLY BINDING & SIGNED
            </div>
          )}

          {/* Header */}
          <div className="border-b border-white/10 pb-12 mb-12 text-center mt-8">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">{proposal.title}</h1>
            <p className="text-slate-400 text-lg">Prepared for: <span className="font-bold text-white">{proposal.lead?.company || proposal.lead?.name || 'Client Name'}</span></p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-violet max-w-none mb-16 prose-p:text-slate-300 prose-p:leading-relaxed prose-headings:text-white prose-li:text-slate-300">
            {proposal.notes?.split('\n').map((line: string, i: number) => {
                if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-12 mb-6 border-b border-white/5 pb-4">{line.replace('## ', '')}</h2>
                if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mt-12 mb-6">{line.replace('# ', '')}</h1>
                if (line.startsWith('- ')) return <li key={i} className="ml-4 mb-2">{line.replace('- ', '')}</li>
                if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
                   return <li key={i} className="ml-4 mb-3 font-medium text-white">{line.replace(/^\d+\.\s/, '')}</li>
                }
                if (line.trim() === '') return <br key={i} />
                return <p key={i} className="mb-6">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
            })}
          </div>

          {/* Pricing Table */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/5 pb-4">Investment Breakdown</h2>
            
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/20">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-xs uppercase text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-5 font-bold tracking-widest">Module / Phase</th>
                    <th className="px-6 py-5 font-bold tracking-widest text-right">Qty</th>
                    <th className="px-6 py-5 font-bold tracking-widest text-right">Price</th>
                    <th className="px-6 py-5 font-bold tracking-widest text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {items.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-5">
                        <p className="font-bold text-white text-base">{item.description.split(' - ')[0]}</p>
                        {item.description.includes(' - ') && <p className="text-sm text-slate-500 mt-1">{item.description.split(' - ')[1]}</p>}
                      </td>
                      <td className="px-6 py-5 text-right text-slate-300 font-medium">{item.quantity}</td>
                      <td className="px-6 py-5 text-right text-slate-300 font-medium">₹{Number(item.unitPrice).toLocaleString()}</td>
                      <td className="px-6 py-5 text-right font-bold text-white">₹{(item.quantity * item.unitPrice).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-violet-600/10 border-t border-white/10">
                    <td colSpan={3} className="px-6 py-6 text-right font-bold text-violet-400 tracking-widest uppercase">Total Investment</td>
                    <td className="px-6 py-6 text-right font-black text-white text-2xl">₹{totalAmount.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Signature Block */}
          <div className="border-t border-white/10 pt-12">
            <h2 className="text-2xl font-bold text-white mb-8">Agreement & Signature</h2>
            
            {proposal.status === 'APPROVED' ? (
              // Signed State
              <div className="flex flex-col md:flex-row gap-12">
                <div className="flex-1">
                  <div className="h-32 border border-white/10 rounded-xl bg-white/5 mb-4 flex items-center justify-center relative overflow-hidden">
                    <img src={proposal.signatureData} alt="Client Signature" className="max-h-full invert opacity-80" />
                  </div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Client E-Signature</p>
                  <p className="text-xs text-emerald-400 mt-1">Signed on: {new Date(proposal.signedAt || Date.now()).toLocaleString()}</p>
                </div>
                <div className="flex-1">
                  <div className="h-32 border border-white/10 rounded-xl bg-white/5 mb-4 flex items-center justify-center">
                    {org.logoUrl
                      ? <img src={org.logoUrl} alt={org.name} className="max-h-20 object-contain" />
                      : <span className="font-black text-3xl text-white/20 tracking-tighter">{org.name}</span>
                    }
                  </div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Agency Signature</p>
                  {(org.phone || org.website) && (
                    <p className="text-xs text-slate-400 mt-1">
                      {org.phone && <span>{org.phone}</span>}
                      {org.phone && org.website && <span> | </span>}
                      {org.website && <a href={org.website} target="_blank" rel="noreferrer" className="hover:text-blue-400">{org.website}</a>}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              // Unsigned State (Signature Pad)
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <p className="text-slate-300 mb-6 text-sm">By signing below, you agree to the terms, scope, and pricing outlined in this proposal.</p>
                
                <div className="mb-6 relative">
                  <canvas 
                    ref={canvasRef}
                    width={600}
                    height={200}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onMouseMove={draw}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                    className="w-full h-[200px] bg-black/50 border border-white/20 rounded-xl cursor-crosshair touch-none shadow-inner"
                  />
                  <div className="absolute top-4 right-4 text-xs font-bold text-white/20 uppercase tracking-widest pointer-events-none">
                    Sign Here
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button 
                    onClick={clearSignature}
                    className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
                  >
                    Clear Signature
                  </button>
                  <button 
                    onClick={submitSignature}
                    disabled={signing}
                    className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {signing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    {signing ? "Processing..." : "Accept & Sign Proposal"}
                  </button>
                </div>
              </div>
            )}
            
          </div>

        </div>
      </div>
    </div>
  )
}
