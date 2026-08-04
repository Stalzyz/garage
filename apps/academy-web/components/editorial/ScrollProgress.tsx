"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress({
  acts
}: {
  acts: { id: string; title: string }[]
}) {
  const [activeId, setActiveId] = useState<string>("");
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      const sections = acts.map(act => document.getElementById(act.id)).filter(Boolean) as HTMLElement[];
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.offsetTop <= scrollPosition) {
          setActiveId(section.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [acts]);

  return (
    <div className="hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 flex-col z-50 pointer-events-none mix-blend-difference text-white h-[40vh]">
      {/* The background line */}
      <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-white/20" />
      
      {/* The animated progress line */}
      <motion.div 
        className="absolute left-0 top-0 w-[2px] bg-white origin-top"
        style={{ scaleY, height: "100%" }}
      />

      <div className="flex flex-col justify-between h-full py-4 ml-6">
        {acts.map((act, i) => {
          const isActive = activeId === act.id;
          return (
            <div 
              key={act.id} 
              className={`text-[10px] font-mono tracking-widest uppercase transition-all duration-300 ${isActive ? "opacity-100 font-bold" : "opacity-30"}`}
            >
              {`0${i + 1} — ${act.title}`}
            </div>
          );
        })}
      </div>
    </div>
  );
}
