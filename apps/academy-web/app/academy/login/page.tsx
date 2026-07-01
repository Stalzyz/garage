"use client"

import { useActionState, useState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { authenticate } from "./actions"
import { AlertCircle, Fingerprint, Lock, Mail, ArrowRight, ShieldCheck,  Briefcase, GraduationCap, Building } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { FaGoogle, FaLinkedin, FaApple, FaMicrosoft, FaGithub } from "react-icons/fa"

const testimonials = [
  { quote: "This platform completely changed how I learn to code. The AI mentor is game-changing.", author: "Sarah J.", role: "Frontend Developer" },
  { quote: "As an educator, the drag-and-drop course builder saves me hours every week.", author: "Michael T.", role: "Lead Instructor" },
  { quote: "I landed my dream job after building my portfolio here. The career hub is fantastic.", author: "Emily R.", role: "UI/UX Designer" }
]

export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined)
  const [isClient, setIsClient] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  
  // Login modes
  const [loginMode, setLoginMode] = useState<"STUDENT" | "EDUCATOR" | "ACADEMY">("STUDENT")

  // Local state for 2FA tracking
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [is2faStage, setIs2faStage] = useState(false)

  // Testimonial rotation
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    setIsClient(true)
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (errorMessage === "2FA_REQUIRED" || errorMessage === "2FA_INVALID") {
      setIs2faStage(true)
    } else if (errorMessage) {
      setIs2faStage(false)
    }
  }, [errorMessage])

  if (!isClient) return null

  const displayError = errorMessage === "2FA_REQUIRED"
    ? ""
    : errorMessage === "2FA_INVALID"
      ? "Invalid verification code. Please try again."
      : errorMessage;

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-blue-500/30 text-white flex flex-col lg:flex-row overflow-hidden relative">
      
      {/* Background Ambient Mesh */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <motion.div 
          animate={{ x: ["0%", "5%", "-5%", "0%"], y: ["0%", "-5%", "5%", "0%"], scale: [1, 1.05, 0.95, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] bg-blue-600/10 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ x: ["0%", "-5%", "5%", "0%"], y: ["0%", "5%", "-5%", "0%"], scale: [1, 0.95, 1.05, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full" 
        />
      </div>
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none" />

      {/* LEFT SIDE - Promotional Content (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative z-10 border-r border-white/10 bg-black/40 backdrop-blur-3xl">
        
        <div>
          <div className="flex items-center gap-3 mb-16">
             <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
               <ShieldCheck className="w-6 h-6 text-blue-400" />
             </div>
             <span className="text-xl font-bold tracking-tight">Grekam EduOS</span>
          </div>

          <h1 className="text-5xl font-bold tracking-tighter mb-6 leading-[1.1]">
            Your workspace <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              for lifelong learning
            </span>
          </h1>
          
          <p className="text-white/60 text-lg mb-10 max-w-md">
            Join thousands of students and educators transforming education through our unified operating system.
          </p>

          {/* Stats / Highlights */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-3xl font-bold text-white mb-1">94%</div>
              <div className="text-sm text-white/50">Placement Rate</div>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-3xl font-bold text-white mb-1">12k+</div>
              <div className="text-sm text-white/50">Active Students</div>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-3xl font-bold text-white mb-1">450+</div>
              <div className="text-sm text-white/50">Expert Educators</div>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-3xl font-bold text-white mb-1">8M+</div>
              <div className="text-sm text-white/50">Hours Learned</div>
            </div>
          </div>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative h-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <p className="text-lg text-white/80 italic mb-4">"{testimonials[activeTestimonial].quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                <div>
                  <div className="font-semibold text-sm">{testimonials[activeTestimonial].author}</div>
                  <div className="text-xs text-white/50">{testimonials[activeTestimonial].role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT SIDE - Authentication */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative z-10 w-full overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-[440px]"
        >
          {/* Mode Selector */}
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl mb-8 relative">
            <button
              onClick={() => setLoginMode("STUDENT")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all relative z-10 ${loginMode === "STUDENT" ? "text-white" : "text-white/50 hover:text-white/80"}`}
            >
              <GraduationCap className="w-4 h-4" /> Student
            </button>
            <button
              onClick={() => setLoginMode("EDUCATOR")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all relative z-10 ${loginMode === "EDUCATOR" ? "text-white" : "text-white/50 hover:text-white/80"}`}
            >
              <Briefcase className="w-4 h-4" /> Educator
            </button>
            <button
              onClick={() => setLoginMode("ACADEMY")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all relative z-10 ${loginMode === "ACADEMY" ? "text-white" : "text-white/50 hover:text-white/80"}`}
            >
              <Building className="w-4 h-4" /> Academy
            </button>
            
            {/* Animated Slider Background */}
            <motion.div 
              className="absolute top-1 bottom-1 w-[33.33%] bg-white/10 border border-white/10 rounded-xl"
              animate={{ 
                left: loginMode === "STUDENT" ? "4px" : loginMode === "EDUCATOR" ? "33.33%" : "calc(66.66% - 4px)" 
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h2>
            <p className="text-white/50 text-sm">
              Sign in to your {loginMode.toLowerCase()} workspace to continue.
            </p>
          </div>

          <form action={dispatch} className="space-y-5">
            {is2faStage ? (
              <div className="space-y-4">
                <input type="hidden" name="email" value={email} />
                <input type="hidden" name="password" value={password} />
                
                <div className="space-y-2 text-center mb-4">
                  <label htmlFor="code" className="text-xs font-semibold text-white/50 uppercase tracking-wider block">Two-Factor Authentication</label>
                  <p className="text-xs text-white/40">Enter the 6-digit code from your authenticator app.</p>
                </div>
                
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within/input:text-emerald-400 transition-colors">
                    <ShieldCheck className="w-5 h-5" />
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
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-mono text-center text-xl tracking-[0.5em]"
                    maxLength={6}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-white/70 ml-1">Email Address</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within/input:text-blue-400 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="hello@example.com"
                      required
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1 mr-1">
                    <label htmlFor="password" className="text-xs font-semibold text-white/70">Password</label>
                    <Link href="/auth/forgot-password" className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within/input:text-blue-400 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono tracking-wider"
                    />
                  </div>
                </div>
                
                {/* Remember Me */}
                <div className="flex items-center ml-1">
                  <input type="checkbox" id="remember" className="w-4 h-4 rounded border-white/20 bg-white/5 accent-blue-500" />
                  <label htmlFor="remember" className="ml-2 text-sm text-white/60 select-none cursor-pointer">
                    Keep me signed in
                  </label>
                </div>
              </>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {displayError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-3 mt-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p className="text-sm">{displayError}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <div className="pt-2">
              <LoginButton is2fa={is2faStage} mode={loginMode} />
            </div>
            
            {/* Divider */}
            {!is2faStage && (
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-[#050505] text-white/40">Or continue with</span>
                </div>
              </div>
            )}
            
            {/* Social Logins */}
            {!is2faStage && (
              <div className="grid grid-cols-2 gap-3">
                <button type="button" className="h-12 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
                  <FaGoogle className="w-4 h-4 text-white/80" />
                  <span className="text-sm font-medium">Google</span>
                </button>
                <button type="button" className="h-12 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
                  <FaApple className="w-4 h-4 text-white/80" />
                  <span className="text-sm font-medium">Apple</span>
                </button>
                <button type="button" className="h-12 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
                  <FaMicrosoft className="w-4 h-4 text-white/80" />
                  <span className="text-sm font-medium">Microsoft</span>
                </button>
                <button type="button" className="h-12 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
                  <FaLinkedin className="w-4 h-4 text-[#0077b5]" />
                  <span className="text-sm font-medium">LinkedIn</span>
                </button>
                {loginMode !== "ACADEMY" && (
                  <button type="button" className="h-12 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors col-span-2">
                    <FaGithub className="w-4 h-4 text-white/80" />
                    <span className="text-sm font-medium">GitHub (Tech Courses)</span>
                  </button>
                )}
              </div>
            )}
          </form>

          {/* Registration Link */}
          <div className="mt-8 text-center text-sm text-white/50">
            Don't have an account?{" "}
            <Link href={`/academy/register?type=${loginMode.toLowerCase()}`} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Create an account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function LoginButton({ is2fa, mode }: { is2fa: boolean, mode: string }) {
  const { pending } = useFormStatus()

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`relative w-full h-14 flex items-center justify-center gap-2 rounded-2xl font-bold transition-all overflow-hidden group ${pending ? 'bg-white/10 text-white/50 cursor-not-allowed border border-white/5' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'}`}
    >
      {pending ? (
        <>
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
          Authenticating...
        </>
      ) : (
        <>
          {is2fa ? "Verify & Sign In" : `Sign In to ${mode.charAt(0) + mode.slice(1).toLowerCase()} OS`}
          <ArrowRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all ml-1" />
        </>
      )}
      
      {!pending && (
        <div className="absolute inset-0 -translate-x-[150%] animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />
      )}
    </button>
  )
}
