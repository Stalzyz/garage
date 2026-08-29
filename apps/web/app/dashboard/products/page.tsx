"use client"

import { useState } from "react"
import { 
  Search, 
  Plus, 
  Package, 
  Layers, 
  Globe, 
  Zap, 
  ArrowRight, 
  Server, 
  Shield, 
  Headphones, 
  Check as CheckIcon,
  Trash2,
  Edit3,
  FileSpreadsheet,
  Percent,
  Sparkles,
  GraduationCap,
  Briefcase
} from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"

export const SAC_PRESETS = [
  { code: "998314", label: "998314 — IT Design & Web Development" },
  { code: "998361", label: "998361 — Advertising & Digital Marketing" },
  { code: "998313", label: "998313 — SaaS, IT Support & Cloud Hosting" },
  { code: "999293", label: "999293 — Commercial Training & Coaching (Academy)" },
  { code: "998384", label: "998384 — Video Production & Photography" },
  { code: "998319", label: "998319 — Other Technical & Creative Services" },
]

const CATEGORIES = [
  { id: "grafty-pro", name: "Grafty Pro", icon: Layers, description: "SaaS platform for creative agencies" },
  { id: "send-grafty", name: "Send Grafty", icon: Zap, description: "Email marketing automation platform" },
  { id: "web-waas", name: "Website-as-a-Service", icon: Globe, description: "Managed website subscriptions (WaaS)" },
  { id: "digital-services", name: "Digital Services", icon: Briefcase, description: "SEO, Performance Marketing & Video Editing" },
  { id: "academy", name: "Academy Courses", icon: GraduationCap, description: "Professional certification programs & workshops" }
]

