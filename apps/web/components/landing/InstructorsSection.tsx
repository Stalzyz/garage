"use client"

import Image from "next/image"

interface Instructor {
  id: string
  name: string
  avatarUrl: string | null
  designation: string | null
  company: string | null
  bio: string | null
}

export function InstructorsSection({ instructors }: { instructors: Instructor[] }) {
  if (!instructors || instructors.length === 0) return null

  return (
    <section className="py-32 relative bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-[10px] font-mono tracking-[0.4em] text-[#8b6a3a] uppercase mb-4">Meet the Mentors</h2>
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight font-sans text-white">
              Learn from <br className="hidden md:block"/> Industry Experts.
            </h3>
          </div>
          <div className="max-w-md text-white/50 text-sm leading-relaxed">
            Our educators aren't just teachers; they are active practitioners shaping the creative and tech industries globally.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {instructors.map((instructor) => (
            <div 
              key={instructor.id} 
              className="group relative bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500 flex flex-col"
            >
              {/* Image Header */}
              <div className="h-[280px] md:h-[320px] w-full relative overflow-hidden bg-white/5">
                {instructor.avatarUrl ? (
                  <Image
                    src={instructor.avatarUrl}
                    alt={instructor.name}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#111] text-white/20 text-6xl font-sans font-black uppercase">
                    {instructor.name.charAt(0)}
                  </div>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                
                <div className="absolute bottom-6 left-6 right-6">
                  <h4 className="text-2xl font-bold text-white mb-1">{instructor.name}</h4>
                  <p className="text-[#8b6a3a] font-mono text-xs tracking-widest uppercase">
                    {instructor.designation || "Educator"} {instructor.company && `at ${instructor.company}`}
                  </p>
                </div>
              </div>

              {/* Bio Content */}
              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <p className="text-white/60 text-sm leading-relaxed line-clamp-4">
                  {instructor.bio || "An industry veteran dedicated to teaching the next generation of creative professionals."}
                </p>
                
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs font-mono uppercase tracking-widest text-white/40 group-hover:text-white/70 transition-colors">
                  <span>View Profile</span>
                  <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
