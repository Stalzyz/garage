"use client";

import { useState, useEffect } from "react";
import { getPortfolioProjects } from "../../app/actions/courses";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

export function StudentShowcase() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getPortfolioProjects();
      setProjects(data || []);
    }
    load();
  }, []);

  if (!projects || projects.length === 0) return null;

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-white tracking-tight font-sans">
              Student Hall of Fame
            </h2>
            <p className="text-xl text-white/50 font-handwriting">
              See what our students are building. Real projects, real impact.
            </p>
          </div>
          <Link href="/gallery" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors">
            View All Projects <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="group flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-colors">
              <div className="relative h-60 bg-black/40 overflow-hidden">
                {project.imageUrl ? (
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/20">
                    No preview available
                  </div>
                )}
                {project.linkUrl && (
                  <a href={project.linkUrl} target="_blank" rel="noopener noreferrer" className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-500">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold px-2 py-1 bg-white/10 rounded-md text-white/70 uppercase tracking-wider">
                    {project.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{project.title}</h3>
                <p className="text-white/60 text-sm line-clamp-2 mb-4 flex-1">
                  {project.description}
                </p>
                <div className="pt-4 border-t border-white/10 mt-auto flex items-center justify-between">
                  <span className="text-sm font-medium text-white/80">
                    By {project.portfolio?.student?.user?.firstName || ""} {project.portfolio?.student?.user?.lastName || ""}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
