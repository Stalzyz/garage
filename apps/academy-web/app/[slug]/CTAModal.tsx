"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { submitLead } from "../actions/lead";

type CTAModalProps = {
  isOpen: boolean;
  onClose: () => void;
  courseCode: string;
  courseName: string;
  domain: string;
};

export function CTAModal({ isOpen, onClose, courseCode, courseName, domain }: CTAModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get accent color based on domain
  const getAccentColor = () => {
    switch (domain) {
      case 'TECH': return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400';
      case 'DESIGN': return 'border-pink-500/50 bg-pink-500/10 text-pink-400';
      case 'VIDEO': return 'border-blue-500/50 bg-blue-500/10 text-blue-400';
      case 'MARKETING': return 'border-white/20 bg-white/5 text-white';
      default: return 'border-white/20 bg-white/5 text-white';
    }
  };

  const getButtonGradient = () => {
    switch (domain) {
      case 'TECH': return 'from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400';
      case 'DESIGN': return 'from-rose-400 to-pink-500 hover:from-rose-300 hover:to-pink-400';
      case 'VIDEO': return 'from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500';
      default: return 'from-white/20 to-white/10 hover:from-white/30 hover:to-white/20';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await submitLead(formData, courseCode, courseName);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setTimeout(() => setSuccess(false), 500); // Reset after closing
      }, 2500);
    } else {
      setError(result.error || "An error occurred");
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md pointer-events-auto"
            >
              <div className="relative overflow-hidden bg-[#0d0d0d] border border-white/10 rounded-3xl shadow-2xl">
                {/* Decorative background glow */}
                <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-[100px] opacity-20 bg-current ${getAccentColor()}`} />

                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                >
                  <X size={20} />
                </button>

                <div className="p-8">
                  {success ? (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="flex flex-col items-center text-center py-8"
                    >
                      <CheckCircle size={64} className="text-emerald-400 mb-6" />
                      <h3 className="text-2xl font-bold text-white mb-2">You're on the list!</h3>
                      <p className="text-white/60">
                        Our admissions team will reach out to you shortly with next steps.
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold text-white mb-2">Enroll Now</h3>
                      <p className="text-white/60 text-sm mb-8">
                        Leave your details below and secure your spot in <strong className="text-white">{courseName}</strong>.
                      </p>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <input
                            type="text"
                            name="name"
                            required
                            placeholder="Full Name"
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
                          />
                        </div>
                        <div>
                          <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
                          />
                        </div>
                        <div>
                          <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number (optional)"
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
                          />
                        </div>

                        {error && (
                          <div className="text-red-400 text-sm py-2">{error}</div>
                        )}

                        <button
                          type="submit"
                          disabled={loading}
                          className={`w-full h-12 mt-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 bg-gradient-to-r ${getButtonGradient()} disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg`}
                        >
                          {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <>
                              Submit Application <ArrowRight size={18} />
                            </>
                          )}
                        </button>
                      </form>
                      <p className="text-white/40 text-xs mt-6 text-center">
                        By submitting, you agree to our Terms of Service and Privacy Policy.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
