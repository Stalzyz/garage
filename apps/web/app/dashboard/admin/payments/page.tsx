"use client"

import { useState, useEffect } from "react"
import { DollarSign, Search, Filter, Download, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function SuperAdminPaymentsPage() {
  const [filterStatus, setFilterStatus] = useState<"All" | "Paid" | "Pending" | "Failed" | "Refunded">("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/payments?status=${filterStatus}`)
      const data = await res.json()
      if (data.success && data.payments) {
        setPayments(data.payments)
      } else {
        setPayments([])
      }
    } catch {
      toast.error("Failed to fetch payments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [filterStatus])

  const handleDownloadInvoice = (item: any) => {
    toast.info(`Generating official receipt for ${item.garage}...`)
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Grekam OS SaaS Invoice - ${item.id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #111; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .meta { font-size: 12px; color: #555; text-align: right; }
            .section { margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px; }
            th { background: #f3f4f6; }
            .total { font-weight: bold; font-size: 16px; color: #2563eb; }
            .footer { margin-top: 50px; font-size: 11px; color: #777; text-align: center; border-top: 1px solid #eee; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">GREKAM SAAS PLATFORM</div>
              <div style="font-size: 13px; font-weight: bold; margin-top: 4px;">OFFICIAL SUBSCRIPTION INVOICE</div>
            </div>
            <div class="meta">
              <p>Invoice #: <strong>${item.id}</strong></p>
              <p>Date: <strong>${item.date}</strong></p>
              <p>Status: <strong style="color: #10b981;">${item.status.toUpperCase()}</strong></p>
            </div>
          </div>

          <div class="section">
            <p><strong>Billed To:</strong> ${item.garage}</p>
            <p><strong>Partner Entity:</strong> ${item.reseller}</p>
            <p><strong>Issuer:</strong> Grekam Technologies Pvt Ltd</p>
          </div>

          <div class="section">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Reference</th>
                  <th style="text-align: right;">Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${item.garage} (${item.plan})</td>
                  <td>${item.utrNumber || "Prepaid Float / Direct"}</td>
                  <td style="text-align: right;">${item.amount}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="text-align: right; font-weight: bold;">Grand Total:</td>
                  <td class="total" style="text-align: right;">${item.amount}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="footer">
            This is a computer-generated invoice from Grekam OS Platform. All taxes and compliance handled per GST norms.
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const filteredPayments = payments.filter(p =>
    (p.garage || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.reseller || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.id || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Top Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments & Bank Float Ledger</h1>
          <p className="text-xs text-zinc-400 mt-1">Audit trail of all direct customer subscriptions and partner float deposits.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPayments}
            className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 flex-wrap">
          {(["All", "Paid", "Pending", "Failed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === status
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search payments by description, partner, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-zinc-400 font-semibold uppercase text-[10px] bg-white/[0.02]">
              <tr>
                <th className="py-4 px-6">Transaction Date</th>
                <th className="py-4 px-6">Description / Transaction</th>
                <th className="py-4 px-6">Partner / Source</th>
                <th className="py-4 px-6">Mode / Plan</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">Loading transactions from database...</td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">No payment transactions recorded yet.</td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="py-4 px-6 text-zinc-400 whitespace-nowrap font-mono">{p.date}</td>
                    <td className="py-4 px-6 font-semibold text-white">
                      <div>{p.garage}</div>
                      {p.utrNumber && <div className="text-[10px] text-blue-400 font-mono">Ref: {p.utrNumber}</div>}
                    </td>
                    <td className="py-4 px-6 text-zinc-400">{p.reseller}</td>
                    <td className="py-4 px-6">{p.plan}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.status === "Paid" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : p.status === "Pending"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-white font-mono">{p.amount}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(p)}
                        className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white transition"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
