"use client"

import { use, useState, useEffect } from "react"
import { Shield, BookOpen, Clock, Activity, AlertCircle, CheckCircle2, IndianRupee, Trophy, Star } from "lucide-react"

export default function ParentPortalPage({ params }: { params: Promise<{ studentId: string }> }) {
  const resolvedParams = use(params)
  const studentId = resolvedParams.studentId
  
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`http://localhost:3002/api/v1/academy/passport/${studentId}`)
      .then(res => {
        if (!res.ok) throw new Error("Student not found")
        return res.json()
      })
      .then(d => {
        setData(d.data || d) // API response wrapper
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [studentId])

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white/50">Loading Portal...</div>
  if (error || !data) return <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-rose-400"><AlertCircle className="w-12 h-12 mb-4"/>{error || "Access Denied"}</div>

  const name = `${data.user?.firstName || ''} ${data.user?.lastName || ''}`.trim()
  
  // Quick calculations for dashboard view
  const allSessions = data.enrollments?.flatMap((e:any) => e.batch?.sessions || []) || []
  const attended = allSessions.filter((s:any) => s.attendances?.some((a:any) => a.studentId === studentId && a.status === 'PRESENT')).length
  const attendanceRate = allSessions.length ? Math.round((attended / allSessions.length) * 100) : 0

  const allInstallments = data.enrollments?.flatMap((e:any) => e.installments || []) || []
  const overdueFees = allInstallments.filter((i:any) => i.status === 'OVERDUE').reduce((s:number, i:any) => s + i.amount, 0)
  
  const skillCount = data.skills?.length || 0

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-2xl font-black">
              {name.charAt(0)}
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-violet-400 mb-1">Grekam Academy Parent Portal</div>
              <h1 className="text-2xl font-black">{name}</h1>
              <p className="text-xs text-white/50">{data.studentCode} • Enrolled</p>
            </div>
          </div>
          <Shield className="w-8 h-8 text-white/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Attendance Card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest flex items-center gap-2"><Clock className="w-4 h-4"/> Attendance</h3>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-black">{attendanceRate}%</span>
            </div>
            <p className="text-xs text-white/40">Attended {attended} of {allSessions.length} classes</p>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full" style={{ width: `${attendanceRate}%` }} />
            </div>
          </div>

          {/* Performance Card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest flex items-center gap-2"><Trophy className="w-4 h-4"/> Career Score</h3>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-black text-emerald-400">{data.careerScore}</span>
              <span className="text-white/40 mb-1">/100</span>
            </div>
            <p className="text-xs text-white/40">Overall job readiness</p>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${data.careerScore}%` }} />
            </div>
          </div>

          {/* Fees Card */}
          <div className={`border rounded-3xl p-6 ${overdueFees > 0 ? "bg-rose-500/10 border-rose-500/20" : "bg-white/5 border-white/10"}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${overdueFees > 0 ? "text-rose-400" : "text-white/50"}`}><IndianRupee className="w-4 h-4"/> Fee Dues</h3>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className={`text-4xl font-black ${overdueFees > 0 ? "text-rose-400" : "text-white"}`}>₹{overdueFees}</span>
            </div>
            <p className="text-xs text-white/40">{overdueFees > 0 ? "Please clear dues immediately" : "All clear. No pending fees!"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skills */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
             <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-6 flex items-center gap-2"><Star className="w-4 h-4"/> Verified Skills ({skillCount})</h3>
             {data.skills?.length === 0 ? (
               <p className="text-xs text-white/40">No skills verified yet.</p>
             ) : (
               <div className="space-y-4">
                 {data.skills?.slice(0,5).map((s:any) => (
                   <div key={s.id} className="flex items-center justify-between">
                     <span className="text-sm font-medium">{s.skillName}</span>
                     <div className="flex gap-0.5 text-amber-400">
                       {[...Array(s.rating)].map((_,i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>

          {/* Activity / Info */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
             <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-6 flex items-center gap-2"><BookOpen className="w-4 h-4"/> Current Courses</h3>
             <div className="space-y-4">
               {data.enrollments?.map((e:any) => (
                 <div key={e.id} className="bg-white/5 border border-white/5 rounded-xl p-4">
                   <div className="font-bold">{e.batch?.course?.name}</div>
                   <div className="text-xs text-white/50 mt-1">{e.batch?.name}</div>
                 </div>
               ))}
               {data.enrollments?.length === 0 && <p className="text-xs text-white/40">No active enrollments.</p>}
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}
