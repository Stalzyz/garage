"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Cloud, BookOpen, PenTool, X, TrendingUp, Wrench, Image as ImageIcon, Briefcase, Target, Star } from "lucide-react";

const journeySteps = [
  { icon: Cloud, label: "Dream" },
  { icon: BookOpen, label: "Learn" },
  { icon: PenTool, label: "Practice" },
  { icon: X, label: "Fail" },
  { icon: TrendingUp, label: "Improve" },
  { icon: Wrench, label: "Build" },
  { icon: ImageIcon, label: "Portfolio" },
  { icon: Briefcase, label: "Internship" },
  { icon: Target, label: "Placement" },
  { icon: Star, label: "Career" }
];

export function CreativeJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end end"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="pb-32 relative overflow-hidden transition-colors duration-700" id="journey">
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center max-w-md">
        
        {/* Journey Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <h3 className="text-3xl font-handwriting text-[#FAFAF8] mb-4">The Journey</h3>
          <svg width="24" height="40" viewBox="0 0 24 40" fill="none" stroke="#71717A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5 L12 35 M5 28 L12 35 L19 28" />
          </svg>
        </div>

        {/* Timeline Container */}
        <div ref={containerRef} className="relative w-full py-10">
          
          {/* Static Faint Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-[#1F1F1F] -translate-x-1/2" />
          
          {/* Animated Drawing Pencil Line */}
          <motion.div 
            className="absolute left-1/2 top-0 w-[2px] bg-[#71717A] -translate-x-1/2 origin-top"
            style={{ height: lineHeight }}
          />

          {/* Timeline Nodes */}
          <div className="space-y-24 relative z-10">
            {journeySteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="flex items-center w-full relative"
                >
                  {/* Left Side: Icon */}
                  <div className="w-1/2 pr-12 flex justify-end">
                    <div className="text-[#71717A]">
                      <Icon size={32} strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Center Node (small hollow circle to break the line) */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#050505] border-2 border-[#71717A] z-10" />

                  {/* Right Side: Text Label */}
                  <div className="w-1/2 pl-12 flex justify-start">
                    <span className="text-3xl font-handwriting text-[#FAFAF8]">
                      {step.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Final Arrow pointing down to Final CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-16 left-1/2 -translate-x-1/2"
          >
            <svg width="24" height="40" viewBox="0 0 24 40" fill="none" stroke="#71717A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 0 L12 35 M5 28 L12 35 L19 28" />
            </svg>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
