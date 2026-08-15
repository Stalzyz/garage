"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

type CourseCardProps = {
  title: string;
  index: number;
  code?: string;
  coverImage?: string | null;
};

// Each card gets a unique ink-bleed gradient palette
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

const inkShapes = [
  // Irregular blob shapes via clip-path
  "polygon(0 0, 100% 0, 100% 75%, 85% 85%, 70% 78%, 55% 88%, 35% 80%, 15% 90%, 0 82%)",
  "polygon(0 0, 100% 0, 100% 80%, 90% 72%, 72% 82%, 50% 70%, 28% 85%, 10% 75%, 0 85%)",
  "polygon(0 0, 100% 0, 100% 70%, 88% 80%, 68% 70%, 48% 82%, 25% 72%, 8% 80%, 0 70%)",
  "polygon(0 0, 100% 0, 100% 78%, 82% 68%, 60% 80%, 40% 68%, 20% 78%, 5% 70%, 0 78%)",
];

// Map course titles to dedicated landing pages (slug-based)
const coursePageMap: Record<string, string> = {
  "video editing": "/video_editing",
}

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
  const key = title.toLowerCase().trim()
  return coursePageMap[key] ?? "/"
}

export function FeaturedCourseCard({ title, index, code, coverImage }: CourseCardProps) {
  const palette = inkPalettes[index % inkPalettes.length];
  const inkShape = inkShapes[index % inkShapes.length];
  const href = getCourseHref(code, title);

  return (
    <Link href={href} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, delay: index * 0.08, type: "spring", stiffness: 80 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="relative h-[340px] bg-[#0d0d0d] border border-white/10 rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_60px_rgba(0,0,0,0.6)] transition-shadow duration-500 flex flex-col"
      >
        {/* Ink Bleed Gradient Top Section */}
        <div className="relative h-[160px] flex-shrink-0 overflow-hidden">
          {coverImage ? (
            <>
              {/* Actual Cover Image with ink bleed mask */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${coverImage})`, clipPath: inkShape }}
              />
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${palette} opacity-40 mix-blend-color`}
                style={{ clipPath: inkShape }}
              />
              {/* Dark gradient overlay for text readability */}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"
                style={{ clipPath: inkShape }}
              />
            </>
          ) : (
            <>
              {/* Main gradient fallback */}
              <div className={`absolute inset-0 bg-gradient-to-br ${palette} opacity-90`} />
              
              {/* Ink bleed irregular bottom edge */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${palette}`}
                style={{ clipPath: inkShape }}
              />

              {/* Secondary bleed layer for depth */}
              <div
                className="absolute inset-0 bg-black/30 mix-blend-multiply"
                style={{ clipPath: inkShape }}
              />

              {/* Noise texture overlay */}
              <div className="absolute inset-0 opacity-20 mix-blend-overlay"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
              />
            </>
          )}

          {/* Handwritten course title overlay on gradient */}
          <div className="absolute inset-0 flex items-end p-5 pb-8">
            <h3 className="font-handwriting text-2xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] leading-tight">
              {title}
            </h3>
          </div>

          {/* Small splatter dots */}
          <div className="absolute top-4 right-6 w-2 h-2 bg-white/40 rounded-full" />
          <div className="absolute top-7 right-10 w-1 h-1 bg-white/30 rounded-full" />
          <div className="absolute top-5 right-16 w-1.5 h-1.5 bg-white/20 rounded-full" />
        </div>

        {/* Card body */}
        <div className="flex flex-col flex-1 p-5 justify-between">
          <p className="text-white/50 text-sm font-sans leading-relaxed line-clamp-2">
            Master real-world skills with hands-on projects and expert mentorship.
          </p>

          {/* CTA */}
          <motion.div
            className="mt-4"
            whileHover={{ scale: 1.03 }}
          >
            <span className="inline-flex items-center gap-2 bg-white text-[#050505] font-bold font-sans text-sm px-5 py-2.5 rounded-full shadow-md group-hover:shadow-lg transition-shadow">
              View Course
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}
