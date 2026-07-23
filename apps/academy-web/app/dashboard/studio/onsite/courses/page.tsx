"use client"

import { useApi, fetchApi } from "@/lib/useApi"
import { BookOpen, Plus, Loader2, ArrowRight, UserPlus, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

export default function OnsiteCoursesPage() {
  const { data: courses, isLoading, mutate } = useApi<any[]>("/academy/batches")
  const { data: educatorsData } = useApi<any[]>("/academy/educators")
  const educators = educatorsData?.filter(e => e.deliveryMode === 'ONSITE') || []

  const [assignModal, setAssignModal] = useState<{isOpen: boolean, batchId: string, currentEducatorId: string}>({isOpen: false, batchId: "", currentEducatorId: ""})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedEducator, setSelectedEducator] = useState("")

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    courseName: "", courseCode: "", courseDuration: "3 Months", courseFee: "50000",
    batchName: "", batchType: "MORNING", startDate: "", endDate: "", capacity: "20"
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi(`/academy/batches/with-course`, {
        method: "POST",
        body: JSON.stringify({
          ...createForm,
          courseFee: parseFloat(createForm.courseFee),
          capacity: parseInt(createForm.capacity)
        })
      })
      toast.success("Course & Batch created successfully!")
      setIsCreateModalOpen(false)
      setCreateForm({
        courseName: "", courseCode: "", courseDuration: "3 Months", courseFee: "50000",
        batchName: "", batchType: "MORNING", startDate: "", endDate: "", capacity: "20"
      })
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to create course")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi(`/academy/batches/${assignModal.batchId}`, {
        method: "PATCH",
        body: JSON.stringify({ educatorId: selectedEducator || undefined })
      })
      toast.success("Instructor assigned successfully!")
      setAssignModal({isOpen: false, batchId: "", currentEducatorId: ""})
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to assign instructor")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white p-8 overflow-y-auto relative">
      <div className="flex-none border-b border-white/10 pb-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <BookOpen className="w-6 h-6 text-indigo-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Onsite Courses</h1>
              <p className="text-sm text-white/50 mt-2">Manage course curriculum and materials for onsite batches.</p>
            </div>
          </div>
          <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 font-bold px-6 py-3 rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Create Course
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((batch: any) => (
            <div key={batch.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col group hover:border-indigo-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded font-bold uppercase tracking-widest">
                  ONSITE BATCH
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-bold uppercase">
                  ACTIVE
                </span>
              </div>
              
              <h3 className="font-bold text-lg mb-2">{batch.course?.name || "Untitled Course"}</h3>
              <p className="text-sm text-white/50 mb-6">{batch.name} • {batch.type}</p>
              
              <div className="mb-6 flex items-center gap-2 border-t border-white/5 pt-4">
                <span className="text-xs text-white/50">Instructor:</span>
                <span className="text-xs font-bold">{batch.educator ? `${batch.educator.user.firstName} ${batch.educator.user.lastName}` : 'Unassigned'}</span>
                <button onClick={() => { setAssignModal({isOpen: true, batchId: batch.id, currentEducatorId: batch.educatorId || ""}); setSelectedEducator(batch.educatorId || ""); }} className="ml-auto text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors flex items-center gap-1">
                  <UserPlus className="w-3 h-3" /> Assign
                </button>
              </div>
              
              <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                <div className="text-sm text-white/60">
                  {batch._count?.enrollments || 0} Enrolled
                </div>
                <Link href={`/dashboard/studio/onsite/courses/builder/${batch.courseId}`} className="text-indigo-400 hover:text-indigo-300 font-bold text-sm flex items-center gap-1 transition-colors">
                  Open Builder <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}

          {(!courses || courses.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/10 rounded-3xl">
              <BookOpen className="w-16 h-16 text-white/10 mb-4" />
              <h2 className="text-xl font-bold text-white/80">No Courses Found</h2>
              <p className="text-sm text-white/40 mt-2 max-w-md">Get started by creating a new onsite course.</p>
            </div>
          )}
        </div>
      )}

      {assignModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Assign Instructor</h2>
              <button onClick={() => setAssignModal({isOpen: false, batchId: "", currentEducatorId: ""})}><X className="w-5 h-5 text-white/50 hover:text-white" /></button>
            </div>
            <form onSubmit={handleAssign} className="space-y-4">
              <select value={selectedEducator} onChange={e => setSelectedEducator(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none">
                <option value="">-- Unassigned --</option>
                {educators.map((ed: any) => (
                  <option key={ed.id} value={ed.id}>{ed.user.firstName} {ed.user.lastName} ({ed.designation || 'Educator'})</option>
                ))}
              </select>
              <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-colors flex justify-center items-center">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Assignment"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Create New Onsite Course</h2>
              <button onClick={() => setIsCreateModalOpen(false)}><X className="w-5 h-5 text-white/50 hover:text-white" /></button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest border-b border-white/10 pb-2">1. Course Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Course Name *</label>
                    <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                      placeholder="e.g. Photography 101" value={createForm.courseName} onChange={e => setCreateForm(p => ({...p, courseName: e.target.value}))} />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Course Code *</label>
                    <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                      placeholder="e.g. PHO101" value={createForm.courseCode} onChange={e => setCreateForm(p => ({...p, courseCode: e.target.value}))} />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Duration</label>
                    <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                      placeholder="e.g. 3 Months" value={createForm.courseDuration} onChange={e => setCreateForm(p => ({...p, courseDuration: e.target.value}))} />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Fee (₹)</label>
                    <input required type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                      value={createForm.courseFee} onChange={e => setCreateForm(p => ({...p, courseFee: e.target.value}))} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest border-b border-white/10 pb-2">2. Initial Batch Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Batch Name *</label>
                    <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                      placeholder="e.g. June 2026 Cohort" value={createForm.batchName} onChange={e => setCreateForm(p => ({...p, batchName: e.target.value}))} />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Timing Type</label>
                    <select required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                      value={createForm.batchType} onChange={e => setCreateForm(p => ({...p, batchType: e.target.value}))}>
                      <option value="MORNING">Morning Batch</option>
                      <option value="EVENING">Evening Batch</option>
                      <option value="WEEKEND">Weekend Batch</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Start Date *</label>
                    <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm [color-scheme:dark]"
                      value={createForm.startDate} onChange={e => setCreateForm(p => ({...p, startDate: e.target.value}))} />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">End Date *</label>
                    <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm [color-scheme:dark]"
                      value={createForm.endDate} onChange={e => setCreateForm(p => ({...p, endDate: e.target.value}))} />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Max Students</label>
                    <input required type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                      value={createForm.capacity} onChange={e => setCreateForm(p => ({...p, capacity: e.target.value}))} />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button type="submit" disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Course & Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
