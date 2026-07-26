"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type Partner = {
  name: string;
  logoUrl?: string | null;
};

type TrustedByMarqueeProps = {
  partners: Partner[];
};

export function TrustedByMarquee({ partners }: TrustedByMarqueeProps) {
  if (!partners || partners.length === 0) return null;

  return (
    <section className="py-20 border-y border-border/50 bg-background/50 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <p className="text-justify md:text-center text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8">
          Our Alumni Work At Top Companies
        </p>
        
        <div className="relative w-full overflow-hidden flex [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <motion.div
            className="flex min-w-full shrink-0 items-center justify-around gap-16 py-4"
            animate={{ x: [0, -1035] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 20,
            }}
          >
            {[...partners, ...partners].map((partner, i) => (
              <div key={i} className="flex items-center justify-center shrink-0 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
                {partner.logoUrl ? (
                  <Image 
                    src={partner.logoUrl} 
                    alt={partner.name} 
                    width={120} 
                    height={40} 
                    className="object-contain" 
                  />
                ) : (
                  <span className="text-2xl font-bold text-foreground/80">{partner.name}</span>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
