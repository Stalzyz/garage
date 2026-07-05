"use client"

import { useState } from "react"
import { CheckCircle2, Loader2, GraduationCap, Star } from "lucide-react"

const INTERESTS = [
  "Graphic Design", "UI/UX Design", "Web Development",
  "Motion Graphics", "Video Editing", "Photography",
  "Digital Marketing", "3D Design", "Brand Identity",
  "Interior Design", "Fashion Design", "Other"
]

const SOURCES = [
  { value: "GOOGLE", label: "Google / Search" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "FRIEND", label: "Friend / Word of Mouth" },
  { value: "REFERRAL", label: "Student Referral" },
  { value: "HOARDING", label: "Banner / Hoarding" },
  { value: "OTHER", label: "Other" },
]

const TYPES = [
  { value: "WALKIN", label: "Just Enquiring 👀" },
  { value: "DEMO", label: "Want a Demo Class 🎓" },
  { value: "ENQUIRY", label: "Course Information 📚" },
  { value: "CAMPUS_TOUR", label: "Campus Tour 🏛️" },
]

export default function KioskPage() {
  const [step, setStep] = useState<"FORM" | "SUCCESS">("FORM")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [tokenNumber, setTokenNumber] = useState("")

  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    interestArea: "", type: "WALKIN", source: "OTHER",
    preferredDate: "", notes: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!form.name) {
      setError("Please enter your full name.")
      return
    }
    if (!form.phone || form.phone.length < 10) {
      setError("Please enter a valid 10-digit phone number.")
      return
    }
    if (!form.interestArea) {
      setError("Please select at least one course that interests you.")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch("http://localhost:4000/api/v1/academy/walk-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Registration failed")
      // Generate a simple token number
      setTokenNumber(`GRK-${Date.now().toString().slice(-5)}`)
      setStep("SUCCESS")
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === "SUCCESS") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center text-white">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-black mb-3">You're Registered!</h1>
          <p className="text-white/60 text-lg mb-8">Welcome to Grekam Academy. A counsellor will be with you shortly.</p>
          
          <div className="bg-white/10 border border-white/20 rounded-3xl p-8 mb-8 backdrop-blur-sm">
            <p className="text-white/50 text-sm uppercase tracking-widest mb-2">Your Token Number</p>
            <div className="text-5xl font-black text-white tracking-wider mb-4">{tokenNumber}</div>
            <p className="text-white/50 text-sm">Show this to our front desk team</p>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-sm text-emerald-300 mb-8">
            📱 A WhatsApp confirmation has been sent to <strong>{form.phone}</strong>
          </div>

          <button onClick={() => { setStep("FORM"); setForm({ name:"",phone:"",email:"",interestArea:"",type:"WALKIN",source:"OTHER",preferredDate:"",notes:"" }) }}
            className="text-white/40 text-sm underline">
            Register another visitor
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-500 flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <div className="text-white font-black text-xl">Grekam Academy</div>
              <div className="text-violet-300 text-xs">Welcome! Please register your visit.</div>
            </div>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Quick Registration</h1>
          <p className="text-white/50">Fill in your details and we'll have a counsellor with you in minutes.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 space-y-6">
          
          {/* Visit Type */}
          <div>
            <label className="text-xs text-white/50 uppercase tracking-widest block mb-3">What brings you here today?</label>
            <div className="grid grid-cols-2 gap-3">
              {TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => setForm(p => ({...p, type: t.value}))}
                  className={`py-3 px-4 rounded-2xl text-sm font-bold border transition-all text-left
                    ${form.type === t.value ? "bg-violet-500 border-violet-400 text-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Full Name *</label>
              <input required placeholder="Your name"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-400 transition-colors"
                value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Phone Number *</label>
              <input required type="tel" placeholder="10-digit mobile"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-400 transition-colors"
                value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Email (Optional)</label>
            <input type="email" placeholder="your@email.com"
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-400 transition-colors"
              value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} />
          </div>

          {/* Interest Area */}
          <div>
            <label className="text-xs text-white/50 uppercase tracking-widest block mb-3">Which course interests you? *</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <button key={i} type="button" onClick={() => setForm(p => ({...p, interestArea: i}))}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all
                    ${form.interestArea === i ? "bg-violet-500 border-violet-400 text-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Source */}
          <div>
            <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">How did you hear about us?</label>
            <select className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-violet-400 transition-colors [&>option]:bg-[#302b63]"
              value={form.source} onChange={e => setForm(p => ({...p, source: e.target.value}))}>
              {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Preferred Demo Date — only show for DEMO type */}
          {form.type === "DEMO" && (
            <div>
              <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Preferred Demo Date</label>
              <input type="date" min={new Date().toISOString().split("T")[0]}
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-violet-400 transition-colors [color-scheme:dark]"
                value={form.preferredDate} onChange={e => setForm(p => ({...p, preferredDate: e.target.value}))} />
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-rose-400 text-sm">
              {error}
            </div>
          )}

          <button type="submit" disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-black text-lg rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-violet-500/30">
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <><Star className="w-5 h-5 fill-current" /> Register My Visit</>
            )}
          </button>
        </form>

        <p className="text-center text-white/20 text-xs mt-6">
          By registering, you agree to be contacted by our team. Your data is safe with us.
        </p>
      </div>
    </div>
  )
}
