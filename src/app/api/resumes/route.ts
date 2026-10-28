import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { parseBody } from "@/lib/validate";
import { z } from "zod";

const resumeCreateSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(200_000),
  format: z.enum(["markdown","json","text"]).optional(),
});

export const runtime = "nodejs";

// GET /api/resumes — list all resumes for user
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const resumes = await db.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ resumes });
  } catch (error) {
    console.error("GET /api/resumes error:", error);
    return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 });
  }
}

// POST /api/resumes — create a new resume
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const parsed = await parseBody(req, resumeCreateSchema);
    if (!parsed.ok) return parsed.response;
    const {title, content, format} = parsed.data;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const resume = await db.resume.create({
      data: {
        userId,
        title,
        content,
        format,
        atsScore: 0,
        version: 1,
      },
    });

    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    console.error("POST /api/resumes error:", error);
    return NextResponse.json({ error: "Failed to create resume" }, { status: 500 });
  }
}
