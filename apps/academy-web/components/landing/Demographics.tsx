"use client";

import { motion } from "framer-motion";
import { UserCheck } from "lucide-react";

export function Demographics() {
  const demographics = [
    { title: "Students", desc: "Build practical skills before entering the workforce." },
    { title: "Graduates", desc: "Bridge the gap between academics and industry." },
    { title: "Working Professionals", desc: "Upgrade your skills without leaving your current job." },
    { title: "Career Switchers", desc: "Move into creative and technology careers with confidence." },
    { title: "Freelancers", desc: "Improve your expertise and grow your business." },
    { title: "Entrepreneurs", desc: "Build digital products, brands, and businesses with practical knowledge." }
  ];

  return (
    <section className="py-32 relative overflow-hidden border-t border-[#1F1F1F]" id="audience">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        
        {/* Sections 23 & 29: Who Is This For / Who We Help */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h3 className="text-xl font-handwriting text-[#49abc9] mb-4">Who Is This For?</h3>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#FAFAF8] tracking-tight">
            Whether you're taking your first step or your next step.
          </h2>
          <p className="text-xl text-[#A1A1AA] leading-relaxed">
            Grekam Academy is designed for learners from every stage. No matter where you start, we'll help you move forward.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demographics.map((demo, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#0A0A0A] border border-[#1F1F1F] p-8 rounded-[32px] flex items-start gap-4 hover:bg-[#141414] transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-[#49abc9] shrink-0">
                <UserCheck size={20} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-[#FAFAF8] mb-2">{demo.title}</h4>
                <p className="text-[#A1A1AA] text-sm leading-relaxed">{demo.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
