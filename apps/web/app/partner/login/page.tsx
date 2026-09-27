"use client"

import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle, Sparkles, Building2, Wallet } from "lucide-react"
import Link from "next/link"

export default function PartnerLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("reseller@grekam.com")
  const [password, setPassword] = useState("reseller123")
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setErrorMessage(null)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (!result || result.error) {
        setErrorMessage("Invalid partner email or password.")
        setIsPending(false)
        return
      }

      // Success
      router.push("/dashboard/partner")
      router.refresh()
    } catch (err) {
      setErrorMessage("Network error. Please try again.")
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 mb-2">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Partner Control Portal</h1>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Authorized portal for Grekam Resellers and White-Label Partners to manage workshops and activations.
          </p>
        </div>

        {/* Login Form Box */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-8 space-y-6 shadow-2xl backdrop-blur-md">
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Partner Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="partner@youragency.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Password
                </label>
                <Link href="#" className="text-xs text-zinc-500 hover:text-zinc-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-500/20"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Access Partner Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-zinc-800/80 text-center">
            <p className="text-xs text-zinc-500">
              Demo Credentials: <span className="text-emerald-400 font-mono">reseller@grekam.com</span> / <span className="text-zinc-300 font-mono">reseller123</span>
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/auth/login" className="text-xs text-zinc-500 hover:text-zinc-300 transition">
            ← Switch to Garage Workshop Login
          </Link>
        </div>
      </div>
    </div>
  )
}
