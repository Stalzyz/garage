"use client"

import { useState } from "react"
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
import { CSS } from '@dnd-kit/utilities'
import { Plus, Search, Filter, Mail, Phone, Calendar, MoreHorizontal } from "lucide-react"

// Types
type ColumnType = 'ENQUIRY' | 'COUNSELLING' | 'TRIAL' | 'ENROLLED' | 'DROPPED'

interface Lead {
  id: string
  name: string
  course: string
  score: number
  date: string
  column: ColumnType
}

// Initial Data
const initialLeads: Lead[] = [
  { id: 'lead-1', name: 'John Doe', course: 'UI/UX Masterclass', score: 85, date: 'Today, 10:00 AM', column: 'ENQUIRY' },
  { id: 'lead-2', name: 'Jane Smith', course: 'Advanced React', score: 92, date: 'Yesterday', column: 'COUNSELLING' },
  { id: 'lead-3', name: 'Mike Johnson', course: 'Next.js Enterprise', score: 65, date: '2 days ago', column: 'TRIAL' },
  { id: 'lead-4', name: 'Sarah Wilson', course: 'UI/UX Masterclass', score: 98, date: 'Last week', column: 'ENROLLED' },
  { id: 'lead-5', name: 'Tom Brown', course: 'Advanced React', score: 45, date: '1 month ago', column: 'DROPPED' },
  { id: 'lead-6', name: 'Emily Chen', course: 'UI/UX Masterclass', score: 78, date: 'Today, 2:30 PM', column: 'ENQUIRY' },
]

const columns: { id: ColumnType, title: string, color: string }[] = [
  { id: 'ENQUIRY', title: 'New Enquiry', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'COUNSELLING', title: 'In Counselling', color: 'bg-amber-500/20 text-amber-400' },
  { id: 'TRIAL', title: 'Free Trial', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'ENROLLED', title: 'Enrolled', color: 'bg-emerald-500/20 text-emerald-400' },
  { id: 'DROPPED', title: 'Dropped', color: 'bg-red-500/20 text-red-400' },
]

// Sortable Item Component
function SortableLeadCard({ lead }: { lead: Lead }) {
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
      className="bg-[#0a0a0a] border border-white/10 hover:border-white/20 p-4 rounded-xl cursor-grab active:cursor-grabbing group relative z-10"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-white text-sm">{lead.name}</h4>
        <button className="text-white/30 hover:text-white transition-colors" onPointerDown={(e) => e.stopPropagation()}>
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-white/50 mb-3">{lead.course}</p>
      
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            <button className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors" onPointerDown={(e) => e.stopPropagation()}>
              <Phone className="w-3 h-3" />
            </button>
            <button className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors" onPointerDown={(e) => e.stopPropagation()}>
              <Mail className="w-3 h-3" />
            </button>
            <button className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors" onPointerDown={(e) => e.stopPropagation()}>
              <Calendar className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">Score</span>
          <span className={`text-xs font-bold ${lead.score > 80 ? 'text-emerald-400' : lead.score > 50 ? 'text-amber-400' : 'text-red-400'}`}>
            {lead.score}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function AdmissionsPipelinePage() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) return

    const activeLead = leads.find(l => l.id === active.id)
    const overId = String(over.id)
    
    // Determine the target column. It can be a column ID or another lead's ID
    const overColumn = columns.find(c => c.id === overId)?.id || leads.find(l => l.id === overId)?.column

    if (activeLead && overColumn && activeLead.column !== overColumn) {
      setLeads(leads.map(lead => 
        lead.id === activeLead.id ? { ...lead, column: overColumn } : lead
      ))
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      
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
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
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
              const columnLeads = leads.filter(l => l.column === column.id)
              
              return (
                <div key={column.id} className="flex flex-col w-80 shrink-0 bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                  
                  {/* Column Header */}
                  <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wide ${column.color}`}>
                        {column.title}
                      </span>
                      <span className="text-white/40 text-sm font-medium">{columnLeads.length}</span>
                    </div>
                    <button className="text-white/30 hover:text-white transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Column Droppable Area */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    <SortableContext items={columnLeads.map(l => l.id)} strategy={verticalListSortingStrategy}>
                      {columnLeads.map(lead => (
                        <SortableLeadCard key={lead.id} lead={lead} />
                      ))}
                    </SortableContext>
                    
                    {/* Empty State Droppable Area (so you can drop into empty columns) */}
                    {columnLeads.length === 0 && (
                      <div className="h-full min-h-[100px] border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-white/20 text-sm">
                        Drop here
                      </div>
                    )}
                  </div>

                </div>
              )
            })}

          </div>
        </DndContext>
      </div>

    </div>
  )
}
