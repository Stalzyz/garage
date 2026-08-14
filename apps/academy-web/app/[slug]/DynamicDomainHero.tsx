"use client";

import { CourseDomain } from "./CategoryThemeMapper";
import { motion } from "framer-motion";
import { useState } from "react";
import { CTAModal } from "./CTAModal";
import { ArrowRight, Play } from "lucide-react";

type DynamicDomainHeroProps = {
  domain: CourseDomain;
  title: string;
  description: string;
  coverImage?: string;
  courseCode: string;
  trailerVideoId?: string | null;
};

export function DynamicDomainHero({ 
  domain, 
  title, 
  description, 
  coverImage, 
  courseCode,
  trailerVideoId 
}: DynamicDomainHeroProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playVideo, setPlayVideo] = useState(false);

  // Helper to render the video player or thumbnail image
  const renderPreviewMedia = (aspectClass = "aspect-video") => {
    if (trailerVideoId && (playVideo || aspectClass !== "aspect-[4/5]")) {
      return (
        <div className={`w-full h-full bg-black ${aspectClass} overflow-hidden`}>
          <iframe 
            src={`https://www.youtube.com/embed/${trailerVideoId}?autoplay=1&rel=0`} 
            className="w-full h-full border-0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <div className={`w-full h-full relative cursor-pointer group overflow-hidden ${aspectClass}`} onClick={() => setPlayVideo(true)}>
        {coverImage ? (
          <img src={coverImage} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center">
            <span className="text-white/20 font-bold text-lg">Course Preview</span>
          </div>
        )}
        {trailerVideoId && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
            <div className="w-16 h-16 rounded-full bg-white/90 text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            </div>
          </div>
        )}
      </div>
    );
  };

  if (domain === 'TECH') {
    return (
      <section className="relative min-h-[80vh] bg-[#050505] flex items-center justify-center p-6 border-b border-white/10 overflow-hidden font-[var(--font-space)]">
        {/* Terminal Grid Background */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 w-full max-w-6xl border border-white/20 bg-black p-8 md:p-12 shadow-[10px_10px_0px_0px_rgba(52,211,153,0.5)]">
          <div className="flex gap-2 mb-8 border-b border-white/20 pb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="lg:col-span-7">
              <p className="text-emerald-400 font-mono mb-4 text-sm md:text-base">{`> initializing_course...`}</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 uppercase tracking-tighter">
                {title}
              </h1>
              <p className="text-[#A1A1AA] text-base md:text-lg max-w-2xl font-mono mb-8 leading-relaxed">
                {description}
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-y-2 active:shadow-none"
              >
                Enroll Now <ArrowRight size={20} />
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-5 w-full aspect-video rounded-xl overflow-hidden border border-white/20 bg-zinc-900 shadow-2xl"
            >
              {renderPreviewMedia("aspect-video")}
            </motion.div>
          </div>
        </div>
        <CTAModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          courseCode={courseCode} 
          courseName={title} 
          domain={domain} 
        />
      </section>
    )
  }

  if (domain === 'DESIGN') {
    return (
      <section className="relative min-h-[90vh] bg-[#F5F5F0] text-[#050505] flex items-center p-6 md:p-20 font-[var(--font-playfair)] overflow-hidden">
        {/* Asymmetrical Editorial Layout */}
        <div className="absolute right-0 top-0 w-1/2 h-full bg-[#E5E5DF] skew-x-[-10deg] translate-x-20 z-0" />
        
        <div className="relative z-10 container mx-auto flex flex-col md:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-none mb-8">
              {title}
            </h1>
            <p className="text-xl md:text-2xl text-black/60 max-w-lg font-sans mb-10">
              {description}
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 bg-[#050505] text-white font-serif italic text-lg tracking-wide hover:bg-pink-600 transition-colors inline-flex items-center gap-3 rounded-full shadow-xl"
            >
              Begin Your Journey <ArrowRight size={20} />
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, rotate: -5, scale: 0.9 }} 
            animate={{ opacity: 1, rotate: 0, scale: 1 }} 
            transition={{ duration: 1 }}
            className="flex-1 w-full relative"
          >
            {/* Polaroid style image card */}
            <div className="bg-white p-4 pb-16 shadow-2xl rotate-3 transform-gpu">
              <div className="aspect-[4/5] bg-zinc-200 overflow-hidden relative rounded-lg">
                {renderPreviewMedia("aspect-[4/5]")}
              </div>
            </div>
            {/* Background floating card */}
            <div className="absolute -z-10 top-10 -left-10 bg-white/50 p-4 pb-16 shadow-xl -rotate-6 transform-gpu aspect-[4/5] w-full hidden sm:block rounded-lg" />
          </motion.div>
        </div>
        <CTAModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          courseCode={courseCode} 
          courseName={title} 
          domain={domain} 
        />
      </section>
    )
  }

  if (domain === 'VIDEO') {
    return (
      <section className="relative min-h-[100vh] bg-black flex items-center justify-center p-6 overflow-hidden font-[var(--font-inter)] tracking-wide">
        {/* Cinematic Trailer Background */}
        <div className="absolute inset-0 z-0">
          {coverImage ? (
             <img src={coverImage} alt={title} className="w-full h-full object-cover opacity-40 scale-105" style={{ filter: 'blur(4px) contrast(1.2)' }} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900 to-black opacity-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 1 }}
            className="w-full"
          >
            <div className="inline-block px-4 py-1 border border-white/20 rounded-full text-white/50 text-xs tracking-[0.2em] mb-8 uppercase backdrop-blur-md">
              Grekam Studios Presents
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed mb-8">
              {description}
            </p>
            <div className="flex gap-4 justify-center items-center mb-12">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-10 py-5 bg-white text-black font-bold uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all duration-500 inline-flex items-center gap-3"
              >
                Join The Cast <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-3xl aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950"
          >
            {renderPreviewMedia("aspect-video")}
          </motion.div>
        </div>

        <CTAModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          courseCode={courseCode} 
          courseName={title} 
          domain={domain} 
        />
      </section>
    )
  }

  // Default / MARKETING
  return (
    <section className="relative min-h-[80vh] bg-white text-black flex items-center justify-center p-6 overflow-hidden font-[var(--font-inter)]">
      {/* Sleek Corporate Apple Style */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-white z-0" />
      
      <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-zinc-900 mb-8"
        >
          {title}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-xl md:text-2xl text-zinc-500 max-w-2xl mx-auto mb-12 tracking-tight"
        >
          {description}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-12"
        >
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-black text-white font-bold rounded-full hover:scale-105 hover:shadow-2xl hover:shadow-black/20 transition-all inline-flex items-center gap-2"
          >
            Start Learning <ArrowRight size={18} />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-3xl aspect-video rounded-2xl overflow-hidden shadow-2xl bg-zinc-900 border-4 border-white"
        >
          {renderPreviewMedia("aspect-video")}
        </motion.div>
      </div>
      <CTAModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        courseCode={courseCode} 
        courseName={title} 
        domain={domain} 
      />
    </section>
  )
}
