import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-provider";

export const runtime = "nodejs";
export const maxDuration = 30;

// POST /api/test-provider — test AI provider connection
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, apiKey, model, baseUrl } = body;

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
