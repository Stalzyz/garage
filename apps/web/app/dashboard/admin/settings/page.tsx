"use client"

import { useState, useEffect } from "react"
import { 
  Settings, Globe, Mail, DollarSign, Save, Building2, Palette, ShieldCheck, Landmark, Send, CheckCircle2, RefreshCw, Key, Lock, Image as ImageIcon
} from "lucide-react"
import { toast } from "sonner"

export default function SuperAdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingSmtp, setTestingSmtp] = useState(false)
  const [testEmailRecipient, setTestEmailRecipient] = useState("")

  // Branding & Organization Form
  const [orgForm, setOrgForm] = useState({
    name: "Grekam Garage OS",
    companyName: "Grekam Garage & Technologies Pvt Ltd",
    logoUrl: "",
    faviconUrl: "",
    academyLogoUrl: "",
    primaryColor: "#2563eb",
    secondaryColor: "#7c3aed",
    accentColor: "#10b981",
    darkModeDefault: true,
    supportEmail: "support@grekam.in",
    phone: "+91 99000 00000",
    website: "https://grekam.in",
    billingAddress: "MG Road, Tech Park, Bangalore, Karnataka, India",
    gstNumber: "29AAAAA0000A1Z5",
    panNumber: "AAAAA0000A",
    // Bank Details
    bankName: "HDFC Bank Ltd",
    accountName: "Grekam Garage & Technologies Pvt Ltd",
    accountNumber: "50200012345678",
    ifscCode: "HDFC0000123",
    swiftCode: "HDFCINBB",
    bankBranch: "Indiranagar, Bangalore",
  })

  // SMTP Configuration Form
  const [smtpForm, setSmtpForm] = useState({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    user: "notifications@grekam.in",
    pass: "",
    senderName: "Grekam Garage OS",
    senderEmail: "notifications@grekam.in",
    ccEmails: "",
    isConfigured: false,
  })

  // Payment Gateway
  const [paymentConfig, setPaymentConfig] = useState({
    gateway: "Razorpay / PhonePe Offline Settlement",
    keyId: "rzp_live_grekam_garage_prod",
  })

  // Load Settings from API
  const fetchSettings = async () => {
    try {
      setLoading(true)
      
      // Fetch Organization details
      const orgRes = await fetch("/api/settings/organization").catch(() => null)
      if (orgRes && orgRes.ok) {
        const orgData = await orgRes.json()
        if (orgData) {
          setOrgForm((prev) => ({
            ...prev,
            name: orgData.name || prev.name,
            companyName: orgData.companyName || prev.companyName,
            logoUrl: orgData.logoUrl || "",
            faviconUrl: orgData.faviconUrl || "",
            academyLogoUrl: orgData.academyLogoUrl || "",
            primaryColor: orgData.primaryColor || prev.primaryColor,
            secondaryColor: orgData.secondaryColor || prev.secondaryColor,
            accentColor: orgData.accentColor || prev.accentColor,
            darkModeDefault: orgData.darkModeDefault ?? true,
            supportEmail: orgData.supportEmail || prev.supportEmail,
            phone: orgData.phone || prev.phone,
            website: orgData.website || prev.website,
            billingAddress: orgData.billingAddress || prev.billingAddress,
            gstNumber: orgData.gstNumber || prev.gstNumber,
            panNumber: orgData.panNumber || prev.panNumber,
            bankName: orgData.bankName || prev.bankName,
            accountName: orgData.accountName || prev.accountName,
            accountNumber: orgData.accountNumber || prev.accountNumber,
            ifscCode: orgData.ifscCode || prev.ifscCode,
            swiftCode: orgData.swiftCode || prev.swiftCode,
            bankBranch: orgData.bankBranch || prev.bankBranch,
          }))
        }
      }

      // Fetch SMTP details
      const smtpRes = await fetch("/api/settings/smtp").catch(() => null)
      if (smtpRes && smtpRes.ok) {
        const smtpData = await smtpRes.json()
        if (smtpData.success && smtpData.config) {
          setSmtpForm((prev) => ({
            ...prev,
            host: smtpData.config.host || prev.host,
            port: smtpData.config.port || prev.port,
            secure: smtpData.config.secure ?? prev.secure,
            user: smtpData.config.user || prev.user,
            pass: smtpData.config.pass || "",
            senderName: smtpData.config.senderName || prev.senderName,
            senderEmail: smtpData.config.senderEmail || prev.senderEmail,
            ccEmails: smtpData.config.ccEmails || "",
            isConfigured: smtpData.config.isConfigured || false,
          }))
          if (smtpData.config.user) {
            setTestEmailRecipient(smtpData.config.user)
          }
        }
      }
    } catch {
      toast.error("Failed to load platform settings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    toast.loading("Saving platform branding & organization settings...")

    try {
      // 1. Save Organization & Branding
      const orgRes = await fetch("/api/settings/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orgForm),
      })

      // 2. Save SMTP Server Configuration
      const smtpRes = await fetch("/api/settings/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smtpForm),
      })

      const orgJson = await orgRes.json().catch(() => ({}))
      const smtpJson = await smtpRes.json().catch(() => ({}))

      toast.dismiss()

      if (orgRes.ok && smtpRes.ok) {
        toast.success("All platform settings, branding, and SMTP credentials saved successfully!")
        fetchSettings()
      } else {
        toast.error(orgJson.error || smtpJson.error || "Some settings failed to save.")
      }
    } catch {
      toast.dismiss()
      toast.error("Network error saving platform settings")
    } finally {
      setSaving(false)
    }
  }

  const handleTestSmtp = async () => {
    if (!testEmailRecipient) {
      toast.error("Please enter a test recipient email address")
      return
    }

    setTestingSmtp(true)
    toast.loading(`Sending SMTP test email to ${testEmailRecipient}...`)

    try {
      const res = await fetch("/api/settings/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...smtpForm,
          testRecipient: testEmailRecipient,
          sendTest: true,
        }),
      })

      const data = await res.json()
      toast.dismiss()

      if (data.success) {
        toast.success(data.message || "Test email dispatched successfully!")
      } else {
        toast.error(data.error || "SMTP test connection failed")
      }
    } catch {
      toast.dismiss()
      toast.error("Network error testing SMTP server")
    } finally {
      setTestingSmtp(false)
    }
  }

  return (
    <div className="p-8 space-y-8 bg-dash-bg-base text-white min-h-screen font-sans max-w-5xl">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Platform & Organization Settings</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Global whitelabel branding, company registration details, bank accounts, and SMTP mail server credentials.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition w-fit"
          title="Refresh Settings"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-zinc-500 bg-white/5 rounded-2xl border border-white/10">
          Loading platform configuration...
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-6">

          {/* SECTION 1: Platform Whitelabel Branding */}
          <div className="bg-[#0b101d] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Palette className="w-4 h-4 text-blue-400" /> Platform Whitelabel & Branding Theme
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Platform / System Display Name *</label>
                <input
                  type="text"
                  required
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Official Platform Web Domain</label>
                <input
                  type="text"
                  value={orgForm.website}
                  onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-zinc-400 font-semibold">Main Logo URL (Landscape - Invoices & Dashboard)</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={orgForm.logoUrl}
                    onChange={(e) => setOrgForm({ ...orgForm, logoUrl: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                  {orgForm.logoUrl && (
                    <div className="p-2 bg-white/10 rounded-xl border border-white/20 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={orgForm.logoUrl} alt="Logo Preview" className="h-6 max-w-[120px] object-contain" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Favicon Icon URL (Browser Tab)</label>
                <input
                  type="url"
                  placeholder="https://example.com/favicon.ico"
                  value={orgForm.faviconUrl}
                  onChange={(e) => setOrgForm({ ...orgForm, faviconUrl: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Academy / Fee Receipts Logo URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/academy-logo.png"
                  value={orgForm.academyLogoUrl}
                  onChange={(e) => setOrgForm({ ...orgForm, academyLogoUrl: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Color Pickers */}
              <div className="grid grid-cols-3 gap-3 md:col-span-2 pt-2">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold text-[11px]">Primary Color</label>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1.5">
                    <input
                      type="color"
                      value={orgForm.primaryColor}
                      onChange={(e) => setOrgForm({ ...orgForm, primaryColor: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-xs">{orgForm.primaryColor}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold text-[11px]">Secondary Color</label>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1.5">
                    <input
                      type="color"
                      value={orgForm.secondaryColor}
                      onChange={(e) => setOrgForm({ ...orgForm, secondaryColor: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-xs">{orgForm.secondaryColor}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold text-[11px]">Accent Color</label>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1.5">
                    <input
                      type="color"
                      value={orgForm.accentColor}
                      onChange={(e) => setOrgForm({ ...orgForm, accentColor: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-xs">{orgForm.accentColor}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: Organization Legal & Contact Details */}
          <div className="bg-[#0b101d] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Building2 className="w-4 h-4 text-purple-400" /> Legal Entity & Registration Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Registered Company Legal Name *</label>
                <input
                  type="text"
                  required
                  value={orgForm.companyName}
                  onChange={(e) => setOrgForm({ ...orgForm, companyName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">GSTIN / Tax Identification Number</label>
                <input
                  type="text"
                  placeholder="29AAAAA0000A1Z5"
                  value={orgForm.gstNumber}
                  onChange={(e) => setOrgForm({ ...orgForm, gstNumber: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 uppercase font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">PAN Number</label>
                <input
                  type="text"
                  placeholder="AAAAA0000A"
                  value={orgForm.panNumber}
                  onChange={(e) => setOrgForm({ ...orgForm, panNumber: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 uppercase font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Support Email Address *</label>
                <input
                  type="email"
                  required
                  value={orgForm.supportEmail}
                  onChange={(e) => setOrgForm({ ...orgForm, supportEmail: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Support Phone Number</label>
                <input
                  type="text"
                  value={orgForm.phone}
                  onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-zinc-400 font-semibold">Registered Billing Address</label>
                <textarea
                  rows={2}
                  value={orgForm.billingAddress}
                  onChange={(e) => setOrgForm({ ...orgForm, billingAddress: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: SMTP Server Configuration */}
          <div className="bg-[#0b101d] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" /> SMTP Transactional Mail Server Settings
              </h2>
              {smtpForm.isConfigured && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  ✓ SMTP Configured
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">SMTP Host *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. smtp.gmail.com or smtp.sendgrid.net"
                  value={smtpForm.host}
                  onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">SMTP Port *</label>
                <input
                  type="number"
                  required
                  placeholder="587 or 465"
                  value={smtpForm.port}
                  onChange={(e) => setSmtpForm({ ...smtpForm, port: parseInt(e.target.value) || 587 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">SMTP Username / Email *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. your-email@gmail.com or API Key user"
                  value={smtpForm.user}
                  onChange={(e) => setSmtpForm({ ...smtpForm, user: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">SMTP Password / App Secret *</label>
                <input
                  type="password"
                  required={!smtpForm.isConfigured}
                  placeholder={smtpForm.pass ? "•••••••• (Password Saved)" : "Enter App Password or Secret"}
                  value={smtpForm.pass}
                  onChange={(e) => setSmtpForm({ ...smtpForm, pass: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Outbound Sender Name</label>
                <input
                  type="text"
                  placeholder="Grekam Garage Platform"
                  value={smtpForm.senderName}
                  onChange={(e) => setSmtpForm({ ...smtpForm, senderName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Outbound From Email Address</label>
                <input
                  type="email"
                  placeholder="notifications@grekam.in"
                  value={smtpForm.senderEmail}
                  onChange={(e) => setSmtpForm({ ...smtpForm, senderEmail: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-400 font-semibold">Global CC Notification Email(s)</label>
                  <span className="text-[10px] text-zinc-500 font-mono">Comma-separated</span>
                </div>
                <input
                  type="text"
                  placeholder="admin@garage.com, crm-audit@garage.com"
                  value={smtpForm.ccEmails}
                  onChange={(e) => setSmtpForm({ ...smtpForm, ccEmails: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#0A84FF] font-mono text-xs"
                />
                <p className="text-[11px] text-zinc-500">
                  Every outgoing email sent across the platform (admin notifications, leads, automated workflows, invoices, and proposals) will automatically CC these email addresses.
                </p>
              </div>

              <div className="md:col-span-2 pt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="smtpSecureToggle"
                  checked={smtpForm.secure}
                  onChange={(e) => setSmtpForm({ ...smtpForm, secure: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <label htmlFor="smtpSecureToggle" className="text-zinc-300 font-semibold cursor-pointer">
                  Require Encrypted SSL Connection (Port 465)
                </label>
              </div>

            </div>

            {/* Test Email Verification Tool */}
            <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" /> Live SMTP Connection & Delivery Tester
              </h4>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="email"
                  placeholder="Enter recipient email address..."
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleTestSmtp}
                  disabled={testingSmtp}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shrink-0 transition flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {testingSmtp ? "Testing..." : "Send Test Mail"}
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 4: Bank Details */}
          <div className="bg-[#0b101d] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Landmark className="w-4 h-4 text-amber-400" /> Platform Settlement Bank Account Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Bank Name</label>
                <input
                  type="text"
                  placeholder="HDFC Bank Ltd"
                  value={orgForm.bankName}
                  onChange={(e) => setOrgForm({ ...orgForm, bankName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Account Holder Name</label>
                <input
                  type="text"
                  placeholder="Grekam Garage & Technologies Pvt Ltd"
                  value={orgForm.accountName}
                  onChange={(e) => setOrgForm({ ...orgForm, accountName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Account Number</label>
                <input
                  type="text"
                  placeholder="50200012345678"
                  value={orgForm.accountNumber}
                  onChange={(e) => setOrgForm({ ...orgForm, accountNumber: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">IFSC Code</label>
                <input
                  type="text"
                  placeholder="HDFC0000123"
                  value={orgForm.ifscCode}
                  onChange={(e) => setOrgForm({ ...orgForm, ifscCode: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">SWIFT Code</label>
                <input
                  type="text"
                  placeholder="HDFCINBB"
                  value={orgForm.swiftCode}
                  onChange={(e) => setOrgForm({ ...orgForm, swiftCode: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Bank Branch</label>
                <input
                  type="text"
                  placeholder="Indiranagar Branch"
                  value={orgForm.bankBranch}
                  onChange={(e) => setOrgForm({ ...orgForm, bankBranch: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Controls */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving All Settings..." : "Save All Platform Settings"}
            </button>
          </div>

        </form>
      )}

    </div>
  )
}
