"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { 
  Users, TrendingUp, Target, Plus, 
  ArrowUpRight, Filter, IndianRupee, Globe,
  Search, BookOpen, GraduationCap, Calendar,
  MoreVertical, CheckCircle2, UserPlus, ClipboardList
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { KanbanBoard } from "./KanbanBoard"
import { AIAssistButton } from "@/components/ui/ai-assist-button"

export default function CRMDashboard() {
  const { data: session } = useSession()
  
  // API Fetch for Leads and Batches
  const { data: leadsData, mutate: mutateLeads, isLoading: leadsLoading } = useApi<any>('/crm/leads')
  const { data: batchesData } = useApi<any>('/academy/batches')
  
  const leads = leadsData?.data || []
  const batches = batchesData?.data || []

  // State
  const [activeTab, setActiveTab] = useState<'AGENCY' | 'ACADEMY'>('AGENCY')
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  
  // Modals
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<any>(null)
  
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [activityLead, setActivityLead] = useState<any>(null)
  const [activityType, setActivityType] = useState("CALL")
  const [activityContent, setActivityContent] = useState("")

  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false)
  const [convertLead, setConvertLead] = useState<any>(null)

  // Form Fields for Lead Creation / Edit
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "WEBSITE",
    estimatedBudget: "",
    projectType: "",
    notes: "",
    assignedToId: "",
    courseInterest: "",
    batchId: ""
  })

  // Form Fields for Student Conversion
  const [convertForm, setConvertForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    batchId: ""
  })

  // Calculations based on Active Tab
  const filteredLeads = leads.filter((lead: any) => {
    if (lead.businessUnit !== activeTab) return false
    
    // Status filter
    if (statusFilter !== "ALL" && lead.status !== statusFilter) return false
    
    // Search query
    const query = searchQuery.toLowerCase()
    return (
      lead.name.toLowerCase().includes(query) ||
      (lead.email || "").toLowerCase().includes(query) ||
      (lead.company || "").toLowerCase().includes(query) ||
      (lead.courseInterest || "").toLowerCase().includes(query)
    )
  })

  // Telemetry Calculations
  const agencyLeads = leads.filter((l: any) => l.businessUnit === 'AGENCY')
  const academyLeads = leads.filter((l: any) => l.businessUnit === 'ACADEMY')

  const totalContacts = activeTab === 'AGENCY' ? agencyLeads.length : academyLeads.length
  
  const pipelineValue = activeTab === 'AGENCY' 
    ? agencyLeads.reduce((sum: number, l: any) => sum + (l.estimatedBudget || 0), 0)
    : academyLeads.length * 15000 // Mock academy average value per lead (₹15,000)

  const conversionRate = (() => {
    const relevantLeads = activeTab === 'AGENCY' ? agencyLeads : academyLeads
    if (relevantLeads.length === 0) return 0
    const wonCount = relevantLeads.filter((l: any) => l.status === 'WON' || l.status === 'ENROLLED_ACADEMY').length
    return Math.round((wonCount / relevantLeads.length) * 100)
  })()

  // Actions
  const handleOpenCreateLead = () => {
    setEditingLead(null)
    setLeadForm({
      name: "",
      email: "",
      phone: "",
      company: "",
      source: "WEBSITE",
      estimatedBudget: "",
      projectType: "",
      notes: "",
      assignedToId: "",
      courseInterest: "",
      batchId: ""
    })
    setIsLeadModalOpen(true)
  }

  const handleOpenEditLead = (lead: any) => {
    setEditingLead(lead)
    setLeadForm({
      name: lead.name,
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "",
      source: lead.source,
      estimatedBudget: lead.estimatedBudget ? String(lead.estimatedBudget) : "",
      projectType: lead.projectType || "",
      notes: lead.notes || "",
      assignedToId: lead.assignedToId || "",
      courseInterest: lead.courseInterest || "",
      batchId: lead.batchId || ""
    })
    setIsLeadModalOpen(true)
  }

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload: any = {
        name: leadForm.name,
        email: leadForm.email || undefined,
        phone: leadForm.phone || undefined,
        source: leadForm.source,
        notes: leadForm.notes || undefined,
        assignedToId: leadForm.assignedToId || undefined,
        businessUnit: activeTab
      }

      if (activeTab === 'AGENCY') {
        payload.company = leadForm.company || undefined
        payload.estimatedBudget = leadForm.estimatedBudget ? parseFloat(leadForm.estimatedBudget) : undefined
        payload.projectType = leadForm.projectType || undefined
      } else {
        payload.courseInterest = leadForm.courseInterest || undefined
        payload.batchId = leadForm.batchId || undefined
      }

      if (editingLead) {
        await fetchApi(`/crm/leads/${editingLead.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        })
        toast.success("Lead updated successfully")
      } else {
        await fetchApi(`/crm/leads`, {
          method: "POST",
          body: JSON.stringify(payload)
        })
        toast.success("Lead created successfully")
      }

      setIsLeadModalOpen(false)
      mutateLeads()
    } catch (err: any) {
      toast.error(err.message || "Failed to save lead")
    }
  }

  const handleOpenActivityModal = (lead: any) => {
    setActivityLead(lead)
    setActivityType("CALL")
    setActivityContent("")
    setIsActivityModalOpen(true)
  }

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activityContent.trim()) return
    try {
      await fetchApi(`/crm/leads/${activityLead.id}/activities`, {
        method: "POST",
        body: JSON.stringify({
          type: activityType,
          content: activityContent
        })
      })
      toast.success("Activity logged successfully")
      setIsActivityModalOpen(false)
      mutateLeads()
    } catch (err: any) {
      toast.error(err.message || "Failed to log activity")
    }
  }

  const handleOpenConvertModal = (lead: any) => {
    setConvertLead(lead)
    
    // Split name to first and last name
    const parts = (lead.name || "").trim().split(/\s+/)
    const firstName = parts[0] || ""
    const lastName = parts.slice(1).join(" ") || "Prospect"

    setConvertForm({
      firstName,
      lastName,
      email: lead.email || "",
      phone: lead.phone || "",
      dateOfBirth: "",
      batchId: lead.batchId || ""
    })
    setIsConvertModalOpen(true)
  }

  const handleConvertStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // 1. Create student in the database
      const student = await fetchApi(`/academy/students`, {
        method: "POST",
        body: JSON.stringify({
          firstName: convertForm.firstName,
          lastName: convertForm.lastName,
          email: convertForm.email,
          phone: convertForm.phone || undefined,
          dateOfBirth: convertForm.dateOfBirth || undefined,
          batchId: convertForm.batchId || undefined,
          leadId: convertLead.id
        })
      })

      // 2. Mark the original lead status as ENROLLED_ACADEMY
      await fetchApi(`/crm/leads/${convertLead.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "ENROLLED_ACADEMY"
        })
      })

      toast.success("Lead successfully converted to Student!")
      setIsConvertModalOpen(false)
      mutateLeads()
    } catch (err: any) {
      toast.error(err.message || "Failed to convert lead to student")
    }
  }

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return
    try {
      await fetchApi(`/crm/leads/${id}`, { method: "DELETE" })
      toast.success("Lead deleted successfully")
      mutateLeads()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete lead")
    }
  }

  const handleQuickStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await fetchApi(`/crm/leads/${leadId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      })
      toast.success(`Status updated to ${newStatus}`)
      mutateLeads()
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    }
  }

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      try {
        const res = await fetchApi<any>('/crm/leads/import', {
          method: 'POST',
          body: JSON.stringify({
            csvData: text,
            businessUnit: activeTab
          })
        });
        toast.success(`Successfully imported ${res.count} leads!`);
        mutateLeads();
      } catch (err: any) {
        toast.error(err.message || 'Failed to import CSV');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar bg-transparent p-6 lg:p-10 space-y-10 text-[var(--dash-text-primary)] relative">
      
      {/* Background Ambience */}
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--dash-bg-card,rgba(255,255,255,0.05))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)] relative overflow-hidden">
            <Globe className="w-6 h-6 text-blue-400 relative z-10" />
            <div className="absolute inset-0 bg-blue-500/20 animate-pulse mix-blend-overlay" />
          </div>
          <div>
            <p className="text-[10px] font-mono tracking-widest uppercase font-bold text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)] mb-1">CRM Hub</p>
            <h1 className="text-3xl font-bold text-[var(--dash-text-primary)] tracking-tight leading-none">
              Lead Management
            </h1>
          </div>
        </div>

        {/* Business Unit Selector */}
        <div className="flex bg-[var(--dash-bg-elevated,rgba(0,0,0,0.4))] p-1 border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl">
          <button
            onClick={() => { setActiveTab('AGENCY'); setStatusFilter('ALL'); }}
            className={`px-5 py-2 text-xs font-mono font-bold tracking-widest uppercase rounded-lg transition-all ${
              activeTab === 'AGENCY' 
                ? 'bg-blue-600 text-[var(--dash-text-primary)] shadow-lg' 
                : 'text-[var(--dash-text-primary)]/60 hover:text-[var(--dash-text-primary)] hover:bg-[var(--dash-bg-card,rgba(255,255,255,0.05))]'
            }`}
          >
            Agency CRM
          </button>
          <button
            onClick={() => { setActiveTab('ACADEMY'); setStatusFilter('ALL'); }}
            className={`px-5 py-2 text-xs font-mono font-bold tracking-widest uppercase rounded-lg transition-all ${
              activeTab === 'ACADEMY' 
                ? 'bg-blue-600 text-[var(--dash-text-primary)] shadow-lg' 
                : 'text-[var(--dash-text-primary)]/60 hover:text-[var(--dash-text-primary)] hover:bg-[var(--dash-bg-card,rgba(255,255,255,0.05))]'
            }`}
          >
            Academy CRM
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <motion.div 
          layoutId="contacts-card"
          className="bg-[var(--dash-bg-card,rgba(255,255,255,0.05))] backdrop-blur-md border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-2xl p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase text-[var(--dash-text-primary)]/50">
              {activeTab === 'AGENCY' ? "Total Agency Leads" : "Total Enquiries"}
            </h3>
          </div>
          <div className="relative z-10">
            <span className="text-3xl md:text-4xl font-bold text-[var(--dash-text-primary)] tracking-tight truncate block">
              {leadsLoading ? "..." : totalContacts}
            </span>
            <p className="text-[10px] font-mono font-bold text-emerald-400 mt-2 flex items-center gap-1.5 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
              <ArrowUpRight className="w-3.5 h-3.5" /> Direct Database Feed
            </p>
          </div>
        </motion.div>

        <motion.div 
          layoutId="pipeline-card"
          className="bg-[var(--dash-bg-card,rgba(255,255,255,0.05))] backdrop-blur-md border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-2xl p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-colors" />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30 shadow-[inset_0_0_10px_rgba(139,92,246,0.2)]">
              {activeTab === 'AGENCY' ? (
                <IndianRupee className="w-5 h-5 text-violet-400" />
              ) : (
                <GraduationCap className="w-5 h-5 text-violet-400" />
              )}
            </div>
            <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase text-[var(--dash-text-primary)]/50">
              {activeTab === 'AGENCY' ? "Pipeline Value" : "Counselling Active"}
            </h3>
          </div>
          <div className="relative z-10">
            <span className="text-3xl md:text-4xl font-bold text-[var(--dash-text-primary)] tracking-tight truncate block">
              {leadsLoading ? "..." : activeTab === 'AGENCY' ? `₹${(pipelineValue / 100000).toFixed(1)}L` : academyLeads.filter((l: any) => l.status === 'COUNSELLING').length}
            </span>
            <p className="text-[10px] font-mono font-bold text-emerald-400 mt-2 flex items-center gap-1.5 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
              <ArrowUpRight className="w-3.5 h-3.5" /> Live Updates
            </p>
          </div>
        </motion.div>

        <motion.div 
          layoutId="conversion-card"
          className="bg-[var(--dash-bg-card,rgba(255,255,255,0.05))] backdrop-blur-md border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-2xl p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors" />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[inset_0_0_10px_rgba(16,185,129,0.2)]">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase text-[var(--dash-text-primary)]/50">
              {activeTab === 'AGENCY' ? "Lead Win Rate" : "Enrolled Students"}
            </h3>
          </div>
          <div className="relative z-10">
            <span className="text-3xl md:text-4xl font-bold text-[var(--dash-text-primary)] tracking-tight truncate block">
              {leadsLoading ? "..." : activeTab === 'AGENCY' ? `${conversionRate}%` : academyLeads.filter((l: any) => l.status === 'ENROLLED_ACADEMY').length}
            </span>
            <p className="text-[10px] font-mono font-bold text-emerald-400 mt-2 flex items-center gap-1.5 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
              <ArrowUpRight className="w-3.5 h-3.5" /> High conversion velocity
            </p>
          </div>
        </motion.div>
      </div>

      {/* Control Bar & Leads Table */}
      <div className="bg-[var(--dash-bg-card,rgba(255,255,255,0.05))] backdrop-blur-md border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-3xl p-8 space-y-6 relative z-10">
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--dash-text-primary)]/30" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'AGENCY' ? "Search leads, company..." : "Search students, course interest..."} 
                className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.4))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-[var(--dash-text-primary)] placeholder:text-[var(--dash-text-primary)]/30"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[var(--dash-bg-elevated,rgba(0,0,0,0.4))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2 text-sm text-[var(--dash-text-primary)] focus:outline-none focus:border-blue-500/50 cursor-pointer"
            >
              <option value="ALL">All Stages</option>
              {activeTab === 'AGENCY' ? (
                <>
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="PROPOSAL_SENT">Proposal Sent</option>
                  <option value="NEGOTIATION">Negotiation</option>
                  <option value="WON">Won (Converted)</option>
                  <option value="LOST">Lost</option>
                </>
              ) : (
                <>
                  <option value="ENQUIRY">Enquiry</option>
                  <option value="COUNSELLING">Counselling</option>
                  <option value="TRIAL">Trial Class</option>
                  <option value="ENROLLED_ACADEMY">Enrolled (Student)</option>
                  <option value="DROPPED">Dropped</option>
                </>
              )}
            </select>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <label className="cursor-pointer group flex items-center justify-center gap-2 bg-[var(--dash-bg-card,rgba(255,255,255,0.05))] hover:bg-white/10 text-[var(--dash-text-primary)] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] font-bold tracking-widest uppercase text-[10px] px-5 py-3 rounded-xl hover:scale-105 transition-all">
              <Plus className="w-4 h-4 text-blue-400" /> Import CSV
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCsvImport}
              />
            </label>
            <button 
              onClick={handleOpenCreateLead}
              className="group flex items-center justify-center gap-2 bg-white text-black font-bold tracking-widest uppercase text-[10px] px-5 py-3 rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] relative overflow-hidden"
            >
              <Plus className="w-4 h-4" /> New {activeTab === 'AGENCY' ? 'Agency Lead' : 'Academy Enquiry'}
            </button>
          </div>
        </div>

        {/* Kanban Board View */}
        {leadsLoading ? (
          <div className="flex justify-center py-20 relative z-10">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-3" />
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-20 text-[var(--dash-text-primary)]/40 font-mono text-xs uppercase border border-dashed border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-2xl">
            No lead nodes matches filters.
          </div>
        ) : (
          <KanbanBoard 
            leads={filteredLeads}
            activeTab={activeTab}
            onStatusChange={handleQuickStatusChange}
            onOpenLead={handleOpenEditLead}
            onLogActivity={handleOpenActivityModal}
          />
        )}
      </div>

      {/* CREATE / EDIT LEAD MODAL */}
      <AnimatePresence>
        {isLeadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--dash-bg-surface,#111)] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] flex justify-between items-center">
                <h3 className="font-bold text-lg text-[var(--dash-text-primary)]">
                  {editingLead ? "Edit Lead Details" : `Create new ${activeTab === 'AGENCY' ? 'Agency Lead' : 'Academy Enquiry'}`}
                </h3>
                <button 
                  onClick={() => setIsLeadModalOpen(false)}
                  className="text-[var(--dash-text-primary)]/40 hover:text-[var(--dash-text-primary)] transition-colors font-mono text-sm"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleSaveLead} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 mb-1">Contact Name *</label>
                    <input
                      required
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      placeholder="e.g. Sameer Malhotra"
                      className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      placeholder="sameer@example.com"
                      className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 mb-1">Phone Number</label>
                    <input
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 mb-1">Lead Source</label>
                    <select
                      value={leadForm.source}
                      onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                      className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)]"
                    >
                      <option value="WEBSITE">Website</option>
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="REFERRAL">Referral</option>
                      <option value="COLD_OUTREACH">Cold Outreach</option>
                      <option value="INSTAGRAM">Instagram</option>
                      <option value="LINKEDIN">LinkedIn</option>
                      <option value="ACADEMY_ALUMNI">Academy Alumni</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 mb-1">Staff Assiginee ID</label>
                    <input
                      value={leadForm.assignedToId}
                      onChange={(e) => setLeadForm({ ...leadForm, assignedToId: e.target.value })}
                      placeholder="e.g. cl01xyz..."
                      className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)]"
                    />
                  </div>
                </div>

                {activeTab === 'AGENCY' ? (
                  <div className="space-y-4 border-t border-white/5 pt-4">
                    <p className="text-[10px] font-mono uppercase text-blue-400 font-bold tracking-widest mb-2">Agency Parameters</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 mb-1">Company Name</label>
                        <input
                          value={leadForm.company}
                          onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                          placeholder="e.g. Acme Tech Inc."
                          className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 mb-1">Estimated Budget (INR)</label>
                        <input
                          type="number"
                          value={leadForm.estimatedBudget}
                          onChange={(e) => setLeadForm({ ...leadForm, estimatedBudget: e.target.value })}
                          placeholder="e.g. 150000"
                          className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)] font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 mb-1">Project Type Scope</label>
                        <input
                          value={leadForm.projectType}
                          onChange={(e) => setLeadForm({ ...leadForm, projectType: e.target.value })}
                          placeholder="e.g. UI/UX Redesign"
                          className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 border-t border-white/5 pt-4">
                    <p className="text-[10px] font-mono uppercase text-blue-400 font-bold tracking-widest mb-2">Academy Parameters</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 mb-1">Course Interest</label>
                        <input
                          value={leadForm.courseInterest}
                          onChange={(e) => setLeadForm({ ...leadForm, courseInterest: e.target.value })}
                          placeholder="e.g. UI/UX Masterclass"
                          className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)]"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 mb-1">Assign Batch</label>
                        <select
                          value={leadForm.batchId}
                          onChange={(e) => setLeadForm({ ...leadForm, batchId: e.target.value })}
                          className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)]"
                        >
                          <option value="">No Batch Assigned</option>
                          {batches.map((batch: any) => (
                            <option key={batch.id} value={batch.id}>
                              {batch.name} ({batch.course?.name || "LMS"})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50">Internal Notes</label>
                    <AIAssistButton 
                      format="text"
                      context="CRM Internal notes summarizer. Make it brief."
                      onGenerate={(text) => setLeadForm({ ...leadForm, notes: text })}
                      buttonLabel="AI Notes"
                    />
                  </div>
                  <textarea
                    value={leadForm.notes}
                    onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                    placeholder="Log important details, user expectations, availability details..."
                    rows={3}
                    className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)] resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsLeadModalOpen(false)}
                    className="px-5 py-2.5 bg-[var(--dash-bg-card,rgba(255,255,255,0.05))] hover:bg-white/10 border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-[var(--dash-text-primary)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-[var(--dash-text-primary)] shadow-lg transition-colors"
                  >
                    {editingLead ? "Apply Changes" : "Create Node"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOG ACTIVITY MODAL */}
      <AnimatePresence>
        {isActivityModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--dash-bg-surface,#111)] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] flex justify-between items-center">
                <h3 className="font-bold text-lg text-[var(--dash-text-primary)]">Log Activity for {activityLead?.name}</h3>
                <button 
                  onClick={() => setIsActivityModalOpen(false)}
                  className="text-[var(--dash-text-primary)]/40 hover:text-[var(--dash-text-primary)] transition-colors font-mono text-sm"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleSaveActivity} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 mb-1">Activity Type</label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)]"
                  >
                    <option value="CALL">Call</option>
                    <option value="EMAIL">Email</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="MEETING">Meeting</option>
                    <option value="NOTE">General Note</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50">Content Notes *</label>
                    <AIAssistButton 
                      format="text"
                      context="CRM Activity Notes. Summarize the event or action taken."
                      onGenerate={(text) => setActivityContent(text)}
                      buttonLabel="AI Summarize"
                    />
                  </div>
                  <textarea
                    required
                    value={activityContent}
                    onChange={(e) => setActivityContent(e.target.value)}
                    placeholder="Provide details about what happened during the activity..."
                    rows={4}
                    className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)] resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsActivityModalOpen(false)}
                    className="px-5 py-2.5 bg-[var(--dash-bg-card,rgba(255,255,255,0.05))] hover:bg-white/10 border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-[var(--dash-text-primary)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-[var(--dash-text-primary)] shadow-lg transition-colors"
                  >
                    Log Interaction
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONVERT TO STUDENT MODAL */}
      <AnimatePresence>
        {isConvertModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--dash-bg-surface,#111)] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] flex justify-between items-center bg-emerald-500/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-lg text-[var(--dash-text-primary)]">Enroll Student Profile</h3>
                </div>
                <button 
                  onClick={() => setIsConvertModalOpen(false)}
                  className="text-[var(--dash-text-primary)]/40 hover:text-[var(--dash-text-primary)] transition-colors font-mono text-sm"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleConvertStudent} className="p-6 space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-400/90 leading-relaxed">
                  This action will auto-create a user account for the student, map their enrollment in the selected batch, and link their student credentials back to Lead ID <strong>{convertLead?.id}</strong>.
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 mb-1">First Name *</label>
                    <input
                      required
                      value={convertForm.firstName}
                      onChange={(e) => setConvertForm({ ...convertForm, firstName: e.target.value })}
                      className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 mb-1">Last Name *</label>
                    <input
                      required
                      value={convertForm.lastName}
                      onChange={(e) => setConvertForm({ ...convertForm, lastName: e.target.value })}
                      className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 mb-1">Enrollment Email Address *</label>
                    <input
                      required
                      type="email"
                      value={convertForm.email}
                      onChange={(e) => setConvertForm({ ...convertForm, email: e.target.value })}
                      className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 mb-1">Contact Phone</label>
                    <input
                      value={convertForm.phone}
                      onChange={(e) => setConvertForm({ ...convertForm, phone: e.target.value })}
                      className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={convertForm.dateOfBirth}
                      onChange={(e) => setConvertForm({ ...convertForm, dateOfBirth: e.target.value })}
                      className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)] font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 mb-1">Enrolled Batch *</label>
                    <select
                      required
                      value={convertForm.batchId}
                      onChange={(e) => setConvertForm({ ...convertForm, batchId: e.target.value })}
                      className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)]"
                    >
                      <option value="">Select a batch...</option>
                      {batches.map((batch: any) => (
                        <option key={batch.id} value={batch.id}>
                          {batch.name} ({batch.course?.name || "LMS"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsConvertModalOpen(false)}
                    className="px-5 py-2.5 bg-[var(--dash-bg-card,rgba(255,255,255,0.05))] hover:bg-white/10 border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-[var(--dash-text-primary)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-[var(--dash-text-primary)] shadow-lg transition-colors"
                  >
                    Finalize Admission
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
