"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion"
import Link from "next/link"
import { X, Sparkles, Code2, Rocket, Palette, Fingerprint, Users, Volume2, VolumeX, TriangleAlert, Mail, Phone, MapPin, Send, ChevronDown, Orbit, CheckCircle2 } from "lucide-react"

// --- DATA ---
type ProjectData = { id: string; title: string; image: string }
type CardData = { id: string; category: string; title: string; subtitle: string; icon?: React.ReactNode; iconName?: string; colorHex: string; isGlitch?: boolean; cta?: string; projects?: ProjectData[]; isContactForm?: boolean; isProducts?: boolean; isPortfolio?: boolean; isAcademy?: boolean; isCrm?: boolean; isHrm?: boolean; }

const DUMMY_PROJECTS: ProjectData[] = [
  { id: 'p1', title: 'Aura SaaS Platform', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80' },
  { id: 'p2', title: 'Lumina Dashboard', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80' },
  { id: 'p3', title: 'Nexus Mobile App', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80' },
]

const BRANDING_PROJECTS: ProjectData[] = [
  { id: 'b1', title: 'Vanguard Identity', image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80' },
  { id: 'b2', title: 'Zephyr Campaign', image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80' },
]

// Removed INITIAL_CARDS constant

// Dynamic Icon Renderer Helper
import * as Icons from "lucide-react"
const renderIcon = (iconName?: string, fallbackIcon?: React.ReactNode, className?: string) => {
  if (iconName && (Icons as any)[iconName]) {
    const IconComponent = (Icons as any)[iconName]
    return <IconComponent className={className || "w-8 h-8 md:w-12 md:h-12"} />
  }
  return fallbackIcon || <Sparkles className={className || "w-8 h-8 md:w-12 md:h-12"} />
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
          <option value="+91">🇮🇳 +91</option>
          <option value="+1">🇺🇸 +1</option>
          <option value="+44">🇬🇧 +44</option>
          <option value="+61">🇦🇺 +61</option>
          <option value="+81">🇯🇵 +81</option>
          <option value="+49">🇩🇪 +49</option>
        </select>
        <input required name="phone" type="tel" placeholder="Phone Number" className={inputClass} />
      </div>
      <textarea required name="notes" placeholder="Technical Brief / Inquiry Details" className={`${inputClass} h-32 resize-none`} />
      <button disabled={isSubmitting} type="submit" className={`${btnClass} disabled:opacity-50`}>
         {isSubmitting ? "Sending..." : ctaText} <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </form>
  )
}

// --- 01. CREATIVE OS ---
const LayoutCreativeOS = ({ cards, playSound }: any) => {
  const [activeCard, setActiveCard] = useState<CardData | null>(null)
  const mouseX = useMotionValue(Infinity)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => { setIsMobile(window.innerWidth < 768) }, [])
  
  return (
    <div className="h-[100dvh] w-full bg-zinc-950 overflow-hidden relative font-sans text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#3b0764,transparent_50%),radial-gradient(ellipse_at_bottom,#064e3b,transparent_50%)] opacity-40 blur-3xl" />
      
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10 w-full px-6 transition-opacity duration-500 ${activeCard ? 'opacity-0' : 'opacity-100'}`}>
        <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tight">Do you have the courage to <br className="hidden md:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">stand out?</span></h1>
        <p className="text-xl md:text-3xl text-white/50 font-light max-w-3xl mx-auto leading-relaxed">Or will you settle for another template? We don't build standard websites. We engineer bespoke digital experiences.</p>
      </div>

      <div className="absolute bottom-6 md:bottom-10 left-0 right-0 z-40 flex justify-center w-full px-4 pointer-events-none">
         <motion.div onMouseMove={(e) => mouseX.set(e.clientX)} onMouseLeave={() => mouseX.set(Infinity)} className="flex h-20 md:h-24 items-center gap-3 md:gap-6 px-4 md:px-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl overflow-x-auto max-w-full custom-scrollbar pointer-events-auto">
           {cards.map((card: CardData) => {
             const ref = useRef<HTMLButtonElement>(null)
             const distance = useTransform(mouseX, (val) => val - (ref.current?.getBoundingClientRect().x ?? 0) - 32)
             const widthSync = useTransform(distance, [-150, 0, 150], [isMobile ? 48 : 64, isMobile ? 60 : 100, isMobile ? 48 : 64])
             const width = useSpring(widthSync, { mass: 0.1, stiffness: 200, damping: 15 })
             return (
               <motion.button key={card.id} ref={ref} style={{ width, height: width }} onClick={() => { playSound(); setActiveCard(card); }} className="relative flex items-center justify-center bg-white/10 border border-white/20 hover:bg-white/20 rounded-[1.2rem] md:rounded-[1.5rem] shrink-0 [&>svg]:w-6 [&>svg]:h-6 md:[&>svg]:w-8 md:[&>svg]:h-8">
                 {renderIcon(card.iconName, card.icon)}
               </motion.button>
             )
           })}
         </motion.div>
      </div>
      <AnimatePresence>
         {activeCard && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none p-4 md:p-12 mb-24 md:mb-32">
              <div className="pointer-events-auto w-full max-w-5xl h-full md:h-[80vh] max-h-[900px] bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] flex flex-col overflow-hidden shadow-2xl">
                <div className="h-14 md:h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/5 shrink-0">
                  <div className="text-[10px] md:text-xs uppercase tracking-widest text-white/50">{activeCard.category}</div>
                  <button onClick={() => { playSound(); setActiveCard(null); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 p-6 md:p-12 flex flex-col items-center text-center overflow-y-auto custom-scrollbar">
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 md:mb-8 shrink-0" style={{ color: activeCard.colorHex }}>{renderIcon(activeCard.iconName, activeCard.icon)}</div>
                  <h1 className="text-3xl md:text-5xl font-bold mb-4">{activeCard.title}</h1>
                  <p className="text-lg md:text-xl text-white/50 max-w-2xl mb-8 md:mb-12 shrink-0">{activeCard.subtitle}</p>
                  
                  {activeCard.projects && activeCard.projects.length > 0 && (
                     <div className="w-full mt-auto">
                        <div className="text-left text-xs uppercase tracking-widest text-white/30 mb-4">Featured Projects</div>
                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                           {activeCard.projects.map(proj => (
                              <div key={proj.id} className="w-64 md:w-80 shrink-0 snap-start bg-white/5 border border-white/10 rounded-2xl overflow-hidden group cursor-pointer hover:bg-white/10 transition-colors">
                                 <div className="h-40 md:h-48 w-full bg-zinc-900 overflow-hidden">
                                    <img src={proj.image} alt={proj.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                 </div>
                                 <div className="p-4 text-left font-bold text-sm md:text-base truncate">{proj.title}</div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {activeCard.id === 'contact_form' && (
                     <div className="w-full max-w-2xl text-left mt-auto">
                        <UniversalContactForm 
                          ctaText={activeCard.cta} 
                          inputClass="p-4 w-full bg-black/50 border border-white/10 rounded-xl outline-none focus:border-white/30 transition-colors text-white placeholder:text-white/30" 
                          btnClass="p-4 w-full bg-white text-black hover:bg-white/90 rounded-xl font-bold tracking-widest uppercase mt-4 flex items-center justify-center gap-2 group" 
                        />
                     </div>
                  )}
                  
                  {!activeCard.projects && activeCard.id !== 'contact_form' && (
                     <button onClick={() => {
                        if (activeCard.isAcademy) window.location.href = '/academy';
                        else if (activeCard.isCrm) window.location.href = '/dashboard/crm';
                        else if (activeCard.isHrm) window.location.href = '/dashboard/hr';
                     }} className="mt-8 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-white/90 shadow-lg shadow-white/10 transition-all uppercase tracking-widest text-sm flex items-center gap-2">
                        {activeCard.cta} <Sparkles className="w-4 h-4" />
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

// --- 02. SCATTERED CARDS ---
const LayoutScatteredCards = ({ cards, playSound, cmsData }: any) => {
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

  const renderCardContent = (card: CardData, isActive: boolean, isRectangle: boolean, isSmallSquare: boolean, isDesktopShrunk: boolean = false) => (
    <div className={`flex w-full h-full relative ${isActive ? 'flex-1 flex-col' : (isRectangle ? 'flex-1 flex-row items-center gap-3' : (isSmallSquare ? 'items-center justify-center' : (isDesktopShrunk ? 'flex-col items-center justify-center text-center' : 'flex-1 flex-col')))}`}>
      {(!isDesktopShrunk && (!isMobile || isActive)) && <div className="text-[10px] md:text-xs tracking-widest text-white/40 uppercase mb-6 md:mb-8 pr-12">{card.category}</div>}
      
      <div className={`relative w-full ${isSmallSquare ? 'h-full flex items-center justify-center' : (isDesktopShrunk ? 'flex justify-center mb-4' : (isActive ? 'flex justify-between items-center mb-6' : 'flex justify-start items-center mb-6 md:mb-8'))}`}>
         <div className={`${isSmallSquare ? 'w-full h-full flex items-center justify-center' : `rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 ${isRectangle ? 'w-12 h-12' : (isDesktopShrunk ? 'w-16 h-16' : 'w-16 h-16 md:w-20 md:h-20')}`}`} style={{ color: card.colorHex }}>{renderIcon(card.iconName, card.icon, isSmallSquare ? "w-6 h-6" : (isRectangle ? "w-5 h-5" : undefined))}</div>
         
         {isActive && (
           <button 
             onClick={(e) => { e.stopPropagation(); playSound(); setActiveId(null); }} 
             className="z-[120] hover:opacity-70 transition-opacity p-2 -mr-2"
             style={{ color: card.colorHex }}
           >
             <X className="w-6 h-6 md:w-8 md:h-8" />
           </button>
         )}
      </div>
      
      {(!isSmallSquare) && (
        <h2 className={`font-bold text-white ${isActive ? 'text-3xl md:text-5xl mb-2' : (isRectangle ? 'text-[11px] leading-tight text-left' : (isDesktopShrunk ? 'text-base leading-tight' : 'text-2xl mb-2'))}`}>{card.title}</h2>
      )}
      
      {(!isDesktopShrunk && (!isMobile || isActive)) && <p className={`text-white/60 mb-8 ${isActive ? 'text-lg md:text-xl max-w-2xl' : 'text-sm'}`}>{card.subtitle}</p>}
      
      {isActive && card.projects && (
         <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {card.projects.map((proj: any, idx: number) => (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={proj.id} className="relative aspect-video rounded-xl overflow-hidden group border border-white/10 cursor-pointer">
                  <img src={proj.image} alt={proj.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                     <div className="font-bold text-white tracking-widest uppercase text-xs">{proj.title}</div>
                  </div>
               </motion.div>
            ))}
         </div>
      )}

      {isActive && card.isProducts && cmsData?.products && (
         <div className="mt-8 w-full">
            <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar snap-x">
               {cmsData.products.map((prod: any, idx: number) => (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} key={prod.id || idx} className="w-72 shrink-0 snap-start bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col group">
                     <div className="aspect-video bg-black/50 overflow-hidden relative">
                        {prod.image && <img src={prod.image} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                     </div>
                     <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-bold text-white text-lg mb-2">{prod.title}</h3>
                        <p className="text-white/50 text-sm mb-4 line-clamp-2 flex-1">{prod.description}</p>
                        {prod.link && (
                           <a href={prod.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-[#f43f5e] hover:text-white transition-colors mt-auto inline-block">
                              View Demo &rarr;
                           </a>
                        )}
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      )}

      {isActive && card.isPortfolio && cmsData?.portfolio && (
         <div className="mt-8 w-full max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
            <div className="columns-2 md:columns-3 gap-4 space-y-4">
               {cmsData.portfolio.map((item: any, idx: number) => (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }} key={item.id || idx} className="break-inside-avoid relative group rounded-xl overflow-hidden border border-white/10">
                     {item.image && <img src={item.image} alt={item.title || 'Portfolio Item'} className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" />}
                     {item.title && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                           <div className="font-bold text-white text-xs uppercase tracking-widest">{item.title}</div>
                        </div>
                     )}
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
               <Sparkles className="w-5 h-5" />
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

      {isActive && (
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
                {card.cta} <Sparkles className="w-4 h-4" />
             </button>
          )}
        </div>
      )}
    </div>
  )
  
  return (
    <div ref={containerRef} className="h-[100dvh] w-full bg-[#111] overflow-hidden flex items-center justify-center perspective-[1000px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent)]" />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:-translate-y-[60%] text-center pointer-events-none z-10 w-full px-6">
        <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tight text-white drop-shadow-2xl">Do you have the courage to stand out?</h1>
        <p className="text-xl md:text-2xl text-white/60 font-medium max-w-2xl mx-auto drop-shadow-lg">Or will you settle for another template?</p>
      </div>

      <AnimatePresence>
        {activeId && <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-[100] backdrop-blur-md" onClick={() => setActiveId(null)} />}
        {activeId && (() => {
          const activeCard = cards.find((c: CardData) => c.id === activeId)
          if (!activeCard) return null
          return (
            <motion.div
              layoutId={`card-${activeCard.id}`}
              className="fixed inset-0 m-auto bg-zinc-900 border border-white/10 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,1)] w-[90vw] md:w-[900px] h-auto max-h-[90vh] z-[110] flex flex-col p-6 md:p-10 pb-24 md:pb-10 overflow-y-auto custom-scrollbar cursor-default pointer-events-auto"
            >
              {renderCardContent(activeCard, true, false, false)}
            </motion.div>
          )
        })()}
      </AnimatePresence>
      
      {cards.map((card: CardData, i: number) => {
        const isActive = activeId === card.id
        const randomRot = (i % 2 === 0 ? 1 : -1) * (i * 5 + 5)
        const randomX = (i % 3 === 0 ? 1 : -1) * (i * 10)
        
        let inactiveWidth = '320px'
        let inactiveHeight = '450px'
        
        if (isMobile) {
          inactiveWidth = '64px'
          inactiveHeight = '64px'
        } else {
          // Default desktop inactive cards are now always square
          inactiveWidth = '180px'
          inactiveHeight = '180px'
        }
        
        const isSmallSquare = isMobile && !isActive;
        const isRectangle = false;
        const isDesktopShrunk = !isMobile && !isActive;
        
        // Ensure that even if text is empty, the container forces itself to a square
        const baseClass = `absolute bg-zinc-900 border border-white/10 rounded-3xl flex cursor-grab active:cursor-grabbing shadow-2xl overflow-hidden`;
        let stateClass = '';
        if (isSmallSquare) {
          stateClass = 'p-0 items-center justify-center';
        } else if (isRectangle) {
          stateClass = 'flex-row p-3 items-center';
        } else if (isDesktopShrunk) {
          stateClass = 'flex-col p-4 items-center justify-center min-w-[180px] min-h-[180px]';
        } else {
          stateClass = 'flex-col p-6 md:p-10 overflow-y-auto custom-scrollbar';
        }
        return (
          <motion.div
            key={card.id} 
            layoutId={`card-${card.id}`} 
            drag dragConstraints={containerRef} dragMomentum={false}
            onDragStart={() => isDragging.current = true}
            onDragEnd={() => setTimeout(() => isDragging.current = false, 50)}
            onClick={() => { 
               if (isDragging.current) return;
               setHasOpenedCard(true); playSound(); setActiveId(card.id) 
            }}
            initial={{ rotate: randomRot, x: randomX, y: 0 }}
            animate={{ width: inactiveWidth, height: inactiveHeight }}
            style={{ zIndex: i + 20, opacity: isActive ? 0 : 1, pointerEvents: isActive ? 'none' : 'auto' }}
            className={`${baseClass} ${stateClass}`}
          >
            {renderCardContent(card, false, isRectangle, isSmallSquare, isDesktopShrunk)}
          </motion.div>
        )
      })}
    </div>
  )
}

// --- 03. EDITORIAL MAGAZINE ---
const LayoutEditorial = ({ cards }: any) => {
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
                     {card.projects.map((proj) => (
                        <div key={proj.id} className="w-full">
                           <div className="w-full aspect-[4/3] bg-[#e8e4de] overflow-hidden mb-4">
                              <img src={proj.image} alt={proj.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                           </div>
                           <div className="text-[10px] font-sans uppercase tracking-widest text-[#2c2a29]">{proj.title}</div>
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
                    {card.cta} <Sparkles className="w-3 h-3" />
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
const LayoutInfiniteCanvas = ({ cards }: any) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  return (
    <div className="h-[100dvh] w-full bg-zinc-100 overflow-hidden relative cursor-grab active:cursor-grabbing font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="absolute bottom-8 md:top-24 md:bottom-auto left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-lg border border-zinc-200 text-xs font-bold tracking-widest text-zinc-600 uppercase z-50 pointer-events-none flex items-center gap-2">
         <Sparkles className="w-4 h-4" /> Drag canvas to explore
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
                     {card.projects.map(proj => (
                        <div key={proj.id} className="w-48 shrink-0 bg-zinc-50 rounded-xl overflow-hidden border border-zinc-200 p-2">
                           <div className="aspect-video w-full rounded-lg overflow-hidden bg-zinc-200 mb-3">
                              <img src={proj.image} className="w-full h-full object-cover" />
                           </div>
                           <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-800 text-center">{proj.title}</div>
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
const LayoutDigitalGallery = ({ cards }: any) => {
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
                           {card.projects.map(proj => (
                              <div key={proj.id} className="w-32 h-full shrink-0 border-r border-[#333] overflow-hidden relative">
                                 <img src={proj.image} className="w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity cursor-pointer" />
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
const LayoutNeoBrutalism = ({ cards }: any) => {
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
                            {card.cta} <Sparkles className="w-4 h-4" />
                         </button>
                      )}
                    </div>
                 </div>

                 {card.projects && (
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 border-t-[4px] border-black">
                       {card.projects.map((proj, idx) => (
                          <div key={proj.id} className={`bg-white border-[4px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform ${idx % 2 === 0 ? '-rotate-1' : 'rotate-1'} hover:rotate-0 transition-transform`}>
                             <div className="aspect-[4/3] w-full border-[4px] border-black mb-4 overflow-hidden bg-black">
                                <img src={proj.image} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
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
const LayoutPaperCraft = ({ cards }: any) => {
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
                  {card.projects.map((proj, idx) => (
                     <div key={proj.id} className={`p-3 pb-8 bg-white shadow-md border border-[#eee] transform ${idx % 2 === 0 ? 'rotate-2' : '-rotate-2'} hover:rotate-0 hover:scale-110 transition-transform cursor-pointer relative`}>
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-[#e6dfa8]/80 shadow-sm transform -rotate-2 z-10" />
                        <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden mb-3 border border-gray-200">
                           <img src={proj.image} className="w-full h-full object-cover mix-blend-multiply" />
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
const LayoutCinematic = ({ cards }: any) => {
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
                       {card.cta} <Sparkles className="w-4 h-4" />
                    </button>
                 )}
              </motion.div>
              
              <div className="hidden md:flex w-1/2 h-full items-center justify-end">
                 {card.projects ? (
                    <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.4 }} className="flex flex-col gap-6 mr-12 mt-32 h-[70vh] overflow-y-auto custom-scrollbar pr-4">
                       {card.projects.map(proj => (
                          <div key={proj.id} className="w-[400px] aspect-video bg-white/5 border border-white/20 rounded-2xl overflow-hidden relative cursor-pointer group/proj">
                             <img src={proj.image} className="w-full h-full object-cover opacity-60 group-hover/proj:opacity-100 transition-all duration-700 group-hover/proj:scale-105" />
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/proj:opacity-100 bg-black/40 transition-opacity">
                                <span className="font-bold tracking-widest uppercase text-white border border-white px-6 py-2">{proj.title}</span>
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
const LayoutSwissPrecision = ({ cards }: any) => {
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
                          {card.projects.map(proj => (
                             <div key={proj.id} className="aspect-square bg-zinc-900 border border-zinc-800 overflow-hidden relative group/img">
                                <img src={proj.image} className="w-full h-full object-cover grayscale opacity-50 group-hover/img:grayscale-0 group-hover/img:opacity-100 transition-all duration-300" />
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
const LayoutCreativeUniverse = ({ cards, playSound }: any) => {
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
                          {activeCard.cta} <Sparkles className="w-4 h-4" />
                       </button>
                    )}
                 </div>

                 {activeCard.projects && (
                    <div className="w-full md:w-1/2 flex flex-col gap-4 max-h-[40vh] md:max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
                       {activeCard.projects.map(proj => (
                          <div key={proj.id} className="w-full h-32 shrink-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden relative group cursor-pointer">
                             <img src={proj.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                                <span className="font-bold tracking-widest uppercase text-white text-[10px] border border-white px-4 py-2">{proj.title}</span>
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
  const [activeLayout, setActiveLayout] = useState<LayoutId>('cards')
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [activeProject, setActiveProject] = useState<any>(null)
  const [cmsData, setCmsData] = useState<any>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null)

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

  const baseCards = cmsData?.cards || INITIAL_CARDS
  const currentCards = [...baseCards];
  
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

  const ActiveComponent = LAYOUTS.find(l => l.id === activeLayout)?.component

  const isLightMode = ['editorial', 'canvas', 'bento', 'organic', 'minimal', 'paper', 'swiss'].includes(activeLayout)
  const isBrutal = activeLayout === 'brutalism'

  return (
    <div data-lenis-prevent className="relative w-full h-[100dvh] overflow-hidden bg-black">
      
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
            { label: 'Academy', href: '/academy' },
            { label: 'Contact', href: '/contact' },
            { label: 'Login', href: '/auth/login' },
          ].map(({ label, href }) => (
            <a key={label} href={href} className={`text-[10px] font-bold tracking-widest uppercase transition-all hover:opacity-100 opacity-60
              ${isBrutal ? 'text-black' : isLightMode ? 'text-black' : 'text-white'}`}>
              {label}
            </a>
          ))}
        </nav>

        {/* Right: Choose Concept Dropdown */}
        <div className="relative pointer-events-auto">
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
                   onClick={() => { setActiveLayout(layout.id); setShowMenu(false); playSound(); }}
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

      </header>


      <div className="w-full h-full relative z-0 overflow-y-auto custom-scrollbar">
        {/* Render the Active Theme Layout */}
        {ActiveComponent && <ActiveComponent cards={currentCards} playSound={playSound} cmsData={cmsData} />}
        
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
      
    </div>
  )
}
