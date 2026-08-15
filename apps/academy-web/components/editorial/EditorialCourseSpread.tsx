"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calendar, Award, Code } from "lucide-react";
import Link from "next/link";

interface CourseItem {
  title: string;
  code?: string;
  coverImage?: string | null;
}

const courseMetadata: Record<string, { desc: string; duration: string; tools: string[]; outcome: string }> = {
  "PGDM-2026": {
    desc: "Master layout design, grids, fonts, and how to build brand identities.",
    duration: "12 Weeks",
    tools: ["Figma", "Illustrator", "InDesign"],
    outcome: "Brand Designer"
  },
  "PUXMP-2026": {
    desc: "Learn user research, wireframes, app prototypes, and UI design theory.",
    duration: "12 Weeks",
    tools: ["Figma", "Framer", "Protopie"],
    outcome: "UI/UX Product Designer"
  },
  "PWDM-2026": {
    desc: "Learn to build landing pages, custom WordPress websites, and responsive layouts.",
    duration: "8 Weeks",
    tools: ["WordPress", "Elementor", "HTML/CSS"],
    outcome: "Web Designer"
  },
  "PFSD-2026": {
    desc: "Connect design and coding. Build modern web apps with React and Next.js.",
    duration: "16 Weeks",
    tools: ["React", "Next.js", "Node.js", "Tailwind"],
    outcome: "Creative Developer"
  },
  "PDMM-2026": {
    desc: "Plan and run ads, search engine optimization (SEO), and social media campaigns.",
    duration: "8 Weeks",
    tools: ["Google Ads", "Meta Business Suite", "Analytics"],
    outcome: "Digital Marketer"
  },
  "PMGM-2026": {
    desc: "Make graphics move. Learn moving text, shapes, and motion animations.",
    duration: "10 Weeks",
    tools: ["After Effects", "Illustrator"],
    outcome: "Motion Designer"
  },
  "PVEM-2026": {
    desc: "Learn storytelling, video editing, color correction, sound design, and AI tools.",
    duration: "10 Weeks",
    tools: ["Premiere Pro", "DaVinci Resolve", "Runway"],
    outcome: "Video Editor"
  },
  "P3DA-2026": {
    desc: "Create 3D worlds, models, lighting, and realistic animations.",
    duration: "12 Weeks",
    tools: ["Blender", "Cinema 4D"],
    outcome: "3D Designer"
  }
};

const defaultMeta = {
  desc: "Master your craft with industry-standard design and tech training. Build portfolios that get you hired.",
  duration: "12 Weeks",
  tools: ["Figma", "Creative Suite"],
  outcome: "Professional Creative"
};

const coursePageMap: Record<string, string> = {
  "video editing": "/video_editing",
};

const inkPalettes = [
  "from-emerald-400 via-teal-500 to-purple-600",
  "from-sky-400 via-blue-500 to-violet-600",
  "from-rose-400 via-pink-500 to-orange-500",
  "from-amber-400 via-orange-500 to-red-600",
  "from-lime-400 via-emerald-500 to-cyan-600",
  "from-fuchsia-400 via-purple-500 to-blue-600",
  "from-orange-400 via-rose-500 to-pink-600",
  "from-cyan-400 via-sky-500 to-indigo-600",
];

function getCourseHref(code: string | undefined, title: string): string {
  if (code) {
    switch (code) {
      case 'PUXMP-2026': return '/ui_ux_design';
      case 'PDMM-2026': return '/digital_marketing';
      case 'PVFX-2026': return '/vfx_compositing';
      case 'PGDM-2026':
      case 'PGDMP-2026': return '/graphic_design';
      case 'PVEM-2026': return '/video_editing_ai';
      case 'P3DA-2026': return '/3d_animation';
      case 'PMGM-2026': return '/motion_graphics';
      case 'PFSD-2026': return '/fullstack_web_dev';
      case 'PWDM-2026':
      case 'PWD-2026': return '/wordpress_web_design';
    }
  }
  const key = title.toLowerCase().trim();
  return coursePageMap[key] ?? "/";
}

