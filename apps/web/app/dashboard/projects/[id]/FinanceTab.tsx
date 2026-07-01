"use client"

import { useState, useEffect } from "react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { Plus, Trash2, Save, Send, CreditCard, Loader2 } from "lucide-react"

export function FinanceTab({ projectId, budget }: { projectId: string, budget: number }) {
  const { data: schedule, isLoading, mutate } = useApi(`/api/v1/projects/${projectId}/billing-schedule`)
  
  const [type, setType] = useState<"ONE_TIME" | "INSTALLMENTS">("ONE_TIME")
  const [milestones, setMilestones] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (schedule) {
      setType(schedule.type || "ONE_TIME")
      setMilestones(schedule.milestones || [])
    }
  }, [schedule])

  const handleAddMilestone = () => {
    setMilestones([...milestones, { name: "", amount: 0, dueDate: "" }])
  }

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const handleUpdateMilestone = (index: number, field: string, value: any) => {
    const updated = [...milestones]
    updated[index] = { ...updated[index], [field]: value }
    setMilestones(updated)
  }

  const handleSave = async () => {
    if (type === "INSTALLMENTS" && milestones.length === 0) {
      return toast.error("Please add at least one installment.")
    }
    const totalAmount = milestones.reduce((sum, m) => sum + Number(m.amount), 0)
    if (type === "INSTALLMENTS" && budget && totalAmount > budget) {
      toast.warning(`Warning: Total installments (₹${totalAmount}) exceeds project budget (₹${budget})`)
    }

    setIsSaving(true)
    try {
      const res = await fetchApi(`/api/v1/projects/${projectId}/billing-schedule`, {
        method: "PUT",
        body: JSON.stringify({ type, milestones: type === "ONE_TIME" ? [] : milestones })
      })
      if (res.success) {
        toast.success("Billing schedule saved")
        mutate(res.schedule)
      } else {
        toast.error("Failed to save schedule")
      }
    } catch (e) {
      toast.error("An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateInvoice = async (milestoneId: string) => {
    try {
      const res = await fetchApi(`/api/v1/projects/${projectId}/billing-milestones/${milestoneId}/generate-invoice`, {
        method: "POST"
      })
      if (res.success) {
        toast.success("Invoice generated successfully")
        mutate() // refresh schedule to show generated status
      } else {
        toast.error(res.error || "Failed to generate invoice")
      }
    } catch (e) {
      toast.error("An error occurred")
    }
  }

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>

  return (
    <div className="p-6 max-w-4xl">
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" /> Billing Schedule
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Configure how this project will be billed.</p>
          {budget > 0 && <p className="text-sm font-semibold text-emerald-500 mt-2">Project Budget: ₹{budget.toLocaleString()}</p>}
        </div>

        {/* Configuration */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-foreground mb-3">Billing Type</label>
            <div className="flex gap-4">
              <label className={`flex-1 border p-4 rounded-xl cursor-pointer transition-all ${type === "ONE_TIME" ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border/50 bg-background hover:border-border"}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" checked={type === "ONE_TIME"} onChange={() => setType("ONE_TIME")} className="w-4 h-4 text-primary bg-background border-border" />
                  <div>
                    <div className="font-bold text-foreground">One-Time Invoice</div>
                    <div className="text-xs text-muted-foreground">Bill the entire amount in a single invoice.</div>
                  </div>
                </div>
              </label>
              
              <label className={`flex-1 border p-4 rounded-xl cursor-pointer transition-all ${type === "INSTALLMENTS" ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border/50 bg-background hover:border-border"}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" checked={type === "INSTALLMENTS"} onChange={() => setType("INSTALLMENTS")} className="w-4 h-4 text-primary bg-background border-border" />
                  <div>
                    <div className="font-bold text-foreground">Installments / Milestones</div>
                    <div className="text-xs text-muted-foreground">Break the project down into multiple payments.</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {type === "INSTALLMENTS" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-foreground">Payment Milestones</label>
                <button onClick={handleAddMilestone} className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 bg-primary/10 px-3 py-1.5 rounded-lg">
                  <Plus className="w-3.5 h-3.5" /> Add Milestone
                </button>
              </div>
              
              {milestones.length === 0 ? (
                <div className="p-8 text-center bg-muted/20 border border-dashed border-border/50 rounded-xl text-muted-foreground text-sm">
                  No milestones added yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {milestones.map((m, idx) => (
                    <div key={m.id || idx} className="flex items-start gap-4 p-4 bg-muted/20 border border-border/50 rounded-xl relative group">
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="text-xs font-bold text-muted-foreground mb-1 block">Description</label>
                            <input value={m.name} onChange={e => handleUpdateMilestone(idx, "name", e.target.value)} placeholder="e.g. 50% Upfront Deposit" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground" />
                          </div>
                          <div className="w-1/3">
                            <label className="text-xs font-bold text-muted-foreground mb-1 block">Amount (₹)</label>
                            <input type="number" value={m.amount} onChange={e => handleUpdateMilestone(idx, "amount", Number(e.target.value))} placeholder="Amount" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground" />
                          </div>
                          <div className="w-1/3">
                            <label className="text-xs font-bold text-muted-foreground mb-1 block">Due Date</label>
                            <input type="date" value={m.dueDate ? m.dueDate.split('T')[0] : ''} onChange={e => handleUpdateMilestone(idx, "dueDate", e.target.value)} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground" />
                          </div>
                        </div>
                        
                        {/* Status / Invoice Generation */}
                        {m.id && (
                          <div className="flex items-center gap-3 pt-3 border-t border-border/30">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${m.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : m.status === 'INVOICED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                              {m.status}
                            </span>
                            {m.status === 'PENDING' && (
                              <button onClick={() => handleGenerateInvoice(m.id)} className="text-xs font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1">
                                <Send className="w-3 h-3" /> Generate Invoice
                              </button>
                            )}
                            {m.invoiceId && (
                              <a href={`/dashboard/finance/invoices/${m.invoiceId}`} target="_blank" className="text-xs font-bold text-slate-400 hover:text-foreground flex items-center gap-1">
                                View Invoice ↗
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {!m.id && (
                        <button onClick={() => handleRemoveMilestone(idx)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors mt-6">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {milestones.length > 0 && (
                <div className="flex justify-between items-center p-4 bg-muted/40 rounded-xl border border-border/30">
                  <span className="text-sm font-bold text-muted-foreground">Total Installments:</span>
                  <span className="text-lg font-black text-foreground">
                    ₹{milestones.reduce((sum, m) => sum + Number(m.amount), 0).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-border/50 bg-muted/10 flex justify-end">
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  )
}
