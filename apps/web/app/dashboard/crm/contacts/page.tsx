"use client"

import { useState, useMemo } from "react"
import { 
  Search, 
  Plus, 
  Filter, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  UserCircle2, 
  Key, 
  RefreshCcw, 
  Trash2, 
  Briefcase, 
  FileText, 
  Globe, 
  CheckCircle2, 
  Edit3, 
  ShieldCheck, 
  Sparkles,
  Users,
  LayoutGrid,
  List as ListIcon,
  ExternalLink,
  PlusCircle
} from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { SlideOver } from "@/components/SlideOver"

export const GST_STATE_CODES: { [key: string]: string } = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra & Nagar Haveli and Daman & Diu',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
  '97': 'Other Territory',
  '99': 'Centre Jurisdiction / Overseas',
};

export default function ContactsAndCompaniesPage() {
  const [activeTab, setActiveTab] = useState<'contacts' | 'companies'>('contacts')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  
  const { data: contactsData, mutate: mutateContacts, isLoading: loadingContacts } = useApi<any>("/crm/contacts")
  const { data: companiesData, mutate: mutateCompanies, isLoading: loadingCompanies } = useApi<any>("/crm/companies")
  
  const contacts = Array.isArray(contactsData) ? contactsData : contactsData?.data || []
  const companies = Array.isArray(companiesData) ? companiesData : companiesData?.data || []

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("")

  // Contact Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [editingContactId, setEditingContactId] = useState<string | null>(null)
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    whatsapp: "",
    companyId: "",
    newCompanyName: "",
    tier: "BRONZE",
    pan: "",
    billingAddress: "",
    city: "",
    state: "Tamil Nadu",
    stateCode: "33",
    pinCode: "",
  })

  // Company Modal State
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null)
  const [isSubmittingCompany, setIsSubmittingCompany] = useState(false)
  const [companyForm, setCompanyForm] = useState({
    name: "",
    legalName: "",
    tradeName: "",
    gstin: "",
    pan: "",
    placeOfSupply: "Tamil Nadu (33)",
    stateCode: "33",
    gstType: "REGULAR",
    billingAddress: "",
    shippingAddress: "",
    city: "",
    state: "Tamil Nadu",
    pinCode: "",
    rcmApplicable: false,
    website: "",
    industry: "",
    size: "1-10",
  })

  // Auto-parse GSTIN in Company Form
  const handleGstinChange = (val: string) => {
    const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15)
    let autoPan = companyForm.pan
    let autoStateCode = companyForm.stateCode
    let autoPlaceOfSupply = companyForm.placeOfSupply
    let autoState = companyForm.state

    if (clean.length >= 2) {
      const code = clean.substring(0, 2)
      if (GST_STATE_CODES[code]) {
        autoStateCode = code
        autoState = GST_STATE_CODES[code]
        autoPlaceOfSupply = `${GST_STATE_CODES[code]} (${code})`
      }
    }
    if (clean.length >= 12) {
      autoPan = clean.substring(2, 12)
    }

    setCompanyForm({
      ...companyForm,
      gstin: clean,
      pan: autoPan,
      stateCode: autoStateCode,
      placeOfSupply: autoPlaceOfSupply,
      state: autoState,
    })
  }

  // ── Contact Handlers ──
  const handleOpenNewContact = () => {
    setEditingContactId(null)
    setContactForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      whatsapp: "",
      companyId: "",
      newCompanyName: "",
      tier: "BRONZE",
      pan: "",
      billingAddress: "",
      city: "",
      state: "Tamil Nadu",
      stateCode: "33",
      pinCode: "",
    })
    setIsContactModalOpen(true)
  }

  const handleEditContact = (c: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setEditingContactId(c.id)
    setContactForm({
      firstName: c.firstName || "",
      lastName: c.lastName || "",
      email: c.email || "",
      phone: c.phone || "",
      whatsapp: c.whatsapp || "",
      companyId: c.companyId || "",
      newCompanyName: "",
      tier: c.tier || "BRONZE",
      pan: c.pan || "",
      billingAddress: c.billingAddress || "",
      city: c.city || "",
      state: c.state || "Tamil Nadu",
      stateCode: c.stateCode || "33",
      pinCode: c.pinCode || "",
    })
    setIsContactModalOpen(true)
  }

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingContact(true)
    try {
      const payload: any = {
        firstName: contactForm.firstName,
        lastName: contactForm.lastName,
        tier: contactForm.tier,
      }
      if (contactForm.email) payload.email = contactForm.email
      if (contactForm.phone) payload.phone = contactForm.phone
      if (contactForm.whatsapp) payload.whatsapp = contactForm.whatsapp
      if (contactForm.pan) payload.pan = contactForm.pan
      if (contactForm.billingAddress) payload.billingAddress = contactForm.billingAddress
      if (contactForm.city) payload.city = contactForm.city
      if (contactForm.state) payload.state = contactForm.state
      if (contactForm.stateCode) payload.stateCode = contactForm.stateCode
      if (contactForm.pinCode) payload.pinCode = contactForm.pinCode

      if (contactForm.companyId && contactForm.companyId !== 'NEW') {
        payload.companyId = contactForm.companyId
      }
      if (contactForm.newCompanyName) {
        payload.newCompanyName = contactForm.newCompanyName
      }

      if (editingContactId) {
        await fetchApi(`/crm/contacts/${editingContactId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
        toast.success("Contact updated successfully!")
      } else {
        await fetchApi("/crm/contacts", {
          method: "POST",
          body: JSON.stringify(payload),
        })
        toast.success("Contact created successfully!")
      }

      mutateContacts()
      mutateCompanies()
      setIsContactModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to save contact")
    } finally {
      setIsSubmittingContact(false)
    }
  }

  const handleDeleteContact = async (e: React.MouseEvent, c: any) => {
    e.stopPropagation()
    if (!confirm(`Are you sure you want to delete ${c.firstName} ${c.lastName}?`)) return
    try {
      await fetchApi(`/crm/contacts/${c.id}`, { method: "DELETE" })
      toast.success("Contact deleted")
      mutateContacts()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete contact")
    }
  }

  // ── Company Handlers ──
  const handleOpenNewCompany = () => {
    setEditingCompanyId(null)
    setCompanyForm({
      name: "",
      legalName: "",
      tradeName: "",
      gstin: "",
      pan: "",
      placeOfSupply: "Tamil Nadu (33)",
      stateCode: "33",
      gstType: "REGULAR",
      billingAddress: "",
      shippingAddress: "",
      city: "",
      state: "Tamil Nadu",
      pinCode: "",
      rcmApplicable: false,
      website: "",
      industry: "",
      size: "1-10",
    })
    setIsCompanyModalOpen(true)
  }

  const handleEditCompany = (comp: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setEditingCompanyId(comp.id)
    setCompanyForm({
      name: comp.name || "",
      legalName: comp.legalName || comp.name || "",
      tradeName: comp.tradeName || "",
      gstin: comp.gstin || "",
      pan: comp.pan || "",
      placeOfSupply: comp.placeOfSupply || "Tamil Nadu (33)",
      stateCode: comp.stateCode || "33",
      gstType: comp.gstType || "REGULAR",
      billingAddress: comp.billingAddress || "",
      shippingAddress: comp.shippingAddress || "",
      city: comp.city || "",
      state: comp.state || "Tamil Nadu",
      pinCode: comp.pinCode || "",
      rcmApplicable: comp.rcmApplicable ?? false,
      website: comp.website || "",
      industry: comp.industry || "",
      size: comp.size || "1-10",
    })
    setIsCompanyModalOpen(true)
  }

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyForm.name) {
      toast.error("Company Name is required")
      return
    }
    setIsSubmittingCompany(true)
    try {
      const payload: any = {
        name: companyForm.name,
        legalName: companyForm.legalName || companyForm.name,
        tradeName: companyForm.tradeName || null,
        gstin: companyForm.gstin || null,
        pan: companyForm.pan || null,
        placeOfSupply: companyForm.placeOfSupply || null,
        stateCode: companyForm.stateCode || null,
        gstType: companyForm.gstType || "REGULAR",
        billingAddress: companyForm.billingAddress || null,
        shippingAddress: companyForm.shippingAddress || null,
        city: companyForm.city || null,
        state: companyForm.state || null,
        pinCode: companyForm.pinCode || null,
        rcmApplicable: companyForm.rcmApplicable,
        website: companyForm.website || null,
        industry: companyForm.industry || null,
        size: companyForm.size || "1-10",
      }

      if (editingCompanyId) {
        await fetchApi(`/crm/companies/${editingCompanyId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
        toast.success("Company profile & GST particulars updated!")
      } else {
        await fetchApi("/crm/companies", {
          method: "POST",
          body: JSON.stringify(payload),
        })
        toast.success("Company created successfully!")
      }

      mutateCompanies()
      setIsCompanyModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to save company")
    } finally {
      setIsSubmittingCompany(false)
    }
  }

  const handleDeleteCompany = async (e: React.MouseEvent, comp: any) => {
    e.stopPropagation()
    if (!confirm(`Are you sure you want to delete ${comp.name}? All associated records may be affected.`)) return
    try {
      await fetchApi(`/crm/companies/${comp.id}`, { method: "DELETE" })
      toast.success("Company deleted")
      mutateCompanies()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete company")
    }
  }

  // Filtered lists
  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts
    const q = searchQuery.toLowerCase()
    return contacts.filter((c: any) => 
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.company?.name && c.company.name.toLowerCase().includes(q))
    )
  }, [contacts, searchQuery])

  const filteredCompanies = useMemo(() => {
    if (!searchQuery) return companies
    const q = searchQuery.toLowerCase()
    return companies.filter((comp: any) => 
      comp.name.toLowerCase().includes(q) ||
      (comp.gstin && comp.gstin.toLowerCase().includes(q)) ||
      (comp.pan && comp.pan.toLowerCase().includes(q)) ||
      (comp.city && comp.city.toLowerCase().includes(q))
    )
  }, [companies, searchQuery])

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex-none px-8 py-6 border-b border-white/10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            CRM & Client GST Registry
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Manage individual client contacts and B2B corporate entities with compliant GST & tax particulars.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleOpenNewContact}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>

          <button
            onClick={handleOpenNewCompany}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          >
            <Building2 className="w-4 h-4" />
            Add Company & GST
          </button>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex-none px-8 py-4 border-b border-white/5 bg-black/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Tab Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'contacts' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
              }`}
            >
              <UserCircle2 className="w-4 h-4" /> Contacts ({contacts.length})
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'companies' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" /> Companies & GST ({companies.length})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
              title="Table View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder={activeTab === 'contacts' ? "Search contacts by name, email, company..." : "Search companies by name, GSTIN, PAN, city..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {/* ── TAB 1: CONTACTS ── */}
        {activeTab === 'contacts' && (
          <div>
            {filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 bg-[#0b0f19] border border-white/10 rounded-3xl text-center max-w-lg mx-auto mt-8">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                  <UserCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No Contacts Found</h3>
                <p className="text-xs text-white/50 mb-6">Create your first contact to manage individual client profiles and invoicing particulars.</p>
                <button
                  onClick={handleOpenNewContact}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Add First Contact
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContacts.map((contact: any) => (
                  <div
                    key={contact.id}
                    className="bg-[#0b0f19] border border-white/10 hover:border-blue-500/50 rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black">
                            {contact.firstName?.[0] || 'C'}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-sm">
                              {contact.firstName} {contact.lastName}
                            </h3>
                            <p className="text-xs text-white/50 flex items-center gap-1.5 mt-0.5">
                              <Building2 className="w-3 h-3 text-white/30" />
                              {contact.company?.name || "Independent Client"}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[10px] font-mono rounded-md text-white/60">
                          {contact.tier || 'BRONZE'}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-white/70 bg-white/[0.02] border border-white/5 rounded-xl p-3 my-3">
                        {contact.email && (
                          <p className="flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" /> {contact.email}
                          </p>
                        )}
                        {contact.phone && (
                          <p className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {contact.phone}
                          </p>
                        )}
                        {contact.pan && (
                          <p className="flex items-center gap-2 font-mono text-[11px] text-indigo-300">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> PAN: {contact.pan}
                          </p>
                        )}
                        {contact.city && (
                          <p className="flex items-center gap-2 text-white/50 text-[11px]">
                            <MapPin className="w-3.5 h-3.5 shrink-0" /> {contact.city}, {contact.state || 'India'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-white/40">
                      <button
                        type="button"
                        onClick={(e) => handleEditContact(contact, e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold rounded-lg transition-colors text-xs border border-blue-500/20"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Contact
                      </button>
                      
                      <button
                        type="button"
                        onClick={(e) => handleDeleteContact(e, contact)}
                        className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Table View for Contacts */
              <div className="bg-[#0b0f19] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 border-b border-white/10 text-white/60 font-mono uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Contact Info</th>
                      <th className="px-6 py-4">Company</th>
                      <th className="px-6 py-4">PAN / Tax ID</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredContacts.map((c: any) => (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-bold text-white">
                          {c.firstName} {c.lastName}
                        </td>
                        <td className="px-6 py-4 text-white/70">
                          <div>{c.email || "—"}</div>
                          <div className="text-white/40 text-[11px] mt-0.5">{c.phone || "—"}</div>
                        </td>
                        <td className="px-6 py-4 text-white/70">
                          {c.company?.name || <span className="text-white/30 italic">Individual</span>}
                        </td>
                        <td className="px-6 py-4 font-mono text-indigo-300">
                          {c.pan || "—"}
                        </td>
                        <td className="px-6 py-4 text-white/60">
                          {c.city ? `${c.city}, ${c.stateCode || ''}` : "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => handleEditContact(c, e)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold rounded-lg text-[11px] border border-blue-500/20 transition-colors"
                            >
                              <Edit3 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={(e) => handleDeleteContact(e, c)}
                              className="p-1 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: COMPANIES & GST PROFILES ── */}
        {activeTab === 'companies' && (
          <div>
            {filteredCompanies.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 bg-[#0b0f19] border border-white/10 rounded-3xl text-center max-w-lg mx-auto mt-8">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No Companies Registered</h3>
                <p className="text-xs text-white/50 mb-6">Add your corporate B2B clients with registered GSTIN, Place of Supply, and legal particulars.</p>
                <button
                  onClick={handleOpenNewCompany}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg"
                >
                  <Building2 className="w-4 h-4" />
                  Add First Company & GST
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map((comp: any) => (
                  <div
                    key={comp.id}
                    className="bg-[#0b0f19] border border-blue-500/20 hover:border-blue-500/60 rounded-2xl p-6 shadow-xl transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">
                              {comp.name}
                            </h3>
                            {comp.legalName && comp.legalName !== comp.name && (
                              <p className="text-[11px] text-white/40 italic">{comp.legalName}</p>
                            )}
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-bold rounded-lg uppercase">
                          {comp.gstType || 'REGULAR'}
                        </span>
                      </div>

                      {/* GST Badge Box */}
                      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3.5 space-y-2 my-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/50 font-mono text-[10px] uppercase">GSTIN</span>
                          <span className="font-mono font-bold text-blue-300">
                            {comp.gstin || <span className="text-white/20 font-normal italic">Unregistered</span>}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/50 font-mono text-[10px] uppercase">PAN</span>
                          <span className="font-mono text-emerald-300">
                            {comp.pan || <span className="text-white/20 font-normal italic">—</span>}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/50 font-mono text-[10px] uppercase">Place of Supply</span>
                          <span className="text-white/80 truncate max-w-[150px]">
                            {comp.placeOfSupply || `${comp.state || 'Tamil Nadu'} (${comp.stateCode || '33'})`}
                          </span>
                        </div>

                        {comp.billingAddress && (
                          <div className="pt-2 border-t border-white/5 text-[11px] text-white/50 flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-white/30 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{comp.billingAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-white/40">
                      <button
                        type="button"
                        onClick={(e) => handleEditCompany(comp, e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-bold rounded-lg transition-colors text-xs border border-indigo-500/20"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Company & GST
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteCompany(e, comp)}
                        className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Company"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Table View for Companies */
              <div className="bg-[#0b0f19] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 border-b border-white/10 text-white/60 font-mono uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Company</th>
                      <th className="px-6 py-4">GSTIN</th>
                      <th className="px-6 py-4">PAN</th>
                      <th className="px-6 py-4">GST Type</th>
                      <th className="px-6 py-4">Place of Supply</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredCompanies.map((comp: any) => (
                      <tr key={comp.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{comp.name}</div>
                          {comp.legalName && comp.legalName !== comp.name && (
                            <div className="text-[10px] text-white/40 italic">{comp.legalName}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-blue-300">
                          {comp.gstin || "—"}
                        </td>
                        <td className="px-6 py-4 font-mono text-emerald-300">
                          {comp.pan || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono rounded">
                            {comp.gstType || 'REGULAR'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/80">
                          {comp.placeOfSupply || `${comp.state || ''} (${comp.stateCode || ''})`}
                        </td>
                        <td className="px-6 py-4 text-white/60">
                          {comp.city || "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => handleEditCompany(comp, e)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-bold rounded-lg text-[11px] border border-indigo-500/20 transition-colors"
                            >
                              <Edit3 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={(e) => handleDeleteCompany(e, comp)}
                              className="p-1 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL 1: ADD/EDIT CONTACT ── */}
      <SlideOver
        open={isContactModalOpen}
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title={editingContactId ? "Edit Contact Details" : "Add New Contact"}
        description="Configure contact profile, linked B2B company, and GST/Tax particulars."
      >
        <form onSubmit={handleSaveContact} className="space-y-6 pb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-white/70 block mb-1.5">First Name *</label>
              <input
                type="text"
                required
                value={contactForm.firstName}
                onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="Rahul"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-white/70 block mb-1.5">Last Name *</label>
              <input
                type="text"
                required
                value={contactForm.lastName}
                onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="Sharma"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-white/70 block mb-1.5">Email Address</label>
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="rahul@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-white/70 block mb-1.5">Phone / WhatsApp</label>
              <input
                type="text"
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value, whatsapp: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="+91 98400 12345"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-white/70">Associated Company (B2B Client)</label>
              <button
                type="button"
                onClick={() => {
                  setIsContactModalOpen(false)
                  handleOpenNewCompany()
                }}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
              >
                <PlusCircle className="w-3 h-3" /> Create New Company
              </button>
            </div>
            <select
              value={contactForm.companyId}
              onChange={(e) => setContactForm({ ...contactForm, companyId: e.target.value })}
              className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">No Company (Individual / B2C Client)</option>
              {companies.map((comp: any) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name} {comp.gstin ? `(GST: ${comp.gstin})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Individual GST / Tax Particulars */}
          <div className="p-4 bg-white/[0.02] border border-white/10 rounded-2xl space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> B2C Invoicing & Address Particulars
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-white/60 block mb-1">Individual PAN (Optional)</label>
                <input
                  type="text"
                  value={contactForm.pan}
                  onChange={(e) => setContactForm({ ...contactForm, pan: e.target.value.toUpperCase() })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  placeholder="ABCPS1234E"
                />
              </div>
              <div>
                <label className="text-[11px] text-white/60 block mb-1">State & Place of Supply</label>
                <select
                  value={contactForm.stateCode}
                  onChange={(e) => {
                    const code = e.target.value
                    setContactForm({ ...contactForm, stateCode: code, state: GST_STATE_CODES[code] || 'Tamil Nadu' })
                  }}
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {Object.entries(GST_STATE_CODES).map(([code, name]) => (
                    <option key={code} value={code}>{name} ({code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-white/60 block mb-1">Billing Address</label>
              <textarea
                rows={2}
                value={contactForm.billingAddress}
                onChange={(e) => setContactForm({ ...contactForm, billingAddress: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Door No, Street, Area"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-white/60 block mb-1">City</label>
                <input
                  type="text"
                  value={contactForm.city}
                  onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="Chennai"
                />
              </div>
              <div>
                <label className="text-[11px] text-white/60 block mb-1">PIN Code</label>
                <input
                  type="text"
                  value={contactForm.pinCode}
                  onChange={(e) => setContactForm({ ...contactForm, pinCode: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  placeholder="600002"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsContactModalOpen(false)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all text-xs border border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingContact}
              className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 text-xs"
            >
              {isSubmittingContact ? "Saving..." : editingContactId ? "Save Changes" : "Create Contact"}
            </button>
          </div>
        </form>
      </SlideOver>

      {/* ── MODAL 2: ADD/EDIT COMPANY & GST ── */}
      <SlideOver
        open={isCompanyModalOpen}
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        title={editingCompanyId ? "Edit Company & GST Profile" : "Add B2B Company & GST"}
        description="Legal business name, 15-digit GSTIN, Place of Supply, and registered billing particulars."
      >
        <form onSubmit={handleSaveCompany} className="space-y-6 pb-8">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-white/70 block mb-1.5">Company Display Name *</label>
              <input
                type="text"
                required
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. Apex Studio"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-white/70 block mb-1.5">Legal Business Name (on GST)</label>
                <input
                  type="text"
                  value={companyForm.legalName}
                  onChange={(e) => setCompanyForm({ ...companyForm, legalName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="Apex Technologies Pvt Ltd"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-white/70 block mb-1.5">Trade Name (Brand)</label>
                <input
                  type="text"
                  value={companyForm.tradeName}
                  onChange={(e) => setCompanyForm({ ...companyForm, tradeName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="Apex Studio"
                />
              </div>
            </div>
          </div>

          {/* GSTIN & PAN Auto-Derivation Box */}
          <div className="p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> GSTIN & Tax Particulars
              </h4>
              <span className="text-[10px] text-blue-300 font-mono">Auto-extracts PAN & State</span>
            </div>

            <div>
              <label className="text-[11px] text-white/70 block mb-1 font-bold">
                15-Digit GSTIN (Goods & Services Tax ID)
              </label>
              <input
                type="text"
                maxLength={15}
                value={companyForm.gstin}
                onChange={(e) => handleGstinChange(e.target.value)}
                className="w-full bg-black/60 border border-blue-500/30 rounded-xl px-3 py-2 text-sm font-mono tracking-widest text-blue-200 focus:outline-none focus:border-blue-400"
                placeholder="33AABCG1234F1Z5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-white/60 block mb-1">PAN Number (10 chars)</label>
                <input
                  type="text"
                  maxLength={10}
                  value={companyForm.pan}
                  onChange={(e) => setCompanyForm({ ...companyForm, pan: e.target.value.toUpperCase() })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:border-blue-500"
                  placeholder="AABCG1234F"
                />
              </div>
              <div>
                <label className="text-[11px] text-white/60 block mb-1">GST Registration Type</label>
                <select
                  value={companyForm.gstType}
                  onChange={(e) => setCompanyForm({ ...companyForm, gstType: e.target.value })}
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="REGULAR">Regular (B2B Taxable)</option>
                  <option value="COMPOSITION">Composition Scheme</option>
                  <option value="SEZ">SEZ Unit / Developer (Zero-rated)</option>
                  <option value="OVERSEAS">Overseas Client (Export / LUT)</option>
                  <option value="UNREGISTERED">Unregistered Entity</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-white/60 block mb-1">Place of Supply (State Code)</label>
              <select
                value={companyForm.stateCode}
                onChange={(e) => {
                  const code = e.target.value
                  const stateName = GST_STATE_CODES[code] || 'Tamil Nadu'
                  setCompanyForm({
                    ...companyForm,
                    stateCode: code,
                    state: stateName,
                    placeOfSupply: `${stateName} (${code})`,
                  })
                }}
                className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {Object.entries(GST_STATE_CODES).map(([code, name]) => (
                  <option key={code} value={code}>{name} ({code})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Registered Addresses */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white/60">
              Registered Billing Address
            </h4>

            <div>
              <label className="text-[11px] text-white/50 block mb-1">Street Address</label>
              <textarea
                rows={2}
                value={companyForm.billingAddress}
                onChange={(e) => setCompanyForm({ ...companyForm, billingAddress: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                placeholder="42 Tech Park Road, Industrial Area"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-white/50 block mb-1">City</label>
                <input
                  type="text"
                  value={companyForm.city}
                  onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="Bangalore"
                />
              </div>
              <div>
                <label className="text-[11px] text-white/50 block mb-1">PIN Code</label>
                <input
                  type="text"
                  value={companyForm.pinCode}
                  onChange={(e) => setCompanyForm({ ...companyForm, pinCode: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  placeholder="560001"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-white/50 block mb-1">Website URL</label>
                <input
                  type="text"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://apex.com"
                />
              </div>
              <div>
                <label className="text-[11px] text-white/50 block mb-1">Industry</label>
                <input
                  type="text"
                  value={companyForm.industry}
                  onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="IT Services / SaaS"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCompanyModalOpen(false)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all text-xs border border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingCompany}
              className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50 text-xs"
            >
              {isSubmittingCompany ? "Saving Company..." : editingCompanyId ? "Save Changes" : "Create Company"}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}
