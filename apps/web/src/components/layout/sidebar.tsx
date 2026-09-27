"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { getNavItemsByRole, NavItem, Role } from "@/config/navigation"
import { useOrganization } from "@/context/OrganizationContext"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "next-auth/react"
import { Bell, BookOpen, Briefcase, Building2, ChevronDown, ChevronRight, DollarSign, Layers, LayoutDashboard, LogOut, Menu, MessageSquare, Moon, ShieldCheck, Sun, User, X } from "lucide-react"
import dynamic from "next/dynamic"
import Image from "next/image"

const RealtimeIndicator = dynamic(() => import("@/components/RealtimeIndicator"), { ssr: false })

import { NotificationMenu } from "./NotificationMenu"

function BrandLogo({ url, name, size = 32 }: { url?: string | null; name: string; size?: number }) {
  const [hasError, setHasError] = useState(false)

  // Reset error state whenever the URL prop changes
  useEffect(() => {
    setHasError(false)
  }, [url])
  
  if (url && !hasError) {
    return (
      <div 
        style={{ width: size, height: size }}
        className="rounded-xl overflow-hidden shrink-0 border border-dash-border-strong bg-white/5 flex items-center justify-center p-0.5 shadow-sm"
      >
        <img 
          key={url}
          src={url} 
          alt={name} 
          onError={() => setHasError(true)} 
          className="w-full h-full object-cover rounded-lg" 
        />
      </div>
    )
  }

  return (
    <div 
      style={{ width: size, height: size }}
      className="rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.2)] font-bold text-xs text-blue-400"
    >
      {name ? name.charAt(0).toUpperCase() : <ShieldCheck className="w-4 h-4 text-blue-400" strokeWidth={2} />}
    </div>
  )
}

