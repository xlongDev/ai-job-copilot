import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDemoUserId } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/chat-sessions — list all chat sessions
export async function GET() {
  try {
    const userId = await getDemoUserId();
    const sessions = await db.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    const result = sessions.map((s) => ({
      id: s.id,
      title: s.title,
      messageCount: s.messages ? JSON.parse(s.messages).length : 0,
      provider: s.provider,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return NextResponse.json({ sessions: result });
  } catch (error) {
    console.error("GET /api/chat-sessions error:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

// POST /api/chat-sessions — create or update a chat session
export async function POST(req: NextRequest) {
  try {
    const userId = await getDemoUserId();
    const body = await req.json();
    const { id, title, messages, provider } = body;

    if (id) {
      // Update existing session
      const session = await db.chatSession.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(messages !== undefined && { messages: JSON.stringify(messages) }),
          ...(provider !== undefined && { provider }),
        },
      });
      return NextResponse.json({ session });
    }

    // Create new session
    const session = await db.chatSession.create({
      data: {
        userId,
        title: title || "新对话",
        messages: JSON.stringify(messages || []),
        provider: provider || "zai",
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("POST /api/chat-sessions error:", error);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}

// DELETE /api/chat-sessions — delete a session
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    await db.chatSession.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/chat-sessions error:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
