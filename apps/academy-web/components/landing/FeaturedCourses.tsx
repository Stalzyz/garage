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

export async function FeaturedCourses() {
  let dbCourses: any[] = [];
  try {
    dbCourses = await prisma.course.findMany({
      where: { isPublished: true },
      select: { 
        id: true, 
        name: true,
        code: true,
        lmsCourse: { select: { thumbnail: true } } 
      }
    });
  } catch (error) {
    console.warn("Could not fetch courses from database during build, using fallbacks.");
  }

  const coursesToDisplay = dbCourses.length > 0 
    ? dbCourses.map((c) => ({ title: c.name, code: c.code, coverImage: c.lmsCourse?.thumbnail || null }))
    : [
        { title: "Graphic Design", code: "PGDM-2026", coverImage: null },
        { title: "UI/UX Design", code: "PUXMP-2026", coverImage: null },
        { title: "Web Design", code: "PWDM-2026", coverImage: null },
        { title: "Full Stack Development", code: "PFSD-2026", coverImage: null },
        { title: "Digital Marketing", code: "PDMM-2026", coverImage: null },
        { title: "Motion Graphics", code: "PMGM-2026", coverImage: null },
        { title: "Video Editing", code: "PVEM-2026", coverImage: null },
        { title: "3D & Animation", code: "P3DA-2026", coverImage: null }
      ];

  return (
    <section className="py-32" id="courses">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-4xl mx-auto mb-20 relative">
          <svg className="absolute -top-10 left-[10%] w-24 h-24 opacity-40 pointer-events-none" viewBox="0 0 100 100">
            <path d="M10,90 Q50,10 90,90 M30,50 L70,50" stroke="#FAFAF8" strokeWidth="2" fill="none" strokeLinecap="round" />
            <text x="35" y="80" fill="#FAFAF8" fontSize="12" fontFamily="monospace" transform="rotate(-15 35 80)">Learn</text>
          </svg>

          <h2 className="text-4xl md:text-6xl font-black mb-6 text-[#FAFAF8] tracking-tight font-sans relative inline-block">
            Master Your Craft.
            <svg className="absolute -bottom-4 left-0 w-full h-4" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0 10 Q50 20 100 5 M10 15 Q50 25 90 10" stroke="#10b981" strokeWidth="3" fill="transparent" strokeLinecap="round" />
            </svg>
          </h2>
          <p className="text-xl text-[#A1A1AA] font-handwriting mt-8">
            Don't just watch tutorials. Build real projects, get mentored, and launch your career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-4 max-w-7xl mx-auto relative px-4 md:px-0">
          <div className="absolute inset-0 bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />
          {coursesToDisplay.map((course, i) => (
            <FeaturedCourseCard 
              key={i}
              index={i}
              title={course.title}
              code={course.code}
              coverImage={course.coverImage}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
