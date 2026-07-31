import { prisma } from "@/lib/prisma"
import { Footer } from "../../components/landing/Footer"
import Link from "next/link"
import { ArrowRight, Play, Clock, Users, Award, CheckCircle, Star, ChevronDown } from "lucide-react"

export const revalidate = 60

export const metadata = {
  title: "Video Editing Course in Coimbatore | Premiere Pro, DaVinci Resolve — Grekam Academy",
  description:
    "Master professional video editing with Adobe Premiere Pro, DaVinci Resolve & After Effects. Industry mentors, real-project curriculum, placement support. Join Grekam Academy, Coimbatore.",
}

// ─── Static fallback course content ─────────────────────────────────────────

const curriculum = [
  {
    month: 1,
    title: "CREATOR FOUNDATION",
    color: "from-[#FF6B35] to-[#FF9F6B]",
    weeks: [
      {
        week: 1,
        title: "Introduction to Digital Media & Photoshop",
        classes: [
          { num: 1, topic: "Course Introduction & Career Opportunities", objective: "Understand the course, career paths and workflow", liveActivity: "Explain editing workflow", practice: "Create project folders", homework: "Organize workspace", portfolio: "—" },
          { num: 2, topic: "Photoshop Basics", objective: "Learn interface and essential tools", liveActivity: "Thumbnail demo", practice: "Design a YouTube thumbnail", homework: "Create 3 thumbnails", portfolio: "Thumbnail Design" },
          { num: 3, topic: "Design Principles", objective: "Learn color, fonts and layout", liveActivity: "Poster design", practice: "Movie poster", homework: "Instagram banner", portfolio: "Poster Design" },
        ],
        weeklyAssignment: "Design branding for a YouTube channel.",
        deliverables: ["3 Thumbnails", "1 Banner", "1 Poster"],
      },
      {
        week: 2,
        title: "Premiere Pro Basics",
        classes: [
          { num: 4, topic: "Premiere Pro Interface", objective: "Understand workspace", liveActivity: "Create project", practice: "Import clips", homework: "Organize folders", portfolio: "—" },
          { num: 5, topic: "Cut & Trim", objective: "Learn basic editing", liveActivity: "Edit sample video", practice: "30-second edit", homework: "Travel video", portfolio: "First Edit" },
          { num: 6, topic: "Timeline & Export", objective: "Learn timeline and export", liveActivity: "Export settings", practice: "Instagram Reel", homework: "30-second reel", portfolio: "Instagram Reel" },
        ],
        weeklyAssignment: "Create an Instagram Reel.",
        deliverables: [],
      },
      {
        week: 3,
        title: "Storytelling Through Editing",
        classes: [
          { num: 7, topic: "Storytelling", objective: "Arrange scenes", liveActivity: "Story editing", practice: "1-minute story", homework: "Story video", portfolio: "Storytelling" },
          { num: 8, topic: "Smooth Cuts & Transitions", objective: "Improve flow", liveActivity: "Transition demo", practice: "Cinematic edit", homework: "Transition practice", portfolio: "Cinematic Edit" },
          { num: 9, topic: "Speed Control", objective: "Create energy", liveActivity: "Slow & fast motion", practice: "Sports highlight", homework: "Action edit", portfolio: "Speed Effects" },
        ],
        weeklyAssignment: "Create a one-minute travel story.",
        deliverables: [],
      },
      {
        week: 4,
        title: "Audio Editing",
        classes: [
          { num: 10, topic: "Background Music", objective: "Add music correctly", liveActivity: "Music sync", practice: "Interview edit", homework: "Interview video", portfolio: "Interview Edit" },
          { num: 11, topic: "Voice Recording", objective: "Record clean voice", liveActivity: "Voice-over", practice: "Podcast intro", homework: "Record narration", portfolio: "Voice-over" },
          { num: 12, topic: "Audio Mixing", objective: "Balance sound", liveActivity: "Mix voice & music", practice: "Social interview", homework: "Final audio edit", portfolio: "Audio Edit" },
        ],
        weeklyAssignment: "Interview Video",
        deliverables: [],
      },
    ],
    monthlyProject: "Interview Video",
  },
  {
    month: 2,
    title: "PROFESSIONAL EDITING",
    color: "from-[#9999FF] to-[#CC88FF]",
    weeks: [
      {
        week: 5,
        title: "Titles & Motion Graphics",
        classes: [
          { num: 13, topic: "Titles", objective: "Create professional titles", liveActivity: "Title animation", practice: "YouTube intro", homework: "Intro animation", portfolio: "Animated Title" },
          { num: 14, topic: "Captions", objective: "Add readable captions", liveActivity: "Caption styles", practice: "Educational video", homework: "Caption edit", portfolio: "Caption Video" },
          { num: 15, topic: "Motion Graphics Basics", objective: "Animate simple graphics", liveActivity: "Lower thirds", practice: "Motion title", homework: "Motion graphics", portfolio: "Motion Title" },
        ],
        weeklyAssignment: "Create a YouTube intro.",
        deliverables: [],
      },
      {
        week: 6,
        title: "Adobe After Effects",
        classes: [
          { num: 16, topic: "Interface", objective: "Learn workspace", liveActivity: "New composition", practice: "Composition practice", homework: "Animated logo", portfolio: "Logo Animation" },
          { num: 17, topic: "Keyframes", objective: "Animate objects", liveActivity: "Text animation", practice: "Logo reveal", homework: "Logo animation", portfolio: "Logo Reveal" },
          { num: 18, topic: "Motion Graphics", objective: "Create promo animation", liveActivity: "Promo demo", practice: "Promo video", homework: "Promotional video", portfolio: "Motion Graphics" },
        ],
        weeklyAssignment: "Animated Logo.",
        deliverables: [],
      },
      {
        week: 7,
        title: "Corporate & Product Videos",
        classes: [
          { num: 19, topic: "Corporate Video", objective: "Edit company profile", liveActivity: "Corporate workflow", practice: "Company video", homework: "Corporate promo", portfolio: "Corporate Video" },
          { num: 20, topic: "Product Video", objective: "Showcase products", liveActivity: "Product lighting", practice: "Product advertisement", homework: "Product ad", portfolio: "Product Ad" },
          { num: 21, topic: "Commercial Editing", objective: "Edit advertisements", liveActivity: "Commercial workflow", practice: "Brand advertisement", homework: "30-second ad", portfolio: "Commercial Video" },
        ],
        weeklyAssignment: "30-second Product Advertisement.",
        deliverables: [],
      },
      {
        week: 8,
        title: "Social Media Editing",
        classes: [
          { num: 22, topic: "Instagram Reels", objective: "Vertical editing", liveActivity: "Reel workflow", practice: "Trending reel", homework: "Reel challenge", portfolio: "Instagram Reel" },
          { num: 23, topic: "YouTube Shorts", objective: "Fast editing", liveActivity: "Shorts workflow", practice: "Short video", homework: "Shorts edit", portfolio: "Shorts" },
          { num: 24, topic: "Social Media Workflow", objective: "Export for platforms", liveActivity: "Export settings", practice: "Social campaign", homework: "Campaign", portfolio: "Social Campaign" },
        ],
        weeklyAssignment: "Complete Social Media Campaign.",
        deliverables: [],
      },
    ],
    monthlyProject: "Complete Social Media Campaign",
  },
  {
    month: 3,
    title: "ADVANCED PROJECTS",
    color: "from-[#10b981] to-[#49abc9]",
    weeks: [
      {
        week: 9,
        title: "Music Video Editing",
        classes: [
          { num: 25, topic: "Beat Editing", objective: "Sync music", liveActivity: "Music edit", practice: "Music video", homework: "Beat edit", portfolio: "Music Video" },
          { num: 26, topic: "Rhythm Editing", objective: "Match cuts", liveActivity: "Dance edit", practice: "Dance video", homework: "Music sequence", portfolio: "Beat Edit" },
          { num: 27, topic: "Cinematic Style", objective: "Improve storytelling", liveActivity: "Film edit", practice: "Cinematic scene", homework: "Film scene", portfolio: "Cinematic Edit" },
        ],
        weeklyAssignment: "Music Video.",
        deliverables: [],
      },
      {
        week: 10,
        title: "Color & Basic VFX",
        classes: [
          { num: 28, topic: "Color Correction", objective: "Improve colors", liveActivity: "Color demo", practice: "Before & after", homework: "Color correction", portfolio: "Color Project" },
          { num: 29, topic: "Green Screen", objective: "Replace background", liveActivity: "Green screen", practice: "Replace background", homework: "Green screen scene", portfolio: "Green Screen" },
          { num: 30, topic: "Basic VFX", objective: "Add simple effects", liveActivity: "Action effects", practice: "Action clip", homework: "VFX scene", portfolio: "Basic VFX" },
        ],
        weeklyAssignment: "Action Scene with Green Screen.",
        deliverables: [],
      },
      {
        week: 11,
        title: "AI for Video Editors",
        classes: [
          { num: 31, topic: "ElevenLabs", objective: "Generate AI voice", liveActivity: "Voice generation", practice: "Narration", homework: "AI voice", portfolio: "AI Voice" },
          { num: 32, topic: "AI Video Workflow", objective: "Add AI narration", liveActivity: "Product advertisement", practice: "AI commercial", homework: "Product advertisement", portfolio: "AI Commercial" },
          { num: 33, topic: "Portfolio Review", objective: "Improve projects", liveActivity: "Mentor review", practice: "Improve videos", homework: "Final portfolio", portfolio: "Portfolio" },
        ],
        weeklyAssignment: "AI Product Advertisement.",
        deliverables: [],
      },
      {
        week: 12,
        title: "Career Development & Capstone",
        classes: [
          { num: 34, topic: "Freelancing & Clients", objective: "Learn client workflow", liveActivity: "Proposal writing", practice: "Client project", homework: "Freelance profile", portfolio: "Career" },
          { num: 35, topic: "Resume, LinkedIn & Portfolio", objective: "Build professional profile", liveActivity: "Portfolio review", practice: "Resume", homework: "LinkedIn", portfolio: "Professional Portfolio" },
          { num: 36, topic: "Final Capstone Presentation", objective: "Present completed work", liveActivity: "Final presentation", practice: "Jury review", homework: "Course completion", portfolio: "Final Portfolio" },
        ],
        weeklyAssignment: "Final Capstone Presentation",
        deliverables: [],
      },
    ],
    monthlyProject: "Final Portfolio",
  },
]

