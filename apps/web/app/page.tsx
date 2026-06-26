"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpRight, X } from "lucide-react"

import Image from "next/image"

export default function LandingHub() {
  const [hoveredSide, setHoveredSide] = useState<"agency" | "academy" | null>(null)
  const [activeMobileTab, setActiveMobileTab] = useState<"agency" | "academy" | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Calculate the exact split percentage to align the logo masks with the flex panels (Desktop)
  const splitPercentage = hoveredSide === "agency" ? 78.125 : hoveredSide === "academy" ? 21.875 : 50;

  return (
    <div className="h-screen w-full bg-[#050505] text-[#f4f4f4] overflow-hidden relative flex flex-row font-sans selection:bg-white/30 cursor-crosshair">
      
      {/* Custom Cursor Spotlight (Desktop) */}
      <motion.div 
        className="fixed top-0 left-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-screen hidden md:block"
        animate={{ 
          x: mousePosition.x - 200, 
          y: mousePosition.y - 200,
          opacity: hoveredSide ? 0.6 : 0.2
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.5 }}
      />

      {/* Root Level Sliding Logos (Hidden on mobile for better UX) */}
      <div className="absolute inset-0 pointer-events-none z-30 hidden md:flex items-center justify-center mix-blend-screen">
        {/* Visuals Logo Masked to the Left Panel */}
        <motion.div 
          className="absolute flex items-center justify-center w-full h-full"
          animate={{ clipPath: `inset(0 ${100 - splitPercentage}% 0 0)` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image src="/visuals-logo.png" alt="Grekam Visuals" width={500} height={160} className="object-contain" priority />
        </motion.div>

        {/* Academy Logo Masked to the Right Panel */}
        <motion.div 
          className="absolute flex items-center justify-center w-full h-full"
          animate={{ clipPath: `inset(0 0 0 ${splitPercentage}%)` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image src="/academy-logo.png" alt="Grekam Academy" width={500} height={160} className="object-contain" priority />
        </motion.div>
      </div>



      {/* --- DESKTOP VIEW --- */}
      {/* Agency Block */}
      <motion.div 
        className="relative hidden md:flex flex-col h-full flex-1 border-r border-white/10 overflow-hidden group"
        animate={{ 
          flex: hoveredSide === "agency" ? 2.5 : hoveredSide === "academy" ? 0.7 : 1,
          opacity: hoveredSide === "academy" ? 0.4 : 1
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={() => setHoveredSide("agency")}
        onMouseLeave={() => setHoveredSide(null)}
      >
        <Link href="/agency" className="absolute inset-0 z-20 flex flex-col justify-end p-16">
          <AnimatePresence>
            {(hoveredSide === "agency") && (
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-2xl mt-auto"
              >
                <div className="inline-block px-3 py-1 mb-6 rounded-full bg-[#2A8275]/20 border border-[#2A8275]/30 text-[#DF9D4F] text-xs font-mono tracking-widest backdrop-blur-md">
                  ENTERPRISE SOLUTIONS
                </div>
                <h2 className="text-8xl font-bold tracking-tighter leading-[0.9] mb-6 text-white drop-shadow-2xl">
                  ENGINEER <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2A8275] to-[#DF9D4F]">GROWTH.</span>
                </h2>
                <p className="text-xl font-light text-white/80 max-w-lg leading-relaxed mb-10 drop-shadow-md">
                  Elite B2B SaaS. High-end Visuals. Relentless Acquisition. We build digital ecosystems that scale.
                </p>
                <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black text-sm font-bold tracking-widest uppercase hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  Enter Visuals <ArrowUpRight className="w-5 h-5" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
        
        {/* Animated Background Mesh for Agency */}
        <div className="absolute inset-0 z-0 bg-zinc-950 transition-colors duration-700">
          <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')] opacity-20 mix-blend-overlay pointer-events-none" />
          <motion.div 
            animate={{ 
              opacity: hoveredSide === "agency" ? 0.8 : 0.4,
              scale: hoveredSide === "agency" ? 1.1 : 1,
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#2A8275]/40 blur-[140px] rounded-full mix-blend-screen" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#DF9D4F]/30 blur-[120px] rounded-full mix-blend-screen" />
          </motion.div>
        </div>
      </motion.div>

      {/* Academy Block */}
      <motion.div 
        className="relative hidden md:flex flex-col h-full flex-1 overflow-hidden group"
        animate={{ 
          flex: hoveredSide === "academy" ? 2.5 : hoveredSide === "agency" ? 0.7 : 1,
          opacity: hoveredSide === "agency" ? 0.4 : 1
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={() => setHoveredSide("academy")}
        onMouseLeave={() => setHoveredSide(null)}
      >
        <Link href="/academy" className="absolute inset-0 z-20 flex flex-col justify-end p-16">
          <AnimatePresence>
            {(hoveredSide === "academy") && (
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-2xl mt-auto self-end text-right flex flex-col items-end"
              >
                <div className="inline-block px-3 py-1 mb-6 rounded-full bg-[#4FB0C6]/20 border border-[#4FB0C6]/30 text-[#4FB0C6] text-xs font-mono tracking-widest backdrop-blur-md">
                  INTENSIVE EDUCATION
                </div>
                <h2 className="text-8xl font-bold tracking-tighter leading-[0.9] mb-6 text-white drop-shadow-2xl">
                  MASTER <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4FB0C6] to-[#2B5876]">THE CRAFT.</span>
                </h2>
                <p className="text-xl font-light text-white/80 max-w-lg leading-relaxed mb-10 drop-shadow-md text-right">
                  Stop watching tutorials. Start building actual products. 12 weeks to transform your design and engineering career.
                </p>
                <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black text-sm font-bold tracking-widest uppercase hover:scale-105 transition-transform flex-row-reverse shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  Enter Academy <ArrowUpRight className="w-5 h-5" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
        
        {/* Animated Background Mesh for Academy */}
        <div className="absolute inset-0 z-0 bg-[#020205] transition-colors duration-700">
          <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')] opacity-20 mix-blend-overlay pointer-events-none" />
          <motion.div 
            animate={{ 
              opacity: hoveredSide === "academy" ? 0.8 : 0.4,
              scale: hoveredSide === "academy" ? 1.1 : 1,
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[#4FB0C6]/40 blur-[140px] rounded-full mix-blend-screen" />
            <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#2B5876]/40 blur-[120px] rounded-full mix-blend-screen" />
          </motion.div>
        </div>
      </motion.div>

      {/* --- MOBILE DIAGONAL SPLIT VIEW --- */}
      <div className="md:hidden absolute inset-0 z-10 overflow-hidden bg-black">
        
        {/* AGENCY TRIANGLE (Top Left) */}
        <motion.div 
          className="absolute inset-0 z-20 flex flex-col cursor-pointer bg-zinc-950"
          animate={{
            clipPath: activeMobileTab === null 
              ? "polygon(0% 0%, 100% 0%, 0% 100%, 0% 0%)" 
              : activeMobileTab === "agency" 
                ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
                : "polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)"
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => {
            if (activeMobileTab === null) setActiveMobileTab("agency")
          }}
        >
          {/* Background Mesh */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')] opacity-20 mix-blend-overlay" />
            <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-[#2A8275]/50 blur-[80px] rounded-full mix-blend-screen" />
          </div>

          <div className="relative z-10 flex flex-col h-full w-full p-6 pt-24">
            <motion.div 
              animate={{
                x: activeMobileTab === "agency" ? "50%" : 0,
                y: activeMobileTab === "agency" ? "20px" : 0,
                scale: activeMobileTab === "agency" ? 1.2 : 1,
              }}
              transition={{ duration: 0.6 }}
              className="w-full flex flex-col items-start"
            >
              <div className={activeMobileTab === "agency" ? "-translate-x-1/2" : ""}>
                <Image src="/visuals-logo.png" alt="Visuals" width={activeMobileTab === "agency" ? 220 : 160} height={60} className="object-contain" />
              </div>
              {/* Subtle Mobile Instruction Badge */}
              <AnimatePresence>
                {activeMobileTab === null && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 bg-[#DF9D4F] rounded-full animate-ping" />
                    <span className="text-[8px] font-mono tracking-[0.3em] text-[#DF9D4F]/60 uppercase">Tap Sector</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <AnimatePresence>
              {activeMobileTab === "agency" && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col items-start mt-auto pb-12"
                >
                  <div className="inline-block px-3 py-1 mb-4 rounded-full bg-[#2A8275]/20 border border-[#2A8275]/30 text-[#DF9D4F] text-[10px] font-mono tracking-widest backdrop-blur-md">
                    ENTERPRISE SOLUTIONS
                  </div>
                  <h2 className="text-4xl font-bold tracking-tighter leading-[0.9] mb-4 text-white">
                    ENGINEER <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2A8275] to-[#DF9D4F]">GROWTH.</span>
                  </h2>
                  <p className="text-sm font-light text-white/80 max-w-xs leading-relaxed mb-8">
                    Elite B2B SaaS. High-end Visuals. Relentless Acquisition. We build digital ecosystems that scale.
                  </p>
                  <Link href="/agency" className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black text-xs font-bold tracking-widest uppercase hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    Enter Visuals <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ACADEMY TRIANGLE (Bottom Right) */}
        <motion.div 
          className="absolute inset-0 z-20 flex flex-col justify-end items-end cursor-pointer bg-[#020205]"
          animate={{
            clipPath: activeMobileTab === null 
              ? "polygon(100% 0%, 100% 0%, 100% 100%, 0% 100%)" 
              : activeMobileTab === "academy" 
                ? "polygon(100% 0%, 0% 0%, 0% 100%, 100% 100%)"
                : "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)"
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => {
            if (activeMobileTab === null) setActiveMobileTab("academy")
          }}
        >
          {/* Background Mesh */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')] opacity-20 mix-blend-overlay" />
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#4FB0C6]/50 blur-[80px] rounded-full mix-blend-screen" />
          </div>

          <div className="relative z-10 flex flex-col h-full w-full p-6 pb-20 pt-24">
            
            <motion.div 
              className={`w-full flex flex-col ${activeMobileTab === "academy" ? "items-center mt-0" : "items-end mt-auto"}`}
              animate={{
                scale: activeMobileTab === "academy" ? 1.2 : 1,
              }}
              transition={{ duration: 0.6 }}
            >
              {/* Subtle Mobile Instruction Badge */}
              <AnimatePresence>
                {activeMobileTab === null && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 flex items-center justify-end gap-2"
                  >
                    <span className="text-[8px] font-mono tracking-[0.3em] text-[#4FB0C6]/60 uppercase">Tap Sector</span>
                    <div className="w-1.5 h-1.5 bg-[#4FB0C6] rounded-full animate-ping" />
                  </motion.div>
                )}
              </AnimatePresence>
              <Image src="/academy-logo.png" alt="Academy" width={activeMobileTab === "academy" ? 220 : 160} height={60} className="object-contain" />
            </motion.div>

            <AnimatePresence>
              {activeMobileTab === "academy" && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col items-center text-center mt-auto pb-4"
                >
                  <div className="inline-block px-3 py-1 mb-4 rounded-full bg-[#4FB0C6]/20 border border-[#4FB0C6]/30 text-[#4FB0C6] text-[10px] font-mono tracking-widest backdrop-blur-md">
                    INTENSIVE EDUCATION
                  </div>
                  <h2 className="text-4xl font-bold tracking-tighter leading-[0.9] mb-4 text-white">
                    MASTER <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4FB0C6] to-[#2B5876]">THE CRAFT.</span>
                  </h2>
                  <p className="text-sm font-light text-white/80 max-w-xs leading-relaxed mb-8">
                    Stop watching tutorials. Start building actual products. 12 weeks to transform your design and engineering career.
                  </p>
                  <Link href="/academy" className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black text-xs font-bold tracking-widest uppercase hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    Enter Academy <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Back / Close Button (Visible when a tab is active) */}
        <AnimatePresence>
          {activeMobileTab !== null && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setActiveMobileTab(null)}
              className="absolute top-12 right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-md shadow-2xl"
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* The thin glowing diagonal separator line & Interactive Hub */}
        <AnimatePresence>
          {activeMobileTab === null && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center"
            >
              {/* This is a CSS trick to draw a perfect diagonal line from bottom-left to top-right */}
              <div 
                className="w-[150%] h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent shadow-[0_0_10px_rgba(255,255,255,0.5)] transform -rotate-[calc(atan2(100vh,100vw))] mix-blend-screen flex items-center justify-center relative" 
              >
                {/* Central High-Tech Pulsing Hub */}
                <div className="w-12 h-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center relative shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  {/* Expanding Ring */}
                  <motion.div 
                    animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full bg-white/20"
                  />
                  {/* Core Dot */}
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_10px_white]" />
                  
                  {/* Shooting Arrows to Left/Visuals (Travels up-left along the diagonal!) */}
                  <motion.div 
                    animate={{ x: [-15, -40], opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    className="absolute left-0 text-white/60 font-mono text-sm"
                  >
                    ←
                  </motion.div>

                  {/* Shooting Arrows to Right/Academy (Travels down-right along the diagonal!) */}
                  <motion.div 
                    animate={{ x: [15, 40], opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.75 }}
                    className="absolute right-0 text-white/60 font-mono text-sm"
                  >
                    →
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  )
}
