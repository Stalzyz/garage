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
  Edit2,
  Clock,
  XCircle,
  Check,
  CreditCard,
  CheckCheck
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

interface Deposit {
  id: string
  partnerId: string
  partnerName: string
  partnerCompany: string
  partnerEmail: string
  partnerType: string
  currentWalletBalance: number
  amount: number
  paymentMode: string
  utrNumber: string
  status: string
  notes?: string
  approvedBy?: string
  approvedAt?: string
  createdAt: string
}

export default function AdminPartnersPage() {
  const [activeTab, setActiveTab] = useState<"DIRECTORY" | "DEPOSITS">("DIRECTORY")
  const [partners, setPartners] = useState<Partner[]>([])
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [loading, setLoading] = useState(true)
  const [depositsLoading, setDepositsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [depositFilter, setDepositFilter] = useState("ALL")

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
    fetchDeposits()
  }, [typeFilter, statusFilter, depositFilter])

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

  async function fetchDeposits() {
    try {
      setDepositsLoading(true)
      const res = await fetch(`/api/admin/deposits?status=${depositFilter}`)
      const data = await res.json()
      if (data.success && data.deposits) {
        setDeposits(data.deposits)
      }
    } catch (err) {
      console.error("Failed to load deposits:", err)
    } finally {
      setDepositsLoading(false)
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

  async function handleApproveDeposit(deposit: Deposit) {
    if (!confirm(`Approve offline bank deposit of ₹${deposit.amount.toLocaleString()} for ${deposit.partnerCompany} (UTR: ${deposit.utrNumber})? This will immediately credit their wallet.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/deposits/${deposit.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()
      if (data.success) {
        alert(data.message || "Deposit approved and wallet credited successfully!")
        fetchDeposits()
        fetchPartners()
      } else {
        alert(data.error || "Failed to approve deposit")
      }
    } catch {
      alert("Network error approving deposit")
    }
  }

  async function handleRejectDeposit(deposit: Deposit) {
    const reason = prompt("Enter rejection reason (e.g. UTR not found in bank statement):", "Bank transfer could not be verified")
    if (reason === null) return

    try {
      const res = await fetch(`/api/admin/deposits/${deposit.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      })
      const data = await res.json()
      if (data.success) {
        alert("Deposit request marked as REJECTED.")
        fetchDeposits()
      } else {
        alert(data.error || "Failed to reject deposit")
      }
    } catch {
      alert("Network error rejecting deposit")
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

  const pendingDepositsCount = deposits.filter(d => d.status === "PENDING").length
  const totalWalletBalances = partners.reduce((sum, p) => sum + p.walletBalance, 0)
  const totalCustomers = partners.reduce((sum, p) => sum + p.customerCount, 0)

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Partner Control Plane & Bank Settlement</h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Zero-gateway offline architecture: Verify direct bank NEFT/IMPS deposits, manage partner wallets, and control white-label permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchPartners(); fetchDeposits() }}
            className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition"
            title="Refresh Data"
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
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Prepaid Float in Escrow</span>
          <p className="text-3xl font-bold text-emerald-400 font-mono">₹{totalWalletBalances.toLocaleString()}</p>
          <p className="text-xs text-zinc-500">Bank-verified funds received offline</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pending Bank Approvals</span>
          <p className="text-3xl font-bold text-amber-400 font-mono">{pendingDepositsCount}</p>
          <p className="text-xs text-amber-500/80 font-medium">Awaiting bank statement UTR check</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Partner Activated Workshops</span>
          <p className="text-3xl font-bold text-blue-400">{totalCustomers}</p>
          <p className="text-xs text-zinc-500">Active garage tenants</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("DIRECTORY")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === "DIRECTORY"
              ? "bg-white/10 text-white border border-white/15"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Users className="w-4 h-4" /> Partner Directory & Float
        </button>

        <button
          onClick={() => setActiveTab("DEPOSITS")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition relative ${
            activeTab === "DEPOSITS"
              ? "bg-white/10 text-white border border-white/15"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <CreditCard className="w-4 h-4" /> Offline Deposit Verification Queue
          {pendingDepositsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black animate-pulse">
              {pendingDepositsCount} PENDING
            </span>
          )}
        </button>
      </div>

      {/* ── TAB 1: PARTNER DIRECTORY ── */}
      {activeTab === "DIRECTORY" && (
        <div className="space-y-4">
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
                    <th className="px-6 py-4">Type & KYC</th>
                    <th className="px-6 py-4">Prepaid Float</th>
                    <th className="px-6 py-4">Workshops</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">Loading partners...</td>
                    </tr>
                  ) : filteredPartners.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">No partners found.</td>
                    </tr>
                  ) : (
                    filteredPartners.map((partner) => (
                      <tr key={partner.id} className="hover:bg-zinc-800/30 transition">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{partner.company}</div>
                          <div className="text-xs text-zinc-400">{partner.name} &bull; {partner.email}</div>
                          {partner.whiteLabel?.customDomain && (
                            <div className="text-[11px] text-purple-400 flex items-center gap-1 mt-0.5">
                              <Globe className="w-3 h-3" /> {partner.whiteLabel.customDomain}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center w-max px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              partner.type === "WHITE_LABEL" 
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}>
                              {partner.type === "WHITE_LABEL" ? "White-Label" : "Reseller"}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-[11px] ${
                              partner.kycStatus === "APPROVED" 
                                ? "text-emerald-400" 
                                : partner.kycStatus === "REJECTED" 
                                  ? "text-rose-400" 
                                  : "text-amber-400"
                            }`}>
                              {partner.kycStatus === "APPROVED" ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                              KYC {partner.kycStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono font-bold text-emerald-400 text-base">
                            ₹{partner.walletBalance.toLocaleString()}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedPartner(partner)
                              setWalletForm({ amount: "", type: "CREDIT", notes: "" })
                              setShowWalletModal(true)
                            }}
                            className="text-[11px] text-zinc-400 hover:text-emerald-400 font-medium underline mt-0.5 inline-block"
                          >
                            + Adjust Float
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-white">{partner.customerCount}</span>
                          <span className="text-xs text-zinc-500 ml-1">garages</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            partner.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : partner.status === "PENDING"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}>
                            {partner.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleToggleStatus(partner)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                              partner.status === "ACTIVE"
                                ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {partner.status === "ACTIVE" ? "Suspend" : "Approve"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: OFFLINE DEPOSIT QUEUE ── */}
      {activeTab === "DEPOSITS" && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4">
            <div>
              <h2 className="text-base font-bold text-white">Pending & Verified Bank Deposits</h2>
              <p className="text-xs text-zinc-400">Match the Bank UTR reference against Grekam HDFC Bank statement before approving.</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={depositFilter}
                onChange={(e) => setDepositFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-300 focus:outline-none"
              >
                <option value="ALL">All Deposit Statuses</option>
                <option value="PENDING">Pending Approval Only</option>
                <option value="COMPLETED">Approved & Credited</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-950/80 text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4">Submission Date</th>
                    <th className="px-6 py-4">Partner Entity</th>
                    <th className="px-6 py-4">Deposit Amount</th>
                    <th className="px-6 py-4">Bank UTR / Ref</th>
                    <th className="px-6 py-4">Mode</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {depositsLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">Loading offline deposits...</td>
                    </tr>
                  ) : deposits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">No offline deposit requests in this view.</td>
                    </tr>
                  ) : (
                    deposits.map((dep) => {
                      const isPending = dep.status === "PENDING"
                      const isRejected = dep.status === "REJECTED"

                      return (
                        <tr key={dep.id} className="hover:bg-zinc-800/30 transition">
                          <td className="px-6 py-4 font-mono text-xs text-zinc-400 whitespace-nowrap">
                            {new Date(dep.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-white">{dep.partnerCompany}</div>
                            <div className="text-xs text-zinc-400">{dep.partnerName} &bull; {dep.partnerEmail}</div>
                            {dep.notes && <div className="text-[11px] text-zinc-500 mt-0.5">{dep.notes}</div>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-mono font-bold text-emerald-400 text-base">
                              ₹{dep.amount.toLocaleString()}
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              Current Balance: ₹{dep.currentWalletBalance.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono font-bold text-xs text-blue-300 px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 select-all">
                              {dep.utrNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 border border-white/10 text-zinc-300">
                              {dep.paymentMode}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                                <Clock className="w-3 h-3" /> Awaiting Verification
                              </span>
                            ) : isRejected ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                <XCircle className="w-3 h-3" /> Rejected
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <CheckCheck className="w-3 h-3" /> Credited
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleRejectDeposit(dep)}
                                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleApproveDeposit(dep)}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve & Credit
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-zinc-500 font-mono">
                                {dep.approvedBy ? `Verified by ${dep.approvedBy.split("@")[0]}` : "Processed"}
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: MANUAL WALLET ADJUSTMENT ── */}
      {showWalletModal && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Direct Wallet Float Adjustment</h3>
              </div>
              <button onClick={() => setShowWalletModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1">
              <div className="text-zinc-400">Partner: <strong className="text-white">{selectedPartner.company}</strong></div>
              <div className="text-zinc-400">Current Balance: <strong className="text-emerald-400 font-mono">₹{selectedPartner.walletBalance.toLocaleString()}</strong></div>
            </div>

            <form onSubmit={handleWalletAdjust} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWalletForm({ ...walletForm, type: "CREDIT" })}
                    className={`py-2 rounded-xl border text-xs font-semibold ${
                      walletForm.type === "CREDIT"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    + Credit (Add Float)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletForm({ ...walletForm, type: "DEBIT" })}
                    className={`py-2 rounded-xl border text-xs font-semibold ${
                      walletForm.type === "DEBIT"
                        ? "bg-rose-500/20 border-rose-500 text-rose-400"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    - Debit (Deduct Float)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={walletForm.amount}
                  onChange={(e) => setWalletForm({ ...walletForm, amount: e.target.value })}
                  placeholder="e.g. 50000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Audit Reason / Bank UTR *</label>
                <input
                  type="text"
                  required
                  value={walletForm.notes}
                  onChange={(e) => setWalletForm({ ...walletForm, notes: e.target.value })}
                  placeholder="e.g. Direct wire transfer / Custom agreement"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowWalletModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={walletSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-semibold shadow-lg shadow-emerald-500/20"
                >
                  {walletSubmitting ? "Updating..." : "Commit Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD PARTNER ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">Create New Partner Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddPartner} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">First Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.firstName}
                    onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.lastName}
                    onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Partner Company / Entity Name *</label>
                <input
                  type="text"
                  required
                  value={addForm.companyName}
                  onChange={(e) => setAddForm({ ...addForm, companyName: e.target.value })}
                  placeholder="e.g. Apex Auto Systems Pvt Ltd"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Email Address *</label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="e.g. partner@company.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Partner Type *</label>
                  <select
                    value={addForm.partnerType}
                    onChange={(e) => setAddForm({ ...addForm, partnerType: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="WHITE_LABEL">White-Label Partner</option>
                    <option value="RESELLER">Reseller Partner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Commission / Margin %</label>
                  <input
                    type="number"
                    value={addForm.commissionPercent}
                    onChange={(e) => setAddForm({ ...addForm, commissionPercent: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-semibold shadow-lg shadow-emerald-500/20"
                >
                  {addSubmitting ? "Creating..." : "Create Partner Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
