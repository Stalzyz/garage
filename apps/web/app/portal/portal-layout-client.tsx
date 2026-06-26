"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { LogOut, Bell, Settings } from "lucide-react"

export default function PortalLayoutClient({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
      
      {/* Top Navbar */}
      <nav className="flex-none h-16 border-b border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center font-bold font-mono">
              G
            </div>
            <span className="font-bold tracking-widest text-sm text-white/80 uppercase">Client Portal</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/portal/client" className="text-white/60 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/portal/projects" className="text-white/60 hover:text-white transition-colors">Projects</Link>
            <Link href="/portal/client/files" className="text-white/60 hover:text-white transition-colors">Deliverables</Link>
            <Link href="/portal/invoices" className="text-white/60 hover:text-white transition-colors">Invoices</Link>
            <Link href="/portal/proposals" className="text-white/60 hover:text-white transition-colors">Proposals</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-black" />
          </button>
          
          <div className="w-px h-6 bg-white/10 mx-2" />
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center font-bold text-xs">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold">{session?.user?.name || "User Account"}</p>
              <p className="text-[10px] text-white/40">{session?.user?.email || "user@example.com"}</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto custom-scrollbar relative">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 p-4 sm:p-8">
          {children}
        </div>
      </main>

    </div>
  )
}
