"use client"

import Image from "next/image"
import Link from "next/link"

interface Project {
  id: string
  title: string
  description: string
  imageUrl: string | null
  linkUrl: string | null
  studentName: string
}

export function StudentShowcase({ projects }: { projects: Project[] }) {
  if (!projects || projects.length === 0) return null

  return (
    <section className="py-24 relative bg-[#020202]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-[10px] font-mono tracking-[0.4em] text-white/40 uppercase mb-4">Hall of Fame</h2>
          <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight font-sans text-white">
            Student Showcase
          </h3>
          <p className="mt-4 text-white/50 text-sm max-w-xl mx-auto">
            Explore the real-world projects built by our alumni that landed them top industry roles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, idx) => (
            <div 
              key={project.id}
              className={`group relative rounded-xl overflow-hidden bg-[#080808] border border-white/5 hover:border-white/20 transition-all duration-500 ${
                idx === 0 ? "md:col-span-2 md:aspect-[21/9]" : "aspect-[4/3]"
              }`}
            >
              {project.imageUrl ? (
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-[#050505]" />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-3 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <div className="h-[1px] w-8 bg-[#8b6a3a]" />
                    <span className="text-[#8b6a3a] font-mono text-[10px] uppercase tracking-widest">
                      By {project.studentName}
                    </span>
                  </div>
                  
                  <h4 className="text-2xl md:text-3xl font-bold text-white mb-2">{project.title}</h4>
                  <p className="text-white/60 text-sm line-clamp-2 md:line-clamp-3 mb-6 max-w-2xl">
                    {project.description}
                  </p>
                  
                  {project.linkUrl && (
                    <Link 
                      href={project.linkUrl}
                      target="_blank"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full hover:bg-gray-200 transition-colors"
                    >
                      View Live Project
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 flex justify-center">
          <button className="px-8 py-4 border border-white/20 text-white font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors rounded-full">
            View All Portfolios
          </button>
        </div>
      </div>
    </section>
  )
}
