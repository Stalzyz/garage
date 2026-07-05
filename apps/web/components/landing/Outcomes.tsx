"use client";

import { motion } from "framer-motion";
import { Folder, Briefcase, FileCode2, LineChart, MessageSquare, Lightbulb, GraduationCap } from "lucide-react";

export function Outcomes() {
  const cards = [
    {
      title: "Real Projects",
      subtitle: "Learn by Building.",
      desc: "Every course includes projects inspired by real business challenges. Instead of creating random assignments, you'll work on projects that reflect industry expectations like Brand Identity, E-commerce Websites, Dashboard UI, and Marketing Campaigns.",
      icon: <Folder size={24} />
    },
    {
      title: "Portfolio Development",
      subtitle: "Your Portfolio Speaks Before You Do.",
      desc: "Employers don't hire certificates. They hire skills. Learn how to present projects professionally, write case studies, explain your design process, and organize your best work.",
      icon: <FileCode2 size={24} />
    },
    {
      title: "Internship Program",
      subtitle: "Step Into the Real Creative World.",
      desc: "Our internship opportunities expose students to real workflows. Experience client communication, team collaboration, project planning, and professional deadlines.",
      icon: <Briefcase size={24} />
    },
    {
      title: "Placement Assistance",
      subtitle: "Prepare for Opportunities.",
      desc: "We guide you through every stage of your job search with resume creation, portfolio review, LinkedIn optimization, mock interviews, and job referrals.",
      icon: <GraduationCap size={24} />
    },
    {
      title: "Freelancing Opportunities",
      subtitle: "Build Your Own Career.",
      desc: "Not everyone wants a full-time job. We help you understand finding clients, writing proposals, pricing projects, contracts, and building recurring clients.",
      icon: <Lightbulb size={24} />
    },
    {
      title: "Career Services",
      subtitle: "Supporting You Beyond Graduation.",
      desc: "Learning doesn't stop when the course ends. We provide career counseling, portfolio improvements, and continuous learning recommendations.",
      icon: <LineChart size={24} />
    }
  ];

  return (
    <section className="py-32 relative overflow-hidden border-t border-[#1F1F1F] max-w-6xl mx-auto bg-[#0A0A0A]/80 backdrop-blur-md rounded-[3rem] shadow-[0_0_80px_rgba(73,171,201,0.07)]  my-8 p-6 md:p-12" id="outcomes">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        
        {/* Section 07: Learn By Building (Hero for this component) */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h3 className="text-xl font-handwriting text-[#49abc9] mb-4">Learn By Building</h3>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[#FAFAF8] tracking-tight">
            Every Lesson Creates <span className="text-[#71717A]">Something Real.</span>
          </h2>
          <p className="text-xl text-[#A1A1AA] leading-relaxed">
            Forget endless theory. You'll design brands, build websites, create applications, launch campaigns, and produce animations. By graduation, you'll have proof of your skills—not just a certificate.
          </p>
        </div>

        {/* The Grid of Outcomes (Sections 13, 14, 15, 16, 17, 21) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#0A0A0A] border border-[#1F1F1F] p-8 rounded-[32px] hover:bg-[#141414] hover:border-[#49abc9]/30 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-[#1F1F1F] border border-[#2A2A2A] rounded-2xl flex items-center justify-center text-[#FAFAF8] mb-6 group-hover:scale-110 group-hover:text-[#49abc9] transition-transform">
                {card.icon}
              </div>
              <h3 className="text-[#49abc9] text-sm font-bold uppercase tracking-wider mb-2">{card.title}</h3>
              <h4 className="text-2xl font-bold text-[#FAFAF8] mb-4">{card.subtitle}</h4>
              <p className="text-[#A1A1AA] leading-relaxed text-sm">
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
