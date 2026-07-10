"use client";

import React, { useState } from 'react';
import { useApi } from '@/lib/useApi';
import { Loader2, CheckCircle2, FileUp, CreditCard, PlayCircle, Star } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description?: string;
  date: string;
}

export function ProjectTimeline({ projectId }: { projectId: string }) {
  const { data: events, isLoading } = useApi<TimelineEvent[]>(`/portal/projects/${projectId}/timeline`);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-5 h-5 animate-spin text-white/40" />
      </div>
    );
  }

  if (!events || events.length === 0) {
    return <div className="text-sm text-white/40 text-center p-4">No recent activity.</div>;
  }

  return (
    <div className="relative pl-6 py-2 border-l-2 border-white/10 space-y-8 mt-4">
      {events.map((e, idx) => {
        let Icon = Star;
        let color = "text-slate-400 bg-slate-800 border-slate-700";
        
        if (e.type === 'TASK_COMPLETED') {
          Icon = CheckCircle2;
          color = "text-emerald-400 bg-emerald-900 border-emerald-500/30";
        } else if (e.type === 'FILE_UPLOADED') {
          Icon = FileUp;
          color = "text-blue-400 bg-blue-900 border-blue-500/30";
        } else if (e.type === 'PAYMENT_RECEIVED') {
          Icon = CreditCard;
          color = "text-amber-400 bg-amber-900 border-amber-500/30";
        } else if (e.type === 'PROJECT_CREATED') {
          Icon = PlayCircle;
          color = "text-violet-400 bg-violet-900 border-violet-500/30";
        } else if (e.type === 'PHASE_COMPLETED') {
          Icon = Star;
          color = "text-fuchsia-400 bg-fuchsia-900 border-fuchsia-500/30";
        }

        return (
          <div key={e.id} className="relative">
            <div className={`absolute -left-[35px] w-6 h-6 rounded-full border-2 flex items-center justify-center ${color}`}>
              <Icon className="w-3 h-3" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{e.title}</h4>
              {e.description && <p className="text-xs text-white/70 mt-1">{e.description}</p>}
              <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">{new Date(e.date).toLocaleString()}</p>
            </div>
          </div>
        )
      })}
    </div>
  );
}
