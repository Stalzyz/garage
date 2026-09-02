"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion"
import Link from "next/link"
import { X, Zap, Code2, Rocket, Palette, Fingerprint, Users, Volume2, VolumeX, TriangleAlert, Mail, Phone, MapPin, Send, ChevronDown, Orbit, CheckCircle2, CalendarDays, IndianRupee, Layers, Check, Monitor, Tablet, Smartphone, ExternalLink, RotateCw, Lock, Copy, Sparkles, Eye, Globe, GraduationCap } from "lucide-react"
import { useOrganization } from "@/context/OrganizationContext"

// --- DATA ---
type ProjectData = { 
  id: string; 
  title: string; 
  image: string; 
  url?: string; 
  category?: string; 
  techStack?: string[]; 
  description?: string; 
}
type CardData = { id: string; category: string; title: string; subtitle: string; icon?: React.ReactNode; iconName?: string; colorHex: string; isGlitch?: boolean; cta?: string; projects?: ProjectData[]; isContactForm?: boolean; isProducts?: boolean; isPortfolio?: boolean; isAcademy?: boolean; isCrm?: boolean; isHrm?: boolean; isPricing?: boolean; }

const DUMMY_PROJECTS: ProjectData[] = [
  { 
    id: 'p1', 
    title: 'Raaghas Luxury E-Commerce', 
    image: 'https://api.microlink.io/?url=https%3A%2F%2Fraaghas.in&screenshot=true&embed=screenshot.url&meta=false',
    url: 'https://raaghas.in',
    category: 'Luxury E-Commerce',
    techStack: ['Next.js 15', 'TypeScript', 'TailwindCSS', 'Razorpay'],
    description: 'Ultra-fast luxury fashion e-commerce with headless architecture and sub-800ms page transitions.'
  },
  { 
    id: 'p2', 
    title: 'Grafty WhatsApp AI Engine', 
    image: 'https://api.microlink.io/?url=https%3A%2F%2Fgrafty.pro&screenshot=true&embed=screenshot.url&meta=false',
    url: 'https://grafty.pro',
    category: 'AI Automation',
    techStack: ['Node.js', 'WhatsApp API', 'Fastify', 'PostgreSQL'],
    description: 'Proprietary WhatsApp AI automation engine for business outreach and customer support.'
  },
  { 
    id: 'p3', 
    title: 'Grekam Academy Portal', 
    image: 'https://api.microlink.io/?url=https%3A%2F%2Facademy.grekam.in&screenshot=true&embed=screenshot.url&meta=false',
    url: 'https://academy.grekam.in',
    category: 'EdTech & Learning',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    description: 'Next-generation learning portal for design and software engineering education.'
  },
]

const BRANDING_PROJECTS: ProjectData[] = [
  { 
    id: 'b1', 
    title: 'Vanguard Identity', 
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
    url: 'https://grekam.in',
    category: 'Brand Strategy',
    techStack: ['Visual Identity', 'Typography', '3D Design'],
    description: 'Comprehensive luxury brand identity and digital design guideline system.'
  },
  { 
    id: 'b2', 
    title: 'Zephyr Campaign', 
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80',
    url: 'https://academy.grekam.in',
    category: 'Visual Design',
    techStack: ['Motion Graphics', 'UI/UX', 'Campaign Assets'],
    description: 'Multi-channel digital marketing assets and high-conversion creative system.'
  },
]

// --- DEVICE PREVIEW MODAL ---
type DeviceType = 'desktop' | 'tablet' | 'mobile'

interface DevicePreviewModalProps {
  project: ProjectData | null
  onClose: () => void
}

