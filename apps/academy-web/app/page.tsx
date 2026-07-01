"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronDown, CheckCircle2, PlayCircle, Plus, Minus } from "lucide-react"

// --- Components ---

const AccordionItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border-b border-black/10 py-6">
      <button 
        className="flex w-full items-center justify-between text-left focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="text-xl font-bold font-serif group-hover:text-black/70 transition-colors">{question}</h4>
        <div className="ml-4 flex-shrink-0">
          {isOpen ? <Minus className="w-5 h-5 text-black/50" /> : <Plus className="w-5 h-5 text-black/50" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pt-4 text-black/70 leading-relaxed max-w-3xl">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const CourseCard = ({ title, desc, delay }: { title: string, desc: string, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay }}
    className="group relative p-8 border border-black/10 hover:border-black/30 transition-colors bg-white/50 backdrop-blur-sm cursor-pointer overflow-hidden"
  >
    <div className="absolute inset-0 bg-black/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
    <div className="relative z-10">
      <div className="w-10 h-10 mb-6 rounded-full border border-black/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
        <ArrowRight className="w-4 h-4 text-black/50 group-hover:text-black transition-colors" />
      </div>
      <h3 className="text-2xl font-bold font-serif mb-4">{title}</h3>
      <p className="text-black/60 text-sm leading-relaxed">{desc}</p>
    </div>
  </motion.div>
)

