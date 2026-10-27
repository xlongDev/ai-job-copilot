import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewId =
  | "landing"
  | "dashboard"
  | "resume"
  | "ats"
  | "jd-match"
  | "chat"
  | "career-coach"
  | "interview"
  | "voice-interview"
  | "video-interview"
  | "portfolio"
  | "learning"
  | "tracker"
  | "analytics"
  | "agent"
  | "agents"
  | "workflow"
  | "rag"
  | "mcp"
  | "browser-agent"
  | "plugins"
  | "billing"
  | "team"
  | "settings"
  | "star-generator"
  | "prompt-library"
  | "offer-analysis"
  | "skill-gap"
  | "resume-templates"
  | "interview-records"
  | "resume-compare"
  | "weekly-report-view"
  | "calendar"
  | "achievements"
  | "goals"
  | "heatmap"
  | "cockpit"
  | "interview-chat"
  | "resume-score";

export type AIProviderId = "zai" | "openai" | "claude" | "gemini" | "deepseek" | "qwen" | "openrouter" | "mistral" | "llama" | "groq" | "xai" | "perplexity" | "moonshot" | "yi" | "baichuan" | "minimax" | "zhipu" | "ollama";

export interface AIProviderConfig {
  id: AIProviderId;
  name: string;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

interface AppState {
  // Navigation
  currentView: ViewId;
  isAppMode: boolean;
  setView: (view: ViewId) => void;
  enterApp: (view?: ViewId) => void;
  exitApp: () => void;

  // Command palette
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // AI Provider — multi-provider with custom API keys
  activeProvider: AIProviderId;
  setActiveProvider: (p: AIProviderId) => void;
  providerKeys: Partial<Record<AIProviderId, AIProviderConfig>>;
  setProviderKey: (id: AIProviderId, config: Partial<AIProviderConfig>) => void;
  removeProviderKey: (id: AIProviderId) => void;

  // Language
  language: "zh" | "en" | "ja" | "ko" | "de" | "fr";
  setLanguage: (l: AppState["language"]) => void;

  // Resume data (shared)
  resumeText: string;
  setResumeText: (t: string) => void;

  // SaaS: credits & plan
  credits: number;
  plan: "free" | "pro" | "team" | "enterprise";
  setPlan: (p: AppState["plan"]) => void;
  consumeCredits: (n: number) => void;

  // Notifications
  notifications: number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentView: "dashboard",
      isAppMode: false,
      setView: (view) => set({ currentView: view }),
      enterApp: (view) =>
        set({ isAppMode: true, currentView: view ?? "dashboard" }),
      exitApp: () => set({ isAppMode: false, currentView: "landing" }),

      commandOpen: false,
      setCommandOpen: (open) => set({ commandOpen: open }),

      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      activeProvider: "zai",
      setActiveProvider: (p) => set({ activeProvider: p }),
      providerKeys: {},
      setProviderKey: (id, config) =>
        set((s) => ({
          providerKeys: {
            ...s.providerKeys,
            [id]: {
              id,
              name: config.name || id,
              apiKey: config.apiKey || s.providerKeys[id]?.apiKey || "",
              model: config.model || s.providerKeys[id]?.model || "",
              baseUrl: config.baseUrl || s.providerKeys[id]?.baseUrl,
            },
          },
        })),
      removeProviderKey: (id) =>
        set((s) => {
          const next = { ...s.providerKeys };
          delete next[id];
          return { providerKeys: next };
        }),

      language: "zh",
      setLanguage: (l) => set({ language: l }),

      resumeText: "",
      setResumeText: (t) => set({ resumeText: t }),

      credits: 1250,
      plan: "pro",
      setPlan: (p) => set({ plan: p }),
      consumeCredits: (n) => set((s) => ({ credits: Math.max(0, s.credits - n) })),

      notifications: 3,
    }),
    {
      name: "ai-job-copilot-v1",
      partialize: (s) => ({
        activeProvider: s.activeProvider,
        providerKeys: s.providerKeys,
        language: s.language,
        sidebarCollapsed: s.sidebarCollapsed,
        isAppMode: s.isAppMode,
        currentView: s.currentView,
        credits: s.credits,
        plan: s.plan,
      }),
    }
  )
);
