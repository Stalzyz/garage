"use client"

import { useState } from "react"
import { 
  Building2, Search, Eye, Edit, PauseCircle, PlayCircle, RefreshCw, LogIn, X, ShieldCheck, Plus
} from "lucide-react"
import { toast } from "sonner"

export default function SuperAdminGaragesPage() {
  const [activeTab, setActiveTab] = useState<"All" | "Direct" | "Reseller">("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)

  const [garages, setGarages] = useState([
    { id: "g-1", name: "Apex Auto Care", owner: "Rajesh Kumar", type: "Reseller", plan: "Enterprise Garage", reseller: "Apex SaaS Partners", status: "Active", renewal: "2026-10-15" },
    { id: "g-2", name: "City Auto Garage (Direct)", owner: "Manish Sharma", type: "Direct", plan: "Growth Garage", reseller: "Direct Customer", status: "Active", renewal: "2026-11-20" },
    { id: "g-3", name: "Speedy Motors", owner: "Anita Sharma", type: "Reseller", plan: "Growth Garage", reseller: "Apex SaaS Partners", status: "Active", renewal: "2026-10-02" },
    { id: "g-4", name: "Grekam Flagship Garage", owner: "Sanjay Gupta", type: "Direct", plan: "Enterprise Garage", reseller: "Direct Customer", status: "Active", renewal: "2027-01-15" },
    { id: "g-5", name: "Royal Auto Works", owner: "Suresh Patel", type: "Reseller", plan: "Basic Garage", reseller: "Royal Resellers", status: "Expiring Soon", renewal: "2026-09-29" },
  ])

  const [newForm, setNewForm] = useState({
    name: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    plan: "Growth Garage",
    type: "Direct",
  })

  const handleCreateGarage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newForm.name || !newForm.ownerName || !newForm.email) {
      toast.error("Please fill in Garage Name, Owner Name, and Email")
      return
    }

    toast.loading("Saving new garage to PostgreSQL database...")

    try {
      const nameParts = newForm.ownerName.trim().split(" ")
      const res = await fetch("/api/tenants/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garageName: newForm.name,
          ownerFirstName: nameParts[0] || "Garage",
          ownerLastName: nameParts.slice(1).join(" ") || "Owner",
          email: newForm.email,
          phone: newForm.phone,
          password: newForm.password,
          subdomain: newForm.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
          plan: newForm.plan,
        }),
      })

      const data = await res.json()
      toast.dismiss()

      if (!res.ok) throw new Error(data.error || "Failed to save garage")

      const created = {
        id: data.tenant?.id || `gar-${Math.floor(100 + Math.random() * 900)}`,
        name: newForm.name,
        owner: newForm.ownerName,
        type: newForm.type,
        plan: newForm.plan,
        reseller: newForm.type === "Direct" ? "Direct Customer" : "Partner Reseller",
        status: "Active",
        renewal: "2027-09-26",
      }

      setGarages([created, ...garages])
      setShowAddModal(false)
      setNewForm({ name: "", ownerName: "", email: "", phone: "", password: "", plan: "Growth Garage", type: "Direct" })

      toast.success(`Garage "${created.name}" saved to DB! Login: ${newForm.email} | Pass: ${data.user?.tempPassword || "Garage@2026!"}`)
    } catch (error: any) {
      toast.dismiss()
      toast.error(`Error saving garage: ${error.message}`)
    }
  }

  const toggleStatus = (id: string) => {
    setGarages(garages.map(g => {
      if (g.id === id) {
        const nextStatus = g.status === "Active" ? "Suspended" : "Active"
        toast.info(`Garage "${g.name}" status changed to ${nextStatus}`)
        return { ...g, status: nextStatus }
      }
      return g
    }))
  }

  const handleRenew = (id: string) => {
    setGarages(garages.map(g => {
      if (g.id === id) {
        toast.success(`Garage "${g.name}" subscription extended by 1 year!`)
        return { ...g, status: "Active", renewal: "2027-09-26" }
      }
      return g
    }))
  }

  const filteredGarages = garages.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.owner.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "All" || g.type === activeTab
    return matchesSearch && matchesTab
  })

  const handleImpersonate = async (id: string, name: string) => {
    toast.loading(`Logging in as ${name}...`)
    try {
      const res = await fetch("/api/auth/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ garageId: id, garageName: name }),
      })
      const data = await res.json()
      if (data.success) {
        toast.dismiss()
        toast.success(`Access granted! Switching scope to ${name}`)
        window.location.href = data.redirectUrl
      } else {
        toast.dismiss()
        toast.error(data.error || "Impersonation failed")
      }
    } catch {
      toast.dismiss()
      toast.error("Failed to connect to impersonation service")
    }
  }

  return (
    <div className="p-8 space-y-6 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Garages Control Center</h1>
          <p className="text-xs text-zinc-400 mt-1">Global view of all Direct Garages and Reseller-managed Garages.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" /> Provision Garage
          </button>

          {/* Tabs */}
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-semibold">
            {(["All", "Direct", "Reseller"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab ? "bg-blue-600 text-white shadow-md" : "text-zinc-400 hover:text-white"
                }`}
              >
                {tab === "All" ? "All Garages" : tab === "Direct" ? "Direct Customers" : "Reseller Garages"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="flex items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search all garages or owners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <span className="text-xs text-zinc-400 font-medium">Showing {filteredGarages.length} Garages</span>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 text-zinc-400 uppercase text-[10px] font-semibold bg-white/[0.02]">
              <th className="py-3.5 px-4">Garage Name</th>
              <th className="py-3.5 px-4">Owner</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Plan</th>
              <th className="py-3.5 px-4">Reseller</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Renewal</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredGarages.map((g) => (
              <tr key={g.id} className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-4 font-semibold text-white">{g.name}</td>
                <td className="py-3.5 px-4 text-zinc-400">{g.owner}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                    g.type === "Direct" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  }`}>
                    {g.type}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-zinc-300">{g.plan}</td>
                <td className="py-3.5 px-4 text-zinc-400">{g.reseller}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    g.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    g.status === "Expiring Soon" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                    "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    {g.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-zinc-400">{g.renewal}</td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button onClick={() => toast.info(`Viewing ${g.name}...`)} className="text-zinc-400 hover:text-white p-1" title="View">
                    <Eye className="w-4 h-4 inline" />
                  </button>
                  <button onClick={() => handleRenew(g.id)} className="text-emerald-400 hover:text-emerald-300 p-1" title="Renew">
                    <RefreshCw className="w-4 h-4 inline" />
                  </button>
                  <button onClick={() => toggleStatus(g.id)} className="text-amber-400 hover:text-amber-300 p-1" title="Suspend/Activate">
                    {g.status === "Active" ? <PauseCircle className="w-4 h-4 inline" /> : <PlayCircle className="w-4 h-4 inline" />}
                  </button>
                  <button onClick={() => handleImpersonate(g.id, g.name)} className="text-blue-400 hover:text-blue-300 p-1" title="Login as Garage">
                    <LogIn className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PROVISION GARAGE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b0f19] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">Provision New Garage</h2>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGarage} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Garage Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. City Auto Care"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Owner Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={newForm.ownerName}
                  onChange={(e) => setNewForm({ ...newForm, ownerName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Owner Email (Username) *</label>
                  <input
                    type="email"
                    required
                    placeholder="rajesh@cityauto.com"
                    value={newForm.email}
                    onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Initial Password *</label>
                  <input
                    type="text"
                    placeholder="e.g. Garage@2026!"
                    value={newForm.password}
                    onChange={(e) => setNewForm({ ...newForm, password: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Subscription Plan</label>
                  <select
                    value={newForm.plan}
                    onChange={(e) => setNewForm({ ...newForm, plan: e.target.value })}
                    className="w-full bg-[#111625] border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    <option value="Basic Garage">Basic Garage (₹14,999/yr)</option>
                    <option value="Growth Garage">Growth Garage (₹29,999/yr)</option>
                    <option value="Enterprise Garage">Enterprise Garage (₹49,999/yr)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Customer Type</label>
                  <select
                    value={newForm.type}
                    onChange={(e) => setNewForm({ ...newForm, type: e.target.value as any })}
                    className="w-full bg-[#111625] border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    <option value="Direct">Direct Customer</option>
                    <option value="Reseller">Reseller Garage</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/30"
                >
                  Provision & Save to DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
