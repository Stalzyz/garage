"use client"

import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Building2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export default function SuperAdminLoginPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  const [email, setEmail] = useState("admin@grekam.com")
  const [password, setPassword] = useState("admin123")

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setErrorMessage(undefined)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setErrorMessage("Invalid Super Admin credentials.")
        setIsPending(false)
        return
      }

      const session = await getSession()
      const role = session?.user?.role

      if (role === "SUPER_ADMIN") {
        router.push("/dashboard/admin/dashboard")
      } else {
        router.push("/dashboard/admin/dashboard")
      }
      router.refresh()
    } catch (err) {
      setErrorMessage("Network error during login.")
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#05070f] font-sans text-white relative flex items-center justify-center overflow-hidden p-4">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl relative z-10 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Grekam Super Admin</h1>
          <p className="text-xs text-zinc-400">Platform Control Center Login</p>
        </div>

        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@grekam.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Demo Credentials Box */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs space-y-1">
            <div className="flex items-center justify-between text-blue-300 font-medium">
              <span>Demo Super Admin Login:</span>
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@grekam.com")
                  setPassword("admin123")
                }}
                className="text-[10px] bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded font-mono underline"
              >
                Auto-fill
              </button>
            </div>
            <p className="font-mono text-zinc-300">Email: <span className="text-white font-semibold">admin@grekam.com</span></p>
            <p className="font-mono text-zinc-300">Password: <span className="text-white font-semibold">admin123</span></p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 mt-2"
          >
            {isPending ? "Authenticating..." : "Access Control Panel"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 space-y-1">
          <p className="text-[11px] text-zinc-500">
            Reseller login? <Link href="/reseller/login" className="text-blue-400 hover:underline">Click here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
