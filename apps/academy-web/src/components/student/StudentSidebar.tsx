"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  PlayCircle, 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  Trophy, 
  Briefcase, 
  LogOut,
  GraduationCap
} from "lucide-react"
import { useSession, signOut } from "next-auth/react"

const studentNavigation = [
  { title: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
  { title: "My Learning", href: "/dashboard/student/learning", icon: PlayCircle },
  { title: "Assignments", href: "/dashboard/student/assignments", icon: CheckSquare },
  { title: "Schedule", href: "/dashboard/student/schedule", icon: Calendar },
  { title: "Community", href: "/dashboard/student/community", icon: MessageSquare },
  { title: "Certificates", href: "/dashboard/student/certificates", icon: Trophy },
  { title: "Career Hub", href: "/dashboard/student/career", icon: Briefcase },
]

export function StudentSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className="w-64 h-full bg-[#050505]/90 backdrop-blur-3xl border-r border-white/10 flex flex-col text-white">
      {/* Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-white/10 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-blue-400" />
        </div>
        <span className="font-bold tracking-tight text-sm uppercase">Learning Space</span>
      </div>

      {/* Profile Snippet with XP */}
      <div className="p-6 pb-2 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex-shrink-0" />
          <div className="overflow-hidden flex-1">
            <h3 className="font-bold text-sm truncate">{session?.user?.name || "Student"}</h3>
            <p className="text-xs text-white/50 truncate">Level 4</p>
          </div>
        </div>
        
        {/* XP Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/70 font-semibold">XP</span>
            <span className="text-blue-400 font-bold">1,240 / 2,000</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[62%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {studentNavigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`\${item.href}/`)
          const Icon = item.icon
          
          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive 
                  ? "bg-blue-500/10 text-blue-400 shadow-[inset_2px_0_0_0_rgba(59,130,246,1)]" 
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn(
                "w-4 h-4 transition-colors", 
                isActive ? "text-blue-400" : "text-white/30 group-hover:text-white/70"
              )} />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* Footer / Switch Workspace */}
      <div className="p-4 border-t border-white/10 space-y-2 shrink-0">
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  )
}
