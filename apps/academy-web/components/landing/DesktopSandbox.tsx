"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, Lock, Unlock, MoveHorizontal, Palette, Type } from "lucide-react";
import { FeaturedCourses } from "./FeaturedCourses";
import { Footer } from "./Footer";
import Link from "next/link";

export default function DesktopSandbox() {
  const [isAligned, setIsAligned] = useState(false);
  const [skipActive, setSkipActive] = useState(false);
  const [accentColor, setAccentColor] = useState("#49abc9"); // Awwwards custom accent color switcher
  const [fontWeight, setFontWeight] = useState(900); // Live typography controller
  const [letterSpacing, setLetterSpacing] = useState(0); // Live letter spacing controller
  const [isHoveringCanvas, setIsHoveringCanvas] = useState(false);
  const [isHoveringSnap, setIsHoveringSnap] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const containerRef = useRef<HTMLDivElement>(null);
  const verticalLineRef = useRef<HTMLDivElement>(null);
  const horizontalLineRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);

  const triggerReveal = isAligned || skipActive;

  // Restore unlock state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isUnlocked = localStorage.getItem("grekam_sandbox_unlocked");
      if (isUnlocked === "true") {
        setSkipActive(true);
      }
    }
  }, []);

  // Save unlock state to localStorage
  useEffect(() => {
    if (triggerReveal && typeof window !== "undefined") {
      localStorage.setItem("grekam_sandbox_unlocked", "true");
    }
  }, [triggerReveal]);

  // Countdown timer for automatic interaction skip
  useEffect(() => {
    if (triggerReveal) return;
    if (typeof window !== "undefined") {
      const isUnlocked = localStorage.getItem("grekam_sandbox_unlocked");
      if (isUnlocked === "true") return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSkipActive(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [triggerReveal]);

  // Track mouse coordinates directly via DOM mutations for maximum performance (0 re-renders)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (verticalLineRef.current) {
      verticalLineRef.current.style.left = `${x}px`;
    }
    if (horizontalLineRef.current) {
      horizontalLineRef.current.style.top = `${y}px`;
    }
    if (coordsRef.current) {
      coordsRef.current.style.left = `${x + 12}px`;
      coordsRef.current.style.top = `${y + 12}px`;
      coordsRef.current.innerText = `X: ${Math.round(x)}px / Y: ${Math.round(y)}px`;
    }
  };

  // Curated premium Swiss color themes
  const colorThemes = [
    { name: "Cyan", hex: "#49abc9" },
    { name: "Coral", hex: "#ff7a59" },
    { name: "Emerald", hex: "#34d399" },
    { name: "Rose", hex: "#fb7185" },
    { name: "Amber", hex: "#f59e0b" },
  ];

  const handleSnap = () => {
    setIsAligned(true);
    if (navigator.vibrate) {
      navigator.vibrate([15, 10, 15]);
    }
  };

  return (
    <div 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHoveringCanvas(true)}
      onMouseLeave={() => setIsHoveringCanvas(false)}
      className="relative w-full bg-[#050505] text-white selection:bg-white/20 overflow-x-hidden"
    >
      
      {/* Dynamic vector cursor guides (DOM refs directly mutated for performance) */}
      {isHoveringCanvas && !triggerReveal && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Vertical guide line */}
          <div 
            ref={verticalLineRef}
            className="absolute top-0 bottom-0 w-[1px] bg-white/10 transition-none pointer-events-none"
            style={{ left: "-9999px" }}
          />
          {/* Horizontal guide line */}
          <div 
            ref={horizontalLineRef}
            className="absolute left-0 right-0 h-[1px] bg-white/10 transition-none pointer-events-none"
            style={{ top: "-9999px" }}
          />
          {/* Coordinates readout */}
          <span 
            ref={coordsRef}
            className="absolute text-[8px] font-mono text-white/40 bg-black/80 px-1.5 py-0.5 rounded border border-white/10 transition-none pointer-events-none"
            style={{ left: "-9999px", top: "-9999px" }}
          >
            X: 0px / Y: 0px
          </span>
        </div>
      )}

      {/* 1. INTERACTIVE HERO CANVAS */}
      <section className="relative min-h-screen w-full flex flex-col justify-between p-12 border-b border-white/5 z-20">
        
        {/* Top bar header details */}
        <div className="flex justify-between items-start">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest block mb-1" style={{ color: accentColor }}>
              [ GREKAM DESIGN ACADEMY ]
            </span>
            <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">COHORT 2026 // SWISS GRID SYSTEM v1.2</span>
          </div>
        </div>

        {/* Ghost Branding Backdrop (visible in locked state to build instant brand identity) */}
        {!triggerReveal && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
            <h2 className="text-[12vw] font-black uppercase text-white/[0.02] tracking-tighter leading-none text-center select-none font-editorial-display whitespace-nowrap">
              GREKAM ACADEMY
            </h2>
          </div>
        )}

        {/* The Swiss Grid Blueprint Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none flex justify-between px-12 md:px-24">
          <div className="w-[1px] h-full bg-white/[0.03] relative">
            <span className="absolute bottom-4 left-2 font-mono text-[9px] text-white/20">X: 12.5%</span>
          </div>
          <div className="w-[1px] h-full bg-white/[0.03] relative">
            <span className="absolute bottom-4 left-2 font-mono text-[9px] text-white/20">X: 37.5%</span>
          </div>
          {/* Target Snap Line */}
          <div className="w-[1px] h-full relative bg-white/10">
            <div 
              className="absolute inset-0 transition-colors duration-300" 
              style={{ 
                backgroundColor: triggerReveal 
                  ? `${accentColor}40` 
                  : isHoveringSnap 
                  ? "rgba(245, 158, 11, 0.4)" 
                  : "rgba(239, 68, 68, 0.2)" 
              }}
            />
            <span className="absolute top-[30%] -translate-x-1/2 bg-black px-2.5 py-1 border border-white/10 rounded font-mono text-[10px] text-white/60 tracking-wider">
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

        {/* Center Sandbox: Grid Alignment Core Interaction */}
        <div className="relative z-10 my-auto max-w-5xl mx-auto w-full">
          {!triggerReveal ? (
            <div className="space-y-16">
              {/* Misaligned skewed headline layout */}
              <div className="max-w-2xl transform skew-x-3 rotate-1 translate-x-4 opacity-75 transition-all duration-700">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-red-500/30 bg-red-950/20 text-red-400 font-mono text-[10px] uppercase tracking-wider mb-6">
                  <Lock className="w-3 h-3" /> Layout System Misaligned
                </span>
                <h1 className="text-5xl md:text-7xl font-editorial-display font-bold leading-tight uppercase tracking-tight">
                  Design is about <span className="text-white/30">aligning elements.</span>
                </h1>
                <p className="text-base text-white/40 font-mono mt-4">
                  The Swiss layout system is currently skewed. Trigger layout snapping to align components.
                </p>
              </div>

              {/* Click to Snap Action Area */}
              <div className="w-full py-8 bg-white/[0.01] border border-white/10 rounded-2xl relative flex flex-col md:flex-row items-center justify-between px-8 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-red-500/20 bg-red-500/5 flex items-center justify-center text-red-400 animate-pulse">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h3 className="font-mono text-xs uppercase tracking-widest text-white/70">Swiss Grid snap required</h3>
                    <p className="text-[10px] font-mono text-white/40 mt-0.5">CLICK THE BUTTON TO LOCK DESIGN COLUMNS</p>
                  </div>
                </div>

                <button 
                  onClick={handleSnap}
                  onMouseEnter={() => setIsHoveringSnap(true)}
                  onMouseLeave={() => setIsHoveringSnap(false)}
                  className="group relative px-8 py-4 bg-white text-black font-mono text-xs uppercase tracking-widest font-bold rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl hover:shadow-white/10 flex items-center gap-2"
                >
                  <span>[ Snap to Grid ]</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Prominent, readable Skip option with automatic countdown */}
              <div className="flex justify-center">
                <button 
                  onClick={() => setSkipActive(true)}
                  className="text-xs font-mono uppercase tracking-widest text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-6 py-3 rounded-full transition-all flex items-center gap-2 bg-black/40 backdrop-blur-sm"
                >
                  <span>Skip Snap Interaction</span>
                  <span className="text-[#49abc9] font-bold">({countdown}s)</span>
                </button>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
            >
              {/* Main Typography Column */}
              <div className="lg:col-span-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 font-mono text-[10px] uppercase tracking-wider mb-6">
                  <Unlock className="w-3 h-3" /> Layout System Aligned
                </span>
                
                {/* Dynamically controlled responsive typography headline */}
                <h1 
                  className="text-6xl md:text-8xl font-editorial-display leading-[0.95] uppercase tracking-tighter mb-8 select-none transition-all duration-300"
                  style={{ 
                    fontWeight: fontWeight,
                    letterSpacing: `${letterSpacing}px`
                  }}
                >
                  Master your craft.
                </h1>
                
                <p className="text-xl md:text-2xl text-white/60 font-editorial-body max-w-2xl mb-12">
                  Learn to think, build, and deliver real-world design files. We work like a real design studio. No classrooms, no boring textbooks.
                </p>
                
                <div className="flex items-center gap-6">
                  <Link 
                    href="/contact" 
                    className="font-bold uppercase tracking-widest px-8 py-4 rounded-full transition-all flex items-center gap-2 text-black"
                    style={{ backgroundColor: accentColor }}
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
              </div>

              {/* Awwwards Design Sandbox Play Panel */}
              <div className="lg:col-span-4 p-6 bg-white/[0.02] border border-white/10 rounded-3xl space-y-6">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-white/70 flex items-center gap-1.5">
                    <Palette className="w-4 h-4" style={{ color: accentColor }} /> Theme Accent Color
                  </h3>
                </div>
                {/* Theme Selector */}
                <div className="flex flex-wrap gap-2">
                  {colorThemes.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => setAccentColor(theme.hex)}
                      className="px-3 py-1.5 rounded-full border text-[10px] uppercase font-mono tracking-wider transition-all flex items-center gap-1.5"
                      style={{ 
                        borderColor: accentColor === theme.hex ? accentColor : "rgba(255,255,255,0.1)",
                        backgroundColor: accentColor === theme.hex ? `${theme.hex}15` : "transparent",
                        color: accentColor === theme.hex ? accentColor : "rgba(255,255,255,0.6)"
                      }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.hex }} />
                      {theme.name}
                    </button>
                  ))}
                </div>

                <div className="border-b border-white/5 pb-3 pt-2">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-white/70 flex items-center gap-1.5">
                    <Type className="w-4 h-4" style={{ color: accentColor }} /> Typography Sandbox
                  </h3>
                </div>
                {/* Typo Control Sliders */}
                <div className="space-y-4 font-mono text-[9px] text-white/40 uppercase">
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span>Font Weight</span>
                      <span className="text-white">{fontWeight}</span>
                    </div>
                    <input 
                      type="range" 
                      min="300" 
                      max="900" 
                      step="100"
                      value={fontWeight} 
                      onChange={(e) => setFontWeight(Number(e.target.value))}
                      className="w-full accent-white bg-white/10 rounded h-1 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span>Letter Spacing</span>
                      <span className="text-white">{letterSpacing}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="-6" 
                      max="8" 
                      step="1"
                      value={letterSpacing} 
                      onChange={(e) => setLetterSpacing(Number(e.target.value))}
                      className="w-full accent-white bg-white/10 rounded h-1 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer hints */}
        <div className="flex justify-between items-center text-white/40 font-mono text-[10px] uppercase tracking-widest relative z-10">
          <span>[ SWISS SCALING ON ]</span>
          <span>CLICK THE SNAP BUTTON TO START</span>
          <span>© 2026 GREKAM</span>
        </div>
      </section>

      {/* 2. DYNAMIC CONTENT SECTION */}
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
                  <span className="font-mono text-xs uppercase tracking-widest block mb-4" style={{ color: accentColor }}>
                    [ THE METHOD ]
                  </span>
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
                    <div className="font-mono text-xs mb-4" style={{ color: accentColor }}>MODULE 1</div>
                    <h3 className="font-bold text-xl uppercase mb-3 font-editorial-display">Core Program</h3>
                    <ul className="space-y-2 text-white/60 text-sm font-mono">
                      <li>• Graphic & UI/UX Design</li>
                      <li>• Web Design & Development</li>
                      <li>• 2D/3D Animation & VFX</li>
                    </ul>
                  </div>
                  <div className="p-8 border border-white/25 bg-white/[0.03] rounded-2xl transform md:-translate-y-4 shadow-2xl">
                    <div className="font-mono text-xs mb-4" style={{ color: accentColor }}>MODULE 2</div>
                    <h3 className="font-bold text-xl uppercase mb-3 font-editorial-display">Soft Skills</h3>
                    <ul className="space-y-2 text-white/80 text-sm font-mono">
                      <li>• Communication Systems</li>
                      <li>• Personality Grooming</li>
                      <li>• Creative Client Pitching</li>
                    </ul>
                  </div>
                  <div className="p-8 border border-white/10 bg-white/[0.01] rounded-2xl">
                    <div className="font-mono text-xs mb-4" style={{ color: accentColor }}>MODULE 3</div>
                    <h3 className="font-bold text-xl uppercase mb-3 font-editorial-display">Career Path</h3>
                    <ul className="space-y-2 text-white/60 text-sm font-mono">
                      <li>• 100% Placement Assistance</li>
                      <li>• Live Studio Internship</li>
                      <li>• Portfolio Reviews</li>
                    </ul>
                  </div>
                </div>

                {/* Curriculum Wiki banner */}
                <div className="mt-16 p-8 border border-dashed border-white/15 bg-white/[0.01] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
                  <div className="text-left">
                    <h4 className="font-bold text-lg uppercase font-editorial-display mb-1 text-white">Need complete program brochures?</h4>
                    <p className="text-white/50 text-sm leading-relaxed">
                      Check out our interactive <span className="text-[#49abc9] font-semibold">Curriculum Wiki</span> for a detailed breakdown of timelines, placement stats, and weekly schedules.
                    </p>
                  </div>
                  <a 
                    href="https://grekam.in/academy" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="px-6 py-3 rounded-full font-mono text-xs uppercase tracking-widest bg-white/10 hover:bg-white text-white hover:text-black transition-all font-bold shrink-0 border border-white/10"
                  >
                    Browse Wiki →
                  </a>
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
                    <div className="text-4xl md:text-5xl font-black mb-1 font-editorial-display" style={{ color: accentColor }}>82%</div>
                    <div className="font-mono text-[10px] text-white/40 uppercase">Hired in 12w</div>
                  </div>
                  <div>
                    <div className="text-4xl md:text-5xl font-black mb-1 font-editorial-display" style={{ color: accentColor }}>Global</div>
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
