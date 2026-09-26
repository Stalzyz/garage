"use client"

import { useState } from "react"
import { DollarSign, Plus, Edit, Check, X, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

export default function SuperAdminPlansPage() {
  const [showModal, setShowModal] = useState(false)
  const [plans, setPlans] = useState([
    {
      id: "plan-1",
      name: "Basic Garage",
      monthlyPrice: "₹1,499",
      yearlyPrice: "₹14,999",
      garageLimit: 1,
      status: "Active",
      features: ["Garage Customers (Up to 500)", "Staff Accounts (3)", "Storage (5 GB)", "Reports"],
    },
    {
      id: "plan-2",
      name: "Growth Garage",
      monthlyPrice: "₹2,999",
      yearlyPrice: "₹29,999",
      garageLimit: 1,
      status: "Active",
      features: ["Garage Customers (Up to 2500)", "Staff Accounts (10)", "Storage (15 GB)", "WhatsApp Automation", "Reports"],
    },
    {
      id: "plan-3",
      name: "Enterprise Garage",
      monthlyPrice: "₹4,999",
      yearlyPrice: "₹49,999",
      garageLimit: 1,
      status: "Active",
      features: ["Garage Customers (Unlimited)", "Staff Accounts (25)", "Storage (50 GB)", "WhatsApp Automation", "Reports", "White Label Custom Domain"],
    },
  ])

  const [form, setForm] = useState({
    name: "",
    monthlyPrice: "",
    yearlyPrice: "",
    garageLimit: 1,
    hasWhatsApp: true,
    hasReports: true,
    hasWhiteLabel: false,
  })

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.monthlyPrice || !form.yearlyPrice) return toast.error("Please fill required fields")

    const created = {
      id: `plan-${Math.floor(100 + Math.random() * 900)}`,
      name: form.name,
      monthlyPrice: `₹${form.monthlyPrice}`,
      yearlyPrice: `₹${form.yearlyPrice}`,
      garageLimit: form.garageLimit,
      status: "Active",
      features: [
        "Garage Customers",
        "Staff Accounts",
        "Storage",
        ...(form.hasWhatsApp ? ["WhatsApp"] : []),
        ...(form.hasReports ? ["Reports"] : []),
        ...(form.hasWhiteLabel ? ["White Label"] : []),
      ]
    }

    setPlans([...plans, created])
    setShowModal(false)
    setForm({ name: "", monthlyPrice: "", yearlyPrice: "", garageLimit: 1, hasWhatsApp: true, hasReports: true, hasWhiteLabel: false })
    toast.success(`Plan "${created.name}" created successfully!`)
  }

  const toggleStatus = (id: string) => {
    setPlans(plans.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === "Active" ? "Deactivated" : "Active"
        toast.info(`Plan "${p.name}" is now ${nextStatus}`)
        return { ...p, status: nextStatus }
      }
      return p
    }))
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
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plans & Pricing</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage platform subscription plans, pricing tiers, and feature entitlements.</p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" /> Create Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">{p.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  p.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400"
                }`}>
                  {p.status}
                </span>
              </div>

              <div className="mt-3 space-y-1">
                <p className="text-2xl font-black text-blue-400">{p.yearlyPrice} <span className="text-xs font-normal text-zinc-400">/ yr</span></p>
                <p className="text-xs text-zinc-400">{p.monthlyPrice} / month</p>
              </div>

              <div className="pt-4 space-y-2 border-t border-white/5 text-xs text-zinc-300">
                <span className="font-semibold text-zinc-400 uppercase text-[10px] block mb-2">Features Included</span>
                {p.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
              <button onClick={() => toggleStatus(p.id)} className="text-xs text-zinc-400 hover:text-white">
                {p.status === "Active" ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={() => handleTestCheckout(p.name, p.yearlyPrice)}
                className="text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 font-semibold px-2.5 py-1 rounded-lg border border-blue-500/30"
              >
                Test Checkout
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE PLAN MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b0f19] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">Create New Plan</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Plan Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starter Garage"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Monthly Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="1999"
                    value={form.monthlyPrice}
                    onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Yearly Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="19999"
                    value={form.yearlyPrice}
                    onChange={(e) => setForm({ ...form, yearlyPrice: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-zinc-400 font-semibold block">Features Included</span>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.hasWhatsApp}
                      onChange={(e) => setForm({ ...form, hasWhatsApp: e.target.checked })}
                      className="rounded border-white/10 bg-white/5 text-blue-600"
                    />
                    <span>WhatsApp Automation</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.hasReports}
                      onChange={(e) => setForm({ ...form, hasReports: e.target.checked })}
                      className="rounded border-white/10 bg-white/5 text-blue-600"
                    />
                    <span>Advanced Reports</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.hasWhiteLabel}
                      onChange={(e) => setForm({ ...form, hasWhiteLabel: e.target.checked })}
                      className="rounded border-white/10 bg-white/5 text-blue-600"
                    />
                    <span>White Label & Custom Domain</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/30"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
