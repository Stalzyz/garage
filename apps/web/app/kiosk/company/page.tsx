"use client"

import { useState, useEffect } from "react"
import { Building2, ShieldCheck, CheckCircle2, Loader2, ArrowRight, RotateCcw, Maximize2, Minimize2, MapPin, Globe, User, Phone, Mail, Briefcase, Sparkles } from "lucide-react"

const GST_STATE_CODES: Record<string, string> = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra & Nagar Haveli and Daman & Diu',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
  '97': 'Other Territory',
  '99': 'Centre Jurisdiction / Overseas',
}

const INDUSTRIES = [
  "IT Services / SaaS",
  "Design & Creative Agency",
  "Manufacturing & Industrial",
  "Retail & E-Commerce",
  "Real Estate & Construction",
  "Healthcare & Pharma",
  "Education & EdTech",
  "Finance, Banking & FinTech",
  "Hospitality & Tourism",
  "Logistics & Supply Chain",
  "Media & Entertainment",
  "Other"
]

export default function CompanyKioskPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successData, setSuccessData] = useState<any>(null)
  const [countdown, setCountdown] = useState(10)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: "",
    legalName: "",
    tradeName: "",
    gstin: "",
    pan: "",
    gstType: "REGULAR",
    placeOfSupply: "Tamil Nadu (33)",
    stateCode: "33",
    state: "Tamil Nadu",
    billingAddress: "",
    city: "",
    pinCode: "",
    website: "",
    industry: "IT Services / SaaS",
    contactName: "",
    contactDesignation: "",
    contactPhone: "",
    contactEmail: "",
    notes: "",
  })

  // Clock
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Auto-reset countdown upon success
  useEffect(() => {
    if (!successData) return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleReset()
          return 10
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [successData])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  const handleGstinChange = (raw: string) => {
    const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15)
    let pan = form.pan
    let stateCode = form.stateCode
    let state = form.state
    let placeOfSupply = form.placeOfSupply

    if (clean.length >= 2) {
      const code = clean.substring(0, 2)
      if (GST_STATE_CODES[code]) {
        stateCode = code
        state = GST_STATE_CODES[code]
        placeOfSupply = `${GST_STATE_CODES[code]} (${code})`
      }
    }

    if (clean.length >= 12) {
      pan = clean.substring(2, 12)
    }

    setForm(prev => ({
      ...prev,
      gstin: clean,
      pan,
      stateCode,
      state,
      placeOfSupply,
    }))
  }

  const handleStateCodeChange = (code: string) => {
    const state = GST_STATE_CODES[code] || "Other"
    setForm(prev => ({
      ...prev,
      stateCode: code,
      state,
      placeOfSupply: `${state} (${code})`,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!form.name.trim()) {
      setError("Please enter the Company Display Name.")
      return
    }

    if (form.gstin && form.gstin.length !== 15) {
      setError("GSTIN must be exactly 15 characters, or leave blank if unregistered.")
      return
    }

    if (form.contactPhone && form.contactPhone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number for the representative.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/v1/crm/public/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to submit company particulars")
      }

      setSuccessData(data)
      setCountdown(10)
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setSuccessData(null)
    setError("")
    setForm({
      name: "",
      legalName: "",
      tradeName: "",
      gstin: "",
      pan: "",
      gstType: "REGULAR",
      placeOfSupply: "Tamil Nadu (33)",
      stateCode: "33",
      state: "Tamil Nadu",
      billingAddress: "",
      city: "",
      pinCode: "",
      website: "",
      industry: "IT Services / SaaS",
      contactName: "",
      contactDesignation: "",
      contactPhone: "",
      contactEmail: "",
      notes: "",
    })
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* ── KIOSK TOP BAR ── */}
      <header className="border-b border-white/[0.08] bg-[#0c0e14]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">Grekam OS</span>
              <span className="text-[10px] uppercase font-mono tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                B2B Kiosk
              </span>
            </div>
            <p className="text-xs text-white/50">Company & Tax Details Onboarding</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-mono font-medium text-white/90">
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">
              {currentTime.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white/70 hover:text-white transition-all"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
        {successData ? (
          /* SUCCESS VIEW */
          <div className="bg-[#0f121a] border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.15)] animate-in fade-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Registration Complete
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 mb-2">
              {successData.company?.name || "Company"} Enrolled!
            </h1>
            <p className="text-sm text-white/60 max-w-md mx-auto mb-6">
              Your company profile and tax particulars have been securely registered into Grekam OS CRM.
            </p>

            <div className="inline-flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] px-5 py-3 rounded-2xl mb-8">
              <span className="text-xs text-white/50">Reference ID:</span>
              <span className="text-base font-mono font-bold text-blue-400 tracking-wider">
                {successData.tokenNumber}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-[0_0_25px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-2 text-sm"
              >
                <RotateCcw className="w-4 h-4" /> Register Another Company
              </button>
            </div>

            <p className="text-[11px] text-white/40 mt-6">
              Screen will automatically reset in <strong className="text-white/70">{countdown}</strong> seconds
            </p>
          </div>
        ) : (
          /* FORM VIEW */
          <div className="bg-[#0f121a] border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-bold">
                  Self-Service Onboarding
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Add B2B Company & GST
              </h1>
              <p className="text-xs sm:text-sm text-white/50 mt-1">
                Legal business name, 15-digit GSTIN, Place of Supply, and registered billing particulars.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 animate-in fade-in">
                <span>⚠️ {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SECTION 1: COMPANY IDENTIFICATION */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-white/80 block mb-1.5">
                    Company Display Name <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:bg-white/[0.06] transition-all"
                    placeholder="e.g. Apex Studio"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-white/70 block mb-1.5">Legal Business Name (on GST)</label>
                    <input
                      type="text"
                      value={form.legalName}
                      onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:bg-white/[0.06] transition-all"
                      placeholder="Apex Technologies Pvt Ltd"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/70 block mb-1.5">Trade Name (Brand)</label>
                    <input
                      type="text"
                      value={form.tradeName}
                      onChange={(e) => setForm({ ...form, tradeName: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:bg-white/[0.06] transition-all"
                      placeholder="Apex Studio"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: GSTIN & TAX PARTICULARS */}
              <div className="p-5 sm:p-6 bg-blue-950/20 border border-blue-500/20 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-blue-500/10 pb-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> GSTIN & Tax Particulars
                  </h3>
                  <span className="text-[11px] text-blue-300 font-mono">Auto-extracts PAN & State</span>
                </div>

                <div>
                  <label className="text-xs text-white/80 block mb-1.5 font-bold">
                    15-Digit GSTIN (Goods & Services Tax ID)
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={form.gstin}
                    onChange={(e) => handleGstinChange(e.target.value)}
                    className="w-full bg-black/50 border border-blue-500/30 rounded-xl px-4 py-3 text-sm sm:text-base font-mono tracking-widest text-blue-200 placeholder:text-blue-300/30 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all uppercase"
                    placeholder="33AABCG1234F1Z5"
                  />
                  {form.gstin.length === 15 && (
                    <p className="text-[11px] text-emerald-400 font-mono mt-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Valid 15-character GSTIN format recognized
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/70 block mb-1.5 font-medium">PAN Number (10 chars)</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={form.pan}
                      onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
                      className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm font-mono text-emerald-300 focus:outline-none focus:border-blue-500 uppercase"
                      placeholder="AABCG1234F"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/70 block mb-1.5 font-medium">GST Registration Type</label>
                    <select
                      value={form.gstType}
                      onChange={(e) => setForm({ ...form, gstType: e.target.value })}
                      className="w-full bg-[#141822] border border-white/[0.1] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="REGULAR">Regular (B2B Taxable)</option>
                      <option value="COMPOSITION">Composition Scheme</option>
                      <option value="SEZ">SEZ Unit / Developer</option>
                      <option value="OVERSEAS">Overseas / Export Entity</option>
                      <option value="UNREGISTERED">Unregistered / Consumer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/70 block mb-1.5 font-medium">Place of Supply (State Code)</label>
                  <select
                    value={form.stateCode}
                    onChange={(e) => handleStateCodeChange(e.target.value)}
                    className="w-full bg-[#141822] border border-white/[0.1] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {Object.entries(GST_STATE_CODES).map(([code, name]) => (
                      <option key={code} value={code}>
                        {name} ({code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SECTION 3: REGISTERED BILLING ADDRESS */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-white/50 font-bold flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-white/40" /> Registered Billing Address
                </h3>

                <div>
                  <label className="text-xs font-medium text-white/70 block mb-1.5">Street Address</label>
                  <input
                    type="text"
                    value={form.billingAddress}
                    onChange={(e) => setForm({ ...form, billingAddress: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:bg-white/[0.06] transition-all"
                    placeholder="42 Tech Park Road, Industrial Area"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-white/70 block mb-1.5">City</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:bg-white/[0.06]"
                      placeholder="Coimbatore / Chennai"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-white/70 block mb-1.5">PIN Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={form.pinCode}
                      onChange={(e) => setForm({ ...form, pinCode: e.target.value.replace(/\D/g, "") })}
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:bg-white/[0.06]"
                      placeholder="641001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-white/70 block mb-1.5">Website URL</label>
                    <input
                      type="url"
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:bg-white/[0.06]"
                      placeholder="https://apex.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-white/70 block mb-1.5">Industry Sector</label>
                    <select
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      className="w-full bg-[#141822] border border-white/[0.1] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 4: PRIMARY AUTHORIZED CONTACT */}
              <div className="p-5 sm:p-6 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-white/70 font-bold flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-blue-400" /> Authorized Contact Person
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-white/70 block mb-1.5">Representative Name</label>
                    <input
                      type="text"
                      value={form.contactName}
                      onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:bg-white/[0.06]"
                      placeholder="e.g. Rajesh Kumar"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-white/70 block mb-1.5">Designation / Role</label>
                    <input
                      type="text"
                      value={form.contactDesignation}
                      onChange={(e) => setForm({ ...form, contactDesignation: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:bg-white/[0.06]"
                      placeholder="Director / Procurement Head"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-white/70 block mb-1.5">Phone / WhatsApp Number</label>
                    <input
                      type="tel"
                      value={form.contactPhone}
                      onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:bg-white/[0.06]"
                      placeholder="+91 98400 12345"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-white/70 block mb-1.5">Work Email Address</label>
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:bg-white/[0.06]"
                      placeholder="rajesh@apex.com"
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/70 hover:text-white font-bold text-xs uppercase tracking-wider border border-white/[0.08] transition-all"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-[0_0_30px_rgba(59,130,246,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Enrolling Company...
                    </>
                  ) : (
                    <>
                      Create Company <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.05] py-4 px-6 text-center text-xs text-white/30">
        Powered by <strong className="text-white/50">Grekam OS</strong> • Direct Enterprise CRM & GST Ingestion
      </footer>
    </div>
  )
}
