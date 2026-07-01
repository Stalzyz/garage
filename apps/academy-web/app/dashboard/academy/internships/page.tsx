"use client"

import { useApi } from "@/lib/useApi"
import { Briefcase, Building, MapPin } from "lucide-react"

export default function AcademyInternships() {
  const { data: internships } = useApi<any[]>("/academy/internships")

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white p-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-orange-500" /> Internship Portal
        </h1>
        <p className="text-white/50 mt-2">Track student internships and daily logs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(internships || []).map((intern: any) => (
          <div key={intern.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-orange-500/50 transition-colors">
            <h3 className="font-bold text-lg mb-1">{intern.role}</h3>
            <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
              <Building className="w-4 h-4" /> {intern.companyName}
            </div>
            <div className="text-xs text-white/40 mb-4">
              Student: <span className="text-white ml-1 font-bold">{intern.student?.user?.firstName} {intern.student?.user?.lastName}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-white/10 pt-4">
              <span className={`px-2 py-1 rounded font-bold uppercase ${intern.status === 'IN_PROGRESS' ? 'bg-orange-500/20 text-orange-400' : 'bg-white/10 text-white/50'}`}>
                {intern.status}
              </span>
              <span className="text-white/40">{intern._count?.dailyLogs || 0} Logs</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
