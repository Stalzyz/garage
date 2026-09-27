"use client"

import { useState, useEffect } from "react"
import { Activity, Search, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function SuperAdminActivityPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/activity")
      const data = await res.json()
      if (data.success && data.activities) {
        setActivities(data.activities)
      } else {
        setActivities([])
      }
    } catch {
      toast.error("Failed to load activity logs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const filteredActivities = activities.filter(a =>
    (a.who || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.action || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.target || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getActionColor = (action: string) => {
    if (action.includes("created") || action.includes("Created") || action.includes("APPROVED")) return "text-emerald-400"
    if (action.includes("Payment") || action.includes("paid") || action.includes("RECHARGED")) return "text-blue-400"
    if (action.includes("suspended") || action.includes("Suspended") || action.includes("REJECTED")) return "text-red-400"
    if (action.includes("Updated") || action.includes("updated") || action.includes("PENDING")) return "text-amber-400"
    return "text-zinc-300"
  }

  return (
    <div className="p-8 space-y-6 bg-dash-bg-base text-white min-h-screen font-sans">

      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Activity Audit Log</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time audit trail of all platform events — garage activations, float deposits, plan updates, and admin overrides.
          </p>
        </div>

        <button
          onClick={fetchActivities}
          className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
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
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-zinc-500 text-xs">Loading activity logs...</div>
          ) : filteredActivities.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">No platform activity recorded yet.</div>
          ) : (
            filteredActivities.map((act) => (
              <div
                key={act.id}
                className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/[0.04] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <Activity className={`w-4 h-4 ${getActionColor(act.action)}`} />
                  </div>
                  <div>
                    <div className="text-xs">
                      <strong className="text-white">{act.who}</strong>{" "}
                      <span className={getActionColor(act.action)}>{act.action}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{act.target}</div>
                  </div>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono self-end sm:self-auto">
                  {act.date}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}
