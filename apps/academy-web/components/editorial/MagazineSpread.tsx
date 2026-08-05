"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export function MagazineSpread({
  imageSrc,
  headline,
  subtext,
}: {
  imageSrc: string;
  headline: string;
  subtext: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);

  return (
    <div ref={containerRef} className="relative w-full h-full lg:h-[150vh] overflow-hidden bg-black flex items-center justify-center lg:my-24 my-0">
      {/* Background Image with Parallax */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 w-full h-[130%] -top-[15%]">
        <Image
          src={imageSrc}
          alt={headline}
          fill
          className="object-cover grayscale contrast-125 brightness-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80" />
      </motion.div>

      {/* Typography Overlay */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 flex flex-col items-center text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-8xl lg:text-[120px] font-black text-[#FAFAF8] uppercase tracking-tighter leading-[0.85] mix-blend-overlay"
        >
          {headline.split("\\n").map((line, i) => (
            <span key={i} className="block">{line}</span>
          ))}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-12 text-[#FAFAF8] max-w-xl text-lg md:text-2xl font-serif italic"
        >
          {subtext}
        </motion.p>
      </div>

      {/* Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-white/50" />
        <div className="absolute right-1/4 top-0 bottom-0 w-px bg-white/50" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/50" />
      </div>
    </div>
  );
}
