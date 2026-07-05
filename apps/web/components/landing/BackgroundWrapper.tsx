"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode } from "react";

export function BackgroundWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="contents">
      {children}
    </div>
  );
}
