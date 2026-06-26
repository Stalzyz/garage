"use client"

import { useState } from "react"
import { Search, Plus, Filter, Mail, Phone, MapPin, Building2, UserCircle2 } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"

export default function ContactsPage() {
  const { data, mutate, isLoading } = useApi<any>("/crm/contacts")
  const contacts = data?.data || []

  const [searchQuery, setSearchQuery] = useState("")

  const filteredContacts = contacts.filter((contact: any) => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
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
              <div key={contact.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shrink-0 text-lg font-bold text-white">
                    {contact.name.charAt(0)}
                  </div>
                  <span className="text-[10px] font-mono tracking-widest uppercase bg-white/10 px-2 py-1 rounded text-white/60">
                    {contact.type}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg text-white mb-1 truncate">{contact.name}</h3>
                <div className="flex items-center gap-1.5 text-sm text-white/50 mb-4 truncate">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{contact.company || "Independent"}</span>
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
    </div>
  )
}
