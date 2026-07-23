"use client"

import { useState, use } from "react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import {
  ArrowLeft, CheckCircle2, Clock, AlertCircle, X,
  Phone, MessageSquare, Mail, Footprints, Loader2, IndianRupee
} from "lucide-react"
import Link from "next/link"

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PARTIAL: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PENDING: "bg-white/5 text-white/50 border-white/10",
  OVERDUE: "bg-red-500/10 text-red-400 border-red-500/20",
  WAIVED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
}

const CHANNEL_ICONS: Record<string, any> = {
  CALL: Phone,
  WHATSAPP: MessageSquare,
  EMAIL: Mail,
  VISIT: Footprints
}

export default function StudentFeeLedgerPage({ params }: { params: Promise<{ studentId: string }> }) {
  const resolvedParams = use(params)
  const studentId = resolvedParams.studentId

  const { data: student, mutate, isLoading } = useApi<any>(`/academy/fees/student/${studentId}`)

  const [payModal, setPayModal] = useState<string | null>(null)
  const [followModal, setFollowModal] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [payForm, setPayForm] = useState({ amount: "", paymentRef: "", notes: "" })
  const [followForm, setFollowForm] = useState({ channel: "CALL", notes: "", nextFollowUpAt: "" })
  const [addForm, setAddForm] = useState({ amount: "", taxAmount: "", dueDate: "", notes: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payModal) return
    setIsSubmitting(true)
    try {
      await fetchApi(`/academy/fees/installment/${payModal}/pay`, {
        method: "PATCH",
        body: JSON.stringify({
          amount: parseFloat(payForm.amount),
          paymentRef: payForm.paymentRef || undefined,
          notes: payForm.notes || undefined
        })
      })
      toast.success("Payment recorded! Receipt sent via Email & WhatsApp.")
      setPayModal(null)
      setPayForm({ amount: "", paymentRef: "", notes: "" })
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!followModal) return
    setIsSubmitting(true)
    try {
      await fetchApi(`/academy/fees/installment/${followModal}/followup`, {
        method: "POST",
        body: JSON.stringify({
          channel: followForm.channel,
          notes: followForm.notes || undefined,
          nextFollowUpAt: followForm.nextFollowUpAt || undefined
        })
      })
      toast.success("Follow-up logged!")
      setFollowModal(null)
      setFollowForm({ channel: "CALL", notes: "", nextFollowUpAt: "" })
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to log follow-up")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!student?.enrollments?.length) {
      toast.error("Student has no enrollments to attach this invoice to.")
      return
    }
    setIsSubmitting(true)
    try {
      await fetchApi(`/academy/fees/installment`, {
        method: "POST",
        body: JSON.stringify({
          enrollmentId: student.enrollments[0].id,
          amount: parseFloat(addForm.amount),
          taxAmount: parseFloat(addForm.taxAmount || "0"),
          dueDate: addForm.dueDate,
          notes: addForm.notes || undefined
        })
      })
      toast.success("Invoice created successfully!")
      setIsAddModalOpen(false)
      setAddForm({ amount: "", taxAmount: "", dueDate: "", notes: "" })
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to create invoice")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendInvoice = async (installmentId: string) => {
    setIsSubmitting(true)
    try {
      await fetchApi(`/academy/fees/installment/${installmentId}/send`, { method: "POST" })
      toast.success("Invoice sent to student successfully!")
    } catch (err: any) {
      toast.error(err.message || "Failed to send invoice")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading && !student) {
    return <div className="flex h-full items-center justify-center text-white"><Loader2 className="animate-spin w-6 h-6" /></div>
  }
  if (!student) return <div className="flex h-full items-center justify-center text-white/50">Student not found.</div>

  const name = `${student.user?.firstName || ''} ${student.user?.lastName || ''}`.trim()
  const allInstallments = student.enrollments?.flatMap((e: any) =>
    e.installments.map((i: any) => ({ ...i, batchName: e.batch?.name }))
  ) || []

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white p-8 overflow-auto">
      {/* Back */}
      <Link href="/dashboard/academy/fees" className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 w-fit transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Fee Collection
      </Link>

      {/* Student Header */}
      <div className="flex items-center gap-5 mb-8 pb-8 border-b border-white/10">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl font-black text-violet-400">
          {name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-black">{name}</h1>
          <p className="text-white/40 text-sm">{student.user?.email} · {student.user?.phone || 'No phone'}</p>
          <p className="text-xs text-white/30 font-mono mt-1">{student.studentCode}</p>
        </div>
        <div className="ml-auto">
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-white text-black font-bold tracking-widest uppercase text-[10px] px-5 py-3 rounded-xl hover:scale-105 transition-all">
            + New Invoice
          </button>
        </div>
      </div>

      {/* Installment Timeline */}
      <h2 className="text-lg font-bold mb-4">Fee Installments</h2>

      {allInstallments.length === 0 && (
        <div className="text-center py-12 text-white/30">No installments created yet.</div>
      )}

      <div className="space-y-4">
        {allInstallments.map((inst: any) => {
          const balance = inst.amount - inst.paidAmount
          return (
            <div key={inst.id} className={`border rounded-2xl p-6 ${STATUS_STYLES[inst.status] || "border-white/10"}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${STATUS_STYLES[inst.status]}`}>
                      {inst.status}
                    </span>
                    <span className="text-white/40 text-xs">{inst.batchName}</span>
                  </div>
                  <p className="text-white font-bold text-lg">₹{inst.amount.toLocaleString('en-IN')}</p>
                  {inst.taxAmount > 0 && <p className="text-white/40 text-xs">Tax: ₹{inst.taxAmount.toLocaleString('en-IN')}</p>}
                  <p className="text-white/40 text-xs">Due: {new Date(inst.dueDate).toLocaleDateString('en-IN')}</p>
                  {inst.paidAmount > 0 && <p className="text-emerald-400 text-xs mt-1">Paid: ₹{inst.paidAmount.toLocaleString('en-IN')} · Balance: ₹{balance.toLocaleString('en-IN')}</p>}
                  {inst.paymentRef && <p className="text-white/40 text-xs">Ref: {inst.paymentRef}</p>}
                </div>
                <div className="flex gap-2">
                  {inst.status !== 'PAID' && inst.status !== 'WAIVED' && (
                    <button onClick={() => setPayModal(inst.id)}
                      className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-xl hover:bg-emerald-500/20 transition-colors">
                      <IndianRupee className="w-3 h-3" /> Record Payment
                    </button>
                  )}
                  <button onClick={() => setFollowModal(inst.id)}
                    className="flex items-center gap-1.5 text-xs font-bold bg-white/5 text-white/60 border border-white/10 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors">
                    <Phone className="w-3 h-3" /> Log Follow-Up
                  </button>
                  <button onClick={() => handleSendInvoice(inst.id)} disabled={isSubmitting}
                    className="flex items-center gap-1.5 text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-2 rounded-xl hover:bg-violet-500/20 transition-colors disabled:opacity-50">
                    <Mail className="w-3 h-3" /> Send Invoice
                  </button>
                </div>
              </div>

              {/* Follow-up History */}
              {inst.followUps?.length > 0 && (
                <div className="mt-4 border-t border-white/5 pt-4 space-y-2">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Follow-Up Log</p>
                  {inst.followUps.map((f: any) => {
                    const Icon = CHANNEL_ICONS[f.channel] || Phone
                    return (
                      <div key={f.id} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-3 h-3 text-white/40" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-white/60">{f.notes || 'No notes'}</p>
                          <p className="text-[10px] text-white/30">{new Date(f.createdAt).toLocaleString('en-IN')} · {f.channel}</p>
                          {f.nextFollowUpAt && <p className="text-[10px] text-amber-400">Next: {new Date(f.nextFollowUpAt).toLocaleDateString('en-IN')}</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pay Modal */}
      {payModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Record Payment</h2>
              <button onClick={() => setPayModal(null)}><X className="w-5 h-5 text-white/50 hover:text-white" /></button>
            </div>
            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Amount Paid (₹)</label>
                <input required type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  placeholder="e.g. 8000"
                  value={payForm.amount} onChange={e => setPayForm(p => ({...p, amount: e.target.value}))} />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Payment Reference</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  placeholder="UPI ID / Cheque No. / Transaction ID"
                  value={payForm.paymentRef} onChange={e => setPayForm(p => ({...p, paymentRef: e.target.value}))} />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Notes</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  placeholder="Optional notes"
                  value={payForm.notes} onChange={e => setPayForm(p => ({...p, notes: e.target.value}))} />
              </div>
              <p className="text-xs text-white/30">💡 Upon recording full payment, a WhatsApp receipt + email will be automatically sent to the student.</p>
              <button type="submit" disabled={isSubmitting}
                className="w-full bg-emerald-500 text-black font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "✓ Confirm Payment"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Follow-Up Modal */}
      {followModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Log Follow-Up</h2>
              <button onClick={() => setFollowModal(null)}><X className="w-5 h-5 text-white/50 hover:text-white" /></button>
            </div>
            <form onSubmit={handleFollowUp} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Channel</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  value={followForm.channel} onChange={e => setFollowForm(p => ({...p, channel: e.target.value}))}>
                  <option value="CALL">📞 Phone Call</option>
                  <option value="WHATSAPP">💬 WhatsApp</option>
                  <option value="EMAIL">📧 Email</option>
                  <option value="VISIT">🚶 In-Person Visit</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Notes</label>
                <textarea rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm resize-none"
                  placeholder="What was discussed?"
                  value={followForm.notes} onChange={e => setFollowForm(p => ({...p, notes: e.target.value}))} />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Next Follow-Up Date</label>
                <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  value={followForm.nextFollowUpAt} onChange={e => setFollowForm(p => ({...p, nextFollowUpAt: e.target.value}))} />
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Follow-Up"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Create New Invoice</h2>
              <button onClick={() => setIsAddModalOpen(false)}><X className="w-5 h-5 text-white/50 hover:text-white" /></button>
            </div>
            <form onSubmit={handleAddInvoice} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Base Amount (₹) *</label>
                <input required type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  placeholder="e.g. 5000"
                  value={addForm.amount} onChange={e => setAddForm(p => ({...p, amount: e.target.value}))} />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Tax Amount (₹)</label>
                <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  placeholder="e.g. 900"
                  value={addForm.taxAmount} onChange={e => setAddForm(p => ({...p, taxAmount: e.target.value}))} />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Due Date *</label>
                <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm [color-scheme:dark]"
                  value={addForm.dueDate} onChange={e => setAddForm(p => ({...p, dueDate: e.target.value}))} />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Notes</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  placeholder="e.g. Term 2 Fee"
                  value={addForm.notes} onChange={e => setAddForm(p => ({...p, notes: e.target.value}))} />
              </div>
              <p className="text-xs text-white/30">💡 An email invoice will be automatically sent if the organization's Resend API key is configured.</p>
              <button type="submit" disabled={isSubmitting}
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Invoice"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
