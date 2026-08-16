"use client";

import { useState, useRef, TouchEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  Award,
  GraduationCap,
  Cpu,
  Palette,
  Film,
  Clapperboard,
  Globe,
  Box,
} from "lucide-react";
import Link from "next/link";

type StorySlide = {
  title: string;
  subtitle: string;
  tag: string;
  bgGradient: string;
};

const ALL_COURSES = [
  {
    href: "/ui_ux_design",
    title: "UX/UI Design",
    meta: "Masterclass · 12 Weeks",
    icon: Briefcase,
    color: "purple",
  },
  {
    href: "/graphic_design",
    title: "Graphic Design",
    meta: "Master Program · 16 Weeks",
    icon: Palette,
    color: "pink",
  },
  {
    href: "/motion_graphics",
    title: "Motion Graphics",
    meta: "Professional · 10 Weeks",
    icon: Award,
    color: "blue",
  },
  {
    href: "/video_editing_ai",
    title: "Video Editing & AI",
    meta: "VFX Program · 10 Weeks",
    icon: Clapperboard,
    color: "emerald",
  },
  {
    href: "/vfx_compositing",
    title: "VFX & Compositing",
    meta: "Pro Track · 12 Weeks",
    icon: Film,
    color: "orange",
  },
  {
    href: "/3d_animation",
    title: "3D Animation",
    meta: "Master Program · 16 Weeks",
    icon: Box,
    color: "yellow",
  },
  {
    href: "/digital_marketing",
    title: "Digital Marketing",
    meta: "AI Powered · 10 Weeks",
    icon: Globe,
    color: "teal",
  },
  {
    href: "/fullstack_web_dev",
    title: "Full Stack Web Dev",
    meta: "Professional · 16 Weeks",
    icon: Cpu,
    color: "indigo",
  },
  {
    href: "/wordpress_web_design",
    title: "WordPress Design",
    meta: "Professional · 8 Weeks",
    icon: GraduationCap,
    color: "red",
  },
];

const COLOR_MAP: Record<string, string> = {
  purple: "bg-purple-500/20 text-purple-400",
  pink: "bg-pink-500/20 text-pink-400",
  blue: "bg-blue-500/20 text-blue-400",
  emerald: "bg-emerald-500/20 text-emerald-400",
  orange: "bg-orange-500/20 text-orange-400",
  yellow: "bg-yellow-500/20 text-yellow-400",
  teal: "bg-teal-500/20 text-teal-400",
  indigo: "bg-indigo-500/20 text-indigo-400",
  red: "bg-red-500/20 text-red-400",
};

