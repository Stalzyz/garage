"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Header({ theme = "light" }: { theme?: "light" | "dark" }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "The Problem", href: "/#act-1" },
    { name: "The Twist", href: "/#act-2" },
    { name: "The Evidence", href: "/#act-3" },
    { name: "The Offer", href: "/#act-4" },
    { name: "The Decision", href: "/#act-5" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glassmorphism py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 z-50">
          <Image
            src="/academy-logo.png"
            alt="Grekam Design Academy"
            width={160}
            height={48}
            className={`h-10 w-auto md:h-12 transition-all ${
              scrolled ? "invert brightness-0" : theme === "dark" ? "" : "invert brightness-0"
            }`}
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-xs font-mono uppercase tracking-wider transition-colors ${
                scrolled
                  ? "text-black/60 hover:text-black"
                  : theme === "dark"
                  ? "text-white/60 hover:text-white"
                  : "text-black/60 hover:text-black"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/auth/login"
            className={`text-xs font-mono uppercase tracking-wider transition-colors px-4 py-2 ${
              scrolled
                ? "text-black/60 hover:text-black"
                : theme === "dark"
                ? "text-white/60 hover:text-white"
                : "text-black/60 hover:text-black"
            }`}
          >
            Log In
          </Link>
          <Link
            href="/auth/login"
            className={`text-xs font-mono uppercase tracking-wider px-6 py-2 border transition-all ${
              scrolled
                ? "bg-black text-white border-black hover:bg-white hover:text-black"
                : theme === "dark"
                ? "bg-white text-black border-white hover:bg-black hover:text-white"
                : "bg-black text-white border-black hover:bg-white hover:text-black"
            }`}
          >
            Apply Now
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className={`md:hidden z-50 transition-colors ${
            scrolled ? "text-black" : theme === "dark" ? "text-white" : "text-black"
          }`}
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
              className="text-xl font-mono uppercase tracking-wider text-black/80 hover:text-black transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col items-center gap-4 mt-8 w-full px-8">
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-sm font-mono uppercase tracking-wider border border-black text-black py-3"
            >
              Log In
            </Link>
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-sm font-mono uppercase tracking-wider bg-black text-white py-3 border border-black"
            >
              Apply Now
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}
