"use client"

import { useState } from "react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { Share2, IndianRupee, Users, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export default function ReferralsAdmin() {
  const { data: payouts, mutate, isLoading } = useApi<any[]>("/academy/referrals/payouts")
  
  const [selectedPayout, setSelectedPayout] = useState<any>(null)
  const [payForm, setPayForm] = useState({ paymentMethod: "UPI", transactionId: "", notes: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPayout) return
    setIsSubmitting(true)
    try {
      await fetchApi(`/academy/referrals/payouts/${selectedPayout.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "PAID", ...payForm })
      })
      toast.success("Payout marked as PAID")
      setSelectedPayout(null)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to update payout")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this payout?")) return
    try {
      await fetchApi(`/academy/referrals/payouts/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "REJECTED" })
      })
      toast.success("Payout rejected")
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to reject")
    }
  }

  const pendingAmount = (payouts || []).filter((p:any) => p.status === 'PENDING').reduce((acc:number, p:any) => acc + p.amount, 0)
  const totalPaid = (payouts || []).filter((p:any) => p.status === 'PAID').reduce((acc:number, p:any) => acc + p.amount, 0)

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Share2 className="w-8 h-8 text-amber-500" /> Referral Payouts
          </h1>
          <p className="text-white/50 mt-2">Manage and clear pending cash rewards for student referrals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Clock className="w-4 h-4"/> Pending Clearance</h3>
          <div className="text-4xl font-black text-white flex items-center"><IndianRupee className="w-6 h-6 mr-1 text-white/50"/>{pendingAmount}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Total Paid Out</h3>
          <div className="text-4xl font-black text-white flex items-center"><IndianRupee className="w-6 h-6 mr-1 text-white/50"/>{totalPaid}</div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-white/50 text-xs uppercase tracking-widest">
            <tr>
              <th className="p-4 font-bold">Referrer</th>
              <th className="p-4 font-bold">Referred Student</th>
              <th className="p-4 font-bold">Course Type</th>
              <th className="p-4 font-bold">Payout Amount</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading && <tr><td colSpan={6} className="p-8 text-center text-white/50">Loading payouts...</td></tr>}
            {(payouts || []).length === 0 && !isLoading && (
              <tr><td colSpan={6} className="p-8 text-center text-white/50">No referral payouts found.</td></tr>
            )}
            {(payouts || []).map((p: any) => (
              <tr key={p.id} className="hover:bg-white/[0.02]">
                <td className="p-4">
                  <div className="font-bold text-amber-400">{p.referrer?.user?.firstName} {p.referrer?.user?.lastName}</div>
                  <div className="text-xs text-white/50">{p.referrer?.studentCode} • {p.referrer?.user?.phone}</div>
                </td>
                <td className="p-4">
                  <div className="font-bold">{p.referred?.user?.firstName} {p.referred?.user?.lastName}</div>
                  <div className="text-xs text-white/50">{p.referred?.studentCode}</div>
                </td>
                <td className="p-4">
                  <span className="text-[10px] bg-white/10 px-2 py-1 rounded font-bold uppercase">{p.courseType}</span>
                </td>
                <td className="p-4 font-black">₹{p.amount}</td>
                <td className="p-4">
                  {p.status === "PENDING" && <span className="text-amber-400 text-xs font-bold bg-amber-400/10 px-2 py-1 rounded">PENDING</span>}
                  {p.status === "PAID" && <span className="text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded">PAID</span>}
                  {p.status === "REJECTED" && <span className="text-rose-400 text-xs font-bold bg-rose-400/10 px-2 py-1 rounded">REJECTED</span>}
                </td>
                <td className="p-4">
                  {p.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedPayout(p)} className="text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-3 py-1.5 rounded-lg transition-colors">Pay</button>
                      <button onClick={() => handleReject(p.id)} className="text-xs bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 font-bold px-3 py-1.5 rounded-lg transition-colors">Reject</button>
                    </div>
                  )}
                  {p.status === "PAID" && (
                    <div className="text-xs text-white/40">
                      Paid via {p.paymentMethod}<br/>{p.transactionId && `TXN: ${p.transactionId}`}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pay Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-2">Clear Referral Payout</h2>
            <p className="text-white/50 text-sm mb-6">Pay <strong className="text-amber-400">₹{selectedPayout.amount}</strong> to {selectedPayout.referrer?.user?.firstName}</p>
            
            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase block mb-2">Payment Method</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  value={payForm.paymentMethod} onChange={e => setPayForm(p => ({...p, paymentMethod: e.target.value}))}>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase block mb-2">Transaction ID (Optional)</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  value={payForm.transactionId} onChange={e => setPayForm(p => ({...p, transactionId: e.target.value}))} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setSelectedPayout(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors flex justify-center items-center">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mark as Paid"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
