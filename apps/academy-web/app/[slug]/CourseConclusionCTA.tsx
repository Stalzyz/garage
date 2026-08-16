"use client";

import { ArrowRight, GraduationCap } from "lucide-react";
import Link from "next/link";

type CourseConclusionCTAProps = {
  palette: string;
  courseCode?: string;
  courseName?: string;
  domain?: string;
};

export function CourseConclusionCTA({ 
  palette, 
  courseCode = "GENERAL", 
  courseName = "Creative Program", 
  domain = "DESIGN" 
}: CourseConclusionCTAProps) {

  return (
    <section id="enroll" className="relative py-32 px-4 overflow-hidden border-t border-white/5 bg-[#050505]">
      {/* Background glowing effects based on the palette */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r ${palette} blur-[120px] rounded-full mix-blend-screen`} />
      </div>

      <div className="container mx-auto max-w-4xl relative z-10 text-center flex flex-col items-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-8 bg-gradient-to-br ${palette} text-white shadow-2xl shadow-white/10`}>
          <GraduationCap className="w-10 h-10" />
        </div>
        
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 text-[#FAFAF8] leading-tight">
          Ready to kickstart your <br className="hidden sm:block" />
          creative career?
        </h2>
        
        <p className="text-lg md:text-xl text-[#A1A1AA] max-w-2xl mx-auto mb-12">
          Join our upcoming batch and master the industry-standard tools and workflows 
          under the guidance of experienced professionals. Limited seats available!
        </p>
        
        {/* Enroll Now — links directly to CRM-connected lead form page */}
        <Link
          href={`/contact?course=${courseCode}`}
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-white overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_8px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_60px_rgba(255,255,255,0.1)]"
        >
          {/* Button Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-r ${palette} transition-transform duration-500 group-hover:scale-110`} />
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
          
          <span className="relative z-10 text-lg">Enroll Now</span>
          <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
        </Link>
        
        <p className="mt-8 text-sm text-[#A1A1AA]">
          Have questions?{" "}
          <Link href="/contact" className="text-white hover:underline transition-colors">
            Talk to an admissions counselor
          </Link>
          .
        </p>

        {/* Micro trust badge */}
        <div className="mt-12 flex items-center gap-6 text-xs text-white/30 font-mono uppercase tracking-widest">
          <span>✓ Free Consultation</span>
          <span className="w-px h-4 bg-white/10" />
          <span>✓ No Spam</span>
          <span className="w-px h-4 bg-white/10" />
          <span>✓ Response in 24h</span>
        </div>
      </div>
    </section>
  );
}
