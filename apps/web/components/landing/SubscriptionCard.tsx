"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export function SubscriptionCard() {
  const options = [
    "One-time payment", "Monthly installments", "Semester-wise payments",
    "Batch-wise payment plans", "Early enrollment offers", "Scholarship opportunities (where applicable)"
  ];

  return (
    <section className="py-32 relative overflow-hidden border-t border-[#1F1F1F] max-w-6xl mx-auto bg-[#0A0A0A]/80 backdrop-blur-md rounded-[3rem] shadow-[0_0_80px_rgba(73,171,201,0.07)]  my-8 p-6 md:p-12" id="pricing">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="bg-gradient-to-br from-[#0A0A0A] to-[#000000] border border-[#1F1F1F] rounded-[40px] p-10 md:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#49abc9]/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 text-center mb-12">
            <h3 className="text-xl font-handwriting text-[#49abc9] mb-4">Flexible Payment Options</h3>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#FAFAF8] tracking-tight">
              Invest in Your Future, Comfortably.
            </h2>
            <p className="text-xl text-[#A1A1AA] leading-relaxed max-w-2xl mx-auto">
              We believe quality education should be accessible. Choose payment options that suit your budget. No hidden fees. No unexpected charges. Just transparent pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 max-w-3xl mx-auto">
            {options.map((option, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-[#141414] rounded-2xl border border-[#1F1F1F]">
                <CheckCircle2 size={20} className="text-[#2ecc71] shrink-0" />
                <span className="text-[#FAFAF8] text-sm font-medium">{option}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
