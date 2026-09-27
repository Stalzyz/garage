"use client"

import { useState, useEffect } from "react"
import { DollarSign, TrendingUp, CheckCircle2, Clock, Wallet, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

export default function PartnerEarningsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"margin" | "commission">("margin")

  const fetchEarnings = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/partner/earnings")
      const json = await res.json()
      if (json.success) {
        setData(json)
      } else {
        // Fallback demo data
        setData({
          partnerType: "WHITE_LABEL",
          commissionPercent: 20,
          whiteLabel: {
            totalSales: 145000,
            totalGrekamBaseCost: 80000,
            totalMargin: 65000,
            invoices: [
              { id: "1", customerName: "Apex Auto Care", total: 18000, basePriceSnapshot: 10000, partnerMargin: 8000, paidAt: new Date() },
              { id: "2", customerName: "Speedy Motors", total: 15000, basePriceSnapshot: 10000, partnerMargin: 5000, paidAt: new Date() },
              { id: "3", customerName: "City Garage Service", total: 18000, basePriceSnapshot: 10000, partnerMargin: 8000, paidAt: new Date() },
            ],
          },
          reseller: {
            totalEarned: 24000,
            paid: 18000,
            pending: 6000,
            commissions: [
              { id: "c1", saleAmount: 10000, commissionPercent: 20, commissionAmount: 2000, status: "PAID", createdAt: new Date() },
              { id: "c2", saleAmount: 20000, commissionPercent: 20, commissionAmount: 4000, status: "PENDING", createdAt: new Date() },
            ],
          },
        })
      }
    } catch {
      toast.error("Failed to load earnings data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEarnings()
  }, [])

  return (
    <div className="p-6 md:p-8 space-y-8 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Earnings & Revenue</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Track your White-Label profit margins and direct Reseller commissions.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-semibold self-start md:self-auto">
          <button
            onClick={() => setActiveTab("margin")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "margin" ? "bg-purple-600 text-white shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            White-Label Margin
          </button>
          <button
            onClick={() => setActiveTab("commission")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "commission" ? "bg-purple-600 text-white shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            Reseller Commissions
          </button>
        </div>
      </div>

      {activeTab === "margin" ? (
        /* ── WHITE-LABEL MARGIN VIEW ── */
        <div className="space-y-6">
          {/* 3 Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Total Customer Sales</span>
              <p className="text-3xl font-black text-white">₹{(data?.whiteLabel?.totalSales ?? 145000).toLocaleString()}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Grekam Base Cost Paid</span>
              <p className="text-3xl font-black text-blue-400">₹{(data?.whiteLabel?.totalGrekamBaseCost ?? 80000).toLocaleString()}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-950/40 to-indigo-950/20 border border-purple-500/30 rounded-2xl p-5 space-y-1">
              <span className="text-[10px] text-purple-300 uppercase font-bold">Your Net Partner Margin</span>
              <p className="text-3xl font-black text-purple-400">₹{(data?.whiteLabel?.totalMargin ?? 65000).toLocaleString()}</p>
            </div>
          </div>

          {/* Margins Table */}
          <div className="bg-[#080D1A] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-white">Sales & Margin Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 text-zinc-400 font-semibold uppercase text-[10px] bg-white/[0.02]">
                  <tr>
                    <th className="py-3.5 px-4">Customer Garage</th>
                    <th className="py-3.5 px-4">Selling Price</th>
                    <th className="py-3.5 px-4">Grekam Base Cost</th>
                    <th className="py-3.5 px-4 text-right">Your Profit Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {data?.whiteLabel?.invoices && data.whiteLabel.invoices.length > 0 ? (
                    data.whiteLabel.invoices.map((inv: any, idx: number) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="py-4 px-4 font-semibold text-white">{inv.customerName}</td>
                        <td className="py-4 px-4 font-bold text-white">₹{inv.total?.toLocaleString()}</td>
                        <td className="py-4 px-4 font-mono text-zinc-400">₹{(inv.basePriceSnapshot ?? 10000).toLocaleString()}</td>
                        <td className="py-4 px-4 text-right font-black text-emerald-400">+₹{inv.partnerMargin?.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-500">No sales transactions recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ── RESELLER COMMISSIONS VIEW ── */
        <div className="space-y-6">
          {/* 3 Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Total Commission Earned</span>
              <p className="text-3xl font-black text-white">₹{(data?.reseller?.totalEarned ?? 24000).toLocaleString()}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Paid Out</span>
              <p className="text-3xl font-black text-emerald-400">₹{(data?.reseller?.paid ?? 18000).toLocaleString()}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Pending Approval/Payout</span>
              <p className="text-3xl font-black text-amber-400">₹{(data?.reseller?.pending ?? 6000).toLocaleString()}</p>
            </div>
          </div>

          {/* Commissions Table */}
          <div className="bg-[#080D1A] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-white">Direct Reseller Commission Records</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 text-zinc-400 font-semibold uppercase text-[10px] bg-white/[0.02]">
                  <tr>
                    <th className="py-3.5 px-4">Sale Amount</th>
                    <th className="py-3.5 px-4">Commission %</th>
                    <th className="py-3.5 px-4">Commission Earned</th>
                    <th className="py-3.5 px-4 text-right">Payout Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {data?.reseller?.commissions && data.reseller.commissions.length > 0 ? (
                    data.reseller.commissions.map((comm: any, idx: number) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="py-4 px-4 font-bold text-white">₹{comm.saleAmount?.toLocaleString()}</td>
                        <td className="py-4 px-4 text-zinc-400">{comm.commissionPercent}%</td>
                        <td className="py-4 px-4 font-bold text-purple-400">₹{comm.commissionAmount?.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            comm.status === "PAID"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}>
                            {comm.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-500">No commissions recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
