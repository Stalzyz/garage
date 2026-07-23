"use client"

import { useState, useEffect } from "react"
import { 
  DndContext, 
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Search, Filter, Mail, Phone, Calendar, MoreHorizontal, X, Loader2 } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"

// Types
type ColumnType = 'ENQUIRY' | 'COUNSELLING' | 'TRIAL' | 'ENROLLED_ACADEMY' | 'DROPPED'

interface Lead {
  id: string
  name: string
  courseInterest?: string
  score: number
  updatedAt: string
  status: ColumnType
}

const columns: { id: ColumnType, title: string, color: string }[] = [
  { id: 'ENQUIRY', title: 'New Enquiry', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'COUNSELLING', title: 'In Counselling', color: 'bg-amber-500/20 text-amber-400' },
  { id: 'TRIAL', title: 'Free Trial', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'ENROLLED_ACADEMY', title: 'Enrolled', color: 'bg-emerald-500/20 text-emerald-400' },
  { id: 'DROPPED', title: 'Dropped', color: 'bg-red-500/20 text-red-400' },
]

// Droppable Column Wrapper
function KanbanColumn({ column, leads, onSelectLead }: { column: typeof columns[0], leads: Lead[], onSelectLead: (lead: Lead, tab?: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col w-80 shrink-0 border rounded-2xl overflow-hidden transition-colors ${
        isOver ? 'bg-purple-500/10 border-purple-500/40' : 'bg-white/[0.02] border-white/5'
      }`}
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wide ${column.color}`}>
            {column.title}
          </span>
          <span className="text-white/40 text-sm font-medium">{leads.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[150px]">
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <SortableLeadCard key={lead.id} lead={lead} onSelect={onSelectLead} />
          ))}
        </SortableContext>
        
        {leads.length === 0 && (
          <div className="h-full min-h-[100px] border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-white/20 text-sm">
            Drop leads here
          </div>
        )}
      </div>
    </div>
  )
}

