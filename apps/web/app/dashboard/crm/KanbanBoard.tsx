"use client"

import React, { useMemo } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreVertical, Phone, Mail, Calendar, ClipboardList, IndianRupee, GraduationCap, CheckCircle2, XCircle } from 'lucide-react';

interface KanbanBoardProps {
  leads: any[];
  activeTab: 'AGENCY' | 'ACADEMY';
  onStatusChange: (leadId: string, newStatus: string) => void;
  onOpenLead: (lead: any) => void;
  onLogActivity: (lead: any) => void;
}

const AGENCY_COLUMNS = [
  { id: 'NEW', title: 'New Leads' },
  { id: 'CONTACTED', title: 'Contacted' },
  { id: 'QUALIFIED', title: 'Qualified' },
  { id: 'PROPOSAL_SENT', title: 'Proposal Sent' },
  { id: 'NEGOTIATION', title: 'Negotiation' },
  { id: 'WON', title: 'Won' },
  { id: 'LOST', title: 'Lost' }
];

const ACADEMY_COLUMNS = [
  { id: 'ENQUIRY', title: 'New Enquiry' },
  { id: 'COUNSELLING', title: 'Counselling' },
  { id: 'TRIAL', title: 'Trial Class' },
  { id: 'ENROLLED_ACADEMY', title: 'Enrolled' },
  { id: 'DROPPED', title: 'Dropped' }
];

// Individual Draggable Card
function LeadCard({ lead, onOpenLead, onLogActivity }: { lead: any, onOpenLead: any, onLogActivity: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: {
      type: 'Lead',
      lead
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-[#111] border ${isDragging ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] opacity-50' : 'border-white/10 hover:border-white/20'} rounded-xl p-4 cursor-grab active:cursor-grabbing mb-3`}
      {...attributes}
      {...listeners}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-sm text-white truncate pr-2">{lead.name}</h4>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          <span className="text-[10px] font-mono font-bold text-blue-400">{lead.score}</span>
        </div>
      </div>
      
      {lead.company && <p className="text-xs text-white/60 mb-2 truncate">{lead.company}</p>}
      
      {lead.businessUnit === 'AGENCY' && lead.estimatedBudget && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono mb-2">
          <IndianRupee className="w-3 h-3" /> {lead.estimatedBudget.toLocaleString()}
        </div>
      )}
      
      {lead.businessUnit === 'ACADEMY' && lead.courseInterest && (
        <div className="flex items-center gap-1.5 text-xs text-violet-400 font-mono mb-2">
          <GraduationCap className="w-3 h-3" /> <span className="truncate">{lead.courseInterest}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-3">
        <span className="text-[9px] font-mono tracking-widest uppercase bg-white/5 px-2 py-0.5 rounded text-white/50">{lead.source}</span>
        <div className="flex gap-2">
          <button 
            onPointerDown={(e) => { e.stopPropagation(); onLogActivity(lead); }}
            className="text-white/40 hover:text-white transition-colors"
          >
            <ClipboardList className="w-3.5 h-3.5" />
          </button>
          <button 
            onPointerDown={(e) => { e.stopPropagation(); onOpenLead(lead); }}
            className="text-white/40 hover:text-white transition-colors"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Column Container
function KanbanColumn({ id, title, leads, onOpenLead, onLogActivity }: { id: string, title: string, leads: any[], onOpenLead: any, onLogActivity: any }) {
  const { setNodeRef } = useSortable({
    id,
    data: { type: 'Column', id }
  });

  return (
    <div className="flex flex-col min-w-[280px] w-[280px] bg-black/40 border border-white/5 rounded-2xl h-full flex-shrink-0">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-bold text-xs font-mono tracking-widest uppercase text-white/70">{title}</h3>
        <span className="bg-white/10 text-white/50 text-[10px] px-2 py-0.5 rounded-full font-mono">{leads.length}</span>
      </div>
      <div ref={setNodeRef} className="p-3 flex-1 overflow-y-auto custom-scrollbar">
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} onOpenLead={onOpenLead} onLogActivity={onLogActivity} />
          ))}
        </SortableContext>
        {leads.length === 0 && (
          <div className="h-full min-h-[100px] border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-white/20 text-xs font-mono">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ leads, activeTab, onStatusChange, onOpenLead, onLogActivity }: KanbanBoardProps) {
  const columns = activeTab === 'AGENCY' ? AGENCY_COLUMNS : ACADEMY_COLUMNS;
  const [activeLead, setActiveLead] = React.useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columnIds = useMemo(() => columns.map(c => c.id), [columns]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const lead = leads.find(l => l.id === active.id);
    if (lead) setActiveLead(lead);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Check if dropping on a column
    const isOverColumn = columnIds.includes(overId as string);
    if (isOverColumn) {
      onStatusChange(activeId as string, overId as string);
      return;
    }

    // Check if dropping on another lead
    const overLead = leads.find(l => l.id === overId);
    if (overLead && overLead.status) {
      const activeLead = leads.find(l => l.id === activeId);
      if (activeLead && activeLead.status !== overLead.status) {
        onStatusChange(activeId as string, overLead.status);
      }
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-[600px] overflow-x-auto custom-scrollbar pb-4">
        {columns.map(col => {
          const colLeads = leads.filter(l => l.status === col.id);
          return (
            <KanbanColumn 
              key={col.id} 
              id={col.id} 
              title={col.title} 
              leads={colLeads} 
              onOpenLead={onOpenLead}
              onLogActivity={onLogActivity}
            />
          );
        })}
      </div>
      
      <DragOverlay>
        {activeLead ? (
          <div className="opacity-80 rotate-3 scale-105">
            <LeadCard lead={activeLead} onOpenLead={onOpenLead} onLogActivity={onLogActivity} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
