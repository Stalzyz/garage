"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useOrganization } from "@/context/OrganizationContext"
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react"

// Demo client credentials
const DEMO_CLIENTS = [
  { email: "redbrick@client.com", password: "demo1234", name: "RedBrick Realty", avatar: "R" },
  { email: "techflow@client.com", password: "demo1234", name: "Techflow SaaS",   avatar: "T" },
  { email: "fitburst@client.com", password: "demo1234", name: "Fitburst Gym",    avatar: "F" },
]

export default function ClientPortalLogin() {
  const router = useRouter()
  const org = useOrganization()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

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
        setError("Invalid email or password.")
      } else {
        router.push("/portal/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = (client: typeof DEMO_CLIENTS[0]) => {
    setEmail(client.email)
    setPassword("demo1234")
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
          {org.logoUrl
            ? <img src={org.logoUrl} alt={org.name} className="w-10 h-10 rounded-xl object-contain" />
            : <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
          }
          <div>
            <p className="text-sm font-bold text-white">{org.name}</p>
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
            { icon: "📁", label: "Project Deliverables", desc: "View milestones & approvals" },
            { icon: "📄", label: "Invoices & Payments",  desc: "Download and track payments" },
            { icon: "✅", label: "Proposal Approvals",   desc: "Review and sign-off remotely" },
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
            {org.logoUrl
              ? <img src={org.logoUrl} alt={org.name} className="w-8 h-8 rounded-lg object-contain" />
              : <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
            }
            <p className="text-sm font-bold text-white">{org.name} Client Portal</p>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-white/50 text-sm mb-8">Sign in to your client account to continue.</p>

          {/* Quick Login Pills */}
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-3">Quick Demo Access</p>
            <div className="flex gap-2 flex-wrap">
              {DEMO_CLIENTS.map(c => (
                <button key={c.email} onClick={() => handleQuickLogin(c)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 hover:text-white transition-all"
                >
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-[9px] font-bold text-white">
                    {c.avatar}
                  </span>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

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
                  placeholder="••••••••"
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
              <button type="button" className="text-violet-400 hover:text-violet-300 transition-colors">
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

          <p className="text-xs text-white/30 mt-8 text-center">
            This portal is for {org.name} clients only.
            <br />If you need access, contact your project manager.
          </p>
        </div>
      </div>
    </div>
  )
}
