"use client"

import { useState, useEffect } from "react"
import { 
  Settings, 
  Building2, 
  Phone, 
  Mail, 
  ShieldCheck, 
  FileText, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  CreditCard,
  Lock,
  Wallet
} from "lucide-react"

export default function PartnerSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [partner, setPartner] = useState<any>(null)
  const [companyName, setCompanyName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      setLoading(true)
      const res = await fetch("/api/partner/settings")
      const data = await res.json()
      if (data.success && data.partner) {
        setPartner(data.partner)
        setCompanyName(data.partner.companyName || "")
        setContactPhone(data.partner.contactPhone || "")
      }
    } catch (err) {
      console.error("Failed to load partner settings:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg("")
    setErrorMsg("")

    try {
      const res = await fetch("/api/partner/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, contactPhone }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile")
      }

      setSuccessMsg("Settings updated successfully.")
      setTimeout(() => setSuccessMsg(""), 4000)
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save profile.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Partner Account Settings</h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your partner profile, contact information, and KYC payout status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-mono font-semibold">
            {partner?.partnerCode}
          </span>
          <span className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold">
            {partner?.partnerType === "WHITE_LABEL" ? "White-Label Partner" : "Reseller Partner"}
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 space-y-5 backdrop-blur-md">
            <h2 className="text-base font-semibold text-white border-b border-zinc-800/60 pb-3">
              Company & Contact Info
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Company / Entity Name</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Apex Garage Solutions Pvt Ltd"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Registered Email (Read Only)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={partner?.contactEmail || ""}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-800/60 rounded-xl text-sm text-zinc-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">WhatsApp / Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-500/20"
              >
                {saving ? "Saving..." : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* KYC & Payout Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                KYC & Banking Details
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                partner?.kycStatus === "APPROVED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}>
                {partner?.kycStatus || "PENDING"}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-800/40">
                <span className="text-zinc-500">Business Name:</span>
                <span className="text-zinc-300 font-medium">{partner?.kyc?.businessName || partner?.companyName || "N/A"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/40">
                <span className="text-zinc-500">GSTIN:</span>
                <span className="text-zinc-300 font-mono font-medium">{partner?.kyc?.gstNumber || "Unregistered"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/40">
                <span className="text-zinc-500">PAN Number:</span>
                <span className="text-zinc-300 font-mono font-medium">{partner?.kyc?.panNumber || "N/A"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/40">
                <span className="text-zinc-500">Bank Account:</span>
                <span className="text-zinc-300 font-mono font-medium">
                  {partner?.kyc?.bankAccountNumber ? `•••• •••• ${partner.kyc.bankAccountNumber.slice(-4)}` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">IFSC Code:</span>
                <span className="text-zinc-300 font-mono font-medium">{partner?.kyc?.bankIfsc || "N/A"}</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl text-xs text-zinc-400 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <span>To update GST or payout bank account numbers, please submit a support ticket for security verification.</span>
            </div>
          </div>

          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 space-y-3 backdrop-blur-md">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              Prepaid Wallet Security
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Available Wallet Balance: <span className="text-emerald-400 font-bold font-mono">₹{partner?.walletBalance?.toLocaleString() || 0}</span>.
              All client activations debit base costs immediately with 0 credit risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
