"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion"

// ─────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) setMatches(media.matches)
    const listener = () => setMatches(media.matches)
    window.addEventListener("resize", listener)
    return () => window.removeEventListener("resize", listener)
  }, [matches, query])
  return matches
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
function getTornEdge(width: number, height: number, jitter = 18, isHorizontal = false): string {
  const steps = 28
  const points: string[] = [`0,0`]
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const baseX = isHorizontal ? t * width : t * width
    const baseY = isHorizontal ? t * height : t * height
    const jx = i === 0 || i === steps ? 0 : (Math.random() - 0.5) * jitter
    const jy = i === 0 || i === steps ? 0 : (Math.random() - 0.5) * jitter
    points.push(`${baseX + jx},${baseY + jy}`)
  }
  if (isHorizontal) {
    points.push(`${width},${height}`)
    return `M 0 0 L ${points.slice(1, -1).join(" L ")} L ${width} 0 Z`
  } else {
    points.push(`0,${height}`)
    return `M 0 0 L ${width} 0 L ${points.slice(1, -1).join(" L ")} L 0 ${height} Z`
  }
}

// ─────────────────────────────────────────────
// Pencil Trail Canvas
// ─────────────────────────────────────────────
function PencilTrail({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const points = useRef<{ x: number; y: number; age: number }[]>([])
  const raf = useRef<number>()

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!active) return
      points.current.push({ x: e.clientX, y: e.clientY, age: 1 })
      if (points.current.length > 80) points.current.shift()
    }
    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [active])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    canvas.width = window.innerWidth; canvas.height = window.innerHeight
    const ctx = canvas.getContext("2d"); if (!ctx) return
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener("resize", resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (active && points.current.length > 1) {
        for (let i = 1; i < points.current.length; i++) {
          const p0 = points.current[i - 1]
          const p1 = points.current[i]
          const a = (i / points.current.length) * 0.25
          ctx.beginPath()
          ctx.moveTo(p0.x, p0.y)
          ctx.lineTo(p1.x, p1.y)
          ctx.strokeStyle = `rgba(60,40,20,${a})`
          ctx.lineWidth = 0.6 + Math.random() * 0.6
          ctx.lineCap = "round"
          ctx.stroke()
        }
      }
      points.current = points.current.map(p => ({ ...p, age: p.age - 0.015 })).filter(p => p.age > 0)
      raf.current = requestAnimationFrame(draw)
    }
    raf.current = requestAnimationFrame(draw)
    return () => { if (raf.current) cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize) }
  }, [active])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[190]" style={{ opacity: active ? 1 : 0, transition: "opacity 0.3s" }} />
}

