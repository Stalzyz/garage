"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "Do I need prior experience?", a: "No. Many of our beginner programs are designed for students with no previous experience." },
  { q: "Are the courses available online?", a: "Yes. You can learn through classroom sessions, live online classes, or self-paced learning." },
  { q: "Will I receive a certificate?", a: "Yes. Students receive a digital course completion certificate after successfully meeting the course requirements." },
  { q: "Do you offer placement support?", a: "Yes. We provide career guidance, portfolio reviews, resume support, interview preparation, and placement assistance." },
  { q: "Can working professionals join?", a: "Absolutely. Flexible schedules make it easier for professionals to continue learning." }
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-32 relative overflow-hidden border-t border-[#1F1F1F]" id="faq">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h3 className="text-xl font-handwriting text-[#49abc9] mb-4">Frequently Asked Questions</h3>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#FAFAF8] tracking-tight">
            Got Questions? <span className="text-[#71717A]">We've Got Answers.</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${openIndex === idx ? 'bg-[#141414] border-[#49abc9]/30' : 'bg-[#0A0A0A] border-[#1F1F1F] hover:border-[#49abc9]/20'}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <span className="font-semibold text-[#FAFAF8] text-lg pr-8">{faq.q}</span>
                <ChevronDown 
                  className={`text-[#49abc9] shrink-0 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`} 
                  size={20} 
                />
              </button>
              
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 pt-2 text-[#A1A1AA] leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
