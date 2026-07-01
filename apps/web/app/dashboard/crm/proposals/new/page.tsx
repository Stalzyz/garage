"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Save, Plus, Trash2, Send, Sparkles, Loader2, PenTool } from "lucide-react"
import Link from "next/link"
import { fetchApi, useApi } from "@/lib/useApi"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useOrganization } from "@/context/OrganizationContext"

export default function InteractiveProposalBuilder() {
  const router = useRouter()
  const org = useOrganization()
  const { data: leadsData } = useApi<any>("/crm/leads")
  const leads = leadsData?.data || []

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "Brand Strategy & Web Development",
    leadId: "",
    content: "## Overview\nWe are excited to propose a comprehensive brand strategy and website overhaul for your company. Our goal is to position you as the industry leader.\n\n## Scope of Work\n1. **Brand Identity Design**\n2. **UI/UX Prototyping**\n3. **Full-stack Development**\n\n## Timeline\nThis project will take approximately 6 weeks to complete from the signing of this proposal.",
  })

  const [items, setItems] = useState([
    { name: "Brand Identity", description: "Logo, Color Palette, Typography", quantity: 1, unitPrice: 2500, total: 2500 },
    { name: "Web Development", description: "Frontend and Backend", quantity: 1, unitPrice: 5000, total: 5000 }
  ])

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const handleAddItem = () => {
    setItems([...items, { name: "New Item", description: "", quantity: 1, unitPrice: 0, total: 0 }])
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

  const handleAiGenerate = async () => {
    if (!formData.title) return toast.error("Please enter a Proposal Title first")
    setIsGenerating(true)
    try {
      const res = await fetchApi<any>("/crm/proposals/generate", {
        method: "POST",
        body: JSON.stringify({
          title: formData.title,
          items: items
        })
      })
      setFormData(prev => ({ ...prev, content: res.content }))
      toast.success("AI Content Generated")
    } catch (err: any) {
      toast.error(err.message || "Failed to generate AI content")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload: any = {
        title: formData.title,
        notes: formData.content,
        items: items.map(item => ({
          description: item.name + (item.description ? ` - ${item.description}` : ''),
          unitPrice: Number(item.unitPrice),
          quantity: Number(item.quantity)
        }))
      };

      if (formData.leadId) {
        payload.leadId = formData.leadId;
      }

      await fetchApi("/crm/proposals", {
        method: "POST",
        body: JSON.stringify(payload)
      })
      toast.success("Interactive Proposal created!")
      router.push("/dashboard/crm/proposals")
    } catch (err: any) {
      toast.error(err.message || "Failed to create proposal")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050508] text-white overflow-hidden font-sans">
      
      {/* Header */}
      <div className="h-16 px-6 border-b border-white/5 bg-[#0a0a0f] shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/crm/proposals" className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Interactive Proposal Builder</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-all border border-white/10"
          >
            <Send className="w-4 h-4" /> Save as Draft
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Generating Link..." : "Create Public Link"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column - Controls (50%) */}
        <div className="w-1/2 flex flex-col border-r border-white/5 bg-[#0a0a0f]">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
            
            {/* Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-violet-400 font-bold text-sm uppercase tracking-widest mb-4">
                <PenTool className="w-4 h-4" /> 1. Document Settings
              </div>
              
              <div>
                <label className="text-xs text-white/50 mb-1.5 block font-medium">Proposal Title</label>
                <input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. Website Redesign & Branding"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors" 
                />
              </div>
              
              <div>
                <label className="text-xs text-white/50 mb-1.5 block font-medium">Assign to Lead / Client</label>
                <select 
                  value={formData.leadId} 
                  onChange={e => setFormData({...formData, leadId: e.target.value})} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors text-white appearance-none"
                >
                  <option value="">Select a Lead...</option>
                  {leads.map((lead: any) => (
                    <option key={lead.id} value={lead.id}>{lead.name} ({lead.company || 'No Company'})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* AI Content */}
            <div className="pt-4 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-violet-400 font-bold text-sm uppercase tracking-widest">
                  <PenTool className="w-4 h-4" /> 2. Proposal Content
                </div>
                <button 
                  onClick={handleAiGenerate}
                  disabled={isGenerating || !formData.title}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {isGenerating ? "Generating..." : "AI Generate Content"}
                </button>
              </div>
              
              <textarea 
                rows={10} 
                value={formData.content} 
                onChange={e => setFormData({...formData, content: e.target.value})} 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-violet-500/50 transition-colors resize-y font-mono text-slate-300 leading-relaxed custom-scrollbar" 
              />
            </div>

            {/* Pricing Table Builder */}
            <div className="pt-4 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-violet-400 font-bold text-sm uppercase tracking-widest">
                  <PenTool className="w-4 h-4" /> 3. Pricing & Modules
                </div>
                <button onClick={handleAddItem} className="flex items-center gap-1 text-xs font-bold text-white/70 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10 relative group">
                    <button 
                      onClick={() => handleRemoveItem(index)}
                      className="absolute -right-2 -top-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-12">
                        <input 
                          type="text" 
                          value={item.name} 
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          placeholder="Item Name" 
                          className="w-full bg-transparent border-b border-white/10 px-2 py-1 text-sm font-bold focus:outline-none focus:border-violet-500 transition-colors mb-2" 
                        />
                        <input 
                          type="text" 
                          value={item.description} 
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Description (Optional)" 
                          className="w-full bg-transparent border-b border-white/10 px-2 py-1 text-xs text-slate-400 focus:outline-none focus:border-violet-500 transition-colors" 
                        />
                      </div>
                      
                      <div className="col-span-4 mt-2">
                        <label className="text-[10px] text-white/30 uppercase font-bold block mb-1">Qty</label>
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full bg-black/50 border border-white/5 rounded-lg px-2 py-1.5 text-sm focus:outline-none text-center" 
                        />
                      </div>
                      <div className="col-span-4 mt-2">
                        <label className="text-[10px] text-white/30 uppercase font-bold block mb-1">Unit Price</label>
                        <input 
                          type="number" 
                          value={item.unitPrice} 
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-full bg-black/50 border border-white/5 rounded-lg px-2 py-1.5 text-sm focus:outline-none" 
                        />
                      </div>
                      <div className="col-span-4 mt-2">
                        <label className="text-[10px] text-white/30 uppercase font-bold block mb-1">Total</label>
                        <div className="w-full bg-black/20 border border-transparent rounded-lg px-2 py-1.5 text-sm text-emerald-400 font-bold flex items-center h-[34px]">
                          ₹{item.total.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center p-4 bg-violet-600/10 border border-violet-500/20 rounded-xl mt-4">
                <span className="font-bold text-violet-400">Total Investment</span>
                <span className="text-2xl font-black text-white">₹{calculateTotal().toLocaleString()}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column - Live Preview (50%) */}
        <div className="w-1/2 bg-[#050508] p-8 flex justify-center overflow-y-auto custom-scrollbar">
          
          <div className="w-full max-w-2xl bg-[#0f0f13] border border-white/5 rounded-2xl p-10 shadow-2xl shadow-black h-max">
            
            {/* Header Preview */}
            <div className="border-b border-white/10 pb-8 mb-8 text-center">
              {/* Dynamic Org Logo */}
              {org.logoUrl ? (
                <img
                  src={org.logoUrl}
                  alt={org.name}
                  className="w-16 h-16 rounded-2xl object-contain mx-auto mb-6 border border-white/10"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <span className="text-white font-black text-2xl">{(org.name ?? 'G').charAt(0).toUpperCase()}</span>
                </div>
              )}
              <h1 className="text-3xl font-bold text-white mb-2">{formData.title || "Proposal Title"}</h1>
              <p className="text-slate-400">Prepared for: {leads.find((l:any) => l.id === formData.leadId)?.company || 'Client Name'}</p>
            </div>

            {/* Markdown Content Preview */}
            <div className="prose prose-invert prose-violet max-w-none mb-12">
              {formData.content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-white mt-8 mb-4 border-b border-white/5 pb-2">{line.replace('## ', '')}</h2>
                if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold text-white mt-8 mb-4">{line.replace('# ', '')}</h1>
                if (line.startsWith('- ')) return <li key={i} className="text-slate-300 ml-4 mb-1">{line.replace('- ', '')}</li>
                if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
                   return <li key={i} className="text-slate-300 ml-4 mb-2 font-medium">{line.replace(/^\d+\.\s/, '')}</li>
                }
                if (line.trim() === '') return <br key={i} />
                return <p key={i} className="text-slate-300 mb-4 leading-relaxed">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
              })}
            </div>

            {/* Pricing Table Preview */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6 border-b border-white/5 pb-2">Investment Breakdown</h2>
              
              <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 text-xs uppercase text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 font-bold">Module / Phase</th>
                      <th className="px-6 py-4 font-bold text-right">Qty</th>
                      <th className="px-6 py-4 font-bold text-right">Price</th>
                      <th className="px-6 py-4 font-bold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {items.map((item, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-white">{item.name || 'Item Name'}</p>
                          {item.description && <p className="text-xs text-slate-500 mt-1">{item.description}</p>}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-300">{item.quantity}</td>
                        <td className="px-6 py-4 text-right text-slate-300">₹{Number(item.unitPrice).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-medium text-white">₹{item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-violet-600/10 border-t border-white/10">
                      <td colSpan={3} className="px-6 py-4 text-right font-bold text-violet-400">Total Investment</td>
                      <td className="px-6 py-4 text-right font-black text-white text-lg">₹{calculateTotal().toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Mock Signature Block */}
            <div className="mt-16 pt-8 border-t border-white/10">
              <div className="flex gap-12">
                <div className="flex-1">
                  <div className="h-16 border-b-2 border-white/10 mb-2"></div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Client Signature</p>
                </div>
                <div className="flex-1">
                  <div className="h-16 border-b-2 border-white/10 mb-2 flex items-end pb-2">
                    <span className="font-medium text-white">{org.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Agency Signature</p>
                  {(org.phone || org.website) && (
                    <p className="text-xs text-slate-400 mt-1">
                      {org.phone && <span>{org.phone}</span>}
                      {org.phone && org.website && <span> | </span>}
                      {org.website && <span>{org.website}</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
