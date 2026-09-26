"use client"

import { useState } from "react"
import { 
  Building2, Plus, Search, Eye, Edit, PauseCircle, PlayCircle, RefreshCw, LogIn, X, Check, ShieldCheck
} from "lucide-react"
import { toast } from "sonner"

export default function ResellerGaragesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedGarage, setSelectedGarage] = useState<any | null>(null)

  const [garages, setGarages] = useState([
    {
      id: "gar-101",
      name: "Apex Auto Care",
      owner: "Rajesh Kumar",
      email: "rajesh@apexauto.com",
      phone: "+91 98765 43210",
      plan: "Enterprise Garage",
      status: "Active",
      createdDate: "2025-09-10",
      renewalDate: "2026-10-15",
      domain: "apex.autocare.com",
      whiteLabelStatus: "Custom Branding Active",
      usage: { customers: 1240, staff: 12, storage: "4.2 GB / 20 GB" }
    },
    {
      id: "gar-102",
      name: "Speedy Motors",
      owner: "Anita Sharma",
      email: "anita@speedymotors.in",
      phone: "+91 98123 45678",
      plan: "Growth Garage",
      status: "Active",
      createdDate: "2025-10-01",
      renewalDate: "2026-10-02",
      domain: "speedy.reseller.com",
      whiteLabelStatus: "Default Branding",
      usage: { customers: 650, staff: 6, storage: "1.8 GB / 10 GB" }
    },
    {
      id: "gar-103",
      name: "Royal Auto Works",
      owner: "Suresh Patel",
      email: "suresh@royalautoworks.in",
      phone: "+91 97111 22334",
      plan: "Basic Garage",
      status: "Expiring Soon",
      createdDate: "2025-09-28",
      renewalDate: "2026-09-29",
      domain: "royal.garage.in",
      whiteLabelStatus: "Custom Branding Active",
      usage: { customers: 310, staff: 3, storage: "0.9 GB / 5 GB" }
    },
  ])

  // New Garage Form state
  const [newForm, setNewForm] = useState({
    name: "",
    ownerName: "",
    email: "",
    phone: "",
    plan: "Growth Garage",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    logo: "",
    domain: "",
  })

  const handleCreateGarage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newForm.name || !newForm.ownerName || !newForm.email) {
      toast.error("Please fill in Garage Name, Owner Name, and Email")
      return
    }

    const created = {
      id: `gar-${Math.floor(100 + Math.random() * 900)}`,
      name: newForm.name,
      owner: newForm.ownerName,
      email: newForm.email,
      phone: newForm.phone || "+91 99000 00000",
      plan: newForm.plan,
      status: "Active",
      createdDate: newForm.startDate,
      renewalDate: newForm.expiryDate,
      domain: newForm.domain || `${newForm.name.toLowerCase().replace(/\s+/g, "")}.reseller.com`,
      whiteLabelStatus: newForm.logo ? "Custom Branding Active" : "Default Branding",
      usage: { customers: 0, staff: 1, storage: "0.1 GB / 10 GB" }
    }

    setGarages([created, ...garages])
    setShowAddModal(false)

    // Dispatch automated welcome email
    fetch("/api/notifications/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "WELCOME_GARAGE",
        recipientEmail: created.email,
        recipientName: created.owner,
        details: { garageName: created.name, plan: created.plan, loginUrl: "http://localhost:8888/auth/login" },
      }),
    }).catch(console.error)

    setNewForm({
      name: "",
      ownerName: "",
      email: "",
      phone: "",
      plan: "Growth Garage",
      startDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      logo: "",
      domain: "",
    })
    toast.success(`Garage "${created.name}" created! Welcome email dispatched to ${created.email}.`)
  }

  const toggleStatus = (id: string) => {
    setGarages(garages.map(g => {
      if (g.id === id) {
        const nextStatus = g.status === "Active" ? "Suspended" : "Active"
        toast.info(`Garage "${g.name}" is now ${nextStatus}`)
        return { ...g, status: nextStatus }
      }
      return g
    }))
  }

  const handleRenew = (id: string) => {
    setGarages(garages.map(g => {
      if (g.id === id) {
        toast.success(`Garage "${g.name}" subscription renewed for 1 year!`)
        return { ...g, status: "Active", renewalDate: "2027-09-26" }
      }
      return g
    }))
  }

  const filteredGarages = garages.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.owner.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          <h1 className="text-2xl font-bold tracking-tight">My Garages</h1>
          <p className="text-xs text-zinc-400 mt-1">Garages assigned directly under your reseller account.</p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Garage
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search garage name or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <span className="text-xs text-zinc-400 font-medium">Showing {filteredGarages.length} Garages</span>
      </div>

      {/* Simple Garages Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 text-zinc-400 uppercase text-[10px] font-semibold bg-white/[0.02]">
              <th className="py-3.5 px-4">Garage Name</th>
              <th className="py-3.5 px-4">Owner</th>
              <th className="py-3.5 px-4">Plan</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Renewal</th>
              <th className="py-3.5 px-4">Domain</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredGarages.map((g) => (
              <tr key={g.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-4 font-semibold text-white">{g.name}</td>
                <td className="py-3.5 px-4 text-zinc-400">{g.owner}</td>
                <td className="py-3.5 px-4 text-zinc-300">{g.plan}</td>
                <td className="py-3.5 px-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    g.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    g.status === "Expiring Soon" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                    "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    {g.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-zinc-400">{g.renewalDate}</td>
                <td className="py-3.5 px-4 text-blue-400 font-mono text-[11px]">{g.domain}</td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button 
                    onClick={() => setSelectedGarage(g)}
                    className="text-zinc-400 hover:text-white p-1" 
                    title="View Detail"
                  >
                    <Eye className="w-4 h-4 inline" />
                  </button>
                  <button 
                    onClick={() => handleRenew(g.id)}
                    className="text-emerald-400 hover:text-emerald-300 p-1" 
                    title="Renew"
                  >
                    <RefreshCw className="w-4 h-4 inline" />
                  </button>
                  <button 
                    onClick={() => toggleStatus(g.id)}
                    className="text-amber-400 hover:text-amber-300 p-1" 
                    title={g.status === "Active" ? "Suspend" : "Activate"}
                  >
                    {g.status === "Active" ? <PauseCircle className="w-4 h-4 inline" /> : <PlayCircle className="w-4 h-4 inline" />}
                  </button>
                  <button 
                    onClick={() => handleImpersonate(g.id, g.name)}
                    className="text-blue-400 hover:text-blue-300 p-1" 
                    title="Login as Garage"
                  >
                    <LogIn className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD GARAGE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b0f19] border border-white/10 rounded-3xl p-6 w-full max-w-lg space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">Add New Garage</h2>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGarage} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Garage Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metro Garage Works"
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
                    placeholder="e.g. Ramesh V"
                    value={newForm.ownerName}
                    onChange={(e) => setNewForm({ ...newForm, ownerName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="owner@garage.com"
                    value={newForm.email}
                    onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98000 00000"
                    value={newForm.phone}
                    onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Plan</label>
                  <select
                    value={newForm.plan}
                    onChange={(e) => setNewForm({ ...newForm, plan: e.target.value })}
                    className="w-full bg-[#111625] border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    <option value="Basic Garage">Basic Garage</option>
                    <option value="Growth Garage">Growth Garage</option>
                    <option value="Enterprise Garage">Enterprise Garage</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Start Date</label>
                  <input
                    type="date"
                    value={newForm.startDate}
                    onChange={(e) => setNewForm({ ...newForm, startDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Expiry Date</label>
                  <input
                    type="date"
                    value={newForm.expiryDate}
                    onChange={(e) => setNewForm({ ...newForm, expiryDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Domain (Optional)</label>
                  <input
                    type="text"
                    placeholder="garage.com or garage.reseller.com"
                    value={newForm.domain}
                    onChange={(e) => setNewForm({ ...newForm, domain: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Logo URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={newForm.logo}
                    onChange={(e) => setNewForm({ ...newForm, logo: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                  />
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
                  Create Garage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GARAGE DETAIL DRAWER */}
      {selectedGarage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b0f19] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">{selectedGarage.name}</h2>
                <p className="text-xs text-zinc-400">{selectedGarage.domain}</p>
              </div>
              <button onClick={() => setSelectedGarage(null)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Owner</span>
                <span className="font-semibold text-white">{selectedGarage.owner}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Email</span>
                <span className="font-semibold text-white">{selectedGarage.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Phone</span>
                <span className="font-semibold text-white">{selectedGarage.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Plan</span>
                <span className="font-semibold text-blue-400">{selectedGarage.plan}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Status</span>
                <span className="font-semibold text-emerald-400">{selectedGarage.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Created Date</span>
                <span className="font-semibold text-zinc-300">{selectedGarage.createdDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Renewal Date</span>
                <span className="font-semibold text-zinc-300">{selectedGarage.renewalDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">White Label Status</span>
                <span className="font-semibold text-purple-400">{selectedGarage.whiteLabelStatus}</span>
              </div>

              {/* Usage */}
              <div className="pt-2">
                <span className="text-zinc-400 font-semibold block mb-2">Resource Usage</span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <p className="text-[10px] text-zinc-400">Customers</p>
                    <p className="font-bold text-white mt-1">{selectedGarage.usage.customers}</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <p className="text-[10px] text-zinc-400">Staff</p>
                    <p className="font-bold text-white mt-1">{selectedGarage.usage.staff}</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <p className="text-[10px] text-zinc-400">Storage</p>
                    <p className="font-bold text-white mt-1 text-[10px]">{selectedGarage.usage.storage}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  handleRenew(selectedGarage.id)
                  setSelectedGarage(null)
                }}
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl"
              >
                Renew
              </button>
              <button
                onClick={() => {
                  toggleStatus(selectedGarage.id)
                  setSelectedGarage(null)
                }}
                className="px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-xl"
              >
                Suspend
              </button>
              <button
                onClick={() => setSelectedGarage(null)}
                className="px-3 py-1.5 bg-white/5 text-white text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
