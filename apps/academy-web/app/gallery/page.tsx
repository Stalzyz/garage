import { prisma } from "../../src/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Briefcase, Award, GraduationCap, Compass } from "lucide-react"
import { Header } from "../../components/landing/Header"
import { Footer } from "../../components/landing/Footer"

export const dynamic = "force-dynamic"

export default async function GalleryPage() {
  let projects: any[] = []
  
  try {
    projects = await prisma.portfolioProject.findMany({
      include: {
        portfolio: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Could not fetch portfolio projects:", error)
  }

  // Icons mapper for project category
  const getCategoryIcon = (category: string) => {
    switch (category?.toUpperCase()) {
      case "ASSIGNMENT": return <Compass className="w-3.5 h-3.5" />
      case "CERTIFICATE": return <Award className="w-3.5 h-3.5" />
      case "INTERNSHIP": return <GraduationCap className="w-3.5 h-3.5" />
      default: return <Briefcase className="w-3.5 h-3.5" />
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col w-full overflow-x-hidden selection:bg-purple-500/30">
      <Header theme="dark" />

      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/5 blur-[200px] rounded-full pointer-events-none" />

      {/* Content wrapper */}
      <div className="container mx-auto px-4 md:px-6 pt-32 pb-24 flex-grow relative z-10">
        
        {/* Navigation back and Title */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs uppercase tracking-widest font-bold mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Academy
          </Link>
          
          <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-6 uppercase bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
            Student Showcase
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-light leading-relaxed">
            Explore industry-ready projects, assignments, and case studies built by Grekam Design Academy students.
          </p>
        </div>

        {/* Gallery Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-20 border border-white/5 bg-white/[0.02] rounded-3xl max-w-lg mx-auto">
            <Briefcase className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg font-bold">No projects showcase published</h3>
            <p className="text-xs text-white/40 mt-1 max-w-xs mx-auto">Projects published by academy admins in the CMS dashboard will appear here in real-time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => {
              const authorName = project.portfolio?.student?.user
                ? `${project.portfolio.student.user.firstName} ${project.portfolio.student.user.lastName}`.trim()
                : "Anonymous Student"
              
              return (
                <div 
                  key={project.id} 
                  className="group flex flex-col bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300"
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-[16/10] bg-black/40 overflow-hidden border-b border-white/5">
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 gap-2">
                        <Briefcase className="w-8 h-8 opacity-50" />
                        <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">No Preview URL</span>
                      </div>
                    )}
                    
                    {/* Live Demo Trigger Icon */}
                    {project.linkUrl && (
                      <a 
                        href={project.linkUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="absolute bottom-4 right-4 w-10 h-10 bg-black/75 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-purple-600 scale-90 group-hover:scale-100"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-white/10 border border-white/5 rounded-full text-white/70 uppercase tracking-widest flex items-center gap-1.5">
                        {getCategoryIcon(project.category)}
                        {project.category || "PROJECT"}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 leading-tight tracking-tight group-hover:text-purple-400 transition-colors">
                      {project.title}
                    </h3>
                    
                    <p className="text-white/50 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                      {project.description}
                    </p>

                    <div className="pt-4 border-t border-white/5 mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {authorName.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold text-white/80">
                          By {authorName}
                        </span>
                      </div>

                      {project.linkUrl && (
                        <a 
                          href={project.linkUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs font-bold text-purple-400 hover:text-purple-300 hover:underline transition-colors flex items-center gap-1 shrink-0"
                        >
                          Demo <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
