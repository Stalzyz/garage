"use client"

import { useState, useEffect } from "react"
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Mail, ShieldAlert, Key, Copy, Check, Lock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ message: string; tempPassword?: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.")
      return
    }

    setIsPending(true)
    setErrorMessage(null)
    setSuccessData(null)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setSuccessData(data)
      } else {
        setErrorMessage(data.error || "Failed to process recovery request.")
      }
    } catch (err: any) {
      setErrorMessage("Network error during recovery request.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-blue-500/30 text-white relative flex items-center justify-center overflow-hidden p-4">
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
        className="relative z-10 w-full max-w-[440px] p-8 md:p-10 rounded-[2.5rem] bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
              <Key className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Password Recovery</h1>
            <p className="text-xs text-zinc-400 mt-1">Recover account access for Garages, Partners & Resellers</p>
          </div>

          {!successData ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Account Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your-email@domain.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                {isPending ? "Generating Recovery Passkey..." : "Reset Password"}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-3">
                <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5 text-center"
            >
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs flex items-center gap-2 text-left">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{successData.message}</span>
              </div>

              {successData.tempPassword && (
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-left space-y-2">
                  <span className="text-[11px] text-zinc-400 font-semibold block">Temporary Access Passkey:</span>
                  <div className="flex items-center justify-between gap-2 p-2.5 bg-white/5 border border-white/10 rounded-xl font-mono text-sm text-emerald-400">
                    <span className="select-all font-bold">{successData.tempPassword}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(successData.tempPassword!)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs text-white flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Log in with this temporary passkey, then visit <strong>Security Settings</strong> to set your permanent password.
                  </p>
                </div>
              )}

              <Link
                href="/auth/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-white text-black font-bold rounded-xl text-sm transition hover:bg-zinc-200 shadow-xl"
              >
                Proceed to Login <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
