"use client"

import { useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { 
  Users, TrendingUp, Target, Plus, 
  ArrowUpRight, Filter, IndianRupee, Globe,
  Search, BookOpen, GraduationCap, Calendar,
  MoreVertical, CheckCircle2, UserPlus, ClipboardList, Coins,
  List, Kanban, Trash2, UserCheck, ChevronRight, ChevronDown, FileSpreadsheet, MessageCircle
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { KanbanBoard } from "./KanbanBoard"
import { AIAssistButton } from "@/components/ui/ai-assist-button"
import { useCurrency } from "@/hooks/useCurrency"

export default function CRMDashboard() {
  const { data: session } = useSession()
  const { symbol, formatCurrency } = useCurrency()
  
  // API Fetch for Leads, Batches, and Employees
  const { data: leadsData, mutate: mutateLeads, isLoading: leadsLoading } = useApi<any>('/crm/leads')
  const { data: batchesData } = useApi<any>('/academy/batches')
  const { data: employeesData } = useApi<any>('/hr/employees')
  
  const leads = leadsData?.data || []
  const batches = batchesData?.data || []
  const employees = employeesData?.employees || []

  // State
  const [activeTab, setActiveTab] = useState<'AGENCY' | 'ACADEMY'>('AGENCY')
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN')
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([])
  const [groupBy, setGroupBy] = useState<'NONE' | 'STATUS' | 'SOURCE' | 'ASSIGNEE'>('NONE')
  
  // Modals
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<any>(null)
  
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [activityLead, setActivityLead] = useState<any>(null)
  const [activityType, setActivityType] = useState("CALL")
  const [activityContent, setActivityContent] = useState("")
  const [selectedWhatsappTemplate, setSelectedWhatsappTemplate] = useState("NONE")
  
  // Meeting Setup in Log Activity
  const [meetingSummary, setMeetingSummary] = useState("")
  const [meetingTime, setMeetingTime] = useState("")

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [scheduleLead, setScheduleLead] = useState<any>(null)

  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false)
  const [convertLead, setConvertLead] = useState<any>(null)

  const [isKioskModalOpen, setIsKioskModalOpen] = useState(false)

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

  // Helper to map assignee ID to active staff name
  const getAssigneeName = (userId: string | null) => {
    if (!userId) return "Unassigned"
    const emp = employees.find((e: any) => e.userId === userId)
    if (emp && emp.user) {
      return `${emp.user.firstName} ${emp.user.lastName}`
    }
    return `ID: ${userId}`
  }

  // Dynamic Grouping Logic for List View
  const groupedLeads = useMemo(() => {
    if (groupBy === 'NONE') {
      return [{ key: 'All Leads', title: 'All Leads', list: filteredLeads }]
    }
    const groups: { [key: string]: any[] } = {}
    
    filteredLeads.forEach((lead: any) => {
      let groupKey = ""
      if (groupBy === 'STATUS') {
        groupKey = lead.status
      } else if (groupBy === 'SOURCE') {
        groupKey = lead.source
      } else if (groupBy === 'ASSIGNEE') {
        groupKey = lead.assignedToId || 'Unassigned'
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(lead)
    })

    return Object.keys(groups).map(key => {
      let title = key
      if (groupBy === 'STATUS') {
        title = key.replace(/_/g, ' ')
      } else if (groupBy === 'ASSIGNEE') {
        title = key === 'Unassigned' ? 'Unassigned' : getAssigneeName(key)
      }
      return {
        key,
        title,
        list: groups[key]
      }
    })
  }, [filteredLeads, groupBy, employees])

  // Bulk Actions
  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedLeadIds.length === 0) return
    try {
      await fetchApi('/crm/leads/bulk', {
        method: 'PATCH',
        body: JSON.stringify({
          ids: selectedLeadIds,
          status: newStatus
        })
      })
      toast.success(`Bulk updated status of ${selectedLeadIds.length} leads`)
      setSelectedLeadIds([])
      mutateLeads()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update leads status')
    }
  }

  const handleBulkAssign = async (staffId: string | null) => {
    if (selectedLeadIds.length === 0) return
    try {
      await fetchApi('/crm/leads/bulk', {
        method: 'PATCH',
        body: JSON.stringify({
          ids: selectedLeadIds,
          assignedToId: staffId || ""
        })
      })
      toast.success(`Bulk assigned ${selectedLeadIds.length} leads`)
      setSelectedLeadIds([])
      mutateLeads()
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign leads')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedLeadIds.length === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedLeadIds.length} leads?`)) return
    try {
      await fetchApi('/crm/leads/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({
          ids: selectedLeadIds
        })
      })
      toast.success(`Bulk deleted ${selectedLeadIds.length} leads`)
      setSelectedLeadIds([])
      mutateLeads()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete leads')
    }
  }

  const handleDeleteSingleLead = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete lead "${name}"? This action cannot be undone.`)) return
    try {
      await fetchApi(`/crm/leads/${id}`, {
        method: "DELETE"
      })
      toast.success(`Deleted lead: ${name}`)
      setIsLeadModalOpen(false)
      mutateLeads()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete lead")
    }
  }

  const handleDownloadSampleCsv = () => {
    const isAgency = activeTab === 'AGENCY'
    const csvContent = isAgency
      ? `name,email,phone,company,estimatedBudget,projectType,source,notes\nAcme Corp,contact@acme.com,+919876543210,Acme Industries,150000,WEBSITE,WEBSITE,Looking for a full website redesign\nStark Media,hello@starkmedia.com,+919812345678,Stark Media,300000,BRAND_IDENTITY,REFERRAL,Wants brand identity and logo guidelines`
      : `name,email,phone,courseInterest,source,notes\nRahul Sharma,rahul@gmail.com,+919876543210,Fullstack Web Development,WEBSITE,Interested in weekend batch\nPriya Patel,priya@gmail.com,+919812345678,UI/UX Design,REFERRAL,Enquired about course fees`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', isAgency ? 'agency_leads_sample.csv' : 'academy_enquiries_sample.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Sample CSV template downloaded!")
  }

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
    setSelectedWhatsappTemplate("NONE")
    setMeetingSummary(`Intro Call with ${lead.name}`)
    
    // Default to next hour
    const d = new Date()
    d.setHours(d.getHours() + 1)
    d.setMinutes(0)
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
    setMeetingTime(localISOTime)
    
    setIsActivityModalOpen(true)
  }

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activityContent.trim()) return
    try {
      
      if (activityType === "MEETING") {
        if (!meetingTime || !meetingSummary || !activityLead.email) {
          toast.error("Lead must have an email, and meeting details must be filled.")
          return
        }
        const start = new Date(meetingTime)
        const end = new Date(start.getTime() + 30 * 60 * 1000) // default 30 mins
        await fetchApi('/crm/calendar/invite', {
          method: 'POST',
          body: JSON.stringify({
            leadId: activityLead.id,
            summary: meetingSummary,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            attendeeEmail: activityLead.email,
          })
        });
        toast.success("Google Calendar invite sent to prospect!")
      }

      await fetchApi(`/crm/leads/${activityLead.id}/activities`, {
        method: "POST",
        body: JSON.stringify({
          type: activityType,
          content: activityContent,
          whatsappTemplate: activityType === "CALL" ? selectedWhatsappTemplate : undefined
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
            onClick={() => { setActiveTab('AGENCY'); setStatusFilter('ALL'); setSelectedLeadIds([]); }}
            className={`px-5 py-2 text-xs font-mono font-bold tracking-widest uppercase rounded-lg transition-all ${
              activeTab === 'AGENCY' 
                ? 'bg-blue-600 text-[var(--dash-text-primary)] shadow-lg' 
                : 'text-[var(--dash-text-primary)]/60 hover:text-[var(--dash-text-primary)] hover:bg-[var(--dash-bg-card,rgba(255,255,255,0.05))]'
            }`}
          >
            Agency CRM
          </button>
          <button
            onClick={() => { setActiveTab('ACADEMY'); setStatusFilter('ALL'); setSelectedLeadIds([]); }}
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
                symbol === "₹" ? (
                  <IndianRupee className="w-5 h-5 text-violet-400" />
                ) : (
                  <Coins className="w-5 h-5 text-violet-400" />
                )
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
              {leadsLoading ? "..." : activeTab === 'AGENCY' ? (symbol === "₹" ? `₹${(pipelineValue / 100000).toFixed(1)}L` : formatCurrency(pipelineValue, true)) : academyLeads.filter((l: any) => l.status === 'COUNSELLING').length}
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
            <button
              type="button"
              onClick={handleDownloadSampleCsv}
              className="flex items-center justify-center gap-1.5 bg-[var(--dash-bg-card,rgba(255,255,255,0.05))] hover:bg-white/10 text-[var(--dash-text-primary)] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] font-bold tracking-widest uppercase text-[10px] px-4 py-3 rounded-xl hover:scale-105 transition-all"
              title="Download sample template CSV for importing leads"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Sample CSV
            </button>
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
              onClick={() => setIsKioskModalOpen(true)}
              className="group flex items-center justify-center gap-2 bg-[var(--dash-bg-card,rgba(255,255,255,0.05))] hover:bg-white/10 text-[var(--dash-text-primary)] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] font-bold tracking-widest uppercase text-[10px] px-5 py-3 rounded-xl hover:scale-105 transition-all"
            >
              <Target className="w-4 h-4 text-emerald-400" /> Kiosk QR
            </button>
            <button 
              onClick={handleOpenCreateLead}
              className="group flex items-center justify-center gap-2 bg-white text-black font-bold tracking-widest uppercase text-[10px] px-5 py-3 rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] relative overflow-hidden"
            >
              <Plus className="w-4 h-4" /> New {activeTab === 'AGENCY' ? 'Agency Lead' : 'Academy Enquiry'}
            </button>
          </div>
        </div>

        {/* View Mode & Grouping Controls */}
        <div className="flex flex-wrap items-center justify-between border-t border-white/5 pt-4 gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setViewMode('KANBAN'); setSelectedLeadIds([]); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase transition-all ${
                viewMode === 'KANBAN'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-white/40 hover:text-white/70 border border-transparent'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => { setViewMode('LIST'); setSelectedLeadIds([]); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase transition-all ${
                viewMode === 'LIST'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-white/40 hover:text-white/70 border border-transparent'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List View
            </button>
          </div>

          {viewMode === 'LIST' && (
            <div className="flex items-center gap-3">
              <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/45">Group By</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as any)}
                className="bg-[var(--dash-bg-elevated,rgba(0,0,0,0.4))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-3 py-1.5 text-xs text-[var(--dash-text-primary)] focus:outline-none focus:border-blue-500/50 cursor-pointer"
              >
                <option value="NONE">None</option>
                <option value="STATUS">Stage</option>
                <option value="SOURCE">Source</option>
                <option value="ASSIGNEE">Staff Assignee</option>
              </select>
            </div>
          )}
        </div>

        {/* Dynamic CRM View */}
        {leadsLoading ? (
          <div className="flex justify-center py-20 relative z-10">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-3" />
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-20 text-[var(--dash-text-primary)]/40 font-mono text-xs uppercase border border-dashed border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-2xl">
            No lead nodes matches filters.
          </div>
        ) : viewMode === 'KANBAN' ? (
          <KanbanBoard 
            leads={filteredLeads}
            activeTab={activeTab}
            onStatusChange={handleQuickStatusChange}
            onOpenLead={handleOpenEditLead}
            onLogActivity={handleOpenActivityModal}
            onSchedule={(lead: any) => { 
              handleOpenActivityModal(lead);
              setActivityType("MEETING");
            }}
          />
        ) : (
          <div className="space-y-8 relative z-10 overflow-x-auto">
            {groupedLeads.map((group) => (
              <div key={group.key} className="space-y-3">
                {groupBy !== 'NONE' && (
                  <div className="flex items-center gap-2 px-1 text-xs font-mono font-bold tracking-widest uppercase text-blue-400 border-b border-white/5 pb-2">
                    <ChevronDown className="w-4 h-4" />
                    <span>{group.title}</span>
                    <span className="text-[10px] bg-white/10 text-white/50 px-2 py-0.5 rounded-full font-mono font-normal">
                      {group.list.length}
                    </span>
                  </div>
                )}
                
                <div className="w-full border border-white/5 rounded-2xl overflow-hidden bg-white/[0.01] backdrop-blur-md">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="p-4 w-12 text-center">
                          <input 
                            type="checkbox"
                            checked={group.list.length > 0 && group.list.every((l: any) => selectedLeadIds.includes(l.id))}
                            onChange={(e) => {
                              const leadIds = group.list.map((l: any) => l.id);
                              if (e.target.checked) {
                                setSelectedLeadIds(prev => Array.from(new Set([...prev, ...leadIds])));
                              } else {
                                setSelectedLeadIds(prev => prev.filter(id => !leadIds.includes(id)));
                              }
                            }}
                            className="rounded border-white/10 bg-transparent text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                        </th>
                        <th className="p-4 text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50">Lead Name</th>
                        <th className="p-4 text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50">
                          {activeTab === 'AGENCY' ? 'Company Name' : 'Course Interest'}
                        </th>
                        <th className="p-4 text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50">Contact Info</th>
                        <th className="p-4 text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50">Stage</th>
                        <th className="p-4 text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50">Assignee</th>
                        <th className="p-4 text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50">Source</th>
                        <th className="p-4 text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 text-center">Score</th>
                        <th className="p-4 text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50">Created Date</th>
                        <th className="p-4 text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {group.list.map((lead: any) => {
                        const isSelected = selectedLeadIds.includes(lead.id);
                        return (
                          <tr 
                            key={lead.id} 
                            className={`hover:bg-white/[0.03] transition-colors ${isSelected ? 'bg-blue-600/5' : ''}`}
                          >
                            <td className="p-4 text-center">
                              <input 
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedLeadIds(prev => [...prev, lead.id]);
                                  } else {
                                    setSelectedLeadIds(prev => prev.filter(id => id !== lead.id));
                                  }
                                }}
                                className="rounded border-white/10 bg-transparent text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                              />
                            </td>
                            <td className="p-4 font-semibold text-sm">
                              <span>{lead.name}</span>
                            </td>
                            <td className="p-4 text-sm text-[var(--dash-text-primary)]/60">
                              {activeTab === 'AGENCY' ? (
                                lead.company || <span className="text-white/20">—</span>
                              ) : (
                                lead.courseInterest || <span className="text-white/20">—</span>
                              )}
                            </td>
                            <td className="p-4 text-xs font-mono space-y-0.5">
                              {lead.email && <div className="text-[var(--dash-text-primary)]/60">{lead.email}</div>}
                              {lead.phone && <div className="text-[var(--dash-text-primary)]/40">{lead.phone}</div>}
                              {!lead.email && !lead.phone && <span className="text-white/20">—</span>}
                            </td>
                            <td className="p-4">
                              <span className="text-[10px] font-mono tracking-widest uppercase bg-white/5 border border-white/10 px-2 py-1 rounded text-white/70">
                                {lead.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="p-4 text-sm font-medium">
                              <span className={lead.assignedToId ? 'text-white/80' : 'text-white/20 font-normal italic'}>
                                {getAssigneeName(lead.assignedToId)}
                              </span>
                            </td>
                            <td className="p-4 text-xs font-mono uppercase text-white/50">
                              {lead.source}
                            </td>
                            <td className="p-4 text-center font-bold font-mono text-xs text-blue-400">
                              {lead.score}
                            </td>
                            <td className="p-4 text-xs text-[var(--dash-text-primary)]/40 font-mono">
                              {new Date(lead.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex gap-2 justify-end">
                                {lead.phone && (
                                  <button
                                    onClick={() => {
                                      const cleanPhone = lead.phone.replace(/\D/g, '');
                                      window.open(`https://grafty.pro/dashboard/chat?phone=${cleanPhone}`, '_blank');
                                    }}
                                    className="text-emerald-400/70 hover:text-emerald-400 transition-colors p-1.5 hover:bg-emerald-500/10 rounded-lg"
                                    title="Open Grafty WhatsApp Chat"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleOpenActivityModal(lead)}
                                  className="text-[var(--dash-text-primary)]/40 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-lg"
                                  title="Log Activity"
                                >
                                  <ClipboardList className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => { 
                                    handleOpenActivityModal(lead);
                                    setActivityType("MEETING");
                                  }}
                                  className="text-blue-400/70 hover:text-blue-400 transition-colors p-1.5 hover:bg-blue-500/10 rounded-lg"
                                  title="Schedule Meeting"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleOpenEditLead(lead)}
                                  className="text-[var(--dash-text-primary)]/40 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-lg"
                                  title="Edit Lead"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteSingleLead(lead.id, lead.name)}
                                  className="text-red-400/50 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg"
                                  title="Delete Lead"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT LEAD MODAL */}
      <AnimatePresence>
        {isLeadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-[var(--dash-bg-surface,#111)] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-t-[2rem] md:rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl mt-auto md:mt-0"
            >
              <div className="px-6 py-4 border-b border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] flex justify-between items-center">
                <h3 className="font-bold text-lg text-[var(--dash-text-primary)]">
                  {editingLead ? "Edit Lead Details" : `Create new ${activeTab === 'AGENCY' ? 'Agency Lead' : 'Academy Enquiry'}`}
                </h3>
                <button 
                  onClick={() => setIsLeadModalOpen(false)}
                  className="text-[var(--dash-text-primary)]/40 hover:text-[var(--dash-text-primary)] transition-colors font-mono text-sm"
                >
                   Close
                </button>
              </div>

              <form onSubmit={handleSaveLead} className="p-6 pb-0 space-y-4 max-h-[85vh] md:max-h-[75vh] overflow-y-auto custom-scrollbar relative">
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
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 mb-1">Assign to Telecaller / Staff</label>
                    <select
                      value={leadForm.assignedToId}
                      onChange={(e) => setLeadForm({ ...leadForm, assignedToId: e.target.value })}
                      className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)] cursor-pointer"
                    >
                      <option value="">Unassigned</option>
                      {employees.map((emp: any) => (
                        <option key={emp.userId} value={emp.userId}>
                          {emp.user ? `${emp.user.firstName} ${emp.user.lastName} (${emp.jobTitle})` : emp.employeeCode}
                        </option>
                      ))}
                    </select>
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

                <div className="pt-4 pb-8 md:pb-6 px-6 -mx-6 border-t border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] flex justify-between items-center sticky bottom-0 bg-[var(--dash-bg-surface,#111)] z-10 mt-6 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.5)] md:shadow-none">
                  {editingLead ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteSingleLead(editingLead.id, editingLead.name)}
                      className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Lead
                    </button>
                  ) : <div />}
                  <div className="flex gap-3">
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
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOG ACTIVITY MODAL */}
      <AnimatePresence>
        {isActivityModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-[var(--dash-bg-surface,#111)] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-t-[2rem] md:rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl mt-auto md:mt-0"
            >
              <div className="px-6 py-4 border-b border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] flex justify-between items-center">
                <h3 className="font-bold text-lg text-[var(--dash-text-primary)]">Log Activity for {activityLead?.name}</h3>
                <button 
                  onClick={() => setIsActivityModalOpen(false)}
                  className="text-[var(--dash-text-primary)]/40 hover:text-[var(--dash-text-primary)] transition-colors font-mono text-sm"
                >
                   Close
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

                {activityType === "CALL" && (
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 mb-1">WhatsApp Follow-Up Template</label>
                    <select
                      value={selectedWhatsappTemplate}
                      onChange={(e) => setSelectedWhatsappTemplate(e.target.value)}
                      className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)]"
                    >
                      <option value="NONE">Default Follow-Up (lead_post_call_followup)</option>
                      <option value="trial_class_invitation">Trial Class Invitation (trial_class_invitation)</option>
                      <option value="lead_instant_acknowledgement">Course Brochure & Info (lead_instant_acknowledgement)</option>
                      <option value="SKIP">Skip / Don't Send WhatsApp Message</option>
                    </select>
                  </div>
                )}

                {activityType === "MEETING" && (
                  <div className="space-y-4 bg-blue-500/5 p-4 rounded-xl border border-blue-500/20 mt-4">
                    <h4 className="text-[10px] font-bold text-blue-400 font-mono tracking-widest uppercase flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Google Meet Auto-Schedule
                    </h4>
                    
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 mb-1">Event Title</label>
                      <input 
                        type="text" 
                        value={meetingSummary} 
                        onChange={e => setMeetingSummary(e.target.value)} 
                        className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)]"
                        placeholder="e.g. Intro Call"
                        required={activityType === "MEETING"}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--dash-text-primary)]/50 mb-1">Date & Time</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--dash-text-primary)]/40" />
                        <input 
                          type="datetime-local" 
                          value={meetingTime} 
                          onChange={e => setMeetingTime(e.target.value)} 
                          className="w-full bg-[var(--dash-bg-elevated,rgba(0,0,0,0.6))] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-[var(--dash-text-primary)] [color-scheme:dark]"
                          required={activityType === "MEETING"}
                        />
                      </div>
                    </div>
                  </div>
                )}

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

                <div className="pt-4 pb-8 md:pb-6 px-6 -mx-6 border-t border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] flex justify-end gap-3 sticky bottom-0 bg-[var(--dash-bg-surface,#111)] z-10 mt-6 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.5)] md:shadow-none">
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
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-[var(--dash-bg-surface,#111)] border border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] rounded-t-[2rem] md:rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl mt-auto md:mt-0"
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
                   Close
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

                <div className="pt-4 pb-8 md:pb-6 px-6 -mx-6 border-t border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] flex justify-end gap-3 sticky bottom-0 bg-[var(--dash-bg-surface,#111)] z-10 mt-6 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.5)] md:shadow-none">
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
    {/* Kiosk QR Modal */}
    {isKioskModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-[#0f0f13] border border-white/10 rounded-2xl w-full max-w-sm p-8 flex flex-col items-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none" />
          
          <h2 className="text-xl font-bold text-white mb-2 relative z-10 text-center">Kiosk Walk-in QR</h2>
          <p className="text-xs text-white/50 text-center mb-8 relative z-10">
            Customers can scan this code to quickly submit their details via the contact form.
          </p>
          
          <div className="p-4 bg-white rounded-xl mb-8 relative z-10">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL || 'https://garage.grekam.in')}/contact`}
              alt="Kiosk QR Code" 
              className="w-48 h-48"
            />
          </div>
          
          <button 
            onClick={() => setIsKioskModalOpen(false)}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold tracking-widest uppercase text-xs py-3 rounded-xl transition-all relative z-10"
          >
            Close
          </button>
        </div>
      </div>
    )}

    {/* BULK ACTIONS FLOATING TOOLBAR */}
    <AnimatePresence>
      {selectedLeadIds.length > 0 && (
        <motion.div 
          initial={{ y: 100, x: "-50%", opacity: 0 }}
          animate={{ y: 0, x: "-50%", opacity: 1 }}
          exit={{ y: 100, x: "-50%", opacity: 0 }}
          className="fixed bottom-6 left-1/2 bg-[#0f0f13] border border-white/10 rounded-2xl px-6 py-4 shadow-2xl flex flex-col sm:flex-row items-center gap-4 z-40 max-w-[95vw] w-max"
        >
          <div className="text-xs font-mono text-white/80">
            <span className="text-blue-400 font-bold font-mono mr-1">{selectedLeadIds.length}</span> leads selected
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select 
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkStatusChange(e.target.value);
                  e.target.value = "";
                }
              }}
              className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="">Move to Stage...</option>
              {activeTab === 'AGENCY' ? (
                <>
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="PROPOSAL_SENT">Proposal Sent</option>
                  <option value="NEGOTIATION">Negotiation</option>
                  <option value="WON">Won</option>
                  <option value="LOST">Lost</option>
                </>
              ) : (
                <>
                  <option value="ENQUIRY">Enquiry</option>
                  <option value="COUNSELLING">Counselling</option>
                  <option value="TRIAL">Trial Class</option>
                  <option value="ENROLLED_ACADEMY">Enrolled</option>
                  <option value="DROPPED">Dropped</option>
                </>
              )}
            </select>

            <select 
              onChange={(e) => {
                if (e.target.value !== undefined) {
                  handleBulkAssign(e.target.value === "UNASSIGNED" ? null : e.target.value);
                  e.target.value = "";
                }
              }}
              className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="">Assign to Staff...</option>
              <option value="UNASSIGNED">Unassigned</option>
              {employees.map((emp: any) => (
                <option key={emp.userId} value={emp.userId}>
                  {emp.user ? `${emp.user.firstName} ${emp.user.lastName}` : emp.employeeCode}
                </option>
              ))}
            </select>

            <button 
              onClick={handleBulkDelete}
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-xl px-3 py-1.5 text-xs text-red-400 font-bold transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>

            <button 
              onClick={() => setSelectedLeadIds([])}
              className="text-xs text-white/50 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

  </div>
)
}
