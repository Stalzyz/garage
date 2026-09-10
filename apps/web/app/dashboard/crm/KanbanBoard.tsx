"use client"

import React, { useMemo, useState, useEffect } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  useDroppable,
  DragStartEvent, 
  DragEndEvent 
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreVertical, Calendar, ClipboardList, GraduationCap, MessageCircle } from 'lucide-react';
import { useCurrency } from "@/hooks/useCurrency";

interface KanbanBoardProps {
  leads: any[];
  activeTab: 'AGENCY' | 'ACADEMY';
  onStatusChange: (leadId: string, newStatus: string) => void;
  onOpenLead: (lead: any) => void;
  onLogActivity: (lead: any) => void;
  onSchedule: (lead: any) => void;
  onWhatsapp?: (lead: any) => void;
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

// Individual Lead Card
function LeadCard({ lead, onOpenLead, onLogActivity, onSchedule, onWhatsapp }: { lead: any, onOpenLead: any, onLogActivity: any, onSchedule: any, onWhatsapp?: any }) {
  const { symbol } = useCurrency();
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

  // Calculate Lead Inactivity (Stale SLA)
  const lastActiveDate = new Date(lead.updatedAt || lead.createdAt || Date.now());
  const daysInactive = Math.floor((Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const isStale = daysInactive >= 3 && lead.status !== 'WON' && lead.status !== 'LOST' && lead.status !== 'DROPPED';
  const isHighRisk = daysInactive >= 7 && lead.status !== 'WON' && lead.status !== 'LOST' && lead.status !== 'DROPPED';

  // Calculate AI Intent / Action Badge
  const getAiBadge = () => {
    if (lead.status === 'WON') return { label: '🏆 Deal Won', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    if (lead.status === 'LOST' || lead.status === 'DROPPED') return { label: 'Closed', color: 'bg-white/5 text-white/40 border-white/10' };
    if (lead.score >= 80 || lead.status === 'NEGOTIATION') return { label: '⚡ High Intent', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    if (lead.status === 'PROPOSAL_SENT') return { label: '📄 Proposal Review', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    if (lead.status === 'QUALIFIED') return { label: '🎯 High Qualified', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
    if (isStale) return { label: '🟡 Follow-up Due', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    return { label: 'New Lead', color: 'bg-white/5 text-white/60 border-white/10' };
  };

  const aiBadge = getAiBadge();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-[var(--dash-bg-surface,#111)] border ${
        isDragging 
          ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] opacity-40 z-50' 
          : isHighRisk
          ? 'border-red-500/40 bg-red-950/10 hover:border-red-500/60'
          : isStale
          ? 'border-amber-500/30 hover:border-amber-500/50'
          : 'border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] hover:border-white/20'
      } rounded-xl p-4 cursor-grab active:cursor-grabbing mb-3 transition-all relative group touch-none select-none`}
      {...attributes}
      {...listeners}
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <h4 className="font-bold text-sm text-[var(--dash-text-primary)] truncate flex-1">{lead.name}</h4>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${aiBadge.color}`}>
            {aiBadge.label}
          </span>
          <div className="flex items-center gap-0.5 bg-black/40 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-blue-400 border border-white/10">
            {lead.score || 50}
          </div>
        </div>
      </div>
      
      {lead.company && <p className="text-xs text-[var(--dash-text-primary)]/60 mb-2 truncate">{lead.company}</p>}

      <div className="flex items-center justify-between gap-2 mb-2">
        {lead.businessUnit === 'AGENCY' && lead.estimatedBudget ? (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold">
            <span>{symbol}</span> {lead.estimatedBudget.toLocaleString()}
          </div>
        ) : lead.businessUnit === 'ACADEMY' && lead.courseInterest ? (
          <div className="flex items-center gap-1.5 text-xs text-violet-400 font-mono">
            <GraduationCap className="w-3.5 h-3.5" /> <span className="truncate">{lead.courseInterest}</span>
          </div>
        ) : <div />}

        {/* SLA Stale Warning Badge */}
        {isHighRisk ? (
          <span className="text-[9px] font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded animate-pulse">
            🔴 Inactive ({daysInactive}d)
          </span>
        ) : isStale ? (
          <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
            ⏳ Stale ({daysInactive}d)
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between mt-3 border-t border-white/5 pt-2.5">
        <span className="text-[9px] font-mono tracking-widest uppercase bg-[var(--dash-bg-card,rgba(255,255,255,0.05))] px-2 py-0.5 rounded text-[var(--dash-text-primary)]/50">{lead.source || 'DIRECT'}</span>
        <div className="flex gap-2.5 items-center">
          {lead.phone && (
            <button 
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                if (onWhatsapp) onWhatsapp(lead);
                else {
                  const cleanPhone = lead.phone.replace(/\D/g, '');
                  window.open(`https://wa.me/${cleanPhone}`, '_blank');
                }
              }}
              title="Send WhatsApp Message (Grafty Hub)"
              className="text-emerald-400/80 hover:text-emerald-400 hover:scale-110 transition-all p-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
          )}
          <button 
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onSchedule(lead); }}
            title="Schedule Meeting"
            className="text-blue-400/70 hover:text-blue-400 hover:scale-110 transition-all p-1"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onLogActivity(lead); }}
            title="Log Activity"
            className="text-[var(--dash-text-primary)]/40 hover:text-[var(--dash-text-primary)] hover:scale-110 transition-all p-1"
          >
            <ClipboardList className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onOpenLead(lead); }}
            title="View Details"
            className="text-[var(--dash-text-primary)]/40 hover:text-[var(--dash-text-primary)] hover:scale-110 transition-all p-1"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Droppable Column Container
function KanbanColumn({ id, title, leads, onOpenLead, onLogActivity, onSchedule, onWhatsapp }: { id: string, title: string, leads: any[], onOpenLead: any, onLogActivity: any, onSchedule: any, onWhatsapp?: any }) {
  const { symbol } = useCurrency();
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'Column', id }
  });

  const columnValue = leads.reduce((sum, l) => sum + (Number(l.estimatedBudget) || 0), 0);

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col min-w-[285px] w-[285px] bg-[var(--dash-bg-elevated,rgba(0,0,0,0.4))] border ${
        isOver ? 'border-blue-500/60 bg-blue-500/5 ring-1 ring-blue-500/30' : 'border-white/5'
      } rounded-2xl h-full flex-shrink-0 transition-all duration-150`}
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-xs font-mono tracking-widest uppercase text-[var(--dash-text-primary)]/70">{title}</h3>
          {columnValue > 0 && (
            <p className="text-[10px] font-mono text-emerald-400 font-bold mt-0.5">
              {symbol}{columnValue.toLocaleString('en-IN')}
            </p>
          )}
        </div>
        <span className="bg-white/10 text-[var(--dash-text-primary)]/50 text-[10px] px-2 py-0.5 rounded-full font-mono">{leads.length}</span>
      </div>
      
      <div className="p-3 flex-1 overflow-y-auto custom-scrollbar min-h-[150px]">
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <LeadCard 
              key={lead.id} 
              lead={lead} 
              onOpenLead={onOpenLead} 
              onLogActivity={onLogActivity} 
              onSchedule={onSchedule} 
              onWhatsapp={onWhatsapp} 
            />
          ))}
        </SortableContext>
        {leads.length === 0 && (
          <div className="h-32 border-2 border-dashed border-white/5 hover:border-blue-500/30 rounded-xl flex items-center justify-center text-[var(--dash-text-primary)]/20 text-xs font-mono transition-all">
            Drop lead here
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ leads, activeTab, onStatusChange, onOpenLead, onLogActivity, onSchedule, onWhatsapp }: KanbanBoardProps) {
  const columns = activeTab === 'AGENCY' ? AGENCY_COLUMNS : ACADEMY_COLUMNS;
  const [activeLead, setActiveLead] = useState<any>(null);
  const [localLeads, setLocalLeads] = useState<any[]>(leads);

  // Sync props leads to local state
  useEffect(() => {
    setLocalLeads(leads);
  }, [leads]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require dragging 8px before activation to prevent accidental clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columnIds = useMemo(() => columns.map(c => c.id), [columns]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const lead = localLeads.find(l => l.id === active.id);
    if (lead) setActiveLead(lead);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    let targetStatus: string | null = null;

    // Direct column target
    if (columnIds.includes(overId)) {
      targetStatus = overId;
    } else {
      // Over another lead target
      const overLead = localLeads.find(l => l.id === overId);
      if (overLead && overLead.status) {
        targetStatus = overLead.status;
      }
    }

    if (targetStatus) {
      const activeLeadObj = localLeads.find(l => l.id === activeId);
      if (activeLeadObj && activeLeadObj.status !== targetStatus) {
        // Optimistic UI Update immediately
        setLocalLeads(prev => prev.map(l => l.id === activeId ? { ...l, status: targetStatus, updatedAt: new Date().toISOString() } : l));
        // Call parent handler (API patch)
        onStatusChange(activeId, targetStatus);
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
      <div className="flex gap-4 h-[650px] overflow-x-auto custom-scrollbar pb-4">
        {columns.map(col => {
          const colLeads = localLeads.filter(l => l.status === col.id);
          return (
            <KanbanColumn 
              key={col.id} 
              id={col.id} 
              title={col.title} 
              leads={colLeads} 
              onOpenLead={onOpenLead}
              onLogActivity={onLogActivity}
              onSchedule={onSchedule}
              onWhatsapp={onWhatsapp}
            />
          );
        })}
      </div>
      
      <DragOverlay dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeLead ? (
          <div className="opacity-90 rotate-2 scale-105 pointer-events-none shadow-2xl">
            <LeadCard lead={activeLead} onOpenLead={onOpenLead} onLogActivity={onLogActivity} onSchedule={onSchedule} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