export function EditorialCourseSpread({ courses }: { courses: CourseItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<any>(null);

  const activeCourse = courses[activeIndex] || courses[0];
  const meta = activeCourse?.code ? (courseMetadata[activeCourse.code] || defaultMeta) : defaultMeta;
  const href = activeCourse ? getCourseHref(activeCourse.code, activeCourse.title) : "/courses";
  const palette = inkPalettes[activeIndex % inkPalettes.length];

  const handleScroll = () => {
    // Only process scroll detection on desktop where height limits are active
    if (window.innerWidth < 1024) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const children = container.children;
    const containerCenter = container.getBoundingClientRect().top + container.clientHeight / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      const childCenter = child.getBoundingClientRect().top + child.clientHeight / 2;
      const distance = Math.abs(childCenter - containerCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto px-4 md:px-6 relative items-start">
      {/* Left Column: List of courses (scrollable on desktop, accordion block on mobile) */}
      <div className="lg:col-span-6 relative">
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex flex-col gap-6 py-6 pr-0 lg:pr-4 lg:max-h-[480px] overflow-visible lg:overflow-y-auto custom-scrollbar group/list scroll-smooth"
        >
          {courses.map((course, idx) => {
            const isSelected = activeIndex === idx;
            const itemMeta = course.code ? (courseMetadata[course.code] || defaultMeta) : defaultMeta;
            const itemHref = getCourseHref(course.code, course.title);
            const itemPalette = inkPalettes[idx % inkPalettes.length];

            return (
              <div
                key={idx}
                onClick={() => setActiveIndex(idx)}
                onMouseEnter={() => {
                  if (window.innerWidth >= 1024) {
                    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                    hoverTimeoutRef.current = setTimeout(() => {
                      setActiveIndex(idx);
                    }, 150); // 150ms hover debounce delay
                  }
                }}
                onMouseLeave={() => {
                  if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                }}
                className={`border-b border-white/10 pb-6 transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? "opacity-100 border-white" 
                    : "opacity-40 lg:group-hover/list:hover:opacity-100 lg:group-hover/list:opacity-20"
                }`}
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-xs text-white/50">{String(idx + 1).padStart(2, '0')}</span>
                  <h3 className="text-2xl md:text-4xl font-editorial-display font-bold uppercase tracking-tight leading-none">
                    {course.title}
                  </h3>
                </div>

              {/* Mobile Accordion details collapsed/expanded inline */}
              <AnimatePresence initial={false}>
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: "auto", opacity: 1, marginTop: 20 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="block lg:hidden overflow-hidden"
                  >
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                      {/* Gradient glow bubble */}
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${itemPalette} opacity-20 blur-[50px] rounded-full pointer-events-none`} />

                      <div>
                        {/* Header Details */}
                        <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                            {course.code || "CORE-2026"}
                          </span>
                          <div className="flex items-center gap-1.5 font-mono text-[10px] text-white/60">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{itemMeta.duration}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-white/70 font-editorial-body text-sm leading-relaxed mb-4">
                          {itemMeta.desc}
                        </p>

                        {/* Career Outcome and Tools */}
                        <div className="space-y-3 mb-6 text-xs">
                          <div className="flex gap-2.5 items-start">
                            <Award className="w-3.5 h-3.5 text-white/40 mt-0.5 shrink-0" />
                            <p className="text-white/80">
                              <span className="text-white/40 uppercase font-mono tracking-wider mr-1.5">Track:</span>
                              {itemMeta.outcome}
                            </p>
                          </div>
                          <div className="flex gap-2.5 items-start">
                            <Code className="w-3.5 h-3.5 text-white/40 mt-0.5 shrink-0" />
                            <div>
                              <span className="text-white/40 uppercase font-mono tracking-wider mr-1.5">Tools:</span>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {itemMeta.tools.map((tool, tIdx) => (
                                  <span key={tIdx} className="bg-white/5 border border-white/10 text-white/60 px-2 py-0.5 rounded text-[10px] font-mono">
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Explore CTA */}
                      <a
                        href={itemHref}
                        className="inline-flex items-center justify-between w-full bg-white text-black font-mono text-[10px] uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-white/90 transition-all"
                      >
                        <span>Explore Course</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        </div>
        {/* Bottom Fade Mask to indicate there are more items to scroll */}
        <div className="hidden lg:block absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0d0d0d] to-transparent pointer-events-none z-10" />
      </div>

      {/* Right Column: Dynamic Editorial Preview Spread (Hidden on mobile/tablet, sticky on desktop) */}
      <div className="hidden lg:flex lg:col-span-6 sticky top-44 min-h-[480px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between"
          >
            {/* Visual gradient backdrop */}
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${palette} opacity-20 blur-[80px] rounded-full pointer-events-none`} />

            <div>
              {/* Header Details */}
              <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-6">
                <span className="font-mono text-xs uppercase tracking-widest text-white/40">
                  {activeCourse.code || "CORE-2026"}
                </span>
                <div className="flex items-center gap-2 font-mono text-xs text-white/60">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{meta.duration}</span>
                </div>
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl md:text-3xl font-editorial-display font-semibold mb-4">
                {activeCourse.title}
              </h2>
              <p className="text-white/60 font-editorial-body text-base leading-relaxed mb-6">
                {meta.desc}
              </p>

              {/* Specs & Outcome */}
              <div className="space-y-4 mb-8">
                <div className="flex gap-4 items-start">
                  <Award className="w-4 h-4 text-white/40 mt-1 shrink-0" />
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-mono text-white/40">Career Path</h4>
                    <p className="text-white/80 font-bold">{meta.outcome}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <Code className="w-4 h-4 text-white/40 mt-1 shrink-0" />
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-mono text-white/40">Tools & Skills</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {meta.tools.map((tool, tIdx) => (
                        <span key={tIdx} className="bg-white/5 border border-white/10 text-white/70 px-2.5 py-0.5 rounded text-xs font-mono">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Link Button */}
            <a
              href={href}
              className="inline-flex items-center justify-between w-full bg-white text-black font-mono text-xs uppercase tracking-widest px-6 py-4 rounded-xl hover:bg-white/90 transition-all group"
            >
              <span>Explore Course</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" />
            </a>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
