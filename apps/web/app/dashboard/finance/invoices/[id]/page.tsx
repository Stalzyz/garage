"use client"

import { useParams } from "next/navigation"
import { ChevronLeft, Send, Download, Loader2, Phone, Mail, Globe, Instagram, Linkedin, Youtube } from "lucide-react"
import Link from "next/link"
import { useOrganization } from "@/context/OrganizationContext"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { useState } from "react"
import { useCurrency } from "@/hooks/useCurrency"
import { Modal } from "@/components/ui/modal"
import { numberToWordsIN } from "@/lib/utils"

export default function InvoiceDetailsPage() {
  const params = useParams()
  const org = useOrganization()
  const { symbol } = useCurrency()
  
  const { data: invoice, isLoading, mutate } = useApi<any>(`/finance/invoices/${params.id}`)
  const [isSending, setIsSending] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentData, setPaymentData] = useState({ amount: '', method: 'BANK_TRANSFER', transactionId: '', notes: '' })
  const [isRecordingPayment, setIsRecordingPayment] = useState(false)

  const isAcademy = invoice?.businessUnit === 'ACADEMY'
  const companyName = isAcademy ? `${org.name || 'Grekam'} Academy` : (org.name || 'Grekam Visuals')

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
    window.open(`/api/v1/finance/invoices/${params.id}/pdf`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-[#050508] text-white items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
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

  const wordsAmount = numberToWordsIN(invoice.totalAmount || 0)

  return (
    <div className="flex flex-col h-full bg-[#050508] text-white overflow-hidden font-sans">
      
      {/* Header Bar */}
      <div className="h-16 px-6 border-b border-white/5 bg-[#0a0a0f] shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/finance/invoices" className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Invoice #{invoice.invoiceNumber}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {invoice.status !== 'PAID' && (
            <button 
              onClick={() => {
                setPaymentData({ ...paymentData, amount: String(invoice.totalAmount - (invoice.paidAmount || 0)) })
                setShowPaymentModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition-all border border-emerald-500/30"
            >
              Record Payment
            </button>
          )}
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 text-xs bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-all border border-white/10">
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button 
            onClick={handleSend}
            disabled={isSending || invoice.status === 'PAID'}
            className="flex items-center gap-2 px-5 py-2 text-xs bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {invoice.status === 'SENT' ? 'Resend to Client' : invoice.status === 'PAID' ? 'Already Paid' : 'Send to Client'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-y-auto justify-center items-start py-8 px-4 custom-scrollbar bg-[#090a0f]">
        
        {/* Printable/Visual Invoice Document Canvas */}
        <div className="w-full max-w-4xl bg-white text-slate-900 rounded-2xl p-10 shadow-2xl space-y-6 border border-slate-200">
          
          {/* Top Brand Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  {org.name || "Grekam"} <span className="text-emerald-600">Visual<sup>+</sup></span>
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
                by {org.name || "Grekam"}.
              </p>
              <p className="text-[10px] tracking-widest text-slate-400 font-semibold pt-1">
                Ideas · Design · Digital Growth
              </p>

              <div className="pt-4 space-y-0.5">
                <h3 className="font-bold text-slate-900 text-sm">{companyName}</h3>
                <p className="text-xs text-slate-600">{org.billingAddress || "Coimbatore, Tamil Nadu, India – 641024"}</p>
                {org.gstNumber && <p className="text-xs text-slate-600 font-mono">GSTIN : {org.gstNumber}</p>}
                <p className="text-xs text-slate-600 font-mono">PAN : {org.gstNumber?.slice(2, 12) || "HCCPS5424M"}</p>
              </div>
            </div>

            {/* Right Meta Column */}
            <div className="text-right space-y-3">
              <h1 className="text-3xl font-black tracking-tight text-[#064e3b] uppercase">
                {invoice.isProforma ? "PROFORMA INVOICE" : "TAX INVOICE"}
              </h1>

              <div className="inline-grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-right pt-2">
                <span className="text-slate-500 font-medium">Invoice No.</span>
                <span className="font-bold text-slate-900 font-mono">: {invoice.invoiceNumber}</span>
                
                <span className="text-slate-500 font-medium">Invoice Date</span>
                <span className="font-bold text-slate-900">: {new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                
                <span className="text-slate-500 font-medium">Due Date</span>
                <span className="font-bold text-slate-900">: {new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                
                <span className="text-slate-500 font-medium">Payment Status</span>
                <div className="flex justify-end">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {invoice.status === 'PAID' ? 'Paid' : 'Pending'}
                  </span>
                </div>

                <span className="text-slate-500 font-medium">Place of Supply</span>
                <span className="font-bold text-slate-900">: Tamil Nadu (33)</span>

                <span className="text-slate-500 font-medium">Reverse Charge</span>
                <span className="font-bold text-slate-900">: No</span>
              </div>
            </div>
          </div>

          {/* 2 Mint Green Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-xl p-5 space-y-1">
              <p className="text-xs font-bold text-[#064e3b] uppercase tracking-wider mb-2">Bill To</p>
              <p className="font-bold text-slate-900 text-sm">{invoice.clientName}</p>
              {invoice.clientAddress && <p className="text-xs text-slate-600">{invoice.clientAddress}</p>}
              <p className="text-xs text-slate-600">Tamil Nadu, India</p>
              {invoice.clientGst && <p className="text-xs text-slate-600 font-mono">GSTIN : {invoice.clientGst}</p>}
              <p className="text-xs text-slate-600">State : Tamil Nadu (33)</p>
            </div>

            <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-xl p-5 flex flex-col justify-center space-y-2">
              <h4 className="font-bold text-[#064e3b] text-sm">Thank you for choosing {companyName}!</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Designing bold ideas for a brighter tomorrow.
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden pt-2">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#055740] text-white font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 text-center w-12">#</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">HSN/SAC</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price ({symbol})</th>
                  <th className="py-3 px-4 text-right">Amount ({symbol})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items?.map((item: any, idx: number) => (
                  <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-500">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.description}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-600">{item.hsnCode || '998313'}</td>
                    <td className="py-3.5 px-4 text-center font-medium">{item.quantity}</td>
                    <td className="py-3.5 px-4 text-right font-mono">{item.unitPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-900">{item.total?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Words Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
            <div className="md:col-span-7 space-y-4">
              <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-xl p-4">
                <p className="text-[11px] font-bold text-[#064e3b] uppercase tracking-wider mb-1">Amount in Words</p>
                <p className="text-xs font-bold text-slate-800">{wordsAmount}</p>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs divide-y divide-slate-100">
                <div className="flex justify-between py-2.5 px-4">
                  <span className="text-slate-600 font-medium">Subtotal</span>
                  <span className="font-bold text-slate-900 font-mono">{symbol} {invoice.subtotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {invoice.cgst > 0 && (
                  <div className="flex justify-between py-2.5 px-4">
                    <span className="text-slate-600 font-medium">CGST @ 9%</span>
                    <span className="font-bold text-slate-900 font-mono">{symbol} {invoice.cgst?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {invoice.sgst > 0 && (
                  <div className="flex justify-between py-2.5 px-4">
                    <span className="text-slate-600 font-medium">SGST @ 9%</span>
                    <span className="font-bold text-slate-900 font-mono">{symbol} {invoice.sgst?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {invoice.igst > 0 && (
                  <div className="flex justify-between py-2.5 px-4">
                    <span className="text-slate-600 font-medium">IGST @ 18%</span>
                    <span className="font-bold text-slate-900 font-mono">{symbol} {invoice.igst?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 px-4 bg-[#f0fdf4] text-[#064e3b] font-bold border-t border-[#dcfce7]">
                  <span className="text-sm">Total Amount ({symbol})</span>
                  <span className="text-base font-black font-mono">{symbol} {invoice.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Authorized Signatory */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 border-t border-slate-100">
            <div className="md:col-span-8 space-y-1.5">
              <p className="text-xs font-bold text-slate-900">Notes</p>
              <ol className="text-[11px] text-slate-600 space-y-1 list-none pl-0">
                <li>1. This is a computer generated invoice and does not require a signature.</li>
                <li>2. Services provided under {companyName}.</li>
                <li>3. Payment once made is non-refundable.</li>
                <li>4. For any billing queries, contact <span className="text-emerald-700 font-semibold">{org.supportEmail || 'support@grekam.in'}</span>.</li>
                <li>5. Thank you for being a valued client!</li>
              </ol>
            </div>

            <div className="md:col-span-4 flex flex-col items-center justify-end text-center pt-4 md:pt-0">
              <p className="text-xs font-bold text-slate-900 mb-6">For {companyName}</p>
              <div className="w-32 border-b border-slate-300 mb-1"></div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Authorized Signatory</p>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-full px-6 py-3 flex flex-wrap justify-between items-center text-xs text-slate-600 gap-4 mt-8">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 bg-[#055740] text-white px-3 py-1 rounded-full text-[11px] font-bold">
                <Phone className="w-3 h-3" /> {org.phone || "+91 422 123 4567"}
              </span>
              <span className="flex items-center gap-1.5 bg-[#055740] text-white px-3 py-1 rounded-full text-[11px] font-bold">
                <Mail className="w-3 h-3" /> {org.supportEmail || "support@grekam.in"}
              </span>
              <span className="flex items-center gap-1.5 bg-[#055740] text-white px-3 py-1 rounded-full text-[11px] font-bold">
                <Globe className="w-3 h-3" /> {org.website || "agency.grekam.in"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-400 font-medium text-[11px]">
              <Instagram className="w-3.5 h-3.5 text-slate-600" />
              <Linkedin className="w-3.5 h-3.5 text-slate-600" />
              <Youtube className="w-3.5 h-3.5 text-slate-600" />
              <span>Design · Develop · Grow</span>
            </div>
          </div>

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

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRecordPayment}
                  disabled={isRecordingPayment || !paymentData.amount || Number(paymentData.amount) <= 0}
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
