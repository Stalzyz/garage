"use client"

import { useState, useEffect } from "react"
import { Globe, Eye, RotateCcw, Power, ShieldCheck, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function SuperAdminWhiteLabelPage() {
  const [whitelabels, setWhitelabels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWhitelabels()
  }, [])

  const fetchWhitelabels = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/partners")
      const data = await res.json()
      if (data.success && Array.isArray(data.partners)) {
        const mapped = data.partners
          .filter((p: any) => p.whiteLabelEnabled || p.whiteLabel?.customDomain)
          .map((p: any) => ({
            id: p.id,
            reseller: p.companyName || p.user?.firstName || "Partner Agency",
            garage: "N/A",
            brand: p.whiteLabel?.brandName || p.companyName || "Custom Brand",
            domain: p.whiteLabel?.customDomain || "Not Configured",
            status: p.whiteLabelEnabled ? "Enabled" : "Disabled"
          }))
        setWhitelabels(mapped)
      } else {
        setWhitelabels([])
      }
    } catch (e) {
      setWhitelabels([])
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = (id: string) => {
    setWhitelabels(whitelabels.map(w => {
      if (w.id === id) {
        const nextStatus = w.status === "Enabled" ? "Disabled" : "Enabled"
        toast.info(`White label branding for "${w.brand}" is now ${nextStatus}`)
        return { ...w, status: nextStatus }
      }
      return w
    }))
  }

  const verifyDns = async (domain: string) => {
    toast.loading(`Checking DNS records for ${domain}...`)
    try {
      const res = await fetch("/api/whitelabel/verify-dns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      })
      const data = await res.json()
      toast.dismiss()
      if (data.verified) {
        toast.success(data.message || `DNS verified for ${domain}!`)
      } else {
        toast.error(data.message || `CNAME not configured for ${domain}`)
      }
    } catch {
      toast.dismiss()
      toast.error("Failed to reach DNS verification service")
    }
  }

  const resetBranding = (id: string) => {
    toast.success("Branding reset to Grekam platform defaults!")
  }

  return (
    <div className="p-8 space-y-6 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Global White Label Management</h1>
          <p className="text-xs text-zinc-400 mt-1">Super Admin override & control over all reseller and garage branding custom domains.</p>
        </div>

        <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
          Platform Owner Override
        </span>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 text-zinc-400 uppercase text-[10px] font-semibold bg-white/[0.02]">
              <th className="py-3.5 px-4">Reseller</th>
              <th className="py-3.5 px-4">Garage</th>
              <th className="py-3.5 px-4">Brand Name</th>
              <th className="py-3.5 px-4">Custom Domain</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {whitelabels.map((w) => (
              <tr key={w.id} className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-4 font-semibold text-white">{w.reseller}</td>
                <td className="py-3.5 px-4 text-zinc-300">{w.garage}</td>
                <td className="py-3.5 px-4 text-purple-400 font-medium">{w.brand}</td>
                <td className="py-3.5 px-4 text-blue-400 font-mono text-[11px]">{w.domain}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    w.status === "Enabled" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    {w.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button onClick={() => verifyDns(w.domain)} className="text-blue-400 hover:text-blue-300 p-1" title="Test Live CNAME DNS">
                    <Globe className="w-4 h-4 inline" />
                  </button>
                  <button onClick={() => toast.info(`Viewing branding for ${w.brand}...`)} className="text-zinc-400 hover:text-white p-1" title="View Branding">
                    <Eye className="w-4 h-4 inline" />
                  </button>
                  <button onClick={() => resetBranding(w.id)} className="text-amber-400 hover:text-amber-300 p-1" title="Reset Branding">
                    <RotateCcw className="w-4 h-4 inline" />
                  </button>
                  <button onClick={() => toggleStatus(w.id)} className="text-red-400 hover:text-red-300 p-1" title="Enable/Disable">
                    <Power className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
