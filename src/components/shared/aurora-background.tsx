"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  className?: string;
  variant?: "default" | "subtle" | "intense";
}

export function AuroraBackground({
  className,
  variant = "default",
}: AuroraBackgroundProps) {
  const opacity = variant === "subtle" ? 0.4 : variant === "intense" ? 1 : 0.7;

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <motion.div
        className="absolute -top-1/2 -left-1/4 h-[600px] w-[600px] rounded-full blur-[120px]"
        style={{
          background: `radial-gradient(circle, oklch(0.72 0.17 155 / ${0.15 * opacity}) 0%, transparent 70%)`,
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -top-1/4 right-0 h-[500px] w-[500px] rounded-full blur-[120px]"
        style={{
          background: `radial-gradient(circle, oklch(0.7 0.18 300 / ${0.12 * opacity}) 0%, transparent 70%)`,
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full blur-[100px]"
        style={{
          background: `radial-gradient(circle, oklch(0.75 0.15 80 / ${0.08 * opacity}) 0%, transparent 70%)`,
        }}
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
