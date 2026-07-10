"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { getNavItemsByRole, NavItem, Role } from "@/config/navigation"
import { useOrganization } from "@/context/OrganizationContext"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "next-auth/react"
import { 
  ChevronDown, ChevronRight, Menu, X, ShieldCheck, Moon, Sun, 
  LayoutDashboard, BookOpen, Briefcase, MessageSquare, Layers, DollarSign, Bell, LogOut, User
} from "lucide-react"
import dynamic from "next/dynamic"
import Image from "next/image"

const RealtimeIndicator = dynamic(() => import("@/components/RealtimeIndicator"), { ssr: false })

import { NotificationMenu } from "./NotificationMenu"
import { TimerWidget } from "./TimerWidget"

function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)
  return (
    <button 
      onClick={() => {
        setIsDark(!isDark)
        document.documentElement.classList.toggle('light')
      }}
      className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 hover:bg-white/10 transition-colors"
    >
      {isDark ? <Moon className="w-4 h-4 text-white/80" /> : <Sun className="w-4 h-4 text-white/80" />}
    </button>
  )
}

function OrgHeader() {
  const org = useOrganization()

  return (
    <div className="flex h-16 items-center px-6 gap-3 relative z-10">
      {/* Logo: show custom image if set, fallback to ShieldCheck icon */}
      {org.logoUrl ? (
        <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-white/10">
          <Image src={org.logoUrl} alt={org.name} width={32} height={32} className="object-cover w-full h-full" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
          <ShieldCheck className="w-4 h-4 text-white/80" strokeWidth={2} />
        </div>
      )}
      <span className="text-lg font-bold tracking-tight">{org.name}</span>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <TimerWidget />
        <NotificationMenu />
        <RealtimeIndicator />
      </div>
    </div>
  )
}


