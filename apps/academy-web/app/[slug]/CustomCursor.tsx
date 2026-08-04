"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CourseDomain } from "./CategoryThemeMapper";
import { PenTool, Code2, Film, TrendingUp } from "lucide-react";

export function CustomCursor({ domain }: { domain: CourseDomain }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Check if hovering over clickable elements
      const target = e.target as HTMLElement;
      if (target.closest('a') || target.closest('button')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  const variants = {
    default: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      scale: 1,
      opacity: 1,
    },
    hover: {
      x: mousePosition.x - 24,
      y: mousePosition.y - 24,
      scale: 1.5,
      opacity: 0.8,
    }
  };

  const getIconForDomain = () => {
    switch (domain) {
      case 'DESIGN': return <PenTool className="w-8 h-8 text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />;
      case 'TECH': return <Code2 className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />;
      case 'VIDEO': return <Film className="w-8 h-8 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />;
      case 'MARKETING': return <TrendingUp className="w-8 h-8 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />;
      default: return null;
    }
  };

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:flex items-center justify-center mix-blend-screen"
      variants={variants}
      animate={isHovering ? "hover" : "default"}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
    >
      {getIconForDomain()}
    </motion.div>
  );
}
