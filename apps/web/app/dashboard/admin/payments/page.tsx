import { useState } from "react"
import { DollarSign, Search, Filter, Download } from "lucide-react"
import { toast } from "sonner"

export default function SuperAdminPaymentsPage() {
  const [filterStatus, setFilterStatus] = useState<"All" | "Paid" | "Pending" | "Failed" | "Refunded">("All")
  const [searchQuery, setSearchQuery] = useState("")

  const [payments] = useState([
    { id: "p-101", amount: "₹49,999", garage: "Apex Auto Care", reseller: "Apex SaaS Partners", plan: "Enterprise Garage", date: "2026-09-26", status: "Paid" },
    { id: "p-102", amount: "₹29,999", garage: "City Auto Garage", reseller: "Direct Customer", plan: "Growth Garage", date: "2026-09-25", status: "Paid" },
    { id: "p-103", amount: "₹29,999", garage: "Speedy Motors", reseller: "Apex SaaS Partners", plan: "Growth Garage", date: "2026-09-24", status: "Paid" },
    { id: "p-104", amount: "₹14,999", garage: "Royal Auto Works", reseller: "Royal Resellers", plan: "Basic Garage", date: "2026-09-23", status: "Pending" },
    { id: "p-105", amount: "₹29,999", garage: "Metro Garage Works", reseller: "Direct Customer", plan: "Growth Garage", date: "2026-09-20", status: "Failed" },
  ])

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
            <p><strong>Reseller Partner:</strong> ${item.reseller}</p>
            <p><strong>Issuer:</strong> Grekam Technologies Pvt Ltd</p>
          </div>

          <div class="section">
            <table>
              <thead>
                <tr>
                  <th>Item / Plan Description</th>
                  <th>Subscription Period</th>
                  <th>Status</th>
                  <th>Total Billed Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${item.plan} (Annual License)</td>
                  <td>1 Year Unlimited Access</td>
                  <td>${item.status}</td>
                  <td class="total">${item.amount}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>Computer generated invoice. Grekam OS Platform Control Center.</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.garage.toLowerCase().includes(searchQuery.toLowerCase()) || p.reseller.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "All" || p.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-8 space-y-6 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Payments & Ledger</h1>
        <p className="text-xs text-zinc-400 mt-1">Platform payment transactions from Direct Garages and Resellers.</p>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by garage or reseller..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-semibold overflow-x-auto">
          {(["All", "Paid", "Pending", "Failed", "Refunded"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                filterStatus === st ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 text-zinc-400 uppercase text-[10px] font-semibold bg-white/[0.02]">
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Garage</th>
              <th className="py-3.5 px-4">Reseller</th>
              <th className="py-3.5 px-4">Plan</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredPayments.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-4 font-bold text-white text-sm">{p.amount}</td>
                <td className="py-3.5 px-4 font-semibold text-zinc-200">{p.garage}</td>
                <td className="py-3.5 px-4 text-zinc-400">{p.reseller}</td>
                <td className="py-3.5 px-4 text-zinc-300">{p.plan}</td>
                <td className="py-3.5 px-4 text-zinc-400">{p.date}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    p.status === "Paid" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    p.status === "Pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                    "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleDownloadInvoice(p)}
                    className="text-blue-400 hover:text-blue-300 p-1"
                    title="Download Official Invoice PDF"
                  >
                    <Download className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
