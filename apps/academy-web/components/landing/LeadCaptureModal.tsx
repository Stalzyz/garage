"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Sparkles, Target } from "lucide-react";
import { fetchApi } from "@/lib/useApi";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeadCaptureModal({ isOpen, onClose }: LeadCaptureModalProps) {
  const [step, setStep] = useState<"FORM" | "SUCCESS">("FORM");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    interestArea: "Not Sure Yet",
    type: "DEMO",
    source: "WEBSITE",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.phone || form.phone.length < 10) {
      setError("Please provide a valid name and phone number.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await fetchApi("/academy/walk-ins", {
        method: "POST",
        body: JSON.stringify({ ...form, notes: `[Landing Page Form]\n${form.notes}` })
      });
      setStep("SUCCESS");
    } catch (err: any) {
      setError(err.message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            onClick={onClose} 
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#0f0f13] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Ambient glowing background */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 relative z-10">
              {step === "FORM" ? (
                <>
                  <div className="mb-8">
                    <h2 className="text-3xl font-black text-white flex items-center gap-2 mb-2 font-sans tracking-tight">
                      Start Your Journey <Sparkles className="w-6 h-6 text-emerald-400" />
                    </h2>
                    <p className="text-white/50 text-sm font-sans">
                      Leave your details below and an admissions counsellor will reach out to schedule a free demo session or campus tour.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Full Name</label>
                        <input
                          required
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-white outline-none transition-colors"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Phone Number</label>
                        <input
                          required
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-white outline-none transition-colors"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">What are you interested in?</label>
                        <select
                          value={form.interestArea}
                          onChange={(e) => setForm({ ...form, interestArea: e.target.value })}
                          className="w-full bg-[#15151a] border border-white/10 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-white outline-none transition-colors appearance-none"
                        >
                          <option value="Not Sure Yet">Not Sure Yet</option>
                          <option value="Graphic Design">Graphic Design</option>
                          <option value="UI/UX Design">UI/UX Design</option>
                          <option value="Web Development">Web Development</option>
                          <option value="Motion Graphics & Video">Motion Graphics & Video</option>
                          <option value="Digital Marketing">Digital Marketing</option>
                        </select>
                      </div>
                    </div>

                    {error && <div className="text-red-400 text-xs font-bold bg-red-400/10 p-3 rounded-lg">{error}</div>}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-6 py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Request Callback"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-20 h-20 mx-auto bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
                    <Target className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Request Received!</h3>
                  <p className="text-white/60 mb-8 max-w-sm mx-auto leading-relaxed">
                    Thank you! Our admissions team will reach out to you on <strong>{form.phone}</strong> very soon to discuss the next steps.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all"
                  >
                    Return to Website
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
