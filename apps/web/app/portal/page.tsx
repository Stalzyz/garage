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

  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotSuccess, setForgotSuccess] = useState("")
  const [forgotError, setForgotError] = useState("")
  const [isForgotLoading, setIsForgotLoading] = useState(false)

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
    }
  }, [status, session, router, isClient])

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
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

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
    <div className="min-h-screen bg-[#000000] flex text-white font-sans selection:bg-[#0A84FF]/30">
      
      {/* Left — Branding */}
      <div className="hidden lg:flex flex-col w-[480px] flex-none bg-[#121214] border-r border-white/[0.08] p-12 relative overflow-hidden">
        {/* Logo */}
        <div className="relative flex items-center gap-3 mb-auto">
          {org?.logoUrl
            ? <img src={org.logoUrl} alt={org?.name || "Logo"} className="w-8 h-8 rounded-lg object-contain" />
            : <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/[0.1] flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
          }
          <div>
            <p className="text-sm font-semibold text-white tracking-tight">{org?.name || "Garage CRM"}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Client Portal</p>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative my-auto space-y-3">
          <h1 className="text-3xl font-semibold text-white leading-tight">
            Your service & repairs,<br />always in view.
          </h1>
          <p className="text-white/50 text-xs leading-relaxed max-w-sm">
            Track job card stages, review estimates, approve proposals, and download tax invoices — in one secure portal.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="relative space-y-2.5">
          {[
            { label: "Job Card Progress", desc: "Live stage telemetry & parts approvals" },
            { label: "Invoices & Payments", desc: "Instant PDF downloads & online settlement" },
            { label: "Quotations & Estimates", desc: "Review and approve estimates remotely" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-[#161618] border border-white/[0.08]">
              <div>
                <p className="text-xs font-medium text-white/90">{item.label}</p>
                <p className="text-[11px] text-white/40">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#000000]">
        <div className="w-full max-w-sm">
          
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            {org?.logoUrl
              ? <img src={org.logoUrl} alt={org?.name || "Logo"} className="w-8 h-8 rounded-lg object-contain" />
              : <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/[0.1] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
            }
            <p className="text-sm font-semibold text-white">{org?.name || "Garage CRM"} Client Portal</p>
          </div>

          {!isForgotPassword ? (
            <>
              <h2 className="text-xl font-semibold text-white tracking-tight mb-1">Welcome back</h2>
              <p className="text-white/40 text-xs mb-6">Sign in to your client portal account.</p>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="px-3.5 py-2.5 rounded-lg bg-[#FF453A]/10 border border-[#FF453A]/20 text-[#FF453A] text-xs">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/50">Email Address</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="you@company.com"
                    className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#0A84FF] transition-colors"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/50">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                      placeholder="Enter your password"
                      className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 pr-10 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#0A84FF] transition-colors"
                      autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-white/50 cursor-pointer">
                    <input type="checkbox" className="rounded border-white/[0.1] bg-[#121214] text-[#0A84FF]" />
                    Remember me
                  </label>
                  <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[#0A84FF] hover:underline">
                    Forgot password?
                  </button>
                </div>

                <button type="submit" disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0A84FF] hover:bg-[#0071E3] text-white text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {isLoading ? "Signing in..." : "Sign In to Portal"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white tracking-tight mb-1">Access Recovery</h2>
              <p className="text-white/40 text-xs mb-6">Enter your registered email to request a temporary password.</p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotError && (
                  <div className="px-3.5 py-2.5 rounded-lg bg-[#FF453A]/10 border border-[#FF453A]/20 text-[#FF453A] text-xs">
                    {forgotError}
                  </div>
                )}
                {forgotSuccess && (
                  <div className="px-3.5 py-2.5 rounded-lg bg-[#30D158]/10 border border-[#30D158]/20 text-[#30D158] text-xs">
                    {forgotSuccess}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/50">Email Address</label>
                  <input
                    type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required
                    placeholder="you@company.com"
                    className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#0A84FF] transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end text-xs">
                  <button type="button" onClick={() => { setIsForgotPassword(false); setForgotSuccess(""); setForgotError(""); }} className="text-[#0A84FF] hover:underline">
                    Back to Sign In
                  </button>
                </div>

                <button type="submit" disabled={isForgotLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0A84FF] hover:bg-[#0071E3] text-white text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {isForgotLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {isForgotLoading ? "Sending Recovery..." : "Send Recovery Email"}
                </button>
              </form>
            </>
          )}

          <p className="text-[11px] text-white/30 mt-8 text-center">
            This portal is for {org?.name || "Garage CRM"} clients only.
          </p>
        </div>
      </div>
    </div>
  )
}
