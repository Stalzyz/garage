"use client"

import { useState } from "react"
import { Search, Plus, Filter, Mail, Phone, Calendar, MoreVertical, MapPin, Users, Upload, X, FileText, Printer, LayoutGrid, List } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { SlideOver } from "@/components/SlideOver"
import { EmployeeActivity } from "./EmployeeActivity"
import { CheckCircle2, File } from "lucide-react"
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const { data: rolesData } = useApi<any>("/settings/roles")
  const roles = rolesData?.roles || []

  const { data: deptData, mutate: mutateDepts } = useApi<any>("/hr/departments")
  const departments = deptData?.data || []

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
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.designation || !formData.salary) {
      toast.error("Please fill all required fields (Name, Email, Job Title, Salary)")
      return
    }
    
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
      if (res.error) throw new Error(res.error)
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
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.designation || !formData.salary) {
      toast.error("Please fill all required fields (Name, Email, Job Title, Salary)")
      return
    }
    
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
    if(!selectedEmployee || !selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    setIsUploading(true)
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      const { downloadUrl, success, error } = await fetchApi<any>('/storage/upload-local', {
        method: 'POST',
        body: formData as any,
        headers: {
          // Do not set Content-Type to application/json, let browser set multipart boundary
        }
      });
      
      if (!success) throw new Error(error || "Failed to upload file");

      // 3. Save document reference to database
      await fetchApi(`/hr/employees/${selectedEmployee.id}/documents`, {
        method: "POST",
        body: JSON.stringify({ 
          name: uploadData.name || selectedFile.name, 
          type: uploadData.type, 
          fileUrl: downloadUrl,
          uploadedBy: "HR Administrator"
        })
      })
      
      toast.success("Document uploaded successfully")
      const res = await fetchApi<any>(`/hr/employees/${selectedEmployee.id}`)
      setSelectedEmployee(res.employee)
      mutate()
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || "Failed to upload document")
    } finally {
      setIsUploading(false)
      setUploadData({ name: "", type: "ID_PROOF" })
      setSelectedFile(null)
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
    <div className="flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar bg-black text-[#f5f5f7] p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#161618] border border-white/[0.08] flex items-center justify-center">
            <Users className="w-4 h-4 text-[#0A84FF]" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#f5f5f7]">Team Directory</h1>
            <p className="text-xs text-zinc-400">Employees, departments, and organization roles</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsAddDeptOpen(true)}
            className="flex items-center gap-1.5 bg-transparent hover:bg-white/[0.06] border border-white/[0.08] text-zinc-300 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Department
          </button>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-white/[0.06] py-3.5">
        <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          {DEPARTMENTS.map(dept => (
            <button
              key={dept}
              onClick={() => setDeptFilter(dept)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${
                deptFilter === dept
                  ? "bg-white/[0.12] text-white border-white/[0.16]"
                  : "bg-[#121214] border-white/[0.08] text-zinc-400 hover:text-white"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2.5">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search team..."
              className="w-full bg-[#121214] border border-white/[0.08] focus:border-[#0A84FF] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#f5f5f7] placeholder:text-zinc-500 focus:outline-none transition-colors"
            />
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-[#1c1c1e] border border-white/[0.08] rounded-lg p-0.5">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white/[0.12] text-white" : "text-zinc-400 hover:text-white"}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white/[0.12] text-white" : "text-zinc-400 hover:text-white"}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((emp: any) => (
              <div 
                key={emp.id} 
                onClick={() => setSelectedEmployee(emp)}
                className="cursor-pointer bg-[#161618] border border-white/[0.08] hover:border-white/[0.16] rounded-xl p-4 transition-colors flex flex-col group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md border bg-[#30D158]/10 text-[#30D158] border-[#30D158]/20">
                    Active
                  </span>
                  <button className="text-zinc-500 hover:text-white p-1 transition-colors">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1c1c1e] border border-white/[0.08] flex items-center justify-center text-base font-semibold text-white mb-2.5">
                    {emp.user?.firstName?.charAt(0) || "U"}
                  </div>
                  <h3 className="text-sm font-medium text-[#f5f5f7] mb-0.5 group-hover:text-[#0A84FF] transition-colors">{`${emp.user?.firstName || ""} ${emp.user?.lastName || ""}`}</h3>
                  <p className="text-[11px] text-zinc-400">{emp.jobTitle}</p>
                </div>

                <div className="space-y-2 mt-auto pt-3 border-t border-white/[0.06] text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-zinc-500 flex-none" />
                    <span className="truncate text-[11px]">{emp.user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-zinc-500 flex-none" />
                    <span className="tabular-nums text-[11px]">{emp.phone || "No phone"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#161618] border border-white/[0.08] rounded-xl overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-[#121214] text-[11px] font-medium text-zinc-400">
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-xs">
                  {filtered.map((emp: any) => (
                    <tr 
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#1c1c1e] border border-white/[0.08] flex items-center justify-center text-xs font-semibold text-white group-hover:text-[#0A84FF] transition-colors">
                            {emp.user?.firstName?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-medium text-[#f5f5f7] group-hover:text-[#0A84FF] transition-colors">{`${emp.user?.firstName || ""} ${emp.user?.lastName || ""}`}</p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{emp.employeeCode || "EMP-000"}</p>
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
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md border bg-[#30D158]/10 text-[#30D158] border-[#30D158]/20">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-zinc-500 hover:text-white p-1.5 rounded-md hover:bg-white/[0.08] transition-colors">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
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
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedEmployee(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-[#0f1115] border border-white/10 rounded-t-[2rem] md:rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[85vh] mt-auto md:mt-0"
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
                      <div>
                        <label className="block text-xs text-white/50 mb-1 font-mono uppercase tracking-widest">Select File</label>
                        <input 
                          type="file"
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setSelectedFile(file)
                              if (!uploadData.name) {
                                setUploadData({...uploadData, name: file.name.split('.')[0]})
                              }
                            }
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500/50 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 transition-all"
                        />
                      </div>
                      <button 
                        onClick={handleUpload} disabled={isUploading || !selectedFile}
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
              <input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Last Name</label>
              <input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Email</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Job Title</label>
            <input value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Department</label>
            <select value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none">
              <option value="" className="bg-[#090d16]">Select Department...</option>
              {departments.map((d: any) => <option key={d.id} value={d.id} className="bg-[#090d16]">{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Access Role</label>
            <select value={formData.customRoleId} onChange={e => setFormData({...formData, customRoleId: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none">
              <option value="" className="bg-[#090d16]">Default Access...</option>
              {roles.map((r: any) => <option key={r.id} value={r.id} className="bg-[#090d16]">{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Base Salary (INR)</label>
            <input type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
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

          <div className="sticky bottom-0 bg-[#0a0a0a] pt-4 pb-6 -mb-6 -mx-6 px-6 border-t border-white/10 mt-6 z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.5)]">
            <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold font-mono tracking-widest uppercase hover:bg-emerald-500/30 transition-colors disabled:opacity-50">
              {isSubmitting ? "Processing..." : "Create Personnel"}
            </button>
          </div>
        </form>
      </SlideOver>

      <SlideOver title="Edit Profile" open={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <form onSubmit={handleUpdateEmployee} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">First Name</label>
              <input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Last Name</label>
              <input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Email</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Job Title</label>
            <input value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Department</label>
            <select value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none">
              <option value="" className="bg-[#090d16]">Select Department...</option>
              {departments.map((d: any) => <option key={d.id} value={d.id} className="bg-[#090d16]">{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Access Role</label>
            <select value={formData.customRoleId} onChange={e => setFormData({...formData, customRoleId: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none">
              <option value="" className="bg-[#090d16]">Default Access...</option>
              {roles.map((r: any) => <option key={r.id} value={r.id} className="bg-[#090d16]">{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Base Salary (INR)</label>
            <input type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
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
          <div className="sticky bottom-0 bg-[#0a0a0a] pt-4 pb-6 -mb-6 -mx-6 px-6 border-t border-white/10 mt-6 z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.5)]">
            <button type="submit" className="w-full py-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold font-mono tracking-widest uppercase hover:bg-emerald-500/30 transition-colors">
              Create Department
            </button>
          </div>
        </form>
      </SlideOver>

      {/* Credentials Modal */}
      <AnimatePresence>
        {credentialsModal && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCredentialsModal(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative bg-[#0f1115] border border-emerald-500/20 rounded-t-[2rem] md:rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center mt-auto md:mt-0">
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
