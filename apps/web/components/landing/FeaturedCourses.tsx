import { prisma } from "../../src/lib/prisma";
import { FeaturedCourseCard } from "./FeaturedCourseCard";

const defaultCourses = [
  {
    title: "Graphic Designing",
    bgColor: "bg-[#f5f0eb]",
    imgGradient: "from-[#e67e22]/20 to-[#f39c12]/20",
  },
  {
    title: "UI/UX Designing",
    bgColor: "bg-[#eaf4fc]",
    imgGradient: "from-[#3498db]/20 to-[#2980b9]/20",
  },
  {
    title: "2D Animations",
    bgColor: "bg-[#fceef5]",
    imgGradient: "from-[#e74c3c]/20 to-[#c0392b]/20",
  },
  {
    title: "Web Designing & Development",
    bgColor: "bg-[#eefcf5]",
    imgGradient: "from-[#2ecc71]/20 to-[#27ae60]/20",
  },
  {
    title: "AI Based UI/UX",
    bgColor: "bg-[#f4eefc]",
    imgGradient: "from-[#9b59b6]/20 to-[#8e44ad]/20",
  },
  {
    title: "AI Based Web Development",
    bgColor: "bg-[#eefafc]",
    imgGradient: "from-[#1abc9c]/20 to-[#16a085]/20",
  },
];

const colorPalette = [
  { bgColor: "bg-[#f5f0eb]", imgGradient: "from-[#e67e22]/20 to-[#f39c12]/20" },
  { bgColor: "bg-[#eaf4fc]", imgGradient: "from-[#3498db]/20 to-[#2980b9]/20" },
  { bgColor: "bg-[#fceef5]", imgGradient: "from-[#e74c3c]/20 to-[#c0392b]/20" },
  { bgColor: "bg-[#eefcf5]", imgGradient: "from-[#2ecc71]/20 to-[#27ae60]/20" },
  { bgColor: "bg-[#f4eefc]", imgGradient: "from-[#9b59b6]/20 to-[#8e44ad]/20" },
  { bgColor: "bg-[#eefafc]", imgGradient: "from-[#1abc9c]/20 to-[#16a085]/20" },
];

function getSlugFromCode(code: string | undefined): string | undefined {
  if (!code) return undefined;
  switch (code) {
    case 'PUXMP-2026': return 'ui_ux_design';
    case 'PDMM-2026': return 'digital_marketing';
    case 'PVFX-2026': return 'vfx_compositing';
    case 'PGDM-2026':
    case 'PGDMP-2026': return 'graphic_design';
    case 'PVEM-2026': return 'video_editing_ai';
    case 'P3DA-2026': return '3d_animation';
    case 'PMGM-2026': return 'motion_graphics';
    case 'PFSD-2026': return 'fullstack_web_dev';
    case 'PWDM-2026':
    case 'PWD-2026': return 'wordpress_web_design';
    default: return undefined;
  }
}

export async function FeaturedCourses() {
  let dbCourses: any[] = [];
  try {
    dbCourses = await prisma.course.findMany({
      where: { isPublished: true },
      select: { id: true, name: true, code: true }
    });
  } catch (error) {
    console.warn("Could not fetch courses from database during build, using fallbacks.");
  }

  const coursesToDisplay = dbCourses.length > 0 
    ? dbCourses.map((c) => ({ title: c.name, slug: getSlugFromCode(c.code) }))
    : [
        { title: "Graphic Design", slug: "graphic_design" },
        { title: "UI/UX Design", slug: "ui_ux_design" },
        { title: "Web Design", slug: "fullstack_web_dev" },
        { title: "Full Stack Development", slug: "fullstack_web_dev" },
        { title: "Digital Marketing", slug: "digital_marketing" },
        { title: "Motion Graphics", slug: "motion_graphics" },
        { title: "Video Editing", slug: "video_editing_ai" },
        { title: "3D & Animation", slug: "3d_animation" }
      ];

  return (
    <section className="py-32 max-w-6xl mx-auto bg-[#0A0A0A]/80 backdrop-blur-md rounded-[3rem] shadow-[0_0_80px_rgba(73,171,201,0.07)]  my-8 p-6 md:p-12" id="courses">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-[#FAFAF8] tracking-tight font-sans">
            Learn Skills That <span className="text-[#71717A]">Build Careers.</span>
          </h2>
          <p className="text-xl text-[#A1A1AA] font-sans">
            Master the tools, techniques, and workflows used by top creative professionals and tech companies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {coursesToDisplay.map((course, i) => (
            <FeaturedCourseCard 
              key={i}
              index={i}
              title={course.title}
              slug={course.slug}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