export default function MobileStories() {
  const [activeIdx, setActiveIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDragging = useRef(false);

  const lastScrollTime = useRef(0);

  const slides: StorySlide[] = [
    {
      tag: "01 // THE PROBLEM",
      title: "Tutorials teach tools, not design.",
      subtitle: "Stop wasting time copying template layouts. Learn to think like a professional.",
      bgGradient: "from-[#7b2cbf]/40 via-zinc-950 to-[#3c096c]/40",
    },
    {
      tag: "02 // MISSION",
      title: "Build Real Skills. No templates.",
      subtitle: "Learn to design custom mobile apps and responsive websites from scratch.",
      bgGradient: "from-[#00b4d8]/40 via-zinc-950 to-[#0077b6]/40",
    },
    {
      tag: "03 // THE METHOD",
      title: "Learn by doing in a real studio.",
      subtitle: "No classrooms or lectures. Work on real-world client deliverables from Day 1.",
      bgGradient: "from-[#f72585]/40 via-zinc-950 to-[#7209b7]/40",
    },
    {
      tag: "04 // THE PROGRAM",
      title: "One program. Everything included.",
      subtitle: "Core program (Graphic Design, UI/UX, etc.) + Communication and Personality Development + Placement and Internship.",
      bgGradient: "from-[#ffb703]/30 via-zinc-950 to-[#fb8500]/30",
    },
  ];

  const totalSlides = slides.length + 2; // +1 Courses, +1 Final CTA
  const isCoursesSlide = activeIdx === slides.length;
  const isFinalSlide = activeIdx === totalSlides - 1;

  const goNext = () => setActiveIdx((prev) => Math.min(totalSlides - 1, prev + 1));
  const goPrev = () => setActiveIdx((prev) => Math.max(0, prev - 1));

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > 8 || dy > 8) isDragging.current = true;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    if (isDragging.current) {
      // Support both horizontal swiping and vertical swiping
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 50) goNext();
        if (diffX < -50) goPrev();
      } else {
        if (diffY > 50) goNext();
        if (diffY < -50) goPrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastScrollTime.current < 800) return; // 800ms debounce for smooth scroll transitions
    if (e.deltaY > 20) {
      goNext();
      lastScrollTime.current = now;
    } else if (e.deltaY < -20) {
      goPrev();
      lastScrollTime.current = now;
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      className="relative w-screen h-[100dvh] bg-[#050505] text-white flex flex-col overflow-hidden select-none"
    >
      
      {/* Ambient colorful backdrop glow bubble */}
      <div 
        className="absolute w-[280px] h-[280px] rounded-full blur-[100px] opacity-35 mix-blend-screen pointer-events-none transition-all duration-1000 -top-12 -left-12"
        style={{
          background: activeIdx === 0 ? "radial-gradient(circle, #7b2cbf, transparent)" :
                      activeIdx === 1 ? "radial-gradient(circle, #00b4d8, transparent)" :
                      activeIdx === 2 ? "radial-gradient(circle, #f72585, transparent)" :
                      activeIdx === 3 ? "radial-gradient(circle, #fb8500, transparent)" :
                      activeIdx === 4 ? "radial-gradient(circle, #3498db, transparent)" :
                                        "radial-gradient(circle, #e74c3c, transparent)"
        }}
      />
      
      <div 
        className="absolute w-[350px] h-[350px] rounded-full blur-[120px] opacity-25 mix-blend-screen pointer-events-none transition-all duration-1000 -bottom-16 -right-16"
        style={{
          background: activeIdx === 0 ? "radial-gradient(circle, #3c096c, transparent)" :
                      activeIdx === 1 ? "radial-gradient(circle, #0077b6, transparent)" :
                      activeIdx === 2 ? "radial-gradient(circle, #7209b7, transparent)" :
                      activeIdx === 3 ? "radial-gradient(circle, #ffb703, transparent)" :
                      activeIdx === 4 ? "radial-gradient(circle, #9b59b6, transparent)" :
                                        "radial-gradient(circle, #c0392b, transparent)"
        }}
      />

      {/* Header watermark brand details */}
      <div className="absolute top-6 left-0 right-0 z-50 flex justify-between items-center px-6">
        <span className="font-mono text-[9px] uppercase tracking-widest text-white/50">
          [ GREKAM DESIGN ACADEMY ]
        </span>
        <span className="font-mono text-[8px] text-white/30 uppercase tracking-wider">
          Cohort 2026 // SWISS GRID
        </span>
      </div>

      {/* Slide Content */}
      <div className="relative z-40 flex-grow flex flex-col justify-center px-8 pt-16 pb-20">
        <AnimatePresence mode="wait">

          {/* Story Slides 1–4 */}
          {activeIdx < slides.length && (
            <motion.div
              key={`slide-${activeIdx}`}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
              className="space-y-6 max-w-sm"
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

          {/* Slide 5: All Courses List */}
          {isCoursesSlide && (
            <motion.div
              key="courses-selector"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
              className="w-full flex flex-col"
            >
              <span className="font-mono text-xs text-[#49abc9] uppercase tracking-widest block mb-4">
                05 // CHOOSE YOUR COURSE
              </span>

              <div className="overflow-y-auto max-h-[calc(100dvh-200px)] space-y-2.5 pr-1 pb-4">
                {ALL_COURSES.map((course) => {
                  const Icon = course.icon;
                  const colorCls = COLOR_MAP[course.color] || "bg-white/10 text-white";
                  return (
                    <Link
                      key={course.href}
                      href={course.href}
                      className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-2xl active:bg-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorCls}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm leading-tight">{course.title}</h3>
                          <span className="text-[10px] text-white/40 uppercase font-mono tracking-wide">
                            {course.meta}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Slide 6: Final CTA (Redirecting to /contact page directly) */}
          {isFinalSlide && (
            <motion.div
              key="final-cta"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
              className="text-center space-y-8 w-full"
            >
              <h2 className="text-5xl font-editorial-display font-black uppercase tracking-tight leading-none">
                Ready to start?
              </h2>
              <p className="text-base text-white/60 font-light max-w-xs mx-auto">
                Join the next cohort and start building your design career today.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-[#49abc9] text-black font-bold uppercase tracking-widest px-8 py-4 rounded-full shadow-xl shadow-[#49abc9]/20 active:scale-95 transition-transform"
              >
                Apply Now <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation Center Console (Dots + Flanking Arrows) */}
      <div className="absolute bottom-6 left-0 right-0 z-50 flex items-center justify-center gap-6">
        {/* Left Arrow Button */}
        <button
          onClick={goPrev}
          disabled={activeIdx === 0}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 disabled:opacity-20 active:bg-white/20 transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page Dots Indicator */}
        <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-full border border-white/5 backdrop-blur-md">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeIdx ? "w-4 bg-white" : "w-2 bg-white/25 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={goNext}
          disabled={activeIdx === totalSlides - 1}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 disabled:opacity-20 active:bg-white/20 transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Background gradient shader */}
      <div 
        className="absolute inset-0 z-0 bg-[#050505] transition-all duration-1000"
        style={{
          background: activeIdx < slides.length ? slides[activeIdx].bgGradient : "from-[#101010] via-zinc-950 to-black"
        }}
      />
    </div>
  );
}
