"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";

export function NarrativeAct({
  id,
  number,
  title,
  children,
  theme = "light",
  className = "",
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
  theme?: "light" | "dark";
  className?: string;
}) {
  const isDark = theme === "dark";

  return (
    <section 
      id={id} 
      className={`min-h-screen py-32 relative ${isDark ? "bg-[#050505] text-[#FAFAF8]" : "bg-[#FAFAF8] text-[#050505]"} ${className}`}
    >
      <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
        <SectionHeader number={number} title={title} theme={theme} />
        
        <div className="mt-12">
          {children}
        </div>
      </div>
    </section>
  );
}
