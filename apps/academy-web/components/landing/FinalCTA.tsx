"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-[#000000] relative overflow-hidden border-t border-[#1F1F1F]" id="cta">
      {/* Subtle vignette/paper effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-white/[0.03]" />
      
      {/* Light grid representing a blank notebook */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px' 
        }}
      />

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-12"
        >
          <h2 className="text-3xl md:text-5xl font-handwriting text-[#FAFAF8] leading-relaxed opacity-90">
            The Future You're Dreaming Of Begins Today.
          </h2>

          <div className="text-[#A1A1AA] font-sans text-lg space-y-4 max-w-xl mx-auto">
            <p>Every designer once opened their first design tool.</p>
            <p>Every developer wrote their first line of code.</p>
            <p>Every successful creative professional was once a beginner.</p>
          </div>
          
          <div className="py-8">
            <p className="text-xl md:text-2xl font-serif text-[#FAFAF8] italic">
              "The only difference between where you are today and where you want to be tomorrow... is the decision to begin."
            </p>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="http://localhost:3000/login">
              <button className="group relative bg-[#FAFAF8] text-[#050505] px-8 py-4 rounded-full font-medium overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-black/10">
                <span className="relative z-10 flex items-center gap-2 font-sans tracking-wide">
                  Start Your Creative Journey
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
                {/* Subtle Academy Teal hover expansion */}
                <div className="absolute inset-0 bg-[#49abc9] scale-0 rounded-full group-hover:scale-100 transition-transform duration-500 origin-center ease-out" />
              </button>
            </Link>
            <Link href="#courses">
              <button className="px-8 py-4 rounded-full font-medium text-[#A1A1AA] hover:text-white transition-colors font-sans">
                Explore Courses
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
