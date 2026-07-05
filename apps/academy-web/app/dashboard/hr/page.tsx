"use client"

import { useState } from "react"
import { Search, Plus, Filter, Mail, Phone, Calendar, MoreVertical, MapPin, Users, Upload, X, FileText, Printer, LayoutGrid, List } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { SlideOver } from "@/components/SlideOver"
import { EmployeeActivity } from "./EmployeeActivity"
import { CheckCircle2 } from "lucide-react"
import { ClockWidget } from "@/components/hr/ClockWidget"

const DEPARTMENTS = ["All Modules", "Design", "Development", "Management", "Marketing", "Finance"]

export default function EmployeeDirectory() {
  const { data, mutate } = useApi<any>("/hr/employees")
  const employees = data?.employees || []

  const { data: tplData } = useApi<any>("/documents/templates")
  const templates = tplData?.templates || []

  const [search, setSearch] = useState("")
  const [deptFilter, setDeptFilter] = useState("All Modules")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  
  const [isUploading, setIsUploading] = useState(false)
  const [uploadData, setUploadData] = useState({ name: "", type: "ID_PROOF" })

  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const { data: rolesData } = useApi<any>("/settings/roles")
  const roles = rolesData?.roles || []

  const { data: deptData, mutate: mutateDepts } = useApi<any>("/hr/departments")
  const departments = deptData?.departments || []

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false)
  const [deptName, setDeptName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [credentialsModal, setCredentialsModal] = useState<{email: string, password: string} | null>(null)
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    designation: "",
    salary: "",
    departmentId: "",
    customRoleId: "",
    bloodGroup: "",
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactPhone: "",
    bankName: "",
    bankAccountNo: "",
    bankIfsc: "",
    govIdType: "",
    govIdNumber: ""
  })

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return
    if (!confirm("Are you sure you want to permanently delete this employee? This will also delete their time entries and leave requests.")) return
    try {
      await fetchApi(`/hr/employees/${selectedEmployee.id}`, { method: "DELETE" })
      toast.success("Employee permanently deleted")
      setSelectedEmployee(null)
      mutate()
    } catch (e: any) {
      toast.error(e.message || "Failed to delete employee")
    }
  }

  const openEdit = () => {
    if (!selectedEmployee) return
    setFormData({
      firstName: selectedEmployee.user?.firstName || "",
      lastName: selectedEmployee.user?.lastName || "",
      email: selectedEmployee.user?.email || "",
      designation: selectedEmployee.jobTitle || "",
      salary: selectedEmployee.salary?.toString() || "",
      departmentId: selectedEmployee.departmentId || "",
      customRoleId: selectedEmployee.user?.customRoleId || "",
      bloodGroup: selectedEmployee.bloodGroup || "",
      emergencyContactName: selectedEmployee.emergencyContact?.name || "",
      emergencyContactRelation: selectedEmployee.emergencyContact?.relation || "",
      emergencyContactPhone: selectedEmployee.emergencyContact?.phone || "",
      bankName: selectedEmployee.bankDetails?.bankName || "",
      bankAccountNo: selectedEmployee.bankDetails?.accountNo || "",
      bankIfsc: selectedEmployee.bankDetails?.ifsc || "",
      govIdType: selectedEmployee.governmentId?.type || "",
      govIdNumber: selectedEmployee.governmentId?.number || ""
    })
    setIsEditOpen(true)
  }

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        jobTitle: formData.designation,
        joiningDate: new Date().toISOString(),
        salary: formData.salary ? Number(formData.salary) : undefined,
        departmentId: formData.departmentId || undefined,
        customRoleId: formData.customRoleId || undefined,
        bloodGroup: formData.bloodGroup || undefined,
        emergencyContact: formData.emergencyContactName ? { name: formData.emergencyContactName, relation: formData.emergencyContactRelation, phone: formData.emergencyContactPhone } : undefined,
        bankDetails: formData.bankAccountNo ? { bankName: formData.bankName, accountNo: formData.bankAccountNo, ifsc: formData.bankIfsc } : undefined,
        governmentId: formData.govIdNumber ? { type: formData.govIdType, number: formData.govIdNumber } : undefined
      }
      const res = await fetchApi<any>("/hr/employees", {
        method: "POST",
        body: JSON.stringify(payload)
      })
      toast.success("Personnel created successfully")
      if (res.credentials) setCredentialsModal(res.credentials)
      setIsAddOpen(false)
      setFormData({ firstName: "", lastName: "", email: "", designation: "", salary: "", departmentId: "", customRoleId: "", bloodGroup: "", emergencyContactName: "", emergencyContactRelation: "", emergencyContactPhone: "", bankName: "", bankAccountNo: "", bankIfsc: "", govIdType: "", govIdNumber: "" })
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to create personnel")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmployee) return
    setIsSubmitting(true)
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        jobTitle: formData.designation,
        salary: formData.salary ? Number(formData.salary) : undefined,
        departmentId: formData.departmentId || undefined,
        customRoleId: formData.customRoleId || undefined,
        bloodGroup: formData.bloodGroup || undefined,
        emergencyContact: formData.emergencyContactName ? { name: formData.emergencyContactName, relation: formData.emergencyContactRelation, phone: formData.emergencyContactPhone } : undefined,
        bankDetails: formData.bankAccountNo ? { bankName: formData.bankName, accountNo: formData.bankAccountNo, ifsc: formData.bankIfsc } : undefined,
        governmentId: formData.govIdNumber ? { type: formData.govIdType, number: formData.govIdNumber } : undefined
      }
      await fetchApi(`/hr/employees/${selectedEmployee.id}`, { method: "PUT", body: JSON.stringify(payload) })
      toast.success("Personnel updated successfully")
      setIsEditOpen(false)
      const res = await fetchApi<any>(`/hr/employees/${selectedEmployee.id}`)
      setSelectedEmployee(res.employee)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to update personnel")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetchApi("/hr/departments", { method: "POST", body: JSON.stringify({ name: deptName, description: "" }) })
      toast.success("Department created")
      setIsAddDeptOpen(false)
      setDeptName("")
      mutateDepts()
    } catch (err: any) {
      toast.error(err.message || "Failed to create department")
    }
  }

  const handleResetPassword = async () => {
    if (!selectedEmployee) return
    setIsResetting(true)
    try {
      const res = await fetchApi<any>(`/hr/employees/${selectedEmployee.id}/reset-password`, { method: "POST", body: JSON.stringify({}) })
      toast.success("Password reset successfully")
      if (res.credentials) setCredentialsModal(res.credentials)
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password")
    } finally {
      setIsResetting(false)
    }
  }

  const filtered = employees.filter((emp: any) => {
    const nameMatch = ((emp.user?.firstName || "") + " " + (emp.user?.lastName || "")).toLowerCase().includes(search.toLowerCase()) || false
    const deptName = emp.department?.name || "Unassigned"
    const matchDept = deptFilter === "All Modules" || deptName === deptFilter
    return nameMatch && matchDept
  })

  const handleUpload = async () => {
    if(!selectedEmployee) return
    setIsUploading(true)
    try {
      const mockUrl = `https://example.com/docs/${uploadData.name.replace(/\s+/g, "_")}.pdf`
      await fetchApi(`/hr/employees/${selectedEmployee.id}/documents`, {
        method: "POST",
        body: JSON.stringify({ name: uploadData.name, type: uploadData.type, url: mockUrl })
      })
      const res = await fetchApi<any>(`/hr/employees/${selectedEmployee.id}`)
      setSelectedEmployee(res.employee)
      mutate()
    } catch (e) {
      console.error(e)
    } finally {
      setIsUploading(false)
      setUploadData({ name: "", type: "ID_PROOF" })
    }
  }

  const handleGenerateDocument = async () => {
    if (!selectedEmployee || !selectedTemplate) return
    setIsGenerating(true)
    try {
      const res = await fetchApi<any>("/documents/generate", {
        method: "POST",
        body: JSON.stringify({
          templateId: selectedTemplate,
          userId: selectedEmployee.userId
        })
      })
      
      // Open the generated HTML in a new print window
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
    } catch (e) {
      console.error(e)
    } finally {
      setIsGenerating(false)
      setSelectedTemplate("")
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar bg-transparent text-white relative p-6 lg:p-10 space-y-10">
      
      {/* Background Ambience */}
      <div className="absolute top-[10%] left-[50%] w-[30%] h-[30%] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)] relative overflow-hidden">
            <Users className="w-6 h-6 text-emerald-400 relative z-10" />
            <div className="absolute inset-0 bg-emerald-500/20 animate-pulse mix-blend-overlay" />
          </div>
          <div>
            <p className="text-[10px] font-mono tracking-widest uppercase font-bold text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)] mb-1">Human Resources</p>
            <h1 className="text-3xl font-bold text-white tracking-tight leading-none">
              Personnel Matrix
            </h1>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setIsAddDeptOpen(true)}
            className="flex items-center gap-2 bg-white/5 text-white/70 border border-white/10 text-[10px] font-mono font-bold tracking-widest uppercase px-5 py-3 rounded-xl hover:bg-white/10 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Dept
          </button>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold tracking-widest uppercase px-5 py-3 rounded-xl hover:bg-emerald-500/30 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <Plus className="w-4 h-4" /> Add Personnel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 relative z-10 border-y border-white/10 py-6">
        <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
          {DEPARTMENTS.map(dept => (
            <button
              key={dept}
              onClick={() => setDeptFilter(dept)}
              className={`text-[9px] font-mono tracking-widest uppercase font-bold px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${
                deptFilter === dept
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                  : "bg-black/40 border-white/10 text-white/40 hover:text-white hover:border-white/30"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Query Personnel..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[10px] font-mono tracking-widest uppercase text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]"
          />
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-black/40 border border-white/10 rounded-xl p-1">
          <button 
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-emerald-500/20 text-emerald-400" : "text-white/40 hover:text-white"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-emerald-500/20 text-emerald-400" : "text-white/40 hover:text-white"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((emp: any, i: number) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                key={emp.id} 
                onClick={() => setSelectedEmployee(emp)}
                className="cursor-pointer group bg-white/5 backdrop-blur-md border border-white/10 hover:border-emerald-500/30 rounded-2xl p-6 transition-all hover:-translate-y-1 flex flex-col relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]`}>
                    ACTIVE
                  </span>
                  <button className="text-white/40 hover:text-white p-1 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col items-center text-center mb-6 relative z-10">
                  <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-2xl font-black text-white mb-4 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]">
                    {emp.user?.firstName?.charAt(0) || "U"}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{`${emp.user?.firstName || ""} ${emp.user?.lastName || ""}`}</h3>
                  <p className="text-[10px] font-mono tracking-widest uppercase text-emerald-400/80 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{emp.jobTitle}</p>
                </div>

                <div className="space-y-3 mt-auto pt-5 border-t border-white/10 relative z-10">
                  <div className="flex items-center gap-3 text-xs font-mono text-white/60">
                    <Mail className="w-3.5 h-3.5 text-emerald-400 flex-none" />
                    <span className="truncate">{emp.user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-white/60">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 flex-none" />
                    <span>{emp.phone || "No phone"}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-[10px] font-mono tracking-widest uppercase text-white/50">
                    <th className="px-6 py-4 font-bold">Personnel</th>
                    <th className="px-6 py-4 font-bold">Role & Dept</th>
                    <th className="px-6 py-4 font-bold">Contact</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((emp: any, i: number) => (
                    <motion.tr 
                      key={emp.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedEmployee(emp)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-sm font-black text-white group-hover:text-emerald-400 transition-colors">
                            {emp.user?.firstName?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">{`${emp.user?.firstName || ""} ${emp.user?.lastName || ""}`}</p>
                            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{emp.employeeCode || "EMP-000"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white mb-1">{emp.jobTitle}</p>
                        <p className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">{emp.department?.name || "Unassigned"}</p>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-mono text-white/60">
                          <Mail className="w-3 h-3 text-emerald-400" /> <span className="truncate max-w-[150px]">{emp.user?.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-white/60">
                          <Phone className="w-3 h-3 text-emerald-400" /> <span>{emp.phone || "No phone"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          ACTIVE
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-white/40 hover:text-white p-2 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center bg-black/20 border border-dashed border-white/10 rounded-2xl mt-6">
            <div className="w-12 h-12 bg-black/40 rounded-xl border border-white/10 flex items-center justify-center mb-4">
              <Search className="w-5 h-5 text-white/30" />
            </div>
            <h3 className="text-sm font-bold text-white/50 tracking-widest uppercase font-mono">No Personnel Found</h3>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedEmployee(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-[#0f1115] border border-white/10 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh]"
            >
              {/* Profile Sidebar */}
              <div className="w-full md:w-1/3 bg-white/5 border-r border-white/10 p-8 flex flex-col items-center">
                 <div className="w-24 h-24 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-4xl font-black text-white mb-6 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]">
                   {selectedEmployee.user?.firstName?.charAt(0) || "U"}
                 </div>
                 <h2 className="text-xl font-bold text-white text-center mb-2">{`${selectedEmployee.user?.firstName || ""} ${selectedEmployee.user?.lastName || ""}`}</h2>
                 <p className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-md border border-emerald-500/20 mb-8">{selectedEmployee.jobTitle}</p>

                 <div className="w-full space-y-4">
                   <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                     <p className="text-[9px] font-mono tracking-widest uppercase text-white/40 mb-1">Department</p>
                     <p className="text-sm font-bold text-white">{selectedEmployee.department?.name || "Unassigned"}</p>
                   </div>
                   <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                     <p className="text-[9px] font-mono tracking-widest uppercase text-white/40 mb-1">Base Salary</p>
                     <p className="text-sm font-bold text-white">₹{selectedEmployee.salary?.toLocaleString()}</p>
                   </div>
                   <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                     <p className="text-[9px] font-mono tracking-widest uppercase text-white/40 mb-1">Joining Date</p>
                     <p className="text-sm font-bold text-white">{new Date(selectedEmployee.joiningDate).toLocaleDateString()}</p>
                   </div>
                   {selectedEmployee.bloodGroup && (
                     <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                       <p className="text-[9px] font-mono tracking-widest uppercase text-white/40 mb-1">Blood Group</p>
                       <p className="text-sm font-bold text-red-400">{selectedEmployee.bloodGroup}</p>
                     </div>
                   )}
                 </div>
                 
                 <div className="w-full mt-6">
                   <ClockWidget employeeId={selectedEmployee.id} />
                 </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative flex flex-col gap-8">
                <button onClick={() => setSelectedEmployee(null)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-white/5 p-2 rounded-lg z-10">
                  <X className="w-5 h-5" />
                </button>

                {/* Quick Actions */}
                <div className="flex gap-4">
                  <button onClick={openEdit} className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold font-mono tracking-widest uppercase hover:bg-blue-500/30 transition-colors">
                    Edit Profile
                  </button>
                  <button onClick={handleResetPassword} disabled={isResetting} className="px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-xs font-bold font-mono tracking-widest uppercase hover:bg-orange-500/30 transition-colors disabled:opacity-50">
                    {isResetting ? "Resetting..." : "Reset Password"}
                  </button>
                  <button onClick={handleDeleteEmployee} className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold font-mono tracking-widest uppercase hover:bg-red-500/30 transition-colors ml-auto">
                    Delete
                  </button>
                </div>

                {/* Generate Document Section */}
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none" />
                  <h4 className="text-[10px] font-mono tracking-widest uppercase font-bold text-emerald-400 mb-4 flex items-center gap-2 relative z-10">
                    <Printer className="w-4 h-4" /> Issue Document
                  </h4>
                  <div className="flex gap-4 relative z-10">
                    <select 
                      value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-emerald-500/50 outline-none"
                    >
                      <option value="">Select a Document Template...</option>
                      {templates.map((tpl: any) => (
                        <option key={tpl.id} value={tpl.id}>{tpl.name} ({tpl.type.replace("_", " ")})</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleGenerateDocument} disabled={!selectedTemplate || isGenerating}
                      className="px-6 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold font-mono tracking-widest uppercase hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? "Generating..." : "Generate PDF"}
                    </button>
                  </div>
                </div>

                {/* Documents Section */}
                <div>
                  <h3 className="text-sm font-mono tracking-widest uppercase font-bold text-white mb-6 border-b border-white/10 pb-4">Personnel Documents</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {selectedEmployee.documents?.map((doc: any) => (
                      <div key={doc.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-none text-emerald-400">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{doc.name}</p>
                          <p className="text-[9px] font-mono uppercase tracking-widest text-white/40 mt-1">{doc.type}</p>
                        </div>
                      </div>
                    ))}
                    {(!selectedEmployee.documents || selectedEmployee.documents.length === 0) && (
                      <div className="col-span-full text-center py-8 text-white/40 font-mono text-xs uppercase tracking-widest border border-dashed border-white/10 rounded-xl">
                        No documents available
                      </div>
                    )}
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                    <h4 className="text-[10px] font-mono tracking-widest uppercase font-bold text-emerald-400 mb-4 flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Upload Custom File
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-white/50 mb-1 font-mono uppercase tracking-widest">File Name</label>
                          <input 
                            value={uploadData.name} onChange={e => setUploadData({...uploadData, name: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500/50 outline-none" 
                            placeholder="e.g. Aadhaar Card"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1 font-mono uppercase tracking-widest">File Type</label>
                          <select 
                            value={uploadData.type} onChange={e => setUploadData({...uploadData, type: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500/50 outline-none"
                          >
                            <option value="ID_PROOF">ID Proof</option>
                            <option value="ADDRESS_PROOF">Address Proof</option>
                            <option value="DEGREE">Degree Certificate</option>
                            <option value="CONTRACT">Employment Contract</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                      </div>
                      <button 
                        onClick={handleUpload} disabled={isUploading || !uploadData.name}
                        className="w-full py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold font-mono tracking-widest uppercase hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                      >
                        {isUploading ? "Uploading..." : "Save Document"}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      <SlideOver title="Add Personnel" open={isAddOpen} onClose={() => setIsAddOpen(false)}>
        <form onSubmit={handleCreateEmployee} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">First Name</label>
              <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Last Name</label>
              <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Email</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Job Title</label>
            <input required value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Department</label>
            <select value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none">
              <option value="">Select Department...</option>
              {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Access Role</label>
            <select value={formData.customRoleId} onChange={e => setFormData({...formData, customRoleId: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none">
              <option value="">Default Access...</option>
              {roles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Base Salary (INR)</label>
            <input required type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
          </div>
          
          <div className="pt-4 border-t border-white/10 mt-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-4">Extended Profile Details</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-2">Blood Group</label>
                <input value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="e.g. O+" />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-2">Gov ID Type</label>
                <input value={formData.govIdType} onChange={e => setFormData({...formData, govIdType: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="e.g. PAN" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-2">Gov ID Number</label>
                <input value={formData.govIdNumber} onChange={e => setFormData({...formData, govIdNumber: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" />
              </div>
            </div>

            <h5 className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/70 mb-3">Emergency Contact</h5>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <input value={formData.emergencyContactName} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="Contact Name" />
              </div>
              <div>
                <input value={formData.emergencyContactRelation} onChange={e => setFormData({...formData, emergencyContactRelation: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="Relation (e.g. Spouse)" />
              </div>
              <div>
                <input value={formData.emergencyContactPhone} onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="Phone Number" />
              </div>
            </div>

            <h5 className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/70 mb-3">Bank Details</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <input value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="Bank Name" />
              </div>
              <div>
                <input value={formData.bankAccountNo} onChange={e => setFormData({...formData, bankAccountNo: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="Account No" />
              </div>
              <div>
                <input value={formData.bankIfsc} onChange={e => setFormData({...formData, bankIfsc: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="IFSC Code" />
              </div>
            </div>
          </div>

          <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold font-mono tracking-widest uppercase hover:bg-emerald-500/30 transition-colors disabled:opacity-50">
            {isSubmitting ? "Processing..." : "Create Personnel"}
          </button>
        </form>
      </SlideOver>

      <SlideOver title="Edit Profile" open={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <form onSubmit={handleUpdateEmployee} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">First Name</label>
              <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Last Name</label>
              <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Email</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Job Title</label>
            <input required value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Department</label>
            <select value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none">
              <option value="">Select Department...</option>
              {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Access Role</label>
            <select value={formData.customRoleId} onChange={e => setFormData({...formData, customRoleId: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none">
              <option value="">Default Access...</option>
              {roles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Base Salary (INR)</label>
            <input required type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
          </div>
          
          <div className="pt-4 border-t border-white/10 mt-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-4">Extended Profile Details</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-2">Blood Group</label>
                <input value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="e.g. O+" />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-2">Gov ID Type</label>
                <input value={formData.govIdType} onChange={e => setFormData({...formData, govIdType: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="e.g. PAN" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-2">Gov ID Number</label>
                <input value={formData.govIdNumber} onChange={e => setFormData({...formData, govIdNumber: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" />
              </div>
            </div>

            <h5 className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/70 mb-3">Emergency Contact</h5>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <input value={formData.emergencyContactName} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="Contact Name" />
              </div>
              <div>
                <input value={formData.emergencyContactRelation} onChange={e => setFormData({...formData, emergencyContactRelation: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="Relation (e.g. Spouse)" />
              </div>
              <div>
                <input value={formData.emergencyContactPhone} onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="Phone Number" />
              </div>
            </div>

            <h5 className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/70 mb-3">Bank Details</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <input value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="Bank Name" />
              </div>
              <div>
                <input value={formData.bankAccountNo} onChange={e => setFormData({...formData, bankAccountNo: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="Account No" />
              </div>
              <div>
                <input value={formData.bankIfsc} onChange={e => setFormData({...formData, bankIfsc: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="IFSC Code" />
              </div>
            </div>
          </div>

          <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg font-bold font-mono tracking-widest uppercase hover:bg-blue-500/30 transition-colors disabled:opacity-50">
            {isSubmitting ? "Processing..." : "Save Changes"}
          </button>
        </form>
      </SlideOver>

      <SlideOver title="Add Department" open={isAddDeptOpen} onClose={() => setIsAddDeptOpen(false)}>
        <form onSubmit={handleCreateDept} className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Department Name</label>
            <input required value={deptName} onChange={e => setDeptName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none" placeholder="e.g. Engineering" />
          </div>
          <button type="submit" className="w-full py-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold font-mono tracking-widest uppercase hover:bg-emerald-500/30 transition-colors">
            Create Department
          </button>
        </form>
      </SlideOver>

      {/* Credentials Modal */}
      <AnimatePresence>
        {credentialsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCredentialsModal(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[#0f1115] border border-emerald-500/20 rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Account Provisioned</h2>
              <p className="text-sm text-white/60 mb-6">A new secure account has been created. Please share these temporary credentials safely.</p>
              
              <div className="w-full bg-black/40 border border-white/10 rounded-xl p-4 mb-6 space-y-4">
                <div>
                  <p className="text-[10px] font-mono tracking-widest uppercase text-white/40 mb-1">Email / Login ID</p>
                  <p className="font-mono text-emerald-400 font-bold">{credentialsModal.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono tracking-widest uppercase text-white/40 mb-1">Temporary Password</p>
                  <p className="font-mono text-emerald-400 font-bold tracking-widest">{credentialsModal.password}</p>
                </div>
              </div>

              <button onClick={() => setCredentialsModal(null)} className="w-full py-3 bg-emerald-500 text-black font-bold font-mono uppercase tracking-widest rounded-lg hover:bg-emerald-400 transition-colors">
                I have copied them
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
