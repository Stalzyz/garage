"use client";

import { PlayCircle, FileText, MonitorPlay, Zap } from "lucide-react"
import { motion } from "framer-motion"

export function CurriculumSection({ modules }: { modules: any[] }) {
  if (!modules || modules.length === 0) return null;

  return (
    <section id="curriculum" className="py-32 px-4 bg-[#050505] relative overflow-hidden">
      <div className="container mx-auto max-w-4xl text-[#FAFAF8] relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 uppercase">
            The Skill Tree
          </h2>
          <p className="text-[#A1A1AA] text-lg max-w-xl mx-auto">
            Progress through the modules to unlock your full creative potential.
          </p>
        </div>

        <div className="relative">
          {/* Glowing Vertical Connecting Line */}
          <div className="absolute top-0 bottom-0 left-[27px] md:left-1/2 w-1 bg-white/10 md:-translate-x-1/2 rounded-full overflow-hidden">
            <motion.div 
              className="w-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 h-1/2 origin-top"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>

          <div className="space-y-16">
            {modules.map((module: any, mi: number) => {
              const isEven = mi % 2 === 0;
              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: mi * 0.1 }}
                  className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 ${isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Central Node Checkpoint */}
                  <div className="absolute left-[9px] md:left-1/2 w-10 h-10 rounded-full bg-black border-4 border-[#050505] shadow-[0_0_15px_rgba(168,85,247,0.5)] md:-translate-x-1/2 flex items-center justify-center z-10">
                    <div className="w-4 h-4 rounded-full bg-purple-500 animate-pulse" />
                  </div>

                  {/* Empty space for alternating layout on Desktop */}
                  <div className="hidden md:block md:w-1/2" />

                  {/* Module Content Card */}
                  <div className="ml-16 md:ml-0 md:w-1/2 w-[calc(100%-4rem)] p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all hover:-translate-y-1 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-bold tracking-widest uppercase text-purple-400">
                        Level {mi + 1}
                      </span>
                    </div>
                    <h3 className="font-bold text-2xl tracking-tight mb-4">{module.title}</h3>
                    
                    {/* Lessons nested inside the skill node */}
                    <div className="space-y-2 mt-4 bg-black/40 p-4 rounded-xl border border-white/5">
                      {module.lessons && module.lessons.length > 0 ? (
                        module.lessons.map((lesson: any) => (
                          <div key={lesson.id} className="flex items-center gap-3 group">
                            <div className="text-white/30 group-hover:text-purple-400 transition-colors">
                              {lesson.type === 'VIDEO' ? <PlayCircle className="w-4 h-4" /> :
                               lesson.type === 'PDF' || lesson.type === 'TEXT' ? <FileText className="w-4 h-4" /> :
                               <MonitorPlay className="w-4 h-4" />}
                            </div>
                            <span className="text-sm text-white/70 group-hover:text-white transition-colors">{lesson.title}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-white/40">Missions classified.</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
