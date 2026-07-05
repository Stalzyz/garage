"use client";

import { motion } from "framer-motion";
import { ArrowRight, MonitorPlay } from "lucide-react";
import Link from "next/link";

type CourseCardProps = {
  title: string;
  index: number;
};

export function FeaturedCourseCard({ title, index }: CourseCardProps) {
  return (
    <Link href="http://localhost:3000/login">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="group relative h-[280px] bg-[#0A0A0A] hover:bg-[#141414] border border-[#1F1F1F] rounded-[24px] p-6 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/20"
      >
        {/* Subtle glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#49abc9]/5 rounded-full blur-2xl group-hover:bg-[#49abc9]/10 transition-colors duration-500" />
        
        {/* Minimal Icon */}
        <div className="w-12 h-12 rounded-xl bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-[#FAFAF8] group-hover:scale-110 group-hover:border-[#49abc9]/30 group-hover:text-[#49abc9] transition-all duration-300">
          <MonitorPlay size={24} strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="mt-auto">
          <h3 className="font-sans font-medium text-xl text-[#FAFAF8] mb-4 leading-tight group-hover:text-[#49abc9] transition-colors">
            {title}
          </h3>
          
          <div className="flex items-center text-sm font-medium text-[#A1A1AA] group-hover:text-[#FAFAF8] transition-colors gap-2">
            Explore Course
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
