"use client"

import { useActionState, useState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { AlertCircle, CheckCircle2, Mail, ArrowRight, ShieldAlert, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

// Server action logic
async function resetPassword(prevState: unknown, formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulated delay for animation
  const email = formData.get("email")
  
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return { error: "INVALID SYSTEM ID DETECTED." }
  }
  
  return { success: "RECOVERY LINK DISPATCHED TO COMMS CHANNEL." }
}

export default function ForgotPasswordPage() {
  const [state, dispatch] = useActionState(resetPassword, undefined)
  const [isClient, setIsClient] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null // Prevent hydration mismatches

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-blue-500/30 text-white relative flex items-center justify-center overflow-hidden">
      
      {/* Background Ambient Mesh */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <motion.div 
          animate={{ x: ["0%", "10%", "-10%", "0%"], y: ["0%", "-10%", "10%", "0%"], scale: [1, 1.1, 0.9, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/20 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ x: ["0%", "-15%", "15%", "0%"], y: ["0%", "15%", "-15%", "0%"], scale: [1, 0.8, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[150px] rounded-full" 
        />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_40%,transparent_100%)] pointer-events-none" />

      {/* Main Authentication Card */}
      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[420px] p-8 md:p-10 rounded-[2.5rem] bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden group"
      >
        {/* Card Inner Glow (follows focus) */}
        <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 transition-opacity duration-700 pointer-events-none ${focusedInput ? 'opacity-100' : ''}`} />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2, stiffness: 200, damping: 20 }}
              className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.05)]"
            >
              <ShieldAlert className="w-8 h-8 text-white/80" strokeWidth={1.5} />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tighter mb-2">Access Recovery</h1>
            <p className="text-sm font-mono tracking-widest text-white/40 uppercase leading-relaxed px-2">Transmit recovery protocol to registered node.</p>
          </div>

          <form action={dispatch} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-mono tracking-widest text-white/50 uppercase ml-2">System ID (Email)</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within/input:text-blue-400 transition-colors">
                  <Mail className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-md"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <SubmitButton />
            </div>

            <div className="text-center pt-2">
              <Link href="/auth/login" className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-white/40 hover:text-white transition-colors uppercase">
                <ArrowLeft className="w-3 h-3" /> Abort Recovery
              </Link>
            </div>

            {/* Status Messages */}
            <AnimatePresence mode="wait">
              {state?.error && (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                    <p className="text-sm font-mono">{state.error}</p>
                  </div>
                </motion.div>
              )}
              {state?.success && (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                    <p className="text-sm font-mono">{state.success}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`relative w-full h-14 flex items-center justify-center gap-3 rounded-2xl font-bold tracking-widest uppercase transition-all overflow-hidden group ${pending ? 'bg-white/10 text-white/50 cursor-not-allowed border border-white/5' : 'bg-white text-black hover:scale-[1.02]'}`}
    >
      {pending ? (
        <>
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
          Transmitting...
        </>
      ) : (
        <>
          Dispatch Link
          <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </>
      )}
      
      {/* Button Shine Effect */}
      {!pending && (
        <div className="absolute inset-0 -translate-x-[150%] animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
      )}
    </button>
  )
}
