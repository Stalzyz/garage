"use client"

import { useState, useEffect } from "react"
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Search, 
  ExternalLink, 
  AlertCircle,
  Building2,
  RefreshCw,
  Eye
} from "lucide-react"

interface KYCRecord {
  id: string
  partnerId: string
  businessName?: string
  gstNumber?: string
  panNumber?: string
  bankAccountNumber?: string
  bankIfsc?: string
  bankName?: string
  documentType: string
  documentUrl?: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  rejectionReason?: string
  submittedAt: string
  reviewedAt?: string
  partner: {
    id: string
    partnerCode: string
    companyName?: string
    partnerType: string
    user: {
      firstName?: string
      lastName?: string
      email: string
      phone?: string
    }
  }
}

export default function AdminKYCPage() {
  const [records, setRecords] = useState<KYCRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [search, setSearch] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<KYCRecord | null>(null)

  useEffect(() => {
    fetchKYC()
  }, [statusFilter])

  async function fetchKYC() {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/kyc?status=${statusFilter}`)
      const data = await res.json()
      if (data.success && data.kycRecords) {
        setRecords(data.kycRecords)
      }
    } catch (err) {
      console.error("Failed to load KYC records:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(kycId: string) {
    if (!confirm("Approve this KYC record and grant full partner activation rights?")) return
    setProcessingId(kycId)

    try {
      const res = await fetch(`/api/admin/kyc/${kycId}/approve`, {
        method: "POST",
      })
      const data = await res.json()
      if (data.success) {
        fetchKYC()
      } else {
        alert(data.error || "Approval failed")
      }
    } catch (err) {
      alert("Network error")
    } finally {
      setProcessingId(null)
    }
  }

  async function handleReject(kycId: string) {
    const reason = prompt("Enter reason for KYC rejection:", "Invalid GST/PAN document")
    if (!reason) return
    setProcessingId(kycId)

    try {
      const res = await fetch(`/api/admin/kyc/${kycId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      })
      const data = await res.json()
      if (data.success) {
        fetchKYC()
      } else {
        alert(data.error || "Rejection failed")
      }
    } catch (err) {
      alert("Network error")
    } finally {
      setProcessingId(null)
    }
  }

  const filtered = records.filter(r => 
    r.partner?.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    r.partner?.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.partner?.partnerCode?.toLowerCase().includes(search.toLowerCase()) ||
    (r.gstNumber && r.gstNumber.toLowerCase().includes(search.toLowerCase())) ||
    (r.panNumber && r.panNumber.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Partner KYC Compliance</h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Review GST, PAN, and Bank Account payouts compliance before partner customer activations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchKYC}
            className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pending KYC Audits</span>
          <p className="text-3xl font-bold text-amber-400">
            {records.filter(r => r.status === "PENDING").length}
          </p>
          <p className="text-xs text-zinc-500">Requires manual compliance verification</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Approved Compliance</span>
          <p className="text-3xl font-bold text-emerald-400">
            {records.filter(r => r.status === "APPROVED").length}
          </p>
          <p className="text-xs text-zinc-500">Authorized for client provisioning</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Rejected Submissions</span>
          <p className="text-3xl font-bold text-red-400">
            {records.filter(r => r.status === "REJECTED").length}
          </p>
          <p className="text-xs text-zinc-500">Documents resubmission requested</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Partner, GST or PAN..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-300 focus:outline-none"
          >
            <option value="ALL">All KYC Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/80 text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Partner Entity</th>
                <th className="px-6 py-4">Legal Identifiers (GST / PAN)</th>
                <th className="px-6 py-4">Payout Bank Account</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading KYC records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No KYC submissions found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-800/30 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{r.partner?.companyName || "Partner"}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            {r.partner?.partnerCode}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">{r.partner?.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5 text-xs font-mono">
                        <div className="text-zinc-300">GST: {r.gstNumber || "Unregistered"}</div>
                        <div className="text-zinc-400">PAN: {r.panNumber || "N/A"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5 text-xs">
                        <p className="font-medium text-zinc-200">{r.bankName || "Bank N/A"}</p>
                        <p className="text-zinc-400 font-mono">A/C: {r.bankAccountNumber || "N/A"}</p>
                        <p className="text-zinc-500 font-mono">IFSC: {r.bankIfsc || "N/A"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        r.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        r.status === "REJECTED" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {r.status === "APPROVED" && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {r.status === "REJECTED" && <XCircle className="w-3.5 h-3.5" />}
                        {r.status === "PENDING" && <Clock className="w-3.5 h-3.5" />}
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-400">
                      {new Date(r.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.status !== "APPROVED" && (
                          <button
                            onClick={() => handleApprove(r.id)}
                            disabled={processingId === r.id}
                            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold transition"
                          >
                            Approve
                          </button>
                        )}
                        {r.status !== "REJECTED" && (
                          <button
                            onClick={() => handleReject(r.id)}
                            disabled={processingId === r.id}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold transition"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
