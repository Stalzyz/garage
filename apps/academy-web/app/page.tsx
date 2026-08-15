"use client";

import { useState, useEffect } from "react";
import DesktopSandbox from "../components/landing/DesktopSandbox";
import MobileStories from "../components/landing/MobileStories";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if view width matches standard mobile/tablet breakpoint
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  if (!mounted) {
    // Elegant static black loading container to prevent hydration flashes
    return <div className="min-h-screen w-full bg-[#050505]" />;
  }

  return isMobile ? <MobileStories /> : <DesktopSandbox />;
}
