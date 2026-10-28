import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { parseBody } from "@/lib/validate";
import { z } from "zod";

const learningTaskSchema = z.object({
  title: z.string().min(1).max(300),
  category: z.enum(["frontend","backend","system","algo","ai"]).optional(),
  duration: z.number().int().min(1).max(1440).optional(),
  status: z.enum(["pending","in-progress","done"]).optional(),
});

export const runtime = "nodejs";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
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
    const userId = await getCurrentUserId();
    const parsed = await parseBody(req, learningTaskSchema);
    if (!parsed.ok) return parsed.response;
    const {title, category, duration, status} = parsed.data;

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