export default function ProductCataloguePage() {
  const { data: apiResponse, mutate, isLoading } = useApi<any>("/finance/products")
  const products = apiResponse || []
  
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<string>("grafty-pro")
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tierForm, setTierForm] = useState({
    name: "",
    price: "",
    billing: "monthly",
    description: "",
    sacCode: "998314",
    gstRate: 18,
    uom: "OTH",
    isTaxInclusive: false,
    isPopular: false,
    features: "Custom Feature 1\nCustom Feature 2",
  })

  const activeCategory = CATEGORIES.find(c => c.id === activeTab) || CATEGORIES[0]
  const filteredProducts = products.filter((p: any) => 
    p.categoryId === activeTab && p.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenAdd = () => {
    setEditingId(null)
    setTierForm({
      name: "",
      price: "",
      billing: activeTab === 'academy' ? 'once' : 'monthly',
      description: "",
      sacCode: activeTab === 'academy' ? '999293' : '998314',
      gstRate: 18,
      uom: activeTab === 'web-waas' || activeTab === 'grafty-pro' ? 'MOS' : 'OTH',
      isTaxInclusive: false,
      isPopular: false,
      features: "High Performance Cloud Delivery\n24/7 SLA Support",
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (p: any) => {
    setEditingId(p.id)
    setTierForm({
      name: p.name || "",
      price: String(p.price || ""),
      billing: p.billing || "monthly",
      description: p.description || "",
      sacCode: p.sacCode || "998314",
      gstRate: p.gstRate ?? 18,
      uom: p.uom || "OTH",
      isTaxInclusive: p.isTaxInclusive ?? false,
      isPopular: p.isPopular ?? false,
      features: (p.features || []).join("\n"),
    })
    setIsModalOpen(true)
  }

  const handleSaveTier = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tierForm.name || !tierForm.price) return
    
    try {
      const payload = {
        categoryId: activeTab,
        name: tierForm.name,
        price: parseFloat(tierForm.price),
        billing: tierForm.billing,
        description: tierForm.description,
        sacCode: tierForm.sacCode,
        gstRate: Number(tierForm.gstRate),
        uom: tierForm.uom,
        isTaxInclusive: tierForm.isTaxInclusive,
        isPopular: tierForm.isPopular,
        features: tierForm.features.split("\n").map(s => s.trim()).filter(Boolean),
      }

      if (editingId) {
        await fetchApi(`/finance/products/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
        toast.success("Product & SAC tax details updated!")
      } else {
        await fetchApi("/finance/products", {
          method: "POST",
          body: JSON.stringify(payload),
        })
        toast.success("Product added to catalog!")
      }

      mutate()
      setIsModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to save product")
    }
  }

  const handleDeleteProduct = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this product tier?")) return
    try {
      await fetchApi(`/finance/products/${id}`, { method: "DELETE" })
      toast.success("Product removed from catalogue")
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product")
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#050505] text-white">
      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-white/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-500" /> Product & Service Catalogue
            </h1>
            <p className="text-sm text-white/50 mt-1">
              Manage plans, subscriptions, and services with compliant SAC codes and GST rates.
            </p>
          </div>
          <button 
            onClick={handleOpenAdd} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Service / Tier
          </button>
        </div>

        {/* Categories Bar & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto w-full md:w-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === cat.id ? "bg-blue-600 text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.name}
              </button>
            ))}
          </div>

          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Search catalogue items..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Category Banner */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-3 text-blue-400">
              <activeCategory.icon className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-white">{activeCategory.name}</h2>
            <p className="text-xs text-white/50 mt-1">{activeCategory.description}</p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {filteredProducts.map((tier: any) => {
              const basePrice = tier.price || 0
              const rate = tier.gstRate ?? 18
              const isInc = tier.isTaxInclusive ?? false
              const taxAmount = isInc ? (basePrice * rate) / (100 + rate) : (basePrice * rate) / 100
              const totalAmount = isInc ? basePrice : basePrice + taxAmount

              return (
                <div 
                  key={tier.id}
                  className={`relative flex flex-col justify-between rounded-3xl border bg-[#0b0f19] p-6 shadow-xl transition-all ${
                    tier.isPopular ? "border-blue-500 shadow-blue-500/20" : "border-white/10 hover:border-white/20"
                  }`}
                >
                  {tier.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded-full shadow-lg">
                      Popular Tier
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                        <p className="text-xs text-white/50 mt-1 line-clamp-2">{tier.description}</p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteProduct(e, tier.id)}
                        className="text-white/30 hover:text-red-400 p-1.5 rounded-lg transition-colors"
                        title="Delete Tier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price & Billing */}
                    <div className="mb-4 pb-4 border-b border-white/5">
                      <div className="flex items-baseline gap-1 text-white">
                        <span className="text-3xl font-black font-mono tracking-tight">₹{Number(tier.price).toLocaleString('en-IN')}</span>
                        <span className="text-xs font-mono text-white/40">/{tier.billing}</span>
                      </div>
                    </div>

                    {/* GST & SAC Particulars Badge */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 space-y-1.5 mb-6 text-[11px] font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-white/40">SAC Code:</span>
                        <span className="text-blue-300 font-bold">{tier.sacCode || "998314"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/40">GST Rate ({rate}%):</span>
                        <span className="text-emerald-300 font-bold">+₹{taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-white/80">
                        <span>Invoice Total:</span>
                        <span className="font-bold text-white">₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-2.5 mb-6">
                      {(tier.features || []).map((feature: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-white/70">
                          <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    onClick={() => handleOpenEdit(tier)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      tier.isPopular 
                        ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg" 
                        : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit SAC & Pricing
                  </button>
                </div>
              )
            })}
          </div>

        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0f121d] border border-blue-500/30 rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">
                  {editingId ? "Edit Tier & GST Particulars" : `Add Tier to ${activeCategory?.name}`}
                </h3>
                <p className="text-xs text-white/50">Configure base price, SAC code, and applicable GST rate.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-white/50 hover:text-white text-xs font-bold px-2 py-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSaveTier} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/70 block">Tier / Service Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Growth Retainer" 
                    value={tierForm.name} 
                    onChange={e => setTierForm({...tierForm, name: e.target.value})} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/70 block">Base Price (INR) *</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="e.g. 25000" 
                    value={tierForm.price} 
                    onChange={e => setTierForm({...tierForm, price: e.target.value})} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              {/* GST & SAC Settings Box */}
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                  <Percent className="w-3.5 h-3.5" /> GST & SAC Configuration
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-white/60 block">SAC Code</label>
                    <select
                      value={tierForm.sacCode}
                      onChange={(e) => setTierForm({ ...tierForm, sacCode: e.target.value })}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    >
                      {SAC_PRESETS.map((p) => (
                        <option key={p.code} value={p.code}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-white/60 block">GST Tax Bracket (%)</label>
                    <select
                      value={tierForm.gstRate}
                      onChange={(e) => setTierForm({ ...tierForm, gstRate: Number(e.target.value) })}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono font-bold"
                    >
                      <option value="18">18% (Standard Services / Agency)</option>
                      <option value="0">0% (Nil / Exempt)</option>
                      <option value="5">5% (Special / Transport)</option>
                      <option value="12">12% (IT Hardware / Print)</option>
                      <option value="28">28% (Luxury / Special)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-white/60 block">Billing Cadence</label>
                    <select 
                      value={tierForm.billing} 
                      onChange={e => setTierForm({...tierForm, billing: e.target.value})} 
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="monthly">Monthly Retainer</option>
                      <option value="yearly">Yearly License</option>
                      <option value="once">One-Time Project</option>
                      <option value="retainer">Quarterly Retainer</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-white/60 block">Unit of Measure (UOM)</label>
                    <select 
                      value={tierForm.uom} 
                      onChange={e => setTierForm({...tierForm, uom: e.target.value})} 
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    >
                      <option value="OTH">OTH — Other / Fixed Service</option>
                      <option value="MOS">MOS — Months</option>
                      <option value="HRS">HRS — Hours</option>
                      <option value="NOS">NOS — Units / Numbers</option>
                      <option value="SES">SES — Sessions</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white/70 block">Short Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Full-funnel digital marketing with weekly creative deliverables" 
                  value={tierForm.description} 
                  onChange={e => setTierForm({...tierForm, description: e.target.value})} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white/70 block">Key Deliverables / Features (One per line)</label>
                <textarea 
                  rows={3} 
                  value={tierForm.features} 
                  onChange={e => setTierForm({...tierForm, features: e.target.value})} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 resize-none font-mono" 
                />
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isPopModal" 
                  checked={tierForm.isPopular} 
                  onChange={e => setTierForm({...tierForm, isPopular: e.target.checked})} 
                  className="w-4 h-4 rounded bg-black/40 border-white/20 text-blue-600 focus:ring-0" 
                />
                <label htmlFor="isPopModal" className="text-xs text-white/70">Mark as Most Popular Tier</label>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] text-xs"
                >
                  {editingId ? "Save Changes" : "Create Tier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