const capstoneProjects = [
  "YouTube Thumbnail", "Instagram Reel", "YouTube Short", "Travel Video",
  "Interview Video", "Corporate Video", "Product Advertisement", "Commercial Advertisement",
  "Music Video", "Green Screen Project", "Basic VFX Scene", "AI Voice Advertisement",
  "2–3 Minute Short Film",
]

const outcomes = [
  "Edit professional films, ads, and reels with confidence",
  "Grade footage like a Hollywood colourist",
  "Create After Effects motion graphics from scratch",
  "Build a showreel that wins freelance clients",
  "Understand every delivery format: YouTube, OTT, Social",
  "Land a junior editor or content creator role",
]

const tools = [
  { name: "Adobe Premiere Pro", color: "from-[#9999FF] to-[#6666CC]" },
  { name: "DaVinci Resolve", color: "from-[#FF6B35] to-[#CC3300]" },
  { name: "After Effects", color: "from-[#9999FF] to-[#CC00FF]" },
  { name: "Adobe Audition", color: "from-[#4DE8C2] to-[#00B8A9]" },
  { name: "Photoshop", color: "from-[#31A8FF] to-[#0050E6]" },
  { name: "Frame.io", color: "from-[#8BFFC2] to-[#00CC77]" },
]

const faqs = [
  {
    q: "Do I need a powerful computer to join?",
    a: "Our lab computers are equipped with professional-grade workstations. You can also take the online batches from your own machine — we'll guide you on minimum specs.",
  },
  {
    q: "What is the course duration?",
    a: "The standard batch runs for 3 months (weekday) or 5 months (weekend). Intensive crash courses are also available for 45 days.",
  },
  {
    q: "Is there a placement guarantee?",
    a: "We provide 100% placement assistance through our hiring partner network and alumni referrals. Several graduates have placed at media houses, OTT production teams, and ad agencies.",
  },
  {
    q: "Can I learn from home?",
    a: "Yes! We offer fully live online batches with the same curriculum, mentor access, and project reviews as our classroom programme.",
  },
  {
    q: "Will I receive a certificate?",
    a: "Yes — Grekam Academy issues a verified certificate upon completion. We also help you prepare for Adobe Certified Professional exams.",
  },
]

