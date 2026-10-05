"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Bell, LogOut, Settings } from "lucide-react"
import { usePathname } from "next/navigation"

export default function PortalLayoutClient({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const isLoginPage = pathname === "/portal" || pathname === "/portal/"
  const isDashboardPage = pathname === "/portal/dashboard" || pathname === "/portal/dashboard/"

  if (isLoginPage || isDashboardPage) {
    return <>{children}</>
  }

    const isStudent = session?.user?.role === 'STUDENT'

  return (
    <div className="flex flex-col h-screen bg-[#000000] text-white font-sans selection:bg-[#0A84FF]/30">
      
      {/* Top Navbar */}
      <nav className="flex-none h-14 border-b border-white/[0.08] bg-[#121214]/80 backdrop-blur-xl flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-white/[0.08] border border-white/[0.1] rounded-lg flex items-center justify-center font-semibold text-xs text-white">
              G
            </div>
            <span className="font-semibold tracking-tight text-xs text-white/90">
              {isStudent ? "Student Portal" : "Client Portal"}
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-5 text-xs font-medium">
            {isStudent ? (
              <>
                <Link href="/portal/student" className="text-white/60 hover:text-white transition-colors">Dashboard</Link>
                <a href="https://academy.grekam.in" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors flex items-center gap-1">Academy OS</a>
                <a href="https://academy.grekam.in/dashboard/student/certificates" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors">My Certificates</a>
              </>
            ) : (
              <>
                <Link href="/portal/dashboard" className="text-white/60 hover:text-white transition-colors">Dashboard</Link>
                <Link href="/portal/projects" className="text-white/60 hover:text-white transition-colors">Projects</Link>
                <Link href="/portal/client/files" className="text-white/60 hover:text-white transition-colors">Deliverables</Link>
                <Link href="/portal/invoices" className="text-white/60 hover:text-white transition-colors">Invoices</Link>
                <Link href="/portal/proposals" className="text-white/60 hover:text-white transition-colors">Proposals</Link>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors text-white/50 hover:text-white relative">
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#0A84FF] rounded-full" />
          </button>
          
          <div className="w-px h-4 bg-white/[0.08] mx-1" />
          
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center font-medium text-xs text-white">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-white">{session?.user?.name || "Client Account"}</p>
              <p className="text-[10px] text-white/40">{session?.user?.email || "client@example.com"}</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto custom-scrollbar relative bg-[#000000]">
        <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  )
}
