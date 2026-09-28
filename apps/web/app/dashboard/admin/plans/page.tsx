"use client"

import { useState, useEffect } from "react"
import { DollarSign, Plus, Edit, Check, X, ShieldCheck, Tag, Info, Layers, Lock, Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"

const AVAILABLE_MODULES = [
  "CRM & Sales (Leads, Proposals, Dialer)",
  "Kanban Projects & Asset Hub",
  "Finance, Invoicing & P&L",
  "HR, Payroll & Attendance",
  "Marketing Hub & Campaign Scheduler",
  "CMS & Website Page Builder",
  "Analytics & Intelligence",
  "Support Helpdesk",
  "Automations Engine",
  "WhatsApp Automation & Alerts",
  "Asset Drive Storage",
  "White Label & Custom Domain",
]

export default function SuperAdminPlansPage() {
  const [showModal, setShowModal] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/plans")
      const data = await res.json()
      if (data.plans) {
        setPlans(data.plans)
      }
    } catch (err) {
      console.error("Failed to fetch plans:", err)
      toast.error("Failed to load plans from server")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const [form, setForm] = useState({
    name: "",
    monthlyPrice: "",
    monthlyOfferPrice: "",
    yearlyPrice: "",
    yearlyOfferPrice: "",
    whitelabelMonthlyBasePrice: "",
    whitelabelYearlyBasePrice: "",
    resellerCommissionRate: "25",
    allowWhitelabelCustomMarkup: true,
    selectedModules: [] as string[],
  })

  const handleOpenCreateModal = () => {
    setEditingPlanId(null)
    setForm({
      name: "",
      monthlyPrice: "",
      monthlyOfferPrice: "",
      yearlyPrice: "",
      yearlyOfferPrice: "",
      whitelabelMonthlyBasePrice: "",
      whitelabelYearlyBasePrice: "",
      resellerCommissionRate: "25",
      allowWhitelabelCustomMarkup: true,
      selectedModules: [...AVAILABLE_MODULES],
    })
    setShowModal(true)
  }

  const handleOpenEditModal = (plan: any) => {
    setEditingPlanId(plan.id)
    setForm({
      name: plan.name,
      monthlyPrice: plan.monthlyPrice !== undefined && plan.monthlyPrice !== null ? String(plan.monthlyPrice) : "",
      monthlyOfferPrice: plan.monthlyOfferPrice !== undefined && plan.monthlyOfferPrice !== null ? String(plan.monthlyOfferPrice) : "",
      yearlyPrice: plan.yearlyPrice !== undefined && plan.yearlyPrice !== null ? String(plan.yearlyPrice) : "",
      yearlyOfferPrice: plan.yearlyOfferPrice !== undefined && plan.yearlyOfferPrice !== null ? String(plan.yearlyOfferPrice) : "",
      whitelabelMonthlyBasePrice: plan.whitelabelMonthlyBasePrice !== undefined && plan.whitelabelMonthlyBasePrice !== null ? String(plan.whitelabelMonthlyBasePrice) : "",
      whitelabelYearlyBasePrice: plan.whitelabelYearlyBasePrice !== undefined && plan.whitelabelYearlyBasePrice !== null ? String(plan.whitelabelYearlyBasePrice) : "",
      resellerCommissionRate: plan.resellerCommissionRate !== undefined && plan.resellerCommissionRate !== null ? String(plan.resellerCommissionRate) : "25",
      allowWhitelabelCustomMarkup: plan.allowWhitelabelCustomMarkup ?? true,
      selectedModules: plan.modules || [],
    })
    setShowModal(true)
  }

  const handleModuleToggle = (mod: string) => {
    setForm((prev) => {
      const exists = prev.selectedModules.includes(mod)
      if (exists) {
        return { ...prev, selectedModules: prev.selectedModules.filter((m) => m !== mod) }
      } else {
        return { ...prev, selectedModules: [...prev.selectedModules, mod] }
      }
    })
  }

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.yearlyPrice) return toast.error("Please fill required fields (Name and Yearly Price)")

    const payload = {
      name: form.name,
      monthlyPrice: form.monthlyPrice,
      monthlyOfferPrice: form.monthlyOfferPrice,
      yearlyPrice: form.yearlyPrice,
      yearlyOfferPrice: form.yearlyOfferPrice,
      whitelabelMonthlyBasePrice: form.whitelabelMonthlyBasePrice,
      whitelabelYearlyBasePrice: form.whitelabelYearlyBasePrice,
      resellerCommissionRate: form.resellerCommissionRate,
      allowWhitelabelCustomMarkup: form.allowWhitelabelCustomMarkup,
      modules: form.selectedModules,
    }

    try {
      if (editingPlanId) {
        const res = await fetch("/api/admin/plans", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingPlanId, ...payload })
        })
        if (res.ok) {
          toast.success(`Plan "${form.name}" updated successfully!`)
          await fetchPlans()
        } else {
          throw new Error("Failed to update plan")
        }
      } else {
        const res = await fetch("/api/admin/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          toast.success(`Plan "${form.name}" created successfully!`)
          await fetchPlans()
        } else {
          throw new Error("Failed to create plan")
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save plan")
    }

    setShowModal(false)
  }

  const toggleStatus = async (planOrId: any) => {
    const plan = typeof planOrId === "string" ? plans.find(p => p.id === planOrId) : planOrId
    if (!plan) return
    const nextStatus = plan.status === "Active" ? "Deactivated" : "Active"
    try {
      const res = await fetch("/api/admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: plan.id, status: nextStatus })
      })
      if (res.ok) {
        toast.info(`Plan "${plan.name}" is now ${nextStatus}`)
        await fetchPlans()
      }
    } catch (err: any) {
      toast.error("Failed to update status")
    }
  }

  const handleTestCheckout = async (planName: string, amount: string) => {
    toast.loading(`Initializing payment checkout for ${planName}...`)
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName, amount }),
      })
      const data = await res.json()
      toast.dismiss()
      if (data.checkoutUrl) {
        toast.success(`Redirecting to ${data.gateway.toUpperCase()} Gateway checkout...`)
        window.open(data.checkoutUrl, "_blank")
      }
    } catch {
      toast.dismiss()
      toast.error("Failed to connect to checkout gateway service")
    }
  }

  return (
    <div className="p-8 space-y-6 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Package & Pricing Controls</h1>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Super Admin Plane
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Configure module entitlements, retail offer prices (+ GST), Whitelabel partner base wholesale costs, and Reseller commission splits.</p>
        </div>

        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Create New Package
        </button>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-zinc-900 border border-white/10 flex items-start gap-3 text-xs">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-zinc-300">
          <p className="font-semibold text-white">Pricing & Partner Revenue Model:</p>
          <p>• <strong className="text-amber-300">Standard Resellers:</strong> Sell packages at actual retail price and earn a percentage commission (e.g. 25%).</p>
          <p>• <strong className="text-purple-300">Whitelabel Partners:</strong> Pay the fixed <span className="underline">Base Wholesale Price</span> set by Super Admin and can decide their own custom client pricing above the base price.</p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((p) => {
          const effectiveYearly = p.yearlyOfferPrice || p.yearlyPrice
          const effectiveMonthly = p.monthlyOfferPrice || p.monthlyPrice
          return (
            <div key={p.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-5 relative flex flex-col justify-between hover:border-blue-500/40 transition-all shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h2 className="text-xl font-bold text-white">{p.name}</h2>
                    <span className="text-[10px] font-mono text-zinc-400">ID: {p.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenEditModal(p)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-blue-600/30 text-zinc-200 hover:text-blue-300 border border-white/10 transition-colors"
                      title="Edit Package & Cost"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-semibold ${
                      p.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400"
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>

                {/* Retail Price Display */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-zinc-400 font-medium">Yearly Package Cost:</span>
                    <div className="text-right">
                      <span className="text-xl font-black text-blue-400">₹{Number(effectiveYearly).toLocaleString("en-IN")}</span>
                      <span className="text-xs font-bold text-amber-400 ml-1">+ GST</span>
                      {p.yearlyOfferPrice && p.yearlyOfferPrice !== p.yearlyPrice && (
                        <span className="text-[11px] text-zinc-500 line-through block">₹{Number(p.yearlyPrice).toLocaleString("en-IN")}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-white/5 pt-2">
                    <span>Monthly Option:</span>
                    <span className="font-semibold text-zinc-200">₹{Number(effectiveMonthly).toLocaleString("en-IN")} / mo + GST</span>
                  </div>
                </div>

                {/* Whitelabel & Reseller Splits */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-medium">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200">
                    <span className="text-[10px] uppercase tracking-wider text-purple-400 block font-bold">Whitelabel Base:</span>
                    <span className="font-bold text-sm">₹{Number(p.whitelabelYearlyBasePrice || effectiveYearly).toLocaleString("en-IN")}/yr + GST</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                    <span className="text-[10px] uppercase tracking-wider text-amber-400 block font-bold">Reseller Comm:</span>
                    <span className="font-bold text-sm">{p.resellerCommissionRate}% Commission</span>
                  </div>
                </div>

                {/* Modules Included */}
                <div className="pt-2 space-y-2 text-xs text-zinc-300">
                  <span className="font-semibold text-zinc-400 uppercase text-[10px] tracking-wider block">
                    Enabled Modules ({p.modules?.length || 0} / {AVAILABLE_MODULES.length})
                  </span>
                  <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {p.modules?.map((feat: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 bg-white/[0.03] px-2.5 py-1.5 rounded-lg border border-white/[0.05]">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                <button onClick={() => toggleStatus(p.id)} className="text-xs text-zinc-400 hover:text-white font-medium">
                  {p.status === "Active" ? "Deactivate Package" : "Activate Package"}
                </button>
                <button
                  onClick={() => handleTestCheckout(p.name, effectiveYearly)}
                  className="text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 font-semibold px-3 py-1.5 rounded-xl border border-blue-500/30 transition-all"
                >
                  Test Gateway Checkout
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* CREATE / EDIT PLAN MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#0c101a] border border-white/15 rounded-3xl p-6 md:p-8 w-full max-w-3xl space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingPlanId ? "Edit Package & Pricing Controls" : "Create New SaaS Package"}
                </h2>
                <p className="text-xs text-zinc-400">Set retail costs (+ GST), Whitelabel base pricing, reseller commissions, and module access.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white p-2 rounded-xl bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-6 text-xs">
              
              {/* Package Name */}
              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold block">Package / Plan Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Garage SaaS"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Retail Pricing Section */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-400 flex items-center gap-1.5">
                    <Tag className="w-4 h-4" /> Retail Client Pricing (+ GST)
                  </span>
                  <span className="text-[11px] font-mono text-amber-400 font-semibold bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                    + 18% GST Applicable
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-medium block">Monthly MRP (₹)</label>
                    <input
                      type="number"
                      placeholder="1999"
                      value={form.monthlyPrice}
                      onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-medium block">Monthly Offer (₹) + GST</label>
                    <input
                      type="number"
                      placeholder="1499"
                      value={form.monthlyOfferPrice}
                      onChange={(e) => setForm({ ...form, monthlyOfferPrice: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-medium block">Yearly MRP (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="19999"
                      value={form.yearlyPrice}
                      onChange={(e) => setForm({ ...form, yearlyPrice: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-medium block">Yearly Offer (₹) + GST</label>
                    <input
                      type="number"
                      placeholder="14999"
                      value={form.yearlyOfferPrice}
                      onChange={(e) => setForm({ ...form, yearlyOfferPrice: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Partner Wholesale & Reseller Commission Controls */}
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-4">
                <span className="text-sm font-bold text-purple-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400" /> Whitelabel Partner Base Price & Reseller Commission
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-medium block">Whitelabel Monthly Base (₹)</label>
                    <input
                      type="number"
                      placeholder="999"
                      value={form.whitelabelMonthlyBasePrice}
                      onChange={(e) => setForm({ ...form, whitelabelMonthlyBasePrice: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-medium block">Whitelabel Yearly Base (₹)</label>
                    <input
                      type="number"
                      placeholder="9999"
                      value={form.whitelabelYearlyBasePrice}
                      onChange={(e) => setForm({ ...form, whitelabelYearlyBasePrice: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-medium block">Standard Reseller Comm (%)</label>
                    <input
                      type="number"
                      placeholder="25"
                      value={form.resellerCommissionRate}
                      onChange={(e) => setForm({ ...form, resellerCommissionRate: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={form.allowWhitelabelCustomMarkup}
                    onChange={(e) => setForm({ ...form, allowWhitelabelCustomMarkup: e.target.checked })}
                    className="rounded border-white/10 bg-white/5 text-purple-500 w-4 h-4"
                  />
                  <span className="text-zinc-200 font-medium">
                    Allow Whitelabel Partners to set custom end-client pricing above Base Price
                  </span>
                </label>
              </div>

              {/* Module Entitlement Checkboxes */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-400" /> Select Included Modules ({form.selectedModules.length} selected)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, selectedModules: [...AVAILABLE_MODULES] })}
                      className="text-[11px] text-blue-400 hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-zinc-600">|</span>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, selectedModules: [] })}
                      className="text-[11px] text-zinc-400 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {AVAILABLE_MODULES.map((mod) => {
                    const isChecked = form.selectedModules.includes(mod)
                    const isWhiteLabelMod = mod.includes("White Label")
                    return (
                      <label
                        key={mod}
                        onClick={() => handleModuleToggle(mod)}
                        className={`flex items-center justify-between gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? isWhiteLabelMod
                              ? "bg-purple-600/20 border-purple-500/50 text-purple-200 font-semibold shadow-md shadow-purple-500/10"
                              : "bg-blue-600/15 border-blue-500/40 text-white font-medium"
                            : isWhiteLabelMod
                              ? "bg-purple-950/10 border-purple-500/20 text-purple-400 hover:bg-purple-950/20"
                              : "bg-white/[0.02] border-white/10 text-zinc-400 hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by parent onClick
                            className={`rounded border-white/10 bg-white/5 w-4 h-4 ${isWhiteLabelMod ? "text-purple-600" : "text-blue-600"}`}
                          />
                          <span className="text-xs truncate">{mod}</span>
                        </div>
                        {isWhiteLabelMod && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                            Partner Tier
                          </span>
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
                >
                  {editingPlanId ? "Save Changes" : "Create Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
