"use client"

import { use, useState, useRef, useEffect } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { 
  ArrowLeft, Clock, Calendar, Signal, Award, 
  CheckCircle2, Play, ChevronDown, MonitorPlay, 
  FileText, Download, User, ArrowUpRight, Code2
} from "lucide-react"

// Mock data for the dynamic course
const COURSE_DATA: Record<string, any> = {
  "ui-ux-design": {
    title: "Advanced UI/UX Design",
    badge: "Most Popular",
    description: "Master user research, wireframing, high-fidelity design, and interactive prototyping. Build a portfolio that gets you hired.",
    price: "$999",
    duration: "12 Weeks",
    level: "Intermediate",
    students: "2.4k+",
    whatYouWillLearn: [
      "Conduct effective user research and create data-driven personas",
      "Design accessible and inclusive user interfaces",
      "Master Figma for high-fidelity UI design and interactive prototyping",
      "Create robust, scalable design systems from scratch",
      "Prepare design handoffs for engineering teams",
      "Build a professional portfolio to land top-tier roles"
    ],
    modules: [
      {
        title: "Module 1: User Research & Psychology",
        lessons: [
          { title: "Understanding Cognitive Load", type: "video", duration: "45m" },
          { title: "Conducting User Interviews", type: "reading", duration: "30m" },
          { title: "Creating User Personas", type: "exercise", duration: "1h" },
        ]
      },
      {
        title: "Module 2: Wireframing & Information Architecture",
        lessons: [
          { title: "Card Sorting Techniques", type: "video", duration: "35m" },
          { title: "Low-fidelity wireframing", type: "video", duration: "55m" },
          { title: "User Flows and Journey Maps", type: "exercise", duration: "2h" },
        ]
      },
      {
        title: "Module 3: High-Fidelity UI & Design Systems",
        lessons: [
          { title: "Color Theory & Typography", type: "video", duration: "1h 15m" },
          { title: "Building a Component Library in Figma", type: "video", duration: "2h" },
          { title: "Auto-layout Masterclass", type: "video", duration: "1h" },
        ]
      }
    ]
  },
  "fullstack-engineering": {
    title: "Fullstack Engineering",
    badge: "Intensive",
    description: "From database architecture to dynamic frontend interfaces. Learn React, Node.js, and Postgres to build scalable applications.",
    price: "$1,299",
    duration: "16 Weeks",
    level: "Advanced",
    students: "1.2k+",
    whatYouWillLearn: [
      "Build dynamic SPAs with React and Next.js",
      "Design robust REST and GraphQL APIs with Node.js",
      "Database design and optimization with PostgreSQL",
      "Authentication and Authorization best practices",
      "CI/CD pipelines and deployment strategies",
      "State management using Redux and Zustand"
    ],
    modules: [
      {
        title: "Module 1: Advanced Frontend with React",
        lessons: [
          { title: "React Server Components", type: "video", duration: "1h" },
          { title: "Advanced Hooks Pattern", type: "reading", duration: "45m" },
          { title: "Building a UI Library", type: "exercise", duration: "3h" },
        ]
      },
      {
        title: "Module 2: Backend Architecture",
        lessons: [
          { title: "Node.js Event Loop Deep Dive", type: "video", duration: "50m" },
          { title: "Express vs Fastify", type: "reading", duration: "20m" },
          { title: "Building an API", type: "exercise", duration: "2h" },
        ]
      }
    ]
  }
}

