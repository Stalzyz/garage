"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  GraduationCap, 
  Briefcase,
  Building, 
  CheckCircle2,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Code,
  Globe,
  UploadCloud,
  FileText
} from "lucide-react"
import Link from "next/link"

function RegisterWizard() {
  const searchParams = useSearchParams()
  const initialType = searchParams.get("type") === "educator" ? "EDUCATOR" : "STUDENT"
  
  const [mode, setMode] = useState<"STUDENT" | "EDUCATOR">(initialType)
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Combined State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    // Student specifics
    country: "",
    city: "",
    dob: "",
    education: "",
    profession: "",
    // Educator specifics
    designation: "",
    company: "",
    experience: "",
    skills: "",
    bio: "",
    // Common
    linkedin: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 4))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
    }, 2000)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white font-sans">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-10 text-center backdrop-blur-2xl"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Registration Successful!</h2>
          <p className="text-white/60 mb-8">
            {mode === "STUDENT" 
              ? "Welcome to Grekam EduOS. Your learning journey starts now."
              : "Your educator profile is under review. You'll hear from us soon."}
          </p>
          <Link href="/academy/login" className="block w-full py-4 bg-white text-black font-bold rounded-xl hover:scale-[1.02] transition-transform">
            Go to Login
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-blue-500/30 text-white flex flex-col overflow-hidden relative">
      
      {/* Background Meshes */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[70%] bg-blue-600/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[60%] bg-purple-600/20 blur-[150px] rounded-full" />
      </div>
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-xl font-bold tracking-tight">Grekam EduOS</span>
        </Link>
        <Link href="/academy/login" className="text-sm font-semibold text-white/60 hover:text-white transition-colors">
          Already have an account? Login
        </Link>
      </header>

      {/* Main Wizard */}
      <main className="flex-1 relative z-10 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-4xl grid md:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* Left Column: Progress Sidebar */}
          <div className="md:col-span-4 space-y-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tighter mb-4 leading-tight">
                Create your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  {mode === "STUDENT" ? "Learning" : "Teaching"} Space
                </span>
              </h1>
              <p className="text-white/50 text-sm">Follow the simple steps to set up your profile and enter the ecosystem.</p>
            </div>

            {/* Mode Toggle (Only show on step 1) */}
            {step === 1 && (
              <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl relative">
                <button
                  type="button"
                  onClick={() => setMode("STUDENT")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all relative z-10 \${mode === "STUDENT" ? "text-white" : "text-white/50"}`}
                >
                  <GraduationCap className="w-4 h-4" /> Learner
                </button>
                <button
                  type="button"
                  onClick={() => setMode("EDUCATOR")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all relative z-10 \${mode === "EDUCATOR" ? "text-white" : "text-white/50"}`}
                >
                  <Briefcase className="w-4 h-4" /> Educator
                </button>
                
                <motion.div 
                  className="absolute top-1 bottom-1 w-[50%] bg-white/10 border border-white/10 rounded-xl"
                  animate={{ left: mode === "STUDENT" ? "4px" : "calc(50% - 4px)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
            )}

            {/* Steps Progress */}
            <div className="space-y-6 pt-4">
              {[
                { num: 1, title: "Account Details", desc: "Basic information" },
                { num: 2, title: mode === "STUDENT" ? "Demographics" : "Professional Info", desc: mode === "STUDENT" ? "Location & DOB" : "Experience & Role" },
                { num: 3, title: mode === "STUDENT" ? "Interests" : "Verification", desc: mode === "STUDENT" ? "Learning goals" : "Docs & Portfolio" }
              ].map((s) => (
                <div key={s.num} className="flex gap-4 items-start opacity-100 transition-opacity">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border transition-all duration-500 \${
                    step === s.num ? "bg-blue-500 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" :
                    step > s.num ? "bg-white border-white text-black" : "bg-white/5 border-white/10 text-white/40"
                  }`}>
                    {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                  </div>
                  <div>
                    <h3 className={`font-bold \${step >= s.num ? "text-white" : "text-white/40"}`}>{s.title}</h3>
                    <p className="text-xs text-white/40">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Form Area */}
          <div className="md:col-span-8">
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
              <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="min-h-[400px] flex flex-col"
                  >
                    
                    {/* STEP 1: Account Details (Same for both) */}
                    {step === 1 && (
                      <div className="space-y-6 flex-1">
                        <div className="grid grid-cols-2 gap-4">
                          <InputField icon={<User />} label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                          <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
                        </div>
                        <InputField icon={<Mail />} type="email" label="Email Address" name="email" value={formData.email} onChange={handleChange} required />
                        <InputField icon={<Phone />} type="tel" label="Mobile Number" name="phone" value={formData.phone} onChange={handleChange} required />
                        <InputField icon={<Lock />} type="password" label="Create Password" name="password" value={formData.password} onChange={handleChange} required />
                      </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && mode === "STUDENT" && (
                      <div className="space-y-6 flex-1">
                        <div className="grid grid-cols-2 gap-4">
                          <InputField icon={<Globe />} label="Country" name="country" value={formData.country} onChange={handleChange} required />
                          <InputField icon={<MapPin />} label="City" name="city" value={formData.city} onChange={handleChange} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <InputField icon={<Calendar />} type="date" label="Date of Birth" name="dob" value={formData.dob} onChange={handleChange} required />
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-white/70 ml-1 block">Gender</label>
                            <select className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white focus:ring-1 focus:ring-blue-500/50 outline-none appearance-none cursor-pointer">
                              <option value="male" className="bg-black">Male</option>
                              <option value="female" className="bg-black">Female</option>
                              <option value="other" className="bg-black">Other</option>
                            </select>
                          </div>
                        </div>
                        <InputField icon={<BookOpen />} label="Highest Education" name="education" value={formData.education} onChange={handleChange} placeholder="e.g. B.Tech Computer Science" required />
                      </div>
                    )}

                    {step === 2 && mode === "EDUCATOR" && (
                      <div className="space-y-6 flex-1">
                        <InputField icon={<Briefcase />} label="Current Designation" name="designation" value={formData.designation} onChange={handleChange} placeholder="e.g. Senior Software Engineer" required />
                        <InputField icon={<Building />} label="Company / Institution" name="company" value={formData.company} onChange={handleChange} required />
                        <div className="grid grid-cols-2 gap-4">
                          <InputField icon={<Calendar />} type="number" label="Years of Experience" name="experience" value={formData.experience} onChange={handleChange} min="0" required />
                          <InputField icon={<Code />} label="Primary Skill" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. React, Python" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-white/70 ml-1">Short Bio</label>
                          <textarea 
                            name="bio" 
                            value={formData.bio} 
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none h-24"
                            placeholder="Tell students about your expertise..."
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && mode === "STUDENT" && (
                      <div className="space-y-6 flex-1">
                        <InputField icon={<Briefcase />} label="Current Profession" name="profession" value={formData.profession} onChange={handleChange} placeholder="e.g. Student, Fresher, Developer" />
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-white/70 ml-1">Areas of Interest (Select up to 3)</label>
                          <div className="flex flex-wrap gap-2">
                            {["Frontend Dev", "Backend Dev", "UI/UX Design", "Data Science", "Marketing", "Cybersecurity"].map(interest => (
                              <button type="button" key={interest} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors">
                                {interest}
                              </button>
                            ))}
                          </div>
                        </div>
                        <InputField icon={<Globe />} label="LinkedIn / Portfolio URL (Optional)" name="linkedin" value={formData.linkedin} onChange={handleChange} />
                      </div>
                    )}

                    {step === 3 && mode === "EDUCATOR" && (
                      <div className="space-y-6 flex-1">
                        <InputField icon={<Globe />} label="LinkedIn URL" name="linkedin" value={formData.linkedin} onChange={handleChange} required />
                        
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-white/70 ml-1">Identity Verification & Resume</label>
                          <div className="border-2 border-dashed border-white/10 hover:border-white/20 bg-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
                            <UploadCloud className="w-8 h-8 text-white/40 mb-3 group-hover:text-blue-400 transition-colors" />
                            <p className="text-sm font-semibold mb-1">Click to upload documents</p>
                            <p className="text-xs text-white/40">Upload Gov ID and latest Resume (PDF)</p>
                          </div>
                        </div>
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>

                {/* Footer Controls */}
                <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between">
                  {step > 1 ? (
                    <button 
                      type="button" 
                      onClick={prevStep}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-semibold transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  ) : <div></div>}

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] \${isSubmitting ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                  >
                    {isSubmitting ? "Processing..." : step === 3 ? "Complete Registration" : "Continue"} 
                    {!isSubmitting && step < 3 && <ArrowRight className="w-4 h-4" />}
                    {!isSubmitting && step === 3 && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper Input Component
function InputField({ label, icon, ...props }: any) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-xs font-semibold text-white/70 ml-1 block">{label}</label>
      <div className="relative group/input">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within/input:text-blue-400 transition-colors">
            {icon && React.cloneElement(icon, { className: "w-5 h-5", strokeWidth: 1.5 })}
          </div>
        )}
        <input
          {...props}
          className={`w-full h-14 bg-white/5 border border-white/10 rounded-2xl \${icon ? 'pl-12' : 'pl-4'} pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all`}
        />
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
      <RegisterWizard />
    </Suspense>
  )
}
