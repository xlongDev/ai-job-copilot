import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDemoUserId } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const userId = await getDemoUserId();
    const tasks = await db.learningTask.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("GET /api/learning error:", error);
    return NextResponse.json({ error: "Failed to fetch learning tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getDemoUserId();
    const body = await req.json();
    const { title, category, duration, status } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const task = await db.learningTask.create({
      data: {
        userId,
        title,
        category: category || "frontend",
        duration: duration || 60,
        status: status || "pending",
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("POST /api/learning error:", error);
    return NextResponse.json({ error: "Failed to create learning task" }, { status: 500 });
  }
}
