"use client"

import { Shield, Plus, Lock, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RolesPage() {
  const roles = [
    { id: 1, name: "Super Admin", users: 2, type: "System", desc: "Full access to all modules and system settings." },
    { id: 2, name: "HR Manager", users: 1, type: "Custom", desc: "Access to Payroll, Leaves, and Employee Directory." },
    { id: 3, name: "Instructor", users: 5, type: "System", desc: "Access to LMS, grading, and batch management." },
    { id: 4, name: "Sales Executive", users: 3, type: "Custom", desc: "Access to CRM, Leads, and Proposals only." }
  ]

  const modules = ["CRM & Sales", "Projects", "Finance", "HR & Payroll", "LMS & Academy", "Marketing Hub", "Support Helpdesk", "System Settings"]

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
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
          <Plus className="w-4 h-4" /> Create Custom Role
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left List */}
        <div className="w-1/3 border-r border-white/10 bg-black/20 p-6 overflow-y-auto custom-scrollbar">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Active Roles</h2>
          <div className="space-y-3">
            {roles.map(role => (
              <div key={role.id} className="bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">{role.name}</h3>
                  {role.type === 'System' && (
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-mono">SYSTEM</span>
                  )}
                </div>
                <p className="text-xs text-white/50 mb-3">{role.desc}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono">
                  <Users className="w-3 h-3" /> {role.users} Users assigned
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
                <h2 className="text-xl font-bold">Edit Permissions: HR Manager</h2>
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
                  {modules.map((mod, i) => {
                    // Just mock some logical defaults for the "HR Manager" visual
                    const isHr = mod === "HR & Payroll"
                    const isGeneral = mod === "Projects" || mod === "Support Helpdesk"
                    return (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="p-4 font-bold text-sm">{mod}</td>
                        <td className="p-4 text-center">
                          <input type="checkbox" defaultChecked={isHr || isGeneral} className="accent-blue-500 w-4 h-4" />
                        </td>
                        <td className="p-4 text-center">
                          <input type="checkbox" defaultChecked={isHr} className="accent-blue-500 w-4 h-4" />
                        </td>
                        <td className="p-4 text-center">
                          <input type="checkbox" defaultChecked={isHr} className="accent-blue-500 w-4 h-4" />
                        </td>
                        <td className="p-4 text-center">
                          <input type="checkbox" defaultChecked={false} className="accent-blue-500 w-4 h-4" />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end">
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-colors">
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
