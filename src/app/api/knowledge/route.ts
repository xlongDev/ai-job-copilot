import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { parseBody } from "@/lib/validate";
import { z } from "zod";

const knowledgeDocSchema = z.object({
  name: z.string().min(1).max(300),
  type: z.enum(["resume","project","offer","note","certificate"]).optional(),
  content: z.string().max(500_000),
  chunks: z.number().int().min(0).optional(),
  size: z.number().int().min(0).optional(),
});

export const runtime = "nodejs";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const docs = await db.knowledgeDoc.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ docs });
  } catch (error) {
    console.error("GET /api/knowledge error:", error);
    return NextResponse.json({ error: "Failed to fetch knowledge docs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const parsed = await parseBody(req, knowledgeDocSchema);
    if (!parsed.ok) return parsed.response;
    const {name, type, content, chunks, size} = parsed.data;

    if (!name || !content) {
      return NextResponse.json({ error: "Name and content are required" }, { status: 400 });
    }

    const doc = await db.knowledgeDoc.create({
      data: {
        userId,
        name,
        type: type || "note",
        content,
        chunks: chunks || Math.ceil(content.length / 500),
        size: size || content.length,
      },
    });

    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    console.error("POST /api/knowledge error:", error);
    return NextResponse.json({ error: "Failed to create knowledge doc" }, { status: 500 });
  }
}
