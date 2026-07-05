"use client";

import { motion } from "framer-motion";
import { Users, GraduationCap, Building2, Quote, Sparkles } from "lucide-react";

export function StudentExperience() {
  const framework = [
    { title: "Creative Thinking", desc: "Generate ideas, solve problems creatively, and approach every project with confidence." },
    { title: "Technical Skills", desc: "Master industry-standard software, workflows, and modern technologies." },
    { title: "Communication", desc: "Present your work professionally and explain design decisions effectively." },
    { title: "Professional Mindset", desc: "Understand deadlines, teamwork, client expectations, and workplace etiquette." },
    { title: "Career Readiness", desc: "Build confidence for interviews, freelancing, internships, and long-term growth." }
  ];

  return (
    <section className="py-32 relative overflow-hidden border-t border-[#1F1F1F] max-w-6xl mx-auto bg-[#0A0A0A]/80 backdrop-blur-md rounded-[3rem] shadow-[0_0_80px_rgba(73,171,201,0.07)]  my-8 p-6 md:p-12" id="experience">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl space-y-40">
        
        {/* Section 11: Skill Framework */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-xl font-handwriting text-[#49abc9] mb-4">Skill Development Framework</h3>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#FAFAF8] tracking-tight">
              Beyond Software. <span className="text-[#71717A]">Beyond Theory.</span>
            </h2>
            <p className="text-[#A1A1AA] text-lg leading-relaxed mb-8">
              Learning a tool is easy. Building a career takes much more. That's why every student develops skills across five essential pillars.
            </p>
            <div className="space-y-6">
              {framework.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="mt-1 text-[#49abc9]"><Sparkles size={20} /></div>
                  <div>
                    <h4 className="text-lg font-bold text-[#FAFAF8] mb-1">{item.title}</h4>
                    <p className="text-[#A1A1AA] text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Section 12: Industry Mentorship */}
          <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-10 rounded-[40px] relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#49abc9]/10 rounded-full blur-3xl" />
            <h3 className="text-xl font-handwriting text-[#49abc9] mb-4">Industry Mentorship</h3>
            <h2 className="text-3xl font-bold mb-6 text-[#FAFAF8]">Learn From Professionals Who Build Every Day.</h2>
            <p className="text-[#A1A1AA] mb-8 leading-relaxed">
              Books teach concepts. Mentors teach experience. Our mentors don't just teach. They work with brands. Build products. Design experiences.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm font-medium text-[#FAFAF8]">
              <div className="bg-[#141414] p-4 rounded-2xl">Personal guidance</div>
              <div className="bg-[#141414] p-4 rounded-2xl">Portfolio reviews</div>
              <div className="bg-[#141414] p-4 rounded-2xl">Design critiques</div>
              <div className="bg-[#141414] p-4 rounded-2xl">Career advice</div>
            </div>
          </div>
        </div>

        {/* Section 18 & 27: Community & Campus */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#0A0A0A] to-[#000000] border border-[#1F1F1F] p-10 rounded-[32px] text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[#1F1F1F] rounded-full flex items-center justify-center text-[#FAFAF8] mb-6">
              <Users size={28} />
            </div>
            <h3 className="text-xl font-handwriting text-[#49abc9] mb-4">Student Community</h3>
            <h4 className="text-2xl font-bold text-[#FAFAF8] mb-4">Learn Together. Grow Together.</h4>
            <p className="text-[#A1A1AA] leading-relaxed">
              Great ideas rarely happen alone. Join a creative community where students inspire, support, and learn from each other through hackathons, meetups, and design challenges.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-[#0A0A0A] to-[#000000] border border-[#1F1F1F] p-10 rounded-[32px] text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[#1F1F1F] rounded-full flex items-center justify-center text-[#FAFAF8] mb-6">
              <Building2 size={28} />
            </div>
            <h3 className="text-xl font-handwriting text-[#49abc9] mb-4">Our Campus</h3>
            <h4 className="text-2xl font-bold text-[#FAFAF8] mb-4">Learn in a Creative Environment.</h4>
            <p className="text-[#A1A1AA] leading-relaxed">
              Located in the heart of Coimbatore, our classrooms are more than teaching spaces—they're creative studios where ideas are discussed, projects are built, and careers begin.
            </p>
          </div>
        </div>

        {/* Section 25: Student Success Stories */}
        <div className="text-center max-w-4xl mx-auto pt-20 border-t border-[#1F1F1F]">
          <h3 className="text-xl font-handwriting text-[#49abc9] mb-4">Student Success</h3>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#FAFAF8] tracking-tight">
            Every Portfolio Has a <span className="text-[#71717A]">Beginning.</span>
          </h2>
          <div className="mb-12 text-[#A1A1AA] text-lg leading-relaxed space-y-4">
            <p>Some have never opened a design tool. Some are changing careers. Some want to become freelancers.</p>
            <p>What connects them all is the willingness to learn. Every completed project, mentor review, and challenge leads to confidence.</p>
          </div>
          
          <div className="p-8 md:p-12 bg-[#0A0A0A] rounded-[40px] border border-[#1F1F1F] relative">
            <Quote className="absolute top-8 left-8 text-[#1F1F1F] opacity-50 w-16 h-16" />
            <p className="text-2xl md:text-3xl font-handwriting text-[#FAFAF8] relative z-10 leading-relaxed max-w-2xl mx-auto">
              "Today they are students. Tomorrow they become designers, developers, marketers, creators, and entrepreneurs."
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
