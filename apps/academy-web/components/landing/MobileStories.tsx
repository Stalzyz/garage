"use client";

import { useState, TouchEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronRight, Briefcase, Award, GraduationCap } from "lucide-react";
import Link from "next/link";

type StorySlide = {
  title: string;
  subtitle: string;
  tag: string;
  bgGradient: string;
};

export default function MobileStories() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const slides: StorySlide[] = [
    {
      tag: "01 // THE PROBLEM",
      title: "Tutorials teach tools, not design.",
      subtitle: "Stop wasting time copying template layouts. Learn to think like a professional.",
      bgGradient: "from-zinc-950 via-zinc-900 to-black"
    },
    {
      tag: "02 // MISSION",
      title: "Build Real Skills. No templates.",
      subtitle: "Learn to design custom mobile apps and responsive websites from scratch.",
      bgGradient: "from-indigo-950 via-zinc-900 to-black"
    },
    {
      tag: "03 // THE METHOD",
      title: "Learn by doing in a real studio.",
      subtitle: "No classrooms or lectures. Work on real-world client deliverables from Day 1.",
      bgGradient: "from-purple-950 via-zinc-900 to-black"
    },
    {
      tag: "04 // PROCESS",
      title: "One complete training program.",
      subtitle: "Master layout alignment, typography systems, branding, and career mock interviews.",
      bgGradient: "from-blue-950 via-zinc-900 to-black"
    }
  ];

  const totalSlides = slides.length + 2; // +1 for Courses Selector, +1 for Final CTA

  // Handle tap navigations
  const handleTap = (clientX: number, width: number) => {
    const isLeft = clientX < width * 0.35;
    if (isLeft) {
      setActiveIdx((prev) => Math.max(0, prev - 1));
    } else {
      setActiveIdx((prev) => Math.min(totalSlides - 1, prev + 1));
    }
  };

  // Touch swiping logic
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // Swipe left (next)
    if (diff > 50) {
      setActiveIdx((prev) => Math.min(totalSlides - 1, prev + 1));
    }
    // Swipe right (prev)
    if (diff < -50) {
      setActiveIdx((prev) => Math.max(0, prev - 1));
    }
    setTouchStart(null);
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-screen h-[100dvh] bg-[#050505] text-white flex flex-col justify-between overflow-hidden select-none"
    >
      
      {/* Top Instagram-style Story Progress Bar */}
      <div className="absolute top-4 left-0 right-0 z-50 flex gap-1.5 px-4">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <div key={idx} className="h-1 bg-white/20 rounded-full flex-1 overflow-hidden">
            <div 
              className={`h-full bg-white transition-all duration-300 ${
                idx <= activeIdx ? "w-full" : "w-0"
              }`}
            />
          </div>
        ))}
      </div>

      {/* Screen Tap overlay to capture clicks */}
      <div 
        onClick={(e) => handleTap(e.clientX, window.innerWidth)}
        className="absolute inset-0 z-30 pointer-events-auto"
      />

      {/* Dynamic Slide Canvas */}
      <div className="relative z-10 flex-grow flex items-center px-6 pt-16">
        <AnimatePresence mode="wait">
          {activeIdx < slides.length && (
            <motion.div
              key={`slide-${activeIdx}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 max-w-sm pointer-events-none"
            >
              <span className="font-mono text-xs text-[#49abc9] uppercase tracking-widest block">
                {slides[activeIdx].tag}
              </span>
              <h2 className="text-4xl font-editorial-display font-extrabold uppercase leading-[1.05] tracking-tight">
                {slides[activeIdx].title}
              </h2>
              <p className="text-base text-white/60 leading-relaxed font-sans font-light">
                {slides[activeIdx].subtitle}
              </p>
            </motion.div>
          )}

          {/* Slide 5: Interactive Courses Selector */}
          {activeIdx === slides.length && (
            <motion.div
              key="courses-selector"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full space-y-6 z-40"
            >
              <span className="font-mono text-xs text-[#49abc9] uppercase tracking-widest block">
                05 // CHOOSE YOUR COURSE
              </span>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">UX/UI Design</h3>
                      <span className="text-[10px] text-white/40 uppercase font-mono">Masterclass // 12 Weeks</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Motion Graphic</h3>
                      <span className="text-[10px] text-white/40 uppercase font-mono">Professional // 12 Weeks</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Visual Compositing</h3>
                      <span className="text-[10px] text-white/40 uppercase font-mono">VFX Program // 16 Weeks</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Slide 6: Final CTA */}
          {activeIdx === totalSlides - 1 && (
            <motion.div
              key="final-cta"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-8 w-full z-40"
            >
              <h2 className="text-5xl font-editorial-display font-black uppercase tracking-tight leading-none">
                Ready to start?
              </h2>
              <p className="text-base text-white/60 font-light max-w-xs mx-auto">
                Join the next cohort and start building your design career today.
              </p>
              
              <Link 
                href="/auth/login" 
                className="inline-flex items-center gap-2 bg-[#49abc9] text-black font-bold uppercase tracking-widest px-8 py-4 rounded-full transition-all shadow-xl shadow-[#49abc9]/20"
              >
                Apply Now <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slide Index / Bottom details */}
      <div className="relative z-10 p-6 flex justify-between items-center text-white/30 font-mono text-[9px] uppercase tracking-widest">
        <span>Slide {activeIdx + 1} of {totalSlides}</span>
        <span>◄ Swipe or Tap Left / Right ►</span>
      </div>

      {/* Dynamic Background Shader */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#050505] to-[#101010] opacity-90" />
    </div>
  );
}
