"use client";

import { useAppStore } from "@/lib/store";

// Returns the current AI provider config for API calls
export function useAIConfig() {
  const { activeProvider, providerKeys } = useAppStore();

  const config = providerKeys[activeProvider];

  return {
    provider: activeProvider,
    apiKey: config?.apiKey || "",
    model: config?.model || "",
    baseUrl: config?.baseUrl || "",
  };
}
