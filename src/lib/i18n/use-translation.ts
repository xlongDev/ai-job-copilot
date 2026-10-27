"use client";

import { useAppStore } from "@/lib/store";
import { translations, type Locale } from "./translations";

export function useTranslation() {
  const language = useAppStore((s) => s.language);

  const t = (key: keyof typeof translations.zh): string => {
    const dict = translations[language as Locale] || translations.zh;
    return dict[key] || translations.zh[key] || String(key);
  };

  return { t, locale: language as Locale };
}
