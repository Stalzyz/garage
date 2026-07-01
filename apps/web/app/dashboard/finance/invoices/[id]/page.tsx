"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { ChevronLeft, Send, Download, Printer, Plus, Trash2, DollarSign } from "lucide-react"
import Link from "next/link"
import { useOrganization } from "@/context/OrganizationContext"

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
  
  const [formData, setFormData] = useState({
    invoiceNumber: "INV-2025-084",
    clientName: "Acme Corp",
    date: "2025-07-01",
    dueDate: "2025-07-15",
    notes: "Thank you for your business. Please remit payment within 14 days."
  })

  const [items, setItems] = useState([
    { name: "Brand Strategy Session", description: "Half-day workshop", quantity: 1, rate: 1500 },
    { name: "UI Design Phase 1", description: "Homepage & Core Flows", quantity: 40, rate: 120 },
  ])

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  const tax = subtotal * 0.18 // 18% tax
  const total = subtotal + tax

  return (
    <div className="flex flex-col h-full bg-[#050508] text-white overflow-hidden font-sans">
      
      {/* Header */}
      <div className="h-16 px-6 border-b border-white/5 bg-[#0a0a0f] shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/finance/invoices" className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Invoice Builder</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-all border border-white/10">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button className="flex items-center gap-2 px-5 py-2 text-sm bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">
            <Send className="w-4 h-4" /> Send to Client
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column - Builder Controls */}
        <div className="w-1/2 flex flex-col border-r border-white/5 bg-[#0a0a0f]">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
            
            <div className="space-y-4">
              <h3 className="text-blue-400 font-bold text-sm uppercase tracking-widest mb-4">Invoice Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Invoice Number</label>
                  <input value={formData.invoiceNumber} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Client</label>
                  <input value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Issue Date</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Due Date</label>
                  <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-blue-400 font-bold text-sm uppercase tracking-widest">Line Items</h3>
                <button onClick={() => setItems([...items, { name: "", description: "", quantity: 1, rate: 0 }])} className="flex items-center gap-1 text-xs font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:text-white text-white/70">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10 relative group">
                    <button onClick={() => setItems(items.filter((_, i) => i !== index))} className="absolute -right-2 -top-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      <Trash2 className="w-3 h-3" />
                    </button>
                    
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-12">
                        <input value={item.name} onChange={(e) => { const n = [...items]; n[index].name = e.target.value; setItems(n) }} placeholder="Item Name" className="w-full bg-transparent border-b border-white/10 px-2 py-1 text-sm font-bold focus:outline-none focus:border-blue-500 mb-2" />
                      </div>
                      <div className="col-span-4 mt-2">
                        <label className="text-[10px] text-white/30 uppercase font-bold block mb-1">Qty / Hrs</label>
                        <input type="number" value={item.quantity} onChange={(e) => { const n = [...items]; n[index].quantity = Number(e.target.value); setItems(n) }} className="w-full bg-black/50 border border-white/5 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                      </div>
                      <div className="col-span-4 mt-2">
                        <label className="text-[10px] text-white/30 uppercase font-bold block mb-1">Rate</label>
                        <input type="number" value={item.rate} onChange={(e) => { const n = [...items]; n[index].rate = Number(e.target.value); setItems(n) }} className="w-full bg-black/50 border border-white/5 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                      </div>
                      <div className="col-span-4 mt-2">
                        <label className="text-[10px] text-white/30 uppercase font-bold block mb-1">Amount</label>
                        <div className="w-full bg-black/20 rounded-lg px-2 py-1.5 text-sm text-emerald-400 font-bold">
                          ${(item.quantity * item.rate).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column - Live Preview */}
        <div className="w-1/2 bg-[#050508] p-8 flex justify-center overflow-y-auto custom-scrollbar">
          
          <div className="w-full max-w-2xl bg-[#0f0f13] border border-white/5 rounded-2xl p-10 shadow-2xl shadow-black h-max">
            
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
                <p className="text-white font-bold">{formData.invoiceNumber}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-4 text-right text-slate-400">
                  <span>Date:</span> <span className="text-white font-medium">{formData.date}</span>
                  <span>Due:</span> <span className="text-white font-medium">{formData.dueDate}</span>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Billed To</p>
              <h3 className="text-lg font-bold text-white">{formData.clientName}</h3>
            </div>

            <table className="w-full text-sm text-left mb-8">
              <thead className="bg-white/5 text-xs uppercase text-slate-400 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 font-bold">Description</th>
                  <th className="px-4 py-3 font-bold text-right">Qty</th>
                  <th className="px-4 py-3 font-bold text-right">Rate</th>
                  <th className="px-4 py-3 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4 text-white font-medium">{item.name}</td>
                    <td className="px-4 py-4 text-right text-slate-400">{item.quantity}</td>
                    <td className="px-4 py-4 text-right text-slate-400">${item.rate.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right font-bold text-white">${(item.quantity * item.rate).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-12">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-white">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Tax (18%)</span>
                  <span className="text-white">${tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/10 pt-3">
                  <span className="font-bold uppercase tracking-widest text-sm text-blue-400">Total Due</span>
                  <span className="text-2xl font-black text-white">${total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Notes / Terms</p>
              <p className="text-sm text-slate-300 leading-relaxed">{formData.notes}</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
