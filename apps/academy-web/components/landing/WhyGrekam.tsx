"use client";

import { motion } from "framer-motion";
import { Laptop, Briefcase, Users, Award, Zap, BookOpen } from "lucide-react";

const features = [
  {
    icon: <Briefcase className="text-[#49abc9] w-8 h-8" />,
    title: "100% Placement Guarantee",
    description: "We don't just train you; we get you hired. Dedicated career support until you land your dream job."
  },
  {
    icon: <Users className="text-[#2ecc71] w-8 h-8" />,
    title: "1-on-1 Mentorship",
    description: "Learn directly from industry experts who have built products for Fortune 500 companies."
  },
  {
    icon: <Laptop className="text-[#49abc9] w-8 h-8" />,
    title: "Real-world Projects",
    description: "Build a portfolio that speaks for itself. Work on live industry projects, not just theory."
  },
  {
    icon: <Award className="text-[#2ecc71] w-8 h-8" />,
    title: "Recognized Certification",
    description: "Get certified by Grekam Academy, a name recognized by top hiring partners globally."
  },
  {
    icon: <Zap className="text-[#49abc9] w-8 h-8" />,
    title: "AI-Integrated Curriculum",
    description: "Stay ahead of the curve. Our courses integrate the latest AI tools to make you 10x more productive."
  },
  {
    icon: <BookOpen className="text-[#2ecc71] w-8 h-8" />,
    title: "Hybrid Learning Model",
    description: "Flexible learning designed for you. Choose between offline in Coimbatore, live online, or self-paced."
  }
];

export function WhyGrekam() {
  return (
    <section className="py-24 relative" id="why-grekam">
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-[#49abc9]/5 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Why Choose <span className="text-gradient-academy">Grekam Academy?</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            We go beyond traditional education. Our approach is outcome-driven, ensuring you are equipped with the exact skills the industry demands right now.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glassmorphism p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#49abc9]/10 to-[#2ecc71]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="mb-6 inline-block p-4 rounded-xl bg-background/50 border border-border">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
