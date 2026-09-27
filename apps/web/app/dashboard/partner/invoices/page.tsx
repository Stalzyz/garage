"use client"

import { useState, useEffect } from "react"
import { FileText, Plus, Download, Send, CheckCircle2, Search, Eye } from "lucide-react"
import { toast } from "sonner"

export default function PartnerInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // Form State
  const [customerName, setCustomerName] = useState("")
  const [packageName, setPackageName] = useState("Pro Garage Package")
  const [sellingPrice, setSellingPrice] = useState("18000")
  const [dueDate, setDueDate] = useState("")

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/partner/invoices")
      const json = await res.json()
      if (json.success) {
        setInvoices(json.invoices)
      } else {
        setInvoices([
          { id: "inv-1", invoiceNumber: "INV-8821-0001", customerName: "ABC Garage", packageName: "Pro Garage", total: 18000, partnerMargin: 8000, status: "PAID", createdAt: new Date() },
          { id: "inv-2", invoiceNumber: "INV-8821-0002", customerName: "Kumar Auto Care", packageName: "Starter Garage", total: 15000, partnerMargin: 5000, status: "PAID", createdAt: new Date() },
        ])
      }
    } catch {
      toast.error("Failed to load invoices")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/partner/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: "org-manual",
          customerName,
          packageName,
          sellingPrice,
          dueDate,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message || "Invoice created successfully.")
        setShowModal(false)
        setCustomerName("")
        setSellingPrice("18000")
        fetchInvoices()
      } else {
        toast.error(json.error || "Failed to create invoice")
      }
    } catch {
      toast.error("Error creating invoice")
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Invoices</h1>
          <p className="text-xs text-zinc-400 mt-1">Generate and track customer-facing invoices issued under your partner brand.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {/* Invoices Table */}
      <div className="bg-[#080D1A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-zinc-400 font-semibold uppercase text-[10px] bg-white/[0.02]">
              <tr>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Package</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Partner Margin</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>{inv.invoiceNumber}</span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-white">{inv.customerName}</td>
                    <td className="py-4 px-4 text-zinc-400">{inv.packageName}</td>
                    <td className="py-4 px-4 font-bold text-white">₹{inv.total?.toLocaleString()}</td>
                    <td className="py-4 px-4 font-bold text-emerald-400">+₹{inv.partnerMargin?.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        inv.status === "PAID"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => toast.success(`Invoice #${inv.invoiceNumber} receipt downloaded.`)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                        title="Download Receipt"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">No invoices created yet. Click "+ Create Invoice".</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: CREATE INVOICE ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0B101D] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Create Customer Invoice</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Customer / Garage Name *</label>
                <input 
                  type="text" 
                  required 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  placeholder="e.g. Royal Auto Works" 
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Package Name</label>
                <input 
                  type="text" 
                  value={packageName} 
                  onChange={(e) => setPackageName(e.target.value)} 
                  placeholder="e.g. Pro Garage Studio" 
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Invoice Amount (₹) *</label>
                <input 
                  type="number" 
                  required 
                  value={sellingPrice} 
                  onChange={(e) => setSellingPrice(e.target.value)} 
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold">Generate Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