function NavGroup({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon
  const isGroupActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
  const [open, setOpen] = useState(isGroupActive)

  if (!item.children || item.children.length === 0) {
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
          isGroupActive
            ? "bg-blue-500/10 text-blue-400 shadow-[inset_2px_0_0_0_rgba(59,130,246,1)]"
            : "text-white/50 hover:bg-white/5 hover:text-white"
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isGroupActive ? "text-blue-400" : "text-white/30 group-hover:text-white/70")} />
        {item.title}
      </Link>
    )
  }

  return (
    <div className="mb-1">
      {/* Group header — toggles open/close */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
          isGroupActive
            ? "text-white font-bold"
            : "text-white/50 hover:bg-white/5 hover:text-white"
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isGroupActive ? "text-blue-400" : "text-white/30 group-hover:text-white/70")} />
        <span className="flex-1 text-left tracking-wide">{item.title}</span>
        {open
          ? <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
          : <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
        }
      </button>

      {/* Sub items */}
      <div className={cn(
        "grid transition-all duration-200 ease-in-out",
        open ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          <div className="ml-5 pl-3 border-l border-white/10 space-y-1">
            {item.children!.map(child => {
              const isChildActive = pathname === child.href
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all group",
                    isChildActive
                      ? "bg-blue-500/10 text-blue-400"
                      : "text-white/40 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full transition-all", isChildActive ? "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]" : "bg-white/20 group-hover:bg-white/50")} />
                  {child.title}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const org = useOrganization()

  let rawRole = session?.user?.role || "INTERN"
  if (rawRole === "Super Admin") rawRole = "SUPER_ADMIN"
  if (rawRole === "Manager") rawRole = "MANAGER"
  if (rawRole === "Staff") rawRole = "STAFF"
  if (rawRole === "Client") rawRole = "CLIENT"
  if (rawRole === "Student") rawRole = "STUDENT"
  if (rawRole === "Vendor") rawRole = "VENDOR"
  if (rawRole === "Intern") rawRole = "INTERN"
  
  const role = rawRole as Role
  
  // Retrieve custom permissions from next-auth session if available
  const customPermissions = (session?.user as any)?.permissions || []
  
  const navItems = getNavItemsByRole(role, customPermissions)

  const getBottomTabs = (role: Role) => {
    switch (role) {
      case "STUDENT":
      case "INTERN":
        return [
          { title: "Home", href: "/dashboard", icon: LayoutDashboard },
          { title: "Courses", href: "/dashboard/lms", icon: BookOpen },
          { title: "Tasks", href: "/dashboard/lms/assignments", icon: Briefcase },
          { title: "Chat", href: "/dashboard/chat", icon: MessageSquare },
        ]
      case "CLIENT":
        return [
          { title: "Home", href: "/dashboard", icon: LayoutDashboard },
          { title: "Billing", href: "/dashboard/finance/revenue", icon: DollarSign },
          { title: "Board", href: "/dashboard/projects", icon: Briefcase },
          { title: "Chat", href: "/dashboard/chat", icon: MessageSquare },
        ]
      case "VENDOR":
        return [
          { title: "Home", href: "/dashboard", icon: LayoutDashboard },
          { title: "Board", href: "/dashboard/projects", icon: Briefcase },
          { title: "Chat", href: "/dashboard/chat", icon: MessageSquare },
          { title: "Alerts", href: "/dashboard/notifications", icon: Bell },
        ]
      default: // SUPER_ADMIN, MANAGER, STAFF
        return [
          { title: "Home", href: "/dashboard", icon: LayoutDashboard },
          { title: "CRM", href: "/dashboard/crm", icon: Layers },
          { title: "Board", href: "/dashboard/projects", icon: Briefcase },
          { title: "Chat", href: "/dashboard/chat", icon: MessageSquare },
        ]
    }
  }

  const sidebarContent = (
    <div className="flex flex-1 w-full flex-col min-h-0 overflow-hidden bg-black/40 backdrop-blur-2xl text-white font-sans relative">
      
      {/* Background ambient glow inside sidebar */}
      <div className="absolute top-0 left-0 w-full h-64 bg-blue-500/5 blur-[100px] pointer-events-none" />

      {/* Header / Logo — Dynamic Whitelabel */}
      <OrgHeader />

      {/* Role badge */}
      <div className="px-6 py-4 relative z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 w-fit">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/60">
            {role} CLEARANCE
          </span>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-3 space-y-1 pb-6 relative z-10">
        {navItems.map(item => (
          <NavGroup key={item.href} item={item} pathname={pathname} />
        ))}
      </div>

      {/* User footer */}
      <div className="p-4 relative z-10 border-t border-white/5 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <div onClick={() => signOut()} className="flex-1 flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10" title="Click to logout">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold leading-none truncate tracking-wide text-white/90">{session?.user?.name || "System User"}</span>
              <span className="text-xs text-white/40 mt-1.5 truncate font-mono">{session?.user?.email}</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-screen w-72 flex-col border-r border-white/10 shrink-0 bg-background relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)] overflow-hidden">
        {sidebarContent}
      </div>

      {/* Mobile Top Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#070708]/90 backdrop-blur-md border-b border-white/10 z-40 flex items-center justify-between px-5">
        <div className="flex items-center gap-2.5">
          {org.logoUrl ? (
            <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-white/10 relative">
              <Image src={org.logoUrl} alt={org.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-white/80" />
            </div>
          )}
          <span className="text-xs font-bold tracking-wider uppercase text-white/90 truncate max-w-[120px]">{org.name}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <NotificationMenu />
          <RealtimeIndicator />
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#070708]/90 backdrop-blur-md border-t border-white/10 z-40 flex items-center justify-around px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        {getBottomTabs(role).map(tab => {
          const TabIcon = tab.icon
          const isTabActive = pathname === tab.href || (tab.href !== "/dashboard" && pathname?.startsWith(`${tab.href}/`))
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative",
                isTabActive ? "text-blue-400 font-bold" : "text-white/40"
              )}
            >
              <TabIcon className="w-5 h-5" />
              <span className="text-[8px] uppercase tracking-wider font-bold">{tab.title}</span>
              {isTabActive && <span className="absolute bottom-1 w-5 h-0.5 bg-blue-400 rounded-full" />}
            </Link>
          )
        })}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors text-white/40 hover:text-white"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[8px] uppercase tracking-wider font-bold">Menu</span>
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-[85%] max-w-sm h-full flex flex-col shadow-2xl border-r border-white/10 overflow-hidden bg-background">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-5 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 transition-colors backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
