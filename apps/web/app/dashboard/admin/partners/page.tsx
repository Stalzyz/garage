"use client"

import { useState, useEffect } from "react"
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Wallet, 
  Building2, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  ShieldCheck, 
  DollarSign, 
  MoreVertical, 
  RefreshCw,
  Edit2
} from "lucide-react"

interface Partner {
  id: string
  name: string
  company: string
  email: string
  phone?: string
  type: "RESELLER" | "WHITE_LABEL"
  status: "ACTIVE" | "PENDING" | "SUSPENDED"
  kycStatus: "APPROVED" | "PENDING" | "REJECTED"
  walletBalance: number
  customerCount: number
  commissionPercent: number
  whiteLabelEnabled: boolean
  whiteLabel?: {
    brandName: string
    customDomain?: string
    domainStatus: string
  }
  createdAt: string
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  
  // Wallet Adjustment form
  const [walletForm, setWalletForm] = useState({
    amount: "",
    type: "CREDIT" as "CREDIT" | "DEBIT",
    notes: "",
  })
  const [walletSubmitting, setWalletSubmitting] = useState(false)

  // Add Partner form
  const [addForm, setAddForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    companyName: "",
    partnerType: "WHITE_LABEL" as "RESELLER" | "WHITE_LABEL",
    commissionPercent: "20",
    whiteLabelEnabled: true,
  })
  const [addSubmitting, setAddSubmitting] = useState(false)

  useEffect(() => {
    fetchPartners()
  }, [typeFilter, statusFilter])

  async function fetchPartners() {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/partners?type=${typeFilter}&status=${statusFilter}`)
      const data = await res.json()
      if (data.success && data.partners) {
        setPartners(data.partners)
      }
    } catch (err) {
      console.error("Failed to load partners:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleStatus(partner: Partner) {
    const isSuspending = partner.status === "ACTIVE"
    const endpoint = isSuspending
      ? `/api/admin/partners/${partner.id}/suspend`
      : `/api/admin/partners/${partner.id}/approve`

    if (!confirm(`Are you sure you want to ${isSuspending ? "SUSPEND" : "APPROVE"} ${partner.company}?`)) {
      return
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: isSuspending ? "Admin suspended" : "Admin approved" }),
      })
      const data = await res.json()
      if (data.success) {
        fetchPartners()
      } else {
        alert(data.error || "Action failed")
      }
    } catch (err) {
      alert("Network error.")
    }
  }

  async function handleWalletAdjust(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPartner) return
    setWalletSubmitting(true)

    try {
      const res = await fetch(`/api/admin/partners/${selectedPartner.id}/wallet/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(walletForm.amount),
          type: walletForm.type,
          notes: walletForm.notes || "Admin Manual Adjustment",
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowWalletModal(false)
        setWalletForm({ amount: "", type: "CREDIT", notes: "" })
        fetchPartners()
      } else {
        alert(data.error || "Wallet adjustment failed")
      }
    } catch (err) {
      alert("Network error")
    } finally {
      setWalletSubmitting(false)
    }
  }

  async function handleAddPartner(e: React.FormEvent) {
    e.preventDefault()
    setAddSubmitting(true)

    try {
      const res = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      })
      const data = await res.json()
      if (data.success) {
        setShowAddModal(false)
        setAddForm({
          firstName: "",
          lastName: "",
          email: "",
          companyName: "",
          partnerType: "WHITE_LABEL",
          commissionPercent: "20",
          whiteLabelEnabled: true,
        })
        fetchPartners()
      } else {
        alert(data.error || "Failed to create partner")
      }
    } catch (err) {
      alert("Network error")
    } finally {
      setAddSubmitting(false)
    }
  }

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.company.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalWalletBalances = partners.reduce((sum, p) => sum + p.walletBalance, 0)
  const totalCustomers = partners.reduce((sum, p) => sum + p.customerCount, 0)

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Partner Control Plane</h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Manage Reseller & White-Label partners, monitor prepaid wallets, and adjust credit balances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPartners}
            className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Add New Partner
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Partners</span>
          <p className="text-3xl font-bold text-white">{partners.length}</p>
          <p className="text-xs text-zinc-500">
            {partners.filter(p => p.type === "WHITE_LABEL").length} White-Label, {partners.filter(p => p.type === "RESELLER").length} Reseller
          </p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Prepaid Float in Wallets</span>
          <p className="text-3xl font-bold text-emerald-400 font-mono">₹{totalWalletBalances.toLocaleString()}</p>
          <p className="text-xs text-zinc-500">Secured in Grekam platform escrow</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Partner Activated Workshops</span>
          <p className="text-3xl font-bold text-white">{totalCustomers}</p>
          <p className="text-xs text-zinc-500">Live active garage tenants</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">KYC Verification</span>
          <p className="text-3xl font-bold text-blue-400">
            {partners.filter(p => p.kycStatus === "APPROVED").length} / {partners.length}
          </p>
          <p className="text-xs text-zinc-500">Legally verified Indian entities</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-300 focus:outline-none"
          >
            <option value="ALL">All Partner Types</option>
            <option value="WHITE_LABEL">White-Label</option>
            <option value="RESELLER">Reseller</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Partners Table */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/80 text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Partner Entity</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Wallet Balance</th>
                <th className="px-6 py-4">Garages</th>
                <th className="px-6 py-4">White-Label Domain</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading partner accounts...
                  </td>
                </tr>
              ) : filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    No partners found matching query.
                  </td>
                </tr>
              ) : (
                filteredPartners.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-800/30 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-white">{p.company}</p>
                        <p className="text-xs text-zinc-400">{p.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        p.type === "WHITE_LABEL" 
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}>
                        {p.type === "WHITE_LABEL" ? "White-Label" : "Reseller"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        p.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        p.status === "SUSPENDED" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">₹{p.walletBalance.toLocaleString()}</span>
                        <button
                          onClick={() => {
                            setSelectedPartner(p)
                            setShowWalletModal(true)
                          }}
                          className="p-1 hover:bg-zinc-800 rounded text-emerald-400 transition"
                          title="Adjust Balance"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-medium">
                      {p.customerCount} workshops
                    </td>
                    <td className="px-6 py-4">
                      {p.whiteLabel?.customDomain ? (
                        <span className="text-xs font-mono text-zinc-400">{p.whiteLabel.customDomain}</span>
                      ) : (
                        <span className="text-xs text-zinc-600">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            p.status === "ACTIVE"
                              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                              : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                          }`}
                        >
                          {p.status === "ACTIVE" ? "Suspend" : "Approve"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Wallet Balance Modal */}
      {showWalletModal && selectedPartner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                Adjust Prepaid Wallet
              </h3>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-zinc-950 rounded-xl space-y-1">
              <p className="text-xs text-zinc-400">Partner: <span className="text-white font-semibold">{selectedPartner.company}</span></p>
              <p className="text-xs text-zinc-400">Current Balance: <span className="text-emerald-400 font-mono font-bold">₹{selectedPartner.walletBalance.toLocaleString()}</span></p>
            </div>

            <form onSubmit={handleWalletAdjust} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setWalletForm({ ...walletForm, type: "CREDIT" })}
                  className={`py-2.5 rounded-xl text-xs font-semibold border transition ${
                    walletForm.type === "CREDIT"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400"
                  }`}
                >
                  + Credit (Add Funds)
                </button>
                <button
                  type="button"
                  onClick={() => setWalletForm({ ...walletForm, type: "DEBIT" })}
                  className={`py-2.5 rounded-xl text-xs font-semibold border transition ${
                    walletForm.type === "DEBIT"
                      ? "bg-red-500/20 border-red-500 text-red-400"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400"
                  }`}
                >
                  - Debit (Deduct Funds)
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Amount (₹)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={walletForm.amount}
                  onChange={(e) => setWalletForm({ ...walletForm, amount: e.target.value })}
                  placeholder="50000"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/60 font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Adjustment Reason / Reference</label>
                <input
                  type="text"
                  value={walletForm.notes}
                  onChange={(e) => setWalletForm({ ...walletForm, notes: e.target.value })}
                  placeholder="NEFT bank transfer ref #9088123"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/60"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowWalletModal(false)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={walletSubmitting}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-semibold rounded-xl text-sm transition"
                >
                  {walletSubmitting ? "Adjusting..." : "Confirm Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Register New Partner
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPartner} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">First Name</label>
                  <input
                    type="text"
                    value={addForm.firstName}
                    onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                    placeholder="Suresh"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/60"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Last Name</label>
                  <input
                    type="text"
                    value={addForm.lastName}
                    onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
                    placeholder="Kumar"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Partner Email</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="suresh@apexautohub.com"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/60"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Agency / Company Name</label>
                <input
                  type="text"
                  value={addForm.companyName}
                  onChange={(e) => setAddForm({ ...addForm, companyName: e.target.value })}
                  placeholder="Apex Auto Hub Private Limited"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/60"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Partner Model</label>
                  <select
                    value={addForm.partnerType}
                    onChange={(e) => setAddForm({ ...addForm, partnerType: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                  >
                    <option value="WHITE_LABEL">White-Label Partner</option>
                    <option value="RESELLER">Reseller Partner</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Commission / Margin %</label>
                  <input
                    type="number"
                    value={addForm.commissionPercent}
                    onChange={(e) => setAddForm({ ...addForm, commissionPercent: e.target.value })}
                    placeholder="20"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSubmitting}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-semibold rounded-xl text-sm transition"
                >
                  {addSubmitting ? "Creating..." : "Create Partner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
