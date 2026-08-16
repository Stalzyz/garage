"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, CheckCircle, Phone, Mail, MapPin, Clock } from "lucide-react";
import { submitLead } from "../actions/lead";
import { Header } from "../../components/landing/Header";
import { Footer } from "../../components/landing/Footer";
import { useSearchParams } from "next/navigation";

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

function ContactForm() {
  const searchParams = useSearchParams();
  const courseParam = searchParams.get("course");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState("GENERAL");

  // Preselect the course interest from query parameters on load
  useEffect(() => {
    if (courseParam) {
      const exists = courses.some(c => c.code === courseParam);
      if (exists) {
        setSelectedCourse(courseParam);
      }
    }
  }, [courseParam]);

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-16 items-start">
      {/* Left Column: Contact details */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="lg:col-span-5 space-y-8"
      >
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-8">
          <div>
            <h3 className="font-editorial-display text-2xl font-bold uppercase tracking-wide mb-2 text-[#49abc9]">
              Grekam Academy
            </h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Have questions about our layout programs, placement details, or corporate bootcamps? Fill out the form and our admissions counsel will reach out within 24 hours.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <Phone className="w-4 h-4 text-[#49abc9]" />
              </div>
              <div>
                <h4 className="text-xs uppercase font-mono tracking-widest text-white/40">Call Admissions</h4>
                <p className="text-white font-medium mt-1 hover:text-[#49abc9] transition-colors">
                  <a href="tel:+919788771122">+91 97887 71122</a>
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <Mail className="w-4 h-4 text-[#49abc9]" />
              </div>
              <div>
                <h4 className="text-xs uppercase font-mono tracking-widest text-white/40">Email Inquiry</h4>
                <p className="text-white font-medium mt-1 hover:text-[#49abc9] transition-colors">
                  <a href="mailto:admissions@grekam.in">admissions@grekam.in</a>
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <MapPin className="w-4 h-4 text-[#49abc9]" />
              </div>
              <div>
                <h4 className="text-xs uppercase font-mono tracking-widest text-white/40">Academy Studio</h4>
                <p className="text-white font-medium mt-1 leading-relaxed">
                  2nd Floor, Grekam Tower,<br />
                  Cross Cut Road, Gandhipuram,<br />
                  Coimbatore - 641012
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 flex gap-4 items-center">
          <Clock className="w-5 h-5 text-white/40 shrink-0" />
          <p className="text-white/40 text-xs font-mono">
            OFFICE HOURS: MON - SAT // 09:30 AM - 06:30 PM
          </p>
        </div>
      </motion.div>

      {/* Right Column: CRM Form */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="lg:col-span-7"
      >
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="font-editorial-display text-3xl font-bold uppercase tracking-tight">
                Application Received!
              </h3>
              <p className="text-white/60 max-w-sm mx-auto text-sm leading-relaxed">
                Thank you for applying to Grekam Academy. An admissions mentor has been assigned to your profile and will call you shortly to schedule your studio visit.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="text-xs font-mono uppercase tracking-widest text-[#49abc9] hover:underline"
              >
                Submit another inquiry
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-mono">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Enter your full name"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-[#49abc9] transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="10-digit mobile number"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-[#49abc9] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-[#49abc9] transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Program of Interest</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full h-12 bg-[#121212] border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-[#49abc9] transition-colors text-white"
                >
                  {courses.map((course) => (
                    <option key={course.code} value={course.code}>
                      {course.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Message / Background (Optional)</label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Tell us about your background or what you hope to achieve..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-[#49abc9] transition-colors resize-none"
                />
              </div>

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
  );
}

export default function ContactPage() {
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
            <span className="font-mono text-xs uppercase tracking-widest block mb-2 text-[#49abc9]">
              [ Admission Cohort 2026 ]
            </span>
            <h2 className="text-5xl md:text-7xl font-editorial-display font-bold uppercase tracking-tight leading-none mb-4">
              Apply to the Academy
            </h2>
            <p className="text-white/50 max-w-lg mx-auto text-sm md:text-base font-light">
              Spaces are extremely limited. Align yourself with design excellence.
            </p>
          </motion.div>

          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#49abc9]" />
            </div>
          }>
            <ContactForm />
          </Suspense>
        </div>
      </div>

      <Footer />
    </main>
  );
}
