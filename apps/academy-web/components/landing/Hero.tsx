"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { LeadCaptureModal } from "./LeadCaptureModal";

export function Hero() {
  const [showSub, setShowSub] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const subTimer = setTimeout(() => setShowSub(true), 2500);
    const ctaTimer = setTimeout(() => setShowCTA(true), 4000);
    return () => {
      clearTimeout(subTimer);
      clearTimeout(ctaTimer);
    };
  }, []);
  const headline = "Every Creative Journey Begins Here.";

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden transition-colors duration-700" id="hero">
      
      {/* Artsy Ambient Elements */}
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/10 blur-[120px] rounded-[40%_60%_70%_30%] pointer-events-none mix-blend-screen" 
      />
      <motion.div 
        animate={{ rotate: -360 }} 
        transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/10 blur-[120px] rounded-[60%_40%_30%_70%] pointer-events-none mix-blend-screen" 
      />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      {/* Hand-drawn decorative splatters */}
      <svg className="absolute top-[20%] left-[15%] w-32 h-32 opacity-20 pointer-events-none" viewBox="0 0 100 100" fill="none">
        <path d="M10,50 Q40,10 70,30 T90,80" stroke="#FAFAF8" strokeWidth="2" strokeLinecap="round" />
        <circle cx="80" cy="20" r="2" fill="#FAFAF8" />
        <circle cx="20" cy="70" r="3" fill="#FAFAF8" />
        <circle cx="40" cy="90" r="1.5" fill="#FAFAF8" />
      </svg>
      
      <svg className="absolute bottom-[20%] right-[15%] w-48 h-48 opacity-20 pointer-events-none" viewBox="0 0 100 100" fill="none">
        <path d="M20,80 C20,20 80,80 80,20" stroke="#FAFAF8" strokeWidth="1" strokeDasharray="4 4" strokeLinecap="round" />
        <rect x="70" y="70" w="5" h="5" stroke="#FAFAF8" strokeWidth="1" />
      </svg>

      {/* Container matching the paper texture aesthetic */}
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center max-w-4xl pt-20">
        
        {/* Animated Headline with Blinking Cursor */}
        <h1 className="text-5xl md:text-6xl lg:text-8xl font-handwriting text-[#FAFAF8] leading-tight flex flex-wrap justify-center items-center gap-x-3 md:gap-x-4 relative text-center">
          {headline.split(" ").map((word, wordIndex, wordsArray) => {
            const previousWordsLength = wordsArray.slice(0, wordIndex).join(" ").length;
            const startIndex = wordIndex === 0 ? 0 : previousWordsLength + 1;
            
            return (
              <span key={wordIndex} className="whitespace-nowrap flex">
                {word.split("").map((char, charIndex) => (
                  <motion.span
                    key={charIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.03, delay: (startIndex + charIndex) * 0.05 + 0.5 }}
                    className="relative inline-block"
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            );
          })}
          {/* Blinking Cursor */}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
            className="inline-block w-[3px] h-[50px] md:h-[80px] bg-[#FAFAF8] ml-1 mb-2"
          />

          {/* Underline for 'Here.' */}
          <motion.div
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 2.3 }}
            className="absolute -bottom-2 right-4 md:right-10 w-24 md:w-36 h-4"
          >
            <svg width="100%" height="100%" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0 10 Q50 20 100 5" stroke="#FAFAF8" strokeWidth="4" fill="transparent" strokeLinecap="round" />
            </svg>
          </motion.div>
        </h1>

        {/* Subheadline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showSub ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          className="mt-12 text-2xl md:text-3xl text-[#A1A1AA] font-handwriting relative flex flex-col items-center"
        >
          <p>Not with perfect skills.</p>
          <p className="relative inline-block">
            Just the <span className="relative">
              courage
              <svg className="absolute -bottom-1 left-0 w-full h-3" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0 15 Q50 5 100 15" stroke="#A1A1AA" strokeWidth="3" fill="transparent" strokeLinecap="round" />
              </svg>
            </span> to start.
          </p>
        </motion.div>

        {/* CTA Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showCTA ? 1 : 0 }}
          transition={{ duration: 1 }}
          className="mt-16 flex flex-col items-center"
        >
          {/* Hand-drawn arrow pointing down */}
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: showCTA ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <svg width="30" height="50" viewBox="0 0 30 50" fill="none" stroke="#71717A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5 L15 45 M5 35 L15 45 L25 35" />
            </svg>
          </motion.div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-10 py-4 bg-[#FAFAF8] text-[#050505] font-sans font-bold rounded-full shadow-[0_0_40px_rgba(250,250,248,0.3)] hover:shadow-[0_0_60px_rgba(250,250,248,0.5)] hover:scale-105 transition-all duration-500 text-lg relative overflow-hidden group"
          >
            <span className="relative z-10">Start Your Journey</span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-sky-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
          </button>
        </motion.div>
      </div>

      {/* The starting point of the Timeline Pencil Line */}
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: showCTA ? "20vh" : 0, opacity: showCTA ? 1 : 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-0 left-1/2 w-[2px] bg-gradient-to-t from-emerald-500 to-transparent -translate-x-1/2"
      />

      <LeadCaptureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
