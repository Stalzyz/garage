"use client"

import { Shield, Plus, Lock, Users, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useApi, fetchApi } from "@/lib/useApi"
import { SlideOver } from "@/components/SlideOver"
import { toast } from "sonner"

const SYSTEM_MODULES = ["CRM & Sales", "Projects", "Finance", "HR & Payroll", "LMS & Academy", "Marketing Hub", "Support Helpdesk", "System Settings"]

export default function RolesPage() {
  const { data, mutate, isLoading } = useApi<any>("/settings/roles")
  const roles = data?.roles || []

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [localPermissions, setLocalPermissions] = useState<any[]>([])
  
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleDesc, setNewRoleDesc] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingPerms, setIsSavingPerms] = useState(false)

  const selectedRole = roles.find((r: any) => r.id === selectedRoleId) || roles[0]

  useEffect(() => {
    if (selectedRole) {
      setLocalPermissions(selectedRole.permissions || [])
      setSelectedRoleId(selectedRole.id)
    }
  }, [selectedRole?.id, roles.length])

  const handleTogglePerm = (mod: string, action: string) => {
    setLocalPermissions(prev => {
      const exists = prev.find(p => p.resource === mod && p.action === action)
      if (exists) {
        return prev.filter(p => !(p.resource === mod && p.action === action))
      }
      return [...prev, { resource: mod, action }]
    })
  }

  const hasPerm = (mod: string, action: string) => {
    return localPermissions.some(p => p.resource === mod && p.action === action)
  }

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi("/settings/roles", {
        method: "POST",
        body: JSON.stringify({
          name: newRoleName,
          description: newRoleDesc,
          permissions: [] // default empty perms
        })
      })
      toast.success("Role created successfully")
      setIsAddOpen(false)
      setNewRoleName("")
      setNewRoleDesc("")
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to create role")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSavePerms = async () => {
    if (!selectedRoleId) return
    setIsSavingPerms(true)
    try {
      await fetchApi(`/settings/roles/${selectedRoleId}`, {
        method: "PATCH",
        body: JSON.stringify({
          permissions: localPermissions.map(p => ({ resource: p.resource, action: p.action }))
        })
      })
      toast.success("Permissions updated successfully")
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to update permissions")
    } finally {
      setIsSavingPerms(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" /> Roles & Permissions
            </h1>
          </div>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
          <Plus className="w-4 h-4" /> Create Custom Role
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left List */}
        <div className="w-1/3 border-r border-white/10 bg-black/20 p-6 overflow-y-auto custom-scrollbar">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Active Roles</h2>
          <div className="space-y-3">
            {isLoading && <div className="p-4 text-white/40">Loading roles...</div>}
            {roles.map((role: any) => (
              <div 
                key={role.id} 
                onClick={() => setSelectedRoleId(role.id)}
                className={`border rounded-xl p-4 cursor-pointer transition-all ${selectedRoleId === role.id ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/5 border-white/10 hover:border-blue-500/30'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">{role.name}</h3>
                  {role.name === 'Super Admin' && (
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-mono">SYSTEM</span>
                  )}
                </div>
                <p className="text-xs text-white/50 mb-3">{role.description}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono">
                  <Users className="w-3 h-3" /> Custom Role
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Editor */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
          <div className="max-w-3xl bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Edit Permissions: {selectedRole?.name}</h2>
                <p className="text-xs text-white/50 mt-1">Configure what users with this role can view or modify.</p>
              </div>
              <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg">
                <Lock className="w-4 h-4 text-white/50" />
              </button>
            </div>
            
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-[10px] uppercase tracking-widest text-white/40">
                    <th className="p-4 font-bold">Module / Resource</th>
                    <th className="p-4 text-center font-bold">View</th>
                    <th className="p-4 text-center font-bold">Create</th>
                    <th className="p-4 text-center font-bold">Edit</th>
                    <th className="p-4 text-center font-bold">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {SYSTEM_MODULES.map((mod, i) => {
                    return (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="p-4 font-bold text-sm">{mod}</td>
                        <td className="p-4 text-center">
                          <input type="checkbox" checked={hasPerm(mod, 'VIEW')} onChange={() => handleTogglePerm(mod, 'VIEW')} className="accent-blue-500 w-4 h-4" />
                        </td>
                        <td className="p-4 text-center">
                          <input type="checkbox" checked={hasPerm(mod, 'CREATE')} onChange={() => handleTogglePerm(mod, 'CREATE')} className="accent-blue-500 w-4 h-4" />
                        </td>
                        <td className="p-4 text-center">
                          <input type="checkbox" checked={hasPerm(mod, 'EDIT')} onChange={() => handleTogglePerm(mod, 'EDIT')} className="accent-blue-500 w-4 h-4" />
                        </td>
                        <td className="p-4 text-center">
                          <input type="checkbox" checked={hasPerm(mod, 'DELETE')} onChange={() => handleTogglePerm(mod, 'DELETE')} className="accent-blue-500 w-4 h-4" />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end">
              <button onClick={handleSavePerms} disabled={isSavingPerms} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                {isSavingPerms ? "Saving..." : "Save Permissions"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <SlideOver
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Custom Role"
        subtitle="Define a new role and configure its permissions later."
      >
        <form onSubmit={handleCreateRole} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Role Name *</label>
            <input 
              required
              value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/30"
              placeholder="e.g. Sales Executive"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Description</label>
            <textarea 
              value={newRoleDesc}
              onChange={e => setNewRoleDesc(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/30 min-h-[100px]"
              placeholder="Access to CRM, Leads, and Proposals only."
            />
          </div>
          <div className="pt-4 mt-6 border-t border-white/10">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Role"}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}
