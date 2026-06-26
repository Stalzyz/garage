import type { ReactNode } from "react"
import Link from "next/link"
import { BookOpen, ClipboardList, Award, Calendar, LogOut, Video } from "lucide-react"

const navItems = [
  { label: "My Courses",    href: "/learn",              icon: BookOpen },
  { label: "Assignments",   href: "/learn/assignments",  icon: ClipboardList },
  { label: "Live Classes",  href: "/learn/live",         icon: Video },
  { label: "Schedule",      href: "/learn/schedule",     icon: Calendar },
  { label: "Achievements",  href: "/learn/achievements", icon: Award },
]

export default function LearnLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-[#030303] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col shrink-0 border-r border-white/[0.06] bg-black/40 backdrop-blur-2xl">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Academy</p>
            <p className="text-[10px] text-white/40">Student Portal</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/[0.06]">
          <Link href="/auth/login" className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
