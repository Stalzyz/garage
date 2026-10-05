"use client"

import { useParams } from "next/navigation"
import { AlertCircle, CheckCircle2, ChevronLeft, Clock, CreditCard, Download, Loader2, ShieldCheck, X } from "lucide-react"
import Link from "next/link"
import { useOrganization } from "@/context/OrganizationContext"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { useState } from "react"
import { useCurrency } from "@/hooks/useCurrency"

function OrgAvatar() {
  const org = useOrganization()
  const initial = (org.name ?? 'G').charAt(0).toUpperCase()
  if (org.logoUrl) return (
    <img 
      src={org.logoUrl} 
      alt={org.name} 
      className="max-h-16 max-w-[220px] w-auto h-auto object-contain object-left rounded-xl mb-4"
      onError={(e) => {
        (e.currentTarget as HTMLElement).style.display = 'none';
        const fallback = (e.currentTarget.parentElement?.querySelector('.logo-fallback') as HTMLElement);
        if (fallback) fallback.style.display = 'flex';
      }}
    />
  )
  return (
    <div className="h-14 px-4 min-w-[56px] rounded-xl bg-[#49abc9]/20 border border-[#49abc9]/30 text-[#49abc9] font-black text-xl flex items-center justify-center mb-4 logo-fallback">
      <span>{initial}</span>
    </div>
  )
}

export default function PortalInvoicePreviewPage() {
  const params = useParams()
  const org = useOrganization()
  const { symbol } = useCurrency()
  
  const { data: invoice, isLoading, mutate } = useApi<any>(`/portal/invoices/${params.id}`)
  
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
          handler: async function (response: any) {
            toast.success("Payment completed successfully!")
            try {
              await fetchApi(`/finance/invoices/${invoice.id}/payments`, {
                method: 'POST',
                body: JSON.stringify({
                  amount: res.amount / 100,
                  method: 'RAZORPAY',
                  transactionId: response.razorpay_payment_id || response.razorpay_order_id,
                  notes: `Online Razorpay Payment: ${response.razorpay_payment_id || ''}`
                })
              })
            } catch (e) {
              console.warn("Payment confirmation captured by webhook", e)
            }
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
    window.open(`/api/v1/finance/invoices/${params.id}/pdf`, '_blank')
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
    <div className="min-h-screen bg-[#000000] text-white font-sans py-8 px-4 relative">
      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/portal/invoices" className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors bg-white/[0.05] hover:bg-white/[0.08] px-3.5 py-2 rounded-lg border border-white/[0.08]">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Invoices
          </Link>
          
          <div className="flex items-center gap-2.5">
            <button onClick={handleDownload} className="flex items-center gap-1.5 px-3.5 py-2 text-xs bg-white/[0.05] hover:bg-white/[0.08] text-white font-medium rounded-lg transition-colors border border-white/[0.08]">
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
            {invoice.status !== 'PAID' && (
              <button 
                onClick={handlePayNow}
                disabled={payingId === invoice.id}
                className="flex items-center gap-1.5 px-4 py-2 text-xs bg-[#0A84FF] hover:bg-[#0071E3] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {payingId === invoice.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                Pay Now
              </button>
            )}
          </div>
        </div>

        {/* Invoice Document */}
        <div className="bg-[#161618] border border-white/[0.08] rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          
          <div className="flex justify-between items-start border-b border-white/[0.06] pb-6 mb-6">
            <div>
              <OrgAvatar />
              <h2 className="text-white font-semibold text-lg">{org.name}</h2>
              {org.billingAddress && <p className="text-white/40 text-xs mt-1.5 whitespace-pre-wrap">{org.billingAddress}</p>}
              {org.supportEmail && <p className="text-white/40 text-xs mt-0.5">{org.supportEmail}</p>}
              {(org.phone || org.website) && (
                <p className="text-white/40 text-xs mt-0.5">
                  {org.phone && <span>{org.phone}</span>}
                  {org.phone && org.website && <span> | </span>}
                  {org.website && <span>{org.website}</span>}
                </p>
              )}
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold tracking-tight text-white/20 uppercase mb-1">Invoice</h1>
              <p className="text-white font-mono font-semibold text-sm">{invoice.invoiceNumber}</p>
              
              <div className="flex items-center justify-end mt-3">
                 {invoice.status === 'PAID' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#30D158]/10 text-[#30D158] border border-[#30D158]/20 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3"/> Paid</span>
                  ) : invoice.status === 'OVERDUE' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FF453A]/10 text-[#FF453A] border border-[#FF453A]/20 flex items-center gap-1.5"><AlertCircle className="w-3 h-3"/> Overdue</span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FF9F0A]/10 text-[#FF9F0A] border border-[#FF9F0A]/20 flex items-center gap-1.5"><Clock className="w-3 h-3"/> Pending</span>
                  )}
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-4 text-right text-white/40">
                <span>Issue Date:</span> <span className="text-white/80 font-medium">{new Date(invoice.createdAt).toLocaleDateString()}</span>
                <span>Due Date:</span> <span className="text-white/80 font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="mb-8 bg-[#121214] p-4 rounded-xl border border-white/[0.06]">
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/40 mb-1">Billed To</p>
            <h3 className="text-sm font-semibold text-white">{invoice.clientName}</h3>
            {invoice.clientEmail && <p className="text-white/40 text-xs mt-0.5">{invoice.clientEmail}</p>}
            {invoice.clientGst && <p className="text-white/40 text-xs mt-1 font-mono">GSTIN: {invoice.clientGst}</p>}
          </div>

          <table className="w-full text-xs text-left mb-6">
            <thead className="bg-[#121214] text-[11px] uppercase text-white/40 border-b border-white/[0.06]">
              <tr>
                <th className="px-3 py-2.5 font-medium rounded-l-lg">Description</th>
                <th className="px-3 py-2.5 font-medium text-right">Qty</th>
                <th className="px-3 py-2.5 font-medium text-right">Rate</th>
                <th className="px-3 py-2.5 font-medium text-right">Tax</th>
                <th className="px-3 py-2.5 font-medium text-right rounded-r-lg">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {invoice.items?.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-3 py-3 text-white font-medium">{item.description}</td>
                  <td className="px-3 py-3 text-right text-white/50 font-mono">{item.quantity}</td>
                  <td className="px-3 py-3 text-right text-white/50 font-mono">{symbol}{item.unitPrice?.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right text-white/50 font-mono">{item.taxRate}%</td>
                  <td className="px-3 py-3 text-right font-medium text-white font-mono">{symbol}{(item.quantity * item.unitPrice)?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-8">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/40">Subtotal</span>
                <span className="text-white/80 font-mono font-medium">{symbol}{invoice.subtotal?.toLocaleString()}</span>
              </div>
              {invoice.cgst > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/40">CGST</span>
                  <span className="text-white/80 font-mono font-medium">{symbol}{invoice.cgst?.toLocaleString()}</span>
                </div>
              )}
              {invoice.sgst > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/40">SGST</span>
                  <span className="text-white/80 font-mono font-medium">{symbol}{invoice.sgst?.toLocaleString()}</span>
                </div>
              )}
              {invoice.igst > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/40">IGST</span>
                  <span className="text-white/80 font-mono font-medium">{symbol}{invoice.igst?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-white/[0.08] pt-3 mt-1">
                <span className="font-medium text-xs text-white/70">Total Due</span>
                <span className="text-xl font-bold font-mono text-white">{symbol}{invoice.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.06]">
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/40 mb-1">Notes & Terms</p>
            <p className="text-xs text-white/50 leading-relaxed max-w-2xl">{invoice.notes || "Thank you for your business."}</p>
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
