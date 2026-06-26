"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Bell, GraduationCap, LogOut } from "lucide-react"
import { useState } from "react"

export default function StudentLayoutClient({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
      
      {/* Top Navbar */}
      <nav className="flex-none h-16 border-b border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-lg flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-widest text-sm text-white/80 uppercase">Academy</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/student" className="text-white/60 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/student/courses" className="text-white/60 hover:text-white transition-colors">My Courses</Link>
            <Link href="/student/catalog" className="text-white/60 hover:text-white transition-colors">Catalog</Link>
          </div>
        </div>

        <div className="flex items-center gap-4 relative">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white relative">
            <Bell className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-white/10 mx-2" />
          
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-3 focus:outline-none group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center font-bold text-xs group-hover:border-white/30 transition-colors">
              {session?.user?.name?.charAt(0) || "S"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold group-hover:text-blue-400 transition-colors">{session?.user?.name || "Student"}</p>
            </div>
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-white/10 mb-2">
                <p className="text-xs text-white/50">{session?.user?.email}</p>
              </div>
              <button onClick={() => window.location.href = '/api/auth/signout'} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors text-left">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto custom-scrollbar relative">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 p-4 sm:p-8">
          {children}
        </div>
      </main>

    </div>
  )
}
