"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { ShieldCheck, CheckCircle2, CreditCard, Lock, Download, Loader2 } from "lucide-react"
import { useOrganization } from "@/context/OrganizationContext"

function OrgAvatar({ size = 32 }: { size?: number }) {
  const org = useOrganization()
  const initial = (org.name ?? 'G').charAt(0).toUpperCase()
  if (org.logoUrl) return (
    <img src={org.logoUrl} alt={org.name} style={{ width: size, height: size }} className="rounded-xl object-contain" />
  )
  return (
    <div style={{ width: size, height: size }} className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20">
      <span style={{ fontSize: Math.round(size * 0.4) }}>{initial}</span>
    </div>
  )
}

export default function PublicInvoicePage() {
  const params = useParams()
  const [isPaying, setIsPaying] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const org = useOrganization()

  // Mock Invoice Data
  const invoice = {
    invoiceNumber: "INV-2025-084",
    clientName: "Acme Corp",
    date: "2025-07-01",
    dueDate: "2025-07-15",
    notes: "Thank you for your business. Please remit payment within 14 days.",
    items: [
      { name: "Brand Strategy Session", description: "Half-day workshop", quantity: 1, rate: 1500 },
      { name: "UI Design Phase 1", description: "Homepage & Core Flows", quantity: 40, rate: 120 },
    ],
    status: isPaid ? "PAID" : "SENT"
  }

  const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  const tax = subtotal * 0.18
  const total = subtotal + tax

  const handlePayment = () => {
    setIsPaying(true)
    // Simulate Stripe Checkout API Call
    setTimeout(() => {
      setIsPaying(false)
      setIsPaid(true)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* Top Bar */}
      <div className="h-16 border-b border-white/5 bg-[#0a0a0f] sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 lg:px-24">
        <div className="flex items-center gap-3">
          <OrgAvatar size={32} />
          <span className="font-bold text-sm tracking-widest uppercase">{org.name}</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
          <ShieldCheck className="w-4 h-4" /> Secure Payment Portal
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-6">
        
        <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-8 md:p-16 shadow-2xl shadow-black relative overflow-hidden">
          
          {/* Status Badge */}
          {invoice.status === 'PAID' ? (
            <div className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-4 h-4" /> PAID IN FULL
            </div>
          ) : (
            <div className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              AWAITING PAYMENT
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start border-b border-white/10 pb-12 mb-12 mt-8 md:mt-0">
            <div>
              <OrgAvatar size={64} />
              <h2 className="text-white font-bold text-xl mt-4">{org.name}</h2>
              {org.billingAddress && <p className="text-slate-500 mt-2 whitespace-pre-wrap">{org.billingAddress}</p>}
              {org.supportEmail && <p className="text-slate-500 mt-1">{org.supportEmail}</p>}
              {(org.phone || org.website) && (
                <p className="text-slate-500 mt-1">
                  {org.phone && <span>{org.phone}</span>}
                  {org.phone && org.website && <span> | </span>}
                  {org.website && <a href={org.website} target="_blank" rel="noreferrer" className="hover:text-blue-400">{org.website}</a>}
                </p>
              )}
            </div>
            <div className="text-left md:text-right mt-8 md:mt-0">
              <h1 className="text-5xl font-black tracking-tight text-white/20 uppercase mb-4">Invoice</h1>
              <p className="text-white font-bold text-xl mb-6">{invoice.invoiceNumber}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-right text-slate-400">
                <span>Date Issued:</span> <span className="text-white font-medium">{invoice.date}</span>
                <span>Due Date:</span> <span className="text-white font-medium">{invoice.dueDate}</span>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Billed To</p>
            <h3 className="text-2xl font-bold text-white">{invoice.clientName}</h3>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/20 mb-12">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-xs uppercase text-slate-400 border-b border-white/10">
                <tr>
                  <th className="px-6 py-5 font-bold">Description</th>
                  <th className="px-6 py-5 font-bold text-right">Qty / Hrs</th>
                  <th className="px-6 py-5 font-bold text-right">Rate</th>
                  <th className="px-6 py-5 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoice.items.map((item, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-6">
                      <p className="font-bold text-white text-base">{item.name}</p>
                      <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                    </td>
                    <td className="px-6 py-6 text-right text-slate-300 font-medium">{item.quantity}</td>
                    <td className="px-6 py-6 text-right text-slate-300 font-medium">${item.rate.toLocaleString()}</td>
                    <td className="px-6 py-6 text-right font-bold text-white">${(item.quantity * item.rate).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Payment */}
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
            <div className="flex-1 order-2 md:order-1">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Notes</p>
              <p className="text-sm text-slate-300 leading-relaxed mb-8">{invoice.notes}</p>
              
              <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-sm transition-colors print:hidden">
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
            
            <div className="w-full md:w-80 space-y-4 order-1 md:order-2">
              <div className="flex justify-between text-base">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-white">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-slate-400">Tax (18%)</span>
                <span className="text-white">${tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-y border-white/10 py-6 my-4 bg-blue-600/5 -mx-6 px-6 md:mx-0 md:px-4 md:rounded-xl">
                <span className="font-bold uppercase tracking-widest text-blue-400">Total Due</span>
                <span className="text-3xl font-black text-white">${total.toLocaleString()}</span>
              </div>

              {!isPaid && (
                <div className="pt-4">
                  <button 
                    onClick={handlePayment}
                    disabled={isPaying}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
                  >
                    {isPaying ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                    {isPaying ? "Processing..." : "Pay via Stripe"}
                  </button>
                  <div className="flex items-center justify-center gap-1 mt-4 text-xs text-slate-500 font-medium">
                    <Lock className="w-3 h-3" /> Payments are secure and encrypted
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
