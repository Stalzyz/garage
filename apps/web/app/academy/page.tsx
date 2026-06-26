"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, ShoppingCart, Globe, ChevronRight, CheckCircle2, Briefcase, GraduationCap, Users, Layout, Terminal, Megaphone, Video, PlayCircle, Trophy, BarChart3, Star, ArrowRight, BrainCircuit } from "lucide-react"

export default function GrekamAcademyLongForm() {
  const [activeSalaryTab, setActiveSalaryTab] = useState('uiux')
  const [cmsData, setCmsData] = useState<any>(null)
  const [lmsCourses, setLmsCourses] = useState<any[]>([])

  useEffect(() => {
    // Fetch CMS Content
    fetch('http://localhost:4000/api/v1/cms/pages/academy')
      .then(res => res.json())
      .then(data => {
        if (data?.data?.sections) {
          const config: any = {}
          data.data.sections.forEach((s: any) => {
            config[s.sectionId] = s.content
          })
          setCmsData(config)
        }
      })
      .catch(console.error)

    // Fetch Live LMS Courses
    fetch('http://localhost:4000/api/v1/lms/courses')
      .then(res => res.json())
      .then(data => {
        if (data?.courses) {
          setLmsCourses(data.courses)
        }
      })
      .catch(console.error)
  }, [])

  const SALARY_DATA: Record<string, { role: string, start: string, peak: string, desc: string }> = cmsData?.salary || {
    uiux: { role: "UI/UX Designer", start: "₹3L", peak: "₹12L+", desc: "Design interfaces and experiences for modern tech companies." },
    fullstack: { role: "Full Stack Developer", start: "₹4L", peak: "₹18L+", desc: "Build complete end-to-end web applications." },
    marketing: { role: "Digital Marketer", start: "₹3L", peak: "₹15L+", desc: "Drive growth and revenue through data-driven campaigns." }
  }

  const heroHeadline = cmsData?.hero?.headline || "Learn Skills.<br/><span class=\"text-[#49ABC9]\">Build Confidence.</span><br/>Get Hired."
  const heroSubtext = cmsData?.hero?.subtext || "Master in-demand skills with industry mentors, real-world projects, internships, certifications, and placement assistance."

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#CCF0FA]" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. Main Navbar */}
      <nav className="w-full h-20 px-6 md:px-12 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-8 shrink-0">
          <Link href="/agency" className="font-black text-2xl tracking-tighter text-[#2C6E82]">
            grekam<span className="text-[#49ABC9]">.</span>
          </Link>
          <button className="text-sm font-medium hover:text-[#49ABC9] hidden lg:block flex items-center gap-1">Courses <ChevronRight className="w-4 h-4 rotate-90" /></button>
        </div>

        <div className="flex-1 max-w-2xl hidden md:flex items-center mx-8">
          <div className="w-full relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="What do you want to learn today?" 
              className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full pl-12 pr-4 text-sm outline-none focus:border-[#49ABC9] focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-sm font-medium">
          <button className="hidden xl:block hover:text-[#49ABC9]">Enterprise</button>
          <div className="hidden md:flex items-center gap-3 ml-4">
            <button className="px-6 py-2.5 rounded-full hover:bg-slate-50 transition-colors">Log in</button>
            <button className="px-6 py-2.5 bg-[#49ABC9] text-white rounded-full shadow-lg shadow-[#49ABC9]/20 hover:bg-[#398FA8] transition-colors">Start Learning</button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="w-full bg-[#F2F9FB] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')] opacity-[0.03] pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#10B981] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 -left-40 w-96 h-96 bg-[#B3EBF6] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#398FA8] text-sm font-bold mb-6 shadow-sm border border-[#E5F4F8]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" /> India's Career-Focused Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1]" dangerouslySetInnerHTML={{ __html: heroHeadline }} />
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-xl leading-relaxed">
              {heroSubtext}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <button className="w-full sm:w-auto px-8 py-4 bg-[#49ABC9] text-white font-bold rounded-full shadow-xl shadow-[#49ABC9]/20 hover:bg-[#398FA8] hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                Explore Courses <ArrowRight className="w-5 h-5" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-bold rounded-full shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                <PlayCircle className="w-5 h-5 text-[#49ABC9]" /> Watch Demo
              </button>
            </div>
          </div>
          
          <div className="flex-1 relative w-full max-w-lg md:max-w-none">
             <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500 bg-[#E5F4F8] aspect-square md:aspect-[4/3]">
                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" alt="Students learning" className="w-full h-full object-cover opacity-90 mix-blend-overlay" />
             </div>
             {/* Floating Badge */}
             <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-100 animate-bounce-slow">
                <div className="w-12 h-12 bg-[#10B981]/10 text-[#10B981] rounded-full flex items-center justify-center"><Briefcase className="w-6 h-6" /></div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Placement Support</div>
                  <div className="text-xs text-slate-500">100% Assistance</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 3. The Ecosystem Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 text-slate-900">More Than Courses.<br/>A Complete Career Ecosystem.</h2>
            <p className="text-lg text-slate-600">At Grekam, we believe education should lead to outcomes. That's why every program combines:</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { title: "Industry Curriculum", icon: <Layout className="w-6 h-6" /> },
               { title: "Live Mentor Sessions", icon: <Users className="w-6 h-6" /> },
               { title: "Real Client Projects", icon: <Briefcase className="w-6 h-6" /> },
               { title: "Portfolio Development", icon: <Layout className="w-6 h-6" /> },
               { title: "Internship Opportunities", icon: <GraduationCap className="w-6 h-6" /> },
               { title: "Placement Support", icon: <Trophy className="w-6 h-6" /> },
               { title: "Community Learning", icon: <Users className="w-6 h-6" /> },
               { title: "Lifetime Access", icon: <Globe className="w-6 h-6" /> }
             ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#CCF0FA] hover:shadow-lg hover:shadow-[#F2F9FB] transition-all flex items-start gap-4">
                   <div className="text-[#49ABC9] mt-1">{item.icon}</div>
                   <div>
                     <div className="font-bold text-slate-900 mb-1">{item.title}</div>
                     <div className="flex items-center gap-1 text-xs text-[#10B981] font-medium"><CheckCircle2 className="w-3 h-3" /> Included</div>
                   </div>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* 4. Course Categories */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-16 text-center text-slate-900">Learn In-Demand Skills</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             
             {/* Design */}
             <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-shadow">
               <div className="w-14 h-14 bg-[#E5F4F8] text-[#49ABC9] rounded-2xl flex items-center justify-center mb-6"><Layout className="w-7 h-7" /></div>
               <h3 className="text-2xl font-bold mb-3">Design & Creativity</h3>
               <p className="text-slate-500 mb-8">Create visual experiences that brands love.</p>
               <ul className="grid grid-cols-2 gap-y-4 gap-x-2">
                 {['Graphic Designing', 'UI/UX Designing', 'Branding Design', 'Motion Graphics', 'Video Editing', 'Digital Illustration'].map(skill => (
                   <li key={skill} className="flex items-center gap-2 text-sm font-medium text-slate-700"><CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" /> {skill}</li>
                 ))}
               </ul>
             </div>

             {/* Tech */}
             <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-shadow">
               <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6"><Terminal className="w-7 h-7" /></div>
               <h3 className="text-2xl font-bold mb-3">Technology & Development</h3>
               <p className="text-slate-500 mb-8">Build websites, applications, and digital products.</p>
               <ul className="grid grid-cols-2 gap-y-4 gap-x-2">
                 {['Full Stack Dev', 'Web Designing', 'Frontend Dev', 'Backend Dev', 'Ecommerce Dev', 'AI Tools'].map(skill => (
                   <li key={skill} className="flex items-center gap-2 text-sm font-medium text-slate-700"><CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" /> {skill}</li>
                 ))}
               </ul>
             </div>

             {/* Marketing */}
             <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-shadow">
               <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6"><Megaphone className="w-7 h-7" /></div>
               <h3 className="text-2xl font-bold mb-3">Marketing & Growth</h3>
               <p className="text-slate-500 mb-8">Learn how modern brands attract customers.</p>
               <ul className="grid grid-cols-2 gap-y-4 gap-x-2">
                 {['Digital Marketing', 'Social Media', 'SEO', 'Meta Ads', 'Google Ads', 'Automation'].map(skill => (
                   <li key={skill} className="flex items-center gap-2 text-sm font-medium text-slate-700"><CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" /> {skill}</li>
                 ))}
               </ul>
             </div>

             {/* Animation */}
             <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-shadow">
               <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6"><Video className="w-7 h-7" /></div>
               <h3 className="text-2xl font-bold mb-3">Animation & Media</h3>
               <p className="text-slate-500 mb-8">Bring ideas to life through storytelling.</p>
               <ul className="grid grid-cols-2 gap-y-4 gap-x-2">
                 {['2D Animation', '3D Animation', 'Motion Design', 'Visual Story', 'Content Production', 'Editing'].map(skill => (
                   <li key={skill} className="flex items-center gap-2 text-sm font-medium text-slate-700"><CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" /> {skill}</li>
                 ))}
               </ul>
             </div>

          </div>
        </div>
      </section>

      {/* 4.5 Live Database Courses (LMS Module) */}
      {lmsCourses.length > 0 && (
        <section className="py-24 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">Live Academy Courses</h2>
              <button className="text-[#49ABC9] font-bold flex items-center gap-2 hover:text-[#398FA8]">View All <ArrowRight className="w-4 h-4" /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lmsCourses.map((lms) => (
                <div key={lms.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col">
                  <div className="h-48 bg-slate-100 relative overflow-hidden">
                    {lms.thumbnail ? (
                      <img src={lms.thumbnail} alt={lms.course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 bg-[#E5F4F8]"><Layout className="w-12 h-12 text-[#49ABC9] opacity-50" /></div>
                    )}
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 text-xs font-bold rounded-full shadow-sm">
                      {lms.course.duration}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="text-xs font-bold text-[#49ABC9] mb-2">{lms.course.code}</div>
                    <h3 className="text-xl font-bold mb-2 text-slate-900">{lms.course.name}</h3>
                    <p className="text-sm text-slate-500 mb-6 flex-1">{lms.course.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                      <div className="text-lg font-black text-slate-900">₹{lms.course.fee.toLocaleString('en-IN')}</div>
                      <Link href={`/course/${lms.id}`} className="px-4 py-2 bg-[#F2F9FB] text-[#49ABC9] font-bold text-sm rounded-lg hover:bg-[#49ABC9] hover:text-white transition-colors">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Why Grekam & How it Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
           
           <div className="mb-32">
             <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-16 text-center text-slate-900">Why Learners Choose Grekam</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { t: "Learn by Building", d: "No boring theory-only classes. Work on live projects and portfolio-worthy assignments.", c: "bg-[#F2F9FB] text-[#398FA8]" },
                  { t: "Industry Experts", d: "Get direct guidance from professionals actively working in the industry.", c: "bg-green-50 text-green-700" },
                  { t: "Career-Ready", d: "From portfolio reviews to mock interviews and placement assistance.", c: "bg-blue-50 text-blue-700" },
                  { t: "At Your Pace", d: "Live classes, recorded sessions, weekend batches, or self-paced learning.", c: "bg-purple-50 text-purple-700" }
                ].map((w, i) => (
                   <div key={i} className="text-center flex flex-col items-center">
                     <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl mb-6 ${w.c}`}>0{i+1}</div>
                     <h3 className="text-xl font-bold mb-3">{w.t}</h3>
                     <p className="text-slate-500 text-sm leading-relaxed">{w.d}</p>
                   </div>
                ))}
             </div>
           </div>

           <div className="bg-[#1C4A58] rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')] opacity-10 mix-blend-overlay pointer-events-none" />
             <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-16 text-center relative z-10">How Learning Works</h2>
             <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-center relative before:absolute before:top-1/2 before:left-0 before:w-full before:h-0.5 before:bg-[#2C6E82] before:-translate-y-1/2 hidden md:grid">
                {[
                  { s: "Step 1", t: "Choose Path", d: "Select a course based on your goals." },
                  { s: "Step 2", t: "Learn from Experts", d: "Attend live classes and interact." },
                  { s: "Step 3", t: "Build Projects", d: "Apply skills to real portfolios." },
                  { s: "Step 4", t: "Get Placed", d: "Internships & career guidance." }
                ].map((s, i) => (
                   <div key={i} className="relative z-10 flex flex-col items-center">
                     <div className="w-12 h-12 rounded-full bg-[#49ABC9] border-4 border-[#1C4A58] text-white flex items-center justify-center font-bold mb-6">{i+1}</div>
                     <div className="text-[#B3EBF6] text-xs font-bold uppercase tracking-widest mb-2">{s.s}</div>
                     <h3 className="text-lg font-bold mb-2">{s.t}</h3>
                     <p className="text-[#E5F4F8] text-sm">{s.d}</p>
                   </div>
                ))}
             </div>
             {/* Mobile Timeline */}
             <div className="md:hidden flex flex-col gap-8 relative z-10 before:absolute before:left-6 before:top-0 before:h-full before:w-0.5 before:bg-[#2C6E82]">
                {[
                  { s: "Step 1", t: "Choose Path", d: "Select a course based on your goals." },
                  { s: "Step 2", t: "Learn from Experts", d: "Attend live classes and interact." },
                  { s: "Step 3", t: "Build Projects", d: "Apply skills to real portfolios." },
                  { s: "Step 4", t: "Get Placed", d: "Internships & career guidance." }
                ].map((s, i) => (
                   <div key={i} className="flex gap-6 items-start relative z-10">
                     <div className="w-12 h-12 rounded-full bg-[#49ABC9] border-4 border-[#1C4A58] shrink-0 text-white flex items-center justify-center font-bold">{i+1}</div>
                     <div className="pt-2">
                       <div className="text-[#B3EBF6] text-xs font-bold uppercase tracking-widest mb-1">{s.s}</div>
                       <h3 className="text-lg font-bold mb-1">{s.t}</h3>
                       <p className="text-[#E5F4F8] text-sm">{s.d}</p>
                     </div>
                   </div>
                ))}
             </div>
           </div>
        </div>
      </section>

      {/* 6. Conversion Sections (Salary, Portfolios, Mentors) */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-32">
           
           {/* Calculator */}
           <div className="flex flex-col md:flex-row gap-12 items-center">
             <div className="flex-1">
               <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Your Career ROI</h2>
               <p className="text-slate-600 mb-8">See the salary potential for careers you can launch through Grekam Academy.</p>
               <div className="flex gap-4 mb-8 border-b border-slate-200">
                  {Object.keys(SALARY_DATA).map(key => (
                     <button 
                       key={key} 
                       onClick={() => setActiveSalaryTab(key)}
                       className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeSalaryTab === key ? 'border-[#49ABC9] text-[#398FA8]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                     >
                        {SALARY_DATA[key].role}
                     </button>
                  ))}
               </div>
               <p className="text-sm text-slate-500">{SALARY_DATA[activeSalaryTab].desc}</p>
             </div>
             <div className="flex-1 w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                <div className="flex justify-between items-end mb-12">
                   <div>
                     <div className="text-slate-500 text-sm font-medium mb-1">Starting Salary</div>
                     <div className="text-4xl font-black text-slate-900">{SALARY_DATA[activeSalaryTab].start}</div>
                   </div>
                   <div className="text-right">
                     <div className="text-slate-500 text-sm font-medium mb-1">Peak Potential</div>
                     <div className="text-4xl font-black text-[#10B981] flex items-center gap-2"><BarChart3 className="w-8 h-8" /> {SALARY_DATA[activeSalaryTab].peak}</div>
                   </div>
                </div>
                {/* Visual Bar */}
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden relative">
                   <motion.div 
                     key={activeSalaryTab}
                     initial={{ width: 0 }}
                     animate={{ width: "100%" }}
                     transition={{ duration: 1, ease: "easeOut" }}
                     className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#49ABC9] to-[#10B981] rounded-full" 
                   />
                </div>
             </div>
           </div>

           {/* Portfolios Showcase */}
           <div>
             <div className="text-center mb-12">
               <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Build a Portfolio That Gets You Hired</h2>
               <p className="text-slate-600">Employers don't hire certificates. They hire skills.</p>
             </div>
             <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {[
                  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
                  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
                  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
                  "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80",
                  "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80"
                ].map((img, i) => (
                   <div key={i} className="break-inside-avoid rounded-2xl overflow-hidden shadow-md group cursor-pointer relative">
                      <img src={img} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <span className="text-white font-bold border-2 border-white px-6 py-2 rounded-full backdrop-blur-sm">View Project</span>
                      </div>
                   </div>
                ))}
             </div>
           </div>

           {/* AI Career Advisor CTA */}
           <div className="bg-gradient-to-br from-[#F2F9FB] to-green-50 p-8 md:p-12 rounded-[3rem] border border-[#E5F4F8] flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div>
                <h3 className="text-2xl md:text-3xl font-black mb-2 flex items-center gap-3 justify-center md:justify-start"><BrainCircuit className="text-[#49ABC9] w-8 h-8" /> Not sure which course to choose?</h3>
                <p className="text-slate-600">Take our 2-minute interactive quiz and get personalized career recommendations from our AI advisor.</p>
              </div>
              <button className="shrink-0 px-8 py-4 bg-[#49ABC9] text-white font-bold rounded-full shadow-lg shadow-[#49ABC9]/20 hover:bg-[#398FA8] transition-colors">
                Start Career Quiz
              </button>
           </div>

        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="py-32 bg-slate-900 text-white text-center px-6">
         <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8">Ready to Start Your Career Transformation?</h2>
            <p className="text-xl text-slate-400 mb-12">The best investment you'll ever make is in yourself. Join Grekam today.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="px-8 py-4 bg-[#49ABC9] text-white font-bold rounded-full hover:bg-[#7BCDEB] transition-colors">Start Learning Today</button>
              <button className="px-8 py-4 bg-transparent border border-slate-600 text-white font-bold rounded-full hover:bg-slate-800 transition-colors">Book Free Consultation</button>
            </div>
            
            <div className="mt-16 pt-16 border-t border-slate-800 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-slate-400">
               <span>✓ Practical Projects</span>
               <span>✓ Expert Mentorship</span>
               <span>✓ Internship Opportunities</span>
               <span>✓ Placement Assistance</span>
            </div>
         </div>
      </section>

    </div>
  )
}