// Ensure the page takes the dynamic slug prop
export default function DynamicCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  // If slug is not in data, default to ui-ux-design just for showcase purposes
  const courseSlug = resolvedParams.slug && COURSE_DATA[resolvedParams.slug] ? resolvedParams.slug : "ui-ux-design"
  const course = COURSE_DATA[courseSlug]

  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const yHero = useTransform(scrollYProgress, [0, 0.2], [0, -50])
  const opacityHero = useTransform(scrollYProgress, [0, 0.15], [1, 0.5])

  const [activeModule, setActiveModule] = useState<number | null>(0)

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] font-sans selection:bg-white/30 text-white relative overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full" />
      </div>

      {/* Grid Overlay */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none" />

      {/* Navbar Minimal */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex items-center justify-between pointer-events-auto backdrop-blur-md bg-black/20 border-b border-white/5">
        <Link href="/academy" className="flex items-center gap-2 group text-white/70 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold tracking-widest uppercase">Back to Academy</span>
        </Link>
        <div className="hidden md:flex gap-4">
          <button className="px-6 py-2 rounded-full bg-white text-black text-sm font-bold tracking-widest uppercase hover:scale-105 transition-transform">
            Enroll Now
          </button>
        </div>
      </nav>

      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-32 pb-24 flex flex-col lg:flex-row gap-16">
        
        {/* Left Content Area */}
        <div className="lg:w-2/3">
          <motion.div style={{ y: yHero, opacity: opacityHero }}>
            <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono tracking-widest uppercase mb-6">
              {course.badge}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.1]">
              {course.title}
            </h1>
            <p className="text-xl text-white/60 font-light leading-relaxed mb-10">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 mb-12 text-sm font-mono tracking-widest text-white/50 uppercase">
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" /> {course.duration}</div>
              <div className="flex items-center gap-2"><Signal className="w-4 h-4 text-purple-400" /> {course.level}</div>
              <div className="flex items-center gap-2"><User className="w-4 h-4 text-indigo-400" /> {course.students} Enrolled</div>
            </div>
          </motion.div>

          <div className="w-full h-px bg-white/10 my-12" />

          {/* What You Will Learn */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-8">What You'll Learn</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {course.whatYouWillLearn.map((item: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <CheckCircle2 className="w-6 h-6 text-blue-400 flex-shrink-0" />
                  <span className="text-white/80 leading-relaxed text-sm">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Curriculum */}
          <section>
            <h2 className="text-3xl font-bold tracking-tight mb-8">Course Curriculum</h2>
            <div className="flex flex-col gap-4">
              {course.modules.map((mod: any, index: number) => (
                <div key={index} className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden">
                  <button 
                    onClick={() => setActiveModule(activeModule === index ? null : index)}
                    className="w-full p-6 flex justify-between items-center text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="font-bold text-lg">{mod.title}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${activeModule === index ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeModule === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-0 border-t border-white/5 flex flex-col gap-2 mt-4">
                          {mod.lessons.map((lesson: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
                              <div className="flex items-center gap-3">
                                {lesson.type === 'video' ? <MonitorPlay className="w-4 h-4 text-blue-400" /> : 
                                 lesson.type === 'exercise' ? <Code2 className="w-4 h-4 text-purple-400" /> :
                                 <FileText className="w-4 h-4 text-white/40" />}
                                <span className="text-white/70 group-hover:text-white transition-colors text-sm">{lesson.title}</span>
                              </div>
                              <span className="text-xs font-mono text-white/40">{lesson.duration}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar (Pricing & Details) */}
        <div className="lg:w-1/3">
          <div className="sticky top-32 p-8 rounded-[2rem] bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-xl">
            <div className="mb-8">
              <span className="text-white/50 uppercase tracking-widest text-xs font-mono block mb-2">Enrollment Fee</span>
              <div className="text-5xl font-bold tracking-tighter">{course.price}</div>
            </div>
            
            <button className="w-full py-4 rounded-full bg-white text-black font-bold tracking-widest uppercase hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 mb-4">
              Enroll Now <ArrowUpRight className="w-5 h-5" />
            </button>
            <button className="w-full py-4 rounded-full bg-transparent border border-white/20 text-white font-bold tracking-widest uppercase hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
              Download Syllabus <Download className="w-5 h-5" />
            </button>

            <div className="mt-8 pt-8 border-t border-white/10">
              <h4 className="font-bold mb-4 uppercase tracking-widest text-sm text-white/60">This Course Includes</h4>
              <ul className="flex flex-col gap-4 text-sm text-white/80">
                <li className="flex items-center gap-3"><Play className="w-4 h-4 text-white/40" /> 40+ hours of on-demand video</li>
                <li className="flex items-center gap-3"><FileText className="w-4 h-4 text-white/40" /> 15 downloadable resources</li>
                <li className="flex items-center gap-3"><Code2 className="w-4 h-4 text-white/40" /> 5 practical coding exercises</li>
                <li className="flex items-center gap-3"><Award className="w-4 h-4 text-white/40" /> Certificate of completion</li>
                <li className="flex items-center gap-3"><Calendar className="w-4 h-4 text-white/40" /> Lifetime access</li>
              </ul>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
