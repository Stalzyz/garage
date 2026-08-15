"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, CheckCircle, Phone, Mail, MapPin, Clock } from "lucide-react";
import { submitLead } from "../actions/lead";
import { Header } from "../../components/landing/Header";
import { Footer } from "../../components/landing/Footer";

const courses = [
  { label: "Graphic Designing", code: "PGDMP-2026" },
  { label: "UI/UX Design", code: "PUXMP-2026" },
  { label: "Full Stack Web Development", code: "PFSD-2026" },
  { label: "WordPress Web Design", code: "PWD-2026" },
  { label: "Video Editing with AI", code: "PVEM-2026" },
  { label: "Motion Graphics", code: "PMGM-2026" },
  { label: "3D Animation", code: "P3DA-2026" },
  { label: "Digital Marketing", code: "PDMM-2026" },
  { label: "VFX & Compositing", code: "PVFX-2026" },
  { label: "Not sure yet", code: "GENERAL" },
];

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState("GENERAL");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const courseName = courses.find(c => c.code === selectedCourse)?.label ?? "General Inquiry";

    const result = await submitLead(formData, selectedCourse, courseName);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Header theme="dark" />

      <div className="flex-1 pt-28 pb-24 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-20"
          >
            <span className="inline-block font-mono text-xs uppercase tracking-widest text-[#49abc9] border border-[#49abc9]/30 bg-[#49abc9]/5 px-4 py-2 rounded-full mb-6">
              Admissions Open — 2026 Batch
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-[#FAFAF8] mb-6 leading-none">
              Let's Talk.
            </h1>
            <p className="text-lg md:text-xl text-[#A1A1AA] max-w-2xl mx-auto">
              Leave your details below. Our admissions team will reach out within 24 hours — no spam, no pressure.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

            {/* Left: Contact Info Panel */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className="lg:col-span-2 space-y-8"
            >
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-[#FAFAF8] mb-2">Grekam Design Academy</h2>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed">
                    A creative institute built for the next generation of designers, developers, and digital artists.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#49abc9]/10 border border-[#49abc9]/20 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-[#49abc9]" />
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-widest text-white/40 mb-1">Email</p>
                      <a href="mailto:admissions@grekam.in" className="text-[#FAFAF8] hover:text-[#49abc9] transition-colors font-medium">
                        admissions@grekam.in
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#49abc9]/10 border border-[#49abc9]/20 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-[#49abc9]" />
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-widest text-white/40 mb-1">Phone</p>
                      <a href="tel:+919876543210" className="text-[#FAFAF8] hover:text-[#49abc9] transition-colors font-medium">
                        +91 98765 43210
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#49abc9]/10 border border-[#49abc9]/20 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-[#49abc9]" />
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-widest text-white/40 mb-1">Location</p>
                      <p className="text-[#FAFAF8] font-medium">Coimbatore, Tamil Nadu</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#49abc9]/10 border border-[#49abc9]/20 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-[#49abc9]" />
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-widest text-white/40 mb-1">Response Time</p>
                      <p className="text-[#FAFAF8] font-medium">Within 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { stat: "9+", label: "Programs" },
                  { stat: "500+", label: "Students" },
                  { stat: "100%", label: "Guided" },
                ].map((item) => (
                  <div key={item.label} className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-black text-[#49abc9] mb-1">{item.stat}</div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Lead Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
              className="lg:col-span-3"
            >
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-10 relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#49abc9]/5 rounded-full blur-[80px] pointer-events-none" />

                {success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-16 relative z-10"
                  >
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6">
                      <CheckCircle className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-3xl font-black text-[#FAFAF8] mb-3">You're on the list!</h3>
                    <p className="text-[#A1A1AA] max-w-sm leading-relaxed">
                      Our admissions team has received your request and will reach out within 24 hours. Check your inbox.
                    </p>
                    <a
                      href="/"
                      className="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all font-mono text-sm uppercase tracking-widest"
                    >
                      Back to Academy
                    </a>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div>
                      <h2 className="text-2xl font-bold text-[#FAFAF8] mb-1">Book a Free Consultation</h2>
                      <p className="text-[#A1A1AA] text-sm">Fill this in and we'll set up a call to walk you through everything.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-white/40 mb-2">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="Your full name"
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#49abc9]/50 focus:border-[#49abc9]/50 transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-white/40 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="+91 98765 43210"
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#49abc9]/50 focus:border-[#49abc9]/50 transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-white/40 mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#49abc9]/50 focus:border-[#49abc9]/50 transition-all text-sm"
                      />
                    </div>

                    {/* Course Interest Selector */}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-white/40 mb-3">Course Interest</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {courses.map((course) => (
                          <button
                            key={course.code}
                            type="button"
                            onClick={() => setSelectedCourse(course.code)}
                            className={`px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all border ${
                              selectedCourse === course.code
                                ? "bg-[#49abc9]/15 border-[#49abc9]/50 text-[#49abc9]"
                                : "bg-white/[0.02] border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
                            }`}
                          >
                            {course.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hidden field for selected course code */}
                    <input type="hidden" name="courseCode" value={selectedCourse} />

                    {error && (
                      <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 rounded-xl font-bold text-[#050505] flex items-center justify-center gap-2 bg-[#49abc9] hover:bg-[#5bbcd8] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#49abc9]/20 text-base"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Send My Application <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <p className="text-white/30 text-xs text-center">
                      By submitting, you agree to our Terms of Service and Privacy Policy.
                      We never share your data with third parties.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
