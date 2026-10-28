import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { parseBody } from "@/lib/validate";
import { z } from "zod";


const agentRunCreateSchema = z.object({
  target: z.string().min(1).max(500),
  steps: z.array(z.unknown()).optional(),
  status: z.enum(["pending","running","done","error"]).optional(),
  result: z.string().max(200_000).optional(),
});

export const runtime = "nodejs";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const runs = await db.agentRun.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json({ runs });
  } catch (error) {
    console.error("GET /api/agent-runs error:", error);
    return NextResponse.json({ error: "Failed to fetch agent runs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const parsed = await parseBody(req, agentRunCreateSchema);
    if (!parsed.ok) return parsed.response;
    const {target, steps, status, result} = parsed.data;

    const run = await db.agentRun.create({
      data: {
        userId,
        target: target || "",
        steps: JSON.stringify(steps || []),
        status: status || "pending",
        result: result ? JSON.stringify(result) : null,
      },
    });

    return NextResponse.json({ run }, { status: 201 });
  } catch (error) {
    console.error("POST /api/agent-runs error:", error);
    return NextResponse.json({ error: "Failed to create agent run" }, { status: 500 });
  }
}