const DevicePreviewModal: React.FC<DevicePreviewModalProps> = ({ project, onClose }) => {
  const [device, setDevice] = useState<DeviceType>('desktop')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [useProxy, setUseProxy] = useState(true)
  const [scale, setScale] = useState<number>(1)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    // 2.5s soft timeout so external heavy scripts never leave spinner hung
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [project?.id, project?.url, iframeKey, useProxy])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === '1') setDevice('desktop')
      if (e.key === '2') setDevice('tablet')
      if (e.key === '3') setDevice('mobile')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!project) return null

  const rawUrl = project.url || 'https://grekam.in'
  const isRelative = rawUrl.startsWith('/')
  const fullUrl = isRelative ? rawUrl : (rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`)
  
  // Cross-origin sites usually block direct iframes via X-Frame-Options; proxy solves this
  const iframeSrc = isRelative 
    ? fullUrl 
    : (useProxy ? `/api/preview-proxy?url=${encodeURIComponent(fullUrl)}` : fullUrl)
    
  const displayUrl = fullUrl.replace(/^https?:\/\//, '')

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReload = () => {
    setIsLoading(true)
    setHasError(false)
    setIframeKey(prev => prev + 1)
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1002] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-between p-2 md:p-5 overflow-hidden select-none pointer-events-auto"
        onClick={onClose}
      >
        {/* Top Control Bar */}
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-6xl flex items-center justify-between gap-3 py-2 px-3 md:px-5 rounded-2xl bg-[#141417]/95 border border-white/10 backdrop-blur-2xl shadow-2xl z-20 shrink-0 mb-2"
        >
          {/* Left: Project Meta */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-400">
              <Globe className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs md:text-sm font-bold text-white tracking-wide truncate">{project.title}</h4>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE DEMO
                </span>
              </div>
              <p className="text-[10px] text-white/40 truncate hidden md:block">{project.category || 'Client Showcase Website'}</p>
            </div>
          </div>

          {/* Center: Device Switcher */}
          <div className="flex items-center p-1 bg-black/70 border border-white/10 rounded-xl">
            <button
              onClick={() => { setDevice('desktop'); setScale(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
                device === 'desktop' ? 'bg-white text-black shadow-lg font-bold' : 'text-white/50 hover:text-white'
              }`}
              title="Desktop View (MacBook Pro Chassis) - Press 1"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => { setDevice('tablet'); setScale(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
                device === 'tablet' ? 'bg-white text-black shadow-lg font-bold' : 'text-white/50 hover:text-white'
              }`}
              title="Tablet View (iPad Chassis) - Press 2"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => { setDevice('mobile'); setScale(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
                device === 'mobile' ? 'bg-white text-black shadow-lg font-bold' : 'text-white/50 hover:text-white'
              }`}
              title="Mobile View (iPhone 16 Pro Chassis) - Press 3"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Proxy / Direct toggle */}
            {!isRelative && (
              <button
                onClick={() => setUseProxy(!useProxy)}
                className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-mono transition-colors border ${
                  useProxy ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-white/5 text-white/50 border-white/10'
                }`}
                title={useProxy ? 'Proxy Bypass Active (Overcoming X-Frame restrictions)' : 'Direct Mode Active'}
              >
                {useProxy ? 'Proxy: ON' : 'Direct'}
              </button>
            )}

            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium"
              title="Open website in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Open Live</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:border-rose-500/30 text-white/80 hover:text-rose-300 border border-white/10 transition-all group"
              title="Close Preview (Esc)"
            >
              <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </motion.div>

        {/* Center: Device Chassis Viewport Container */}
        <div 
          onClick={e => e.stopPropagation()}
          className="flex-1 w-full flex items-center justify-center min-h-0 relative overflow-hidden py-1"
        >
          {/* DESKTOP FRAME (MacBook Pro Styling) */}
          {device === 'desktop' && (
            <motion.div 
              key="desktop"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-6xl h-full flex flex-col rounded-2xl md:rounded-3xl border border-white/15 bg-[#121215] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95)] overflow-hidden"
            >
              {/* Browser Window Header */}
              <div className="h-10 md:h-11 px-4 bg-[#18181b] border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 w-20">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] cursor-pointer hover:opacity-80" onClick={onClose} title="Close window" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
                </div>

                {/* Simulated URL Bar */}
                <div className="flex-1 max-w-lg mx-auto flex items-center justify-between px-3 py-1 bg-black/60 border border-white/10 rounded-full text-xs text-white/60">
                  <div className="flex items-center gap-2 truncate">
                    <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="font-mono text-[11px] text-white/80 truncate">https://{displayUrl}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={handleReload} className="hover:text-white transition-colors p-1" title="Reload Frame">
                      <RotateCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={handleCopyUrl} className="hover:text-white transition-colors p-1" title="Copy URL">
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="w-20 flex justify-end items-center gap-2">
                  <span className="text-[10px] font-mono text-white/30 tracking-widest hidden md:inline">1920 × 1080</span>
                </div>
              </div>

              {/* Iframe Screen */}
              <div className="flex-1 w-full h-full relative bg-[#09090b] overflow-hidden">
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09090b] z-10">
                    <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
                    <p className="text-xs font-mono uppercase tracking-widest text-white/40 animate-pulse">Connecting to live environment...</p>
                  </div>
                )}
                {hasError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09090b] z-10 p-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                      <Globe className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-2">Live Application Gateway</h4>
                    <p className="text-xs text-white/50 max-w-sm mb-5">This client application is ready for direct browser testing.</p>
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-lg flex items-center gap-2"
                    >
                      <span>Open Live Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <iframe
                    key={iframeKey}
                    ref={iframeRef}
                    src={iframeSrc}
                    onLoad={() => setIsLoading(false)}
                    onError={() => { setHasError(true); setIsLoading(false); }}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    title={project.title}
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* TABLET (iPad Pro) FRAME */}
          {device === 'tablet' && (
            <motion.div 
              key="tablet"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-[768px] max-w-[95%] h-full flex flex-col rounded-[36px] p-3 md:p-4 bg-[#1f1f23] border-[3px] border-[#38383f] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95)] ring-1 ring-white/10"
            >
              {/* Tablet Top Bezel & Camera */}
              <div className="w-full flex items-center justify-center py-1 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-black border border-white/20" />
              </div>

              {/* Screen Area */}
              <div className="flex-1 w-full rounded-[24px] overflow-hidden relative bg-[#09090b] border border-black/50">
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09090b] z-10">
                    <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
                    <p className="text-xs font-mono uppercase tracking-widest text-white/40 animate-pulse">Loading Tablet View (1024 × 768)...</p>
                  </div>
                )}
                {hasError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09090b] z-10 p-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                      <Globe className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-2">Live Application Gateway</h4>
                    <p className="text-xs text-white/50 max-w-sm mb-5">This client application is ready for direct browser testing.</p>
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-lg flex items-center gap-2"
                    >
                      <span>Open Live Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <iframe
                    key={iframeKey}
                    ref={iframeRef}
                    src={iframeSrc}
                    onLoad={() => setIsLoading(false)}
                    onError={() => { setHasError(true); setIsLoading(false); }}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    title={project.title}
                  />
                )}
              </div>

              {/* Tablet Bottom Home Indicator */}
              <div className="w-full flex items-center justify-center py-2 shrink-0">
                <div className="w-32 h-1 bg-white/20 rounded-full" />
              </div>
            </motion.div>
          )}

          {/* MOBILE (iPhone 16 Pro) FRAME */}
          {device === 'mobile' && (
            <motion.div 
              key="mobile"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-[390px] max-w-[92%] h-full max-h-[844px] flex flex-col rounded-[50px] p-3 bg-[#18181b] border-[4px] border-[#2e2e33] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95)] ring-1 ring-white/15 relative"
            >
              {/* Screen Area */}
              <div className="flex-1 w-full rounded-[40px] overflow-hidden relative bg-[#09090b] flex flex-col">
                {/* Dynamic Island Header */}
                <div className="absolute top-2 left-0 right-0 z-20 flex justify-center pointer-events-none">
                  <div className="w-28 h-6 bg-black rounded-full flex items-center justify-between px-2.5 border border-white/10 shadow-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-blue-500/40" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>

                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09090b] z-10 px-4 text-center">
                    <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-3" />
                    <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 animate-pulse">Loading iPhone View (390 × 844)...</p>
                  </div>
                )}

                {hasError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09090b] z-10 p-6 text-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                      <Globe className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white mb-1.5">Live Application Gateway</h4>
                    <p className="text-[11px] text-white/50 max-w-[240px] mb-4">Ready for mobile browser viewing.</p>
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-lg flex items-center gap-1.5"
                    >
                      <span>Open Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <iframe
                    key={iframeKey}
                    ref={iframeRef}
                    src={iframeSrc}
                    onLoad={() => setIsLoading(false)}
                    onError={() => { setHasError(true); setIsLoading(false); }}
                    className="w-full h-full border-0 pt-7 pb-4"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    title={project.title}
                  />
                )}

                {/* iPhone Bottom Home Gesture Bar */}
                <div className="absolute bottom-1.5 left-0 right-0 z-20 flex justify-center pointer-events-none">
                  <div className="w-32 h-1 bg-white/40 rounded-full" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom Footer Info Pill */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 py-2.5 px-4 rounded-xl bg-[#141417]/90 border border-white/10 text-xs text-white/60 shrink-0 mt-2 shadow-xl"
        >
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider">Tech Stack:</span>
            {(project.techStack || ['Next.js', 'TailwindCSS', 'TypeScript', 'Framer Motion']).map((tech, i) => (
              <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/80 font-mono">
                {tech}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-white/40 hidden md:inline">
              Shortcuts: <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] text-white font-mono">1</kbd> Desktop <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] text-white font-mono">2</kbd> Tablet <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] text-white font-mono">3</kbd> Mobile <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] text-white font-mono">ESC</kbd>
            </span>
            <button 
              onClick={() => {
                onClose()
                const pricingCard = document.getElementById('card-pricing')
                if (pricingCard) pricingCard.scrollIntoView({ behavior: 'smooth' })
              }}
              className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider text-[10px] flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20"
            >
              Get a Website Like This →
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// --- PRICING DATA & CALCULATOR ---
const ADDON_LIST = [
  { id: "extra_page", label: "Extra Page", price: 2000, description: "Add additional inner pages" },
  { id: "landing_page", label: "Standard Landing Page", price: 8000, description: "Standalone conversion page" },
  { id: "adv_landing_page", label: "Advanced Landing Page", price: 20000, description: "Highly interactive landing page" },
  { id: "logo_design", label: "Logo Design", price: 6000, description: "Custom vector logo design" },
  { id: "brand_identity", label: "Brand Identity Layout", price: 20000, description: "Full color palette, fonts, assets" },
  { id: "seo_setup", label: "One-time SEO Setup", price: 10000, description: "Meta tags, sitemap, indexing" },
  { id: "monthly_seo", label: "Monthly SEO Campaign", price: 15000, description: "Monthly linkbuilding & blogs" },
  { id: "maintenance", label: "Monthly Maintenance", price: 4999, description: "Security audits, backups, minor updates" },
  { id: "content_writing", label: "Professional Content Writing", price: 2000, description: "Copywriting per page" },
  { id: "custom_animation", label: "Custom Animation Setup", price: 12000, description: "Framer motion, WebGL, scroll animations" },
  { id: "payment_gateway", label: "Payment Gateway Integration", price: 5000, description: "Razorpay, Stripe, PayPal setup" },
  { id: "whatsapp_integration", label: "Advanced WhatsApp Chatbot", price: 6000, description: "Automated support flow integration" },
  { id: "api_integration", label: "Third-party API Link", price: 7500, description: "Connect external services" },
  { id: "revision", label: "Additional Revision Round", price: 2000, description: "Extra design iteration round" },
  { id: "hosting_setup", label: "Hosting Server Setup", price: 3500, description: "AWS, Vercel, VPS setup" },
]

const WEBSITE_PACKAGES = [
  {
    id: "starter",
    title: "Starter Website",
    price: 14999,
    pages: "5–6 pages",
    idealFor: "Salons, consultants, freelancers, local businesses, tuition centres",
    features: [
      "Custom responsive design",
      "Home, About, Services, Gallery, Contact",
      "WhatsApp & contact form integration",
      "Basic SEO & SSL setup",
      "Mobile + desktop optimization"
    ]
  },
  {
    id: "business",
    title: "Business Website",
    price: 29999,
    pages: "8–12 pages",
    isRecommended: true,
    idealFor: "Growing businesses wanting strong brand presence & conversions",
    features: [
      "Everything in Starter, plus:",
      "Premium custom UI/UX",
      "Animations & interactions",
      "Advanced responsive layout",
      "Google Maps & Analytics",
      "CMS for managing content",
      "2–3 revision rounds"
    ]
  },
  {
    id: "premium",
    title: "Premium Website",
    price: 49999,
    pages: "12–20 pages",
    idealFor: "High-end brand websites, schools, agencies, manufacturers, real-estate",
    features: [
      "Fully custom UI/UX design",
      "Advanced custom animations",
      "Premium typography & visual system",
      "Custom illustrations & graphics",
      "Advanced forms & SEO setup",
      "3–4 revision rounds"
    ]
  },
  {
    id: "ecommerce",
    title: "E-commerce Website",
    price: 59999,
    pages: "Starting from ₹59,999",
    idealFor: "Online stores, retail brands, merchant catalog websites",
    features: [
      "Product catalog & categories",
      "Product search & filter system",
      "Shopping cart & checkout",
      "Stripe/Razorpay online payments",
      "Order management panel",
      "Customer accounts & coupons"
    ]
  }
]

const CUSTOM_APP_TIERS = [
  {
    title: "Basic/Medium Web App",
    range: "₹1,00,000 – ₹3,00,000",
    description: "Tailored operational dashboards, lightweight SaaS tools, basic customer/booking portals.",
    examples: ["Booking platforms", "Vendor portals", "Basic CRM/HRM dashboard"]
  },
  {
    title: "Advanced Web App",
    range: "₹3,00,000 – ₹7,00,000",
    description: "Complex workflow applications, custom ERPs, advanced HRM modules, complete SaaS portals.",
    examples: ["Custom HRM/ERP suites", "Advanced SaaS apps", "School management systems"]
  },
  {
    title: "Large-Scale Platform",
    range: "₹7,00,000+",
    description: "Enterprise scale software, large multi-tenant platforms, high-security custom systems.",
    examples: ["Global market software", "Enterprise logistics portals", "API-heavy SaaS engines"]
  }
]

const PricingCalculator = () => {
  const org = useOrganization()
  const [activeTab, setActiveTab] = useState<'websites' | 'custom' | 'calculator'>('websites')
  const [selectedBase, setSelectedBase] = useState<string>('business')
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])

  const currentBasePrice = useMemo(() => {
    if (selectedBase === 'none') return 0;
    const pkg = WEBSITE_PACKAGES.find(p => p.id === selectedBase);
    if (pkg) return pkg.price;
    if (selectedBase === 'custom_basic') return 100000;
    if (selectedBase === 'custom_adv') return 300000;
    if (selectedBase === 'custom_large') return 700000;
    return 0;
  }, [selectedBase])

  const totalEstimate = useMemo(() => {
    let sum = currentBasePrice
    selectedAddons.forEach(id => {
      const addon = ADDON_LIST.find(a => a.id === id)
      if (addon) sum += addon.price
    })
    return sum
  }, [currentBasePrice, selectedAddons])

  const handleAddonToggle = (id: string) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const baseName = useMemo(() => {
    if (selectedBase === 'none') return "None";
    const pkg = WEBSITE_PACKAGES.find(p => p.id === selectedBase);
    if (pkg) return pkg.title;
    if (selectedBase === 'custom_basic') return "Custom App (Basic)";
    if (selectedBase === 'custom_adv') return "Custom App (Advanced)";
    if (selectedBase === 'custom_large') return "Custom App (Enterprise)";
    return "";
  }, [selectedBase])

  const whatsappMessage = useMemo(() => {
    const addonNames = selectedAddons.map(id => {
      const a = ADDON_LIST.find(addon => addon.id === id);
      return a ? `- ${a.label} (₹${a.price.toLocaleString('en-IN')})` : '';
    }).filter(Boolean).join('\n');

    return `Hi Grekam Visuals,\n\nI just calculated an estimate of ₹${totalEstimate.toLocaleString('en-IN')} on your Quote Builder:\n\n*Base Package:* ${baseName} (₹${currentBasePrice.toLocaleString('en-IN')})\n${addonNames ? `\n*Add-ons Selected:*\n${addonNames}\n` : ''}\nI would love to discuss this project and review our operational requirements. Thanks!`;
  }, [totalEstimate, baseName, currentBasePrice, selectedAddons])

  const orgPhone = org?.phone || "+919876543210"
  const cleanPhone = orgPhone.replace(/[^0-9]/g, "")
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex border border-white/10 rounded-full p-1 bg-white/5 w-full max-w-lg mx-auto mb-10 shrink-0">
        {(['websites', 'custom', 'calculator'] as const).map(tab => (
           <button
             key={tab}
             type="button"
             onClick={() => setActiveTab(tab)}
             className={`flex-1 py-2 text-xs md:text-sm font-bold uppercase tracking-widest rounded-full transition-all ${activeTab === tab ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white'}`}
           >
             {tab === 'websites' ? 'Website Tiers' : tab === 'custom' ? 'Custom Apps' : 'Quote Builder'}
           </button>
        ))}
      </div>

      <div className="w-full">
        {activeTab === 'websites' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
            {WEBSITE_PACKAGES.map(pkg => (
              <div key={pkg.id} className={`p-6 rounded-3xl border flex flex-col justify-between transition-all relative ${pkg.isRecommended ? 'border-[#10b981] bg-white/[0.03] shadow-[0_0_30px_rgba(16,185,129,0.15)] ring-1 ring-[#10b981]/50' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                {pkg.isRecommended && (
                  <span className="absolute -top-3 right-6 px-3 py-1 bg-[#10b981] text-black text-[9px] font-black uppercase tracking-widest rounded-full">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="font-bold text-lg text-white mb-1 uppercase tracking-wider">{pkg.title}</h3>
                  <div className="text-2xl font-black text-white mb-2">₹{pkg.price.toLocaleString('en-IN')}{pkg.id === 'ecommerce' ? '+' : ''}</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#10b981] mb-4">{pkg.pages}</div>
                  <p className="text-xs text-white/50 mb-6 leading-relaxed min-h-[40px]">{pkg.idealFor}</p>
                  
                  <ul className="space-y-2 mb-6 border-t border-white/5 pt-4">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="text-xs text-white/70 flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#10b981] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button 
                  type="button"
                  onClick={() => { setSelectedBase(pkg.id); setActiveTab('calculator'); }}
                  className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all mt-6 ${pkg.isRecommended ? 'bg-[#10b981] text-black hover:bg-[#0fa06e]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  Select Package
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
            {CUSTOM_APP_TIERS.map((tier, i) => (
              <div key={i} className="p-6 rounded-3xl border border-white/10 bg-white/5 flex flex-col justify-between hover:border-white/20 transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#10b981] mb-4">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-white mb-1 uppercase tracking-wider">{tier.title}</h3>
                  <div className="text-xl font-black text-white mb-4">{tier.range}</div>
                  <p className="text-xs text-white/50 mb-6 leading-relaxed min-h-[50px]">{tier.description}</p>
                  
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#10b981] mb-2">Deliverables Include:</div>
                    <div className="flex flex-wrap gap-2">
                      {tier.examples.map((ex, j) => (
                        <span key={j} className="text-[9px] font-bold px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-white/70">
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button 
                  type="button"
                  onClick={() => {
                    if (i === 0) setSelectedBase('custom_basic');
                    else if (i === 1) setSelectedBase('custom_adv');
                    else setSelectedBase('custom_large');
                    setActiveTab('calculator');
                  }}
                  className="w-full py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 text-xs font-bold uppercase tracking-widest transition-all mt-6"
                >
                  Inquire Tier
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full text-left items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="p-6 rounded-3xl border border-white/10 bg-white/5">
                <h3 className="font-bold text-xs uppercase tracking-widest text-[#10b981] mb-4">1. Choose Base Package</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setSelectedBase('none')}
                    className={`p-4 rounded-xl border text-left transition-all ${selectedBase === 'none' ? 'border-[#10b981] bg-white/5' : 'border-white/5 hover:border-white/10'}`}
                  >
                    <div className="font-bold text-sm text-white">None (Add-ons Only)</div>
                    <div className="text-xs text-white/50 mt-1">Select if you just need custom tasks or logo designs</div>
                  </button>
                  
                  {WEBSITE_PACKAGES.map(pkg => (
                    <button 
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedBase(pkg.id)}
                      className={`p-4 rounded-xl border text-left transition-all relative ${selectedBase === pkg.id ? 'border-[#10b981] bg-white/5' : 'border-white/5 hover:border-white/10'}`}
                    >
                      <div className="font-bold text-sm text-white flex items-center justify-between">
                        <span>{pkg.title}</span>
                        {pkg.isRecommended && <span className="text-[8px] font-black uppercase bg-[#10b981] text-black px-1.5 py-0.5 rounded">Popular</span>}
                      </div>
                      <div className="text-xs text-[#10b981] mt-1 font-mono">₹{pkg.price.toLocaleString('en-IN')}</div>
                    </button>
                  ))}

                  <button 
                    type="button"
                    onClick={() => setSelectedBase('custom_basic')}
                    className={`p-4 rounded-xl border text-left transition-all ${selectedBase === 'custom_basic' ? 'border-[#10b981] bg-white/5' : 'border-white/5 hover:border-white/10'}`}
                  >
                    <div className="font-bold text-sm text-white">Custom App (Basic)</div>
                    <div className="text-xs text-[#10b981] mt-1 font-mono">₹1,00,000</div>
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => setSelectedBase('custom_adv')}
                    className={`p-4 rounded-xl border text-left transition-all ${selectedBase === 'custom_adv' ? 'border-[#10b981] bg-white/5' : 'border-white/5 hover:border-white/10'}`}
                  >
                    <div className="font-bold text-sm text-white">Custom App (Advanced)</div>
                    <div className="text-xs text-[#10b981] mt-1 font-mono">₹3,00,000</div>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setSelectedBase('custom_large')}
                    className={`p-4 rounded-xl border text-left transition-all ${selectedBase === 'custom_large' ? 'border-[#10b981] bg-white/5' : 'border-white/5 hover:border-white/10'}`}
                  >
                    <div className="font-bold text-sm text-white">Custom App (Enterprise)</div>
                    <div className="text-xs text-[#10b981] mt-1 font-mono">₹7,00,000</div>
                  </button>
                </div>
              </div>
              
              <div className="p-6 rounded-3xl border border-white/10 bg-white/5">
                <h3 className="font-bold text-xs uppercase tracking-widest text-[#10b981] mb-4">2. Select Add-on Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {ADDON_LIST.map(addon => {
                    const isSelected = selectedAddons.includes(addon.id)
                    return (
                      <button 
                        key={addon.id}
                        type="button"
                        onClick={() => handleAddonToggle(addon.id)}
                        className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${isSelected ? 'border-[#10b981] bg-white/5' : 'border-white/5 hover:border-white/10'}`}
                      >
                        <div>
                          <div className="font-bold text-sm text-white">{addon.label}</div>
                          <div className="text-[10px] text-white/40 mt-1">{addon.description}</div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <div className="text-xs font-mono text-[#10b981] font-bold">+₹{addon.price.toLocaleString('en-IN')}</div>
                          <div className={`w-4 h-4 rounded mt-2 border flex items-center justify-center ${isSelected ? 'border-[#10b981] bg-[#10b981] text-black' : 'border-white/20 bg-transparent'}`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-4 p-6 rounded-3xl border border-white/10 bg-white/5 sticky top-24">
              <h3 className="font-bold text-xs uppercase tracking-widest text-[#10b981] mb-6">Estimate Summary</h3>
              
              <div className="space-y-4 mb-6 border-b border-white/10 pb-6 text-sm">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white/50">Base Package:</span>
                  <span className="font-bold text-white text-right">{baseName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Base Price:</span>
                  <span className="font-mono text-white">₹{currentBasePrice.toLocaleString('en-IN')}</span>
                </div>
                
                {selectedAddons.length > 0 && (
                  <div className="pt-3 border-t border-white/5">
                    <span className="text-white/50 block mb-2 font-bold text-[11px] uppercase tracking-wider">Add-ons Selected:</span>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                      {selectedAddons.map(id => {
                        const addon = ADDON_LIST.find(a => a.id === id);
                        if (!addon) return null;
                        return (
                          <div key={id} className="flex justify-between items-center text-xs">
                            <span className="text-white/70 max-w-[150px] truncate">{addon.label}</span>
                            <span className="font-mono text-[#10b981]">+₹{addon.price.toLocaleString('en-IN')}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                <div className="pt-3 border-t border-white/5 text-[10px] text-white/40 italic leading-relaxed">
                  * Domain & hosting costs will be billed at actual cost.
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-white uppercase tracking-wider text-xs">Estimated Total:</span>
                <span className="text-2xl font-black text-[#10b981] font-mono">₹{totalEstimate.toLocaleString('en-IN')}</span>
              </div>

              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-[#25d366] text-black font-black tracking-widest uppercase text-xs rounded-xl hover:bg-[#20ba59] transition-all flex items-center justify-center gap-2"
              >
                Inquire via WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const INITIAL_CARDS: CardData[] = [
  { id: "intro", category: "Manifesto", title: "The Digital Ecosystem", subtitle: "We don't just build software. We engineer scalable architectures and strategic brand identities that dominate markets.", iconName: "Zap", colorHex: "#4ade80", cta: "Enter the Ecosystem" },
  { id: "branding", category: "Identity", title: "Strategic Brand Perception", subtitle: "Aesthetics mean nothing without strategy. We craft high-converting visual identities that establish immediate market authority and trust.", iconName: "Palette", colorHex: "#c084fc", cta: "Redefine Your Brand", projects: BRANDING_PROJECTS },
  { id: "webdev", category: "Build", title: "Enterprise Commerce", subtitle: "Monolithic platforms slow you down. We build headless, lightning-fast eCommerce engines capable of handling infinite scale without bottlenecks.", iconName: "Code2", colorHex: "#22d3ee", cta: "Scale Infrastructure", projects: DUMMY_PROJECTS },
  { id: "pricing", category: "Investment", title: "Pricing & Packages", subtitle: "Clear tiers for websites, e-commerce, custom app development, and interactive add-on price calculations.", iconName: "IndianRupee", colorHex: "#10b981", cta: "Calculate Quote", isPricing: true },
  { id: "crm", category: "Systems", title: "Bespoke CRM Operations", subtitle: "Stop forcing your team into generic software. We develop custom CRM platforms tailored to the exact neuro-pathways of your business operations.", iconName: "Fingerprint", colorHex: "#fbbf24", cta: "Enter CRM Dashboard", isCrm: true },
  { id: "hrm", category: "People", title: "HRM & Talent", subtitle: "Scale your workforce seamlessly. Manage payroll, attendance, and recruitment through our centralized human resource management system.", iconName: "Users", colorHex: "#10b981", cta: "Enter HR Dashboard", isHrm: true },
  { id: "grafty", category: "Proprietary Tech", title: "The Grafty Advantage", subtitle: "Leverage our proprietary WhatsApp Business API integration. Automate your support, scale your outreach, and connect exactly where your customers already live.", iconName: "Rocket", colorHex: "#f43f5e", cta: "Deploy Grafty", projects: [{ id: 'g1', title: 'Grafty Integration Demo', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80' }] },
  { id: "ecosystem", category: "Partnership", title: "Fractional CTO & Creative", subtitle: "We don't do one-off projects. We act as your dedicated technical and creative partners, guiding your digital strategy from inception to enterprise scale.", iconName: "Users", colorHex: "#6366f1", cta: "Request Strategic Audit" },
  { id: "contact_form", category: "Secure Link", title: "Initiate Project", subtitle: "Ready to overhaul your digital infrastructure? Submit a technical brief and our lead architects will review your operational requirements.", iconName: "Send", colorHex: "#a78bfa", cta: "Submit Brief", isContactForm: true },
  { id: "products", category: "Our Arsenal", title: "Products & Tools", subtitle: "We build powerful platforms that redefine industry standards. Explore our suite of tools.", iconName: "Layers", colorHex: "#f43f5e", cta: "Explore Products", isProducts: true },
  { id: "portfolio", category: "Exhibition", title: "Creative Portfolio", subtitle: "A glimpse into our meticulously crafted digital experiences.", iconName: "Image", colorHex: "#3b82f6", cta: "View Portfolio", isPortfolio: true },
  { id: "academy", category: "Education", title: "Grekam Academy", subtitle: "Master the art of software engineering and design with our elite programs.", iconName: "GraduationCap", colorHex: "#eab308", cta: "Join Academy", isAcademy: true },
]

// Dynamic Icon Renderer Helper
import * as Icons from "lucide-react"
const renderIcon = (iconName?: string, fallbackIcon?: React.ReactNode, className?: string) => {
  if (iconName && (Icons as any)[iconName]) {
    const IconComponent = (Icons as any)[iconName]
    return <IconComponent className={className || "w-8 h-8 md:w-12 md:h-12"} />
  }
  return fallbackIcon || <Zap className={className || "w-8 h-8 md:w-12 md:h-12"} />
}

// --- CUSTOM CURSOR ---
const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [cursorText, setCursorText] = useState("")
  const [cursorActive, setCursorActive] = useState(false)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  useEffect(() => {
    if (isMobile) return

    const mouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const mouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Check if target or parent has a data-cursor attribute
      const cursorEl = target.closest('[data-cursor]')
      if (cursorEl) {
        setCursorText(cursorEl.getAttribute('data-cursor') || "")
        setCursorActive(true)
      } else {
        setCursorActive(false)
        setCursorText("")
      }
    }

    window.addEventListener("mousemove", mouseMove)
    window.addEventListener("mouseover", mouseOver)

    return () => {
      window.removeEventListener("mousemove", mouseMove)
      window.removeEventListener("mouseover", mouseOver)
    }
  }, [isMobile])

  if (isMobile) return null

  return (
    <motion.div 
      className="fixed top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center mix-blend-difference"
      animate={{ 
        x: mousePosition.x - (cursorActive ? 32 : 8), 
        y: mousePosition.y - (cursorActive ? 32 : 8),
        width: cursorActive ? 64 : 16,
        height: cursorActive ? 64 : 16,
      }}
      transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
    >
      <div className={`w-full h-full rounded-full border border-white bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all ${cursorActive ? 'scale-100' : 'scale-100'}`}>
        {cursorActive && (
          <span className="text-white text-[8px] font-bold tracking-widest uppercase">{cursorText}</span>
        )}
      </div>
    </motion.div>
  )
}

// --- UNIVERSAL CONTACT FORM ---
const UniversalContactForm = ({ 
  ctaText = "Submit", 
  inputClass = "p-3 md:p-4 w-full bg-transparent border-2 border-current rounded-xl outline-none focus:opacity-50 transition-opacity placeholder:text-current placeholder:opacity-50",
  btnClass = "p-4 w-full bg-current text-white font-bold tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 hover:opacity-80 transition-opacity mt-2 group invert mix-blend-difference"
}: { ctaText?: string, inputClass?: string, btnClass?: string }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center w-full">
        <CheckCircle2 className="w-12 h-12 text-current mb-4" />
        <h3 className="text-xl font-bold uppercase mb-2">Request Sent!</h3>
        <p className="opacity-60 text-sm">Our lead architect will be in touch shortly.</p>
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-4 w-full mt-8" onSubmit={async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const email = formData.get('email') as string;
      const countryCode = formData.get('countryCode') as string;
      const phone = formData.get('phone') as string;
      const notes = formData.get('notes') as string;
      
      try {
        const res = await fetch('/api/v1/crm/public/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'WEBSITE',
            name,
            email,
            phone: `${countryCode}${phone}`,
            notes,
            projectType: 'CUSTOM'
          })
        });
        if (res.ok) setIsSubmitted(true);
        else alert('Failed to submit. Please try again.');
      } catch (err) {
        console.error(err);
        alert('Error submitting request.');
      } finally {
        setIsSubmitting(false);
      }
    }}>
      <div className="flex flex-col md:flex-row gap-4">
        <input required name="name" type="text" placeholder="Name" className={inputClass} />
        <input required name="email" type="email" placeholder="Email" className={inputClass} />
      </div>
      <div className="flex gap-4">
        <select name="countryCode" defaultValue="+91" className={`${inputClass} w-24 md:w-32 appearance-none text-center bg-transparent cursor-pointer [&>option]:text-black`}>
          <option value="+91"> +91</option>
          <option value="+1"> +1</option>
          <option value="+44"> +44</option>
          <option value="+61"> +61</option>
          <option value="+81"> +81</option>
          <option value="+49"> +49</option>
        </select>
        <input required name="phone" type="tel" placeholder="Phone Number" className={inputClass} />
      </div>
      <textarea required name="notes" placeholder="Technical Brief / Inquiry Details" className={`${inputClass} h-32 resize-none`} />
      <button disabled={isSubmitting} type="submit" className={`${btnClass} disabled:opacity-50`}>
         {isSubmitting ? "Sending..." : ctaText} <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </form>
  )
}// Helper to format Cloudflare R2 images through backend CORS proxy
function formatImageUrl(url?: string): string {
  if (!url) return '';
  if (url.includes('.r2.cloudflarestorage.com/')) {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split('/').filter(Boolean);
      const keyParts = parts[0] === 'grekamos' ? parts.slice(1) : parts;
      const key = keyParts.join('/');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.grekam.in/api/v1';
      return `${apiUrl}/storage/asset/${key}`;
    } catch {
      return url;
    }
  }
  return url;
}

// --- SHOWCASE IMAGE WITH SELF-HEALING FALLBACK ---
const ShowcaseImage = ({ src, alt, title }: { src?: string; alt?: string; title?: string }) => {
  const [hasError, setHasError] = useState(false)
  const formattedSrc = useMemo(() => formatImageUrl(src), [src])

  if (!src || hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-[#101322] to-zinc-950 p-4 text-center relative overflow-hidden group/thumb">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.18),transparent_70%)]" />
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2 text-cyan-400 group-hover/thumb:scale-110 group-hover/thumb:border-cyan-400/40 transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)]">
          <Globe className="w-6 h-6 animate-pulse" />
        </div>
        <span className="text-xs font-mono font-bold text-white/90 truncate max-w-full relative z-10 px-2">{title || 'Live Application'}</span>
        <span className="text-[9px] font-mono text-cyan-400/80 uppercase tracking-widest mt-1">Ready to Preview</span>
      </div>
    )
  }

  return (
    <img
      loading="lazy"
      src={formattedSrc}
      alt={alt || title || 'Showcase'}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
    />
  )
}

// --- FLOATING CINEMA BOKEH PARTICLES ---
function AgencyCinemaParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const raf = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const dots: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }[] = []
    const colors = ['rgba(6,182,212,', 'rgba(139,92,246,', 'rgba(59,130,246,', 'rgba(255,255,255,']
    for (let i = 0; i < 40; i++) {
      dots.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: 1.2 + Math.random() * 2.8,
        alpha: 0.15 + Math.random() * 0.45,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      dots.forEach(d => {
        d.x += d.vx
        d.y += d.vy
        if (d.x < 0) d.x = W
        if (d.x > W) d.x = 0
        if (d.y < 0) d.y = H
        if (d.y > H) d.y = 0

        ctx.beginPath()
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2)
        ctx.fillStyle = d.color + d.alpha + ')'
        ctx.shadowColor = d.color + '0.8)'
        ctx.shadowBlur = d.size * 2
        ctx.fill()
        ctx.shadowBlur = 0
      })

      raf.current = requestAnimationFrame(draw)
    }

    raf.current = requestAnimationFrame(draw)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />
}

// --- 01. CREATIVE OS ---
const DockItem = ({ card, mouseX, isMobile, playSound, onClick }: {
  card: CardData
  mouseX: any
  isMobile: boolean
  playSound: () => void
  onClick: () => void
}) => {
  const ref = useRef<HTMLButtonElement>(null)
  const distance = useTransform(mouseX, (val: number) => val - (ref.current?.getBoundingClientRect().x ?? 0) - 32)
  const widthSync = useTransform(distance, [-150, 0, 150], [isMobile ? 48 : 64, isMobile ? 60 : 100, isMobile ? 48 : 64])
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 200, damping: 15 })

  return (
    <motion.button 
      ref={ref} 
      style={{ width, height: width }} 
      onClick={() => { playSound(); onClick(); }} 
      className="relative flex items-center justify-center bg-white/10 border border-white/20 hover:bg-white/20 hover:border-cyan-400/50 rounded-[1.2rem] md:rounded-[1.5rem] shrink-0 [&>svg]:w-6 [&>svg]:h-6 md:[&>svg]:w-8 md:[&>svg]:h-8 transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
    >
      {renderIcon(card.iconName, card.icon)}
    </motion.button>
  )
}

