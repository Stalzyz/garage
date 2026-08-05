"use client";

import { motion } from "framer-motion";

export function PullQuote({
  quote,
  author,
  role,
  theme = "light"
}: {
  quote: string;
  author?: string;
  role?: string;
  theme?: "light" | "dark";
}) {
  const isDark = theme === "dark";

  return (
    <div className="py-12 lg:py-24 px-6 md:px-12 lg:my-24 my-0 relative max-w-4xl mx-auto flex flex-col justify-center h-full">
      {/* Decorative large quote mark */}
      <div 
        className={`absolute -top-10 -left-6 md:-left-12 text-[120px] font-serif leading-none opacity-10 select-none ${isDark ? "text-white" : "text-black"}`}
      >
        "
      </div>

      <motion.blockquote 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.8 }}
        className={`relative z-10 text-3xl md:text-5xl font-serif italic leading-tight ${isDark ? "text-[#FAFAF8]" : "text-[#050505]"}`}
      >
        "{quote}"
      </motion.blockquote>
      
      {(author || role) && (
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={`mt-8 flex items-center gap-4 ${isDark ? "text-[#FAFAF8]/60" : "text-[#050505]/60"}`}
        >
          <div className={`w-8 h-px ${isDark ? "bg-white/30" : "bg-black/30"}`} />
          <div className="font-mono text-sm tracking-widest uppercase">
            <span className={isDark ? "text-white" : "text-black"}>{author}</span> {role && `— ${role}`}
          </div>
        </motion.div>
      )}
    </div>
  );
}
