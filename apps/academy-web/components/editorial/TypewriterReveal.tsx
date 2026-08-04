"use client";

import { motion } from "framer-motion";

export function TypewriterReveal({
  text,
  delay = 0,
  className = ""
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const words = text.split(" ");

  return (
    <div className={`inline-flex flex-wrap ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="mr-2 overflow-hidden inline-flex">
          <motion.span
            initial={{ y: "100%", opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{
              duration: 0.5,
              delay: delay + i * 0.05,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  );
}
