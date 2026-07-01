"use client"

import { GraduationCap } from "lucide-react"

export default function OnsiteEducatorsPage() {
  return (
    <div className="flex flex-col h-full bg-[#050505] text-white p-8">
      <div className="flex-none border-b border-white/10 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
              <GraduationCap className="w-6 h-6 text-violet-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Campus Faculty</h1>
              <p className="text-sm text-white/50 mt-2">Manage physical academy instructors and lab assignments</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <GraduationCap className="w-16 h-16 text-white/10 mb-4" />
        <h2 className="text-xl font-bold text-white/80">Educator Directory Coming Soon</h2>
        <p className="text-sm text-white/40 mt-2 max-w-md">The campus faculty management module is currently under development. This space will allow you to assign physical lab hours and manage onsite attendance.</p>
      </div>
    </div>
  )
}