const LayoutCreativeOS = ({ cards, playSound, cmsData, onPreviewProject }: any) => {
  const [activeCard, setActiveCard] = useState<CardData | null>(null)
  const mouseX = useMotionValue(Infinity)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => { setIsMobile(window.innerWidth < 768) }, [])
  
  return (
    <div className="h-[100dvh] w-full bg-zinc-950 overflow-hidden relative font-sans text-white">
      {/* Dynamic Background Particles & Gradients */}
      <AgencyCinemaParticles />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#3b0764,transparent_50%),radial-gradient(ellipse_at_bottom,#064e3b,transparent_50%)] opacity-40 blur-3xl pointer-events-none" />
      
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10 w-full px-6 transition-opacity duration-500 ${activeCard ? 'opacity-0' : 'opacity-100'}`}>
        <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]">Do you have the courage to <br className="hidden md:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 animate-pulse">stand out?</span></h1>
        <p className="text-xl md:text-3xl text-white/50 font-light max-w-3xl mx-auto leading-relaxed">Or will you settle for another template? We don't build standard websites. We engineer bespoke digital experiences.</p>
      </div>

      <div className="absolute bottom-6 md:bottom-10 left-0 right-0 z-40 flex justify-center w-full px-4 pointer-events-none">
         <motion.div onMouseMove={(e) => mouseX.set(e.clientX)} onMouseLeave={() => mouseX.set(Infinity)} className="flex h-20 md:h-24 items-center gap-3 md:gap-6 px-4 md:px-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl overflow-x-auto max-w-full custom-scrollbar pointer-events-auto">
           {cards.map((card: CardData) => (
             <DockItem 
               key={card.id} 
               card={card} 
               mouseX={mouseX} 
               isMobile={isMobile} 
               playSound={playSound} 
               onClick={() => setActiveCard(card)} 
             />
           ))}
         </motion.div>
      </div>
      <AnimatePresence>
         {activeCard && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none p-4 md:p-12 mb-24 md:mb-32">
              <div className="pointer-events-auto w-full max-w-5xl h-full md:h-[80vh] max-h-[900px] bg-zinc-950/85 backdrop-blur-3xl border border-white/15 rounded-[2rem] flex flex-col overflow-hidden shadow-[0_25px_80px_-15px_rgba(0,0,0,0.95)] ring-1 ring-white/10">
                <div className="h-14 md:h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/5 shrink-0">
                  <div className="text-[10px] md:text-xs uppercase tracking-widest text-white/50">{activeCard.category}</div>
                  <button onClick={() => { playSound(); setActiveCard(null); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 p-6 md:p-12 flex flex-col items-center text-center overflow-y-auto custom-scrollbar">
                  {/* Glowing Icon Frame */}
                  <div className="relative mb-6 md:mb-8 shrink-0">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-30 blur-md" 
                    />
                    <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-black/80 border border-white/15 flex items-center justify-center shadow-xl" style={{ color: activeCard.colorHex }}>
                      {renderIcon(activeCard.iconName, activeCard.icon)}
                    </div>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{activeCard.title}</h1>
                  <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-8 md:mb-12 shrink-0">{activeCard.subtitle}</p>
                  
                  {/* Projects / Products Grid */}
                  {((activeCard.projects && activeCard.projects.length > 0) || (activeCard.isPortfolio && cmsData?.portfolio) || (activeCard.isProducts && cmsData?.products)) && (
                     <div className="w-full mt-auto">
                        <div className="text-left text-xs uppercase tracking-widest text-cyan-400/70 font-mono mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                          {activeCard.isProducts ? 'Proprietary Software' : 'Featured Client Platforms'}
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                           {(activeCard.projects || (activeCard.isPortfolio ? cmsData?.portfolio : null) || (activeCard.isProducts ? cmsData?.products : null) || []).map((proj: any, pIdx: number) => (
                              <div 
                                key={proj.id || pIdx} 
                                data-cursor="VIEW" 
                                onClick={() => onPreviewProject?.(proj)}
                                className="w-64 md:w-80 shrink-0 snap-start bg-gradient-to-b from-white/10 to-white/5 border border-white/15 hover:border-cyan-400/60 rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:-translate-y-1"
                              >
                                 <div className="h-40 md:h-48 w-full bg-zinc-900 overflow-hidden relative flex items-center justify-center">
                                    <ShowcaseImage src={proj.image} alt={proj.title} title={proj.title} />
                                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[9px] font-mono font-bold text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 shadow-lg group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping group-hover:hidden" />
                                      <Eye className="w-3 h-3" /> Live Preview
                                    </div>
                                 </div>
                                 <div className="p-4 text-left font-bold text-sm md:text-base truncate flex items-center justify-between bg-zinc-950/60">
                                   <div className="truncate mr-2">
                                     <div className="truncate text-white group-hover:text-cyan-300 transition-colors">{proj.title}</div>
                                     {proj.category && <div className="text-[10px] text-white/40 font-mono truncate">{proj.category}</div>}
                                   </div>
                                   <span className="text-xs text-cyan-400 group-hover:translate-x-1 transition-transform shrink-0">→</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Pricing Tiers */}
                  {activeCard.isPricing && (
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 text-left mt-auto">
                      {[
                        { title: 'MVP Sprint', price: '₹45,000', period: 'one-time', features: ['High-Converting Next.js App', 'Interactive UI/UX & Motion', 'Payment & Analytics Setup', '2-Week Turnaround'] },
                        { title: 'Growth Engine', price: '₹85,000', period: 'monthly', popular: true, features: ['Fullstack Web + API Suite', 'Automated CRM & Lead Sync', 'Custom Microservices', 'Dedicated Tech Partner'] },
                        { title: 'Enterprise Bespoke', price: 'Custom', period: 'engagement', features: ['Architectural SLA & Audits', 'Private Cloud / On-Prem Deploy', 'AI Model Fine-Tuning', '24/7 Priority Support'] }
                      ].map((tier, tIdx) => (
                        <div key={tIdx} className={`p-5 rounded-2xl border flex flex-col justify-between ${tier.popular ? 'bg-gradient-to-b from-purple-900/30 to-indigo-950/40 border-purple-500/40 shadow-lg' : 'bg-white/5 border-white/10'}`}>
                          <div>
                            <div className="text-xs uppercase tracking-widest text-emerald-400 font-mono mb-1">{tier.title}</div>
                            <div className="text-2xl font-black mb-3">{tier.price} <span className="text-xs text-white/40 font-normal">/ {tier.period}</span></div>
                            <ul className="space-y-2 mb-4 text-xs text-white/70">
                              {tier.features.map((f, fi) => (
                                <li key={fi} className="flex items-center gap-2">
                                  <span className="text-emerald-400">✓</span> {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <button 
                            onClick={() => {
                              const contactSection = cards.find(c => c.isContactForm || c.id === 'contact_form')
                              if (contactSection) setActiveCard(contactSection)
                            }}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${tier.popular ? 'bg-white text-black hover:bg-white/90' : 'bg-white/10 text-white hover:bg-white/20'}`}
                          >
                            Get Started
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Contact Form */}
                  {activeCard.id === 'contact_form' && (
                     <div className="w-full max-w-2xl text-left mt-auto">
                        <UniversalContactForm 
                          ctaText={activeCard.cta} 
                          inputClass="p-4 w-full bg-black/50 border border-white/10 rounded-xl outline-none focus:border-white/30 transition-colors text-white placeholder:text-white/30" 
                          btnClass="p-4 w-full bg-white text-black hover:bg-white/90 rounded-xl font-bold tracking-widest uppercase mt-4 flex items-center justify-center gap-2 group" 
                        />
                     </div>
                  )}
                  
                  {!activeCard.projects && !activeCard.isPricing && activeCard.id !== 'contact_form' && (
                     <button onClick={() => {
                        if (activeCard.isAcademy) window.location.href = '/academy';
                        else if (activeCard.isCrm) window.location.href = '/dashboard/crm';
                        else if (activeCard.isHrm) window.location.href = '/dashboard/hr';
                     }} className="mt-8 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-white/90 shadow-lg shadow-white/10 transition-all uppercase tracking-widest text-sm flex items-center gap-2">
                        {activeCard.cta} <Zap className="w-4 h-4" />
                     </button>
                  )}
                </div>
              </div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  )
}

