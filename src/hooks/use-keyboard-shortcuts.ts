"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { GO_TO_KEYS, viewHref } from "@/lib/views";

export function useKeyboardShortcuts() {
  const { setCommandOpen } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // ⌘K / Ctrl+K - Command palette
      if (isMod && e.key === "k") {
        e.preventDefault();
        setCommandOpen(true);
        return;
      }

      // G + key navigation
      if (e.key === "g" && !isMod && !e.altKey) {
        const onKey = (ev: KeyboardEvent) => {
          const view = GO_TO_KEYS[ev.key.toLowerCase()];
          if (view) {
            ev.preventDefault();
            setCommandOpen(false);
            router.push(viewHref(view));
          }
          window.removeEventListener("keydown", onKey);
        };
        window.addEventListener("keydown", onKey, { once: true });
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandOpen, router]);
}
