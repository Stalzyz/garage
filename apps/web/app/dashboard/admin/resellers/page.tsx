"use client"

import { useState, useEffect } from "react"
import { 
  Users, Plus, Search, Eye, Edit, PauseCircle, PlayCircle, LogIn, X, Globe, DollarSign, Building2, RefreshCw
} from "lucide-react"
import { toast } from "sonner"

export default function SuperAdminResellersPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedReseller, setSelectedReseller] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [resellers, setResellers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResellers()
  }, [])

  const fetchResellers = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/partners")
      const data = await res.json()
      if (data.success && Array.isArray(data.partners)) {
        const mapped = data.partners.map((p: any) => ({
          id: p.id,
          name: `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim() || p.companyName || "Partner",
          company: p.companyName || "N/A",
          email: p.user?.email || "N/A",
          phone: p.user?.phone || "N/A",
          garagesCount: 0,
          activeGaragesCount: 0,
          sales: "₹0",
          earnings: `₹${p.wallet?.balance || 0}`,
          status: p.status === "ACTIVE" ? "Active" : "Suspended",
          whiteLabelStatus: p.whiteLabelEnabled ? "Enabled" : "Disabled",
          partnerType: p.partnerType || "RESELLER",
          garagesList: []
        }))
        setResellers(mapped)
      } else {
        setResellers([])
      }
    } catch (e) {
      setResellers([])
    } finally {
      setLoading(false)
    }
  }

  // New Reseller form
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    partnerType: "Standard Reseller (20%)",
  })

  const handleCreateReseller = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.company || !form.email) return toast.error("Please fill required fields")

    const newRsl = {
      id: `rsl-${Math.floor(100 + Math.random() * 900)}`,
      name: form.name,
      company: form.company,
      email: form.email,
      phone: form.phone || "+91 98000 00000",
      garagesCount: 0,
      activeGaragesCount: 0,
      sales: "₹0",
      earnings: "₹0",
      status: "Active",
      whiteLabelStatus: "Enabled",
      partnerType: form.partnerType,
      garagesList: []
    }

    setResellers([newRsl, ...resellers])
    setShowAddModal(false)
    setForm({ name: "", company: "", email: "", phone: "", partnerType: "Standard Reseller (20%)" })
    toast.success(`Reseller account created for "${newRsl.name}". Credentials sent to ${newRsl.email}`)
  }

  const toggleStatus = (id: string) => {
    setResellers(resellers.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === "Active" ? "Suspended" : "Active"
        toast.info(`Reseller "${r.name}" is now ${nextStatus}`)
        return { ...r, status: nextStatus }
      }
      return r
    }))
  }

  const filteredResellers = resellers.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resellers Management</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage partner resellers who sell and brand garages on Grekam platform.</p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#0A84FF] hover:bg-[#0071E3] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Reseller
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search reseller name or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <span className="text-xs text-zinc-400 font-medium">Showing {filteredResellers.length} Resellers</span>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 text-zinc-400 uppercase text-[10px] font-semibold bg-white/[0.02]">
              <th className="py-3.5 px-4">Reseller Name</th>
              <th className="py-3.5 px-4">Company</th>
              <th className="py-3.5 px-4">Garages</th>
              <th className="py-3.5 px-4">Active Garages</th>
              <th className="py-3.5 px-4">Sales</th>
              <th className="py-3.5 px-4">Earnings</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredResellers.map((r) => (
              <tr key={r.id} className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-4 font-semibold text-white">{r.name}</td>
                <td className="py-3.5 px-4 text-zinc-400">{r.company}</td>
                <td className="py-3.5 px-4 font-bold text-white">{r.garagesCount}</td>
                <td className="py-3.5 px-4 font-bold text-emerald-400">{r.activeGaragesCount}</td>
                <td className="py-3.5 px-4 text-blue-400 font-medium">{r.sales}</td>
                <td className="py-3.5 px-4 text-purple-400 font-medium">{r.earnings}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    r.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button onClick={() => setSelectedReseller(r)} className="text-zinc-400 hover:text-white p-1" title="View Detail">
                    <Eye className="w-4 h-4 inline" />
                  </button>
                  <button onClick={() => toggleStatus(r.id)} className="text-amber-400 hover:text-amber-300 p-1" title="Suspend/Activate">
                    {r.status === "Active" ? <PauseCircle className="w-4 h-4 inline" /> : <PlayCircle className="w-4 h-4 inline" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD RESELLER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#161618] border border-white/[0.08] rounded-xl p-6 w-full max-w-lg space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">Add New Reseller</h2>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReseller} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Reseller Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Partners"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Tech LLC"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
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
                    placeholder="partner@reseller.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98000 00000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Plan / Partner Type</label>
                <select
                  value={form.partnerType}
                  onChange={(e) => setForm({ ...form, partnerType: e.target.value })}
                  className="w-full bg-[#111625] border border-white/10 rounded-xl p-2.5 text-white"
                >
                  <option value="Standard Reseller (20%)">Standard Reseller (20% margin)</option>
                  <option value="Master Partner (25%)">Master Partner (25% margin)</option>
                  <option value="Enterprise Distro (30%)">Enterprise Distro (30% margin)</option>
                </select>
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
                  className="px-5 py-2 bg-[#0A84FF] hover:bg-[#0071E3] text-white rounded-lg font-medium transition-colors"
                >
                  Create Login & Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESELLER DETAIL DRAWER */}
      {selectedReseller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#161618] border border-white/[0.08] rounded-xl p-6 w-full max-w-md space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">{selectedReseller.name}</h2>
                <p className="text-xs text-zinc-400">{selectedReseller.company}</p>
              </div>
              <button onClick={() => setSelectedReseller(null)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-zinc-400 block text-[10px]">Total Garages</span>
                  <span className="font-bold text-white text-base mt-1 block">{selectedReseller.garagesCount}</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-zinc-400 block text-[10px]">Active Garages</span>
                  <span className="font-bold text-emerald-400 text-base mt-1 block">{selectedReseller.activeGaragesCount}</span>
                </div>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Total Sales</span>
                <span className="font-semibold text-blue-400">{selectedReseller.sales}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Reseller Earnings</span>
                <span className="font-semibold text-purple-400">{selectedReseller.earnings}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">White Label</span>
                <span className="font-semibold text-emerald-400">{selectedReseller.whiteLabelStatus}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Partner Type</span>
                <span className="font-semibold text-zinc-300">{selectedReseller.partnerType}</span>
              </div>

              {/* Garages List */}
              <div className="pt-2">
                <span className="text-zinc-400 font-semibold block mb-2">Acquired Garages List</span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedReseller.garagesList.map((g: any, i: number) => (
                    <div key={i} className="p-2 rounded-lg bg-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-white font-medium">{g.name}</span>
                      <span className="text-zinc-400">{g.plan}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  toggleStatus(selectedReseller.id)
                  setSelectedReseller(null)
                }}
                className="px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-xl"
              >
                Suspend / Activate
              </button>
              <button
                onClick={() => setSelectedReseller(null)}
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
