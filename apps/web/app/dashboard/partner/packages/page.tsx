"use client"

import { useState, useEffect } from "react"
import { Package, Plus, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function PartnerPackagesPage() {
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // Form State
  const [name, setName] = useState("")
  const [planId, setPlanId] = useState("plan-starter")
  const [description, setDescription] = useState("")
  const [sellingPrice, setSellingPrice] = useState("15000")
  const [billingCycle, setBillingCycle] = useState("YEARLY")

  const basePrice = planId === "plan-starter" ? 10000 : planId === "plan-growth" ? 25000 : 45000
  const maxPrice = basePrice * 2.0
  const margin = Math.max(0, parseFloat(sellingPrice || "0") - basePrice)
  const isPriceValid = parseFloat(sellingPrice || "0") >= basePrice && parseFloat(sellingPrice || "0") <= maxPrice

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/partner/packages")
      const json = await res.json()
      if (json.success) {
        setPackages(json.packages || [])
      } else {
        setPackages([])
      }
    } catch {
      toast.error("Failed to load packages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPriceValid) {
      toast.error(`Selling price must be between ₹${basePrice.toLocaleString()} and ₹${maxPrice.toLocaleString()}`)
      return
    }

    try {
      const res = await fetch("/api/partner/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          planId,
          description,
          sellingPrice,
          billingCycle,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message || "Package created successfully.")
        setShowModal(false)
        setName("")
        setDescription("")
        setSellingPrice("15000")
        fetchPackages()
      } else {
        toast.error(json.error || "Failed to create package")
      }
    } catch {
      toast.error("Error creating package")
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Packages</h1>
          <p className="text-xs text-zinc-400 mt-1">Create and price custom SaaS packages to offer your garage clients.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Package
        </button>
      </div>

      {/* Price Rule Card */}
      <div className="p-4.5 rounded-2xl bg-[#080D1A] border border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">White-Label Pricing Ceiling (Max 200%)</div>
            <div className="text-xs text-zinc-400 mt-0.5">
              Starter Base: <strong className="text-white">₹10,000</strong> (Sell: ₹10k–₹20k) • Pro Base: <strong className="text-white">₹10,000</strong> (Sell: ₹10k–₹20k)
            </div>
          </div>
        </div>

        <div className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 self-start md:self-auto">
          100% of the price difference is your Partner Margin
        </div>
      </div>

      {/* Packages Table */}
      <div className="bg-[#080D1A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-zinc-400 font-semibold uppercase text-[10px] bg-white/[0.02]">
              <tr>
                <th className="py-3.5 px-4">Package Name</th>
                <th className="py-3.5 px-4">Garage Plan</th>
                <th className="py-3.5 px-4">Customer Price</th>
                <th className="py-3.5 px-4">Grekam Base</th>
                <th className="py-3.5 px-4">Your Margin</th>
                <th className="py-3.5 px-4">Billing</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {packages.length > 0 ? (
                packages.map((pkg) => {
                  const base = pkg.planId === "plan-starter" ? 10000 : 10000
                  const pkgMargin = Math.max(0, pkg.sellingPrice - base)
                  return (
                    <tr key={pkg.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                        <Package className="w-4 h-4 text-purple-400" />
                        <span>{pkg.name}</span>
                      </td>
                      <td className="py-4 px-4 text-zinc-400 font-medium capitalize">
                        {pkg.planId.replace("plan-", "")}
                      </td>
                      <td className="py-4 px-4 font-bold text-white">
                        ₹{pkg.sellingPrice.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-mono text-zinc-400">
                        ₹{base.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-bold text-emerald-400">
                        +₹{pkgMargin.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-zinc-400 font-semibold capitalize">
                        {pkg.billingCycle.toLowerCase()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Active
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">No packages created yet. Click "+ Create Package".</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: CREATE PACKAGE ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0B101D] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Create Custom Package</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs leading-relaxed space-y-1">
              <div><strong>Grekam Base Price:</strong> ₹{basePrice.toLocaleString()} / year</div>
              <div><strong>Max Allowed Selling Price:</strong> ₹{maxPrice.toLocaleString()} (Max 200%)</div>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Package Name *</label>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Pro Garage Studio" 
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Base Garage Plan *</label>
                <select 
                  value={planId} 
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1322] border border-white/10 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="plan-starter">Starter Garage (Grekam Base: ₹10,000)</option>
                  <option value="plan-growth">Growth Garage (Grekam Base: ₹25,000)</option>
                  <option value="plan-pro">Pro Enterprise (Grekam Base: ₹45,000)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Selling Price (₹) *</label>
                <input 
                  type="number" 
                  required 
                  value={sellingPrice} 
                  onChange={(e) => setSellingPrice(e.target.value)} 
                  min={basePrice}
                  max={maxPrice}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-white/5 border text-white focus:outline-none font-bold text-sm ${
                    !isPriceValid ? "border-rose-500" : "border-white/10 focus:border-blue-500"
                  }`} 
                />
                <div className="flex items-center justify-between text-[11px] mt-1 text-zinc-400">
                  <span>Your Profit Margin: <strong className="text-emerald-400 font-bold">₹{margin.toLocaleString()}</strong></span>
                  <span>Limit: ₹{maxPrice.toLocaleString()}</span>
                </div>
                {!isPriceValid && (
                  <p className="text-rose-400 text-[11px] mt-1">Price must be between ₹{basePrice.toLocaleString()} and ₹{maxPrice.toLocaleString()}.</p>
                )}
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Billing Cycle</label>
                <select 
                  value={billingCycle} 
                  onChange={(e) => setBillingCycle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1322] border border-white/10 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="YEARLY">Yearly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white">Cancel</button>
                <button 
                  type="submit" 
                  disabled={!isPriceValid}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold shadow-lg shadow-purple-600/20"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
