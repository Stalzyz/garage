"use client"
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, MapPin, Mail, Phone, ArrowRight, Sparkles, Orbit } from 'lucide-react'

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white flex flex-col font-sans relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 md:p-10 border-b border-white/5">
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:rotate-180 transition-transform duration-700">
            <Orbit className="w-6 h-6 text-black" />
          </div>
          <span className="font-bold tracking-widest uppercase text-sm md:text-base">Grekam Visuals</span>
        </a>
        <a href="/agency" className="text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors">
          Back to Agency
        </a>
      </nav>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10 flex flex-col lg:flex-row gap-16 lg:gap-24 relative z-10 items-center justify-center min-h-[calc(100vh-100px)] pb-20">
        
        {/* Left Column: Info */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 w-full"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-8">
            <Sparkles className="w-3 h-3" /> Let's Collaborate
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter mb-8">
            Start a <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Project
            </span>
          </h1>
          <p className="text-lg text-slate-400 mb-12 max-w-md leading-relaxed">
            Ready to push the boundaries of digital design? Drop us a line and let's build something extraordinary together.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-1">Global HQ</h4>
                <p className="text-slate-400">123 Innovation Drive, Tech District<br/>San Francisco, CA 94105</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-1">General Inquiries</h4>
                <a href="mailto:hello@grekam.com" className="text-blue-400 hover:text-blue-300 transition-colors">hello@grekam.com</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-1">Direct Line</h4>
                <p className="text-slate-400">+1 (800) 123-4567</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Form */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="flex-1 w-full max-w-xl"
        >
          <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            
            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center relative z-10"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-black uppercase mb-4">Request Sent!</h3>
                <p className="text-slate-400 max-w-xs">
                  We've received your brief. Our lead architect will be in touch within 24 hours.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="mt-8 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold uppercase tracking-widest transition-all"
                >
                  Send Another
                </button>
              </motion.div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                const email = formData.get('email') as string;
                const countryCode = formData.get('countryCode') as string;
                const phone = formData.get('phone') as string;
                const notes = formData.get('notes') as string;
                
                try {
                  const res = await fetch('/api/v1/crm/public/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      source: 'WEBSITE',
                      name,
                      email,
                      phone: `${countryCode}${phone}`,
                      notes,
                      projectType: 'CUSTOM'
                    })
                  });
                  if (res.ok) {
                    setIsSubmitted(true);
                  } else {
                    alert('Failed to submit. Please try again.');
                  }
                } catch (err) {
                  console.error(err);
                  alert('Error submitting request.');
                } finally {
                  setIsSubmitting(false);
                }
              }} className="flex flex-col gap-5 relative z-10">
                <div className="flex flex-col md:flex-row gap-5">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">Full Name</label>
                    <input required name="name" type="text" placeholder="John Doe" className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-blue-500/50 focus:bg-black/60 transition-all placeholder:text-white/20" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">Email Address</label>
                    <input required name="email" type="email" placeholder="john@company.com" className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-blue-500/50 focus:bg-black/60 transition-all placeholder:text-white/20" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">Mobile Number</label>
                  <div className="flex gap-3">
                    <select name="countryCode" className="w-[120px] bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-blue-500/50 focus:bg-black/60 transition-all appearance-none cursor-pointer">
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+81">🇯🇵 +81</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+86">🇨🇳 +86</option>
                    </select>
                    <input required name="phone" type="tel" placeholder="(555) 000-0000" className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-blue-500/50 focus:bg-black/60 transition-all placeholder:text-white/20" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">Project Brief</label>
                  <textarea required name="notes" placeholder="Tell us about your goals, timeline, and budget..." className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-blue-500/50 focus:bg-black/60 transition-all placeholder:text-white/20 h-32 resize-none" />
                </div>

                <button 
                  disabled={isSubmitting}
                  type="submit" 
                  className="mt-4 w-full bg-white text-black font-bold uppercase tracking-widest py-5 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Submit Request <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
