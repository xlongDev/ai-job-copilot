import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDemoUserId } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/resumes — list all resumes for user
export async function GET() {
  try {
    const userId = await getDemoUserId();
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
    const userId = await getDemoUserId();
    const body = await req.json();
    const { title, content, format = "markdown" } = body;

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
