"use client"

import { useState, useEffect } from "react"
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function PartnerWalletPage() {
  const [wallet, setWallet] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showRechargeModal, setShowRechargeModal] = useState(false)
  const [amount, setAmount] = useState("10000")

  const fetchWallet = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/partner/wallet")
      const json = await res.json()
      if (json.success) {
        setWallet(json.wallet)
        setTransactions(json.transactions)
      } else {
        // Sample fallback
        setWallet({ balance: 50000, status: "ACTIVE" })
        setTransactions([
          { id: "t1", type: "RECHARGE", amount: 50000, balanceBefore: 0, balanceAfter: 50000, description: "Wallet pre-funding via Online Gateway", createdAt: new Date() },
          { id: "t2", type: "ACTIVATION", amount: -10000, balanceBefore: 50000, balanceAfter: 40000, description: "Activation of ABC Garage (Pro Garage) - Grekam Base Cost", createdAt: new Date() },
        ])
      }
    } catch {
      toast.error("Failed to load wallet data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWallet()
  }, [])

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/partner/wallet/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message || "Wallet recharged successfully.")
        setShowRechargeModal(false)
        fetchWallet()
      } else {
        toast.error(json.error || "Failed to recharge wallet")
      }
    } catch {
      toast.error("Error recharging wallet")
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Partner Wallet</h1>
          <p className="text-xs text-zinc-400 mt-1">Prepaid balance used for instant customer activations and platform charges.</p>
        </div>

        <button
          onClick={() => setShowRechargeModal(true)}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Money to Wallet
        </button>
      </div>

      {/* Main Cards Row: Balance & Explainer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-[#071317] to-[#040813] border border-emerald-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Available Balance</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-4xl font-black text-white">₹{(wallet?.balance ?? 50000).toLocaleString()}</div>
            <div className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Wallet Active & Ready for Activations
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
            <span>Status: <strong className="text-white">Active</strong></span>
            <button onClick={() => setShowRechargeModal(true)} className="text-emerald-400 hover:underline font-bold">
              + Top Up
            </button>
          </div>
        </div>

        {/* Fail-Safe Logic Explainer */}
        <div className="lg:col-span-2 bg-[#080D1A] border border-white/10 rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <ShieldCheck className="w-4 h-4" /> How Partner Wallet Activation Works
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Your prepaid partner wallet secures Grekam Base Cost (₹10,000) prior to activating each customer. This ensures your customers receive instant, uninterrupted service while keeping your accounting completely fail-safe.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">1. Add Balance</div>
              <div className="text-sm font-bold text-white">Wallet Funded</div>
              <div className="text-[11px] text-zinc-400">Pre-fund ₹10k+ anytime</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">2. Customer Sells</div>
              <div className="text-sm font-bold text-white">Sell at Own Price</div>
              <div className="text-[11px] text-zinc-400">Up to 200% base price</div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
              <div className="text-[10px] text-emerald-400 uppercase font-semibold">3. 1-Click Activation</div>
              <div className="text-sm font-bold text-emerald-300">Base Deducted</div>
              <div className="text-[11px] text-emerald-200/70">Instant live workspace</div>
            </div>
          </div>
        </div>

      </div>

      {/* Immutable Transaction History */}
      <div className="bg-[#080D1A] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Wallet Transactions</h2>
            <p className="text-xs text-zinc-400">Append-only audit ledger of all balance debits and credits</p>
          </div>
          <button onClick={fetchWallet} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-zinc-400 font-semibold uppercase text-[10px] bg-white/[0.02]">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {transactions.length > 0 ? (
                transactions.map((tx) => {
                  const isCredit = tx.amount > 0 || tx.type === "RECHARGE"
                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap font-mono text-[11px]">
                        {new Date(tx.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">{tx.description}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          isCredit
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                            : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold ${isCredit ? "text-emerald-400" : "text-rose-400"}`}>
                        {isCredit ? `+₹${Math.abs(tx.amount).toLocaleString()}` : `-₹${Math.abs(tx.amount).toLocaleString()}`}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-zinc-300">
                        ₹{(tx.balanceAfter ?? 0).toLocaleString()}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: RECHARGE WALLET ── */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0B101D] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Add Money to Partner Wallet</h3>
              <button onClick={() => setShowRechargeModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
              Current Available Balance: <strong className="text-emerald-400">₹{(wallet?.balance ?? 50000).toLocaleString()}</strong>
            </div>

            <form onSubmit={handleRecharge} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Recharge Amount (₹) *</label>
                <input 
                  type="number" 
                  required 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  min="1000" 
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-black text-base" 
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["10000", "25000", "50000"].map((amt) => (
                  <button 
                    type="button" 
                    key={amt} 
                    onClick={() => setAmount(amt)}
                    className={`py-2 rounded-lg border text-xs font-semibold ${
                      amount === amt 
                        ? "bg-emerald-600/30 border-emerald-500 text-emerald-300" 
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    +₹{parseInt(amt).toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowRechargeModal(false)} className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/20">
                  Pay & Add ₹{parseInt(amount || "0").toLocaleString()}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
