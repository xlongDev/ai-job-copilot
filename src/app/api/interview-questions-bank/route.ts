import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// GET /api/interview-questions-bank?type=tech&category=react&limit=10
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;

    const questions = await db.interviewQuestion.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "asc" },
    });

    // Get counts by type for stats
    const allQuestions = await db.interviewQuestion.findMany();
    const stats = {
      total: allQuestions.length,
      byType: {
        hr: allQuestions.filter((q) => q.type === "hr").length,
        tech: allQuestions.filter((q) => q.type === "tech").length,
        project: allQuestions.filter((q) => q.type === "project").length,
        algo: allQuestions.filter((q) => q.type === "algo").length,
        behavior: allQuestions.filter((q) => q.type === "behavior").length,
        system: allQuestions.filter((q) => q.type === "system").length,
      },
    };

    return NextResponse.json({ questions, stats });
  } catch (error) {
    console.error("GET /api/interview-questions-bank error:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}
