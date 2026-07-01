import re

with open("apps/web/app/dashboard/hr/page.tsx", "r") as f:
    content = f.read()

# Add states
states = """  const { data: rolesData } = useApi<any>("/settings/roles")
  const roles = rolesData?.roles || []

  const { data: deptData, mutate: mutateDepts } = useApi<any>("/hr/departments")
  const departments = deptData?.departments || []

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false)
  const [deptName, setDeptName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [credentialsModal, setCredentialsModal] = useState<{email: string, password: string} | null>(null)
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    designation: "",
    salary: "",
    departmentId: "",
    customRoleId: "",
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
        customRoleId: formData.customRoleId || undefined
      }
      const res = await fetchApi<any>("/hr/employees", {
        method: "POST",
        body: JSON.stringify(payload)
      })
      toast.success("Personnel created successfully")
      if (res.credentials) setCredentialsModal(res.credentials)
      setIsAddOpen(false)
      setFormData({ firstName: "", lastName: "", email: "", designation: "", salary: "", departmentId: "", customRoleId: "" })
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
        customRoleId: formData.customRoleId || undefined
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
"""

content = re.sub(r'  const filtered = employees\.filter', states + '\n  const filtered = employees.filter', content)

# Fix filter matching
content = content.replace("emp.user?.name?.toLowerCase()", "((emp.user?.firstName || \"\") + \" \" + (emp.user?.lastName || \"\")).toLowerCase()")

# Add buttons
buttons = """        <div className="flex gap-4">
          <button onClick={() => setIsAddDeptOpen(true)} className="flex items-center gap-2 bg-white/5 text-white/50 border border-white/10 text-[10px] font-mono font-bold tracking-widest uppercase px-5 py-3 rounded-xl hover:bg-white/10 hover:text-white transition-all">
            <Plus className="w-4 h-4" /> Add Dept
          </button>
          <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold tracking-widest uppercase px-5 py-3 rounded-xl hover:bg-emerald-500/30 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Plus className="w-4 h-4" /> Add Personnel
          </button>
        </div>"""
content = re.sub(r'        </div>\n        \n      </div>', '        </div>\n        \n' + buttons + '\n      </div>', content)


# Fix cards mapping
content = content.replace("emp.user?.name?.charAt(0)", "emp.user?.firstName?.charAt(0)")
content = content.replace("emp.user?.name", "`${emp.user?.firstName || \"\"} ${emp.user?.lastName || \"\"}`")
content = content.replace("emp.designation", "emp.jobTitle")

# Add Modals
modals = """
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
"""
content = content.replace("    </div>\n  )\n}", modals + "\n    </div>\n  )\n}")

# Also replace the EmployeeActivity component usage block from the old file
# Wait, the file reverted to BEFORE I added EmployeeActivity.tsx, but the file EmployeeActivity.tsx is still there!
# Let me just ensure the old EmployeeActivity render is present if the user clicks.
# I will use multi_replace_file_content for the slide-over pane replacing.

with open("apps/web/app/dashboard/hr/page.tsx", "w") as f:
    f.write(content)
