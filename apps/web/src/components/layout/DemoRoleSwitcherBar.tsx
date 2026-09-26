"use client"

import { useSession, signIn } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { ShieldCheck, Users, Building2, Sparkles } from "lucide-react"

export function DemoRoleSwitcherBar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  const currentRole = session?.user?.role || "GUEST"

  const switchRole = async (targetRole: "SUPER_ADMIN" | "RESELLER_ADMIN" | "GARAGE_CUSTOMER") => {
    if (targetRole === "SUPER_ADMIN") {
      await signIn("credentials", {
        email: "admin@grekam.com",
        password: "admin123",
        redirect: false,
      })
      router.push("/dashboard/admin/dashboard")
      router.refresh()
    } else if (targetRole === "RESELLER_ADMIN") {
      await signIn("credentials", {
        email: "reseller@grekam.com",
        password: "reseller123",
        redirect: false,
      })
      router.push("/dashboard/reseller")
      router.refresh()
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-950/80 via-purple-950/80 to-zinc-900 border-b border-white/10 px-4 py-2 flex items-center justify-between text-xs backdrop-blur-md relative z-30 shrink-0 print:hidden">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 uppercase tracking-wider bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
          <Sparkles className="w-3 h-3 animate-pulse" /> Demo Role Switcher
        </span>
        <span className="text-zinc-400 hidden sm:inline">Current Active Role:</span>
        <span className="font-mono font-medium text-white bg-white/10 px-2 py-0.5 rounded">
          {currentRole}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => switchRole("SUPER_ADMIN")}
          className={`px-2.5 py-1 rounded-lg font-medium text-[11px] flex items-center gap-1.5 transition-all ${
            currentRole === "SUPER_ADMIN" || pathname.startsWith("/dashboard/admin")
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold"
              : "bg-white/5 hover:bg-white/10 text-zinc-300"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Super Admin</span>
        </button>

        <button
          onClick={() => switchRole("RESELLER_ADMIN")}
          className={`px-2.5 py-1 rounded-lg font-medium text-[11px] flex items-center gap-1.5 transition-all ${
            currentRole === "RESELLER_ADMIN" || pathname.startsWith("/dashboard/reseller")
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-semibold"
              : "bg-white/5 hover:bg-white/10 text-zinc-300"
          }`}
        >
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span>Reseller</span>
        </button>

        <button
          onClick={() => switchRole("GARAGE_CUSTOMER")}
          className={`px-2.5 py-1 rounded-lg font-medium text-[11px] flex items-center gap-1.5 transition-all ${
            !pathname.startsWith("/dashboard/admin") && !pathname.startsWith("/dashboard/reseller")
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold"
              : "bg-white/5 hover:bg-white/10 text-zinc-300"
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Garage Owner</span>
        </button>
      </div>
    </div>
  )
}
