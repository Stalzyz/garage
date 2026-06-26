"use client"

import { useApi } from "@/lib/useApi"
import { Briefcase, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function PortalProjectsPage() {
  // Use the standard projects API. Depending on auth, it will return the projects for this client.
  const { data, isLoading } = useApi<any>("/projects")
  
  const projects = data?.data || []

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Projects</h1>
        <p className="text-white/50 text-sm">Track the progress of your active and completed projects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-white/50">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
            <p>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-white/50 bg-white/5 border border-white/10 rounded-3xl">
            <Briefcase className="w-12 h-12 mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-white mb-2">No Projects Found</h3>
            <p>You don't have any active projects yet.</p>
          </div>
        ) : (
          projects.map((project: any) => (
            <div key={project.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors group relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
              
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{project.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-white/50">{project.type}</p>
                </div>
              </div>

              {/* Progress Bar Mockup */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-bold text-white/50 mb-2 uppercase tracking-widest">
                  <span>Progress</span>
                  <span>{project.status === 'CLOSED' ? '100%' : '65%'}</span>
                </div>
                <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000" 
                    style={{ width: project.status === 'CLOSED' ? '100%' : '65%' }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-4">
                <div className="text-xs text-white/40">
                  Started: {new Date(project.createdAt).toLocaleDateString()}
                </div>
                <Link href={`/portal/projects/${project.id}`} className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors group/link">
                  View Details <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
