"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, Suspense } from "react"
import { CreditCard, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react"

function GatewayContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session_id") || "chk_demo_101"
  const amount = searchParams.get("amount") || "29,999"
  const plan = searchParams.get("plan") || "Growth Garage Plan"
  const [isProcessing, setIsProcessing] = useState(false)
  const [paidSuccess, setPaidSuccess] = useState(false)

  const handlePay = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setPaidSuccess(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#070913] text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white/[0.04] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-blue-400 font-bold">
            <CreditCard className="w-6 h-6" />
            <span>Grekam Secure Gateway</span>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
            SSL 256-Bit
          </span>
        </div>

        {paidSuccess ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h2 className="text-xl font-bold text-white">Payment Successful!</h2>
            <p className="text-xs text-zinc-400">Transaction ID: {sessionId}</p>
            <button
              onClick={() => router.push("/dashboard/admin/payments")}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-6 py-3 rounded-xl transition-all inline-flex items-center gap-2"
            >
              Return to Ledger <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
              <span className="text-xs text-zinc-400 font-semibold uppercase">Selected Subscription</span>
              <div className="flex justify-between items-center text-sm font-bold">
                <span>{plan}</span>
                <span className="text-blue-400 text-base">₹{amount}</span>
              </div>
              <p className="text-[11px] text-zinc-500">Session: {sessionId}</p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="text-zinc-400 font-medium">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-blue-600/20 border border-blue-500/40 rounded-xl text-center font-semibold text-blue-300">
                  Credit / Debit Card
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center font-medium text-zinc-400">
                  UPI / NetBanking
                </div>
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? "Processing Payment..." : `Pay ₹${amount} Now`}
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MockGatewayPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Loading payment gateway...</div>}>
      <GatewayContent />
    </Suspense>
  )
}