const TimelineStep = ({ step, title, isLast = false }: { step: string, title: string, isLast?: boolean }) => (
  <div className="flex flex-col items-center">
    <div className="w-16 h-16 rounded-full border border-black/20 flex items-center justify-center bg-white z-10 relative shadow-sm">
      <span className="font-mono text-xs text-black/50">{step}</span>
    </div>
    <div className="mt-4 text-center">
      <h4 className="font-bold text-sm tracking-widest uppercase">{title}</h4>
    </div>
    {!isLast && (
      <div className="h-16 w-px bg-black/10 my-2 relative">
        <motion.div 
          initial={{ height: 0 }}
          whileInView={{ height: "100%" }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute top-0 left-0 w-full bg-black/30"
        />
      </div>
    )}
  </div>
)

// --- Main Page ---

export default function AcademyLanding() {
  const { scrollYProgress } = useScroll()
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 200])

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#121212] selection:bg-black selection:text-white font-sans overflow-hidden">
      
      {/* SVG Filters for "Sketch" effect on borders/images if needed */}
      <svg className="hidden">
        <filter id="rough-edge">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full p-6 md:p-8 flex justify-between items-center z-50 mix-blend-difference text-white">
        <div className="font-serif text-xl md:text-2xl font-bold tracking-tight">GREKAM ACADEMY</div>
        <div className="hidden md:flex gap-8 text-sm font-bold tracking-widest uppercase">
          <Link href="#paths" className="hover:opacity-50 transition-opacity">Paths</Link>
          <Link href="#experience" className="hover:opacity-50 transition-opacity">Experience</Link>
          <Link href="#community" className="hover:opacity-50 transition-opacity">Community</Link>
        </div>
        <Link href="/dashboard/student" className="px-6 py-2 border border-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-20 pt-32 pb-20">
        <motion.div 
          style={{ y: yHero }}
          className="max-w-5xl z-10"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block py-1 px-3 border border-black/20 rounded-full text-[10px] uppercase tracking-[0.2em] mb-8 text-black/60">
              Learn. Create. Build Your Future.
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(3rem,8vw,8rem)] leading-[0.9] font-serif tracking-tighter"
          >
            Creativity <br className="hidden md:block" />
            <span className="italic text-black/60">Begins Here.</span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-12 md:mt-20 max-w-2xl text-lg md:text-xl font-light text-black/70 leading-relaxed space-y-6"
          >
            <p>Not with expensive software.<br/>Not with perfect skills.<br/>But with one decision to start.</p>
            <p>At Grekam Academy, we believe every great designer, developer, animator, and creator starts with curiosity. Our programs are designed to take you from beginner to industry-ready through real projects, expert mentorship, and hands-on learning.</p>
            <p>Whether you dream of designing world-class brands, building modern web applications, creating digital experiences, or launching your own creative business, your journey starts here.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-12 flex flex-col sm:flex-row gap-4"
          >
            <Link href="/dashboard/student" className="px-8 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest text-center hover:bg-black/80 transition-colors rounded-none border border-black">
              Start Learning
            </Link>
            <Link href="#paths" className="px-8 py-4 bg-transparent text-black border border-black text-sm font-bold uppercase tracking-widest text-center hover:bg-black/5 transition-colors rounded-none">
              Explore Courses
            </Link>
          </motion.div>
        </motion.div>

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute left-1/4 top-0 w-px h-full bg-black/10" />
          <div className="absolute left-2/4 top-0 w-px h-full bg-black/10" />
          <div className="absolute left-3/4 top-0 w-px h-full bg-black/10" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-black/10" />
        </div>
      </section>

      {/* The Creative Journey */}
      <section className="py-32 px-6 md:px-20 border-t border-black/10 bg-[#f4f2ea]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[clamp(2rem,5vw,4rem)] font-serif leading-none mb-12"
          >
            Every Master <br />
            <span className="italic text-black/50">Was Once a Beginner.</span>
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8 text-lg md:text-2xl font-light text-black/80"
          >
            <p>Learning isn't about watching videos.<br/>It's about experimenting, making mistakes, improving, and creating work you're proud of.</p>
            <p>Our learning approach combines structured lessons, practical assignments, portfolio development, mentorship, and real-world projects to prepare you for creative careers.</p>
            
            <div className="pt-8 font-serif italic text-3xl md:text-5xl text-black space-y-4">
              <p>Learn by doing.</p>
              <p>Build by creating.</p>
              <p>Grow by solving real problems.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Grekam Academy */}
      <section className="py-32 px-6 md:px-20 border-t border-black/10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-black/50 mb-4 block">Why Grekam Academy</span>
            <h2 className="text-5xl md:text-7xl font-serif tracking-tighter">More Than Courses.</h2>
            <p className="text-xl text-black/60 mt-6 max-w-2xl">A Complete Learning Experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black/10 border border-black/10">
            {[
              { t: "Industry-Focused Curriculum", d: "Every course is designed around real industry workflows and current design and development practices." },
              { t: "Project-Based Learning", d: "Build real websites, applications, branding projects, UI designs, animations, and portfolios throughout your learning journey." },
              { t: "Expert Mentorship", d: "Learn directly from professionals who work on real client projects and understand current industry expectations." },
              { t: "Career Development", d: "From portfolio reviews to interview preparation, we help you become confident before entering the industry." },
              { t: "Flexible Learning", d: "Study from anywhere, anytime, at your own pace with lifetime access to course materials." },
              { t: "Practical Assignments", d: "Every lesson includes exercises that transform knowledge into real skills." }
            ].map((item, i) => (
              <div key={i} className="bg-[#FDFCF8] p-10 lg:p-14 hover:bg-[#f4f2ea] transition-colors">
                <div className="text-4xl font-serif text-black/20 mb-6">0{i + 1}</div>
                <h3 className="text-xl font-bold mb-4">{item.t}</h3>
                <p className="text-black/60 leading-relaxed text-sm">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section id="paths" className="py-32 px-6 md:px-20 bg-black text-[#FDFCF8]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-white/50 mb-4 block">Learning Paths</span>
            <h2 className="text-5xl md:text-7xl font-serif tracking-tighter">Choose Your Creative Journey</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { t: "UI/UX Design", d: "Learn user research, wireframing, design systems, prototyping, mobile interfaces, dashboards, usability testing, and Figma." },
              { t: "Graphic Design", d: "Master branding, typography, color theory, logo design, packaging, social media design, advertising, and print design." },
              { t: "Web Design", d: "Design beautiful, responsive websites with modern layouts, interactions, and user-focused experiences." },
              { t: "Full Stack Development", d: "Build scalable web applications using HTML, CSS, JavaScript, React, Next.js, Node.js, Laravel, APIs, databases, and deployment tools." },
              { t: "Motion Graphics & Animation", d: "Create engaging visual stories using animation principles, motion design, editing, and digital storytelling." },
              { t: "Digital Marketing", d: "Learn SEO, social media marketing, Meta Ads, Google Ads, content strategy, analytics, and campaign optimization." }
            ].map((path, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group border border-white/20 p-8 hover:border-white/50 transition-colors cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-8 right-8 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <h3 className="text-2xl font-bold font-serif mb-4 pr-12">{path.t}</h3>
                <p className="text-white/60 text-sm leading-relaxed max-w-sm">{path.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Experience & Inside the LMS */}
      <section id="experience" className="py-32 px-6 md:px-20 border-t border-black/10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20">
          
          <div className="lg:w-1/3">
            <div className="sticky top-32">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-black/50 mb-4 block">Learning Experience</span>
              <h2 className="text-4xl md:text-5xl font-serif tracking-tighter leading-tight mb-8">
                Learn Like You're Working in a Real Studio.
              </h2>
              <p className="text-black/60 mb-6 leading-relaxed">
                Our platform recreates professional creative workflows. You'll complete client-style projects, receive structured feedback, revise your work, collaborate with mentors, and build confidence through practical experience.
              </p>
              <p className="text-black/60 leading-relaxed font-bold">
                Every project you finish becomes part of your professional portfolio.
              </p>
            </div>
          </div>

          <div className="lg:w-2/3">
            <h3 className="text-2xl font-bold mb-10">Inside the LMS. Everything You Need in One Place.</h3>
            
            <div className="space-y-8">
              {[
                { t: "Interactive Video Lessons", d: "High-quality lessons designed for focused learning." },
                { t: "Live Mentoring Sessions", d: "Ask questions, receive feedback, and improve with expert guidance." },
                { t: "Assignments", d: "Practice after every lesson with structured exercises." },
                { t: "Downloadable Resources", d: "Templates, project files, UI kits, design assets, and coding resources." },
                { t: "Progress Tracking", d: "Monitor your learning journey and celebrate every milestone." },
                { t: "Certificates", d: "Earn verified certificates after successfully completing your courses." },
                { t: "Portfolio Builder", d: "Showcase your best work in a professional portfolio ready to share with employers and clients." },
                { t: "Community", d: "Connect with fellow learners, collaborate on projects, and grow together." }
              ].map((feat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="flex gap-6 items-start pb-8 border-b border-black/10 last:border-0"
                >
                  <div className="mt-1 text-black/30"><CheckCircle2 className="w-6 h-6" /></div>
                  <div>
                    <h4 className="text-xl font-bold font-serif mb-2">{feat.t}</h4>
                    <p className="text-black/60">{feat.d}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* From Student to Professional */}
      <section className="py-32 px-6 md:px-20 bg-[#f4f2ea] border-y border-black/10 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-serif tracking-tighter mb-8">Build Skills That Matter.</h2>
          <p className="text-xl md:text-2xl font-light text-black/70 mb-12 leading-relaxed">
            Learning software is only the beginning. We focus on helping you think like a designer, solve problems like a developer, communicate ideas clearly, and create work that delivers real value.
          </p>
          
          <p className="font-bold text-sm uppercase tracking-widest text-black/50 mb-10">By the time you complete your program, you'll have:</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {["Professional Portfolio", "Industry Projects", "Practical Experience", "Creative Confidence", "Problem-Solving Skills", "Career-Ready Knowledge"].map((item, i) => (
              <span key={i} className="px-6 py-3 border border-black/20 rounded-full text-sm font-bold bg-white/50 backdrop-blur-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Timeline */}
      <section className="py-32 px-6 md:px-20 border-b border-black/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-20">
          <div className="md:w-1/2 sticky top-32">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-black/50 mb-4 block">Learning Timeline</span>
            <h2 className="text-5xl md:text-7xl font-serif tracking-tighter mb-6">Your Growth Journey</h2>
            <p className="text-lg text-black/60">A structured path from day one to career launch.</p>
          </div>
          
          <div className="md:w-1/2 pt-10 flex flex-col items-start w-full">
            <div className="w-full max-w-sm mx-auto">
              <TimelineStep step="01" title="Discover" />
              <TimelineStep step="02" title="Learn" />
              <TimelineStep step="03" title="Practice" />
              <TimelineStep step="04" title="Build" />
              <TimelineStep step="05" title="Receive Feedback" />
              <TimelineStep step="06" title="Improve" />
              <TimelineStep step="07" title="Create Portfolio" />
              <TimelineStep step="08" title="Graduate" />
              <TimelineStep step="09" title="Launch Your Career" isLast />
            </div>
          </div>
        </div>
      </section>

      {/* Career Support & Certifications */}
      <section className="py-32 px-6 md:px-20 border-b border-black/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-black/50 mb-4 block">Career Support</span>
            <h2 className="text-4xl md:text-5xl font-serif tracking-tighter mb-6">We Don't Just Teach. We Help You Build a Career.</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mt-12">
              {[
                "Portfolio Reviews", "Resume Guidance", "Mock Interviews", 
                "Freelance Guidance", "Internship Opportunities", "Placement Assistance", 
                "Personal Branding", "LinkedIn Optimization", "Career Mentoring"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-black rounded-full" />
                  <span className="text-black/80 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-12 bg-black/5 border border-black/10 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white blur-[100px] opacity-50" />
            <div className="relative z-10">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-black/50 mb-4 block">Certifications</span>
              <h3 className="text-3xl font-serif font-bold mb-6">Industry-Recognized Recognition</h3>
              <p className="text-black/70 leading-relaxed mb-6">
                Complete your course and receive an industry-recognized certificate that validates your learning journey and showcases your skills.
              </p>
              <p className="text-black/70 leading-relaxed">
                Certificates can be downloaded digitally and shared with employers, clients, and professional networks.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 px-6 md:px-20 border-b border-black/10 bg-[#f4f2ea]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-serif tracking-tighter">Frequently Asked Questions</h2>
          </div>
          
          <div className="border-t border-black/10">
            <AccordionItem 
              question="How do I access my courses?" 
              answer="Your courses are available online through your personal student dashboard, giving you 24/7 access to all materials." 
            />
            <AccordionItem 
              question="Can I learn at my own pace?" 
              answer="Yes. Most programs are designed for flexible learning while allowing you to revisit lessons whenever needed." 
            />
            <AccordionItem 
              question="Will I build a portfolio?" 
              answer="Absolutely. Every course includes practical projects that contribute to your professional portfolio by the time you graduate." 
            />
            <AccordionItem 
              question="Do I receive a certificate?" 
              answer="Yes. Eligible programs include a downloadable course completion certificate that you can share on LinkedIn and with employers." 
            />
            <AccordionItem 
              question="Do you provide career guidance?" 
              answer="Yes. Portfolio reviews, interview preparation, and career mentoring are included in selected programs to ensure you are industry-ready." 
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 md:px-20 bg-black text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[clamp(3rem,6vw,6rem)] font-serif tracking-tighter leading-[0.9] mb-12">
            Your Creative <br/>Journey Starts Today.
          </h2>
          
          <p className="text-xl md:text-2xl font-light text-white/70 mb-16 leading-relaxed max-w-2xl mx-auto">
            The future belongs to people who build, design, solve, and create. Take the first step toward becoming the designer, developer, or creative professional you've always wanted to be.
          </p>

          <div className="font-serif italic text-2xl md:text-4xl space-y-4 mb-16">
            <p>Learn with purpose.</p>
            <p className="text-white/70">Create with confidence.</p>
            <p className="text-white/40">Build without limits.</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/dashboard/student" className="px-10 py-5 bg-white text-black text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform">
              Join Grekam Academy Today
            </Link>
            <Link href="#paths" className="px-10 py-5 border border-white/30 text-white text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-10 px-6 md:px-20 border-t border-black/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-black/50 bg-[#FDFCF8]">
        <div>© {new Date().getFullYear()} Grekam Academy. All rights reserved.</div>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-black">Privacy</Link>
          <Link href="#" className="hover:text-black">Terms</Link>
          <Link href="#" className="hover:text-black">Contact</Link>
        </div>
      </footer>

    </div>
  )
}
