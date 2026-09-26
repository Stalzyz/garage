"use client"

import { useState } from "react"
import { DollarSign, Wallet, Download, Printer } from "lucide-react"
import { toast } from "sonner"

export default function ResellerEarningsPage() {
  const [earnings] = useState([
    { id: "earn-1", garage: "Apex Auto Care", plan: "Enterprise Garage", saleAmount: "₹49,999", yourEarnings: "₹12,499", status: "Paid", date: "2026-09-24" },
    { id: "earn-2", garage: "Speedy Motors", plan: "Growth Garage", saleAmount: "₹29,999", yourEarnings: "₹7,499", status: "Approved", date: "2026-09-22" },
    { id: "earn-3", garage: "Royal Auto Works", plan: "Basic Garage", saleAmount: "₹14,999", yourEarnings: "₹3,749", status: "Pending", date: "2026-09-18" },
    { id: "earn-4", garage: "City Garage Service", plan: "Growth Garage", saleAmount: "₹29,999", yourEarnings: "₹7,499", status: "Paid", date: "2026-09-10" },
  ])

  const handleDownloadStatement = (eItem?: any) => {
    toast.info("Generating PDF Payout Statement...")
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const item = eItem || { garage: "All Reseller Garages", yourEarnings: "₹31,246", date: "2026-09-26", id: "STATEMENT-2026-09" }

    printWindow.document.write(`
      <html>
        <head>
          <title>Reseller Commission Payout Statement - ${item.id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #111; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #6d28d9; }
            .meta { font-size: 12px; color: #555; text-align: right; }
            .section { margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px; }
            th { background: #f3f4f6; }
            .total { font-weight: bold; font-size: 16px; color: #6d28d9; }
            .footer { margin-top: 50px; font-size: 11px; color: #777; text-align: center; border-top: 1px solid #eee; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">GREKAM SAAS PARTNER</div>
              <div style="font-size: 13px; font-weight: bold; margin-top: 4px;">RESELLER COMMISSION STATEMENT</div>
            </div>
            <div class="meta">
              <p>Statement #: <strong>${item.id}</strong></p>
              <p>Date: <strong>${item.date}</strong></p>
              <p>Status: <strong style="color: #10b981;">OFFICIAL PAYOUT</strong></p>
            </div>
          </div>

          <div class="section">
            <p><strong>Issued To:</strong> Demo Reseller Partner (partner@reseller.com)</p>
            <p><strong>Platform:</strong> Grekam Garage Operating System</p>
          </div>

          <div class="section">
            <table>
              <thead>
                <tr>
                  <th>Description / Garage</th>
                  <th>Plan Type</th>
                  <th>Sale Amount</th>
                  <th>Commission Payout Rate</th>
                  <th>Net Earnings</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${item.garage}</td>
                  <td>Enterprise / Growth Garage</td>
                  <td>₹1,24,996</td>
                  <td>25% Wholesale Share</td>
                  <td class="total">${item.yourEarnings}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>Thank you for partnering with Grekam Garage Platform. Electronic computer-generated statement.</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="p-8 space-y-6 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Earnings & Commission Payouts</h1>
          <p className="text-xs text-zinc-400 mt-1">Track wholesale commission payouts, earnings status, and statement downloads.</p>
        </div>

        <button
          onClick={() => handleDownloadStatement()}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 transition-all"
        >
          <Download className="w-4 h-4" /> Download Payout Statement
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold">Total Earnings</span>
          <p className="text-2xl font-bold text-purple-400">₹31,246</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold">Pending Earnings</span>
          <p className="text-2xl font-bold text-amber-400">₹11,248</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold">Paid Earnings</span>
          <p className="text-2xl font-bold text-emerald-400">₹19,998</p>
        </div>
      </div>

      {/* Earnings Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 text-zinc-400 uppercase text-[10px] font-semibold bg-white/[0.02]">
              <th className="py-3.5 px-4">Garage</th>
              <th className="py-3.5 px-4">Plan</th>
              <th className="py-3.5 px-4">Sale Amount</th>
              <th className="py-3.5 px-4">Your Earnings</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-right">Statement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {earnings.map((e) => (
              <tr key={e.id} className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-4 font-semibold text-white">{e.garage}</td>
                <td className="py-3.5 px-4 text-zinc-400">{e.plan}</td>
                <td className="py-3.5 px-4 text-zinc-300">{e.saleAmount}</td>
                <td className="py-3.5 px-4 font-bold text-purple-400">{e.yourEarnings}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    e.status === "Paid" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    e.status === "Approved" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                    "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {e.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-zinc-400">{e.date}</td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleDownloadStatement(e)}
                    className="text-purple-400 hover:text-purple-300 p-1"
                    title="Download Statement"
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
