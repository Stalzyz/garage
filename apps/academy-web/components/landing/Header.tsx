"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

// Magnetic effect helper wrapper component
function Magnetic({ children, pull = 0.35 }: { children: React.ReactNode; pull?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * pull, y: y * pull });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}

export function Header({ theme = "light" }: { theme?: "light" | "dark" }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Courses", href: "/#courses" },
    { name: "The Method", href: "/#curriculum" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
    { name: "Enroll", href: "/#enroll" },
  ];

  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      {/* Floating Magnetic Glass Dock */}
      <div 
        className={`w-full max-w-5xl rounded-full border transition-all duration-500 flex items-center justify-between px-6 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.15)] ${
          scrolled 
            ? "bg-black/90 border-white/10 backdrop-blur-xl py-2" 
            : theme === "dark"
            ? "bg-black/80 border-white/10 backdrop-blur-lg"
            : "bg-white/80 border-black/5 backdrop-blur-lg"
        }`}
      >
        {/* Left Side: Logo */}
        <Magnetic pull={0.2}>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/academy-logo.png"
              alt="Grekam Design Academy"
              width={140}
              height={42}
              className="h-8 w-auto transition-all duration-300"
              style={{
                filter: (!scrolled && theme === "light")
                  ? "invert(63%) sepia(50%) saturate(601%) hue-rotate(152deg) brightness(88%) contrast(92%)"
                  : "none"
              }}
            />
          </Link>
        </Magnetic>

        {/* Center: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Magnetic key={link.name} pull={0.4}>
              <Link
                href={link.href}
                className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 transition-colors duration-300 ${
                  scrolled
                    ? "text-white/60 hover:text-white"
                    : theme === "dark"
                    ? "text-white/60 hover:text-white"
                    : "text-black/60 hover:text-black"
                }`}
              >
                {link.name}
              </Link>
            </Magnetic>
          ))}
        </nav>

        {/* Right Side: Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Magnetic pull={0.3}>
            <Link
              href="/auth/login"
              className={`text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 transition-colors duration-300 ${
                scrolled
                  ? "text-white/60 hover:text-white"
                  : theme === "dark"
                  ? "text-white/60 hover:text-white"
                  : "text-black/60 hover:text-black"
              }`}
            >
              Log In
            </Link>
          </Magnetic>

          <Magnetic pull={0.25}>
            <Link
              href="/contact"
              className={`text-[10px] font-mono uppercase tracking-widest px-5 py-2.5 rounded-full transition-all duration-300 ${
                scrolled
                  ? "bg-white text-black hover:bg-white/90"
                  : theme === "dark"
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-black text-white hover:bg-black/90"
              }`}
            >
              Apply Now
            </Link>
          </Magnetic>
        </div>

        {/* Mobile Toggle Pill */}
        <button
          className={`md:hidden p-2 rounded-full border transition-all duration-300 ${
            scrolled
              ? "text-white border-white/10 hover:bg-white/10"
              : theme === "dark"
              ? "text-white border-white/10 hover:bg-white/10"
              : "text-black border-black/10 hover:bg-black/5"
          }`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 w-full h-screen bg-black/95 flex flex-col items-center justify-center gap-8 md:hidden z-40"
          >
            {/* Close trigger handles */}
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-3 rounded-full border border-white/10 text-white hover:bg-white/10"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center gap-6">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-mono uppercase tracking-widest text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4 mt-12 w-full max-w-xs px-6">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-xs font-mono uppercase tracking-widest border border-white/20 text-white/80 py-4 rounded-full hover:bg-white/5 transition-all"
              >
                Log In
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-xs font-mono uppercase tracking-widest bg-white text-black py-4 rounded-full font-bold hover:bg-white/90 transition-all"
              >
                Apply Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
