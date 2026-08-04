import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { MonitorPlay, Link as LinkIcon } from "lucide-react"
import Link from "next/link"
import { CurriculumSection } from "./CurriculumSection"

export const dynamic = 'force-dynamic'

function getCodeFromSlug(slug: string): string | undefined {
  switch (slug) {
    case 'ui_ux_design': return 'PUXMP-2026';
    case 'digital_marketing': return 'PDMM-2026';
    case 'vfx_compositing': return 'PVFX-2026';
    case 'graphic_design': return 'PGDM-2026';
    case 'video_editing_ai': return 'PVEM-2026';
    case '3d_animation': return 'P3DA-2026';
    case 'motion_graphics': return 'PMGM-2026';
    case 'fullstack_web_dev': return 'PFSD-2026';
    case 'wordpress_web_design': return 'PWDM-2026';
    default: return undefined;
  }
}

export default async function CMSPublicPage({ params }: { params: { slug: string } }) {
  const rawSlug = (await params).slug

  // Handle Instructor Profiles
  if (rawSlug.startsWith('%40')) {
    const educatorSlug = rawSlug.substring(3) // Remove '%40'
    
    const educator = await prisma.educator.findUnique({
      where: { slug: educatorSlug },
      include: {
        user: true,
        batches: {
          include: {
            course: true
          }
        }
      }
    })

    if (!educator || !educator.isPublic) {
      notFound()
    }

    return (
      <main className="min-h-screen bg-[#050505] text-white flex flex-col w-full items-center pb-20">
        <div className="w-full max-w-lg bg-[#0a0a0a] min-h-screen border-x border-white/10 shadow-2xl relative">
          
          {/* Cover Image */}
          <div className="h-48 w-full relative">
            <img src={educator.coverImageUrl || "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000"} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
          </div>

          {/* Profile Header */}
          <div className="px-6 -mt-16 relative z-10 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full border-4 border-[#0a0a0a] bg-[#1a1a1a] overflow-hidden mb-4 shadow-xl">
              <img src={educator.user?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + educator.userId} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            
            <h1 className="text-2xl font-bold tracking-tight">
              {educator.user?.firstName} {educator.user?.lastName}
            </h1>
            
            {educator.tagline && (
              <p className="text-indigo-400 font-bold text-sm mt-1">{educator.tagline}</p>
            )}
            
            {educator.bio && (
              <p className="text-white/60 text-sm mt-4 leading-relaxed max-w-sm">
                {educator.bio}
              </p>
            )}

            {/* Social Icons row */}
            <div className="flex items-center gap-4 mt-6">
              {educator.youtubeUrl && (
                <a href={educator.youtubeUrl} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white hover:bg-[#ff0000] hover:border-transparent transition-colors">
                  <LinkIcon className="w-5 h-5" />
                </a>
              )}
              {educator.instagramUrl && (
                <a href={educator.instagramUrl} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white hover:bg-[#E1306C] hover:border-transparent transition-colors">
                  <LinkIcon className="w-5 h-5" />
                </a>
              )}
              {educator.twitterUrl && (
                <a href={educator.twitterUrl} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white hover:bg-[#1DA1F2] hover:border-transparent transition-colors">
                  <LinkIcon className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Courses List */}
          {educator.batches && educator.batches.length > 0 && (
            <div className="px-6 mt-12 space-y-4">
              <h2 className="font-bold text-xs tracking-widest uppercase text-white/50 mb-4 text-center">Featured Courses</h2>
              
              {educator.batches.map((batch: any, i: number) => (
                <Link key={i} href={`/academy/courses/${batch.course?.id}`} className="block">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 hover:border-indigo-500/50 hover:bg-white/10 transition-all cursor-pointer group relative overflow-hidden">
                    <div className="w-20 h-20 rounded-xl bg-black overflow-hidden shrink-0">
                      {batch.course?.thumbnail ? (
                        <img src={batch.course.thumbnail} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <MonitorPlay className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 relative z-10 flex flex-col justify-center">
                      <h3 className="font-bold text-base leading-tight mb-1 group-hover:text-indigo-400 transition-colors">{batch.course?.name || "Untitled Course"}</h3>
                      <p className="text-sm text-white/50 line-clamp-2">{batch.course?.description || "Enroll today to start learning."}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </main>
    )
  }

  // Original Landing Page Logic
  const page = await prisma.landingPage.findUnique({
    where: { slug: rawSlug },
    include: {
      sections: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  })

  if (!page || !page.isActive) {
    notFound()
  }

  // Check if we have a dynamic LMS Course for this slug
  const courseCode = getCodeFromSlug(rawSlug);
  let lmsModules: any[] = [];
  
  if (courseCode) {
    try {
      const course = await prisma.course.findUnique({
        where: { code: courseCode },
        include: {
          lmsCourse: {
            include: {
              modules: {
                orderBy: { sortOrder: 'asc' },
                include: {
                  lessons: {
                    orderBy: { sortOrder: 'asc' }
                  }
                }
              }
            }
          }
        }
      });
      if (course?.lmsCourse?.modules) {
        lmsModules = course.lmsCourse.modules;
      }
    } catch (e) {
      console.error("Failed to fetch dynamic curriculum for slug", rawSlug, e);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] flex flex-col w-full overflow-x-hidden">
      {page.sections.map((section) => {
        const content = section.content as any
        
        if (content && typeof content === 'object' && content.type === 'html' && content.html) {
          return (
            <div 
              key={section.id} 
              dangerouslySetInnerHTML={{ __html: content.html }} 
              className="w-full"
            />
          )
        }
        
        return null
      })}
      
      {/* Dynamically append Curriculum Section if we found course modules */}
      {lmsModules.length > 0 && (
        <CurriculumSection modules={lmsModules} />
      )}
    </main>
  )
}
