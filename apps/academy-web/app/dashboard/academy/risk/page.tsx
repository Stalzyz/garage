"use client"

import { useApi } from "@/lib/useApi"
import { AlertTriangle, UserX, TrendingDown, IndianRupee, ShieldAlert, CheckCircle2, ChevronRight, Activity } from "lucide-react"
import Link from "next/link"

const RISK_ICONS: any = {
  FINANCIAL: IndianRupee,
  ATTENDANCE: UserX,
  PERFORMANCE: TrendingDown,
  ENGAGEMENT: Activity
}

const RISK_COLORS: any = {
  HIGH: "text-red-400 bg-red-500/10 border-red-500/20",
  MEDIUM: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  LOW: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
}

export default function AIRiskDashboard() {
  const { data: atRiskStudents, isLoading } = useApi<any[]>("/academy/risk")

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white p-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-rose-500" /> AI Risk Dashboard
        </h1>
        <p className="text-white/50 mt-2">Automatically detects students with low attendance, weak skills, or payment dues.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12 text-white/40 animate-pulse">Analyzing student patterns...</div>
      ) : (atRiskStudents?.length === 0) ? (
        <div className="flex flex-col items-center justify-center p-16 border border-white/10 rounded-3xl bg-white/5">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
          <h3 className="text-xl font-bold">No Students at Risk!</h3>
          <p className="text-white/40 mt-2">All enrolled students have healthy attendance, payments, and performance.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {(atRiskStudents || []).map((student: any) => (
            <div key={student.studentId} className="bg-white/5 border border-rose-500/20 rounded-2xl p-6 hover:border-rose-500/50 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-[50px] pointer-events-none rounded-full" />
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div>
                  <h3 className="font-bold text-lg">{student.name}</h3>
                  <p className="text-xs font-mono text-white/50">{student.studentCode}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold border border-rose-500/30">
                  {student.risks.length}
                </div>
              </div>

              <div className="space-y-3 mb-6 relative z-10">
                {student.risks.map((risk: any, i: number) => {
                  const Icon = RISK_ICONS[risk.type] || AlertTriangle;
                  return (
                    <div key={i} className={`flex gap-3 items-start p-3 rounded-xl border ${RISK_COLORS[risk.level]}`}>
                      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-0.5">{risk.type} RISK</div>
                        <div className="text-sm">{risk.message}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center gap-2 relative z-10 border-t border-white/10 pt-4 mt-auto">
                <Link href={`/dashboard/academy/students/${student.studentId}/passport`} className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-center rounded-xl text-xs font-bold transition-colors">
                  View Passport
                </Link>
                <button className="flex-1 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-center rounded-xl text-xs font-bold transition-colors">
                  Message Mentor
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
