"use client";

import { motion } from "framer-motion";
import { MonitorPlay, LayoutDashboard, Award, CheckCircle2 } from "lucide-react";

export function PlatformFeatures() {
  const lmsFeatures = [
    "Interactive Video Lessons", "Assignments", "Live Sessions", "Course Notes",
    "Progress Tracking", "Quizzes", "Certificates", "Discussion Forum",
    "Student Dashboard", "Mobile Friendly"
  ];

  return (
    <section className="py-32 relative overflow-hidden border-t border-[#1F1F1F] max-w-6xl mx-auto bg-[#0A0A0A]/80 backdrop-blur-md rounded-[3rem] shadow-[0_0_80px_rgba(73,171,201,0.07)]  my-8 p-6 md:p-12" id="platform">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl space-y-40">
        
        {/* Section 08 & 26: LMS Platform & Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -inset-4 bg-[#49abc9]/10 rounded-[3rem] blur-3xl" />
            
            {/* The Mockup container mimicking layout.tsx */}
            <div className="relative bg-[#050505] rounded-[2.5rem] p-2 shadow-2xl overflow-hidden ">
              <div className="bg-[#0a0a0a]/90 backdrop-blur-3xl rounded-[2rem] border-t border-l border-white/10 p-6 h-full shadow-2xl">
                
                {/* Mock Dashboard UI Header */}
                <div className="flex items-center gap-4 border-b border-white/5 pb-6 mb-6">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#e74c3c]" />
                    <div className="w-3 h-3 rounded-full bg-[#f1c40f]" />
                    <div className="w-3 h-3 rounded-full bg-[#2ecc71]" />
                  </div>
                  <div className="text-[#A1A1AA] text-xs font-medium bg-black/50 px-4 py-1.5 rounded-full flex-1 text-center font-mono ">
                    lms.grekam.in/dashboard
                  </div>
                </div>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1F1F1F] flex items-center justify-center shrink-0">
                    <MonitorPlay className="text-[#49abc9]" size={20} />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="w-1/3 h-4 bg-[#1F1F1F] rounded-md" />
                    <div className="w-full h-2 bg-[#000000] rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-[#49abc9]" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 rounded-2xl bg-[#1F1F1F]/50 border border-[#1F1F1F] flex flex-col justify-center px-4">
                    <LayoutDashboard className="text-[#A1A1AA] mb-2" size={16} />
                    <div className="w-1/2 h-2 bg-[#A1A1AA]/30 rounded-md" />
                  </div>
                  <div className="h-24 rounded-2xl bg-[#1F1F1F]/50 border border-[#1F1F1F] flex flex-col justify-center px-4">
                    <Award className="text-[#A1A1AA] mb-2" size={16} />
                    <div className="w-1/2 h-2 bg-[#A1A1AA]/30 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <h3 className="text-xl font-handwriting text-[#49abc9] mb-4">LMS Platform</h3>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#FAFAF8] tracking-tight">
              Everything You Need <span className="text-[#71717A]">In One Place.</span>
            </h2>
            <p className="text-[#A1A1AA] text-lg leading-relaxed mb-8">
              Access all your learning resources through a modern Learning Management System designed to keep you focused and motivated.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              {lmsFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-[#2ecc71] shrink-0" />
                  <span className="text-[#FAFAF8] text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 19: Certifications */}
        <div className="bg-gradient-to-br from-[#0A0A0A] to-[#000000] border border-[#1F1F1F] p-12 md:p-20 rounded-[40px] text-center">
          <div className="w-20 h-20 bg-[#1F1F1F] rounded-3xl mx-auto flex items-center justify-center text-[#FAFAF8] mb-8 shadow-xl">
            <Award size={36} />
          </div>
          <h3 className="text-xl font-handwriting text-[#49abc9] mb-4">Certifications</h3>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#FAFAF8] tracking-tight max-w-2xl mx-auto">
            Celebrate Every Milestone.
          </h2>
          <p className="text-[#A1A1AA] text-lg leading-relaxed max-w-3xl mx-auto mb-10">
            Complete your learning journey with a professionally designed digital certificate that reflects your dedication and achievement. Download, share on LinkedIn, and include in resumes.
          </p>
          <p className="text-2xl font-handwriting text-[#FAFAF8]">
            "They're not the destination. They're a milestone in your journey."
          </p>
        </div>

      </div>
    </section>
  );
}
