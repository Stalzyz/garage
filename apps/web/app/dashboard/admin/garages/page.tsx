"use client"

import { useState } from "react"
import { 
  Building2, Search, Eye, Edit, PauseCircle, PlayCircle, RefreshCw, LogIn, X, ShieldCheck
} from "lucide-react"
import { toast } from "sonner"

export default function SuperAdminGaragesPage() {
  const [activeTab, setActiveTab] = useState<"All" | "Direct" | "Reseller">("All")
  const [searchQuery, setSearchQuery] = useState("")

  const [garages, setGarages] = useState([
    { id: "g-1", name: "Apex Auto Care", owner: "Rajesh Kumar", type: "Reseller", plan: "Enterprise Garage", reseller: "Apex SaaS Partners", status: "Active", renewal: "2026-10-15" },
    { id: "g-2", name: "City Auto Garage (Direct)", owner: "Manish Sharma", type: "Direct", plan: "Growth Garage", reseller: "Direct Customer", status: "Active", renewal: "2026-11-20" },
    { id: "g-3", name: "Speedy Motors", owner: "Anita Sharma", type: "Reseller", plan: "Growth Garage", reseller: "Apex SaaS Partners", status: "Active", renewal: "2026-10-02" },
    { id: "g-4", name: "Grekam Flagship Garage", owner: "Sanjay Gupta", type: "Direct", plan: "Enterprise Garage", reseller: "Direct Customer", status: "Active", renewal: "2027-01-15" },
    { id: "g-5", name: "Royal Auto Works", owner: "Suresh Patel", type: "Reseller", plan: "Basic Garage", reseller: "Royal Resellers", status: "Expiring Soon", renewal: "2026-09-29" },
  ])

  const toggleStatus = (id: string) => {
    setGarages(garages.map(g => {
      if (g.id === id) {
        const nextStatus = g.status === "Active" ? "Suspended" : "Active"
        toast.info(`Garage "${g.name}" status changed to ${nextStatus}`)
        return { ...g, status: nextStatus }
      }
      return g
    }))
  }

  const handleRenew = (id: string) => {
    setGarages(garages.map(g => {
      if (g.id === id) {
        toast.success(`Garage "${g.name}" subscription extended by 1 year!`)
        return { ...g, status: "Active", renewal: "2027-09-26" }
      }
      return g
    }))
  }

  const filteredGarages = garages.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.owner.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "All" || g.type === activeTab
    return matchesSearch && matchesTab
  })

  const handleImpersonate = async (id: string, name: string) => {
    toast.loading(`Logging in as ${name}...`)
    try {
      const res = await fetch("/api/auth/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ garageId: id, garageName: name }),
      })
      const data = await res.json()
      if (data.success) {
        toast.dismiss()
        toast.success(`Access granted! Switching scope to ${name}`)
        window.location.href = data.redirectUrl
      } else {
        toast.dismiss()
        toast.error(data.error || "Impersonation failed")
      }
    } catch {
      toast.dismiss()
      toast.error("Failed to connect to impersonation service")
    }
  }

  return (
    <div className="p-8 space-y-6 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Garages Control Center</h1>
          <p className="text-xs text-zinc-400 mt-1">Global view of all Direct Garages and Reseller-managed Garages.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-semibold">
          {(["All", "Direct", "Reseller"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab ? "bg-blue-600 text-white shadow-md" : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab === "All" ? "All Garages" : tab === "Direct" ? "Direct Customers" : "Reseller Garages"}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Stats */}
      <div className="flex items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search all garages or owners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <span className="text-xs text-zinc-400 font-medium">Showing {filteredGarages.length} Garages</span>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 text-zinc-400 uppercase text-[10px] font-semibold bg-white/[0.02]">
              <th className="py-3.5 px-4">Garage Name</th>
              <th className="py-3.5 px-4">Owner</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Plan</th>
              <th className="py-3.5 px-4">Reseller</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Renewal</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredGarages.map((g) => (
              <tr key={g.id} className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-4 font-semibold text-white">{g.name}</td>
                <td className="py-3.5 px-4 text-zinc-400">{g.owner}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                    g.type === "Direct" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  }`}>
                    {g.type}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-zinc-300">{g.plan}</td>
                <td className="py-3.5 px-4 text-zinc-400">{g.reseller}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    g.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    g.status === "Expiring Soon" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                    "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    {g.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-zinc-400">{g.renewal}</td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button onClick={() => toast.info(`Viewing ${g.name}...`)} className="text-zinc-400 hover:text-white p-1" title="View">
                    <Eye className="w-4 h-4 inline" />
                  </button>
                  <button onClick={() => handleRenew(g.id)} className="text-emerald-400 hover:text-emerald-300 p-1" title="Renew">
                    <RefreshCw className="w-4 h-4 inline" />
                  </button>
                  <button onClick={() => toggleStatus(g.id)} className="text-amber-400 hover:text-amber-300 p-1" title="Suspend/Activate">
                    {g.status === "Active" ? <PauseCircle className="w-4 h-4 inline" /> : <PlayCircle className="w-4 h-4 inline" />}
                  </button>
                  <button onClick={() => handleImpersonate(g.id, g.name)} className="text-blue-400 hover:text-blue-300 p-1" title="Login as Garage">
                    <LogIn className="w-4 h-4 inline" />
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
