import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

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
    const body = await req.json();
    const { name, type, content, chunks, size } = body;

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
