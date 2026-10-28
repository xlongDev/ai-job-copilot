import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-provider";
import { parseBody } from "@/lib/validate";
import { z } from "zod";


const testProviderSchema = z.object({
  provider: z.string().min(1).max(40),
  apiKey: z.string().max(500).optional(),
  model: z.string().max(200).optional(),
  baseUrl: z.string().max(500).optional(),
});

export const runtime = "nodejs";
export const maxDuration = 30;

// POST /api/test-provider — test AI provider connection
export async function POST(req: NextRequest) {
  try {
    const parsed = await parseBody(req, testProviderSchema);
    if (!parsed.ok) return parsed.response;
    const {provider, apiKey, model, baseUrl} = parsed.data;

    if (!provider) {
      return NextResponse.json({ error: "Provider is required" }, { status: 400 });
    }

    const startTime = Date.now();

    const result = await callAI({
      messages: [
        { role: "system", content: "You are a test assistant. Reply with exactly: OK" },
        { role: "user", content: "Test connection. Reply OK." },
      ],
      provider,
      apiKey,
      model,
      baseUrl,
      temperature: 0,
      maxTokens: 10,
    });

    const latency = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      provider: result.provider,
      model: result.model,
      latency: `${latency}ms`,
      response: result.content,
    });
  } catch (error) {
    console.error("Test provider API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 200 });
  }
}