// Deterministic positions to guarantee identical SSR and client hydration
function getGoldenPositions(count: number, isMobile: boolean) {
  const positions: { x: number; y: number; rotate: number }[] = []
  
  // Tighter scale for mobile so they stay on screen
  const maxRadiusX = isMobile ? 120 : 280
  const maxRadiusY = isMobile ? 160 : 180

  for (let i = 0; i < count; i++) {
    const pseudoRandomAngle = ((i * 137.508) % 360) * (Math.PI / 180)
    const pseudoRandomR = 0.35 + ((((i * 73 + 17) % 100) / 100) * 0.55)
    const pseudoRandomRotate = (((i * 41 + 13) % 60) - 30)

    positions.push({
      x: Math.cos(pseudoRandomAngle) * pseudoRandomR * maxRadiusX,
      y: Math.sin(pseudoRandomAngle) * pseudoRandomR * maxRadiusY,
      rotate: pseudoRandomRotate,
    })
  }
  return positions
}

import { animate } from 'framer-motion'

const DraggableCard = ({ card, pos, isMobile, isDragging, onTap, renderCardContent, zIdx, containerRef }: any) => {
  // We only want the icon when scattered
  const isDesktopShrunk = false
  const isSmallSquare = true

  // Start at 0 (center) and animate to scattered positions
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const dragRotate = useMotionValue(0)

  useEffect(() => {
    // Force reset values to 0 on mount/update to guarantee scatter animation fires
    x.set(0)
    y.set(0)
    dragRotate.set(0)

    // Staggered shuffle animation when component mounts
    const delay = (zIdx - 20) * 0.04
    animate(x, pos.x, { type: "spring", stiffness: 70, damping: 14, delay })
    animate(y, pos.y, { type: "spring", stiffness: 70, damping: 14, delay })
    animate(dragRotate, pos.rotate, { type: "spring", stiffness: 70, damping: 14, delay })
  }, [pos.x, pos.y, pos.rotate])

  // Simple borders and dropshadow without the glow
  const customBoxShadow = `0 10px 30px -10px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)`
  const hoverBoxShadow = `0 15px 40px -10px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.1)`

  // Removed backdrop-blur-md to massively improve drag performance
  const baseClass = `absolute bg-zinc-900 rounded-2xl flex cursor-grab active:cursor-grabbing overflow-hidden`
  const stateClass = 'p-0 items-center justify-center'

  const size = isMobile ? '64px' : '110px'

  return (
    <motion.div
      drag
      dragConstraints={containerRef}
      dragMomentum={false}
      dragElastic={0}
      style={{ 
        x, y, 
        rotate: dragRotate, 
        zIndex: zIdx, 
        width: size, 
        height: size, 
        position: 'absolute',
        boxShadow: customBoxShadow
      }}
      onDrag={(_, info) => {
        const tilt = Math.max(-18, Math.min(18, info.velocity.x / 40))
        dragRotate.set(pos.rotate + tilt)
      }}
      onDragEnd={() => {
        dragRotate.set(pos.rotate)
        setTimeout(() => { isDragging.current = false }, 50)
      }}
      onDragStart={() => { isDragging.current = true }}
      onClick={() => {
        if (isDragging.current) return
        onTap(card.id)
      }}
      whileHover={{ scale: 1.1, boxShadow: hoverBoxShadow }}
      className={`${baseClass} ${stateClass}`}
    >
      {renderCardContent(card, false, false, isSmallSquare, isDesktopShrunk)}
    </motion.div>
  )
}