function OrgHeader() {
  const org = useOrganization()

  return (
    <div className="flex h-16 items-center px-6 gap-3 relative z-10">
      <BrandLogo url={org.faviconUrl || org.logoUrl} name={org.name} size={32} />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-bold tracking-tight text-dash-text-primary truncate">{org.name}</span>
        {org.id && (
          <span className="text-[10px] font-mono text-zinc-400 truncate tracking-tight">
            ID: {org.id.slice(0, 10)}...
          </span>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <NotificationMenu />
        <RealtimeIndicator />
      </div>
    </div>
  )
}


function NavGroup({ item, pathname, onClose }: { item: NavItem; pathname: string; onClose?: () => void }) {
  const Icon = item.icon
  const router = useRouter()
  const isGroupActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
  const [open, setOpen] = useState(isGroupActive)

  if (!item.children || item.children.length === 0) {
    return (
      <Link
        href={item.href}
        onClick={onClose}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors group",
          isGroupActive
            ? "bg-white/[0.08] text-white font-medium shadow-sm"
            : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isGroupActive ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-300")} />
        {item.title}
      </Link>
    )
  }

  return (
    <div className="mb-0.5">
      {/* Group header — toggles open/close AND navigates */}
      <button
        onClick={() => {
          setOpen(!open)
          if (item.href) {
            router.push(item.href)
            if (onClose) onClose()
          }
        }}
        className={cn(
          "w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors group",
          isGroupActive
            ? "text-zinc-200 font-semibold"
            : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isGroupActive ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-300")} />
        <span className="flex-1 text-left">{item.title}</span>
        {open
          ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
          : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
        }
      </button>

      {/* Sub items */}
      <div className={cn(
        "grid transition-all duration-200 ease-in-out",
        open ? "grid-rows-[1fr] opacity-100 mt-0.5" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          <div className="ml-5 pl-2.5 border-l border-white/[0.08] space-y-0.5 py-0.5">
            {item.children!.map(child => {
              const isChildActive = pathname === child.href
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors group",
                    isChildActive
                      ? "bg-white/[0.08] text-white font-medium"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full transition-colors", isChildActive ? "bg-blue-400" : "bg-zinc-600/50 group-hover:bg-zinc-500")} />
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
  if (rawRole === "Super Admin" || rawRole === "SUPER_ADMIN") rawRole = "SUPER_ADMIN"
  else if (rawRole === "Partner" || rawRole === "PARTNER") rawRole = "PARTNER"
  else if (rawRole === "Reseller" || rawRole === "RESELLER" || rawRole === "RESELLER_ADMIN") rawRole = "PARTNER"
  else if (rawRole === "Admin" || rawRole === "ADMIN" || rawRole === "GARAGE_ADMIN" || rawRole === "TENANT_ADMIN" || rawRole === "Garage Owner" || rawRole === "Manager" || rawRole === "MANAGER") rawRole = "MANAGER"
  else if (rawRole === "Staff" || rawRole === "STAFF") rawRole = "STAFF"
  else if (rawRole === "Client" || rawRole === "CLIENT") rawRole = "CLIENT"
  else if (rawRole === "Student" || rawRole === "STUDENT") rawRole = "STUDENT"
  else if (rawRole === "Vendor" || rawRole === "VENDOR") rawRole = "VENDOR"
  else if (rawRole === "Intern" || rawRole === "INTERN") rawRole = "INTERN"
  
  const role = rawRole as Role
  
  // Retrieve custom permissions from next-auth session if available
  const customPermissions = (session?.user as any)?.permissions || []
  
  const navItems = getNavItemsByRole(role, customPermissions, pathname)

  const isPartnerRoute = pathname?.startsWith("/dashboard/partner")
  const isAdminRoute = pathname?.startsWith("/dashboard/admin")

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
    <div className="flex flex-1 w-full flex-col min-h-0 overflow-hidden bg-dash-bg-base text-dash-text-primary font-sans relative">
      
      {/* Header / Logo — Dynamic Whitelabel */}
      <OrgHeader />

      {/* Role badge & Mode Switcher */}
      <div className="px-4 py-2 relative z-10 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-zinc-400 capitalize">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {isPartnerRoute ? "Partner Mode" : role.toLowerCase().replace('_', ' ')}
        </span>
      </div>



      {/* Nav items */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-3 space-y-0.5 pb-6 relative z-10">
        {navItems.map(item => (
          <NavGroup key={item.href} item={item} pathname={pathname} onClose={() => setMobileOpen(false)} />
        ))}
      </div>

      {/* User footer */}
      <div className="p-3 relative z-10 border-t border-white/[0.08] bg-dash-bg-base">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] min-w-0">
            <div className="h-8 w-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-200 font-medium text-xs shrink-0">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium leading-none truncate text-zinc-200">{session?.user?.name || "User"}</span>
              <span className="text-[10px] text-zinc-500 mt-1 truncate">{session?.user?.email}</span>
            </div>
          </div>
          <button
            onClick={async () => {
              try {
                await signOut({ redirect: false })
              } catch {}
              window.location.href = "/auth/login"
            }}
            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all flex items-center justify-center shrink-0 cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="print:hidden hidden md:flex h-screen w-72 flex-col border-r border-dash-border-strong shrink-0 bg-dash-bg-base relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)] overflow-hidden">
        {sidebarContent}
      </div>

      {/* Mobile Top Header Bar */}
      <div className="print:hidden md:hidden fixed top-0 left-0 right-0 h-16 bg-dash-bg-surface/90 backdrop-blur-md border-b border-dash-border-strong z-40 flex items-center justify-between px-5">
        <div className="flex items-center gap-2.5">
          <BrandLogo url={org.faviconUrl || org.logoUrl} name={org.name} size={28} />
          <span className="text-xs font-bold tracking-wider uppercase text-dash-text-primary/90 truncate max-w-[120px]">{org.name}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <NotificationMenu />
          <RealtimeIndicator />
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="print:hidden md:hidden fixed bottom-0 left-0 right-0 h-16 bg-dash-bg-surface/90 backdrop-blur-md border-t border-dash-border-strong z-40 flex items-center justify-around px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        {getBottomTabs(role).map(tab => {
          const TabIcon = tab.icon
          const isTabActive = pathname === tab.href || (tab.href !== "/dashboard" && pathname?.startsWith(`${tab.href}/`))
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative",
                isTabActive ? "text-blue-400 font-bold" : "text-dash-text-primary/40"
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
          className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors text-dash-text-primary/40 hover:text-dash-text-primary"
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
          <div className="relative w-[85%] max-w-sm h-full flex flex-col shadow-2xl border-r border-dash-border-strong overflow-hidden bg-dash-bg-base">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-5 z-20 p-2 rounded-full bg-dash-bg-elevated/80 hover:bg-dash-border-strong text-dash-text-primary/70 transition-colors backdrop-blur-md"
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
 
