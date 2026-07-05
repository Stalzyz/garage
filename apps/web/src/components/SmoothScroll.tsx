"use client"

import { useEffect, useRef } from "react"
import Lenis from "lenis"
import { usePathname } from "next/navigation"

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    // Disable Lenis inside the dashboard and academy because they use fixed 100vh layouts with inner scroll/snap areas
    if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/academy')) {
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }
      return
    }

    // Initialize Lenis if it doesn't exist
    if (!lenisRef.current) {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing for premium feel
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      })
      lenisRef.current = lenis

      let rafId: number;
      function raf(time: number) {
        lenis.raf(time)
        rafId = requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)

      return () => {
        cancelAnimationFrame(rafId)
        lenis.destroy()
        lenisRef.current = null
      }
    } else {
      // If lenis is already running, just reset scroll on route change
      lenisRef.current.scrollTo(0, { immediate: true })
    }
  }, [pathname])

  return <>{children}</>
}
