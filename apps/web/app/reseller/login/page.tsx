"use client"

import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Users, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export default function ResellerLoginPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  const [email, setEmail] = useState("reseller@grekam.com")
  const [password, setPassword] = useState("reseller123")

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
        setErrorMessage("Invalid Reseller credentials.")
        setIsPending(false)
        return
      }

      const session = await getSession()
      router.push("/dashboard/reseller")
      router.refresh()
    } catch (err) {
      setErrorMessage("Network error during login.")
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070814] font-sans text-white relative flex items-center justify-center overflow-hidden p-4">
      {/* Glow Effects */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl relative z-10 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
            <Users className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Reseller Partner Login</h1>
          <p className="text-xs text-zinc-400">Manage Your Garages & White Label Portal</p>
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
            <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">Reseller Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="partner@reseller.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
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
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Demo Credentials Box */}
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs space-y-1">
            <div className="flex items-center justify-between text-purple-300 font-medium">
              <span>Demo Reseller Admin Login:</span>
              <button
                type="button"
                onClick={() => {
                  setEmail("reseller@grekam.com")
                  setPassword("reseller123")
                }}
                className="text-[10px] bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded font-mono underline"
              >
                Auto-fill
              </button>
            </div>
            <p className="font-mono text-zinc-300">Email: <span className="text-white font-semibold">reseller@grekam.com</span></p>
            <p className="font-mono text-zinc-300">Password: <span className="text-white font-semibold">reseller123</span></p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm py-3 rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 mt-2"
          >
            {isPending ? "Authenticating..." : "Login to Reseller Dashboard"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-zinc-500 space-y-1">
          <p>
            Super Admin login? <Link href="/admin/login" className="text-purple-400 hover:underline">Click here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
