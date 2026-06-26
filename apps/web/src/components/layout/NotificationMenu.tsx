"use client"

import { useState, useRef, useEffect } from "react"
import { 
  Bell, CheckCircle2, Loader2, CreditCard, MessageSquare, 
  Trophy, Clock, AlertCircle, Info, X, CheckCheck, ExternalLink
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCurrentUser } from "@/context/CurrentUserContext"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

function getNotifIcon(type: string) {
  switch (type) {
    case "PAYMENT_RECEIVED":
      return <CreditCard className="w-4 h-4 text-emerald-400" />
    case "PAYMENT_OVERDUE":
      return <AlertCircle className="w-4 h-4 text-red-400" />
    case "NEW_MESSAGE":
      return <MessageSquare className="w-4 h-4 text-blue-400" />
    case "ASSIGNMENT_GRADED":
      return <Trophy className="w-4 h-4 text-amber-400" />
    case "DEADLINE_APPROACHING":
      return <Clock className="w-4 h-4 text-orange-400" />
    case "TASK_ASSIGNED":
      return <CheckCircle2 className="w-4 h-4 text-purple-400" />
    case "LEAVE_APPROVED":
      return <CheckCircle2 className="w-4 h-4 text-teal-400" />
    case "MILESTONE_REACHED":
      return <Trophy className="w-4 h-4 text-yellow-400" />
    default:
      return <Info className="w-4 h-4 text-white/50" />
  }
}

function getNotifAccent(type: string) {
  switch (type) {
    case "PAYMENT_RECEIVED":   return "border-emerald-500/30 bg-emerald-500/5"
    case "PAYMENT_OVERDUE":    return "border-red-500/30 bg-red-500/5"
    case "NEW_MESSAGE":        return "border-blue-500/30 bg-blue-500/5"
    case "ASSIGNMENT_GRADED":  return "border-amber-500/30 bg-amber-500/5"
    case "DEADLINE_APPROACHING": return "border-orange-500/30 bg-orange-500/5"
    case "TASK_ASSIGNED":      return "border-purple-500/30 bg-purple-500/5"
    case "MILESTONE_REACHED":  return "border-yellow-500/30 bg-yellow-500/5"
    default:                   return "border-white/10 bg-white/5"
  }
}

export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    isLoading,
  } = useCurrentUser()

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleNotifClick = (notif: any) => {
    if (!notif.isRead) {
      markNotificationRead(notif.id)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
        className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 hover:bg-white/10 transition-colors relative"
      >
        <Bell className={`w-4 h-4 transition-colors ${isOpen ? 'text-blue-400' : 'text-white/80'}`} />
        
        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-[9px] font-black text-white border-2 border-[#050505] shadow-[0_0_10px_rgba(236,72,153,0.5)]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse ring when there are unread */}
        {unreadCount > 0 && (
          <span className="absolute inset-0 rounded-xl ring-1 ring-pink-500/40 animate-ping pointer-events-none" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            {/* Panel */}
            <motion.div 
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 top-11 w-96 bg-[#0a0a0a]/98 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-white/[0.03] to-transparent">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-blue-400" />
                  <h3 className="font-bold text-white text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-400 text-[10px] font-black">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllNotificationsRead} 
                      className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase font-bold text-blue-400 hover:text-blue-300 transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-3 h-3" />
                      All read
                    </button>
                  )}
                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="text-white/30 hover:text-white/80 transition-colors ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              {/* Notification List */}
              <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-white/30" />
                    <span className="text-white/30 text-xs">Loading notifications...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/30">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">All caught up!</p>
                      <p className="text-xs mt-1 text-white/20">No notifications yet.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    <AnimatePresence initial={false}>
                      {notifications.map((notif, idx) => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: notif.isRead ? 0.55 : 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          onClick={() => handleNotifClick(notif)}
                          className={`
                            group flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150
                            ${notif.isRead 
                              ? 'border-white/5 bg-transparent hover:bg-white/3' 
                              : `${getNotifAccent(notif.type)} hover:brightness-125`
                            }
                          `}
                        >
                          {/* Icon */}
                          <div className="shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center">
                            {getNotifIcon(notif.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold text-white leading-tight line-clamp-1">
                                {!notif.isRead && (
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5 mb-0.5 align-middle" />
                                )}
                                {notif.title}
                              </p>
                              <span className="text-[9px] font-mono text-white/30 shrink-0 mt-0.5">
                                {notif.createdAt 
                                  ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                                  : "now"
                                }
                              </span>
                            </div>
                            <p className="text-[11px] text-white/55 mt-1 leading-relaxed line-clamp-2">
                              {notif.body}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="p-3 border-t border-white/10 bg-black/30">
                <Link 
                  href="/dashboard/notifications"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 text-[10px] font-mono tracking-widest uppercase font-bold text-white/40 hover:text-white transition-colors"
                >
                  <span>View all notifications</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
