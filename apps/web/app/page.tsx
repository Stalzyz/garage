"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence, useMotionValue, useSpring, animate } from "framer-motion"

// ─────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia(query)
    setMatches(media.matches)
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])
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
  const raf = useRef<number>(0)

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
  const raf = useRef<number>(0)
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
  const raf = useRef<number>(0)
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
// Elastic Boundary (Physics-Based Divider)
// ─────────────────────────────────────────────
function ElasticBoundary({ side, mousePos, windowSize }: { side: "agency" | "academy" | null, mousePos: { x: number, y: number }, windowSize: { w: number, h: number } }) {
  const targetX = side === "agency" ? 0.58 * windowSize.w : side === "academy" ? 0.42 * windowSize.w : 0.5 * windowSize.w;
  const springX = useSpring(targetX, { stiffness: 120, damping: 18, mass: 0.8 });
  
  useEffect(() => {
    springX.set(targetX);
  }, [targetX, springX]);

  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    let currentCtrlX = targetX;

    const update = () => {
      const baseX = springX.get();
      
      // Calculate tension/pull based on mouse proximity
      const distX = mousePos.x - baseX;
      const distY = Math.abs(mousePos.y - windowSize.h / 2);
      
      let pull = 0;
      // If mouse is near the boundary, it pulls the string
      if (Math.abs(distX) < windowSize.w * 0.15) {
        // Tension increases as mouse gets closer to center vertically too, but mostly horizontally
        const force = Math.max(0, 1 - Math.abs(distX) / (windowSize.w * 0.15));
        pull = distX * force * 0.7; // The string bends towards the mouse
      }

      // Smoothly interpolate the control point X
      currentCtrlX += (baseX + pull - currentCtrlX) * 0.15;

      if (pathRef.current) {
        // Draw quadratic bezier: Start at top baseX, control point at currentCtrlX & mouse.y, end at bottom baseX
        // To make it look like a real string attached at top and bottom, the control point bends the middle.
        const my = Math.max(100, Math.min(windowSize.h - 100, mousePos.y));
        const d = `M ${baseX} 0 Q ${currentCtrlX} ${my} ${baseX} ${windowSize.h}`;
        pathRef.current.setAttribute("d", d);
      }

      if (glowRef.current) {
        // The glow pill follows the curve
        const t = mousePos.y / windowSize.h;
        // Approximation of bezier X at time t
        const invT = 1 - t;
        const pillX = (invT * invT * baseX) + (2 * invT * t * currentCtrlX) + (t * t * baseX);
        glowRef.current.style.transform = `translate(${pillX}px, ${mousePos.y}px) translate(-50%, -50%)`;
      }

      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [mousePos, springX, targetX, windowSize]);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
      {/* Dynamic Drop Shadow for the fluid string */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: "drop-shadow(0px 0px 10px rgba(200, 180, 120, 0.4))" }}>
        <path ref={pathRef} fill="none" stroke="rgba(255, 240, 200, 0.25)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      
      {/* Glowing pill attached to the elastic string */}
      <div 
        ref={glowRef}
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          width: "12px", height: "60px",
          background: "rgba(255, 240, 200, 0.2)", 
          border: "1px solid rgba(255, 230, 150, 0.4)",
          borderRadius: "8px",
          boxShadow: "0 0 30px 4px rgba(255, 220, 100, 0.2), inset 0 0 10px rgba(255, 255, 255, 0.5)",
          transition: "opacity 0.3s ease",
          opacity: side === null ? 0.8 : 0.2 // Glows brighter when deciding
        }} 
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Mobile Cinema Particles (Bokeh & Optical Dust)
// ─────────────────────────────────────────────
function MobileCinemaParticles({ dialProgress }: { dialProgress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const raf = useRef<number>(0)

  interface Particle {
    angle: number
    radius: number
    size: number
    speed: number
    alpha: number
    pulseSpeed: number
    pulsePhase: number
  }
  const particles = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    // Generate 45 circular orbital bokeh particles
    const list: Particle[] = []
    for (let i = 0; i < 45; i++) {
      list.push({
        angle: Math.random() * Math.PI * 2,
        radius: 80 + Math.random() * 170,
        size: 1.2 + Math.random() * 3.6,
        speed: (0.003 + Math.random() * 0.006) * (Math.random() > 0.5 ? 1 : -1),
        alpha: 0.2 + Math.random() * 0.5,
        pulseSpeed: 0.02 + Math.random() * 0.04,
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }
    particles.current = list

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      const cx = W / 2
      const cy = H / 2
      ctx.clearRect(0, 0, W, H)

      // Speed increases with user dial rotation
      const extraSpeed = (dialProgress / 100) * 0.03

      particles.current.forEach((p) => {
        p.angle += p.speed + extraSpeed
        p.pulsePhase += p.pulseSpeed
        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulsePhase))

        const x = cx + Math.cos(p.angle) * p.radius
        const y = cy + Math.sin(p.angle) * (p.radius * 0.92)

        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)

        if (dialProgress < -10) {
          // Academy: Warm gold/amber glowing dust
          const blend = Math.min(1, Math.abs(dialProgress) / 70)
          ctx.fillStyle = `rgba(245, 158, 11, ${currentAlpha * (0.8 + blend * 0.6)})`
          ctx.shadowColor = "rgba(217, 119, 6, 0.9)"
          ctx.shadowBlur = p.size * 3.5
        } else if (dialProgress > 10) {
          // Agency: Electric cyan/violet photons
          const blend = Math.min(1, dialProgress / 70)
          ctx.fillStyle = `rgba(6, 182, 212, ${currentAlpha * (0.8 + blend * 0.6)})`
          ctx.shadowColor = "rgba(139, 92, 246, 0.9)"
          ctx.shadowBlur = p.size * 3.5
        } else {
          // Neutral: Luminescent silver-white optical bokeh
          ctx.fillStyle = `rgba(220, 235, 255, ${currentAlpha * 0.65})`
          ctx.shadowColor = "rgba(255, 255, 255, 0.5)"
          ctx.shadowBlur = p.size * 2
        }

        ctx.fill()
        ctx.shadowBlur = 0
      })

      raf.current = requestAnimationFrame(draw)
    }

    raf.current = requestAnimationFrame(draw)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
      window.removeEventListener("resize", resize)
    }
  }, [dialProgress])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-20" />
}

