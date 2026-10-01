"use client"

import { ArrowLeft, ShieldAlert } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-blue-500/30 text-white relative flex items-center justify-center overflow-hidden p-4">
      {/* Background Ambient Mesh */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[150px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[440px] p-8 md:p-10 rounded-[2.5rem] bg-black/50 backdrop-blur-2xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Password Recovery</h1>
          <p className="text-xs text-amber-400/90 font-mono tracking-wider uppercase mt-1">Admin Controlled</p>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3 text-left">
          <p className="text-xs text-zinc-300 leading-relaxed">
            In accordance with system security policy, <strong>public self-service password recovery is disabled</strong>.
          </p>
          <p className="text-xs text-zinc-400 leading-relaxed">
            If you have lost access to your account, please contact your <strong>Organization Administrator</strong> or <strong>System Supervisor</strong> to request an administrative password reset.
          </p>
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[11px] text-zinc-400 space-y-1">
            <span className="font-semibold text-zinc-300 block">After Admin Reset:</span>
            <span>You will receive a temporary passkey to sign in, and you will be prompted to set your new permanent password on login.</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-white text-black font-semibold rounded-xl text-sm transition hover:bg-zinc-200 shadow-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
