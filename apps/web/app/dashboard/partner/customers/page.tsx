"use client"

import { useState, useEffect } from "react"
import { Building2, Plus, Search, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, LogIn, RefreshCw, Zap, ShieldCheck, Key, Lock, Copy, Check } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function PartnerCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")
  const [search, setSearch] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [activatingId, setActivatingId] = useState<string | null>(null)

  // Reset Password Modal State
  const [resetModalCustomer, setResetModalCustomer] = useState<any | null>(null)
  const [customResetPassword, setCustomResetPassword] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [copiedPass, setCopiedPass] = useState(false)

  // Form State
  const [garageName, setGarageName] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [domain, setDomain] = useState("")

  const generateRandomPassword = () => {
    return `Garage@${Math.floor(1000 + Math.random() * 9000)}!`
  }

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/partner/customers?status=${filter}`)
      const json = await res.json()
      if (json.success) {
        setCustomers(json.customers || [])
      } else {
        setCustomers([])
      }
    } catch {
      toast.error("Failed to load customers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [filter])

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const chosenPassword = password.trim() || generateRandomPassword()
      const res = await fetch("/api/partner/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ garageName, ownerName, email, phone, domain, password: chosenPassword }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message || "Customer created in PENDING_ACTIVATION status.")
        setShowAddModal(false)
        setGarageName("")
        setOwnerName("")
        setEmail("")
        setPhone("")
        setPassword("")
        setDomain("")
        fetchCustomers()
      } else {
        toast.error(json.error || "Failed to create customer")
      }
    } catch {
      toast.error("Error creating customer")
    }
  }

  const handleActivate = async (customerId: string, custName: string) => {
    try {
      setActivatingId(customerId)
      toast.loading(`Activating ${custName} & deducting Grekam base cost...`)
      const res = await fetch(`/api/partner/customers/${customerId}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const json = await res.json()
      toast.dismiss()
      if (json.success) {
        toast.success(json.message || "Customer successfully activated!")
        fetchCustomers()
      } else {
        toast.error(json.error || "Activation failed. Please check wallet balance.")
      }
    } catch {
      toast.dismiss()
      toast.error("Error activating customer")
    } finally {
      setActivatingId(null)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetModalCustomer) return
    setResetLoading(true)

    try {
      const res = await fetch(`/api/partner/customers/${resetModalCustomer.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: customResetPassword }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message || "Password updated successfully!")
        setCustomResetPassword(json.newPassword)
      } else {
        toast.error(json.error || "Failed to reset password")
      }
    } catch {
      toast.error("Error updating customer password")
    } finally {
      setResetLoading(false)
    }
  }

  const filtered = customers.filter((c) => {
    const matchSearch = (c.name || "").toLowerCase().includes(search.toLowerCase()) || (c.ownerName || "").toLowerCase().includes(search.toLowerCase())
    if (filter === "ALL") return matchSearch
    return matchSearch && c.status === filter
  })

  return (
    <div className="p-6 md:p-8 space-y-6 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Customers</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage the garages you have onboarded under your partner account.</p>
        </div>

        <button
          onClick={() => {
            setPassword(generateRandomPassword())
            setShowAddModal(true)
          }}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#080D1A] p-3 rounded-2xl border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer or owner..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["ALL", "ACTIVE", "PENDING_ACTIVATION"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === st ? "bg-blue-600 text-white shadow-sm" : "text-zinc-400 hover:text-white bg-white/5"
              }`}
            >
              {st === "ALL" ? "All" : st === "ACTIVE" ? "Active" : "Pending Activation"}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#080D1A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-zinc-400 font-semibold uppercase text-[10px] bg-white/[0.02]">
              <tr>
                <th className="py-3.5 px-4">Garage Customer</th>
                <th className="py-3.5 px-4">Owner</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Domain</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {filtered.length > 0 ? (
                filtered.map((cust) => (
                  <tr key={cust.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-black text-xs shrink-0">
                        {cust.name.slice(0, 1)}
                      </div>
                      <div>
                        <div>{cust.name}</div>
                        <div className="text-[10px] text-zinc-500 font-normal">{cust.ownerEmail}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{cust.ownerName}</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {cust.customerType || "White Label"}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-zinc-400">{cust.domain || "Standard"}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        cust.status === "ACTIVE"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}>
                        {cust.status === "ACTIVE" ? "Active" : "Pending Activation"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {cust.status === "ACTIVE" ? (
                          <>
                            <button
                              onClick={() => {
                                setResetModalCustomer(cust)
                                setCustomResetPassword(generateRandomPassword())
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 font-medium text-[11px] flex items-center gap-1"
                              title="Reset Password"
                            >
                              <Key className="w-3 h-3 text-amber-400" /> Reset Pass
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleActivate(cust.id, cust.name)}
                            disabled={activatingId === cust.id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1 ml-auto"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            {activatingId === cust.id ? "Activating..." : "Activate (₹10k)"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">No customers matching your filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: ADD CUSTOMER ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0B101D] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Create Garage Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs leading-relaxed">
              <strong>Fail-Safe Rule:</strong> Customer creation registers them in <em>PENDING_ACTIVATION</em>. You can activate the garage by deducting Grekam Base Cost from your wallet.
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Garage / Company Name *</label>
                <input 
                  type="text" 
                  required 
                  value={garageName} 
                  onChange={(e) => setGarageName(e.target.value)} 
                  placeholder="e.g. Royal Auto Care" 
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Owner Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={ownerName} 
                    onChange={(e) => setOwnerName(e.target.value)} 
                    placeholder="e.g. Suresh Patel" 
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Phone *</label>
                  <input 
                    type="text" 
                    required 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="+91 98000 12345" 
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Owner Email *</label>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="owner@royalautocare.com" 
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-400 font-semibold">Initial Password *</label>
                  <button 
                    type="button" 
                    onClick={() => setPassword(generateRandomPassword())} 
                    className="text-[10px] text-blue-400 hover:underline"
                  >
                    Generate Passkey
                  </button>
                </div>
                <input 
                  type="text" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter initial password" 
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Custom Subdomain (Optional)</label>
                <input 
                  type="text" 
                  value={domain} 
                  onChange={(e) => setDomain(e.target.value)} 
                  placeholder="royal.apexautosolutions.com" 
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono text-[11px]" 
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold">Create Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: RESET PASSWORD ── */}
      {resetModalCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0b101d] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Reset Customer Password</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">{resetModalCustomer.name} ({resetModalCustomer.ownerEmail})</p>
              </div>
              <button onClick={() => setResetModalCustomer(null)} className="text-zinc-400 hover:text-white">✕</button>
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
                This updates the login passkey for the customer workshop admin immediately.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setResetModalCustomer(null)} className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white">Close</button>
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
