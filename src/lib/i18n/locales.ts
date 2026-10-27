export type Locale = "zh" | "en" | "ja" | "ko" | "de" | "fr";

export const locales: { id: Locale; name: string; flag: string }[] = [
  { id: "zh", name: "中文", flag: "🇨🇳" },
  { id: "en", name: "English", flag: "🇺🇸" },
  { id: "ja", name: "日本語", flag: "🇯🇵" },
  { id: "ko", name: "한국어", flag: "🇰🇷" },
  { id: "de", name: "Deutsch", flag: "🇩🇪" },
  { id: "fr", name: "Français", flag: "🇫🇷" },
];
