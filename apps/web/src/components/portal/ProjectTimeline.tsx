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
    <div className="relative pl-5 py-2 border-l border-white/[0.08] space-y-6 mt-3">
      {events.map((e, idx) => {
        let Icon = Star;
        let iconColor = "text-white/60 bg-[#161618] border-white/[0.08]";
        
        if (e.type === 'TASK_COMPLETED' || e.type === 'PHASE_COMPLETED') {
          Icon = CheckCircle2;
          iconColor = "text-[#30D158] bg-[#161618] border-[#30D158]/30";
        } else if (e.type === 'FILE_UPLOADED' || e.type === 'PROJECT_CREATED') {
          Icon = FileUp;
          iconColor = "text-[#0A84FF] bg-[#161618] border-[#0A84FF]/30";
        } else if (e.type === 'PAYMENT_RECEIVED') {
          Icon = CreditCard;
          iconColor = "text-[#FF9F0A] bg-[#161618] border-[#FF9F0A]/30";
        }

        return (
          <div key={e.id} className="relative">
            <div className={`absolute -left-[31px] w-5 h-5 rounded-full border flex items-center justify-center ${iconColor}`}>
              <Icon className="w-2.5 h-2.5" />
            </div>
            <div>
              <h4 className="text-xs font-medium text-white">{e.title}</h4>
              {e.description && <p className="text-[11px] text-white/50 mt-0.5">{e.description}</p>}
              <p className="text-[10px] text-white/30 mt-0.5 font-mono">{new Date(e.date).toLocaleString()}</p>
            </div>
          </div>
        )
      })}
    </div>
  );
}
