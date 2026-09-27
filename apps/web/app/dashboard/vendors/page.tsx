"use client"

import { useState } from "react"
import { 
  Search, Plus, Users, Mail, Phone, Tag, X, CheckCircle, Clock, 
  DollarSign, AlertTriangle, ShieldCheck, HelpCircle, ArrowRight, Wallet, 
  Building2, Sparkles, Check, Copy, ExternalLink, Sliders, RefreshCw, Key, FileText, Bot, Scale, Eye
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { SlideOver } from "@/components/SlideOver"

export default function UserFriendlySuperAdminPanel() {
  const { data, isLoading: loading, mutate } = useApi<{ data: any[], total: number }>('/vendors');
  const apiVendors = data?.data || [];

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<"stores" | "payouts" | "commission" | "safety_flags" | "disputes" | "audit">("stores")

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  
  // Impersonation Modal State
  const [impersonatingVendor, setImpersonatingVendor] = useState<any | null>(null)
  
  // KYC Document Inspector
  const [kycVendor, setKycVendor] = useState<any | null>(null)

  // Interactive Mock States
  const [payouts, setPayouts] = useState([
    { id: "PAY-101", vendorName: "Pixel Perfect Media", storeCode: "VND-001", amount: "₹14,500", platformFee: "₹1,450", netPay: "₹13,050", bank: "HDFC Bank (**** 4892)", status: "PENDING_APPROVAL", date: "Today, 2:15 PM" },
    { id: "PAY-102", vendorName: "Apex Learning Hub", storeCode: "VND-002", amount: "₹32,000", platformFee: "₹3,200", netPay: "₹28,800", bank: "ICICI Bank (**** 1120)", status: "PENDING_APPROVAL", date: "Today, 10:40 AM" },
    { id: "PAY-103", vendorName: "Starlight Digital", storeCode: "VND-004", amount: "₹8,200", platformFee: "₹820", netPay: "₹7,380", bank: "Axis Bank (**** 9041)", status: "APPROVED", date: "Yesterday" },
  ])

  const [safetyFlags, setSafetyFlags] = useState([
    { id: "FLAG-01", storeName: "Apex Learning Hub", item: "Course: Advanced Trading Masterclass", reason: "Unusually high price spike (+400%) before flash sale", riskLevel: "Medium", status: "OPEN" },
    { id: "FLAG-02", storeName: "Pixel Perfect Media", item: "Template Pack: Premium UI System", reason: "Matches copyrighted asset signature", riskLevel: "High", status: "OPEN" },
  ])

  const [disputes, setDisputes] = useState([
    { id: "DSP-301", buyer: "Rohan Sharma", storeName: "Pixel Perfect Media", amount: "₹1,200", reason: "Did not receive download link after payment", status: "NEEDS_ADMIN_ACTION" },
  ])

  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false)
  const [newVendor, setNewVendor] = useState({ name: "", email: "", type: "CREATIVE", phone: "" })

  const handleApprovePayout = (id: string) => {
    setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: "APPROVED" } : p))
    toast.success("Payment approved & sent to vendor's bank account!")
  }

  const handleApproveAllPayouts = () => {
    setPayouts(prev => prev.map(p => ({ ...p, status: "APPROVED" })))
    toast.success("All pending vendor payouts approved!")
  }

  const handleResolveDispute = (id: string, action: "REFUND" | "RELEASE") => {
    setDisputes(prev => prev.filter(d => d.id !== id))
    toast.success(action === "REFUND" ? "Refund processed back to buyer." : "Funds released to store owner.")
  }

  const handleAddVendor = async () => {
    if (!newVendor.name || !newVendor.email) return toast.error("Please enter business name and email")
    try {
      await fetchApi("/vendors", {
        method: "POST",
        body: JSON.stringify({
          company: newVendor.name,
          type: newVendor.type,
          user: { name: newVendor.name, email: newVendor.email },
        })
      });
      toast.success(`Store "${newVendor.name}" successfully created!`);
      setIsAddVendorOpen(false);
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Failed to create store");
    }
  }

  const filteredVendors = apiVendors.filter((v: any) => {
    const name = v.company || v.user?.name || "Store";
    return name.toLowerCase().includes(search.toLowerCase()) && (typeFilter === "ALL" || v.type === typeFilter);
  });

  return (
    <div className="min-h-screen bg-[#07090e] text-white p-8 font-sans relative">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[450px] h-[450px] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* User-Friendly Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 rounded-3xl bg-gradient-to-r from-white/10 to-white/5 border border-white/15 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 flex items-center justify-center text-2xl font-black text-white shadow-inner">
              <Building2 className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight">Vendor & Supplier Directory</h1>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300">
                  Suppliers & Partners
                </span>
              </div>
              <p className="text-xs text-white/60 mt-1">
                Manage spare parts suppliers, lubricant vendors, external partners, and purchase accounts.
              </p>
            </div>
          </div>

          <button 
            onClick={() => setIsAddVendorOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold uppercase text-xs px-6 py-4 rounded-2xl shadow-[0_0_25px_rgba(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add New Vendor / Supplier
          </button>
        </div>

        {/* Easy Navigation Tabs */}
        <div className="flex items-center gap-2 bg-black/40 p-2 rounded-2xl border border-white/10 backdrop-blur-xl overflow-x-auto">
          {[
            { id: "stores", label: "Stores & Partners", icon: Building2, count: filteredVendors.length },
            { id: "payouts", label: "Approve Payouts", icon: Wallet, count: payouts.filter(p => p.status === "PENDING_APPROVAL").length, alert: true },
            { id: "commission", label: "Commission & Revenue Split", icon: DollarSign },
            { id: "safety_flags", label: "Safety & Quality Flags", icon: ShieldCheck, count: safetyFlags.length },
            { id: "disputes", label: "Customer Refunds & Disputes", icon: Scale, count: disputes.length },
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 text-xs px-5 py-3 rounded-xl font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive 
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-white/20"
                    : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-white/40"}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black ${
                    tab.alert ? "bg-amber-500 text-black font-extrabold" : "bg-white/20 text-white"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* TAB 1: STORES & PARTNERS */}
        {activeTab === "stores" && (
          <div className="space-y-6">
            {/* Search & Simple Filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-black/40 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search stores by name, email, or category..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40 uppercase font-mono font-bold">Category:</span>
                <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                  {["ALL", "CREATIVE", "TECHNICAL", "OPERATIONAL", "SUPPLIER"].map(t => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`text-[10px] px-3 py-1.5 rounded-lg uppercase font-bold transition-all ${
                        typeFilter === t ? "bg-white text-black font-extrabold" : "text-white/50 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Store Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredVendors.map((vendor: any, idx: number) => {
                const name = vendor.company || vendor.user?.name || "Active Store";
                const code = vendor.vendorCode || `VND-00${idx + 1}`;
                const email = vendor.user?.email || "owner@store.com";

                return (
                  <div key={vendor.id} className="bg-white/5 border border-white/10 hover:border-blue-500/40 rounded-2xl p-6 space-y-4 backdrop-blur-xl transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/15 flex items-center justify-center font-bold text-lg text-white">
                            {name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">{name}</h3>
                            <p className="text-[10px] font-mono text-white/40">{code}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Active Store
                        </span>
                      </div>

                      <div className="my-4 p-3 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-white/40">Owner Email:</span>
                          <span className="text-purple-300 font-mono text-[11px] truncate max-w-[160px]">{email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40">Commission Plan:</span>
                          <span className="text-emerald-400 font-bold">Standard 10%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-white/10">
                      <button 
                        onClick={() => setKycVendor(vendor)}
                        className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold uppercase text-white/80"
                      >
                        Inspect Verification
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 2: PAYOUT APPROVALS */}
        {activeTab === "payouts" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
              <div>
                <h2 className="text-xl font-bold">Vendor Payout Requests</h2>
                <p className="text-xs text-white/50 mt-1">Review and approve money withdrawal requests sent by store owners.</p>
              </div>
              <button 
                onClick={handleApproveAllPayouts}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs px-5 py-3 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
              >
                Approve All Pending Payouts
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-[10px] uppercase font-mono tracking-widest text-white/40">
                    <th className="py-4 px-6">Request ID & Date</th>
                    <th className="py-4 px-6">Store Owner</th>
                    <th className="py-4 px-6">Requested Amount</th>
                    <th className="py-4 px-6">Platform Fee Deduction</th>
                    <th className="py-4 px-6">Net Payout to Bank</th>
                    <th className="py-4 px-6">Bank Account</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payouts.map(p => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-mono font-bold text-white">{p.id}</p>
                        <p className="text-[10px] text-white/40">{p.date}</p>
                      </td>
                      <td className="py-4 px-6 font-bold text-blue-400">{p.vendorName}</td>
                      <td className="py-4 px-6 font-bold text-white">{p.amount}</td>
                      <td className="py-4 px-6 text-amber-400 font-bold">-{p.platformFee}</td>
                      <td className="py-4 px-6 font-black text-emerald-400 text-sm">{p.netPay}</td>
                      <td className="py-4 px-6 text-white/60">{p.bank}</td>
                      <td className="py-4 px-6 text-right">
                        {p.status === "PENDING_APPROVAL" ? (
                          <button 
                            onClick={() => handleApprovePayout(p.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold uppercase text-[10px]"
                          >
                            Approve & Pay
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold uppercase text-emerald-400">Paid ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: COMMISSION & REVENUE SPLIT */}
        {activeTab === "commission" && (
          <div className="space-y-6">
            <div className="bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
              <h2 className="text-xl font-bold">White-Label Revenue Sharing Rules</h2>
              <p className="text-xs text-white/50 mt-1">Automatic revenue calculation across Root SaaS, Partner Resellers, and Store Vendors.</p>
            </div>

            <div className="bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-black p-6 rounded-2xl border border-blue-500/30 space-y-4">
              <h3 className="text-base font-bold text-white">How Money is Split (Example ₹10,000 Customer Order)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                <div className="bg-black/50 p-4 rounded-xl border border-blue-500/20">
                  <p className="text-white/40 text-[10px] uppercase font-bold">1. Root SaaS Platform (3%)</p>
                  <p className="text-2xl font-black text-blue-400 mt-1">₹300.00</p>
                  <p className="text-[10px] text-white/40 mt-1">Covers cloud servers & software maintenance</p>
                </div>
                <div className="bg-black/50 p-4 rounded-xl border border-purple-500/20">
                  <p className="text-white/40 text-[10px] uppercase font-bold">2. Reseller Partner Share (12%)</p>
                  <p className="text-2xl font-black text-purple-400 mt-1">₹1,200.00</p>
                  <p className="text-[10px] text-white/40 mt-1">Reseller commission margin</p>
                </div>
                <div className="bg-black/50 p-4 rounded-xl border border-emerald-500/20">
                  <p className="text-white/40 text-[10px] uppercase font-bold">3. Store Owner Remainder (85%)</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">₹8,500.00</p>
                  <p className="text-[10px] text-white/40 mt-1">Vendor net earnings deposited to bank</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SAFETY & QUALITY FLAGS */}
        {activeTab === "safety_flags" && (
          <div className="space-y-6">
            <div className="bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
              <h2 className="text-xl font-bold">Automatic Product Safety & Quality Review</h2>
              <p className="text-xs text-white/50 mt-1">System automatically alerts you if a vendor posts suspicious products or fake claims.</p>
            </div>

            <div className="space-y-4">
              {safetyFlags.map(flag => (
                <div key={flag.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-between items-center">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{flag.item}</h3>
                      <p className="text-xs text-blue-400">Store: {flag.storeName}</p>
                      <p className="text-xs text-white/60 mt-1"><strong>Reason:</strong> {flag.reason}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSafetyFlags(prev => prev.filter(f => f.id !== flag.id))
                        toast.success("Flag cleared. Product approved.")
                      }}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase"
                    >
                      Dismiss Alert
                    </button>
                    <button 
                      onClick={() => {
                        setSafetyFlags(prev => prev.filter(f => f.id !== flag.id))
                        toast.error("Product taken down & email notice sent to store owner.")
                      }}
                      className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold uppercase"
                    >
                      Take Down Product
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CUSTOMER REFUNDS & DISPUTES */}
        {activeTab === "disputes" && (
          <div className="space-y-6">
            <div className="bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
              <h2 className="text-xl font-bold">Customer Complaints & Refund Portal</h2>
              <p className="text-xs text-white/50 mt-1">Help resolve disputes between buyers and store owners.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {disputes.map(d => (
                <div key={d.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-white/40 uppercase font-bold">Case: {d.id}</span>
                    <h3 className="text-base font-bold text-white mt-1">{d.reason}</h3>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs">
                    <p><strong>Buyer Name:</strong> {d.buyer}</p>
                    <p><strong>Store Name:</strong> {d.storeName}</p>
                    <p><strong>Amount:</strong> <span className="text-emerald-400 font-bold">{d.amount}</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleResolveDispute(d.id, "REFUND")}
                      className="flex-1 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold uppercase text-xs"
                    >
                      Issue Full Refund
                    </button>
                    <button 
                      onClick={() => handleResolveDispute(d.id, "RELEASE")}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold uppercase text-xs"
                    >
                      Release to Store Owner
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* KYC INSPECTOR MODAL */}
      <AnimatePresence>
        {kycVendor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
            <div className="bg-[#0e111a] border border-white/15 rounded-3xl p-8 max-w-lg w-full space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">Store Verification Documents</h3>
                  <p className="text-xs text-white/40 mt-1">Store: {kycVendor.company || kycVendor.user?.name}</p>
                </div>
                <button onClick={() => setKycVendor(null)} className="p-2 hover:bg-white/10 rounded-xl text-white/50"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                  <div><p className="font-bold text-white">Business Tax Certificate (GSTIN)</p><p className="text-[10px] text-white/40">Verified via Govt API</p></div>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300">Verified ✓</span>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                  <div><p className="font-bold text-white">Bank Account Proof</p><p className="text-[10px] text-white/40">Penny Drop Confirmed</p></div>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300">Verified ✓</span>
                </div>
              </div>
              <button onClick={() => { setKycVendor(null); toast.success("Store verification status confirmed!"); }} className="w-full py-3 rounded-xl bg-emerald-500 text-black font-bold uppercase text-xs">Approve Verification</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD STORE SLIDEOVER */}
      <SlideOver title="Add New Store / Partner" open={isAddVendorOpen} onClose={() => setIsAddVendorOpen(false)}>
        <div className="p-6 space-y-6">
          <div>
            <label className="text-xs font-bold uppercase text-white/50 mb-2 block">Business Name *</label>
            <input value={newVendor.name} onChange={e => setNewVendor({...newVendor, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" placeholder="E.g. Pixel Perfect Studios" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-white/50 mb-2 block">Owner Email Address *</label>
            <input type="email" value={newVendor.email} onChange={e => setNewVendor({...newVendor, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" placeholder="owner@pixelperfect.com" />
          </div>
          <button onClick={handleAddVendor} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold uppercase text-xs">Create Store Account</button>
        </div>
      </SlideOver>

    </div>
  )
}
