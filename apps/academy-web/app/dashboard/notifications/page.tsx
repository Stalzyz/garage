"use client"

import { useState } from "react"
import { 
  Bell, CreditCard, MessageSquare, Trophy, Clock, AlertCircle, Info,
  CheckCheck, Loader2, CheckCircle2, IndianRupee, GraduationCap, 
  Users, Settings, Briefcase, X
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCurrentUser } from "@/context/CurrentUserContext"
import { formatDistanceToNow, format } from "date-fns"

const NOTIF_TYPE_LABELS: Record<string, string> = {
  PAYMENT_RECEIVED: "Payment",
  PAYMENT_OVERDUE: "Payment",
  NEW_MESSAGE: "Message",
  ASSIGNMENT_GRADED: "Academy",
  DEADLINE_APPROACHING: "Deadline",
  TASK_ASSIGNED: "Task",
  LEAVE_APPROVED: "HR",
  MILESTONE_REACHED: "Milestone",
  APPROVAL_NEEDED: "Approval",
  SYSTEM: "System",
}

const NOTIF_COLORS: Record<string, string> = {
  PAYMENT_RECEIVED: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  PAYMENT_OVERDUE: "text-red-400 bg-red-500/10 border-red-500/20",
  NEW_MESSAGE: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  ASSIGNMENT_GRADED: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  DEADLINE_APPROACHING: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  TASK_ASSIGNED: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  LEAVE_APPROVED: "text-teal-400 bg-teal-500/10 border-teal-500/20",
  MILESTONE_REACHED: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  APPROVAL_NEEDED: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  SYSTEM: "text-white/50 bg-white/5 border-white/10",
}

function NotifIcon({ type }: { type: string }) {
  const cls = "w-5 h-5"
  switch (type) {
    case "PAYMENT_RECEIVED":     return <IndianRupee className={`${cls} text-emerald-400`} />
    case "PAYMENT_OVERDUE":      return <AlertCircle className={`${cls} text-red-400`} />
    case "NEW_MESSAGE":          return <MessageSquare className={`${cls} text-blue-400`} />
    case "ASSIGNMENT_GRADED":    return <GraduationCap className={`${cls} text-amber-400`} />
    case "DEADLINE_APPROACHING": return <Clock className={`${cls} text-orange-400`} />
    case "TASK_ASSIGNED":        return <Briefcase className={`${cls} text-purple-400`} />
    case "LEAVE_APPROVED":       return <Users className={`${cls} text-teal-400`} />
    case "MILESTONE_REACHED":    return <Trophy className={`${cls} text-yellow-400`} />
    case "APPROVAL_NEEDED":      return <CheckCircle2 className={`${cls} text-violet-400`} />
    default:                     return <Settings className={`${cls} text-white/50`} />
  }
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, isLoading } = useCurrentUser()
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const filtered = filter === "unread"
    ? notifications.filter((n: any) => !n.isRead)
    : notifications

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-y-auto custom-scrollbar">
      {/* Page Header */}
      <div className="px-8 py-8 border-b border-white/10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-600/20 border border-pink-500/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-pink-400" />
              </div>
              Notification Hub
            </h1>
            <p className="text-white/40 mt-1 text-sm">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : "You're all caught up!"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex rounded-xl border border-white/10 overflow-hidden">
              {(["all", "unread"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                    filter === f ? "bg-blue-600 text-white" : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {f === "unread" && unreadCount > 0 ? `Unread (${unreadCount})` : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white/60 hover:text-white transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-8 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-white/20" />
            <p className="text-white/30 text-sm">Loading notifications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-white/30">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Bell className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">All quiet here!</p>
              <p className="text-sm mt-1 text-white/20">
                {filter === "unread" ? "No unread notifications." : "No notifications yet."}
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-3">
            <AnimatePresence initial={false}>
              {filtered.map((notif: any, idx: number) => {
                const color = NOTIF_COLORS[notif.type] || NOTIF_COLORS.SYSTEM
                const label = NOTIF_TYPE_LABELS[notif.type] || "System"

                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: notif.isRead ? 0.6 : 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => !notif.isRead && markNotificationRead(notif.id)}
                    className={`
                      group relative flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition-all duration-200
                      ${notif.isRead 
                        ? 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]' 
                        : 'border-white/10 bg-white/5 hover:bg-white/8 shadow-sm'
                      }
                    `}
                  >
                    {/* Unread left bar */}
                    {!notif.isRead && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-blue-500 rounded-r-full" />
                    )}

                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${color}`}>
                      <NotifIcon type={notif.type} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${color}`}>
                              {label}
                            </span>
                            {!notif.isRead && (
                              <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 animate-pulse">
                                NEW
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-white">{notif.title}</h3>
                          <p className="text-xs text-white/55 mt-1 leading-relaxed">{notif.body}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[10px] text-white/30 font-mono whitespace-nowrap">
                            {notif.createdAt 
                              ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                              : "—"
                            }
                          </p>
                          {notif.createdAt && (
                            <p className="text-[9px] text-white/20 font-mono mt-0.5">
                              {format(new Date(notif.createdAt), "MMM d, h:mm a")}
                            </p>
                          )}
                        </div>
                      </div>

                      {notif.link && (
                        <a 
                          href={notif.link}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 mt-3 text-[10px] text-blue-400 hover:text-blue-300 font-mono transition-colors border border-blue-500/20 bg-blue-500/5 px-2.5 py-1 rounded-lg"
                        >
                          View details →
                        </a>
                      )}
                    </div>

                    {/* Mark as read on hover */}
                    {!notif.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markNotificationRead(notif.id) }}
                        className="opacity-0 group-hover:opacity-100 shrink-0 w-8 h-8 rounded-xl bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 flex items-center justify-center transition-all"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5 text-white/30 group-hover:text-blue-400" />
                      </button>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
