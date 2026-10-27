// ============================================================
// AI Provider Abstraction Layer (SERVER-SIDE ONLY)
// Supports: ZAI (default), OpenAI, Claude, Gemini, DeepSeek, Qwen, OpenRouter
// ============================================================

import { AI_PROVIDERS, type AIProviderInfo } from "@/lib/ai-providers-config";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export type { AIProviderInfo };

export function getProviderInfo(id: string): AIProviderInfo | undefined {
  return AI_PROVIDERS.find((p) => p.id === id);
}

// ============================================================
// Unified AI Chat Function — routes to the correct provider
// ============================================================

export interface AIChatParams {
  messages: ChatMessage[];
  provider: string;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIChatResult {
  content: string;
  role: "assistant";
  provider: string;
  model: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export async function callAI(params: AIChatParams): Promise<AIChatResult> {
  const { messages, provider, apiKey, model, baseUrl, temperature = 0.7, maxTokens = 2000 } = params;

  // ZAI provider — uses z-ai-web-dev-sdk, no API key needed
  if (provider === "zai" || !apiKey) {
    return callZAI(messages, temperature, maxTokens);
  }

  const info = getProviderInfo(provider);
  if (!info) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  const url = baseUrl || info.baseUrl;
  const usedModel = model || info.defaultModel;

  // Route based on provider
  switch (provider) {
    case "openai":
    case "deepseek":
    case "qwen":
    case "openrouter":
    case "mistral":
    case "llama":
    case "groq":
    case "xai":
    case "perplexity":
    case "moonshot":
    case "yi":
    case "baichuan":
    case "minimax":
    case "zhipu":
    case "ollama":
      return callOpenAICompatible(url, apiKey, usedModel, messages, temperature, maxTokens, provider);
    case "claude":
      return callClaude(url, apiKey, usedModel, messages, temperature, maxTokens);
    case "gemini":
      return callGemini(url, apiKey, usedModel, messages, temperature, maxTokens);
    default:
      return callZAI(messages, temperature, maxTokens);
  }
}

// ============================================================
// ZAI (default) — uses z-ai-web-dev-sdk
// ============================================================

async function callZAI(
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number
): Promise<AIChatResult> {
  const ZAI = (await import("z-ai-web-dev-sdk")).default;
  const zai = await ZAI.create();
  const response = await zai.chat.completions.create({
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: false,
  });
  const content = response.choices?.[0]?.message?.content ?? "";
  return {
    content,
    role: "assistant",
    provider: "zai",
    model: "glm-4",
    usage: response.usage
      ? {
          promptTokens: response.usage.prompt_tokens || 0,
          completionTokens: response.usage.completion_tokens || 0,
          totalTokens: response.usage.total_tokens || 0,
        }
      : undefined,
  };
}

// ============================================================
// OpenAI-compatible API (OpenAI, DeepSeek, Qwen, OpenRouter)
// ============================================================

async function callOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number,
  provider: string
): Promise<AIChatResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (provider === "openrouter") {
    headers["HTTP-Referer"] = "https://aijobcopilot.com";
    headers["X-Title"] = "AI Job Copilot";
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${provider} API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  return {
    content,
    role: "assistant",
    provider,
    model,
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens || 0,
          completionTokens: data.usage.completion_tokens || 0,
          totalTokens: data.usage.total_tokens || 0,
        }
      : undefined,
  };
}

// ============================================================
// Anthropic Claude API
// ============================================================

async function callClaude(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number
): Promise<AIChatResult> {
  // Extract system message
  const systemMsg = messages.find((m) => m.role === "system")?.content || "";
  const chatMessages = messages.filter((m) => m.role !== "system");

  const res = await fetch(`${baseUrl}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemMsg,
      messages: chatMessages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data.content?.[0]?.text ?? "";
  return {
    content,
    role: "assistant",
    provider: "claude",
    model,
    usage: data.usage
      ? {
          promptTokens: data.usage.input_tokens || 0,
          completionTokens: data.usage.output_tokens || 0,
          totalTokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0),
        }
      : undefined,
  };
}

// ============================================================
// Google Gemini API
// ============================================================

async function callGemini(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number
): Promise<AIChatResult> {
  const systemMsg = messages.find((m) => m.role === "system")?.content || "";
  const chatMessages = messages.filter((m) => m.role !== "system");

  const contents = chatMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(`${baseUrl}/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemMsg }] },
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return {
    content,
    role: "assistant",
    provider: "gemini",
    model,
    usage: data.usageMetadata
      ? {
          promptTokens: data.usageMetadata.promptTokenCount || 0,
          completionTokens: data.usageMetadata.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata.totalTokenCount || 0,
        }
      : undefined,
  };
}
