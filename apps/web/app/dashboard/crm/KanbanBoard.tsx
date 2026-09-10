"use client"

import React, { useState, useEffect } from 'react';
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

// Single Lead Card Component with Native Drag Handlers
function LeadCard({
  lead,
  isDragged,
  onOpenLead,
  onLogActivity,
  onSchedule,
  onWhatsapp,
  onDragStart,
  onDragEnd,
}: {
  lead: any;
  isDragged: boolean;
  onOpenLead: (lead: any) => void;
  onLogActivity: (lead: any) => void;
  onSchedule: (lead: any) => void;
  onWhatsapp?: (lead: any) => void;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onDragEnd: () => void;
}) {
  const { symbol } = useCurrency();

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
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onDragEnd={onDragEnd}
      onClick={() => onOpenLead(lead)}
      className={`bg-[var(--dash-bg-surface,#111)] border rounded-xl p-4 cursor-grab active:cursor-grabbing mb-3 transition-all relative group select-none ${
        isDragged
          ? 'opacity-40 scale-95 border-dashed border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
          : isHighRisk
          ? 'border-red-500/40 bg-red-950/10 hover:border-red-500/60'
          : isStale
          ? 'border-amber-500/30 hover:border-amber-500/50'
          : 'border-[var(--dash-border-subtle,rgba(255,255,255,0.1))] hover:border-blue-500/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:-translate-y-0.5'
      }`}
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <h4 className="font-bold text-sm text-[var(--dash-text-primary)] truncate flex-1 group-hover:text-blue-400 transition-colors">
          {lead.name}
        </h4>
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
        <span className="text-[9px] font-mono tracking-widest uppercase bg-[var(--dash-bg-card,rgba(255,255,255,0.05))] px-2 py-0.5 rounded text-[var(--dash-text-primary)]/50">
          {lead.source || 'DIRECT'}
        </span>
        <div className="flex gap-2.5 items-center">
          {lead.phone && (
            <button 
              type="button"
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
            onClick={(e) => { e.stopPropagation(); onSchedule(lead); }}
            title="Schedule Meeting"
            className="text-blue-400/70 hover:text-blue-400 hover:scale-110 transition-all p-1"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onLogActivity(lead); }}
            title="Log Activity"
            className="text-[var(--dash-text-primary)]/40 hover:text-[var(--dash-text-primary)] hover:scale-110 transition-all p-1"
          >
            <ClipboardList className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
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

export function KanbanBoard({ 
  leads, 
  activeTab, 
  onStatusChange, 
  onOpenLead, 
  onLogActivity, 
  onSchedule, 
  onWhatsapp 
}: KanbanBoardProps) {
  const columns = activeTab === 'AGENCY' ? AGENCY_COLUMNS : ACADEMY_COLUMNS;
  const { symbol } = useCurrency();

  const [localLeads, setLocalLeads] = useState<any[]>(leads);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Sync props leads to local state
  useEffect(() => {
    setLocalLeads(leads);
  }, [leads]);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    if (!draggedLeadId) return;

    const lead = localLeads.find((l) => l.id === draggedLeadId);
    if (lead && lead.status !== targetStatus) {
      // Optimistic UI update immediately
      setLocalLeads((prev) =>
        prev.map((l) =>
          l.id === draggedLeadId
            ? { ...l, status: targetStatus, updatedAt: new Date().toISOString() }
            : l
        )
      );
      // Trigger API status update
      onStatusChange(draggedLeadId, targetStatus);
    }

    setDraggedLeadId(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="flex gap-4 h-[650px] overflow-x-auto custom-scrollbar pb-4 items-start">
      {columns.map((col) => {
        const colLeads = localLeads.filter((l) => l.status === col.id);
        const columnValue = colLeads.reduce((sum, l) => sum + (Number(l.estimatedBudget) || 0), 0);
        const isColumnHovered = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragLeave={() => setDragOverColumn(null)}
            className={`flex flex-col min-w-[285px] w-[285px] border rounded-2xl h-full flex-shrink-0 transition-all duration-150 ${
              isColumnHovered
                ? 'bg-blue-500/10 border-blue-500/50 border-dashed ring-2 ring-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                : 'bg-[var(--dash-bg-elevated,rgba(0,0,0,0.4))] border-white/5'
            }`}
          >
            {/* Column Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs font-mono tracking-widest uppercase text-[var(--dash-text-primary)]/70">
                  {col.title}
                </h3>
                {columnValue > 0 && (
                  <p className="text-[10px] font-mono text-emerald-400 font-bold mt-0.5">
                    {symbol}{columnValue.toLocaleString('en-IN')}
                  </p>
                )}
              </div>
              <span className="bg-white/10 text-[var(--dash-text-primary)]/50 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                {colLeads.length}
              </span>
            </div>

            {/* Column Cards Container */}
            <div className="p-3 flex-1 overflow-y-auto custom-scrollbar min-h-[150px] space-y-3">
              {colLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  isDragged={draggedLeadId === lead.id}
                  onOpenLead={onOpenLead}
                  onLogActivity={onLogActivity}
                  onSchedule={onSchedule}
                  onWhatsapp={onWhatsapp}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}

              {colLeads.length === 0 && (
                <div className={`h-32 border-2 border-dashed rounded-xl flex items-center justify-center text-[var(--dash-text-primary)]/30 text-xs font-mono transition-all ${
                  isColumnHovered
                    ? 'border-blue-500/60 bg-blue-500/10 text-blue-300'
                    : 'border-white/5'
                }`}>
                  Drop lead here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
