"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode } from "react";

export function BackgroundWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAF8]">
      {children}
    </div>
  );
}
