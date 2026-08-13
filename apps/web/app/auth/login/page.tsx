"use client"

import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AlertCircle, Fingerprint, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useOrganization } from "@/context/OrganizationContext"

export default function LoginPage() {
  const router = useRouter()
  const org = useOrganization()
  const [isClient, setIsClient] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  // Local state for 2FA tracking
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [is2faStage, setIs2faStage] = useState(false)

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
        code: code || "",
        redirect: false,
      })

      if (!result) {
        setErrorMessage("An unexpected error occurred. Please try again.")
        setIsPending(false)
        return
      }

      if (result.error) {
        const err = result.error
        if (err.includes("2FA_REQUIRED")) {
          setIs2faStage(true)
          setIsPending(false)
          return
        }
        if (err.includes("2FA_INVALID")) {
          setErrorMessage("Invalid verification code. Please try again.")
          setIsPending(false)
          return
        }
        setErrorMessage("Invalid email or password.")
        setIsPending(false)
        return
      }

      // Success — fetch session and redirect based on role
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
    } catch (err) {
      setErrorMessage("A network error occurred. Please try again.")
      setIsPending(false)
    }
  }

  const displayError = errorMessage

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
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2, stiffness: 200, damping: 20 }}
              className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.05)]"
            >
              <ShieldCheck className="w-8 h-8 text-white/80" strokeWidth={1.5} />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tighter mb-2">{org.name}</h1>
            <p className="text-sm font-mono tracking-widest text-white/40 uppercase">
              {is2faStage ? "Verification" : "Staff Secure Login"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {is2faStage ? (
              <div className="space-y-4">
                <div className="space-y-2 text-center mb-4">
                  <label htmlFor="code" className="text-xs font-mono tracking-widest text-white/50 uppercase block">2FA Code</label>
                  <p className="text-xs text-white/40">Enter the 6-digit token from your Google Authenticator or TOTP app.</p>
                </div>
                
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within/input:text-emerald-400 transition-colors">
                    <ShieldCheck className="w-5 h-5 text-emerald-500/80" strokeWidth={1.5} />
                  </div>
                  <input
                    id="code"
                    type="text"
                    name="code"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    required
                    autoFocus
                    autoComplete="one-time-code"
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all backdrop-blur-md font-mono text-center text-xl tracking-widest"
                    maxLength={6}
                  />
                </div>
              </div>
            ) : (
              <>
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
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="staff@grekam.com"
                      required
                      autoComplete="email"
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-md"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-2 mr-2">
                    <label htmlFor="password" className="text-xs font-mono tracking-widest text-white/50 uppercase">Passkey</label>
                    <Link href="/auth/forgot-password" className="text-xs font-mono tracking-widest text-blue-400 hover:text-blue-300 transition-colors uppercase">
                      Recover?
                    </Link>
                  </div>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within/input:text-blue-400 transition-colors">
                      <Lock className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-md font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isPending}
                className={`relative w-full h-14 flex items-center justify-center gap-3 rounded-2xl font-bold tracking-widest uppercase transition-all overflow-hidden group ${isPending ? 'bg-white/10 text-white/50 cursor-not-allowed border border-white/5' : 'bg-white text-black hover:scale-[1.02]'}`}
              >
                {isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                    {is2faStage ? "Verify & Sign In" : "Initialize Session"}
                    <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </>
                )}
                
                {/* Button Shine Effect */}
                {!isPending && (
                  <div className="absolute inset-0 -translate-x-[150%] animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
                )}
              </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {displayError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                    <p className="text-sm">{displayError}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
          
          {/* Link to Academy */}
          <div className="mt-8 text-center">
             <a href="https://academy.grekam.in/auth/login" className="text-xs font-mono tracking-widest text-white/40 hover:text-white/80 transition-colors uppercase block">
               Student or Educator? Log in here →
             </a>
          </div>
        </div>
      </motion.div>

      {/* Floating back button */}
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white transition-all text-xs font-mono tracking-widest uppercase backdrop-blur-md z-50">
        ← Return
      </Link>
    </div>
  )
}
