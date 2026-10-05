"use client"

import { useState, useEffect } from "react"
import { 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Save, 
  Copy, 
  AlertCircle,
  ShieldCheck,
  Building2,
  RefreshCw,
  Image as ImageIcon
} from "lucide-react"

export default function PartnerWhiteLabelPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const [formData, setFormData] = useState({
    brandName: "",
    logoUrl: "",
    customDomain: "",
    domainStatus: "PENDING",
    whiteLabelEnabled: true,
  })

  useEffect(() => {
    fetchWhiteLabel()
  }, [])

  async function fetchWhiteLabel() {
    try {
      setLoading(true)
      const res = await fetch("/api/partner/white-label")
      const data = await res.json()
      if (data.success && data.whiteLabel) {
        setFormData({
          brandName: data.whiteLabel.brandName || "",
          logoUrl: data.whiteLabel.logoUrl || "",
          customDomain: data.whiteLabel.customDomain || "",
          domainStatus: data.whiteLabel.domainStatus || "PENDING",
          whiteLabelEnabled: data.whiteLabel.whiteLabelEnabled ?? true,
        })
      }
    } catch (err: any) {
      console.error("Failed to load white-label settings:", err)
      setErrorMsg("Failed to load white-label configuration.")
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
      const res = await fetch("/api/partner/white-label", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: formData.brandName,
          logoUrl: formData.logoUrl,
          customDomain: formData.customDomain,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update settings")
      }

      setSuccessMsg("White-label settings saved successfully!")
      setTimeout(() => setSuccessMsg(""), 4000)
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save settings.")
    } finally {
      setSaving(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-400">Loading white-label setup...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">White-Label Branding</h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Deliver Garage CRM completely under your own agency identity and domain.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchWhiteLabel}
            className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            href={formData.customDomain ? `https://${formData.customDomain}` : "#"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-sm font-medium transition"
          >
            <ExternalLink className="w-4 h-4" />
            Preview Portal
          </a>
        </div>
      </div>

      {/* Notifications */}
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
        {/* Left: Configuration Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 space-y-6 shadow-xl backdrop-blur-md">
            <div className="border-b border-zinc-800/60 pb-4">
              <h2 className="text-base font-semibold text-white">Brand Identity</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Simple & clean: set your brand name and logo image URL.
              </p>
            </div>

            {/* Brand Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Brand Name
              </label>
              <input
                type="text"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                placeholder="e.g. Apex Garage Hub"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 text-sm"
                required
              />
              <p className="text-xs text-zinc-500">
                Shown on the login screen, page titles, and customer invoices.
              </p>
            </div>

            {/* Logo URL */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Logo URL (SVG / PNG)
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://yourdomain.com/logo.svg"
                  className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 text-sm font-mono"
                />
              </div>
              <p className="text-xs text-zinc-500">
                Direct URL to your high-resolution logo (recommended size: 250x60 transparent SVG or PNG).
              </p>
            </div>

            {/* Custom Domain */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Custom Domain / Subdomain
                </label>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  formData.domainStatus === "ACTIVE" 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}>
                  {formData.domainStatus === "ACTIVE" ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      CNAME Verified
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      Pending DNS Propagation
                    </>
                  )}
                </span>
              </div>
              <input
                type="text"
                value={formData.customDomain}
                onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                placeholder="crm.youragency.com"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 text-sm font-mono"
              />
              <p className="text-xs text-zinc-500">
                Point this hostname to our edge network using the DNS instructions on the right.
              </p>
            </div>

            {/* Submit */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-500/20"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Brand Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: DNS Configuration & Live Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* DNS Helper Card */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">DNS CNAME Setup</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              To activate your custom domain, log in to your DNS provider (Cloudflare, GoDaddy, Namecheap) and create a CNAME record:
            </p>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-zinc-400">
                <span>Type:</span>
                <span className="text-emerald-400 font-bold">CNAME</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Name / Host:</span>
                <span className="text-zinc-200">{formData.customDomain ? formData.customDomain.split('.')[0] : "crm"}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400 pt-2 border-t border-zinc-900">
                <span>Target / Value:</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-200">cname.grekam.in</span>
                  <button
                    onClick={() => copyToClipboard("cname.grekam.in")}
                    className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition"
                    title="Copy Target"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            {copied && <p className="text-xs text-emerald-400 text-right">Copied to clipboard!</p>}

            <div className="p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl text-xs text-zinc-400 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>SSL certificates are automatically provisioned and renewed by Grekam Edge servers.</span>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-md">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-zinc-400" />
              Live Customer Header Preview
            </h3>

            {/* Simulated App Header */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <div className="flex items-center gap-2.5">
                  {formData.logoUrl ? (
                    <img 
                      src={formData.logoUrl} 
                      alt="Brand Logo" 
                      className="h-7 max-w-[120px] object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-7 h-7 bg-emerald-500/20 border border-emerald-500/40 rounded-lg flex items-center justify-center text-emerald-400 text-xs font-bold">
                      {formData.brandName ? formData.brandName.charAt(0) : "G"}
                    </div>
                  )}
                  <span className="text-sm font-bold text-white tracking-tight">
                    {formData.brandName || "Your Brand Name"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {formData.customDomain || "crm.youragency.com"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Building2 className="w-3.5 h-3.5" />
                <span>Garage Workshop #104 (Customer View)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
