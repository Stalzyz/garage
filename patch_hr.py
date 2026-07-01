import re

with open("apps/web/app/dashboard/hr/page.tsx", "r") as f:
    content = f.read()

# 1. State for resetting
reset_state = """
  const [isResetting, setIsResetting] = useState(false)

  const handleResetPassword = async () => {
    if (!selectedEmployee) return
    setIsResetting(true)
    try {
      const res = await fetchApi<any>(`/hr/employees/${selectedEmployee.id}/reset-password`, {
        method: "POST"
      })
      toast.success("Password reset successfully")
      if (res.credentials) {
        setCredentialsModal(res.credentials)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password")
    } finally {
      setIsResetting(false)
    }
  }
"""
content = re.sub(r'const handleDeleteEmployee = async \(\) => \{.*?\}\n  \}', r'\g<0>\n' + reset_state, content, flags=re.DOTALL)


# 2. Reset Button in SlideOver
reset_btn = """
                  <button onClick={openEdit} className="text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg text-xs font-mono tracking-widest uppercase flex items-center gap-2">
                    Edit Profile
                  </button>
                  <button onClick={handleResetPassword} disabled={isResetting} className="text-blue-400 hover:text-white transition-colors bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-2 rounded-lg text-xs font-mono tracking-widest uppercase flex items-center gap-2 disabled:opacity-50">
                    <Lock className="w-3 h-3" /> {isResetting ? "Resetting..." : "Reset Password"}
                  </button>
"""
content = content.replace(
    '<button onClick={openEdit} className="text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg text-xs font-mono tracking-widest uppercase flex items-center gap-2">\n                    Edit Profile\n                  </button>',
    reset_btn.strip()
)

with open("apps/web/app/dashboard/hr/page.tsx", "w") as f:
    f.write(content)
