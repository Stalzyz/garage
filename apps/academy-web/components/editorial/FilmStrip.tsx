"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function FilmStrip({ images }: { images: string[] }) {
  // Duplicate images to create an infinite loop
  const duplicatedImages = [...images, ...images];

  return (
    <div className="relative w-full overflow-hidden bg-[#050505] py-24 my-32 flex flex-col items-center">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      
      <div className="flex w-[200%] md:w-[150%] mb-4 opacity-30 px-4">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="h-4 w-4 rounded-sm bg-white/20 mx-auto" />
        ))}
      </div>

      <div className="relative flex overflow-hidden w-full group">
        <motion.div
          className="flex gap-4 md:gap-8 px-4 md:px-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
        >
          {duplicatedImages.map((src, idx) => (
            <div 
              key={idx} 
              className="relative flex-shrink-0 w-[280px] h-[350px] md:w-[400px] md:h-[500px] overflow-hidden grayscale contrast-125 brightness-90 hover:grayscale-0 hover:contrast-100 hover:brightness-100 transition-all duration-700 ease-out"
            >
              <Image 
                src={src} 
                alt={`Film strip image ${idx}`} 
                fill 
                className="object-cover" 
              />
            </div>
          ))}
        </motion.div>
      </div>

      <div className="flex w-[200%] md:w-[150%] mt-4 opacity-30 px-4">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="h-4 w-4 rounded-sm bg-white/20 mx-auto" />
        ))}
      </div>
      
      <div className="text-center mt-12 text-[#FAFAF8] opacity-50 font-mono text-[10px] tracking-[0.3em] uppercase">
        Raw captures / Unedited
      </div>
    </div>
  );
}
