"use client"

import { useState, useEffect } from "react"
import { 
  Building2, Search, Eye, Edit, PauseCircle, PlayCircle, RefreshCw, LogIn, X, ShieldCheck, Plus, Key, Lock, Copy, Check
} from "lucide-react"
import { toast } from "sonner"

export default function SuperAdminGaragesPage() {
  const [activeTab, setActiveTab] = useState<"All" | "Direct" | "Reseller">("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [garages, setGarages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Reset Password Modal State
  const [resetModalGarage, setResetModalGarage] = useState<any | null>(null)
  const [customResetPassword, setCustomResetPassword] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [copiedPass, setCopiedPass] = useState(false)

  const [newForm, setNewForm] = useState({
    name: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    plan: "Growth Garage",
    type: "Direct",
  })

  const generateRandomPassword = () => {
    return `Garage@${Math.floor(1000 + Math.random() * 9000)}!`
  }

  const fetchGarages = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/garages?type=${activeTab}`)
      const data = await res.json()
      if (data.success && data.garages) {
        setGarages(data.garages)
      } else {
        setGarages([])
      }
    } catch {
      toast.error("Failed to fetch garages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGarages()
  }, [activeTab])

  const handleCreateGarage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newForm.name || !newForm.ownerName || !newForm.email) {
      toast.error("Please fill in Garage Name, Owner Name, and Email")
      return
    }

    toast.loading("Provisioning new garage...")

    try {
      const nameParts = newForm.ownerName.trim().split(" ")
      const chosenPassword = newForm.password.trim() || generateRandomPassword()

      const res = await fetch("/api/tenants/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garageName: newForm.name,
          ownerFirstName: nameParts[0] || "Garage",
          ownerLastName: nameParts.slice(1).join(" ") || "Owner",
          email: newForm.email,
          phone: newForm.phone,
          password: chosenPassword,
          subdomain: newForm.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
          plan: newForm.plan,
        }),
      })

      const data = await res.json()
      toast.dismiss()

      if (data.success) {
        toast.success(`Garage "${newForm.name}" created! Password: ${chosenPassword}`)
        setShowAddModal(false)
        setNewForm({
          name: "",
          ownerName: "",
          email: "",
          phone: "",
          password: "",
          plan: "Growth Garage",
          type: "Direct",
        })
        fetchGarages()
      } else {
        toast.error(data.error || "Failed to create garage")
      }
    } catch {
      toast.dismiss()
      toast.error("Network error while creating garage")
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetModalGarage) return
    setResetLoading(true)

    try {
      const res = await fetch(`/api/admin/garages/${resetModalGarage.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: customResetPassword }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message || "Password reset successfully!")
        setCustomResetPassword(json.newPassword)
      } else {
        toast.error(json.error || "Failed to reset password")
      }
    } catch {
      toast.error("Error resetting password")
    } finally {
      setResetLoading(false)
    }
  }

  const filteredGarages = garages.filter(g =>
    (g.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.owner || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.reseller || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Top Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Garages Directory & Tenancy</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage and audit all direct garage subscriptions and white-label partner client workshops.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchGarages}
            className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              setNewForm(prev => ({ ...prev, password: generateRandomPassword() }))
              setShowAddModal(true)
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Direct Garage
          </button>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 w-fit">
          {(["All", "Direct", "Reseller"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab === "All" ? `All Garages (${garages.length})` : tab === "Direct" ? "Direct Only" : "Partner / Reseller"}
            </button>
          ))}
        </div>

        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by garage name, owner, or partner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Garages Table */}
      <div className="bg-[#080d1a] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-zinc-400 font-semibold uppercase text-[10px] bg-white/[0.02]">
              <tr>
                <th className="py-4 px-6">Garage & Domain</th>
                <th className="py-4 px-6">Owner</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Partner / Reseller</th>
                <th className="py-4 px-6">Plan</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    Loading garages...
                  </td>
                </tr>
              ) : filteredGarages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No garages found. Click &quot;Add Direct Garage&quot; or activate workshops via the Partner portal.
                  </td>
                </tr>
              ) : (
                filteredGarages.map((g) => (
                  <tr key={g.id} className="hover:bg-white/[0.02]">
                    <td className="py-4 px-6 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-zinc-400 shrink-0" />
                        <div>
                          <div>{g.name}</div>
                          {g.domain && <div className="text-[10px] text-zinc-500 font-normal">{g.domain}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>{g.owner}</div>
                      <div className="text-[10px] text-zinc-500">{g.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        g.type === "Direct" 
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                          : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      }`}>
                        {g.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-zinc-400 font-medium">
                      {g.reseller}
                    </td>
                    <td className="py-4 px-6 text-zinc-300 font-medium">{g.plan}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        g.status === "Active" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          setResetModalGarage(g)
                          setCustomResetPassword(generateRandomPassword())
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-[11px] font-medium inline-flex items-center gap-1.5 transition"
                        title="Change / Reset Password"
                      >
                        <Key className="w-3 h-3 text-amber-400" />
                        Reset Pass
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Direct Garage Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0b101d] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Add Direct Garage Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateGarage} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Garage Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. City Central Auto Works"
                  value={newForm.name} 
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} 
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Owner Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Manish Sharma"
                    value={newForm.ownerName} 
                    onChange={(e) => setNewForm({ ...newForm, ownerName: e.target.value })} 
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Phone</label>
                  <input 
                    type="text" 
                    placeholder="e.g. +91 9876543210"
                    value={newForm.phone} 
                    onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })} 
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Login Email *</label>
                <input 
                  type="email" 
                  required 
                  placeholder="e.g. owner@cityautoworks.com"
                  value={newForm.email} 
                  onChange={(e) => setNewForm({ ...newForm, email: e.target.value })} 
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-400 font-semibold">Initial Password *</label>
                  <button 
                    type="button" 
                    onClick={() => setNewForm({ ...newForm, password: generateRandomPassword() })} 
                    className="text-[10px] text-blue-400 hover:underline"
                  >
                    Generate Secure Pass
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter password"
                    value={newForm.password} 
                    onChange={(e) => setNewForm({ ...newForm, password: e.target.value })} 
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold">Provision Garage</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalGarage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0b101d] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Reset Garage Password</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">{resetModalGarage.name} ({resetModalGarage.email})</p>
              </div>
              <button onClick={() => setResetModalGarage(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-zinc-300 font-semibold">New Password</label>
                  <button
                    type="button"
                    onClick={() => setCustomResetPassword(generateRandomPassword())}
                    className="text-[10px] text-amber-400 hover:underline"
                  >
                    Generate Random
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customResetPassword}
                    onChange={(e) => setCustomResetPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(customResetPassword)
                      setCopiedPass(true)
                      setTimeout(() => setCopiedPass(false), 2000)
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                    title="Copy Password"
                  >
                    {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300">
                This updates the login passkey for the garage admin user immediately.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setResetModalGarage(null)} className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white">Close</button>
                <button type="submit" disabled={resetLoading} className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold">
                  {resetLoading ? "Updating..." : "Save New Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
