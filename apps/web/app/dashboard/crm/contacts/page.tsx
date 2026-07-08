"use client"

import { useState } from "react"
import { Search, Plus, Filter, Mail, Phone, MapPin, Building2, UserCircle2, Key } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { SlideOver } from "@/components/SlideOver"

export default function ContactsPage() {
  const { data, mutate, isLoading } = useApi<any>("/crm/contacts")
  const contacts = data?.data || []

  
  const [inviteData, setInviteData] = useState<any>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingContactId, setEditingContactId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyId: "",
    tier: "BRONZE"
  })

  
  const handleInvite = async (e: any, contact: any) => {
    e.stopPropagation();
    if (!contact.email) {
      toast.error("Contact must have an email address to invite.");
      return;
    }
    setIsInviting(true);
    try {
      const res = await fetchApi<any>(`/crm/contacts/${contact.id}/invite`, { method: "POST", body: JSON.stringify({}) });
      if (res.alreadyExists) {
        toast.info("This user already has portal credentials.");
      } else {
        setInviteData(res.credentials);
        setIsInviteOpen(true);
        toast.success("Credentials generated successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate credentials");
    } finally {
      setIsInviting(false);
    }
  };

  
  const handleEditClick = (contact: any) => {
    setEditingContactId(contact.id);
    setFormData({
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      email: contact.email || "",
      phone: contact.phone || "",
      companyId: contact.companyId || "",
      tier: contact.tier || "BRONZE"
    });
    setIsAddOpen(true);
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        tier: formData.tier
      }
      if (formData.email) payload.email = formData.email
      if (formData.phone) payload.phone = formData.phone
      if (formData.companyId) payload.companyId = formData.companyId

      if (editingContactId) {
        await fetchApi(`/crm/contacts/${editingContactId}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        })
        toast.success("Contact updated successfully")
      } else {
        await fetchApi("/crm/contacts", {
          method: "POST",
          body: JSON.stringify(payload)
        })
        toast.success("Contact created successfully")
      }
      setIsAddOpen(false)
      setEditingContactId(null)
      setFormData({ firstName: "", lastName: "", email: "", phone: "", companyId: "", tier: "BRONZE" })
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to create contact")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredContacts = contacts.filter((contact: any) => {
    const fullName = `${contact?.firstName || ''} ${contact?.lastName || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) ||
    contact?.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      try {
        const res = await fetchApi<any>('/crm/contacts/import', {
          method: 'POST',
          body: JSON.stringify({ csvData: text })
        });
        toast.success(`Successfully imported ${res.count} contacts!`);
        mutate();
      } catch (err: any) {
        toast.error(err.message || 'Failed to import CSV');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 py-8 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Address Book</h1>
            <p className="text-sm text-white/50 mt-2">Manage all your client and lead contacts</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl transition-all">
              <Plus className="w-4 h-4 text-blue-400" /> Import CSV
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCsvImport}
              />
            </label>
            <button onClick={() => { setEditingContactId(null); setFormData({ firstName: "", lastName: "", email: "", phone: "", companyId: "", tier: "BRONZE" }); setIsAddOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              <Plus className="w-4 h-4" /> Add Contact
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..." 
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/30"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition-colors">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        {isLoading ? (
          <div className="text-center py-12 text-white/40">Loading contacts...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
            <UserCircle2 className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">No contacts found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredContacts.map((contact: any) => (
              <div key={contact.id} onClick={() => handleEditClick(contact)} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shrink-0 text-lg font-bold text-white">
                    {(contact.firstName || 'U').charAt(0)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleInvite(e, contact)}
                      disabled={isInviting || !contact.email}
                      className="p-1.5 rounded bg-white/5 hover:bg-white/20 text-white/50 hover:text-white transition-colors group/btn relative"
                      title="Generate Portal Credentials"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-mono tracking-widest uppercase bg-white/10 px-2 py-1 rounded text-white/60">
                      {contact.tier || 'BRONZE'}
                    </span>
                  </div>
                </div>
                
                <h3 className="font-bold text-lg text-white mb-1 truncate">{contact.firstName} {contact.lastName}</h3>
                <div className="flex items-center gap-1.5 text-sm text-white/50 mb-4 truncate">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{contact.company?.name || "Independent"}</span>
                </div>
                
                <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Mail className="w-3.5 h-3.5 text-white/40 shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <Phone className="w-3.5 h-3.5 text-white/40 shrink-0" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  {contact.location && (
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0" />
                      <span className="truncate">{contact.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SlideOver
        open={isAddOpen}
        onClose={() => { setIsAddOpen(false); setEditingContactId(null); }}
        title={editingContactId ? "Edit Contact" : "Add New Contact"}
        subtitle="Create a new lead or client in your CRM."
      >
        <form onSubmit={handleCreateContact} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">First Name *</label>
              <input 
                required
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/30"
                placeholder="e.g. John"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Last Name *</label>
              <input 
                required
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/30"
                placeholder="e.g. Doe"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/30"
              placeholder="e.g. john@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Phone</label>
            <input 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/30"
              placeholder="e.g. +1 234 567 8900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Tier</label>
            <select 
              value={formData.tier}
              onChange={e => setFormData({...formData, tier: e.target.value})}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white"
            >
              <option value="GOLD">Gold</option>
              <option value="SILVER">Silver</option>
              <option value="BRONZE">Bronze</option>
            </select>
          </div>
          
          <div className="pt-4 mt-6 border-t border-white/10">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : editingContactId ? "Update Contact" : "Save Contact"}
            </button>
          </div>
        </form>
      </SlideOver>

      {/* Invite Credentials Modal */}
      {isInviteOpen && inviteData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
            <h3 className="text-xl font-bold mb-2">Portal Credentials Generated</h3>
            <p className="text-white/60 text-sm mb-6">Please securely share these credentials with the client. They will not be shown again.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Email (Username)</label>
                <div className="mt-1 p-3 bg-black/40 border border-white/10 rounded-xl font-mono text-white select-all">{inviteData.email}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Temporary Password</label>
                <div className="mt-1 p-3 bg-black/40 border border-white/10 rounded-xl font-mono text-green-400 select-all">{inviteData.password}</div>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setIsInviteOpen(false);
                setInviteData(null);
              }}
              className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
