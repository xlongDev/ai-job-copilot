"use client";

import { useAppStore } from "@/lib/store";
import { LandingView } from "@/components/views/landing-view";
import { AppShell } from "@/components/layout/app-shell";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const { isAppMode } = useAppStore();

  return (
    <AnimatePresence mode="wait">
      {isAppMode ? (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AppShell />
        </motion.div>
      ) : (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LandingView />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
