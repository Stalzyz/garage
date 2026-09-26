"use client"

import { useState } from "react"
import { Activity, Search } from "lucide-react"

export default function SuperAdminActivityPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const [activities] = useState([
    { id: "act-1", who: "Apex SaaS Partners (Reseller)", action: "Created garage", target: "XYZ Auto Care", date: "2026-09-26 15:05" },
    { id: "act-2", who: "Grekam Super Admin", action: "Updated Growth Plan pricing", target: "Growth Garage Plan", date: "2026-09-26 14:20" },
    { id: "act-3", who: "Speedy Motors (Garage)", action: "Payment received", target: "₹29,999 - Growth Garage", date: "2026-09-26 12:00" },
    { id: "act-4", who: "Vanguard Resellers", action: "Custom domain verified", target: "garage.vanguard.io", date: "2026-09-26 10:15" },
    { id: "act-5", who: "Grekam Super Admin", action: "Reseller created", target: "Royal Auto Agency", date: "2026-09-25 18:30" },
    { id: "act-6", who: "Apex SaaS Partners (Reseller)", action: "White label branding updated", target: "Apex Auto Network", date: "2026-09-25 15:00" },
    { id: "act-7", who: "Grekam Super Admin", action: "Garage suspended", target: "Legacy Motors (inactive)", date: "2026-09-24 12:00" },
    { id: "act-8", who: "City Auto Garage (Direct)", action: "Plan upgraded", target: "Basic → Growth Garage", date: "2026-09-24 10:00" },
  ])

  const filteredActivities = activities.filter(a =>
    a.who.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.target.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getActionColor = (action: string) => {
    if (action.includes("created") || action.includes("Created")) return "text-emerald-400"
    if (action.includes("Payment") || action.includes("paid")) return "text-blue-400"
    if (action.includes("suspended") || action.includes("Suspended")) return "text-red-400"
    if (action.includes("Updated") || action.includes("updated")) return "text-amber-400"
    if (action.includes("verified") || action.includes("upgraded")) return "text-purple-400"
    return "text-zinc-300"
  }

  return (
    <div className="p-8 space-y-6 bg-dash-bg-base text-white min-h-screen font-sans">

      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Audit trail of all platform events — garage creation, payments, plan changes, and admin actions.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by who, action, or target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 text-zinc-400 uppercase text-[10px] font-semibold bg-white/[0.02]">
              <th className="py-3.5 px-4">Who</th>
              <th className="py-3.5 px-4">Action</th>
              <th className="py-3.5 px-4">Garage / Reseller / Target</th>
              <th className="py-3.5 px-4 text-right">Date & Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredActivities.map((a) => (
              <tr key={a.id} className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-4 font-semibold text-white">{a.who}</td>
                <td className={`py-3.5 px-4 font-medium ${getActionColor(a.action)}`}>{a.action}</td>
                <td className="py-3.5 px-4 text-zinc-400">{a.target}</td>
                <td className="py-3.5 px-4 text-right text-zinc-500">{a.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
