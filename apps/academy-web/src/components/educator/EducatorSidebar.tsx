"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  BookOpen, 
  Video, 
  Users, 
  CheckSquare, 
  HelpCircle, 
  BarChart2, 
  DollarSign, 
  Star, 
  MessageSquare, 
  Folder, 
  Megaphone, 
  Bot, 
  Settings,
  LogOut,
  GraduationCap,
  Award
} from "lucide-react"
import { useSession, signOut } from "next-auth/react"

const getEducatorNavigation = (basePath: string) => {
  const nav = [
    { title: "Studio Dashboard", href: basePath, icon: LayoutDashboard },
    { title: "My Students", href: `${basePath}/students`, icon: Users },
    { title: "My Courses", href: `${basePath}/courses`, icon: BookOpen },
    { title: "Course Builder", href: `${basePath}/courses/builder`, icon: Folder },
    { title: "Quiz Builder", href: `${basePath}/quizzes`, icon: HelpCircle },
    { title: "Assignments", href: `${basePath}/assignments`, icon: CheckSquare },
    { title: "Certificates", href: `${basePath}/certificates`, icon: Award },
    { title: "Analytics", href: `${basePath}/analytics`, icon: BarChart2 },
    { title: "Live Studio", href: `${basePath}/live`, icon: Video },
    { title: "Office Hours", href: `${basePath}/office-hours`, icon: Users },
  ];

  return nav;
}

export function EducatorSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  const basePath = '/dashboard/studio';
    
  const educatorNavigation = getEducatorNavigation(basePath);

  return (
    <div className="w-64 h-full bg-[#0A0A0A] border-r border-white/5 flex flex-col text-white flex-shrink-0 relative z-40 hidden md:flex">
      {/* Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-white/10">
        <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-purple-400" />
        </div>
        <span className="font-bold tracking-tight">Teaching Studio</span>
      </div>

      {/* Profile Snippet */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
          <div className="overflow-hidden">
            <h3 className="font-bold text-sm truncate">{session?.user?.name || "Educator"}</h3>
            <p className="text-xs text-white/50 truncate">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {educatorNavigation.map((item) => {
          // Exact match for dashboard home, otherwise prefix match
          const isActive = pathname === item.href || (item.href !== basePath && pathname?.startsWith(`${item.href}/`))
          const Icon = item.icon
          
          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive 
                  ? "bg-purple-500/10 text-purple-400 shadow-[inset_2px_0_0_0_rgba(168,85,247,1)]" 
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn(
                "w-4 h-4 transition-colors", 
                isActive ? "text-purple-400" : "text-white/30 group-hover:text-white/70"
              )} />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* Footer / Switch Workspace */}
      <div className="p-4 border-t border-white/10 space-y-2">
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
