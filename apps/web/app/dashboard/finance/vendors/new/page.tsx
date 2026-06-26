"use client"

import { useState } from "react"
import { ChevronLeft, Save, Building2, User, Phone, Mail, MapPin, Tag } from "lucide-react"
import Link from "next/link"
import { fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function NewVendorPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "FREELANCER",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    taxId: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi("/finance/vendors", {
        method: "POST",
        body: JSON.stringify(formData)
      })
      toast.success("Vendor created successfully")
      router.push("/dashboard/finance") // Redirect to finance home
    } catch (err: any) {
      toast.error(err.message || "Failed to create vendor")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-y-auto">
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/10 bg-black/40 sticky top-0 z-10 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/finance" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">New Vendor</h1>
            <p className="text-xs text-white/50 font-mono mt-1">Finance &rsaquo; Vendors &rsaquo; Create</p>
          </div>
        </div>
        
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? "Saving..." : "Save Vendor"}
        </button>
      </div>

      {/* Form */}
      <div className="p-8 max-w-4xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* General Information */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest font-mono">
              <Building2 className="w-4 h-4 text-blue-400" /> General Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">Vendor Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50" placeholder="Acme Corp" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">Vendor Type</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 appearance-none text-white">
                    <option value="FREELANCER">Freelancer</option>
                    <option value="AGENCY">Agency</option>
                    <option value="SOFTWARE">Software / SaaS</option>
                    <option value="EQUIPMENT">Equipment Supplier</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest font-mono">
              <User className="w-4 h-4 text-emerald-400" /> Contact Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">Contact Person</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input name="contactName" value={formData.contactName} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50" placeholder="Jane Doe" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50" placeholder="jane@example.com" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50" placeholder="+1 234 567 8900" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">Tax ID / VAT</label>
                <input name="taxId" value={formData.taxId} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50" placeholder="Optional" />
              </div>
              
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-xs font-medium text-white/70">Billing Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-4 w-4 h-4 text-white/30" />
                  <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 resize-none" placeholder="123 Street Name..." />
                </div>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}
