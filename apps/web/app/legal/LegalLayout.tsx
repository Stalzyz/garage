"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, Scale, Shield, CreditCard, RefreshCw, Truck, Pencil, Fingerprint, Wrench, ChevronRight, Mail, Phone, Trash2 } from "lucide-react"

const POLICY_LINKS = [
  { href: "/legal/terms", label: "Terms & Conditions", icon: Scale },
  { href: "/legal/privacy", label: "Privacy Policy", icon: Shield },
  { href: "/legal/payment", label: "Payment & Billing", icon: CreditCard },
  { href: "/legal/refunds", label: "Cancellation & Refunds", icon: RefreshCw },
  { href: "/legal/delivery", label: "Service Delivery", icon: Truck },
  { href: "/legal/revisions", label: "Revision & Scope", icon: Pencil },
  { href: "/legal/ip", label: "Intellectual Property", icon: Fingerprint },
  { href: "/legal/maintenance", label: "Maintenance & Support", icon: Wrench },
  { href: "/legal/data-deletion", label: "Data Deletion Instructions", icon: Trash2 },
]

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#090909] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/[0.03] rounded-full blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#090909]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/agency" className="flex items-center gap-2.5 text-white/60 hover:text-white transition-colors text-sm group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-medium">Grekam Visuals</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-white/40 font-mono uppercase tracking-widest">Legal</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-24">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-4 px-3">Policies</p>
              <nav className="space-y-0.5">
                {POLICY_LINKS.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-400" : "text-white/30 group-hover:text-white/60"}`} />
                      <span className="flex-1 leading-snug">{label}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-400/60" />}
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-8 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
                <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3">Questions?</p>
                <a href="mailto:admin@grekam.in" className="flex items-center gap-2 text-sm text-white/60 hover:text-emerald-400 transition-colors mb-2">
                  <Mail className="w-3.5 h-3.5 text-emerald-500/60" />
                  admin@grekam.in
                </a>
                <a href="tel:+919843199556" className="flex items-center gap-2 text-sm text-white/60 hover:text-emerald-400 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-emerald-500/60" />
                  +91 98431 99556
                </a>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>

      <footer className="border-t border-white/[0.06] mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} Grekam Visuals. All rights reserved. Coimbatore, Tamil Nadu, India.</p>
          <p className="text-xs text-white/20">Last reviewed: August 2025 · GST Registered</p>
        </div>
      </footer>
    </div>
  )
}
