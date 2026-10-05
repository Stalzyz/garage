"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Building2, ArrowRight, Sparkles, Laptop, ShieldCheck, 
  GraduationCap, Cpu, Layers, ExternalLink, ChevronRight, Zap, CheckCircle2
} from "lucide-react"
import { motion } from "framer-motion"

export default function SplitEcosystemLandingPage() {
  const [activeSplit, setActiveSplit] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden relative">
      
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px]" />
        <div className="absolute -bottom-20 left-1/3 w-[600px] h-[600px] bg-emerald-600/15 rounded-full blur-[140px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Top Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 p-[1px]">
            <div className="w-full h-full bg-black rounded-[11px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <span className="text-lg font-black tracking-wider text-white uppercase">Grekam</span>
            <span className="text-xs block text-zinc-400 tracking-widest uppercase font-medium">Ecosystem Portal</span>
          </div>
        </div>

        {/* Top Direct Navigation Shortcuts */}
        <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full p-1.5 backdrop-blur-lg">
          <a 
            href="https://agency.grekam.in" 
            className="px-4 py-1.5 text-xs font-semibold rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
          >
            <Laptop className="w-3.5 h-3.5 text-emerald-400" /> Agency
          </a>
          <a 
            href="https://garage.grekam.in" 
            className="px-4 py-1.5 text-xs font-semibold rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Garage OS
          </a>
          <a 
            href="https://academy.grekam.in" 
            className="px-4 py-1.5 text-xs font-semibold rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" /> Academy
          </a>
          <a 
            href="https://dashboard.grekam.in" 
            className="px-4 py-1.5 text-xs font-bold rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
          >
            <Layers className="w-3.5 h-3.5" /> Dashboard
          </a>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Operations
          </span>
        </div>
      </header>

      {/* Hero Intro Bar */}
      <section className="relative z-10 max-w-4xl mx-auto text-center px-6 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Unified Digital & Enterprise Infrastructure
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-3 leading-tight">
            Select Your Business Destination
          </h1>
          <p className="text-sm md:text-base text-zinc-400 max-w-2xl mx-auto">
            Access specialized platforms across creative agency services, enterprise CRM operations, and industry learning.
          </p>
        </motion.div>
      </section>

      {/* --- THE TRIPLE SPLIT SCREEN GRID --- */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-6 flex flex-col lg:flex-row gap-6 items-stretch">

        {/* SPLIT 1: GREKAM VISUALS AGENCY */}
        <motion.div
          onHoverStart={() => setActiveSplit(0)}
          onHoverEnd={() => setActiveSplit(null)}
          animate={{
            flex: activeSplit === 0 ? 1.4 : activeSplit !== null ? 0.8 : 1,
            opacity: activeSplit !== null && activeSplit !== 0 ? 0.75 : 1
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="group relative flex-1 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-emerald-500/50 p-8 flex flex-col justify-between overflow-hidden backdrop-blur-xl transition-all shadow-2xl hover:shadow-emerald-500/10"
        >
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Laptop className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Agency
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white mb-2 group-hover:text-emerald-300 transition-colors">
              Grekam Visuals
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed mb-6">
              Creative Digital Agency providing high-performance web engineering, mobile app development, UI/UX design, and bespoke enterprise software.
            </p>

            <ul className="space-y-2.5 mb-8 text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-Theme Portfolio & Live Showcases</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Interactive Cost Calculator & Technical Briefs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Custom Next.js & Mobile App Engineering</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
            <a
              href="https://agency.grekam.in"
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all transform group-hover:translate-y-[-2px]"
            >
              <span>Explore Agency Portal</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <span className="text-[11px] text-center text-zinc-500 font-mono">agency.grekam.in</span>
          </div>
        </motion.div>


        {/* SPLIT 2: GARAGE OS CRM & DASHBOARD */}
        <motion.div
          onHoverStart={() => setActiveSplit(1)}
          onHoverEnd={() => setActiveSplit(null)}
          animate={{
            flex: activeSplit === 1 ? 1.4 : activeSplit !== null ? 0.8 : 1,
            opacity: activeSplit !== null && activeSplit !== 1 ? 0.75 : 1
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="group relative flex-1 rounded-3xl bg-gradient-to-b from-indigo-500/10 to-white/[0.02] border border-indigo-500/30 hover:border-indigo-400 p-8 flex flex-col justify-between overflow-hidden backdrop-blur-xl transition-all shadow-2xl hover:shadow-indigo-500/20"
        >
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all" />
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold tracking-widest text-indigo-300 uppercase bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
                Core SaaS
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white mb-2 group-hover:text-indigo-300 transition-colors">
              Garage OS
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed mb-6">
              All-in-One Sales, Operations & Enterprise CRM platform. Automated GST invoicing, Kanban pipelines, Android telecaller sync, & HR.
            </p>

            <ul className="space-y-2.5 mb-8 text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Visual Lead Pipelines & Power Dialer</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Native Android Call Recording Cloud Sync</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Automated GST Invoicing & Vendor Portal</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
            <a
              href="https://garage.grekam.in"
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all transform group-hover:translate-y-[-2px]"
            >
              <span>Launch Garage OS</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="https://dashboard.grekam.in"
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-white/10"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> Go Direct to Dashboard (dashboard.grekam.in)
            </a>
          </div>
        </motion.div>


        {/* SPLIT 3: GREKAM ACADEMY */}
        <motion.div
          onHoverStart={() => setActiveSplit(2)}
          onHoverEnd={() => setActiveSplit(null)}
          animate={{
            flex: activeSplit === 2 ? 1.4 : activeSplit !== null ? 0.8 : 1,
            opacity: activeSplit !== null && activeSplit !== 2 ? 0.75 : 1
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="group relative flex-1 rounded-3xl bg-gradient-to-b from-amber-500/10 to-white/[0.02] border border-amber-500/20 hover:border-amber-400 p-8 flex flex-col justify-between overflow-hidden backdrop-blur-xl transition-all shadow-2xl hover:shadow-amber-500/10"
        >
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all" />
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Education
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white mb-2 group-hover:text-amber-300 transition-colors">
              Grekam Academy
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed mb-6">
              Industry-oriented technical education, live coding masterclasses, student portal, and career placement programs.
            </p>

            <ul className="space-y-2.5 mb-8 text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Hands-on Live Coding & Masterclasses</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Student LMS & Assignment Submissions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Direct Placement Partner Network</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
            <a
              href="https://academy.grekam.in"
              className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all transform group-hover:translate-y-[-2px]"
            >
              <span>Enter Academy Portal</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <span className="text-[11px] text-center text-zinc-500 font-mono">academy.grekam.in</span>
          </div>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <p>© 2026 Grekam Visuals & Technologies Pvt Ltd. All rights reserved.</p>
        <div className="flex items-center gap-6 text-zinc-400">
          <a href="https://grekam.in/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="https://grekam.in/legal/terms" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="https://agency.grekam.in/contact" className="hover:text-white transition-colors">Contact Support</a>
        </div>
      </footer>

    </div>
  )
}