const LayoutScatteredCards = ({ cards, playSound, cmsData, onPreviewProject }: any) => {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [hasOpenedCard, setHasOpenedCard] = useState(false)
  const containerRef = useRef(null)
  const isDragging = useRef(false)
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const [goldenPositions, setGoldenPositions] = useState<{x: number, y: number, rotate: number}[]>(() => Array(cards.length).fill({x: 0, y: 0, rotate: 0}))
  useEffect(() => {
    setGoldenPositions(getGoldenPositions(cards.length, isMobile))
  }, [cards.length, isMobile])

  const renderCardContent = (card: CardData, isActive: boolean, isRectangle: boolean, isSmallSquare: boolean, isDesktopShrunk: boolean = false) => (
    <div className={`flex w-full h-full relative ${isActive ? 'flex-1 flex-col p-6 md:p-12 overflow-y-auto custom-scrollbar' : (isRectangle ? 'flex-1 flex-row items-center gap-3 p-3' : (isSmallSquare ? 'items-center justify-center' : (isDesktopShrunk ? 'flex-col items-center justify-center text-center p-3' : 'flex-1 flex-col p-6 md:p-8 justify-between')))}`}>
      {(!isSmallSquare && !isDesktopShrunk && (!isMobile || isActive)) && (
        <div className="text-[10px] md:text-xs tracking-widest text-white/40 uppercase mb-4 md:mb-6 pr-12 font-mono flex items-center justify-between">
          <span>{card.category}</span>
        </div>
      )}
      
      <div className={`relative w-full ${isSmallSquare ? 'h-full flex items-center justify-center' : (isDesktopShrunk ? 'flex justify-center mb-4' : (isActive ? 'flex justify-between items-center mb-6' : 'flex justify-between items-center mb-4 md:mb-6'))}`}>
        <div className={`${isSmallSquare ? 'w-full h-full flex items-center justify-center' : `rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 ${isRectangle ? 'w-12 h-12' : (isDesktopShrunk ? 'w-16 h-16' : 'w-16 h-16 md:w-20 md:h-20')}`}`} style={{ color: card.colorHex }}>
          {renderIcon(card.iconName, card.icon, isSmallSquare ? "w-6 h-6 md:w-12 md:h-12" : (isRectangle ? "w-5 h-5" : undefined))}
        </div>
        
        {isActive && (
          <button 
            onClick={(e) => { e.stopPropagation(); playSound(); setActiveId(null); }} 
            className="z-[120] hover:opacity-70 transition-opacity p-2 -mr-2 text-white/70 hover:text-white"
            style={{ color: card.colorHex }}
          >
            <X className="w-6 h-6 md:w-8 md:h-8" />
          </button>
        )}
      </div>

      {(!isSmallSquare || isActive) && (
        <h2 
          className={`font-bold text-white ${isActive ? 'text-3xl md:text-5xl mb-3' : (isRectangle ? 'text-[11px] leading-tight text-left' : (isDesktopShrunk ? 'text-[11px] leading-tight text-center' : 'text-2xl mb-2'))}`}
        >{card.title}</h2>
      )}
      
      {(!isSmallSquare && !isDesktopShrunk && (!isMobile || isActive)) && <p className={`text-white/60 mb-6 ${isActive ? 'text-lg md:text-xl max-w-2xl' : 'text-sm'}`}>{card.subtitle}</p>}
      
      {isActive && (card.projects || (card.isPortfolio && cmsData?.portfolio)) && (
         <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {(card.projects || cmsData?.portfolio || []).map((proj: any, idx: number) => (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 transition={{ delay: idx * 0.1 }} 
                 key={proj.id || idx} 
                 onClick={(e) => {
                   e.stopPropagation()
                   onPreviewProject?.(proj)
                 }}
                 className="relative aspect-video rounded-xl overflow-hidden group border border-white/10 cursor-pointer shadow-lg hover:border-emerald-500/50 transition-all bg-black/40"
               >
                  <ShowcaseImage src={proj.image} alt={proj.title} title={proj.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end justify-between p-4 pointer-events-none">
                     <div className="font-bold text-white tracking-widest uppercase text-xs truncate mr-2">{proj.title}</div>
                     <div className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-md text-[10px] text-white font-mono font-bold flex items-center gap-1.5 shrink-0 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                       <Eye className="w-3 h-3" /> Live Demo
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>
      )}

      {isActive && card.isProducts && cmsData?.products && (
         <div className="mt-8 w-full">
            <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar snap-x">
               {cmsData.products.map((prod: any, idx: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: idx * 0.1 }} 
                    key={prod.id || idx} 
                    onClick={() => {
                      onPreviewProject?.({
                        id: prod.id || `prod-${idx}`,
                        title: prod.title,
                        image: prod.image,
                        url: prod.link || 'https://grekam.in',
                        category: 'Platform Product',
                        techStack: ['SaaS', 'Fullstack', 'Automation']
                      })
                    }}
                    className="w-72 shrink-0 snap-start bg-white/5 border border-white/10 hover:border-emerald-500/50 rounded-2xl overflow-hidden flex flex-col group cursor-pointer transition-colors"
                  >
                     <div className="aspect-video bg-black/50 overflow-hidden relative">
                        <ShowcaseImage src={prod.image} alt={prod.title} title={prod.title} />
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[9px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Eye className="w-2.5 h-2.5" /> Preview
                        </div>
                     </div>
                     <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-bold text-white text-lg mb-2">{prod.title}</h3>
                        <p className="text-white/50 text-sm mb-4 line-clamp-2 flex-1">{prod.description}</p>
                        <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 group-hover:text-white transition-colors mt-auto flex items-center gap-1">
                           Test Live Site &rarr;
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      )}

      {isActive && card.isAcademy && (
         <div className="mt-8 bg-gradient-to-br from-[#eab308]/20 to-transparent border border-[#eab308]/30 rounded-2xl p-6 md:p-8 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors" onClick={() => window.location.href = '/academy'}>
            <div>
               <div className="text-[10px] font-bold tracking-widest text-[#eab308] uppercase mb-2">Exclusive Access</div>
               <h3 className="text-xl md:text-3xl font-bold text-white mb-2">Elevate Your Career</h3>
               <p className="text-white/60 text-sm max-w-sm">Join an elite network of engineers and designers mastering the craft of modern software building.</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#eab308] flex items-center justify-center text-black group-hover:scale-110 transition-transform shrink-0">
               <Zap className="w-5 h-5" />
            </div>
         </div>
      )}

      {isActive && card.isCrm && (
         <div className="mt-8 bg-gradient-to-br from-[#fbbf24]/20 to-transparent border border-[#fbbf24]/30 rounded-2xl p-6 md:p-8 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors" onClick={() => window.location.href = '/dashboard/crm'}>
            <div>
               <div className="text-[10px] font-bold tracking-widest text-[#fbbf24] uppercase mb-2">Direct Access</div>
               <h3 className="text-xl md:text-3xl font-bold text-white mb-2">CRM Dashboard</h3>
               <p className="text-white/60 text-sm max-w-sm">Manage your pipelines, clients, and communications all in one centralized hub.</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#fbbf24] flex items-center justify-center text-black group-hover:scale-110 transition-transform shrink-0">
               <Fingerprint className="w-5 h-5" />
            </div>
         </div>
      )}

      {isActive && card.isHrm && (
         <div className="mt-8 bg-gradient-to-br from-[#10b981]/20 to-transparent border border-[#10b981]/30 rounded-2xl p-6 md:p-8 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors" onClick={() => window.location.href = '/dashboard/hr'}>
            <div>
               <div className="text-[10px] font-bold tracking-widest text-[#10b981] uppercase mb-2">Direct Access</div>
               <h3 className="text-xl md:text-3xl font-bold text-white mb-2">HR Dashboard</h3>
               <p className="text-white/60 text-sm max-w-sm">Manage payroll, employees, and recruitment from your enterprise dashboard.</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#10b981] flex items-center justify-center text-black group-hover:scale-110 transition-transform shrink-0">
               <Users className="w-5 h-5" />
            </div>
         </div>
      )}

      {isActive && card.isPricing && (
         <div className="mt-8 w-full">
            <PricingCalculator />
         </div>
      )}

      {isActive && !card.isPricing && (
        <div className="mt-auto pt-8 border-t border-white/10 flex flex-col md:flex-row gap-4 mt-8">
          {(card.id === 'contact_form' || card.isContactForm) ? (
             <UniversalContactForm 
                ctaText={card.cta} 
                inputClass="p-4 w-full bg-white/5 border border-white/10 rounded-xl outline-none focus:border-white/30 text-white placeholder:text-white/30"
                btnClass="p-4 w-full bg-white text-black font-bold uppercase tracking-widest rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2 group"
             />
          ) : (
             <button onClick={() => {
                if (card.isAcademy) window.location.href = '/academy';
                else if (card.isCrm) window.location.href = '/dashboard/crm';
                else if (card.isHrm) window.location.href = '/dashboard/hr';
             }} className="py-4 px-8 w-full md:w-auto bg-white text-black font-bold rounded-xl hover:bg-gray-200 uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                {card.cta} <Zap className="w-4 h-4" />
             </button>
          )}
        </div>
      )}
    </div>
  )
  
  return (
    <div ref={containerRef} className="h-[100dvh] w-full overflow-hidden flex items-center justify-center bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent)] pointer-events-none" />
      
      {/* Centered headline — always in the middle */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-10 px-6">
        <h1
          className="font-black mb-3 tracking-tight text-white drop-shadow-2xl"
          style={{ fontFamily: 'var(--font-inter, Inter, system-ui), sans-serif', fontSize: 'clamp(1.6rem, 5vw, 4.5rem)', lineHeight: 1.08 }}
        >
          Do you have the courage<br />to stand out?
        </h1>
        <p
          className="text-white/50 font-medium max-w-lg"
          style={{ fontFamily: 'var(--font-inter, Inter, system-ui), sans-serif', fontSize: 'clamp(0.85rem, 1.8vw, 1.15rem)' }}
        >
          Or will you settle for another template?
        </p>
      </div>

      {/* Expanded card modal — no layoutId, instant open */}
      <AnimatePresence>
        {activeId && <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-[100] backdrop-blur-md" onClick={() => setActiveId(null)} />}
        {activeId && (() => {
          const activeCard = cards.find((c: CardData) => c.id === activeId)
          if (!activeCard) return null
          return (
            <motion.div
              key={`expanded-${activeCard.id}`}
              className="fixed inset-0 m-auto bg-zinc-900 border border-white/10 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,1)] w-[90vw] md:w-[900px] h-auto max-h-[90vh] z-[110] flex flex-col p-6 md:p-10 pb-24 md:pb-10 overflow-y-auto custom-scrollbar cursor-default pointer-events-auto"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderCardContent(activeCard, true, false, false)}
            </motion.div>
          )
        })()}
      </AnimatePresence>
      
      {/* Golden-ratio scattered cards */}
      {cards.map((card: CardData, i: number) => (
        <DraggableCard
          key={card.id}
          card={card}
          pos={goldenPositions[i] || { x: 0, y: 0, rotate: 0 }}
          isMobile={isMobile}
          isDragging={isDragging}
          onTap={(id: string) => { setHasOpenedCard(true); playSound(); setActiveId(id) }}
          renderCardContent={renderCardContent}
          zIdx={i + 20}
          containerRef={containerRef}
        />
      ))}
    </div>
  )
}




// --- 03. EDITORIAL MAGAZINE ---
const LayoutEditorial = ({ cards, onPreviewProject }: any) => {
  return (
    <div data-lenis-prevent className="h-[100dvh] w-full bg-[#f4f0ea] text-[#2c2a29] font-serif overflow-y-auto pb-32">
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-24 md:py-32 flex flex-col gap-32 md:gap-40">
        <div className="text-center mb-10 md:mb-20 mt-10 md:mt-0">
           <h1 className="text-6xl md:text-9xl font-normal tracking-tighter mb-6 md:mb-8 leading-tight">Visuals</h1>
           <p className="text-sm md:text-xl uppercase tracking-[0.2em] text-[#7a7571] font-sans max-w-3xl mx-auto leading-relaxed">Do you have the courage to stand out from the rest, or do you want to use a template?</p>
        </div>
        {cards.map((card: CardData, i: number) => (
          <div key={card.id} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-start gap-10 md:gap-16`}>
             <div className="w-full md:w-1/2 aspect-[4/5] bg-[#e8e4de] flex items-center justify-center border border-[#2c2a29]/10 p-12 sticky top-24">
               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="scale-[2] md:scale-[3]" style={{ color: card.colorHex }}>
                 {renderIcon(card.iconName, card.icon)}
               </motion.div>
             </div>
             <div className="w-full md:w-1/2 flex flex-col justify-center">
               <div className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#7a7571] mb-6 md:mb-8">— 0{i + 1} // {card.category}</div>
               <h2 className="text-4xl md:text-7xl font-normal mb-6 md:mb-8 leading-tight">{card.title}</h2>
               <p className="text-lg md:text-xl text-[#7a7571] leading-relaxed max-w-md mb-12">{card.subtitle}</p>
               
               {card.projects && (
                  <div className="flex flex-col gap-8 w-full">
                     {card.projects.map((proj: any) => (
                        <div 
                          key={proj.id} 
                          onClick={() => onPreviewProject?.(proj)}
                          className="w-full group cursor-pointer"
                        >
                           <div className="w-full aspect-[4/3] bg-[#e8e4de] overflow-hidden mb-4 relative flex items-center justify-center">
                              {proj.image ? (
                                <img loading="lazy" src={proj.image} alt={proj.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                              ) : (
                                <div className="flex flex-col items-center justify-center p-4 text-center">
                                  <Globe className="w-8 h-8 mb-2 text-[#2c2a29]/40" />
                                  <span className="text-xs font-mono text-[#2c2a29]/70 font-bold">{proj.title || 'Live Website'}</span>
                                </div>
                              )}
                              <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/80 text-white font-mono text-[9px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                 <Eye className="w-2.5 h-2.5 text-emerald-400" /> Live Demo
                              </div>
                           </div>
                           <div className="text-[10px] font-sans uppercase tracking-widest text-[#2c2a29] flex items-center justify-between font-bold">
                              <span>{proj.title}</span>
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-700">Preview ↗</span>
                           </div>
                        </div>
                     ))}
                  </div>
               )}

               {(card.id === 'contact_form' || card.isContactForm) ? (
                  <div className="mt-8 font-sans w-full max-w-md">
                    <UniversalContactForm 
                       ctaText={card.cta} 
                       inputClass="p-4 w-full bg-transparent border-b border-[#2c2a29]/20 rounded-none outline-none focus:border-[#2c2a29] text-[#2c2a29] placeholder:text-[#2c2a29]/40 text-sm uppercase tracking-widest"
                       btnClass="mt-8 px-8 py-4 bg-[#2c2a29] text-[#f4f0ea] uppercase tracking-widest text-xs hover:bg-black w-full flex items-center justify-center gap-2"
                    />
                  </div>
               ) : (
                  <button onClick={() => {
                     if (card.isAcademy) window.location.href = '/academy';
                     else if (card.isCrm) window.location.href = '/dashboard/crm';
                     else if (card.isHrm) window.location.href = '/dashboard/hr';
                  }} className="mt-12 w-fit border-b border-[#2c2a29] pb-2 text-[10px] md:text-xs font-sans uppercase tracking-[0.2em] hover:text-[#7a7571] hover:border-[#7a7571] transition-all flex items-center gap-2">
                    {card.cta} <Zap className="w-3 h-3" />
                  </button>
               )}
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- 04. INFINITE CANVAS ---
const LayoutInfiniteCanvas = ({ cards, onPreviewProject }: any) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  return (
    <div className="h-[100dvh] w-full bg-zinc-100 overflow-hidden relative cursor-grab active:cursor-grabbing font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="absolute bottom-8 md:top-24 md:bottom-auto left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-lg border border-zinc-200 text-xs font-bold tracking-widest text-zinc-600 uppercase z-50 pointer-events-none flex items-center gap-2">
         <Zap className="w-4 h-4" /> Drag canvas to explore
      </div>
      <motion.div drag dragConstraints={{ left: -2000, right: 2000, top: -2000, bottom: 2000 }} className="w-[4000px] h-[4000px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        
        <div className="absolute w-[80vw] md:w-[800px] bg-transparent p-6 md:p-8 pointer-events-none text-center" style={{ left: 2000, top: 2000, transform: 'translate(-50%, -50%)' }}>
           <h1 className="text-5xl md:text-8xl font-black text-black mb-6 tracking-tighter">Do you have the courage to stand out?</h1>
           <p className="text-2xl md:text-3xl text-zinc-500 font-medium leading-relaxed">Or will you settle for another template?</p>
        </div>

        {cards.map((card: CardData, i: number) => {
          const radius = isMobile ? 600 : 1200;
          const x = Math.sin(i * 1.5) * radius + 2000;
          const y = Math.cos(i * 1.5) * radius + 2000;
          return (
            <motion.div drag dragMomentum={false} key={card.id} className="absolute w-[85vw] md:w-[450px] bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-zinc-200 pointer-events-auto flex flex-col cursor-grab active:cursor-grabbing hover:z-50 hover:shadow-2xl transition-shadow" style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
               <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6" style={{ color: card.colorHex }}>{renderIcon(card.iconName, card.icon)}</div>
               <div className="text-[10px] md:text-xs uppercase tracking-widest text-zinc-400 mb-2">{card.category}</div>
               <h2 className="text-2xl md:text-4xl font-black text-black mb-4">{card.title}</h2>
               <p className="text-zinc-500 font-medium mb-8 text-sm md:text-base">{card.subtitle}</p>
               
               {card.projects && (
                  <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar mb-6">
                     {card.projects.map((proj: any) => (
                        <div 
                          key={proj.id} 
                          onClick={() => onPreviewProject?.(proj)}
                          className="w-48 shrink-0 bg-zinc-50 rounded-xl overflow-hidden border border-zinc-200 p-2 cursor-pointer hover:border-emerald-500/50 hover:shadow-md transition-all group"
                        >
                           <div className="aspect-video w-full rounded-lg overflow-hidden bg-zinc-200 mb-3 relative flex items-center justify-center">
                              {proj.image ? (
                                <img loading="lazy" src={proj.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              ) : (
                                <div className="flex flex-col items-center justify-center text-zinc-400 p-2 text-center">
                                  <Globe className="w-6 h-6 mb-1 text-zinc-500" />
                                </div>
                              )}
                              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white rounded text-[8px] font-mono flex items-center gap-0.5">
                                <Eye className="w-2 h-2 text-emerald-400" /> Preview
                              </div>
                           </div>
                           <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-800 text-center truncate">{proj.title}</div>
                        </div>
                     ))}
                  </div>
               )}

               {(card.id === 'contact_form' || card.isContactForm) ? (
                  <UniversalContactForm 
                     ctaText={card.cta} 
                     inputClass="p-3 w-full bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-zinc-400 text-zinc-800 text-sm"
                     btnClass="p-4 w-full bg-black text-white font-bold rounded-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 mt-4 hover:bg-zinc-800"
                  />
               ) : (
                  <button onClick={() => {
                     if (card.isAcademy) window.location.href = '/academy';
                     else if (card.isCrm) window.location.href = '/dashboard/crm';
                     else if (card.isHrm) window.location.href = '/dashboard/hr';
                  }} className="w-full py-4 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 font-bold rounded-xl uppercase tracking-widest text-[10px] md:text-xs transition-colors mt-auto">
                     {card.cta}
                  </button>
               )}
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

// --- 05. DIGITAL GALLERY ---
const LayoutDigitalGallery = ({ cards, onPreviewProject }: any) => {
  return (
    <div className="h-[100dvh] w-full bg-[#0a0a0a] overflow-x-auto overflow-y-hidden flex items-center px-12 md:px-32 custom-scrollbar font-sans">
       <div className="flex gap-16 md:gap-32 pr-16 md:pr-32 items-center h-full py-24">
         <div className="shrink-0 text-white mr-8 md:mr-16 max-w-xl">
            <h1 className="text-5xl md:text-8xl font-light mb-6">Exhibition</h1>
            <p className="text-zinc-400 font-serif italic text-lg md:text-3xl leading-relaxed">"Do you have the courage to stand out from the rest, or do you want to use a template?"</p>
         </div>
         {cards.map((card: CardData) => (
           <div key={card.id} className="shrink-0 w-[80vw] md:w-[500px] flex flex-col items-center group">
              <div className="w-full bg-[#111] border-[8px] md:border-[16px] border-[#1a1a1a] shadow-[10px_20px_50px_rgba(0,0,0,0.8)] flex flex-col relative overflow-hidden transition-transform duration-700 md:group-hover:scale-105">
                 
                 {!(card.id === 'contact_form' || card.isContactForm) ? (
                   <>
                     <div className="aspect-[3/4] flex flex-col items-center justify-center p-8 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="scale-[2] md:scale-[3] drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-transform duration-700 md:group-hover:scale-[3.5] mb-20" style={{ color: card.colorHex }}>{renderIcon(card.iconName, card.icon)}</div>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-8 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-500 flex flex-col items-center text-center">
                           <h3 className="text-white text-xl md:text-2xl uppercase tracking-[0.2em] mb-2">{card.title}</h3>
                           <p className="text-zinc-400 text-xs md:text-sm mb-6">{card.subtitle}</p>
                           <button onClick={() => {
                              if (card.isAcademy) window.location.href = '/academy';
                              else if (card.isCrm) window.location.href = '/dashboard/crm';
                              else if (card.isHrm) window.location.href = '/dashboard/hr';
                           }} className="px-6 py-3 border border-white/30 text-white/70 hover:text-white hover:border-white uppercase tracking-widest text-[10px] transition-all">
                              {card.cta}
                           </button>
                        </div>
                     </div>
                     {card.projects && (
                        <div className="bg-black border-t border-[#333] flex flex-row overflow-x-auto h-0 group-hover:h-32 transition-all duration-700">
                           {card.projects.map((proj: any) => (
                              <div 
                                key={proj.id} 
                                onClick={() => onPreviewProject?.(proj)}
                                className="w-32 h-full shrink-0 border-r border-[#333] overflow-hidden relative cursor-pointer group/item"
                              >
                                 <img loading="lazy" src={proj.image} className="w-full h-full object-cover opacity-50 group-hover/item:opacity-100 group-hover/item:scale-110 transition-all duration-300" />
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 flex items-center justify-center transition-opacity">
                                    <Eye className="w-4 h-4 text-emerald-400" />
                                 </div>
                                 <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent text-[8px] text-white font-bold uppercase tracking-widest text-center truncate">{proj.title}</div>
                              </div>
                           ))}
                        </div>
                     )}
                   </>
                 ) : (
                    <div className="flex flex-col w-full h-full p-8 md:p-12 justify-center bg-[#111]">
                       <h3 className="text-white text-xl md:text-2xl uppercase tracking-[0.2em] mb-2 text-center">{card.title}</h3>
                       <p className="text-zinc-400 text-xs md:text-sm mb-6 text-center">{card.subtitle}</p>
                       <UniversalContactForm 
                          ctaText={card.cta} 
                          inputClass="p-3 w-full bg-black border border-[#333] rounded-none outline-none focus:border-[#666] text-white text-sm placeholder:text-white/30"
                          btnClass="p-4 w-full bg-white text-black uppercase tracking-widest text-[10px] font-bold hover:bg-zinc-200 mt-4 flex items-center justify-center gap-2"
                       />
                    </div>
                 )}
              </div>
           </div>
         ))}
       </div>
    </div>
  )
}

// --- 06. NEO BRUTALISM 2.0 ---
const LayoutNeoBrutalism = ({ cards, onPreviewProject }: any) => {
  return (
    <div data-lenis-prevent className="h-[100dvh] w-full bg-[#FF90E8] font-sans text-black overflow-y-auto border-[8px] md:border-[16px] border-black pb-32">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20">
         <div className="bg-white border-[6px] md:border-[8px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 mb-12 md:mb-20 text-center transform -rotate-2 mt-12 md:mt-0">
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-4">Grekam</h1>
            <p className="text-xl md:text-3xl font-black uppercase bg-black text-white inline-block px-6 py-3 mt-4 transform rotate-1">Courage to stand out &gt; Another Template</p>
         </div>
         <div className="flex flex-col gap-8 md:gap-16">
            {cards.map((card: CardData, i: number) => (
              <div key={card.id} className="bg-[#FFC900] border-[4px] md:border-[6px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 flex flex-col transition-all" style={{ backgroundColor: i % 2 === 0 ? '#FFC900' : '#23A094' }}>
                 
                 <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                    <div className="w-20 h-20 md:w-32 md:h-32 bg-white border-[4px] border-black flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] [&>svg]:w-10 [&>svg]:h-10 md:[&>svg]:w-16 md:[&>svg]:h-16">
                      {renderIcon(card.iconName, card.icon)}
                    </div>
                    <div className="w-full flex-1 flex flex-col text-center md:text-left">
                      <div className="text-[10px] md:text-sm font-black uppercase mb-4 border-[2px] border-black inline-block px-3 py-1 bg-white w-fit mx-auto md:mx-0">{card.category}</div>
                      <h2 className="text-3xl md:text-5xl font-black uppercase mb-4 leading-tight">{card.title}</h2>
                      <p className="font-bold text-base md:text-xl mb-8">{card.subtitle}</p>
                      
                      {(card.id === 'contact_form' || card.isContactForm) ? (
                         <UniversalContactForm 
                            ctaText={card.cta} 
                            inputClass="p-4 w-full bg-white border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:bg-[#FF90E8] outline-none text-black font-bold uppercase rounded-none"
                            btnClass="p-4 w-full bg-black text-white border-[4px] border-black font-black uppercase tracking-widest hover:translate-y-1 hover:translate-x-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all flex items-center justify-center gap-2 mt-4"
                         />
                      ) : (
                         <button onClick={() => {
                            if (card.isAcademy) window.location.href = '/academy';
                            else if (card.isCrm) window.location.href = '/dashboard/crm';
                            else if (card.isHrm) window.location.href = '/dashboard/hr';
                         }} className="w-full md:w-fit px-8 py-4 bg-white border-[4px] border-black font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all flex items-center justify-center gap-2">
                            {card.cta} <Zap className="w-4 h-4" />
                         </button>
                      )}
                    </div>
                 </div>

                 {card.projects && (
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 border-t-[4px] border-black">
                       {card.projects.map((proj: any, idx: number) => (
                          <div 
                            key={proj.id} 
                            onClick={() => onPreviewProject?.(proj)}
                            className={`bg-white border-[4px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform ${idx % 2 === 0 ? '-rotate-1' : 'rotate-1'} hover:rotate-0 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer group`}
                          >
                             <div className="aspect-[4/3] w-full border-[4px] border-black mb-4 overflow-hidden bg-black relative flex items-center justify-center">
                                {proj.image ? (
                                  <img loading="lazy" src={proj.image} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0 group-hover:scale-105" />
                                ) : (
                                  <div className="flex flex-col items-center justify-center p-4 text-center bg-white w-full h-full">
                                    <Globe className="w-8 h-8 mb-2 text-black" />
                                    <span className="text-xs font-mono font-bold">{proj.title || 'Live Website'}</span>
                                  </div>
                                )}
                                <div className="absolute top-2 right-2 bg-[#FFC900] border-[2px] border-black px-2 py-0.5 text-[9px] font-black uppercase flex items-center gap-1">
                                   <Eye className="w-2.5 h-2.5" /> LIVE
                                </div>
                             </div>
                             <div className="font-black uppercase text-xl text-center">{proj.title}</div>
                          </div>
                       ))}
                    </div>
                 )}

              </div>
            ))}
         </div>
      </div>
    </div>
  )
}

// --- 07. PAPER CRAFT STUDIO ---
const LayoutPaperCraft = ({ cards, onPreviewProject }: any) => {
  return (
    <div data-lenis-prevent className="h-[100dvh] w-full bg-[#fdfbf7] overflow-y-auto font-sans text-[#4a4a4a] relative pb-32">
      <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')] opacity-10 mix-blend-multiply pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-24 md:pt-32 pb-4 text-center relative z-10">
         <div className="inline-block relative p-8 md:p-12 bg-[#fdf8b5] shadow-[2px_4px_15px_rgba(0,0,0,0.1)] transform rotate-2" style={{ borderRadius: '2px 15px 3px 20px / 15px 5px 20px 3px' }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 md:w-24 h-6 md:h-8 bg-[#e6dfa8]/80 shadow-sm transform -rotate-3" />
            <h1 className="text-2xl md:text-5xl font-serif text-[#2c2c2c] max-w-4xl leading-relaxed font-bold">Do you have the courage to stand out from the rest, or do you want to use a template?</h1>
         </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-12 py-12 columns-1 md:columns-2 lg:columns-3 gap-8 md:gap-12 space-y-8 md:space-y-12">
        {cards.map((card: CardData, i: number) => (
          <div key={card.id} className="break-inside-avoid relative p-6 md:p-10 bg-white shadow-[2px_4px_15px_rgba(0,0,0,0.05)] transform transition-transform hover:scale-105 hover:-rotate-1" style={{ rotate: `${(i % 3 - 1) * 2}deg`, borderRadius: '2px 15px 3px 20px / 15px 5px 20px 3px', border: '1px solid #e0dcd3' }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 md:w-16 h-5 md:h-6 bg-[#f0ecd6]/80 shadow-sm transform -rotate-3" />
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-dashed border-[#dcd8c8] flex items-center justify-center mb-6" style={{ color: card.colorHex }}>{renderIcon(card.iconName, card.icon)}</div>
            <div className="text-[10px] uppercase tracking-widest text-[#a09c90] mb-2">{card.category}</div>
            <h2 className="text-xl md:text-3xl font-bold mb-4 font-serif text-[#2c2c2c] leading-tight">{card.title}</h2>
            <p className="text-[#7a7a7a] leading-relaxed font-medium text-sm mb-8">{card.subtitle}</p>
            
            {card.projects && (
               <div className="flex flex-col gap-6 mb-8 mt-4 pt-8 border-t border-dashed border-[#e0dcd3]">
                  {card.projects.map((proj: any, idx: number) => (
                     <div 
                        key={proj.id} 
                        onClick={() => onPreviewProject?.(proj)}
                        className={`p-3 pb-8 bg-white shadow-md border border-[#eee] transform ${idx % 2 === 0 ? 'rotate-2' : '-rotate-2'} hover:rotate-0 hover:scale-105 transition-transform cursor-pointer relative group`}
                     >
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-[#e6dfa8]/80 shadow-sm transform -rotate-2 z-10" />
                        <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden mb-3 border border-gray-200 relative">
                           <img loading="lazy" src={proj.image} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                           <div className="absolute bottom-2 right-2 bg-black/80 text-white rounded px-2 py-0.5 text-[8px] font-serif flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="w-2 h-2 text-emerald-400" /> View Live
                           </div>
                        </div>
                        <div className="font-serif text-center text-xs text-[#2c2c2c] italic">{proj.title}</div>
                     </div>
                  ))}
               </div>
            )}

            {card.id === 'contact_form' ? (
               <UniversalContactForm 
                  ctaText={card.cta} 
                  inputClass="p-3 w-full bg-transparent border-b-2 border-dashed border-[#dcd8c8] rounded-none outline-none focus:border-[#7a7a7a] text-[#4a4a4a] text-sm font-medium"
                  btnClass="mt-6 p-3 w-full bg-[#2c2c2c] text-white rounded-[2px_10px_3px_10px_/_10px_3px_10px_2px] font-bold uppercase tracking-widest text-[10px] hover:bg-black transition-colors"
               />
            ) : (
               <button className="px-6 py-2 border-2 border-[#e0dcd3] text-[#4a4a4a] font-bold uppercase tracking-widest text-[10px] rounded-[10px_2px_10px_3px_/_2px_10px_3px_10px] hover:bg-[#f0ecd6] transition-colors w-full">
                  {card.cta}
               </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// --- 08. CINEMATIC STORYTELLING ---
const LayoutCinematic = ({ cards, onPreviewProject }: any) => {
  return (
    <div data-lenis-prevent className="h-[100dvh] w-full bg-black text-white overflow-y-auto snap-y snap-mandatory scroll-smooth font-sans">
       <div className="h-[100dvh] w-full snap-start snap-always flex flex-col items-center justify-center relative p-6 text-center">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-widest z-10">Grekam.</h1>
          <p className="text-lg md:text-3xl font-light text-white/80 mt-8 md:mt-12 z-10 max-w-4xl leading-relaxed">Do you have the courage to stand out from the rest, or do you want to use a template?</p>
       </div>
       {cards.map((card: CardData, i: number) => (
         <div key={card.id} className="h-[100dvh] w-full snap-start snap-always flex items-center relative overflow-hidden group">
           
           {/* Background shifts to project image if projects exist */}
           <AnimatePresence>
             {card.projects && card.projects[0] ? (
                <motion.div initial={{ scale: 1.1, opacity: 0 }} whileInView={{ scale: 1, opacity: 0.4 }} transition={{ duration: 2 }} className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${card.projects[0].image})` }} />
             ) : (
                <motion.div initial={{ scale: 1.2, opacity: 0 }} whileInView={{ scale: 1, opacity: 0.2 }} transition={{ duration: 1.5 }} className="absolute inset-0 bg-gradient-to-r from-black to-zinc-900" />
             )}
           </AnimatePresence>
           
           <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/80 to-transparent" />

           <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-center md:justify-start h-full pt-16 md:pt-0">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="w-full md:w-1/2 text-center md:text-left">
                 <div className="text-[10px] md:text-sm font-bold tracking-[0.3em] md:tracking-[0.5em] text-white/40 uppercase mb-6 md:mb-8">Scene 0{i+1} — {card.category}</div>
                 <h2 className="text-4xl md:text-7xl font-bold mb-6 md:mb-8 uppercase leading-tight drop-shadow-xl">{card.title}</h2>
                 <p className="text-lg md:text-2xl text-white/60 font-light mb-10 md:mb-12 drop-shadow-md">{card.subtitle}</p>
                 
                 {card.id === 'contact_form' ? (
                    <UniversalContactForm 
                       ctaText={card.cta} 
                       inputClass="p-4 w-full bg-white/5 border border-white/20 rounded-none outline-none focus:bg-white/10 text-white placeholder:text-white/40 uppercase tracking-widest text-xs backdrop-blur-md"
                       btnClass="p-5 w-full bg-white text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-gray-200 mt-4 flex items-center justify-center gap-2"
                    />
                 ) : (
                    <button className="px-10 py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-xs md:text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2 mx-auto md:mx-0 w-full md:w-fit">
                       {card.cta} <Zap className="w-4 h-4" />
                    </button>
                 )}

                 {card.projects && card.projects.length > 0 && (
                    <div className="mt-8 flex gap-3 flex-wrap">
                       {card.projects.map((proj: any) => (
                          <button 
                             key={proj.id} 
                             onClick={() => onPreviewProject?.(proj)}
                             className="px-4 py-2 bg-white/10 hover:bg-emerald-500 hover:text-black border border-white/20 backdrop-blur-md rounded-xl text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 transition-all hover:scale-105"
                          >
                             <Eye className="w-3 h-3" /> {proj.title}
                          </button>
                       ))}
                    </div>
                 )}
              </motion.div>
              
              <div className="hidden md:flex w-1/2 h-full items-center justify-end">
                 {card.projects ? (
                    <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.4 }} className="flex flex-col gap-6 mr-12 mt-32 h-[70vh] overflow-y-auto custom-scrollbar pr-4">
                       {card.projects.map((proj: any) => (
                          <div 
                            key={proj.id} 
                            onClick={() => onPreviewProject?.(proj)}
                            className="w-[400px] aspect-video bg-white/5 border border-white/20 rounded-2xl overflow-hidden relative cursor-pointer group/proj hover:border-emerald-500/50 transition-all shadow-xl"
                          >
                             {proj.image ? (
                               <img loading="lazy" src={proj.image} className="w-full h-full object-cover opacity-60 group-hover/proj:opacity-100 transition-all duration-700 group-hover/proj:scale-105" />
                             ) : (
                               <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-zinc-900/80">
                                 <Globe className="w-10 h-10 mb-2 text-emerald-400 opacity-70" />
                                 <span className="text-sm font-mono text-white/70 font-bold">{proj.title || 'Live Showcase'}</span>
                               </div>
                             )}
                             <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/proj:opacity-100 bg-black/50 transition-opacity">
                                <span className="font-bold tracking-widest uppercase text-white border border-white px-6 py-2 mb-2">{proj.title}</span>
                                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1"><Eye className="w-3 h-3" /> Live Showcase</span>
                             </div>
                          </div>
                       ))}
                    </motion.div>
                 ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.5 }} className="scale-[5] opacity-20 pointer-events-none mr-32" style={{ color: card.colorHex }}>
                      {renderIcon(card.iconName, card.icon)}
                    </motion.div>
                 )}
              </div>
           </div>
         </div>
       ))}
    </div>
  )
}

// --- 09. SWISS PRECISION ---
const LayoutSwissPrecision = ({ cards, onPreviewProject }: any) => {
  return (
    <div data-lenis-prevent className="h-[100dvh] w-full bg-white text-black font-sans overflow-y-auto pb-32 md:pb-0">
      <div className="border-b border-black p-8 md:p-16 mt-16 md:mt-0 text-center md:text-left flex flex-col md:flex-row justify-between md:items-end gap-8">
        <div>
           <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-6">Grekam System</h1>
           <p className="text-xl md:text-3xl font-medium max-w-4xl text-zinc-500">Do you have the courage to stand out from the rest, or do you want to use a template?</p>
        </div>
        <div className="text-sm font-bold uppercase tracking-widest">Version 2.0</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-min md:min-h-screen">
         {cards.map((card: CardData, i: number) => (
           <div key={card.id} className={`border-b md:border-b border-black p-6 md:p-10 flex flex-col justify-between md:aspect-square group transition-colors ${card.id !== 'contact_form' ? 'hover:bg-black hover:text-white cursor-pointer' : 'bg-gray-50'} ${i === 0 ? 'md:col-span-6 md:row-span-2' : card.id === 'contact_form' ? 'md:col-span-6' : 'md:col-span-3 md:border-r'}`}>
              <div className="flex justify-between items-start mb-8 md:mb-12">
                 <div className="text-[10px] font-bold uppercase tracking-widest opacity-50">{card.category}</div>
                 <div className="w-6 h-6 md:w-8 md:h-8 group-hover:invert transition-colors" style={{ color: card.colorHex }}>{renderIcon(card.iconName, card.icon)}</div>
              </div>
              <div className="flex flex-col flex-1 justify-end relative overflow-hidden">
                 <h2 className={`font-bold tracking-tight mb-4 ${i === 0 || card.id === 'contact_form' ? 'text-4xl md:text-6xl' : 'text-2xl md:text-3xl'} z-10`}>{card.title}</h2>
                 <p className="text-sm opacity-60 font-medium max-w-sm mb-8 z-10">{card.subtitle}</p>
                 
                 {card.projects && (
                    <div className="absolute inset-0 bg-black text-white p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20 flex flex-col justify-between">
                       <div className="text-[10px] uppercase tracking-widest opacity-50">Selected Works</div>
                       <div className="grid grid-cols-2 gap-4 mt-auto">
                          {card.projects.map((proj: any) => (
                             <div 
                                key={proj.id} 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onPreviewProject?.(proj)
                                }}
                                className="aspect-square bg-zinc-900 border border-zinc-800 overflow-hidden relative group/img cursor-pointer"
                             >
                                <img loading="lazy" src={proj.image} className="w-full h-full object-cover grayscale opacity-50 group-hover/img:grayscale-0 group-hover/img:opacity-100 group-hover/img:scale-105 transition-all duration-300" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex flex-col items-center justify-center p-2 text-center transition-opacity">
                                   <span className="text-[9px] font-mono font-bold uppercase text-white mb-1">{proj.title}</span>
                                   <span className="text-[8px] font-mono text-emerald-400 flex items-center gap-1"><Eye className="w-2.5 h-2.5" /> Preview</span>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 )}

                 {card.id === 'contact_form' ? (
                    <UniversalContactForm 
                       ctaText={card.cta} 
                       inputClass="p-4 w-full bg-white border border-black rounded-none outline-none focus:ring-2 focus:ring-black text-black font-medium text-sm"
                       btnClass="p-4 w-full bg-black text-white font-bold uppercase tracking-widest text-xs mt-4 hover:opacity-80 flex items-center justify-center gap-2"
                    />
                 ) : (
                    <div className="mt-auto border-t border-current pt-4 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 opacity-50 group-hover:opacity-100 z-10">
                       {card.cta} &rarr;
                    </div>
                 )}
              </div>
           </div>
         ))}
      </div>
    </div>
  )
}

// --- 10. CREATIVE UNIVERSE ---
const LayoutCreativeUniverse = ({ cards, playSound, onPreviewProject }: any) => {
  const [activeCard, setActiveCard] = useState<CardData | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => { 
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="h-[100dvh] w-full bg-[#030014] overflow-hidden relative flex items-center justify-center font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
      <div className="absolute w-[300px] h-[300px] md:w-[600px] md:h-[600px] border border-white/5 rounded-full animate-[spin_60s_linear_infinite]" />
      <div className="absolute w-[450px] h-[450px] md:w-[900px] md:h-[900px] border border-white/5 rounded-full animate-[spin_90s_linear_infinite_reverse]" />
      
      <div className={`absolute bottom-24 md:bottom-32 left-1/2 -translate-x-1/2 z-[40] w-full px-6 text-center pointer-events-none transition-opacity duration-500 bg-[#030014]/50 backdrop-blur-md py-4 rounded-3xl max-w-4xl ${activeCard ? 'opacity-0' : 'opacity-100'}`}>
        <h2 className="text-xl md:text-4xl font-bold text-white tracking-widest uppercase mb-4 drop-shadow-lg">Do you have the courage to stand out?</h2>
        <p className="text-white/50 tracking-[0.2em] uppercase text-[10px] md:text-sm">Or will you settle for another template?</p>
      </div>

      <div className="relative z-10 w-24 h-24 md:w-48 md:h-48 bg-white rounded-full shadow-[0_0_50px_rgba(255,255,255,0.8)] md:shadow-[0_0_100px_rgba(255,255,255,0.8)] flex items-center justify-center text-black">
        <h1 className="text-sm md:text-2xl font-black uppercase tracking-widest text-center">Grekam</h1>
      </div>

      {cards.map((card: CardData, i: number) => {
        const radius = isMobile ? (i % 2 === 0 ? 90 : 140) : (i % 2 === 0 ? 300 : 450)
        const angle = (i * (360 / cards.length)) * (Math.PI / 180)
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        return (
          <motion.div 
            key={card.id} 
            initial={{ x: 0, y: 0, opacity: 0 }} 
            animate={{ x, y, opacity: activeCard && activeCard.id !== card.id ? 0.2 : 1 }} 
            transition={{ duration: 2, type: "spring" }}
            className="absolute w-16 h-16 md:w-24 md:h-24 group cursor-pointer z-20"
            onClick={() => { playSound(); setActiveCard(card); }}
          >
            <div className={`w-full h-full rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-transform ${activeCard?.id === card.id ? 'scale-125 md:scale-150 ring-4 ring-white/50 bg-white/20' : 'group-hover:scale-125'}`} style={{ color: card.colorHex }}>
               {renderIcon(card.iconName, card.icon)}
            </div>
            {!isMobile && !activeCard && (
               <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 text-center opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  <div className="text-white font-bold text-xs tracking-widest uppercase">{card.title}</div>
               </div>
            )}
          </motion.div>
        )
      })}

      <AnimatePresence>
        {activeCard && (
           <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="absolute bottom-10 md:bottom-10 left-0 right-0 z-[120] flex justify-center p-4 pointer-events-none">
              <div className="pointer-events-auto w-full max-w-4xl bg-[#030014]/90 backdrop-blur-3xl border border-white/20 rounded-3xl p-6 pt-16 md:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
                 <button onClick={() => { playSound(); setActiveCard(null); }} className="absolute top-4 right-4 z-[130] text-white/50 hover:text-white p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                 
                 <div className="w-full md:w-1/2 text-center md:text-left">
                    <div className="text-[10px] md:text-xs text-white/50 uppercase tracking-widest mb-4">{activeCard.category}</div>
                    <h2 className="text-2xl md:text-4xl font-black text-white mb-4 uppercase">{activeCard.title}</h2>
                    <p className="text-sm md:text-base text-white/70 mb-8">{activeCard.subtitle}</p>
                    
                    {activeCard.id === 'contact_form' ? (
                       <UniversalContactForm 
                          ctaText={activeCard.cta} 
                          inputClass="p-3 w-full bg-black/40 border border-white/20 rounded-xl outline-none focus:border-white/50 text-white placeholder:text-white/40 text-sm"
                          btnClass="p-4 w-full bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-gray-200 mt-2 flex justify-center items-center gap-2"
                       />
                    ) : (
                       <button className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2 w-full md:w-fit mx-auto md:mx-0">
                          {activeCard.cta} <Zap className="w-4 h-4" />
                       </button>
                    )}
                 </div>

                 {activeCard.projects && (
                    <div className="w-full md:w-1/2 flex flex-col gap-4 max-h-[40vh] md:max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
                       {activeCard.projects.map((proj: any) => (
                          <div 
                            key={proj.id} 
                            onClick={() => onPreviewProject?.(proj)}
                            className="w-full h-32 shrink-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden relative group cursor-pointer hover:border-emerald-500/50 transition-all shadow-lg"
                          >
                             <img loading="lazy" src={proj.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
                             <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                                <span className="font-bold tracking-widest uppercase text-white text-[10px] border border-white px-4 py-1.5 mb-1">{proj.title}</span>
                                <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1"><Eye className="w-2.5 h-2.5" /> Launch Showcase</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// --- MAIN WRAPPER ---
type LayoutId = 'os' | 'cards' | 'editorial' | 'canvas' | 'gallery' | 'brutalism' | 'paper' | 'cinematic' | 'swiss' | 'universe'

const LAYOUTS: { id: LayoutId, name: string, component: any }[] = [
  { id: 'os', name: '01. Creative OS', component: LayoutCreativeOS },
  { id: 'cards', name: '02. Scattered Cards', component: LayoutScatteredCards },
  { id: 'editorial', name: '03. Editorial Magazine', component: LayoutEditorial },
  { id: 'canvas', name: '04. Infinite Canvas', component: LayoutInfiniteCanvas },
  { id: 'gallery', name: '05. Digital Gallery', component: LayoutDigitalGallery },
  { id: 'brutalism', name: '06. Neo Brutalism', component: LayoutNeoBrutalism },
  { id: 'paper', name: '07. Paper Craft', component: LayoutPaperCraft },
  { id: 'cinematic', name: '08. Cinematic Scroll', component: LayoutCinematic },
  { id: 'swiss', name: '09. Swiss Precision', component: LayoutSwissPrecision },
  { id: 'universe', name: '10. Creative Universe', component: LayoutCreativeUniverse },
]

export default function AgencyClient({ initialCards }: { initialCards: CardData[] }) {
  const [activeCard, setActiveCard] = useState<CardData>(initialCards[0] || {} as CardData)
  const [cards, setCards] = useState<CardData[]>(initialCards)
  const [activeLayout, setActiveLayout] = useState<LayoutId>('os')
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [activeProject, setActiveProject] = useState<ProjectData | null>(null)
  const [cmsData, setCmsData] = useState<any>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const themeParam = params.get('theme') as LayoutId | null
      const savedTheme = localStorage.getItem('grekam_agency_theme') as LayoutId | null
      if (themeParam && LAYOUTS.some(l => l.id === themeParam)) {
        setActiveLayout(themeParam)
      } else if (savedTheme && LAYOUTS.some(l => l.id === savedTheme)) {
        setActiveLayout(savedTheme)
      }
    }
  }, [])

  useEffect(() => {
    fetch('/api/v1/cms/pages/agency')
      .then(res => res.json())
      .then(data => {
        if (data?.data?.sections) {
          const config: any = {}
          data.data.sections.forEach((s: any) => {
            config[s.sectionId] = s.content
          })
          setCmsData(config)
        }
      })
      .catch(console.error)
  }, [])

  const baseCards = cmsData?.['agency-main-data'] || INITIAL_CARDS
  let currentCards = [...baseCards];
  
  // Dynamic CMS Portfolio Integration: If we have CMS portfolio, replace the DUMMY_PROJECTS
  if (cmsData?.portfolio && cmsData.portfolio.length > 0) {
    const portfolioProjects = cmsData.portfolio.map((p: any) => ({ 
      id: p.id, 
      title: p.title, 
      image: p.image,
      url: p.link || p.url || 'https://grekam.in',
      category: p.category || 'Featured Work',
      techStack: p.tags || ['Next.js', 'TailwindCSS', 'TypeScript']
    }))
    currentCards = currentCards.map(c => {
      if (c.id === 'branding' || c.id === 'webdev') {
        return { ...c, projects: portfolioProjects.slice(0, 3) }
      }
      return c
    })
  }

  // Auto-inject the special cards if they are missing so changes reflect immediately
  if (!currentCards.find(c => c.id === 'products' || c.isProducts)) {
    const defaultProductCard = INITIAL_CARDS.find(c => c.id === 'products');
    if (defaultProductCard) currentCards.push(defaultProductCard);
  }
  if (!currentCards.find(c => c.id === 'portfolio' || c.isPortfolio)) {
    const defaultPortfolioCard = INITIAL_CARDS.find(c => c.id === 'portfolio');
    if (defaultPortfolioCard) currentCards.push(defaultPortfolioCard);
  }
  if (!currentCards.find(c => c.id === 'academy' || c.isAcademy)) {
    const defaultAcademyCard = INITIAL_CARDS.find(c => c.id === 'academy');
    if (defaultAcademyCard) currentCards.push(defaultAcademyCard);
  }
  if (!currentCards.find(c => c.id === 'pricing' || c.isPricing)) {
    const defaultPricingCard = INITIAL_CARDS.find(c => c.id === 'pricing');
    if (defaultPricingCard) currentCards.push(defaultPricingCard);
  }

  const playSound = () => {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    } catch(e) {}
  }

  const handlePreviewProject = (proj: any) => {
    if (!proj) return
    let rawUrl = proj.url || proj.link
    // Auto-detect if title is a URL (e.g. 'https://www.raaghas.in' or 'grafty.pro')
    if (!rawUrl && proj.title && (proj.title.startsWith('http://') || proj.title.startsWith('https://') || proj.title.includes('.'))) {
      rawUrl = proj.title.startsWith('http') ? proj.title : `https://${proj.title}`
    }
    if (!rawUrl) rawUrl = 'https://grekam.in'

    let cleanTitle = proj.title || 'Live Website'
    if (cleanTitle.startsWith('http://') || cleanTitle.startsWith('https://')) {
      try {
        const parsed = new URL(cleanTitle)
        cleanTitle = parsed.hostname.replace(/^www\./, '')
      } catch(e) {}
    }

    setActiveProject({
      id: proj.id || `p-${Date.now()}`,
      title: cleanTitle,
      image: proj.image || '',
      url: rawUrl,
      category: proj.category || 'Client Website',
      techStack: Array.isArray(proj.techStack) ? proj.techStack : (proj.tags || ['Next.js', 'TailwindCSS', 'TypeScript']),
      description: proj.description || 'Interactive live web application showcase.'
    })
  }

  // Pre-warm preview proxy cache for all projects in the background
  useEffect(() => {
    if (typeof window === 'undefined') return
    const timer = setTimeout(() => {
      const urls: string[] = []
      currentCards.forEach(c => {
        if (c.projects) {
          c.projects.forEach(p => {
            const u = p.url || (p.title?.startsWith('http') ? p.title : undefined)
            if (u && !u.startsWith('/') && !urls.includes(u)) urls.push(u)
          })
        }
      })
      urls.forEach(u => {
        const full = u.startsWith('http') ? u : `https://${u}`
        fetch(`/api/preview-proxy?url=${encodeURIComponent(full)}`, { priority: 'low' } as any).catch(() => {})
      })
    }, 1200)
    return () => clearTimeout(timer)
  }, [currentCards])

  const ActiveComponent = LAYOUTS.find(l => l.id === activeLayout)?.component

  const isLightMode = ['editorial', 'canvas', 'bento', 'organic', 'minimal', 'paper', 'swiss'].includes(activeLayout)
  const isBrutal = activeLayout === 'brutalism'

  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false)

  return (
    <div data-lenis-prevent className="relative w-full h-[100dvh] overflow-hidden bg-black">
      {/* Header */}
      <header className={`absolute top-0 left-0 right-0 z-[999] h-16 px-4 md:px-8 flex items-center justify-between pointer-events-none ${isBrutal ? 'bg-transparent' : ''}`}>
        
        {/* Logo / Brand */}
        <a href="/" className={`pointer-events-auto flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-widest uppercase transition-all
          ${isBrutal ? 'text-black' : isLightMode ? 'text-black' : 'text-white/70 hover:text-white'}`}>
          <Orbit className="w-4 h-4" /> Grekam Visuals
        </a>

        {/* Nav Links (Center) */}
        <nav className="pointer-events-auto hidden md:flex items-center gap-6">
          {[
            { label: 'Home', href: '/' },
            { label: 'Academy', href: 'https://academy.grekam.in', external: true },
            { label: 'Contact', href: '/contact' },
            { label: 'Login', href: '/auth/login' },
          ].map(({ label, href, external }) => (
            <a 
              key={label} 
              href={href} 
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className={`text-[10px] font-bold tracking-widest uppercase transition-all hover:opacity-100 opacity-60 flex items-center gap-1
              ${isBrutal ? 'text-black' : isLightMode ? 'text-black' : 'text-white'}`}
            >
              {label}
              {external && <ExternalLink className="w-2.5 h-2.5 opacity-50" />}
            </a>
          ))}
        </nav>

        {/* Right Actions: Academy Button + Choose Concept Dropdown */}
        <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
           {/* Academy Pill Button */}
           <a 
             href="https://academy.grekam.in" 
             target="_blank" 
             rel="noopener noreferrer"
             className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-[10px] md:text-xs font-bold tracking-wider uppercase transition-all backdrop-blur-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] group"
           >
             <GraduationCap className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
             <span className="hidden sm:inline">Academy</span>
             <ExternalLink className="w-2.5 h-2.5 opacity-60" />
           </a>

           <div className="relative">
             <button 
               onClick={() => {
                  setShowMenu(!showMenu)
                  if(!audioCtx) setAudioCtx(new (window.AudioContext || (window as any).webkitAudioContext)())
               }} 
               className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full border text-[10px] md:text-xs font-bold tracking-widest uppercase transition-all backdrop-blur-md
                 bg-gradient-to-r from-[#218558] to-[#0E4E7E] text-white border-none hover:opacity-90 shadow-[0_0_20px_rgba(33,133,88,0.3)]`}
             >
               CHOOSE THEME <ChevronDown className="w-3 h-3" />
             </button>
             
             {showMenu && (
               <div className={`absolute top-full right-0 mt-2 md:mt-4 p-2 min-w-[200px] md:min-w-[240px] flex flex-col gap-1 shadow-2xl overflow-y-auto max-h-[60vh] custom-scrollbar
                 ${isBrutal ? 'bg-white border-[4px] border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' : 
                   isLightMode ? 'bg-white/95 backdrop-blur-xl border border-black/10 rounded-2xl' : 'bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl'}`}
               >
                 {LAYOUTS.map((layout) => (
                   <button 
                     key={layout.id}
                     onClick={() => { 
                       setActiveLayout(layout.id); 
                       if (typeof window !== 'undefined') localStorage.setItem('grekam_agency_theme', layout.id);
                       setShowMenu(false); 
                       playSound(); 
                     }}
                     className={`text-left px-3 md:px-4 py-2 md:py-3 text-[10px] md:text-sm font-bold transition-all uppercase tracking-wider
                       ${isBrutal ? 'text-black border-b-[2px] border-black last:border-0 hover:bg-[#FFC900]' : 
                         isLightMode ? 'text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-xl' : 'text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl'}
                       ${activeLayout === layout.id ? (isLightMode && !isBrutal ? 'bg-zinc-100 text-black' : !isBrutal ? 'bg-zinc-800 text-white' : 'bg-[#FF90E8]') : ''}`}
                   >
                     {layout.name}
                   </button>
                 ))}
               </div>
             )}
           </div>
        </div>

      </header>


      <div className="w-full h-full relative z-0 overflow-y-auto custom-scrollbar">
        {/* Render the Active Theme Layout */}
        {ActiveComponent && (
          <ActiveComponent 
            cards={currentCards} 
            playSound={playSound} 
            cmsData={cmsData} 
            onPreviewProject={handlePreviewProject}
          />
        )}
        
        {/* Render all custom HTML sections (faq, contact, etc.) below the theme */}
        {cmsData && Object.entries(cmsData).map(([key, sectionContent]: [string, any]) => {
          if (key === 'cards') return null; // 'cards' is passed directly into the layouts above
          if (key === 'custom_html') return null; // ignore the legacy override section if it exists
          if (sectionContent?.type === 'html' && sectionContent?.html) {
            return (
              <div key={key} dangerouslySetInnerHTML={{ __html: sectionContent.html }} />
            )
          }
          return null;
        })}
      </div>

      {/* Multi-Device Live Showcase Frame Modal */}
      <DevicePreviewModal 
        project={activeProject} 
        onClose={() => setActiveProject(null)} 
      />

      {/* Floating Strategy Call Widget */}
      <div className="hidden md:block fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[1000] pointer-events-auto">
        <button 
          onClick={() => setIsStrategyModalOpen(true)}
          className="group relative flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] hover:scale-105 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-white/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          <CalendarDays className="w-5 h-5 relative z-10" />
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest relative z-10">Book Strategy Call</span>
        </button>
      </div>

      {/* Strategy Call Modal */}
      <AnimatePresence>
        {isStrategyModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1001] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto"
            onClick={() => setIsStrategyModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-zinc-950 border border-white/10 rounded-3xl p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsStrategyModalOpen(false)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Book a Strategy Call</h2>
                <p className="text-white/50 text-sm">Schedule a free 30-minute consultation with our lead architects to discuss your project requirements.</p>
              </div>

              <UniversalContactForm 
                ctaText="Schedule Now" 
                inputClass="p-4 w-full bg-white/5 border border-white/10 rounded-xl outline-none focus:border-white/30 transition-colors text-white placeholder:text-white/30 text-sm mb-2"
                btnClass="p-4 w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold tracking-widest uppercase transition-all mt-4 flex justify-center items-center gap-2"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── AGENCY FOOTER ─── */}
      <footer className="border-t border-white/[0.06] bg-[#090909] mt-20">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">

            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <div className="text-xl font-black tracking-tight text-white mb-2">GREKAM<span className="text-emerald-400">.</span></div>
              <p className="text-white/40 text-sm leading-relaxed mb-6">Premium digital experiences for brands that mean business. Based in Coimbatore, serving clients across India.</p>
              <div className="space-y-2">
                <a href="mailto:admin@grekam.in" className="flex items-center gap-2 text-sm text-white/40 hover:text-emerald-400 transition-colors">
                  <Mail className="w-3.5 h-3.5" /> admin@grekam.in
                </a>
                <a href="tel:+919843199556" className="flex items-center gap-2 text-sm text-white/40 hover:text-emerald-400 transition-colors">
                  <Phone className="w-3.5 h-3.5" /> +91 98431 99556
                </a>
                <div className="flex items-start gap-2 text-sm text-white/40">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" /> Coimbatore, Tamil Nadu, India
                </div>
              </div>
            </div>

            {/* Services column */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-5">Services</p>
              <ul className="space-y-2.5">
                {[
                  "Web Design & Development",
                  "E-commerce Solutions",
                  "Branding & Identity",
                  "Digital Marketing",
                  "WhatsApp Automation",
                  "Video Production",
                ].map(s => (
                  <li key={s}><a href="#" className="text-sm text-white/40 hover:text-white transition-colors">{s}</a></li>
                ))}
              </ul>
            </div>

            {/* Company column */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-5">Company</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Portfolio", href: "#portfolio" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "Grekam Academy", href: "/academy" },
                  { label: "Contact Us", href: "/contact" },
                  { label: "Client Portal", href: "/portal" },
                ].map(l => (
                  <li key={l.label}><Link href={l.href} className="text-sm text-white/40 hover:text-white transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Policies column */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-5">Policies</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Terms & Conditions", href: "/legal/terms" },
                  { label: "Privacy Policy", href: "/legal/privacy" },
                  { label: "Payment & Billing", href: "/legal/payment" },
                  { label: "Cancellation & Refunds", href: "/legal/refunds" },
                  { label: "Service Delivery", href: "/legal/delivery" },
                  { label: "Revision & Scope", href: "/legal/revisions" },
                  { label: "Intellectual Property", href: "/legal/ip" },
                  { label: "Maintenance & Support", href: "/legal/maintenance" },
                  { label: "Data Deletion", href: "/legal/data-deletion" },
                ].map(l => (
                  <li key={l.label}><Link href={l.href} className="text-sm text-white/40 hover:text-white transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/25">© {new Date().getFullYear()} Grekam Visuals. All rights reserved. GST Registered. Coimbatore, Tamil Nadu, India.</p>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <Link href="/legal/terms" className="text-xs text-white/25 hover:text-white/60 transition-colors">Terms</Link>
              <Link href="/legal/privacy" className="text-xs text-white/25 hover:text-white/60 transition-colors">Privacy</Link>
              <Link href="/legal/payment" className="text-xs text-white/25 hover:text-white/60 transition-colors">Payment Policy</Link>
              <Link href="/legal/refunds" className="text-xs text-white/25 hover:text-white/60 transition-colors">Refunds</Link>
            </div>
          </div>

        </div>
      </footer>

    </div>
  )
}
