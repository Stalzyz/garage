"use client";

import { motion } from "framer-motion";
import { BookOpen, Video, MapPin, Users, VideoIcon, CheckCircle2 } from "lucide-react";

export function Methodology() {
  const steps = [
    { title: "Learn", desc: "Understand concepts through engaging lessons." },
    { title: "Observe", desc: "Watch professionals solve real problems." },
    { title: "Practice", desc: "Complete guided exercises after every lesson." },
    { title: "Create", desc: "Build meaningful projects instead of simple exercises." },
    { title: "Receive Feedback", desc: "Mentors review your work and suggest improvements." },
    { title: "Improve", desc: "Revise your projects using professional feedback." },
    { title: "Build Portfolio", desc: "Collect your best work into an industry-ready portfolio." },
    { title: "Showcase", desc: "Present your work with confidence." },
    { title: "Launch", desc: "Prepare for internships, freelance opportunities, or placements." },
  ];

  const reasons = [
    "Industry-focused curriculum", "Learn from experienced mentors", "Practical assignments",
    "Portfolio development", "Internship opportunities", "Placement guidance",
    "Freelance mentorship", "Soft skill training", "Lifetime learning resources",
    "Community support", "Hybrid learning model", "Affordable installment options"
  ];

  return (
    <section className="py-32 relative overflow-hidden border-t border-[#1F1F1F]" id="methodology">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl space-y-40">
        
        {/* Section 04: Our Learning Methodology */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h3 className="text-xl font-handwriting text-[#49abc9] mb-4">Our Learning Methodology</h3>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#FAFAF8] tracking-tight">
              Learn → Practice → Build → <span className="text-[#71717A]">Improve → Grow</span>
            </h2>
            <p className="text-lg text-[#A1A1AA]">
              Every course follows a structured learning system designed around real creative workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#0A0A0A] border border-[#1F1F1F] p-6 rounded-[24px] hover:border-[#49abc9]/30 transition-colors"
              >
                <div className="text-[#49abc9] font-mono text-sm mb-3">0{idx + 1}</div>
                <h4 className="text-xl font-bold text-[#FAFAF8] mb-2">{step.title}</h4>
                <p className="text-[#A1A1AA] text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section 05: Hybrid Learning Experience */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h3 className="text-xl font-handwriting text-[#49abc9] mb-4">Hybrid Learning Experience</h3>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#FAFAF8] tracking-tight">
              Learn Your Way.
            </h2>
            <p className="text-lg text-[#A1A1AA]">
              Everyone learns differently. That's why Grekam Academy offers multiple learning experiences under one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#0A0A0A] to-[#000000] border border-[#1F1F1F] p-10 rounded-[32px]">
              <div className="w-14 h-14 bg-[#1F1F1F] rounded-2xl flex items-center justify-center text-[#FAFAF8] mb-6">
                <MapPin size={24} />
              </div>
              <h4 className="text-2xl font-bold text-[#FAFAF8] mb-4">Classroom Learning</h4>
              <p className="text-[#A1A1AA] leading-relaxed">
                Learn face-to-face with experienced mentors at our Coimbatore campus through interactive sessions, workshops, and collaborative activities.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-[#0A0A0A] to-[#000000] border border-[#1F1F1F] p-10 rounded-[32px]">
              <div className="w-14 h-14 bg-[#1F1F1F] rounded-2xl flex items-center justify-center text-[#FAFAF8] mb-6">
                <VideoIcon size={24} />
              </div>
              <h4 className="text-2xl font-bold text-[#FAFAF8] mb-4">Live Online Classes</h4>
              <p className="text-[#A1A1AA] leading-relaxed">
                Attend instructor-led classes from anywhere and interact with mentors in real time. Ask questions. Participate in discussions. Receive instant feedback.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-8 rounded-[24px]">
              <h4 className="text-lg font-bold text-[#FAFAF8] mb-2">Self-Paced Learning</h4>
              <p className="text-[#A1A1AA] text-sm">Study whenever it fits your schedule. Pause. Replay. Practice. Learn at your own speed without deadlines.</p>
            </div>
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-8 rounded-[24px]">
              <h4 className="text-lg font-bold text-[#FAFAF8] mb-2">Workshop Sessions</h4>
              <p className="text-[#A1A1AA] text-sm">Join focused workshops that explore specific tools, techniques, and creative processes.</p>
            </div>
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-8 rounded-[24px]">
              <h4 className="text-lg font-bold text-[#FAFAF8] mb-2">Project Reviews</h4>
              <p className="text-[#A1A1AA] text-sm">Receive personalized feedback that helps you improve your work before adding it to your portfolio.</p>
            </div>
          </div>
        </div>

        {/* Section 06: Why Choose Grekam? */}
        <div className="bg-gradient-to-br from-[#302A27] to-[#050505] border border-[#1F1F1F] rounded-[40px] p-10 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#49abc9]/5 rounded-full blur-3xl" />
          <div className="relative z-10 text-center max-w-3xl mx-auto mb-16">
            <h3 className="text-xl font-handwriting text-[#49abc9] mb-4">Why Choose Grekam?</h3>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#FAFAF8] tracking-tight">
              Education Designed Around Real Careers.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12 max-w-5xl mx-auto relative z-10">
            {reasons.map((reason, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="text-[#2ecc71] shrink-0">
                  <CheckCircle2 size={20} strokeWidth={2.5} />
                </div>
                <span className="text-[#FAFAF8] font-medium">{reason}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