// ─────────────────────────────────────────────
// Agency Canvas — smooth fluid micro dots
// ─────────────────────────────────────────────
function AgencyCanvas({ active, mx, my }: { active: boolean; mx: number; my: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const raf = useRef<number>()
  const t = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext("2d"); if (!ctx) return
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize(); window.addEventListener("resize", resize)

    const draw = () => {
      t.current += 0.014
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)

      if (!active) { raf.current = requestAnimationFrame(draw); return }

      const rect = canvas.getBoundingClientRect()
      const lx = mx - rect.left, ly = my - rect.top
      const STEP = 38
      for (let x = 0; x < W; x += STEP) {
        for (let y = 0; y < H; y += STEP) {
          const dist = Math.hypot(x - lx, y - ly)
          const force = Math.max(0, 1 - dist / 200)
          const ox = Math.cos(t.current + x * 0.03) * 2 * force
          const oy = Math.sin(t.current + y * 0.03) * 2 * force
          const a = 0.05 + force * 0.15
          ctx.beginPath()
          ctx.arc(x + ox, y + oy, 1, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(200,210,230,${a})`
          ctx.fill()
        }
      }
      if (lx > 0 && lx < W) {
        ctx.beginPath()
        ctx.moveTo(0, ly)
        ctx.lineTo(W, ly)
        ctx.strokeStyle = `rgba(200,210,230,0.04)`
        ctx.lineWidth = 1
        ctx.stroke()
      }
      raf.current = requestAnimationFrame(draw)
    }
    raf.current = requestAnimationFrame(draw)
    return () => { if (raf.current) cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize) }
  }, [active, mx, my])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}

// ─────────────────────────────────────────────
// Academy Canvas — 8fps stop-motion sketch
// ─────────────────────────────────────────────
function AcademyCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const raf = useRef<number>()
  const lastT = useRef(0)
  type Stroke = { x1: number; y1: number; cx: number; cy: number; x2: number; y2: number; w: number; a: number }
  const strokes = useRef<Stroke[]>([])
  const blobs = useRef<{ x: number; y: number; r: number }[]>([])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize(); window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext("2d"); if (!ctx) return

    const draw = (time: number) => {
      const W = canvas.width, H = canvas.height
      if (!active) {
        ctx.clearRect(0, 0, W, H); strokes.current = []; blobs.current = []
        raf.current = requestAnimationFrame(draw); return
      }
      if (time - lastT.current < 125) { raf.current = requestAnimationFrame(draw); return }
      lastT.current = time

      ctx.fillStyle = "rgba(242,236,220,0.28)"; ctx.fillRect(0, 0, W, H)

      for (let i = 0; i < 4 + Math.floor(Math.random() * 4); i++) {
        const angle = (Math.random() - 0.5) * Math.PI * 0.6
        const len = 30 + Math.random() * 180
        const x1 = Math.random() * W, y1 = Math.random() * H
        strokes.current.push({
          x1, y1,
          cx: x1 + Math.cos(angle) * len / 2 + (Math.random() - 0.5) * 25,
          cy: y1 + Math.sin(angle) * len / 2 + (Math.random() - 0.5) * 25,
          x2: x1 + Math.cos(angle) * len,
          y2: y1 + Math.sin(angle) * len,
          w: 0.3 + Math.random() * 2.2,
          a: 0.03 + Math.random() * 0.09,
        })
      }
      if (Math.random() < 0.3) blobs.current.push({ x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 5 })
      if (strokes.current.length > 180) strokes.current = strokes.current.slice(-180)
      if (blobs.current.length > 25) blobs.current = blobs.current.slice(-25)

      strokes.current.forEach(s => {
        ctx.beginPath(); ctx.moveTo(s.x1, s.y1)
        ctx.quadraticCurveTo(s.cx, s.cy, s.x2, s.y2)
        ctx.strokeStyle = `rgba(38,24,10,${s.a})`
        ctx.lineWidth = s.w; ctx.lineCap = "round"; ctx.stroke()
      })
      blobs.current.forEach(b => {
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(38,24,10,0.06)`; ctx.fill()
      })
      raf.current = requestAnimationFrame(draw)
    }
    raf.current = requestAnimationFrame(draw)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [active])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: active ? 1 : 0, transition: "opacity 0.8s" }} />
}

