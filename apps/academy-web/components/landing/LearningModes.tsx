"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MonitorPlay, Building2, Radio, Clock } from "lucide-react";

const modes = [
  {
    id: "offline",
    title: "Offline in Coimbatore",
    icon: <Building2 size={24} />,
    description: "Immersive classroom experience at our state-of-the-art Coimbatore campus.",
    features: [
      "Face-to-face interaction with mentors",
      "Access to high-end design labs",
      "Physical peer collaboration",
      "Immediate doubt resolution"
    ],
    color: "from-[#49abc9] to-[#2ecc71]"
  },
  {
    id: "live",
    title: "Live Online Classes",
    icon: <Radio size={24} />,
    description: "Interactive live sessions from the comfort of your home.",
    features: [
      "Real-time feedback on projects",
      "Interactive Q&A sessions",
      "Structured schedule to keep you on track",
      "Access to recorded sessions"
    ],
    color: "from-[#8e44ad] to-[#3498db]"
  },
  {
    id: "self-paced",
    title: "Self-Paced Learning",
    icon: <Clock size={24} />,
    description: "Learn at your own speed with our comprehensive recorded modules.",
    features: [
      "Lifetime access to content",
      "Study anytime, anywhere",
      "Weekly live doubt clearing sessions",
      "Community support access"
    ],
    color: "from-[#f39c12] to-[#d35400]"
  }
];

export function LearningModes() {
  const [activeMode, setActiveMode] = useState(modes[0].id);

  return (
    <section className="py-24 bg-background/50 border-y border-border/50" id="methodology">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Learn <span className="text-gradient-academy">Your Way</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Education shouldn't be one-size-fits-all. We offer multiple delivery modes to suit your lifestyle and learning preferences.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Tabs */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`p-6 rounded-2xl text-left transition-all duration-300 flex items-center gap-4 ${
                  activeMode === mode.id 
                    ? "bg-gradient-academy text-white shadow-lg shadow-[#49abc9]/20" 
                    : "glassmorphism hover:bg-white/5"
                }`}
              >
                <div className={`p-3 rounded-full ${activeMode === mode.id ? "bg-white/20" : "bg-muted"}`}>
                  {mode.icon}
                </div>
                <span className="font-semibold text-lg">{mode.title}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="w-full lg:w-2/3 min-h-[400px]">
            <AnimatePresence mode="wait">
              {modes.map((mode) => 
                mode.id === activeMode && (
                  <motion.div
                    key={mode.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="glassmorphism p-8 md:p-12 rounded-3xl h-full border-t-4"
                    style={{ borderTopColor: activeMode === 'offline' ? '#49abc9' : activeMode === 'live' ? '#8e44ad' : '#f39c12' }}
                  >
                    <div className="inline-block p-4 rounded-2xl bg-muted mb-6">
                      {mode.icon}
                    </div>
                    <h3 className="text-3xl font-bold mb-4">{mode.title}</h3>
                    <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                      {mode.description}
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-6">
                      {mode.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-academy flex items-center justify-center shrink-0 mt-1">
                            <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <span className="font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-12 pt-8 border-t border-border">
                      <button className="px-8 py-3 bg-foreground text-background rounded-full font-semibold hover:opacity-90 transition-opacity">
                        View Schedules
                      </button>
                    </div>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