// ─── Page Component ──────────────────────────────────────────────────────────

export default async function VideoEditingPage() {
  // Try to load CMS-managed HTML sections from the database
  let cmsPage: any = null
  try {
    cmsPage = await prisma.landingPage.findUnique({
      where: { slug: "video_editing", isActive: true },
      include: { sections: { orderBy: { sortOrder: "asc" } } },
    })
  } catch {
    // DB unavailable during build — use static fallback
  }

  const cmsSections = cmsPage?.sections ?? []

  return (
    <main className="bg-[#050505] text-[#FAFAF8] overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 pt-24 pb-16 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#FF6B35]/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-[#9999FF]/10 blur-[100px] rounded-full" />
          <div className="absolute top-1/3 right-0 w-[350px] h-[350px] bg-[#49abc9]/8 blur-[100px] rounded-full" />
        </div>

        {/* Pill badge */}
        <div className="relative z-10 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-semibold text-[#FF6B35] tracking-wider uppercase mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-pulse" />
          Professional Certification Course
        </div>

        <h1 className="relative z-10 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-6">
          <span className="block text-[#FAFAF8]">Video</span>
          <span
            className="block"
            style={{
              background: "linear-gradient(135deg, #FF6B35 0%, #9999FF 50%, #49abc9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Editing
          </span>
          <span className="block text-[#FAFAF8] text-4xl sm:text-5xl md:text-6xl font-handwriting">
            Mastery
          </span>
        </h1>

        <p className="relative z-10 text-lg md:text-xl text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed mb-10">
          From raw footage to cinematic masterpiece. Learn{" "}
          <span className="text-[#FF6B35] font-semibold">Premiere Pro</span>,{" "}
          <span className="text-[#9999FF] font-semibold">DaVinci Resolve</span> &amp;{" "}
          <span className="text-[#49abc9] font-semibold">After Effects</span> with real projects,
          live mentorship, and a showreel that gets you hired.
        </p>

        {/* Stats row */}
        <div className="relative z-10 flex flex-wrap gap-6 justify-center mb-12">
          {[
            { icon: <Clock className="w-4 h-4" />, label: "3–5 Months" },
            { icon: <Users className="w-4 h-4" />, label: "Batch Size: 12–15" },
            { icon: <Award className="w-4 h-4" />, label: "Certified Programme" },
            { icon: <Star className="w-4 h-4" />, label: "4.9 / 5 Rating" },
          ].map((stat, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm text-[#A1A1AA] bg-white/5 border border-white/10 rounded-full px-4 py-2"
            >
              <span className="text-[#FF6B35]">{stat.icon}</span>
              {stat.label}
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#enroll"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-[#050505] bg-[#FAFAF8] hover:bg-white transition-colors shadow-xl"
          >
            Enroll Now <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#curriculum"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-[#FAFAF8] bg-white/5 border border-white/15 hover:bg-white/10 transition-colors"
          >
            <Play className="w-4 h-4" /> View Curriculum
          </a>
        </div>

        {/* Scroll hint */}
        <div className="relative z-10 mt-16 flex flex-col items-center gap-1 text-white/20 text-xs">
          <span>Scroll to explore</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* ── CMS INJECTED SECTIONS ─────────────────────────────────── */}
      {cmsSections.map((section: any) => {
        const content = section.content as any
        if (content?.type === "html" && content?.html) {
          return (
            <section key={section.id} className="relative w-full">
              {content.customCss && (
                <style dangerouslySetInnerHTML={{ __html: content.customCss }} />
              )}
              <div dangerouslySetInnerHTML={{ __html: content.html }} />
            </section>
          )
        }
        return null
      })}

      {/* ── TOOLS / SOFTWARE ──────────────────────────────────────── */}
      <section className="py-20 px-4 border-y border-white/5">
        <div className="container mx-auto max-w-6xl">
          <p className="text-center text-xs font-bold tracking-widest uppercase text-[#A1A1AA] mb-10">
            Software You'll Master
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {tools.map((tool, i) => (
              <div
                key={i}
                className="relative group rounded-2xl overflow-hidden border border-white/10 bg-white/5 px-6 py-4 flex items-center gap-3 hover:border-white/20 transition-all hover:-translate-y-1"
              >
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tool.color} flex-shrink-0`}
                />
                <span className="text-sm font-semibold text-[#FAFAF8]">{tool.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CURRICULUM ────────────────────────────────────────────── */}
      <section id="curriculum" className="py-28 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Course Curriculum
            </h2>
            <p className="text-[#A1A1AA] text-lg">
              3 Months · 12 Weeks · 36 Classes · 100+ hours of hands-on content
            </p>
          </div>

          {/* Month accordions */}
          <div className="space-y-6">
            {curriculum.map((month, mi) => (
              <details
                key={mi}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/15 transition-colors"
                open={mi === 0}
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-black tracking-widest uppercase px-4 py-1.5 rounded-full bg-gradient-to-r ${month.color} text-white shadow-lg`}>
                      Month {month.month}
                    </span>
                    <h3 className="font-black text-xl tracking-tight">{month.title}</h3>
                    <span className="text-xs text-[#A1A1AA] hidden sm:block">4 weeks · 12 classes</span>
                  </div>
                  <ChevronDown className="w-5 h-5 text-[#A1A1AA] group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>

                <div className="border-t border-white/5 px-4 pb-6 pt-4 space-y-6">
                  {month.weeks.map((wk, wi) => (
                    <details key={wi} className="group/week bg-white/5 border border-white/10 rounded-xl overflow-hidden" open={wi === 0}>
                      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold tracking-widest text-[#A1A1AA] uppercase">Week {wk.week}</span>
                          <h4 className="font-bold text-base">{wk.title}</h4>
                        </div>
                        <ChevronDown className="w-4 h-4 text-[#A1A1AA] group-open/week:rotate-180 transition-transform flex-shrink-0" />
                      </summary>

                      <div className="border-t border-white/5">
                        {/* Class table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs min-w-[700px]">
                            <thead>
                              <tr className="bg-white/5 text-[#A1A1AA] uppercase tracking-wider">
                                {["#", "Topic", "Objective", "Live Activity", "Practice", "Homework", "Portfolio"].map((h) => (
                                  <th key={h} className="px-4 py-3 text-left font-semibold border-b border-white/5">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {wk.classes.map((cls, ci) => (
                                <tr key={ci} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="px-4 py-3 font-bold text-[#FF6B35]">{cls.num}</td>
                                  <td className="px-4 py-3 font-semibold text-[#FAFAF8]">{cls.topic}</td>
                                  <td className="px-4 py-3 text-[#A1A1AA]">{cls.objective}</td>
                                  <td className="px-4 py-3 text-[#A1A1AA]">{cls.liveActivity}</td>
                                  <td className="px-4 py-3 text-[#A1A1AA]">{cls.practice}</td>
                                  <td className="px-4 py-3 text-[#A1A1AA]">{cls.homework}</td>
                                  <td className="px-4 py-3">
                                    {cls.portfolio !== "—" ? (
                                      <span className="inline-block px-2 py-0.5 bg-[#FF6B35]/10 text-[#FF6B35] rounded-full text-[10px] font-bold border border-[#FF6B35]/20 whitespace-nowrap">
                                        {cls.portfolio}
                                      </span>
                                    ) : (
                                      <span className="text-white/20">—</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Weekly assignment */}
                        <div className="mx-4 my-4 p-4 bg-white/5 rounded-xl border border-white/10">
                          <p className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">Weekly Assignment</p>
                          <p className="text-sm font-semibold text-[#FAFAF8]">{wk.weeklyAssignment}</p>
                          {wk.deliverables.length > 0 && (
                            <ul className="mt-2 flex flex-wrap gap-2">
                              {wk.deliverables.map((d, di) => (
                                <li key={di} className="text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[#A1A1AA]">{d}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </details>
                  ))}

                  {/* Monthly project badge */}
                  <div className="flex items-center gap-3 px-2 pt-2">
                    <span className="text-xs font-black uppercase tracking-widest text-[#A1A1AA]">Monthly Project</span>
                    <span className={`text-xs font-bold px-4 py-1.5 rounded-full bg-gradient-to-r ${month.color} text-white`}>
                      {month.monthlyProject}
                    </span>
                  </div>
                </div>
              </details>
            ))}
          </div>

          {/* Final Capstone */}
          <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-xl font-black tracking-tight">Final Capstone Project</h3>
              <p className="text-[#A1A1AA] text-sm mt-1">Every student must submit all of the following to graduate:</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-white/5">
              {capstoneProjects.map((project, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-4 bg-[#050505]">
                  <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0" />
                  <span className="text-sm font-medium text-[#FAFAF8]">{project}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OUTCOMES ──────────────────────────────────────────────── */}
      <section className="py-28 px-4 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                What You'll
                <br />
                <span className="font-handwriting text-[#FF6B35]">Walk Away With</span>
              </h2>
              <p className="text-[#A1A1AA] text-lg leading-relaxed">
                Every module is mapped to a real industry deliverable. By graduation, you'll have
                a portfolio reel employers can't ignore.
              </p>
            </div>
            <ul className="space-y-4">
              {outcomes.map((outcome, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#10b981] mt-0.5 flex-shrink-0" />
                  <span className="text-[#FAFAF8] font-medium">{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="py-28 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-16">
            Frequently Asked
            <span className="font-handwriting text-[#9999FF]"> Questions</span>
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="font-semibold text-base">{faq.q}</h3>
                  <ChevronDown className="w-5 h-5 text-[#A1A1AA] group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <p className="px-6 pb-6 text-[#A1A1AA] text-sm leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENROLL CTA ────────────────────────────────────────────── */}
      <section id="enroll" className="py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#FF6B35]/8 blur-[120px] rounded-full" />
        </div>
        <div className="container mx-auto max-w-3xl relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Ready to Cut &amp;
            <span className="font-handwriting text-[#FF6B35]"> Create?</span>
          </h2>
          <p className="text-[#A1A1AA] text-lg mb-10 max-w-xl mx-auto">
            Seats are limited to keep batches personal. Register now and our admission team will
            reach out within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/919XXXXXXXXX?text=Hi%2C%20I%27m%20interested%20in%20the%20Video%20Editing%20course%20at%20Grekam%20Academy"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full font-bold text-[#050505] bg-[#FAFAF8] hover:bg-white transition-colors shadow-xl text-lg"
            >
              Apply Now <ArrowRight className="w-5 h-5" />
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full font-bold text-[#FAFAF8] bg-white/5 border border-white/15 hover:bg-white/10 transition-colors text-lg"
            >
              Explore All Courses
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
