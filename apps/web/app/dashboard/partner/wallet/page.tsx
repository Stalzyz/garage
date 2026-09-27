"use client"

import { useState, useEffect } from "react"
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  Copy, 
  Check, 
  Clock, 
  XCircle,
  HelpCircle
} from "lucide-react"
import { toast } from "sonner"

export default function PartnerWalletPage() {
  const [wallet, setWallet] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Form State
  const [amount, setAmount] = useState("50000")
  const [paymentMode, setPaymentMode] = useState("NEFT")
  const [utrNumber, setUtrNumber] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const fetchWallet = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/partner/wallet")
      const json = await res.json()
      if (json.success) {
        setWallet(json.wallet)
        setTransactions(json.transactions || [])
      } else {
        setWallet({ balance: 50000, status: "ACTIVE" })
        setTransactions([])
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

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success(`${fieldName} copied to clipboard!`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!utrNumber.trim()) {
      toast.error("Please enter the Bank UTR / Transaction Reference number.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/partner/wallet/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount, 
          paymentMode, 
          utrNumber: utrNumber.trim(), 
          notes 
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message || "Deposit request submitted successfully!")
        setShowDepositModal(false)
        setUtrNumber("")
        setNotes("")
        fetchWallet()
      } else {
        toast.error(json.error || "Failed to submit deposit request")
      }
    } catch {
      toast.error("Error submitting deposit request")
    } finally {
      setSubmitting(false)
    }
  }

  const pendingAmount = transactions
    .filter(t => t.status === "PENDING" && t.type === "RECHARGE")
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  return (
    <div className="p-6 md:p-8 space-y-8 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Partner Wallet & Credit Ledger</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Prepaid float model: Deposit funds offline via Direct Bank NEFT/IMPS/UPI for instant workshop activations.
          </p>
        </div>

        <button
          onClick={() => setShowDepositModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Deposit Bank Funds (Top-Up)
        </button>
      </div>

      {/* Main Cards Row: Balance & Explainer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-[#071317] to-[#040813] border border-emerald-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Available Float Balance</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-4xl font-black text-white">₹{(wallet?.balance ?? 0).toLocaleString()}</div>
            <div className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Instant Customer Provisioning
            </div>
          </div>

          {pendingAmount > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-2 font-medium">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>₹{pendingAmount.toLocaleString()} pending Grekam bank verification</span>
            </div>
          )}

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
            <span>Status: <strong className="text-white">Active</strong></span>
            <button onClick={() => setShowDepositModal(true)} className="text-emerald-400 hover:underline font-bold">
              + Submit Deposit
            </button>
          </div>
        </div>

        {/* Fail-Safe Offline Flow Explainer */}
        <div className="lg:col-span-2 bg-[#080D1A] border border-white/10 rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <ShieldCheck className="w-4 h-4" /> Zero-Gateway Offline Settlement Workflow
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Eliminates payment gateway fees and chargeback risks. Funds are wired directly to Grekam's corporate bank account. Once credited, you can provision customer workshops instantly.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">1. Direct Bank Transfer</div>
              <div className="text-sm font-bold text-white">NEFT / IMPS / UPI</div>
              <div className="text-[11px] text-zinc-400">0% gateway deductions</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">2. Admin Verification</div>
              <div className="text-sm font-bold text-white">UTR Reference Match</div>
              <div className="text-[11px] text-zinc-400">1-click escrow credit</div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
              <div className="text-[10px] text-emerald-400 uppercase font-semibold">3. 1-Click Provisioning</div>
              <div className="text-sm font-bold text-emerald-300">Base Cost Deducted</div>
              <div className="text-[11px] text-emerald-200/70">Workshop live instantly</div>
            </div>
          </div>
        </div>

      </div>

      {/* Immutable Transaction History */}
      <div className="bg-[#080D1A] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Audit Transaction Ledger</h2>
            <p className="text-xs text-zinc-400">Immutable ledger of bank deposits, workshop activations, and adjustments</p>
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
                <th className="py-3.5 px-4">Transaction / Details</th>
                <th className="py-3.5 px-4">UTR / Ref</th>
                <th className="py-3.5 px-4">Mode / Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {transactions.length > 0 ? (
                transactions.map((tx) => {
                  const isCredit = tx.amount > 0 || tx.type === "RECHARGE"
                  const isPending = tx.status === "PENDING"
                  const isRejected = tx.status === "REJECTED"

                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap font-mono text-[11px]">
                        {new Date(tx.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{tx.description}</div>
                        {tx.notes && <div className="text-[11px] text-zinc-500 mt-0.5 font-normal">{tx.notes}</div>}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-300">
                        {tx.utrNumber || tx.referenceId || "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-white/5 border border-white/10 text-zinc-300">
                          {tx.paymentMode || tx.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                            <Clock className="w-3 h-3" /> Pending Verification
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Credited
                          </span>
                        )}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold font-mono ${
                        isPending 
                          ? "text-amber-400" 
                          : isRejected 
                            ? "text-zinc-500 line-through" 
                            : isCredit 
                              ? "text-emerald-400" 
                              : "text-rose-400"
                      }`}>
                        {isCredit ? `+₹${Math.abs(tx.amount).toLocaleString()}` : `-₹${Math.abs(tx.amount).toLocaleString()}`}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-zinc-300">
                        {isPending ? "—" : `₹${(tx.balanceAfter ?? 0).toLocaleString()}`}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">No transactions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: OFFLINE BANK DEPOSIT ── */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0B101D] border border-white/15 p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Deposit Funds via Direct Bank Transfer</h3>
              </div>
              <button onClick={() => setShowDepositModal(false)} className="text-zinc-400 hover:text-white text-lg">✕</button>
            </div>

            {/* Grekam Corporate Bank Details Box */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/30 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                <span>Grekam Corporate Bank Account</span>
                <span className="text-zinc-400 font-normal">NEFT / RTGS / IMPS / UPI</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-zinc-400 text-[10px] uppercase font-semibold">Account Name</span>
                  <div className="text-white font-bold flex items-center gap-1.5 mt-0.5">
                    GREKAM TECHNOLOGIES PVT LTD
                    <button type="button" onClick={() => copyToClipboard("GREKAM TECHNOLOGIES PVT LTD", "Account Name")} className="text-zinc-500 hover:text-white">
                      {copiedField === "Account Name" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-zinc-400 text-[10px] uppercase font-semibold">Bank Name</span>
                  <div className="text-white font-bold mt-0.5">HDFC Bank Limited</div>
                </div>

                <div>
                  <span className="text-zinc-400 text-[10px] uppercase font-semibold">Account Number</span>
                  <div className="text-emerald-400 font-mono font-black flex items-center gap-1.5 mt-0.5 text-sm">
                    50200088991122
                    <button type="button" onClick={() => copyToClipboard("50200088991122", "Account Number")} className="text-zinc-500 hover:text-white">
                      {copiedField === "Account Number" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-zinc-400 text-[10px] uppercase font-semibold">IFSC Code</span>
                  <div className="text-emerald-400 font-mono font-black flex items-center gap-1.5 mt-0.5 text-sm">
                    HDFC0001234
                    <button type="button" onClick={() => copyToClipboard("HDFC0001234", "IFSC Code")} className="text-zinc-500 hover:text-white">
                      {copiedField === "IFSC Code" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="col-span-2 pt-2 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-zinc-400 text-[10px] uppercase font-semibold">Corporate UPI ID</span>
                    <div className="text-blue-400 font-mono font-bold mt-0.5">grekam@hdfcbank</div>
                  </div>
                  <button type="button" onClick={() => copyToClipboard("grekam@hdfcbank", "UPI ID")} className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-[11px] font-semibold flex items-center gap-1">
                    {copiedField === "UPI ID" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy UPI
                  </button>
                </div>
              </div>
            </div>

            {/* Deposit Request Form */}
            <form onSubmit={handleDepositSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Amount Transferred (₹) *</label>
                  <input 
                    type="number" 
                    required 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    min="1000" 
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-black text-base font-mono" 
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Payment Mode *</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="NEFT">NEFT (Direct Bank)</option>
                    <option value="IMPS">IMPS (Instant)</option>
                    <option value="RTGS">RTGS</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="CHEQUE">Cheque Deposit</option>
                    <option value="CASH">Cash Deposit</option>
                  </select>
                </div>
              </div>

              {/* Quick Amount Pills */}
              <div className="grid grid-cols-4 gap-2">
                {["10000", "25000", "50000", "100000"].map((amt) => (
                  <button 
                    type="button" 
                    key={amt} 
                    onClick={() => setAmount(amt)}
                    className={`py-1.5 rounded-lg border text-[11px] font-semibold ${
                      amount === amt 
                        ? "bg-emerald-600/30 border-emerald-500 text-emerald-300" 
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    ₹{(parseInt(amt) / 1000)}k
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">
                  Bank Reference / UTR Number *
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. UTR1234567890 / Bank Ref No"
                  value={utrNumber} 
                  onChange={(e) => setUtrNumber(e.target.value)} 
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono uppercase" 
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Found on your bank transfer confirmation SMS or receipt.
                </span>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Sender Bank / Remarks (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sent from ICICI Bank account"
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500" 
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] flex items-start gap-2">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                <span>
                  After submission, Grekam Finance cross-verifies the bank credit with the UTR number. Your wallet will be credited within 15-30 minutes.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setShowDepositModal(false)} 
                  className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                >
                  {submitting ? "Submitting..." : `Submit Deposit (₹${parseInt(amount || "0").toLocaleString()})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
