import React from 'react';
import { motion } from 'framer-motion';

// Sample data for your cards
const cardsData = [
  { id: 1, title: 'Card One', color: 'bg-white/80' },
  { id: 2, title: 'Card Two', color: 'bg-white/80' },
  { id: 3, title: 'Card Three', color: 'bg-white/80' },
  { id: 4, title: 'Card Four', color: 'bg-white/80' },
  { id: 5, title: 'Card Five', color: 'bg-white/80' },
];

export default function WindyScatteredCards() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900 flex items-center justify-center p-8">
      
      {/* 1. The Directional Flowing Mesh Background */}
      <div className="absolute inset-0 z-0 opacity-60">
        <div className="windy-mesh-bg w-[200%] h-[200%] absolute top-[-50%] left-[-50%]" />
      </div>

      {/* 2. The Scattered Cards Container */}
      <div className="relative z-10 w-full max-w-5xl h-[600px]">
        {cardsData.map((card, index) => {
          // Generate pseudo-random scattered positions for each card
          const randomX = Math.random() * 60 - 30; // Random offset between -30% and 30%
          const randomY = Math.random() * 60 - 30;
          const randomRotation = Math.random() * 30 - 15; // Random initial tilt

          return (
            <motion.div
              key={card.id}
              className={`absolute w-64 h-80 rounded-3xl shadow-2xl backdrop-blur-md p-6 flex flex-col justify-end border border-white/20 ${card.color}`}
              style={{
                top: `${50 + randomY}%`,
                left: `${50 + randomX}%`,
                // Center the anchor point
                transformOrigin: 'center center',
              }}
              
              // A. The "Blow In" Entrance Animation
              initial={{ 
                x: '-100vw', // Start way off to the left
                y: 100,
                rotate: -45, 
                opacity: 0 
              }}
              whileInView={{ 
                x: '-50%', // Offset by 50% to truly center it based on top/left
                y: '-50%',
                rotate: randomRotation, 
                opacity: 1 
              }}
              viewport={{ once: true, margin: "-100px" }} // Trigger when scrolled into view
              transition={{
                type: 'spring',
                damping: 20,
                stiffness: 50,
                // Stagger the entrance of each card
                delay: index * 0.15, 
                duration: 1.2
              }}
            >
              {/* B. The Continuous "Breeze" Sway (Wrapped inside the main animated div) */}
              <motion.div
                className="w-full h-full relative"
                animate={{
                  // Slight directional sway
                  x: [0, 10, 0],
                  y: [0, -5, 0],
                  rotate: [0, 2, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 2, // Randomize sway speed slightly
                  repeat: Infinity,
                  ease: "easeInOut",
                  // Delay the sway until after they have blown in
                  delay: (index * 0.15) + 1.2, 
                }}
              >
                <div className="mt-auto">
                  <div className="w-12 h-12 rounded-full bg-slate-200/50 mb-4" />
                  <h3 className="text-xl font-bold text-slate-800">{card.title}</h3>
                  <div className="w-3/4 h-3 bg-slate-200/50 rounded mt-2" />
                  <div className="w-1/2 h-3 bg-slate-200/50 rounded mt-2" />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
