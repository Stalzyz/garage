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
    module: "Module 1",
    title: "Foundations of Video Editing",
    lessons: [
      "Introduction to Non-Linear Editing",
      "File formats, codecs & frame rates",
      "Setting up your editing workspace",
      "Importing & organising footage",
    ],
  },
  {
    module: "Module 2",
    title: "Adobe Premiere Pro Mastery",
    lessons: [
      "Timeline workflow & multi-cam editing",
      "Audio mixing, noise reduction & voiceover sync",
      "Colour grading with Lumetri",
      "Titles, captions & motion graphics",
    ],
  },
  {
    module: "Module 3",
    title: "DaVinci Resolve — Colour Science",
    lessons: [
      "Node-based colour pipeline",
      "LOG footage & LUT application",
      "HDR grading & delivery",
      "Fusion for visual effects",
    ],
  },
  {
    module: "Module 4",
    title: "After Effects & Motion Graphics",
    lessons: [
      "Keyframe animation & easing",
      "Mask, track matte & layer compositing",
      "Kinetic typography",
      "Plugin ecosystem: Element 3D, Optical Flares",
    ],
  },
  {
    module: "Module 5",
    title: "Short-Form & Social Media Content",
    lessons: [
      "Instagram Reels, YouTube Shorts workflow",
      "Trending transitions & speed-ramp techniques",
      "Thumbnail design & A/B testing",
      "Batch-export & delivery specs",
    ],
  },
  {
    module: "Module 6",
    title: "Capstone & Portfolio",
    lessons: [
      "Client brief simulation & contract",
      "Full branded video production",
      "Portfolio reel assembly",
      "Freelance pricing & pitch decks",
    ],
  },
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
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Course Curriculum
            </h2>
            <p className="text-[#A1A1AA] text-lg">
              6 structured modules · 60+ hours of hands-on content
            </p>
          </div>

          <div className="space-y-4">
            {curriculum.map((mod, i) => (
              <details
                key={i}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors"
                open={i === 0}
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <div className="flex items-center gap-4">
                    <span
                      className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                      style={{
                        background: `hsl(${i * 45}, 70%, 50%, 0.15)`,
                        color: `hsl(${i * 45}, 80%, 70%)`,
                        border: `1px solid hsl(${i * 45}, 60%, 40%, 0.3)`,
                      }}
                    >
                      {mod.module}
                    </span>
                    <h3 className="font-bold text-lg">{mod.title}</h3>
                  </div>
                  <ChevronDown className="w-5 h-5 text-[#A1A1AA] group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <ul className="px-6 pb-6 space-y-3 border-t border-white/5 pt-4">
                  {mod.lessons.map((lesson, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-[#A1A1AA]">
                      <Play className="w-3 h-3 mt-0.5 text-[#FF6B35] flex-shrink-0" />
                      {lesson}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
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
