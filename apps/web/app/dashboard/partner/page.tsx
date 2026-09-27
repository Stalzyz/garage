"use client"

import { useState, useEffect } from "react"
import { 
  Building2, Users, DollarSign, Wallet, Globe, Plus, 
  ArrowUpRight, ShieldCheck, CheckCircle2, Clock, AlertTriangle, Eye, Edit, PauseCircle, RefreshCw, LogIn,
  FileText, Package, ArrowRight, TrendingUp, Sparkles, Check
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function PartnerDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    partner: any
    stats: any
    recentCustomers: any[]
    recentInvoices: any[]
    recentActivities: any[]
  } | null>(null)

  // Quick Action Modals
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [showAddPackage, setShowAddPackage] = useState(false)
  const [showRechargeWallet, setShowRechargeWallet] = useState(false)
  const [rechargeAmount, setRechargeAmount] = useState("10000")

  // Add Customer Form
  const [custName, setCustName] = useState("")
  const [custOwner, setCustOwner] = useState("")
  const [custEmail, setCustEmail] = useState("")
  const [custPhone, setCustPhone] = useState("")
  const [custDomain, setCustDomain] = useState("")

  // Add Package Form
  const [pkgName, setPkgName] = useState("")
  const [pkgPlan, setPkgPlan] = useState("plan-starter")
  const [pkgPrice, setPkgPrice] = useState("15000")

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/partner/dashboard")
      const json = await res.json()
      if (json.success) {
        setData(json)
      } else {
        setData(null)
      }
    } catch {
      toast.error("Failed to load partner dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/partner/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garageName: custName,
          ownerName: custOwner,
          email: custEmail,
          phone: custPhone,
          domain: custDomain,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message || "Customer created in PENDING_ACTIVATION status.")
        setShowAddCustomer(false)
        setCustName("")
        setCustOwner("")
        setCustEmail("")
        setCustPhone("")
        setCustDomain("")
        fetchDashboard()
      } else {
        toast.error(json.error || "Failed to create customer")
      }
    } catch {
      toast.error("Error creating customer")
    }
  }

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/partner/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pkgName,
          planId: pkgPlan,
          sellingPrice: pkgPrice,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message || "Package created successfully.")
        setShowAddPackage(false)
        setPkgName("")
        setPkgPrice("15000")
        fetchDashboard()
      } else {
        toast.error(json.error || "Failed to create package")
      }
    } catch {
      toast.error("Error creating package")
    }
  }

  const handleRechargeWallet = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/partner/wallet/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: rechargeAmount }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message || "Wallet recharged successfully.")
        setShowRechargeWallet(false)
        fetchDashboard()
      } else {
        toast.error(json.error || "Failed to recharge wallet")
      }
    } catch {
      toast.error("Error recharging wallet")
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {data?.partner?.partnerType === "WHITE_LABEL" ? "White-Label Partner" : "Reseller Partner"}
            </span>
            <span className="text-xs font-mono text-zinc-400">ID: {data?.partner?.partnerCode || "PRT-8821"}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Good morning, {data?.partner?.companyName || "Partner"}</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage your customers, sales, and Garage subscriptions from one place.</p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button 
            onClick={() => setShowAddCustomer(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Customer
          </button>
          <button 
            onClick={() => setShowAddPackage(true)}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            <Package className="w-4 h-4 text-purple-400" /> Create Package
          </button>
          <button 
            onClick={() => setShowRechargeWallet(true)}
            className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            <Wallet className="w-4 h-4 text-emerald-400" /> + Add Money
          </button>
          <Link 
            href="/dashboard/partner/whitelabel"
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            <Globe className="w-4 h-4 text-zinc-400" /> White Label
          </Link>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">My Customers</span>
          <p className="text-2xl font-bold text-white">{data?.stats?.totalCustomers ?? 0}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Active Customers</span>
          <p className="text-2xl font-bold text-emerald-400">{data?.stats?.activeCustomers ?? 0}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Pending Activation</span>
          <p className="text-2xl font-bold text-amber-400">{data?.stats?.pendingCustomers ?? 0}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">This Month Sales</span>
          <p className="text-2xl font-bold text-blue-400">₹{(data?.stats?.thisMonthSales ?? 0).toLocaleString()}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">
            {data?.partner?.partnerType === "WHITE_LABEL" ? "Partner Margin" : "Commission"}
          </span>
          <p className="text-2xl font-bold text-purple-400">₹{(data?.stats?.myEarnings ?? 0).toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-950/40 to-teal-950/20 border border-emerald-500/30 rounded-2xl p-4.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-300 uppercase font-bold">Wallet Balance</span>
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">₹{(data?.stats?.walletBalance ?? 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Main Content Grid: Recent Customers & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Customers Table */}
        <div className="lg:col-span-2 bg-[#080D1A] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Recent Customers</h2>
              <p className="text-xs text-zinc-400">Garages onboarded under your partner account</p>
            </div>
            <Link href="/dashboard/partner/customers" className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-zinc-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="pb-3">Garage / Customer</th>
                  <th className="pb-3">Owner</th>
                  <th className="pb-3">Domain</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {data?.recentCustomers && data.recentCustomers.length > 0 ? (
                  data.recentCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 font-semibold text-white">{cust.name}</td>
                      <td className="py-3.5 text-zinc-400">{cust.ownerName || "—"}</td>
                      <td className="py-3.5 font-mono text-[11px] text-zinc-400">{cust.domain || "Default"}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cust.status === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}>
                          {cust.status === "ACTIVE" ? "Active" : "Pending Activation"}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link 
                          href="/dashboard/partner/customers"
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 text-[11px] font-medium"
                        >
                          {cust.status === "ACTIVE" ? "Manage" : "Activate"}
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-zinc-500">No customers found. Click "+ Add Customer" above.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Invoices & Wallet Explainer */}
        <div className="space-y-6">
          
          {/* Wallet Explainer Card */}
          <div className="bg-gradient-to-br from-[#0c1424] to-[#080d18] border border-blue-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Fail-Safe Wallet Model
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Your prepaid partner wallet secures Grekam Base Cost (₹10,000) prior to activating each customer, guaranteeing instant uninterrupted service for your garages.
            </p>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-zinc-300 space-y-1">
              <div>Wallet Balance: ₹{(data?.stats?.walletBalance ?? 0).toLocaleString()}</div>
              <div>Customer Activation Cost: -₹10,000</div>
              <div className="text-emerald-400">Remaining Balance: ₹{Math.max(0, (data?.stats?.walletBalance ?? 0) - 10000).toLocaleString()}</div>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-[#080D1A] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Recent Customer Invoices</h3>
              <Link href="/dashboard/partner/invoices" className="text-[11px] text-blue-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              {data?.recentInvoices && data.recentInvoices.length > 0 ? (
                data.recentInvoices.map((inv) => (
                  <div key={inv.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{inv.customerName}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{inv.invoiceNumber}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">₹{inv.total.toLocaleString()}</div>
                      <span className="text-[9px] text-zinc-400 uppercase font-semibold">Paid</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-zinc-500 text-xs">No invoices created yet.</div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ── MODAL 1: ADD CUSTOMER ── */}
      {showAddCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0B101D] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Add New Garage Customer</h3>
              <button onClick={() => setShowAddCustomer(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed">
              <strong>Notice:</strong> Creating a customer registers them in <em>PENDING_ACTIVATION</em> status. The garage becomes active once activated via your Partner Wallet.
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Garage / Company Name *</label>
                <input 
                  type="text" 
                  required 
                  value={custName} 
                  onChange={(e) => setCustName(e.target.value)} 
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
                    value={custOwner} 
                    onChange={(e) => setCustOwner(e.target.value)} 
                    placeholder="e.g. Suresh Patel" 
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Phone *</label>
                  <input 
                    type="text" 
                    required 
                    value={custPhone} 
                    onChange={(e) => setCustPhone(e.target.value)} 
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
                  value={custEmail} 
                  onChange={(e) => setCustEmail(e.target.value)} 
                  placeholder="owner@royalautocare.com" 
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Custom Subdomain (Optional)</label>
                <input 
                  type="text" 
                  value={custDomain} 
                  onChange={(e) => setCustDomain(e.target.value)} 
                  placeholder="royal.apexautosolutions.com" 
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono text-[11px]" 
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowAddCustomer(false)} className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/20">Create Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: CREATE PACKAGE ── */}
      {showAddPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0B101D] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Create Custom Package</h3>
              <button onClick={() => setShowAddPackage(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs leading-relaxed space-y-1">
              <div><strong>Grekam Base Price:</strong> ₹10,000 / year</div>
              <div><strong>Allowed Price Range:</strong> ₹10,000 → ₹20,000 (Max 200%)</div>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Package Name *</label>
                <input 
                  type="text" 
                  required 
                  value={pkgName} 
                  onChange={(e) => setPkgName(e.target.value)} 
                  placeholder="e.g. Pro Garage Studio" 
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Base Garage Plan *</label>
                <select 
                  value={pkgPlan} 
                  onChange={(e) => setPkgPlan(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1322] border border-white/10 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="plan-starter">Starter Garage (Base: ₹10,000)</option>
                  <option value="plan-growth">Growth Garage (Base: ₹25,000)</option>
                  <option value="plan-pro">Pro Enterprise (Base: ₹45,000)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Selling Price (₹) *</label>
                <input 
                  type="number" 
                  required 
                  value={pkgPrice} 
                  onChange={(e) => setPkgPrice(e.target.value)} 
                  min="10000" 
                  max="20000" 
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-bold text-sm" 
                />
                <div className="text-[11px] text-zinc-400 mt-1">
                  Estimated Partner Margin: <span className="text-emerald-400 font-bold">₹{Math.max(0, parseFloat(pkgPrice || "0") - 10000).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowAddPackage(false)} className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-600/20">Save Package</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: RECHARGE WALLET ── */}
      {showRechargeWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0B101D] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Add Money to Partner Wallet</h3>
              <button onClick={() => setShowRechargeWallet(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
              Current Available Balance: <strong className="text-emerald-400">₹{(data?.stats?.walletBalance ?? 0).toLocaleString()}</strong>
            </div>

            <form onSubmit={handleRechargeWallet} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Recharge Amount (₹) *</label>
                <input 
                  type="number" 
                  required 
                  value={rechargeAmount} 
                  onChange={(e) => setRechargeAmount(e.target.value)} 
                  min="1000" 
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-black text-base" 
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["10000", "25000", "50000"].map((amt) => (
                  <button 
                    type="button" 
                    key={amt} 
                    onClick={() => setRechargeAmount(amt)}
                    className={`py-2 rounded-lg border text-xs font-semibold ${
                      rechargeAmount === amt 
                        ? "bg-emerald-600/30 border-emerald-500 text-emerald-300" 
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    +₹{parseInt(amt).toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowRechargeWallet(false)} className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/20">
                  Pay & Add ₹{parseInt(rechargeAmount || "0").toLocaleString()}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
