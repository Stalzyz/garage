"use client"

import { useApi, fetchApi } from "@/lib/useApi"
import { CreditCard, Download, FileText, Loader2, X, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function PortalInvoicesPage() {
  const { data, isLoading, mutate } = useApi<any>("/finance/invoices")
  const invoices = data?.data || []
  
  const [payingId, setPayingId] = useState<string | null>(null)
  
  // Sandbox Simulator State
  const [showSandbox, setShowSandbox] = useState(false)
  const [sandboxInvoice, setSandboxInvoice] = useState<any>(null)
  const [sandboxProcessing, setSandboxProcessing] = useState(false)

  // Dynamically load Razorpay checkout script
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

  const handlePayNow = async (invoiceId: string) => {
    setPayingId(invoiceId)
    try {
      const res = await fetchApi<any>(`/finance/invoices/${invoiceId}/pay`, {
        method: 'POST',
        body: JSON.stringify({})
      })

      if (res?.isLive) {
        // Load Script and Launch Razorpay
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
          name: "Grekam Visuals",
          description: `Invoice ${res.orderId || invoiceId}`,
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
        // Open Sandbox Simulator
        const targetInvoice = invoices.find((inv: any) => inv.id === invoiceId)
        setSandboxInvoice(targetInvoice)
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
    if (!sandboxInvoice) return
    setSandboxProcessing(true)
    try {
      await fetchApi(`/finance/invoices/${sandboxInvoice.id}/mock-pay`, {
        method: 'POST',
        body: JSON.stringify({})
      })
      toast.success(`Payment simulated successfully for Invoice ${sandboxInvoice.invoiceNumber}!`)
      setShowSandbox(false)
      setSandboxInvoice(null)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to complete simulated payment")
    } finally {
      setSandboxProcessing(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-[#050505] text-white min-h-screen relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Invoices & Billing</h1>
        <p className="text-white/50 text-sm">Manage your payments and download past invoices.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-white/50">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
            <p className="text-sm font-mono uppercase tracking-widest">Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-white/50">
            <FileText className="w-12 h-12 mb-4 opacity-30 text-emerald-500" />
            <h3 className="text-lg font-bold text-white mb-2">No Invoices</h3>
            <p className="text-sm text-white/40">You're all caught up! No invoices found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-black/40 border-b border-white/10 text-[10px] font-mono tracking-widest uppercase text-white/50">
                <tr>
                  <th className="px-6 py-4 font-bold">Invoice ID</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map((invoice: any) => (
                  <tr key={invoice.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{invoice.invoiceNumber || invoice.id.slice(0, 8).toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4 text-white/60 text-xs">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-white">
                      {invoice.currency === 'INR' ? '₹' : '$'}{invoice.totalAmount?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4">
                      {invoice.status === 'PAID' ? (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Paid</span>
                      ) : invoice.status === 'OVERDUE' ? (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-red-500/10 text-red-500 border border-red-500/20">Overdue</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white" title="Download PDF">
                          <Download className="w-4 h-4" />
                        </button>
                        {invoice.status !== 'PAID' && (
                          <button 
                            disabled={payingId === invoice.id}
                            onClick={() => handlePayNow(invoice.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-[10px] rounded-lg transition-colors disabled:opacity-50 shadow-md shadow-blue-500/10"
                          >
                            {payingId === invoice.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CreditCard className="w-3 h-3" />}
                            Pay Now
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Sandbox Simulator Modal Overlay */}
      {showSandbox && sandboxInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in-50 duration-200">
          <div className="bg-[#0f0f12] border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full relative shadow-2xl overflow-hidden">
            <div className="absolute right-0 top-0 w-36 h-36 bg-blue-600/10 rounded-full blur-2xl -z-10" />
            
            <button 
              onClick={() => {
                setShowSandbox(false)
                setSandboxInvoice(null)
              }} 
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

            {/* Invoice Review Box */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-6 space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-white/40">Invoice:</span>
                <span className="text-white font-bold">{sandboxInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Client:</span>
                <span className="text-white">{sandboxInvoice.clientName}</span>
              </div>
              <div className="border-t border-white/5 my-1" />
              <div className="flex justify-between text-sm font-bold">
                <span className="text-blue-400">Total Due:</span>
                <span className="text-emerald-400">
                  {sandboxInvoice.currency === 'INR' ? '₹' : '$'}{sandboxInvoice.totalAmount?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Options */}
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
                  setSandboxInvoice(null)
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

