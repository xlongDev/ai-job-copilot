"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function useKeyboardShortcuts() {
  const { setCommandOpen, setView, enterApp } = useAppStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // ⌘K / Ctrl+K - Command palette
      if (isMod && e.key === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }

      // G + key navigation
      if (e.key === "g" && !isMod && !e.altKey) {
        const onKey = (ev: KeyboardEvent) => {
          const map: Record<string, string> = {
            d: "dashboard",
            r: "resume",
            a: "ats",
            j: "jd-match",
            t: "tracker",
            c: "chat",
          };
          const view = map[ev.key.toLowerCase()];
          if (view) {
            ev.preventDefault();
            setView(view as never);
          }
          window.removeEventListener("keydown", onKey);
        };
        window.addEventListener("keydown", onKey, { once: true });
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandOpen, setView, enterApp]);
}
