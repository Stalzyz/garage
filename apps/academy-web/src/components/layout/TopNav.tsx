"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { getNavItemsByRole, Role } from "@/config/navigation"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "next-auth/react"
import { ShieldCheck, Moon, Sun, Menu, X, LogOut, Settings } from "lucide-react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { useOrganization } from "@/context/OrganizationContext"
import { NotificationMenu } from "./NotificationMenu"
import { TimerWidget } from "./TimerWidget"

const RealtimeIndicator = dynamic(() => import("@/components/RealtimeIndicator"), { ssr: false })

function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)
  return (
    <button 
      onClick={() => {
        setIsDark(!isDark)
        document.documentElement.classList.toggle('light')
      }}
      className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 hover:bg-white/10 transition-colors"
      title="Toggle Theme"
    >
      {isDark ? <Moon className="w-4 h-4 text-white/80" /> : <Sun className="w-4 h-4 text-white/80" />}
    </button>
  )
}

function OrgHeader() {
  const org = useOrganization()

  return (
    <div className="flex items-center gap-3 shrink-0">
      {org.logoUrl ? (
        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-white/10">
          <Image src={org.logoUrl} alt={org.name} width={36} height={36} className="object-cover w-full h-full" />
        </div>
      ) : (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 border border-white/10 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
          <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
      )}
      <span className="text-lg font-bold tracking-tight hidden md:block text-white">{org.name}</span>
    </div>
  )
}

export function TopNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  
  let rawRole = session?.user?.role || "INTERN"
  if (rawRole === "Super Admin") rawRole = "SUPER_ADMIN"
  if (rawRole === "Manager") rawRole = "MANAGER"
  if (rawRole === "Staff") rawRole = "STAFF"
  if (rawRole === "Client") rawRole = "CLIENT"
  if (rawRole === "Student") rawRole = "STUDENT"
  if (rawRole === "Vendor") rawRole = "VENDOR"
  if (rawRole === "Intern") rawRole = "INTERN"
  
  const role = rawRole as Role
  const customPermissions = (session?.user as any)?.permissions || []
  const navItems = getNavItemsByRole(role, customPermissions)

  return (
    <>
      {/* Desktop & Mobile Top Header */}
      <header className="h-16 w-full bg-[#0A0A0A]/80 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-4 md:px-6 relative z-50 shrink-0">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-8">
          <OrgHeader />
          
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              // Exact match or prefix match
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(`${item.href}`))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-white/10 text-white shadow-sm" 
                      : "text-white/50 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right: Actions & User */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <TimerWidget />
            <NotificationMenu />
            <ThemeToggle />
            <RealtimeIndicator />
          </div>

          <div className="h-6 w-px bg-white/10 hidden md:block mx-1"></div>

          {/* User Profile */}
          <div className="hidden md:flex items-center gap-3 pl-1">
            <div className="flex flex-col items-end min-w-0">
              <span className="text-sm font-semibold leading-none text-white">{session?.user?.name || "System User"}</span>
              <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold mt-1">{role}</span>
            </div>
            <button onClick={() => signOut()} title="Logout" className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-white font-bold text-sm shrink-0 hover:border-white/30 transition-all">
              {session?.user?.name?.charAt(0) || "U"}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileOpen(true)}
            className="md:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-[85%] max-w-sm h-full flex flex-col bg-[#0A0A0A] border-r border-white/10 shadow-2xl animate-in slide-in-from-left">
            <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
              <OrgHeader />
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <div className="mb-4 px-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">{role} CLEARANCE</span>
              </div>
              {navItems.map(item => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(`${item.href}`))
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium",
                      isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.title}
                  </Link>
                )
              })}
            </div>

            <div className="p-4 border-t border-white/10 bg-black/20 flex flex-col gap-2">
               <div className="flex items-center justify-around py-2 border-b border-white/5 mb-2">
                 <ThemeToggle />
                 <NotificationMenu />
                 <RealtimeIndicator />
               </div>
               <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10">
                  <LogOut className="w-5 h-5" /> Sign Out
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