// Sortable Item Component
function SortableLeadCard({ lead, onSelect }: { lead: Lead, onSelect: (lead: Lead, action?: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      onClick={() => onSelect(lead, "CALL")}
      className="bg-[#0a0a0a] border border-white/10 hover:border-white/20 p-4 rounded-xl cursor-grab active:cursor-grabbing group relative z-10"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-white text-sm">{lead.name}</h4>
        <button 
          className="text-white/30 hover:text-white transition-colors p-1" 
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onSelect(lead, "CALL"); }}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-white/50 mb-3">{lead.courseInterest || 'No Course Specified'}</p>
      
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            <button 
              className="w-7 h-7 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 transition-colors" 
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onSelect(lead, "CALL"); }}
            >
              <Phone className="w-3.5 h-3.5" />
            </button>
            <button 
              className="w-7 h-7 rounded-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 transition-colors" 
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onSelect(lead, "EMAIL"); }}
            >
              <Mail className="w-3.5 h-3.5" />
            </button>
            <button 
              className="w-7 h-7 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 transition-colors" 
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onSelect(lead, "MEETING"); }}
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">Score</span>
          <span className={`text-xs font-bold ${lead.score > 80 ? 'text-emerald-400' : lead.score > 50 ? 'text-amber-400' : 'text-red-400'}`}>
            {lead.score || 50}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function AdmissionsPipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newLead, setNewLead] = useState({ name: "", email: "", phone: "", courseInterest: "", source: "WEBSITE" })
  const { data: apiResponse, mutate } = useApi<any>("/crm/leads")

  const [selectedLead, setSelectedLead] = useState<any | null>(null)
  const [actionTab, setActionTab] = useState<"CALL" | "EMAIL" | "MEETING">("CALL")
  const [actionNote, setActionNote] = useState("")
  const [actionStatus, setActionStatus] = useState<ColumnType>("ENQUIRY")
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)

  const openLeadAction = (lead: Lead, action: string = "CALL") => {
    setSelectedLead(lead)
    setActionTab(action as any)
    setActionStatus(lead.status)
    setActionNote("")
  }

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLead) return
    setIsSubmittingAction(true)
    try {
      if (actionNote) {
        await fetchApi(`/crm/leads/${selectedLead.id}/activities`, {
          method: "POST",
          body: JSON.stringify({
            type: actionTab,
            content: `[${actionTab}] ${actionNote}`
          })
        })
      }
      if (actionStatus !== selectedLead.status) {
        await fetchApi(`/crm/leads/${selectedLead.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: actionStatus })
        })
      }
      toast.success("Lead activity updated!")
      setSelectedLead(null)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to record activity")
    } finally {
      setIsSubmittingAction(false)
    }
  }

  useEffect(() => {
    if (apiResponse?.data) {
      setLeads(apiResponse.data.map((l:any) => ({
        ...l, 
        // Ensure status falls into our columns, default to ENQUIRY
        status: columns.find(c => c.id === l.status) ? l.status : 'ENQUIRY'
      })))
    }
  }, [apiResponse])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) return

    const activeLead = leads.find(l => l.id === active.id)
    const overId = String(over.id)
    
    // Determine target column
    const overColumn = columns.find(c => c.id === overId)?.id || leads.find(l => l.id === overId)?.status

    if (activeLead && overColumn && activeLead.status !== overColumn) {
      // Optimistic Update
      setLeads(leads.map(lead => 
        lead.id === activeLead.id ? { ...lead, status: overColumn } : lead
      ))
      
      try {
        await fetchApi(`/crm/leads/${activeLead.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: overColumn })
        })
        mutate()
      } catch (err: any) {
        toast.error("Failed to move lead: " + err.message)
        mutate() // revert
      }
    }
  }

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi("/crm/leads", {
        method: "POST",
        body: JSON.stringify({
          ...newLead,
          businessUnit: "ACADEMY",
          status: "ENQUIRY"
        })
      })
      toast.success("Lead added successfully!")
      setIsSlideOverOpen(false)
      setNewLead({ name: "", email: "", phone: "", courseInterest: "", source: "WEBSITE" })
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to add lead")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden relative">
      
      {/* Header */}
      <header className="px-8 py-6 border-b border-white/10 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admissions Pipeline</h1>
            <p className="text-white/50 text-sm mt-1">Manage and track student leads across the enrollment lifecycle.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Search leads..." 
                className="w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
              />
            </div>
            <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
              <Filter className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsSlideOverOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Lead
            </button>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-8">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="flex h-full gap-6 min-w-max">
            
            {columns.map(column => {
              const columnLeads = leads.filter(l => l.status === column.id)
              return (
                <KanbanColumn 
                  key={column.id} 
                  column={column} 
                  leads={columnLeads} 
                  onSelectLead={openLeadAction} 
                />
              )
            })}

          </div>
        </DndContext>
      </div>

      {/* SlideOver for Add Lead */}
      {isSlideOverOpen && (
        <div className="absolute inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSlideOverOpen(false)} />
          <div className="w-[400px] bg-[#111] h-full border-l border-[#222] relative flex flex-col shadow-2xl z-10 animate-in slide-in-from-right">
            <div className="p-6 border-b border-[#222] flex items-center justify-between">
              <h2 className="text-lg font-bold">Add New Lead</h2>
              <button onClick={() => setIsSlideOverOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5 text-white/50" /></button>
            </div>
            
            <form onSubmit={handleAddLead} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70">Full Name</label>
                <input required value={newLead.name} onChange={e => setNewLead(p => ({...p, name: e.target.value}))} className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-purple-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70">Email Address (Optional)</label>
                <input type="email" value={newLead.email} onChange={e => setNewLead(p => ({...p, email: e.target.value}))} className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-purple-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70">Phone Number (Optional)</label>
                <input value={newLead.phone} onChange={e => setNewLead(p => ({...p, phone: e.target.value}))} className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-purple-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70">Course Interest</label>
                <input required value={newLead.courseInterest} onChange={e => setNewLead(p => ({...p, courseInterest: e.target.value}))} placeholder="e.g. Graphic Design Masterclass" className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-purple-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70">Source</label>
                <select value={newLead.source} onChange={e => setNewLead(p => ({...p, source: e.target.value}))} className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-purple-500 outline-none">
                  <option value="WEBSITE">Website</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="ACADEMY_ALUMNI">Alumni</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </form>

            <div className="p-6 border-t border-[#222] bg-[#111]">
              <button disabled={isSubmitting} onClick={handleAddLead} className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Lead"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Action Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111] border-l border-[#222] h-full flex flex-col p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right">
            <div className="flex items-center justify-between border-b border-[#222] pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedLead.name}</h3>
                <p className="text-xs text-white/50">{selectedLead.courseInterest || 'General Enquiry'}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5 text-white/50" /></button>
            </div>

            <div className="flex gap-2 border-b border-white/10 mb-6 pb-2">
              {(['CALL', 'EMAIL', 'MEETING'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActionTab(tab)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${
                    actionTab === tab ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                  }`}
                >
                  {tab === 'CALL' ? '📞 Call' : tab === 'EMAIL' ? '✉️ Email' : '📅 Schedule'}
                </button>
              ))}
            </div>

            <form onSubmit={handleLogActivity} className="space-y-4 flex-1">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70">Update Pipeline Status</label>
                <select
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value as any)}
                  className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:border-purple-500 outline-none"
                >
                  {columns.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70">
                  {actionTab === 'CALL' ? 'Call Notes / Disposition' : actionTab === 'EMAIL' ? 'Email Summary / Notes' : 'Counselling / Meeting Details'}
                </label>
                <textarea
                  rows={4}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Enter details..."
                  className="w-full bg-[#050505] border border-[#333] rounded-lg p-3 text-sm text-white focus:border-purple-500 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingAction}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-6"
              >
                {isSubmittingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save & Update Lead"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
