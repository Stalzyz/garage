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

function NotifIcon({ type }: { type: string }) {
  const cls = "w-4 h-4 text-zinc-300"
  switch (type) {
    case "PAYMENT_RECEIVED":     return <IndianRupee className={cls} />
    case "PAYMENT_OVERDUE":      return <AlertCircle className="w-4 h-4 text-rose-400" />
    case "NEW_MESSAGE":          return <MessageSquare className={cls} />
    case "ASSIGNMENT_GRADED":    return <GraduationCap className={cls} />
    case "DEADLINE_APPROACHING": return <Clock className={cls} />
    case "TASK_ASSIGNED":        return <Briefcase className={cls} />
    case "LEAVE_APPROVED":       return <Users className={cls} />
    case "MILESTONE_REACHED":    return <Trophy className={cls} />
    case "APPROVAL_NEEDED":      return <CheckCircle2 className={cls} />
    default:                     return <Settings className={cls} />
  }
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, isLoading } = useCurrentUser()
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const filtered = filter === "unread"
    ? notifications.filter((n: any) => !n.isRead)
    : notifications

  return (
    <div className="flex flex-col h-full bg-[#000000] text-white overflow-y-auto custom-scrollbar font-sans">
      {/* Page Header */}
      <div className="px-6 py-6 border-b border-white/[0.08] bg-[#0a0a0c]">
        <div className="max-w-3xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300">
                <Bell className="w-4 h-4 text-zinc-300" />
              </div>
              Notifications
            </h1>
            <p className="text-zinc-400 mt-1 text-xs">
              {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : "All notifications are caught up"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Apple Segmented Filter Tabs */}
            <div className="flex bg-white/[0.04] border border-white/[0.08] rounded-lg p-0.5">
              {(["all", "unread"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    filter === f ? "bg-white/[0.12] text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {f === "unread" && unreadCount > 0 ? `Unread (${unreadCount})` : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg text-xs font-medium text-zinc-300 hover:text-white transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5 text-zinc-400" />
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-6 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
            <p className="text-zinc-500 text-xs">Loading notifications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3 text-zinc-500">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400">
              <Bell className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-300">No Notifications</p>
              <p className="text-xs mt-0.5 text-zinc-500">
                {filter === "unread" ? "You have read all current updates." : "No activity recorded yet."}
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-2">
            <AnimatePresence initial={false}>
              {filtered.map((notif: any, idx: number) => {
                const label = NOTIF_TYPE_LABELS[notif.type] || "System"

                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: notif.isRead ? 0.65 : 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => !notif.isRead && markNotificationRead(notif.id)}
                    className={`
                      group relative flex items-start gap-3.5 p-4 rounded-xl border transition-all duration-150 cursor-pointer
                      ${notif.isRead 
                        ? 'border-white/[0.05] bg-[#121214]/60 hover:bg-[#161618]' 
                        : 'border-white/[0.08] bg-[#161618] hover:bg-[#1a1a1e] shadow-sm'
                      }
                    `}
                  >
                    {/* Icon container */}
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                      <NotifIcon type={notif.type} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-medium text-zinc-400 tracking-wide uppercase">
                              {label}
                            </span>
                          </div>
                          <h3 className="text-xs font-semibold text-white truncate">{notif.title}</h3>
                          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{notif.body}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[11px] text-zinc-500 whitespace-nowrap">
                            {notif.createdAt 
                              ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                              : "—"
                            }
                          </p>
                        </div>
                      </div>

                      {notif.link && (
                        <a 
                          href={notif.link}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 mt-2.5 text-xs text-primary hover:underline font-medium transition-colors"
                        >
                          View details →
                        </a>
                      )}
                    </div>

                    {/* Apple Blue unread dot */}
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 self-center ml-1" />
                    )}

                    {/* Mark as read on hover */}
                    {!notif.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markNotificationRead(notif.id) }}
                        className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 rounded-md hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-all self-center"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
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
