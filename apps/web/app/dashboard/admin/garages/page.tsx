"use client"

import { useState, useEffect } from "react"
import { 
  Building2, Search, Eye, Edit, PauseCircle, PlayCircle, RefreshCw, LogIn, X, ShieldCheck, Plus, Key, Lock, Copy, Check, Calendar, Settings2, Sliders, AlertTriangle, ShieldAlert, Users
} from "lucide-react"
import { toast } from "sonner"

export default function SuperAdminGaragesPage() {
  const [activeTab, setActiveTab] = useState<"All" | "Direct" | "Reseller">("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [garages, setGarages] = useState<any[]>([])
  const [availablePlans, setAvailablePlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Reset Password Modal State
  const [resetModalGarage, setResetModalGarage] = useState<any | null>(null)
  const [customResetPassword, setCustomResetPassword] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [copiedPass, setCopiedPass] = useState(false)

  // Edit / Control Modal State
  const [manageGarage, setManageGarage] = useState<any | null>(null)
  const [manageLoading, setManageLoading] = useState(false)
  const [manageSubmitting, setManageSubmitting] = useState(false)

  const [editForm, setEditForm] = useState({
    name: "",
    plan: "Growth Plan",
    status: "ACTIVE",
    renewalDate: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    features: {
      tasksEnabled: true,
      crmEnabled: true,
      powerDialerEnabled: true,
      hrmEnabled: true,
      projectsEnabled: true,
      financeEnabled: true,
      marketingEnabled: true,
      automationsEnabled: true,
      portalEnabled: true,
      customDomainAllowed: true,
      whiteLabelPdfAllowed: true,
      aiAssistantAllowed: true,
      whatsappAlertsEnabled: true,
      whatsappCloudApiEnabled: true,
      emailTriggersEnabled: true,
      metaLeadsEnabled: true,
      googleLeadsEnabled: true,
      maxUsers: 5,
      maxClients: 100,
    }
  })

  const [newForm, setNewForm] = useState({
    name: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    plan: "Growth Agency",
    type: "Direct",
  })

  const generateRandomPassword = () => {
    return `Garage@${Math.floor(1000 + Math.random() * 9000)}!`
  }

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/admin/plans")
      const data = await res.json()
      if (data.plans && Array.isArray(data.plans)) {
        setAvailablePlans(data.plans)
      }
    } catch {}
  }

  const fetchGarages = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/garages?type=${activeTab}`)
      const data = await res.json()
      if (data.success && data.garages) {
        setGarages(data.garages)
      } else {
        setGarages([])
      }
    } catch {
      toast.error("Failed to fetch garages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
    fetchGarages()
  }, [activeTab])

  const openManageModal = async (garage: any) => {
    setManageGarage(garage)
    setManageLoading(true)
    try {
      const res = await fetch(`/api/admin/garages/${garage.id}`)
      const json = await res.json()
      if (json.success && json.garage) {
        const g = json.garage
        setEditForm({
          name: g.name || garage.name,
          plan: g.plan || garage.plan || "GROWTH",
          status: g.status || garage.status || "ACTIVE",
          renewalDate: g.renewalDate ? g.renewalDate.split("T")[0] : garage.renewal || "",
          ownerName: g.owner?.name || garage.owner || "",
          ownerEmail: g.owner?.email || garage.email || "",
          ownerPhone: g.owner?.phone || garage.phone || "",
          features: {
            tasksEnabled: g.features?.tasksEnabled ?? true,
            crmEnabled: g.features?.crmEnabled ?? true,
            powerDialerEnabled: g.features?.powerDialerEnabled ?? true,
            hrmEnabled: g.features?.hrmEnabled ?? true,
            projectsEnabled: g.features?.projectsEnabled ?? true,
            financeEnabled: g.features?.financeEnabled ?? true,
            marketingEnabled: g.features?.marketingEnabled ?? true,
            automationsEnabled: g.features?.automationsEnabled ?? true,
            portalEnabled: g.features?.portalEnabled ?? true,
            customDomainAllowed: g.features?.customDomainAllowed ?? true,
            whiteLabelPdfAllowed: g.features?.whiteLabelPdfAllowed ?? true,
            aiAssistantAllowed: g.features?.aiAssistantAllowed ?? true,
            whatsappAlertsEnabled: g.features?.whatsappAlertsEnabled ?? true,
            whatsappCloudApiEnabled: g.features?.whatsappCloudApiEnabled ?? true,
            emailTriggersEnabled: g.features?.emailTriggersEnabled ?? true,
            metaLeadsEnabled: g.features?.metaLeadsEnabled ?? true,
            googleLeadsEnabled: g.features?.googleLeadsEnabled ?? true,
            maxUsers: g.features?.maxUsers ?? 5,
            maxClients: g.features?.maxClients ?? 100,
          }
        })
      } else {
        setEditForm({
          name: garage.name,
          plan: garage.plan || "GROWTH",
          status: garage.status || "ACTIVE",
          renewalDate: garage.renewal || "",
          ownerName: garage.owner || "",
          ownerEmail: garage.email || "",
          ownerPhone: garage.phone || "",
          features: {
            tasksEnabled: true,
            crmEnabled: true,
            powerDialerEnabled: true,
            hrmEnabled: true,
            projectsEnabled: true,
            financeEnabled: true,
            marketingEnabled: true,
            automationsEnabled: true,
            portalEnabled: true,
            customDomainAllowed: true,
            whiteLabelPdfAllowed: true,
            aiAssistantAllowed: true,
            whatsappAlertsEnabled: true,
            whatsappCloudApiEnabled: true,
            emailTriggersEnabled: true,
            metaLeadsEnabled: true,
            googleLeadsEnabled: true,
            maxUsers: 5,
            maxClients: 100,
          }
        })
      }
    } catch {
      toast.error("Error loading garage details")
    } finally {
      setManageLoading(false)
    }
  }

  const handleSaveGarageControl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manageGarage) return
    setManageSubmitting(true)

    try {
      const res = await fetch(`/api/admin/garages/${manageGarage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })

      const json = await res.json()
      if (json.success) {
        toast.success(json.message || "Garage configuration updated successfully!")
        setManageGarage(null)
        fetchGarages()
      } else {
        toast.error(json.error || "Failed to update garage settings")
      }
    } catch {
      toast.error("Network error updating garage controls")
    } finally {
      setManageSubmitting(false)
    }
  }

  const handleCreateGarage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newForm.name || !newForm.ownerName || !newForm.email) {
      toast.error("Please fill in Garage Name, Owner Name, and Email")
      return
    }

    toast.loading("Provisioning new garage...")

    try {
      const nameParts = newForm.ownerName.trim().split(" ")
      const chosenPassword = newForm.password.trim() || generateRandomPassword()

      const res = await fetch("/api/tenants/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garageName: newForm.name,
          ownerFirstName: nameParts[0] || "Garage",
          ownerLastName: nameParts.slice(1).join(" ") || "Owner",
          email: newForm.email,
          phone: newForm.phone,
          password: chosenPassword,
          subdomain: newForm.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
          plan: newForm.plan,
        }),
      })

      const data = await res.json()
      toast.dismiss()

      if (data.success) {
        toast.success(`Garage "${newForm.name}" created! Password: ${chosenPassword}`)
        setShowAddModal(false)
        setNewForm({
          name: "",
          ownerName: "",
          email: "",
          phone: "",
          password: "",
          plan: "Growth Garage",
          type: "Direct",
        })
        fetchGarages()
      } else {
        toast.error(data.error || "Failed to create garage")
      }
    } catch {
      toast.dismiss()
      toast.error("Network error while creating garage")
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetModalGarage) return
    setResetLoading(true)

    try {
      const res = await fetch(`/api/admin/garages/${resetModalGarage.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: customResetPassword }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message || "Password reset successfully!")
        setCustomResetPassword(json.newPassword)
      } else {
        toast.error(json.error || "Failed to reset password")
      }
    } catch {
      toast.error("Error resetting password")
    } finally {
      setResetLoading(false)
    }
  }

  const filteredGarages = garages.filter(g =>
    (g.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.owner || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.reseller || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Top Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Garages Directory & Tenancy Control</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage plans, toggle enabled modules, set custom validity dates, revoke subscriptions, and manage passwords for all workshops.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchGarages}
            className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              setNewForm(prev => ({ ...prev, password: generateRandomPassword() }))
              setShowAddModal(true)
            }}
            className="flex items-center gap-2 bg-[#0A84FF] hover:bg-[#0071E3] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Direct Garage
          </button>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-[#161618] p-1 rounded-xl border border-white/[0.08] w-fit">
          {(["All", "Direct", "Reseller"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab
                  ? "bg-white/[0.1] text-white"
                  : "text-[#86868b] hover:text-white"
              }`}
            >
              {tab === "All" ? `All Garages (${garages.length})` : tab === "Direct" ? "Direct Only" : "Partner / Reseller"}
            </button>
          ))}
        </div>

        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#86868b]" />
          <input
            type="text"
            placeholder="Search by garage name, owner, or partner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161618] border border-white/[0.08] rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder:text-[#86868b] focus:outline-none focus:border-[#0A84FF]"
          />
        </div>
      </div>

      {/* Garages Table */}
      <div className="bg-[#161618] border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-zinc-400 font-semibold uppercase text-[10px] bg-white/[0.02]">
              <tr>
                <th className="py-4 px-6">Garage & Domain</th>
                <th className="py-4 px-6">Owner</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Partner / Reseller</th>
                <th className="py-4 px-6">Plan</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    Loading garages...
                  </td>
                </tr>
              ) : filteredGarages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No garages found. Click &quot;Add Direct Garage&quot; or activate workshops via the Partner portal.
                  </td>
                </tr>
              ) : (
                filteredGarages.map((g) => (
                  <tr key={g.id} className="hover:bg-white/[0.02]">
                    <td className="py-4 px-6 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-zinc-400 shrink-0" />
                        <div>
                          <div>{g.name}</div>
                          {g.domain && <div className="text-[10px] text-zinc-500 font-normal">{g.domain}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>{g.owner}</div>
                      <div className="text-[10px] text-zinc-500">{g.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        g.type === "Direct" 
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                          : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      }`}>
                        {g.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-zinc-400 font-medium">
                      {g.reseller}
                    </td>
                    <td className="py-4 px-6 text-zinc-300 font-medium">{g.plan}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        g.status === "Active" || g.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : g.status === "SUSPENDED" || g.status === "REVOKED"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openManageModal(g)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[11px] font-semibold inline-flex items-center gap-1 transition"
                          title="Control Plan, Modules, Validity & Subscription"
                        >
                          <Settings2 className="w-3 h-3" />
                          Manage Controls
                        </button>
                        <button
                          onClick={() => {
                            setResetModalGarage(g)
                            setCustomResetPassword(generateRandomPassword())
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-[11px] font-medium inline-flex items-center gap-1 transition"
                          title="Change / Reset Password"
                        >
                          <Key className="w-3 h-3 text-amber-400" />
                          Passkey
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: MANAGE GARAGE & SUBSCRIPTION CONTROLS ── */}
      {manageGarage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-xl bg-[#161618] border border-white/[0.08] p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" /> Manage Garage Controls — {manageGarage.name}
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Control plan, toggle active modules, adjust subscription validity date, or revoke access.</p>
              </div>
              <button onClick={() => setManageGarage(null)} className="text-zinc-400 hover:text-white text-base">✕</button>
            </div>

            {manageLoading ? (
              <div className="py-12 text-center text-zinc-500 text-xs">Loading garage entitlements...</div>
            ) : (
              <form onSubmit={handleSaveGarageControl} className="space-y-5 text-xs">
                
                {/* 1. Plan & Subscription Status */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5 text-blue-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> Plan Tier & Subscription Access State
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-zinc-400 mb-1 font-semibold">Assigned Plan Tier</label>
                      <select
                        value={editForm.plan}
                        onChange={(e) => {
                          const selectedPlanName = e.target.value
                          setEditForm(prev => {
                            const planObj = availablePlans.find(p => p.name === selectedPlanName || p.slug === selectedPlanName || p.id === selectedPlanName)
                            if (planObj && planObj.modules && Array.isArray(planObj.modules) && planObj.modules.length > 0) {
                              const mods: string[] = planObj.modules
                              const newFeats = { ...prev.features }
                              newFeats.crmEnabled = mods.some(m => m.toLowerCase().includes("crm") || m.toLowerCase().includes("sales") || m.toLowerCase().includes("lead") || m.toLowerCase().includes("pipeline"))
                              newFeats.powerDialerEnabled = mods.some(m => m.toLowerCase().includes("dialer") || m.toLowerCase().includes("call intel") || m.toLowerCase().includes("call"))
                              newFeats.projectsEnabled = mods.some(m => m.toLowerCase().includes("project") || m.toLowerCase().includes("kanban") || m.toLowerCase().includes("asset hub") || m.toLowerCase().includes("task") || m.toLowerCase().includes("job card"))
                              newFeats.financeEnabled = mods.some(m => m.toLowerCase().includes("finance") || m.toLowerCase().includes("invoic") || m.toLowerCase().includes("billing") || m.toLowerCase().includes("p&l"))
                              newFeats.hrmEnabled = mods.some(m => m.toLowerCase().includes("hr") || m.toLowerCase().includes("payroll") || m.toLowerCase().includes("attendance") || m.toLowerCase().includes("identity") || m.toLowerCase().includes("employee"))
                              newFeats.marketingEnabled = mods.some(m => m.toLowerCase().includes("market") || m.toLowerCase().includes("campaign") || m.toLowerCase().includes("scheduler"))
                              newFeats.automationsEnabled = mods.some(m => m.toLowerCase().includes("automat") || m.toLowerCase().includes("flow") || m.toLowerCase().includes("engine"))
                              newFeats.portalEnabled = mods.some(m => m.toLowerCase().includes("portal") || m.toLowerCase().includes("customer") || m.toLowerCase().includes("client"))
                              newFeats.whiteLabelPdfAllowed = mods.some(m => m.toLowerCase().includes("white label") || m.toLowerCase().includes("whitelabel") || m.toLowerCase().includes("pdf"))
                              newFeats.customDomainAllowed = mods.some(m => m.toLowerCase().includes("custom domain") || m.toLowerCase().includes("domain"))
                              newFeats.aiAssistantAllowed = mods.some(m => m.toLowerCase().includes("ai") || m.toLowerCase().includes("assistant") || m.toLowerCase().includes("intel"))
                              newFeats.whatsappAlertsEnabled = mods.some(m => m.toLowerCase().includes("whatsapp"))
                              newFeats.whatsappCloudApiEnabled = mods.some(m => m.toLowerCase().includes("cloud api") || m.toLowerCase().includes("meta"))
                              newFeats.emailTriggersEnabled = true
                              newFeats.metaLeadsEnabled = mods.some(m => m.toLowerCase().includes("meta") || m.toLowerCase().includes("facebook"))
                              newFeats.googleLeadsEnabled = mods.some(m => m.toLowerCase().includes("google") || m.toLowerCase().includes("ads"))
                              if (planObj.maxUsers !== undefined) newFeats.maxUsers = planObj.maxUsers
                              if (planObj.maxClients !== undefined) newFeats.maxClients = planObj.maxClients
                              return { ...prev, plan: selectedPlanName, features: newFeats }
                            }
                            return { ...prev, plan: selectedPlanName }
                          })
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-blue-500"
                      >
                        {availablePlans.length > 0 ? (
                          availablePlans.map((p) => (
                            <option key={p.id || p.name} value={p.name}>
                              {p.name} (₹{Number(p.yearlyOfferPrice || p.yearlyPrice || 0).toLocaleString("en-IN")}/yr)
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Starter Plan">Starter Plan (Basic)</option>
                            <option value="Growth Plan">Growth Plan (Standard)</option>
                            <option value="Enterprise Plan">Enterprise Plan (Full Access)</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1 font-semibold">Subscription Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className={`w-full px-3 py-2 rounded-xl border text-white font-bold focus:outline-none ${
                          editForm.status === "ACTIVE"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : editForm.status === "SUSPENDED" || editForm.status === "REVOKED"
                              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                              : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        }`}
                      >
                        <option value="ACTIVE">ACTIVE — Full Access</option>
                        <option value="PENDING">PENDING — Unverified</option>
                        <option value="SUSPENDED">SUSPENDED — Temporary Block</option>
                        <option value="REVOKED">REVOKED — Cancelled / Revoked</option>
                        <option value="EXPIRED">EXPIRED — Renewal Due</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1 font-semibold">Custom Validity Expiry Date</label>
                      <input
                        type="date"
                        value={editForm.renewalDate}
                        onChange={(e) => setEditForm({ ...editForm, renewalDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Quotas & Role Limits */}
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 space-y-3">
                  <h4 className="font-bold text-white text-xs flex items-center justify-between text-blue-400">
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Staff Roles & Client Account Quotas</span>
                    <span className="text-[10px] text-zinc-400 font-mono">9999 = Unlimited</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 mb-1 text-[11px] font-semibold">Max Staff Roles / User Logins</label>
                      <input
                        type="number"
                        value={editForm.features.maxUsers ?? 5}
                        onChange={(e) => setEditForm({ ...editForm, features: { ...editForm.features, maxUsers: parseInt(e.target.value, 10) || 1 } })}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 text-[11px] font-semibold">Max Active Client Profiles</label>
                      <input
                        type="number"
                        value={editForm.features.maxClients ?? 100}
                        onChange={(e) => setEditForm({ ...editForm, features: { ...editForm.features, maxClients: parseInt(e.target.value, 10) || 1 } })}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Module & Entitlement Controls */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5 text-purple-400">
                    <Sliders className="w-3.5 h-3.5" /> Enable / Disable Specific Modules & Entitlements
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${editForm.features.crmEnabled ? "bg-blue-500/10 border-blue-500/30 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}>
                      <span>CRM & Pipeline</span>
                      <input type="checkbox" checked={editForm.features.crmEnabled} onChange={(e) => setEditForm({ ...editForm, features: { ...editForm.features, crmEnabled: e.target.checked } })} className="accent-blue-500" />
                    </label>

                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${editForm.features.powerDialerEnabled ? "bg-emerald-500/10 border-emerald-500/30 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}>
                      <span>📞 Power Dialer</span>
                      <input type="checkbox" checked={editForm.features.powerDialerEnabled} onChange={(e) => setEditForm({ ...editForm, features: { ...editForm.features, powerDialerEnabled: e.target.checked } })} className="accent-emerald-500" />
                    </label>

                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${editForm.features.hrmEnabled ? "bg-blue-500/10 border-blue-500/30 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}>
                      <span>HRM & Payroll</span>
                      <input type="checkbox" checked={editForm.features.hrmEnabled} onChange={(e) => setEditForm({ ...editForm, features: { ...editForm.features, hrmEnabled: e.target.checked } })} className="accent-blue-500" />
                    </label>

                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${editForm.features.projectsEnabled ? "bg-blue-500/10 border-blue-500/30 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}>
                      <span>Job Cards & Board</span>
                      <input type="checkbox" checked={editForm.features.projectsEnabled} onChange={(e) => setEditForm({ ...editForm, features: { ...editForm.features, projectsEnabled: e.target.checked } })} className="accent-blue-500" />
                    </label>

                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition={editForm.features.tasksEnabled ? "bg-indigo-500/10 border-indigo-500/30 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}>
                      <span>Staff Tasks & Allocation</span>
                      <input type="checkbox" checked={editForm.features.tasksEnabled} onChange={(e) => setEditForm({ ...editForm, features: { ...editForm.features, tasksEnabled: e.target.checked } })} className="accent-indigo-500" />
                    </label>

                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${editForm.features.financeEnabled ? "bg-blue-500/10 border-blue-500/30 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}>
                      <span>Invoices & Billing</span>
                      <input type="checkbox" checked={editForm.features.financeEnabled} onChange={(e) => setEditForm({ ...editForm, features: { ...editForm.features, financeEnabled: e.target.checked } })} className="accent-blue-500" />
                    </label>

                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${editForm.features.marketingEnabled ? "bg-purple-500/10 border-purple-500/30 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}>
                      <span>Marketing Hub</span>
                      <input type="checkbox" checked={editForm.features.marketingEnabled} onChange={(e) => setEditForm({ ...editForm, features: { ...editForm.features, marketingEnabled: e.target.checked } })} className="accent-purple-500" />
                    </label>

                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${editForm.features.automationsEnabled ? "bg-amber-500/10 border-amber-500/30 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}>
                      <span>Automations</span>
                      <input type="checkbox" checked={editForm.features.automationsEnabled} onChange={(e) => setEditForm({ ...editForm, features: { ...editForm.features, automationsEnabled: e.target.checked } })} className="accent-amber-500" />
                    </label>

                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${editForm.features.portalEnabled ? "bg-purple-500/10 border-purple-500/30 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}>
                      <span>Customer Portal</span>
                      <input type="checkbox" checked={editForm.features.portalEnabled} onChange={(e) => setEditForm({ ...editForm, features: { ...editForm.features, portalEnabled: e.target.checked } })} className="accent-purple-500" />
                    </label>

                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${editForm.features.whiteLabelPdfAllowed ? "bg-purple-500/10 border-purple-500/30 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}>
                      <span>Whitelabel PDF</span>
                      <input type="checkbox" checked={editForm.features.whiteLabelPdfAllowed} onChange={(e) => setEditForm({ ...editForm, features: { ...editForm.features, whiteLabelPdfAllowed: e.target.checked } })} className="accent-purple-500" />
                    </label>

                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${editForm.features.customDomainAllowed ? "bg-emerald-500/10 border-emerald-500/30 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}>
                      <span>Custom Domain</span>
                      <input type="checkbox" checked={editForm.features.customDomainAllowed} onChange={(e) => setEditForm({ ...editForm, features: { ...editForm.features, customDomainAllowed: e.target.checked } })} className="accent-emerald-500" />
                    </label>

                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${editForm.features.aiAssistantAllowed ? "bg-amber-500/10 border-amber-500/30 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}>
                      <span>AI Assistant</span>
                      <input type="checkbox" checked={editForm.features.aiAssistantAllowed} onChange={(e) => setEditForm({ ...editForm, features: { ...editForm.features, aiAssistantAllowed: e.target.checked } })} className="accent-amber-500" />
                    </label>

                    {/* New Channels & Lead Connections */}
                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${editForm.features.whatsappAlertsEnabled ? "bg-emerald-500/10 border-emerald-500/30 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}>
                      <span>💬 WhatsApp Alerts</span>
                      <input type="checkbox" checked={editForm.features.whatsappAlertsEnabled} onChange={(e) => setEditForm({ ...editForm, features: { ...editForm.features, whatsappAlertsEnabled: e.target.checked } })} className="accent-emerald-500" />
                    </label>

                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${editForm.features.whatsappCloudApiEnabled ? "bg-emerald-500/10 border-emerald-500/30 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}>
                      <span>📱 WhatsApp Cloud API</span>
                      <input type="checkbox" checked={editForm.features.whatsappCloudApiEnabled} onChange={(e) => setEditForm({ ...editForm, features: { ...editForm.features, whatsappCloudApiEnabled: e.target.checked } })} className="accent-emerald-500" />
                    </label>

                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${editForm.features.emailTriggersEnabled ? "bg-cyan-500/10 border-cyan-500/30 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}>
                      <span>✉️ Email Triggers</span>
                      <input type="checkbox" checked={editForm.features.emailTriggersEnabled} onChange={(e) => setEditForm({ ...editForm, features: { ...editForm.features, emailTriggersEnabled: e.target.checked } })} className="accent-cyan-500" />
                    </label>

                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${editForm.features.metaLeadsEnabled ? "bg-blue-500/10 border-blue-500/30 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}>
                      <span>🌐 Meta Leads Sync</span>
                      <input type="checkbox" checked={editForm.features.metaLeadsEnabled} onChange={(e) => setEditForm({ ...editForm, features: { ...editForm.features, metaLeadsEnabled: e.target.checked } })} className="accent-blue-500" />
                    </label>

                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${editForm.features.googleLeadsEnabled ? "bg-red-500/10 border-red-500/30 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}>
                      <span>🔍 Google Leads Sync</span>
                      <input type="checkbox" checked={editForm.features.googleLeadsEnabled} onChange={(e) => setEditForm({ ...editForm, features: { ...editForm.features, googleLeadsEnabled: e.target.checked } })} className="accent-red-500" />
                    </label>
                  </div>
                </div>

                {/* 3. Garage & Owner Details */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5 text-emerald-400">
                    <Building2 className="w-3.5 h-3.5" /> Garage & Owner Contact Info
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 mb-1 font-semibold">Garage Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 font-semibold">Owner Name</label>
                      <input
                        type="text"
                        value={editForm.ownerName}
                        onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 font-semibold">Owner Email</label>
                      <input
                        type="email"
                        value={editForm.ownerEmail}
                        onChange={(e) => setEditForm({ ...editForm, ownerEmail: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 font-semibold">Owner Phone</label>
                      <input
                        type="text"
                        value={editForm.ownerPhone}
                        onChange={(e) => setEditForm({ ...editForm, ownerPhone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                  <button type="button" onClick={() => setManageGarage(null)} className="px-4 py-2 rounded-lg text-[#86868b] hover:text-white">Cancel</button>
                  <button type="submit" disabled={manageSubmitting} className="px-5 py-2.5 rounded-lg bg-[#0A84FF] hover:bg-[#0071E3] text-white font-medium transition-colors">
                    {manageSubmitting ? "Saving Controls..." : "Save Garage Controls"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Direct Garage Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-xl bg-[#161618] border border-white/[0.08] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Add Direct Garage Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateGarage} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Garage Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. City Central Auto Works"
                  value={newForm.name} 
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} 
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Owner Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Manish Sharma"
                    value={newForm.ownerName} 
                    onChange={(e) => setNewForm({ ...newForm, ownerName: e.target.value })} 
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Phone</label>
                  <input 
                    type="text" 
                    placeholder="e.g. +91 9876543210"
                    value={newForm.phone} 
                    onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })} 
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Login Email *</label>
                <input 
                  type="email" 
                  required 
                  placeholder="e.g. owner@cityautoworks.com"
                  value={newForm.email} 
                  onChange={(e) => setNewForm({ ...newForm, email: e.target.value })} 
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Initial Plan Tier</label>
                <select
                  value={newForm.plan}
                  onChange={(e) => setNewForm({ ...newForm, plan: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                >
                  {availablePlans.length > 0 ? (
                    availablePlans.map((p) => (
                      <option key={p.id || p.name} value={p.name} className="bg-zinc-900 text-white">
                        {p.name} (₹{Number(p.yearlyOfferPrice || p.yearlyPrice || 0).toLocaleString("en-IN")}/yr)
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Starter Plan" className="bg-zinc-900 text-white">Starter Plan</option>
                      <option value="Growth Plan" className="bg-zinc-900 text-white">Growth Plan</option>
                      <option value="Enterprise Plan" className="bg-zinc-900 text-white">Enterprise Plan</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-400 font-semibold">Initial Password *</label>
                  <button 
                    type="button" 
                    onClick={() => setNewForm({ ...newForm, password: generateRandomPassword() })} 
                    className="text-[10px] text-blue-400 hover:underline"
                  >
                    Generate Secure Pass
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter password"
                    value={newForm.password} 
                    onChange={(e) => setNewForm({ ...newForm, password: e.target.value })} 
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold">Provision Garage</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalGarage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-xl bg-[#161618] border border-white/[0.08] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Reset Garage Password</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">{resetModalGarage.name} ({resetModalGarage.email})</p>
              </div>
              <button onClick={() => setResetModalGarage(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-zinc-300 font-semibold">New Password</label>
                  <button
                    type="button"
                    onClick={() => setCustomResetPassword(generateRandomPassword())}
                    className="text-[10px] text-amber-400 hover:underline"
                  >
                    Generate Random
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customResetPassword}
                    onChange={(e) => setCustomResetPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(customResetPassword)
                      setCopiedPass(true)
                      setTimeout(() => setCopiedPass(false), 2000)
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                    title="Copy Password"
                  >
                    {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300">
                This updates the login passkey for the garage admin user immediately.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setResetModalGarage(null)} className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white">Close</button>
                <button type="submit" disabled={resetLoading} className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold">
                  {resetLoading ? "Updating..." : "Save New Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
