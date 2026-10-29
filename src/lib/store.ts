import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AIProviderId = "zai" | "openai" | "claude" | "gemini" | "deepseek" | "qwen" | "openrouter" | "mistral" | "llama" | "groq" | "xai" | "perplexity" | "moonshot" | "yi" | "baichuan" | "minimax" | "zhipu" | "ollama";

export interface AIProviderConfig {
  id: AIProviderId;
  name: string;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

interface AppState {
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

  // Notifications
  notifications: number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
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

      notifications: 3,
    }),
    {
      name: "ai-job-copilot-v1",
      partialize: (s) => ({
        activeProvider: s.activeProvider,
        providerKeys: s.providerKeys,
        language: s.language,
        sidebarCollapsed: s.sidebarCollapsed,
      }),
    }
  )
);
