"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Save, Plus, Trash2, Send, Zap, Loader2, Sparkles, Globe, Building2, Target, X, Bot } from "lucide-react"
import Link from "next/link"
import { fetchApi, useApi } from "@/lib/useApi"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"
import { RichTextEditor } from "@/components/ui/RichTextEditor"
import { useCurrency } from "@/hooks/useCurrency"

export default function EditProposalPage() {
  const router = useRouter()
  const params = useParams()
  const proposalId = params.id as string
  const { symbol } = useCurrency()

  const { data: leadsData } = useApi<any>("/crm/leads")
  const leads = leadsData?.data || []

  const { data: existingProposal, isLoading: isLoadingProposal } = useApi<any>(`/crm/proposals/${proposalId}`)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)

  // AI Architect Inputs
  const [aiWebsiteUrl, setAiWebsiteUrl] = useState("")
  const [aiIndustry, setAiIndustry] = useState("Headless E-Commerce & Fullstack Web")
  const [aiScopeGoal, setAiScopeGoal] = useState("")
  const [aiBudgetTier, setAiBudgetTier] = useState("growth")
  const [aiClientName, setAiClientName] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    leadId: "",
    content: "",
    status: "DRAFT"
  })

  const [discountRate, setDiscountRate] = useState<number>(0)
  const [taxRate, setTaxRate] = useState<number>(0)

  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    if (existingProposal) {
      setFormData({
        title: existingProposal.title || "",
        leadId: existingProposal.leadId || "",
        content: existingProposal.notes || "",
        status: existingProposal.status || "DRAFT"
      })
      setDiscountRate(existingProposal.discountRate || 0)
      setTaxRate(existingProposal.taxRate || 0)
      if (existingProposal.items && existingProposal.items.length > 0) {
        setItems(existingProposal.items.map((i: any) => ({
          name: i.description?.split(' - ')[0] || i.description || "Item",
          description: i.description?.split(' - ').slice(1).join(' - ') || "",
          quantity: i.quantity || 1,
          unitPrice: i.unitPrice || 0,
          total: i.total || (i.unitPrice * (i.quantity || 1))
        })))
      }
    }
  }, [existingProposal])

  const calculateSubtotal = () => items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0)
  
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const overallDiscount = subtotal * (Number(discountRate || 0) / 100);
    const afterDiscount = subtotal - overallDiscount;
    const taxAmt = afterDiscount * (Number(taxRate || 0) / 100);
    return afterDiscount + taxAmt;
  }

  const handleAddItem = () => {
    setItems([...items, { name: "", description: "", quantity: 1, unitPrice: 0, total: 0 }])
  }

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items]
    const item = newItems[index]
    
    // @ts-ignore
    item[field] = value
    
    if (field === 'quantity' || field === 'unitPrice') {
      item.total = Number(item.quantity) * Number(item.unitPrice)
    }
    
    setItems(newItems)
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleOpenAiModal = () => {
    if (formData.leadId) {
      const selectedLead = leads.find((l: any) => l.id === formData.leadId)
      if (selectedLead) setAiClientName(selectedLead.company || selectedLead.name)
    }
    setIsAiModalOpen(true)
  }

  const handleAiGenerate = async () => {
    setIsGenerating(true)
    try {
      const res = await fetchApi<any>("/crm/proposals/generate", {
        method: "POST",
        body: JSON.stringify({
          title: formData.title,
          websiteUrl: aiWebsiteUrl,
          industry: aiIndustry,
          clientName: aiClientName,
          scopeGoal: aiScopeGoal,
          budgetTier: aiBudgetTier,
          items: items
        })
      })
      if (res.title) setFormData(prev => ({ ...prev, title: res.title }))
      if (res.content) setFormData(prev => ({ ...prev, content: res.content }))
      if (Array.isArray(res.items) && res.items.length > 0) {
        setItems(res.items.map((i: any) => ({
          name: i.name || "Milestone Item",
          description: i.description || "",
          quantity: Number(i.quantity || 1),
          unitPrice: Number(i.unitPrice || 0),
          total: Number(i.total || (i.unitPrice * (i.quantity || 1)))
        })))
      }
      setIsAiModalOpen(false)
      toast.success("AI Proposal Scope & Milestones Updated!")
    } catch (err: any) {
      toast.error(err.message || "Failed to generate AI content")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return toast.error("Proposal title is required")
    if (items.length === 0) return toast.error("Please add at least one line item")

    setIsSubmitting(true)
    try {
      const payload: any = {
        title: formData.title.trim(),
        notes: formData.content,
        taxRate: Number(tax || 0),
        items: items.map(item => ({
          description: (item.name || "Item") + (item.description ? ` - ${item.description}` : ''),
          unitPrice: Number(item.unitPrice || 0),
          quantity: Number(item.quantity || 1),
          unit: "units",
          discountRate: Number(item.discountRate || 0),
          taxRate: Number(item.taxRate || 0)
        }))
      };

      if (formData.leadId && formData.leadId.trim() !== "") {
        payload.leadId = formData.leadId.trim();
      }

      await fetchApi(`/crm/proposals/${proposalId}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      })
      toast.success("Proposal updated successfully")
      router.push(`/dashboard/crm/proposals/${proposalId}`)
    } catch (err: any) {
      toast.error(err.message || "Failed to update proposal")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-y-auto">
      {/* Header */}
      <div className="px-4 md:px-8 py-4 md:py-6 border-b border-white/10 bg-black/40 sticky top-0 z-10 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/crm/proposals" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Edit Proposal Builder</h1>
            <p className="text-xs text-white/50 font-mono mt-1">CRM &rsaquo; Proposals &rsaquo; Edit</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-all border border-white/10 flex-1 md:flex-none"
          >
            <Send className="w-4 h-4" /> Save as Draft
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 flex-1 md:flex-none"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="p-8 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col - Details & Editor */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-widest font-mono">Document Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Proposal Title</label>
                <input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. Website Redesign & Branding"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50" 
                />
              </div>
              
              <div>
                <label className="text-xs text-white/50 mb-1 block">Assign to Lead / Client</label>
                <select 
                  value={formData.leadId} 
                  onChange={e => setFormData({...formData, leadId: e.target.value})} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 text-white appearance-none"
                >
                  <option value="">Select a Lead...</option>
                  {leads.map((lead: any) => (
                    <option key={lead.id} value={lead.id}>{lead.name} ({lead.company || 'No Company'})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest font-mono">Executive Summary / Content</h2>
              <button 
                type="button"
                onClick={handleOpenAiModal}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-3.5 py-1.5 rounded-lg shadow-lg shadow-violet-500/25 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Proposal Architect
              </button>
            </div>
              
              <RichTextEditor 
                content={formData.content} 
                onChange={(html) => setFormData({...formData, content: html})} 
                placeholder="Start typing your proposal content..."
              />
            </div>
        </div>

        {/* Right Col - Pricing Table */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-28">
            <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-widest font-mono flex items-center justify-between">
              Line Items
              <button onClick={handleAddItem} className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500/30">
                <Plus className="w-3 h-3" />
              </button>
            </h2>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              {items.map((item, index) => (
                <div key={index} className="bg-black/40 border border-white/10 rounded-xl p-4 relative group">
                  <button 
                    onClick={() => handleRemoveItem(index)}
                    className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  
                  <input 
                    placeholder="Item Name" 
                    value={item.name}
                    onChange={e => handleItemChange(index, 'name', e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 px-0 py-1 text-sm font-medium focus:outline-none focus:border-blue-500 mb-2" 
                  />
                  <input 
                    placeholder="Description" 
                    value={item.description}
                    onChange={e => handleItemChange(index, 'description', e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 px-0 py-1 text-xs text-white/50 focus:outline-none focus:border-blue-500 mb-3" 
                  />
                  
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Qty</label>
                      <input 
                        type="number" 
                        value={item.quantity}
                        onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none font-mono" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Price</label>
                      <input 
                        type="number" 
                        value={item.unitPrice}
                        onChange={e => handleItemChange(index, 'unitPrice', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none font-mono" 
                      />
                    </div>
                  </div>
                  <div className="mt-3 text-right font-mono font-bold text-sm text-blue-400">
                    {symbol}{item.total.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/50">Subtotal</span>
                <span className="font-mono text-white">{symbol}{calculateSubtotal().toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/50">Tax (Flat Amount)</span>
                <input 
                  type="number" 
                  value={tax}
                  onChange={e => setTax(Number(e.target.value))}
                  className="w-24 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 font-mono text-right" 
                />
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <span className="font-bold text-white">Total Value</span>
                <span className="font-mono font-bold text-xl text-emerald-400">{symbol}{calculateTotal().toLocaleString()}</span>
              </div>
              
              {/* HTML Content Preview */}
              <div 
                className="prose prose-invert prose-violet max-w-none mb-12"
                dangerouslySetInnerHTML={{ __html: formData.content }}
              />
            </div>

          </div>
        </div>

      </div>

      {/* AI PROPOSAL ARCHITECT MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0e0e14] border border-violet-500/30 rounded-2xl shadow-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-400" />
            
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    AI Proposal Architect
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">GREKAM AI</span>
                  </h3>
                  <p className="text-xs text-white/50">Generates problem diagnosis, technical roadmap, and milestone pricing.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAiModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Client Name & Target Website URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-violet-400" /> Client / Company
                  </label>
                  <input
                    type="text"
                    value={aiClientName}
                    onChange={e => setAiClientName(e.target.value)}
                    placeholder="e.g. Raaghas Luxury"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" /> Website URL (For Live Audit)
                  </label>
                  <input
                    type="text"
                    value={aiWebsiteUrl}
                    onChange={e => setAiWebsiteUrl(e.target.value)}
                    placeholder="e.g. https://clientbrand.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Industry & Budget Tier */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-1.5">
                    Industry / Niche
                  </label>
                  <select
                    value={aiIndustry}
                    onChange={e => setAiIndustry(e.target.value)}
                    className="w-full bg-[#14141c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="Headless E-Commerce & Luxury Retail">Headless E-Commerce & Luxury Retail</option>
                    <option value="AI WhatsApp Automation & Lead Engine">AI WhatsApp Automation & Lead Engine</option>
                    <option value="Custom SaaS ERP / CRM Web Application">Custom SaaS ERP / CRM Web Application</option>
                    <option value="Bespoke Agency & Brand Identity">Bespoke Agency & Brand Identity</option>
                    <option value="Audio Streaming & Interactive Media">Audio Streaming & Interactive Media</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-1.5">
                    Investment Tier
                  </label>
                  <select
                    value={aiBudgetTier}
                    onChange={e => setAiBudgetTier(e.target.value)}
                    className="w-full bg-[#14141c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="startup">🚀 Startup MVP (₹35k – ₹60k)</option>
                    <option value="growth">📈 Growth Engine (₹65k – ₹1,40k)</option>
                    <option value="enterprise">🏢 Enterprise Bespoke (₹1,50k+)</option>
                  </select>
                </div>
              </div>

              {/* Goals / Brief */}
              <div>
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-violet-400" /> Key Goals & Deliverable Focus
                </label>
                <textarea
                  value={aiScopeGoal}
                  onChange={e => setAiScopeGoal(e.target.value)}
                  placeholder="e.g. Rebuild slow storefront on Next.js 16, integrate automated Razorpay checkout, and sync leads with WhatsApp."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500 custom-scrollbar resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-white/60 hover:text-white bg-white/5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Auditing & Synthesizing Scope...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Proposal & Milestones
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
