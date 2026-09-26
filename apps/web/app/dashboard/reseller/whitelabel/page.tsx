"use client"

import { useState } from "react"
import { Globe, Palette, ShieldCheck, Check, Save, Eye, Info, Link2, Copy, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function ResellerWhiteLabelPage() {
  const [activeTab, setActiveTab] = useState<"branding" | "domain">("branding")

  // White Label Settings State
  const [branding, setBranding] = useState({
    brandName: "Apex Auto Network",
    logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200",
    faviconUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=32",
    primaryColor: "#8b5cf6",
    secondaryColor: "#3b82f6",
    // Login Page
    loginLogo: "",
    loginBackground: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200",
    welcomeText: "Welcome to Apex Garage Management Portal",
    // Dashboard & Footer
    showPoweredBy: true,
    // Support
    supportEmail: "support@apexautonetwork.com",
    supportPhone: "+91 98000 11223",
  })

  // Domain State
  const [domainSettings, setDomainSettings] = useState({
    defaultDomain: "garage.reseller.com",
    customDomain: "garage.apexautonetwork.com",
    status: "Connected" as "Connected" | "Pending" | "Not Connected",
  })

  const [copiedDns, setCopiedDns] = useState(false)

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("White-label branding settings updated successfully!")
  }

  const handleVerifyDomain = async () => {
    toast.loading(`Checking DNS records for ${domainSettings.customDomain}...`)
    try {
      const res = await fetch("/api/whitelabel/verify-dns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domainSettings.customDomain }),
      })
      const data = await res.json()
      toast.dismiss()
      if (data.verified) {
        setDomainSettings({ ...domainSettings, status: "Connected" })
        toast.success(data.message || "Domain custom DNS verified & SSL active!")
      } else {
        toast.error(data.message || "CNAME verification failed")
      }
    } catch {
      toast.dismiss()
      toast.error("Failed to reach DNS verification service")
    }
  }

  const copyDns = () => {
    navigator.clipboard.writeText("CNAME garage.apexautonetwork.com cname.grekam.in")
    setCopiedDns(true)
    toast.success("DNS record copied to clipboard!")
    setTimeout(() => setCopiedDns(false), 2000)
  }

  return (
    <div className="p-8 space-y-6 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">White Label</h1>
          <p className="text-xs text-zinc-400 mt-1">Customize your garage dashboard branding, colors, logos, and domain.</p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("branding")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "branding" ? "bg-purple-600 text-white shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            Branding & Theme
          </button>
          <button
            onClick={() => setActiveTab("domain")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "domain" ? "bg-purple-600 text-white shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            White Label Domain
          </button>
        </div>
      </div>

      {/* TAB 1: BRANDING */}
      {activeTab === "branding" && (
        <form onSubmit={handleSaveBranding} className="space-y-6 max-w-4xl">
          
          {/* Brand Identity */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-400" /> Brand Identity
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Brand Name</label>
                <input
                  type="text"
                  value={branding.brandName}
                  onChange={(e) => setBranding({ ...branding, brandName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Logo URL</label>
                <input
                  type="text"
                  value={branding.logoUrl}
                  onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Favicon URL</label>
                <input
                  type="text"
                  value={branding.faviconUrl}
                  onChange={(e) => setBranding({ ...branding, faviconUrl: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-semibold">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Login Page Customization */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white">Login Page Customization</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Login Background Image URL</label>
                <input
                  type="text"
                  value={branding.loginBackground}
                  onChange={(e) => setBranding({ ...branding, loginBackground: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Welcome Text</label>
                <input
                  type="text"
                  value={branding.welcomeText}
                  onChange={(e) => setBranding({ ...branding, welcomeText: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>
          </div>

          {/* Footer & Support Customization */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white">Footer & Support Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Support Email</label>
                <input
                  type="email"
                  value={branding.supportEmail}
                  onChange={(e) => setBranding({ ...branding, supportEmail: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Support Phone</label>
                <input
                  type="text"
                  value={branding.supportPhone}
                  onChange={(e) => setBranding({ ...branding, supportPhone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="showPoweredBy"
                checked={branding.showPoweredBy}
                onChange={(e) => setBranding({ ...branding, showPoweredBy: e.target.checked })}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-purple-600"
              />
              <label htmlFor="showPoweredBy" className="text-xs text-zinc-300 font-medium cursor-pointer">
                Show "Powered by Grekam" footer watermark
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => toast.info("Opening white-label garage live preview...")}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold px-5 py-2.5 rounded-xl border border-white/10"
            >
              <Eye className="w-4 h-4" /> Preview
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-purple-600/30"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>

        </form>
      )}

      {/* TAB 2: DOMAIN */}
      {activeTab === "domain" && (
        <div className="space-y-6 max-w-3xl">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" /> Domain Configuration
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-zinc-400 block text-[10px]">Default Domain</span>
                  <span className="font-mono text-white text-sm">{domainSettings.defaultDomain}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-semibold">
                  Default Active
                </span>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-zinc-400 block text-[10px]">Custom Domain</span>
                  <span className="font-mono text-white text-sm">{domainSettings.customDomain}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                  domainSettings.status === "Connected" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400"
                }`}>
                  {domainSettings.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleVerifyDomain}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-xl"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Verify Domain
              </button>
            </div>
          </div>

          {/* Simple DNS Instruction Box */}
          <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-purple-300 flex items-center gap-2">
              <Info className="w-4 h-4" /> DNS Instructions
            </h3>
            <p className="text-xs text-zinc-300">
              To connect your custom domain, log in to your domain registrar (GoDaddy, Namecheap, Cloudflare) and add the following CNAME record:
            </p>

            <div className="p-3 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between font-mono text-xs text-purple-300">
              <span>CNAME &nbsp;&nbsp; garage &nbsp;&nbsp; cname.grekam.in</span>
              <button onClick={copyDns} className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px]">
                {copiedDns ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedDns ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