// ─────────────────────────────────────────────
// Magnetic cursor (Agency)
// ─────────────────────────────────────────────
function MagneticCursor({ side, easterEgg }: { side: "agency" | "academy" | null; easterEgg: string | null }) {
  const mxRaw = useMotionValue(-200)
  const myRaw = useMotionValue(-200)
  const mx = useSpring(mxRaw, { stiffness: 500, damping: 40 })
  const my = useSpring(myRaw, { stiffness: 500, damping: 40 })

  const mxSlow = useSpring(mxRaw, { stiffness: 80, damping: 20 })
  const mySlow = useSpring(myRaw, { stiffness: 80, damping: 20 })

  useEffect(() => {
    const move = (e: MouseEvent) => { mxRaw.set(e.clientX); myRaw.set(e.clientY) }
    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [mxRaw, myRaw])

  if (easterEgg === "blueprint") return null

  return (
    <div className="hidden md:block">
      {/* Trailing ring (slow) */}
      <motion.div className="fixed z-[195] pointer-events-none rounded-full border"
        style={{
          x: mxSlow, y: mySlow,
          translateX: "-50%", translateY: "-50%",
          width: side === "agency" ? "36px" : "28px",
          height: side === "agency" ? "36px" : "28px",
          borderColor: side === "agency" ? "rgba(200,210,240,0.3)" : "rgba(80,55,25,0.25)",
          borderWidth: "1px",
        }} />
      {/* Fast precise dot */}
      <motion.div className="fixed z-[196] pointer-events-none"
        style={{ x: mx, y: my, translateX: "-50%", translateY: "-50%" }}>
        {side === "agency" ? (
          <div style={{
            width: "6px", height: "6px",
            background: "rgba(220,225,240,0.9)",
            clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", // diamond
          }} />
        ) : side === "academy" ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 0 L10 10 L8 16 L6 10 Z" fill="rgba(60,40,15,0.8)" />
            <path d="M6 10 L10 10 L8 14 Z" fill="rgba(180,150,80,0.6)" />
          </svg>
        ) : (
          <div className="w-2 h-2 rounded-full bg-white/30" />
        )}
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Animated sketch annotations (Academy hover)
// ─────────────────────────────────────────────
function SketchAnnotations({ active }: { active: boolean }) {
  const [drawn, setDrawn] = useState(false)
  useEffect(() => {
    if (active) { const t = setTimeout(() => setDrawn(true), 300); return () => clearTimeout(t) }
    else setDrawn(false)
  }, [active])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {drawn && (
          <>
            <motion.svg key="arrow1" className="absolute hidden md:block" style={{ top: "38%", right: "18%" }}
              width="80" height="50" viewBox="0 0 80 50" fill="none"
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
              <motion.path d="M10 40 Q40 10 70 20" stroke="rgba(80,55,25,0.4)" strokeWidth="1.2"
                fill="none" strokeDasharray="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }} />
              <path d="M65 15 L75 22 L62 26" stroke="rgba(80,55,25,0.4)" strokeWidth="1" fill="none" />
            </motion.svg>
            <motion.div key="highlight" className="absolute"
              style={{ top: "62%", right: "10%", width: "120px", height: "20px", background: "rgba(255,200,50,0.25)", transform: "rotate(-1deg)" }}
              initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0, originX: 1 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }} />
            <motion.div key="sticky" className="absolute text-[9px] font-mono hidden md:block"
              style={{
                top: "20%", right: "8%", background: "rgba(255,230,100,0.7)", padding: "8px 10px", transform: "rotate(3deg)",
                color: "#3a2808", lineHeight: 1.4, maxWidth: "100px", boxShadow: "2px 2px 8px rgba(0,0,0,0.1)",
              }}
              initial={{ opacity: 0, y: -10, rotate: 8 }} animate={{ opacity: 1, y: 0, rotate: 3 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}>
              the craft<br />starts here ↓
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────
// MAIN LANDING
// ─────────────────────────────────────────────
export default function SplitReality() {
  const [side, setSide] = useState<"agency" | "academy" | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [navVisible, setNavVisible] = useState(false)
  const [transitioning, setTransitioning] = useState<"agency" | "academy" | null>(null)
  const [easterEgg, setEasterEgg] = useState<"blueprint" | "sketch" | "print" | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const hasInteracted = useRef(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    setIsClient(true)
    const keyMap: Record<string, "blueprint" | "sketch" | "print"> = { d: "blueprint", s: "sketch", p: "print" }
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (keyMap[key]) setEasterEgg(ee => ee === keyMap[key] ? null : keyMap[key])
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isMobile) return
    setMousePos({ x: e.clientX, y: e.clientY })
    const newSide = e.clientX < window.innerWidth * 0.5 ? "agency" : "academy"
    setSide(newSide)
    if (!hasInteracted.current) {
      hasInteracted.current = true
      setTimeout(() => setNavVisible(true), 800)
    }
  }, [isMobile])

  const handleMobileTouch = useCallback((touchedSide: "agency" | "academy") => {
    if (!isMobile) return
    setSide(touchedSide)
    if (!hasInteracted.current) {
      hasInteracted.current = true
      setTimeout(() => setNavVisible(true), 800)
    }
  }, [isMobile])

  const isAgency = side === "agency"
  const isAcademy = side === "academy"

  const navigate = (type: "agency" | "academy", href: string) => {
    setTransitioning(type)
    setTimeout(() => { window.location.href = href }, 1200)
  }

  const blueprintMode = easterEgg === "blueprint"
  const sketchMode = easterEgg === "sketch"
  const printMode = easterEgg === "print"

  if (!isClient) return null

  return (
    <div
      className="h-screen w-full overflow-hidden relative cursor-auto md:cursor-none select-none flex flex-col md:flex-row"
      style={{
        filter: blueprintMode ? "sepia(1) hue-rotate(180deg) saturate(2) brightness(0.7)" : sketchMode ? "grayscale(1) contrast(1.2)" : printMode ? "sepia(0.6) contrast(1.1)" : "none",
        transition: "filter 0.8s ease",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => !isMobile && setSide(null)}
    >
      <svg className="absolute opacity-0 pointer-events-none" aria-hidden>
        <defs>
          <filter id="rough-paper" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* ══════════════════════════════════ */}
      {/* AGENCY SIDE — Top (mobile) / Left (desktop) */}
      {/* ══════════════════════════════════ */}
      <motion.div
        className="relative overflow-hidden"
        animate={{ 
          width: isMobile ? "100%" : (isAgency ? "58%" : isAcademy ? "42%" : "50%"),
          height: isMobile ? (isAgency ? "60%" : isAcademy ? "40%" : "50%") : "100%"
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ zIndex: isAgency ? 20 : 10 }}
        onClick={() => handleMobileTouch("agency")}
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(145deg, #111114 0%, #161820 40%, #0e0f14 100%)" }} />
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")` }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(200,210,240,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,210,240,0.03) 1px, transparent 1px)`, backgroundSize: "48px 48px", opacity: isAgency ? 1 : 0.4, transition: "opacity 0.8s ease" }} />
        <AgencyCanvas active={isAgency} mx={mousePos.x} my={mousePos.y} />
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{ background: "radial-gradient(ellipse at top right, rgba(220,210,255,0.05) 0%, transparent 70%)", opacity: isAgency ? 1 : 0.3, transition: "opacity 0.8s ease" }} />

        <button
          className="absolute inset-0 flex flex-col justify-between p-8 md:p-14 cursor-auto md:cursor-none text-left"
          onClick={() => isMobile ? (isAgency ? navigate("agency", "/agency") : handleMobileTouch("agency")) : navigate("agency", "/agency")}
        >
          <div style={{ opacity: isAgency ? 1 : 0.35, transition: "opacity 0.6s ease", marginTop: isMobile ? "40px" : "0" }}>
            <div className="text-[9px] font-mono tracking-[0.4em] text-white/25 uppercase mb-1">01 / AGENCY</div>
            <div className="w-12 h-px bg-white/20" />
          </div>

          <div>
            <motion.div animate={{ filter: isAgency ? "blur(0px)" : "blur(2px)", opacity: isAgency ? 1 : 0.3 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-4">
              <Image src="/visuals-logo.png" alt="Grekam Visuals" width={isMobile ? 220 : 360} height={120} className="object-contain" style={{ filter: isAgency ? "brightness(1) invert(1)" : "brightness(0.6) invert(1)", transition: "filter 0.6s ease" }} />
              <div className="overflow-hidden mt-4">
                <motion.h2 className="font-black uppercase leading-none"
                  style={{
                    fontFamily: "var(--font-barlow, system-ui), sans-serif",
                    fontSize: "clamp(2rem, 5vw, 6.5rem)",
                    color: isAgency ? "#ffffff" : "rgba(255,255,255,0.25)",
                    letterSpacing: isAgency ? (isMobile ? "4px" : "14px") : "0px",
                    transition: "color 0.6s ease, letter-spacing 0.9s cubic-bezier(0.16,1,0.3,1)",
                  }}
                >
                  WE BUILD<br />DIGITAL<br />EXPERIENCES
                </motion.h2>
              </div>
            </motion.div>
            <AnimatePresence>
              {isAgency && (
                <motion.div key="ui-lines" className="mt-4 md:mt-8 space-y-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <div className="flex gap-3 items-center"><div className="w-2 h-2 rounded-full bg-white/30" /><div className="h-px flex-1 bg-white/10" /><div className="text-[8px] font-mono text-white/20 tracking-widest">STRATEGY</div></div>
                  <div className="flex gap-3 items-center"><div className="w-2 h-2 rounded-full bg-white/20" /><div className="h-px flex-1 bg-white/08" /><div className="text-[8px] font-mono text-white/15 tracking-widest">DESIGN</div></div>
                  <div className="flex gap-3 items-center"><div className="w-2 h-2 rounded-full bg-white/15" /><div className="h-px flex-1 bg-white/06" /><div className="text-[8px] font-mono text-white/12 tracking-widest">TECHNOLOGY</div></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div className="flex items-center gap-4 mb-4 md:mb-0" animate={{ opacity: isAgency ? 1 : 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="px-6 py-3 border border-white/20 text-[10px] font-bold tracking-[0.3em] uppercase text-white/70 hover:bg-white hover:text-black transition-all duration-300" style={{ backdropFilter: "blur(4px)" }}>
              Enter Agency
            </div>
            <div className="text-white/30 text-xs font-mono">→</div>
          </motion.div>
        </button>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(14,15,20,0.45)", opacity: isAcademy ? 1 : 0, transition: "opacity 0.7s ease" }} />
      </motion.div>

      {/* ═══════════════════════════════════════════ */}
      {/* DIVIDER — organic split */}
      {/* ═══════════════════════════════════════════ */}
      <div className={`absolute z-30 pointer-events-none ${isMobile ? "w-full h-10 top-1/2 -translate-y-1/2 left-0" : "h-full w-10 top-0 left-1/2 -translate-x-1/2"}`} >
        <div className="absolute inset-0"
          style={{
            background: isMobile 
              ? (isAcademy ? "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 100%)" : "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.15) 100%)")
              : (isAcademy ? "linear-gradient(90deg, rgba(0,0,0,0.25) 0%, transparent 100%)" : "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.15) 100%)"),
            transition: "background 0.5s ease",
          }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: isMobile ? "60px" : "12px", height: isMobile ? "12px" : "60px",
            background: "rgba(255,240,200,0.18)", border: "1px solid rgba(200,180,120,0.15)",
            transform: "translateX(-50%) translateY(-50%) rotate(1deg)",
          }} />
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* ACADEMY SIDE — Bottom (mobile) / Right (desktop) */}
      {/* ═══════════════════════════════════════════ */}
      <motion.div
        className="relative overflow-hidden"
        animate={{ 
          width: isMobile ? "100%" : (isAcademy ? "58%" : isAgency ? "42%" : "50%"),
          height: isMobile ? (isAcademy ? "60%" : isAgency ? "40%" : "50%") : "100%"
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ zIndex: isAcademy ? 20 : 10 }}
        onClick={() => handleMobileTouch("academy")}
      >
        <div className="absolute inset-0" style={{ backgroundColor: "#f0e8d4", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E"), repeating-linear-gradient(transparent, transparent 27px, rgba(180,200,220,0.18) 27px, rgba(180,200,220,0.18) 28px)` }} />
        <div className="absolute top-0 left-8 md:left-16 w-px h-full bg-red-300/20 pointer-events-none" />
        <AcademyCanvas active={isAcademy} />
        {!isMobile && <SketchAnnotations active={isAcademy} />}

        <button
          className="absolute inset-0 flex flex-col justify-between pl-12 pr-6 py-8 md:pl-20 md:pr-10 md:py-14 cursor-auto md:cursor-none text-left"
          onClick={() => isMobile ? (isAcademy ? navigate("academy", "http://localhost:3001") : handleMobileTouch("academy")) : navigate("academy", "http://localhost:3001")}
          style={{ filter: isAcademy ? "url(#rough-paper)" : "none" }}
        >
          <motion.div animate={{ opacity: isAcademy ? 1 : 0.35 }} transition={{ duration: 0.6 }}>
            <div className="text-[9px] font-mono tracking-[0.4em] text-[#8b6a3a]/60 uppercase mb-2">02 / ACADEMY</div>
            <svg width="48" height="4" viewBox="0 0 48 4"><path d="M0 2 Q12 1 24 2 Q36 3 48 2" stroke="rgba(80,55,20,0.3)" strokeWidth="1.2" fill="none" strokeDasharray="3 1" /></svg>
          </motion.div>

          <div>
            <motion.div animate={{ filter: isAcademy ? "none" : "blur(1.5px)", opacity: isAcademy ? 1 : 0.25 }} transition={{ duration: 0.7 }} className="flex flex-col gap-4">
              <div className={isMobile ? "w-[220px]" : "w-[320px]"}>
                <Image src="/academy-logo.png" alt="Grekam Academy" width={320} height={120} className="object-contain w-full h-auto" style={{ filter: isAcademy ? "brightness(0) url(#rough-paper) contrast(1.2)" : "brightness(0)", transition: "filter 0.6s ease", transform: "rotate(-1deg)" }} />
              </div>
              <h2 style={{ fontFamily: "var(--font-barlow, system-ui), sans-serif", fontSize: "clamp(2rem, 5vw, 6.5rem)", color: isAcademy ? "#2a1a08" : "rgba(42,26,8,0.25)", letterSpacing: "-0.02em", lineHeight: 0.9, fontWeight: 900, transition: "color 0.6s ease" }}>MASTER<br />THE CRAFT.</h2>
              <div className="mt-2 text-xs font-mono" style={{ color: "#8b6a3a", transform: "rotate(-0.5deg)", opacity: isAcademy ? 0.7 : 0 }}>← start here</div>
            </motion.div>
            <AnimatePresence>
              {isAcademy && (
                <motion.div key="sketch-elements" className="mt-4 md:mt-6 space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
                  {["Design Thinking", "Creative Direction", "Brand Identity"].map((item, i) => (
                    <div key={item} className="flex items-center gap-2" style={{ transform: `rotate(${(i - 1) * 0.5}deg)`, filter: "url(#rough-paper)" }}>
                      <svg width="16" height="8" viewBox="0 0 16 8"><path d="M0 4 Q8 2 16 4" stroke="rgba(80,55,20,0.4)" strokeWidth="1" fill="none" /></svg>
                      <span className="text-[10px] font-mono text-[#8b6a3a]/60">{item}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div className="mb-4 md:mb-0" animate={{ opacity: isAcademy ? 1 : 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="inline-flex items-center gap-3 px-5 py-3 cursor-auto md:cursor-none" style={{ background: "rgba(255,220,100,0.3)", border: "1px solid rgba(140,100,40,0.2)", transform: "rotate(-0.5deg)", filter: "url(#rough-paper)" }}>
              <span className="text-[10px] font-mono font-bold tracking-[0.25em] uppercase text-[#3a2808]">Enter Academy</span>
              <span className="text-[#8b6a3a]">↗</span>
            </div>
          </motion.div>
        </button>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(242,236,220,0.5)", filter: "grayscale(0.6)", opacity: isAgency ? 0.7 : 0, transition: "opacity 0.7s ease" }} />
      </motion.div>

      {/* ═══════════════════════════════ */}
      {/* EFFECTS & OVERLAYS             */}
      {/* ═══════════════════════════════ */}
      <PencilTrail active={isAcademy} />

      <AnimatePresence>
        {navVisible && (
          <motion.div key="nav" className="absolute top-0 w-full flex justify-between items-start px-6 py-6 md:px-10 md:py-8 z-50 pointer-events-none" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-mono tracking-[0.4em] uppercase" style={{ color: isAgency || isMobile ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.1)" }}>GREKAM OS</span>
            </div>
            <Link href="/auth/login" className="pointer-events-auto text-[9px] font-bold tracking-[0.3em] uppercase px-5 py-2 cursor-auto md:cursor-none"
              style={{
                border: isAgency || isMobile ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(100,75,40,0.3)",
                color: isAgency || isMobile ? "rgba(255,255,255,0.6)" : "#8b6a3a",
                background: isAgency || isMobile ? "rgba(255,255,255,0.04)" : "rgba(255,220,100,0.1)",
                filter: isAcademy && !isMobile ? "url(#rough-paper)" : "none",
                transition: "all 0.5s ease",
              }}>Login</Link>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!navVisible && !isMobile && (
          <motion.div key="cta-hint" className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <motion.div animate={{ x: [-6, 6, -6] }} transition={{ duration: 2.5, repeat: Infinity }}>
              <div className="text-[8px] font-mono tracking-[0.5em] uppercase text-white/30 px-4 py-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10">MOVE TO EXPLORE</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MagneticCursor side={side} easterEgg={easterEgg} />

      {/* ═══════════════════════════════ */}
      {/* PAGE TRANSITIONS               */}
      {/* ═══════════════════════════════ */}
      <AnimatePresence>
        {transitioning === "agency" && (
          <motion.div key="t-agency" className="fixed inset-0 z-[220]" style={{ background: "#111114", originX: 0 }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} />
        )}
        {transitioning === "academy" && (
          <>
            <motion.div key="t-academy-1" className="fixed inset-0 z-[220]" style={{ background: "#f0e8d4", originX: 1, filter: "url(#rough-paper)" }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
            <motion.div key="t-academy-2" className="fixed inset-0 z-[221]" style={{ background: "#e8dcc0", originX: 1 }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
