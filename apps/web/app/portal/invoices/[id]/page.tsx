"use client"

import { useParams } from "next/navigation"
import { ChevronLeft, Download, Loader2, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, X } from "lucide-react"
import Link from "next/link"
import { useOrganization } from "@/context/OrganizationContext"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { useState } from "react"
import { useCurrency } from "@/hooks/useCurrency"

function OrgAvatar({ size = 48 }: { size?: number }) {
  const org = useOrganization()
  const initial = (org.name ?? 'G').charAt(0).toUpperCase()
  if (org.logoUrl) return (
    <img src={org.logoUrl} alt={org.name} style={{ width: size, height: size }} className="rounded-xl object-contain mb-4" />
  )
  return (
    <div style={{ width: size, height: size }} className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20 mb-4">
      <span style={{ fontSize: Math.round(size * 0.4) }}>{initial}</span>
    </div>
  )
}

export default function PortalInvoicePreviewPage() {
  const params = useParams()
  const org = useOrganization()
  const { symbol } = useCurrency()
  
  const { data: invoice, isLoading, mutate } = useApi<any>(`/finance/invoices/${params.id}`)
  
  const [payingId, setPayingId] = useState<string | null>(null)
  
  // Sandbox Simulator State
  const [showSandbox, setShowSandbox] = useState(false)
  const [sandboxProcessing, setSandboxProcessing] = useState(false)

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayNow = async () => {
    if (!invoice) return
    setPayingId(invoice.id)
    try {
      const res = await fetchApi<any>(`/finance/invoices/${invoice.id}/pay`, {
        method: 'POST',
        body: JSON.stringify({})
      })

      if (res?.isLive) {
        const scriptLoaded = await loadRazorpayScript()
        if (!scriptLoaded) {
          toast.error("Failed to load Razorpay Payment gateway. Check your connection.")
          setPayingId(null)
          return
        }

        const options = {
          key: res.keyId,
          amount: res.amount,
          currency: res.currency,
          name: org.name || "Grekam Visuals",
          description: `Invoice ${res.orderId || invoice.id}`,
          order_id: res.orderId,
          prefill: {
            name: res.clientName || "",
            email: res.clientEmail || ""
          },
          theme: {
            color: "#2563eb"
          },
          handler: function (response: any) {
            toast.success("Payment completed successfully!")
            mutate()
          },
          modal: {
            ondismiss: function () {
              toast.info("Payment cancelled")
            }
          }
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      } else {
        setShowSandbox(true)
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Failed to process payment request")
    } finally {
      setPayingId(null)
    }
  }

  const handleSimulatePayment = async () => {
    if (!invoice) return
    setSandboxProcessing(true)
    try {
      await fetchApi(`/finance/invoices/${invoice.id}/mock-pay`, {
        method: 'POST',
        body: JSON.stringify({})
      })
      toast.success(`Payment simulated successfully for Invoice ${invoice.invoiceNumber}!`)
      setShowSandbox(false)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to complete simulated payment")
    } finally {
      setSandboxProcessing(false)
    }
  }

  const handleDownload = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/finance/invoices/${params.id}/pdf`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-[#050505] text-white items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-white/50 font-mono text-sm uppercase tracking-widest">Loading Invoice...</p>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex flex-col h-screen bg-[#050505] text-white items-center justify-center">
        <p className="text-red-400 font-mono text-sm uppercase tracking-widest">Invoice Not Found</p>
        <Link href="/portal/invoices" className="mt-4 text-blue-400 hover:underline">Return to Portal</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans py-12 px-4 relative">
      
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/portal/invoices" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <ChevronLeft className="w-4 h-4" /> Back to Invoices
          </Link>
          
          <div className="flex items-center gap-3">
            <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 text-sm bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-all border border-white/10">
              <Download className="w-4 h-4" /> Download PDF
            </button>
            {invoice.status !== 'PAID' && (
              <button 
                onClick={handlePayNow}
                disabled={payingId === invoice.id}
                className="flex items-center gap-2 px-5 py-2 text-sm bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {payingId === invoice.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Pay Now
              </button>
            )}
          </div>
        </div>

        {/* Invoice Document */}
        <div className="bg-[#0f0f13] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl shadow-black relative overflow-hidden">
          
          <div className="flex justify-between items-start border-b border-white/10 pb-8 mb-8">
            <div>
              <OrgAvatar size={56} />
              <h2 className="text-white font-bold text-xl">{org.name}</h2>
              {org.billingAddress && <p className="text-slate-500 text-sm mt-2 whitespace-pre-wrap">{org.billingAddress}</p>}
              {org.supportEmail && <p className="text-slate-500 text-sm mt-1">{org.supportEmail}</p>}
              {(org.phone || org.website) && (
                <p className="text-slate-500 text-sm">
                  {org.phone && <span>{org.phone}</span>}
                  {org.phone && org.website && <span> | </span>}
                  {org.website && <span>{org.website}</span>}
                </p>
              )}
            </div>
            <div className="text-right">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white/20 uppercase mb-2">Invoice</h1>
              <p className="text-white font-bold text-lg">{invoice.invoiceNumber}</p>
              
              <div className="flex items-center justify-end mt-4">
                 {invoice.status === 'PAID' ? (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-mono tracking-widest font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5"/> Paid in Full</span>
                  ) : invoice.status === 'OVERDUE' ? (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-mono tracking-widest font-bold uppercase bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-2"><AlertCircle className="w-3.5 h-3.5"/> Overdue</span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-mono tracking-widest font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-2"><Loader2 className="w-3.5 h-3.5"/> Pending Payment</span>
                  )}
              </div>
              
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mt-6 text-right text-slate-400">
                <span>Date of Issue:</span> <span className="text-white font-medium">{new Date(invoice.createdAt).toLocaleDateString()}</span>
                <span>Due Date:</span> <span className="text-white font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="mb-12 bg-white/5 p-6 rounded-2xl border border-white/5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Billed To</p>
            <h3 className="text-xl font-bold text-white mb-1">{invoice.clientName}</h3>
            {invoice.clientEmail && <p className="text-slate-400 text-sm">{invoice.clientEmail}</p>}
            {invoice.clientGst && <p className="text-slate-400 text-sm mt-2">GSTIN: {invoice.clientGst}</p>}
          </div>

          <table className="w-full text-sm text-left mb-8">
            <thead className="bg-white/5 text-xs uppercase text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 font-bold rounded-tl-lg">Description</th>
                <th className="px-4 py-3 font-bold text-right">Qty</th>
                <th className="px-4 py-3 font-bold text-right">Rate</th>
                <th className="px-4 py-3 font-bold text-right">Tax %</th>
                <th className="px-4 py-3 font-bold text-right rounded-tr-lg">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoice.items?.map((item: any, i: number) => (
                <tr key={i} className="group hover:bg-white/5 transition-colors">
                  <td className="px-4 py-5 text-white font-medium">{item.description}</td>
                  <td className="px-4 py-5 text-right text-slate-400">{item.quantity}</td>
                  <td className="px-4 py-5 text-right text-slate-400">{symbol}{item.unitPrice.toLocaleString()}</td>
                  <td className="px-4 py-5 text-right text-slate-400">{item.taxRate}%</td>
                  <td className="px-4 py-5 text-right font-bold text-white">{symbol}{(item.quantity * item.unitPrice).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-12">
            <div className="w-80 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-white font-medium">{symbol}{invoice.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">CGST</span>
                <span className="text-white font-medium">{symbol}{invoice.cgst?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">SGST</span>
                <span className="text-white font-medium">{symbol}{invoice.sgst?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">IGST</span>
                <span className="text-white font-medium">{symbol}{invoice.igst?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-2">
                <span className="font-bold uppercase tracking-widest text-sm text-blue-400">Total Due</span>
                <span className="text-3xl font-black text-white">{symbol}{invoice.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Notes & Terms</p>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">{invoice.notes || "Thank you for your business."}</p>
          </div>

        </div>

      </div>

      {/* Payment Sandbox Simulator Modal Overlay */}
      {showSandbox && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in-50 duration-200">
          <div className="bg-[#0f0f12] border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full relative shadow-2xl overflow-hidden">
            <div className="absolute right-0 top-0 w-36 h-36 bg-blue-600/10 rounded-full blur-2xl -z-10" />
            
            <button 
              onClick={() => setShowSandbox(false)} 
              className="absolute right-4 top-4 p-1.5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-blue-400">Payment Sandbox</span>
            </div>

            <h3 className="text-xl font-extrabold text-white mb-2">Simulate Transaction</h3>
            <p className="text-xs text-white/40 mb-6 leading-relaxed">
              No live credentials are configured. Use this simulator to trace and complete checkout flows locally.
            </p>

            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-6 space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-white/40">Invoice:</span>
                <span className="text-white font-bold">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Client:</span>
                <span className="text-white">{invoice.clientName}</span>
              </div>
              <div className="border-t border-white/5 my-1" />
              <div className="flex justify-between text-sm font-bold">
                <span className="text-blue-400">Total Due:</span>
                <span className="text-emerald-400">{symbol}{invoice.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                disabled={sandboxProcessing}
                onClick={handleSimulatePayment}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/15"
              >
                {sandboxProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Simulate Success
              </button>
              <button
                disabled={sandboxProcessing}
                onClick={() => {
                  toast.error("Payment transaction failed.")
                  setShowSandbox(false)
                }}
                className="w-full py-3 bg-red-950/20 hover:bg-red-950/40 text-red-500 border border-red-500/20 font-bold text-xs rounded-xl uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Simulate Failure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
