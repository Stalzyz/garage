"use client";

import { motion } from "framer-motion";
import { ArrowRight, MonitorPlay } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type CourseCardProps = {
  title: string;
  index: number;
};

export function FeaturedCourseCard({ title, index }: CourseCardProps) {
  // Generate a random-ish rotation based on index for the artsy "scattered polaroid" look
  const rotation = index % 2 === 0 ? (index % 3 === 0 ? 3 : -2) : (index % 5 === 0 ? -4 : 2);
  const zIndex = index % 2 === 0 ? 10 : 5;

  return (
    <Link href="/courses" className="block relative group" style={{ zIndex }}>
      <motion.div
        initial={{ opacity: 0, y: 50, rotate: rotation - 5 }}
        whileInView={{ opacity: 1, y: 0, rotate: rotation }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: index * 0.1, type: "spring" }}
        whileHover={{ scale: 1.05, rotate: 0, zIndex: 50 }}
        className="relative h-[320px] bg-[#FAFAF8] text-[#050505] p-6 pb-8 flex flex-col justify-between shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-300"
        style={{ clipPath: "polygon(0 0, 100% 1%, 99% 100%, 1% 99%)" }} // Slightly imperfect paper cut
      >
        {/* Tape piece effect at top */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/40 backdrop-blur-sm shadow-sm rotate-[3deg] z-20" style={{ clipPath: "polygon(0 10%, 100% 0, 95% 90%, 5% 100%)" }} />

        {/* Minimal Icon / "Photo" area */}
        <div className="w-full h-32 bg-[#0A0A0A] border-2 border-[#1F1F1F] mb-4 flex items-center justify-center text-[#FAFAF8] group-hover:bg-[#141414] transition-colors overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none mix-blend-overlay" />
          <MonitorPlay size={32} strokeWidth={1} className="text-emerald-400 opacity-80" />
        </div>

        {/* Content */}
        <div className="mt-auto font-handwriting">
          <h3 className="text-2xl font-bold mb-2 leading-tight group-hover:text-emerald-600 transition-colors">
            {title}
          </h3>
          
          <div className="flex items-center text-sm font-sans font-bold text-gray-500 group-hover:text-black transition-colors gap-2 border-t border-dashed border-gray-300 pt-3">
            Syllabus & Details
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
