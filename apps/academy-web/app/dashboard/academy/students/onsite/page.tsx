"use client"

import { useState } from "react"
import { Search, Plus, Filter, Users, GraduationCap, Mail, Phone, BookOpen, Fingerprint, X, Printer, LayoutGrid, List as ListIcon, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useApi, fetchApi } from "@/lib/useApi"
import Link from "next/link"

export default function StudentDirectory() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("ALL") // ALL, ENROLLED, ALUMNI
  const [viewMode, setViewMode] = useState<"GRID"|"LIST">("GRID")
  
  const [activeStudent, setActiveStudent] = useState<any>(null)
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  const [enrollForm, setEnrollForm] = useState({ firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "", batchId: "" })
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({ id: "", firstName: "", lastName: "", phone: "", batchId: "", parentName: "", parentPhone: "", address: "", portfolio: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { data: studentsData, mutate: refreshStudents } = useApi<any>("/academy/students?deliveryMode=ONSITE")
  const { data: batchesData } = useApi<any>("/academy/batches")
  const students = studentsData?.data || []
  const batches = batchesData?.data || []

  const { data: tplData } = useApi<any>("/documents/templates")
  const templates = tplData?.templates?.filter((t: any) => t.type === "CERTIFICATE" || t.type === "CUSTOM") || []
  
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCertificatesOpen, setIsCertificatesOpen] = useState(false)

  const mappedStudents = students.map((s: any) => ({
    id: s.id,
    userId: s.userId,
    code: s.studentCode,
    name: `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.trim(),
    firstName: s.user?.firstName || '',
    lastName: s.user?.lastName || '',
    email: s.user?.email || '',
    phone: s.user?.phone || 'N/A',
    batch: s.enrollments?.[0]?.batch?.name || 'Unassigned',
    batchId: s.enrollments?.[0]?.batchId || '',
    status: s.isAlumni ? 'ALUMNI' : 'ENROLLED'
  }))

  const filtered = mappedStudents.filter((s: any) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "ALL" || s.status === filter
    return matchSearch && matchFilter
  })

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi("/academy/students", {
        method: "POST",
        body: JSON.stringify(enrollForm)
      })
      setIsEnrollModalOpen(false)
      setEnrollForm({ firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "", batchId: "" })
      refreshStudents()
    } catch (err: any) {
      alert("Error enrolling student: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi(`/academy/students/${editForm.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          phone: editForm.phone,
          batchId: editForm.batchId || undefined,
          parentName: editForm.parentName || undefined,
          parentPhone: editForm.parentPhone || undefined,
          address: editForm.address || undefined,
          portfolio: editForm.portfolio || undefined
        })
      })
      toast.success("Student updated successfully!")
      setIsEditModalOpen(false)
      refreshStudents()
    } catch (err: any) {
      toast.error(err.message || "Error updating student")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (studentId: string, isAlumni: boolean) => {
    try {
      await fetchApi(`/academy/students/${studentId}`, {
        method: "PATCH",
        body: JSON.stringify({ isAlumni: !isAlumni })
      })
      toast.success(!isAlumni ? "Marked as Completed / Alumni" : "Marked as Enrolled")
      refreshStudents()
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    }
  }

  const handleGenerateDocument = async () => {
    if (!activeStudent || !selectedTemplate) return
    setIsGenerating(true)
    try {
      // Assuming activeStudent.userId will be mapped to a real User ID in the future
      const res = await fetchApi<any>("/documents/generate", {
        method: "POST",
        body: JSON.stringify({
          templateId: selectedTemplate,
          userId: activeStudent.userId 
        })
      })
      
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Generated Document</title></head>
            <body onload="window.print(); window.close();">
              ${res.html}
            </body>
          </html>
        `)
        printWindow.document.close()
      }
    } catch (e: any) {
      // Fallback for mock data (will fail if userId doesn't exist)
      console.warn("Generation might fail with mock user IDs if they don't exist in DB.", e.message)
      alert("Failed to generate: " + e.message + "\n(This may be expected with mock User IDs)")
    } finally {
      setIsGenerating(false)
      setSelectedTemplate("")
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-transparent text-white relative">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-[60%] h-[60%] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-white/10 bg-black/20 backdrop-blur-md relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)] relative overflow-hidden">
              <div className="absolute inset-0 bg-violet-500/20 animate-pulse mix-blend-overlay" />
              <GraduationCap className="w-6 h-6 text-violet-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Campus Students</h1>
              <p className="text-sm text-white/50 mt-2">Manage all active physical campus enrollments</p>
            </div>
          </div>
          <button onClick={() => setIsEnrollModalOpen(true)} className="group flex items-center gap-2 bg-white text-black font-bold tracking-widest uppercase text-[10px] px-5 py-3 rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-[150%] animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
            <Plus className="w-4 h-4" /> Enroll Student
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
            {["ALL", "ENROLLED", "ALUMNI"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[9px] px-4 py-2 rounded-lg font-mono tracking-widest uppercase font-bold transition-all ${
                  filter === f
                    ? "bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or code..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-all backdrop-blur-md"
              />
            </div>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
              <button 
                onClick={() => setViewMode("GRID")}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'GRID' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
              onClick={() => setIsCertificatesOpen(true)}
              className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold px-4 py-3 rounded-xl transition-all text-xs font-mono tracking-widest uppercase"
            >
              <Printer className="w-4 h-4" /> Issued Certificates
            </button>
            <button 
              onClick={() => setIsEnrollModalOpen(true)}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 font-bold px-6 py-3 rounded-xl transition-all text-xs font-mono tracking-widest uppercase shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            >
              <Plus className="w-4 h-4" /> Enroll Student
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10">
        {viewMode === "GRID" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
            {filtered.map((student: any, i: number) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                key={student.id} 
                onClick={() => setActiveStudent(student)}
                className="cursor-pointer group bg-white/5 backdrop-blur-md border border-white/10 hover:border-violet-500/40 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(139,92,246,0.1)] flex flex-col relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex gap-4 items-start relative z-10 mb-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 flex-none flex items-center justify-center text-xl font-bold text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] relative overflow-hidden">
                    <span className="relative z-10">{student.name.charAt(0)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="text-base font-bold text-white truncate group-hover:text-violet-400 transition-colors">{student.name}</h3>
                    <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-white/40 mt-1 flex items-center gap-1.5">
                      <Fingerprint className="w-3 h-3 text-white/20" /> {student.code}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 relative z-10 flex-1 mb-6">
                  <div className="flex items-center gap-3 text-xs font-mono text-white/70">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-none"><BookOpen className="w-3.5 h-3.5 text-violet-400" /></div>
                    <span className="truncate">{student.batch}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-white/70">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-none"><Mail className="w-3.5 h-3.5 text-blue-400" /></div>
                    <span className="truncate">{student.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-white/70">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-none"><Phone className="w-3.5 h-3.5 text-emerald-400" /></div>
                    <span className="truncate">{student.phone}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                    student.status === 'ENROLLED' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-white/5 text-white/50 border-white/10'
                  }`}>
                    {student.status === 'ENROLLED' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.8)]" />}
                    {student.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/academy/students/${student.id}/passport`}
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-widest text-violet-400 hover:text-white bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 px-2 py-1 rounded-lg transition-all">
                      <ShieldCheck className="w-3 h-3" /> Passport
                    </Link>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleToggleStatus(student.id, student.status === 'ALUMNI');
                      }} 
                      className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 rounded-lg"
                    >
                      {student.status === 'ENROLLED' ? 'Mark Completed' : 'Mark Enrolled'}
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setEditForm({ 
                          id: student.id, 
                          firstName: student.firstName, 
                          lastName: student.lastName, 
                          phone: student.phone === 'N/A' ? '' : student.phone, 
                          batchId: student.batchId,
                          parentName: student.parentName || "",
                          parentPhone: student.parentPhone || "",
                          address: student.address || "",
                          portfolio: student.portfolio || ""
                        }); 
                        setIsEditModalOpen(true); 
                      }} 
                      className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors border border-white/10 px-2 py-1 rounded-lg">Edit</button>
                    <button className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">View &rarr;</button>
                  </div>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/40">
                  <th className="px-6 py-4 text-[10px] font-mono tracking-widest uppercase text-white/50">Student</th>
                  <th className="px-6 py-4 text-[10px] font-mono tracking-widest uppercase text-white/50">Code</th>
                  <th className="px-6 py-4 text-[10px] font-mono tracking-widest uppercase text-white/50">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-mono tracking-widest uppercase text-white/50">Batch</th>
                  <th className="px-6 py-4 text-[10px] font-mono tracking-widest uppercase text-white/50">Status</th>
                  <th className="px-6 py-4 text-[10px] font-mono tracking-widest uppercase text-white/50 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student: any) => (
                  <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setActiveStudent(student)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                          {student.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-white/60">{student.code}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs text-white/60">
                        <span>{student.email}</span>
                        <span>{student.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-white/60">{student.batch}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border inline-flex items-center gap-1.5 ${
                        student.status === 'ENROLLED' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-white/5 text-white/50 border-white/10'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setEditForm({ 
                            id: student.id, 
                            firstName: student.firstName, 
                            lastName: student.lastName, 
                            phone: student.phone === 'N/A' ? '' : student.phone, 
                            batchId: student.batchId,
                            parentName: student.parentName || "",
                            parentPhone: student.parentPhone || "",
                            address: student.address || "",
                            portfolio: student.portfolio || ""
                          }); 
                          setIsEditModalOpen(true); 
                        }}
                        className="text-[10px] font-mono font-bold uppercase tracking-widest text-violet-400 hover:text-white transition-colors border border-white/10 px-2 py-1 rounded-lg">Edit</button>
                      <button className="text-[10px] font-mono font-bold uppercase tracking-widest text-violet-400 hover:text-white transition-colors">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center relative z-10">
            <div className="w-16 h-16 border border-white/10 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase text-white/40">No records match criteria</h3>
          </div>
        )}
      </div>

      {/* Student Profile Modal */}
      <AnimatePresence>
        {activeStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveStudent(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-[#0f1115] border border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]"
            >
              {/* Profile Sidebar */}
              <div className="w-full md:w-1/3 bg-white/5 border-r border-white/10 p-8 flex flex-col items-center">
                 <div className="w-24 h-24 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-4xl font-black text-white mb-6 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]">
                   {activeStudent.name?.charAt(0) || "S"}
                 </div>
                 <h2 className="text-xl font-bold text-white text-center mb-2">{activeStudent.name}</h2>
                 <p className="text-[10px] font-mono tracking-widest uppercase text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-md border border-violet-500/20 mb-8">{activeStudent.code}</p>

                 <div className="w-full space-y-4">
                   <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                     <p className="text-[9px] font-mono tracking-widest uppercase text-white/40 mb-1">Batch</p>
                     <p className="text-sm font-bold text-white">{activeStudent.batch}</p>
                   </div>
                   <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                     <p className="text-[9px] font-mono tracking-widest uppercase text-white/40 mb-1">Status</p>
                     <p className="text-sm font-bold text-white">{activeStudent.status}</p>
                   </div>
                 </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative flex flex-col gap-8">
                <button onClick={() => setActiveStudent(null)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-white/5 p-2 rounded-lg z-10">
                  <X className="w-5 h-5" />
                </button>

                {/* Generate Document Section */}
                <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-6 relative overflow-hidden mt-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent pointer-events-none" />
                  <h4 className="text-[10px] font-mono tracking-widest uppercase font-bold text-violet-400 mb-4 flex items-center gap-2 relative z-10">
                    <Printer className="w-4 h-4" /> Issue Certificate / Document
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                    <select 
                      value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-violet-500/50 outline-none"
                    >
                      <option value="">Select a Document Template...</option>
                      {templates.map((tpl: any) => (
                        <option key={tpl.id} value={tpl.id}>{tpl.name} ({tpl.type.replace("_", " ")})</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleGenerateDocument} disabled={!selectedTemplate || isGenerating}
                      className="px-6 py-2.5 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-lg text-xs font-bold font-mono tracking-widest uppercase hover:bg-violet-500/30 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {isGenerating ? "Generating..." : "Generate PDF"}
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Enroll Student Modal */}
      <AnimatePresence>
        {isEnrollModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsEnrollModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-[#0f1115] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="text-lg font-bold text-white">Enroll New Student</h3>
                <button onClick={() => setIsEnrollModalOpen(false)} className="text-white/50 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleEnrollSubmit} className="p-6 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1 block">First Name *</label>
                    <input required value={enrollForm.firstName} onChange={e => setEnrollForm({...enrollForm, firstName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1 block">Last Name *</label>
                    <input required value={enrollForm.lastName} onChange={e => setEnrollForm({...enrollForm, lastName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1 block">Email *</label>
                  <input required type="email" value={enrollForm.email} onChange={e => setEnrollForm({...enrollForm, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1 block">Phone</label>
                    <input value={enrollForm.phone} onChange={e => setEnrollForm({...enrollForm, phone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1 block">Date of Birth</label>
                    <input type="date" value={enrollForm.dateOfBirth} onChange={e => setEnrollForm({...enrollForm, dateOfBirth: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 [color-scheme:dark]" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1 block">Assign Batch (Optional)</label>
                  <select value={enrollForm.batchId} onChange={e => setEnrollForm({...enrollForm, batchId: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50">
                    <option value="">Select a batch...</option>
                    {batches.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsEnrollModalOpen(false)} className="px-6 py-2 rounded-lg text-xs font-bold font-mono tracking-widest uppercase text-white/50 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-lg text-xs font-bold font-mono tracking-widest uppercase text-black bg-white hover:bg-white/90 transition-colors disabled:opacity-50">
                    {isSubmitting ? "Enrolling..." : "Enroll Student"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Student Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-[#0f1115] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="text-lg font-bold text-white">Edit Student</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-white/50 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1 block">First Name *</label>
                    <input required value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1 block">Last Name *</label>
                    <input required value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1 block">Phone</label>
                    <input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1 block">Portfolio URL</label>
                    <input value={editForm.portfolio} onChange={e => setEditForm({...editForm, portfolio: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1 block">Address</label>
                  <textarea value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 min-h-[60px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1 block">Parent Name</label>
                    <input value={editForm.parentName} onChange={e => setEditForm({...editForm, parentName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1 block">Parent Phone</label>
                    <input value={editForm.parentPhone} onChange={e => setEditForm({...editForm, parentPhone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1 block">Assign Batch</label>
                  <select value={editForm.batchId} onChange={e => setEditForm({...editForm, batchId: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50">
                    <option value="">No Batch</option>
                    {batches.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name} ({b.course?.name || "No Course"})</option>
                    ))}
                  </select>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 rounded-lg text-xs font-bold font-mono tracking-widest uppercase text-white/50 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-lg text-xs font-bold font-mono tracking-widest uppercase text-black bg-white hover:bg-white/90 transition-colors disabled:opacity-50">
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Issued Certificates Drawer */}
      {isCertificatesOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="bg-[#111] border-l border-white/10 w-full max-w-lg h-full p-6 overflow-y-auto flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Printer className="w-5 h-5 text-emerald-400" /> Issued Certificates & Diplomas
                </h2>
                <p className="text-xs text-white/50">View all student certificates generated in Academy OS</p>
              </div>
              <button onClick={() => setIsCertificatesOpen(false)}><X className="w-5 h-5 text-white/50 hover:text-white" /></button>
            </div>

            <div className="space-y-3 flex-1">
              {mappedStudents.map((s: any) => (
                <div key={s.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{s.name}</h4>
                    <p className="text-xs text-white/50">{s.batch} • Code: {s.code}</p>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase mt-1 inline-block">Certificate Issued</span>
                  </div>
                  <Link
                    href={`/dashboard/academy/students/${s.id}/passport`}
                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" /> View / Print
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
