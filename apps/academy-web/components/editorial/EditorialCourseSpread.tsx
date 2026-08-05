"use client";

import { useState } from "react";
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
    desc: "Master layout design, grid systems, advanced typography hierarchy, and corporate identity structures.",
    duration: "12 Weeks",
    tools: ["Figma", "Illustrator", "InDesign"],
    outcome: "Brand & Communication Designer"
  },
  "PUXMP-2026": {
    desc: "Dive deep into user research, wireframing, interactive prototyping, and system design theory.",
    duration: "12 Weeks",
    tools: ["Figma", "Framer", "Protopie"],
    outcome: "UI/UX Product Designer"
  },
  "PWDM-2026": {
    desc: "Learn to build high-converting landing pages, custom WordPress themes, and perform responsive layout architectures.",
    duration: "8 Weeks",
    tools: ["WordPress", "Elementor", "HTML/CSS"],
    outcome: "Web Specialist"
  },
  "PFSD-2026": {
    desc: "Bridge design and code. Develop modern web apps with React, Next.js, and configure secure API layers.",
    duration: "16 Weeks",
    tools: ["React", "Next.js", "Node.js", "Tailwind"],
    outcome: "Creative Developer"
  },
  "PDMM-2026": {
    desc: "Strategize, execute, and monitor brand growth campaigns, search optimization, and creative ad management.",
    duration: "8 Weeks",
    tools: ["Google Ads", "Meta Business Suite", "Analytics"],
    outcome: "Growth Marketer"
  },
  "PMGM-2026": {
    desc: "Bring graphics to life. Learn kinetic typography, shape layers animations, and vector motion dynamics.",
    duration: "10 Weeks",
    tools: ["After Effects", "Illustrator"],
    outcome: "Motion Designer"
  },
  "PVEM-2026": {
    desc: "Synthesize storytelling with advanced editing, color grading, sound design, and AI assistance integration.",
    duration: "10 Weeks",
    tools: ["Premiere Pro", "DaVinci Resolve", "Runway"],
    outcome: "Video Editor & Director"
  },
  "P3DA-2026": {
    desc: "Construct 3D environments, polygon models, lighting layouts, and render cinematic scene timelines.",
    duration: "12 Weeks",
    tools: ["Blender", "Cinema 4D"],
    outcome: "3D Visualizer & Artist"
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
      case 'PGDM-2026': return '/graphic_design';
      case 'PVEM-2026': return '/video_editing_ai';
      case 'P3DA-2026': return '/3d_animation';
      case 'PMGM-2026': return '/motion_graphics';
      case 'PFSD-2026': return '/fullstack_web_dev';
      case 'PWDM-2026': return '/wordpress_web_design';
    }
  }
  const key = title.toLowerCase().trim();
  return coursePageMap[key] ?? "/courses";
}

export function EditorialCourseSpread({ courses }: { courses: CourseItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const activeCourse = courses[activeIndex] || courses[0];
  const meta = activeCourse?.code ? (courseMetadata[activeCourse.code] || defaultMeta) : defaultMeta;
  const href = activeCourse ? getCourseHref(activeCourse.code, activeCourse.title) : "/courses";
  const palette = inkPalettes[activeIndex % inkPalettes.length];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto px-4 md:px-6 relative items-start">
      {/* Left Column: List of courses */}
      <div className="lg:col-span-6 flex flex-col gap-6 py-6 group/list">
        {courses.map((course, idx) => {
          const isSelected = activeIndex === idx;
          return (
            <div
              key={idx}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`border-b border-white/10 pb-6 transition-all duration-300 cursor-pointer ${
                isSelected 
                  ? "opacity-100 border-white" 
                  : "opacity-40 group-hover/list:hover:opacity-100 group-hover/list:opacity-20"
              }`}
            >
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-xs text-white/50">{`0${idx + 1}`}</span>
                <h3 className="text-3xl md:text-5xl font-editorial-display font-bold uppercase tracking-tight leading-none">
                  {course.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Column: Dynamic Editorial Preview Spread */}
      <div className="lg:col-span-6 sticky top-44 min-h-[480px]">
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
                    <h4 className="text-xs uppercase tracking-wider font-mono text-white/40">Career Track</h4>
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
            <Link
              href={href}
              className="inline-flex items-center justify-between w-full bg-white text-black font-mono text-xs uppercase tracking-widest px-6 py-4 rounded-xl hover:bg-white/90 transition-all group"
            >
              <span>Explore Curriculum</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
