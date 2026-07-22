"use client"

import { useParams } from "next/navigation"
import { ChevronLeft, Send, Download, Loader2 } from "lucide-react"
import Link from "next/link"
import { useOrganization } from "@/context/OrganizationContext"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { useState } from "react"
import { useCurrency } from "@/hooks/useCurrency"
import { Modal } from "@/components/ui/modal"

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

export default function InvoiceBuilderPage() {
  const params = useParams()
  const org = useOrganization()
  const { symbol } = useCurrency()
  
  const { data: invoice, isLoading, mutate } = useApi<any>(`/finance/invoices/${params.id}`)
  const [isSending, setIsSending] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentData, setPaymentData] = useState({ amount: '', method: 'BANK_TRANSFER', transactionId: '', notes: '' })
  const [isRecordingPayment, setIsRecordingPayment] = useState(false)

  const handleRecordPayment = async () => {
    setIsRecordingPayment(true)
    try {
      await fetchApi(`/finance/invoices/${params.id}/payments`, {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(paymentData.amount),
          method: paymentData.method,
          transactionId: paymentData.transactionId,
          notes: paymentData.notes
        })
      })
      toast.success("Payment recorded successfully")
      setShowPaymentModal(false)
      setPaymentData({ amount: '', method: 'BANK_TRANSFER', transactionId: '', notes: '' })
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment")
    } finally {
      setIsRecordingPayment(false)
    }
  }

  const handleSend = async () => {
    if (!invoice?.clientEmail) {
      toast.error("Client email is missing on this invoice")
      return
    }
    setIsSending(true)
    try {
      await fetchApi(`/finance/invoices/${params.id}/send`, { method: 'POST' })
      toast.success("Invoice sent to client!")
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to send invoice")
    } finally {
      setIsSending(false)
    }
  }

  const handleDownload = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/finance/invoices/${params.id}/pdf`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-[#050508] text-white items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-white/50 font-mono text-sm uppercase tracking-widest">Loading Invoice...</p>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex flex-col h-full bg-[#050508] text-white items-center justify-center">
        <p className="text-red-400 font-mono text-sm uppercase tracking-widest">Invoice Not Found</p>
        <Link href="/dashboard/finance/invoices" className="mt-4 text-blue-400 hover:underline">Return to Invoices</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#050508] text-white overflow-hidden font-sans">
      
      {/* Header */}
      <div className="h-16 px-6 border-b border-white/5 bg-[#0a0a0f] shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/finance/invoices" className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Invoice Details</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {invoice.status !== 'PAID' && (
            <button 
              onClick={() => {
                setPaymentData({ ...paymentData, amount: String(invoice.totalAmount - (invoice.paidAmount || 0)) })
                setShowPaymentModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600/20 text-emerald-500 font-bold rounded-xl hover:bg-emerald-600/30 transition-all border border-emerald-500/20"
            >
              Record Payment
            </button>
          )}
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 text-sm bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-all border border-white/10">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button 
            onClick={handleSend}
            disabled={isSending || invoice.status === 'PAID'}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {invoice.status === 'SENT' ? 'Resend to Client' : invoice.status === 'PAID' ? 'Already Paid' : 'Send to Client'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden justify-center items-start pt-8 pb-16 custom-scrollbar bg-[#050508]">
        
        {/* Invoice Preview */}
        <div className="w-full max-w-3xl bg-[#0f0f13] border border-white/5 rounded-2xl p-10 shadow-2xl shadow-black h-max shrink-0">
          
          <div className="flex justify-between items-start border-b border-white/10 pb-8 mb-8">
            <div>
              <OrgAvatar size={48} />
              <h2 className="text-white font-bold text-lg">{org.name}</h2>
              {org.billingAddress && <p className="text-slate-500 text-sm mt-1 whitespace-pre-wrap">{org.billingAddress}</p>}
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
              <h1 className="text-4xl font-black tracking-tight text-white/20 uppercase mb-2">Invoice</h1>
              <p className="text-white font-bold">{invoice.invoiceNumber}</p>
              <div className="flex items-center justify-end mt-2">
                 {invoice.status === 'PAID' ? (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Paid</span>
                  ) : invoice.status === 'OVERDUE' ? (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-red-500/10 text-red-500 border border-red-500/20">Overdue</span>
                  ) : invoice.status === 'PARTIALLY_PAID' ? (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-sky-500/10 text-sky-500 border border-sky-500/20">Partially Paid</span>
                  ) : invoice.status === 'SENT' ? (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-blue-500/10 text-blue-500 border border-blue-500/20">Sent</span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">Draft</span>
                  )}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-4 text-right text-slate-400">
                <span>Date:</span> <span className="text-white font-medium">{new Date(invoice.createdAt).toLocaleDateString()}</span>
                <span>Due:</span> <span className="text-white font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Billed To</p>
            <h3 className="text-lg font-bold text-white">{invoice.clientName}</h3>
            {invoice.clientEmail && <p className="text-slate-400 text-sm mt-1">{invoice.clientEmail}</p>}
            {invoice.clientGst && <p className="text-slate-400 text-sm mt-1">GSTIN: {invoice.clientGst}</p>}
          </div>

          <table className="w-full text-sm text-left mb-8">
            <thead className="bg-white/5 text-xs uppercase text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 font-bold">Description</th>
                <th className="px-4 py-3 font-bold text-right">Qty</th>
                <th className="px-4 py-3 font-bold text-right">Rate</th>
                <th className="px-4 py-3 font-bold text-right">Disc %</th>
                <th className="px-4 py-3 font-bold text-right">Tax %</th>
                <th className="px-4 py-3 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoice.items?.map((item: any, i: number) => (
                <tr key={i}>
                  <td className="px-4 py-4 text-white font-medium">{item.description}</td>
                  <td className="px-4 py-4 text-right text-slate-400">{item.quantity}</td>
                  <td className="px-4 py-4 text-right text-slate-400">{symbol}{item.unitPrice.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right text-slate-400">{item.discountRate}%</td>
                  <td className="px-4 py-4 text-right text-slate-400">{item.taxRate}%</td>
                  <td className="px-4 py-4 text-right font-bold text-white">{symbol}{item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-12">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-white">{symbol}{invoice.subtotal?.toLocaleString()}</span>
              </div>
              {invoice.discountRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Overall Discount ({invoice.discountRate}%)</span>
                  <span className="text-red-400">-{symbol}{(invoice.subtotal * (invoice.discountRate / 100))?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">CGST</span>
                <span className="text-white">{symbol}{invoice.cgst?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">SGST</span>
                <span className="text-white">{symbol}{invoice.sgst?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">IGST</span>
                <span className="text-white">{symbol}{invoice.igst?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-3">
                <span className="font-bold uppercase tracking-widest text-sm text-blue-400">Total</span>
                <span className="text-xl font-bold text-white">{symbol}{invoice.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-400">
                <span className="text-sm">Total Paid</span>
                <span className="font-mono">{symbol}{invoice.paidAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-3">
                <span className="font-bold uppercase tracking-widest text-sm text-red-400">Amount Due</span>
                <span className="text-2xl font-black text-white">{symbol}{(invoice.totalAmount - (invoice.paidAmount || 0)).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Notes / Terms</p>
            <p className="text-sm text-slate-300 leading-relaxed mb-8">{invoice.notes || "Thank you for your business."}</p>
          </div>

          {org.bankName && (
            <div className="pt-8 border-t border-white/10">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Bank Transfer Details</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                <div>Bank Name: <span className="text-white font-medium">{org.bankName}</span></div>
                <div>Account Number: <span className="text-white font-medium font-mono">{org.bankAccountNo}</span></div>
                <div>IFSC Code: <span className="text-white font-medium font-mono">{org.bankIfsc}</span></div>
                <div>Branch: <span className="text-white font-medium">{org.bankBranch}</span></div>
              </div>
            </div>
          )}

          {invoice.payments?.length > 0 && (
            <div className="pt-8 mt-8 border-t border-white/10">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Payment History</p>
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase text-slate-500 border-b border-white/10">
                  <tr>
                    <th className="py-2">Date</th>
                    <th className="py-2">Method</th>
                    <th className="py-2">Txn ID</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoice.payments.map((p: any) => (
                    <tr key={p.id}>
                      <td className="py-3 text-slate-300">{new Date(p.paidAt).toLocaleDateString()}</td>
                      <td className="py-3 text-slate-400">{p.method}</td>
                      <td className="py-3 text-slate-400">{p.transactionId || '-'}</td>
                      <td className="py-3 text-right font-bold text-emerald-400">{symbol}{p.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

      {showPaymentModal && (
        <Modal onClose={() => setShowPaymentModal(false)}>
          <div className="p-6 w-[400px]">
            <h2 className="text-xl font-bold text-white mb-6">Record Payment</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{symbol}</span>
                  <input 
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-4 py-2 text-white outline-none focus:border-emerald-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Payment Method</label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                  className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500"
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="UPI">UPI</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Transaction ID / Ref</label>
                <input 
                  type="text"
                  value={paymentData.transactionId}
                  onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Notes</label>
                <textarea 
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500 h-20"
                  placeholder="Optional notes"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRecordPayment}
                  disabled={isRecordingPayment || !paymentData.amount}
                  className="px-6 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isRecordingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}
