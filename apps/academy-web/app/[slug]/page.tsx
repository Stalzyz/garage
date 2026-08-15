import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { MonitorPlay, Link as LinkIcon } from "lucide-react"
import Link from "next/link"
import { CurriculumSection } from "./CurriculumSection"
import { CourseConclusionCTA } from "./CourseConclusionCTA"
import { RelatedCourses } from "./RelatedCourses"
import { getDomainFromCode, getFontClassForDomain } from "./CategoryThemeMapper"
import { CustomCursor } from "./CustomCursor"
import { DynamicDomainHero } from "./DynamicDomainHero"
import { Header } from "../../components/landing/Header"
import { Footer } from "../../components/landing/Footer"

export const dynamic = 'force-dynamic'

function getCodeFromSlug(slug: string): string | undefined {
  switch (slug) {
    case 'ui_ux_design': return 'PUXMP-2026';
    case 'digital_marketing': return 'PDMM-2026';
    case 'vfx_compositing': return 'PVFX-2026';
    case 'graphic_design': return 'PGDMP-2026';
    case 'video_editing_ai': return 'PVEM-2026';
    case '3d_animation': return 'P3DA-2026';
    case 'motion_graphics': return 'PMGM-2026';
    case 'fullstack_web_dev': return 'PFSD-2026';
    case 'wordpress_web_design': return 'PWD-2026';
    default: return undefined;
  }
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
}

// Each course code maps to a unique gradient index
const inkPalettes = [
  "from-emerald-400 via-teal-500 to-purple-600",
  "from-sky-400 via-blue-500 to-violet-600",
  "from-rose-400 via-pink-500 to-orange-500",
  "from-amber-400 via-orange-500 to-red-600",
  "from-lime-400 via-emerald-500 to-cyan-600",
  "from-fuchsia-400 via-purple-500 to-blue-600",
  "from-orange-400 via-rose-500 to-pink-600",
  "from-cyan-400 via-sky-500 to-indigo-600",
];

function getPaletteForCourse(code: string | undefined): string {
  if (!code) return inkPalettes[0];
  // Simple hash to map course code to a stable palette index
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % inkPalettes.length;
  return inkPalettes[index];
}

export default async function CMSPublicPage({ params }: { params: Promise<{ slug: string }> }) {
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

  // Dynamically map slug to Course
  let courseCode = getCodeFromSlug(rawSlug);
  
  if (!courseCode) {
    // If not in hardcoded list, try to match by slugified course name
    const allCourses = await prisma.course.findMany({ select: { code: true, name: true } });
    const matched = allCourses.find(c => 
      slugify(c.name) === rawSlug || 
      slugify(c.name).replace(/_/g, '-') === rawSlug
    );
    if (matched) courseCode = matched.code;
  }

  const palette = getPaletteForCourse(courseCode);
  const domain = getDomainFromCode(courseCode);
  const fontClass = getFontClassForDomain(domain);
  
  let lmsModules: any[] = [];
  let relatedCourses: any[] = [];
  let cmsCoverImage: string | undefined = undefined;
  let trailerVideoId: string | null = null;

  // Extract cover image from the first CMS section if it exists
  if (page.sections.length > 0) {
    const firstHtml = (page.sections[0].content as any)?.html;
    if (firstHtml) {
      const match = firstHtml.match(/<img[^>]+src="([^">]+)"/i);
      if (match) {
        cmsCoverImage = match[1];
      }
    }
  }
  
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
      trailerVideoId = course?.lmsCourse?.trailerVideoId || null;

      // Fetch 3 other courses
      relatedCourses = await prisma.course.findMany({
        where: { code: { not: courseCode } },
        take: 3,
        include: {
          lmsCourse: true
        }
      });
    } catch (e) {
      console.error("Failed to fetch dynamic curriculum for slug", rawSlug, e);
    }
  }

  return (
    <main className={`min-h-screen bg-[#050505] flex flex-col w-full overflow-x-hidden ${courseCode ? fontClass : ''}`}>
      <Header theme="dark" />
      {courseCode && <CustomCursor domain={domain} />}

      {courseCode && (
        <DynamicDomainHero 
          domain={domain}
          title={page.title || "Course"}
          description={page.description || "Master your craft with industry experts."}
          coverImage={cmsCoverImage}
          courseCode={courseCode}
          trailerVideoId={trailerVideoId}
        />
      )}

      {page.sections.map((section, index) => {
        // Skip the legacy CMS hero if we are rendering a dynamic course page
        if (index === 0 && courseCode) return null;

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

      {/* Append Conclusion CTA & Related Courses */}
      {courseCode && (
        <>
          <CourseConclusionCTA palette={palette} />
          <RelatedCourses courses={relatedCourses} />
        </>
      )}
      <Footer />
    </main>
  )
}
