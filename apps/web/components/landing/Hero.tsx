"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

export function Hero() {
  const [showSub, setShowSub] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

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
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden transition-colors duration-700 max-w-6xl mx-auto bg-[#0A0A0A]/80 backdrop-blur-md rounded-[3rem] shadow-[0_0_80px_rgba(73,171,201,0.07)]  my-8 p-6 md:p-12" id="hero">
      
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

          <Link href="/auth/login" className="px-10 py-4 bg-[#FAFAF8] text-[#050505] font-sans font-medium rounded-full shadow-xl hover:scale-105 hover:bg-white transition-all duration-300 text-lg">
            Start Your Journey
          </Link>
        </motion.div>
      </div>

      {/* The starting point of the Timeline Pencil Line */}
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: showCTA ? "20vh" : 0, opacity: showCTA ? 1 : 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-0 left-1/2 w-[2px] bg-[#71717A] -translate-x-1/2"
      />
    </section>
  );
}
