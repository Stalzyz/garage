"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Start Over", href: "/" },
    { name: "Courses", href: "#courses" },
    { name: "Methodology", href: "#methodology" },
    { name: "Placements", href: "#placements" },
    { name: "Community", href: "#community" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled ? "bg-[#020202]/90 backdrop-blur-lg border-b border-white/5 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 z-50">
          <Image
            src="/academy-logo.png"
            alt="Grekam Design Academy"
            width={160}
            height={48}
            className="h-10 w-auto md:h-12"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium hover:text-[#49abc9] transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-sm font-medium hover:text-[#49abc9] transition-colors px-4 py-2"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-gradient-academy text-white px-6 py-2 rounded-full shadow-lg shadow-[#49abc9]/20 hover:shadow-[#49abc9]/40 transition-all hover:-translate-y-0.5"
          >
            Join Now
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden z-50 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-0 left-0 w-full h-screen bg-background flex flex-col items-center justify-center gap-8 md:hidden glassmorphism"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-bold hover:text-[#49abc9] transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col items-center gap-4 mt-8 w-full px-8">
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-lg font-medium border border-[#49abc9] text-[#49abc9] rounded-full py-3"
            >
              Log In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-lg font-medium bg-gradient-academy text-white rounded-full py-3 shadow-lg shadow-[#49abc9]/30"
            >
              Join Now
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}
