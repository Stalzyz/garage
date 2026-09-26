"use client"

import { useState } from "react"
import { 
  Briefcase, DollarSign, Clock, CheckCircle, Upload, ShieldCheck, 
  AlertTriangle, FileText, ArrowUpRight, TrendingUp, Sparkles, Building2, Wallet, ExternalLink,
  Users, UserPlus, Globe, Palette, Mail, Copy, Check, Sliders, RefreshCw, Key
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { exportVendorStatementCSV } from "@/lib/vendorStatementExporter"

export default function VendorPortalDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "onboard_customers" | "whitelabel" | "kyc">("overview")
  const [requestingPayout, setRequestingPayout] = useState(false)
  
  // Vendor Profile State
  const [vendorData, setVendorData] = useState({
    company: "Nexus Digital Works",
    vendorCode: "VND-002",
    takeRate: "5.0%",
    totalEarnings: 148500.00,
    availableBalance: 24500.00,
    pendingBalance: 12000.00,
    rating: 4.9,
    
    // White-Label Settings
    customSubdomain: "nexusdigital",
    cnameDomain: "academy.nexusdigitalworks.com",
    cnameVerified: true,
    brandColor: "#8b5cf6",
    logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop",
    supportEmail: "support@nexusdigitalworks.com",
    senderName: "Nexus Digital Academy",
  })

  // Onboard Customer Form State
  const [newCustomer, setNewCustomer] = useState({
    clientName: "",
    clientEmail: "",
    package: "Enterprise Growth Suite",
    monthlyRate: "15000",
  })

  const [onboardedCustomers, setOnboardedCustomers] = useState([
    { id: "CLT-101", name: "Rohan Enterprise Solutions", email: "rohan@rohanent.com", package: "Growth Plan", rate: "₹12,000 / mo", status: "ACTIVE", onboardedAt: "2026-09-20" },
    { id: "CLT-102", name: "Apex Global Studios", email: "contact@apexglobal.io", package: "Enterprise Suite", rate: "₹25,000 / mo", status: "ACTIVE", onboardedAt: "2026-09-22" },
    { id: "CLT-103", name: "Aetherial Media Co", email: "admin@aetherial.com", package: "Starter Tier", rate: "₹8,500 / mo", status: "INVITED", onboardedAt: "2026-09-25" },
  ])

  const [copiedLink, setCopiedLink] = useState(false)

  const handlePayoutRequest = () => {
    setRequestingPayout(true)
    setTimeout(() => {
      setRequestingPayout(false)
      toast.success("Payout request submitted to Super Admin for disbursal approval!")
    }, 1200)
  }

  const handleOnboardCustomer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCustomer.clientName || !newCustomer.clientEmail) {
      return toast.error("Client Name and Email are required")
    }

    const createdClient = {
      id: `CLT-${Math.floor(100 + Math.random() * 900)}`,
      name: newCustomer.clientName,
      email: newCustomer.clientEmail,
      package: newCustomer.package,
      rate: `₹${parseFloat(newCustomer.monthlyRate).toLocaleString()} / mo`,
      status: "INVITED",
      onboardedAt: new Date().toISOString().split("T")[0]
    }

    setOnboardedCustomers([createdClient, ...onboardedCustomers])
    setNewCustomer({ clientName: "", clientEmail: "", package: "Enterprise Growth Suite", monthlyRate: "15000" })
    toast.success(`White-Label Invitation link generated & sent to ${createdClient.email}!`)
  }

  const copyInviteLink = () => {
    const link = `https://${vendorData.cnameDomain}/portal/onboard?vendorToken=${vendorData.vendorCode}`
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    toast.success("White-Label Customer Onboarding URL copied to clipboard!")
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-white p-8 relative overflow-hidden font-sans">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[450px] h-[450px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 rounded-3xl bg-gradient-to-r from-white/10 to-white/5 border border-white/15 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/20 flex items-center justify-center text-2xl font-black text-white shadow-inner">
              <Building2 className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight">{vendorData.company}</h1>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Vendor Node
                </span>
              </div>
              <p className="text-xs font-mono text-white/50 uppercase tracking-widest mt-1">
                Domain: <span className="text-purple-300 font-bold">{vendorData.cnameDomain}</span> • Commission Take Rate: {vendorData.takeRate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => exportVendorStatementCSV(vendorData.company, [
                { payoutId: "PO-901", requestedAt: "2026-09-25", grossAmount: 14500, platformFee: 725, netPayout: 13775, status: "APPROVED", bankName: "HDFC Bank (**** 4892)" }
              ])}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-mono font-bold uppercase text-xs px-4 py-3.5 rounded-2xl border border-white/10 transition-all"
            >
              Export CSV
            </button>
            <button 
              onClick={handlePayoutRequest}
              disabled={requestingPayout || vendorData.availableBalance <= 0}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black uppercase text-xs px-6 py-4 rounded-2xl transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" /> 
              {requestingPayout ? "Requesting..." : `Withdraw ₹${vendorData.availableBalance.toLocaleString()}`}
            </button>
          </div>
        </div>

        {/* Vendor Portal Navigation Tabs */}
        <div className="flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-white/10 backdrop-blur-xl">
          {[
            { id: "overview", label: "Financial Overview & Contracts", icon: Briefcase },
            { id: "onboard_customers", label: "Customer Onboarding Portal", icon: UserPlus, badge: onboardedCustomers.length },
            { id: "whitelabel", label: "White-Label Domain & Branding", icon: Palette },
            { id: "kyc", label: "KYC & Banking Telemetry", icon: ShieldCheck },
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 text-xs px-5 py-3 rounded-xl font-mono uppercase tracking-wider font-bold transition-all ${
                  isActive 
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-white/20"
                    : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-white/40"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-mono font-black">
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* TAB 1: OVERVIEW & FINANCIALS */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-2">
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Total Earnings</p>
                <p className="text-3xl font-black text-white">₹{vendorData.totalEarnings.toLocaleString()}</p>
                <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 pt-1">
                  <TrendingUp className="w-3 h-3" /> +18.4% this month
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-2">
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Available Disbursal</p>
                <p className="text-3xl font-black text-emerald-400">₹{vendorData.availableBalance.toLocaleString()}</p>
                <p className="text-[10px] font-mono text-white/40 pt-1">Eligible for instant release</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-2">
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Escrow Holdback</p>
                <p className="text-3xl font-black text-amber-400">₹{vendorData.pendingBalance.toLocaleString()}</p>
                <p className="text-[10px] font-mono text-white/40 pt-1">7-Day standard refund hold</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-2">
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Store Rating</p>
                <p className="text-3xl font-black text-purple-400">★ {vendorData.rating}</p>
                <p className="text-[10px] font-mono text-white/40 pt-1">Top 5% Gold Tier Vendor</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-4">
              <h2 className="text-xl font-bold">Active Deliverables & Contracts</h2>
              <div className="space-y-4">
                {[
                  { id: "ORD-901", title: "Enterprise 3D Product Motion Reel", client: "Acme Corp", amount: "₹45,000", deadline: "In 2 Days", status: "IN_PRODUCTION" },
                  { id: "ORD-902", title: "Full-Stack Dashboard UI Design System", client: "Grekam OS", amount: "₹82,000", deadline: "In 5 Days", status: "REVIEW_PENDING" },
                ].map(order => (
                  <div key={order.id} className="bg-black/40 border border-white/5 rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">{order.title}</p>
                      <p className="text-xs font-mono text-white/40 mt-1">Client: {order.client} • Deadline: {order.deadline}</p>
                    </div>
                    <span className="text-base font-black text-emerald-400 font-mono">{order.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOMER ONBOARDING PORTAL */}
        {activeTab === "onboard_customers" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Customer Invitation Form */}
            <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-purple-400" /> Onboard New Client
                </h2>
                <p className="text-xs font-mono text-white/40 uppercase tracking-widest mt-1">
                  Send branded access link under your white-label portal domain.
                </p>
              </div>

              <form onSubmit={handleOnboardCustomer} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1.5 block">Client / Company Name *</label>
                  <input 
                    value={newCustomer.clientName}
                    onChange={e => setNewCustomer({ ...newCustomer, clientName: e.target.value })}
                    placeholder="E.g. Acme Corp India"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1.5 block">Client Email Address *</label>
                  <input 
                    type="email"
                    value={newCustomer.clientEmail}
                    onChange={e => setNewCustomer({ ...newCustomer, clientEmail: e.target.value })}
                    placeholder="client@acme.com"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1.5 block">Service Package Tier</label>
                  <select 
                    value={newCustomer.package}
                    onChange={e => setNewCustomer({ ...newCustomer, package: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Enterprise Growth Suite">Enterprise Growth Suite</option>
                    <option value="Starter Pro Tier">Starter Pro Tier</option>
                    <option value="Custom Agency Retainer">Custom Agency Retainer</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1.5 block">Monthly Retainer Price (₹)</label>
                  <input 
                    type="number"
                    value={newCustomer.monthlyRate}
                    onChange={e => setNewCustomer({ ...newCustomer, monthlyRate: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
                >
                  Send Onboarding Invite
                </button>
              </form>

              {/* Instant Shareable URL Banner */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">Public Onboarding URL</p>
                <div className="flex items-center gap-2 bg-black/60 p-2.5 rounded-xl border border-white/10">
                  <span className="text-[10px] font-mono text-purple-300 truncate flex-1">
                    https://{vendorData.cnameDomain}/portal/onboard
                  </span>
                  <button 
                    onClick={copyInviteLink}
                    className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 transition-colors"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Onboarded Customers List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <h2 className="text-xl font-bold">Onboarded Clients & Subscriptions</h2>
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30">
                  {onboardedCustomers.length} Active Clients
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/40 text-[10px] text-white/40 uppercase tracking-widest">
                      <th className="py-4 px-6">Client Ref & Name</th>
                      <th className="py-4 px-6">Email Address</th>
                      <th className="py-4 px-6">Assigned Package</th>
                      <th className="py-4 px-6">Monthly Rate</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {onboardedCustomers.map(client => (
                      <tr key={client.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-bold text-white">{client.name}</p>
                          <p className="text-[10px] text-white/40">{client.id}</p>
                        </td>
                        <td className="py-4 px-6 text-purple-300">{client.email}</td>
                        <td className="py-4 px-6 text-white/80">{client.package}</td>
                        <td className="py-4 px-6 font-bold text-emerald-400">{client.rate}</td>
                        <td className="py-4 px-6">
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                            client.status === "ACTIVE" 
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse"
                          }`}>
                            {client.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WHITE-LABEL DOMAIN & BRANDING */}
        {activeTab === "whitelabel" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Custom Domain & CNAME Configuration */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-bold">Custom Subdomain & CNAME Settings</h2>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  DNS Verified
                </span>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1.5 block">Platform Subdomain</label>
                  <div className="flex items-center bg-black/50 border border-white/10 rounded-xl px-4 py-3">
                    <input 
                      value={vendorData.customSubdomain}
                      onChange={e => setVendorData({ ...vendorData, customSubdomain: e.target.value })}
                      className="bg-transparent text-purple-300 font-bold focus:outline-none flex-1"
                    />
                    <span className="text-white/40">.grekam.in</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1.5 block">Custom CNAME Domain (White-Label)</label>
                  <input 
                    value={vendorData.cnameDomain}
                    onChange={e => setVendorData({ ...vendorData, cnameDomain: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    placeholder="academy.yourbrand.com"
                  />
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                  <p className="text-[10px] text-white/40 uppercase">Required DNS CNAME Record</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/60">Host: <code className="text-purple-300">academy</code></span>
                    <span className="text-white/60">Target: <code className="text-emerald-400">cname.grekam.in</code></span>
                  </div>
                </div>

                <button 
                  onClick={() => toast.success("Domain settings saved & SSL certificates provisioned!")}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-xs transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  Save & Provision Domain
                </button>
              </div>
            </div>

            {/* Brand Theme & Styling */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl space-y-6">
              <div className="flex items-center gap-3">
                <Palette className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold">White-Label Brand Styling</h2>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1.5 block">Primary Brand Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color"
                      value={vendorData.brandColor}
                      onChange={e => setVendorData({ ...vendorData, brandColor: e.target.value })}
                      className="w-12 h-12 rounded-xl bg-transparent border-0 cursor-pointer"
                    />
                    <input 
                      value={vendorData.brandColor}
                      onChange={e => setVendorData({ ...vendorData, brandColor: e.target.value })}
                      className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1.5 block">Custom Support Email Signature</label>
                  <input 
                    value={vendorData.supportEmail}
                    onChange={e => setVendorData({ ...vendorData, supportEmail: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1.5 block">Email Sender Name</label>
                  <input 
                    value={vendorData.senderName}
                    onChange={e => setVendorData({ ...vendorData, senderName: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white"
                  />
                </div>

                <button 
                  onClick={() => toast.success("White-label brand theme updated!")}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase text-xs transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                >
                  Apply Brand Theme
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: KYC & BANKING */}
        {activeTab === "kyc" && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl space-y-6 font-mono text-xs">
            <h2 className="text-xl font-bold text-white font-sans">Banking Telemetry & KYC Verification</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <p className="text-white/40 text-[10px] uppercase">Bank Account Name</p>
                <p className="font-bold text-white text-sm">Nexus Digital Works Pvt Ltd</p>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <p className="text-white/40 text-[10px] uppercase">Bank & Branch</p>
                <p className="font-bold text-purple-300 text-sm">HDFC Bank (**** 4892)</p>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <p className="text-white/40 text-[10px] uppercase">IFSC Code</p>
                <p className="font-bold text-emerald-400 text-sm">HDFC0001892</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
