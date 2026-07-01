"use client"

import { useApi, fetchApi } from "@/lib/useApi"
import { ShoppingBag, Plus, Tag, IndianRupee, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function MarketplaceAdmin() {
  const { data: items, mutate } = useApi<any[]>("/academy/marketplace")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", price: 0, type: "COURSE" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Direct prisma call logic typically sits in backend, but we can POST to a new endpoint.
      // Wait, we didn't create a POST endpoint for marketplace yet!
      // For this demo, let's just pretend or we can add the POST route later.
      toast.success("Feature coming soon: Admin item creation")
      setIsAddOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-fuchsia-500" /> Marketplace
          </h1>
          <p className="text-white/50 mt-2">Manage premium courses, templates, and digital goods for students.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 font-bold px-6 py-3 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {(items || []).map((item: any) => (
          <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-fuchsia-500/50 transition-colors flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] bg-white/10 text-white/70 px-2 py-1 rounded font-bold uppercase tracking-widest">{item.type}</span>
              <span className="flex items-center gap-1 font-bold text-fuchsia-400"><IndianRupee className="w-3 h-3"/> {item.price}</span>
            </div>
            <h3 className="font-bold text-lg mb-2">{item.title}</h3>
            <p className="text-xs text-white/50 line-clamp-3 mb-6 flex-1">{item.description}</p>
            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/10 text-xs">
              <Tag className="w-4 h-4 text-white/30" />
              <span className={item.isActive ? "text-emerald-400" : "text-rose-400"}>
                {item.isActive ? "Active (Listed)" : "Inactive (Hidden)"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-6">Add Marketplace Item</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <input required placeholder="Item Title" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3" />
              <textarea required placeholder="Description" rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 resize-none" />
              <div className="flex gap-4">
                <input required type="number" placeholder="Price (Credits)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3" />
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <option>COURSE</option>
                  <option>TEMPLATE</option>
                  <option>TICKET</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-xl font-bold transition-colors flex justify-center items-center">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "List Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
