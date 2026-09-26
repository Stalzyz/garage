"use client"

import { useState } from "react"
import { Settings, Globe, Mail, DollarSign, Bell, Save } from "lucide-react"
import { toast } from "sonner"

export default function SuperAdminSettingsPage() {
  const [platform, setPlatform] = useState({
    platformName: "Grekam SaaS Platform",
    logoUrl: "https://grekam.in/logo.png",
    faviconUrl: "https://grekam.in/favicon.ico",
    supportEmail: "support@grekam.com",
    supportPhone: "+91 99000 00000",
    defaultDomain: "app.grekam.in",
  })

  const [emailConfig, setEmailConfig] = useState({
    smtpHost: "smtp.resend.com",
    smtpPort: 587,
    smtpUser: "resend",
    smtpSender: "noreply@grekam.com",
  })

  const [paymentConfig, setPaymentConfig] = useState({
    gateway: "Razorpay / Stripe",
    keyId: "rzp_live_1234567890",
  })

  const handleSavePlatform = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Platform settings saved successfully!")
  }

  return (
    <div className="p-8 space-y-8 bg-dash-bg-base text-white min-h-screen font-sans max-w-4xl">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-xs text-zinc-400 mt-1">Core platform branding, SMTP email server, and payment gateway configuration.</p>
      </div>

      {/* Platform General */}
      <form onSubmit={handleSavePlatform} className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-400" /> Platform Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold">Platform Name</label>
              <input
                type="text"
                value={platform.platformName}
                onChange={(e) => setPlatform({ ...platform, platformName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold">Default Platform Domain</label>
              <input
                type="text"
                value={platform.defaultDomain}
                onChange={(e) => setPlatform({ ...platform, defaultDomain: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold">Platform Support Email</label>
              <input
                type="email"
                value={platform.supportEmail}
                onChange={(e) => setPlatform({ ...platform, supportEmail: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold">Platform Support Phone</label>
              <input
                type="text"
                value={platform.supportPhone}
                onChange={(e) => setPlatform({ ...platform, supportPhone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
              />
            </div>
          </div>
        </div>

        {/* Email / SMTP */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" /> Email & SMTP Provider
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold">SMTP Host</label>
              <input
                type="text"
                value={emailConfig.smtpHost}
                onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold">Sender Email Address</label>
              <input
                type="email"
                value={emailConfig.smtpSender}
                onChange={(e) => setEmailConfig({ ...emailConfig, smtpSender: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateway */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-400" /> Payment Gateway Integration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold">Payment Provider</label>
              <input
                type="text"
                value={paymentConfig.gateway}
                onChange={(e) => setPaymentConfig({ ...paymentConfig, gateway: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold">Live Key ID</label>
              <input
                type="text"
                value={paymentConfig.keyId}
                onChange={(e) => setPaymentConfig({ ...paymentConfig, keyId: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/30">
            Save Platform Settings
          </button>
        </div>
      </form>

    </div>
  )
}