// ─────────────────────────────────────────────
// Optical Aperture Breathing Halo Glow
// ─────────────────────────────────────────────
function OpticalApertureHalo({ dialProgress }: { dialProgress: number }) {
  const isAgency = dialProgress > 15
  const isAcademy = dialProgress < -15

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-15">
      {/* Outer Breathing Radial Glow */}
      <motion.div
        animate={{
          scale: [0.94, 1.06, 0.94],
          opacity: isAgency || isAcademy ? [0.65, 0.95, 0.65] : [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          width: "390px",
          height: "390px",
          borderRadius: "50%",
          filter: "blur(40px)",
          background: isAgency
            ? "radial-gradient(circle, rgba(6,182,212,0.4) 0%, rgba(99,102,241,0.25) 50%, transparent 70%)"
            : isAcademy
            ? "radial-gradient(circle, rgba(245,158,11,0.45) 0%, rgba(217,119,6,0.25) 50%, transparent 70%)"
            : "radial-gradient(circle, rgba(147,197,253,0.18) 0%, rgba(139,92,246,0.1) 50%, transparent 70%)",
          transition: "background 0.3s ease",
        }}
      />

      {/* Inner Concentric Laser Rim Glow */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [0.98, 1.02, 0.98],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{
          width: "310px",
          height: "310px",
          borderRadius: "50%",
          border: isAgency
            ? "1px solid rgba(6,182,212,0.4)"
            : isAcademy
            ? "1px solid rgba(245,158,11,0.45)"
            : "1px solid rgba(255,255,255,0.08)",
          boxShadow: isAgency
            ? "0 0 25px rgba(6,182,212,0.35), inset 0 0 15px rgba(139,92,246,0.2)"
            : isAcademy
            ? "0 0 25px rgba(245,158,11,0.4), inset 0 0 15px rgba(217,119,6,0.25)"
            : "0 0 15px rgba(255,255,255,0.05)",
          transition: "all 0.3s ease",
        }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────
// Anamorphic Optical Laser Flare Streak
// ─────────────────────────────────────────────
function AnamorphicLaserStreak({ dialProgress }: { dialProgress: number }) {
  const isVisible = Math.abs(dialProgress) > 35
  const isAgency = dialProgress > 0

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0, scaleX: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute inset-0 pointer-events-none flex items-center justify-center z-45 overflow-hidden"
        >
          {/* Razor-thin horizontal beam */}
          <div
            className="w-[120vw] h-[1.5px] relative"
            style={{
              background: isAgency
                ? "linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.8) 25%, #ffffff 50%, rgba(139,92,246,0.8) 75%, transparent 100%)"
                : "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.85) 25%, #ffffff 50%, rgba(217,119,6,0.85) 75%, transparent 100%)",
              boxShadow: isAgency
                ? "0 0 16px 2px rgba(6,182,212,0.9), 0 0 30px 4px rgba(139,92,246,0.6)"
                : "0 0 16px 2px rgba(245,158,11,0.9), 0 0 30px 4px rgba(217,119,6,0.6)",
            }}
          />

          {/* Central chromatic glint flash */}
          <motion.div
            animate={{
              scale: [0.8, 1.3, 0.8],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-6 h-6 rounded-full"
            style={{
              background: isAgency
                ? "radial-gradient(circle, #ffffff 0%, rgba(6,182,212,0.9) 40%, transparent 70%)"
                : "radial-gradient(circle, #ffffff 0%, rgba(245,158,11,0.9) 40%, transparent 70%)",
              filter: "blur(1px)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────
// MAIN LANDING
// ─────────────────────────────────────────────
export default function SplitReality() {
  const router = useRouter()
  const [side, setSide] = useState<"agency" | "academy" | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [navVisible, setNavVisible] = useState(false)
  const [transitioning, setTransitioning] = useState<"agency" | "academy" | null>(null)
  const [easterEgg, setEasterEgg] = useState<"blueprint" | "sketch" | "print" | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const hasInteracted = useRef(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [dialProgress, setDialProgress] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [idleAngle, setIdleAngle] = useState(0)
  const dialRef = useRef<HTMLDivElement>(null)
  const isDraggingDial = useRef(false)
  const startAngleRef = useRef(0)
  const startRotationRef = useRef(0)
  const lastTickRef = useRef(0)

  // Subtle continuous auto-gliding micro-rotation when idle
  useEffect(() => {
    if (!isMobile) return
    let rafId: number
    const tick = () => {
      if (!isDraggingDial.current && Math.abs(dialProgress) < 1) {
        setIdleAngle((prev) => (prev + 0.16) % 360)
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isMobile, dialProgress])

  const getAngle = (clientX: number, clientY: number, rect: DOMRect) => {
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const x = clientX - centerX
    const y = clientY - centerY
    return Math.atan2(y, x) * (180 / Math.PI)
  }

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!dialRef.current) return
    isDraggingDial.current = true
    const rect = dialRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const angle = getAngle(clientX, clientY, rect)
    startAngleRef.current = angle
    startRotationRef.current = rotation
  }

  const handleTouchMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isDraggingDial.current || !dialRef.current) return
    const rect = dialRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const currentAngle = getAngle(clientX, clientY, rect)
    
    let angleDiff = currentAngle - startAngleRef.current
    if (angleDiff > 180) angleDiff -= 360
    if (angleDiff < -180) angleDiff += 360
    
    const newRotation = Math.max(-85, Math.min(85, startRotationRef.current + angleDiff))
    setRotation(newRotation)
    setDialProgress((newRotation / 80) * 100)
    
    // Haptic tick feedback on dial rotation
    const currentTick = Math.round(newRotation / 15)
    if (currentTick !== lastTickRef.current) {
      lastTickRef.current = currentTick
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10)
      }
    }
  }, [rotation])

  const handleTouchEnd = useCallback(() => {
    if (!isDraggingDial.current) return
    isDraggingDial.current = false
    
    const finalProgress = (rotation / 80) * 100
    if (Math.abs(finalProgress) < 85) {
      let current = rotation
      const step = () => {
        current = current * 0.8
        if (Math.abs(current) < 0.5) {
          setRotation(0)
          setDialProgress(0)
        } else {
          setRotation(current)
          setDialProgress((current / 80) * 100)
          requestAnimationFrame(step)
        }
      }
      requestAnimationFrame(step)
    } else {
      if (finalProgress >= 85) {
        setRotation(80)
        setDialProgress(100)
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([30, 50, 30])
        }
        setTimeout(() => navigate("agency", "https://agency.grekam.in/"), 300)
      } else {
        setRotation(-80)
        setDialProgress(-100)
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([30, 50, 30])
        }
        setTimeout(() => navigate("academy", "https://academy.grekam.in/"), 300)
      }
    }
  }, [rotation])

  useEffect(() => {
    if (!isMobile) return
    const onMove = (e: TouchEvent | MouseEvent) => handleTouchMove(e)
    const onEnd = () => handleTouchEnd()
    
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onEnd)
    
    setNavVisible(true)
    
    return () => {
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onEnd)
    }
  }, [isMobile, handleTouchMove, handleTouchEnd])

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
    setTimeout(() => { 
      if (href.startsWith("http")) {
        window.location.href = href;
      } else {
        router.push(href);
      }
    }, 1200)
  }

  const blueprintMode = easterEgg === "blueprint"
  const sketchMode = easterEgg === "sketch"
  const printMode = easterEgg === "print"

  // Show a premium loading skeleton until client JS has hydrated
  // This prevents the broken partial render caused by isMobile being wrong on SSR
  if (!isClient) return (
    <div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center select-none">
      <div className="flex flex-col items-center gap-8">
        {/* Animated orb */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(200,210,255,0.15), rgba(0,0,0,0.6))',
          boxShadow: '0 0 40px 8px rgba(200,210,255,0.08)',
          animation: 'pulse 2s ease-in-out infinite'
        }} />
        <div style={{
          fontFamily: 'var(--font-barlow, system-ui), sans-serif',
          fontSize: '11px',
          letterSpacing: '0.4em',
          color: 'rgba(255,255,255,0.2)',
          textTransform: 'uppercase',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          Entering Grekam OS
        </div>
      </div>
    </div>
  )

  return (
    <div
      className="h-screen w-full overflow-hidden relative select-none flex flex-col md:flex-row"
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

      
      
      {isMobile ? (
        <div className="relative w-full h-full overflow-hidden bg-[#050505] flex flex-col items-center justify-center">
          {/* Academy Ruled Paper Background */}
          <div 
            className="absolute inset-0 transition-opacity duration-150 ease-out" 
            style={{ 
              opacity: dialProgress < 0 ? Math.min(1, Math.abs(dialProgress) / 80) : 0,
              backgroundColor: "#f0e8d4", 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E"), repeating-linear-gradient(transparent, transparent 27px, rgba(180,200,220,0.18) 27px, rgba(180,200,220,0.18) 28px)` 
            }} 
          />

          {/* Agency Dark Grid Background */}
          <div 
            className="absolute inset-0 transition-opacity duration-150 ease-out" 
            style={{ 
              opacity: dialProgress > 0 ? Math.min(1, dialProgress / 80) : 0,
              background: "linear-gradient(145deg, #111114 0%, #161820 40%, #0a0a0a 100%)" 
            }} 
          />
          <div 
            className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-150" 
            style={{ 
              opacity: dialProgress > 0 ? Math.min(0.4, (dialProgress / 80) * 0.4) : 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")` 
            }} 
          />
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-150" 
            style={{ 
              opacity: dialProgress > 0 ? Math.min(1, dialProgress / 80) : 0,
              backgroundImage: `linear-gradient(rgba(200,210,240,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,210,240,0.03) 1px, transparent 1px)`, 
              backgroundSize: "48px 48px" 
            }} 
          />

          {/* Floating Cinema Bokeh Particles */}
          <MobileCinemaParticles dialProgress={dialProgress} />

          {/* Optical Aperture Breathing Halo Glow */}
          <OpticalApertureHalo dialProgress={dialProgress} />

          {/* Anamorphic Laser Flare Streak on Lock */}
          <AnamorphicLaserStreak dialProgress={dialProgress} />

          {/* DSLR Meta parameters with Live HUD Status */}
          <div className="absolute top-24 text-[9px] font-mono tracking-[0.35em] text-white/40 flex items-center gap-4 uppercase z-40">
            <span className="px-2 py-0.5 rounded border border-white/10 bg-white/5 font-bold transition-all">
              {dialProgress > 15 ? "F / 1.2" : dialProgress < -15 ? "F / 2.8" : "F / 1.4"}
            </span>
            <span>50MM</span>
            <span className={`font-bold flex items-center gap-1.5 transition-colors duration-200 ${
              dialProgress > 15 
                ? "text-cyan-400" 
                : dialProgress < -15 
                ? "text-amber-400" 
                : "text-white/70"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                dialProgress > 15 ? "bg-cyan-400 animate-ping" : dialProgress < -15 ? "bg-amber-400 animate-ping" : "bg-emerald-400"
              }`} />
              {dialProgress > 50 
                ? "AGENCY LOCKING" 
                : dialProgress < -50 
                ? "ACADEMY LOCKING" 
                : "AF-S FOCUS"}
            </span>
          </div>

          {/* Center Circular DSLR Dial Structure */}
          <div className="relative w-80 h-80 flex items-center justify-center z-30">
            {/* Rotating Focus Grip Ring with Idle Micro-Rotation */}
            <div 
              ref={dialRef}
              onMouseDown={handleTouchStart}
              onTouchStart={handleTouchStart}
              style={{ transform: `rotate(${rotation !== 0 ? rotation : idleAngle}deg)` }}
              className="absolute w-80 h-80 rounded-full border-[12px] border-neutral-900 bg-transparent flex items-center justify-center cursor-grab active:cursor-grabbing z-40 select-none shadow-[0_0_35px_rgba(0,0,0,0.65)] touch-none"
            >
              <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none" />
              {/* Ridges around the DSLR ring */}
              {Array.from({ length: 36 }).map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-[2px] h-3 bg-white/20"
                  style={{ 
                    transform: `rotate(${i * 10}deg) translateY(-144px)` 
                  }}
                />
              ))}

              {/* Circular Bold Text: "ROTATE FOCUS RING" */}
              <svg viewBox="0 0 100 100" className="absolute w-full h-full pointer-events-none select-none p-[6px]">
                <path id="textPath" d="M 50,50 m -34,0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0" fill="none" />
                <text className="fill-white/60 font-black text-[3.8px] tracking-[0.27em] uppercase font-mono">
                  <textPath href="#textPath" startOffset="50%" textAnchor="middle">
                    ROTATE FOCUS RING • ROTATE FOCUS RING •
                  </textPath>
                </text>
              </svg>
              
              {/* Colorful Gradient Glow focus indicator dot */}
              <div 
                className="absolute w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-400 via-violet-500 to-amber-400 shadow-[0_0_14px_rgba(139,92,246,0.9)]"
                style={{ transform: 'translateY(-144px)' }}
              />
            </div>

            {/* Viewfinder (Inner Cylindrical Display) */}
            <div 
              className="w-[260px] h-[260px] rounded-full border relative flex flex-col items-center justify-center overflow-hidden backdrop-blur-md z-30 transition-all duration-200"
              style={{
                backgroundColor: dialProgress < 0 
                  ? `rgba(255, 255, 255, ${Math.min(0.98, Math.abs(dialProgress) / 40)})` 
                  : "rgba(10, 10, 10, 0.9)",
                borderColor: dialProgress < 0 
                  ? `rgba(0, 0, 0, ${Math.min(0.12, Math.abs(dialProgress) / 40)})` 
                  : "rgba(255, 255, 255, 0.05)"
              }}
            >
              {/* Corner framing brackets with autofocus contraction */}
              <div 
                className="absolute top-6 left-6 w-4 h-4 border-t border-l z-35 transition-all duration-200" 
                style={{ 
                  borderColor: dialProgress < 0 ? "rgba(0, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.15)",
                  transform: `translate(${Math.min(3, Math.abs(dialProgress) / 25)}px, ${Math.min(3, Math.abs(dialProgress) / 25)}px)`
                }}
              />
              <div 
                className="absolute top-6 right-6 w-4 h-4 border-t border-r z-35 transition-all duration-200" 
                style={{ 
                  borderColor: dialProgress < 0 ? "rgba(0, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.15)",
                  transform: `translate(-${Math.min(3, Math.abs(dialProgress) / 25)}px, ${Math.min(3, Math.abs(dialProgress) / 25)}px)`
                }}
              />
              <div 
                className="absolute bottom-6 left-6 w-4 h-4 border-b border-l z-35 transition-all duration-200" 
                style={{ 
                  borderColor: dialProgress < 0 ? "rgba(0, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.15)",
                  transform: `translate(${Math.min(3, Math.abs(dialProgress) / 25)}px, -${Math.min(3, Math.abs(dialProgress) / 25)}px)`
                }}
              />
              <div 
                className="absolute bottom-6 right-6 w-4 h-4 border-b border-r z-35 transition-all duration-200" 
                style={{ 
                  borderColor: dialProgress < 0 ? "rgba(0, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.15)",
                  transform: `translate(-${Math.min(3, Math.abs(dialProgress) / 25)}px, -${Math.min(3, Math.abs(dialProgress) / 25)}px)`
                }}
              />

              {/* Central crosshair with optical glow */}
              <div 
                className="absolute w-3 h-3 border rounded-full flex items-center justify-center z-35 transition-all duration-200"
                style={{ borderColor: dialProgress < 0 ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.08)" }}
              >
                <div 
                  className="w-px h-2 absolute transition-colors duration-200" 
                  style={{ backgroundColor: dialProgress < 0 ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.15)" }}
                />
                <div 
                  className="h-px w-2 absolute transition-colors duration-200" 
                  style={{ backgroundColor: dialProgress < 0 ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.15)" }}
                />
              </div>

              {/* Subject Image (Flower) - blurs out dynamically on rotation */}
              <div 
                className="absolute inset-0 transition-all duration-75 ease-out select-none pointer-events-none"
                style={{
                  filter: `blur(${Math.min(15, Math.abs(rotation) / 4)}px)`,
                  opacity: Math.max(0.08, 1 - Math.abs(rotation) / 60),
                  transform: `scale(${1 - Math.abs(rotation) / 350})`
                }}
              >
                <Image 
                  src="/flower.png" 
                  alt="Focus Subject" 
                  fill 
                  className="object-cover" 
                  priority
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>

              {/* Viewfinder Content overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-32">
                <AnimatePresence mode="wait">
                  {Math.abs(dialProgress) <= 15 ? (
                    <motion.div 
                      key="neutral"
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="text-center space-y-1 bg-black/45 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/5"
                    >
                      <div className="text-[8px] font-mono tracking-[0.35em] text-white/50 uppercase">Standby Focus</div>
                      <div className="text-[10px] font-bold tracking-[0.15em] text-white/90 uppercase animate-pulse">Subject Locked</div>
                    </motion.div>
                  ) : dialProgress > 15 ? (
                    <motion.div 
                      key="agency"
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="text-center px-4 flex flex-col items-center justify-center"
                      style={{ filter: `blur(${dialProgress > 15 ? Math.max(0, 10 - ((dialProgress - 15) / 70) * 10) : 10}px)` }}
                    >
                      <span className="text-[2.6rem] font-black tracking-[0.05em] text-white leading-none uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]" style={{ fontFamily: "var(--font-barlow, system-ui), sans-serif" }}>
                        AGENCY
                      </span>
                      <div className="text-[8px] font-mono tracking-[0.3em] text-white/60 uppercase mt-2">Grekam Visuals</div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="academy"
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="text-center px-4 flex flex-col items-center justify-center"
                      style={{ filter: `blur(${dialProgress < -15 ? Math.max(0, 10 - ((Math.abs(dialProgress) - 15) / 70) * 10) : 10}px)` }}
                    >
                      <span className="text-[2.6rem] font-black tracking-[0.05em] text-black leading-none uppercase" style={{ fontFamily: "var(--font-barlow, system-ui), sans-serif" }}>
                        ACADEMY
                      </span>
                      <div className="text-[8px] font-mono tracking-[0.3em] text-black/60 uppercase mt-2">Master the Craft</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Indicator text at the bottom */}
          <div className="absolute bottom-28 text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase z-40">
            {Math.abs(dialProgress) > 80 ? "Release focus lock" : "Rotate lens ring left or right"}
          </div>
        </div>
      ) : (
        <>
          <motion.div
        className="relative overflow-hidden"
        animate={{ 
          width: isMobile ? "100%" : (isAgency ? "58%" : isAcademy ? "42%" : "50%"),
          height: "100%"
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ 
          zIndex: isAgency ? 20 : 10,
          cursor: `url('/cursor-agency.svg') 16 16, auto`
        }}
        onClick={() => !isMobile && setSide("agency")}
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(145deg, #111114 0%, #161820 40%, #0a0a0a 100%)" }} />
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")` }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(200,210,240,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,210,240,0.03) 1px, transparent 1px)`, backgroundSize: "48px 48px", opacity: isAgency ? 1 : 0.4, transition: "opacity 0.8s ease" }} />
        <AgencyCanvas active={isAgency} mx={mousePos.x} my={mousePos.y} />
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{ background: "radial-gradient(ellipse at top right, rgba(220,210,255,0.05) 0%, transparent 70%)", opacity: isAgency ? 1 : 0.3, transition: "opacity 0.8s ease" }} />

        {/* Split-Text Morphing Typography (Agency Side) */}
        <div className="absolute top-0 left-0 h-full w-[100vw] pointer-events-none flex items-center justify-center z-[2] select-none overflow-hidden">
          <span 
            className="font-black text-[18vw] uppercase leading-none tracking-[0.05em] transition-all duration-700 ease-[0.16,1,0.3,1] select-none"
            style={{ 
              fontFamily: "var(--font-barlow, system-ui), sans-serif",
              letterSpacing: isAgency ? "0.08em" : "0.02em",
              color: "rgba(255, 255, 255, 0.08)"
            }}
          >
            GREKAM
          </span>
        </div>

        <button
          className="absolute inset-0 flex flex-col justify-between p-8 md:p-14 text-left z-10"
          onClick={() => navigate("agency", "https://agency.grekam.in/")}
          style={{ cursor: `url('/cursor-agency.svg') 16 16, auto` }}
        >
          <div style={{ opacity: isAgency ? 1 : 0.35, transition: "opacity 0.6s ease" }}>
            <div className="text-[9px] font-mono tracking-[0.4em] text-white/25 uppercase mb-1">01 / AGENCY</div>
            <div className="w-12 h-px bg-white/20" />
          </div>

          <div>
            <motion.div animate={{ filter: isAgency ? "blur(0px)" : "blur(2px)", opacity: isAgency ? 1 : 0.3 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-4">
              <Image src="/visuals-logo.png" alt="Grekam Visuals" width={360} height={120} className="object-contain" style={{ filter: isAgency ? "none" : "brightness(0.6)", transition: "filter 0.6s ease" }} priority />
              <div className="overflow-hidden mt-4">
                <motion.h2 className="font-black uppercase leading-none"
                  style={{
                    fontFamily: "var(--font-barlow, system-ui), sans-serif",
                    fontSize: "clamp(2rem, 5vw, 6.5rem)",
                    color: isAgency ? "#ffffff" : "rgba(255,255,255,0.25)",
                    letterSpacing: isAgency ? "14px" : "0px",
                    transition: "color 0.6s ease, letter-spacing 0.9s cubic-bezier(0.16,1,0.3,1)",
                  }}
                >
                  WE BUILD<br />DIGITAL<br />EXPERIENCES
                </motion.h2>
              </div>
            </motion.div>
            <AnimatePresence>
              {isAgency && (
                <motion.div key="ui-lines" className="mt-8 space-y-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <div className="flex gap-3 items-center"><div className="w-2 h-2 rounded-full bg-white/30" /><div className="h-px flex-1 bg-white/10" /><div className="text-[8px] font-mono text-white/20 tracking-widest">STRATEGY</div></div>
                  <div className="flex gap-3 items-center"><div className="w-2 h-2 rounded-full bg-white/20" /><div className="h-px flex-1 bg-white/08" /><div className="text-[8px] font-mono text-white/15 tracking-widest">DESIGN</div></div>
                  <div className="flex gap-3 items-center"><div className="w-2 h-2 rounded-full bg-white/15" /><div className="h-px flex-1 bg-white/06" /><div className="text-[8px] font-mono text-white/12 tracking-widest">TECHNOLOGY</div></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div className="flex items-center gap-4 mb-0" animate={{ opacity: isAgency ? 1 : 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="px-6 py-3 border border-white/20 text-[10px] font-bold tracking-[0.3em] uppercase text-white/70 bg-white/5 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300">
              Enter Agency
            </div>
            <div className="text-white/30 text-xs font-mono">→</div>
          </motion.div>
        </button>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(14,15,20,0.45)", opacity: isAcademy ? 1 : 0, transition: "opacity 0.7s ease" }} />
      </motion.div>

      <ElasticBoundary side={side} mousePos={mousePos} windowSize={{ w: typeof window !== 'undefined' ? window.innerWidth : 1000, h: typeof window !== 'undefined' ? window.innerHeight : 1000 }} />
          <motion.div
        className="relative overflow-hidden"
        animate={{ 
          width: isMobile ? "100%" : (isAcademy ? "58%" : isAgency ? "42%" : "50%"),
          height: isMobile ? "100%" : "100%"
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ 
          zIndex: isAcademy ? 20 : 10,
          cursor: `url('/cursor-academy.svg') 0 32, auto`
        }}
        onClick={() => handleMobileTouch("academy")}
      >
        <div className="absolute inset-0" style={{ backgroundColor: "#f0e8d4", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E"), repeating-linear-gradient(transparent, transparent 27px, rgba(180,200,220,0.18) 27px, rgba(180,200,220,0.18) 28px)` }} />
        <div className="absolute top-0 left-8 md:left-16 w-px h-full bg-red-300/20 pointer-events-none" />
        <AcademyCanvas active={isAcademy} />
        {!isMobile && <SketchAnnotations active={isAcademy} />}

        {/* Split-Text Morphing Typography (Academy Side) */}
        <div className="absolute top-0 right-0 h-full w-[100vw] pointer-events-none flex items-center justify-center z-[2] select-none overflow-hidden">
          <span 
            className="font-black text-[18vw] uppercase leading-none tracking-[0.05em] transition-all duration-700 ease-[0.16,1,0.3,1] select-none"
            style={{ 
              fontFamily: "var(--font-serif, Georgia), serif", 
              filter: "url(#rough-paper)",
              letterSpacing: isAcademy ? "0.08em" : "0.02em",
              color: "rgba(42, 26, 8, 0.12)"
            }}
          >
            GREKAM
          </span>
        </div>

        <button
          className="absolute inset-0 flex flex-col justify-between pl-12 pr-6 py-8 md:pl-20 md:pr-10 md:py-14 text-left z-10"
          onClick={() => isMobile ? (isAcademy ? navigate("academy", "https://academy.grekam.in/") : handleMobileTouch("academy")) : navigate("academy", "https://academy.grekam.in/")}
          style={{ cursor: `url('/cursor-academy.svg') 0 32, auto`, filter: isAcademy ? "url(#rough-paper)" : "none" }}
        >
          <motion.div animate={{ opacity: (isMobile || isAcademy) ? 1 : 0.35 }} transition={{ duration: 0.6 }}>
            <div className="text-[9px] font-mono tracking-[0.4em] text-[#8b6a3a]/60 uppercase mb-2">02 / ACADEMY</div>
            <svg width="48" height="4" viewBox="0 0 48 4"><path d="M0 2 Q12 1 24 2 Q36 3 48 2" stroke="rgba(80,55,20,0.3)" strokeWidth="1.2" fill="none" strokeDasharray="3 1" /></svg>
          </motion.div>

          <div className="flex flex-col items-center">
            <motion.div animate={{ filter: (isMobile || isAcademy) ? "none" : "blur(1.5px)", opacity: (isMobile || isAcademy) ? 1 : 0.25 }} transition={{ duration: 0.7 }} className="flex flex-col items-center text-center gap-4">
              <div className={isMobile ? "w-[220px]" : "w-[320px]"}>
                <Image src="/academy-logo.png" alt="Grekam Academy" width={320} height={120} className="object-contain w-full h-auto" style={{ filter: isAcademy ? "brightness(0) url(#rough-paper) contrast(1.2)" : "brightness(0)", transition: "filter 0.6s ease", transform: "rotate(-1deg)" }} priority />
              </div>
              <h2 style={{ fontFamily: "var(--font-barlow, system-ui), sans-serif", fontSize: "clamp(2rem, 5vw, 6.5rem)", color: isAcademy ? "#2a1a08" : "rgba(42,26,8,0.25)", letterSpacing: "-0.02em", lineHeight: 0.9, fontWeight: 900, transition: "color 0.6s ease" }}>MASTER<br />THE CRAFT.</h2>
              <div className="mt-2 text-xs font-mono" style={{ color: "#8b6a3a", opacity: isAcademy ? 0.7 : 0 }}>↓ start here</div>
            </motion.div>
            <AnimatePresence>
              {isAcademy && (
                <motion.div key="sketch-elements" className="mt-4 md:mt-6 space-y-2 flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
                  {["Design Thinking", "Creative Direction", "Brand Identity"].map((item, i) => (
                    <div key={item} className="flex items-center justify-center gap-2" style={{ transform: `rotate(${(i - 1) * 0.5}deg)`, filter: "url(#rough-paper)" }}>
                      <svg width="16" height="8" viewBox="0 0 16 8"><path d="M0 4 Q8 2 16 4" stroke="rgba(80,55,20,0.8)" strokeWidth="1.5" fill="none" /></svg>
                      <span className="text-[12px] font-mono font-bold text-[#2a1a08]">{item}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div className="mb-4 md:mb-0" animate={{ opacity: isAcademy ? 1 : 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="inline-flex items-center gap-3 px-5 py-3" style={{ background: "rgba(255,220,100,0.3)", border: "1px solid rgba(140,100,40,0.2)", transform: "rotate(-0.5deg)", filter: "url(#rough-paper)" }}>
              <span className="text-[10px] font-mono font-bold tracking-[0.25em] uppercase text-[#3a2808]">Enter Academy</span>
              <span className="text-[#8b6a3a]">↗</span>
            </div>
          </motion.div>
        </button>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(242,236,220,0.5)", filter: "grayscale(0.6)", opacity: isAgency ? 0.7 : 0, transition: "opacity 0.7s ease" }} />
      </motion.div>
        </>
      )}

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
            <Link href="/auth/login" className="pointer-events-auto text-[9px] font-bold tracking-[0.3em] uppercase px-5 py-2"
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
