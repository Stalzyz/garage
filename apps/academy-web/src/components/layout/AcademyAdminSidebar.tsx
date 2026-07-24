"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Users, BookOpen, GraduationCap, DollarSign, Trophy, 
  Calendar, FileText, ClipboardList, TrendingUp, HelpCircle,
  Briefcase, Percent, Award, ShieldAlert, Laptop
} from "lucide-react"

const academyAdminNavigation = [
  { title: "Admissions CRM", href: "/dashboard/academy/admissions", icon: Users },
  { title: "Form Builder", href: "/dashboard/academy/forms", icon: FileText },
  { title: "Walk-ins Kiosk", href: "/dashboard/academy/walk-ins", icon: Laptop },
  { title: "Demo Sessions", href: "/dashboard/academy/demo-sessions", icon: Calendar },
  { title: "Campus Students", href: "/dashboard/academy/students/onsite", icon: GraduationCap },
  { title: "Remote Students", href: "/dashboard/academy/students/online", icon: GraduationCap },
  { title: "Global Leaderboard", href: "/dashboard/academy/leaderboard", icon: Trophy },
  { title: "Campus Faculty", href: "/dashboard/academy/educators/onsite", icon: Users },
  { title: "Office Hours", href: "/dashboard/studio/office-hours", icon: Calendar },
  { title: "Remote Instructors", href: "/dashboard/academy/educators/online", icon: Users },
  { title: "Fee Collection", href: "/dashboard/academy/fees", icon: DollarSign },
  { title: "Batches", href: "/dashboard/academy/batches", icon: ClipboardList },
  { title: "Live Projects", href: "/dashboard/academy/projects", icon: Briefcase },
  { title: "Internships", href: "/dashboard/academy/internships", icon: Briefcase },
  { title: "Placements", href: "/dashboard/academy/placements", icon: Award },
  { title: "Marketplace", href: "/dashboard/academy/marketplace", icon: TrendingUp },
  { title: "Campus Events", href: "/dashboard/academy/events", icon: Calendar },
  { title: "Referrals", href: "/dashboard/academy/referrals", icon: Percent },
  { title: "AI Risk Engine", href: "/dashboard/academy/risk", icon: ShieldAlert },
]

export function AcademyAdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 h-full bg-[#0A0A0A] border-r border-white/5 flex flex-col text-white flex-shrink-0 relative z-40 hidden md:flex overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-white/10 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-blue-400" />
        </div>
        <span className="font-bold tracking-tight">Academy Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {academyAdminNavigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
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
    </div>
  )
}
