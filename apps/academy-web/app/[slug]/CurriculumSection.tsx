"use client";

import { useState } from "react";
import { PlayCircle, FileText, MonitorPlay, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CurriculumSection({ modules }: { modules: any[] }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!modules || modules.length === 0) return null;

  const currentModule = modules[activeTab] || modules[0];

  return (
    <section id="curriculum" className="py-24 px-4 bg-[#050505] border-t border-white/5 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto max-w-4xl relative z-10 text-[#FAFAF8]">
        <div className="text-center mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-purple-400">Course Roadmap</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-2 uppercase font-editorial-display">
            The Skill Tree
          </h2>
          <p className="text-[#A1A1AA] text-sm md:text-base mt-3 max-w-xl mx-auto">
            Select a level to view modules and learning objectives.
          </p>
        </div>

        {/* Level Selectors Bar */}
        <div className="relative mb-12">
          {/* Horizontal connecting line behind tabs */}
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 -z-10" />

          <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-2 snap-x scrollbar-none justify-start md:justify-center items-center">
            {modules.map((module, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveTab(idx)}
                  className={`relative shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl border transition-all duration-300 snap-center ${
                    isActive
                      ? "bg-purple-600 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-110"
                      : "bg-[#0c0c0c] border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                  }`}
                >
                  <span className="font-mono text-[10px] uppercase tracking-wider opacity-60">Lvl</span>
                  <span className="font-bold text-lg font-mono">{`0${idx + 1}`}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1.5 w-2 h-2 rounded-full bg-purple-400"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Module Content Pane */}
        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="bg-[#0b0b0b] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Corner accent glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-2xl rounded-full pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/50 border border-purple-500/20 text-xs font-bold text-purple-400 tracking-wider uppercase mb-3">
                    <Zap className="w-3 h-3 fill-current" />
                    Level {activeTab + 1}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight font-editorial-display">
                    {currentModule.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-white/40">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold uppercase tracking-wider">Unlocked</span>
                </div>
              </div>

              {/* Lessons inside selected Level */}
              <div className="space-y-4">
                <h4 className="font-mono text-xs uppercase tracking-widest text-white/40 mb-2">Learning Objectives:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentModule.lessons && currentModule.lessons.length > 0 ? (
                    currentModule.lessons.map((lesson: any) => (
                      <div 
                        key={lesson.id} 
                        className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors group"
                      >
                        <div className="text-white/30 group-hover:text-purple-400 transition-colors shrink-0">
                          {lesson.type === 'VIDEO' ? <PlayCircle className="w-4 h-4" /> :
                           lesson.type === 'PDF' || lesson.type === 'TEXT' ? <FileText className="w-4 h-4" /> :
                           <MonitorPlay className="w-4 h-4" />}
                        </div>
                        <span className="text-sm text-white/70 group-hover:text-white transition-colors line-clamp-1">{lesson.title}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-white/40 col-span-2">Objectives locked.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
