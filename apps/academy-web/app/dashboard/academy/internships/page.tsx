"use client"

import { useState } from "react"
import { useApi, fetchApi } from "@/lib/useApi"
import { Briefcase, Building, MapPin, X, Loader2, Plus } from "lucide-react"
import { toast } from "sonner"

export default function AcademyInternships() {
  const { data: internships, mutate } = useApi<any[]>("/academy/internships")
  const { data: students } = useApi<any>("/academy/students")
  
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    studentId: "",
    companyName: "",
    role: "",
    status: "IN_PROGRESS"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi("/academy/internships", {
        method: "POST",
        body: JSON.stringify(form)
      })
      toast.success("Internship recorded successfully!")
      setIsSlideOverOpen(false)
      setForm({ studentId: "", companyName: "", role: "", status: "IN_PROGRESS" })
      mutate()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Failed to record internship")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-orange-500" /> Internship Portal
          </h1>
          <p className="text-white/50 mt-2">Track student internships and daily logs.</p>
        </div>
        <button 
          onClick={() => setIsSlideOverOpen(true)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold rounded-xl transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Record Internship
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(internships?.length === 0) && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl border-dashed">
            <Briefcase className="w-12 h-12 text-white/20 mb-4" />
            <h3 className="text-xl font-bold mb-2">No Internships Yet</h3>
            <p className="text-white/40 text-center max-w-sm mb-6">You haven't added any student internships to the portal yet. Track their external placements and work logs here.</p>
            <button 
              onClick={() => setIsSlideOverOpen(true)}
              className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold transition-colors"
            >
              + Record Internship
            </button>
          </div>
        )}
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

      {/* SlideOver for Record Internship */}
      {isSlideOverOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsSlideOverOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-[#111] border-l border-white/10 z-50 p-6 overflow-y-auto flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><Briefcase className="w-5 h-5 text-orange-500" /> Record Internship</h2>
              <button onClick={() => setIsSlideOverOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5">
              
              <div>
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Student</label>
                <select required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
                  value={form.studentId} onChange={e => setForm(f => ({...f, studentId: e.target.value}))}>
                  <option value="">Select a student...</option>
                  {(students?.data || []).map((s: any) => (
                    <option key={s.id} value={s.id}>{s.user?.firstName} {s.user?.lastName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Company Name</label>
                <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Google"
                  value={form.companyName} onChange={e => setForm(f => ({...f, companyName: e.target.value}))} />
              </div>

              <div>
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Role</label>
                <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Frontend Engineer Intern"
                  value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))} />
              </div>

              <div>
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Status</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
                  value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>

              <div className="mt-auto pt-6 border-t border-white/10 flex justify-end gap-3">
                <button type="button" onClick={() => setIsSlideOverOpen(false)} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
                  Save Internship
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
