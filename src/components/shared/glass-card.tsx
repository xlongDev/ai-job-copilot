"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "strong" | "gradient";
  hover?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", hover = false, children, ...props }, ref) => {
    const base =
      variant === "strong"
        ? "glass-strong"
        : variant === "gradient"
        ? "gradient-border"
        : "glass";

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-xl backdrop-blur-xl transition-all duration-300",
          base,
          hover && "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";
