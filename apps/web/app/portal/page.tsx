"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn, getSession, useSession } from "next-auth/react"
import { useOrganization } from "@/context/OrganizationContext"
import { Eye, EyeOff, Loader2, Zap } from "lucide-react"


export default function ClientPortalLogin() {
  const router = useRouter()
  const org = useOrganization()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && status === "authenticated" && session?.user) {
      const role = session.user.role
      if (role === 'CLIENT') {
        router.push("/portal/dashboard")
      } else if (role === 'STUDENT') {
        router.push("/portal/student")
      } else {
        router.push("/dashboard")
      }
      router.refresh()
    }
  }, [status, session, router, isClient])

  if (!isClient) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (res?.error) {
        if (res.error.includes("Access Denied") || res.error.includes("Academy portal")) {
          setError("Access Denied: Please log in via the Academy portal.")
        } else {
          setError("Invalid email or password.")
        }
      } else {
        const session = await getSession()
        const role = session?.user?.role
        if (role === 'CLIENT') {
          router.push("/portal/dashboard")
        } else if (role === 'STUDENT') {
          router.push("/portal/student")
        } else {
          router.push("/dashboard")
        }
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotSuccess, setForgotSuccess] = useState("")
  const [forgotError, setForgotError] = useState("")
  const [isForgotLoading, setIsForgotLoading] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError("")
    setForgotSuccess("")
    setIsForgotLoading(true)

    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotEmail, portalType: "CLIENT" })
      })

      const data = await res.json()
      if (!res.ok) {
        setForgotError(data.message || "Failed to submit request.")
      } else {
        setForgotSuccess("A temporary password has been sent to your email address.")
      }
    } catch (err) {
      setForgotError("Unable to connect to recovery server.")
    } finally {
      setIsForgotLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      
      {/* Left — Branding */}
      <div className="hidden lg:flex flex-col w-[520px] flex-none bg-gradient-to-br from-[#0f0f1a] to-[#0a0a0f] border-r border-white/5 p-12 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] bg-blue-600/8 rounded-full blur-[80px] pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3 mb-auto">
          {org?.logoUrl
            ? <img src={org.logoUrl} alt={org?.name || "Logo"} className="w-10 h-10 rounded-xl object-contain" />
            : <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Zap className="w-5 h-5 text-white" />
              </div>
          }
          <div>
            <p className="text-sm font-bold text-white">{org?.name || "Grekam OS"}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Client Portal</p>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative my-auto">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Your projects,<br />
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              always in sight.
            </span>
          </h1>
          <p className="text-white/50 text-base leading-relaxed">
            Track deliverables, review invoices, approve proposals, and download final assets — all in one secure place.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="relative space-y-3">
          {[
            { icon: "", label: "Project Deliverables", desc: "View milestones & approvals" },
            { icon: "", label: "Invoices & Payments",  desc: "Download and track payments" },
            { icon: "", label: "Proposal Approvals",   desc: "Review and sign-off remotely" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="text-xs font-semibold text-white/80">{item.label}</p>
                <p className="text-[10px] text-white/40">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            {org?.logoUrl
              ? <img src={org.logoUrl} alt={org?.name || "Logo"} className="w-8 h-8 rounded-lg object-contain" />
              : <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
            }
            <p className="text-sm font-bold text-white">{org?.name || "Grekam OS"} Client Portal</p>
          </div>

          {!isForgotPassword ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
              <p className="text-white/50 text-sm mb-8">Sign in to your client account to continue.</p>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="you@company.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                      placeholder="Enter your password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                      autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-white/50 cursor-pointer">
                    <input type="checkbox" className="rounded border-white/20 bg-white/5" />
                    Remember me
                  </label>
                  <button type="button" onClick={() => setIsForgotPassword(true)} className="text-violet-400 hover:text-violet-300 transition-colors">
                    Forgot password?
                  </button>
                </div>

                <button type="submit" disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isLoading ? "Signing in..." : "Sign In to Portal"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-1">Access Recovery</h2>
              <p className="text-white/50 text-sm mb-8">Enter your registered email to request a temporary password.</p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotError && (
                  <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {forgotError}
                  </div>
                )}
                {forgotSuccess && (
                  <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                    {forgotSuccess}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required
                    placeholder="you@company.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end text-xs">
                  <button type="button" onClick={() => { setIsForgotPassword(false); setForgotSuccess(""); setForgotError(""); }} className="text-violet-400 hover:text-violet-300 transition-colors">
                    Back to Sign In
                  </button>
                </div>

                <button type="submit" disabled={isForgotLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isForgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isForgotLoading ? "Sending Recovery..." : "Send Recovery Email"}
                </button>
              </form>
            </>
          )}

          <p className="text-xs text-white/30 mt-8 text-center">
            This portal is for {org?.name || "Grekam OS"} clients only.
            <br />If you need access, contact your project manager.
          </p>
        </div>
      </div>
    </div>
  )
}
