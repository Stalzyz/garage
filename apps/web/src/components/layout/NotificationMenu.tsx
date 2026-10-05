"use client"

import { useState, useRef, useEffect } from "react"
import { AlertCircle, Bell, CheckCheck, CheckCircle2, Clock, CreditCard, ExternalLink, Info, Loader2, MessageSquare, Trophy, X } from "lucide-react"
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
        className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0 hover:bg-white/[0.08] transition-colors relative"
      >
        <Bell className={`w-3.5 h-3.5 transition-colors ${isOpen ? 'text-[#0A84FF]' : 'text-zinc-400'}`} />
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-1 rounded-full bg-[#FF453A] flex items-center justify-center text-[9px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            {/* Panel */}
            <motion.div 
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 top-9 w-80 bg-[#1c1c1e] border border-white/[0.08] rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.6)] z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-3.5 py-2.5 border-b border-white/[0.07] flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[#f5f5f7] text-xs">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-white/[0.08] text-zinc-300 text-[10px] font-medium">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllNotificationsRead} 
                      className="text-[11px] font-medium text-[#0A84FF] hover:underline transition-colors"
                      title="Mark all as read"
                    >
                      Mark read
                    </button>
                  )}
                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              {/* Notification List */}
              <div className="max-h-[360px] overflow-y-auto custom-scrollbar divide-y divide-white/[0.04]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                    <span className="text-zinc-500 text-xs">Loading...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-zinc-500">
                    <Bell className="w-5 h-5 text-zinc-600" />
                    <p className="text-xs">No notifications</p>
                  </div>
                ) : (
                  <div className="p-1 space-y-0.5">
                    <AnimatePresence initial={false}>
                      {notifications.map((notif, idx) => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: notif.isRead ? 0.6 : 1 }}
                          onClick={() => handleNotifClick(notif)}
                          className={`
                            group flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors
                            ${notif.isRead 
                              ? 'bg-transparent hover:bg-white/[0.03]' 
                              : 'bg-white/[0.04] hover:bg-white/[0.07]'
                            }
                          `}
                        >
                          {/* Icon */}
                          <div className="shrink-0 mt-0.5 w-6 h-6 rounded-md bg-white/[0.06] flex items-center justify-center">
                            {getNotifIcon(notif.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1.5">
                              <p className="text-xs font-medium text-[#f5f5f7] leading-snug line-clamp-1">
                                {!notif.isRead && (
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0A84FF] mr-1.5 mb-0.5 align-middle" />
                                )}
                                {notif.title}
                              </p>
                              <span className="text-[10px] text-zinc-500 shrink-0 tabular-nums">
                                {notif.createdAt 
                                  ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                                  : "now"
                                }
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal line-clamp-2">
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
              <div className="p-2 border-t border-white/[0.07] bg-white/[0.01]">
                <Link 
                  href="/dashboard/notifications"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-zinc-400 hover:text-[#f5f5f7] transition-colors py-1"
                >
                  <span>All notifications</span>
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
