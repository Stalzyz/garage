"use client";

import { motion } from "framer-motion";

export function About() {
  return (
    <section className="py-32 relative overflow-hidden max-w-6xl mx-auto bg-[#0A0A0A]/80 backdrop-blur-md rounded-[3rem] shadow-[0_0_80px_rgba(73,171,201,0.07)]  my-8 p-6 md:p-12" id="about">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl space-y-40">
        
        {/* Section 02: About Grekam Academy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-xl font-handwriting text-[#49abc9] mb-4">About Grekam Academy</h3>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#FAFAF8] tracking-tight">
              Learning Doesn't End With a Certificate. <span className="text-[#71717A]">It Begins With Confidence.</span>
            </h2>
          </div>
          <div className="space-y-6 text-[#A1A1AA] text-lg leading-relaxed">
            <p>
              Grekam Academy is a modern creative learning institute built for people who want to build real careers—not just collect certificates. We believe education should prepare students for the way the creative industry actually works.
            </p>
            <p>
              That's why every program combines practical learning, industry mentorship, project-based assignments, portfolio development, and career guidance. Instead of simply teaching software, we teach creative thinking, problem-solving, communication, collaboration, and professional workflows.
            </p>
            <div className="p-6 bg-[#0A0A0A] rounded-2xl border border-[#1F1F1F]">
              <p className="font-bold text-[#FAFAF8] mb-2">Our mission is simple:</p>
              <p className="text-[#49abc9]">Help passionate learners become confident creative professionals.</p>
            </div>
            <p className="text-base">
              Whether you dream of becoming a UI/UX Designer, Graphic Designer, Full Stack Developer, Digital Marketer, Motion Designer, Video Editor, or Entrepreneur, Grekam Academy provides the environment, mentorship, and opportunities to help you grow.
            </p>
          </div>
        </div>

        {/* Section 03: Our Philosophy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center md:flex-row-reverse">
          <div className="md:order-2">
            <h3 className="text-xl font-handwriting text-[#49abc9] mb-4">Our Philosophy</h3>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#FAFAF8] tracking-tight">
              Learn Skills. <span className="text-[#71717A]">Not Just Software.</span>
            </h2>
          </div>
          <div className="space-y-6 text-[#A1A1AA] text-lg leading-relaxed md:order-1 text-right md:text-left">
            <p>Software changes. Technology evolves. Trends disappear.</p>
            <p>
              But creativity, problem-solving, communication, and critical thinking stay valuable throughout your career. That's why our courses focus on developing practical skills that remain useful no matter how the industry changes.
            </p>
            <p className="text-2xl font-handwriting text-[#FAFAF8] mt-8 opacity-90">
              "We don't teach students what to click. We teach them how to think."
            </p>
          </div>
        </div>

        {/* Section 24: Our Promise (Moved here for thematic consistency) */}
        <div className="text-center max-w-3xl mx-auto pt-20 border-t border-[#1F1F1F]">
          <h3 className="text-xl font-handwriting text-[#49abc9] mb-4">Our Promise</h3>
          <h2 className="text-4xl md:text-5xl font-bold mb-10 text-[#FAFAF8] tracking-tight">
            We Can't Promise Success Overnight. <br/>
            <span className="text-[#71717A]">But We Can Promise Growth Every Day.</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left text-[#A1A1AA] mb-12">
            <div className="flex items-start gap-3">
              <span className="text-[#49abc9]">→</span>
              <p>We'll encourage you to ask questions.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#49abc9]">→</span>
              <p>We'll challenge you to think differently.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#49abc9]">→</span>
              <p>We'll help you improve with every project.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#49abc9]">→</span>
              <p>We'll celebrate every milestone with you.</p>
            </div>
          </div>
          <div className="p-8 bg-[#0A0A0A] rounded-3xl border border-[#1F1F1F]">
            <p className="text-xl text-[#FAFAF8] leading-relaxed">
              Most importantly, we'll create an environment where learning feels exciting, practical, and meaningful. Because education isn't about finishing a course. 
              <span className="block mt-4 text-[#49abc9] font-bold">It's about becoming someone you're proud to be.</span>
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
