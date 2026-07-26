"use client"

import Image from "next/image"
import { motion } from "framer-motion"

interface Company {
  id: string
  name: string
  logoUrl: string | null
}

export function HiringPartners({ companies }: { companies: Company[] }) {
  if (!companies || companies.length === 0) return null

  // Duplicate companies to ensure smooth infinite scroll
  const duplicatedCompanies = [...companies, ...companies, ...companies]

  return (
    <section className="py-24 relative overflow-hidden border-y border-white/5 bg-[#020202]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <h2 className="text-[10px] font-mono tracking-[0.4em] text-white/40 uppercase mb-4">Our Alumni Work At</h2>
        <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight font-sans text-white/90">
          Trusted by Industry Leaders
        </h3>
      </div>

      <div className="relative w-full overflow-hidden flex flex-col gap-8">
        {/* Left and Right Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#020202] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#020202] to-transparent z-10 pointer-events-none" />

        <div className="flex w-fit overflow-visible">
          <motion.div
            className="flex gap-16 md:gap-24 items-center pr-16 md:pr-24"
            animate={{ x: "-33.33%" }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ width: "fit-content" }}
          >
            {duplicatedCompanies.map((company, i) => (
              <div 
                key={`${company.id}-${i}`} 
                className="flex-shrink-0 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 w-[120px] md:w-[160px]"
              >
                {company.logoUrl ? (
                  <Image 
                    src={company.logoUrl} 
                    alt={company.name} 
                    width={160} 
                    height={80} 
                    className="object-contain max-h-[60px]"
                  />
                ) : (
                  <span className="font-bold text-xl md:text-2xl font-sans tracking-widest text-white/70 uppercase">
                    {company.name}
                  </span>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
