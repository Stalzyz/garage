"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Save, Plus, Trash2, DollarSign, Send, GripVertical } from "lucide-react"
import Link from "next/link"
import { fetchApi, useApi } from "@/lib/useApi"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function NewProposalPage() {
  const router = useRouter()
  const { data: leadsData } = useApi<any>("/crm/leads")
  const leads = leadsData?.leads || []

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    leadId: "",
    content: "## Overview\n\nWe are excited to propose...",
    status: "DRAFT"
  })

  const [items, setItems] = useState([
    { name: "Web Development", description: "Frontend and Backend", quantity: 1, unitPrice: 5000, total: 5000 }
  ])

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi("/crm/proposals", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          totalValue: calculateTotal(),
          items: items.map(item => ({
            title: item.name,
            description: item.description,
            price: item.unitPrice,
            quantity: item.quantity
          }))
        })
      })
      toast.success("Proposal created successfully")
      router.push("/dashboard/crm/proposals")
    } catch (err: any) {
      toast.error(err.message || "Failed to create proposal")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-y-auto">
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/10 bg-black/40 sticky top-0 z-10 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/crm/proposals" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Proposal Builder</h1>
            <p className="text-xs text-white/50 font-mono mt-1">CRM &rsaquo; Proposals &rsaquo; New</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 px-6 py-2.5 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-all border border-white/10"
          >
            <Send className="w-4 h-4" /> Save as Draft
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Creating..." : "Create Proposal"}
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
            <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-widest font-mono">Executive Summary / Content</h2>
            <textarea 
              rows={12} 
              value={formData.content} 
              onChange={e => setFormData({...formData, content: e.target.value})} 
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 resize-y font-mono" 
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
                    ${item.total.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/50">Subtotal</span>
                <span className="font-mono text-white">${calculateTotal().toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/50">Tax (0%)</span>
                <span className="font-mono text-white">$0</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <span className="font-bold text-white">Total Value</span>
                <span className="font-mono font-bold text-xl text-emerald-400">${calculateTotal().toLocaleString()}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
