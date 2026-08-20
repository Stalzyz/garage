"use client"

import { useEffect, useRef } from "react"
import Lenis from "lenis"
import { usePathname } from "next/navigation"

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    // Disable Lenis inside dashboard, academy, portal, or on touch/mobile devices
    const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768)
    const isExcludedRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/academy') || pathname?.startsWith('/portal')

    if (isMobile || isExcludedRoute) {
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }
      return
    }

    try {
      if (!lenisRef.current) {
        const lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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
        lenisRef.current.scrollTo(0, { immediate: true })
      }
    } catch (err) {
      console.warn("Lenis smooth scroll failed to initialize:", err)
    }
  }, [pathname])

  return <>{children}</>
}
