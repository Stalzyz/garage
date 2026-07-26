"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ReactNode, useState, useEffect } from "react";
import { LeadCaptureModal } from "./LeadCaptureModal";
import { Sparkles } from "lucide-react";

export function BackgroundWrapper({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA only after scrolling down a bit (past the hero)
      if (window.scrollY > 400) {
        setShowFloatingCTA(true);
      } else {
        setShowFloatingCTA(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAF8] relative">
      {children}
      
      {/* Floating CTA */}
      <AnimatePresence>
        {showFloatingCTA && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <button
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#050505] px-6 py-4 rounded-full font-bold shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all duration-300 overflow-hidden"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Book a Free Demo</span>
              <span className="sm:hidden">Book Demo</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <LeadCaptureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
