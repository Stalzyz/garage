"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { ArrowRight, Lock, Unlock, MoveHorizontal } from "lucide-react";
import { FeaturedCourses } from "./FeaturedCourses";
import { Footer } from "./Footer";
import Link from "next/link";

export default function DesktopSandbox() {
  const [isAligned, setIsAligned] = useState(false);
  const [skipActive, setSkipActive] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridPosition, setGridPosition] = useState(0);
  const dragX = useMotionValue(0);

  // Calculate the target grid coordinate for the snap
  useEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      // We snap at exactly 50% width on the central grid line
      setGridPosition(width / 2);
    }
  }, []);

  // Monitor drag changes to detect when it crosses the target center grid line
  useEffect(() => {
    const unsubscribe = dragX.onChange((latest) => {
      if (isAligned) return;
      
      // Calculate active position relative to parent center grid line
      // When the offset is close to 0 (centered)
      if (Math.abs(latest) < 12) {
        setIsAligned(true);
        // Soft haptic feedback simulation if browser supports it
        if (navigator.vibrate) {
          navigator.vibrate(15);
        }
      }
    });
    return () => unsubscribe();
  }, [isAligned]);

  const triggerReveal = isAligned || skipActive;

  return (
    <div ref={containerRef} className="relative w-full bg-[#050505] text-white selection:bg-[#49abc9]/30 overflow-x-hidden">
      
      {/* 1. INTERACTIVE HERO CANVAS (Fades or pushes up once aligned) */}
      <section className="relative min-h-screen w-full flex flex-col justify-between p-12 border-b border-white/5 z-20">
        
        {/* Top bar header details */}
        <div className="flex justify-between items-start">
          <div>
            <span className="font-mono text-xs text-[#49abc9] uppercase tracking-widest block mb-1">[ GREKAM DESIGN ACADEMY ]</span>
            <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">COHORT 2026 // SWISS GRID SYSTEM v1.2</span>
          </div>
          
          <button 
            onClick={() => setSkipActive(true)}
            className="text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-[#49abc9] border border-white/10 hover:border-[#49abc9]/40 px-4 py-2 rounded-full transition-all"
          >
            Skip Interaction
          </button>
        </div>

        {/* The Swiss Grid Blueprint Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none flex justify-between px-12 md:px-24">
          <div className="w-[1px] h-full bg-white/[0.03] relative">
            <span className="absolute bottom-4 left-2 font-mono text-[9px] text-white/20">X: 12.5%</span>
          </div>
          <div className="w-[1px] h-full bg-white/[0.03] relative">
            <span className="absolute bottom-4 left-2 font-mono text-[9px] text-white/20">X: 37.5%</span>
          </div>
          {/* Target Snap Line */}
          <div className={`w-[1px] h-full relative transition-colors duration-500 ${triggerReveal ? 'bg-[#49abc9]/40' : 'bg-red-500/20'}`}>
            <span className="absolute top-[35%] -translate-x-1/2 bg-black px-2.5 py-1 border border-white/10 rounded font-mono text-[10px] text-white/60 tracking-wider">
              {triggerReveal ? "GRID_LOCKED" : "TARGET_ALIGN_AXIS (X: 50.0%)"}
            </span>
          </div>
          <div className="w-[1px] h-full bg-white/[0.03] relative">
            <span className="absolute bottom-4 left-2 font-mono text-[9px] text-white/20">X: 62.5%</span>
          </div>
          <div className="w-[1px] h-full bg-white/[0.03] relative">
            <span className="absolute bottom-4 left-2 font-mono text-[9px] text-white/20">X: 87.5%</span>
          </div>
        </div>

        {/* Center Sandbox: Draggable text block */}
        <div className="relative z-10 my-auto max-w-5xl mx-auto w-full">
          {!triggerReveal ? (
            <div className="space-y-16">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-red-500/30 bg-red-950/20 text-red-400 font-mono text-[10px] uppercase tracking-wider mb-6">
                  <Lock className="w-3 h-3" /> Layout System Misaligned
                </span>
                <h1 className="text-5xl md:text-7xl font-editorial-display font-bold leading-tight uppercase tracking-tight">
                  Design is about <span className="text-white/30">aligning elements.</span>
                </h1>
                <p className="text-base text-white/40 font-mono mt-4">
                  Drag the highlighted card on the right to align it with the grid axis.
                </p>
              </div>

              {/* Slider Track Area */}
              <div className="w-full h-32 bg-white/[0.01] border border-white/10 rounded-2xl relative flex items-center px-8">
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-red-500/40 pointer-events-none" />
                
                {/* Draggable block */}
                <motion.div 
                  ref={dragRef}
                  drag="x"
                  dragConstraints={{ left: -300, right: 300 }}
                  dragElastic={0.05}
                  dragMomentum={false}
                  style={{ x: dragX }}
                  className="w-80 p-5 bg-white text-black rounded-xl cursor-grab active:cursor-grabbing shadow-2xl relative z-10 flex flex-col justify-between select-none"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] text-black/40 font-bold uppercase tracking-wider">Drag to Center</span>
                    <MoveHorizontal className="w-4 h-4 text-black/50 animate-pulse" />
                  </div>
                  <h3 className="font-editorial-display font-extrabold text-lg uppercase tracking-tight mt-3">
                    Tutorials teach tools, not design.
                  </h3>
                </motion.div>
                
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-white/20 font-mono text-[10px] uppercase tracking-widest pointer-events-none">
                  ◄ SLIDE LEFT OR RIGHT ►
                </div>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="max-w-4xl"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 font-mono text-[10px] uppercase tracking-wider mb-6">
                <Unlock className="w-3 h-3" /> Layout System Aligned
              </span>
              <h1 className="text-6xl md:text-8xl font-editorial-display font-black leading-[0.95] uppercase tracking-tighter mb-8">
                Master your craft.
              </h1>
              <p className="text-xl md:text-2xl text-white/60 font-editorial-body max-w-2xl mb-12">
                Learn to think, build, and deliver real-world design files. We work like a real design studio. No classrooms, no boring textbooks.
              </p>
              
              <div className="flex items-center gap-6">
                <Link 
                  href="/auth/login" 
                  className="bg-[#49abc9] text-black hover:bg-[#49abc9]/90 font-bold uppercase tracking-widest px-8 py-4 rounded-full transition-all flex items-center gap-2"
                >
                  Apply Now <ArrowRight className="w-4 h-4" />
                </Link>
                <a 
                  href="#curriculum"
                  className="text-sm font-mono uppercase tracking-widest text-white/60 hover:text-white border-b border-white/20 pb-1 transition-colors"
                >
                  Explore Program
                </a>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer hints */}
        <div className="flex justify-between items-center text-white/40 font-mono text-[10px] uppercase tracking-widest relative z-10">
          <span>[ SWISS SCALING ON ]</span>
          <span>DRAG THE CARD TO SNAPPING SYSTEM</span>
          <span>© 2026 GREKAM</span>
        </div>
      </section>

      {/* 2. DYNAMIC CONTENT SECTION (Revealed smoothly once grid snapped or skipped) */}
      <AnimatePresence>
        {triggerReveal && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full"
          >
            {/* The Method / Studio layout */}
            <section id="curriculum" className="py-32 px-12 md:px-24 bg-[#0a0a0a] border-b border-white/5">
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-4">
                  <span className="font-mono text-xs text-[#49abc9] uppercase tracking-widest block mb-4">[ THE METHOD ]</span>
                  <h2 className="text-4xl md:text-5xl font-editorial-display font-bold uppercase leading-none">
                    Real studio workflow.
                  </h2>
                </div>
                
                <div className="lg:col-span-8 space-y-12">
                  <p className="text-2xl font-editorial-body text-white/70 leading-relaxed">
                    Work on actual client projects from day one. No lectures. Just feedback, iteration, and deployment.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-white/10">
                    <div>
                      <div className="font-mono text-xs text-white/40 mb-3">01 // PROJECTS</div>
                      <h4 className="text-xl font-bold uppercase mb-2 font-editorial-display">Hands-on tasks</h4>
                      <p className="text-white/50 text-sm leading-relaxed">Build actual user interfaces, layouts, design systems, and client assets.</p>
                    </div>
                    <div>
                      <div className="font-mono text-xs text-white/40 mb-3">02 // FEEDBACK</div>
                      <h4 className="text-xl font-bold uppercase mb-2 font-editorial-display">Daily Critiques</h4>
                      <p className="text-white/50 text-sm leading-relaxed">Your designs are reviewed directly by mentors. Learn what makes work professional.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Courses section */}
            <FeaturedCourses />

            {/* Program details phase overview */}
            <section className="py-32 px-12 md:px-24 bg-[#050505] border-b border-white/5">
              <div className="max-w-5xl mx-auto text-center space-y-16">
                <h2 className="text-4xl md:text-5xl font-editorial-display font-bold uppercase">
                  One program. Everything included.
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                  <div className="p-8 border border-white/10 bg-white/[0.01] rounded-2xl">
                    <div className="font-mono text-xs text-[#49abc9] mb-4">PHASE 1</div>
                    <h3 className="font-bold text-xl uppercase mb-3 font-editorial-display">Basics</h3>
                    <ul className="space-y-2 text-white/60 text-sm font-mono">
                      <li>• Typography rules</li>
                      <li>• Grid geometry</li>
                      <li>• Color theory</li>
                    </ul>
                  </div>
                  <div className="p-8 border border-white/20 bg-white/[0.03] rounded-2xl transform md:-translate-y-4 shadow-2xl">
                    <div className="font-mono text-xs text-[#49abc9] mb-4">PHASE 2</div>
                    <h3 className="font-bold text-xl uppercase mb-3 font-editorial-display">Design</h3>
                    <ul className="space-y-2 text-white/80 text-sm font-mono">
                      <li>• Branding geometry</li>
                      <li>• Web & Mobile UI</li>
                      <li>• Design systems</li>
                    </ul>
                  </div>
                  <div className="p-8 border border-white/10 bg-white/[0.01] rounded-2xl">
                    <div className="font-mono text-xs text-[#49abc9] mb-4">PHASE 3</div>
                    <h3 className="font-bold text-xl uppercase mb-3 font-editorial-display">Career</h3>
                    <ul className="space-y-2 text-white/60 text-sm font-mono">
                      <li>• Portfolio curation</li>
                      <li>• Mock reviews</li>
                      <li>• Client handoff</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Outcomes stats */}
            <section className="py-24 px-12 md:px-24 bg-[#0a0a0a]">
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                <div>
                  <h3 className="text-3xl font-editorial-display font-bold uppercase mb-2">Our Results</h3>
                  <p className="text-white/50 text-sm max-w-sm">We teach high-end layout execution that secures roles at global studios.</p>
                </div>
                
                <div className="flex gap-16">
                  <div>
                    <div className="text-4xl md:text-5xl font-black text-[#49abc9] mb-1 font-editorial-display">82%</div>
                    <div className="font-mono text-[10px] text-white/40 uppercase">Hired in 12w</div>
                  </div>
                  <div>
                    <div className="text-4xl md:text-5xl font-black text-[#49abc9] mb-1 font-editorial-display">Global</div>
                    <div className="font-mono text-[10px] text-white/40 uppercase">Alumni Net</div>
                  </div>
                </div>
              </div>
            </section>

            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
